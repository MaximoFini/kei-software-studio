"""Reels de landings filmadas: arma el cuerpo de cada reel y lo renderiza con la composición LandingReel.

Pasos por reel (config en scripts/landing_reels.json):
  1. Cuerpo: recorta los tramos del video ingerido (work/reels/<fuente>.mp4, de scripts/ingest.sh),
     los une, acelera el scroll y lo deja en remotion/public/lr_<id>.mp4 (1440x2560, 30 fps).
  2. Logo del cliente: copia limpia en remotion/public/lr_<id>_logo.png (bordes semitransparentes -> 0).
  3. Render: LandingReel (lockup isotipo × isotipo arriba, push-in al foco y cierre KEI), sin música:
     pista de audio silenciosa para que en Instagram se le sume la canción.
Los assets lr_* de remotion/public no se suben al repo (.gitignore).

Uso:
  python scripts/landing_reels.py                 todos
  python scripts/landing_reels.py kei-claro       uno
  python scripts/landing_reels.py --draft         previews rápidos (mitad de resolución)
  python scripts/landing_reels.py --solo-cuerpo   sólo arma los cuerpos (para medir el foco)
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "remotion", "public")
CFG = json.load(open(os.path.join(ROOT, "scripts", "landing_reels.json"), encoding="utf-8"))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
DRAFT = "--draft" in sys.argv
SOLO_CUERPO = "--solo-cuerpo" in sys.argv


def run(cmd):
    subprocess.run(cmd, check=True)


def bash():
    # En Windows, "bash" puede ser el de WSL: usar el de Git for Windows
    if os.name == "nt":
        import shutil
        git = shutil.which("git") or ""
        raiz = git[: git.lower().find("\\git\\") + 4] if "\\git\\" in git.lower() else ""
        for d in (os.environ.get("EXEPATH", ""), os.path.join(raiz, "bin") if raiz else "", r"C:\Program Files\Git\bin"):
            cand = os.path.join(d, "bash.exe")
            if d and os.path.exists(cand):
                return cand
        sys.exit("No encontré el bash de Git for Windows (instalá Git: winget install Git.Git)")
    return "bash"


def cuerpo(r):
    src = os.path.join(ROOT, "work", "reels", f"{r['fuente']}.mp4")
    v = r["velocidad"]
    parts = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(r["tramos"]))
    concat = "".join(f"[s{i}]" for i in range(len(r["tramos"])))
    # tpad: 0,5 s extra con el último cuadro congelado para el final del push-in
    fc = f"{parts}{concat}concat=n={len(r['tramos'])}:v=1:a=0,setpts=PTS/{v},fps=30,tpad=stop_mode=clone:stop_duration=0.5[v]"
    out = os.path.join(PUB, f"lr_{r['id']}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[v]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p",
         "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", out])
    dur = sum(b - a for a, b in r["tramos"]) / v
    return dur


def logo(r):
    if not r["cliente"]:
        return ""
    im = Image.open(os.path.join(ROOT, "logos_clientes", r["cliente"])).convert("RGBA")
    a = np.array(im)
    # Bordes semitransparentes (restos de fondo) -> transparentes; recorta al contenido
    a[..., 3] = np.where(a[..., 3] < 200, 0, a[..., 3])
    im = Image.fromarray(a)
    im = im.crop(im.getchannel("A").getbbox())
    name = f"lr_{r['id']}_logo.png"
    im.save(os.path.join(PUB, name))
    return name


for r in CFG["reels"]:
    if args and r["id"] not in args:
        continue
    print(f"== {r['id']}")
    dur = cuerpo(r)
    if SOLO_CUERPO:
        print(f"   cuerpo: {dur:.2f}s")
        continue
    props = {"video": f"lr_{r['id']}.mp4", "clienteLogo": logo(r), "foco": r["foco"], "cuerpoS": round(dur, 3)}
    out = os.path.join(ROOT, "out", "reels", f"{'draft_' if DRAFT else ''}{r['id']}.mp4")
    run([bash(), os.path.join(ROOT, "scripts", "render.sh"), "LandingReel", out, "--draft" if DRAFT else "--muted",
         f"--props={json.dumps(props)}"] + (["--muted"] if DRAFT else []))
    # Pista silenciosa (algunas apps esperan audio) + loudness no aplica
    final = out.replace(".mp4", "_final.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", out, "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", final])
    os.replace(final, out)
    print(f"   OK -> {os.path.relpath(out, ROOT)}  ({dur:.1f}s + cierre)")
