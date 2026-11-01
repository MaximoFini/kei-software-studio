#!/usr/bin/env bash
# Música de fondo del reel QrExplainer: "Long Day" de PurrpleCat (Pixabay, licencia Pixabay, sin Content ID
# al 2026-11-01). Arranca en el primer tiempo del beat, queda bien por debajo de la voz (-25 LUFS; ~-32 mientras habla, unos 18 dB debajo de la voz) y baja
# otros ~7 dB cuando habla (sidechain con remotion/public/qr_voz.wav). Fade de entrada y de salida.
# Salida: remotion/public/qr_musica.wav (no se sube al repo: es de terceros).
# Uso: bash scripts/qr_musica.sh [duración_s]   (por defecto, la del video: 49.95)
set -euo pipefail
cd "$(dirname "$0")/.."
DUR="${1:-49.95}"
OFF=20.2  # entra el beat
SRC=work/musica/qr/long-day_purrplecat.mp3
URL="https://cdn.pixabay.com/download/audio/2026/04/24/audio_c8a99a93d5.mp3?filename=purrplecat-long-day-518602.mp3"
if [[ ! -f "$SRC" ]]; then
  mkdir -p "$(dirname "$SRC")"
  curl -sL -A "Mozilla/5.0" -e "https://pixabay.com/" -o "$SRC" "$URL"
fi
FADE_OUT=$(awk -v d="$DUR" 'BEGIN{print d-2.5}')
ffmpeg -v error -y -ss "$OFF" -t "$DUR" -i "$SRC" -i remotion/public/qr_voz.wav -filter_complex "
[0:a]aresample=48000,loudnorm=I=-25:TP=-6:LRA=11,afade=t=in:d=0.8,afade=t=out:st=$FADE_OUT:d=2.5[m];
[1:a]aresample=48000,aformat=channel_layouts=stereo,apad[k];
[m][k]sidechaincompress=threshold=0.05:ratio=3:attack=60:release=700:makeup=1[out]" \
  -map "[out]" -t "$DUR" -ar 48000 -ac 2 remotion/public/qr_musica.wav
echo "OK -> remotion/public/qr_musica.wav"
