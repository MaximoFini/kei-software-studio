#!/usr/bin/env bash
# Mide cuánta calidad se perdió en un export comparándolo con el master (VMAF de Netflix, 0-100).
#   > 95   indistinguible del master
#   90-95  muy buena, diferencias sólo mirando cuadro a cuadro
#   80-90  se nota en pantallas grandes
#   < 80   pérdida visible
# Si el export tiene otra resolución, se escala al tamaño del master antes de comparar.
# Uso: bash scripts/vmaf.sh master.mp4 export.mp4 [--quiet]
set -euo pipefail
REF="$1"; DIST="$2"; QUIET="${3:-}"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$REF" | tr -d '\r')
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$REF" | tr -d '\r')
THREADS=$(nproc 2>/dev/null || echo 4)
LOG=$(ffmpeg -hide_banner -nostats -i "$DIST" -i "$REF" -filter_complex \
  "[0:v]scale=$W:$H:flags=bicubic,setpts=PTS-STARTPTS,format=yuv420p[d];[1:v]setpts=PTS-STARTPTS,format=yuv420p[r];[d][r]libvmaf=n_threads=$THREADS:n_subsample=2" \
  -f null - 2>&1 | tr -d '\r')
SCORE=$(echo "$LOG" | grep -o "VMAF score: [0-9.]*" | awk '{print $3}')
if [[ "$QUIET" == "--quiet" ]]; then
  echo "$SCORE"
else
  echo "VMAF: $SCORE"
fi
