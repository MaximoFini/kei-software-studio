"""Extiende la música de un video para que siga sonando durante el cierre (sin cortes audibles).

Busca en el propio tema un punto que "suene igual" (similitud espectral) y empalma ahí con
crossfade de 60 ms; limita picos en la parte extendida y hace fade-out al final.

Uso:
  python3 scripts/extend_music.py original.mp4 salida.wav --dur 14.88 [--splice-min 9 --splice-max 10.7]

--dur          duración total que tiene que cubrir la música (la del video final)
--splice-*     ventana (s) donde se permite empalmar; tiene que estar antes de que el tema se corte
--avoid A B    (opcional) tramo del original que NO debe repetirse (p. ej. un efecto de click)
"""
import argparse, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--dur", type=float, required=True)
ap.add_argument("--splice-min", type=float, default=None)
ap.add_argument("--splice-max", type=float, default=None)
ap.add_argument("--avoid", type=float, nargs=2, default=None)
ap.add_argument("--fade", type=float, default=1.4)
a = ap.parse_args()

sr = 48000
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", a.src, "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"])
x = np.frombuffer(raw, np.float32).reshape(-1, 2); m = x.mean(1); D = len(m) / sr
smin = a.splice_min or D - 2.0; smax = a.splice_max or D - 0.4

n, hop = 2048, 480; win = np.hanning(n); fps = sr / hop
Sx = np.array([np.abs(np.fft.rfft(m[i * hop:i * hop + n] * win))[:400] for i in range((len(m) - n) // hop)])
Sx = np.log1p(Sx * 10); Sx = (Sx - Sx.mean(1, keepdims=True)) / (Sx.std(1, keepdims=True) + 1e-6)
K, K2, N = int(1.2 * fps), int(0.8 * fps), len(Sx)

def ok_region(t0, t1):
    return a.avoid is None or t1 <= a.avoid[0] or t0 >= a.avoid[1]

def best_jump(Smin, Smax, remaining_fn, limit):
    best = None
    for S in range(int(Smin * fps), int(Smax * fps), 2):
        rem = remaining_fn(S / fps)
        for T in range(int(1.2 * fps), S - int(0.5 * fps)):
            t0, t1 = T / fps, T / fps + rem
            if t1 > limit:
                continue
            c = Sx[S:min(N, S + K2)]
            sc = float((Sx[S - K:S] * Sx[T - K:T]).mean()) + 0.5 * float((c * Sx[T:T + len(c)]).mean())
            if best is None or sc > best[0]:
                best = (sc, S / fps, T / fps, ok_region(t0, t1))
    return best

def fine(S, T):
    sS, T0, w = int(S * sr), int(T * sr), int(0.05 * sr); best = None
    for d in range(-int(0.02 * sr), int(0.02 * sr)):
        t = T0 + d; u, v = m[sS - w:sS + w], m[t - w:t + w]
        c = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-9)
        if best is None or c > best[0]: best = (c, t)
    return best[1]

limit = smax + 0.2
# 1er salto
sc, S1, T1, clean = best_jump(smin, smax, lambda S: a.dur - S, limit)
jumps = [(S1, T1)]
# si la continuación pasa por el tramo a evitar, un 2º salto antes de llegar
if a.avoid and not clean:
    pre = a.avoid[0] - 0.05
    out_at = lambda S2: S1 + (S2 - T1)
    sc2, S2, T2, _ = best_jump(max(T1 + 0.5, pre - 0.8), pre, lambda S2: a.dur - out_at(S2), a.avoid[0])
    jumps.append((S2, T2))
print("empalmes (origen -> destino, s):", [(round(s, 2), round(t, 2)) for s, t in jumps])

xf = int(0.06 * sr); g = np.linspace(0, 1, xf)[:, None]; co, si = np.cos(g * np.pi / 2), np.sin(g * np.pi / 2)
out_len = int(a.dur * sr) + sr // 10
pieces, start = [], 0
for S, T in jumps:
    s = int(S * sr); pieces.append(x[start:s + xf]); start = fine(S, T)
pieces.append(x[start:start + out_len])
y = pieces[0]
for p in pieces[1:]:
    y = np.concatenate([y[:-xf], y[-xf:] * co + p[:xf] * si, p[xf:]])
y = y[:out_len]
# limitador suave sólo en la parte extendida (+3 dB sobre el nivel típico)
mm = y.mean(1); w = int(0.05 * sr)
rms = np.sqrt(np.convolve(mm ** 2, np.ones(w) / w, "same")) + 1e-9
ref = np.median(rms[int(1 * sr):int(jumps[0][0] * sr)])
gain = np.convolve(np.minimum(1, ref * 10 ** (3 / 20) / rms), np.ones(int(0.04 * sr)) / int(0.04 * sr), "same")
ramp = np.clip((np.arange(len(gain)) / sr - (jumps[0][0] - 0.03)) / 0.1, 0, 1)
y = y * (1 - (1 - gain) * ramp)[:, None]
t = np.arange(len(y)) / sr; f = np.clip((a.dur - t) / a.fade, 0, 1); y = y * (np.sin(f * np.pi / 2) ** 2)[:, None]
with wave.open(a.out, "wb") as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(sr)
    wv.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
print("OK ->", a.out)
