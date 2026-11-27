import React, { createContext, useContext, useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { KeiCierre, BRAND } from "./KeiCierre";

// Formato PIZARRÓN: todo se "escribe y dibuja con tiza" sobre un pizarrón verde. Las piezas comunes están acá
// (fondo, grano de tiza, trazos que se dibujan solos, texto a mano, subtítulos, cierre con borrador). Cada reel
// (GpsReel, TactilReel, ...) sólo arma sus escenas con estos componentes y los tiempos de la voz (`w`).
// Assets: scripts/pizarron_assets.py (fondo, grano, sonidos). Guion y voz: scripts/explainer.py.

export const FPS = 30;
const CIERRE_FRAMES = 120; // 4 s
const SKIP = 12; // primer tramo del cierre (sólo fondo): se salteó para cerrar en ~30 s
const FADE = 0.28; // las escenas se "borran" en este tiempo
const C0_PAD = 0.12; // el cierre entra apenas termina la última palabra (igual que scripts/explainer.py)

export const C = {
  blanco: "#F4F2E8",
  amarillo: "#F3D660",
  rosa: "#F292B0",
  celeste: "#8FD0F2",
  verde: "#A9DE92",
  naranja: "#F4AA62",
  rojo: "#F27B70",
};
export const TITULO = "'Caveat Brush', 'Kalam', cursive";
export const MANO = "'Kalam', cursive";

const fontFaces = `
@font-face { font-family: 'Kalam'; src: url('${staticFile("kalam-400.woff2")}') format('woff2'); font-weight: 400; }
@font-face { font-family: 'Kalam'; src: url('${staticFile("kalam-700.woff2")}') format('woff2'); font-weight: 700; }
@font-face { font-family: 'Caveat Brush'; src: url('${staticFile("caveat-brush.woff2")}') format('woff2'); font-weight: 400; }`;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const useT = () => useCurrentFrame() / FPS;
export const ramp = (t: number, a: number, b: number, e: (n: number) => number = easeOut) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
export const pop = (t: number, a: number, damping = 12) =>
  t < a ? 0 : spring({ frame: Math.round((t - a) * FPS), fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } });
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------- Geometría "a mano" (con temblor) ----------------
type P = [number, number];
const f = (n: number) => n.toFixed(1);

/** Curva suave (Catmull-Rom) por los puntos. */
export const suave = (pts: P[], cerrado = false) => {
  const Q = cerrado ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f(Q[1][0])} ${f(Q[1][1])}`;
  for (let i = 1; i < Q.length - 2; i++) {
    const [p0, p1, p2, p3] = [Q[i - 1], Q[i], Q[i + 1], Q[i + 2]];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};

/** Poligonal con segmentos subdivididos y con un poco de temblor (rectas de tiza). */
export const recto = (pts: P[], seed = 1, amp = 1.8) => {
  let d = "";
  let k = 0;
  pts.forEach((p, i) => {
    if (i === 0) {
      d = `M${f(p[0])} ${f(p[1])}`;
      return;
    }
    const a = pts[i - 1];
    const n = Math.max(1, Math.round(Math.hypot(p[0] - a[0], p[1] - a[1]) / 90));
    for (let j = 1; j <= n; j++) {
      const tt = j / n;
      const jx = j === n ? 0 : (rnd(seed * 31 + k++) - 0.5) * 2 * amp;
      const jy = j === n ? 0 : (rnd(seed * 17 + k++) - 0.5) * 2 * amp;
      d += `L${f(a[0] + (p[0] - a[0]) * tt + jx)} ${f(a[1] + (p[1] - a[1]) * tt + jy)}`;
    }
  });
  return d;
};

export const linea = (x1: number, y1: number, x2: number, y2: number, seed = 1, amp = 1.8) => recto([[x1, y1], [x2, y2]], seed, amp);

export const circulo = (cx: number, cy: number, r: number, seed = 1, ry = r, vueltas = 1.06) => {
  const n = 26;
  const a0 = rnd(seed) * 6.28;
  const pts: P[] = [];
  for (let i = 0; i <= n * vueltas; i++) {
    const a = a0 + (i / n) * 6.2832;
    const k = 1 + (rnd(seed * 5 + i) - 0.5) * 0.03;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * ry * k]);
  }
  return suave(pts);
};

export const arco = (cx: number, cy: number, r: number, a0: number, a1: number, seed = 1) => {
  const n = Math.max(4, Math.round(Math.abs(a1 - a0) / 0.35));
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const k = 1 + (rnd(seed * 9 + i) - 0.5) * 0.02;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return suave(pts);
};

/** Rectángulo (con esquinas redondeadas si rad > 0). */
export const caja = (x: number, y: number, w: number, h: number, seed = 1, rad = 0, amp = 1.6) => {
  const j = (i: number) => (rnd(seed * 7 + i) - 0.5) * 2 * amp;
  if (rad <= 0)
    return recto([[x + j(0), y + j(1)], [x + w + j(2), y + j(3)], [x + w + j(4), y + h + j(5)], [x + j(6), y + h + j(7)], [x + j(8) + 3, y + j(9)]], seed, amp);
  const q = Math.min(rad, w / 2, h / 2);
  return (
    `M${f(x + q + 2)} ${f(y + j(0))}L${f(x + w - q)} ${f(y + j(1))}Q${f(x + w + j(2))} ${f(y)} ${f(x + w + j(3))} ${f(y + q)}` +
    `L${f(x + w + j(4))} ${f(y + h - q)}Q${f(x + w)} ${f(y + h + j(5))} ${f(x + w - q)} ${f(y + h + j(6))}` +
    `L${f(x + q)} ${f(y + h + j(7))}Q${f(x + j(8))} ${f(y + h)} ${f(x + j(9))} ${f(y + h - q)}` +
    `L${f(x + j(10))} ${f(y + q)}Q${f(x)} ${f(y + j(11))} ${f(x + q + 6)} ${f(y + j(12) - 1)}`
  );
};

/** Flecha de (x1,y1) a (x2,y2): cuerpo + punta (es un solo trazo continuo). */
export const flecha = (x1: number, y1: number, x2: number, y2: number, seed = 1, cab = 34) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1: P = [x2 - Math.cos(a - 0.5) * cab, y2 - Math.sin(a - 0.5) * cab];
  const p2: P = [x2 - Math.cos(a + 0.5) * cab, y2 - Math.sin(a + 0.5) * cab];
  return recto([[x1, y1], [x2, y2], p1, [x2, y2], p2], seed, 1.5);
};

/** Línea curva con forma de flecha (arco) */
export const flechaCurva = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, cab = 34) => {
  const a = Math.atan2(y2 - cy, x2 - cx);
  const p1: P = [x2 - Math.cos(a - 0.5) * cab, y2 - Math.sin(a - 0.5) * cab];
  const p2: P = [x2 - Math.cos(a + 0.5) * cab, y2 - Math.sin(a + 0.5) * cab];
  return `M${f(x1)} ${f(y1)}Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}L${f(p1[0])} ${f(p1[1])}M${f(x2)} ${f(y2)}L${f(p2[0])} ${f(p2[1])}`;
};

/** Onda senoidal horizontal. */
export const onda = (x: number, y: number, ancho: number, amp: number, ciclos: number, seed = 1) => {
  const n = Math.round(ciclos * 8);
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) pts.push([x + (ancho * i) / n, y + Math.sin((i / n) * ciclos * 6.2832) * amp * (1 + (rnd(seed + i) - 0.5) * 0.1)]);
  return suave(pts);
};

/** Zigzag / trazo en vaivén para "rellenar" con rayas. */
export const rayado = (x: number, y: number, w: number, h: number, paso = 22, seed = 1) => {
  const pts: P[] = [];
  let up = false;
  for (let xx = x; xx <= x + w; xx += paso) {
    pts.push(up ? [xx, y] : [xx - 10, y + h]);
    pts.push(up ? [xx + 10, y + h] : [xx, y]);
    up = !up;
  }
  return recto(pts, seed, 2);
};

/** Barras verticales (relleno de una batería, de un gráfico...). */
export const barras = (x: number, y: number, w: number, h: number, paso = 14, seed = 1) => {
  let d = "";
  let k = 0;
  for (let xx = x; xx <= x + w + 0.1; xx += paso) {
    d += `M${f(xx + (rnd(seed + k++) - 0.5) * 2)} ${f(y)}L${f(xx + (rnd(seed + k++) - 0.5) * 2)} ${f(y + h)}`;
  }
  return d;
};

// ---------------- Trazo, dibujo y texto con tiza ----------------
const EscalaCtx = createContext(1);

const Punta: React.FC<{ x: number; y: number; c: string; s: number; ang?: number }> = ({ x, y, c, s, ang = 38 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${1 / s})`}>
    <rect x={-9} y={-5} width={18} height={62} rx={7} fill={c} opacity={0.96} />
    <rect x={-9} y={-5} width={18} height={10} rx={5} fill="#fff" opacity={0.35} />
  </g>
);

/** Micro-sonido suave (pop, tick, whoosh...) en el segundo t. Minimalista: sólo en títulos, signos y cambios de escena. */
export const Sonido: React.FC<{ t: number; f?: string; v?: number }> = ({ t, f = "qr_pop.wav", v = 0.2 }) => (
  <Sequence layout="none" from={Math.max(0, Math.round(t * FPS))} durationInFrames={Math.round(1.7 * FPS)}>
    <Audio src={staticFile(f)} volume={v} />
  </Sequence>
);

export type Tr = { d: string; c?: string; w?: number; relleno?: boolean | string; op?: number };

/** Un trazo que se dibuja solo entre t0 y t0+dur, con la punta de la tiza siguiéndolo. */
export const Trazo: React.FC<{
  d: string; t0: number; dur?: number; c?: string; w?: number; relleno?: boolean | string; punta?: boolean; sonido?: boolean; op?: number;
}> = ({ d, t0, dur = 0.5, c = C.blanco, w = 7, relleno, punta = true, sonido = true, op = 1 }) => {
  const t = useT();
  const s = useContext(EscalaCtx);
  const L = useMemo(() => getLength(d), [d]);
  const p = ramp(t, t0, t0 + dur, Easing.inOut(Easing.sin));
  const pt = punta && p > 0 && p < 1 ? getPointAtLength(d, p * L) : null;
  const rel = relleno ? (relleno === true ? c : relleno) : null;
  return (
    <>
      {p > 0.001 && (
        <g opacity={op}>
          {rel && <path d={d} fill={rel} fillOpacity={0.2 * ramp(t, t0 + dur * 0.9, t0 + dur + 0.35)} stroke="none" />}
          <path d={d} fill="none" stroke={c} strokeWidth={w / s} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
            strokeDasharray={`${p} 3`} opacity={0.92} />
          <path d={d} fill="none" stroke={c} strokeWidth={(w * 0.42) / s} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
            strokeDasharray={`${p} 3`} opacity={0.5} transform={`translate(${1.7 / s} ${-1.3 / s})`} />
          {pt && <Punta x={pt.x} y={pt.y} c={c} s={s} />}
        </g>
      )}
    </>
  );
};

/** Dibujo compuesto por varios trazos: el tiempo se reparte según el largo de cada uno. */
export const Dib: React.FC<{
  x: number; y: number; s?: number; rot?: number; t0: number; dur?: number; c?: string; w?: number; trazos: Tr[]; sonido?: boolean; punta?: boolean;
}> = ({ x, y, s = 1, rot = 0, t0, dur = 0.8, c = C.blanco, w = 7, trazos, sonido = true, punta = true }) => {
  const largos = useMemo(() => trazos.map((tr) => Math.max(8, getLength(tr.d))), [trazos]);
  const total = largos.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <EscalaCtx.Provider value={s}>
        {trazos.map((tr, i) => {
          const a = t0 + (dur * acc) / total;
          const d = (dur * largos[i]) / total;
          acc += largos[i];
          return <Trazo key={i} d={tr.d} t0={a} dur={Math.max(0.06, d)} c={tr.c ?? c} w={tr.w ?? w} relleno={tr.relleno} op={tr.op} sonido={sonido && i === 0 ? true : false} punta={punta} />;
        })}
      </EscalaCtx.Provider>
    </g>
  );
};

/** Texto escrito a mano: se revela de izquierda a derecha con la tiza en la punta. */
export const Texto: React.FC<{
  children: string; x: number; y: number; t0: number; dur?: number; c?: string; size?: number; titulo?: boolean;
  anchor?: "start" | "middle" | "end"; rot?: number; peso?: number; op?: number;
}> = ({ children, x, y, t0, dur, c = C.blanco, size = 64, titulo = false, anchor = "middle", rot = 0, peso = 700, op = 1 }) => {
  const t = useT();
  const est = children.length * size * (titulo ? 0.5 : 0.47);
  const d = dur ?? Math.min(1.4, 0.25 + children.length * 0.045);
  const p = ramp(t, t0, t0 + d, Easing.inOut(Easing.quad));
  const x0 = anchor === "start" ? x : anchor === "middle" ? x - est / 2 : x - est;
  const id = `cp_${Math.round(x)}_${Math.round(y)}_${Math.round(t0 * 100)}_${children.length}`;
  const tip = x0 + est * 1.08 * p;
  return (
    <>
      {p > 0.001 && (
        <g transform={`rotate(${rot} ${x} ${y})`} opacity={op}>
          {p < 1 && (
            <clipPath id={id}>
              <rect x={x0 - 20} y={y - size * 1.2} width={est * 1.08 * p + 20} height={size * 1.8} />
            </clipPath>
          )}
          <g clipPath={p < 1 ? `url(#${id})` : undefined}>
            <text x={x} y={y} textAnchor={anchor} fill={c} fontFamily={titulo ? TITULO : MANO} fontSize={size}
              fontWeight={titulo ? 400 : peso} opacity={0.96}>
              {children}
            </text>
            <text x={x + 1.4} y={y - 1} textAnchor={anchor} fill={c} fontFamily={titulo ? TITULO : MANO} fontSize={size}
              fontWeight={titulo ? 400 : peso} opacity={0.22}>
              {children}
            </text>
          </g>
          {p < 1 && <Punta x={tip} y={y - size * 0.18 + Math.sin(t * 38) * 3} c={c} s={1} ang={30} />}
        </g>
      )}
    </>
  );
};

/** Título de escena (una o dos líneas) con subrayado ondulado. */
export const Titular: React.FC<{ lineas: string[]; t0: number; c?: string; y?: number; size?: number; subr?: boolean }> = ({
  lineas, t0, c = C.amarillo, y = 330, size = 108, subr = true,
}) => {
  let acc = t0;
  return (
    <>
      <Sonido t={t0} f="qr_pop.wav" v={0.22} />
      {lineas.map((l, i) => {
        const d = Math.min(0.9, 0.25 + l.length * 0.05);
        const el = <Texto key={i} x={540} y={y + i * (size + 10)} t0={acc} dur={d} c={c} size={size} titulo>{l}</Texto>;
        acc += d + 0.04;
        return el;
      })}
      {subr && (
        <Trazo d={onda(260, y + (lineas.length - 1) * (size + 10) + 34, 560, 6, 4, 4)} t0={acc} dur={0.45} c={c} w={5} />
      )}
    </>
  );
};

/** Aparece con "pop" (para cosas que no se dibujan: signos, sellos). */
export const Pop: React.FC<{ t0: number; x: number; y: number; children: React.ReactNode; rot?: number }> = ({ t0, x, y, children, rot = 0 }) => {
  const t = useT();
  const p = pop(t, t0, 11);
  if (p <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`}>
      <Sonido t={t0} f="qr_pop.wav" v={0.2} />
      {children}
    </g>
  );
};

// ---------------- Composición base ----------------
type Palabra = { w: string; s: number; e: number };
type Voz = { escenas: { id: string; texto: string; s: number; e: number; palabras: Palabra[] }[] };
export type Sfx = [string, number, number]; // archivo en public, segundo, volumen

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const crearPizarron = (voz: Voz) => {
  const ESC = Object.fromEntries(voz.escenas.map((e) => [e.id, e]));
  const IDS = voz.escenas.map((e) => e.id);
  const C0 = voz.escenas[voz.escenas.length - 1].e + C0_PAD;
  const TOTAL = Math.round(C0 * FPS) - SKIP + CIERRE_FRAMES;

  /** Tiempo (s) en que la voz dice una palabra de una escena (sin importar tildes ni mayúsculas); n = ocurrencia. */
  const w = (id: string, palabra: string, n = 0) => {
    const q = norm(palabra);
    const ps = ESC[id].palabras.filter((p) => norm(p.w) === q);
    if (!ps.length) throw new Error(`Palabra "${palabra}" no está en la escena ${id}`);
    return (ps[n] ?? ps[0]).s;
  };
  const desde = (id: string) => Math.max(0, ESC[id].s - 0.12);
  const hasta = (id: string) => {
    const i = IDS.indexOf(id);
    return i < IDS.length - 1 ? desde(IDS[i + 1]) : C0;
  };

  /** Una escena es una capa SVG de 1080x1920 que se "borra" (se desvanece con un barrido) al terminar. */
  const Escena: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const t = useT();
    const a = desde(id), b = hasta(id);
    if (t < a - 0.01 || t > b + FADE) return null;
    const out = ramp(t, b, b + FADE, Easing.in(Easing.quad));
    return (
      <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0 ? `blur(${out * 6}px)` : undefined }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {/* Los dibujos se arman en 1080x1920 "chico": se agrandan 8% y bajan un poco para llenar el pizarrón */}
          <g transform="translate(540 940) scale(1.08) translate(-540 -900)">
            <Sonido t={a} f="whoosh.wav" v={0.07} />
            {children}
          </g>
        </svg>
      </AbsoluteFill>
    );
  };

  // Bloques de 3-4 palabras: corta en puntuación y nunca deja una palabra sola al final de una frase
  const BLOQUES = (() => {
    const out: { ps: Palabra[]; txt: string[]; s: number; e: number }[] = [];
    for (const esc of voz.escenas) {
      let pos = 0;
      let cur: Palabra[] = [], txt: string[] = [];
      esc.palabras.forEach((p, i) => {
        const cw = p.w.replace(/[.,;:?!¿¡]/g, ""); // algunas voces devuelven la palabra con su puntuación
        const idx = esc.texto.indexOf(cw, pos);
        let shown = cw;
        let corte = false;
        if (idx >= 0) {
          if (esc.texto[idx - 1] === "¿") shown = "¿" + shown;
          if (esc.texto[idx - 1] === "¡") shown = "¡" + shown;
          const sig = esc.texto[idx + cw.length] ?? "";
          if (sig === "?" || sig === "!") shown += sig;
          corte = /[.,:?!]/.test(sig);
          pos = idx + cw.length;
        }
        cur.push(p);
        txt.push(shown);
        const resto = esc.palabras.length - 1 - i;
        if ((cur.length >= 4 && resto !== 1) || corte || resto === 0) {
          out.push({ ps: cur, txt, s: cur[0].s, e: cur[cur.length - 1].e });
          cur = [];
          txt = [];
        }
      });
    }
    return out.map((b, i) => ({ ...b, e: Math.min(out[i + 1]?.s ?? b.e + 0.4, b.e + 0.5) }));
  })();

  const Subtitulos: React.FC = () => {
    const t = useT();
    const b = BLOQUES.find((x) => t >= x.s - 0.04 && t < x.e);
    if (!b) return null;
    const p = pop(t, b.s - 0.04, 16);
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: 1480, transform: `translateY(-50%) scale(${0.94 + 0.06 * p})`,
        display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22, textAlign: "center", fontFamily: MANO,
        fontWeight: 700, fontSize: 78, lineHeight: 1.1, opacity: Math.min(1, p * 2) }}>
        {b.ps.map((pw, i) => {
          const activa = t >= pw.s - 0.03 && t < (b.ps[i + 1] ? b.ps[i + 1].s - 0.03 : b.e);
          return (
            <span key={i} style={{ color: activa ? C.amarillo : C.blanco }}>{b.txt[i]}</span>
          );
        })}
      </div>
    );
  };

  // Línea de tiza arriba que avanza con el video (retención)
  const Progreso: React.FC = () => {
    const t = useT();
    const p = Math.pow(Math.min(1, t / C0), 0.9);
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M70 178 L1010 178" stroke={C.blanco} strokeOpacity={0.22} strokeWidth={9} strokeLinecap="round" />
        <path d="M70 178 L1010 178" stroke={C.amarillo} strokeOpacity={0.9} strokeWidth={9} strokeLinecap="round" pathLength={1}
          strokeDasharray={`${p} 3`} />
      </svg>
    );
  };

  const Base: React.FC<{ audio: string; sfx?: Sfx[]; children: React.ReactNode }> = ({ audio, sfx = [], children }) => {
    const t = useT();
    const e = ramp(t, C0, C0 + 0.55, easeInOut);
    return (
      <AbsoluteFill style={{ backgroundColor: "#2c4a3a" }}>
        <style>{fontFaces}</style>
        {t < C0 + 0.6 && (
          <>
            <AbsoluteFill style={{ backgroundImage: `url(${staticFile("pz_fondo.png")})`, backgroundSize: "100% 100%" }} />
            {/* La capa de tiza lleva el grano: así los trazos se ven polvorientos, no vectoriales */}
            <AbsoluteFill style={{ WebkitMaskImage: `url(${staticFile("pz_grano.png")})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile("pz_grano.png")})`, maskSize: "100% 100%" }}>
              {children}
              <Subtitulos />
              <Progreso />
              <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
                <text x={72} y={1752} fill={C.blanco} fontFamily={MANO} fontSize={36} opacity={0.55}>@keisoftware</text>
              </svg>
            </AbsoluteFill>
          </>
        )}
        {/* Cierre KEI: el borrador pasa de izquierda a derecha y deja la placa */}
        <Sequence from={Math.round(C0 * FPS) - SKIP} durationInFrames={CIERRE_FRAMES}>
          <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - e) * 100}% 0 0)`, backgroundColor: BRAND.fondoOscuro }}>
            <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
          </AbsoluteFill>
        </Sequence>
        {e > 0 && e < 1 && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: e * 1080 - 70, width: 150,
            background: "linear-gradient(90deg, #8a5a2c 0%, #8a5a2c 22%, #55575d 22%, #6c6e76 100%)",
            boxShadow: "-14px 0 40px rgba(0,0,0,.45)" }} />
        )}
        <Audio src={staticFile(`${audio}_voz.wav`)} />
        <Audio src={staticFile(`${audio}_musica.wav`)} />
        <Sequence from={Math.round(C0 * FPS) - 4} durationInFrames={FPS * 2}>
          <Audio src={staticFile("whoosh.wav")} volume={0.3} />
        </Sequence>
        {sfx.map(([file, s, v], i) => (
          <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={FPS}>
            <Audio src={staticFile(file)} volume={v} />
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  };

  return { ESC, w, desde, hasta, C0, TOTAL, Escena, Base };
};
