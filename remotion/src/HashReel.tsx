import React from "react";
import { AbsoluteFill } from "remotion";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import { crearReel, ramp, useT, Sonido } from "./reelKit";
import voz from "./hashVoz.json";

// Reel TERMINAL "¿Cómo guarda tu contraseña un sitio sin saberla?" (guion en scripts/guiones/hash.json).
// Cada escena es una pantalla de terminal que se limpia: los comandos se tipean y las respuestas aparecen de golpe.

const MONO = "'JetBrains Mono', monospace";
const VERDE = "#7EE787", ROJO = "#FF7B72", AZUL = "#79C0FF", AMARILLO = "#E3B341", GRIS = "#8B949E", BLANCO = "#E6EDF3";

const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: "#010409" }}>
    <div style={{ position: "absolute", left: 40, right: 40, top: 215, height: 1170, borderRadius: 28, background: "#0D1117", border: "2px solid #30363D", overflow: "hidden" }}>
      <div style={{ height: 78, background: "#161B22", borderBottom: "2px solid #30363D", display: "flex", alignItems: "center", gap: 16, padding: "0 28px" }}>
        {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => <div key={c} style={{ width: 24, height: 24, borderRadius: 12, background: c }} />)}
        <div style={{ marginLeft: 20, color: GRIS, fontFamily: MONO, fontSize: 28 }}>kei — zsh — 80×24</div>
      </div>
    </div>
  </AbsoluteFill>
);

const { w, desde, Escena, Base, TOTAL } = crearReel(voz, {
  fondo: <Fondo />,
  sub: { font: MONO, size: 54, color: GRIS, active: VERDE, top: 1565, weight: 700, shadow: "0 3px 12px rgba(0,0,0,.7)" },
  progreso: VERDE,
  progresoY: 160,
  barra: VERDE,
});
export const HASH_TOTAL = TOTAL;

type Linea = { t: number; txt: string; c?: string; tipo?: boolean; grande?: boolean };

/** Terminal: `tipo` = se escribe carácter a carácter; si no, aparece de golpe con un tick. */
const Term: React.FC<{ lineas: Linea[]; top?: number }> = ({ lineas, top = 310 }) => {
  const t = useT();
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  let y = 0;
  const filas = lineas.map((l) => {
    const alto = (l.grande ? 96 : 80) * Math.max(1, Math.ceil(l.txt.length / (l.grande ? 17 : 27)));
    const fila = { ...l, y };
    y += alto + 34;
    return fila;
  });
  const ultima = [...filas].reverse().find((l) => t >= l.t);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top }}>
      {filas.map((l, i) => {
        if (t < l.t) return null;
        const n = l.tipo ? Math.min(l.txt.length, Math.floor((t - l.t) * 32)) : l.txt.length;
        const escribiendo = l.tipo && n < l.txt.length;
        return (
          <div key={i} style={{ position: "absolute", top: l.y, left: 0, right: 0, fontFamily: MONO, color: l.c ?? BLANCO, fontSize: l.grande ? 78 : 52,
            fontWeight: l.grande ? 700 : 400, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {!l.tipo && <Sonido t={l.t} f="qr_tick.wav" v={0.14} />}
            {l.txt.slice(0, n)}
            {l === ultima && (escribiendo || cursor) && <span style={{ color: VERDE }}>▌</span>}
          </div>
        );
      })}
    </div>
  );
};

export const HashReel: React.FC = () => {
  const t = useT();
  const ok = Math.min(1, ramp(t, w("login", "coinciden"), w("login", "coinciden") + 0.3));
  return (
    <Base audio="hash">
      <Escena id="hook">
        <Term lineas={[
          { t: desde("hook") + 0.25, txt: "$ cat contraseña.txt", c: AZUL, tipo: true },
          { t: w("hook", "ningún"), txt: "cat: no existe el archivo", c: ROJO },
          { t: w("hook", "Cómo") - 0.1, txt: "$ ¿cómo te reconocen?", c: AMARILLO, tipo: true },
        ]} />
      </Escena>
      <Escena id="hash">
        <Term lineas={[
          { t: desde("hash") + 0.2, txt: '$ echo "perro123" | sha256', c: AZUL, tipo: true },
          { t: w("hash", "hash") - 0.1, txt: "a4f3c1…9e7d", c: VERDE, grande: true },
          { t: w("hash", "sentido"), txt: "→ un solo sentido", c: AMARILLO },
        ]} />
      </Escena>
      <Escena id="imposible">
        <Term lineas={[
          { t: desde("imposible") + 0.15, txt: "$ sha256 --revertir a4f3c1…", c: AZUL, tipo: true },
          { t: w("imposible", "imposible") - 0.05, txt: "ERROR: no se puede volver atrás", c: ROJO, grande: true },
        ]} />
      </Escena>
      <Escena id="guarda">
        <Term lineas={[
          { t: desde("guarda") + 0.15, txt: "$ guardar usuario=maxi", c: AZUL, tipo: true },
          { t: w("guarda", "resultado"), txt: "resultado = 7b2d…e41", c: VERDE },
          { t: w("guarda", "sal"), txt: "sal = x9Q  (única por usuario)", c: AMARILLO },
          { t: w("guarda", "repita") - 0.2, txt: "contraseña = (no se guarda)", c: ROJO },
        ]} />
      </Escena>
      <Escena id="login">
        <Term lineas={[
          { t: desde("login") + 0.1, txt: "$ login maxi perro123", c: AZUL, tipo: true },
          { t: w("login", "repite") + 0.1, txt: "hash(perro123 + x9Q) = 7b2d…e41", c: VERDE },
          { t: w("login", "coinciden"), txt: "✔ coincide → bienvenido", c: VERDE, grande: true },
        ]} />
        <div style={{ position: "absolute", left: 90, right: 90, top: 1110, height: 8, borderRadius: 4, background: VERDE, opacity: ok * 0.9, transform: `scaleX(${ok})`, transformOrigin: "left" }} />
      </Escena>
      <Escena id="cta" sonido="qr_ok.wav">
        <Term lineas={[
          { t: desde("cta") + 0.1, txt: "$ follow @keisoftware", c: AZUL, tipo: true },
          { t: desde("cta") + 0.9, txt: "✔ siguiendo", c: VERDE, grande: true },
          { t: w("cta", "larga") - 0.1, txt: "$ ¿qué tan larga es tu contraseña?", c: AMARILLO, tipo: true },
        ]} />
      </Escena>
    </Base>
  );
};
