import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/patrick-hand/400.css";
import { crearReel, ramp, useT, Sonido } from "./reelKit";
import { Dib, Trazo, arco, caja, circulo, flecha, linea, onda, recto, suave } from "./pizarronKit";
import voz from "./ancVoz.json";

// Reel CUADERNO "¿Cómo borran el ruido unos auriculares?" (guion en scripts/guiones/anc.json).
// Hoja cuadriculada, birome azul y marcador rojo: se dibujan las ondas del ruido y su opuesta, y se suman.

const PH = "'Patrick Hand', cursive";
const AZUL = "#1D3A8A", ROJO = "#D6454A", VERDE = "#2E8B57", NARANJA = "#E58A1F";

const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: "#FBFAF3", backgroundImage: "linear-gradient(rgba(120,170,215,.55) 2px, transparent 2px), linear-gradient(90deg, rgba(120,170,215,.55) 2px, transparent 2px)", backgroundSize: "60px 60px", backgroundPosition: "20px 10px" }}>
    <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 5, background: "rgba(225,100,110,.7)" }} />
    {[300, 800, 1300].map((y) => <div key={y} style={{ position: "absolute", left: 28, top: y, width: 34, height: 34, borderRadius: 17, background: "#d9d5c6", boxShadow: "inset 2px 2px 4px rgba(0,0,0,.25)" }} />)}
  </AbsoluteFill>
);

const { w, desde, Escena, Base, TOTAL } = crearReel(voz, {
  fondo: <Fondo />,
  sub: { font: PH, size: 84, color: AZUL, active: ROJO, top: 1545, weight: 400, activeBg: "rgba(255,230,120,.75)" },
  progreso: AZUL,
  progresoY: 160,
  barra: "#1D3A8A",
});
export const ANC_TOTAL = TOTAL;

/** Texto a mano (birome): se revela de izquierda a derecha. */
const Tinta: React.FC<{ x: number; y: number; t0: number; c?: string; size?: number; children: string; rot?: number; anchor?: "start" | "middle" }> = ({ x, y, t0, c = AZUL, size = 80, children, rot = 0, anchor = "middle" }) => {
  const t = useT();
  const p = ramp(t, t0, t0 + Math.min(1.1, 0.2 + children.length * 0.045));
  if (p <= 0.001) return null;
  const est = children.length * size * 0.46;
  const id = `ti_${Math.round(x)}_${Math.round(y)}_${Math.round(t0 * 100)}`;
  const x0 = anchor === "middle" ? x - est / 2 : x;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <clipPath id={id}><rect x={x0 - 10} y={y - size} width={(est + 20) * p} height={size * 1.5} /></clipPath>
      <text x={x} y={y} textAnchor={anchor} fill={c} fontFamily={PH} fontSize={size} clipPath={`url(#${id})`}>{children}</text>
    </g>
  );
};

const Titulo: React.FC<{ id: string; txt: string; c?: string }> = ({ id, txt, c = AZUL }) => (
  <>
    <Sonido t={desde(id) + 0.05} f="qr_pop.wav" v={0.2} />
    <Tinta x={560} y={330} t0={desde(id) + 0.05} size={104} c={c}>{txt}</Tinta>
    <Trazo d={onda(170, 372, 780, 6, 5, 3)} t0={desde(id) + 0.5} dur={0.45} c={c} w={6} punta={false} sonido={false} />
  </>
);

const Auricular: React.FC<{ x: number; y: number; s?: number; t0: number; dur?: number; c?: string }> = ({ x, y, s = 1, t0, dur = 1.1, c = AZUL }) => (
  <Dib x={x} y={y} s={s} t0={t0} dur={dur} c={c} w={9} punta={false} sonido={false} trazos={[
    { d: arco(0, 0, 150, Math.PI, Math.PI * 2, 2) },
    { d: caja(-190, -6, 78, 150, 5, 30), relleno: "#F4D35E" },
    { d: caja(112, -6, 78, 150, 6, 30), relleno: "#F4D35E" },
  ]} />
);

const Mic: React.FC<{ x: number; y: number; t0: number }> = ({ x, y, t0 }) => (
  <Dib x={x} y={y} s={1} t0={t0} dur={0.5} c={VERDE} w={7} punta={false} sonido={false} trazos={[
    { d: circulo(0, 0, 24, 3), relleno: true },
    { d: linea(0, 24, 0, 56, 2) },
  ]} />
);

export const AncReel: React.FC = () => {
  const t = useT();
  const PE = (id: string, k: string) => w(id, k);
  return (
    <Base audio="anc">
      {/* 1 · Gancho */}
      <Escena id="hook">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Titulo id="hook" txt="¿RUIDO + RUIDO = ?" c={ROJO} />
          <Auricular x={540} y={820} s={2.0} t0={desde("hook") + 0.4} dur={1.4} />
          <Tinta x={540} y={1230} t0={w("hook", "Cómo")} c={VERDE} size={96}>= ¿silencio?</Tinta>
        </svg>
      </Escena>
      {/* 2 · Micrófono afuera */}
      <Escena id="mic">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Titulo id="mic" txt="UN MICRÓFONO ESCUCHA" />
          <Auricular x={700} y={760} s={1.5} t0={desde("mic") + 0.3} dur={0.9} />
          <Mic x={500} y={760} t0={w("mic", "micrófono")} />
          <Tinta x={440} y={700} t0={w("mic", "micrófono")} c={VERDE} size={52}>mic</Tinta>
          {[0, 1, 2].map((i) => (
            <Trazo key={i} d={onda(60, 1000 + i * 90, 420, 26 + i * 4, 5, i + 5)} t0={w("mic", "ruido") + i * 0.15} dur={0.6} c={ROJO} w={8} punta={false} sonido={false} />
          ))}
          <Tinta x={540} y={1370} t0={w("mic", "calle")} c={ROJO} size={72}>ruido de la calle</Tinta>
        </svg>
      </Escena>
      {/* 3 · Onda opuesta */}
      <Escena id="opuesta">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Titulo id="opuesta" txt="LA ONDA AL REVÉS" c={VERDE} />
          <Trazo d={onda(100, 780, 880, 90, 4, 7)} t0={desde("opuesta") + 0.3} dur={0.9} c={ROJO} w={10} punta={false} sonido={false} />
          <Tinta x={180} y={640} t0={desde("opuesta") + 0.6} c={ROJO} size={58} anchor="start">ruido</Tinta>
          <Trazo d={onda(100, 1100, 880, -90, 4, 7)} t0={w("opuesta", "parlante")} dur={0.9} c={AZUL} w={10} punta={false} sonido={false} />
          <Tinta x={180} y={960} t0={w("opuesta", "parlante")} c={AZUL} size={58} anchor="start">anti-ruido</Tinta>
          <Trazo d={flecha(540, 860, 540, 1000, 4)} t0={w("opuesta", "revés")} dur={0.4} c={NARANJA} w={9} punta={false} sonido={false} />
          <Tinta x={760} y={940} t0={w("opuesta", "revés")} c={NARANJA} size={52}>¡espejo!</Tinta>
        </svg>
      </Escena>
      {/* 4 · Se suman y se cancelan */}
      <Escena id="suma">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Titulo id="suma" txt="SE CANCELAN" c={VERDE} />
          <Trazo d={onda(100, 640, 880, 70, 4, 7)} t0={desde("suma") + 0.2} dur={0.5} c={ROJO} w={9} punta={false} sonido={false} />
          <Tinta x={540} y={790} t0={w("suma", "suman")} c={NARANJA} size={96}>+</Tinta>
          <Trazo d={onda(100, 940, 880, -70, 4, 7)} t0={desde("suma") + 0.5} dur={0.5} c={AZUL} w={9} punta={false} sonido={false} />
          <Tinta x={540} y={1100} t0={w("suma", "cancelan")} c={NARANJA} size={96}>=</Tinta>
          <Trazo d={linea(100, 1220, 980, 1220, 2)} t0={w("suma", "cancelan")} dur={0.6} c={VERDE} w={11} punta={false} sonido={false} />
          <Tinta x={540} y={1330} t0={w("suma", "cancelan") + 0.3} c={VERDE} size={72}>¡línea plana!</Tinta>
        </svg>
      </Escena>
      {/* 5 · Silencio, mejor con ruidos constantes */}
      <Escena id="silencio">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Titulo id="silencio" txt="SILENCIO" c={VERDE} />
          <Auricular x={540} y={760} s={1.8} t0={desde("silencio") + 0.3} dur={1.0} c={VERDE} />
          <Tinta x={540} y={1050} t0={w("silencio", "silencio", 1)} c={VERDE} size={90}>shhh…</Tinta>
          <Trazo d={onda(120, 1180, 840, 40, 14, 3)} t0={w("silencio", "constantes")} dur={0.8} c={NARANJA} w={8} punta={false} sonido={false} />
          <Tinta x={540} y={1300} t0={w("silencio", "motor")} c={NARANJA} size={64}>mejor con ruido constante: ¡un motor!</Tinta>
        </svg>
      </Escena>
      {/* 6 · Cierre */}
      <Escena id="cta" sonido="qr_ok.wav">
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Sonido t={desde("cta") + 0.1} f="qr_pop.wav" v={0.2} />
          <Tinta x={540} y={520} t0={desde("cta") + 0.1} c={ROJO} size={170}>SEGUINOS</Tinta>
          <Trazo d={onda(200, 565, 680, 8, 5, 9)} t0={desde("cta") + 0.6} dur={0.5} c={ROJO} w={8} punta={false} sonido={false} />
          <Tinta x={540} y={700} t0={desde("cta") + 0.5} c={AZUL} size={84}>@keisoftware</Tinta>
          <Trazo d={flecha(540, 820, 540, 960, 5)} t0={desde("cta") + 0.9} dur={0.4} c={NARANJA} w={9} punta={false} sonido={false} />
          <Trazo d={caja(130, 990, 820, 250, 8, 60)} t0={desde("cta") + 1.1} dur={0.8} c={AZUL} w={8} punta={false} sonido={false} />
          <Tinta x={540} y={1130} t0={w("cta", "cancelación") - 0.3} c={AZUL} size={66}>¿usás cancelación de ruido?</Tinta>
        </svg>
      </Escena>
    </Base>
  );
};
