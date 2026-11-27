#!/usr/bin/env bash
# Renderiza los reels en formato pizarrón (master H.264 CRF 10, 30 fps) a out/reels_pz/ y los copia a entregables/.
# Uso: bash scripts/build_pizarron.sh [gps tactil shazam bateria wifi]
set -euo pipefail
cd "$(dirname "$0")/.."
declare -A COMP=( [gps]=GpsReel [tactil]=TactilReel [shazam]=ShazamReel [bateria]=BateriaReel [wifi]=WifiReel )
declare -A NUM=( [gps]=23-como-sabe-el-gps-donde-estas [tactil]=24-como-sabe-la-pantalla-donde-tocaste [shazam]=25-como-reconoce-shazam-una-cancion [bateria]=26-por-que-el-final-de-la-carga-tarda-tanto [wifi]=27-por-que-el-microondas-corta-el-wifi )
IDS=("$@"); [[ ${#IDS[@]} -eq 0 ]] && IDS=(gps tactil shazam bateria wifi)
mkdir -p out/reels_pz entregables
for id in "${IDS[@]}"; do
  echo "== $id"
  bash scripts/render.sh "${COMP[$id]}" "out/reels_pz/$id.mp4"
  cp "out/reels_pz/$id.mp4" "entregables/${NUM[$id]}.mp4"
done
