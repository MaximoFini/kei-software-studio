# Publicador automático de Reels en Instagram

Guía para armar un sistema que **publica un reel en Instagram cada N días, solo**, usando la API oficial
de Meta y GitHub Actions. Sirve para cualquier empresa con cuenta profesional de Instagram.

Lo armamos en KEI Software en octubre de 2026. Acá está todo lo necesario para replicarlo, incluidos
los errores que cometimos, para que no los repitas.

---

## Cómo funciona

```
 publicar/cola.json  ──►  GitHub Actions (todos los días a las 12:00)
 (lista de reels)              │
                               ▼
                   scripts/publish_reel.py
                   ¿pasaron N días desde el último?
                      │ no → no hace nada
                      │ sí ↓
                   API de Instagram (graph.facebook.com)
                   1. crea el contenedor del reel
                   2. Instagram procesa el video
                   3. lo publica
                      │
                      ▼
                   pasa la entrada a publicar/publicados.json
                   y commitea la cola actualizada
```

- **Reel normal:** el video se sube directo desde el repo (subida reanudable).
- **Reel de prueba** (solo lo ven quienes no te siguen; después decidís desde la app si lo pasás a tus
  seguidores): el video tiene que estar en una **URL pública**. Usamos jsDelivr, que sirve los archivos de
  un repo público de GitHub.
- No hay servidores ni costos: GitHub Actions es gratis para esto.

---

## Qué necesitás

| Cosa | Para qué |
|---|---|
| Cuenta de Instagram **profesional** (Empresa o Creador) | La API solo publica en cuentas profesionales |
| **Página de Facebook** vinculada a esa cuenta de Instagram | La API llega a Instagram a través de la página |
| **Portfolio comercial** (Meta Business) donde estén la página y la cuenta de Instagram | Para crear el usuario del sistema y el token |
| Repo en **GitHub** (público si querés reels de prueba) | Donde viven los videos, la cola y el workflow |
| [GitHub CLI](https://cli.github.com/) (`gh`) con `gh auth login` hecho | Para guardar el token como secret |
| Python 3.10 o superior | El script no usa librerías externas |

> **Ojo con el repo público:** todo lo que subas (videos incluidos) queda visible para cualquiera. Nunca
> subas el token ni el `.env`.

---

## Paso 1 · Crear la app en Meta for Developers

1. Entrá a <https://developers.facebook.com/apps/> → **Crear app**.
2. **Nombre:** cualquiera (por ejemplo "MiEmpresa Reels Publisher").
3. **Caso de uso:** filtrá por *Administración de contenido* → **"Administrar mensajes y contenido en Instagram"**.
4. **Negocio:** elegí el portfolio comercial de tu empresa.
5. **Crear app** (acepta las Condiciones de la plataforma de Meta).

> En apps nuevas, Meta ya **no ofrece** "API de Instagram con inicio de sesión con Instagram": la app usa
> el **inicio de sesión unificado**. Eso significa: host `graph.facebook.com` y un **token de usuario del
> sistema**, que es lo que sigue.

---

## Paso 2 · Crear el usuario del sistema y darle acceso

En <https://business.facebook.com/latest/settings/system_users> (con tu portfolio seleccionado):

1. **Agregar** → nombre (por ejemplo "MiEmpresa Reels") → rol **Empleado** (no hace falta administrador).
   - La primera vez Meta pide aceptar la **política de no discriminación** en publicidad.
2. Con el usuario creado → **Asignar activos**:
   - **Cuentas de Instagram** → tu cuenta → activá solo **Contenido**.
   - **Apps** → tu app → **Desarrollar app**.
   - La **página de Facebook** aparece sola: su acceso de contenido se administra desde el perfil de
     Instagram vinculado.
3. **Asignar activos**.

---

## Paso 3 · Generar el token

En el mismo usuario del sistema → **Generar token**:

1. **App:** la que creaste.
2. **Caducidad:** **Nunca** (es para algo desatendido; si alguna vez hace falta, se revoca desde ahí mismo).
3. **Permisos**, son estos cuatro:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`

   > Si el selector de permisos no se despliega con un clic: hacé clic y apretá **Enter**, y escribí para filtrar.
   > Meta avisa que agrega esos permisos a la app: es normal.

4. **Generar token** → **Copiar**.

> **El token se muestra UNA sola vez.** No cierres la ventana hasta guardarlo (paso 5). Si la cerrás sin
> copiarlo, generá otro.

> **Sin los dos permisos `pages_*` el token "funciona" pero no ve la cuenta de Instagram** (error
> `Object with ID ... does not exist`). Nos pasó: `debug_token` mostraba el token válido pero sin activos.

---

## Paso 4 · Conseguir el ID de la cuenta de Instagram

En <https://business.facebook.com/latest/settings/instagram_account> → elegí la cuenta → el
**Identificador** (un número que empieza con `1784...`). Ese es tu `IG_USER_ID`.

---

## Paso 5 · Guardar el token sin exponerlo

**Nunca pegues el token en un chat, en un issue ni en un commit.** Si se expone, revocalo (botón
*Revocar tokens* del usuario del sistema) y generá uno nuevo.

Con el token copiado en el portapapeles, corré `scripts/guardar_token.ps1` (Windows, PowerShell) desde la
raíz del repo. Lo guarda en `.env` (para correr en tu PC) y en el secret `IG_ACCESS_TOKEN` de GitHub,
sin mostrarlo:

```powershell
.\scripts\guardar_token.ps1 -IgUserId 1784XXXXXXXXXXXX -Repo usuario/repo
```

Si PowerShell bloquea scripts: `powershell -ExecutionPolicy Bypass -File .\scripts\guardar_token.ps1 -IgUserId ... -Repo ...`

> **Error que cometimos:** `gh secret set $(Get-Clipboard)` crea un secret **cuyo nombre es el token**.
> El token tiene que entrar por la entrada estándar (`$token | gh secret set NOMBRE`), como hace el script.

En macOS/Linux el equivalente es:

```bash
pbpaste | gh secret set IG_ACCESS_TOKEN --repo usuario/repo      # macOS (en Linux: xclip -o)
printf 'IG_ACCESS_TOKEN=%s\nIG_USER_ID=1784XXXXXXXXXXXX\n' "$(pbpaste)" > .env
```

Y el ID va como **variable** (no es secreto):

```bash
gh variable set IG_USER_ID --body 1784XXXXXXXXXXXX --repo usuario/repo
```

Agregá `.env` al `.gitignore`.

---

## Paso 6 · Archivos del repo

```
.github/workflows/publicar-reel.yml   el cron diario
scripts/publish_reel.py               el publicador
scripts/guardar_token.ps1             guarda el token (paso 5)
publicar/cola.json                    lo que falta publicar
publicar/publicados.json              historial (arranca en [])
videos/...                            tus reels (mp4)
.env                                  token local (NO se commitea)
```

### `publicar/cola.json`

```json
{
  "cada_dias": 3,
  "por_defecto": { "prueba": "manual", "ia": false },
  "cola": [
    {
      "video": "videos/01-mi-reel.mp4",
      "caption": "Texto del reel 🚀\n\nLlamado a la acción.\n\n#hashtag1 #hashtag2"
    },
    {
      "video": "videos/02-otro-reel.mp4",
      "caption": "Otro texto",
      "prueba": null
    }
  ]
}
```

| Campo | Valores |
|---|---|
| `cada_dias` | Cada cuántos días publica |
| `prueba` | `"manual"`: reel de prueba, lo pasás a seguidores desde la app · `"auto"`: Instagram lo pasa solo si rinde bien · `null`: reel normal |
| `ia` | `true` marca el reel como hecho con IA |

Cada entrada puede pisar lo de `por_defecto`. Se publica siempre la primera de la lista.

### `scripts/publish_reel.py`

```python
"""Publica en Instagram el próximo reel de la cola (publicar/cola.json) usando la API oficial.

Usa la API de Instagram con inicio de sesión unificado (graph.facebook.com). Después de publicar, mueve
la entrada a publicar/publicados.json. El video se manda de dos formas:
  - reel normal: subida reanudable directo desde el disco.
  - reel de prueba: por video_url (jsDelivr, fijado al commit), porque la subida reanudable ignora
    trial_params sin avisar y lo publica como reel normal. El video tiene que estar commiteado y
    pusheado en un repo público, y pesar menos de 20 MB (límite de jsDelivr).

Variables de entorno:
  IG_ACCESS_TOKEN   token del usuario del sistema (no vence)
  IG_USER_ID        identificador de la cuenta profesional de Instagram
  En la PC se pueden poner en un archivo .env en la raíz del repo (que esté en .gitignore).

Uso:
  python scripts/publish_reel.py               publica si ya pasaron "cada_dias" desde el último
  python scripts/publish_reel.py --force       publica ya, sin mirar la fecha del último
  python scripts/publish_reel.py --dry-run     muestra qué publicaría, sin llamar a la API
  python scripts/publish_reel.py --check       valida el token y muestra la cuenta y el límite de publicaciones
"""
import argparse, json, os, re, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

VERSION = "v26.0"
API = f"https://graph.facebook.com/{VERSION}"
ROOT = Path(__file__).resolve().parent.parent
COLA = ROOT / "publicar" / "cola.json"
PUBLICADOS = ROOT / "publicar" / "publicados.json"
PRUEBA = {"manual": "MANUAL", "auto": "SS_PERFORMANCE"}


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
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def repo_name():
    """usuario/repo: en GitHub Actions viene en GITHUB_REPOSITORY; en la PC sale del remote origin."""
    if os.environ.get("GITHUB_REPOSITORY"):
        return os.environ["GITHUB_REPOSITORY"]
    m = re.search(r"github\.com[:/](.+?)(?:\.git)?$", git("remote", "get-url", "origin"))
    if not m:
        sys.exit("No pude sacar usuario/repo del remote origin")
    return m.group(1)


def public_url(video):
    """URL de jsDelivr fijada a un commit que ya está en GitHub y contiene el video (sirve video/mp4)."""
    if (ROOT / video).stat().st_size >= 20 * 1024 * 1024:
        sys.exit(f"{video} pesa 20 MB o más: jsDelivr no lo sirve. Bajale el bitrate para publicarlo como prueba")
    if not git("ls-files", video):
        sys.exit(f"{video} no está commiteado: para publicarlo como reel de prueba commitealo y pusheá")
    sha = os.environ.get("GITHUB_SHA") or git("rev-parse", "HEAD")
    if not os.environ.get("GITHUB_ACTIONS") and not git("branch", "-r", "--contains", sha):
        sys.exit("El commit actual no está pusheado a GitHub: hacé git push antes de publicar el reel de prueba")
    url = f"https://cdn.jsdelivr.net/gh/{repo_name()}@{sha}/{urllib.parse.quote(video)}"
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


def publish(entry, defaults, token, ig_id):
    if not (ROOT / entry["video"]).exists():
        sys.exit(f"No existe {entry['video']}")
    prueba = entry.get("prueba", defaults.get("prueba"))
    params = {"media_type": "REELS", "caption": entry.get("caption", "")}
    if prueba:  # trial_params sólo funciona con video_url (la subida reanudable lo ignora)
        params["video_url"] = public_url(entry["video"])
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
    if not pendientes:
        print("La cola está vacía: no hay nada para publicar")
        return

    cada = cola.get("cada_dias", 3)
    if publicados and not a.force:
        ultimo = datetime.fromisoformat(publicados[-1]["fecha"])
        dias = (datetime.now(timezone.utc) - ultimo).total_seconds() / 86400
        if dias < cada - 0.1:  # margen para que el cron diario no se corra de hora
            print(f"Último reel hace {dias:.1f} días; toca cada {cada}. Nada que hacer hoy")
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
```

### `.github/workflows/publicar-reel.yml`

```yaml
# Publica el próximo reel de publicar/cola.json cuando pasaron "cada_dias" desde el último.
# Corre todos los días a las 12:00 de Argentina (15:00 UTC); el script decide si toca publicar.
name: Publicar reel

on:
  schedule:
    - cron: "0 15 * * *"
  workflow_dispatch:
    inputs:
      force:
        description: "Publicar ya, sin esperar los días configurados"
        type: boolean
        default: false

permissions:
  contents: write

concurrency:
  group: publicar-reel
  cancel-in-progress: false

jobs:
  publicar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Publicar
        env:
          IG_ACCESS_TOKEN: ${{ secrets.IG_ACCESS_TOKEN }}
          IG_USER_ID: ${{ vars.IG_USER_ID }}
        run: python scripts/publish_reel.py ${{ inputs.force && '--force' || '' }}

      - name: Guardar la cola actualizada
        run: |
          git diff --quiet publicar/ && exit 0
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add publicar/
          git commit -m "Reel publicado: actualiza la cola"
          git push
```

Para cambiar la hora, editá el `cron` (está en UTC). El workflow corre todos los días, pero solo publica
cuando pasaron `cada_dias`. También se puede lanzar a mano desde la pestaña **Actions** del repo
(*Run workflow*, con la opción de forzar).

### `scripts/guardar_token.ps1`

```powershell
# Guarda el token de Instagram que está en el portapapeles (copiado con "Copiar" en Meta Business):
#   - en .env (para correr scripts/publish_reel.py en la PC; .env no se commitea)
#   - en el secret IG_ACCESS_TOKEN de GitHub (para el workflow "Publicar reel")
# No imprime el token. Al final vacía el portapapeles.
#
# Uso (PowerShell, en la raíz del repo): .\scripts\guardar_token.ps1 -IgUserId 1784... -Repo usuario/repo
param(
    [Parameter(Mandatory)] [string]$IgUserId,
    [Parameter(Mandatory)] [string]$Repo
)
$ErrorActionPreference = 'Stop'
$token = (Get-Clipboard -Raw).Trim()
if (-not $token.StartsWith('EAA') -or $token -match '\s') {
    Write-Error 'El portapapeles no tiene un token de Meta (tiene que empezar con EAA). Copialo de nuevo con el botón "Copiar".'
}

$root = Split-Path $PSScriptRoot -Parent
$lines = @("IG_ACCESS_TOKEN=$token", "IG_USER_ID=$IgUserId")
[IO.File]::WriteAllLines((Join-Path $root '.env'), $lines)  # UTF-8 sin BOM

$token | gh secret set IG_ACCESS_TOKEN --repo $Repo
if ($LASTEXITCODE -ne 0) { Write-Error 'No se pudo guardar el secret en GitHub (¿gh auth login?)' }

Set-Clipboard -Value ' '
Write-Host "Listo: token guardado en .env y en el secret IG_ACCESS_TOKEN de GitHub ($($token.Length) caracteres)."
```

---

## Paso 7 · Probar antes de activar

En la raíz del repo, con el `.env` ya guardado:

```bash
python scripts/publish_reel.py --check
```

Tiene que mostrar tu usuario de Instagram y `quota_usage` (máximo 100 publicaciones por API cada 24 h).

```bash
python scripts/publish_reel.py --dry-run
```

Muestra qué reel saldría y con qué texto, sin publicar nada.

```bash
python scripts/publish_reel.py --force
```

Publica el primero de la cola **ya**. Conviene que la primera prueba sea un reel de prueba
(`"prueba": "manual"`): es lo menos visible. Para eso el video tiene que estar commiteado y pusheado antes.

Cuando funcione, commiteá y pusheá todo a la rama principal: desde ese momento el workflow publica solo.

---

## Videos: formato que acepta Instagram

- MP4, H.264 + AAC, vertical **9:16** (1080×1920), entre 3 s y 15 min, hasta 60 fps.
- Para reels de prueba: **menos de 20 MB** (límite de jsDelivr). Un reel de 20 s a ~8 Mbps pesa ~19 MB.
  Con FFmpeg: `-c:v libx264 -crf 17 -maxrate 12M -bufsize 24M -c:a aac -b:a 320k -movflags +faststart`.
- Instagram recomprime todo, así que no tiene sentido subir masters de 60 MB.

---

## Errores que nos pasaron (y cómo evitarlos)

| Problema | Causa | Solución |
|---|---|---|
| El reel "de prueba" salió como reel normal | La **subida reanudable ignora `trial_params`** sin dar error | Los reels de prueba se mandan por `video_url` (el script ya lo hace) |
| `Object with ID ... does not exist` con un token válido | Al token le faltaban `pages_show_list` y `pages_read_engagement` | Regenerar el token con los 4 permisos |
| El secret de GitHub quedó con el token como **nombre** | Se pasó el token como argumento de `gh secret set` | Pasarlo por la entrada estándar (`$token \| gh secret set ...`) |
| Se perdió el token al cerrar la ventana | Meta lo muestra una sola vez | Generar otro; copiarlo y guardarlo antes de cerrar |
| El token apareció en un chat/log | Se imprimió un archivo para "revisarlo" | Nunca imprimir `.env` ni el token; si pasa, **revocar** y generar otro |
| `UnicodeEncodeError` en Windows | La consola no imprime emojis | El script fuerza UTF-8 en la salida |
| No aparece "inicio de sesión con Instagram" | Meta lo sacó para apps nuevas | Usar el login unificado con usuario del sistema (esta guía) |

---

## Cosas a saber

- **La descripción no se puede editar por API.** Si la querés cambiar después de publicar, se hace desde
  la app: reel → ⋯ → Editar.
- **No se puede borrar ni pasar a prueba un reel ya publicado por API.** Si sale mal, se borra desde la app.
- **No hay forma por API de confirmar que un reel quedó como prueba.** Señal: `is_shared_to_feed: false`.
  Confirmalo en la app: los reels de prueba no aparecen en la grilla del perfil.
- **Música:** por API no se pueden agregar canciones de la biblioteca de Instagram. La música va dentro
  del video, con licencia que permita uso comercial en redes (si no, Instagram puede silenciar el audio).
- **Cron de GitHub:** puede salir con algunos minutos de demora. En repos públicos sin actividad por
  60 días GitHub desactiva los workflows programados (los commits del bot al publicar cuentan como actividad).
- **Repo privado:** funciona igual para reels normales. Para reels de prueba necesitás otra URL pública
  para el video (por ejemplo un bucket de S3/R2/Supabase con acceso público) y cambiar `public_url()`.
- **Revocar acceso:** Meta Business → Usuarios del sistema → tu usuario → *Revocar tokens*. El sistema
  deja de publicar al instante.
