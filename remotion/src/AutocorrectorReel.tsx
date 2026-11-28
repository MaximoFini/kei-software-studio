import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import { crearReel, ramp, pop, useT, Sonido } from "./reelKit";
import voz from "./autocorrectorVoz.json";

// Reel CHAT "¿Cómo adivina tu celu lo que vas a escribir?" (guion en scripts/guiones/autocorrector.json).
// Una conversación de WhatsApp falsa entre "vos" y el teclado; abajo, la barra de sugerencias del teclado hace de pizarra.

const INTER = "Inter, sans-serif";
const VERDE = "#25D366";

const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B141A", backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 2px, transparent 2px)", backgroundSize: "44px 44px" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 190, height: 130, background: "#1F2C34", display: "flex", alignItems: "center", gap: 28, padding: "0 50px", fontFamily: INTER }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, background: "linear-gradient(135deg,#25D366,#128C7E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>⌨️</div>
      <div>
        <div style={{ color: "#E9EDEF", fontSize: 44, fontWeight: 700 }}>Teclado inteligente</div>
        <div style={{ color: VERDE, fontSize: 30 }}>escribiendo…</div>
      </div>
    </div>
  </AbsoluteFill>
);

const { w, desde, Escena, Base, TOTAL } = crearReel(voz, {
  fondo: <Fondo />,
  sub: { font: INTER, size: 62, color: "#E9EDEF", active: VERDE, top: 1585, weight: 700, shadow: "0 3px 12px rgba(0,0,0,.6)" },
  progreso: VERDE,
  progresoY: 160,
  barra: "#25D366",
});
export const AUTOCORRECTOR_TOTAL = TOTAL;

type Msg = { t: number; yo: boolean; txt: string };
const msgs = (): Msg[] => [
  { t: desde("hook") + 0.1, yo: false, txt: "Ya sé qué vas a escribir 😏" },
  { t: w("hook", "Cómo"), yo: true, txt: "¿Cómo?" },
  { t: desde("teclas") + 0.05, yo: false, txt: "Si tocás una tecla, miro también las vecinas" },
  { t: desde("prob") + 0.05, yo: false, txt: "Cada palabra tiene una probabilidad" },
  { t: desde("aprende") + 0.05, yo: false, txt: "Y aprendo de vos: muletillas, nombres, chistes" },
  { t: w("aprende", "chistes") + 0.2, yo: true, txt: "jajaja 😂" },
  { t: desde("error") + 0.05, yo: false, txt: "A veces apuesto mal 🙈" },
  { t: w("error", "adivinando") - 0.2, yo: true, txt: "ayer puso 'cosa' en vez de 'casi'" },
  { t: desde("cta") + 0.05, yo: false, txt: "Seguinos 👉 @keisoftware" },
  { t: w("cta", "celu") - 0.1, yo: false, txt: "¿Cuál es esa palabra que siempre te corrige mal?" },
];
const alto = (txt: string) => Math.ceil(txt.length / 24) * 66 + 60 + 26;
const AREA = 800; // alto visible del chat (de y=340 a y=1140)

const Chat: React.FC = () => {
  const t = useT();
  const L = msgs();
  let acc = 0;
  const pos = L.map((m) => {
    const y = acc;
    acc += alto(m.txt);
    return { y, bottom: acc };
  });
  // desplazamiento suave: sube cuando entra un mensaje que no cabe
  let off = 0;
  L.forEach((m, i) => {
    const target = Math.max(0, pos[i].bottom - AREA);
    off = off + (target - off) * ramp(t, m.t, m.t + 0.35);
  });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 340, height: AREA, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 0, transform: `translateY(${-off}px)` }}>
        {L.map((m, i) => {
          const p = pop(t, m.t, 14);
          if (p <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", top: pos[i].y, left: 0, right: 0, display: "flex", justifyContent: m.yo ? "flex-end" : "flex-start" }}>
              <Sonido t={m.t} f="qr_pop.wav" v={0.16} />
              <div style={{ transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: m.yo ? "right center" : "left center", opacity: Math.min(1, p * 2), background: m.yo ? "#005C4B" : "#202C33",
                color: "#E9EDEF", fontFamily: INTER, fontSize: 52, lineHeight: "66px", padding: "28px 38px", borderRadius: 34, maxWidth: 800, fontWeight: 400 }}>
                {m.txt}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Barra de sugerencias del teclado (chips) + campo de texto: acá se "ve" lo que hace el teclado. */
const Chip: React.FC<{ txt: string; t0: number; fuerte?: boolean; mal?: boolean; sub?: string }> = ({ txt, t0, fuerte, mal, sub }) => {
  const t = useT();
  const p = pop(t, t0, 13);
  if (p <= 0) return null;
  return (
    <div style={{ transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), flex: fuerte ? 1.25 : 1, textAlign: "center", fontFamily: INTER,
      background: mal ? "#7A2E2E" : fuerte ? "#0F5A47" : "#1F2C34", border: `3px solid ${mal ? "#F27B70" : fuerte ? VERDE : "#2E3F49"}`,
      borderRadius: 26, padding: "16px 10px", color: "#E9EDEF", fontSize: fuerte ? 52 : 44, fontWeight: fuerte ? 700 : 400 }}>
      {txt}
      {sub && <div style={{ fontSize: 30, color: mal ? "#F27B70" : VERDE, marginTop: 2 }}>{sub}</div>}
    </div>
  );
};

const Teclado: React.FC = () => {
  const t = useT();
  const campo = (txt: string, t0: number) => {
    const n = Math.max(0, Math.min(txt.length, Math.floor((t - t0) * 9)));
    return txt.slice(0, n);
  };
  const cursor = Math.floor(t * 2.5) % 2 === 0 ? "▌" : " ";
  let texto = "";
  if (t >= desde("hook") && t < desde("teclas")) texto = "Escribí un mensaje";
  else if (t < desde("prob")) texto = campo("ho", w("teclas", "tecla"));
  else if (t < desde("aprende")) texto = t > w("prob", "probabilidad") + 0.6 ? "hola " : campo("hol", desde("prob") + 0.2);
  else if (t < desde("error")) texto = campo("ja", desde("aprende") + 0.2);
  else if (t < desde("cta")) texto = campo("ca", desde("error") + 0.2);
  else texto = "";
  const hint = texto === "Escribí un mensaje";
  return (
    <>
      {/* chips de sugerencia */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1175, height: 120, display: "flex", gap: 18, alignItems: "stretch" }}>
        <Escena id="teclas" fija sonido="">
          <div style={{ display: "flex", gap: 18, width: "100%", height: 120, alignItems: "center" }}>
            <Chip txt="w" t0={w("teclas", "vecinas") - 0.2} sub="vecina" />
            <Chip txt="e" t0={w("teclas", "tecla")} fuerte sub="tocada" />
            <Chip txt="r" t0={w("teclas", "vecinas") - 0.1} sub="vecina" />
          </div>
        </Escena>
        <Escena id="prob" fija sonido="">
          <div style={{ display: "flex", gap: 18, width: "100%", height: 120, alignItems: "center" }}>
            <Chip txt="ola" t0={w("prob", "probabilidad") + 0.2} sub="11 %" />
            <Chip txt="hola" t0={w("prob", "probabilidad")} fuerte sub="82 %" />
            <Chip txt="hoy" t0={w("prob", "probabilidad") + 0.3} sub="7 %" />
          </div>
        </Escena>
        <Escena id="aprende" fija sonido="">
          <div style={{ display: "flex", gap: 18, width: "100%", height: 120, alignItems: "center" }}>
            <Chip txt="jaja" t0={w("aprende", "muletillas")} />
            <Chip txt="jajaja" t0={w("aprende", "nombres")} fuerte sub="tu favorita" />
            <Chip txt="jeje" t0={w("aprende", "chistes")} />
          </div>
        </Escena>
        <Escena id="error" fija sonido="">
          <div style={{ display: "flex", gap: 18, width: "100%", height: 120, alignItems: "center" }}>
            <Chip txt="casi" t0={w("error", "adivinando")} sub="lo que querías" />
            <Chip txt="cosa" t0={w("error", "apostando")} mal sub="la que apostó" />
          </div>
        </Escena>
      </div>
      {/* campo de texto */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1315, height: 96, borderRadius: 48, background: "#1F2C34", display: "flex", alignItems: "center",
        padding: "0 40px", fontFamily: INTER, fontSize: 46, color: hint ? "#6B7B85" : "#E9EDEF" }}>
        {texto}
        {!hint && <span style={{ color: VERDE }}>{cursor}</span>}
      </div>
    </>
  );
};

export const AutocorrectorReel: React.FC = () => (
  <Base audio="autocorrector">
    <Chat />
    <Teclado />
  </Base>
);
