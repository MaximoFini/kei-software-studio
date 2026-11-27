"""Mide qué tan "viva" es una voz: variación del tono (F0, en semitonos) y variación del ritmo. Una voz robótica
tiene poca variación de tono. Es una guía objetiva para elegir voces; el oído de la persona decide al final.
Uso: .venv/Scripts/python scripts/prosodia.py archivo1.mp3 archivo2.wav ..."""
import subprocess, sys, os
import numpy as np

def cargar(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

def f0(x, sr=16000, fmin=70, fmax=330, hop=0.01, win=0.04):
    h, n = int(hop * sr), int(win * sr)
    lo, hi = int(sr / fmax), int(sr / fmin)
    out = []
    for i in range(0, len(x) - n, h):
        fr = x[i:i + n] - x[i:i + n].mean()
        if np.sqrt((fr ** 2).mean()) < 0.02:
            out.append(0); continue
        ac = np.correlate(fr, fr, "full")[n - 1:]
        ac = ac / (ac[0] + 1e-9)
        k = lo + np.argmax(ac[lo:hi])
        out.append(sr / k if ac[k] > 0.45 else 0)
    return np.array(out)

for p in sys.argv[1:]:
    try:
        x = cargar(p)
        v = f0(x)
        voz = v[v > 0]
        st = 12 * np.log2(voz / np.median(voz))
        en = np.sqrt(np.convolve(x ** 2, np.ones(1600) / 1600, "same"))
        pausas = (en < 0.01).mean()
        print(f"{os.path.basename(p):42s} dur {len(x)/16000:5.1f}s  tono: mediana {np.median(voz):5.0f} Hz  variación {st.std():4.2f} st  rango(p10-p90) {np.percentile(st,90)-np.percentile(st,10):5.2f} st  pausas {pausas*100:4.1f}%")
    except Exception as e:
        print(p, "error", e)
