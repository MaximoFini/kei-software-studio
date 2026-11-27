import React from "react";
import { C, Dib, Texto, Titular, Trazo, arco, caja, circulo, crearPizarron, flecha, linea, onda, recto, suave } from "./pizarronKit";
import { Celu, CierreSeguir, Micro, Router, Signo, WifiSimbolo } from "./pizarronIconos";
import voz from "./wifiVoz.json";

// Reel pizarrón "¿Por qué el microondas corta el wifi?" (guion en scripts/guiones/wifi.json).
// Idea: los dos usan ondas de radio de 2,4 GHz; la fuga del microondas pisa al wifi; la banda de 5 GHz lo evita.

const { w, desde, Escena, Base, TOTAL } = crearPizarron(voz);
export const WIFI_TOTAL = TOTAL;

/** Ondas que salen de un punto, hacia un lado (dir=1 derecha, -1 izquierda). */
const Ondas: React.FC<{ x: number; y: number; dir?: 1 | -1; t0: number; c?: string; n?: number; r0?: number }> = ({ x, y, dir = 1, t0, c = C.amarillo, n = 3, r0 = 50 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <Trazo key={i} d={arco(x, y, r0 + i * 38, dir === 1 ? -0.8 : Math.PI - 0.8, dir === 1 ? 0.8 : Math.PI + 0.8, i + 3)} t0={t0 + i * 0.15} dur={0.35} c={c} w={8} sonido={i === 0} />
    ))}
  </>
);

export const WifiReel: React.FC = () => (
  <Base audio="wifi">
    {/* 1 · Gancho: el microondas contra el wifi */}
    <Escena id="hook">
      <Titular lineas={["¿MICROONDAS", "VS. WIFI?"]} t0={desde("hook") + 0.05} c={C.amarillo} y={310} size={104} />
      <Micro x={290} y={950} s={1.15} t0={w("hook", "microondas")} dur={1.1} />
      <Router x={790} y={1000} s={1.2} t0={w("hook", "wifi")} dur={0.9} c={C.celeste} />
      <WifiSimbolo x={790} y={780} s={0.9} t0={w("hook", "wifi") + 0.4} dur={0.7} c={C.celeste} />
      <Trazo d={recto([[470, 920], [530, 1000], [500, 1010], [570, 1100]], 6, 1.5)} t0={w("hook", "cortarte")} dur={0.45} c={C.rojo} w={11} />
      <Signo x={540} y={1260} t0={w("hook", "magia")} c={C.verde} s={0.9} tipo="chispa" />
    </Escena>

    {/* 2 · Las dos usan 2,4 gigahercios */}
    <Escena id="ondas">
      <Titular lineas={["LA MISMA FRECUENCIA"]} t0={desde("ondas") + 0.05} c={C.celeste} y={330} size={98} />
      <Micro x={250} y={800} s={1.0} t0={desde("ondas") + 0.3} dur={0.8} />
      <Ondas x={400} y={800} t0={w("ondas", "ondas")} c={C.amarillo} />
      <Router x={820} y={830} s={1.15} t0={desde("ondas") + 0.5} dur={0.8} c={C.celeste} />
      <Ondas x={740} y={760} dir={-1} t0={w("ondas", "radio")} c={C.celeste} />
      <Texto x={540} y={1100} t0={w("ondas", "dos", 1)} c={C.amarillo} size={170} titulo>2,4 GHz</Texto>
      <Trazo d={onda(220, 1150, 640, 7, 6, 3)} t0={w("ondas", "gigahercios")} dur={0.5} c={C.amarillo} w={6} />
    </Escena>

    {/* 3 · Se escapa un poquito y pisa al wifi */}
    <Escena id="fuga">
      <Titular lineas={["¡SE ESCAPA!"]} t0={desde("fuga") + 0.05} c={C.rosa} y={330} />
      <Micro x={290} y={860} s={1.1} t0={desde("fuga") + 0.3} dur={0.9} />
      <Trazo d={caja(150, 770, 280, 180, 4, 10)} t0={w("fuga", "blindado")} dur={0.5} c={C.blanco} w={12} punta={false} />
      <Texto x={290} y={640} t0={w("fuga", "blindado")} c={C.blanco} size={50}>blindado</Texto>
      {[0, 1, 2].map((i) => (
        <Trazo key={i} d={recto([[455 + i * 24, 800 + i * 30], [560 + i * 24, 820 + i * 30], [610, 790 + i * 38]], 4 + i, 3)}
          t0={w("fuga", "escapa") + i * 0.14} dur={0.35} c={C.rosa} w={8} sonido={i === 0} />
      ))}
      <WifiSimbolo x={830} y={880} s={1.0} t0={w("fuga", "wifi")} dur={0.6} c={C.celeste} />
      <Trazo d={recto([[690, 800], [770, 880], [740, 890], [800, 960]], 8, 1.5)} t0={w("fuga", "pisa")} dur={0.4} c={C.rojo} w={10} />
      <Texto x={540} y={1180} t0={w("fuga", "poquito")} c={C.rosa} size={64}>un poquito alcanza</Texto>
    </Escena>

    {/* 4 · Como hablar con alguien gritando: se pierden mensajes */}
    <Escena id="ruido">
      <Titular lineas={["SE PIERDEN MENSAJES"]} t0={desde("ruido") + 0.05} c={C.celeste} y={330} size={98} />
      <Celu x={170} y={900} s={1.0} t0={w("ruido", "hablar")} dur={0.7} c={C.celeste} />
      <Router x={860} y={930} s={1.05} t0={w("ruido", "hablar") + 0.2} dur={0.7} c={C.celeste} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Trazo key={i} d={caja(285 + i * 100, 870, 62, 62, i + 3, 8)} t0={w("ruido", "mensajes") + i * 0.1} dur={0.25} c={i === 1 || i === 3 ? C.rojo : C.blanco} w={6} sonido={i === 0} relleno={i === 1 || i === 3} punta={false} />
      ))}
      <Trazo d={onda(260, 1070, 520, 26, 6, 4)} t0={w("ruido", "gritando")} dur={0.6} c={C.rojo} w={9} />
      <Texto x={540} y={1170} t0={w("ruido", "gritando")} c={C.rojo} size={56}>¡ruido!</Texto>
      <Dib x={540} y={720} s={0.7} t0={w("ruido", "traba")} dur={0.6} c={C.amarillo} trazos={[
        { d: suave([[-70, 40], [-90, -10], [-50, -60], [10, -66], [66, -34], [78, 20], [40, 60]]) },
        { d: recto([[40, 60], [14, 36], [60, 36], [40, 60]], 2, 1), relleno: true },
      ]} />
      <Texto x={540} y={1330} t0={w("ruido", "traba")} c={C.amarillo} size={62}>se traba</Texto>
    </Escena>

    {/* 5 · La solución: la banda de 5 GHz */}
    <Escena id="solucion">
      <Titular lineas={["LA SOLUCIÓN"]} t0={desde("solucion") + 0.05} c={C.verde} y={330} />
      <Router x={540} y={740} s={1.7} t0={desde("solucion") + 0.3} dur={0.8} c={C.celeste} />
      <Texto x={270} y={1010} t0={w("solucion", "red")} c={C.rojo} size={74} titulo>2,4 GHz</Texto>
      <Signo x={270} y={1130} t0={w("solucion", "red") + 0.3} c={C.rojo} s={0.7} tipo="cruz" />
      <Texto x={810} y={1010} t0={w("solucion", "cinco")} c={C.verde} size={94} titulo>5 GHz</Texto>
      <Signo x={810} y={1130} t0={w("solucion", "gigahercios")} c={C.verde} s={0.8} tipo="check" />
      <Trazo d={flecha(560, 880, 790, 960, 3)} t0={w("solucion", "cinco")} dur={0.4} c={C.verde} w={8} />
      <Micro x={290} y={1235} s={0.5} t0={w("solucion", "microondas")} dur={0.6} />
      <Signo x={540} y={1235} t0={w("solucion", "toca")} c={C.rojo} s={0.5} tipo="cruz" />
    </Escena>

    <Escena id="cta">
      <CierreSeguir t0={desde("cta") + 0.05} pregunta="¿Qué aparato explicamos?" y={440} />
    </Escena>
  </Base>
);
