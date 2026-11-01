import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { BRAND } from "./KeiCierre";
import { crearExplainer, useT, ramp, pop, hash, clamp, easeInOut, Centro, Chip, Persona, TarjetaSeguir, Sfx } from "./explainerKit";
import voz from "./iaVoz.json";
import pix from "./iaPixeles.json";

// Reel explicativo "¿Cómo ve una foto la IA?" (guion en scripts/guiones/ia.json; fotos de Pixabay con
// scripts/ia_assets.py, que también calcula los píxeles y los bordes reales de la foto del perro).
// Gancho: "para la IA esta foto es solo una lista de números" con la foto en pantalla desde el cuadro 0,
// y bucle abierto: "al final, su error más gracioso" (chihuahua vs. muffin).

const { w, desde, TOTAL, Escena, Base } = crearExplainer(voz, "¿Cómo ve una foto la IA?");
export const IA_TOTAL = TOTAL;

const LUCIA = { remera: BRAND.azulUI, pelo: "#5B3A24", peinado: "largo" as const };
const foto = (n: string) => staticFile(`ia_foto_${n}.jpg`);

// Puntos de la cara del perro (fracciones de la foto) para las formas y las manchas
const CARA = {
  orejas: [[0.3, 0.33, 0.2], [0.74, 0.3, 0.2]],
  ojos: [[0.49, 0.33, 0.09], [0.665, 0.325, 0.09]],
  hocico: [[0.63, 0.51, 0.15]],
} as const;

// ---------------- Piezas ----------------
const Marco: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <div style={{ width: size, height: size, borderRadius: 36, overflow: "hidden", position: "relative", background: "#000",
    boxShadow: `0 30px 80px rgba(0,0,0,.55), 0 0 0 6px #fff`, ...style }}>
    {children}
  </div>
);

// La foto del perro en 24x24: cuadraditos de color (p) y su valor 0-255 encima (numeros)
const Mosaico: React.FC<{ size: number; p: number; numeros?: number; gap?: number }> = ({ size, p, numeros = 0, gap = 0 }) => {
  const N = pix.n, c = size / N;
  return (
    <AbsoluteFill style={{ opacity: p }}>
      {pix.rgb.map(([r, g, b], i) => {
        const x = (i % N) * c, y = Math.floor(i / N) * c;
        const gris = pix.gris[i];
        return (
          <div key={i} style={{ position: "absolute", left: x + gap / 2, top: y + gap / 2, width: c - gap + 0.5, height: c - gap + 0.5,
            background: `rgb(${r},${g},${b})`, borderRadius: gap > 0 ? 3 : 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {numeros > 0 && (
              <span style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: c * 0.36, opacity: numeros,
                color: gris > 120 ? BRAND.fondoOscuro : "#fff" }}>
                {gris}
              </span>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Etiqueta: React.FC<{ texto: string; p: number; style?: React.CSSProperties; color?: string }> = ({ texto, p, style, color = BRAND.azulUI }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", transform: `translate(-50%,-50%) scale(${p}) rotate(${-6 * (1 - p)}deg)`, background: color,
      color: "#fff", fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 54, padding: "10px 30px", borderRadius: 16,
      letterSpacing: 3, boxShadow: `0 10px 30px rgba(0,0,0,.4)`, whiteSpace: "nowrap", ...style }}>
      {texto}
    </div>
  );

// ---------------- Escenas ----------------
const S = 680; // foto principal
const FY = 760;

const Hook: React.FC = () => {
  const t = useT();
  const ia = pop(t, w("hook", "inteligencia"), 13);
  const scan = interpolate(t, [0.3, 3.2], [0, 1], clamp);
  const mosaico = ramp(t, w("hook", "lista") - 0.3, w("hook", "lista") + 0.1);
  const numeros = ramp(t, w("hook", "números") - 0.2, w("hook", "números") + 0.3);
  return (
    <Escena id="hook">
      <Centro y={FY}>
        <Marco size={S}>
          <Img src={foto("perro")} style={{ width: S, height: S }} />
          <Mosaico size={S} p={mosaico} numeros={numeros} gap={2 * numeros} />
          {scan < 1 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: scan * S - 3, height: 6, background: BRAND.azulUI,
              boxShadow: `0 0 30px 10px ${BRAND.azulUI}aa`, opacity: ramp(t, 0.2, 0.4) * (1 - mosaico) }} />
          )}
        </Marco>
      </Centro>
      <Chip p={ia} style={{ left: 820, top: 420, fontSize: 52, padding: "12px 30px" }}>
        <span style={{ color: BRAND.azulUI }}>IA</span>
      </Chip>
    </Escena>
  );
};

const Promesa: React.FC = () => {
  const t = useT();
  const achica = ramp(t, desde("promesa"), w("promesa", "adivina"), easeInOut);
  const pregunta = pop(t, w("promesa", "qué") - 0.1);
  const teaser = ramp(t, w("promesa", "Quedate") - 0.2, w("promesa", "final") + 0.1);
  const risa = pop(t, w("promesa", "gracioso") - 0.1, 9);
  return (
    <Escena id="promesa">
      <Centro y={interpolate(achica, [0, 1], [FY, 640])} style={{ transform: `translate(-50%,-50%) scale(${interpolate(achica, [0, 1], [1, 0.7]) * (1 - teaser)})`, opacity: 1 - teaser }}>
        <Marco size={S}>
          <Mosaico size={S} p={1} numeros={1} gap={2} />
        </Marco>
        <div style={{ position: "absolute", right: -60, top: -60, width: 150, height: 150, borderRadius: "50%", background: BRAND.azulUI,
          display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pregunta})`, boxShadow: `0 0 50px ${BRAND.azulUI}`,
          fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 110, color: "#fff" }}>?</div>
      </Centro>
      {/* adelanto del final, borroso: chihuahua y muffin */}
      {teaser > 0 && (
        <Centro y={760} style={{ opacity: teaser, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * teaser})` }}>
          <div style={{ display: "flex", gap: 40 }}>
            {["chihuahua", "muffin"].map((n, i) => (
              <div key={n} style={{ transform: `rotate(${(i ? 4 : -4) * Math.sin(t * 3)}deg)` }}>
                <Marco size={400}>
                  <Img src={foto(n)} style={{ width: 400, height: 400, filter: "blur(22px)", transform: "scale(1.15)" }} />
                  <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Glacial Indifference'",
                    fontWeight: 700, fontSize: 170, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.5)" }}>?</AbsoluteFill>
                </Marco>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: "50%", top: -90, transform: `translate(-50%,-50%) scale(${risa})`, fontSize: 130 }}>😂</div>
        </Centro>
      )}
    </Escena>
  );
};

const Pixeles: React.FC = () => {
  const t = useT();
  const mosaico = ramp(t, w("pixeles", "puntitos") - 0.1, w("pixeles", "píxeles") + 0.1);
  const zoom = ramp(t, w("pixeles", "cada") - 0.1, w("pixeles", "número") + 0.1, easeInOut);
  const dato = pop(t, w("pixeles", "número") + 0.1);
  const color = pop(t, w("pixeles", "color") - 0.1);
  // píxel elegido: el ojo izquierdo
  const N = pix.n, c = S / N, fila = 8, col = 11;
  const [r, g, b] = pix.rgb[fila * N + col];
  const cx = (col + 0.5) * c, cy = (fila + 0.5) * c;
  const k = interpolate(zoom, [0, 1], [1, 7]);
  return (
    <Escena id="pixeles">
      <Centro y={FY}>
        <Marco size={S}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${(S / 2 - cx) * zoom}px, ${(S / 2 - cy) * zoom}px) scale(${k})` }}>
            <Img src={foto("perro")} style={{ width: S, height: S }} />
            <Mosaico size={S} p={mosaico} gap={1.5 * mosaico} />
            {zoom > 0.5 && (
              <div style={{ position: "absolute", left: col * c, top: fila * c, width: c, height: c, boxSizing: "border-box",
                border: `${3 / k * 2}px solid ${BRAND.azulUI}`, borderRadius: 3 }} />
            )}
          </div>
        </Marco>
      </Centro>
      {/* el número del píxel: rojo, verde y azul */}
      {dato > 0 && (
        <Centro y={1210} style={{ transform: `translate(-50%,-50%) scale(${dato})` }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            {[["R", r, "#FF5C5C"], ["G", g, "#4CD07D"], ["B", b, BRAND.azulUI]].map(([l, v, col2]) => (
              <div key={l as string} style={{ background: BRAND.azulMarino, border: `3px solid ${col2}`, borderRadius: 18, padding: "10px 22px",
                fontFamily: "Montserrat", fontWeight: 700, fontSize: 44, color: "#fff" }}>
                <span style={{ color: col2 as string }}>{l}</span> {v}
              </div>
            ))}
            <div style={{ width: 84, height: 84, borderRadius: 18, background: `rgb(${r},${g},${b})`, border: "4px solid #fff",
              transform: `scale(${color})` }} />
          </div>
        </Centro>
      )}
    </Escena>
  );
};

const Bordes: React.FC = () => {
  const t = useT();
  const ventana = ramp(t, w("bordes", "busca") - 0.3, w("bordes", "bordes"), Easing.linear);
  const bordes = ramp(t, w("bordes", "bordes") - 0.1, w("bordes", "líneas") + 0.2, Easing.linear);
  const manchas = pop(t, w("bordes", "manchas") - 0.1);
  // ventanita (filtro) que recorre la foto en zigzag
  const fila = Math.floor(ventana * 4), f = (ventana * 4) % 1;
  const vx = (fila % 2 ? 1 - f : f) * (S - 140), vy = 60 + fila * 140;
  return (
    <Escena id="bordes">
      <Centro y={FY}>
        <Marco size={S}>
          <Img src={foto("perro")} style={{ width: S, height: S, opacity: 1 - 0.75 * bordes }} />
          <Img src={staticFile("ia_foto_bordes.png")} style={{ position: "absolute", inset: 0, width: S, height: S,
            clipPath: `inset(0 0 ${(1 - bordes) * 100}% 0)`, filter: `drop-shadow(0 0 4px ${BRAND.azulUI})` }} />
          {ventana > 0 && ventana < 1 && (
            <div style={{ position: "absolute", left: vx, top: vy, width: 140, height: 140, borderRadius: 14,
              border: `5px solid ${BRAND.azulUI}`, background: `${BRAND.azulUI}22`, boxShadow: `0 0 30px ${BRAND.azulUI}` }} />
          )}
          {manchas > 0 && [...CARA.ojos, ...CARA.hocico].map(([x, y, r], i) => (
            <div key={i} style={{ position: "absolute", left: x * S, top: y * S, width: r * S, height: r * S, borderRadius: "50%",
              transform: `translate(-50%,-50%) scale(${manchas})`, background: `${BRAND.azulUI}66`, border: `4px solid ${BRAND.azulUI}` }} />
          ))}
        </Marco>
      </Centro>
    </Escena>
  );
};

const Formas: React.FC = () => {
  const t = useT();
  const grupos: [keyof typeof CARA, string, string][] = [["orejas", "orejas", "orejas"], ["ojos", "ojos", "ojos"], ["hocico", "hocico", "hocico"]];
  return (
    <Escena id="formas">
      <Centro y={FY}>
        <Marco size={S}>
          <Img src={foto("perro")} style={{ width: S, height: S, opacity: 0.3 }} />
          <Img src={staticFile("ia_foto_bordes.png")} style={{ position: "absolute", inset: 0, width: S, height: S, opacity: 0.8 }} />
          {grupos.map(([k, palabra]) => {
            const p = pop(t, w("formas", palabra) - 0.1, 11);
            return CARA[k].map(([x, y, r], i) => (
              <div key={`${k}${i}`} style={{ position: "absolute", left: x * S, top: y * S, width: r * S * 1.25, height: r * S * 1.25,
                transform: `translate(-50%,-50%) scale(${p})`, borderRadius: 18, border: `6px solid ${BRAND.azulUI}`,
                background: `${BRAND.azulUI}22`, boxShadow: `0 0 24px ${BRAND.azulUI}` }} />
            ));
          })}
        </Marco>
        {grupos.map(([k, palabra, txt], i) => {
          const p = pop(t, w("formas", palabra), 11);
          return <Etiqueta key={k} texto={txt} p={p} style={{ left: S / 2 + (i - 1) * 230, top: S + 90, fontSize: 46 }} />;
        })}
      </Centro>
    </Escena>
  );
};

const PERROS = ["perro", "golden", "aussie", "pointer"];
const GATOS = ["gato_naranja", "gato_bufanda", "gatito", "gato_negro", "gato_atigrado"];
const PARED = [...Array(28)].map((_, i) => (i % 2 ? GATOS[(i >> 1) % GATOS.length] : PERROS[(i >> 1) % PERROS.length]));

const Ejemplos: React.FC = () => {
  const t = useT();
  const T = 210;
  const sube = (t - desde("ejemplos")) * 120;
  const contador = pop(t, w("ejemplos", "millones") - 0.1);
  const marcas: [string, string, number][] = [
    ["golden", "PERRO", w("ejemplos", "perro", 0)],
    ["gato_naranja", "GATO", w("ejemplos", "gato", 0)],
    ["aussie", "PERRO", w("ejemplos", "perro", 1)],
    ["gato_bufanda", "GATO", w("ejemplos", "gato", 1)],
  ];
  const actual = [...marcas].reverse().find((m) => t >= m[2] - 0.15);
  const golpe = actual ? pop(t, actual[2] - 0.05, 9) : 0;
  const tarjeta = ramp(t, w("ejemplos", "etiquetado") - 0.2, w("ejemplos", "etiquetado") + 0.2);
  return (
    <Escena id="ejemplos">
      {/* pared de fotos que no termina */}
      <div style={{ position: "absolute", left: 540 - 2.5 * T, top: 330, width: 5 * T, height: 1000, overflow: "hidden",
        WebkitMaskImage: "linear-gradient(transparent, #000 15%, #000 85%, transparent)", opacity: 1 - 0.65 * tarjeta }}>
        {PARED.concat(PARED).map((n, i) => {
          const colI = i % 5, filaI = Math.floor(i / 5);
          const y = ((filaI * T - sube - colI * 40) % (12 * T) + 12 * T) % (12 * T) - T;
          return (
            <Img key={i} src={foto(n)} style={{ position: "absolute", left: colI * T + 6, top: y, width: T - 12, height: T - 12,
              borderRadius: 18, objectFit: "cover" }} />
          );
        })}
      </div>
      <Chip p={contador * (1 - tarjeta)} style={{ left: 540, top: 820, fontSize: 64, padding: "16px 40px" }}>
        <span style={{ color: BRAND.azulUI }}>+1.000.000</span> fotos
      </Chip>
      {/* etiquetado: perro, gato, perro, gato */}
      {tarjeta > 0 && actual && (
        <Centro x={600} y={760} style={{ opacity: tarjeta, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * tarjeta})` }}>
          <Marco size={460}><Img src={foto(actual[0])} style={{ width: 460, height: 460, objectFit: "cover" }} /></Marco>
          <Etiqueta texto={actual[1]} p={golpe} color={actual[1] === "PERRO" ? BRAND.azulUI : "#7C5CFF"} style={{ left: 230, top: 460, fontSize: 64 }} />
        </Centro>
      )}
      {tarjeta > 0 && (
        <Persona x={190} y={1330} escala={0.62} {...LUCIA} opacity={tarjeta} brazoD={60 + 50 * (1 - golpe)} />
      )}
    </Escena>
  );
};

const Probabilidad: React.FC = () => {
  const t = useT();
  const duda = ramp(t, w("probabilidad", "nunca") - 0.1, w("probabilidad", "segura") + 0.3);
  const barras = ramp(t, w("probabilidad", "porcentaje") - 0.2, w("probabilidad", "porcentaje") + 0.3);
  const v = interpolate(t, [w("probabilidad", "Noventa") - 0.1, w("probabilidad", "perro") + 0.2], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const filas: [string, number][] = [["Perro", 97], ["Gato", 3]];
  return (
    <Escena id="probabilidad">
      <Centro y={600}>
        <Marco size={480} style={{ transform: `rotate(${Math.sin(t * 7) * 3 * duda * (1 - v)}deg)` }}>
          <Img src={foto("perro")} style={{ width: 480, height: 480 }} />
        </Marco>
      </Centro>
      <div style={{ position: "absolute", left: 130, right: 130, top: 940, opacity: barras }}>
        {filas.map(([n, pct]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 34 }}>
            <div style={{ width: 170, fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 52, color: "#fff" }}>{n}</div>
            <div style={{ flex: 1, height: 56, borderRadius: 28, background: `${BRAND.azulHielo}22`, overflow: "hidden" }}>
              <div style={{ width: `${pct * v}%`, height: "100%", borderRadius: 28, background: pct > 50 ? BRAND.azulUI : "#8A93B8",
                boxShadow: pct > 50 ? `0 0 24px ${BRAND.azulUI}` : undefined }} />
            </div>
            <div style={{ width: 150, textAlign: "right", fontFamily: "Montserrat", fontWeight: 700, fontSize: 48, color: pct > 50 ? BRAND.azulUI : "#8A93B8" }}>
              {Math.round(pct * v)}%
            </div>
          </div>
        ))}
      </div>
    </Escena>
  );
};

const Confusion: React.FC = () => {
  const t = useT();
  const chi = pop(t, w("error", "chihuahua") - 0.15, 12);
  const muf = pop(t, w("error", "muffin") - 0.15, 12);
  const confunde = pop(t, w("error", "muffin") + 0.25, 10);
  const pregunta = ramp(t, w("error", "Vos") - 0.1, w("error", "Vos") + 0.3);
  const C = 440;
  return (
    <Escena id="error">
      {[["chihuahua", chi, 290, "MUFFIN 71%"], ["muffin", muf, 790, "PERRO 64%"]].map(([n, p, x, et], i) => (
        <Centro key={n as string} x={x as number} y={760} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${(i ? 3 : -3) + Math.sin(t * 4 + i) * 2 * pregunta}deg)` }}>
          <Marco size={C}><Img src={foto(n as string)} style={{ width: C, height: C }} /></Marco>
          <Etiqueta texto={et as string} p={confunde} color={i ? BRAND.azulUI : "#E0566B"} style={{ left: C / 2, top: C + 50, fontSize: 44 }} />
        </Centro>
      ))}
      <Centro y={430} style={{ opacity: pregunta, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * pregunta})` }}>
        <div style={{ fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 150, color: "#fff", textShadow: `0 0 40px ${BRAND.azulUI}` }}>🤔</div>
      </Centro>
    </Escena>
  );
};

const Cta: React.FC = () => {
  const t = useT();
  const saludo = Math.sin(t * 9) * 22;
  return (
    <Escena id="cta">
      <TarjetaSeguir aparece={w("cta", "Seguinos") - 0.1} cursorDesde={w("cta", "para") - 0.1} toque={w("cta", "tecnología")}
        cursorFin={[w("cta", "todos"), w("cta", "días")]} />
      <Persona x={300} y={1340} escala={0.72} {...LUCIA} brazoD={130 + saludo} />
    </Escena>
  );
};

// ---------------- Sonido ----------------
const SFX: Sfx[] = [
  ["qr_pop.wav", w("hook", "inteligencia"), 0.3],
  ["qr_tick.wav", w("hook", "lista"), 0.45],
  ["qr_pop.wav", w("hook", "números"), 0.35],
  ["qr_pop.wav", w("promesa", "qué") - 0.1, 0.35],
  ["qr_pop.wav", w("promesa", "gracioso") - 0.1, 0.35],
  ["qr_tick.wav", w("pixeles", "píxeles"), 0.45],
  ["qr_pop.wav", w("pixeles", "número") + 0.1, 0.35],
  ["qr_tick.wav", w("bordes", "bordes"), 0.4],
  ["qr_pop.wav", w("bordes", "manchas") - 0.1, 0.3],
  ["qr_pop.wav", w("formas", "orejas"), 0.3],
  ["qr_pop.wav", w("formas", "ojos"), 0.3],
  ["qr_pop.wav", w("formas", "hocico"), 0.3],
  ["qr_pop.wav", w("ejemplos", "millones") - 0.1, 0.3],
  ["qr_tick.wav", w("ejemplos", "perro", 0), 0.5],
  ["qr_tick.wav", w("ejemplos", "gato", 0), 0.5],
  ["qr_tick.wav", w("ejemplos", "perro", 1), 0.5],
  ["qr_tick.wav", w("ejemplos", "gato", 1), 0.5],
  ["qr_ok.wav", w("probabilidad", "perro") + 0.1, 0.4],
  ["qr_pop.wav", w("error", "chihuahua") - 0.15, 0.3],
  ["qr_pop.wav", w("error", "muffin") - 0.15, 0.3],
  ["qr_pop.wav", w("error", "muffin") + 0.25, 0.35],
  ["qr_pop.wav", w("cta", "Seguinos"), 0.3],
  ["qr_tick.wav", w("cta", "tecnología"), 0.5],
];

// ---------------- Composición ----------------
export const IaExplainer: React.FC = () => (
  <Base audio="ia" sfx={SFX}>
    <Hook />
    <Promesa />
    <Pixeles />
    <Bordes />
    <Formas />
    <Ejemplos />
    <Probabilidad />
    <Confusion />
    <Cta />
  </Base>
);
