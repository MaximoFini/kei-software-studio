import React from "react";
import { Composition } from "remotion";
import { FmtChat } from "./chat";
import { FmtTerminal } from "./terminal";
import { FmtCuaderno } from "./cuaderno";
import { FmtCollage } from "./collage";
import { FmtIsometrico } from "./isometrico";

// Composiciones de prueba de los formatos nuevos (ids prefijados 'Fmt'). Se montan en Root.tsx con {FormatosPrueba({})}.
const P = { fps: 30, width: 1080, height: 1920 } as const;
export const FormatosPrueba = () => (
  <>
    <Composition id="FmtChat" component={FmtChat} durationInFrames={90} {...P} />
    <Composition id="FmtTerminal" component={FmtTerminal} durationInFrames={150} {...P} />
    <Composition id="FmtCuaderno" component={FmtCuaderno} durationInFrames={90} {...P} />
    <Composition id="FmtCollage" component={FmtCollage} durationInFrames={78} {...P} />
    <Composition id="FmtIsometrico" component={FmtIsometrico} durationInFrames={90} {...P} />
  </>
);
