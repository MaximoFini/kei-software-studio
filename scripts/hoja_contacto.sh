#!/usr/bin/env bash
# Hoja de contacto de un video: bash scripts/hoja_contacto.sh video.mp4 salida.jpg [cada_seg=2] [columnas=5] [ancho=300] [desde=0] [hasta]
V="$1"; O="$2"; E="${3:-2}"; COLS="${4:-5}"; W="${5:-300}"; SS="${6:-0}"; TT="${7:-}"
N=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V" | awk -v e="$E" -v s="$SS" -v t="$TT" '{d=(t==""?$1:t)-s; printf "%d", d/e}')
ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -ss "$SS" -i "$V" ${TT:+-t $(awk -v s=$SS -v t=$TT 'BEGIN{print t-s}')} -vf "fps=1/$E,scale=$W:-1,tile=${COLS}x${ROWS}" -frames:v 1 "$O"
