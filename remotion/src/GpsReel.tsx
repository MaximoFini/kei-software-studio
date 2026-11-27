import React from "react";
import { C, Dib, Pop, Texto, Titular, Trazo, arco, circulo, crearPizarron, flecha, linea, onda, recto, suave } from "./pizarronKit";
import { Celu, CierreSeguir, Einstein, Pin, Reloj, Satelite, Senal, Signo, Tierra } from "./pizarronIconos";
import voz from "./gpsVoz.json";

// Reel pizarrón "¿Cómo sabe el GPS dónde estás?" (guion en scripts/guiones/gps.json).
// Gancho: sin Einstein el GPS fallaría kilómetros. Se cierra al final: los relojes de los satélites corren más rápido.

const { w, desde, Escena, Base, TOTAL } = crearPizarron(voz);
export const GPS_TOTAL = TOTAL;

export const GpsReel: React.FC = () => (
  <Base audio="gps">
    {/* 1 · Gancho: Einstein y un GPS que se equivoca por kilómetros */}
    <Escena id="hook">
      <Titular lineas={["SIN EINSTEIN"]} t0={desde("hook") + 0.05} c={C.amarillo} y={330} />
      <Einstein x={300} y={800} s={2.05} t0={desde("hook") + 0.5} dur={1.9} />
      <Texto x={760} y={620} t0={w("hook", "GPS")} c={C.celeste} size={70}>tu GPS</Texto>
      <Celu x={790} y={900} s={1.1} t0={w("hook", "GPS") + 0.1} dur={0.8} c={C.celeste} />
      <Pin x={790} y={900} s={0.7} t0={w("hook", "equivocaría")} dur={0.5} c={C.rojo} />
      <Trazo d={flecha(560, 1090, 900, 1090, 5)} t0={w("hook", "kilómetros")} dur={0.5} c={C.rosa} w={8} />
      <Texto x={730} y={1180} t0={w("hook", "kilómetros")} dur={0.5} c={C.rosa} size={86} titulo>¡KILÓMETROS!</Texto>
      <Signo x={820} y={560} t0={w("hook", "Por")} c={C.amarillo} s={1.2} tipo="pregunta" />
    </Escena>

    {/* 2 · Treinta satélites repiten la hora */}
    <Escena id="sats">
      <Titular lineas={["30 SATÉLITES"]} t0={desde("sats") + 0.05} c={C.celeste} y={330} />
      <Tierra x={540} y={1040} s={1.45} t0={desde("sats") + 0.3} dur={1.3} />
      {[
        [210, 640, 0], [540, 520, 1], [870, 640, 2], [150, 1000, 3], [930, 1010, 4],
      ].map(([x, y, i]) => (
        <React.Fragment key={i}>
          <Satelite x={x} y={y} s={0.55} t0={w("sats", "treinta") + 0.1 * i} dur={0.55} rot={(i - 2) * 16} />
        </React.Fragment>
      ))}
      <Reloj x={540} y={800} s={0.62} t0={w("sats", "hora")} dur={0.8} hora={0.1} min={0.0} c={C.amarillo} />
      <Texto x={540} y={1180} t0={w("sats", "exacta")} c={C.amarillo} size={64}>¡la misma hora!</Texto>
    </Escena>

    {/* 3 · La señal viaja: cuanto más tarda, más lejos */}
    <Escena id="senal">
      <Titular lineas={["¿CUÁNTO TARDÓ?"]} t0={desde("senal") + 0.05} c={C.rosa} y={330} />
      <Satelite x={820} y={600} s={0.8} t0={desde("senal") + 0.3} dur={0.6} />
      <Celu x={260} y={1130} s={0.95} t0={w("senal", "celular")} dur={0.7} c={C.celeste} />
      {[0, 1, 2].map((i) => (
        <Trazo key={i} d={arco(820, 600, 150 + i * 100, 1.9 + i * 0.05, 2.8 - i * 0.03, i + 3)} t0={w("senal", "señal") + i * 0.18} dur={0.45}
          c={C.amarillo} w={8} />
      ))}
      <Reloj x={640} y={1010} s={0.55} t0={w("senal", "mide")} dur={0.7} hora={0.0} min={0.3} c={C.blanco} />
      <Trazo d={flecha(300, 900, 520, 790, 3)} t0={w("senal", "más", 0)} dur={0.5} c={C.verde} w={8} />
      <Texto x={820} y={1220} t0={w("senal", "lejos")} c={C.rosa} size={70}>más demora = más lejos</Texto>
    </Escena>

    {/* 4 · Con cuatro satélites se cruzan las distancias */}
    <Escena id="cuatro">
      <Titular lineas={["4 SATÉLITES"]} t0={desde("cuatro") + 0.05} c={C.celeste} y={330} />
      <Trazo d={circulo(380, 740, 241, 3)} t0={w("cuatro", "cuatro")} dur={0.8} c={C.celeste} w={6} />
      <Trazo d={circulo(730, 730, 240, 4)} t0={w("cuatro", "cuatro") + 0.3} dur={0.8} c={C.verde} w={6} />
      <Trazo d={circulo(500, 1130, 238, 5)} t0={w("cuatro", "cuatro") + 0.6} dur={0.8} c={C.rosa} w={6} />
      <Trazo d={circulo(720, 1090, 248, 6)} t0={w("cuatro", "cuatro") + 0.9} dur={0.8} c={C.naranja} w={6} />
      {[[380, 740], [730, 730], [500, 1130], [720, 1090]].map(([x, y], i) => (
        <Satelite key={i} x={x} y={y} s={0.38} t0={w("cuatro", "satélites") + i * 0.12} dur={0.4} rot={(i - 1) * 14} />
      ))}
      <Pin x={560} y={900} s={0.9} t0={w("cuatro", "dónde")} dur={0.6} c={C.rojo} />
      <Texto x={540} y={1330} t0={w("cuatro", "dónde")} c={C.rojo} size={74}>¡ACÁ ESTÁS!</Texto>
    </Escena>

    {/* 5 · El truco de Einstein: los relojes corren más rápido */}
    <Escena id="einstein">
      <Titular lineas={["EL TRUCO"]} t0={desde("einstein") + 0.05} c={C.amarillo} y={330} />
      <Texto x={290} y={560} t0={desde("einstein") + 0.4} c={C.celeste} size={54}>satélite</Texto>
      <Texto x={780} y={560} t0={desde("einstein") + 0.5} c={C.blanco} size={54}>en la Tierra</Texto>
      <Reloj x={290} y={760} s={1.0} t0={w("einstein", "relojes")} dur={0.9} hora={0.35} min={0.8} c={C.celeste} />
      <Reloj x={780} y={760} s={1.0} t0={w("einstein", "relojes") + 0.2} dur={0.9} hora={0.35} min={0.5} c={C.blanco} />
      <Trazo d={arco(290, 760, 150, -0.5, 0.9, 2)} t0={w("einstein", "rápido")} dur={0.5} c={C.verde} w={9} />
      <Texto x={290} y={990} t0={w("einstein", "rápido")} c={C.verde} size={66}>¡más rápido!</Texto>
      <Pin x={780} y={1010} s={0.8} t0={w("einstein", "Sin")} dur={0.5} c={C.rojo} />
      <Trazo d={flecha(780, 1090, 780, 1140, 4, 24)} t0={w("einstein", "kilómetros")} dur={0.4} c={C.rosa} w={8} />
      <Texto x={540} y={1215} t0={w("einstein", "diez")} c={C.rosa} size={92} titulo>10 KM POR DÍA</Texto>
    </Escena>

    {/* 6 · Cierre */}
    <Escena id="cta">
      <CierreSeguir t0={desde("cta") + 0.05} pregunta="¿Qué aparato explicamos?" y={440} />
    </Escena>
  </Base>
);
