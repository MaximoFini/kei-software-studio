import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/bebas-neue/400.css";
import { crearReel, ramp, pop, useT, Sonido } from "./reelKit";
import { rnd } from "./pizarronKit";
import voz from "./hdrVoz.json";

// Reel COLLAGE "¿Por qué tu foto es en realidad varias fotos?" (guion en scripts/guiones/hdr.json).
// Papel recortado con sombra dura, movimiento "stop motion" (la inclinación salta ~8 veces por segundo) y fotos hechas con CSS.

const BEBAS = "'Bebas Neue', sans-serif";
const TINTA = "#111";
const AM = "#F5D547", RS = "#FF6B6B", AZ = "#4D96FF", VD = "#6BCB77";

const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: "#E9DFC8", backgroundImage: "radial-gradient(rgba(120,90,50,.16) 3px, transparent 3.5px)", backgroundSize: "36px 36px" }} />
);

const { w, desde, Escena, Base, TOTAL } = crearReel(voz, {
  fondo: <Fondo />,
  sub: { font: BEBAS, size: 112, color: TINTA, active: TINTA, activeBg: AM, top: 1545, weight: 400, upper: true },
  progreso: TINTA,
  progresoY: 160,
  barra: AM,
});
export const HDR_TOTAL = TOTAL;

/** Inclinación con salto de "stop motion". */
const useJit = (seed: number) => {
  const t = useT();
  return (rnd(Math.floor(t * 8) + seed * 17) - 0.5) * 1.8;
};

/** Tira de papel con sombra dura que entra "pegándose". */
const Tira: React.FC<{ txt: string; t0: number; top: number; rot?: number; color?: string; size?: number; left?: number; right?: number; seed?: number; ink?: string }> = ({
  txt, t0, top, rot = -2, color = AM, size = 150, left = 70, right = 70, seed = 1, ink = TINTA,
}) => {
  const t = useT();
  const p = pop(t, t0, 12);
  const j = useJit(seed);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left, right, transform: `rotate(${rot + j}deg) scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2.5), background: color, color: ink,
      padding: "10px 36px 2px", boxShadow: `12px 12px 0 ${TINTA}`, fontFamily: BEBAS, fontSize: size, lineHeight: 1.05, textAlign: "center", border: `5px solid ${TINTA}` }}>
      <Sonido t={t0} f="qr_pop.wav" v={0.18} />
      {txt}
    </div>
  );
};

type Expo = "oscura" | "clara" | "hdr";
/** Foto de juguete: cielo + sol arriba, colinas y casa abajo. La exposición se simula con brillo distinto en cielo y suelo. */
const Foto: React.FC<{ expo: Expo; x: number; y: number; s?: number; rot?: number; t0: number; seed?: number; etiqueta?: string }> = ({ expo, x, y, s = 1, rot = 0, t0, seed = 1, etiqueta }) => {
  const t = useT();
  const p = pop(t, t0, 11);
  const j = useJit(seed);
  if (p <= 0) return null;
  const cielo = expo === "clara" ? 2.3 : 0.62;
  const suelo = expo === "oscura" ? 0.3 : 1.55;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot + j}deg) scale(${s * (0.6 + 0.4 * p)})`, opacity: Math.min(1, p * 3) }}>
      <Sonido t={t0} f="qr_pop.wav" v={0.14} />
      <div style={{ width: 420, background: "#fff", padding: "20px 20px 74px", boxShadow: `12px 12px 0 ${TINTA}`, border: `4px solid ${TINTA}` }}>
        <div style={{ position: "relative", width: 380, height: 440, overflow: "hidden", background: "#222" }}>
          <div style={{ position: "absolute", inset: 0, filter: `brightness(${cielo})`, background: "linear-gradient(#4C9AE8 0%, #8CC4F0 55%, #FFC98A 100%)" }}>
            <div style={{ position: "absolute", left: 250, top: 70, width: 90, height: 90, borderRadius: 45, background: "#FFF1A8", boxShadow: "0 0 40px #FFF1A8" }} />
            <div style={{ position: "absolute", left: 40, top: 110, width: 120, height: 40, borderRadius: 30, background: "#fff", opacity: 0.9 }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, filter: `brightness(${suelo})`, background: "#2F4A2C", clipPath: "polygon(0 35%, 30% 8%, 62% 30%, 100% 5%, 100% 100%, 0 100%)" }}>
            <div style={{ position: "absolute", left: 60, bottom: 20, width: 110, height: 80, background: "#B5683A" }} />
            <div style={{ position: "absolute", left: 40, bottom: 98, width: 150, height: 0, borderLeft: "75px solid transparent", borderRight: "75px solid transparent", borderBottom: "56px solid #7A2E2E" }} />
            <div style={{ position: "absolute", left: 255, bottom: 20, width: 24, height: 80, background: "#6B4423" }} />
            <div style={{ position: "absolute", left: 220, bottom: 80, width: 96, height: 96, borderRadius: 48, background: "#4E8B3A" }} />
          </div>
        </div>
        {etiqueta && <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: BEBAS, fontSize: 52, color: TINTA }}>{etiqueta}</div>}
      </div>
      {/* cinta */}
      <div style={{ position: "absolute", left: 150, top: -28, width: 130, height: 46, background: "rgba(245,213,71,.85)", transform: "rotate(-4deg)" }} />
    </div>
  );
};

const Flecha: React.FC<{ x: number; y: number; rot?: number; t0: number; c?: string }> = ({ x, y, rot = 0, t0, c = TINTA }) => {
  const t = useT();
  const p = pop(t, t0, 12);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, fontFamily: BEBAS, fontSize: 190, color: c, lineHeight: 1, WebkitTextStroke: `4px ${TINTA}` }}>➜</div>
  );
};

const Flash: React.FC<{ t0: number }> = ({ t0 }) => {
  const t = useT();
  const o = t >= t0 && t < t0 + 0.25 ? 1 - ramp(t, t0, t0 + 0.25) : 0;
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o * 0.85 }} /> : null;
};

export const HdrReel: React.FC = () => (
  <Base audio="hdr">
    <Escena id="hook">
      <Tira txt="UNA FOTO = VARIAS" t0={desde("hook") + 0.05} top={260} rot={-3} color={AM} size={150} />
      <Foto expo="oscura" x={290} y={900} rot={-9} s={0.82} t0={w("hook", "foto")} seed={2} />
      <Foto expo="clara" x={790} y={920} rot={8} s={0.82} t0={w("hook", "son")} seed={3} />
      <Foto expo="hdr" x={540} y={960} rot={-2} s={0.95} t0={w("hook", "varias")} seed={4} etiqueta="¿cuál es la real?" />
      <Tira txt="¿CÓMO?" t0={w("hook", "Cómo")} top={1300} rot={3} color={RS} size={120} left={290} right={290} seed={5} />
    </Escena>
    <Escena id="rafaga">
      <Tira txt="RÁFAGA INVISIBLE" t0={desde("rafaga") + 0.05} top={260} rot={2} color={AZ} size={140} seed={6} ink="#fff" />
      <Flash t0={w("rafaga", "botón")} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Foto key={i} expo={i % 2 ? "clara" : "oscura"} x={170 + i * 185} y={930 + (i % 2) * 70} rot={-12 + i * 6} s={0.5} t0={w("rafaga", "tomas") + i * 0.12} seed={10 + i} />
      ))}
      <Tira txt="¡EN UN INSTANTE!" t0={w("rafaga", "instante")} top={1230} rot={-2} color={VD} size={110} seed={7} />
    </Escena>
    <Escena id="exp">
      <Tira txt="DOS EXPOSICIONES" t0={desde("exp") + 0.05} top={260} rot={-2} color={AM} size={140} seed={8} />
      <Foto expo="oscura" x={290} y={850} rot={-5} s={0.78} t0={w("exp", "oscura")} seed={20} etiqueta="OSCURA" />
      <Tira txt="SALVA LAS LUCES" t0={w("exp", "luces")} top={1170} rot={-3} color={AZ} size={72} left={40} right={560} seed={9} ink="#fff" />
      <Foto expo="clara" x={790} y={880} rot={5} s={0.78} t0={w("exp", "clara")} seed={21} etiqueta="CLARA" />
      <Tira txt="SALVA LAS SOMBRAS" t0={w("exp", "sombras")} top={1300} rot={3} color={RS} size={72} left={540} right={40} seed={10} />
    </Escena>
    <Escena id="une">
      <Tira txt="LO MEJOR DE CADA UNA" t0={desde("une") + 0.05} top={260} rot={2} color={VD} size={118} seed={11} />
      <Foto expo="oscura" x={230} y={790} rot={-7} s={0.55} t0={desde("une") + 0.3} seed={30} />
      <Foto expo="clara" x={230} y={1190} rot={6} s={0.55} t0={desde("une") + 0.5} seed={31} />
      <Flecha x={500} y={800} rot={25} t0={w("une", "une")} />
      <Flecha x={500} y={1180} rot={-25} t0={w("une", "une") + 0.1} />
      <Foto expo="hdr" x={800} y={990} rot={3} s={0.95} t0={w("une", "mejor")} seed={32} etiqueta="¡LA FINAL!" />
    </Escena>
    <Escena id="magia">
      <Tira txt="FOTOGRAFÍA" t0={w("magia", "fotografía") - 0.1} top={260} rot={-2} color={AM} size={150} seed={12} />
      <Tira txt="COMPUTACIONAL" t0={w("magia", "computacional")} top={450} rot={2} color={RS} size={150} seed={13} />
      <Foto expo="hdr" x={540} y={1010} rot={-2} s={1.05} t0={w("magia", "cielo") - 0.5} seed={40} />
      <Tira txt="CIELO SIN QUEMAR" t0={w("magia", "quemado")} top={1270} rot={3} color={VD} size={100} left={200} right={200} seed={14} />
    </Escena>
    <Escena id="cta" sonido="qr_ok.wav">
      <Tira txt="SEGUINOS" t0={desde("cta") + 0.1} top={330} rot={-3} color={AM} size={210} seed={15} />
      <Tira txt="@KEISOFTWARE" t0={desde("cta") + 0.5} top={640} rot={2} color={AZ} size={120} left={170} right={170} seed={16} ink="#fff" />
      <Foto expo="hdr" x={540} y={1050} rot={-3} s={0.78} t0={desde("cta") + 0.9} seed={50} etiqueta="¿cuál fue tu mejor foto?" />
    </Escena>
  </Base>
);
