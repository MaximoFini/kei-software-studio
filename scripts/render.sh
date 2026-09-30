#!/usr/bin/env bash
# Render de una composición de Remotion con Chromium local si existe.
# Uso: bash scripts/render.sh <CompositionId> <salida.mp4> [flags extra de remotion]
# Ej.: bash scripts/render.sh KeiCierre out/cierre.mp4
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
  npx remotion still src/index.ts "$COMP" "$OUT" "${BROWSER[@]}" "$@"
else
  npx remotion render src/index.ts "$COMP" "$OUT" "${BROWSER[@]}" \
    --crf=10 --x264-preset=slow --audio-bitrate=320k "$@"
fi
