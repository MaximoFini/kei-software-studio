import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { KeiCierre, BRAND } from "./KeiCierre";
import { FPS, useT, ramp, pop, easeInOut, Sonido } from "./pizarronKit";

// Motor común de los formatos NUEVOS (chat, terminal, cuaderno, collage, isométrico).
// Igual que pizarronKit.crearPizarron: toma los tiempos de la voz (scripts/explainer.py), arma subtítulos por bloques,
// barra de progreso, voz + música y el cierre KEI con barrido. Cada formato sólo aporta el fondo, el estilo de los
// subtítulos y sus escenas. Micro-sonidos mínimos: `Sonido` en las escenas y en los elementos que aparecen.

const CIERRE_FRAMES = 120;
const SKIP = 12;
const FADE = 0.28;
const C0_PAD = 0.12;

type Palabra = { w: string; s: number; e: number };
export type Voz = { escenas: { id: string; texto: string; s: number; e: number; palabras: Palabra[] }[] };

export type SubStyle = {
  font: string; size: number; color: string; active: string; top?: number; weight?: number;
  upper?: boolean; shadow?: string; activeBg?: string; stroke?: string;
};
export type ReelOpts = {
  fondo: React.ReactNode;
  sub: SubStyle;
  progreso: string;
  barra?: string;
  progresoY?: number;
  /** capa que va por encima del fondo pero debajo de los subtítulos (p.ej. marco del teléfono) */
  marca?: React.ReactNode;
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const crearReel = (voz: Voz, opt: ReelOpts) => {
  const ESC = Object.fromEntries(voz.escenas.map((e) => [e.id, e]));
  const IDS = voz.escenas.map((e) => e.id);
  const C0 = voz.escenas[voz.escenas.length - 1].e + C0_PAD;
  const TOTAL = Math.round(C0 * FPS) - SKIP + CIERRE_FRAMES;

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

  /** Escena: capa que entra con un pequeño deslizamiento y sale con fundido. Con `fija` no se desvanece (formatos persistentes). */
  const Escena: React.FC<{ id: string; children: React.ReactNode; fija?: boolean; sonido?: string }> = ({ id, children, fija, sonido = "whoosh.wav" }) => {
    const t = useT();
    const a = desde(id), b = hasta(id);
    if (t < a - 0.01 || t > b + FADE) return null;
    const out = fija ? 0 : ramp(t, b, b + FADE);
    const inn = ramp(t, a, a + 0.25);
    return (
      <AbsoluteFill style={{ opacity: (1 - out) * Math.min(1, inn * 1.6), transform: `translateY(${(1 - inn) * 24}px)` }}>
        {sonido && <Sonido t={a} f={sonido} v={0.07} />}
        {children}
      </AbsoluteFill>
    );
  };

  const BLOQUES = (() => {
    const out: { ps: Palabra[]; txt: string[]; s: number; e: number }[] = [];
    for (const esc of voz.escenas) {
      let pos = 0;
      let cur: Palabra[] = [], txt: string[] = [];
      esc.palabras.forEach((p, i) => {
        const cw = p.w.replace(/[.,;:?!¿¡]/g, "");
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

  const S = opt.sub;
  const Subtitulos: React.FC = () => {
    const t = useT();
    const b = BLOQUES.find((x) => t >= x.s - 0.04 && t < x.e);
    if (!b) return null;
    const p = pop(t, b.s - 0.04, 16);
    return (
      <div style={{ position: "absolute", left: 50, right: 50, top: S.top ?? 1480, transform: `translateY(-50%) scale(${0.94 + 0.06 * p})`,
        display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22, rowGap: 6, textAlign: "center", fontFamily: S.font,
        fontWeight: S.weight ?? 700, fontSize: S.size, lineHeight: 1.1, opacity: Math.min(1, p * 2), textTransform: S.upper ? "uppercase" : undefined,
        textShadow: S.shadow, WebkitTextStroke: S.stroke }}>
        {b.ps.map((pw, i) => {
          const activa = t >= pw.s - 0.03 && t < (b.ps[i + 1] ? b.ps[i + 1].s - 0.03 : b.e);
          return (
            <span key={i} style={{ color: activa ? S.active : S.color, background: activa ? S.activeBg : undefined, padding: S.activeBg ? "0 10px" : undefined }}>
              {b.txt[i]}
            </span>
          );
        })}
      </div>
    );
  };

  const Progreso: React.FC = () => {
    const t = useT();
    const p = Math.pow(Math.min(1, t / C0), 0.9);
    const y = opt.progresoY ?? 150;
    return (
      <div style={{ position: "absolute", left: 70, right: 70, top: y, height: 9, borderRadius: 6, background: "rgba(255,255,255,0.18)" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 6, background: opt.progreso }} />
      </div>
    );
  };

  const Base: React.FC<{ audio: string; children: React.ReactNode }> = ({ audio, children }) => {
    const t = useT();
    const e = ramp(t, C0, C0 + 0.55, easeInOut);
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        {t < C0 + 0.6 && (
          <>
            {opt.fondo}
            {children}
            {opt.marca}
            <Progreso />
            <Subtitulos />
          </>
        )}
        <Sequence from={Math.round(C0 * FPS) - SKIP} durationInFrames={CIERRE_FRAMES}>
          <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - e) * 100}% 0 0)`, backgroundColor: BRAND.fondoOscuro }}>
            <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
          </AbsoluteFill>
        </Sequence>
        {e > 0 && e < 1 && (
          <div style={{ position: "absolute", top: 0, bottom: 0, left: e * 1080 - 40, width: 80, background: opt.barra ?? "#ffffff",
            boxShadow: "-14px 0 40px rgba(0,0,0,.45)" }} />
        )}
        <Audio src={staticFile(`${audio}_voz.wav`)} />
        <Audio src={staticFile(`${audio}_musica.wav`)} />
        <Sequence from={Math.round(C0 * FPS) - 4} durationInFrames={FPS * 2}>
          <Audio src={staticFile("whoosh.wav")} volume={0.3} />
        </Sequence>
      </AbsoluteFill>
    );
  };

  return { ESC, w, desde, hasta, C0, TOTAL, Escena, Base };
};

export { ramp, pop, useT, Sonido, FPS };
