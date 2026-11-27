import React from "react";
import { C, Dib, Texto, Titular, Trazo, arco, caja, circulo, crearPizarron, flecha, flechaCurva, linea, onda, barras, recto, suave } from "./pizarronKit";
import { Auto, Bateria, Celu, CierreSeguir, Reloj, Signo } from "./pizarronIconos";
import voz from "./bateriaVoz.json";

// Reel pizarrón "¿Por qué el final de la carga tarda tanto?" (guion en scripts/guiones/bateria.json).
// Idea: la batería es un estacionamiento; con lugar vacío los autos entran rápido, casi lleno hay que maniobrar despacio.

const { w, desde, Escena, Base, TOTAL } = crearPizarron(voz);
export const BATERIA_TOTAL = TOTAL;

const COLORES = [C.celeste, C.rosa, C.amarillo, C.verde, C.naranja, C.celeste, C.rosa, C.amarillo, C.verde, C.naranja, C.celeste, C.rosa];
const slotX = (i: number) => 150 + (i % 4) * 215;
const slotY = (i: number) => 630 + Math.floor(i / 4) * 180;

/** Estacionamiento 4x3: marco + lugares; `autos` = índices ocupados con su momento de entrada. */
const Garage: React.FC<{ t0: number; autos: [number, number][]; marca?: boolean }> = ({ t0, autos, marca = true }) => (
  <>
    <Trazo d={caja(100, 560, 880, 600, 5, 22)} t0={t0} dur={0.8} c={C.blanco} w={8} />
    {marca &&
      Array.from({ length: 12 }, (_, i) => (
        <Trazo key={i} d={recto([[slotX(i) - 10, slotY(i) - 10], [slotX(i) - 10, slotY(i) + 150], [slotX(i) + 190, slotY(i) + 150], [slotX(i) + 190, slotY(i) - 10]], i + 3, 1.2)}
          t0={t0 + 0.5 + i * 0.03} dur={0.2} c={C.blanco} w={3.5} sonido={false} punta={false} op={0.55} />
      ))}
    {autos.map(([i, ta]) => (
      <Auto key={i} x={slotX(i) + 90} y={slotY(i) + 70} s={0.86} t0={ta} dur={0.45} c={COLORES[i % COLORES.length]} />
    ))}
  </>
);

export const BateriaReel: React.FC = () => (
  <Base audio="bateria">
    {/* 1 · Gancho: el último 20% tarda una eternidad */}
    <Escena id="hook">
      <Titular lineas={["EL ÚLTIMO 20%"]} t0={desde("hook") + 0.05} c={C.amarillo} y={330} />
      <Bateria x={470} y={800} s={2.0} t0={desde("hook") + 0.4} dur={1.0} nivel={0.8} c={C.verde} />
      <Dib x={470} y={800} s={2.0} t0={w("hook", "último")} dur={0.5} c={C.rosa} w={8} trazos={[{ d: barras(48, -36, 26, 72, 9, 5) }]} />
      <Texto x={650} y={1070} t0={w("hook", "veinte")} c={C.rosa} size={130} titulo>20%</Texto>
      <Reloj x={250} y={1150} s={0.6} t0={w("hook", "eternidad")} dur={0.8} hora={0.0} min={0.95} c={C.blanco} />
      <Texto x={250} y={1300} t0={w("hook", "eternidad")} c={C.blanco} size={50}>…una eternidad</Texto>
      <Signo x={880} y={1150} t0={w("hook", "Por")} c={C.amarillo} s={1.1} tipo="pregunta" />
    </Escena>

    {/* 2 · La batería es un estacionamiento y la carga son autos */}
    <Escena id="estac">
      <Titular lineas={["EL ESTACIONAMIENTO"]} t0={desde("estac") + 0.05} c={C.celeste} y={330} />
      <Garage t0={w("estac", "estacionamiento") - 0.2} autos={[]} />
      <Texto x={540} y={1260} t0={w("estac", "autos")} c={C.amarillo} size={64}>carga = autos que entran</Texto>
      <Auto x={150} y={470} s={0.8} t0={w("estac", "autos")} dur={0.5} c={C.amarillo} />
      <Trazo d={flecha(250, 470, 400, 470, 3)} t0={w("estac", "entran")} dur={0.4} c={C.amarillo} w={7} />
    </Escena>

    {/* 3 · Vacío: entran todos juntos y rápido */}
    <Escena id="vacio">
      <Titular lineas={["LUGAR VACÍO"]} t0={desde("vacio") + 0.05} c={C.verde} y={330} />
      <Garage t0={desde("vacio") + 0.1} autos={[[0, w("vacio", "entran") + 0.0], [1, w("vacio", "entran") + 0.05], [4, w("vacio", "todos")], [5, w("vacio", "todos") + 0.05], [8, w("vacio", "juntos")], [2, w("vacio", "juntos") + 0.05]]} />
      {[0, 1, 2].map((i) => (
        <Trazo key={i} d={flecha(60, 640 + i * 190, 150, 640 + i * 190, i + 2, 26)} t0={w("vacio", "rápido") + i * 0.05} dur={0.25} c={C.verde} w={9} />
      ))}
      <Texto x={540} y={1270} t0={w("vacio", "rápido")} c={C.verde} size={80}>¡RÁPIDO!</Texto>
    </Escena>

    {/* 4 · Casi lleno: pocos huecos, hay que maniobrar */}
    <Escena id="lleno">
      <Titular lineas={["CASI LLENO"]} t0={desde("lleno") + 0.05} c={C.rosa} y={330} />
      <Garage t0={desde("lleno") + 0.1} autos={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => [i, desde("lleno") + 0.35 + i * 0.045] as [number, number])} />
      <Trazo d={flechaCurva(70, 450, 250, 380, 600, 1050 - 40, 28)} t0={w("lleno", "maniobrar")} dur={0.9} c={C.amarillo} w={8} />
      <Signo x={910} y={1260} t0={w("lleno", "huecos")} c={C.amarillo} s={0.8} tipo="alerta" />
      <Texto x={500} y={1270} t0={w("lleno", "despacio")} c={C.rosa} size={66}>despacito…</Texto>
    </Escena>

    {/* 5 · Si forzara se calienta y la batería se gasta */}
    <Escena id="celu">
      <Titular lineas={["POR ESO FRENA"]} t0={desde("celu") + 0.05} c={C.amarillo} y={330} />
      <Celu x={300} y={860} s={1.5} t0={desde("celu") + 0.3} dur={0.8} c={C.blanco} />
      {[0, 1, 2].map((i) => (
        <Dib key={i} x={200 + i * 100} y={620} s={0.42} t0={w("celu", "calienta") + i * 0.12} dur={0.5} c={C.rojo} trazos={[
          { d: suave([[0, 70], [-34, 30], [-18, -4], [-6, 14], [6, -40], [34, 10], [28, 44], [0, 70]]), relleno: true },
        ]} />
      ))}
      <Bateria x={760} y={800} s={1.1} t0={w("celu", "batería", 0)} dur={0.8} nivel={0.7} c={C.verde} />
      <Dib x={760} y={800} s={1.1} t0={w("celu", "gasta")} dur={0.4} c={C.rojo} trazos={[{ d: recto([[-10, -50], [12, -10], [-8, 10], [14, 50]], 5), c: C.rojo }]} />
      <Trazo d={flecha(760, 920, 760, 1040, 3)} t0={w("celu", "gasta")} dur={0.4} c={C.rojo} w={8} />
      <Texto x={760} y={1110} t0={w("celu", "gasta")} c={C.rojo} size={56}>vive menos</Texto>
      <Texto x={540} y={1215} t0={w("celu", "propósito")} c={C.verde} size={70}>frena a propósito</Texto>
    </Escena>

    <Escena id="cta">
      <CierreSeguir t0={desde("cta") + 0.05} pregunta="¿Qué explicamos hoy?" y={440} />
    </Escena>
  </Base>
);
