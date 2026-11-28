import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Star, Triangle } from "@remotion/shapes";
import { noise2D } from "@remotion/noise";
import "@fontsource/patrick-hand/400.css";

// Formato CUADERNO cuadriculado: grilla, letra manuscrita (Patrick Hand), garabatos con @remotion/shapes,
// leve temblor de papel con @remotion/noise.
export const FmtCuaderno: React.FC<{ titulo?: string }> = ({ titulo = "Cómo funciona el GPS" }) => {
  const f = useCurrentFrame();
  const dx = noise2D("c", f / 30, 0) * 2;
  const s = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: "#FBFAF3",
        transform: `translate(${dx}px,0)`,
        backgroundImage: "linear-gradient(#9CC4E4 2px, transparent 2px), linear-gradient(90deg, #9CC4E4 2px, transparent 2px)",
        backgroundSize: "60px 60px",
      }}
    >
      <div style={{ position: "absolute", left: 90, top: 0, bottom: 0, width: 4, background: "#E8777A" }} />
      <div style={{ fontFamily: "'Patrick Hand', cursive", fontSize: 110, color: "#1D3A8A", position: "absolute", top: 400, left: 150, right: 60, opacity: s }}>
        {titulo}
      </div>
      <div style={{ position: "absolute", top: 1000, left: 200, transform: `rotate(${f * 2}deg) scale(${s})` }}>
        <Star points={5} innerRadius={50} outerRadius={110} fill="#F3D660" stroke="#1D3A8A" strokeWidth={6} />
      </div>
      <div style={{ position: "absolute", top: 1100, left: 600, transform: `scale(${s})` }}>
        <Triangle length={200} direction="up" fill="#F292B0" stroke="#1D3A8A" strokeWidth={6} />
      </div>
    </AbsoluteFill>
  );
};
