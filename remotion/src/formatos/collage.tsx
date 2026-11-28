import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Circle, Rect } from "@remotion/shapes";
import { noise2D } from "@remotion/noise";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import "@fontsource/bebas-neue/400.css";

// Formato COLLAGE de papel recortado: tiras rotadas con sombra dura, jitter por ruido,
// escenas encadenadas con @remotion/transitions. Fuente: Bebas Neue (fontsource local).
const Papel: React.FC<{ txt: string; rot: number; color: string; top: number }> = ({ txt, rot, color, top }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 12], [60, 0], { extrapolateRight: "clamp" });
  const j = noise2D(txt, f / 20, 0) * 1.5;
  return (
    <div
      style={{
        position: "absolute", top: top + y, left: 80, right: 80, background: color, color: "#111", padding: "30px 40px",
        transform: `rotate(${rot + j}deg)`, boxShadow: "12px 12px 0 #111", fontFamily: "'Bebas Neue', sans-serif", fontSize: 150, lineHeight: 1,
      }}
    >
      {txt}
    </div>
  );
};
const Esc: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <AbsoluteFill style={{ background: "#E9DFC8" }}>
    <Papel txt={a} rot={-3} color="#F5D547" top={500} />
    <Papel txt={b} rot={2} color="#FF6B6B" top={900} />
    <div style={{ position: "absolute", top: 1400, left: 120 }}><Circle radius={90} fill="#111" /></div>
    <div style={{ position: "absolute", top: 1450, left: 520, transform: "rotate(12deg)" }}><Rect width={300} height={120} fill="#4D96FF" /></div>
  </AbsoluteFill>
);
export const FmtCollage: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={45}><Esc a="EL GPS" b="NO TE ESPÍA" /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide()} timing={linearTiming({ durationInFrames: 12 })} />
    <TransitionSeries.Sequence durationInFrames={45}><Esc a="ESCUCHA" b="SATÉLITES" /></TransitionSeries.Sequence>
  </TransitionSeries>
);
