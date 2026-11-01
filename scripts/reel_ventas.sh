#!/usr/bin/env bash
# Reel de ventas "Una web linda no alcanza": 5 tomas de landings filmadas (OG Circle, AgroSync, web KEI)
# con titulares arriba del monitor, cortes en los acentos de la música (cada 3,2 s) y el cierre KEI.
#
# Necesita:
#   work/reels/IMG_5421|5425|5431.mp4   tomas ingeridas (scripts/ingest.sh, 1440x2560 30 fps)
#   work/vt/cierre.mp4                  bash scripts/render.sh KeiCierre work/vt/cierre.mp4
#   work/musica/epic-motivation_kulakovka.mp3
# Salida: entregables/04-tu-web-vende.mp4 (1080x1920, 30 fps, H.264 CRF 17 / máx. 12 Mbps, AAC 320k, -14 LUFS)
#
# Uso: bash scripts/reel_ventas.sh [--draft]   (--draft: preview rápido a 540x960)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
W=work/vt; mkdir -p "$W"
DRAFT=0; [[ "${1:-}" == "--draft" ]] && DRAFT=1
FONT=brand/fonts/ffmpeg/glacial-kei-bold.ttf
MUSIC=work/musica/epic-motivation_kulakovka.mp3
OUT=entregables/04-tu-web-vende.mp4; [[ $DRAFT -eq 1 ]] && OUT=$W/preview.mp4

# Tomas: fuente | inicio (s) | cuadros | línea 1 (blanco) | línea 2 (azul UI) | línea 3 (opcional, chica)
# Glacial Indifference no tiene "¿" ni "¡": los titulares van sin signos de apertura (afirmaciones).
# Los cortes caen en 3,23 / 6,43 / 9,63 / 12,83 / 16,03 s, los acentos fuertes del tema (150 BPM, cada 8 tiempos).
TOMAS=(
  "IMG_5421|0.0|97|Una web linda|no alcanza.|"
  "IMG_5421|22.4|96|Landings que convierten|visitas en ventas.|"
  "IMG_5431|0.2|96|Apps y sistemas|a medida.|"
  "IMG_5425|6.0|96|Diseño y desarrollo,|de punta a punta.|"
  "IMG_5425|12.6|96|Contanos tu proyecto.|Escribinos por DM.|@keisoftware"
)
CIERRE_IN=15.83   # el cierre entra con un fundido de 0,4 s centrado en el último corte
XF=0.4

# Texto: aparece con fundido y sube 24 px en 0,35 s (t es el tiempo dentro de cada toma)
txt() { # archivo tamaño color y retardo
  local a="if(lt(t,$5),0,min(1,(t-$5)/0.35))"
  printf "drawtext=fontfile=%s:textfile=%s:fontsize=%s:fontcolor=%s:x=(w-text_w)/2:y='%s+24*(1-%s)':alpha='%s'" \
    "$FONT" "$1" "$2" "$3" "$4" "$a" "$a"
}

i=0; LIST=()
for T in "${TOMAS[@]}"; do
  IFS='|' read -r SRC SS N L1 L2 L3 <<< "$T"
  printf '%s' "$L1" > "$W/t${i}a.txt"; printf '%s' "$L2" > "$W/t${i}b.txt"
  VF="zoompan=z='1+0.045*on/$N':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30"
  VF="$VF,$(txt "$W/t${i}a.txt" 84 white 480 0.08),$(txt "$W/t${i}b.txt" 84 0x3F7DFF 582 0.2)"
  if [[ -n "$L3" ]]; then
    printf '%s' "$L3" > "$W/t${i}c.txt"
    VF="$VF,$(txt "$W/t${i}c.txt" 54 0xDFE8FD 720 0.45)"
  fi
  ffmpeg -v error -y -ss "$SS" -i "work/reels/$SRC.mp4" -frames:v "$N" -vf "$VF,format=yuv420p" -an \
    -c:v libx264 -preset medium -crf 10 "$W/toma$i.mp4"
  LIST+=("toma$i.mp4"); i=$((i+1))
done
printf "file '%s'\n" "${LIST[@]}" > "$W/tomas.txt"  # rutas relativas a la lista (FFmpeg en Windows no entiende /c/...)

# Cuerpo + logo KEI arriba + fundido al cierre (se saltea su primer 0,3 s, que es sólo fondo)
ffmpeg -v error -y -f concat -safe 0 -i "$W/tomas.txt" -loop 1 -i brand/derived/kei_horizontal_dark.png \
  -ss 0.3 -i "$W/cierre.mp4" -filter_complex "
    [1:v]scale=300:-1,format=rgba[logo];
    [0:v][logo]overlay=(W-w)/2:150:shortest=1,fps=30,settb=1/30,setsar=1,format=yuv420p[body];
    [2:v]fps=30,settb=1/30,scale=1080:1920,setsar=1,format=yuv420p[cie];
    [body][cie]xfade=transition=fade:duration=$XF:offset=$CIERRE_IN[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 10 "$W/video.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$W/video.mp4" | tr -d '\r')

# Audio: música desde el principio + whoosh en la entrada del cierre, fade final, -14 LUFS en dos pasadas
WH=$(awk -v t=$CIERRE_IN 'BEGIN{printf "%d", (t-0.08)*1000}')
FADE=$(awk -v d=$DUR 'BEGIN{printf "%.2f", d-1.5}')
MIX="[0:a]atrim=0:$DUR,afade=t=out:st=$FADE:d=1.5[m];[1:a]adelay=$WH|$WH,volume=0.75[w];[m][w]amix=inputs=2:normalize=0:duration=first"
ffmpeg -v error -y -i "$MUSIC" -i remotion/public/whoosh.wav -filter_complex "$MIX[a]" -map "[a]" -ar 48000 "$W/mix.wav"
LN=$(ffmpeg -hide_banner -i "$W/mix.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$LN" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
AF="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"

if [[ $DRAFT -eq 1 ]]; then VENC=(-vf scale=540:960 -c:v libx264 -preset veryfast -crf 23); else
  # Entrega para Instagram (lo recomprime igual): CRF 17 con tope de 12 Mbps para no subir ~60 MB al repo
  VENC=(-c:v libx264 -preset slow -crf 17 -maxrate 12M -bufsize 24M -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv); fi
ffmpeg -v error -y -i "$W/video.mp4" -i "$W/mix.wav" -map 0:v -map 1:a "${VENC[@]}" -pix_fmt yuv420p \
  -af "$AF" -ar 48000 -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "Listo: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" | tr -d '\r') s)"
