"""Reel diario de "dolor del cliente": de un guion JSON a un reel listo para publicar, sin intervención.

Lo usa la tarea programada de Claude (scripts/reel_diario/TAREA.md). Pasos de "generar":
  1. valida el guion (formato en scripts/reel_diario/FORMATO.md)
  2. voz en off y tiempos por palabra (scripts/explainer.py voz) y música con ducking (explainer.py musica)
  3. render de la composición DolorReel de Remotion con las props del guion
  4. compresión a menos de 20 MB (límite de jsDelivr para los reels de prueba)
  5. controles del archivo final (duración, audio, video, peso, que no esté mudo)
  6. lo deja listo para publicar: un commit huérfano con reel.mp4 + reel.json en una rama
     claude/reel-diario-AAAA-MM-DD-<slug>, sin tocar main ni agrandar su historia.
     El GitHub Action "Publicar reel" (scripts/publish_reel.py) lo publica y borra la rama.
Si cualquier paso falla, sale con error y no sube nada: ese día no se publica nada roto.

Uso:
  python scripts/reel_diario.py validar <guion.json>
  python scripts/reel_diario.py generar <guion.json>             todo, incluido el push de la rama
  python scripts/reel_diario.py generar <guion.json> --no-push   todo menos el push (prueba local)
  python scripts/reel_diario.py pendientes                       reels generados que todavía no se publicaron
  python scripts/reel_diario.py usados                           temas ya publicados o pendientes (para no repetir)
"""
import argparse, importlib.util, json, os, re, shutil, subprocess, sys, tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "work" / "reel_diario"
OUT = ROOT / "out" / "reel_diario"
MUSICA = ROOT / "scripts" / "reel_diario" / "musica.json"
PUBLICADOS = ROOT / "publicar" / "publicados.json"
PREFIJO = "claude/reel-diario-"
AUDIO_ID = "dolor"  # remotion/public/dolor_voz.wav y dolor_musica.wav
MAX_MB = 18.5  # margen bajo los 20 MB de jsDelivr
AR = timezone(timedelta(hours=-3))

TIPOS = {  # campos obligatorios de cada visual
    "gancho": ["icono"], "persona": [], "caos": ["items"], "contador": ["hasta"], "lista": ["items"], "frase": ["texto"],
    "antesDespues": ["antes", "despues"], "notificaciones": ["items"], "solucion": ["items"], "cta": [],
    "asistencia": ["patron"],
}
MAX_ITEMS = {"persona": 7, "caos": 6, "lista": 5, "notificaciones": 6, "solucion": 5}


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd), flush=True)
    return subprocess.run([str(c) for c in cmd], check=True, cwd=kw.pop("cwd", ROOT), **kw)


def out(cmd):
    return subprocess.run([str(c) for c in cmd], check=True, cwd=ROOT, capture_output=True, text=True, encoding="utf-8").stdout.strip()


def iconos():
    src = (ROOT / "remotion" / "src" / "DolorReel.tsx").read_text(encoding="utf-8")
    bloque = src[src.index("const ICONOS"): src.index("export const ICONOS_DISPONIBLES")]
    return set(re.findall(r"^\s+(\w+): <", bloque, re.M))


# ---------------- Validación ----------------
def validar(g):
    err = []
    for campo in ("slug", "tema", "rubro", "linea", "titulo", "caption", "escenas"):
        if not g.get(campo):
            err.append(f"falta '{campo}'")
    if g.get("linea") and g["linea"] not in ("conocido", "nuevo"):
        err.append("linea: 'conocido' o 'nuevo'")
    if g.get("slug") and not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", g["slug"]):
        err.append("slug: sólo minúsculas, números y guiones")
    if len(g.get("titulo", "")) > 32:
        err.append("titulo: máximo 32 caracteres (es el chip de arriba)")
    if len(g.get("caption", "")) > 2000:
        err.append("caption: máximo 2000 caracteres")
    esc = g.get("escenas", [])
    if not 6 <= len(esc) <= 9:
        err.append("escenas: entre 6 y 9")
    ids = [e.get("id") for e in esc]
    if len(set(ids)) != len(ids):
        err.append("escenas: los id se repiten")
    ok_iconos = iconos()
    palabras_total = 0
    for i, e in enumerate(esc):
        donde = f"escena {i + 1} ({e.get('id')})"
        if not re.fullmatch(r"[a-z][a-zA-Z0-9]*", e.get("id", "")):
            err.append(f"{donde}: id inválido")
        txt = e.get("texto", "")
        palabras_total += len(txt.split())
        if not 3 <= len(txt.split()) <= 40:
            err.append(f"{donde}: el texto tiene que tener entre 3 y 40 palabras")
        v = e.get("visual") or {}
        tipo = v.get("tipo")
        if tipo not in TIPOS:
            err.append(f"{donde}: visual.tipo '{tipo}' no existe ({', '.join(TIPOS)})")
            continue
        for campo in TIPOS[tipo]:
            if v.get(campo) in (None, "", []):
                err.append(f"{donde}: el visual '{tipo}' necesita '{campo}'")
        items = v.get("items") or []
        if tipo in MAX_ITEMS and len(items) > MAX_ITEMS[tipo]:
            err.append(f"{donde}: máximo {MAX_ITEMS[tipo]} items en '{tipo}'")
        todos = items + (v.get("antes") or {}).get("items", []) + (v.get("despues") or {}).get("items", [])
        for n in [v.get("icono"), v.get("final")] + [it.get("icono") for it in todos]:
            if n and n != "cruz" and n not in ok_iconos:
                err.append(f"{donde}: el ícono '{n}' no existe ({', '.join(sorted(ok_iconos))})")
        for it in todos:
            if len(it.get("texto", "")) > (34 if tipo == "notificaciones" else 24):
                err.append(f"{donde}: texto de item demasiado largo: '{it.get('texto')}'")
        if tipo in ("antesDespues",):
            for lado in ("antes", "despues"):
                if len((v.get(lado) or {}).get("items", [])) > 3:
                    err.append(f"{donde}: máximo 3 items en '{lado}'")
        if tipo == "asistencia":
            dias = v.get("dias") or ["L", "M", "X", "J", "V", "S"]
            if not 2 <= v.get("semanas", 4) <= 5 or not all(isinstance(d, int) and 0 <= d < len(dias) for d in v.get("patron", [])):
                err.append(f"{donde}: asistencia necesita 'semanas' entre 2 y 5 y 'patron' con índices de 'dias'")
            if len(v.get("alerta", "") or "") > 22:
                err.append(f"{donde}: la alerta tiene que tener 22 caracteres o menos")
        if tipo == "frase" and len(v.get("texto", "")) > 70:
            err.append(f"{donde}: la frase tiene que tener 70 caracteres o menos")
        if len(v.get("etiqueta", "") or "") > 30:
            err.append(f"{donde}: etiqueta de 30 caracteres o menos")
    if esc and (esc[-1].get("visual") or {}).get("tipo") != "cta":
        err.append("la última escena tiene que ser 'cta'")
    if not 70 <= palabras_total <= 110:
        err.append(f"el guion tiene {palabras_total} palabras: entre 70 y 110 (reel de ≈ 30-40 s)")
    return err


def cargar(path):
    g = json.loads(Path(path).read_text(encoding="utf-8"))
    err = validar(g)
    if err:
        sys.exit("Guion inválido:\n  - " + "\n  - ".join(err))
    return g


# ---------------- Generación ----------------
def python_tts():
    """Intérprete con edge-tts: el actual si lo tiene, si no uv, si no lo instala con pip."""
    if importlib.util.find_spec("edge_tts"):
        return [sys.executable]
    if shutil.which("uv"):
        return ["uv", "run", "--python", "3.11", "--with", "edge-tts", "python"]
    run([sys.executable, "-m", "pip", "install", "--quiet", "edge-tts"])
    return [sys.executable]


# Voz alternada día por medio (las dos rioplatenses); el guion puede fijar "voz" y "rate"
VOCES = [("es-AR-ElenaNeural", "+18%"), ("es-AR-TomasNeural", "+12%")]


def elegir_voz(g):
    voz, rate = VOCES[datetime.now(AR).timetuple().tm_yday % 2]
    return g.get("voz", voz), g.get("rate", rate if "voz" not in g else "+15%")


def elegir_musica(g):
    pool = json.loads(MUSICA.read_text(encoding="utf-8"))
    if isinstance(g.get("musica"), dict):
        return g["musica"]
    i = g["musica"] if isinstance(g.get("musica"), int) else datetime.now(AR).timetuple().tm_yday
    return pool[i % len(pool)]


def preparar_remotion():
    if not (ROOT / "remotion" / "node_modules" / "remotion").exists():
        run(["npm", "ci", "--no-audit", "--no-fund"], cwd=ROOT / "remotion")


def bash():
    # En Windows, el bash de Git (no el de WSL)
    git_bash = Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Git" / "bin" / "bash.exe"
    return str(git_bash) if os.name == "nt" and git_bash.exists() else "bash"


def ffprobe(path):
    return json.loads(out(["ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,width,height",
                           "-of", "json", path]))


def comprimir(master, final, dur):
    """x264 en dos pasadas apuntando a ~15 MB (tope 8 Mb/s, que en animación plana sobra)."""
    audio_k = 192
    video_k = min(8000, int((15 * 8 * 1024) / dur) - audio_k)
    pas = tempfile.mkdtemp()
    log = os.path.join(pas, "x264")
    comun = ["-c:v", "libx264", "-preset", "slow", "-b:v", f"{video_k}k", "-maxrate", f"{int(video_k * 1.6)}k",
             "-bufsize", f"{video_k * 2}k", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
             "-color_trc", "bt709", "-passlogfile", log]
    run(["ffmpeg", "-v", "error", "-y", "-i", master, *comun, "-pass", "1", "-an", "-f", "mp4", os.devnull])
    run(["ffmpeg", "-v", "error", "-y", "-i", master, *comun, "-pass", "2", "-c:a", "aac", "-b:a", f"{audio_k}k",
         "-ar", "48000", "-movflags", "+faststart", final])


def controlar(final):
    info = ffprobe(final)
    dur, mb = float(info["format"]["duration"]), int(info["format"]["size"]) / 1024 / 1024
    tipos = [s["codec_type"] for s in info["streams"]]
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    err = []
    if not 27 <= dur <= 46:
        err.append(f"duración {dur:.1f} s fuera de 27-46 s (acortá o alargá el guion)")
    if mb >= MAX_MB:
        err.append(f"pesa {mb:.1f} MB (máximo {MAX_MB})")
    if "audio" not in tipos:
        err.append("no tiene audio")
    if (v["width"], v["height"]) != (1080, 1920):
        err.append(f"resolución {v['width']}x{v['height']} (tiene que ser 1080x1920)")
    vol = subprocess.run(["ffmpeg", "-hide_banner", "-i", final, "-af", "volumedetect", "-vn", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = re.search(r"mean_volume: (-?[\d.]+) dB", vol)
    if not m or float(m.group(1)) < -40:
        err.append(f"el audio está casi mudo ({m.group(1) if m else '?'} dB)")
    if err:
        sys.exit("El reel no pasó los controles:\n  - " + "\n  - ".join(err))
    print(f"Controles OK: {dur:.1f} s, {mb:.1f} MB, 1080x1920, audio {m.group(1)} dB")
    return dur, mb


def subir(g, final):
    """Commit huérfano (sin padre) con reel.mp4 y reel.json en una rama nueva; no toca el árbol de trabajo."""
    fecha = datetime.now(AR).strftime("%Y-%m-%d")
    rama = f"{PREFIJO}{fecha}-{g['slug']}"
    manifest = {**g, "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"), "video": "reel.mp4"}
    tmp = WORK / "reel.json"
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    blob_v = out(["git", "hash-object", "-w", final])
    blob_j = out(["git", "hash-object", "-w", tmp])
    # En bytes: en modo texto Windows convierte \n en \r\n y los nombres quedan "reel.json\r"
    tree = subprocess.run(["git", "mktree"], cwd=ROOT, check=True, capture_output=True,
                          input=f"100644 blob {blob_j}\treel.json\n100644 blob {blob_v}\treel.mp4\n".encode()).stdout.decode().strip()
    sha = out(["git", "commit-tree", tree, "-m", f"Reel diario: {g['titulo']}"])
    run(["git", "push", "origin", f"{sha}:refs/heads/{rama}"])
    print(f"Listo para publicar: rama {rama} ({sha[:7]})")
    return rama, sha


def generar(path, push=True):
    g = cargar(path)
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    guion = WORK / "guion_voz.json"
    guion.write_text(json.dumps({
        "id": AUDIO_ID, "titulo": g["titulo"], "voz": elegir_voz(g)[0], "rate": elegir_voz(g)[1],
        "pausa": 0.16, "escenas": [[e["id"], e["texto"]] for e in g["escenas"]], "musica": elegir_musica(g),
    }, ensure_ascii=False, indent=1), encoding="utf-8")

    run([*python_tts(), "scripts/explainer.py", "voz", guion])
    run([sys.executable, "scripts/explainer.py", "musica", guion])

    voz = json.loads((ROOT / "remotion" / "src" / f"{AUDIO_ID}Voz.json").read_text(encoding="utf-8"))
    props = WORK / "props.json"
    props.write_text(json.dumps({"titulo": g["titulo"], "audio": AUDIO_ID, "voz": voz,
                                 "escenas": [{"id": e["id"], "visual": e["visual"]} for e in g["escenas"]]},
                                ensure_ascii=False), encoding="utf-8")

    preparar_remotion()
    master = WORK / "master.mp4"
    run([bash(), "scripts/render.sh", "DolorReel", master, f"--props={props}"])

    final = OUT / f"{g['slug']}.mp4"
    comprimir(master, final, float(ffprobe(master)["format"]["duration"]))
    controlar(final)
    if push:
        subir(g, final)
    else:
        print(f"Generado sin subir: {final.relative_to(ROOT)}")


# ---------------- Consultas ----------------
def pendientes():
    refs = out(["git", "ls-remote", "--heads", "origin", f"refs/heads/{PREFIJO}*"])
    return sorted((l.split("\t")[1].removeprefix("refs/heads/"), l.split("\t")[0]) for l in refs.splitlines() if l.strip())


def usados():
    """Reels diarios publicados y pendientes, del más viejo al más nuevo: fecha · línea · rubro · tema."""
    fila = lambda fecha, m: f"{fecha} · {m.get('linea', '?')} · {m.get('rubro', '?')} · {m.get('tema', '?')}"
    filas = [fila(p["fecha"][:10], p) for p in json.loads(PUBLICADOS.read_text(encoding="utf-8")) if p.get("tema")]
    for rama, sha in pendientes():
        subprocess.run(["git", "fetch", "--quiet", "--depth=1", "origin", f"refs/heads/{rama}"], cwd=ROOT, check=True)
        filas.append(fila("pendiente", json.loads(out(["git", "show", f"{sha}:reel.json"]))))
    return filas


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("accion", choices=["validar", "generar", "pendientes", "usados"])
    ap.add_argument("guion", nargs="?")
    ap.add_argument("--no-push", action="store_true")
    a = ap.parse_args()
    if a.accion in ("validar", "generar") and not a.guion:
        sys.exit("Falta la ruta del guion")
    if a.accion == "validar":
        cargar(a.guion)
        print("Guion OK")
    elif a.accion == "generar":
        generar(a.guion, push=not a.no_push)
    elif a.accion == "pendientes":
        p = pendientes()
        print(f"{len(p)} pendiente(s)")
        for rama, sha in p:
            print(f"  {rama}  {sha[:7]}")
    else:
        print("\n".join(usados()) or "(ninguno)")


if __name__ == "__main__":
    main()
