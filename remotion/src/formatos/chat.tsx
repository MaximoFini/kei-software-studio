import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";

// Formato CHAT (WhatsApp falso). Fuente: Inter. Burbujas que aparecen una a una.
export const FmtChat: React.FC<{ msgs?: { yo: boolean; txt: string }[] }> = ({
  msgs = [
    { yo: false, txt: "¿Cómo funciona el GPS?" },
    { yo: true, txt: "Con satélites y un poco de matemática." },
  ],
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B141A", fontFamily: "Inter, sans-serif", padding: 60, justifyContent: "center", gap: 28 }}>
      {msgs.map((m, i) => {
        const o = interpolate(f, [i * 20, i * 20 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              alignSelf: m.yo ? "flex-end" : "flex-start",
              opacity: o,
              transform: `translateY(${(1 - o) * 30}px)`,
              background: m.yo ? "#005C4B" : "#202C33",
              color: "#E9EDEF",
              fontSize: 54,
              padding: "28px 36px",
              borderRadius: 36,
              maxWidth: 800,
            }}
          >
            {m.txt}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
