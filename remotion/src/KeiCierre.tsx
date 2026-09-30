import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Paleta del manual de marca KEI Software
export const BRAND = {
  azulUI: "#3F7DFF",
  fondoOscuro: "#020714",
  azulMarino: "#16205E",
  fondoClaro: "#F9FAFC",
  azulHielo: "#DFE8FD",
};

const fontFace = `
@font-face {
  font-family: 'Glacial Indifference';
  src: url('${staticFile("glacial-indifference-400.woff2")}') format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Glacial Indifference';
  src: url('${staticFile("glacial-indifference-700.woff2")}') format('woff2');
  font-weight: 700;
}`;

export type KeiCierreProps = {
  linea1: string;
  linea2: string;
  fadeOut: boolean;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// ---------- Fondo: halos laterales + trama de puntos ----------
const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const gridOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], { ...clamp, easing: easeOut });
  const haloIn = interpolate(frame, [0, 0.6 * fps], [0, 1], clamp);

  // Deriva lenta de los halos
  const h1x = -180 + Math.sin(t * 0.6) * 40;
  const h1y = 520 + Math.cos(t * 0.5) * 50;
  const h2x = 760 + Math.cos(t * 0.55) * 40;
  const h2y = 1320 + Math.sin(t * 0.45) * 50;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: h1x,
          top: h1y,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.azulUI}55 0%, ${BRAND.azulMarino}66 35%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: haloIn,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: h2x,
          top: h2y,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND.azulUI}44 0%, ${BRAND.azulMarino}66 35%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: haloIn,
        }}
      />
      {/* Trama de puntos, desvanecida hacia los bordes */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${BRAND.azulUI}66 1.6px, transparent 1.8px)`,
          backgroundSize: "44px 44px",
          backgroundPosition: "22px 22px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
          opacity: gridOpacity * 0.55,
        }}
      />
      {/* Viñeta suave */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${BRAND.fondoOscuro}cc 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Composición principal ----------
export const KeiCierre: React.FC<KeiCierreProps> = ({ linea1, linea2, fadeOut }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  // Isotipo: fade + escala uniforme (sin rotar ni deformar, según manual)
  const isoSpring = spring({
    frame: frame - s(0.4),
    fps,
    config: { damping: 18, stiffness: 90, mass: 1 },
  });
  const isoScale = interpolate(isoSpring, [0, 1], [0.9, 1]);
  const isoOpacity = interpolate(frame, [s(0.4), s(1.0)], [0, 1], clamp);

  // Halo detrás del isotipo que "respira" (es fondo, no efecto sobre el logo)
  const breathe = 0.85 + 0.15 * Math.sin((frame / fps) * 2.2);
  const haloOpacity = interpolate(frame, [s(0.5), s(1.3)], [0, 1], clamp) * breathe;

  // Wordmark: revelado con máscara izquierda → derecha
  const wmReveal = interpolate(frame, [s(1.4), s(2.2)], [0, 100], { ...clamp, easing: easeOut });
  const wmOpacity = interpolate(frame, [s(1.4), s(1.6)], [0, 1], clamp);

  // Slogan: fade-up escalonado
  const line = (start: number) => ({
    opacity: interpolate(frame, [s(start), s(start + 0.5)], [0, 1], clamp),
    transform: `translateY(${interpolate(frame, [s(start), s(start + 0.6)], [28, 0], {
      ...clamp,
      easing: easeOut,
    })}px)`,
  });

  const globalOpacity = fadeOut
    ? interpolate(frame, [durationInFrames - s(0.5), durationInFrames - 1], [1, 0], clamp)
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
      <style>{fontFace}</style>
      <AbsoluteFill style={{ opacity: globalOpacity }}>
        <Fondo />

        {/* Halo del isotipo */}
        <div
          style={{
            position: "absolute",
            left: 540 - 380,
            top: 700 - 380,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND.azulUI}40 0%, ${BRAND.azulUI}14 40%, transparent 70%)`,
            opacity: haloOpacity,
          }}
        />

        {/* Isotipo */}
        <AbsoluteFill style={{ alignItems: "center" }}>
          <Img
            src={staticFile("isotipo.png")}
            style={{
              position: "absolute",
              top: 700 - 210,
              height: 420,
              opacity: isoOpacity,
              transform: `scale(${isoScale})`,
            }}
          />
        </AbsoluteFill>

        {/* Wordmark KEI Software (PNG original, sin reescribir) */}
        <AbsoluteFill style={{ alignItems: "center" }}>
          <Img
            src={staticFile("wordmark.png")}
            style={{
              position: "absolute",
              top: 1010,
              width: 760,
              opacity: wmOpacity,
              clipPath: `inset(-10% ${100 - wmReveal}% -10% 0)`,
            }}
          />
        </AbsoluteFill>

        {/* Slogan */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            top: 1190,
            fontFamily: "'Glacial Indifference', sans-serif",
            fontWeight: 400,
            fontSize: 68,
            lineHeight: 1.25,
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          <div style={{ color: BRAND.fondoClaro, ...line(2.2) }}>{linea1}</div>
          <div style={{ color: BRAND.azulUI, ...line(2.45) }}>{linea2}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
