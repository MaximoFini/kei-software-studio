import React from "react";
import { C, Dib, Sonido, Pop, Texto, Tr, Trazo, arco, barras, caja, circulo, flecha, linea, onda, recto, suave, rayado, rnd } from "./pizarronKit";

// Biblioteca de dibujos de tiza (cada uno es una lista de trazos en coordenadas locales de ~200x200 centradas en 0,0).
// Se usan con <Dib x y s t0 dur trazos={...} />. Los colores por trazo pisan el color del dibujo.

export type Ic = { x: number; y: number; s?: number; t0: number; dur?: number; c?: string; rot?: number };

const D: React.FC<Ic & { tr: Tr[]; w?: number }> = ({ tr, w = 7, ...p }) => <Dib {...p} trazos={tr} w={w} />;

// ---------- Aparatos ----------
export const celuT = (c = C.blanco): Tr[] => [
  { d: caja(-62, -112, 124, 224, 3, 20), c, relleno: true },
  { d: linea(-20, -92, 20, -92, 5), w: 6, c },
  { d: circulo(0, 90, 9, 7), w: 5, c },
];
export const Celu: React.FC<Ic> = (p) => <D {...p} tr={celuT(p.c)} />;

export const bateriaT = (nivel = 0.5, c = C.verde): Tr[] => [
  { d: caja(-90, -50, 170, 100, 11, 14), c: C.blanco },
  { d: caja(80, -22, 18, 44, 12, 5), c: C.blanco },
  ...(nivel > 0 ? [{ d: barras(-72, -36, Math.max(10, 148 * nivel - 8), 72, 15, 3), c, w: 9 }] : []),
];
export const Bateria: React.FC<Ic & { nivel?: number }> = ({ nivel = 0.5, ...p }) => <D {...p} tr={bateriaT(nivel, p.c)} />;

export const relojT = (hora = 0.1, min = 0.5, c = C.blanco): Tr[] => {
  const ticks: Tr[] = [0, 3, 6, 9].map((i) => {
    const a = (i / 12) * 6.2832;
    return { d: linea(Math.sin(a) * 78, -Math.cos(a) * 78, Math.sin(a) * 94, -Math.cos(a) * 94, i + 20), w: 6 };
  });
  const ah = hora * 6.2832, am = min * 6.2832;
  return [
    { d: circulo(0, 0, 100, 4), c },
    ...ticks,
    { d: linea(0, 0, Math.sin(ah) * 48, -Math.cos(ah) * 48, 31), w: 8, c: C.amarillo },
    { d: linea(0, 0, Math.sin(am) * 72, -Math.cos(am) * 72, 32), w: 6, c: C.amarillo },
  ];
};
export const Reloj: React.FC<Ic & { hora?: number; min?: number }> = ({ hora, min, ...p }) => <D {...p} tr={relojT(hora, min, p.c)} />;

export const satT = (): Tr[] => [
  { d: caja(-26, -26, 52, 52, 3, 6), relleno: true },
  { d: caja(-104, -16, 64, 32, 4), c: C.celeste, relleno: true },
  { d: caja(40, -16, 64, 32, 5), c: C.celeste, relleno: true },
  { d: linea(-72, -16, -72, 16, 6), c: C.celeste, w: 4 },
  { d: linea(72, -16, 72, 16, 7), c: C.celeste, w: 4 },
  { d: suave([[-14, 34], [0, 54], [14, 34]]), c: C.amarillo },
  { d: linea(0, 54, 0, 70, 8), c: C.amarillo, w: 5 },
];
export const Satelite: React.FC<Ic> = (p) => <D {...p} tr={satT()} />;

export const tierraT = (): Tr[] => [
  { d: circulo(0, 0, 150, 2), c: C.celeste, relleno: true },
  { d: suave([[-90, -50], [-60, -90], [-20, -80], [-10, -40], [-50, -20], [-80, -10], [-90, -50]]), c: C.verde, relleno: true },
  { d: suave([[20, 10], [60, -30], [100, 0], [90, 60], [50, 100], [30, 60], [20, 10]]), c: C.verde, relleno: true },
];
export const Tierra: React.FC<Ic> = (p) => <D {...p} tr={tierraT()} />;

export const pinT = (c = C.rojo): Tr[] => [
  { d: suave([[0, 70], [-38, 16], [-40, -20], [-18, -52], [18, -52], [40, -20], [38, 16], [0, 70]]), c, relleno: true },
  { d: circulo(0, -14, 14, 3), c: C.blanco, w: 6 },
];
export const Pin: React.FC<Ic> = (p) => <D {...p} tr={pinT(p.c)} />;

export const lupaT = (): Tr[] => [{ d: circulo(-12, -12, 54, 2), relleno: "#8FD0F2" }, { d: linea(28, 28, 76, 78, 4), w: 11 }];
export const Lupa: React.FC<Ic> = (p) => <D {...p} tr={lupaT()} />;

export const routerT = (): Tr[] => [
  { d: caja(-100, 10, 200, 62, 3, 14), relleno: true },
  { d: linea(-70, 10, -78, -60, 4), w: 6 },
  { d: linea(70, 10, 78, -60, 5), w: 6 },
  { d: circulo(-50, 41, 6, 6), w: 5, c: C.verde },
  { d: circulo(-26, 41, 6, 7), w: 5, c: C.verde },
  { d: circulo(-2, 41, 6, 8), w: 5, c: C.amarillo },
];
export const Router: React.FC<Ic> = (p) => <D {...p} tr={routerT()} />;

export const microT = (): Tr[] => [
  { d: caja(-130, -80, 260, 160, 5, 14), relleno: true },
  { d: caja(-110, -58, 150, 116, 6, 8), c: C.celeste },
  { d: linea(66, -58, 66, 58, 7), w: 5 },
  { d: circulo(98, -30, 12, 8), w: 5, c: C.amarillo },
  { d: circulo(98, 12, 12, 9), w: 5, c: C.amarillo },
  { d: linea(80, 46, 116, 46, 10), w: 5, c: C.rosa },
];
export const Micro: React.FC<Ic> = (p) => <D {...p} tr={microT()} />;

export const autoT = (c = C.celeste): Tr[] => [
  { d: suave([[-90, 20], [-90, -6], [-52, -14], [-30, -48], [34, -48], [58, -14], [92, -6], [92, 20], [-90, 20]]), c, relleno: true },
  { d: circulo(-52, 24, 17, 12), w: 6 },
  { d: circulo(54, 24, 17, 13), w: 6 },
  { d: recto([[-24, -42], [-34, -14], [48, -14], [30, -42], [-24, -42]], 14), c: C.blanco, w: 5 },
];
export const Auto: React.FC<Ic> = (p) => <D {...p} tr={autoT(p.c)} />;

export const dedoT = (): Tr[] => [
  { d: suave([[-30, 130], [-34, 10], [-34, -90], [-18, -112], [14, -112], [30, -90], [30, 10], [34, 130]]), relleno: true },
  { d: arco(0, -92, 26, 3.6, 5.9, 6), w: 5 },
];
export const Dedo: React.FC<Ic> = (p) => <D {...p} tr={dedoT()} />;

export const guanteT = (c = C.celeste): Tr[] => [
  { d: suave([[-60, 100], [-64, 20], [-76, -20], [-60, -30], [-48, -4], [-46, -80], [-26, -84], [-22, -30], [-14, -100], [8, -100], [10, -30], [22, -92], [42, -88], [38, -24], [58, -54], [76, -44], [58, 28], [60, 100], [-60, 100]]), c, relleno: true },
  { d: linea(-60, 70, 60, 70, 9), c, w: 5 },
];
export const Guante: React.FC<Ic> = (p) => <D {...p} tr={guanteT(p.c)} />;

export const salchichaT = (): Tr[] => [
  { d: caja(-110, -34, 220, 68, 15, 34), c: C.naranja, relleno: true },
  { d: onda(-84, -10, 160, 8, 2, 3), c: C.amarillo, w: 7 },
  { d: onda(-78, 14, 150, 8, 2, 8), c: C.amarillo, w: 7 },
];
export const Salchicha: React.FC<Ic> = (p) => <D {...p} tr={salchichaT()} />;

export const microfonoT = (): Tr[] => [
  { d: caja(-30, -90, 60, 110, 6, 30), relleno: true },
  { d: suave([[-56, -20], [-52, 30], [0, 52], [52, 30], [56, -20]]) },
  { d: linea(0, 52, 0, 92, 7), w: 6 },
  { d: linea(-34, 92, 34, 92, 8), w: 6 },
];
export const Microfono: React.FC<Ic> = (p) => <D {...p} tr={microfonoT()} />;

export const notaT = (c = C.rosa): Tr[] => [
  { d: suave([[-34, 60], [-34, -66], [44, -88], [44, 30]]), c },
  { d: circulo(-52, 62, 20, 3, 15), c, relleno: true },
  { d: circulo(26, 34, 20, 4, 15), c, relleno: true },
];
export const Nota: React.FC<Ic> = (p) => <D {...p} tr={notaT(p.c)} />;

export const huellaT = (c = C.celeste): Tr[] => [
  { d: arco(0, 10, 100, 3.5, 6.0, 1), c },
  { d: arco(0, 10, 78, 3.4, 6.1, 2), c },
  { d: arco(0, 10, 56, 3.3, 6.2, 3), c },
  { d: arco(0, 10, 34, 3.3, 6.2, 4), c },
  { d: arco(0, 10, 12, 3.3, 6.2, 5), c },
  { d: linea(-100, 10, -100, 70, 6), c },
  { d: linea(100, 10, 100, 60, 7), c },
];
export const Huella: React.FC<Ic> = (p) => <D {...p} tr={huellaT(p.c)} />;

export const basesT = (): Tr[] => [
  { d: suave([[-80, -60], [-60, -76], [60, -76], [80, -60], [60, -44], [-60, -44], [-80, -60]]), relleno: true },
  { d: recto([[-80, -60], [-80, 60]], 3) },
  { d: recto([[80, -60], [80, 60]], 4) },
  { d: suave([[-80, -10], [-40, 8], [40, 8], [80, -10]]) },
  { d: suave([[-80, 40], [-40, 58], [40, 58], [80, 40]]) },
  { d: suave([[-80, 60], [-40, 78], [40, 78], [80, 60]]) },
];
export const Bases: React.FC<Ic> = (p) => <D {...p} tr={basesT()} />;

// ---------- Señales ----------
/** Arcos de señal (wifi / ondas) apuntando hacia arriba. n arcos. */
export const Senal: React.FC<Ic & { n?: number; abre?: number }> = ({ n = 3, abre = 0.62, ...p }) => (
  <D {...p} w={p.s ? 8 : 8} tr={Array.from({ length: n }, (_, i) => ({ d: arco(0, 0, 36 + i * 36, -1.5708 - abre, -1.5708 + abre, i + 2) }))} />
);
export const WifiSimbolo: React.FC<Ic> = (p) => (
  <D {...p} tr={[
    { d: circulo(0, 36, 8, 3), relleno: true },
    ...[1, 2, 3].map((i) => ({ d: arco(0, 36, i * 34, -2.2, -0.94, i) })),
  ]} />
);
/** Ondas laterales (>>>) que salen hacia la derecha. */
export const OndasLado: React.FC<Ic & { n?: number }> = ({ n = 3, ...p }) => (
  <D {...p} tr={Array.from({ length: n }, (_, i) => ({ d: arco(-30, 0, 40 + i * 34, -0.8, 0.8, i + 4) }))} />
);

// ---------- Marcas ----------
export const Signo: React.FC<{ x: number; y: number; t0: number; c?: string; s?: number; tipo?: "pregunta" | "check" | "cruz" | "alerta" | "chispa" }> = ({
  x, y, t0, c = C.amarillo, s = 1, tipo = "pregunta",
}) => {
  const tr: Tr[] =
    tipo === "pregunta"
      ? [{ d: suave([[-34, -50], [-18, -86], [24, -86], [40, -52], [10, -16], [0, 14]]) }, { d: circulo(0, 52, 6, 3), relleno: true }]
      : tipo === "check"
      ? [{ d: recto([[-60, 4], [-18, 48], [62, -52]], 3, 1.5), w: 12 }]
      : tipo === "cruz"
      ? [{ d: linea(-48, -48, 48, 48, 2), w: 12 }, { d: linea(48, -48, -48, 48, 3), w: 12 }]
      : tipo === "alerta"
      ? [{ d: recto([[0, -70], [66, 50], [-66, 50], [0, -70]], 3), relleno: true }, { d: linea(0, -26, 0, 14, 4), w: 8 }, { d: circulo(0, 34, 4, 5), w: 6 }]
      : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * 6.2832;
          return { d: linea(Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 62, Math.sin(a) * 62, i + 1), w: 7 };
        });
  return (
    <>
      <Sonido t={t0 + 0.2} f={tipo === "check" ? "qr_ok.wav" : "qr_pop.wav"} v={0.2} />
      <Dib x={x} y={y} s={s} t0={t0} dur={0.45} c={c} trazos={tr} />
    </>
  );
};

/** Cara de Einstein (pelo revuelto y bigote). */
export const einsteinT = (): Tr[] => [
  { d: suave([[-66, -30], [-66, 20], [-48, 66], [-18, 92], [18, 92], [48, 66], [66, 20], [66, -30]]), relleno: "#F2C6A0" },
  { d: suave([[-66, -30], [-112, -34], [-128, -78], [-96, -100], [-110, -146], [-62, -138], [-40, -178], [-4, -150], [30, -182], [58, -142], [104, -150], [100, -104], [130, -78], [114, -34], [66, -30]]), c: C.blanco, w: 8 },
  { d: suave([[-54, -62], [-34, -76], [-12, -64]]), c: C.blanco, w: 9 },
  { d: suave([[12, -64], [34, -76], [54, -62]]), c: C.blanco, w: 9 },
  { d: circulo(-32, -38, 6, 3), w: 7 },
  { d: circulo(32, -38, 6, 4), w: 7 },
  { d: suave([[0, -30], [-8, 4], [8, 8]]), w: 5 },
  { d: suave([[-62, 30], [-34, 12], [-4, 26], [4, 26], [34, 12], [62, 30], [34, 46], [4, 34], [-4, 34], [-34, 46], [-62, 30]]), c: C.blanco, relleno: true },
  { d: suave([[-16, 66], [0, 72], [16, 66]]), c: C.rosa, w: 6 },
];
export const Einstein: React.FC<Ic> = (p) => <D {...p} tr={einsteinT()} />;

// ---------- Cierre común: seguinos + pregunta para comentar ----------
export const CierreSeguir: React.FC<{ t0: number; pregunta: string; y?: number }> = ({ t0, pregunta, y = 520 }) => (
  <>
    <Sonido t={t0} f="qr_pop.wav" v={0.22} />
    <Sonido t={t0 + 1.9} f="qr_ok.wav" v={0.2} />
    <Texto x={540} y={y} t0={t0} c={C.amarillo} size={120} titulo>SEGUINOS</Texto>
    <Trazo d={onda(190, y + 36, 700, 7, 5, 9)} t0={t0 + 0.5} dur={0.45} c={C.amarillo} w={6} />
    <Texto x={540} y={y + 150} t0={t0 + 0.35} c={C.blanco} size={66}>@keisoftware</Texto>
    <Dib x={540} y={y + 380} s={1.15} t0={t0 + 0.9} dur={1.0} c={C.celeste} trazos={[
      { d: caja(-330, -120, 660, 220, 8, 40), relleno: true },
      { d: recto([[-60, 100], [-100, 160], [-10, 102]], 4, 1.4) },
    ]} />
    <Texto x={540} y={y + 372} t0={t0 + 1.3} c={C.blanco} size={52}>{pregunta}</Texto>
    <Signo x={760} y={y + 700} t0={t0 + 1.9} c={C.rosa} s={1.2} tipo="chispa" />
  </>
);

export { rnd };
