# KEI Software Studio

Kit para producir los videos de **KEI Software**: marca, proyecto de Remotion, scripts de edición,
la skill de Claude y los videos ya hechos.

---

## 1. Qué instalar (una sola vez)

| Herramienta | Para qué | Versión |
|---|---|---|
| **Git** | Descargar y actualizar el repo | cualquiera |
| **Node.js** | Remotion (motion graphics y render) | 22 LTS (mínimo 18) |
| **FFmpeg** | Cortes, audio, mezclas, conversiones, subtítulos | **8 o superior, build "full"** (trae whisper, libplacebo, SVT-AV1, VMAF) |
| **Python** | Scripts de logo, música y calidad | 3.10 o superior |
| **Claude Code** | Hacer videos nuevos pidiéndoselo a Claude | última |
| VS Code *(opcional)* | Editar textos y tiempos | — |

### macOS

```bash
# Homebrew (si no lo tenés): https://brew.sh
brew install git node@22 ffmpeg python@3.12
brew install --cask claude-code
```

### Windows (PowerShell)

```powershell
winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg Python.Python.3.12
winget install Anthropic.ClaudeCode
```
Cerrá y volvé a abrir la terminal después de instalar. Usá **Git Bash** para correr los scripts `.sh`.

### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install -y git ffmpeg python3 python3-pip curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
# librerías que necesita el navegador interno de Remotion
sudo apt install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2
curl -fsSL https://claude.ai/install.sh | bash
```

### Verificar

```bash
git --version && node --version && ffmpeg -version | head -1 && python3 --version && claude --version
```
(En Windows usá `python` en lugar de `python3`.)

> Claude Code necesita una cuenta de Claude **Pro, Max, Team o Enterprise**. La primera vez que corran `claude`, se loguean desde el navegador.

---

## 2. Descargar el repo e instalar dependencias

```bash
git clone https://github.com/MaximoFini/kei-software-studio.git
cd kei-software-studio

python -m venv .venv                                # entorno de Python propio del repo
.venv/Scripts/python -m pip install -r requirements.txt   # Windows (en macOS/Linux: .venv/bin/python)
cd remotion && npm install && cd ..                 # Remotion (descarga su propio Chrome la 1ª vez que renderiza)
```
Los scripts de Python se corren con ese entorno: `.venv/Scripts/python scripts/logo_swap.py ...`

Probar que todo anda (renderiza el cierre animado en ~1 min):

```bash
bash scripts/render.sh KeiCierre out/cierre.mp4      # queda en out/cierre.mp4
```

Para actualizar el repo más adelante: `git pull`.

---

## 3. Cómo hacer videos

### Con Claude (recomendado)

```bash
cd kei-software-studio
claude
```
La skill **kei-video-studio** viene dentro del repo (`.claude/skills/`) y se carga sola.
Pídanle cosas como:
- *"Hagamos un reel para Kei igual a este video de referencia, cambiando el logo"* (y adjuntan el video)
- *"Cambiá los textos del reel de Instagram por …"*
- *"Agregale el cierre animado a este video"*

Claude analiza la referencia, propone textos y opciones, y renderiza respetando el manual de marca.

### A mano

```bash
cd remotion && npm run studio        # preview en vivo de todas las composiciones (http://localhost:3000)

bash scripts/build_all.sh            # vuelve a renderizar los 4 videos en out/
bash scripts/build_all.sh 2          # sólo el video 2
bash scripts/render.sh KeiCierre out/cierre.mp4
```

### Videos para landing con material del iPhone

1. **Pasar los videos sin recomprimir.** En el iPhone: Ajustes → Fotos → "Transferir a Mac o PC" → **Mantener originales**.
   Copiar los `.MOV` por cable (o Drive / iCloud "Original sin modificar") a `input/` (no se sube al repo).
2. **Preparar** (HDR → SDR, fps fijo, rotación, opcional estabilizar y recortar al formato):
   ```bash
   bash scripts/ingest.sh input/IMG_1234.MOV --report                 # sólo ver qué es
   bash scripts/ingest.sh input/IMG_1234.MOV work/hero.mp4 --fit 1920x1080 --stab
   ```
3. **(Opcional) mejorar y subtitular:**
   ```bash
   bash scripts/enhance.sh work/hero.mp4 work/hero_ok.mp4 --perfil camara --voz
   bash scripts/captions.sh work/hero_ok.mp4            # -> work/hero_ok.srt / .vtt (revisar el texto)
   ```
4. **Armar en Remotion** (subtítulos con la tipografía de marca + cierre): copiar el video y el `.srt` a
   `remotion/public/` y renderizar el master en ProRes:
   ```bash
   bash scripts/render.sh LandingHero out/hero.mov --prores --props='{"video":"hero_ok.mp4","srt":"hero_ok.srt"}'
   ```
   Formatos: `LandingHero` 16:9 · `LandingVertical` 9:16 · `LandingFeed` 4:5 · `LandingSquare` 1:1.
   Props: `cierre` (true/false), `marca` (isotipo en la esquina), `linea1`/`linea2`, `fps`.
   Preview rápido: `--draft` en lugar de `--prores`.
5. **Exportar para la web** (H.264 + AV1, 1080p y 720p, poster y `<video>` listo para pegar):
   ```bash
   bash scripts/web_export.sh out/hero.mov hero --mute --check     # video de fondo, mide calidad con VMAF
   bash scripts/web_export.sh out/hero.mov hero --loop 0.5         # loop sin corte para el hero
   ```
   Queda todo en `out/web/hero/`. Subir esa carpeta al hosting de la landing y pegar `snippet.html`.

**Para grabar mejor:** 4K a 30 fps; bloquear exposición y foco (mantener apretado en la pantalla);
buena luz de frente. Si la idea es mostrar una web o una app, **grabar la pantalla en la PC** (OBS) en lugar
de filmar el monitor.

---

## 4. Qué hay en el repo

```
.claude/skills/kei-video-studio/   Skill de Claude (se carga sola al abrir el repo con Claude Code)
brand/            Manual de marca, recursos, logos, íconos de destacadas, fuentes
remotion/         Proyecto de Remotion (React)
  src/KeiCierre.tsx       Cierre animado 4 s (placa final de todos los videos)
  src/ReelConCierre.tsx   Video 1: logo reveal + push-in al cartel + cierre
  src/GameReel.tsx        Video 2: "Llegamos a Instagram" (motion graphics)
  src/OfficeReel.tsx      Video 3: celulares + push-in a la pantalla "IA" + cierre
  src/Landing.tsx         Videos de landing (16:9, 9:16, 4:5, 1:1): clip + subtítulos de marca + cierre
  public/                 Assets de las composiciones (fuentes, logos, SFX, videos intermedios, música)
entregables/      Videos finales listos para publicar
examples/         Cierre animado de muestra
input/            Material crudo (iPhone, etc.). No se sube al repo
work/  out/       Intermedios y renders. No se suben al repo
models/           Modelos de Whisper (se bajan solos). No se suben al repo
scripts/
  build_all.sh            Vuelve a renderizar los 4 videos
  render.sh               Render de Remotion: master H.264 (cuadros PNG, bt709), --prores, --draft
  ingest.sh               Material de cámara: HDR→SDR, fps fijo, rotación, estabilizar, recortar
  enhance.sh              Mejora de calidad: --perfil ia | camara, limpieza de voz, loudness -14 LUFS
  captions.sh             Subtítulos automáticos con Whisper (.srt/.vtt)
  web_export.sh           Export para landing: H.264 + AV1, 1080/720, poster, snippet <video>, loop
  vmaf.sh                 Mide la calidad de un export contra el master
  logo_swap.py            Reemplaza un logo fijo por el de KEI, cuadro a cuadro
  extend_music.py         Extiende la música para que siga durante el cierre
  whoosh.py               Genera el SFX de transición (propio, sin derechos)
GUIA.md           Cómo se hizo cada video y qué tocar para hacer uno nuevo
```

---

## 5. Reglas de marca (resumen)

- Colores: Azul UI `#3F7DFF` · Fondo oscuro `#020714` · Azul marino `#16205E` · Fondo claro `#F9FAFC` · Azul hielo `#DFE8FD`
- Tipografías: **Glacial Indifference** (títulos) y **Montserrat** (textos/UI)
- Logo e isotipo **siempre desde los PNG** de `brand/`: no se rotan, no se deforman, no se recolorean, sin sombras ni efectos.
- Slogan: "Software a medida." (blanco) / "Resultados reales." (azul) · Instagram: `@keisoftware`

---

## 6. Problemas comunes

| Problema | Solución |
|---|---|
| `ffmpeg: command not found` | No está instalado o no está en el PATH: reinstalar y abrir una terminal nueva |
| El render falla en Linux con errores de librerías | Instalar las librerías del paso 1 (Linux) |
| `ModuleNotFoundError: cv2` | Usar el Python del repo: `.venv/Scripts/python` (ver paso 2) |
| El video del iPhone se ve lavado o gris | Es HDR: pasarlo antes por `scripts/ingest.sh` |
| `ingest.sh` da colores raros en HDR | Probar `--tonemap cpu` (no usa la GPU) |
| `No such filter: 'whisper'` / `'libplacebo'` | FFmpeg viejo o build "essentials": instalar FFmpeg 8 full (`winget install Gyan.FFmpeg`) |
| Subtítulos quemados con `captions.sh --quemar` salen en Arial | Es a propósito (libass no lee los TTF de Glacial); para tipografía de marca usar `LandingHero` con `srt` |
| En Windows los `.sh` no corren | Correrlos desde **Git Bash** |
| Remotion tarda la 1ª vez | Está descargando su navegador interno; es una sola vez |

## 7. Licencias

- **Remotion**: gratis para individuos y equipos de hasta 3 personas. Si Kei pasa de 3, hace falta la Company License (remotion.pro).
- **Glacial Indifference** y **Montserrat**: SIL Open Font License, uso comercial OK.
- Los videos de referencia de otras marcas **no se suben** a este repo. El repo es **público**: no subir material crudo ni de clientes (`input/`, `work/` y `out/` ya están ignorados).
