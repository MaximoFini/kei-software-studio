import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";

// Formato ISOMÉTRICO 3D: cámara ortográfica con three + @react-three/fiber (vía @remotion/three).
// Bloques que suben escalonados. Render costoso: usar --gl=angle y concurrency baja.
const Bloque: React.FC<{ x: number; z: number; i: number; color: string }> = ({ x, z, i, color }) => {
  const f = useCurrentFrame();
  const h = Math.min(1, Math.max(0, (f - i * 4) / 15)) * (1 + (i % 3));
  return (
    <mesh position={[x, h / 2, z]}>
      <boxGeometry args={[0.9, Math.max(h, 0.001), 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
export const FmtIsometrico: React.FC = () => {
  const { width, height } = useVideoConfig();
  const f = useCurrentFrame();
  const cols = ["#4D96FF", "#F5D547", "#FF6B6B", "#6BCB77"];
  return (
    <AbsoluteFill style={{ background: "#14213D" }}>
      <ThreeCanvas orthographic width={width} height={height} camera={{ position: [10, 10, 10], zoom: 160, near: 0.1, far: 100 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 3]} intensity={1.5} />
        <group rotation={[0, f * 0.01, 0]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Bloque key={i} i={i} x={(i % 3) - 1} z={Math.floor(i / 3) - 1} color={cols[i % 4]} />
          ))}
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
