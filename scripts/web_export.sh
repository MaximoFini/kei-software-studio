#!/usr/bin/env bash
# Exporta un master (de render.sh o ingest.sh) a los formatos para una landing page.
# Genera en out/web/<nombre>/:
#   <nombre>-1080.mp4 / -720.mp4      H.264, lo reproduce cualquier navegador
#   <nombre>-1080.av1.mp4 / -720...   AV1 10-bit: misma calidad con ~40-50 % menos peso (Chrome, Firefox, Edge, Safari reciente)
#   poster.webp / poster.jpg          primer cuadro, para que no haya pantalla en negro mientras carga
#   snippet.html                      <video> listo para pegar
# Las resoluciones se toman sobre el lado corto (sirve para 16:9, 9:16 y 4:5); nunca se agranda la fuente.
#
# Uso: bash scripts/web_export.sh master.mp4 [nombre] [opciones]
#   --mute         sin audio (para videos de fondo/hero: el autoplay sólo funciona en silencio)
#   --loop S       loop sin corte: funde los últimos S segundos con el inicio (implica --mute)
#   --tiers "1080 720"   resoluciones a generar (lado corto)
#   --check        mide la calidad de cada versión contra el master con VMAF (lento)
set -euo pipefail
IN="${1:?Uso: bash scripts/web_export.sh master.mp4 [nombre] [opciones]}"; shift
NAME="$(basename "${IN%.*}")"
if [[ $# -gt 0 && "$1" != --* ]]; then NAME="$1"; shift; fi
MUTE=0; LOOP=""; TIERS="1080 720"; CHECK=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mute) MUTE=1; shift ;;
    --loop) LOOP="$2"; MUTE=1; shift 2 ;;
    --tiers) TIERS="$2"; shift 2 ;;
    --check) CHECK=1; shift ;;
    *) echo "Opción desconocida: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export SVT_LOG=1  # SVT-AV1: sólo errores
DEST="$ROOT/out/web/$NAME"; mkdir -p "$DEST"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$IN" | tr -d '\r')
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$IN" | tr -d '\r')
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN" | tr -d '\r')
SHORT=$(( W < H ? W : H ))
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | head -1 | tr -d '\r')
[[ -z "$HAS_AUDIO" ]] && MUTE=1

# Base: loop opcional. Se trabaja sobre la fuente en 10 bits para no generar banding al escalar.
if [[ -n "$LOOP" ]]; then
  OFF=$(awk -v d="$DUR" -v f="$LOOP" 'BEGIN{printf "%.3f", d-2*f}')
  BASE="[0:v]split[a][b];[a]trim=start=$LOOP,setpts=PTS-STARTPTS[main];[b]trim=end=$LOOP,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=$LOOP:offset=$OFF,format=yuv420p10le"
else
  BASE="[0:v]format=yuv420p10le"
fi

if [[ $MUTE -eq 1 ]]; then A_H264=(-an); A_AV1=(-an); else
  A_H264=(-map 0:a:0 -c:a aac -b:a 160k -ar 48000); A_AV1=(-map 0:a:0 -c:a libopus -b:a 128k); fi

POSTER_SRC=""
FILES=()
for T in $TIERS; do
  (( T > SHORT )) && { echo "   salteo ${T}p (la fuente tiene ${SHORT}p)"; continue; }
  if (( W <= H )); then SC="scale=$T:-2"; else SC="scale=-2:$T"; fi
  SC="$SC:flags=lanczos+accurate_rnd+full_chroma_int"
  [[ -z "$POSTER_SRC" ]] && POSTER_SRC="$DEST/$NAME-$T.mp4"

  echo "== ${T}p H.264"
  ffmpeg -v error -stats -stats_period 5 -y -i "$IN" -filter_complex "$BASE,$SC,format=yuv420p[v]" -map "[v]" \
    -c:v libx264 -preset slow -crf 20 -profile:v high -tune film -x264-params aq-mode=3 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    "${A_H264[@]}" -map_metadata -1 -movflags +faststart "$DEST/$NAME-$T.mp4"

  echo "== ${T}p AV1"
  ffmpeg -v error -stats -stats_period 5 -y -i "$IN" -filter_complex "$BASE,$SC,format=yuv420p10le[v]" -map "[v]" \
    -c:v libsvtav1 -preset 4 -crf 30 -svtav1-params tune=0:enable-overlays=1:scd=1 -g 240 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    "${A_AV1[@]}" -map_metadata -1 -movflags +faststart "$DEST/$NAME-$T.av1.mp4"
  FILES+=("$T")
done

# Poster: primer cuadro de la versión más grande (coincide exacto con el inicio del video)
ffmpeg -v error -y -i "$POSTER_SRC" -frames:v 1 -c:v libwebp -quality 85 "$DEST/poster.webp"
ffmpeg -v error -y -i "$POSTER_SRC" -frames:v 1 -q:v 3 "$DEST/poster.jpg"

# Snippet HTML: AV1 primero (si el navegador no lo soporta pasa a H.264); 720p en pantallas chicas
BIG="${FILES[0]}"; SMALL="${FILES[${#FILES[@]}-1]}"
if [[ $MUTE -eq 1 ]]; then ATTR='autoplay muted loop playsinline'; else ATTR='controls playsinline'; fi
{
  echo "<video $ATTR preload=\"metadata\" poster=\"poster.webp\" width=\"$W\" height=\"$H\" style=\"width:100%;height:auto\">"
  if [[ "$SMALL" != "$BIG" ]]; then
    echo "  <source src=\"$NAME-$SMALL.av1.mp4\" type='video/mp4; codecs=\"av01.0.08M.10\"' media=\"(max-width: 768px)\">"
    echo "  <source src=\"$NAME-$SMALL.mp4\" type=\"video/mp4\" media=\"(max-width: 768px)\">"
  fi
  echo "  <source src=\"$NAME-$BIG.av1.mp4\" type='video/mp4; codecs=\"av01.0.08M.10\"'>"
  echo "  <source src=\"$NAME-$BIG.mp4\" type=\"video/mp4\">"
  echo "</video>"
} > "$DEST/snippet.html"

echo
echo "Archivos en $DEST:"
( cd "$DEST" && for f in *; do printf "   %-28s %8s\n" "$f" "$(du -h "$f" | cut -f1)"; done )

if [[ $CHECK -eq 1 && -z "$LOOP" ]]; then
  echo; echo "Calidad (VMAF contra el master; >95 = indistinguible, 90-95 = muy buena):"
  for T in "${FILES[@]}"; do
    for f in "$NAME-$T.mp4" "$NAME-$T.av1.mp4"; do
      printf "   %-28s %s\n" "$f" "$(bash "$ROOT/scripts/vmaf.sh" "$IN" "$DEST/$f" --quiet)"
    done
  done
fi
