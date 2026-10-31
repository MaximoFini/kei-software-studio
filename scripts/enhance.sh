#!/usr/bin/env bash
# Mejora de calidad "honesta" con FFmpeg. No inventa detalle: para fondos "barridos" de video IA hace falta
# un upscaler generativo (Topaz Starlight / Krea).
#
# Uso: bash scripts/enhance.sh entrada.mp4 salida.mp4 [opciones]
#   --perfil ia      (por defecto) material comprimido o generado por IA: deblock + denoise + deband + color + nitidez
#   --perfil camara  material limpio de cámara/iPhone (pasarlo antes por ingest.sh): sólo nitidez suave,
#                    sin deblock ni color, para no comerse detalle
#   --denoise        (camara) denoise suave para tomas con poca luz
#   --voz            limpia la voz: pasa-altos 80 Hz + reducción de ruido de fondo (afftdn, o RNNoise con --rnn)
#   --rnn modelo     modelo .rnnn de RNNoise (ver README) en lugar de afftdn
#   --lufs N         loudness objetivo (por defecto -14, el de redes y web)
# Todo se procesa en 10 bits y se baja a 8 bits con dithering al final (evita banding en degradados).
set -euo pipefail
IN="$1"; OUT="$2"; shift 2
PERFIL="ia"; DENOISE=0; VOZ=0; RNN=""; LUFS=-14
while [[ $# -gt 0 ]]; do
  case "$1" in
    --perfil) PERFIL="$2"; shift 2 ;;
    --denoise) DENOISE=1; shift ;;
    --voz) VOZ=1; shift ;;
    --rnn) RNN="$2"; VOZ=1; shift 2 ;;
    --lufs) LUFS="$2"; shift 2 ;;
    *) echo "Opción desconocida: $1" >&2; exit 1 ;;
  esac
done

case "$PERFIL" in
  ia)
    VF="format=yuv420p10le,deblock=filter=weak:block=8,nlmeans=s=1.8:p=7:r=9,deband=1thr=0.015:2thr=0.015:3thr=0.015:blur=1,eq=contrast=1.05:saturation=1.06:gamma=0.98,vibrance=intensity=0.12,cas=strength=0.55"
    ;;
  camara)
    VF="format=yuv420p10le"
    [[ $DENOISE -eq 1 ]] && VF+=",hqdn3d=1.2:1.0:4:3"
    VF+=",cas=strength=0.35"
    ;;
  *) echo "Perfil desconocido: $PERFIL (ia | camara)" >&2; exit 1 ;;
esac
VF+=",format=yuv420p"

# ---- Audio ----
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | head -1 | tr -d '\r')
AF=""
if [[ -n "$HAS_AUDIO" ]]; then
  PRE=""
  if [[ $VOZ -eq 1 ]]; then
    if [[ -n "$RNN" ]]; then
      # arnndn no acepta rutas con ':' (Windows): se pasa relativa al directorio actual
      PRE="highpass=f=80,arnndn=m='$(realpath --relative-to=. "$RNN")',"
    else
      PRE="highpass=f=80,afftdn=nf=-25:tn=1,"
    fi
  fi
  # Loudnorm en dos pasadas: medir y después corregir en modo lineal (sin "bombeo" de volumen)
  M=$(ffmpeg -hide_banner -nostats -i "$IN" -vn -af "${PRE}loudnorm=I=$LUFS:TP=-1:LRA=11:print_format=json" -f null - 2>&1 | tr -d '\r' \
      | awk '/^\{/{j=1} j{print} /^\}/{j=0}')
  get() { echo "$M" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
  AF="${PRE}loudnorm=I=$LUFS:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"
  AENC=(-af "$AF" -c:a aac -b:a 320k -ar 48000)
else
  AENC=()
fi

ffmpeg -v error -stats -stats_period 5 -y -i "$IN" \
  -vf "$VF" \
  -c:v libx264 -preset slow -crf 12 -profile:v high -tune film -x264-params aq-mode=3 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  "${AENC[@]}" -movflags +faststart "$OUT"
echo "OK -> $OUT"
