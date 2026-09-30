#!/usr/bin/env bash
# Mejora de calidad "honesta" con FFmpeg: deblock + denoise suave + deband + color + nitidez + audio a -14 LUFS.
# No inventa detalle: para fondos "barridos" de video IA hace falta un upscaler generativo (Topaz Starlight / Krea).
# Uso: bash scripts/enhance.sh entrada.mp4 salida.mp4
set -euo pipefail
IN="$1"; OUT="$2"
ffmpeg -v error -y -i "$IN" \
  -vf "deblock=filter=weak:block=8,nlmeans=s=1.8:p=7:r=9,deband=1thr=0.015:2thr=0.015:3thr=0.015:blur=1,eq=contrast=1.05:saturation=1.06:gamma=0.98,vibrance=intensity=0.12,cas=strength=0.55,unsharp=5:5:0.35:5:5:0,format=yuv420p" \
  -c:v libx264 -preset slow -crf 14 -profile:v high -tune film -x264-params aq-mode=3 \
  -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 256k -ar 48000 \
  -movflags +faststart "$OUT"
echo "OK -> $OUT"
