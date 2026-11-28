import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";

// Formato TERMINAL. Fuente: JetBrains Mono. Tipeo carácter a carácter + cursor.
export const FmtTerminal: React.FC<{ lines?: string[] }> = ({
  lines = ["$ kei analizar --tema gps", "> buscando satélites... 4 encontrados", "> posición: OK"],
}) => {
  const f = useCurrentFrame();
  let left = Math.floor(f * 1.2);
  return (
    <AbsoluteFill style={{ background: "#0D1117", fontFamily: "'JetBrains Mono', monospace", color: "#7EE787", fontSize: 44, padding: 70, justifyContent: "center" }}>
      {lines.map((l, i) => {
        const shown = l.slice(0, Math.max(0, left));
        left -= l.length + 6;
        const cursor = shown.length > 0 && shown.length < l.length && Math.floor(f / 8) % 2 === 0;
        return (
          <div key={i} style={{ marginBottom: 24, whiteSpace: "pre-wrap" }}>
            {shown}
            {cursor ? "▌" : ""}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
