"""Assets del formato pizarrón (remotion/src/pizarronKit.tsx), todo generado por código:
  remotion/public/pz_fondo.png   pizarrón verde con borrones de tiza y repisa de madera con tizas y borrador
  remotion/public/pz_grano.png   máscara (alfa) con el grano de la tiza; se aplica a toda la capa de dibujo
  (sin sonidos: el raspado de tiza se probó y se sacó; los micro-sonidos usan qr_pop/qr_ok/whoosh)
Uso: .venv/Scripts/python scripts/pizarron_assets.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, gaussian_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "remotion", "public")
W, H = 1080, 1920
rng = np.random.default_rng(7)


def fondo():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.array([44, 74, 58], np.float32)  # verde pizarrón
    img = np.ones((H, W, 3), np.float32) * base
    # viñeta: bordes más oscuros
    d = np.sqrt(((x - W / 2) / (W * 0.75)) ** 2 + ((y - H * 0.45) / (H * 0.7)) ** 2)
    img *= (1 - 0.34 * np.clip(d, 0, 1.2) ** 2)[..., None]
    # borrones del borrador: pasadas anchas, casi horizontales, claras y muy suaves
    sm = np.zeros((H, W), np.float32)
    for _ in range(46):
        cx, cy = rng.uniform(-100, W + 100), rng.uniform(0, 1750)
        L, T = rng.uniform(300, 900), rng.uniform(40, 150)
        ang = rng.normal(0, 0.12)
        dx, dy = x - cx, y - cy
        u = dx * np.cos(ang) + dy * np.sin(ang)
        v = -dx * np.sin(ang) + dy * np.cos(ang)
        m = np.exp(-((u / L) ** 4 + (v / T) ** 2))
        sm += m * rng.uniform(0.25, 1.0)
    sm = gaussian_filter(sm, 6)
    sm = sm / sm.max()
    img += (sm * 20)[..., None] * np.array([0.92, 1.0, 0.95], np.float32)
    # estrías finas horizontales de la pasada del borrador
    st = gaussian_filter1d(rng.normal(0, 1, (H, 1)).astype(np.float32), 1.2, axis=0)
    img += (st * 2.4 * sm.mean() * 6)[..., None] * np.ones((1, W, 1), np.float32)
    # grano fino
    img += rng.normal(0, 2.6, (H, W, 1)).astype(np.float32)
    img += gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), 25)[..., None] * 9
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))

    # repisa de madera abajo + sombra
    dr = ImageDraw.Draw(out)
    top = 1792
    for i in range(H - top):
        k = i / (H - top)
        c = (int(150 - 50 * k), int(98 - 35 * k), int(55 - 22 * k))
        dr.line([(0, top + i), (W, top + i)], fill=c)
    dr.rectangle([0, top, W, top + 8], fill=(190, 135, 82))
    dr.rectangle([0, top - 6, W, top], fill=(20, 36, 28))
    # veta de la madera
    wood = Image.new("L", (W, H - top), 0)
    wp = np.array(wood, np.float32)
    for _ in range(40):
        yy = rng.integers(0, H - top)
        wp[max(0, yy - 1):yy + 1, :] += rng.uniform(8, 24)
    wp = gaussian_filter(wp, (0.8, 40)) * 1.4
    arr = np.array(out).astype(np.float32)
    arr[top:, :, :] -= wp[..., None] * np.array([0.9, 0.85, 0.7])
    out = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    dr = ImageDraw.Draw(out)

    # tizas sobre la repisa
    def tiza(x0, color, ln=64, ang=0.0):
        y0 = top - 2
        dr.rounded_rectangle([x0, y0 - 17, x0 + ln, y0 + 5], 8, fill=color)
        dr.rounded_rectangle([x0 + 4, y0 - 14, x0 + ln - 6, y0 - 8], 3, fill=tuple(min(255, c + 22) for c in color))
    for x0, col in [(70, (240, 240, 232)), (150, (244, 214, 84)), (232, (240, 240, 232)), (700, (240, 128, 168)), (790, (126, 196, 236)), (880, (244, 214, 84))]:
        tiza(x0, col)
    # borrador
    ex, ey = 440, top - 34
    dr.rounded_rectangle([ex, ey, ex + 190, ey + 36], 5, fill=(82, 84, 90))
    dr.rounded_rectangle([ex + 4, ey + 34, ex + 186, ey + 46], 3, fill=(168, 118, 66))
    dr.rectangle([ex + 6, ey + 4, ex + 184, ey + 12], fill=(112, 114, 122))
    out.save(os.path.join(PUB, "pz_fondo.png"), optimize=True)


def grano():
    # alfa 255 = tiza; huecos al azar = grano de la pizarra; algunas zonas más gastadas
    n = rng.random((H, W)).astype(np.float32)
    low = gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), 18)
    low = low / low.std()
    thr = 0.20 + 0.06 * low
    fine = gaussian_filter(rng.random((H, W)).astype(np.float32), 0.7)
    fine = (fine - fine.mean()) / fine.std()
    a = 1 / (1 + np.exp(-(fine * 1.4 - (thr * 6 - 1.6)) * 2.2))
    a = np.clip(0.18 + a * 0.95, 0, 1)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(PUB, "pz_grano.png"), optimize=True)


if __name__ == "__main__":
    fondo(); grano()
    print("OK -> remotion/public/pz_fondo.png, pz_grano.png")
