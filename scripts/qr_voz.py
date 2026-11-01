"""Voz en off del reel "¿Cómo funciona un QR?" (composición QrExplainer).

Genera cada escena por separado con una voz neuronal de Microsoft (edge-tts, la misma familia de voces
que usan los "texto a voz" de las apps), las une con pausas fijas y guarda:
  remotion/public/qr_voz.wav    voz completa (48 kHz, normalizada a -14 LUFS en dos pasadas)
  remotion/src/qrVoz.json       inicio/fin de cada escena y de cada palabra (para animación y subtítulos)

Uso (no hace falta instalar nada en .venv; uv baja edge-tts a una caché):
  uv run --python 3.11 --with edge-tts python scripts/qr_voz.py [--voz es-AR-ElenaNeural] [--rate +20%]
"""
import argparse, asyncio, json, os, subprocess, tempfile
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Una entrada por escena: el id lo usa QrExplainer.tsx para sincronizar la animación
GUION = [
    ("hook", "¿Cómo hace tu celular para leer un QR en menos de un segundo?"),
    ("bar", "Ella es Sofi. Llega a un bar, pide la carta, y le señalan esto."),
    ("mensaje", "Parece un dibujo, pero es un mensaje escrito con cuadraditos."),
    ("bits", "Cada cuadradito negro es un uno, y cada blanco, un cero. Combinados, forman letras: la dirección de la carta."),
    ("esquinas", "Los tres cuadrados grandes le muestran a la cámara dónde está el código y cómo está girado. Por eso funciona aunque lo apuntes torcido."),
    ("lectura", "La cámara lo encuentra, lo endereza, lo lee fila por fila, y listo: se abre la carta."),
    ("mancha", "Y lo más loco: aunque se manche o le falte un pedazo, sigue funcionando. Trae información de respaldo: puede perder hasta un treinta por ciento."),
    ("origen", "Lo inventaron en Japón, en 1994, para seguir piezas de autos."),
    ("cta", "Seguinos para entender la tecnología de todos los días."),
]
PAUSA = 0.16  # segundos de silencio entre escenas
SR = 48000


async def tts(texto, voz, rate, mp3):
    com = edge_tts.Communicate(texto, voz, rate=rate, boundary="WordBoundary")
    palabras = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                ini = ch["offset"] / 1e7
                palabras.append({"w": ch["text"], "s": round(ini, 3), "e": round(ini + ch["duration"] / 1e7, 3)})
    return palabras


def dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voz", default="es-AR-ElenaNeural")
    ap.add_argument("--rate", default="+20%")
    a = ap.parse_args()

    tmp = tempfile.mkdtemp()
    escenas, lista, t = [], [], 0.0
    for i, (sid, texto) in enumerate(GUION):
        mp3 = os.path.join(tmp, f"{i:02d}.mp3")
        palabras = asyncio.run(tts(texto, a.voz, a.rate, mp3))
        wav = os.path.join(tmp, f"{i:02d}.wav")
        # Recorta el silencio del final que agrega el TTS; deja la pausa fija entre escenas
        fin = palabras[-1]["e"] + 0.12
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", str(SR), "-ac", "1",
                        "-af", f"atrim=0:{fin:.3f},afade=t=out:st={fin - 0.05:.3f}:d=0.05,apad=pad_dur={PAUSA}", wav], check=True)
        d = dur(wav)
        escenas.append({"id": sid, "texto": texto, "s": round(t, 3), "e": round(t + fin, 3),
                        "palabras": [{**p, "s": round(p["s"] + t, 3), "e": round(p["e"] + t, 3)} for p in palabras]})
        lista.append(wav)
        t += d

    concat = os.path.join(tmp, "lista.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{p}'\n" for p in lista)
    crudo = os.path.join(tmp, "voz.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", crudo], check=True)

    # Loudness en dos pasadas a -14 LUFS (pico -1,5 dBTP)
    med = subprocess.run(["ffmpeg", "-hide_banner", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(med[med.rfind("{"): med.rfind("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    out = os.path.join(ROOT, "remotion", "public", "qr_voz.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", crudo, "-af", ln, "-ar", str(SR), out], check=True)

    with open(os.path.join(ROOT, "remotion", "src", "qrVoz.json"), "w", encoding="utf-8") as f:
        json.dump({"voz": a.voz, "rate": a.rate, "dur": round(t, 3), "escenas": escenas}, f, ensure_ascii=False, indent=1)
    for e in escenas:
        print(f"{e['id']:9s} {e['s']:6.2f} - {e['e']:6.2f}")
    print(f"total voz: {t:.2f}s")


if __name__ == "__main__":
    main()
