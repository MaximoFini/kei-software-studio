/**
 * Reel "Llegamos a Instagram" — reconstrucción del formato de referencia con la marca KEI Software.
 * Todas las medidas están en el espacio 720×1280 del original (se escalan ×1.5 a 1080×1920)
 * y los tiempos en cuadros del original a 30 fps (F = 1-based). La comp corre a 60 fps.
 */
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { KeiCierre } from "./KeiCierre";

// ---------------- Marca ----------------
const C = {
  azul: "#3F7DFF",
  oscuro: "#020714",
  marino: "#16205E",
  claro: "#F9FAFC",
  hielo: "#DFE8FD",
};
const K = 1.5; // 720 → 1080
const px = (n: number) => n * K;
const GLACIAL = "'Glacial Indifference', sans-serif";
const MONT = "'Montserrat', sans-serif";

// ---------------- Fuentes (carga + medición) ----------------
const fontsReady = (async () => {
  const faces = [
    new FontFace("Glacial Indifference", `url(${staticFile("glacial-indifference-700.woff2")})`, { weight: "700" }),
    new FontFace("Glacial Indifference", `url(${staticFile("glacial-indifference-400.woff2")})`, { weight: "400" }),
    new FontFace("Montserrat", `url(${staticFile("montserrat-latin-400-normal.woff2")})`, { weight: "400" }),
    new FontFace("Montserrat", `url(${staticFile("montserrat-latin-500-normal.woff2")})`, { weight: "500" }),
    new FontFace("Montserrat", `url(${staticFile("montserrat-latin-700-normal.woff2")})`, { weight: "700" }),
  ];
  await Promise.all(faces.map((f) => f.load()));
  faces.forEach((f) => (document.fonts as any).add(f));
})();

let ctx: CanvasRenderingContext2D | null = null;
const measure = (text: string, font: string) => {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  ctx!.font = font;
  return ctx!.measureText(text).width;
};

// ---------------- Helpers ----------------
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outCubic = Easing.out(Easing.cubic);
const inOut = Easing.inOut(Easing.cubic);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
};
/** Interpolación lineal por keyframes [F, ...valores] */
const kf = (F: number, keys: number[][]): number[] => {
  if (F <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, ...a] = keys[i], [f1, ...b] = keys[i + 1];
    if (F <= f1) {
      const t = (F - f0) / (f1 - f0);
      return a.map((v, j) => lerp(v, b[j], t));
    }
  }
  return keys[keys.length - 1].slice(1);
};

// ---------------- Línea de palabras animadas ----------------
type Word = { text: string; hl?: boolean };
const WordLine: React.FC<{
  F: number;
  words: Word[];
  starts: number[];
  size: number; // px en 720
  cx: number;
  cy: number;
  exit?: [number, number];
  finalColor?: string;
}> = ({ F, words, starts, size, cx, cy, exit, finalColor = C.oscuro }) => {
  const font = `700 ${px(size)}px 'Glacial Indifference'`;
  const widths = words.map((w) => measure(w.text, font));
  const gap = measure(" ", font);
  const D = 10;
  const e = starts.map((s) => outCubic(Math.min(1, Math.max(0, (F - s) / D))));
  const total = widths.reduce((acc, w, i) => acc + (w + (i ? gap : 0)) * e[i], 0);
  let x = px(cx) - total / 2;
  const exitT = exit ? interpolate(F, exit, [0, 1], cl) : 0;
  return (
    <>
      {words.map((w, i) => {
        const left = x + (i ? gap * e[i] : 0);
        x = left + widths[i] * e[i];
        const appear = interpolate(F, [starts[i], starts[i] + 4], [0, 1], cl);
        const colT = interpolate(F, [starts[i] + 2, starts[i] + 14], [0, 1], cl);
        const color = w.hl ? C.azul : mix(C.azul, finalColor, colT);
        const blur = (1 - e[i]) * 7 + exitT * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: px(cy) - px(size) * 0.62,
              fontFamily: GLACIAL,
              fontWeight: 700,
              fontSize: px(size),
              lineHeight: 1,
              whiteSpace: "nowrap",
              color,
              opacity: appear * (1 - exitT),
              transform: `translateY(${(1 - e[i]) * px(size) * 0.7}px)`,
              filter: blur > 0.05 ? `blur(${px(blur) / 2}px)` : undefined,
            }}
          >
            {w.text}
          </div>
        );
      })}
    </>
  );
};

// ---------------- Escena 1: "Un nuevo comienzo" ----------------
const S1: React.FC<{ F: number }> = ({ F }) =>
  F > 42 ? null : (
    <WordLine
      F={F}
      words={[{ text: "Un" }, { text: "nuevo" }, { text: "comienzo" }]}
      starts={[7, 12, 17]}
      size={48}
      cx={360}
      cy={631}
      exit={[35, 41]}
    />
  );

// ---------------- Escena 2: rueda de palabras ----------------
const ROLL = ["Software", "Automatización", "IA"];
const S2: React.FC<{ F: number }> = ({ F }) => {
  if (F < 39 || F > 90) return null;
  const p = kf(F, [[41, -0.7], [49, 0], [55, 0], [63, 1], [71, 1], [79, 2], [90, 2]])[0];
  const inT = interpolate(F, [40, 47], [0, 1], cl);
  const outT = interpolate(F, [84, 89], [0, 1], cl);
  const pitch = 66;
  return (
    <>
      {ROLL.map((w, i) => {
        const d = i - p;
        const ad = Math.min(Math.abs(d), 1.6);
        const op = Math.max(0, 1 - ad * 0.62) * inT * (1 - outT);
        const blur = ad * 5 + outT * 10 + (1 - inT) * 8;
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              left: 0,
              width: px(720),
              textAlign: "center",
              top: px(640 + d * pitch) - px(52) * 0.62,
              fontFamily: GLACIAL,
              fontWeight: 700,
              fontSize: px(52),
              lineHeight: 1,
              color: C.oscuro,
              opacity: op,
              transform: `scale(${1 - ad * 0.1})`,
              filter: `blur(${px(blur) / 2}px)`,
            }}
          >
            {w}
          </div>
        );
      })}
    </>
  );
};

// ---------------- Escena 3: frase principal ----------------
const L1: Word[] = [{ text: "Llegamos" }, { text: "a" }, { text: "Instagram", hl: true }, { text: "para" }];
const L2: Word[] = [{ text: "mostrarte" }, { text: "cómo" }, { text: "el" }, { text: "software", hl: true }];
const L3: Word[] = [{ text: "transforma" }, { text: "negocios" }];
const S3: React.FC<{ F: number }> = ({ F }) => {
  if (F < 88 || F > 138) return null;
  const st = (n: number) => Array.from({ length: n }, (_, i) => i);
  let k = 0;
  const next = (n: number) => st(n).map(() => 89 + 1.6 * k++);
  const s1 = next(L1.length), s2 = next(L2.length), s3 = next(L3.length);
  const size = 38, pitch = 42;
  return (
    <>
      <WordLine F={F} words={L1} starts={s1} size={size} cx={360} cy={640 - pitch} exit={[132, 137]} />
      <WordLine F={F} words={L2} starts={s2} size={size} cx={360} cy={640} exit={[129, 133]} />
      <WordLine F={F} words={L3} starts={s3} size={size} cx={360} cy={640 + pitch} exit={[127, 131]} />
    </>
  );
};

// ---------------- Avatar (isotipo en círculo blanco, sin rotación) ----------------
const ISO_AR = 499 / 727;
const Avatar: React.FC<{ x: number; y: number; d: number; circle?: number; blur?: number }> = ({
  x, y, d, circle = 1, blur = 0,
}) => {
  const isoH = d * 0.6;
  return (
    <div
      style={{
        position: "absolute",
        left: px(x - d / 2),
        top: px(y - d / 2),
        width: px(d),
        height: px(d),
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#FFFFFF",
          transform: `scale(${0.5 + 0.5 * circle})`,
          opacity: circle,
        }}
      />
      <Img
        src={staticFile("isotipo.png")}
        style={{
          position: "absolute",
          height: px(isoH),
          width: px(isoH * ISO_AR),
          left: px(d / 2 - (isoH * ISO_AR) / 2),
          top: px(d / 2 - isoH / 2),
        }}
      />
    </div>
  );
};

// ---------------- Escena 4-5: isotipo → tarjeta de perfil → zoom ----------------
const CARD = { cx: 359.5, cy: 639.5, w: 539, h: 349, r: 18 };
const ZOOM = { ox: 72, oy: 860, s: 1.758 };
const BTN_F = { x0: 110, x1: 353, y0: 719, y1: 759 };
const BTN_M = { x0: 366, x1: 610, y0: 719, y1: 759 };
const BIO = [
  { t: "Software", c: "#E6E8EE" },
  { t: "a", c: "#E6E8EE" },
  { t: "medida.", c: "#E6E8EE" },
  { t: "Resultados", c: C.azul },
  { t: "reales.", c: C.azul },
];

const blurIn = (F: number, s: number, d = 3) => {
  const t = interpolate(F, [s, s + d], [0, 1], cl);
  return { opacity: t, filter: t < 1 ? `blur(${px((1 - t) * 5) / 2}px)` : undefined };
};

const Card: React.FC<{ F: number }> = ({ F }) => {
  // tamaño de la tarjeta (crece desde el isotipo con rebote)
  const [w, h] = kf(F, [[144, 140, 90], [148, 470, 305], [152, 556, 356], [155, 548, 352], [158, 539, 349]]);
  const cardOp = interpolate(F, [143.5, 145], [0, 1], cl);
  // "presión" del botón Seguir
  const press = kf(F, [[216, 1], [218.5, 0.93], [221, 1]])[0];
  const labelSwap = interpolate(F, [218.5, 220.5], [0, 1], cl);
  const fadeUi = interpolate(F, [223.5, 226.5], [1, 0], cl); // textos y Mensaje se van al expandir

  const btn = (b: typeof BTN_F, start: number, color: string, label: React.ReactNode, keep = false) => {
    const g = outCubic(interpolate(F, [start, start + 4], [0, 1], cl));
    return (
      <div
        style={{
          position: "absolute",
          left: px(b.x0),
          top: px(b.y0),
          width: px(b.x1 - b.x0),
          height: px(b.y1 - b.y0),
          borderRadius: px(6),
          background: color,
          transform: `scaleX(${0.06 + 0.94 * g}) scale(${keep ? press : 1})`,
          opacity: interpolate(F, [start, start + 1], [0, 1], cl) * (keep ? (F < 221 ? 1 : 0) : fadeUi),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: MONT,
          fontWeight: 500,
          fontSize: px(12.5),
          color: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <div style={{ opacity: interpolate(F, [start + 2.5, start + 4], [0, 1], cl) }}>{label}</div>
      </div>
    );
  };

  let bx = 282;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: px(CARD.cx - w / 2),
          top: px(CARD.cy - h / 2),
          width: px(w),
          height: px(h),
          borderRadius: px(CARD.r),
          background: C.oscuro,
          opacity: F < 221 ? cardOp : 0,
        }}
      />
      <div style={{ opacity: fadeUi }}>
        {/* usuario */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: px(720),
            textAlign: "center",
            top: px(509),
            fontFamily: MONT,
            fontWeight: 700,
            fontSize: px(21),
            color: "#FFFFFF",
            ...blurIn(F, 147),
          }}
        >
          keisoftware
        </div>
        {/* nombre: wordmark oficial (no se reescribe con otra fuente) */}
        <Img
          src={staticFile("wordmark.png")}
          style={{ position: "absolute", left: px(282), top: px(594), height: px(13.5), ...blurIn(F, 151) }}
        />
        {/* bio palabra por palabra */}
        {BIO.map((b, i) => {
          const font = `400 ${px(12.5)}px 'Montserrat'`;
          const left = bx;
          bx += (measure(b.t + " ", font) / K);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: px(left),
                top: px(620),
                fontFamily: MONT,
                fontWeight: 400,
                fontSize: px(12.5),
                whiteSpace: "nowrap",
                color: b.c,
                ...blurIn(F, 153 + i * 1.6, 3),
              }}
            >
              {b.t}
            </div>
          );
        })}
      </div>
      {btn(
        BTN_F,
        165,
        C.azul,
        <div style={{ position: "relative" }}>
          <span style={{ opacity: 1 - labelSwap, filter: `blur(${labelSwap * 4}px)` }}>Seguir</span>
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: labelSwap,
              filter: `blur(${(1 - labelSwap) * 4}px)`,
            }}
          >
            Siguiendo
          </span>
        </div>,
        true
      )}
      {btn(BTN_M, 171, C.marino, <span style={{ color: C.hielo }}>Mensaje</span>)}
    </>
  );
};

const S4: React.FC<{ F: number }> = ({ F }) => {
  if (F < 134 || F > 227) return null;
  // cámara: zoom hacia el botón Seguir
  const z = inOut(interpolate(F, [196, 212], [0, 1], cl));
  const s = lerp(1, ZOOM.s, z);
  // isotipo: aparece al centro → viaja al avatar de la tarjeta
  const pop = interpolate(F, [135, 141], [0, 1], cl);
  const popS = Easing.out(Easing.back(1.6))(pop);
  const [ax, ay] = kf(F, [[143, 360, 630], [151, 196, 624]]);
  const move = inOut(interpolate(F, [143, 151], [0, 1], cl));
  const circle = interpolate(F, [149, 153], [0, 1], cl);
  return (
    <AbsoluteFill style={{ transformOrigin: `${px(ZOOM.ox)}px ${px(ZOOM.oy)}px`, transform: `scale(${s})` }}>
      <Card F={F} />
      {F < 221 && (
        <div style={{ opacity: pop }}>
          <Avatar
            x={lerp(360, ax, move)}
            y={lerp(630, ay, move)}
            d={F < 143 ? (100 / 0.6) * popS : lerp(100 / 0.6, 120, inOut(interpolate(F, [149, 153], [0, 1], cl)))}
            circle={circle}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------- Escena 6: tarjeta se expande, avatar vuela, pastilla, placa azul ----------------
// Trayectoria medida del original: [F, cx, cy, d] (espacio 720)
const AV_PATH = [
  [221, 264, 444, 217], [223, 131, 514, 216], [225, 26, 671, 215], [227, 54, 871, 212], [229, 194, 988, 209],
  [231, 367, 1012, 205], [233, 518, 993, 198], [235, 610, 897, 187], [237, 635, 785, 171], [239, 603, 692, 155],
  [241, 533, 649, 140], [243, 458, 645, 130], [245, 400, 644, 120], [247, 350, 643, 113], [249, 309, 643, 110],
  [251, 276, 643, 106], [253, 251, 643, 104], [257, 225, 643, 101], [261, 217, 643.5, 101], [285, 219, 643.5, 101],
  [289, 234, 643.5, 100], [293, 259, 643.5, 100], [297, 301, 643.5, 100], [301, 372, 643.5, 100], [303, 417, 643.5, 100],
  [305, 487, 643.5, 100], [307, 574, 643.5, 100], [309, 676, 643.5, 100], [311, 790, 643.5, 100],
];
// Placa azul: [F, x0, y0, x1, y1, radio]
const PLATE = [
  [221, 138.8, 612, 566, 682, 10.5], [227, 141, 606, 579, 681, 10.5], [289, 141, 606, 579, 681, 10.5],
  [293, 136, 584, 585, 701, 14], [297, 126, 549, 593, 737, 18], [301, 108, 474, 613, 811, 22],
  [303, 89, 399, 631, 887, 22], [305, 52, 246, 667, 1039, 20], [307, 6, 74, 715, 1213, 12], [309, 0, 10, 720, 1275, 4],
  [311, 0, 0, 720, 1280, 0],
];
// Tarjeta ampliada (espacio de pantalla) → cubre todo
const CARD_Z = { x0: 103.6, y0: 165.6, x1: 1051.5, y1: 779.1 };

const S6: React.FC<{ F: number; layer: "bg" | "fg" }> = ({ F, layer }) => {
  if (F < 221) return null;
  const ex = Easing.in(Easing.cubic)(interpolate(F, [221, 227], [0, 1], cl));
  const cr = [0, 1, 2, 3, 4].map((i) => lerp([CARD_Z.x0, CARD_Z.y0, CARD_Z.x1, CARD_Z.y1, 18 * ZOOM.s][i], [-300, -300, 1020, 1580, 0][i], ex));
  const [x0, y0, x1, y1, r] = kf(F, PLATE);
  const [avx, avy, avd] = kf(F, AV_PATH);
  // textos de la pastilla
  const pillFont = 26;
  const labelY = 643.5;
  const newT = interpolate(F, [298, 301], [1, 0], cl); // "keisoftware" se va
  const handleT = interpolate(F, [299.5, 304], [0, 1], cl); // "@keisoftware" entra
  const oldVisible = F < 256;
  const clipOld = `inset(0 ${px(720 - avx)}px 0 0)`; // visible a la izquierda del avatar
  const clipNew = `inset(0 0 0 ${px(avx)}px)`; // visible a la derecha del avatar
  const pillLabel = (text: string, cx: number, clip?: string, op = 1, weight = 500, size = pillFont) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: px(720),
        height: px(1280),
        clipPath: clip,
        opacity: op,
        filter: op < 1 ? `blur(${px((1 - op) * 5) / 2}px)` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: px(cx) - 400,
          width: 800,
          textAlign: "center",
          top: px(labelY) - px(size) * 0.62,
          fontFamily: MONT,
          fontWeight: weight,
          fontSize: px(size),
          lineHeight: 1,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
  if (layer === "bg")
    return (
      <div
        style={{
          position: "absolute",
          left: px(cr[0]),
          top: px(cr[1]),
          width: px(cr[2] - cr[0]),
          height: px(cr[3] - cr[1]),
          borderRadius: px(cr[4]),
          background: C.oscuro,
        }}
      />
    );
  return (
    <AbsoluteFill>
      {/* botón → pastilla → placa azul */}
      <div
        style={{
          position: "absolute",
          left: px(x0),
          top: px(y0),
          width: px(x1 - x0),
          height: px(y1 - y0),
          borderRadius: px(r),
          background: C.azul,
        }}
      />
      {oldVisible && pillLabel("Siguiendo", 360, F >= 239 ? clipOld : undefined)}
      {F >= 239 && F < 302 && pillLabel("keisoftware", 395, F < 256 ? clipNew : undefined, newT)}
      {F >= 299 && pillLabel("@keisoftware", 360, undefined, handleT, 700, 30)}
      {F < 311 && <Avatar x={avx} y={avy} d={avd} />}
    </AbsoluteFill>
  );
};

// ---------------- Composición ----------------
export const GAME_ORIG_FRAMES = 334;
const END60 = GAME_ORIG_FRAMES * 2; // 668: fin del original a 60 fps
const SKIP = 15;
const XFADE = 21;
export const GAME_TOTAL = END60 - SKIP + 240;

export const GameReel: React.FC = () => {
  const frame = useCurrentFrame();
  const F = frame / 2 + 1; // cuadro del original (30 fps, 1-based)
  const [handle] = useState(() => delayRender("fuentes"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  const bg = F < 227 ? C.claro : C.oscuro;
  const cierreOp = interpolate(frame, [END60, END60 + XFADE], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  const plateOut = interpolate(frame, [END60 - 6, END60 + 14], [0, 1], cl); // "@keisoftware" se despide

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {ready && frame < END60 + XFADE + 2 && (
        <AbsoluteFill style={{ transform: `scale(${1 + plateOut * 0.04})` }}>
          <S1 F={F} />
          <S2 F={F} />
          <S3 F={F} />
          <S6 F={Math.min(F, GAME_ORIG_FRAMES)} layer="bg" />
          <S4 F={F} />
          <S6 F={Math.min(F, GAME_ORIG_FRAMES)} layer="fg" />
        </AbsoluteFill>
      )}
      <Sequence from={END60 - SKIP} durationInFrames={240}>
        <AbsoluteFill style={{ opacity: cierreOp }}>
          <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile("game_audio.m4a")} />
      <Sequence from={Math.round(10.6 * 60)}>
        <Audio src={staticFile("whoosh.wav")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};
