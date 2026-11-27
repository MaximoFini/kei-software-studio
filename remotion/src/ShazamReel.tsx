import React from "react";
import { C, Dib, Texto, Titular, Trazo, arco, caja, circulo, crearPizarron, flecha, linea, onda, recto, rnd, suave } from "./pizarronKit";
import { Bases, Celu, CierreSeguir, Huella, Microfono, Nota, Senal, Signo } from "./pizarronIconos";
import voz from "./shazamVoz.json";

// Reel pizarrón "¿Cómo reconoce Shazam una canción?" (guion en scripts/guiones/shazam.json).
// Gancho: reconoce la canción en cinco segundos aunque haya ruido. Idea: espectrograma -> picos -> huella -> comparar.

const { w, desde, Escena, Base, TOTAL } = crearPizarron(voz);
export const SHAZAM_TOTAL = TOTAL;

// Espectrograma: puntos de colores (más fuertes = más brillantes). picos = coordenadas (col, fila) destacadas.
const COLS = 9, FILAS = 8;
const PICOS: [number, number][] = [[1, 5], [2, 2], [3, 6], [4, 3], [5, 1], [6, 5], [7, 2], [8, 6]];
const Espectro: React.FC<{ x: number; y: number; paso: number; t0: number; dur: number; picosDesde?: number; unir?: number }> = ({ x, y, paso, t0, dur, picosDesde, unir }) => (
  <>
    <Trazo d={linea(x - 30, y + FILAS * paso, x + COLS * paso + 20, y + FILAS * paso, 3)} t0={t0} dur={0.4} c={C.blanco} w={6} />
    <Trazo d={linea(x - 30, y - 20, x - 30, y + FILAS * paso, 4)} t0={t0 + 0.15} dur={0.4} c={C.blanco} w={6} />
    {Array.from({ length: COLS * FILAS }, (_, k) => {
      const col = k % COLS, fila = Math.floor(k / COLS);
      const pico = PICOS.some(([c, f]) => c === col && f === fila);
      const fuerza = pico ? 1 : rnd(k * 3.1) * 0.8;
      if (!pico && fuerza < 0.35) return null;
      const tt = t0 + 0.3 + (dur * col) / COLS;
      return (
        <Trazo key={k} d={circulo(x + col * paso + paso / 2 - 14, y + fila * paso + paso / 2, pico ? 9 : 5 + fuerza * 4, k + 1)}
          t0={tt + rnd(k) * 0.1} dur={0.14} sonido={false} punta={false}
          c={pico && picosDesde !== undefined ? C.amarillo : fuerza > 0.62 ? C.rosa : C.celeste} w={pico && picosDesde !== undefined ? 11 : 6} relleno={true} />
      );
    })}
  </>
);

export const ShazamReel: React.FC = () => (
  <Base audio="shazam">
    {/* 1 · Gancho: suena una canción y el celu la reconoce */}
    <Escena id="hook">
      <Titular lineas={["¿QUÉ CANCIÓN ES?"]} t0={desde("hook") + 0.05} c={C.amarillo} y={330} />
      <Nota x={210} y={760} s={1.1} t0={desde("hook") + 0.4} dur={0.8} c={C.rosa} />
      <Nota x={880} y={700} s={0.8} t0={desde("hook") + 0.6} dur={0.8} c={C.celeste} />
      <Celu x={540} y={940} s={1.35} t0={w("hook", "reconoce")} dur={0.9} c={C.blanco} />
      <Senal x={540} y={760} s={0.9} t0={w("hook", "canción")} dur={0.7} c={C.celeste} n={3} />
      <Texto x={540} y={1240} t0={w("hook", "cinco")} c={C.amarillo} size={110} titulo>5 SEGUNDOS</Texto>
      <Dib x={800} y={1090} s={0.85} t0={w("hook", "ruido")} dur={0.8} c={C.rojo} trazos={[
        { d: onda(-110, 0, 220, 28, 5, 2) }, { d: onda(-110, 34, 220, 22, 6, 7) },
      ]} />
    </Escena>

    {/* 2 · Primero dibuja el sonido (espectrograma) */}
    <Escena id="espectro">
      <Titular lineas={["EL DIBUJO DEL SONIDO"]} t0={desde("espectro") + 0.05} c={C.celeste} y={330} size={96} />
      <Espectro x={170} y={560} paso={80} t0={w("espectro", "dibuja")} dur={2.4} />
      <Texto x={140} y={1235} t0={w("espectro", "notas")} c={C.blanco} size={46} anchor="start">tiempo →</Texto>
      <Texto x={80} y={520} t0={w("espectro", "notas")} c={C.blanco} size={46} anchor="start">notas</Texto>
      <Texto x={540} y={1300} t0={w("espectro", "fuerte")} c={C.rosa} size={50}>más fuerte = más color</Texto>
    </Escena>

    {/* 3 · Se queda con los picos */}
    <Escena id="picos">
      <Titular lineas={["SOLO LOS PICOS"]} t0={desde("picos") + 0.05} c={C.amarillo} y={330} />
      <Espectro x={170} y={560} paso={80} t0={desde("picos") + 0.2} dur={0.6} picosDesde={w("picos", "picos")} />
      <Dib x={820} y={1330} s={0.8} t0={w("picos", "ruido")} dur={0.7} c={C.rojo} trazos={[{ d: onda(-120, 0, 240, 26, 5, 4) }]} />
      <Texto x={400} y={1340} t0={w("picos", "ruido")} c={C.rojo} size={50}>ruido</Texto>
      <Signo x={650} y={1340} t0={w("picos", "borra")} c={C.rojo} s={0.5} tipo="cruz" />
    </Escena>

    {/* 4 · Une los puntos y arma la huella */}
    <Escena id="huella">
      <Titular lineas={["LA HUELLA"]} t0={desde("huella") + 0.05} c={C.celeste} y={330} />
      {PICOS.map(([c, f], i) => (
        <Trazo key={i} d={circulo(170 + c * 80 + 26, 560 + f * 80 + 40, 9, i + 1)} t0={desde("huella") + 0.3 + i * 0.05} dur={0.1} sonido={false} punta={false} c={C.amarillo} w={11} relleno />
      ))}
      {PICOS.slice(0, -1).map(([c, f], i) => {
        const [c2, f2] = PICOS[i + 1];
        return (
          <Trazo key={i} d={linea(170 + c * 80 + 26, 560 + f * 80 + 40, 170 + c2 * 80 + 26, 560 + f2 * 80 + 40, i + 5)} t0={w("huella", "parejas") + i * 0.12}
            dur={0.25} c={C.rosa} w={5} sonido={i === 0} punta={false} />
        );
      })}
      <Huella x={540} y={1260} s={0.85} t0={w("huella", "huella")} dur={1.2} c={C.celeste} />
    </Escena>

    {/* 5 · La compara con millones de huellas */}
    <Escena id="compara">
      <Titular lineas={["MILLONES DE HUELLAS"]} t0={desde("compara") + 0.05} c={C.amarillo} y={330} size={98} />
      <Huella x={200} y={820} s={0.8} t0={desde("compara") + 0.3} dur={0.9} c={C.celeste} />
      <Bases x={810} y={800} s={1.6} t0={w("compara", "millones")} dur={1.2} c={C.blanco} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Dib key={i} x={700 + (i % 3) * 110} y={730 + Math.floor(i / 3) * 130} s={0.22} t0={w("compara", "huellas") + i * 0.06} dur={0.3} c={C.celeste} trazos={[
          { d: arco(0, 10, 60, 3.5, 6.0, i) }, { d: arco(0, 10, 36, 3.4, 6.1, i + 2) },
        ]} />
      ))}
      <Trazo d={flecha(330, 820, 520, 820, 3)} t0={w("compara", "compara")} dur={0.5} c={C.rosa} w={8} />
      <Signo x={540} y={1210} t0={w("compara", "listo")} c={C.verde} s={1.4} tipo="check" />
      <Nota x={800} y={1210} s={0.9} t0={w("compara", "listo") + 0.2} dur={0.7} c={C.rosa} />
    </Escena>

    <Escena id="cta">
      <CierreSeguir t0={desde("cta") + 0.05} pregunta="¿Qué aparato explicamos?" y={440} />
    </Escena>
  </Base>
);
