"""Publica en Instagram el próximo reel de la cola (publicar/cola.json) usando la API oficial.

Usa la API de Instagram con inicio de sesión unificado (graph.facebook.com). Después de publicar, mueve
la entrada a publicar/publicados.json. El video se manda de dos formas:
  - reel normal: subida reanudable directo desde el disco.
  - reel de prueba: por video_url (jsDelivr, fijado al commit), porque la subida reanudable ignora
    trial_params sin avisar y lo publica como reel normal. El video tiene que estar commiteado y
    pusheado, y pesar menos de 20 MB (límite de jsDelivr).

Variables de entorno:
  IG_ACCESS_TOKEN   token del usuario del sistema "KEI Reels" (portfolio KEI Software; no vence)
  IG_USER_ID        identificador de la cuenta profesional de Instagram (@keisoftware)
  En la PC se pueden poner en un archivo .env en la raíz del repo (está en .gitignore).

Uso:
  python scripts/publish_reel.py               publica si ya pasaron "cada_dias" desde el último
  python scripts/publish_reel.py --force       publica ya, sin mirar la fecha del último
  python scripts/publish_reel.py --dry-run     muestra qué publicaría, sin llamar a la API
  python scripts/publish_reel.py --check       valida el token y muestra la cuenta y el límite de publicaciones

Formato de cada entrada de la cola:
  {"video": "entregables/x.mp4", "caption": "texto #hashtags", "prueba": "manual" | "auto" | null,
   "ia": false}
  prueba: "manual" = reel de prueba (sólo no seguidores), lo pasás a seguidores desde la app
          "auto"   = reel de prueba que Instagram pasa a seguidores si rinde bien
          null     = reel normal
  Si una entrada no define "prueba", se usa la de "por_defecto".

Reels diarios (scripts/reel_diario.py): cada uno llega como una rama claude/reel-diario-AAAA-MM-DD-<slug> con un
commit huérfano (reel.mp4 + reel.json). Si la cola manual está vacía, se publica el más viejo, como reel de
prueba por jsDelivr fijado a ese commit, y después se borra la rama para que el repo no crezca.
Se publica como máximo un reel por día entre los dos orígenes.
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

VERSION = "v26.0"
API = f"https://graph.facebook.com/{VERSION}"
ROOT = Path(__file__).resolve().parent.parent
COLA = ROOT / "publicar" / "cola.json"
PUBLICADOS = ROOT / "publicar" / "publicados.json"
PRUEBA = {"manual": "MANUAL", "auto": "SS_PERFORMANCE"}
REPO = "MaximoFini/kei-software-studio"
PREFIJO_DIARIO = "claude/reel-diario-"


def api(method, path, token, **params):
    url = path if path.startswith("http") else f"{API}/{path}"
    data = None
    if method == "GET":
        url += "?" + urllib.parse.urlencode(params)
    else:
        data = urllib.parse.urlencode({k: json.dumps(v) if isinstance(v, dict) else v for k, v in params.items()}).encode()
    req = urllib.request.Request(url, data=data, method=method, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Error de la API ({e.code}) en {path}: {e.read().decode(errors='replace')}")


def load_env():
    """Para correr en la PC: toma las variables de un .env en la raíz (no se commitea)."""
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8-sig").splitlines():
            k, sep, v = line.partition("=")
            if sep and not k.strip().startswith("#"):
                os.environ.setdefault(k.strip(), v.strip())


def load(p, default):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


def save(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True, encoding="utf-8").strip()


def public_url(video, sha=None):
    """URL de jsDelivr fijada a un commit que ya está en GitHub y contiene el video (sirve video/mp4).
    Con sha (reel diario) el video sólo está en ese commit de su rama, no en el disco."""
    if sha:
        url = f"https://cdn.jsdelivr.net/gh/{REPO}@{sha}/{urllib.parse.quote(video)}"
        with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=120) as r:
            tipo, peso = r.headers.get("Content-Type", ""), int(r.headers.get("Content-Length") or 0)
        if not tipo.startswith("video/"):
            sys.exit(f"jsDelivr no sirve {video} como video ({tipo})")
        if peso >= 20 * 1024 * 1024:
            sys.exit(f"{video} pesa 20 MB o más: jsDelivr no lo sirve")
        return url
    if (ROOT / video).stat().st_size >= 20 * 1024 * 1024:
        sys.exit(f"{video} pesa 20 MB o más: jsDelivr no lo sirve. Bajale el bitrate para publicarlo como prueba")
    if not git("ls-files", video):
        sys.exit(f"{video} no está commiteado: para publicarlo como reel de prueba commitealo y pusheá")
    sha = os.environ.get("GITHUB_SHA") or git("rev-parse", "HEAD")
    if not os.environ.get("GITHUB_ACTIONS") and not git("branch", "-r", "--contains", sha):
        sys.exit("El commit actual no está pusheado a GitHub: hacé git push antes de publicar el reel de prueba")
    url = f"https://cdn.jsdelivr.net/gh/{REPO}@{sha}/{urllib.parse.quote(video)}"
    with urllib.request.urlopen(urllib.request.Request(url, method="HEAD"), timeout=120) as r:
        if not r.headers.get("Content-Type", "").startswith("video/"):
            sys.exit(f"jsDelivr no sirve {video} como video ({r.headers.get('Content-Type')})")
    return url


def upload(container, video, token):
    """Sube el archivo al contenedor (subida reanudable desde el disco)."""
    data = (ROOT / video).read_bytes()
    req = urllib.request.Request(f"https://rupload.facebook.com/ig-api-upload/{VERSION}/{container}", data=data, method="POST",
                                 headers={"Authorization": f"OAuth {token}", "offset": "0", "file_size": str(len(data))})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Error subiendo el video ({e.code}): {e.read().decode(errors='replace')}")
    if not res.get("success"):
        sys.exit(f"Error subiendo el video: {res}")


def publish(entry, defaults, token, ig_id, sha=None):
    if not sha and not (ROOT / entry["video"]).exists():
        sys.exit(f"No existe {entry['video']}")
    prueba = entry.get("prueba", defaults.get("prueba"))
    if sha and not prueba:
        prueba = "manual"  # el reel diario sólo existe en su rama: se publica por video_url
    params = {"media_type": "REELS", "caption": entry.get("caption", "")}
    if prueba:  # trial_params sólo funciona con video_url (la subida reanudable lo ignora)
        params["video_url"] = public_url(entry["video"], sha)
        params["trial_params"] = {"graduation_strategy": PRUEBA[prueba]}
    else:
        params["upload_type"] = "resumable"
    if entry.get("ia", defaults.get("ia")):
        params["is_ai_generated"] = "true"

    print(f"Video: {entry['video']}\nModo: {'reel de prueba (' + prueba + ')' if prueba else 'reel normal'}")
    container = api("POST", f"{ig_id}/media", token, **params)["id"]
    if not prueba:
        upload(container, entry["video"], token)
    print(f"Contenedor {container}: esperando que Instagram procese el video...")
    for _ in range(40):  # hasta ~10 min
        time.sleep(15)
        status = api("GET", container, token, fields="status_code,status")
        if status["status_code"] == "FINISHED":
            break
        if status["status_code"] in ("ERROR", "EXPIRED"):
            sys.exit(f"Instagram rechazó el video: {status}")
    else:
        sys.exit("Instagram tardó demasiado en procesar el video (sigue IN_PROGRESS)")

    media = api("POST", f"{ig_id}/media_publish", token, creation_id=container)["id"]
    link = api("GET", media, token, fields="permalink").get("permalink")
    print(f"Publicado: {link}")
    return media, link


def diarios():
    """Ramas de reels diarios listos para publicar, del más viejo al más nuevo: [(rama, sha)]."""
    refs = git("ls-remote", "--heads", "origin", f"refs/heads/{PREFIJO_DIARIO}*")
    return sorted((l.split("\t")[1].removeprefix("refs/heads/"), l.split("\t")[0]) for l in refs.splitlines() if l.strip())


def manifest_diario(rama, sha):
    git("fetch", "--quiet", "--depth=1", "origin", f"refs/heads/{rama}")
    return json.loads(git("show", f"{sha}:reel.json"))


def publicar_diario(cola, publicados, token, ig_id, dry):
    rama, sha = diarios()[0]
    m = manifest_diario(rama, sha)
    entry = {"video": m.get("video", "reel.mp4"), "caption": m["caption"], "prueba": m.get("prueba"), "ia": m.get("ia")}
    entry = {k: v for k, v in entry.items() if v is not None}
    if dry:
        print(f"Publicaría el reel diario {rama} ({sha[:7]})\nCaption: {entry['caption']}")
        return
    media, link = publish(entry, cola.get("por_defecto", {}), token, ig_id, sha=sha)
    publicados.append({"video": f"{rama}:{entry['video']}", "caption": entry["caption"], "tema": m.get("tema"), "tema_id": m.get("tema_id"), "rubro": m.get("rubro"), "linea": m.get("linea"), "slug": m.get("slug"),
                       "titulo": m.get("titulo"), "commit": sha, "prueba": entry.get("prueba", cola.get("por_defecto", {}).get("prueba")),
                       "fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"), "media_id": media, "link": link})
    save(PUBLICADOS, publicados)
    import reel_diario  # mismo directorio (scripts/)
    reel_diario.registro()  # publicar/registro-reels-diarios.md: qué se publicó y qué temas faltan
    try:  # la rama ya no hace falta: Instagram bajó el video y jsDelivr lo tiene cacheado por commit
        git("push", "--quiet", "origin", "--delete", rama)
    except subprocess.CalledProcessError:
        print(f"Aviso: no se pudo borrar la rama {rama}")
    print(f"Quedan {len(diarios())} reels diarios pendientes")


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # la consola de Windows no imprime emojis de los captions
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    load_env()
    token, ig_id = os.environ.get("IG_ACCESS_TOKEN"), os.environ.get("IG_USER_ID")
    if not (token and ig_id) and not a.dry_run:
        sys.exit("Faltan las variables de entorno IG_ACCESS_TOKEN y/o IG_USER_ID")

    if a.check:
        cuenta = api("GET", ig_id, token, fields="username,name,media_count")
        limit = api("GET", f"{ig_id}/content_publishing_limit", token, fields="quota_usage,config")
        print(json.dumps({"cuenta": cuenta, "limite": limit}, ensure_ascii=False, indent=2))
        return

    cola, publicados = load(COLA, {}), load(PUBLICADOS, [])
    pendientes = cola.get("cola", [])
    hay_diarios = not pendientes and bool(diarios())
    if not pendientes and not hay_diarios:
        print("La cola está vacía y no hay reels diarios pendientes: no hay nada para publicar")
        return

    cada = cola.get("cada_dias", 3)
    if publicados and not a.force:
        ultimo = datetime.fromisoformat(publicados[-1]["fecha"])
        dias = (datetime.now(timezone.utc) - ultimo).total_seconds() / 86400
        if dias < cada - 0.1:  # margen para que el cron diario no se corra de hora
            print(f"Último reel hace {dias:.1f} días; toca cada {cada}. Nada que hacer hoy")
            return

    if hay_diarios:
        publicar_diario(cola, publicados, token, ig_id, a.dry_run)
        return

    entry = pendientes[0]
    if a.dry_run:
        print(f"Publicaría {entry['video']}\nCaption: {entry.get('caption', '')}")
        return

    media, link = publish(entry, cola.get("por_defecto", {}), token, ig_id)
    publicados.append({**entry, "fecha": datetime.now(timezone.utc).isoformat(timespec="seconds"), "media_id": media, "link": link})
    cola["cola"] = pendientes[1:]
    save(COLA, cola); save(PUBLICADOS, publicados)
    print(f"Quedan {len(cola['cola'])} reels en la cola")


if __name__ == "__main__":
    main()
