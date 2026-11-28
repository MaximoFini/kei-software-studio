"""Ranking de los reels publicados según sus insights (API Graph de Instagram, SOLO LECTURA: únicamente GET).

Lee publicar/publicados.json (sólo para saber qué media_id/fecha/tema/prueba tiene cada reel; no lo modifica),
pide a la API los métricos de cada reel y escribe publicar/metricas.json y publicar/metricas.md.
Nunca imprime ni guarda el token (IG_ACCESS_TOKEN de .env o del entorno).

Métricos pedidos por reel (media insights): views, reach, likes, comments, shares, saved, total_interactions,
ig_reels_avg_watch_time (ms), ig_reels_video_view_total_time (ms). Si la API rechaza alguno, lo saca y reintenta.
Derivados: shares/reach, saves/reach, likes/reach, interacciones/reach y retención = avg_watch_time / duración.
La duración se toma de ffprobe sobre el mp4 si existe en disco; si no, se usa 30 s (formato pizarrón).
Score = 3*shares/reach + 2*saves/reach + likes/reach + comments/reach, mas el tiempo medio visto (ver crecimiento.md).

Uso:  python scripts/insights_reels.py [--limite N]
Permisos: instagram_manage_insights (o instagram_business_manage_insights) + pages_read_engagement. Sin ellos la API
responde (#10) y el script cae al modo reducido (likes y comentarios del media; score = likes + 2 x comentarios).
El token actual (KEI Reels) sólo tiene instagram_basic, instagram_content_publish, pages_read_engagement, pages_show_list.
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

VERSION = "v26.0"
API = f"https://graph.facebook.com/{VERSION}"
ROOT = Path(__file__).resolve().parent.parent
PUBLICADOS = ROOT / "publicar" / "publicados.json"
OUT_JSON, OUT_MD = ROOT / "publicar" / "metricas.json", ROOT / "publicar" / "metricas.md"
METRICAS = ["views", "reach", "likes", "comments", "shares", "saved", "total_interactions",
            "ig_reels_avg_watch_time", "ig_reels_video_view_total_time"]


def load_env():
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8-sig").splitlines():
            k, sep, v = line.partition("=")
            if sep and not k.strip().startswith("#"):
                os.environ.setdefault(k.strip(), v.strip())


def get(path, token, **params):
    """GET con Bearer en el header (el token no aparece en URLs ni en mensajes). Devuelve (json, error)."""
    url = f"{API}/{path}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r), None
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode(errors="replace")).get("error", {})
        except Exception:
            err = {}
        return None, {"code": e.code, "msg": str(err.get("message", ""))[:300], "sub": err.get("error_subcode")}
    except Exception as e:
        return None, {"code": 0, "msg": type(e).__name__}


def insights(media_id, token):
    """Pide los métricos; si la API rechaza uno ('metric[N] must be one of...'/'does not support') lo saca y reintenta."""
    pedir, descartados = list(METRICAS), []
    for _ in range(len(METRICAS) + 1):
        data, err = get(f"{media_id}/insights", token, metric=",".join(pedir))
        if data is not None:
            vals = {m["name"]: (m.get("values") or [{}])[0].get("value") for m in data.get("data", [])}
            return vals, descartados, None
        msg = err["msg"]
        malos = [m for m in pedir if m in msg]
        if not malos and "metric[" in msg:  # 'metric[3] must be one of...': el índice dice cuál sobra
            try:
                i = int(msg.split("metric[")[1].split("]")[0]); malos = [pedir[i]]
            except Exception:
                pass
        if not malos:
            return {}, descartados, err
        for m in malos:
            pedir.remove(m); descartados.append(m)
        if not pedir:
            return {}, descartados, err
    return {}, descartados, err


def duracion(video):
    """Duración en segundos del mp4 si está en disco y hay ffprobe; si no, None."""
    p = ROOT / video.split(":")[-1]
    if not p.exists():
        return None
    try:
        out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], text=True, timeout=30)
        return float(out.strip())
    except Exception:
        return None


def ratio(a, b):
    return round(a / b, 4) if isinstance(a, (int, float)) and isinstance(b, (int, float)) and b else None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=0, help="sólo los últimos N reels (0 = todos)")
    a = ap.parse_args()
    load_env()
    token = os.environ.get("IG_ACCESS_TOKEN")
    if not token:
        sys.exit("Falta IG_ACCESS_TOKEN (en .env o en el entorno)")

    pubs = json.loads(PUBLICADOS.read_text(encoding="utf-8"))
    if a.limite:
        pubs = pubs[-a.limite:]
    filas, errores, descartados = [], {}, set()
    for p in pubs:
        mid = p.get("media_id")
        if not mid:
            continue
        vals, desc, err = insights(mid, token)
        descartados.update(desc)
        if err:
            errores[err["msg"] or str(err["code"])] = errores.get(err["msg"] or str(err["code"]), 0) + 1
        if err and not vals:  # sin permiso de insights: al menos likes/comentarios públicos del media
            basico, _ = get(mid, token, fields="like_count,comments_count")
            vals = {"likes": (basico or {}).get("like_count"), "comments": (basico or {}).get("comments_count")}
        dur = duracion(p["video"]) or 30.0
        reach, avg = vals.get("reach"), vals.get("ig_reels_avg_watch_time")
        f = {"media_id": mid, "fecha": p.get("fecha"), "link": p.get("link"), "tema": p.get("tema") or p.get("titulo") or p.get("video"),
             "linea": p.get("linea"), "rubro": p.get("rubro"), "prueba": p.get("prueba"), **vals,
             "avg_watch_s": round(avg / 1000, 1) if isinstance(avg, (int, float)) else None, "duracion_s": round(dur, 1),
             "retencion": ratio(avg / 1000 if isinstance(avg, (int, float)) else None, dur),
             "shares_x_reach": ratio(vals.get("shares"), reach), "saves_x_reach": ratio(vals.get("saved"), reach),
             "likes_x_reach": ratio(vals.get("likes"), reach), "inter_x_reach": ratio(vals.get("total_interactions"), reach)}
        if not reach and vals.get("likes") is not None:
            f["score"] = (vals.get("likes") or 0) + 2 * (vals.get("comments") or 0)  # modo reducido (sin insights)
        if reach:
            f["score"] = round(100 * (3 * (vals.get("shares") or 0) + 2 * (vals.get("saved") or 0) + (vals.get("likes") or 0)
                                      + (vals.get("comments") or 0)) / reach, 2) + round(f["avg_watch_s"] or 0, 1)
        filas.append(f)
        time.sleep(0.3)

    filas.sort(key=lambda f: (f.get("score") is None, -(f.get("score") or 0)))
    resumen = {"generado": datetime.now(timezone.utc).isoformat(timespec="seconds"), "reels": len(filas),
               "metricas_rechazadas": sorted(descartados), "errores": errores, "ranking": filas}
    OUT_JSON.write_text(json.dumps(resumen, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    def n(x, d=0):
        return "-" if x is None else (f"{x:.{d}f}" if d else f"{x:,.0f}")
    def pc(x):
        return "-" if x is None else f"{100 * x:.1f}%"
    L = ["# Métricas de reels (ranking)", "", f"Generado {resumen['generado']} con `python scripts/insights_reels.py` (sólo lectura). "
         f"Score = 100 x (3 compartidos + 2 guardados + likes + comentarios) / alcance + segundos medios vistos.", ""]
    if descartados:
        L += [f"Métricos que la API rechazó: {', '.join(sorted(descartados))}.", ""]
    if errores:
        L += ["Errores de la API: " + "; ".join(f"{k} (x{v})" for k, v in errores.items()), ""]
    L += ["| # | fecha | tema | modo | alcance | views | seg vistos | retención | likes | coment | compart | guard | comp/alc | guard/alc | score |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for i, f in enumerate(filas, 1):
        t = str(f["tema"])[:48].replace("|", "/")
        L.append(f"| {i} | {str(f['fecha'])[:10]} | [{t}]({f['link']}) | {f['prueba'] or 'normal'} | {n(f.get('reach'))} | {n(f.get('views'))} | "
                 f"{n(f['avg_watch_s'], 1)} | {pc(f['retencion'])} | {n(f.get('likes'))} | {n(f.get('comments'))} | {n(f.get('shares'))} | "
                 f"{n(f.get('saved'))} | {pc(f['shares_x_reach'])} | {pc(f['saves_x_reach'])} | {n(f.get('score'), 1)} |")
    for campo, tit in (("linea", "línea"), ("rubro", "rubro")):
        g = {}
        for f in filas:
            if f.get(campo) and f.get("reach"):
                g.setdefault(f[campo], []).append(f)
        if g:
            L += ["", f"## Promedio por {tit}", "", f"| {tit} | reels | alcance medio | seg vistos medios | score medio |", "|---|---|---|---|---|"]
            for k, v in sorted(g.items(), key=lambda kv: -sum(x.get("score") or 0 for x in kv[1]) / len(kv[1])):
                L.append(f"| {k} | {len(v)} | {n(sum(x['reach'] for x in v) / len(v))} | "
                         f"{n(sum(x['avg_watch_s'] or 0 for x in v) / len(v), 1)} | {n(sum(x.get('score') or 0 for x in v) / len(v), 1)} |")
    OUT_MD.write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"{len(filas)} reels leídos. Escrito {OUT_MD.relative_to(ROOT)} y {OUT_JSON.relative_to(ROOT)}")
    if errores:
        print("Errores:", errores)
    for f in filas[:5]:
        print(f"  {f.get('score')}  reach={f.get('reach')} views={f.get('views')} avg={f['avg_watch_s']}s  {str(f['tema'])[:50]}")


if __name__ == "__main__":
    main()
