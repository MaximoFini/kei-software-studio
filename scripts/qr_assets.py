"""Assets del reel QrExplainer que no son la voz (ver scripts/qr_voz.py):
  remotion/src/qrMatrix.json      matriz de un QR real (nivel H: aguanta ~30% de daño) que abre el Instagram de KEI
  remotion/public/qr_pop.wav      "pop" corto para elementos que aparecen
  remotion/public/qr_tick.wav     tic suave (lectura fila por fila, bits)
  remotion/public/qr_ok.wav       campanita de lectura correcta

Uso: uv run --python 3.11 --with segno,numpy python scripts/qr_assets.py
"""
import json, os, wave
import numpy as np
import segno

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://instagram.com/keisoftware"
SR = 48000

qr = segno.make(URL, error="h", micro=False, boost_error=False)
matriz = [[1 if c else 0 for c in fila] for fila in qr.matrix]
with open(os.path.join(ROOT, "remotion", "src", "qrMatrix.json"), "w") as f:
    json.dump({"url": URL, "version": qr.version, "error": qr.error, "n": len(matriz),
               "m": ["".join(map(str, fila)) for fila in matriz]}, f, indent=1)
print(f"QR versión {qr.version}, nivel {qr.error}, {len(matriz)}x{len(matriz)}")


def guardar(nombre, x):
    x = x / np.abs(x).max() * 0.6
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(ROOT, "remotion", "public", nombre), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())


t = lambda d: np.arange(int(SR * d)) / SR
# pop: seno con caída rápida de tono y de volumen
tp = t(0.09)
f = 900 * np.exp(-tp * 30) + 260
guardar("qr_pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tp * 45))
# tic: ráfaga corta, agudo
tt = t(0.035)
guardar("qr_tick.wav", np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 160) * 0.7)
# ok: dos notas (mi6 - si6) con armónico suave
to = t(0.5)
nota = lambda fr, ini: np.where(to >= ini, (np.sin(2 * np.pi * fr * (to - ini)) + 0.3 * np.sin(4 * np.pi * fr * (to - ini)))
                                * np.exp(-np.maximum(to - ini, 0) * 7), 0)
guardar("qr_ok.wav", nota(1318.5, 0) + nota(1975.5, 0.09))
