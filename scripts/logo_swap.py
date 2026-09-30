"""Reemplaza un logo FIJO (misma posición y tamaño en todo el video) por el horizontal de KEI Software.

Pasos:
  1. Encontrar el bbox del logo original (x0 y0 x1 y1) en píxeles del video.
  2. Elegir un cuadro donde el logo sea BLANCO sobre fondo liso y otro donde sea NEGRO (para la máscara).
  3. python3 scripts/logo_swap.py entrada.mp4 salida.mp4 --bbox 285 601 440 667 --white-ref 235 --black-ref 150

Por cuadro: detecta si el logo original era blanco o negro, lo borra con inpainting sólo dentro
de la máscara, compone la variante KEI que corresponde (texto blanco en fondos oscuros, negro en
claros; el isotipo nunca se recolorea) y deja el resto de los píxeles idénticos al original.
El audio se copia sin recodificar. Encode casi sin pérdida (CRF 8, veryslow).
"""
import argparse, glob, os, shutil, subprocess, tempfile
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_LIGHT = os.path.join(ROOT, "brand", "logos", "horizontal-fondo-claro.png")  # texto negro
LOGO_DARK = os.path.join(ROOT, "brand", "derived", "kei_horizontal_dark.png")  # texto blanco

ap = argparse.ArgumentParser()
ap.add_argument("input"); ap.add_argument("output")
ap.add_argument("--bbox", nargs=4, type=int, required=True, metavar=("X0", "Y0", "X1", "Y1"))
ap.add_argument("--white-ref", type=int, required=True, help="nº de cuadro (1-based) con logo blanco sobre fondo liso")
ap.add_argument("--black-ref", type=int, nargs="+", required=True, help="cuadros con logo negro sobre fondo claro")
ap.add_argument("--logo-width", type=float, default=1.475, help="ancho del logo KEI relativo al bbox original")
ap.add_argument("--pad", type=int, default=14)
a = ap.parse_args()

tmp = tempfile.mkdtemp()
fin, fout = os.path.join(tmp, "f"), os.path.join(tmp, "o")
os.makedirs(fin); os.makedirs(fout)
fps = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                               "stream=r_frame_rate", "-of", "csv=p=0", a.input]).decode().strip()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.input, f"{fin}/%05d.png"], check=True)
frames = sorted(glob.glob(f"{fin}/*.png"))
H, W = cv2.imread(frames[0]).shape[:2]
X0, Y0, X1, Y1 = a.bbox

def gray(n): return cv2.cvtColor(cv2.imread(f"{fin}/{n:05d}.png"), cv2.COLOR_BGR2GRAY)
m = (gray(a.white_ref) > 150).astype(np.uint8) * 255
for n in a.black_ref:
    m |= (gray(n) < 110).astype(np.uint8) * 255
box = np.zeros_like(m); box[Y0 - 2:Y1 + 3, X0 - 2:X1 + 3] = 255
MASK = cv2.dilate(m & box, np.ones((5, 5), np.uint8), iterations=2)
core = cv2.erode(MASK, np.ones((5, 5), np.uint8), iterations=2) > 0
ring = (cv2.dilate(MASK, np.ones((9, 9), np.uint8), iterations=2) > 0) & ~(MASK > 0)

def load(path):
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
    w = round((X1 - X0) * a.logo_width)
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return np.array(im).astype(np.float32) / 255.0
LOGOS = {"light": load(LOGO_LIGHT), "dark": load(LOGO_DARK)}
LH, LW = LOGOS["light"].shape[:2]
LX, LY = round((X0 + X1) / 2 - LW / 2), round((Y0 + Y1) / 2 - LH / 2)
P = a.pad
RY0, RY1 = min(Y0 - P, LY) - 2, max(Y1 + P, LY + LH) + 2
RX0, RX1 = min(X0 - P, LX) - 2, max(X1 + P, LX + LW) + 2

stats = []
for p in frames:
    fr = cv2.imread(p); g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    d = np.median(g[core]) - np.median(g[ring])
    L = LOGOS["dark" if d > 0 else "light"]
    clean = cv2.inpaint(fr, MASK, 7, cv2.INPAINT_TELEA)
    al = L[:, :, 3:4]; rgb = L[:, :, [2, 1, 0]] * 255
    reg = clean[LY:LY + LH, LX:LX + LW].astype(np.float32)
    clean[LY:LY + LH, LX:LX + LW] = np.clip(reg * (1 - al) + rgb * al, 0, 255).astype(np.uint8)
    out = fr.copy(); out[RY0:RY1, RX0:RX1] = clean[RY0:RY1, RX0:RX1]
    cv2.imwrite(f"{fout}/{os.path.basename(p)}", out); stats.append(abs(d))

subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", fps, "-i", f"{fout}/%05d.png", "-i", a.input,
                "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-preset", "veryslow", "-crf", "8",
                "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", a.output], check=True)
low = sum(s < 40 for s in stats)
print(f"OK -> {a.output} | {len(frames)} cuadros | {low} de bajo contraste (revisar a ojo: relieves, grises)")
shutil.rmtree(tmp)
