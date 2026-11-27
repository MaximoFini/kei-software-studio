"""Banco de pruebas de voces: genera la misma frase con varias voces de edge-tts, las transcribe con Whisper
(whisper.cpp de FFmpeg) y mide cuánto se entienden (coincidencia con el texto). Sirve para elegir voces; el oído
de la persona decide al final. Uso: PYTHONPATH=work/pylib py scripts/probar_voces.py [voz ...]"""
import asyncio, difflib, os, re, subprocess, sys, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "work", "voces")
TEXTO = ("¿Sabías que tu celular sabe dónde estás sin mandar nada? Escucha señales de cuatro satélites, "
         "mide cuánto tardan en llegar, y con eso hace una cuenta. Parece magia, pero es pura matemática.")
VOCES = ["es-AR-ElenaNeural", "es-AR-TomasNeural", "es-MX-DaliaNeural", "es-MX-JorgeNeural", "es-US-PalomaNeural",
         "es-US-AlonsoNeural", "es-CO-SalomeNeural", "es-CO-GonzaloNeural", "es-ES-ElviraNeural", "es-ES-AlvaroNeural",
         "es-ES-XimenaNeural", "es-UY-ValentinaNeural", "es-UY-MateoNeural", "es-CL-CatalinaNeural",
         "en-US-AvaMultilingualNeural", "en-US-AndrewMultilingualNeural", "en-US-BrianMultilingualNeural",
         "en-US-EmmaMultilingualNeural", "fr-FR-VivienneMultilingualNeural", "fr-FR-RemyMultilingualNeural",
         "it-IT-GiuseppeMultilingualNeural", "pt-BR-ThalitaMultilingualNeural", "en-AU-WilliamMultilingualNeural"]

def norm(s):
    s = unicodedata.normalize("NFD", s.lower()); s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z ]", " ", s).split()

async def gen(voz, rate, pitch, mp3):
    import edge_tts
    c = edge_tts.Communicate(TEXTO, voz, rate=rate, pitch=pitch)
    await c.save(mp3)

def main():
    voces = sys.argv[1:] or VOCES
    for v in voces:
        mp3 = os.path.join(OUT, v + ".mp3")
        try:
            asyncio.run(gen(v, "+0%", "+0Hz", mp3))
        except Exception as e:
            print(f"{v:36s} ERROR {e}"); continue
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3],
                                 capture_output=True, text=True).stdout)
        rel = os.path.relpath(os.path.join(OUT, v + ".txt"), ROOT).replace("\\", "/")
        subprocess.run(["ffmpeg", "-v", "error", "-nostats", "-y", "-i", mp3, "-vn", "-af",
                        f"aresample=16000,whisper=model=models/ggml-small.bin:language=es:queue=10:use_gpu=false:format=text:destination={rel}",
                        "-f", "null", "-"], cwd=ROOT)
        try:
            txt = open(os.path.join(ROOT, rel), encoding="utf-8").read()
        except FileNotFoundError:
            txt = ""
        r = difflib.SequenceMatcher(None, norm(TEXTO), norm(txt)).ratio()
        print(f"{v:36s} {d:5.1f}s  coincidencia {r*100:5.1f}%  | {txt.strip()[:90]}")

main()
