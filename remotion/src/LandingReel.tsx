import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { KeiCierre, BRAND, fontFace } from "./KeiCierre";

// Reel de una landing filmada (scripts/landing_reels.py arma el cuerpo y los props):
// lockup "isotipo KEI × logo cliente" (o isotipo + wordmark en reels propios) sobre el monitor,
// sin textos en el medio, push-in con motion blur al foco del último cuadro y cierre KEI. Sin audio.

export type LandingReelProps = {
  video: string; // cuerpo en remotion/public (1440x2560, 30 fps)
  clienteLogo: string; // "" = reel propio de KEI
  foco: [number, number]; // punto del último cuadro (espacio 1080x1920) al que va el push-in
  cuerpoS: number; // duración del cuerpo en segundos
};

export const landingReelDefaults: LandingReelProps = {
  video: "",
  clienteLogo: "",
  foco: [540, 1150],
  cuerpoS: 6,
};

const CIERRE_FRAMES = 240; // 4 s a 60 fps
const SKIP = 15; // primeros 0,25 s del cierre (sólo fondo), se solapan con el zoom
const ZOOM_IN = 0.6; // el push-in arranca 0,6 s antes del final del cuerpo
const ZOOM_OUT = 0.15; // y termina 0,15 s después (sobre el último cuadro congelado)
const C_FADE = 0.35;
const END_SCALE = 2.6;
const LOCK_Y = 520; // centro del lockup: debajo de la UI de Instagram y arriba del monitor

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const push = Easing.bezier(0.7, 0, 0.25, 1);

export const calculateLandingReelMetadata: CalculateMetadataFunction<LandingReelProps> = ({ props }) => {
  const c0 = props.cuerpoS - 0.1; // entra el cierre
  return { durationInFrames: Math.round(c0 * 60) - SKIP + CIERRE_FRAMES };
};

const Lockup: React.FC<{ clienteLogo: string; hideFrom: number }> = ({ clienteLogo, hideFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const pop = (start: number) => {
    const sp = spring({ frame: frame - s(start), fps, config: { damping: 16, stiffness: 120 } });
    return {
      opacity: interpolate(frame, [s(start), s(start + 0.3)], [0, 1], clamp),
      transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})`,
    };
  };
  const hide = interpolate(frame, [hideFrom, hideFrom + s(0.3)], [1, 0], clamp);
  const wm = interpolate(frame, [s(0.35), s(0.95)], [0, 100], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ opacity: hide }}>
      <div
        style={{
          position: "absolute",
          top: LOCK_Y,
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: clienteLogo ? 50 : 36,
        }}
      >
        <Img src={staticFile("isotipo.png")} style={{ height: clienteLogo ? 150 : 160, ...pop(0.1) }} />
        {clienteLogo ? (
          <>
            <div
              style={{
                fontFamily: "'Glacial Indifference', sans-serif",
                fontSize: 120,
                lineHeight: 1,
                color: BRAND.azulUI,
                marginTop: -12,
                opacity: interpolate(frame, [s(0.25), s(0.5)], [0, 1], clamp),
              }}
            >
              ×
            </div>
            <Img src={staticFile(clienteLogo)} style={{ height: 150, ...pop(0.35) }} />
          </>
        ) : (
          <Img
            src={staticFile("wordmark.png")}
            style={{
              height: 80,
              opacity: interpolate(frame, [s(0.35), s(0.5)], [0, 1], clamp),
              clipPath: `inset(-10% ${100 - wm}% -10% 0)`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

const Cuerpo: React.FC<LandingReelProps> = ({ video, foco, cuerpoS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(t, [cuerpoS - ZOOM_IN, cuerpoS + ZOOM_OUT], [0, 1], { ...clamp, easing: push });
  const scale = interpolate(p, [0, 1], [1, END_SCALE]);
  const [fx, fy] = foco;
  const dx = (540 - fx) * p;
  const dy = (960 - fy) * p;
  return (
    <AbsoluteFill
      style={{ transformOrigin: `${fx}px ${fy}px`, transform: `translate(${dx}px, ${dy}px) scale(${scale})` }}
    >
      {/* El cuerpo trae 0,5 s de último cuadro congelado (tpad) para el final del push-in */}
      {video && <OffthreadVideo src={staticFile(video)} muted style={{ width: "100%", height: "100%" }} />}
    </AbsoluteFill>
  );
};

export const LandingReel: React.FC<LandingReelProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { cuerpoS, clienteLogo } = props;
  const c0 = cuerpoS - 0.1;
  const inZoom = t >= cuerpoS - ZOOM_IN - 0.05 && t <= cuerpoS + ZOOM_OUT + 0.05;
  const cierreOpacity = interpolate(t, [c0, c0 + C_FADE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <style>{fontFace}</style>
      {t < c0 + C_FADE + 0.02 && (
        <>
          {inZoom ? (
            <CameraMotionBlur samples={8} shutterAngle={200}>
              <Cuerpo {...props} />
            </CameraMotionBlur>
          ) : (
            <Cuerpo {...props} />
          )}
          <Lockup clienteLogo={clienteLogo} hideFrom={Math.round((cuerpoS - ZOOM_IN) * fps)} />
        </>
      )}
      <Sequence from={Math.round(c0 * fps) - SKIP} durationInFrames={CIERRE_FRAMES}>
        <AbsoluteFill style={{ opacity: cierreOpacity, backgroundColor: BRAND.fondoOscuro }}>
          <KeiCierre linea1="Software a medida." linea2="Resultados reales." fadeOut={false} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
