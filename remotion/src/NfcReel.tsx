import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import "@fontsource/inter/700.css";
import { crearReel, ramp, pop, useT, Sonido } from "./reelKit";
import voz from "./nfcVoz.json";

// Reel ISOMÉTRICO 3D "¿Cómo pagás solo acercando el celu?" (guion en scripts/guiones/nfc.json).
// Una escena three.js con cámara ortográfica (lector, tarjeta, anillos del campo, paquetes de datos) + rótulos HTML por escena.

const INTER = "Inter, sans-serif";
const CELE = "#5AD0FF", AMAR = "#F5D547", VERDE = "#6BCB77", ROSA = "#FF7B9C";

const Fondo: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#0B1B3A 0%, #14305E 60%, #0B1B3A 100%)" }} />
);

const { w, desde, Escena, Base, TOTAL } = crearReel(voz, {
  fondo: <Fondo />,
  sub: { font: INTER, size: 66, color: "#FFFFFF", active: AMAR, top: 1585, weight: 700, shadow: "0 4px 14px rgba(0,0,0,.7)" },
  progreso: AMAR,
  progresoY: 160,
  barra: AMAR,
});
export const NFC_TOTAL = TOTAL;

const T_ACERCA = () => w("hook", "acercar");
const T_CAMPO = () => w("campo", "campo");
const T_ENERGIA = () => w("energia", "batería");
const T_COD = () => w("responde", "código");
const T_TOKEN = () => desde("token");
const T_FIN = () => desde("cta");

/** Escena 3D. Todo se calcula con el tiempo actual (sin estado). */
const Mundo: React.FC = () => {
  const t = useT();
  const aprox = ramp(t, T_ACERCA(), T_ACERCA() + 1.1);
  const cardX = -4.3 + 4.3 * aprox;
  const cardY = 0.95 + Math.sin(t * 2) * 0.03 * (1 - aprox) + 0.0;
  const campoOn = t >= T_CAMPO() && t < T_FIN();
  const energia = ramp(t, T_ENERGIA() - 0.3, T_ENERGIA() + 0.6);
  const pagado = ramp(t, T_TOKEN() + 1.2, T_TOKEN() + 1.6);
  const anillos = [0, 1, 2, 3].map((i) => {
    if (!campoOn) return null;
    const ph = (((t - T_CAMPO()) * 0.7 + i / 4) % 1 + 1) % 1;
    return { r: 0.7 + ph * 2.6, y: 0.42 + ph * 0.55, o: (1 - ph) * 0.9 };
  });
  const paquetes = [0, 1, 2, 3, 4, 5].map((i) => {
    const t0 = T_COD() + i * 0.28;
    const p = (t - t0) / 1.0;
    if (p < 0 || p > 1 || t > T_TOKEN() + 2) return null;
    return {
      x: 0 + Math.sin(i) * 0.15,
      y: 1.0 + p * 0.9 + Math.sin(p * Math.PI) * 0.7,
      z: 0.2 - p * 1.6,
    };
  });
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 10, 4]} intensity={1.6} />
      <group rotation={[0, 0, 0]} position={[0, -0.2, 0]}>
        {/* mesada */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[11, 0.3, 6]} />
          <meshStandardMaterial color="#1E3A66" />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10.4, 5.4]} />
          <meshStandardMaterial color="#27487D" />
        </mesh>
        {/* lector (base + pantalla trasera) */}
        <mesh position={[0, 0.25, 0.1]}>
          <boxGeometry args={[2.4, 0.5, 2.4]} />
          <meshStandardMaterial color="#35466F" />
        </mesh>
        <mesh position={[0, 0.52, 0.1]}>
          <boxGeometry args={[1.9, 0.06, 1.9]} />
          <meshStandardMaterial color={campoOn ? "#2E7FB8" : "#1F2E50"} emissive={CELE} emissiveIntensity={campoOn ? 0.35 : 0} />
        </mesh>
        <mesh position={[0, 1.15, -1.45]}>
          <boxGeometry args={[2.4, 1.5, 0.16]} />
          <meshStandardMaterial color="#222B44" />
        </mesh>
        <mesh position={[0, 1.15, -1.36]}>
          <boxGeometry args={[2.1, 1.2, 0.04]} />
          <meshStandardMaterial color={pagado > 0.01 ? "#3BBF6B" : "#0E1A33"} emissive={pagado > 0.01 ? VERDE : "#112244"} emissiveIntensity={0.4 + pagado * 0.8} />
        </mesh>
        {/* anillos del campo */}
        {anillos.map((a, i) =>
          a ? (
            <mesh key={i} position={[0, a.y, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[a.r, 0.05, 10, 80]} />
              <meshBasicMaterial color={CELE} transparent opacity={a.o} />
            </mesh>
          ) : null,
        )}
        {/* tarjeta */}
        <group position={[cardX, cardY + 0.05, 0.1]} rotation={[0, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 0.07, 1.15]} />
            <meshStandardMaterial color={AMAR} emissive={AMAR} emissiveIntensity={energia * 0.55} />
          </mesh>
          <mesh position={[-0.55, 0.045, -0.12]}>
            <boxGeometry args={[0.38, 0.03, 0.3]} />
            <meshStandardMaterial color="#C9A227" />
          </mesh>
          <mesh position={[0.2, 0.045, 0.3]}>
            <boxGeometry args={[1.1, 0.02, 0.08]} />
            <meshStandardMaterial color="#B28B12" />
          </mesh>
        </group>
        {/* paquetes de datos */}
        {paquetes.map((p, i) =>
          p ? (
            <mesh key={i} position={[p.x, p.y, p.z]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color={ROSA} emissive={ROSA} emissiveIntensity={0.7} />
            </mesh>
          ) : null,
        )}
      </group>
    </>
  );
};

const Rotulo: React.FC<{ txt: string; sub?: string; c?: string; t0: number; y?: number }> = ({ txt, sub, c = AMAR, t0, y = 300 }) => {
  const t = useT();
  const p = pop(t, t0, 13);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 2), fontFamily: INTER, fontWeight: 700 }}>
      <Sonido t={t0} f="qr_pop.wav" v={0.2} />
      <span style={{ display: "inline-block", background: "rgba(8,16,40,.78)", border: `4px solid ${c}`, borderRadius: 40, padding: "16px 44px", color: c, fontSize: 82, textShadow: "0 3px 10px rgba(0,0,0,.5)" }}>{txt}</span>
      {sub && <div style={{ marginTop: 18, color: "#fff", fontSize: 50, textShadow: "0 3px 10px rgba(0,0,0,.7)" }}>{sub}</div>}
    </div>
  );
};

export const NfcReel: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <Base audio="nfc">
      <AbsoluteFill>
        <ThreeCanvas orthographic width={width} height={height} camera={{ position: [9, 9, 9], zoom: 138, near: 0.1, far: 100 }}>
          <Mundo />
        </ThreeCanvas>
      </AbsoluteFill>
      <Escena id="hook">
        <Rotulo txt="SIN CABLES" sub="ni WiFi, ni datos" t0={desde("hook") + 0.05} />
      </Escena>
      <Escena id="campo">
        <Rotulo txt="CAMPO MAGNÉTICO" sub="invisible, alrededor del lector" c={CELE} t0={desde("campo") + 0.05} />
      </Escena>
      <Escena id="energia">
        <Rotulo txt="SIN BATERÍA" sub="la tarjeta se carga con el campo" c={AMAR} t0={desde("energia") + 0.05} />
      </Escena>
      <Escena id="responde">
        <Rotulo txt="MENOS DE 4 CM" sub="responde con un código" c={ROSA} t0={desde("responde") + 0.05} />
      </Escena>
      <Escena id="token">
        <Rotulo txt="CÓDIGO ≠ TU NÚMERO" sub="un sustituto de un solo uso" c={VERDE} t0={desde("token") + 0.05} />
      </Escena>
      <Escena id="cta" sonido="qr_ok.wav">
        <Rotulo txt="SEGUINOS" sub="@keisoftware" c={AMAR} t0={desde("cta") + 0.1} y={330} />
        <Rotulo txt="¿YA PAGÁS ACERCANDO?" c={CELE} t0={w("cta", "pagás")} y={1180} />
      </Escena>
    </Base>
  );
};
