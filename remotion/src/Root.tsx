import React from "react";
import { Composition } from "remotion";
import { KeiCierre, KeiCierreProps } from "./KeiCierre";
import { ReelConCierre, TOTAL_FRAMES } from "./ReelConCierre";
import { GameReel, GAME_TOTAL } from "./GameReel";
import { OfficeReel, OFFICE_TOTAL } from "./OfficeReel";
import { Landing, calculateLandingMetadata, landingDefaults } from "./Landing";
import { LandingReel, calculateLandingReelMetadata, landingReelDefaults } from "./LandingReel";
import { QrExplainer, QR_TOTAL } from "./QrExplainer";
import { BtExplainer, BT_TOTAL } from "./BtExplainer";
import { IaExplainer, IA_TOTAL } from "./IaExplainer";
import { AudioExplainer, AUDIO_TOTAL } from "./AudioExplainer";
import { GpsReel, GPS_TOTAL } from "./GpsReel";
import { TactilReel, TACTIL_TOTAL } from "./TactilReel";
import { ShazamReel, SHAZAM_TOTAL } from "./ShazamReel";
import { BateriaReel, BATERIA_TOTAL } from "./BateriaReel";
import { WifiReel, WIFI_TOTAL } from "./WifiReel";
import { DolorReel, calculateDolorMetadata, dolorDefaults } from "./DolorReel";

// Formatos para landing: la duración y los fps salen del video (calculateMetadata)
const LANDING_FORMATS = [
  { id: "LandingHero", width: 1920, height: 1080 }, // 16:9 hero / sección
  { id: "LandingVertical", width: 1080, height: 1920 }, // 9:16 mobile / reels
  { id: "LandingFeed", width: 1080, height: 1350 }, // 4:5
  { id: "LandingSquare", width: 1080, height: 1080 }, // 1:1
];

const defaults: KeiCierreProps = {
  linea1: "Software a medida.",
  linea2: "Resultados reales.",
  fadeOut: false,
};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Placa final que queda quieta */}
    <Composition
      id="KeiCierre"
      component={KeiCierre}
      durationInFrames={240}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={defaults}
    />
    {/* Variante con fade a negro, para cerrar un video */}
    <Composition
      id="KeiCierreFade"
      component={KeiCierre}
      durationInFrames={240}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={{ ...defaults, fadeOut: true }}
    />
    {/* Reel "the platter" → KEI Software con transición al cierre */}
    <Composition
      id="ReelConCierre"
      component={ReelConCierre}
      durationInFrames={TOTAL_FRAMES}
      fps={60}
      width={1080}
      height={1920}
    />
    <Composition id="GameReel" component={GameReel} durationInFrames={GAME_TOTAL} fps={60} width={1080} height={1920} />
    <Composition id="OfficeReel" component={OfficeReel} durationInFrames={OFFICE_TOTAL} fps={60} width={1080} height={1920} />
    {/* Reels de landings filmadas (scripts/landing_reels.py) */}
    <Composition
      id="LandingReel"
      component={LandingReel}
      durationInFrames={600}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={landingReelDefaults}
      calculateMetadata={calculateLandingReelMetadata}
    />
    {/* Explicativo "¿Cómo funciona un QR?" con voz en off (scripts/explainer.py) */}
    <Composition id="QrExplainer" component={QrExplainer} durationInFrames={QR_TOTAL} fps={60} width={1080} height={1920} />
    <Composition id="BtExplainer" component={BtExplainer} durationInFrames={BT_TOTAL} fps={60} width={1080} height={1920} />
    <Composition id="IaExplainer" component={IaExplainer} durationInFrames={IA_TOTAL} fps={60} width={1080} height={1920} />
    <Composition id="AudioExplainer" component={AudioExplainer} durationInFrames={AUDIO_TOTAL} fps={60} width={1080} height={1920} />
    {/* Reels en formato pizarrón (30 fps; guiones en scripts/guiones/, kit en pizarronKit.tsx) */}
    <Composition id="GpsReel" component={GpsReel} durationInFrames={GPS_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="TactilReel" component={TactilReel} durationInFrames={TACTIL_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="ShazamReel" component={ShazamReel} durationInFrames={SHAZAM_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="BateriaReel" component={BateriaReel} durationInFrames={BATERIA_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="WifiReel" component={WifiReel} durationInFrames={WIFI_TOTAL} fps={30} width={1080} height={1920} />
    {/* Reel diario de "dolor del cliente", armado desde datos (scripts/reel_diario.py) */}
    <Composition
      id="DolorReel"
      component={DolorReel}
      durationInFrames={600}
      fps={60}
      width={1080}
      height={1920}
      defaultProps={dolorDefaults}
      calculateMetadata={calculateDolorMetadata}
    />
    {LANDING_FORMATS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={Landing}
        durationInFrames={150}
        fps={30}
        width={f.width}
        height={f.height}
        defaultProps={landingDefaults}
        calculateMetadata={calculateLandingMetadata}
      />
    ))}
  </>
);
