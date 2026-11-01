import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KeiCierre, BRAND, fontFace, Fondo } from "./KeiCierre";
import voz from "./qrVoz.json";
import qrData from "./qrMatrix.json";

// Reel explicativo "¿Cómo funciona un QR?": voz en off (scripts/qr_voz.py), subtítulos palabra por palabra,
// animación con personajes (Sofi en un bar) y cierre KEI. Las escenas se sincronizan con los tiempos de
// cada palabra de qrVoz.json; el QR es real (scripts/qr_assets.py) y abre el Instagram de KEI.

const FPS = 60;
const CIERRE_FRAMES = 240;
const SKIP = 15; // primer tramo del cierre (sólo fondo)
const FADE = 0.3; // crossfade entre escenas
const ESC = Object.fromEntries(voz.escenas.map((e) => [e.id, e]));
const C0 = ESC.cta.e + 0.35; // entra el cierre
export const QR_TOTAL = Math.round(C0 * FPS) - SKIP + CIERRE_FRAMES;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const COFFEE = "#6B4426";
const PIEL = "#F2C6A0";

// Tiempo (s) de una palabra de una escena; n = ocurrencia
const w = (id: string, palabra: string, n = 0) => {
  const ps = ESC[id].palabras.filter((p) => p.w === palabra);
  return (ps[n] ?? ps[0]).s;
};
// Ventana de cada escena: desde un poco antes de su primera palabra hasta que entra la siguiente
const IDS = voz.escenas.map((e) => e.id);
const desde = (id: string) => Math.max(0, ESC[id].s - 0.15);
const hasta = (id: string) => {
  const i = IDS.indexOf(id);
  return i < IDS.length - 1 ? desde(IDS[i + 1]) : C0;
};

const useT = () => useCurrentFrame() / FPS;
const ramp = (t: number, a: number, b: number, e = easeOut) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
const pop = (t: number, a: number, damping = 12) =>
  t < a ? 0 : spring({ frame: Math.round((t - a) * FPS), fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } });
const hash = (r: number, c: number) => {
  const x = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------- QR ----------------
const N = qrData.n;
const M = qrData.m.map((fila) => fila.split("").map(Number));
const FINDERS: [number, number][] = [
  [0, 0],
  [0, N - 7],
  [N - 7, 0],
];
const esFinder = (r: number, c: number) => FINDERS.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
const Q = 2; // margen blanco en módulos

// Mancha y esquina rota (escena "mancha"): fuera de patrones, timing e info de formato
const MANCHA = { cx: 19.5, cy: 20, r: 5.2 };
const CORTE = 59; // la esquina rota saca los módulos con fila + columna > CORTE
const manchaPath = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rr = MANCHA.r * (1 + 0.16 * Math.sin(a * 3 + 1) + 0.09 * Math.sin(a * 7) + (i % 2 ? 0.05 : -0.04));
    pts.push(`${(MANCHA.cx + Math.cos(a) * rr).toFixed(2)},${(MANCHA.cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();
const bordeRoto = (corte: number) => {
  // línea dentada de (N+Q, corte-(N+Q)) a (corte-(N+Q), N+Q)
  const p: string[] = [];
  const x0 = N + Q, y0 = corte - (N + Q);
  const pasos = 12;
  for (let i = 0; i <= pasos; i++) {
    const x = x0 - ((x0 - (corte - (N + Q))) * i) / pasos;
    const y = y0 + ((N + Q - y0) * i) / pasos;
    const o = i === 0 || i === pasos ? 0 : (i % 2 ? 0.45 : -0.35);
    p.push(`${(x + o).toFixed(2)},${(y + o).toFixed(2)}`);
  }
  return p;
};

type QRProps = {
  size: number; // px del QR completo (con margen)
  aparece?: (r: number, c: number) => number;
  gap?: number;
  dim?: number;
  glow?: number[]; // brillo por finder
  labels?: { uno: number; cero: number };
  fila?: number | null;
  resalte?: { r: number; c0: number; c1: number; p: number } | null;
  mancha?: number;
  rotura?: number;
  respaldo?: number; // destellos azules en módulos (información de respaldo)
  t?: number;
  marco?: number;
};

const QR: React.FC<QRProps> = ({
  size, aparece, gap = 0, dim = 0, glow, labels, fila = null, resalte = null, mancha = 0, rotura = 0, respaldo = 0, t = 0, marco = 0,
}) => {
  const V = N + Q * 2;
  const corte = interpolate(rotura, [0, 1], [2 * (N + Q) + 1, CORTE]);
  const clipId = `corte${size}`;
  const mods: React.ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const on = M[r][c] === 1;
      const p = aparece ? aparece(r, c) : 1;
      if (p <= 0) continue;
      const jx = gap * (hash(r, c) - 0.5) * 0.5;
      const jy = gap * (hash(c, r) - 0.5) * 0.5;
      const s = (1 - gap) * p;
      const x = c + (1 - s) / 2 + jx;
      const y = r + (1 - s) / 2 + jy;
      const atenuado = dim > 0 && !esFinder(r, c) ? 1 - dim * 0.8 : 1;
      const brillo = respaldo > 0 && on && hash(r * 3, c * 5) > 0.82 ? Math.max(0, Math.sin(t * 9 + hash(r, c) * 20)) * respaldo : 0;
      if (on) {
        mods.push(
          <rect key={`${r}-${c}`} x={x} y={y} width={s + 0.02} height={s + 0.02} rx={gap > 0 ? 0.12 : 0}
            fill={brillo > 0.3 ? BRAND.azulUI : BRAND.fondoOscuro} opacity={atenuado * Math.min(1, p * 1.5)} />,
        );
      } else if (gap > 0) {
        mods.push(<rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} rx={0.12} fill={BRAND.azulHielo} opacity={0.55 * atenuado} />);
      }
      if (labels && (labels.uno > 0 || labels.cero > 0)) {
        const o = on ? labels.uno : labels.cero;
        if (o > 0)
          mods.push(
            <text key={`l${r}-${c}`} x={c + 0.5} y={r + 0.69} fontSize={0.52} textAnchor="middle" fontFamily="Montserrat" fontWeight={700}
              fill={on ? "#FFFFFF" : BRAND.azulUI} opacity={o}>
              {on ? "1" : "0"}
            </text>,
          );
      }
    }
  }
  const rb = bordeRoto(corte);
  return (
    <svg width={size} height={size} viewBox={`${-Q} ${-Q} ${V} ${V}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id={clipId}>
          <polygon points={[`${-Q},${-Q}`, `${N + Q},${-Q}`, ...rb, `${-Q},${N + Q}`].join(" ")} />
        </clipPath>
      </defs>
      <g clipPath={rotura > 0 ? `url(#${clipId})` : undefined}>
        <rect x={-Q} y={-Q} width={V} height={V} rx={1.2} fill="#FFFFFF" />
        {mods}
        {mancha > 0 && (
          <g transform={`translate(${MANCHA.cx} ${MANCHA.cy}) scale(${mancha}) translate(${-MANCHA.cx} ${-MANCHA.cy})`}>
            <path d={manchaPath} fill={COFFEE} opacity={0.93} />
            <path d={manchaPath} fill="none" stroke="#4A2C16" strokeWidth={0.35} opacity={0.8} />
            <circle cx={MANCHA.cx + 6.6} cy={MANCHA.cy - 3.2} r={0.7} fill={COFFEE} opacity={0.9} />
            <circle cx={MANCHA.cx - 5.8} cy={MANCHA.cy + 4.4} r={0.5} fill={COFFEE} opacity={0.9} />
          </g>
        )}
      </g>
      {fila !== null && fila >= 0 && fila < N && (
        <g>
          <rect x={-0.3} y={fila} width={N + 0.6} height={1} fill={BRAND.azulUI} opacity={0.35} />
          <rect x={-1} y={fila + 1} width={N + 2} height={0.18} fill={BRAND.azulUI} />
        </g>
      )}
      {resalte && resalte.p > 0 && (
        <rect x={resalte.c0 - 0.12} y={resalte.r - 0.12} width={resalte.c1 - resalte.c0 + 1.24} height={1.24} rx={0.2}
          fill="none" stroke={BRAND.azulUI} strokeWidth={0.16} opacity={resalte.p} />
      )}
      {glow &&
        FINDERS.map(([fr, fc], i) => {
          const g = glow[i] ?? 0;
          if (g <= 0) return null;
          const cx = fc + 3.5, cy = fr + 3.5;
          const sc = 1 + 0.06 * Math.sin(t * 6 + i);
          return (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${sc * (0.6 + 0.4 * g)}) translate(${-cx} ${-cy})`} opacity={g}>
              <rect x={fc - 0.7} y={fr - 0.7} width={8.4} height={8.4} rx={1} fill={BRAND.azulUI} opacity={0.18} />
              <rect x={fc - 0.7} y={fr - 0.7} width={8.4} height={8.4} rx={1} fill="none" stroke={BRAND.azulUI} strokeWidth={0.4} />
            </g>
          );
        })}
      {marco > 0 && (
        <rect x={-Q - 1.6} y={-Q - 1.6} width={V + 3.2} height={V + 3.2} rx={0.6} fill="none" stroke="#C9A36B"
          strokeWidth={2.2} opacity={marco} />
      )}
    </svg>
  );
};

// Pedazo arrancado (sigue la forma del corte) para que salga volando
const PedazoRoto: React.FC<{ size: number; p: number }> = ({ size, p }) => {
  const V = N + Q * 2;
  const rb = bordeRoto(CORTE);
  const mods: React.ReactNode[] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (r + c > CORTE - 2 && M[r][c]) mods.push(<rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} fill={BRAND.fondoOscuro} />);
  return (
    <svg width={size} height={size} viewBox={`${-Q} ${-Q} ${V} ${V}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible",
        transform: `translate(${p * 160}px, ${p * p * 900}px) rotate(${p * 70}deg)`, transformOrigin: "85% 85%", opacity: 1 - ramp(p, 0.6, 1, Easing.linear) }}>
      <defs>
        <clipPath id="pedazo">
          <polygon points={[...rb, `${N + Q},${N + Q}`].join(" ")} />
        </clipPath>
      </defs>
      <g clipPath="url(#pedazo)">
        <rect x={-Q} y={-Q} width={V} height={V} rx={1.2} fill="#FFFFFF" />
        {mods}
      </g>
    </svg>
  );
};

// Esquinas de visor de cámara alrededor de un recuadro
const Visor: React.FC<{ w: number; h: number; snap: number; ok?: number; opacity?: number }> = ({ w: W, h, snap, ok = 0, opacity = 1 }) => {
  const pad = interpolate(snap, [0, 1], [70, 16]);
  const L = 70;
  const color = ok > 0.5 ? BRAND.azulUI : "#FFFFFF";
  const corner = (st: React.CSSProperties) => (
    <div style={{ position: "absolute", width: L, height: L, borderColor: color, borderStyle: "solid", borderWidth: 0, ...st }} />
  );
  const b = 9;
  return (
    <div style={{ position: "absolute", left: -pad, top: -pad, width: W + pad * 2, height: h + pad * 2, opacity, pointerEvents: "none" }}>
      {corner({ left: 0, top: 0, borderTopWidth: b, borderLeftWidth: b, borderTopLeftRadius: 22 })}
      {corner({ right: 0, top: 0, borderTopWidth: b, borderRightWidth: b, borderTopRightRadius: 22 })}
      {corner({ left: 0, bottom: 0, borderBottomWidth: b, borderLeftWidth: b, borderBottomLeftRadius: 22 })}
      {corner({ right: 0, bottom: 0, borderBottomWidth: b, borderRightWidth: b, borderBottomRightRadius: 22 })}
    </div>
  );
};

const Check: React.FC<{ p: number; size?: number; style?: React.CSSProperties }> = ({ p, size = 120, style }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: BRAND.azulUI,
      boxShadow: `0 0 50px ${BRAND.azulUI}aa`, display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p})`, ...style }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

// ---------------- Personajes ----------------
type PersonaProps = {
  x: number;
  y: number; // pies
  escala?: number;
  remera: string;
  pantalon?: string;
  pelo: string;
  peinado: "largo" | "corto";
  piel?: string;
  brazoD?: number; // grados: 0 = colgando, 90 = horizontal hacia afuera, 150 = arriba
  brazoI?: number;
  delantal?: boolean;
  fase?: number;
  opacity?: number;
  celular?: number; // 0..1 celular en la mano izquierda
};

const Persona: React.FC<PersonaProps> = ({
  x, y, escala = 1, remera, pantalon = BRAND.azulMarino, pelo, peinado, piel = PIEL, brazoD = 8, brazoI = 8, delantal, fase = 0, opacity = 1, celular = 0,
}) => {
  const t = useT();
  const bob = Math.sin(t * 2.4 + fase) * 4;
  const parpadeo = (t + fase) % 3.4 < 0.12 ? 0.15 : 1;
  const brazo = (lado: 1 | -1, ang: number, hijo?: React.ReactNode) => (
    <g transform={`translate(${lado * 66} -372) rotate(${-lado * ang})`}>
      <rect x={-17} y={-6} width={34} height={168} rx={17} fill={remera} />
      <circle cx={0} cy={168} r={20} fill={piel} />
      {hijo}
    </g>
  );
  return (
    <svg width={400 * escala} height={640 * escala} viewBox="-200 -600 400 640"
      style={{ position: "absolute", left: x - 200 * escala, top: y - 600 * escala, overflow: "visible", opacity }}>
      <g transform={`translate(0 ${bob * 0.3})`}>
        <rect x={-46} y={-205} width={36} height={205} rx={16} fill={pantalon} />
        <rect x={10} y={-205} width={36} height={205} rx={16} fill={pantalon} />
        <ellipse cx={-30} cy={2} rx={34} ry={14} fill="#0B1230" />
        <ellipse cx={30} cy={2} rx={34} ry={14} fill="#0B1230" />
      </g>
      <g transform={`translate(0 ${bob})`}>
        {brazo(-1, brazoI, celular > 0 ? (
          <g transform={`translate(0 170) rotate(${180 - brazoI * 0.4}) scale(${celular})`}>
            <rect x={-26} y={-6} width={52} height={92} rx={10} fill="#0B1230" stroke="#3A4466" strokeWidth={4} />
            <rect x={-19} y={2} width={38} height={72} rx={5} fill={BRAND.azulUI} opacity={0.8} />
          </g>
        ) : undefined)}
        <rect x={-74} y={-400} width={148} height={222} rx={56} fill={remera} />
        {delantal && <rect x={-56} y={-318} width={112} height={150} rx={14} fill="#FFFFFF" opacity={0.95} />}
        {brazo(1, brazoD)}
        <rect x={-18} y={-430} width={36} height={40} rx={10} fill={piel} />
        {peinado === "largo" && (
          <>
            <rect x={-80} y={-500} width={44} height={150} rx={22} fill={pelo} />
            <rect x={36} y={-500} width={44} height={150} rx={22} fill={pelo} />
          </>
        )}
        <circle cx={0} cy={-478} r={66} fill={piel} />
        {peinado === "largo" ? (
          <path d="M-70 -478 Q-72 -560 0 -556 Q72 -560 70 -478 Q40 -530 -10 -520 Q-50 -512 -70 -478 Z" fill={pelo} />
        ) : (
          <path d="M-66 -486 Q-66 -560 0 -558 Q66 -560 66 -486 Q30 -524 -66 -486 Z" fill={pelo} />
        )}
        <ellipse cx={-23} cy={-476} rx={7} ry={7 * parpadeo} fill="#1B2140" />
        <ellipse cx={23} cy={-476} rx={7} ry={7 * parpadeo} fill="#1B2140" />
        <path d="M-20 -446 Q0 -430 20 -446" fill="none" stroke="#1B2140" strokeWidth={5} strokeLinecap="round" />
        <circle cx={-40} cy={-452} r={9} fill="#F49A8C" opacity={0.45} />
        <circle cx={40} cy={-452} r={9} fill="#F49A8C" opacity={0.45} />
      </g>
    </svg>
  );
};

const SOFI = { remera: BRAND.azulUI, pelo: "#3B2417", peinado: "largo" as const };

// ---------------- Escena (crossfade) ----------------
const Escena: React.FC<{ id: string; children: React.ReactNode; zoom?: { x: number; y: number; s: number } }> = ({ id, children, zoom }) => {
  const t = useT();
  const a = desde(id), b = hasta(id);
  if (t < a - 0.01 || t > b + FADE) return null;
  const inP = a < 0.05 ? 1 : ramp(t, a, a + FADE);
  const outP = ramp(t, b, b + FADE, Easing.in(Easing.quad));
  let transform = `scale(${0.94 + 0.06 * inP + (zoom ? 0 : 0.05 * outP)})`;
  let origin = "50% 42%";
  if (zoom) {
    transform = `scale(${(0.94 + 0.06 * inP) * interpolate(outP, [0, 1], [1, zoom.s])})`;
    origin = `${zoom.x}px ${zoom.y}px`;
  }
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), transform, transformOrigin: origin }}>{children}</AbsoluteFill>
  );
};

const Centro: React.FC<{ x?: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x = 540, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>{children}</div>
);

const Chip: React.FC<{ children: React.ReactNode; p: number; style?: React.CSSProperties }> = ({ children, p, style }) => (
  <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${p})`, opacity: Math.min(1, p * 2), whiteSpace: "nowrap",
    fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 46, color: "#fff", padding: "14px 30px", borderRadius: 999,
    background: `${BRAND.azulMarino}EE`, border: `2px solid ${BRAND.azulUI}88`, display: "flex", alignItems: "center", gap: 16, ...style }}>
    {children}
  </div>
);

// ---------------- Escenas ----------------
const QR_Y = 760;

const Hook: React.FC = () => {
  const t = useT();
  const S = 600;
  const aparece = (r: number, c: number) => {
    const d = esFinder(r, c) ? 0.05 + 0.08 * FINDERS.findIndex(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7) : 0.3 + hash(r, c) * 0.75;
    return ramp(t, d, d + 0.22);
  };
  const scan = ramp(t, 1.35, 2.45, easeInOut);
  const snap = pop(t, w("hook", "segundo") - 0.15, 14);
  const ok = pop(t, w("hook", "segundo") + 0.1);
  return (
    <Escena id="hook">
      <Centro y={QR_Y}>
        <div style={{ position: "relative", width: S, height: S, filter: `drop-shadow(0 30px 60px ${BRAND.azulUI}44)` }}>
          <QR size={S} aparece={aparece} />
          {scan > 0 && scan < 1 && (
            <div style={{ position: "absolute", left: -30, right: -30, top: scan * S - 3, height: 6, background: BRAND.azulUI,
              boxShadow: `0 0 30px 8px ${BRAND.azulUI}aa`, borderRadius: 3 }} />
          )}
          <Visor w={S} h={S} snap={snap} ok={ok} opacity={ramp(t, 1.2, 1.5)} />
          <Check p={ok} style={{ right: -135, top: -135 }} />
        </div>
      </Centro>
    </Escena>
  );
};

const PISO = 1230;
const MESA = { x: 560, y: 1000 };
const STAND = { x: 560, y: 905, s: 128 };

const Bar: React.FC = () => {
  const t = useT();
  const sofiIn = ramp(t, desde("bar"), w("bar", "Sofi") + 0.2);
  const nombre = pop(t, w("bar", "Sofi"));
  const cartel = pop(t, w("bar", "bar"));
  const burbuja = pop(t, w("bar", "pide"));
  const mozoIn = ramp(t, w("bar", "carta") - 0.3, w("bar", "y") + 0.2);
  const senala = ramp(t, w("bar", "señalan") - 0.1, w("bar", "señalan") + 0.3);
  const anillo = ramp(t, w("bar", "esto"), w("bar", "esto") + 0.6, Easing.linear);
  const luz = 0.75 + 0.25 * ramp(t, w("bar", "Llega"), w("bar", "bar"));
  return (
    <Escena id="bar" zoom={{ x: STAND.x, y: STAND.y, s: 4.2 }}>
      {/* lámpara colgante */}
      <div style={{ position: "absolute", left: MESA.x - 2, top: 330, width: 4, height: 250, background: "#3A4466" }} />
      <svg style={{ position: "absolute", left: MESA.x - 110, top: 560 }} width={220} height={120} viewBox="0 0 220 120">
        <path d="M20 100 Q110 -20 200 100 Z" fill={BRAND.azulMarino} stroke={BRAND.azulUI} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: MESA.x - 300, top: 640, width: 600, height: 520, opacity: luz * 0.5,
        background: `radial-gradient(ellipse 50% 100% at 50% 0%, ${BRAND.azulHielo}55 0%, transparent 100%)` }} />
      {/* cartel BAR */}
      <Chip p={cartel} style={{ left: 860, top: 430, fontSize: 64, letterSpacing: 8, padding: "12px 34px",
        boxShadow: `0 0 40px ${BRAND.azulUI}88`, border: `3px solid ${BRAND.azulUI}` }}>
        BAR
      </Chip>
      {/* piso */}
      <div style={{ position: "absolute", left: 60, right: 60, top: PISO, height: 4, borderRadius: 2, background: `${BRAND.azulUI}55` }} />
      {/* mesa */}
      <div style={{ position: "absolute", left: MESA.x - 170, top: MESA.y, width: 340, height: 26, borderRadius: 13, background: BRAND.azulHielo }} />
      <div style={{ position: "absolute", left: MESA.x - 14, top: MESA.y + 20, width: 28, height: PISO - MESA.y - 40, background: "#3A4466" }} />
      <div style={{ position: "absolute", left: MESA.x - 80, top: PISO - 24, width: 160, height: 22, borderRadius: 11, background: "#3A4466" }} />
      {/* soporte con el QR */}
      <div style={{ position: "absolute", left: STAND.x - STAND.s / 2 - 12, top: STAND.y - STAND.s / 2 - 12, width: STAND.s + 24,
        height: STAND.s + 50, borderRadius: 12, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: STAND.x - STAND.s / 2, top: STAND.y - STAND.s / 2 }}>
        <QR size={STAND.s} />
      </div>
      {anillo > 0 && anillo < 1 && (
        <div style={{ position: "absolute", left: STAND.x, top: STAND.y + 12, width: 200 + anillo * 200, height: 200 + anillo * 200,
          transform: "translate(-50%,-50%)", borderRadius: "50%", border: `6px solid ${BRAND.azulUI}`, opacity: 1 - anillo }} />
      )}
      {/* Sofi */}
      <Persona x={interpolate(sofiIn, [0, 1], [-160, 270])} y={PISO} {...SOFI} brazoD={interpolate(burbuja, [0, 1], [8, 40])} />
      <Chip p={nombre} style={{ left: interpolate(sofiIn, [0, 1], [-160, 270]), top: 560 }}>Sofi</Chip>
      {/* burbuja: pide la carta (ícono, sin texto) */}
      {burbuja > 0 && (
        <div style={{ position: "absolute", left: 360, top: 470, width: 150, height: 120, transform: `scale(${burbuja})`, transformOrigin: "0% 100%" }}>
          <svg width={150} height={130} viewBox="0 0 150 130">
            <path d="M16 6h118a12 12 0 0 1 12 12v66a12 12 0 0 1-12 12H50l-28 26 6-26H16A12 12 0 0 1 4 84V18A12 12 0 0 1 16 6z" fill="#fff" />
            <rect x={52} y={22} width={46} height={60} rx={6} fill="none" stroke={BRAND.azulMarino} strokeWidth={6} />
            <line x1={62} y1={40} x2={88} y2={40} stroke={BRAND.azulUI} strokeWidth={6} strokeLinecap="round" />
            <line x1={62} y1={54} x2={88} y2={54} stroke={BRAND.azulUI} strokeWidth={6} strokeLinecap="round" />
            <line x1={62} y1={68} x2={80} y2={68} stroke={BRAND.azulUI} strokeWidth={6} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {/* mozo */}
      <Persona x={interpolate(mozoIn, [0, 1], [1260, 860])} y={PISO} remera={BRAND.azulMarino} pantalon="#0B1230" pelo="#1B1B1B"
        peinado="corto" piel="#D9A47E" delantal fase={1.3} brazoI={interpolate(senala, [0, 1], [8, 78])} />
    </Escena>
  );
};

const Mensaje: React.FC = () => {
  const t = useT();
  const S = 620;
  const marco = ramp(t, w("mensaje", "dibujo") - 0.1, w("mensaje", "dibujo") + 0.3) * (1 - ramp(t, w("mensaje", "mensaje") - 0.1, w("mensaje", "mensaje") + 0.3));
  const gap = 0.24 * ramp(t, w("mensaje", "cuadraditos") - 0.2, w("mensaje", "cuadraditos") + 0.5);
  return (
    <Escena id="mensaje">
      <Centro y={QR_Y}>
        <div style={{ transform: `rotate(${-3 * marco}deg)` }}>
          <QR size={S} gap={gap} marco={marco} />
        </div>
      </Centro>
    </Escena>
  );
};

// Segmento de 8 módulos de la zona ampliada que forme una letra minúscula (para "combinados, forman letras")
const VENT = { r0: 10, c0: 10, n: 13 };
const SEG = (() => {
  for (let r = VENT.r0 + 2; r < VENT.r0 + VENT.n - 2; r++)
    for (let c = VENT.c0 + 1; c <= VENT.c0 + VENT.n - 9; c++) {
      if (esFinder(r, c)) continue;
      const bits = M[r].slice(c, c + 8);
      const v = parseInt(bits.join(""), 2);
      if (v >= 97 && v <= 122) return { r, c, bits, letra: String.fromCharCode(v) };
    }
  return { r: 16, c: 12, bits: [0, 1, 1, 0, 0, 0, 1, 1], letra: "c" };
})();

const Bits: React.FC = () => {
  const t = useT();
  const CARD = 760;
  const mod = CARD / VENT.n;
  const full = mod * (N + Q * 2);
  const uno = ramp(t, w("bits", "uno") - 0.15, w("bits", "uno") + 0.25);
  const cero = ramp(t, w("bits", "cero") - 0.15, w("bits", "cero") + 0.25);
  const seg = ramp(t, w("bits", "Combinados") - 0.1, w("bits", "Combinados") + 0.3);
  const tira = ramp(t, w("bits", "Combinados") + 0.25, w("bits", "forman") + 0.1) * (1 - ramp(t, w("bits", "dirección") - 0.45, w("bits", "dirección") - 0.1));
  const letra = pop(t, w("bits", "letras"));
  const url = ramp(t, w("bits", "dirección") - 0.1, w("bits", "carta") + 0.3, Easing.linear);
  const URL = "elbardesofi.com/carta";
  const offX = -(VENT.c0 + Q) * mod, offY = -(VENT.r0 + Q) * mod;
  return (
    <Escena id="bits">
      <Centro y={680}>
        <div style={{ width: CARD, height: CARD, borderRadius: 36, overflow: "hidden", position: "relative",
          boxShadow: `0 0 0 6px ${BRAND.azulUI}, 0 30px 80px rgba(0,0,0,.5)`, background: "#fff" }}>
          <div style={{ position: "absolute", left: offX, top: offY }}>
            <QR size={full} gap={0.12} labels={{ uno, cero }} resalte={{ r: SEG.r, c0: SEG.c, c1: SEG.c + 7, p: seg }} />
          </div>
        </div>
      </Centro>
      {/* tira de 8 bits -> letra */}
      {tira > 0 && (
        <Centro y={1170}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", opacity: tira }}>
            {SEG.bits.map((b, i) => (
              <div key={i} style={{ width: 70, height: 84, borderRadius: 14, background: b ? BRAND.fondoOscuro : "#fff",
                border: `3px solid ${BRAND.azulUI}`, color: b ? "#fff" : BRAND.azulUI, fontFamily: "Montserrat", fontWeight: 700, fontSize: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: `translateY(${(1 - ramp(t, w("bits", "Combinados") + 0.25 + i * 0.05, w("bits", "Combinados") + 0.55 + i * 0.05)) * -260}px) scale(${1 - letra * 0.15})`,
                opacity: 1 - letra * 0.55 }}>
                {b}
              </div>
            ))}
            <div style={{ width: letra * 140, overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ color: BRAND.azulUI, fontSize: 60, fontFamily: "Montserrat", fontWeight: 700 }}>=</span>
              <span style={{ color: "#fff", fontSize: 96, fontFamily: "Montserrat", fontWeight: 700, transform: `scale(${letra})` }}>{SEG.letra}</span>
            </div>
          </div>
        </Centro>
      )}
      {/* dirección que queda escrita */}
      {url > 0 && (
        <Centro y={1170}>
          <div style={{ background: "#fff", borderRadius: 999, padding: "22px 40px", display: "flex", alignItems: "center", gap: 18,
            boxShadow: `0 0 0 5px ${BRAND.azulUI}`, transform: `scale(${0.9 + 0.1 * ramp(url, 0, 0.15)})`, opacity: ramp(url, 0, 0.1) }}>
            <svg width={34} height={40} viewBox="0 0 24 28">
              <rect x={3} y={12} width={18} height={14} rx={3} fill={BRAND.azulUI} />
              <path d="M7 12V8a5 5 0 0 1 10 0v4" fill="none" stroke={BRAND.azulUI} strokeWidth={3} />
            </svg>
            <span style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 46, color: BRAND.fondoOscuro, whiteSpace: "pre" }}>
              {URL.slice(0, Math.round(ramp(url, 0.1, 0.9, Easing.linear) * URL.length)).padEnd(URL.length, " ")}
            </span>
          </div>
        </Centro>
      )}
    </Escena>
  );
};

const Esquinas: React.FC = () => {
  const t = useT();
  const S = 560;
  const g = [w("esquinas", "tres"), w("esquinas", "cuadrados"), w("esquinas", "grandes")].map((a) => pop(t, a, 10));
  const fin = ramp(t, w("esquinas", "Por") - 0.2, w("esquinas", "Por") + 0.3);
  const glow = g.map((x) => x * (1 - fin * 0.6));
  const dim = ramp(t, w("esquinas", "tres") - 0.2, w("esquinas", "tres") + 0.2) * (1 - ramp(t, w("esquinas", "código"), w("esquinas", "código") + 0.4));
  const visor = ramp(t, w("esquinas", "cámara") - 0.1, w("esquinas", "cámara") + 0.3);
  const giro = ramp(t, w("esquinas", "girado") - 0.4, w("esquinas", "girado") + 0.5, easeInOut);
  const torcido = ramp(t, w("esquinas", "funciona") - 0.2, w("esquinas", "aunque") + 0.3, easeInOut);
  const snap = pop(t, w("esquinas", "torcido") - 0.25, 14);
  const ok = pop(t, w("esquinas", "torcido"));
  const rz = -28 * giro + 10 * torcido;
  const rx = 34 * torcido, ry = -30 * torcido;
  const reacomodo = 1 - ramp(t, w("esquinas", "Por") - 0.1, w("esquinas", "funciona") - 0.2) * (1 - torcido);
  return (
    <Escena id="esquinas">
      <Centro y={QR_Y}>
        <div style={{ position: "relative", width: S, height: S, transform: `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz * reacomodo}deg)` }}>
          <QR size={S} glow={glow} dim={dim} t={t} />
          <Visor w={S} h={S} snap={Math.max(visor * 0.6, snap)} ok={ok} opacity={visor} />
        </div>
        <Check p={ok} style={{ right: -70, top: -90 }} />
      </Centro>
    </Escena>
  );
};

const Telefono: React.FC<{ children: React.ReactNode; w?: number; h?: number }> = ({ children, w: W = 480, h = 960 }) => (
  <div style={{ width: W, height: h, borderRadius: 70, background: "#0B1020", border: "12px solid #252E4D", position: "relative",
    boxShadow: `0 40px 100px rgba(0,0,0,.6), 0 0 0 2px ${BRAND.azulUI}55`, overflow: "hidden" }}>
    {children}
    <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 130, height: 36, borderRadius: 18, background: "#000" }} />
  </div>
);

const Carta: React.FC<{ p: number }> = ({ p }) => {
  const items = [["Café", "$ 3.500"], ["Medialunas", "$ 2.800"], ["Tostado", "$ 6.900"], ["Licuado", "$ 4.200"], ["Brownie", "$ 3.900"]];
  return (
    <AbsoluteFill style={{ background: BRAND.fondoClaro, transform: `translateY(${(1 - p) * 100}%)`, padding: "110px 38px 0", fontFamily: "Montserrat" }}>
      <div style={{ fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 30, color: BRAND.azulUI, letterSpacing: 4 }}>EL BAR DE SOFI</div>
      <div style={{ fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 76, color: BRAND.fondoOscuro, marginTop: 4 }}>Carta</div>
      <div style={{ height: 4, width: 90, background: BRAND.azulUI, borderRadius: 2, margin: "14px 0 26px" }} />
      {items.map(([n, pr], i) => (
        <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0",
          borderBottom: `2px solid ${BRAND.azulHielo}`, fontSize: 32, color: BRAND.fondoOscuro,
          opacity: ramp(p, 0.4 + i * 0.1, 0.7 + i * 0.1), transform: `translateY(${(1 - ramp(p, 0.4 + i * 0.1, 0.8 + i * 0.1)) * 30}px)` }}>
          <span style={{ fontWeight: 500 }}>{n}</span>
          <span style={{ fontWeight: 700, color: BRAND.azulMarino }}>{pr}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Lectura: React.FC = () => {
  const t = useT();
  const S = 300;
  const snap = pop(t, w("lectura", "encuentra"), 14);
  const derecho = ramp(t, w("lectura", "endereza") - 0.1, w("lectura", "endereza") + 0.55, easeInOut);
  const filaP = interpolate(t, [w("lectura", "lee") - 0.05, w("lectura", "y") - 0.05], [0, 1], clamp);
  const fila = filaP > 0 && filaP < 1 ? Math.floor(filaP * N) : null;
  const ok = pop(t, w("lectura", "listo"));
  const abre = ramp(t, w("lectura", "abre") - 0.15, w("lectura", "abre") + 0.45, easeInOut);
  const inclin = 1 - derecho;
  return (
    <Escena id="lectura">
      <Centro y={770}>
        <Telefono>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #3A4466 0%, #141A2E 75%)" }} />
          <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: S, height: S,
              transform: `perspective(900px) rotateX(${30 * inclin}deg) rotateY(${-22 * inclin}deg) rotateZ(${18 * inclin}deg) scale(${0.85 + 0.15 * derecho})` }}>
              <QR size={S} fila={fila} />
              <Visor w={S} h={S} snap={snap} ok={ok} />
            </div>
          </AbsoluteFill>
          <Check p={ok * (1 - abre)} size={100} style={{ left: 190 - 50 + 140, top: 200 }} />
          <Carta p={abre} />
        </Telefono>
      </Centro>
    </Escena>
  );
};

const Mancha: React.FC = () => {
  const t = useT();
  const mancha = pop(t, w("mancha", "manche") - 0.05, 9);
  const rompe = ramp(t, w("mancha", "pedazo") - 0.05, w("mancha", "pedazo") + 0.05, Easing.linear);
  const vuela = ramp(t, w("mancha", "pedazo"), w("mancha", "pedazo") + 1.1, Easing.in(Easing.quad));
  const snap = pop(t, w("mancha", "sigue") - 0.1, 14);
  const ok = pop(t, w("mancha", "funcionando"));
  const sube = ramp(t, w("mancha", "Trae") - 0.5, w("mancha", "Trae") + 0.2, easeInOut);
  const respaldo = ramp(t, w("mancha", "Trae"), w("mancha", "información")) * (1 - ramp(t, w("mancha", "y", 0) - 0.2, w("mancha", "y", 0) + 0.2));
  const anillo = ramp(t, w("mancha", "información") - 0.2, w("mancha", "información") + 0.2);
  const pct = interpolate(t, [w("mancha", "perder"), w("mancha", "ciento") + 0.2], [0, 30], { ...clamp, easing: easeOut });
  const S = interpolate(sube, [0, 1], [600, 460]);
  const y = interpolate(sube, [0, 1], [QR_Y, 600]);
  const R = 130, C = 2 * Math.PI * R;
  return (
    <Escena id="mancha">
      <Centro y={y}>
        <div style={{ position: "relative", width: S, height: S }}>
          <QR size={S} mancha={mancha} rotura={rompe} respaldo={respaldo} t={t} />
          {rompe > 0 && vuela < 1 && <PedazoRoto size={S} p={vuela} />}
          <Visor w={S} h={S} snap={snap} ok={ok} opacity={ramp(t, w("mancha", "sigue") - 0.25, w("mancha", "sigue"))} />
          <Check p={ok} style={{ right: -135, top: -135 }} />
        </div>
      </Centro>
      {anillo > 0 && (
        <Centro y={1140} style={{ opacity: anillo, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * anillo})` }}>
          <div style={{ position: "relative", width: R * 2 + 40, height: R * 2 + 40 }}>
            <svg width={R * 2 + 40} height={R * 2 + 40} viewBox={`${-R - 20} ${-R - 20} ${R * 2 + 40} ${R * 2 + 40}`}>
              <circle r={R} fill="none" stroke={`${BRAND.azulHielo}33`} strokeWidth={26} />
              <circle r={R} fill="none" stroke={BRAND.azulUI} strokeWidth={26} strokeLinecap="round"
                strokeDasharray={`${(C * pct) / 100} ${C}`} transform="rotate(-90)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 92, color: "#fff" }}>
              {Math.round(pct)}%
            </div>
          </div>
        </Centro>
      )}
    </Escena>
  );
};

const Origen: React.FC = () => {
  const t = useT();
  const japon = pop(t, w("origen", "Japón"));
  const anio = interpolate(t, [w("origen", "1994") - 0.5, w("origen", "1994") + 0.4], [1900, 1994], { ...clamp, easing: easeOut });
  const anioIn = ramp(t, w("origen", "1994") - 0.6, w("origen", "1994") - 0.3);
  const cinta = ramp(t, w("origen", "para") - 0.4, w("origen", "para"));
  const auto = pop(t, w("origen", "autos"));
  const mover = (t - desde("origen")) * 170;
  const CAJA = 170;
  return (
    <Escena id="origen">
      <Chip p={japon} style={{ left: 540, top: 380, fontSize: 52 }}>
        <svg width={64} height={44} viewBox="0 0 64 44">
          <rect width={64} height={44} rx={6} fill="#fff" />
          <circle cx={32} cy={22} r={12} fill="#BC002D" />
        </svg>
        Japón
      </Chip>
      <Centro y={600} style={{ opacity: anioIn }}>
        <div style={{ fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 250, color: "#fff", letterSpacing: 6,
          textShadow: `0 0 60px ${BRAND.azulUI}88` }}>
          {Math.round(anio)}
        </div>
      </Centro>
      {/* cinta de fábrica con piezas etiquetadas con QR */}
      <div style={{ opacity: cinta, transform: `translateY(${(1 - cinta) * 60}px)` }}>
        {[...Array(7)].map((_, i) => {
          const x = ((i * 300 + mover) % 2100) - 300;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 1060 - CAJA, width: CAJA, height: CAJA, borderRadius: 18,
              background: BRAND.azulMarino, border: `3px solid ${BRAND.azulUI}88`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={70} height={70} viewBox="-12 -12 24 24" style={{ position: "absolute", left: 14, top: 14 }}>
                {[...Array(8)].map((__, k) => (
                  <rect key={k} x={-2} y={-11} width={4} height={6} rx={1} fill={BRAND.azulHielo} transform={`rotate(${k * 45})`} />
                ))}
                <circle r={7.5} fill={BRAND.azulHielo} />
                <circle r={3} fill={BRAND.azulMarino} />
              </svg>
              <div style={{ position: "absolute", right: 14, bottom: 14, background: "#fff", padding: 4, borderRadius: 6 }}>
                <QR size={72} />
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1062, height: 34, borderRadius: 17, background: "#252E4D",
          backgroundImage: `repeating-linear-gradient(90deg, #3A4466 0 30px, transparent 30px 60px)`,
          backgroundPosition: `${mover % 60}px 0` }} />
      </div>
      {auto > 0 && (
        <Centro y={1250} style={{ transform: `translate(-50%,-50%) scale(${auto})` }}>
          <svg width={300} height={130} viewBox="0 0 300 130">
            <path d="M20 90 Q22 62 50 58 L90 54 Q120 18 165 18 L205 20 Q235 22 258 56 L272 60 Q290 66 288 90 Z" fill={BRAND.azulUI} />
            <path d="M104 54 Q128 30 160 30 L168 54 Z M180 54 L176 30 Q210 30 234 54 Z" fill={BRAND.azulHielo} opacity={0.85} />
            <circle cx={82} cy={94} r={24} fill={BRAND.fondoOscuro} stroke={BRAND.azulHielo} strokeWidth={8} />
            <circle cx={226} cy={94} r={24} fill={BRAND.fondoOscuro} stroke={BRAND.azulHielo} strokeWidth={8} />
          </svg>
        </Centro>
      )}
    </Escena>
  );
};

const Cta: React.FC = () => {
  const t = useT();
  const card = pop(t, w("cta", "Seguinos") - 0.1, 14);
  const cursor = ramp(t, w("cta", "para") - 0.1, w("cta", "tecnología") - 0.1, easeInOut);
  const tap = t >= w("cta", "tecnología") ? 1 : 0;
  const tapPop = pop(t, w("cta", "tecnología"), 8);
  const saludo = Math.sin(t * 9) * 22;
  return (
    <Escena id="cta">
      <Centro y={620} style={{ transform: `translate(-50%,-50%) scale(${card})` }}>
        <div style={{ width: 760, borderRadius: 40, background: "#fff", padding: "40px 44px", display: "flex", flexDirection: "column", gap: 30,
          boxShadow: `0 30px 80px rgba(0,0,0,.5), 0 0 0 4px ${BRAND.azulUI}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 150, height: 150, borderRadius: "50%", background: "#fff", border: `5px solid ${BRAND.azulUI}`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("isotipo.png")} style={{ height: 96 }} />
            </div>
            <div>
              <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 50, color: BRAND.fondoOscuro }}>@keisoftware</div>
              <div style={{ fontFamily: "Montserrat", fontWeight: 500, fontSize: 32, color: "#5A6386", marginTop: 6 }}>KEI Software</div>
            </div>
          </div>
          <div style={{ height: 96, borderRadius: 22, background: tap ? BRAND.azulHielo : BRAND.azulUI, display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "Montserrat", fontWeight: 700, fontSize: 42, color: tap ? BRAND.azulMarino : "#fff",
            transform: `scale(${tap ? 0.94 + 0.06 * tapPop : 1})` }}>
            {tap ? "Siguiendo ✓" : "Seguir"}
          </div>
        </div>
      </Centro>
      {/* dedo / cursor */}
      <div style={{ position: "absolute", left: interpolate(cursor, [0, 1], [900, 640]), top: interpolate(cursor, [0, 1], [1100, 690]),
        width: 70, height: 70, borderRadius: "50%", background: "#ffffffcc", border: `5px solid ${BRAND.azulUI}`,
        opacity: ramp(t, w("cta", "para") - 0.3, w("cta", "para")) * (1 - ramp(t, w("cta", "todos"), w("cta", "días"))),
        transform: `scale(${tap ? 1 - 0.25 * Math.max(0, 1 - (t - w("cta", "tecnología")) * 5) : 1})` }} />
      <Persona x={300} y={1340} escala={0.72} {...SOFI} brazoD={130 + saludo} />
    </Escena>
  );
};

// ---------------- Subtítulos ----------------
type Palabra = { w: string; s: number; e: number };
const BLOQUES = (() => {
  const out: { ps: Palabra[]; txt: string[]; s: number; e: number }[] = [];
  for (const esc of voz.escenas) {
    let pos = 0;
    let cur: Palabra[] = [], txt: string[] = [];
    esc.palabras.forEach((p, i) => {
      const idx = esc.texto.indexOf(p.w, pos);
      let shown = p.w;
      let corte = false;
      if (idx >= 0) {
        if (esc.texto[idx - 1] === "¿") shown = "¿" + shown;
        const sig = esc.texto[idx + p.w.length] ?? "";
        if (sig === "?") shown += "?";
        corte = /[.,:?]/.test(sig);
        pos = idx + p.w.length;
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
  const b = BLOQUES.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!b) return null;
  const p = pop(t, b.s - 0.05, 14);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1470, transform: `translateY(-50%) scale(${0.9 + 0.1 * p})`,
      display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 20, rowGap: 0, textAlign: "center",
      fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 80, lineHeight: 1.12, opacity: Math.min(1, p * 2) }}>
      {b.ps.map((pw, i) => {
        const activa = t >= pw.s - 0.03 && t < (b.ps[i + 1] ? b.ps[i + 1].s - 0.03 : b.e);
        return (
          <span key={i} style={{ color: activa ? BRAND.azulUI : "#fff",
            textShadow: `0 0 10px ${BRAND.fondoOscuro}, 0 4px 0 ${BRAND.fondoOscuro}, 0 0 30px ${BRAND.fondoOscuro}` }}>
            {b.txt[i]}
          </span>
        );
      })}
    </div>
  );
};

const Titulo: React.FC = () => {
  const t = useT();
  const p = pop(t, 0.05, 15);
  return (
    <Chip p={p * (1 - ramp(t, C0 - 0.3, C0))} style={{ left: 540, top: 250, fontSize: 44, padding: "14px 32px 14px 22px" }}>
      <Img src={staticFile("isotipo.png")} style={{ height: 50 }} />
      ¿Cómo funciona un QR?
    </Chip>
  );
};

// ---------------- Sonido ----------------
const SFX: [string, number, number][] = [
  ["qr_pop.wav", 0.95, 0.35],
  ["qr_ok.wav", w("hook", "segundo") + 0.1, 0.4],
  ["qr_pop.wav", w("bar", "Sofi"), 0.35],
  ["qr_pop.wav", w("bar", "bar"), 0.3],
  ["qr_pop.wav", w("bar", "pide"), 0.3],
  ["qr_pop.wav", w("bar", "esto"), 0.35],
  ["qr_tick.wav", w("mensaje", "cuadraditos"), 0.4],
  ["qr_tick.wav", w("bits", "uno"), 0.4],
  ["qr_tick.wav", w("bits", "cero"), 0.4],
  ["qr_pop.wav", w("bits", "letras"), 0.35],
  ["qr_pop.wav", w("esquinas", "tres"), 0.3],
  ["qr_pop.wav", w("esquinas", "cuadrados"), 0.3],
  ["qr_pop.wav", w("esquinas", "grandes"), 0.3],
  ["qr_ok.wav", w("esquinas", "torcido"), 0.4],
  ["qr_tick.wav", w("lectura", "encuentra"), 0.4],
  ["qr_ok.wav", w("lectura", "listo"), 0.4],
  ["qr_pop.wav", w("mancha", "manche"), 0.4],
  ["qr_pop.wav", w("mancha", "pedazo"), 0.35],
  ["qr_ok.wav", w("mancha", "funcionando"), 0.4],
  ["qr_pop.wav", w("origen", "Japón"), 0.3],
  ["qr_pop.wav", w("origen", "autos"), 0.3],
  ["qr_pop.wav", w("cta", "Seguinos"), 0.3],
  ["qr_tick.wav", w("cta", "tecnología"), 0.5],
];
// tics de la lectura fila por fila
for (let k = 0; k < 8; k++) SFX.push(["qr_tick.wav", w("lectura", "lee") + k * ((w("lectura", "y") - w("lectura", "lee")) / 8), 0.18]);

// ---------------- Composición ----------------
export const QrExplainer: React.FC = () => {
  const t = useT();
  const cierreOpacity = interpolate(t, [C0, C0 + 0.4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
      <style>{fontFace}</style>
      {t < C0 + 0.45 && (
        <>
          <Fondo />
          <Hook />
          <Bar />
          <Mensaje />
          <Bits />
          <Esquinas />
          <Lectura />
          <Mancha />
          <Origen />
          <Cta />
          <Titulo />
          <Subtitulos />
        </>
      )}
      <Sequence from={Math.round(C0 * FPS) - SKIP} durationInFrames={CIERRE_FRAMES}>
        <AbsoluteFill style={{ opacity: cierreOpacity, backgroundColor: BRAND.fondoOscuro }}>
          <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile("qr_voz.wav")} />
      {SFX.map(([f, s, v], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * FPS))} durationInFrames={FPS}>
          <Audio src={staticFile(f)} volume={v} />
        </Sequence>
      ))}
      <Sequence from={Math.round(C0 * FPS) - 20} durationInFrames={FPS * 2}>
        <Audio src={staticFile("whoosh.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
