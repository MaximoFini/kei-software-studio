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
import { getVideoMetadata } from "@remotion/media-utils";
import { KeiCierre, BRAND, fontFace } from "./KeiCierre";

// Video para landing: clip de cámara (pasado por scripts/ingest.sh y copiado a remotion/public)
// + subtítulos con tipografía de marca + cierre opcional. La duración sale del video.
//   bash scripts/render.sh LandingHero out/hero.mov --prores --props='{"video":"hero.mp4","srt":"hero.srt"}'

export type Caption = { start: number; end: number; text: string };

export type LandingProps = {
  video: string; // archivo en remotion/public ("" = fondo de marca, para previsualizar)
  srt: string; // subtítulos en remotion/public (de scripts/captions.sh), "" = sin subtítulos
  cierre: boolean; // agrega el cierre animado de 4 s al final
  linea1: string;
  linea2: string;
  marca: boolean; // isotipo chico en una esquina durante el video
  fps: number;
  captions?: Caption[]; // lo completa calculateMetadata a partir de srt
};

export const landingDefaults: LandingProps = {
  video: "",
  srt: "",
  cierre: true,
  linea1: "Software a medida.",
  linea2: "Resultados reales.",
  marca: false,
  fps: 30,
};

const CIERRE_S = 4;
const FADE_S = 0.4;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const toSec = (t: string) => {
  const [h, m, s] = t.trim().replace(",", ".").split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

export const parseSrt = (srt: string): Caption[] =>
  srt
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.trim().split("\n");
      const i = lines.findIndex((l) => l.includes("-->"));
      if (i < 0) return null;
      const [a, b] = lines[i].split("-->");
      return { start: toSec(a), end: toSec(b), text: lines.slice(i + 1).join(" ").trim() };
    })
    .filter((c): c is Caption => !!c && c.text.length > 0);

export const calculateLandingMetadata: CalculateMetadataFunction<LandingProps> = async ({ props }) => {
  const fps = props.fps || 30;
  const videoS = props.video ? (await getVideoMetadata(staticFile(props.video))).durationInSeconds : 5;
  const captions = props.srt ? parseSrt(await (await fetch(staticFile(props.srt))).text()) : [];
  const cierreS = props.cierre ? CIERRE_S - FADE_S : 0;
  return {
    fps,
    durationInFrames: Math.ceil((videoS + cierreS) * fps),
    props: { ...props, captions },
  };
};

// ---------- Fondo de marca (para previsualizar sin video y para la placa) ----------
const FondoMarca: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 45% 60% at 0% 40%, ${BRAND.azulUI}40, transparent 70%),
                     radial-gradient(ellipse 45% 60% at 100% 70%, ${BRAND.azulMarino}aa, transparent 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${BRAND.azulUI}55 1.6px, transparent 1.8px)`,
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.8), transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.8), transparent 100%)",
      }}
    />
  </AbsoluteFill>
);

// ---------- Placa de cierre adaptable (16:9, 4:5, 1:1). En 9:16 se usa KeiCierre ----------
const PlacaCierre: React.FC<{ linea1: string; linea2: string }> = ({ linea1, linea2 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const u = Math.min(width, height) / 1080; // unidad relativa al lado corto
  const horizontal = width > height * 1.2;

  const iso = spring({ frame: frame - s(0.3), fps, config: { damping: 18, stiffness: 90 } });
  const isoOpacity = interpolate(frame, [s(0.3), s(0.9)], [0, 1], clamp);
  const wm = interpolate(frame, [s(1.0), s(1.8)], [0, 100], { ...clamp, easing: easeOut });
  const line = (start: number) => ({
    opacity: interpolate(frame, [s(start), s(start + 0.5)], [0, 1], clamp),
    transform: `translateY(${interpolate(frame, [s(start), s(start + 0.6)], [20 * u, 0], { ...clamp, easing: easeOut })}px)`,
  });

  return (
    <AbsoluteFill>
      <FondoMarca />
      <AbsoluteFill
        style={{
          flexDirection: horizontal ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: (horizontal ? 90 : 60) * u,
        }}
      >
        <Img
          src={staticFile("isotipo.png")}
          style={{ height: 300 * u, opacity: isoOpacity, transform: `scale(${interpolate(iso, [0, 1], [0.9, 1])})` }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: horizontal ? "flex-start" : "center" }}>
          <Img
            src={staticFile("wordmark.png")}
            style={{ width: 620 * u, clipPath: `inset(-10% ${100 - wm}% -10% 0)` }}
          />
          <div
            style={{
              marginTop: 40 * u,
              fontFamily: "'Glacial Indifference', sans-serif",
              fontSize: 58 * u,
              lineHeight: 1.25,
              textAlign: horizontal ? "left" : "center",
            }}
          >
            <div style={{ color: BRAND.fondoClaro, ...line(1.8) }}>{linea1}</div>
            <div style={{ color: BRAND.azulUI, ...line(2.05) }}>{linea2}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Subtítulos con tipografía de marca ----------
const Subtitulos: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const c = captions.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  const u = Math.min(width, height) / 1080;
  const appear = interpolate(t, [c.start, c.start + 0.12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height * 0.09 }}>
      <div
        style={{
          maxWidth: width * 0.84,
          padding: `${14 * u}px ${28 * u}px`,
          borderRadius: 18 * u,
          backgroundColor: `${BRAND.fondoOscuro}b3`,
          color: BRAND.fondoClaro,
          fontFamily: "'Glacial Indifference', sans-serif",
          fontWeight: 700,
          fontSize: 52 * u,
          lineHeight: 1.2,
          textAlign: "center",
          opacity: appear,
          transform: `translateY(${(1 - appear) * 8 * u}px)`,
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};

export const Landing: React.FC<LandingProps> = ({ video, cierre, linea1, linea2, marca, captions = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const cierreFrames = cierre ? Math.round(CIERRE_S * fps) : 0;
  const cierreFrom = durationInFrames - cierreFrames;
  const fade = Math.round(FADE_S * fps);
  const cierreOpacity = interpolate(frame, [cierreFrom, cierreFrom + fade], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const vertical = width === 1080 && height === 1920;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.fondoOscuro }}>
      <style>{fontFace}</style>
      {frame < cierreFrom + fade + 1 || !cierre ? (
        <AbsoluteFill>
          {video ? (
            <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <FondoMarca />
          )}
          {marca && (
            <Img
              src={staticFile("isotipo.png")}
              style={{ position: "absolute", right: 48 * u, top: 48 * u, height: 80 * u, opacity: 0.9 }}
            />
          )}
          <Subtitulos captions={captions} />
        </AbsoluteFill>
      ) : null}

      {cierre && (
        <Sequence from={cierreFrom} durationInFrames={cierreFrames}>
          <AbsoluteFill style={{ opacity: cierreOpacity }}>
            {vertical ? (
              <KeiCierre linea1={linea1} linea2={linea2} fadeOut={false} />
            ) : (
              <PlacaCierre linea1={linea1} linea2={linea2} />
            )}
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
