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

// Piezas comunes de los reels explicativos con voz en off (QrExplainer, BtExplainer):
// tiempos por palabra (scripts/explainer.py), crossfade entre escenas, subtítulos con la palabra activa,
// título arriba, barra de progreso, personajes planos y cierre KEI. Cada reel aporta sólo sus escenas.

export const FPS = 60;
const CIERRE_FRAMES = 240;
const SKIP = 24; // primer tramo del cierre (fondo y entrada del isotipo), para cerrar en ~50 s
const FADE = 0.3; // crossfade entre escenas
const C0_PAD = 0.12; // el cierre entra apenas termina la última palabra (igual que scripts/explainer.py)

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const PIEL = "#F2C6A0";

export const useT = () => useCurrentFrame() / FPS;
export const ramp = (t: number, a: number, b: number, e = easeOut) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
export const pop = (t: number, a: number, damping = 12) =>
  t < a ? 0 : spring({ frame: Math.round((t - a) * FPS), fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } });
export const hash = (r: number, c: number) => {
  const x = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------- Tiempos, escenas, subtítulos y composición base ----------------
type Palabra = { w: string; s: number; e: number };
type Voz = { escenas: { id: string; texto: string; s: number; e: number; palabras: Palabra[] }[] };
export type Sfx = [string, number, number]; // archivo en public, segundo, volumen

export const crearExplainer = (voz: Voz, titulo: string) => {
  const ESC = Object.fromEntries(voz.escenas.map((e) => [e.id, e]));
  const IDS = voz.escenas.map((e) => e.id);
  const C0 = voz.escenas[voz.escenas.length - 1].e + C0_PAD; // entra el cierre
  const TOTAL = Math.round(C0 * FPS) - SKIP + CIERRE_FRAMES;

  // Tiempo (s) de una palabra de una escena; n = ocurrencia
  const w = (id: string, palabra: string, n = 0) => {
    const ps = ESC[id].palabras.filter((p) => p.w === palabra);
    return (ps[n] ?? ps[0]).s;
  };
  // Ventana de cada escena: desde un poco antes de su primera palabra hasta que entra la siguiente
  const desde = (id: string) => Math.max(0, ESC[id].s - 0.15);
  const hasta = (id: string) => {
    const i = IDS.indexOf(id);
    return i < IDS.length - 1 ? desde(IDS[i + 1]) : C0;
  };

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
    return <AbsoluteFill style={{ opacity: inP * (1 - outP), transform, transformOrigin: origin }}>{children}</AbsoluteFill>;
  };

  // Bloques de 3-4 palabras: corta en puntuación y nunca deja una palabra sola al final de una frase
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
        {titulo}
      </Chip>
    );
  };

  // Composición: fondo, escenas, título, subtítulos, cierre KEI, barra de progreso, voz, música y efectos
  const Base: React.FC<{ audio: string; sfx: Sfx[]; children: React.ReactNode }> = ({ audio, sfx, children }) => {
    const t = useT();
    const cierreOpacity = interpolate(t, [C0, C0 + 0.4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    return (
      <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
        <style>{fontFace}</style>
        {t < C0 + 0.45 && (
          <>
            <Fondo />
            {children}
            <Titulo />
            <Subtitulos />
          </>
        )}
        <Sequence from={Math.round(C0 * FPS) - SKIP} durationInFrames={CIERRE_FRAMES}>
          <AbsoluteFill style={{ opacity: cierreOpacity, backgroundColor: BRAND.fondoOscuro }}>
            <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
          </AbsoluteFill>
        </Sequence>
        <Progreso />
        <Audio src={staticFile(`${audio}_voz.wav`)} />
        {/* Música de fondo ya bajita y con ducking bajo la voz (scripts/explainer.py musica) */}
        <Audio src={staticFile(`${audio}_musica.wav`)} />
        {sfx.map(([f, s, v], i) => (
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

  return { ESC, w, desde, hasta, C0, TOTAL, Escena, Base };
};

// Barra de progreso fina arriba (retención): avanza un poco más rápido al principio
export const Progreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = Math.pow(Math.min(1, frame / (durationInFrames - 1)), 0.85);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 150, height: 8, borderRadius: 4, background: `${BRAND.azulHielo}26`,
      opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>
      <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 4, background: BRAND.azulUI, boxShadow: `0 0 14px ${BRAND.azulUI}` }} />
    </div>
  );
};

// ---------------- Piezas visuales ----------------
export const Centro: React.FC<{ x?: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x = 540, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>{children}</div>
);

export const Chip: React.FC<{ children: React.ReactNode; p: number; style?: React.CSSProperties }> = ({ children, p, style }) => (
  <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${p})`, opacity: Math.min(1, p * 2), whiteSpace: "nowrap",
    fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 46, color: "#fff", padding: "14px 30px", borderRadius: 999,
    background: `${BRAND.azulMarino}EE`, border: `2px solid ${BRAND.azulUI}88`, display: "flex", alignItems: "center", gap: 16, ...style }}>
    {children}
  </div>
);

export const Check: React.FC<{ p: number; size?: number; style?: React.CSSProperties }> = ({ p, size = 120, style }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: BRAND.azulUI,
      boxShadow: `0 0 50px ${BRAND.azulUI}aa`, display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p})`, ...style }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

export const Telefono: React.FC<{ children: React.ReactNode; w?: number; h?: number }> = ({ children, w: W = 480, h = 960 }) => (
  <div style={{ width: W, height: h, borderRadius: 70, background: "#0B1020", border: "12px solid #252E4D", position: "relative",
    boxShadow: `0 40px 100px rgba(0,0,0,.6), 0 0 0 2px ${BRAND.azulUI}55`, overflow: "hidden" }}>
    {children}
    <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 130, height: 36, borderRadius: 18, background: "#000" }} />
  </div>
);

// Tarjeta de perfil @keisoftware: "Seguir" -> "Siguiendo" con un toque (t: tiempo del toque)
export const TarjetaSeguir: React.FC<{ aparece: number; cursorDesde: number; toque: number; cursorFin: [number, number] }> = ({
  aparece, cursorDesde, toque, cursorFin,
}) => {
  const t = useT();
  const card = pop(t, aparece, 14);
  const cursor = ramp(t, cursorDesde, toque - 0.1, easeInOut);
  const tap = t >= toque ? 1 : 0;
  const tapPop = pop(t, toque, 8);
  return (
    <>
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
        opacity: ramp(t, cursorDesde - 0.2, cursorDesde + 0.1) * (1 - ramp(t, cursorFin[0], cursorFin[1])),
        transform: `scale(${tap ? 1 - 0.25 * Math.max(0, 1 - (t - toque) * 5) : 1})` }} />
    </>
  );
};

// ---------------- Personajes ----------------
export type PersonaProps = {
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
  corre?: number; // 0..1: piernas y brazos alternados
  auriculares?: number; // 0..1: auriculares inalámbricos (brillo azul)
  barba?: string;
  corona?: boolean;
  capa?: string;
  dientes?: number; // 0..1 sonrisa abierta; el diente azul brilla con el valor
};

export const Persona: React.FC<PersonaProps> = ({
  x, y, escala = 1, remera, pantalon = BRAND.azulMarino, pelo, peinado, piel = PIEL, brazoD = 8, brazoI = 8, delantal, fase = 0, opacity = 1,
  celular = 0, corre = 0, auriculares = 0, barba, corona, capa, dientes = 0,
}) => {
  const t = useT();
  const zancada = Math.sin(t * 11 + fase);
  const bob = corre > 0 ? -Math.abs(zancada) * 14 * corre : Math.sin(t * 2.4 + fase) * 4;
  const parpadeo = (t + fase) % 3.4 < 0.12 ? 0.15 : 1;
  const ojoY = dientes > 0 ? -482 : -476;
  const bD = brazoD + zancada * 40 * corre;
  const bI = brazoI - zancada * 40 * corre;
  const brazo = (lado: 1 | -1, ang: number, hijo?: React.ReactNode) => (
    <g transform={`translate(${lado * 66} -372) rotate(${-lado * ang})`}>
      <rect x={-17} y={-6} width={34} height={168} rx={17} fill={remera} />
      <circle cx={0} cy={168} r={20} fill={piel} />
      {hijo}
    </g>
  );
  const pierna = (cx: number, pie: number, ang: number) => (
    <g transform={`rotate(${ang} ${cx + 18} -200)`}>
      <rect x={cx} y={-205} width={36} height={205} rx={16} fill={pantalon} />
      <ellipse cx={pie} cy={2} rx={34} ry={14} fill="#0B1230" />
    </g>
  );
  return (
    <svg width={400 * escala} height={640 * escala} viewBox="-200 -600 400 640"
      style={{ position: "absolute", left: x - 200 * escala, top: y - 600 * escala, overflow: "visible", opacity }}>
      {capa && (
        <g transform={`translate(0 ${bob})`}>
          <path d="M-70 -392 Q-120 -150 -110 -40 L110 -40 Q120 -150 70 -392 Z" fill={capa} />
        </g>
      )}
      <g transform={`translate(0 ${bob * 0.3})`}>
        {pierna(-46, -30, zancada * 28 * corre)}
        {pierna(10, 30, -zancada * 28 * corre)}
      </g>
      <g transform={`translate(0 ${bob})`}>
        {brazo(-1, bI, celular > 0 ? (
          <g transform={`translate(0 170) rotate(${180 - bI * 0.4}) scale(${celular})`}>
            <rect x={-26} y={-6} width={52} height={92} rx={10} fill="#0B1230" stroke="#3A4466" strokeWidth={4} />
            <rect x={-19} y={2} width={38} height={72} rx={5} fill={BRAND.azulUI} opacity={0.8} />
          </g>
        ) : undefined)}
        <rect x={-74} y={-400} width={148} height={222} rx={56} fill={remera} />
        {delantal && <rect x={-56} y={-318} width={112} height={150} rx={14} fill="#FFFFFF" opacity={0.95} />}
        {brazo(1, bD)}
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
        {barba && (
          <>
            <path d="M-66 -472 Q-64 -372 0 -350 Q64 -372 66 -472 Q58 -432 30 -426 Q0 -420 -30 -426 Q-58 -432 -66 -472 Z" fill={barba} />
            <path d="M-34 -452 Q-16 -464 0 -456 Q16 -464 34 -452 Q16 -446 0 -450 Q-16 -446 -34 -452 Z" fill={barba} />
          </>
        )}
        <ellipse cx={-23} cy={ojoY} rx={7} ry={7 * parpadeo} fill="#1B2140" />
        <ellipse cx={23} cy={ojoY} rx={7} ry={7 * parpadeo} fill="#1B2140" />
        {dientes > 0 ? (
          <g>
            <circle cx={0} cy={-440} r={12 + 16 * dientes} fill={BRAND.azulUI} opacity={0.35 * dientes} />
            <path d="M-32 -448 Q0 -398 32 -448 Z" fill="#5A1E2A" />
            <rect x={-26} y={-448} width={52} height={14} rx={4} fill="#fff" />
            <rect x={-7} y={-448} width={14} height={15} rx={3} fill={BRAND.azulUI} />
          </g>
        ) : (
          <path d="M-20 -446 Q0 -430 20 -446" fill="none" stroke="#1B2140" strokeWidth={5} strokeLinecap="round" />
        )}
        {!barba && (
          <>
            <circle cx={-40} cy={-452} r={9} fill="#F49A8C" opacity={0.45} />
            <circle cx={40} cy={-452} r={9} fill="#F49A8C" opacity={0.45} />
          </>
        )}
        {corona && (
          <path d="M-56 -540 L-56 -600 L-30 -570 L0 -612 L30 -570 L56 -600 L56 -540 Z" fill="#E8B84A" stroke="#B8862A" strokeWidth={4} />
        )}
        {auriculares > 0 && [-1, 1].map((l) => (
          <g key={l}>
            <circle cx={l * 66} cy={-474} r={14 + 16 * auriculares} fill={BRAND.azulUI} opacity={0.3 * auriculares} />
            <rect x={l * 66 - 9} y={-488} width={18} height={30} rx={9} fill="#fff" />
          </g>
        ))}
      </g>
    </svg>
  );
};
