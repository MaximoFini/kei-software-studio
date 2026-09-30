"""Genera un whoosh suave + golpe grave (sin derechos de terceros) para transiciones.
Uso: python3 scripts/whoosh.py remotion/public/whoosh.wav
El golpe grave cae a los 0,72 s: alinear ese punto con el momento de "llegada" de la transición.
"""
import sys, wave
import numpy as np

out = sys.argv[1] if len(sys.argv) > 1 else "whoosh.wav"
sr = 48000; rng = np.random.default_rng(7)

def lp(x, fc):
    y = np.zeros_like(x); a = np.exp(-2 * np.pi * fc / sr); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y

n = int(0.9 * sr); t = np.arange(n) / sr
env = np.where(t < 0.62, (t / 0.62) ** 2.2, np.exp(-(t - 0.62) / 0.09))
fc = 300 + 3700 * np.where(t < 0.62, (t / 0.62) ** 1.5, np.exp(-(t - 0.62) / 0.12))
ch = []
for _ in range(2):
    w = rng.standard_normal(n); hp = w - lp(w, np.full(n, 150.0))
    ch.append((lp(hp, fc) - 0.6 * lp(hp, fc * 0.35)) * env)
wh = np.stack(ch, 1); wh /= np.abs(wh).max(); wh *= 10 ** (-14 / 20)
m = int(0.8 * sr); tt = np.arange(m) / sr
f = 48 + 30 * np.exp(-tt / 0.05)
sub = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.01) * 10 ** (-16 / 20)
total = np.zeros((int(1.6 * sr), 2)); total[:n] += wh
off = int(0.72 * sr); total[off:off + m] += sub[:, None]
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(total, -1, 1) * 32767).astype("<i2").tobytes())
print("OK ->", out)
