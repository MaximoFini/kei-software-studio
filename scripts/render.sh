#!/usr/bin/env bash
# Render de una composición de Remotion con Chromium local si existe.
# Uso: bash scripts/render.sh <CompositionId> <salida> [--prores|--draft] [flags extra de remotion]
# Ej.: bash scripts/render.sh KeiCierre out/cierre.mp4              master H.264 (CRF 10, cuadros PNG, bt709)
#      bash scripts/render.sh LandingHero out/hero.mov --prores     master ProRes 422 HQ (para web_export o DaVinci)
#      bash scripts/render.sh LandingHero out/prev.mp4 --draft      preview rápido (mitad de resolución, JPEG)
#      bash scripts/render.sh KeiCierre out/still.png --still --frame=230
set -euo pipefail
COMP="$1"; OUT="$2"; shift 2
# la salida es relativa a donde se ejecuta el comando
mkdir -p "$(dirname "$OUT")"; OUT="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
cd "$(dirname "$0")/../remotion"

BROWSER=()
# Contenedor en la nube de Claude: usar el headless shell preinstalado (no hay descarga de Chrome)
HS=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)
if [[ -n "${HS}" ]]; then
  BROWSER=(--browser-executable="$HS" --chrome-mode=headless-shell)
fi

if [[ "${1:-}" == "--still" ]]; then
  shift
  npx remotion still src/index.ts "$COMP" "$OUT" "${BROWSER[@]}" --image-format=png "$@"
  exit 0
fi

# Cuadros en PNG (Remotion usa JPEG calidad 80 por defecto) y matriz bt709 para que los colores no se corran
QUALITY=(--image-format=png --color-space=bt709)
case "${1:-}" in
  --prores) shift; ENC=(--codec=prores --prores-profile=hq) ;;
  --draft)  shift; QUALITY=(--image-format=jpeg --jpeg-quality=90 --color-space=bt709); ENC=(--crf=20 --x264-preset=veryfast --scale=0.5) ;;
  *)        ENC=(--crf=10 --x264-preset=slow) ;;
esac

npx remotion render src/index.ts "$COMP" "$OUT" "${BROWSER[@]}" \
  "${QUALITY[@]}" "${ENC[@]}" --audio-bitrate=320k "$@"
