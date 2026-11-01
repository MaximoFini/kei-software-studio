import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { BRAND } from "./KeiCierre";
import { crearExplainer, useT, ramp, pop, hash, clamp, easeInOut, Centro, Chip, Telefono, Persona, TarjetaSeguir, Sfx } from "./explainerKit";
import voz from "./audioVoz.json";

// Reel explicativo "¿Cómo viaja un audio?" (guion en scripts/guiones/audio.json). Concepto: la voz es aire
// que vibra; el celular la mide miles de veces por segundo, la convierte en números, la achica, y el otro
// celular usa esos números para volver a hacer vibrar el aire. Gancho: "el audio no es tu voz, es una lista
// de números"; bucle abierto: por qué tu voz grabada te suena rara (conducción por los huesos).

const { w, desde, TOTAL, Escena, Base } = crearExplainer(voz, "¿Cómo viaja un audio?");
export const AUDIO_TOTAL = TOTAL;

const JULI = { remera: BRAND.azulUI, pelo: "#3B2417", peinado: "largo" as const };
const MAMA = { remera: "#2A44C9", pelo: "#B8BCC8", peinado: "largo" as const, piel: "#EBC0A0", fase: 1.1 };

// ---------------- Piezas ----------------
const fmt = (v: number) => v.toFixed(2).replace(".", ",");

// Onda de voz: sílabas (envolvente) con silencios; hf = detalle agudo que la compresión saca
const SILENCIOS: [number, number][] = [[0.3, 0.4], [0.62, 0.72]];
const onda = (x: number, t: number, hf = 1) => {
  if (SILENCIOS.some(([a, b]) => x > a && x < b)) return 0.015 * Math.sin(x * 400 + t * 9) * hf;
  const env = 0.15 + 0.85 * Math.pow(Math.abs(Math.sin(x * Math.PI * 6 + 0.4)), 0.7) * (0.6 + 0.4 * Math.sin(x * 5.3 + 1));
  return env * (0.6 * Math.sin(2 * Math.PI * 38 * x + t * 5) + 0.3 * Math.sin(2 * Math.PI * 61 * x + t * 3) + 0.22 * hf * Math.sin(2 * Math.PI * 170 * x + t * 11));
};
// Tramo ampliado de la onda para mostrar las medidas (pocas oscilaciones, bien visibles)
const ondaSuave = (f: number) => 0.72 * Math.sin(2 * Math.PI * 2.2 * f + 0.3) + 0.25 * Math.sin(2 * Math.PI * 5.3 * f + 1);

// Partículas de aire: compresiones y expansiones que viajan (onda longitudinal)
const Aire: React.FC<{ x: number; y: number; w: number; h: number; amp: number; o?: number; vel?: number }> = ({ x, y, w: W, h, amp, o = 1, vel = 7 }) => {
  const t = useT();
  const cols = Math.round(W / 34), filas = Math.round(h / 34);
  return (
    <svg width={W} height={h} style={{ position: "absolute", left: x, top: y, opacity: o, overflow: "visible" }}>
      {[...Array(cols * filas)].map((_, i) => {
        const c = i % cols, f = Math.floor(i / cols);
        const bx = c * 34 + (f % 2) * 17, by = f * 34 + 17;
        const fase = bx * 0.035 - t * vel;
        const dx = amp * Math.sin(fase);
        const densa = Math.cos(fase); // compresión: más brillo
        return <circle key={i} cx={bx + dx} cy={by} r={5} fill={densa > 0 ? BRAND.azulUI : BRAND.azulHielo} opacity={0.35 + 0.5 * Math.max(0, densa) * (amp / 14)} />;
      })}
    </svg>
  );
};

// Arcos de sonido que salen de un punto hacia un lado
const Arcos: React.FC<{ x: number; y: number; p: number; lado?: 1 | -1; color?: string; n?: number }> = ({ x, y, p, lado = 1, color = BRAND.azulUI, n = 4 }) => {
  const t = useT();
  if (p <= 0) return null;
  return (
    <svg width={400} height={400} viewBox="-200 -200 400 400" style={{ position: "absolute", left: x - 200, top: y - 200, overflow: "visible" }}>
      {[...Array(n)].map((_, k) => {
        const f = (t * 1.3 + k / n) % 1;
        const r = 30 + f * 170;
        const a = Math.PI / 4;
        const x1 = lado * Math.cos(a) * r, y1 = -Math.sin(a) * r, y2 = Math.sin(a) * r;
        return <path key={k} d={`M${x1} ${y1} A${r} ${r} 0 0 ${lado > 0 ? 1 : 0} ${x1} ${y2}`} fill="none" stroke={color} strokeWidth={9 - f * 5}
          strokeLinecap="round" opacity={(1 - f) * p} />;
      })}
    </svg>
  );
};

// Burbuja de audio de chat: barras de la onda (o números)
const BARRAS = [...Array(26)].map((_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.sin(i * 0.45 + 1)));
const Burbuja: React.FC<{ w?: number; numeros?: number; temblor?: number }> = ({ w: W = 380, numeros = 0, temblor = 0 }) => {
  const t = useT();
  return (
    <div style={{ width: W, height: 104, borderRadius: "30px 30px 8px 30px", background: BRAND.azulUI, display: "flex", alignItems: "center",
      gap: 14, padding: "0 22px", boxSizing: "border-box", boxShadow: `0 12px 40px ${BRAND.azulUI}66`,
      transform: `translateX(${Math.sin(t * 50) * 6 * temblor}px)` }}>
      <svg width={40} height={40} viewBox="0 0 24 24"><path d="M7 4v16l13-8z" fill="#fff" /></svg>
      <div style={{ flex: 1, height: 60, display: "flex", alignItems: "center", gap: 4 }}>
        {BARRAS.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h * 100 * (1 - numeros)}%`, minHeight: 4, borderRadius: 3, background: "#fff",
            opacity: 1 - numeros * ramp(numeros, i / 26 * 0.5, i / 26 * 0.5 + 0.5) }} />
        ))}
      </div>
      <div style={{ fontFamily: "Montserrat", fontWeight: 600, fontSize: 24, color: "#fff" }}>0:12</div>
    </div>
  );
};

// Columnas de números que salen de un punto
const NumerosVolando: React.FC<{ x: number; y: number; p: number; ancho?: number }> = ({ x, y, p, ancho = 900 }) => {
  const t = useT();
  if (p <= 0) return null;
  return (
    <>
      {[...Array(26)].map((_, i) => {
        const f = ((t * 0.45 + hash(i, 1)) % 1);
        const v = (hash(i, Math.floor(t * 0.45 + hash(i, 1))) - 0.5) * 2;
        return (
          <div key={i} style={{ position: "absolute", left: x + (hash(i, 4) - 0.5) * ancho, top: y - f * 480, transform: "translate(-50%,-50%)",
            fontFamily: "Montserrat", fontWeight: 700, fontSize: 30 + hash(i, 5) * 22, color: i % 3 ? "#fff" : BRAND.azulUI,
            opacity: Math.sin(f * Math.PI) * p, whiteSpace: "nowrap" }}>
            {fmt(v)}
          </div>
        );
      })}
    </>
  );
};

const Chat: React.FC<{ numeros: number; temblor: number }> = ({ numeros, temblor }) => (
  <AbsoluteFill style={{ background: "#0E1530", fontFamily: "Montserrat" }}>
    <div style={{ height: 150, background: BRAND.azulMarino, display: "flex", alignItems: "flex-end", padding: "0 26px 20px", gap: 18, boxSizing: "border-box" }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#B8BCC8", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 34, fontWeight: 700, color: BRAND.azulMarino }}>M</div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>Mamá</div>
        <div style={{ fontSize: 22, color: BRAND.azulHielo, opacity: 0.7 }}>en línea</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 26, top: 220, padding: "18px 24px", borderRadius: "8px 26px 26px 26px", background: "#252E4D",
      color: "#fff", fontSize: 28 }}>¿Venís a comer? 🍝</div>
    <div style={{ position: "absolute", right: 22, top: 360 }}>
      <Burbuja numeros={numeros} temblor={temblor} />
    </div>
  </AbsoluteFill>
);

// ---------------- Escenas ----------------
const PISO = 1330;

const Hook: React.FC = () => {
  const t = useT();
  const temblor = ramp(t, w("hook", "no") - 0.05, w("hook", "voz")) * (1 - ramp(t, w("hook", "voz") + 0.2, w("hook", "es", 1)));
  const numeros = ramp(t, w("hook", "lista") - 0.25, w("hook", "números") + 0.2);
  return (
    <Escena id="hook">
      <Centro y={800}>
        <Telefono w={480} h={900}>
          <Chat numeros={numeros} temblor={temblor} />
        </Telefono>
      </Centro>
      <NumerosVolando x={680} y={820} p={numeros} />
    </Escena>
  );
};

const Promesa: React.FC = () => {
  const t = useT();
  const play = ramp(t, w("promesa", "final"), w("promesa", "final") + 0.3);
  const cara = pop(t, w("promesa", "grabada") - 0.15, 9);
  const susto = ramp(t, w("promesa", "odiás") - 0.2, w("promesa", "odiás") + 0.2);
  return (
    <Escena id="promesa">
      <Persona x={480} y={PISO} escala={1.2} {...JULI} celular={1} brazoI={interpolate(play, [0, 1], [10, 70])} brazoD={8 + 150 * susto} />
      <Arcos x={235} y={PISO - 410} p={play} lado={-1} />
      <Centro x={800} y={560} style={{ transform: `translate(-50%,-50%) scale(${cara})` }}>
        <div style={{ width: 230, height: 190, borderRadius: 40, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 120, boxShadow: "0 12px 40px rgba(0,0,0,.4)" }}>😖</div>
      </Centro>
    </Escena>
  );
};

const Juli: React.FC = () => {
  const t = useT();
  const nombre = pop(t, w("juli", "Juli"));
  const sube = ramp(t, w("juli", "Aprieta") - 0.3, w("juli", "Aprieta") + 0.2);
  const mic = pop(t, w("juli", "micrófono") - 0.1);
  const habla = ramp(t, w("juli", "habla") - 0.1, w("juli", "habla") + 0.2);
  const aire = ramp(t, w("juli", "aire") - 0.3, w("juli", "vibra") + 0.2);
  const X = 300;
  return (
    <Escena id="juli">
      <Aire x={460} y={540} w={560} h={430} amp={14 * aire} o={aire} />
      <Persona x={X} y={PISO} escala={1.1} {...JULI} celular={1} brazoI={interpolate(sube, [0, 1], [10, 120])} />
      <Chip p={nombre} style={{ left: X, top: 560 }}>Juli</Chip>
      <Arcos x={X + 60} y={PISO - 495} p={habla} />
      {mic > 0 && (
        <Centro x={X - 170} y={760} style={{ transform: `translate(-50%,-50%) scale(${mic * (1 + 0.06 * Math.sin(t * 10) * habla)})` }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: BRAND.azulUI, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 ${20 + 40 * habla}px ${BRAND.azulUI}` }}>
            <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
              <rect x={9} y={3} width={6} height={11} rx={3} fill="#fff" />
              <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
            </svg>
          </div>
        </Centro>
      )}
    </Escena>
  );
};

const Micro: React.FC = () => {
  const t = useT();
  const memb = pop(t, w("micro", "membrana") - 0.1);
  const vibra = ramp(t, w("micro", "vibra") - 0.2, w("micro", "vibra") + 0.2);
  const elec = ramp(t, w("micro", "convierte") - 0.1, w("micro", "electricidad") + 0.2);
  const rayo = pop(t, w("micro", "electricidad"), 9);
  const dx = Math.sin(t * 22) * 46 * vibra;
  const MX = 470;
  return (
    <Escena id="micro">
      {/* carcasa del celular por dentro */}
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 560, borderRadius: 60, border: `6px solid #3A4466`, background: "#0B1020AA" }} />
      <Aire x={110} y={520} w={300} h={460} amp={12 * vibra} vel={8} />
      {/* membrana */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M${MX} 560 Q${MX + dx} 750 ${MX} 940`} fill="none" stroke="#fff" strokeWidth={14 * memb} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 12px ${BRAND.azulUI})` }} />
        <rect x={MX - 30} y={540} width={60} height={20} rx={6} fill="#3A4466" />
        <rect x={MX - 30} y={940} width={60} height={20} rx={6} fill="#3A4466" />
        {/* señal eléctrica */}
        {elec > 0 && (
          <path d={[...Array(60)].map((_, i) => {
            const x = MX + 40 + i * 8;
            const y = 750 + Math.sin(i * 0.5 - t * 14) * 70 * Math.min(1, elec * 1.4) * (0.5 + 0.5 * Math.sin(i * 0.11));
            return `${i ? "L" : "M"}${x} ${y}`;
          }).join(" ")} fill="none" stroke={BRAND.azulUI} strokeWidth={8} strokeLinecap="round"
            pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - elec} style={{ filter: `drop-shadow(0 0 14px ${BRAND.azulUI})` }} />
        )}
      </svg>
      <Chip p={memb} style={{ left: MX, top: 1090, fontSize: 48 }}>membrana</Chip>
      {rayo > 0 && (
        <Centro x={880} y={600} style={{ transform: `translate(-50%,-50%) scale(${rayo})` }}>
          <svg width={110} height={150} viewBox="0 0 22 30"><path d="M13 1 L2 17 H10 L8 29 L20 11 H12 Z" fill="#FFD84A" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" /></svg>
        </Centro>
      )}
    </Escena>
  );
};

const GX = 80, GW = 920, GY = 820, GA = 230;
const Medir: React.FC = () => {
  const t = useT();
  const linea = ramp(t, desde("medir"), desde("medir") + 0.6);
  const mide = ramp(t, w("medir", "mide") - 0.1, w("medir", "señal") + 0.3, Easing.linear);
  const chip = pop(t, w("medir", "miles") - 0.1);
  const nums = ramp(t, w("medir", "cada") - 0.1, w("medir", "número") + 0.2, Easing.linear);
  const N = 28;
  return (
    <Escena id="medir">
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={GX} y1={GY} x2={GX + GW} y2={GY} stroke={`${BRAND.azulHielo}33`} strokeWidth={3} />
        <path d={[...Array(400)].map((_, i) => `${i ? "L" : "M"}${GX + (i / 399) * GW} ${GY - ondaSuave(i / 399) * GA}`).join(" ")}
          fill="none" stroke="#fff" strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - linea} />
        {[...Array(N)].map((_, k) => {
          const f = (k + 0.5) / N;
          if (f > mide) return null;
          const v = ondaSuave(f);
          const x = GX + f * GW, y = GY - v * GA;
          return (
            <g key={k}>
              <line x1={x} y1={GY} x2={x} y2={y} stroke={BRAND.azulUI} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
              <circle cx={x} cy={y} r={9} fill={BRAND.azulUI} stroke="#fff" strokeWidth={3} />
            </g>
          );
        })}
      </svg>
      {nums > 0 && [...Array(N)].map((_, k) => {
        if (k % 3) return null;
        const f = (k + 0.5) / N;
        const v = ondaSuave(f);
        const p = ramp(nums, f * 0.7, f * 0.7 + 0.3);
        return (
          <div key={k} style={{ position: "absolute", left: GX + f * GW, top: v > 0 ? GY - v * GA - 54 : GY - v * GA + 54, transform: `translate(-50%,-50%) scale(${p})`,
            fontFamily: "Montserrat", fontWeight: 700, fontSize: 30, color: "#fff", background: BRAND.azulMarino, borderRadius: 10, padding: "4px 8px",
            border: `2px solid ${BRAND.azulUI}` }}>
            {fmt(v)}
          </div>
        );
      })}
      <Chip p={chip} style={{ left: 540, top: 470, fontSize: 64, padding: "16px 40px" }}>
        <span style={{ color: BRAND.azulUI }}>16.000</span> por segundo
      </Chip>
    </Escena>
  );
};

const Achica: React.FC = () => {
  const t = useT();
  const marca = ramp(t, w("achica", "silencios") - 0.2, w("achica", "silencios") + 0.2);
  const corta = ramp(t, w("achica", "silencios") + 0.3, w("achica", "y") + 0.2, easeInOut);
  const oido = pop(t, w("achica", "oído") - 0.1);
  const suaviza = ramp(t, w("achica", "escucha") - 0.3, w("achica", "escucha") + 0.4);
  const peso = ramp(t, w("achica", "Pesa") - 0.1, w("achica", "menos") + 0.3, easeInOut);
  const archivo = ramp(t, w("achica", "Pesa") - 0.4, w("achica", "Pesa"));
  // los silencios se cierran: cada x se corre a la izquierda lo que ya se sacó antes
  const sacado = (x: number) => SILENCIOS.reduce((s, [a, b]) => s + Math.max(0, Math.min(x, b) - a), 0) * corta;
  const largo = 1 - sacado(1);
  const X0 = 540 - (GW * largo) / 2;
  const px = (x: number) => X0 + ((x - sacado(x)) / 1) * GW;
  const kb = Math.round(interpolate(peso, [0, 1], [2500, 250]));
  return (
    <Escena id="achica">
      <AbsoluteFill style={{ opacity: 1 - archivo * 0.85 }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {SILENCIOS.map(([a, b]) => (
            <rect key={a} x={px(a)} y={GY - 160} width={Math.max(0, px(b) - px(a))} height={320} rx={16} fill="#E0566B"
              opacity={0.3 * marca * (1 - corta)} stroke="#E0566B" strokeWidth={4} />
          ))}
          <path d={[...Array(500)].map((_, i) => { const x = i / 499; return `${i ? "L" : "M"}${px(x)} ${GY - onda(x, t, 1 - suaviza) * 210}`; }).join(" ")}
            fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        </svg>
        {oido > 0 && (
          <Centro x={540} y={540} style={{ transform: `translate(-50%,-50%) scale(${oido})` }}>
            <svg width={140} height={160} viewBox="0 0 24 28" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
              <path d="M6 10a7 7 0 1 1 14 0c0 4-3 5-4 8s-2 7-6 7-4-3-4-3" />
              <path d="M10 10a3 3 0 0 1 6 0c0 2-2 2-2 4" stroke={BRAND.azulUI} />
            </svg>
          </Centro>
        )}
      </AbsoluteFill>
      {/* archivo que se achica */}
      {archivo > 0 && (
        <Centro y={800} style={{ opacity: archivo, transform: `translate(-50%,-50%) scale(${interpolate(peso, [0, 1], [1, 0.55])})` }}>
          <div style={{ width: 420, height: 520, borderRadius: "30px 110px 30px 30px", background: "#fff", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20, boxShadow: `0 0 0 8px ${BRAND.azulUI}, 0 30px 80px rgba(0,0,0,.5)` }}>
            <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke={BRAND.azulUI} strokeWidth={2.2} strokeLinecap="round">
              <path d="M9 18V6l11-2v12" /><circle cx={6} cy={18} r={3} fill={BRAND.azulUI} /><circle cx={17} cy={16} r={3} fill={BRAND.azulUI} />
            </svg>
            <div style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 80, color: BRAND.fondoOscuro }}>
              {kb >= 1000 ? `${(kb / 1000).toFixed(1).replace(".", ",")} MB` : `${kb} KB`}
            </div>
          </div>
        </Centro>
      )}
    </Escena>
  );
};

const Viaja: React.FC = () => {
  const t = useT();
  const nube = pop(t, w("viaja", "internet") - 0.2);
  const vuela = ramp(t, w("viaja", "Los") - 0.1, w("viaja", "Los") + 0.4);
  const parlante = ramp(t, w("viaja", "parlante") - 0.15, w("viaja", "parlante") + 0.2);
  const aire = ramp(t, w("viaja", "aire") - 0.2, w("viaja", "vibrar") + 0.2);
  const corazon = pop(t, w("viaja", "Juli") - 0.1, 9);
  const JX = 200, MX = 880;
  return (
    <Escena id="viaja">
      {/* números que viajan en arco por internet */}
      {vuela > 0 && [...Array(14)].map((_, i) => {
        const f = (t * 0.55 + i / 14) % 1;
        const x = interpolate(f, [0, 1], [JX + 60, MX - 60]);
        const y = 760 - Math.sin(f * Math.PI) * 330;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", fontFamily: "Montserrat", fontWeight: 700,
            fontSize: 34, color: i % 3 ? "#fff" : BRAND.azulUI, opacity: Math.sin(f * Math.PI) * vuela }}>
            {fmt((hash(i, 2) - 0.5) * 2)}
          </div>
        );
      })}
      {nube > 0 && (
        <Centro x={540} y={420} style={{ transform: `translate(-50%,-50%) scale(${nube})` }}>
          <svg width={260} height={170} viewBox="0 0 52 34">
            <path d="M14 30h26a9 9 0 0 0 1-18 12 12 0 0 0-23-3A10 10 0 0 0 14 30z" fill={BRAND.azulMarino} stroke={BRAND.azulUI} strokeWidth={2} />
            <circle cx={27} cy={20} r={6} fill="none" stroke={BRAND.azulHielo} strokeWidth={1.6} />
            <path d="M21 20h12M27 14c-3 3-3 9 0 12M27 14c3 3 3 9 0 12" fill="none" stroke={BRAND.azulHielo} strokeWidth={1.2} />
          </svg>
        </Centro>
      )}
      <Persona x={JX} y={PISO} escala={0.85} {...JULI} celular={1} brazoI={70} />
      <Persona x={MX} y={PISO} escala={0.85} {...MAMA} celular={1} brazoI={70} />
      {/* parlante del celular de la mamá: el aire vuelve a vibrar */}
      <Arcos x={MX - 150} y={PISO - 380} p={parlante} lado={-1} />
      <Aire x={460} y={880} w={300} h={240} amp={12 * aire} o={aire} />
      {corazon > 0 && (
        <Centro x={MX} y={PISO - 640} style={{ transform: `translate(-50%,-50%) scale(${corazon}) translateY(${-20 * corazon}px)` }}>
          <svg width={110} height={100} viewBox="0 0 24 22"><path d="M12 21s-9-6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" fill="#E0566B" /></svg>
        </Centro>
      )}
    </Escena>
  );
};

const Huesos: React.FC = () => {
  const t = useT();
  const aire = ramp(t, w("huesos", "hablás") - 0.2, w("huesos", "hablás") + 0.4);
  const hueso = ramp(t, w("huesos", "huesos") - 0.3, w("huesos", "huesos") + 0.4);
  const grave = ramp(t, w("huesos", "grave") - 0.3, w("huesos", "grave") + 0.3);
  const cambio = ramp(t, w("huesos", "La") - 0.3, w("huesos", "La") + 0.1, easeInOut);
  const escuchan = ramp(t, w("huesos", "escuchan") - 0.2, w("huesos", "escuchan") + 0.2);
  const E = 1.75, FEET = 1560;
  const cab = (dy: number) => FEET + dy * E; // y en px de un punto de la cabeza
  const boca = { x: 540, y: cab(-440) }, oreja = { x: 540 + 70 * E, y: cab(-474) };
  return (
    <Escena id="huesos">
      <AbsoluteFill style={{ opacity: 1 - cambio, WebkitMaskImage: "linear-gradient(#000 62%, transparent 70%)" }}>
        <Persona x={540} y={FEET} escala={E} {...JULI} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* por el aire: afuera de la cabeza */}
          <path d={`M${boca.x + 40} ${boca.y} C ${boca.x + 330} ${boca.y + 40}, ${oreja.x + 260} ${oreja.y - 60}, ${oreja.x + 18} ${oreja.y}`}
            fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" strokeDashoffset={-t * 80} opacity={aire} />
          {/* por los huesos: adentro, más grave (ondas largas) */}
          {hueso > 0 && (
            <path d={[...Array(40)].map((_, i) => {
              const f = i / 39;
              const x = interpolate(f, [0, 1], [boca.x, oreja.x - 10]);
              const y = interpolate(f, [0, 1], [boca.y - 10, oreja.y]) + Math.sin(f * Math.PI * (3 - 1.6 * grave) - t * 8) * 14;
              return `${i ? "L" : "M"}${x} ${y}`;
            }).join(" ")} fill="none" stroke={BRAND.azulUI} strokeWidth={12} strokeLinecap="round"
              pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - hueso} style={{ filter: `drop-shadow(0 0 14px ${BRAND.azulUI})` }} />
          )}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - cambio }}>
        <Chip p={aire} style={{ left: 900, top: 420, fontSize: 48 }}>aire</Chip>
        <Chip p={pop(t, w("huesos", "huesos") - 0.1)} style={{ left: 300, top: 420, fontSize: 48, border: `3px solid ${BRAND.azulUI}` }}>huesos</Chip>
        <Chip p={pop(t, w("huesos", "grave") - 0.1)} style={{ left: 300, top: 520, fontSize: 40 }}>más grave</Chip>
      </AbsoluteFill>
      {/* la grabación: así te escuchan los demás */}
      {cambio > 0 && (
        <AbsoluteFill style={{ opacity: cambio }}>
          <Centro y={640}>
            <Telefono w={260} h={480}>
              <AbsoluteFill style={{ background: "#0E1530", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Burbuja w={220} />
              </AbsoluteFill>
            </Telefono>
          </Centro>
          <Arcos x={400} y={640} p={escuchan} lado={-1} />
          <Arcos x={680} y={640} p={escuchan} lado={1} />
          <Persona x={200} y={PISO} escala={0.8} {...MAMA} />
          <Persona x={880} y={PISO} escala={0.8} remera={BRAND.azulMarino} pelo="#1B1B1B" peinado="corto" piel="#D9A47E" fase={2.1} />
        </AbsoluteFill>
      )}
    </Escena>
  );
};

const Cta: React.FC = () => {
  const t = useT();
  const saludo = Math.sin(t * 9) * 22;
  return (
    <Escena id="cta">
      <TarjetaSeguir aparece={w("cta", "Seguinos") - 0.1} cursorDesde={w("cta", "para") - 0.1} toque={w("cta", "tecnología")}
        cursorFin={[w("cta", "todos"), w("cta", "días")]} />
      <Persona x={300} y={1340} escala={0.72} {...JULI} brazoD={130 + saludo} />
    </Escena>
  );
};

// ---------------- Sonido ----------------
const SFX: Sfx[] = [
  ["qr_tick.wav", w("hook", "no"), 0.4],
  ["qr_pop.wav", w("hook", "números"), 0.35],
  ["qr_pop.wav", w("promesa", "grabada") - 0.15, 0.35],
  ["qr_pop.wav", w("juli", "Juli"), 0.35],
  ["qr_tick.wav", w("juli", "micrófono") - 0.1, 0.45],
  ["qr_pop.wav", w("micro", "membrana") - 0.1, 0.3],
  ["qr_pop.wav", w("micro", "electricidad"), 0.35],
  ["qr_pop.wav", w("medir", "miles") - 0.1, 0.35],
  ["qr_pop.wav", w("achica", "silencios") + 0.3, 0.3],
  ["qr_ok.wav", w("achica", "menos"), 0.4],
  ["qr_pop.wav", w("viaja", "internet") - 0.2, 0.3],
  ["qr_ok.wav", w("viaja", "Juli") - 0.1, 0.4],
  ["qr_pop.wav", w("huesos", "huesos") - 0.1, 0.3],
  ["qr_pop.wav", w("huesos", "grave") - 0.1, 0.3],
  ["qr_pop.wav", w("cta", "Seguinos"), 0.3],
  ["qr_tick.wav", w("cta", "tecnología"), 0.5],
];
// tics de cada medida
for (let k = 0; k < 10; k++) SFX.push(["qr_tick.wav", w("medir", "mide") + k * ((w("medir", "señal") + 0.3 - w("medir", "mide")) / 10), 0.15]);

// ---------------- Composición ----------------
export const AudioExplainer: React.FC = () => (
  <Base audio="audio" sfx={SFX}>
    <Hook />
    <Promesa />
    <Juli />
    <Micro />
    <Medir />
    <Achica />
    <Viaja />
    <Huesos />
    <Cta />
  </Base>
);
