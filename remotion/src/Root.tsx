import React from "react";
import { Composition } from "remotion";
import { KeiCierre, KeiCierreProps } from "./KeiCierre";
import { ReelConCierre, TOTAL_FRAMES } from "./ReelConCierre";
import { GameReel, GAME_TOTAL } from "./GameReel";
import { OfficeReel, OFFICE_TOTAL } from "./OfficeReel";

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
  </>
);
