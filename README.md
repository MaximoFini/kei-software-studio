# KEI Software Studio

Kit para producir los videos de **KEI Software**: marca, proyecto de Remotion, scripts de edición,
la skill de Claude y los videos ya hechos.

---

## 1. Qué instalar (una sola vez)

| Herramienta | Para qué | Versión |
|---|---|---|
| **Git** | Descargar y actualizar el repo | cualquiera |
| **Node.js** | Remotion (motion graphics y render) | 22 LTS (mínimo 18) |
| **FFmpeg** | Cortes, audio, mezclas, conversiones | 6 o superior |
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

pip install opencv-python numpy pillow scipy        # librerías de Python
cd remotion && npm install && cd ..                 # Remotion (descarga su propio Chrome la 1ª vez que renderiza)
```

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
  public/                 Assets de las composiciones (fuentes, logos, SFX, videos intermedios, música)
entregables/      Videos finales listos para publicar
examples/         Cierre animado de muestra
scripts/
  build_all.sh            Vuelve a renderizar los 4 videos
  render.sh               Render de una composición de Remotion
  logo_swap.py            Reemplaza un logo fijo por el de KEI, cuadro a cuadro
  extend_music.py         Extiende la música para que siga durante el cierre
  enhance.sh              Mejora de calidad con FFmpeg
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
| `ModuleNotFoundError: cv2` | `pip install opencv-python numpy pillow scipy` |
| En Windows los `.sh` no corren | Correrlos desde **Git Bash** |
| Remotion tarda la 1ª vez | Está descargando su navegador interno; es una sola vez |

## 7. Licencias

- **Remotion**: gratis para individuos y equipos de hasta 3 personas. Si Kei pasa de 3, hace falta la Company License (remotion.pro).
- **Glacial Indifference** y **Montserrat**: SIL Open Font License, uso comercial OK.
- Los videos de referencia de otras marcas **no se suben** a este repo. La música que está en `remotion/public` es de los reels originales y se usa con permiso: el repo tiene que seguir **privado**.
