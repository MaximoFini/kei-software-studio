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
  python scripts/explainer.py voz work/reel_diario/guion.json   (también acepta la ruta a un guion)
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
# Igual que explainerKit.tsx: el cierre entra 0,12 s después de la última palabra y se saltean 24 cuadros (a 60 fps).
# Los reels en formato pizarrón van a 30 fps ("fps": 30 en el guion): 12 cuadros salteados y cierre de 120.
C0_PAD = 0.12
PARAMS_FPS = {60: (24, 240), 30: (12, 120)}


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                     capture_output=True, text=True).stdout)


async def tts(texto, voz, rate, mp3, pitch="+0Hz"):
    import edge_tts
    com = edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, boundary="WordBoundary")
    palabras = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                ini = ch["offset"] / 1e7
                palabras.append({"w": ch["text"], "s": round(ini, 3), "e": round(ini + ch["duration"] / 1e7, 3)})
    return palabras


def usar_ca_del_entorno():
    """edge-tts sólo confía en los certificados de certifi. Detrás de un proxy con certificado propio (el
    entorno en la nube de Claude) hay que pasarle el CA del entorno, antes de importar edge_tts."""
    ca = next((p for p in (os.environ.get("SSL_CERT_FILE"), os.environ.get("REQUESTS_CA_BUNDLE"),
                           "/root/.ccr/ca-bundle.crt") if p and os.path.exists(p)), None)
    if ca:
        import certifi
        certifi.where = lambda: ca


def pct(rate, delta):
    """Suma `delta` puntos porcentuales a una velocidad tipo '+8%'."""
    return f"{int(rate.strip('%')) + delta:+d}%"


def frases(texto):
    """Parte una escena en frases (cada una se sintetiza aparte: así cada frase tiene su propia entonación)."""
    out = [x.strip() for x in re.split(r"(?<=[.!?:])\s+", texto) if x.strip()]
    return out or [texto]


# Cadena de posproducción de la voz: saca graves y soplido, suma presencia y "aire", comprime suave y agrega una
# sala mínima (la voz de TTS sin nada suena seca y pegada; con esto suena más a locución grabada)
POST_VOZ = ("highpass=f=75,lowpass=f=15500,equalizer=f=220:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.1:g=2.2,"
            "equalizer=f=9000:t=q:w=1:g=1.5,acompressor=threshold=-21dB:ratio=2.4:attack=12:release=160:makeup=2,"
            "aecho=0.88:0.9:42:0.07")


def voz(g):
    import asyncio
    usar_ca_del_entorno()
    tmp = tempfile.mkdtemp()
    escenas, lista, t = [], [], 0.0
    pitch = g.get("pitch", "+0Hz")
    gap = g.get("gap", 0.11)  # pausa entre frases de una misma escena
    n_fr = 0
    for i, (sid, texto) in enumerate(g["escenas"]):
        fr = frases(texto)
        palabras_esc = []
        t_esc = t
        for j, frase in enumerate(fr):
            # Variación de ritmo y tono: el gancho entra un poco más lento y con más tono, las preguntas suben,
            # la última frase de cada escena baja la velocidad (cierra la idea) y el resto alterna levemente.
            delta = (-3 if i == 0 else 0) + (-2 if j == len(fr) - 1 and j > 0 else 0) + (1 if n_fr % 2 else -1)
            ph = ("+6Hz" if frase.rstrip().endswith("?") else "-2Hz" if j == len(fr) - 1 and j > 0 else "+0Hz") if pitch == "+0Hz" else pitch
            mp3 = os.path.join(tmp, f"{i:02d}_{j}.mp3")
            ps = asyncio.run(tts(frase, g["voz"], pct(g["rate"], delta), mp3, ph))
            n_fr += 1
            fin = ps[-1]["e"] + 0.12
            ultima = j == len(fr) - 1
            wav = os.path.join(tmp, f"{i:02d}_{j}.wav")
            run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", str(SR), "-ac", "1",
                 "-af", f"atrim=0:{fin:.3f},afade=t=out:st={fin - 0.05:.3f}:d=0.05,apad=pad_dur={g['pausa'] if ultima else gap}", wav])
            d = dur(wav)
            palabras_esc += [{**p, "s": round(p["s"] + t, 3), "e": round(p["e"] + t, 3)} for p in ps]
            lista.append(wav)
            t += d
        escenas.append({"id": sid, "texto": texto, "s": round(t_esc, 3),
                        "e": round(palabras_esc[-1]["e"] + 0.12, 3), "palabras": palabras_esc})

    concat = os.path.join(tmp, "lista.txt")
    with open(concat, "w") as f:
        f.writelines(f"file '{p}'\n" for p in lista)
    crudo = os.path.join(tmp, "voz.wav")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", crudo])
    if g.get("post", True):
        # Misma duración (la reverberación mínima no alarga el archivo); se aplica antes de medir el volumen
        post = os.path.join(tmp, "post.wav")
        run(["ffmpeg", "-v", "error", "-y", "-i", crudo, "-af", POST_VOZ, "-ar", str(SR), post])
        crudo = post

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
    print(f"voz: {t:.2f}s  ->  video: {total(escenas, g.get('fps', 60)):.2f}s")


def total(escenas, fps=60):
    skip, cierre = PARAMS_FPS[fps]
    return (round((escenas[-1]["e"] + C0_PAD) * fps) - skip + cierre) / fps


def musica(g):
    mu = g["musica"]
    src = os.path.join(ROOT, "work", "musica", g["id"], os.path.basename(mu["url"].split("filename=")[-1]))
    if not os.path.exists(src):
        os.makedirs(os.path.dirname(src), exist_ok=True)
        run(["curl", "-sL", "-A", "Mozilla/5.0", "-e", "https://pixabay.com/", "-o", src, mu["url"]])
    vozj = json.load(open(os.path.join(ROOT, "remotion", "src", f"{g['id']}Voz.json"), encoding="utf-8"))
    d = total(vozj["escenas"], g.get("fps", 60))
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
    # Acepta un id (scripts/guiones/<id>.json) o la ruta a un guion (lo usa scripts/reel_diario.py)
    ruta = sys.argv[2] if sys.argv[2].endswith(".json") else os.path.join(ROOT, "scripts", "guiones", f"{sys.argv[2]}.json")
    g = json.load(open(ruta, encoding="utf-8"))
    {"voz": voz, "musica": musica}[sys.argv[1]](g)
