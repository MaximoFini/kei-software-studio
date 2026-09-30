/**
 * Reel "Automatizá tu negocio con IA": 5 celulares filmados (pantallas reemplazadas en office_comp.mp4)
 * + push-in a la pantalla "IA" + cierre animado KEI. Audio: se mezcla aparte con FFmpeg (exacto).
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { KeiCierre } from "./KeiCierre";
import iaQuads from "./iaQuads.json";

const AZUL = "#3F7DFF";
const ORIG_FRAMES = 265; // 30 fps
const VIDEO_END = ORIG_FRAMES / 30; // 8.833 s
const Z0 = 7.55; // arranca el push-in
const Z1 = 8.35; // la pantalla llena el cuadro
const C0 = 8.2; // entra el cierre
const SKIP = 15;
const XFADE = 21;
export const OFFICE_TOTAL = Math.round(C0 * 60) - SKIP + 240;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const push = Easing.bezier(0.7, 0, 0.25, 1);

type Pt = [number, number];
const geom = (t: number) => {
  const q = (iaQuads as Pt[][])[Math.min(ORIG_FRAMES - 1, Math.max(0, Math.floor(t * 30)))];
  const [TL, TR, BR, BL] = q;
  const cx = (TL[0] + TR[0] + BR[0] + BL[0]) / 4;
  const cy = (TL[1] + TR[1] + BR[1] + BL[1]) / 4;
  const w = (Math.hypot(TR[0] - TL[0], TR[1] - TL[1]) + Math.hypot(BR[0] - BL[0], BR[1] - BL[1])) / 2;
  const h = (Math.hypot(BL[0] - TL[0], BL[1] - TL[1]) + Math.hypot(BR[0] - TR[0], BR[1] - TR[1])) / 2;
  const ang = (Math.atan2(TR[1] - TL[1], TR[0] - TL[0]) * 180) / Math.PI;
  return { cx, cy, w, h, ang };
};

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // geometría congelada al inicio del zoom para que el encuadre sea estable
  const g = geom(Math.min(t, Z0));
  const p = interpolate(t, [Z0, Z1], [0, 1], { ...clamp, easing: push });
  const S = Math.max(1080 / g.w, 1920 / g.h) * 1.1;
  const s = Math.pow(S, p); // zoom perceptualmente uniforme
  const crisp = interpolate(p, [0.04, 0.3], [0, 1], clamp);
  const textScale = interpolate(p, [0.3, 1], [1, 0.55], clamp);

  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${g.cx}px ${g.cy}px`,
        transform: `translate(${(540 - g.cx) * p}px, ${(960 - g.cy) * p}px) rotate(${-g.ang * p}deg) scale(${s})`,
      }}
    >
      {t < VIDEO_END ? (
        <OffthreadVideo src={staticFile("office_comp.mp4")} muted />
      ) : (
        <Img src={staticFile("office_last.png")} />
      )}
      {/* pantalla "IA" vectorial encima de la filmada */}
      <div
        style={{
          position: "absolute",
          left: g.cx - g.w / 2,
          top: g.cy - g.h / 2,
          width: g.w,
          height: g.h,
          borderRadius: 16,
          background: AZUL,
          transform: `rotate(${g.ang}deg)`,
          opacity: crisp,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Glacial Indifference', sans-serif",
            fontWeight: 700,
            fontSize: 134,
            lineHeight: 1,
            color: "#FFFFFF",
            transform: `translateY(4px) scale(${textScale})`,
          }}
        >
          IA
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const OfficeReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inZoom = t >= Z0 - 0.05 && t <= Z1 + 0.05;
  const plate = interpolate(t, [Z1 - 0.12, Z1], [0, 1], clamp); // placa de seguridad
  const cierreOp = interpolate(t, [C0, C0 + XFADE / 60], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const iaOut = interpolate(t, [C0 - 0.05, C0 + 0.25], [1, 0], clamp);
  const g = geom(Z0);
  const S = Math.max(1080 / g.w, 1920 / g.h) * 1.1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020714" }}>
      <style>{`@font-face{font-family:'Glacial Indifference';src:url('${staticFile(
        "glacial-indifference-700.woff2"
      )}') format('woff2');font-weight:700;}`}</style>
      {t < C0 + XFADE / 60 + 0.05 &&
        (inZoom ? (
          <CameraMotionBlur samples={8} shutterAngle={200}>
            <Scene />
          </CameraMotionBlur>
        ) : (
          <Scene />
        ))}
      {/* placa azul final con "IA" (mismo tamaño que al terminar el zoom) */}
      <AbsoluteFill
        style={{
          background: AZUL,
          opacity: plate * (t < C0 + XFADE / 60 + 0.05 ? 1 : 0),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Glacial Indifference', sans-serif",
            fontWeight: 700,
            fontSize: 134 * S * 0.55,
            lineHeight: 1,
            color: "#FFFFFF",
            opacity: iaOut,
            transform: `translateY(${4 * S * 0.55}px) scale(${interpolate(t, [C0 - 0.05, C0 + 0.3], [1, 0.92], clamp)})`,
          }}
        >
          IA
        </div>
      </AbsoluteFill>
      <Sequence from={Math.round(C0 * fps) - SKIP} durationInFrames={240}>
        <AbsoluteFill style={{ opacity: cierreOp }}>
          <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
