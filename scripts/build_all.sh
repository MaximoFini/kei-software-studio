#!/usr/bin/env bash
# Vuelve a renderizar los 4 videos a partir del proyecto de Remotion (assets en remotion/public).
# Uso:  bash scripts/build_all.sh            (todos)
#       bash scripts/build_all.sh 2          (sólo el video 2)
# Salida: out/  (en la raíz del repo)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"; mkdir -p "$OUT"
PUB="$ROOT/remotion/public"
ONLY="${1:-all}"
run() { [[ "$ONLY" == "all" || "$ONLY" == "$1" ]]; }
render() { bash "$ROOT/scripts/render.sh" "$@"; }

# 0 · Cierre animado (4 s)
if run 0; then
  render KeiCierre "$OUT/00-cierre-animado.mp4"
fi

# 1 · Logo reveal + push-in al cartel + cierre (usa public/reel_1080.mp4, ya con el logo KEI)
if run 1; then
  render ReelConCierre "$OUT/01-logo-reveal-con-cierre.mp4"
fi

# 2 · "Llegamos a Instagram" (motion graphics) + música extendida + whoosh
if run 2; then
  render GameReel "$OUT/_02_video.mp4" --muted
  ffmpeg -v error -y -i "$OUT/_02_video.mp4" -i "$PUB/llegamos_music_ext.wav" -i "$PUB/whoosh.wav" \
    -filter_complex "[2:a]adelay=10600|10600,volume=0.75[w];[1:a][w]amix=inputs=2:normalize=0:duration=first[m]" \
    -map 0:v -map "[m]" -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT/02-llegamos-a-instagram.mp4"
  rm -f "$OUT/_02_video.mp4"
fi

# 3 · "Automatizá tu negocio con IA" (usa public/office_comp.mp4, pantallas ya reemplazadas) + música + whoosh
if run 3; then
  render OfficeReel "$OUT/_03_video.mp4" --muted
  ffmpeg -v error -y -i "$OUT/_03_video.mp4" -i "$PUB/automatiza_music_ext.wav" -i "$PUB/whoosh.wav" \
    -filter_complex "[2:a]adelay=7630|7630,volume=0.75[w];[1:a][w]amix=inputs=2:normalize=0:duration=first[m]" \
    -map 0:v -map "[m]" -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT/03-automatiza-con-ia.mp4"
  rm -f "$OUT/_03_video.mp4"
fi

echo "Listo -> $OUT"
