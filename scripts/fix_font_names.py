"""Repara la tabla de nombres de los TTF de Glacial Indifference para que FFmpeg/libass los encuentre.

Los TTF de brand/fonts son una versión "webfont" con los nombres internos borrados (familia = '.\\x7f'):
los navegadores (Remotion) los cargan por archivo y no les afecta, pero libass busca las fuentes por nombre.
Este script escribe copias en brand/fonts/ffmpeg/ con la familia "Glacial KEI" (Regular / Bold) y marca
la 700 como bold. Los dibujos de las letras no cambian. Los originales no se tocan.
Licencia: SIL OFL 1.1 (modificación permitida; se usa otro nombre de familia para la versión modificada).

Uso: python scripts/fix_font_names.py
"""
import os, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "brand", "fonts")
DST = os.path.join(SRC, "ffmpeg")
FAMILY = "Glacial KEI"
FONTS = [("glacial-indifference-400.ttf", "Regular", False), ("glacial-indifference-700.ttf", "Bold", True)]


def checksum(data):
    data += b"\0" * (-len(data) % 4)
    return sum(struct.unpack(f">{len(data) // 4}I", data)) & 0xFFFFFFFF


def name_table(style):
    names = {
        1: FAMILY,
        2: style,
        3: f"{FAMILY} {style}; KEI Software",
        4: f"{FAMILY} {style}",
        5: "Version 1.000",
        6: f"GlacialKEI-{style}",
        10: "Glacial Indifference con la tabla de nombres reconstruida para FFmpeg/libass.",
        13: "This Font Software is licensed under the SIL Open Font License, Version 1.1.",
        14: "http://scripts.sil.org/OFL",
    }
    records, strings = [], b""
    for platform, enc, lang, codec in ((1, 0, 0, "mac_roman"), (3, 1, 0x409, "utf-16-be")):
        for nid, text in sorted(names.items()):
            raw = text.encode(codec)
            records.append((platform, enc, lang, nid, len(raw), len(strings)))
            strings += raw
    header = struct.pack(">HHH", 0, len(records), 6 + 12 * len(records))
    return header + b"".join(struct.pack(">6H", *r) for r in records) + strings


def fix(src, dst, style, bold):
    d = open(src, "rb").read()
    sfnt, n = d[:4], struct.unpack(">H", d[4:6])[0]
    tables = {}
    for i in range(n):
        tag, _, off, ln = struct.unpack(">4sIII", d[12 + 16 * i : 28 + 16 * i])
        tables[tag] = bytearray(d[off : off + ln])
    tables[b"name"] = bytearray(name_table(style))

    os2, head = tables[b"OS/2"], tables[b"head"]
    sel = struct.unpack(">H", os2[62:64])[0] & ~0x61  # limpia REGULAR/BOLD/ITALIC
    struct.pack_into(">H", os2, 62, sel | (0x20 if bold else 0x40))
    struct.pack_into(">H", head, 44, 0x1 if bold else 0x0)  # macStyle
    struct.pack_into(">I", head, 8, 0)  # checkSumAdjustment, se recalcula abajo

    tags = sorted(tables)
    es = max(k for k in range(16) if 2**k <= len(tags))
    out = bytearray(sfnt + struct.pack(">HHHH", len(tags), 16 * 2**es, es, len(tags) * 16 - 16 * 2**es))
    off = 12 + 16 * len(tags)
    body = b""
    for tag in tags:
        t = bytes(tables[tag])
        out += struct.pack(">4sIII", tag, checksum(t), off + len(body), len(t))
        body += t + b"\0" * (-len(t) % 4)
    out += body
    head_off = struct.unpack(">I", out[12 + 16 * tags.index(b"head") + 8 : 12 + 16 * tags.index(b"head") + 12])[0]
    struct.pack_into(">I", out, head_off + 8, (0xB1B0AFBA - checksum(bytes(out))) & 0xFFFFFFFF)
    open(dst, "wb").write(out)


os.makedirs(DST, exist_ok=True)
for fname, style, bold in FONTS:
    dst = os.path.join(DST, f"glacial-kei-{style.lower()}.ttf")
    fix(os.path.join(SRC, fname), dst, style, bold)
    print("OK ->", os.path.relpath(dst, ROOT))
