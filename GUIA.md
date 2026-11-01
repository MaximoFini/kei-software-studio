# Guía de producción

Cómo se hizo cada video y qué tocar para hacer uno nuevo del mismo estilo.
Todas las composiciones son **1080×1920 a 60 fps** y terminan en el **cierre animado** de KEI.
Para videos nuevos, lo más rápido es pedírselo a Claude Code dentro del repo (usa la skill `kei-video-studio`).

---

## 0 · Cierre animado (`KeiCierre`)

Fondo `#020714` con halos y trama de puntos → isotipo (spring) → "KEI Software" (máscara) → slogan.

- Cambiar textos: props `linea1` / `linea2` en `remotion/src/Root.tsx`.
- `KeiCierreFade`: misma placa con fade a negro al final.

---

## 1 · Logo reveal (reel con fotos + logo fijo en el centro)

**Técnica:** reemplazo de logo sobre un video existente, cuadro a cuadro.

1. `scripts/logo_swap.py` detecta en cada cuadro si el logo original era blanco o negro, lo borra
   (inpainting sólo dentro de la forma del logo) y pone la variante KEI que corresponde.
   Fuera de la zona del logo los píxeles quedan idénticos y el audio se copia sin tocar.
2. `ReelConCierre.tsx`: push-in con motion blur hacia el cartel azul del último plano → placa azul → cierre.
   Usa `remotion/public/reel_1080.mp4` (el reel ya con el logo KEI, escalado a 1080×1920).

Para un video nuevo con logo fijo:
```bash
python3 scripts/logo_swap.py nuevo.mp4 salida.mp4 --bbox X0 Y0 X1 Y1 --white-ref N --black-ref N N
```
- `--bbox`: rectángulo del logo original (en píxeles del video).
- `--white-ref`: un cuadro donde el logo es blanco sobre fondo liso; `--black-ref`: cuadros con logo negro.
- Revisar a ojo los cuadros "de bajo contraste" que informa el script (logos en relieve, grises).

---

## 2 · "Llegamos a Instagram" (motion graphics)

**Técnica:** reconstrucción completa en Remotion copiando tiempos y trayectorias de un reel de referencia,
con textos, colores y tipografías de KEI.

Estructura (tiempos en cuadros del original a 30 fps, `F` en `GameReel.tsx`):

| F | Escena |
|---|---|
| 7–41 | "Un nuevo comienzo" (palabra por palabra con blur) |
| 41–90 | Rueda: Software → Automatización → IA |
| 89–137 | "Llegamos a **Instagram** para mostrarte cómo el **software** transforma negocios" |
| 135–153 | Isotipo → se convierte en avatar de la tarjeta de perfil |
| 147–216 | Tarjeta: `keisoftware`, wordmark, bio, botones Seguir / Mensaje |
| 196–221 | Zoom al botón, "Seguir" → "Siguiendo" |
| 221–311 | Tarjeta se expande, avatar vuela a la pastilla, pastilla → placa azul `@keisoftware` |
| 334 → | Crossfade al cierre |

- Textos: constantes `S1`, `ROLL`, `L1/L2/L3`, `BIO` y el usuario `keisoftware` en `GameReel.tsx`.
- Audio: `remotion/public/llegamos_music_ext.wav` (música original extendida) + whoosh en 10,6 s.

---

## 3 · "Automatizá tu negocio con IA" (celulares filmados)

**Técnica:** reemplazo del contenido de 5 pantallas filmadas, con la mano real por encima
(tracking de pantallas + composición cuadro a cuadro con OpenCV).

- El resultado ya compuesto está en `remotion/public/office_comp.mp4`.
- `OfficeReel.tsx`: push-in con motion blur a la pantalla "IA" → placa azul → cierre.
- Audio: `remotion/public/automatiza_music_ext.wav` + whoosh en 7,63 s.
- Para cambiar las palabras de las pantallas o hacer otro video de este tipo, pedíselo a Claude Code:
  la skill describe el método completo (tracking, sombreado, recorte de mano).

---

## Música que sigue durante el cierre

```bash
python3 scripts/extend_music.py original.mp4 musica.wav --dur <duración final> \
  --splice-min <s> --splice-max <s> [--avoid <inicio> <fin>]
```
Busca un punto del tema que suene igual y empalma ahí (sin corte audible), limita picos y hace fade.
`--avoid` evita repetir un tramo con efectos (ej. un click de botón).

## Checklist antes de publicar

- [ ] Tiempos iguales a la referencia (`ffmpeg ... select='gt(scene,0.2)'`)
- [ ] Revisar cuadro a cuadro los bordes de manos/logos
- [ ] Audio sin cortes, sin silencio al final, whoosh en la entrada del cierre
- [ ] Exportar MP4 H.264, 1080×1920, audio AAC 320k

---

## 4 · Videos para landing (material de iPhone)

**Técnica:** ingesta del material de cámara → composición `Landing*` en Remotion → export web.
Paso a paso con comandos en el README (sección "Videos para landing con material del iPhone").

| Etapa | Script | Qué resuelve |
|---|---|---|
| Ingesta | `ingest.sh` | HDR/Dolby Vision del iPhone → SDR bt709 (si no, se ve lavado), fps fijo, rotación, estabilización, recorte al formato |
| Limpieza | `enhance.sh --perfil camara` | Nitidez suave en 10 bits, voz sin ruido, -14 LUFS |
| Subtítulos | `captions.sh` | Whisper en español → `.srt` / `.vtt` (revisar a mano) |
| Composición | `Landing.tsx` | Subtítulos con Glacial Indifference, isotipo opcional, cierre (KeiCierre en 9:16, placa adaptable en el resto) |
| Master | `render.sh --prores` | ProRes 422 HQ 10-bit, cuadros PNG |
| Web | `web_export.sh` | H.264 + AV1 10-bit, 1080p/720p, poster, `<video>` listo, loop sin corte, VMAF |

Referencia de la prueba (clip 1080p de 7,6 s): H.264 3,9 MB / AV1 1,9 MB, ambos con VMAF ≈ 98.

**Checklist web**
- [ ] VMAF ≥ 95 en 1080p (`--check`)
- [ ] Hero/fondo: `--mute` (el autoplay sólo funciona sin audio) y `--loop` si se repite
- [ ] Poster = primer cuadro (no hay salto al empezar)
- [ ] Subtítulos revisados (nombres propios, términos técnicos)

---

## 5 · "Una web linda no alcanza" (reel de ventas, FFmpeg)

**Técnica:** montaje de 5 tomas de landings filmadas (OG Circle, AgroSync, web de KEI) con titulares
en el espacio negro arriba del monitor, push-in suave y cortes en los acentos de la música; sin Remotion
salvo el cierre. Script: `scripts/reel_ventas.sh` → `entregables/04-tu-web-vende.mp4`.

| s | Toma | Titular |
|---|---|---|
| 0–3,2 | OG Circle, hero | Una web linda / **no alcanza.** |
| 3,2–6,4 | OG Circle, precio "Pago único" | Landings que convierten / **visitas en ventas.** |
| 6,4–9,6 | AgroSync, hero con celulares | Apps y sistemas / **a medida.** |
| 9,6–12,8 | Web KEI, Proyectos | Diseño y desarrollo, / **de punta a punta.** |
| 12,8–15,8 | Web KEI, contacto → KEI Software | Contanos tu proyecto. / **Escribinos por DM.** + @keisoftware |
| 15,8 → | Fundido al cierre (+ whoosh) | — |

- Música: `epic-motivation_kulakovka.mp3` (150 BPM, acentos cada 8 tiempos = 3,2 s); -14 LUFS en dos pasadas.
- Tomas: `work/reels/IMG_*.mp4` (ingeridas con `ingest.sh`), cierre: `render.sh KeiCierre work/vt/cierre.mp4`.
- **Glacial Indifference no tiene "¿" ni "¡"**: en titulares con esta fuente, escribir afirmaciones.
- Publicación automática: `publicar/cola.json` + `scripts/publish_reel.py` (ver el docstring) y el workflow
  `.github/workflows/publicar-reel.yml`.

---

## 5 · Reels de landings filmadas (KEI × cliente)

**Técnica:** monitor filmado con el iPhone en un cuarto oscuro → cuerpo acelerado sin pausas → `LandingReel`.
Regla: **sin oraciones en el medio**, sólo el lockup de logos. Sin música (se agrega en el editor de Instagram).

| Elemento | Detalle |
|---|---|
| Lockup | Isotipo KEI × logo del cliente (o isotipo + wordmark en reels propios), centrado en y=520, entra en 0,1–0,6 s y queda fijo |
| Cuerpo | Tramos en `scripts/landing_reels.json`, a velocidad original (1×): sólo se sacan pausas y scroll hacia atrás |
| Final | Push-in 2,6× con motion blur al `foco` del último cuadro (en reels de KEI: el "KEI Software" del footer) → cierre KEI |
| Audio | Pista silenciosa |

Para un reel nuevo:
1. Video a `input/`, logo del cliente (PNG sin fondo, ≥ 500 px) a `logos_clientes/`.
2. `bash scripts/ingest.sh input/X.MOV work/reels/X.mp4 --fit 1440x2560 --fps 30` (**sin `--stab`**: en tomas casi quietas vidstab hace "temblar" el monitor; la persona quiere la imagen original)
3. Medir pausas: ver el movimiento por segundo (o tira de cuadros) y cargar `tramos`, `velocidad` y `cliente` en el JSON.
4. `python scripts/landing_reels.py <id> --solo-cuerpo` → mirar el último cuadro y fijar `foco`.
5. `python scripts/landing_reels.py <id> --draft` (preview) y después sin `--draft` → `out/reels/<id>.mp4`.

## 6 · "¿Cómo funciona un QR?" (explicativo animado con voz en off)

**Técnica:** guion → voz neuronal (edge-tts, `es-AR-ElenaNeural`, +20%) con tiempos por palabra →
animación en Remotion sincronizada palabra por palabra → subtítulos con la palabra activa en Azul UI → cierre KEI.
Público no técnico: una idea por escena, ejemplo con personajes (Sofi en un bar), sin jerga. Dura 50 s justos (cierre incluido): guion sin relleno, pausas de 0,16 s y el cierre entra 0,4 s adelantado.

| Escena | Qué se ve |
|---|---|
| hook | QR que se arma módulo por módulo, línea de escaneo, visor y ✓ |
| bar | Sofi entra, cartel BAR, pide la carta (ícono), el mozo señala el QR de la mesa → zoom al QR |
| mensaje / bits | El QR enmarcado como "dibujo" → se separa en cuadraditos → lupa con 1 y 0 → 8 bits = una letra → dirección |
| esquinas | Se iluminan los 3 patrones de posición; el QR gira y se inclina y el visor igual lo engancha |
| lectura | Celular: encuentra, endereza, lee fila por fila, ✓ y se abre la carta |
| mancha | Mancha de café + esquina arrancada, sigue leyendo; anillo de 0 a 30% |
| origen | Japón, contador hasta 1994, cinta de fábrica con piezas etiquetadas, auto |
| cta | Tarjeta @keisoftware con "Seguir" → "Siguiendo", Sofi saludando → cierre |

- El QR es real (nivel H) y abre `instagram.com/keisoftware`; con la mancha y la esquina rota sigue decodificando (verificado con `cv2.QRCodeDetectorAruco`).
- Para cambiar el texto: editar `scripts/guiones/qr.json`, correr `uv run --python 3.11 --with edge-tts python scripts/explainer.py voz qr`
  y ajustar en `QrExplainer.tsx` las palabras que disparan cada animación (`w("escena", "palabra")`). La duración sale sola.
- Assets: `uv run --python 3.11 --with segno,numpy python scripts/qr_assets.py` (matriz del QR y sonidos pop/tic/ok).
- Barra de progreso fina en Azul UI arriba (y=150), avanza algo más rápido al principio (p^0,85) para incentivar a terminarlo.
- Música: "Long Day" (PurrpleCat, Pixabay, sin Content ID) desde el primer tiempo del beat, -25 LUFS y ducking con la voz
  (~-32 LUFS mientras habla, ~18 dB por debajo). `python scripts/explainer.py musica qr` la baja y arma `remotion/public/qr_musica.wav` (no se sube al repo).
- Render: `bash scripts/build_all.sh 6`.

## 7 · "¿Cómo funciona el Bluetooth?" (explicativo animado, voz masculina)

Misma fórmula que el 6 (kit compartido en `remotion/src/explainerKit.tsx`: escenas con crossfade, subtítulos,
título, barra de progreso, personajes, tarjeta "Seguir" y cierre). Voz `es-AR-TomasNeural` +14%, 49,6 s.

**Gancho:** dato sorprendente en la primera frase ("se llama así por un rey vikingo que tenía un diente azul",
con el rey en pantalla desde el cuadro 0) + bucle abierto ("su logo esconde un secreto") que se cierra al final
con las runas ᚼ + ᛒ formando el logo: la promesa sostiene la retención hasta el último tramo.

| Escena | Qué se ve |
|---|---|
| hook | Rey vikingo con corona y barba, logo de Bluetooth que aparece, sonrisa con el diente azul y destello |
| secreto | Logo grande con "?" → celular con música → auriculares → cable que se corta ("sin cables") |
| mateo | Mateo corriendo con auriculares, ciudad que pasa, celular en el bolsillo |
| ondas | Ondas de radio del celular a los auriculares con notas, radio en miniatura, alcance de 10 m |
| emparejar | Pantalla de Bluetooth: "Conectando..." → "Conectado ✓"; después enlace automático |
| canales | 79 canales, el wifi ocupa una franja, el Bluetooth salta entre los libres; "1.600 saltos / seg" |
| bateria | Batería que casi no baja mientras el reloj da vueltas |
| rey | Harald «Diente Azul», banderas de Dinamarca y Noruega que se juntan → aparatos unidos al logo |
| logo | Runas H y B que se dibujan y se superponen → logo de Bluetooth |
| cta | Tarjeta @keisoftware "Seguir" → "Siguiendo", Mateo saludando → cierre |

- Música: "Vlog Hip-Hop" (ProducesPlatinum, Pixabay, sin Content ID), desde 2,45 s; mismo nivel y ducking que el QR.
- Render: `bash scripts/build_all.sh 7`.
