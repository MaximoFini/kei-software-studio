"""Fotos del reel IaExplainer ("¿Cómo ve una foto la IA?"): fotos libres de Pixabay (licencia Pixabay),
recortadas y procesadas. Las fotos no se suben al repo (remotion/public/ia_foto_*): este script las vuelve a bajar.

Salidas:
  remotion/public/ia_foto_<nombre>.jpg   recortes cuadrados
  remotion/public/ia_foto_bordes.png     bordes reales (Canny) de la foto del perro, en blanco sobre transparente
  remotion/src/iaPixeles.json            la foto del perro reducida a 24x24 (RGB y gris 0-255), para la escena de píxeles

Uso: .venv/Scripts/python scripts/ia_assets.py
"""
import json, os, subprocess
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "remotion", "public")
CACHE = os.path.join(ROOT, "work", "ia", "fotos")
CDN = "https://cdn.pixabay.com/photo/"

# nombre: (ruta en el CDN de Pixabay, recorte x0 y0 x1 y1 en fracciones, lado de salida)
FOTOS = {
    "perro": ("2014/03/14/20/13/dog-287420_1280.jpg", (0, 0, 1, 1), 1080),
    "chihuahua": ("2019/02/24/20/15/chihuahua-4018429_1280.jpg", (0.2, 0.02, 0.82, 0.98), 720),
    "muffin": ("2017/03/12/10/30/blueberry-2136750_1280.jpg", (0.64, 0.23, 0.92, 0.66), 720),
    "golden": ("2016/02/18/18/37/puppy-1207816_640.jpg", None, 360),
    "aussie": ("2021/01/09/14/04/australian-shepherd-5902417_640.jpg", None, 360),
    "pointer": ("2024/03/25/20/30/german-shorthaired-pointer-8655457_640.jpg", None, 360),
    "gato_naranja": ("2019/04/02/16/11/cat-4098058_640.jpg", None, 360),
    "gato_bufanda": ("2020/11/22/17/28/cat-5767334_640.jpg", None, 360),
    "gatito": ("2015/08/30/10/58/cat-914110_640.jpg", None, 360),
    "gato_negro": ("2015/05/22/05/52/cat-778315_640.jpg", None, 360),
    "gato_atigrado": ("2016/12/30/12/16/cat-1940487_640.jpg", None, 360),
}


def bajar(ruta):
    os.makedirs(CACHE, exist_ok=True)
    dst = os.path.join(CACHE, os.path.basename(ruta))
    if not os.path.exists(dst):
        subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-e", "https://pixabay.com/", "-o", dst, CDN + ruta], check=True)
    return cv2.imread(dst)


def cuadrado(img, caja):
    h, w = img.shape[:2]
    if caja:
        x0, y0, x1, y1 = caja
        img = img[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
        h, w = img.shape[:2]
    lado = min(h, w)
    y, x = (h - lado) // 2, (w - lado) // 2
    return img[y:y + lado, x:x + lado]


for nombre, (ruta, caja, lado) in FOTOS.items():
    img = cv2.resize(cuadrado(bajar(ruta), caja), (lado, lado), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(PUB, f"ia_foto_{nombre}.jpg"), img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if nombre == "perro":
        gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        bordes = cv2.Canny(cv2.GaussianBlur(gris, (5, 5), 1.4), 40, 110)
        bordes = cv2.dilate(bordes, np.ones((2, 2), np.uint8))
        rgba = np.zeros((lado, lado, 4), np.uint8)
        rgba[..., :3] = 255
        rgba[..., 3] = bordes
        cv2.imwrite(os.path.join(PUB, "ia_foto_bordes.png"), rgba)
        chico = cv2.resize(img, (24, 24), interpolation=cv2.INTER_AREA)
        rgb = chico[..., ::-1].reshape(-1, 3).tolist()
        g = cv2.cvtColor(chico, cv2.COLOR_BGR2GRAY).reshape(-1).tolist()
        with open(os.path.join(ROOT, "remotion", "src", "iaPixeles.json"), "w") as f:
            json.dump({"n": 24, "rgb": rgb, "gris": g}, f)
    print(f"ia_foto_{nombre}.jpg")
