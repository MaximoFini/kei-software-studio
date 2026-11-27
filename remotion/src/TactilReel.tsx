import React from "react";
import { C, Dib, Texto, Titular, Trazo, arco, caja, circulo, crearPizarron, flecha, linea, onda, recto, suave } from "./pizarronKit";
import { Celu, CierreSeguir, Dedo, Guante, Salchicha, Signo } from "./pizarronIconos";
import voz from "./tactilVoz.json";

// Reel pizarrón "¿Cómo sabe tu pantalla dónde tocaste?" (guion en scripts/guiones/tactil.json).
// Gancho: una salchicha puede usar tu celular y un guante no. Se cierra al final: la salchicha conduce, el guante aísla.

const { w, desde, Escena, Base, TOTAL } = crearPizarron(voz);
export const TACTIL_TOTAL = TOTAL;

// Grilla de cables (filas y columnas) con cruces marcados
const Grilla: React.FC<{ x: number; y: number; n: number; paso: number; t0: number; dur: number; c?: string }> = ({ x, y, n, paso, t0, dur, c = C.celeste }) => {
  const L = (n - 1) * paso;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Trazo key={`h${i}`} d={linea(x, y + i * paso, x + L, y + i * paso, i + 1)} t0={t0 + (dur * i) / (2 * n)} dur={dur / n} c={c} w={5} sonido={i === 0} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <Trazo key={`v${i}`} d={linea(x + i * paso, y, x + i * paso, y + L, i + 9)} t0={t0 + dur / 2 + (dur * i) / (2 * n)} dur={dur / n} c={c} w={5} sonido={false} />
      ))}
    </>
  );
};

export const TactilReel: React.FC = () => (
  <Base audio="tactil">
    {/* 1 · Gancho: salchicha sí, guante no */}
    <Escena id="hook">
      <Titular lineas={["¿SALCHICHA SÍ?", "¿GUANTE NO?"]} t0={desde("hook") + 0.05} c={C.amarillo} y={310} size={100} />
      <Celu x={540} y={1010} s={1.3} t0={desde("hook") + 0.5} dur={0.9} c={C.celeste} />
      <Salchicha x={190} y={900} s={1.0} t0={w("hook", "salchicha")} dur={0.9} rot={-18} />
      <Signo x={190} y={1060} t0={w("hook", "usar")} c={C.verde} s={0.9} tipo="check" />
      <Guante x={880} y={920} s={1.0} t0={w("hook", "guante")} dur={1.2} c={C.celeste} />
      <Signo x={880} y={1130} t0={w("hook", "no")} c={C.rojo} s={0.9} tipo="cruz" />
      <Signo x={540} y={1320} t0={w("hook", "Por")} c={C.amarillo} s={1.1} tipo="pregunta" />
    </Escena>

    {/* 2 · Debajo del vidrio hay una grilla de cables con carga */}
    <Escena id="grilla">
      <Titular lineas={["BAJO EL VIDRIO"]} t0={desde("grilla") + 0.05} c={C.celeste} y={330} />
      <Trazo d={caja(130, 560, 820, 760, 5, 40)} t0={w("grilla", "vidrio")} dur={0.8} c={C.blanco} w={8} relleno="#8FD0F2" />
      <Grilla x={250} y={680} n={5} paso={140} t0={w("grilla", "grilla")} dur={1.2} />
      <Texto x={540} y={500} t0={w("grilla", "cables")} c={C.celeste} size={56}>cables</Texto>
      {[0, 1, 2, 3, 4].map((i) => (
        <Dib key={i} x={250 + i * 140} y={680} s={0.28} t0={w("grilla", "cargita") + i * 0.1} dur={0.35} c={C.amarillo} trazos={[
          { d: recto([[8, -60], [-26, 8], [4, 8], [-8, 64], [30, -8], [0, -8], [8, -60]], i + 3), relleno: true },
        ]} />
      ))}
    </Escena>

    {/* 3 · El dedo absorbe carga */}
    <Escena id="dedo">
      <Titular lineas={["TU CUERPO CONDUCE"]} t0={desde("dedo") + 0.05} c={C.rosa} y={330} size={104} />
      <Trazo d={caja(130, 820, 820, 460, 5, 40)} t0={desde("dedo") + 0.3} dur={0.5} c={C.blanco} w={7} />
      <Grilla x={290} y={900} n={4} paso={140} t0={desde("dedo") + 0.4} dur={0.8} />
      <Dedo x={540} y={560} s={1.0} t0={w("dedo", "dedo")} dur={0.9} />
      <Trazo d={flecha(540, 740, 540, 860, 3)} t0={w("dedo", "acercar")} dur={0.4} c={C.rosa} w={8} />
      {[0, 1, 2].map((i) => (
        <Trazo key={i} d={arco(540, 910, 60 + i * 44, 0.2, 2.9, i + 2)} t0={w("dedo", "absorbe") + i * 0.15} dur={0.4} c={C.amarillo} w={7} />
      ))}
      <Texto x={540} y={1330} t0={w("dedo", "carga")} c={C.amarillo} size={64}>le roba carga</Texto>
    </Escena>

    {/* 4 · Dónde cambió la carga = dónde tocaste */}
    <Escena id="punto">
      <Titular lineas={["¡ACÁ CAMBIÓ!"]} t0={desde("punto") + 0.05} c={C.amarillo} y={330} />
      <Grilla x={250} y={600} n={5} paso={145} t0={desde("punto") + 0.3} dur={0.7} />
      <Trazo d={circulo(540, 890, 74, 4)} t0={w("punto", "cambió")} dur={0.5} c={C.rosa} w={9} />
      <Trazo d={circulo(540, 890, 120, 6)} t0={w("punto", "cambió") + 0.2} dur={0.5} c={C.rosa} w={5} />
      <Dedo x={650} y={1060} s={0.75} t0={w("punto", "toque")} dur={0.7} rot={-30} />
      <Texto x={540} y={1280} t0={w("punto", "miles")} c={C.celeste} size={62}>miles de veces por segundo</Texto>
    </Escena>

    {/* 5 · Salchicha conduce, guante aísla */}
    <Escena id="pago">
      <Titular lineas={["ASÍ DE SIMPLE"]} t0={desde("pago") + 0.05} c={C.verde} y={330} />
      <Salchicha x={300} y={760} s={0.95} t0={w("pago", "salchicha")} dur={0.9} rot={-12} />
      <Texto x={300} y={900} t0={w("pago", "conduce")} c={C.verde} size={60}>conduce</Texto>
      <Signo x={300} y={1040} t0={w("pago", "conduce") + 0.2} c={C.verde} s={0.9} tipo="check" />
      <Guante x={790} y={780} s={0.95} t0={w("pago", "guante")} dur={1.0} c={C.celeste} />
      <Texto x={790} y={940} t0={w("pago", "aísla")} c={C.rojo} size={60}>aísla</Texto>
      <Signo x={790} y={1060} t0={w("pago", "aísla") + 0.2} c={C.rojo} s={0.9} tipo="cruz" />
    </Escena>

    <Escena id="cta">
      <CierreSeguir t0={desde("cta") + 0.05} pregunta="¿Qué explicamos hoy?" y={440} />
    </Escena>
  </Base>
);
