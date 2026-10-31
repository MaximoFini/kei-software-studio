#!/usr/bin/env bash
# Subtítulos automáticos con Whisper (whisper.cpp integrado en FFmpeg 8).
# Genera <salida>.srt y <salida>.vtt (el .vtt va en <track> del <video> de la landing).
# Opcional: quema los subtítulos en el video con la tipografía de marca.
# La primera vez descarga el modelo a models/ (~470 MB para "small", el mejor equilibrio para español en esta PC).
# REVISÁ SIEMPRE el texto antes de publicar: nombres propios y términos técnicos pueden salir mal.
#
# Uso: bash scripts/captions.sh video.mp4 [opciones]
#   --modelo base|small|medium   (por defecto small; medium es más preciso pero ~3x más lento)
#   --idioma es                  (por defecto es; "auto" para detectar)
#   --quemar salida.mp4          además genera el video con los subtítulos grabados
set -euo pipefail
IN="${1:?Uso: bash scripts/captions.sh video.mp4 [opciones]}"; shift
MODELO="small"; IDIOMA="es"; QUEMAR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --modelo) MODELO="$2"; shift 2 ;;
    --idioma) IDIOMA="$2"; shift 2 ;;
    --quemar) QUEMAR="$2"; shift 2 ;;
    *) echo "Opción desconocida: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL="$ROOT/models/ggml-$MODELO.bin"
if [[ ! -f "$MODEL" ]]; then
  echo "Descargando modelo whisper '$MODELO' (una sola vez)..."
  mkdir -p "$ROOT/models"
  curl -fsSL -o "$MODEL.part" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-$MODELO.bin"
  mv "$MODEL.part" "$MODEL"
fi

ABS_IN="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
BASE="${ABS_IN%.*}"
# Los filtros de FFmpeg no aceptan rutas con "C:" -> se trabaja con rutas relativas desde la raíz del repo
cd "$ROOT"
REL_SRT="$(realpath --relative-to=. "$BASE.srt")"
echo "Transcribiendo ($MODELO, $IDIOMA)..."
rm -f "$BASE.srt"
ffmpeg -v error -nostats -y -i "$ABS_IN" -vn \
  -af "aresample=16000,whisper=model=models/ggml-$MODELO.bin:language=$IDIOMA:queue=10:use_gpu=false:max_len=42:format=srt:destination=$REL_SRT" \
  -f null -
# whisper numera desde 0; algunos reproductores esperan 1
awk 'BEGIN{n=0} /^[0-9]+\r?$/ && (prev=="" || NR==1){print ++n; prev=$0; next} {print; prev=$0}' "$BASE.srt" > "$BASE.srt.tmp" && mv "$BASE.srt.tmp" "$BASE.srt"
ffmpeg -v error -y -i "$BASE.srt" "$BASE.vtt"
echo "OK -> $BASE.srt"
echo "OK -> $BASE.vtt"

if [[ -n "$QUEMAR" ]]; then
  mkdir -p "$(dirname "$QUEMAR")"
  ABS_OUT="$(cd "$(dirname "$QUEMAR")" && pwd)/$(basename "$QUEMAR")"
  # Quemado rápido con Arial: los TTF de Glacial tienen la tabla de nombres dañada y libass no los encuentra.
  # Para subtítulos con tipografía de marca usar la prop "srt" de las composiciones Landing* en Remotion.
  STYLE="FontName=Arial,Bold=1,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H00140702,BorderStyle=1,Outline=1.6,Shadow=0,MarginV=40"
  ffmpeg -v error -stats -stats_period 5 -y -i "$ABS_IN" \
    -vf "subtitles=$REL_SRT:fontsdir=brand/fonts:force_style='$STYLE'" \
    -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -c:a copy -movflags +faststart "$ABS_OUT"
  echo "OK -> $QUEMAR"
fi
