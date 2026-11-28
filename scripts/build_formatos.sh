#!/usr/bin/env bash
# Renderiza los reels de los formatos nuevos (chat, terminal, cuaderno, collage, isométrico 3D) a out/reels_fmt/ y los copia a entregables/.
# Uso: bash scripts/build_formatos.sh [autocorrector hash anc hdr nfc]
set -euo pipefail
cd "$(dirname "$0")/.."
declare -A COMP=( [autocorrector]=AutocorrectorReel [hash]=HashReel [anc]=AncReel [hdr]=HdrReel [nfc]=NfcReel )
declare -A NUM=( [autocorrector]=28-como-adivina-tu-celu-lo-que-escribis [hash]=29-como-guarda-tu-contrasena-un-sitio [anc]=30-como-borran-el-ruido-los-auriculares [hdr]=31-por-que-tu-foto-son-varias-fotos [nfc]=32-como-pagas-acercando-el-celu )
IDS=("$@"); [[ ${#IDS[@]} -eq 0 ]] && IDS=(autocorrector hash anc hdr nfc)
mkdir -p out/reels_fmt entregables
for id in "${IDS[@]}"; do
  echo "== $id"
  bash scripts/render.sh "${COMP[$id]}" "out/reels_fmt/$id.mp4" --gl=angle --concurrency=3
  cp "out/reels_fmt/$id.mp4" "entregables/${NUM[$id]}.mp4"
done
