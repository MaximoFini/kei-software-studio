"""Banco de pruebas de voz rioplatense: sintetiza los guiones de scripts/guiones/pruebas/ con varias voces/parámetros
(frase por frase + POST_VOZ de explainer.py + loudnorm -14), transcribe con Whisper y mide coincidencia.
La variación de tono se mide aparte con scripts/prosodia.py. El oído de la persona decide.
Uso: PYTHONPATH=work/pylib py scripts/probar_voz_argentina.py"""
import asyncio, difflib, json, os, re, subprocess, sys, unicodedata
import edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "entregables", "voces", "argentino"); TMP = os.path.join(ROOT, "work", "vozar")
POST = ("highpass=f=75,lowpass=f=15500,equalizer=f=220:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.1:g=2.2,"
        "equalizer=f=9000:t=q:w=1:g=1.5,acompressor=threshold=-21dB:ratio=2.4:attack=12:release=160:makeup=2,aecho=0.88:0.9:42:0.07")
def norm(s):
    s = unicodedata.normalize("NFD", s.lower()); s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z ]", " ", s).split()
def run(c): subprocess.run(c, check=True, cwd=ROOT)
def frases(t): return [x.strip() for x in re.split(r"(?<=[.!?:])\s+", t) if x.strip()]
def pct(r, d): return f"{int(r.strip('%')) + d:+d}%"
async def tts(t, v, rate, pitch, vol, mp3): await edge_tts.Communicate(t, v, rate=rate, pitch=pitch, volume=vol).save(mp3)

# nombre, guion, voz, rate, pitch base, volumen, modo (frases | entero)
C = [("elena_base", "gps", "es-AR-ElenaNeural", "+4%", 0, "+0%", "frases"),
     ("elena_entero", "gps", "es-AR-ElenaNeural", "+0%", 0, "+0%", "entero"),
     ("elena_lenta_grave", "gps", "es-AR-ElenaNeural", "-4%", -4, "+0%", "frases"),
     ("elena_rapida_viva", "gps", "es-AR-ElenaNeural", "+10%", 3, "+0%", "frases"),
     ("tomas_base", "wifi", "es-AR-TomasNeural", "+4%", 0, "+0%", "frases"),
     ("tomas_entero", "wifi", "es-AR-TomasNeural", "+0%", 0, "+0%", "entero"),
     ("tomas_grave_lento", "wifi", "es-AR-TomasNeural", "-3%", -6, "+0%", "frases"),
     ("tomas_gps_base", "gps", "es-AR-TomasNeural", "+4%", 0, "+0%", "frases"),
     ("valentina_uy", "gps", "es-UY-ValentinaNeural", "+4%", 0, "+0%", "frases"),
     ("mateo_uy", "gps", "es-UY-MateoNeural", "+4%", 0, "+0%", "frases"),
     ("catalina_cl", "gps", "es-CL-CatalinaNeural", "+4%", 0, "+0%", "frases"),
     ("lorenzo_cl", "gps", "es-CL-LorenzoNeural", "+4%", 0, "+0%", "frases"),
     ("paloma_us", "gps", "es-US-PalomaNeural", "+4%", 0, "+0%", "frases"),
     ("alonso_us", "gps", "es-US-AlonsoNeural", "+4%", 0, "+0%", "frases"),
     ("emma_multi", "gps", "en-US-EmmaMultilingualNeural", "+4%", 0, "+0%", "frases"),
     ("jorge_mx", "gps", "es-MX-JorgeNeural", "+4%", 0, "+0%", "frases"),
     ("ssml_crudo_elena", "ssml", "es-AR-ElenaNeural", "+4%", 0, "+0%", "entero")]
def texto(g):
    if g == "ssml": return '<break time="400ms"/>Mirá, <emphasis level="strong">esto</emphasis> anda. <prosody rate="slow">Fijate bien.</prosody>'
    return " ".join(t for _, t in json.load(open(os.path.join(ROOT, "scripts/guiones/pruebas", g + "_rioplatense.json"), encoding="utf-8"))["escenas"])
def main():
    sel = sys.argv[1:]
    for nombre, g, v, rate, p0, vol, modo in C:
        if sel and nombre not in sel: continue
        T = texto(g); tr = os.path.join(TMP, nombre); os.makedirs(tr, exist_ok=True); wavs = []
        trozos = frases(T) if modo == "frases" else [T]
        for i, f in enumerate(trozos):
            d = (-2 if i == 0 else 0) + (1 if i % 2 else -1) + (-2 if i == len(trozos) - 1 and i else 0)
            ph = p0 + (6 if f.rstrip().endswith("?") else -2 if i == len(trozos) - 1 and i else 0)
            mp3 = os.path.join(tr, f"{i}.mp3"); wav = mp3[:-3] + "wav"
            asyncio.run(tts(f, v, pct(rate, d) if modo == "frases" else rate, f"{ph:+d}Hz", vol, mp3))
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "24000", "-ac", "1", "-af", "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-45dB,apad=pad_dur=0.12", wav]); wavs.append(wav)
        lst = os.path.join(tr, "l.txt"); open(lst, "w").write("".join(f"file '{w}'\n" for w in wavs))
        crudo = os.path.join(tr, "c.wav"); run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", crudo])
        out = os.path.join(OUT, nombre + ".mp3")
        run(["ffmpeg", "-v", "error", "-y", "-i", crudo, "-af", POST + ",loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "128k", out])
        rel = os.path.relpath(os.path.join(tr, "w.txt"), ROOT).replace("\\", "/")
        subprocess.run(["ffmpeg", "-v", "error", "-nostats", "-y", "-i", out, "-vn", "-af",
            f"aresample=16000,whisper=model=models/ggml-small.bin:language=es:queue=10:use_gpu=false:format=text:destination={rel}", "-f", "null", "-"], cwd=ROOT)
        txt = open(os.path.join(ROOT, rel), encoding="utf-8").read()
        r = difflib.SequenceMatcher(None, norm(T), norm(txt)).ratio()
        print(f"{nombre:20s} whisper {r*100:5.1f}% | {txt.strip()[:70]}", flush=True)
main()
