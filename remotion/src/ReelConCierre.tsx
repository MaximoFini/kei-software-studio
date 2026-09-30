import React from "react";
import {
  AbsoluteFill,
  Audio,
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
import { KeiCierre, BRAND } from "./KeiCierre";

// ---- Tiempos (segundos) ----
const REEL_END = 241 / 30; // 8.033 s: último cuadro del reel
const Z0 = 7.7; // arranca el push-in sobre el cartel del ascensor
const Z1 = 8.4; // el cartel llena el cuadro
const C0 = 8.25; // entra el cierre animado (crossfade)
const C_FADE = 0.35;
const WHOOSH_AT = 7.68;
const SKIP = 15; // se saltean los primeros 0,25 s del cierre (sólo fondo) para solapar logos
export const CIERRE_FRAMES = 240; // 4 s a 60 fps

// ---- Geometría del cartel en el cuadro 1080×1920 ----
const SCREEN = { x: 322.5, y: 558, w: 438, h: 841.5 };
const SC = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };
const SCREEN_BLUE = "#1447AB"; // muestreado del cartel
const END_SCALE = 2.75; // cubre el cuadro (mín. 2.47) + margen para ocultar el marco

// Logo horizontal tal como aparece en el reel (720p ×1.5)
const LOGO = { x: 372, y: 918, w: 345 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const push = Easing.bezier(0.7, 0, 0.25, 1);

const ReelLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const p = interpolate(t, [Z0, Z1], [0, 1], { ...clamp, easing: push });
  const scale = interpolate(p, [0, 1], [1, END_SCALE]);
  const dx = (540 - SC.x) * p;
  const dy = (960 - SC.y) * p;

  // Pantalla y logo vectoriales encima del cartel para que no se pixele al acercarse
  const crisp = interpolate(t, [Z0 + 0.05, Z0 + 0.35], [0, 1], clamp);

  // Capa azul de seguridad: tapa cualquier resto del marco en el tramo final del zoom
  const plate = interpolate(p, [0.8, 0.97], [0, 1], clamp);
  const logoScale = scale;

  return (
    <AbsoluteFill>
    <AbsoluteFill
      style={{
        transformOrigin: `${SC.x}px ${SC.y}px`,
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      }}
    >
      {t < REEL_END ? (
        <OffthreadVideo src={staticFile("reel_1080.mp4")} muted />
      ) : (
        <Img src={staticFile("reel_last.png")} />
      )}
      <div
        style={{
          position: "absolute",
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: SCREEN.h,
          backgroundColor: SCREEN_BLUE,
          opacity: crisp,
        }}
      />
      <Img
        src={staticFile("kei_horizontal_dark.png")}
        style={{ position: "absolute", left: LOGO.x, top: LOGO.y, width: LOGO.w, opacity: crisp }}
      />
    </AbsoluteFill>
    <AbsoluteFill style={{ backgroundColor: SCREEN_BLUE, opacity: plate }} />
    <AbsoluteFill
      style={{
        opacity: plate,
        transformOrigin: `${SC.x}px ${SC.y}px`,
        transform: `translate(${dx}px, ${dy}px) scale(${logoScale})`,
      }}
    >
      <Img
        src={staticFile("kei_horizontal_dark.png")}
        style={{ position: "absolute", left: LOGO.x, top: LOGO.y, width: LOGO.w }}
      />
    </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ReelConCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const inZoom = t >= Z0 - 0.05 && t <= Z1 + 0.05;
  const cierreOpacity = interpolate(t, [C0, C0 + C_FADE], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
      {t < C0 + C_FADE + 0.02 &&
        (inZoom ? (
          <CameraMotionBlur samples={8} shutterAngle={200}>
            <ReelLayer />
          </CameraMotionBlur>
        ) : (
          <ReelLayer />
        ))}

      <Sequence from={Math.round(C0 * fps) - SKIP} durationInFrames={CIERRE_FRAMES}>
        <AbsoluteFill style={{ opacity: cierreOpacity }}>
          <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
        </AbsoluteFill>
      </Sequence>

      {/* Audio original del reel + whoosh de transición */}
      <Audio src={staticFile("reel_audio.m4a")} />
      <Sequence from={Math.round(WHOOSH_AT * fps)}>
        <Audio src={staticFile("whoosh.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const TOTAL_FRAMES = Math.round(8.25 * 60) - 15 + CIERRE_FRAMES;
