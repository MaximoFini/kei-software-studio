# Formatos de reel explicativo (rotación)

Objetivo: dejar de repetir "motion azul" y "pizarrón". Hay 10 formatos pensados; los 5 marcados **LISTO** ya tienen dependencias instaladas y un componente de prueba en `remotion/src/formatos/`.

Las composiciones de prueba se registran con `{FormatosPrueba()}` en `Root.tsx` (ids `FmtChat`, `FmtTerminal`, `FmtCuaderno`, `FmtCollage`, `FmtIsometrico`). Para probar un frame:

```
cd remotion
npx remotion still src/index.ts FmtChat ../work/fmt/FmtChat.png --frame=40 --gl=angle
```

## Catálogo

| # | Formato | Visual | Libs / fuentes / assets | Dif. | Render | Mejor para |
|---|---|---|---|---|---|---|
| 1 | **Chat / WhatsApp** (LISTO) | Fondo oscuro, burbujas que aparecen una a una, "escribiendo..." | Inter (@fontsource/inter) | Baja | Muy bajo | Mitos, preguntas/respuestas, "le explicás a un amigo" |
| 2 | **Terminal** (LISTO) | Consola negra, tipeo con cursor, líneas de log | JetBrains Mono (@fontsource) | Baja | Muy bajo | Automatización, IA, procesos paso a paso |
| 3 | **Cuaderno cuadriculado** (LISTO) | Hoja con grilla y margen rojo, letra manuscrita, garabatos | Patrick Hand, @remotion/shapes, @remotion/noise | Media | Bajo | Conceptos escolares, listas, esquemas simples |
| 4 | **Collage papel recortado** (LISTO) | Tiras de papel rotadas con sombra dura, formas recortadas, cortes rápidos | Bebas Neue, @remotion/transitions, @remotion/shapes, @remotion/noise | Media | Bajo | Frases fuertes, "5 errores", opinión/contrarian |
| 5 | **Isométrico 3D** (LISTO) | Bloques/edificios 3D con cámara ortográfica, suben escalonados | three 0.169, @react-three/fiber 8, @remotion/three | Alta | Alto | Sistemas, procesos, capas, infraestructura |
| 6 | Pixel art / 8 bits | Sprites grandes, paleta limitada, fuente pixelada | Press Start 2P (@fontsource), sprites generados por script (PIL) | Media | Bajo | Gaming, historia de la tecnología, niveles/pasos |
| 7 | Pantalla dividida | Mitad arriba/abajo: "mito vs realidad", antes/después | solo CSS + @remotion/transitions | Baja | Bajo | Comparaciones |
| 8 | Mapa / diagrama animado | Nodos y flechas que se dibujan, cámara que viaja | @remotion/paths, @remotion/shapes, opc. d3-force | Media | Medio | Redes, rutas, flujos de datos |
| 9 | Flashcards | Tarjetas que se dan vuelta con pregunta/respuesta | CSS 3D transform, Poppins | Baja | Bajo | Glosarios, quiz, "sabías que" |
| 10 | UI de app falsa | Pantalla de celular con notificaciones, toggles, dashboards | marco de celular SVG, Inter, opc. @remotion/lottie | Media | Medio | Demos de producto, "así se ve por dentro" |

## Cómo usar los 5 instalados

Cada archivo es un componente mínimo; copiarlo a un `XReel.tsx`, reemplazar los datos por escenas sincronizadas con la voz (`w` de `scripts/explainer.py`) y registrar la composición en `Root.tsx`.

1. **Chat** (`formatos/chat.tsx`, `FmtChat`): prop `msgs=[{yo,txt}]`. Cada mensaje entra cada 20 frames; ajustar al timing de la voz.
2. **Terminal** (`formatos/terminal.tsx`, `FmtTerminal`): prop `lines=[...]`. Velocidad de tipeo = `f*1.2` caracteres.
3. **Cuaderno** (`formatos/cuaderno.tsx`, `FmtCuaderno`): grilla CSS + `Star`/`Triangle` de @remotion/shapes + temblor de papel con `noise2D`. Para trazos dibujados a mano usar `getLength/getPointAtLength` de @remotion/paths como en `pizarronKit.tsx`.
4. **Collage** (`formatos/collage.tsx`, `FmtCollage`): `TransitionSeries` con `slide()`; también hay `fade`, `wipe`, `flip`, `clockWipe` en `@remotion/transitions/*`.
5. **Isométrico** (`formatos/isometrico.tsx`, `FmtIsometrico`): `ThreeCanvas orthographic` (cámara a [10,10,10]). Render caro: usar `--gl=angle`, `--concurrency=2` y probar con stills antes. No poner assets pesados.

Instalado además (sin componente de prueba): `@remotion/lottie` + `lottie-web` (animaciones Lottie JSON, útil para formato 10) y `@remotion/google-fonts` (alternativa a @fontsource; en render offline preferir @fontsource o woff2 en `public/`).

## Versiones instaladas (remotion/package.json)

- `@remotion/transitions`, `shapes`, `noise`, `three`, `lottie`, `google-fonts`: 4.0.530 (misma versión que `remotion`, obligatorio).
- `three@0.169`, `@react-three/fiber@8.17` (fiber 9 exige React 19; el proyecto usa React 18, por eso se fijó 8.x), `@types/three@0.169`, `lottie-web`.
- `@fontsource/inter`, `jetbrains-mono`, `patrick-hand`, `bebas-neue`.
- Para instalar de nuevo: `cd remotion && npm install` (si npm se queja de peers, mantener fiber 8).

## Qué falta para los otros 5

- **Pixel art**: `npm i @fontsource/press-start-2p` + script `scripts/pixel_assets.py` (PIL, sprites escalados con `image-rendering: pixelated`). Difícil solo el arte.
- **Pantalla dividida**: nada que instalar; armar con dos `AbsoluteFill` y `clip-path`.
- **Mapa/diagrama**: ya están `@remotion/paths` y `shapes`; opcional `npm i d3-force` para layouts automáticos.
- **Flashcards**: nada que instalar (CSS 3D); opcional `@fontsource/poppins`.
- **UI app falsa**: marco de celular SVG (crear en `public/`), y opcional descargar Lottie JSONs libres (LottieFiles) a `public/lottie/` para íconos animados.

## Pendiente de verificación en este setup

Los 5 formatos renderizaron un still correctamente (frames de prueba en `work/fmt/`, ignorado de publicación). Nota: en esta máquina el bundling de webpack tarda 1-3 min con three instalado y el primer arranque de Chrome puede dar `Timed out ... connect to the browser`; reintentar. GpsReel sigue renderizando un still con `Root.tsx` modificado (solo se agregó `{FormatosPrueba()}`).
