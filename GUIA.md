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
