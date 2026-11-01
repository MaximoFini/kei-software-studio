"""Audio de los reels explicativos con voz en off (QrExplainer, BtExplainer, ...).

Cada video tiene un guion en scripts/guiones/<id>.json (voz, velocidad, escenas y música de fondo).

  voz      Genera cada escena con una voz neuronal de Microsoft (edge-tts, la misma familia de voces que
           usan los "texto a voz" de las apps), las une con pausas fijas y guarda:
             remotion/public/<id>_voz.wav   voz completa (48 kHz, -14 LUFS en dos pasadas)
             remotion/src/<id>Voz.json      inicio/fin de cada escena y de cada palabra (animación y subtítulos)
  musica   Baja el tema de Pixabay (si falta) a work/musica/<id>/, lo recorta desde "offset" (primer tiempo
           del beat), lo deja en "lufs" y le aplica ducking con la voz (~7 dB menos mientras habla), con
           fades. Salida: remotion/public/<id>_musica.wav (no se sube al repo: es de terceros).
           La duración sale de la voz igual que en la composición (explainerKit.tsx).

Uso (sin instalar nada en .venv; uv baja edge-tts a una caché):
  uv run --python 3.11 --with edge-tts python scripts/explainer.py voz bt
  python scripts/explainer.py musica bt
"""
import json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
# Igual que explainerKit.tsx: el cierre entra 0,12 s después de la última palabra y se saltean 24 cuadros
C0_PAD, SKIP, CIERRE, FPS = 0.12, 24, 240, 60


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                     capture_output=True, text=True).stdout)


async def tts(texto, voz, rate, mp3):
    import edge_tts
    com = edge_tts.Communicate(texto, voz, rate=rate, boundary="WordBoundary")
    palabras = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                ini = ch["offset"] / 1e7
                palabras.append({"w": ch["text"], "s": round(ini, 3), "e": round(ini + ch["duration"] / 1e7, 3)})
    return palabras


def voz(g):
    import asyncio
    tmp = tempfile.mkdtemp()
    escenas, lista, t = [], [], 0.0
    for i, (sid, texto) in enumerate(g["escenas"]):
        mp3 = os.path.join(tmp, f"{i:02d}.mp3")
        palabras = asyncio.run(tts(texto, g["voz"], g["rate"], mp3))
        wav = os.path.join(tmp, f"{i:02d}.wav")
        # Recorta el silencio del final que agrega el TTS; deja la pausa fija entre escenas
        fin = palabras[-1]["e"] + 0.12
        run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", str(SR), "-ac", "1",
             "-af", f"atrim=0:{fin:.3f},afade=t=out:st={fin - 0.05:.3f}:d=0.05,apad=pad_dur={g['pausa']}", wav])
        d = dur(wav)
        escenas.append({"id": sid, "texto": texto, "s": round(t, 3), "e": round(t + fin, 3),
                        "palabras": [{**p, "s": round(p["s"] + t, 3), "e": round(p["e"] + t, 3)} for p in palabras]})
        lista.append(wav)
        t += d

    concat = os.path.join(tmp, "lista.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{p}'\n" for p in lista)
    crudo = os.path.join(tmp, "voz.wav")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", crudo])

    # Loudness en dos pasadas a -14 LUFS (pico -1,5 dBTP)
    med = subprocess.run(["ffmpeg", "-hide_banner", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(med[med.rfind("{"): med.rfind("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    run(["ffmpeg", "-v", "error", "-y", "-i", crudo, "-af", ln, "-ar", str(SR),
         os.path.join(ROOT, "remotion", "public", f"{g['id']}_voz.wav")])

    with open(os.path.join(ROOT, "remotion", "src", f"{g['id']}Voz.json"), "w", encoding="utf-8") as f:
        json.dump({"voz": g["voz"], "rate": g["rate"], "dur": round(t, 3), "escenas": escenas}, f, ensure_ascii=False, indent=1)
    for e in escenas:
        print(f"{e['id']:10s} {e['s']:6.2f} - {e['e']:6.2f}")
    print(f"voz: {t:.2f}s  ->  video: {total(escenas):.2f}s")


def total(escenas):
    return (round((escenas[-1]["e"] + C0_PAD) * FPS) - SKIP + CIERRE) / FPS


def musica(g):
    mu = g["musica"]
    src = os.path.join(ROOT, "work", "musica", g["id"], os.path.basename(mu["url"].split("filename=")[-1]))
    if not os.path.exists(src):
        os.makedirs(os.path.dirname(src), exist_ok=True)
        run(["curl", "-sL", "-A", "Mozilla/5.0", "-e", "https://pixabay.com/", "-o", src, mu["url"]])
    vozj = json.load(open(os.path.join(ROOT, "remotion", "src", f"{g['id']}Voz.json"), encoding="utf-8"))
    d = total(vozj["escenas"])
    voz_wav = os.path.join(ROOT, "remotion", "public", f"{g['id']}_voz.wav")
    out = os.path.join(ROOT, "remotion", "public", f"{g['id']}_musica.wav")
    fc = (f"[0:a]aresample={SR},loudnorm=I={mu['lufs']}:TP=-6:LRA=11,afade=t=in:d=0.8,afade=t=out:st={d - 2.5:.2f}:d=2.5[m];"
          f"[1:a]aresample={SR},aformat=channel_layouts=stereo,apad[k];"
          "[m][k]sidechaincompress=threshold=0.05:ratio=3:attack=60:release=700:makeup=1[out]")
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(mu["offset"]), "-t", f"{d:.3f}", "-i", src, "-i", voz_wav,
         "-filter_complex", fc, "-map", "[out]", "-t", f"{d:.3f}", "-ar", str(SR), "-ac", "2", out])
    print(f"OK -> {os.path.relpath(out, ROOT)} ({d:.2f}s, {mu['titulo']})")


if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("voz", "musica"):
        sys.exit(__doc__)
    g = json.load(open(os.path.join(ROOT, "scripts", "guiones", f"{sys.argv[2]}.json"), encoding="utf-8"))
    {"voz": voz, "musica": musica}[sys.argv[1]](g)
