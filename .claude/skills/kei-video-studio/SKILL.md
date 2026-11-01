---
name: kei-video-studio
description: Crear, editar o mejorar videos de KEI Software (reels, cierres animados, cambio de logo, pantallas filmadas, transiciones, música, mejora de calidad) con Remotion y FFmpeg usando el kit de marca de este repo.
---

# KEI Video Studio

Producción de video para KEI Software. Todo se hace con código: Remotion (React) para motion graphics y
FFmpeg/OpenCV para edición. Claude no genera video a partir de prompts; para planos realistas se usan
herramientas generativas externas (Kling, Veo, Sora) y acá se hace el resto.

Respondé en español rioplatense (vos), con listas limpias y sin paredes de texto.

## 1. Setup (siempre primero)

1. Este repo (`kei-software-studio`) es el kit. Si no estás parado en él, clonalo:
   `git clone https://github.com/MaximoFini/kei-software-studio.git`
   (en una sesión en la nube: `add_repo` owner `MaximoFini`, repo `kei-software-studio`, clon con timeout largo).
2. `cd remotion && npm install` (si no existe `remotion/node_modules`).
3. Chequeá herramientas: `ffmpeg -version` (tiene que ser 8+ full), y el Python del repo:
   `.venv/Scripts/python -c "import cv2, numpy, PIL, scipy"` en Windows (`.venv/bin/python` en macOS/Linux; si no existe `.venv`, crearla con `requirements.txt`).
   Si falta algo, instalalo (ver README) o pedile a la persona que lo instale.
4. Render SIEMPRE con `bash scripts/render.sh <Comp> <salida> [flags]` (desde la raíz del repo).
   Stills: `bash scripts/render.sh KeiCierre out/x.png --still --frame=N`.
   En contenedores en la nube el script usa el headless shell de `/opt/pw-browsers/` automáticamente.
5. Leé `GUIA.md`: estructura, técnica y tiempos de cada video ya hecho.

## 2. Reglas de marca (manual en brand/manual-de-marca.pdf)

- Paleta: Azul UI `#3F7DFF` (acentos), Fondo oscuro `#020714`, Azul marino `#16205E`, Fondo claro `#F9FAFC`, Azul hielo `#DFE8FD`.
- Colores internos del isotipo (no tocar): `#9DB2F0 #C3D1F7 #7EA0F2 #5B79E8 #1A2F9E #2A44C9`.
- Tipografías: Glacial Indifference (títulos; brand/fonts y remotion/public, incluye tildes) y Montserrat (cuerpo/UI; woff2 en remotion/public).
- Logo e isotipo son activos cerrados: usar siempre los PNG de brand/logos o brand/derived. Prohibido recolorear el isotipo, deformar, ROTAR, agregar sombras/contornos/efectos o reescribir "KEI Software" con otra fuente. Sí se permite animar opacidad, escala uniforme y máscaras de revelado.
- Variantes: texto blanco (`derived/kei_horizontal_dark.png`, `derived/wordmark.png` blanco+azul) sobre fondos oscuros; texto negro (`logos/horizontal-fondo-claro.png`) sobre claros. Sobre fondos azules, texto totalmente blanco.
- Avatar de Instagram: isotipo sobre círculo blanco. Usuario: `@keisoftware`.
- Estética: composiciones limpias, mucho aire, contraste azul profundo/blanco, halos laterales, tramas de puntos, bordes finos.
- Slogan: "Software a medida." (blanco) / "Resultados reales." (`#3F7DFF`).

## 3. Flujos

Antes de implementar un video a partir de una referencia: analizala (ffprobe, tiras de cuadros numerados,
cortes con `select=gt(scene,0.2)`), explicá qué entendiste y qué técnica corresponde, proponé opciones de
texto en español y esperá las definiciones antes de renderizar.

### A. Motion graphics nuevos o reconstruidos (Remotion)
- Ejemplo completo: `remotion/src/GameReel.tsx` (reconstrucción de un reel de referencia: medir con OpenCV posiciones, tamaños y trayectorias del original y copiarlas como keyframes en espacio 720p ×1.5).
- Base de estilo: `remotion/src/KeiCierre.tsx`. Registrar composiciones en `Root.tsx`.
- Formato por defecto 1080×1920, 60 fps. Otros: 1080×1350, 1080×1080, 1920×1080.
- Verificá con tiras comparativas original vs render en los mismos cuadros; previews con `--scale=0.5`.

### B. Cierre animado al final de un video
- `KeiCierre` (placa quieta) o `KeiCierreFade`. 4 s.
- Transición (ver `ReelConCierre.tsx` y `OfficeReel.tsx`): push-in con `CameraMotionBlur` (sólo durante el zoom) hacia un elemento del último plano, capas vectoriales encima para que no se pixele, placa de color de seguridad al final del zoom, crossfade al cierre salteando su primer tramo (sólo fondo). Whoosh propio: `remotion/public/whoosh.wav` (`scripts/whoosh.py`).
- Video fuente: pre-escalar con ffmpeg lanczos a 1080×1920 y usar `OffthreadVideo`; fps de la comp múltiplo del de la fuente.

### C. Reemplazar un logo fijo en un video existente
- Sólo con material propio, licenciado o con permiso explícito del dueño; si no está claro, preguntá una vez.
- `python3 scripts/logo_swap.py in.mp4 out.mp4 --bbox X0 Y0 X1 Y1 --white-ref N --black-ref N [N...]`
- Revisá los cuadros de bajo contraste que reporta; verificá cuadros/fps, cortes, PSNR fuera del logo > 40 dB y audio.

### D. Reemplazar contenido de pantallas filmadas (celulares, monitores)
- Resultado de referencia: `remotion/public/office_comp.mp4` + `OfficeReel.tsx` (video 3 de GUIA.md). El código de composición no está en el repo: escribilo siguiendo este método.
- Tracking: bordes de cada pantalla + ECC afín global a media resolución (máscara en bandas de borde), limpieza de atípicos contra la mediana de ±4 cuadros, suavizado gaussiano, refinamiento por pantalla y corrección de escala/posición con el contorno real (blob) de cada pantalla. Medí los quads de referencia con ajuste robusto al ancho completo (esquinas redondeadas y cámara frontal sesgan los bordes).
- Composición: contenido nuevo en espacio de pantalla con la animación del original (deslizamiento + glitch); sombreado desde una placa de pantalla vacía (percentil sobre cuadros vecinos, sin mano ni texto viejo); forma de la pantalla desde los cuadros finales sin mano (relleno de huecos); exposición por cuadro; matte de mano por piel/diferencia contra la placa esperada, con la mano siempre por encima.
- Revisá con zoom cada toque y buscá fantasmas del texto viejo realzando el contraste de las pantallas vacías.

### E. Música que siga durante el cierre
- `python3 scripts/extend_music.py original.mp4 musica.wav --dur <dur final> --splice-min A --splice-max B [--avoid X Y]`: empalma en un punto musicalmente equivalente, crossfade 60 ms, limitador en la extensión y fade final. `--avoid` evita repetir efectos (clicks, pops).
- Mezclá con ffmpeg: música extendida + whoosh en la entrada del cierre (volume 0.75), `amix normalize=0` (ver `scripts/build_all.sh`). Verificá correlación ~1.0 del tramo original y que no haya picos.

### F. Mejorar calidad
- `bash scripts/enhance.sh in.mp4 out.mp4` (perfil `ia`, por defecto). No inventa detalle: para fondos deformes de video IA, upscaler generativo (Topaz Starlight, Krea) sobre el ORIGINAL, o regenerar.
- Material de cámara limpio: `--perfil camara` (sólo nitidez suave; `--denoise` con poca luz). `--voz` limpia la voz. Audio siempre a -14 LUFS en dos pasadas.

### H. Videos para landing con material de iPhone / cámara
1. Material crudo en `input/` (gitignored). Siempre empezar con `bash scripts/ingest.sh input/X.MOV --report`.
2. `bash scripts/ingest.sh input/X.MOV work/x.mp4 [--fit WxH] [--stab] [--fps N]`: tone mapping HDR→SDR (libplacebo BT.2390 en GPU; `--tonemap cpu` si falla), fps fijo, rotación aplicada. NUNCA meter HEVC HDR del iPhone directo en Remotion.
3. Subtítulos: `bash scripts/captions.sh work/x.mp4` (Whisper small, español) → revisar el `.srt` con la persona antes de usarlo.
   Quemado directo con FFmpeg (`--quemar`) ya usa Glacial Indifference vía `brand/fonts/ffmpeg/` (familia interna "Glacial KEI"; los TTF originales son webfonts sin nombre y libass no los encuentra). En cualquier `subtitles`/`drawtext` de FFmpeg usar esa carpeta, nunca Arial.
4. Composición: copiar video y `.srt` a `remotion/public/` y usar `LandingHero` (16:9) / `LandingVertical` / `LandingFeed` / `LandingSquare` con props `video`, `srt`, `cierre`, `marca`, `linea1`, `linea2`, `fps`. La duración sale del video. Si hace falta algo más que clip + subtítulos + cierre, escribir una composición nueva reutilizando `Landing.tsx`.
5. Master: `bash scripts/render.sh LandingHero out/x.mov --prores --props='{...}'` (previews con `--draft`).
6. Web: `bash scripts/web_export.sh out/x.mov nombre [--mute] [--loop S] --check` → `out/web/nombre/` con H.264 + AV1, 1080/720, poster y `snippet.html`. Objetivo VMAF ≥ 95 en 1080p.
- Hardware de la PC actual: Ryzen 3 3200G + Vega 8, 14 GB. Upscalers con IA locales no son viables; no usar encoders por hardware (AMF) para finales.
- Assets de clientes o crudos no se commitean en `remotion/public/`: borrarlos después del render (el repo es público).

### I. Reels de landings filmadas (KEI × cliente)
- Pipeline: `ingest.sh --fit 1440x2560 --fps 30` (NUNCA `--stab` ni acelerar: la persona quiere el movimiento literalmente original; la estabilización hizo vibrar el monitor) → config en `scripts/landing_reels.json` → `python scripts/landing_reels.py [id] [--draft|--solo-cuerpo]` → `out/reels/<id>.mp4`. Composición: `remotion/src/LandingReel.tsx`.
- Reglas de la persona: SIN oraciones ni textos en el medio del reel; sólo lockup isotipo KEI × logo cliente (reels propios: isotipo + wordmark). Cierre KEI siempre. Por ahora sin música: la suma en Instagram (pista silenciosa).
- Logos de clientes en `logos_clientes/` (no se commitean al repo si son de terceros; los assets `remotion/public/lr_*` están en .gitignore).
- Música de Pixabay: muchos temas tienen "Content ID Registered" (generan reclamos en IG): verificar en la ficha antes de usar uno. La persona prefiere trap/phonk antes que épica orquestal.
- Python llama a `bash` de WSL en Windows: `landing_reels.py` ya usa el bash de Git; replicarlo en scripts nuevos.

### J. Explicativos animados con voz en off
- Referencias: `QrExplainer.tsx` y `BtExplainer.tsx` (GUIA.md §6 y §7). Piezas comunes en `remotion/src/explainerKit.tsx` (`crearExplainer(voz, titulo)` da `w`, `Escena` y `Base`); cada reel sólo escribe sus escenas.
- Guion en `scripts/guiones/<id>.json` (voz, velocidad, escenas, música) → `uv run --python 3.11 --with edge-tts python scripts/explainer.py voz <id>` (edge-tts, sin instalar nada en `.venv`) y `python scripts/explainer.py musica <id>`. Duración objetivo ~50 s con cierre.
- Gancho: dato sorprendente en la primera frase, con imagen fuerte desde el cuadro 0, y un bucle abierto que se cierra al final.
- La animación se dispara por palabra (`w("escena","palabra")`); subtítulos de 3–4 palabras con la palabra activa en Azul UI, en y≈1470 (fuera de la UI de Instagram). Personajes planos en SVG con la paleta de marca. Voz a -14 LUFS; música de Pixabay sin Content ID a ~18 dB debajo de la voz con ducking; barra de progreso arriba.

### G. Planos generativos
- Guion, storyboard y prompts por plano para Kling/Veo/Sora pidiendo sólo la escena (sin texto ni logo); textos, logo y cierre se agregan en Remotion.

## 4. Entrega y calidad

- MP4 H.264 yuv420p `+faststart`, CRF 8–12 para masters, audio AAC 320k. No bajar la resolución de la fuente.
- `render.sh` ya renderiza con cuadros PNG y bt709 (Remotion usa JPEG 80 por defecto: no sacar esos flags).
- Para web, nunca subir el master: pasar por `web_export.sh`.
- Si el audio original se mantiene, verificá sincronía por correlación cruzada (0 ms). Nunca dejar silencio al final: extender la música.
- Al entregar, mencioná qué verificaste y 1–2 decisiones abiertas.
- Al terminar un video nuevo: sumá la composición y sus assets al repo, el video a `entregables/`, un paso a `scripts/build_all.sh` y una sección a `GUIA.md`; commit + push.
- No subas al repo videos o música de referencia de terceros.

## 5. Licencias

- Remotion: gratis hasta 3 personas; equipos más grandes necesitan Company License.
- Glacial Indifference y Montserrat: SIL OFL (uso comercial OK).
