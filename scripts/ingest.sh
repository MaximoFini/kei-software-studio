#!/usr/bin/env bash
# Prepara material de cámara (iPhone u otro celular) para editar sin perder calidad.
#  - Reporte: códec, resolución, fps, rotación, HDR, audio.
#  - HDR (HLG / Dolby Vision / PQ) -> SDR bt709 con tone mapping (libplacebo en GPU; si no hay, zscale en CPU).
#  - Frame rate fijo (el iPhone graba con fps variable) y rotación aplicada.
#  - Opcional: estabilización (vidstab, 2 pasadas) y escalado/recorte a un formato.
# Salida por defecto: H.264 8-bit CRF 10 bt709 (lo lee Remotion con OffthreadVideo).
# Con --prores: ProRes 422 HQ 10-bit (para DaVinci/Premiere; pesa mucho más).
#
# Uso: bash scripts/ingest.sh <entrada> [salida] [opciones]
#   --fps N          fps de salida (por defecto el estándar más cercano al original: 24/25/30/50/60)
#   --fit WxH        escala y recorta al centro para llenar WxH (ej. 1920x1080, 1080x1920, 1080x1350)
#   --stab           estabiliza (para tomas a mano)
#   --prores         ProRes 422 HQ .mov en lugar de H.264
#   --tonemap cpu    fuerza zscale (si libplacebo da colores raros o falla)
#   --report         sólo muestra el reporte, no convierte
# Ej.: bash scripts/ingest.sh input/IMG_1234.MOV
#      bash scripts/ingest.sh input/IMG_1234.MOV work/hero.mp4 --fit 1920x1080 --stab
set -euo pipefail

IN="${1:?Uso: bash scripts/ingest.sh <entrada> [salida] [opciones]}"; shift
OUT=""
if [[ $# -gt 0 && "$1" != --* ]]; then OUT="$1"; shift; fi
FPS=""; FIT=""; STAB=0; PRORES=0; TM="auto"; REPORT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --fps) FPS="$2"; shift 2 ;;
    --fit) FIT="$2"; shift 2 ;;
    --stab) STAB=1; shift ;;
    --prores) PRORES=1; shift ;;
    --tonemap) TM="$2"; shift 2 ;;
    --report) REPORT=1; shift ;;
    *) echo "Opción desconocida: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="$(basename "${IN%.*}")"
if [[ -z "$OUT" ]]; then
  if [[ $PRORES -eq 1 ]]; then OUT="$ROOT/work/$NAME.mov"; else OUT="$ROOT/work/$NAME.mp4"; fi
fi
mkdir -p "$(dirname "$OUT")"

probe() { ffprobe -v error -select_streams "$1" -show_entries "$2" -of default=nw=1:nk=1 "$IN" | tr -d '\r' | head -1; }

CODEC=$(probe v:0 stream=codec_name)
W=$(probe v:0 stream=width); H=$(probe v:0 stream=height)
PIX=$(probe v:0 stream=pix_fmt)
TRC=$(probe v:0 stream=color_transfer); PRIM=$(probe v:0 stream=color_primaries)
RFR=$(probe v:0 stream=r_frame_rate); AFR=$(probe v:0 stream=avg_frame_rate)
ROT=$(ffprobe -v error -select_streams v:0 -show_entries stream_side_data=rotation -of default=nw=1:nk=1 "$IN" | tr -d '\r' | head -1)
DV=$(ffprobe -v error -select_streams v:0 -show_entries stream_side_data=dv_profile -of default=nw=1:nk=1 "$IN" | tr -d '\r' | head -1)
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN" | tr -d '\r')
ACODEC=$(probe a:0 stream=codec_name || true)
ARATE=$(probe a:0 stream=sample_rate || true)

case "$TRC" in
  arib-std-b67) HDR="HLG" ;;
  smpte2084) HDR="PQ (HDR10)" ;;
  *) HDR="" ;;
esac
[[ -n "$DV" && -n "$HDR" ]] && HDR="$HDR + Dolby Vision (perfil $DV)"

# fps estándar más cercano al promedio real
fps_float=$(awk -v f="$AFR" 'BEGIN{split(f,a,"/"); if (a[2]==0||a[2]=="") a[2]=1; printf "%.3f", a[1]/a[2]}')
if [[ -z "$FPS" ]]; then
  FPS=$(awk -v f="$fps_float" 'BEGIN{n=split("23.976 24 25 29.97 30 50 59.94 60",s," "); b=s[1]; for(i=1;i<=n;i++){d=f-s[i]; if(d<0)d=-d; if(d<bd||i==1){bd=d;b=s[i]}} print b}')
  case "$FPS" in 23.976) FPS=24000/1001 ;; 29.97) FPS=30000/1001 ;; 59.94) FPS=60000/1001 ;; esac
fi

echo "== $IN"
echo "   video : $CODEC ${W}x${H} $PIX  rotación: ${ROT:-0}"
echo "   fps   : nominal $RFR, promedio $fps_float -> salida $FPS (fijo)"
echo "   color : ${PRIM:-?} / ${TRC:-?}  ${HDR:+-> HDR: $HDR}"
echo "   audio : ${ACODEC:-sin audio} ${ARATE:+$ARATE Hz}"
echo "   dur.  : ${DUR}s"
[[ $REPORT -eq 1 ]] && exit 0

# ---- Cadena de filtros ----
VF=()
if [[ -n "$HDR" ]]; then
  if [[ "$TM" == "auto" ]] && ffmpeg -v error -init_hw_device vulkan -f lavfi -i "color=c=gray:s=64x64:d=0.1" \
       -vf "libplacebo=format=yuv420p" -f null - >/dev/null 2>&1; then
    TM="gpu"
  else
    TM="cpu"
  fi
  if [[ "$TM" == "gpu" ]]; then
    # BT.2390 con detección de pico por escena: el mejor tone mapping disponible en FFmpeg
    VF+=("libplacebo=tonemapping=bt.2390:peak_detect=1:colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv:format=yuv420p10le")
    HW=(-init_hw_device vulkan)
  else
    VF+=("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv:dither=error_diffusion,format=yuv420p10le")
    HW=()
  fi
  echo "   tone mapping: $TM"
else
  HW=()
  # SDR: sólo asegurar matriz bt709 (algunos celulares etiquetan bt601)
  VF+=("scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p10le")
fi

VF+=("fps=$FPS")

if [[ -n "$FIT" ]]; then
  FW="${FIT%x*}"; FH="${FIT#*x}"
  VF+=("scale=${FW}:${FH}:force_original_aspect_ratio=increase:flags=lanczos+accurate_rnd+full_chroma_int,crop=${FW}:${FH}")
fi

ABS_IN="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
ABS_OUT="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
TMP="$ROOT/work/.ingest_$NAME"; mkdir -p "$TMP"
if [[ $STAB -eq 1 ]]; then
  echo "   estabilizando (pasada 1/2)..."
  # vidstab necesita la ruta relativa (los ':' de Windows rompen el parser de filtros)
  ( cd "$TMP" && ffmpeg -v error -y "${HW[@]}" -i "$ABS_IN" -vf "$(IFS=,; echo "${VF[*]}"),vidstabdetect=shakiness=5:accuracy=15:result=transforms.trf" -f null - )
  VF+=("vidstabtransform=input=transforms.trf:smoothing=20:optzoom=1:interpol=bicubic,unsharp=5:5:0.25:3:3:0")
fi

if [[ $PRORES -eq 1 ]]; then
  VF+=("format=yuv422p10le")
  VENC=(-c:v prores_ks -profile:v 3 -vendor apl0 -bits_per_mb 8000)
  AENC=(-c:a pcm_s16le -ar 48000)
else
  VF+=("format=yuv420p")
  VENC=(-c:v libx264 -preset slow -crf 10 -profile:v high -x264-params "aq-mode=3:deblock=-1,-1")
  if [[ "$ACODEC" == "aac" ]]; then AENC=(-c:a copy); else AENC=(-c:a aac -b:a 320k -ar 48000); fi
fi

echo "   convirtiendo -> $OUT"
( cd "$TMP" && ffmpeg -v error -stats -stats_period 5 -y "${HW[@]}" -i "$ABS_IN" -map 0:v:0 -map "0:a:0?" \
    -vf "$(IFS=,; echo "${VF[*]}")" -fps_mode cfr \
    "${VENC[@]}" -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    "${AENC[@]}" -map_metadata -1 -movflags +faststart "$ABS_OUT" )
rm -rf "$TMP"
echo "OK -> $OUT"
