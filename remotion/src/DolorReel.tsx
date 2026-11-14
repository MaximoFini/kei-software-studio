import React, { useMemo } from "react";
import { AbsoluteFill, CalculateMetadataFunction } from "remotion";
import { BRAND } from "./KeiCierre";
import { crearExplainer, useT, ramp, pop, hash, easeInOut, Centro, Chip, Check, Telefono, Persona, TarjetaSeguir, Sfx } from "./explainerKit";
import ejemplo from "./dolorEjemplo.json";

// Reel de "dolor del cliente" armado 100% desde datos, para generarlo sin tocar código (scripts/reel_diario.py).
// Las props traen el título, la voz con tiempos por palabra (scripts/explainer.py) y, por escena, un "visual"
// de un catálogo fijo (gancho, persona, caos, contador, lista, frase, antesDespues, notificaciones, solucion, cta).
// Los elementos de cada escena aparecen repartidos mientras habla la voz, o en la palabra que diga "palabra".
// El formato del guion está en scripts/reel_diario/FORMATO.md.

export const ROJO = "#FF5A6A";

type Palabra = { w: string; s: number; e: number };
export type VozData = { voz?: string; rate?: string; dur?: number; escenas: { id: string; texto: string; s: number; e: number; palabras: Palabra[] }[] };
type Item = { icono?: string; texto?: string; valor?: string; de?: string; palabra?: string };
type Visual = {
  tipo: string;
  icono?: string;
  etiqueta?: string;
  efecto?: "sacudir" | "pulso" | "alerta";
  animo?: "estresado" | "feliz" | "neutro";
  persona?: { remera?: string; pelo?: string; peinado?: "largo" | "corto" };
  items?: Item[];
  final?: string;
  hasta?: number;
  prefijo?: string;
  sufijo?: string;
  color?: "rojo" | "azul";
  marca?: "cruz" | "check";
  texto?: string;
  destacar?: string[];
  antes?: { titulo: string; items: Item[]; palabra?: string };
  despues?: { titulo: string; items: Item[]; palabra?: string };
  app?: string;
  palabra?: string;
  semanas?: number;
  dias?: string[];
  patron?: number[];
  corte?: number;
  alerta?: string;
};
export type DolorProps = { titulo: string; audio: string; voz: VozData; escenas: { id: string; visual: Visual }[] };

// ---------------- Íconos (trazo, viewBox 24) ----------------
const ICONOS: Record<string, React.ReactNode> = {
  reloj: <><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3.5 2" /></>,
  dinero: <><rect x={2.5} y={6} width={19} height={12} rx={2} /><circle cx={12} cy={12} r={2.8} /><path d="M6 9.5v5M18 9.5v5" /></>,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  planilla: <><rect x={4} y={3} width={16} height={18} rx={2} /><path d="M4 9h16M4 15h16M10 3v18" /></>,
  papel: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  alerta: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></>,
  calendario: <><rect x={3.5} y={5} width={17} height={16} rx={2} /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  mail: <><rect x={3} y={5} width={18} height={14} rx={2} /><path d="M3.5 6l8.5 7 8.5-7" /></>,
  carrito: <><path d="M3 4h2.5l2.2 11h10.5L20.5 8H7" /><circle cx={9.5} cy={19} r={1.5} /><circle cx={17} cy={19} r={1.5} /></>,
  grafico: <><path d="M4 20V4M4 20h16" /><path d="M7 15l4-4 3 3 5-6" /></>,
  caida: <><path d="M4 20V4M4 20h16" /><path d="M7 8l4 4 3-3 5 6" /></>,
  usuario: <><circle cx={12} cy={8} r={4} /><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5" /></>,
  clientes: <><circle cx={9} cy={8} r={3.5} /><path d="M2.5 20c.8-4 3.5-5.5 6.5-5.5s5.7 1.5 6.5 5.5" /><path d="M15.5 4.8a3.5 3.5 0 010 6.4M17.5 14.8c2 .7 3.4 2.3 4 5.2" /></>,
  telefono: <><rect x={6.5} y={2.5} width={11} height={19} rx={2.5} /><path d="M10.5 18.5h3" /></>,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  cruz: <path d="M6 6l12 12M18 6L6 18" />,
  caja: <><path d="M3 7.5l9-4.5 9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5l9 4.5 9-4.5M12 12v9" /></>,
  candado: <><rect x={5} y={10.5} width={14} height={10} rx={2} /><path d="M8 10.5V7a4 4 0 018 0v3.5" /></>,
  estrella: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z" />,
  fuego: <path d="M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.5-5.5 3.5-9.5 3 1.5 4 4 4 6 1-1 1.5-2.5 1.5-3.5 2 1.5 4 4 4 7 0 3.4-2.5 6-6.5 6z" />,
  lupa: <><circle cx={10.5} cy={10.5} r={6.5} /><path d="M15.5 15.5L21 21" /></>,
  engranaje: <><circle cx={12} cy={12} r={3} /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></>,
  rayo: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  web: <><circle cx={12} cy={12} r={9} /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></>,
  camion: <><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7" /><circle cx={6.5} cy={17.5} r={1.8} /><circle cx={16.5} cy={17.5} r={1.8} /></>,
  campana: <><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 004 0" /></>,
  pregunta: <><circle cx={12} cy={12} r={9} /><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17v.5" /></>,
};
export const ICONOS_DISPONIBLES = Object.keys(ICONOS);

const Ico: React.FC<{ n?: string; size: number; color?: string; grosor?: number }> = ({ n = "alerta", size, color = "#fff", grosor = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {ICONOS[n] ?? ICONOS.alerta}
  </svg>
);

const Tarjeta: React.FC<{ n?: string; size: number; tono?: "rojo" | "azul"; glow?: number }> = ({ n, size, tono = "azul", glow = 0 }) => {
  const c = tono === "rojo" ? ROJO : BRAND.azulUI;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(150deg, ${BRAND.azulMarino}, #0B1230)`,
      border: `${Math.max(3, size * 0.02)}px solid ${c}AA`, boxShadow: `0 ${size * 0.08}px ${size * 0.25}px rgba(0,0,0,.5), 0 0 ${20 + 60 * glow}px ${c}${glow > 0 ? "aa" : "44"}`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ico n={n} size={size * 0.56} color={tono === "rojo" ? "#FFD3D8" : "#fff"} />
    </div>
  );
};

const Badge: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties; color?: string }> = ({ p, children, style, color = ROJO }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", minWidth: 64, height: 64, padding: "0 16px", borderRadius: 32, background: color, color: "#fff",
      fontFamily: "Montserrat", fontWeight: 700, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center",
      transform: `scale(${p})`, boxShadow: `0 6px 20px ${color}88`, ...style }}>
      {children}
    </div>
  );

const Cruz: React.FC<{ p: number; size?: number; style?: React.CSSProperties }> = ({ p, size = 120, style }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", width: size, height: size, borderRadius: "50%", background: ROJO, boxShadow: `0 0 50px ${ROJO}aa`,
      display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p})`, ...style }}>
      <Ico n="cruz" size={size * 0.5} grosor={3.2} />
    </div>
  );

const texto = { fontFamily: "'Glacial Indifference'", fontWeight: 700, color: "#fff" } as const;
const ui = { fontFamily: "Montserrat" } as const;

// ---------------- Tiempos de cada escena ----------------
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

const crearKit = (props: DolorProps) => {
  const base = crearExplainer(props.voz, props.titulo);
  const { ESC, desde, hasta } = base;
  // Segundo en que se dice una palabra de la escena (sin tildes ni mayúsculas); undefined si no está
  const en = (id: string, palabra?: string) => {
    if (!palabra) return undefined;
    const q = norm(palabra);
    const ps = ESC[id].palabras;
    return (ps.find((p) => norm(p.w) === q) ?? ps.find((p) => norm(p.w).startsWith(q)))?.s;
  };
  // Momentos de aparición: en su palabra, o repartidos mientras habla la voz en esa escena
  const tiempos = (id: string, items: { palabra?: string }[], ini?: number, fin?: number) => {
    const a = ini ?? Math.max(desde(id) + 0.2, ESC[id].s);
    const b = Math.max(a + 0.2, fin ?? Math.min(ESC[id].s + 0.7 * (ESC[id].e - ESC[id].s), hasta(id) - 0.9));
    return items.map((it, i) => en(id, it.palabra) ?? (items.length === 1 ? a : a + ((b - a) * i) / (items.length - 1)));
  };
  return { ...base, en, tiempos };
};
type Kit = ReturnType<typeof crearKit>;
type EscProps = { id: string; v: Visual; k: Kit };

// ---------------- Escenas ----------------
const Gancho: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const a = k.desde(id) + 0.05;
  const p = pop(t, a, 11);
  const et = pop(t, k.en(id, v.palabra) ?? a + 0.45, 13);
  const rojo = v.efecto === "alerta" || v.efecto === "sacudir";
  const sac = v.efecto === "sacudir" ? Math.sin(t * 38) * 5 * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.7))) : 0;
  const pulso = v.efecto === "pulso" ? 1 + 0.04 * Math.sin(t * 5) : 1;
  const alerta = v.efecto === "alerta" ? pop(t, a + 0.55, 9) : 0;
  return (
    <k.Escena id={id}>
      {[0, 1, 2].map((i) => {
        const f = ((t - a) * 0.6 + i / 3) % 1;
        return p > 0.5 && (
          <div key={i} style={{ position: "absolute", left: 540, top: 760, width: 360, height: 360, borderRadius: "50%",
            transform: `translate(-50%,-50%) scale(${1 + f * 1.6})`, border: `4px solid ${rojo ? ROJO : BRAND.azulUI}`, opacity: (1 - f) * 0.35 }} />
        );
      })}
      <Centro y={760} style={{ transform: `translate(-50%,-50%) scale(${p * pulso}) rotate(${sac}deg)` }}>
        <Tarjeta n={v.icono} size={380} tono={rojo ? "rojo" : "azul"} glow={0.5 + 0.5 * Math.sin(t * 4)} />
      </Centro>
      <Badge p={alerta} style={{ left: 540 + 150, top: 760 - 230, width: 110, height: 110, borderRadius: 55, fontSize: 70 }}>!</Badge>
      {v.etiqueta && <Chip p={et} style={{ left: 540, top: 1090, fontSize: 54, padding: "18px 40px" }}>{v.etiqueta}</Chip>}
    </k.Escena>
  );
};

const SLOTS: [number, number][] = [[190, 560], [890, 560], [150, 860], [930, 860], [540, 430], [220, 1140], [860, 1140]];

const PersonaEsc: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const animo = v.animo ?? "estresado";
  const items = v.items ?? [];
  const ts = k.tiempos(id, items);
  const et = pop(t, k.desde(id) + 0.15, 13);
  const estres = animo === "estresado" ? ramp(t, k.desde(id), k.desde(id) + 0.8) : 0;
  const feliz = animo === "feliz" ? ramp(t, k.desde(id) + 0.2, k.desde(id) + 0.7) : 0;
  const wob = Math.sin(t * 9) * 10 * estres;
  const check = animo === "feliz" ? pop(t, k.tiempos(id, [{}])[0] + 0.6, 10) : 0;
  return (
    <k.Escena id={id}>
      <AbsoluteFill style={{ transform: `translateX(${Math.sin(t * 31) * 4 * estres}px)` }}>
        <Persona x={540} y={1340} escala={1.3} remera={v.persona?.remera ?? BRAND.azulUI} pelo={v.persona?.pelo ?? "#2B1A10"}
          peinado={v.persona?.peinado ?? "largo"} pantalon="#0B1230" fase={0.3}
          brazoD={animo === "estresado" ? 158 + wob * 0.5 : animo === "feliz" ? 20 + 110 * feliz : 10}
          brazoI={animo === "estresado" ? 158 - wob * 0.5 : 10} celular={animo === "neutro" ? 1 : 0} dientes={feliz} triste={animo === "estresado"} />
      </AbsoluteFill>
      {/* gotas de sudor */}
      {estres > 0 && [0, 1].map((i) => {
        const f = ((t * 0.9 + i * 0.5) % 1);
        return (
          <div key={i} style={{ position: "absolute", left: i ? 650 : 418, top: 620 + f * 120, width: 22, height: 30, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: BRAND.azulHielo, opacity: Math.sin(f * Math.PI) * estres }} />
        );
      })}
      {items.map((it, i) => {
        const [x, y] = SLOTS[i % SLOTS.length];
        const p = pop(t, ts[i], 11);
        const fl = Math.sin(t * 2.2 + i) * 10;
        return (
          <Centro key={i} x={x} y={y + fl} style={{ transform: `translate(-50%,-50%) scale(${p})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <Tarjeta n={it.icono} size={150} tono={animo === "feliz" ? "azul" : "rojo"} />
              {it.valor && <Badge p={1} style={{ right: -24, top: -24 }} color={animo === "feliz" ? BRAND.azulUI : ROJO}>{it.valor}</Badge>}
            </div>
            {it.texto && <div style={{ ...texto, fontSize: 36, whiteSpace: "nowrap", textShadow: `0 3px 10px ${BRAND.fondoOscuro}` }}>{it.texto}</div>}
          </Centro>
        );
      })}
      {v.etiqueta && <Chip p={et * (1 - ramp(t, k.hasta(id) - 0.2, k.hasta(id)))} style={{ left: 540, top: 420 }}>{v.etiqueta}</Chip>}
      <Check p={check} size={130} style={{ left: 540 + 190, top: 640 }} />
    </k.Escena>
  );
};

const Caos: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const items = v.items ?? [];
  const ts = k.tiempos(id, items);
  const ultimo = ts[ts.length - 1] ?? k.desde(id);
  const fin = v.final ? pop(t, ultimo + 0.7, 9) : 0;
  const temb = ramp(t, ultimo, ultimo + 0.6);
  return (
    <k.Escena id={id}>
      {items.map((it, i) => {
        const p = pop(t, ts[i], 12);
        const x = 300 + hash(i, 1) * 480;
        const y = 470 + (i / Math.max(1, items.length - 1)) * 720 + (hash(i, 2) - 0.5) * 60;
        const rot = (hash(i, 3) - 0.5) * 22 + Math.sin(t * 24 + i) * 2.5 * temb;
        return (
          <Centro key={i} x={x} y={y} style={{ transform: `translate(-50%,-50%) translateY(${(1 - p) * -200}px) rotate(${rot}deg) scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 2) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 34px 22px 22px", borderRadius: 28, background: "#fff",
              boxShadow: "0 18px 40px rgba(0,0,0,.45)", whiteSpace: "nowrap" }}>
              <div style={{ width: 84, height: 84, borderRadius: 22, background: BRAND.azulMarino, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n={it.icono} size={52} />
              </div>
              <div style={{ ...ui, fontWeight: 700, fontSize: 40, color: BRAND.fondoOscuro }}>{it.texto}</div>
            </div>
          </Centro>
        );
      })}
      {v.final === "cruz" ? <Cruz p={fin} size={220} style={{ left: 540 - 110, top: 830 - 110 }} />
        : v.final && fin > 0 && (
          <Centro y={830} style={{ transform: `translate(-50%,-50%) scale(${fin})` }}>
            <Tarjeta n={v.final} size={240} tono="rojo" glow={1} />
          </Centro>
        )}
    </k.Escena>
  );
};

const Contador: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const a = k.en(id, v.palabra) ?? k.tiempos(id, [{}])[0];
  const p = pop(t, a - 0.2, 12);
  const c = ramp(t, a, a + 1.3, easeInOut);
  const col = v.color === "azul" ? BRAND.azulUI : ROJO;
  const n = Math.round((v.hasta ?? 0) * c);
  const R = 300;
  return (
    <k.Escena id={id}>
      <Centro y={800} style={{ transform: `translate(-50%,-50%) scale(${p})` }}>
        <svg width={2 * R + 60} height={2 * R + 60} viewBox={`${-R - 30} ${-R - 30} ${2 * R + 60} ${2 * R + 60}`}>
          <circle r={R} fill={`${BRAND.azulMarino}AA`} stroke={`${col}33`} strokeWidth={26} />
          <circle r={R} fill="none" stroke={col} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1"
            strokeDashoffset={1 - c} transform="rotate(-90)" style={{ filter: `drop-shadow(0 0 18px ${col})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {v.icono && <Ico n={v.icono} size={90} color={col} />}
          <div style={{ ...texto, fontSize: 170, lineHeight: 1 }}>{v.prefijo ?? ""}{n.toLocaleString("es-AR")}{v.sufijo ?? ""}</div>
        </div>
      </Centro>
      {v.etiqueta && <Chip p={pop(t, a + 0.8, 13)} style={{ left: 540, top: 1230, fontSize: 50 }}>{v.etiqueta}</Chip>}
    </k.Escena>
  );
};

const Lista: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const items = v.items ?? [];
  const ts = k.tiempos(id, items);
  const cruz = (v.marca ?? "cruz") === "cruz";
  const alto = 150, gap = 26;
  const y0 = 820 - ((items.length - 1) * (alto + gap)) / 2;
  return (
    <k.Escena id={id}>
      {v.etiqueta && <Chip p={pop(t, k.desde(id) + 0.1, 13)} style={{ left: 540, top: y0 - 150 }}>{v.etiqueta}</Chip>}
      {items.map((it, i) => {
        const p = pop(t, ts[i], 13);
        const m = pop(t, ts[i] + 0.35, 9);
        return (
          <div key={i} style={{ position: "absolute", left: 110, right: 110, top: y0 + i * (alto + gap) - alto / 2, height: alto, borderRadius: 34,
            background: `${BRAND.azulMarino}EE`, border: `2px solid ${(cruz ? ROJO : BRAND.azulUI)}66`, display: "flex", alignItems: "center", gap: 28,
            padding: "0 36px", transform: `translateX(${(1 - p) * 120}px)`, opacity: Math.min(1, p * 2) }}>
            {it.icono && <Ico n={it.icono} size={64} />}
            <div style={{ ...texto, fontSize: 48, flex: 1 }}>{it.texto}</div>
            <div style={{ width: 84, height: 84, position: "relative" }}>
              {cruz ? <Cruz p={m} size={84} /> : <Check p={m} size={84} />}
            </div>
          </div>
        );
      })}
    </k.Escena>
  );
};

// Frase grande (lo que dice el cliente, la excusa típica), con palabras destacadas
const Frase: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const a = k.desde(id) + 0.1;
  const p = pop(t, a, 13);
  const palabras = (v.texto ?? "").split(" ");
  const dest = (v.destacar ?? []).map(norm);
  const esc = ramp(t, a + 0.15, a + 0.15 + 0.07 * palabras.length, (x) => x);
  return (
    <k.Escena id={id}>
      <Centro y={800} style={{ transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 2), width: 860 }}>
        <div style={{ position: "relative", padding: "70px 60px", borderRadius: 50, background: "#fff", boxShadow: `0 30px 80px rgba(0,0,0,.5)` }}>
          <div style={{ position: "absolute", left: 40, top: -70, ...texto, fontSize: 220, color: v.color === "azul" ? BRAND.azulUI : ROJO, lineHeight: 1 }}>“</div>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, ...ui, fontWeight: 700, fontSize: 64, lineHeight: 1.2, color: BRAND.fondoOscuro }}>
            {palabras.map((pw, i) => (
              <span key={i} style={{ opacity: esc * palabras.length > i ? 1 : 0.08, color: dest.includes(norm(pw)) ? (v.color === "azul" ? BRAND.azulUI : ROJO) : undefined }}>{pw}</span>
            ))}
          </div>
          {v.etiqueta && <div style={{ ...ui, fontWeight: 500, fontSize: 36, color: "#5A6386", marginTop: 26 }}>— {v.etiqueta}</div>}
        </div>
      </Centro>
    </k.Escena>
  );
};

const AntesDespues: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const ini = k.tiempos(id, [{}])[0];
  const corte = k.en(id, v.despues?.palabra) ?? (k.ESC[id].s + k.ESC[id].e) / 2;
  const panel = (lado: "antes" | "despues", y: number, a: number, b: number) => {
    const d = v[lado];
    if (!d) return null;
    const rojo = lado === "antes";
    const items = d.items ?? [];
    const ts = k.tiempos(id, items, a + 0.3, b);
    const p = pop(t, a, 13);
    return (
      <div style={{ position: "absolute", left: 90, right: 90, top: y, height: 430, borderRadius: 44, padding: "34px 44px",
        background: rojo ? "#2A0F1A" : `${BRAND.azulMarino}F2`, border: `3px solid ${rojo ? ROJO : BRAND.azulUI}88`,
        transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 2) }}>
        <div style={{ ...texto, fontSize: 52, color: rojo ? ROJO : BRAND.azulUI, marginBottom: 22 }}>{d.titulo}</div>
        {items.map((it, i) => {
          const q = pop(t, ts[i], 13);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, height: 92, opacity: Math.min(1, q * 2), transform: `translateX(${(1 - q) * 60}px)` }}>
              <Ico n={it.icono ?? (rojo ? "cruz" : "check")} size={54} color={rojo ? "#FFD3D8" : "#fff"} />
              <div style={{ ...texto, fontSize: 44 }}>{it.texto}</div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <k.Escena id={id}>
      {panel("antes", 400, k.en(id, v.antes?.palabra) ?? ini, corte - 0.4)}
      {panel("despues", 890, corte, k.ESC[id].e - 0.3)}
    </k.Escena>
  );
};

const Notificaciones: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const items = v.items ?? [];
  const ts = k.tiempos(id, items);
  const p = pop(t, k.desde(id), 14);
  const llegadas = ts.filter((x) => t >= x).length;
  const ultima = ts[llegadas - 1] ?? -10;
  const vib = t - ultima < 0.3 ? Math.sin(t * 90) * 6 * (1 - (t - ultima) / 0.3) : 0;
  return (
    <k.Escena id={id}>
      <Centro y={860} style={{ transform: `translate(-50%,-50%) scale(${p}) rotate(${vib * 0.4}deg) translateX(${vib}px)` }}>
        <Telefono w={560} h={960}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${BRAND.azulMarino}, #070B1C)` }} />
          <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", ...ui, fontWeight: 500, fontSize: 96, color: "#fff" }}>
            {v.etiqueta ?? "23:47"}
          </div>
          {items.map((it, i) => {
            const q = pop(t, ts[i], 14);
            const encima = Math.max(0, llegadas - 1 - i); // cuántas llegaron después
            const y = 260 + encima * 156;
            return q > 0 && y < 900 && (
              <div key={i} style={{ position: "absolute", left: 22, right: 22, top: y, height: 140, borderRadius: 28, background: "#ffffffF0",
                padding: "18px 22px", display: "flex", gap: 18, transform: `translateY(${(1 - q) * -60}px) scale(${0.9 + 0.1 * q})`, opacity: Math.min(1, q * 2) * (1 - encima * 0.12) }}>
                <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 18, background: it.icono === "mail" ? BRAND.azulUI : "#25A55F",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico n={it.icono ?? "chat"} size={40} />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ ...ui, fontWeight: 700, fontSize: 28, color: BRAND.fondoOscuro }}>{it.de ?? "Cliente"}</div>
                  <div style={{ ...ui, fontWeight: 500, fontSize: 27, lineHeight: 1.15, color: "#3A4466", width: 400, display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.texto}</div>
                </div>
              </div>
            );
          })}
        </Telefono>
        <Badge p={llegadas > 0 ? pop(t, ts[0], 10) : 0} style={{ right: -30, top: -30, width: 100, height: 100, borderRadius: 50, fontSize: 50 }}>{llegadas}</Badge>
      </Centro>
    </k.Escena>
  );
};

const Solucion: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const items = v.items ?? [];
  const ts = k.tiempos(id, items);
  const p = pop(t, k.desde(id), 14);
  const ok = pop(t, (ts[ts.length - 1] ?? k.desde(id)) + 0.6, 10);
  return (
    <k.Escena id={id}>
      <Centro y={860} style={{ transform: `translate(-50%,-50%) scale(${p})` }}>
        <Telefono w={560} h={960}>
          <div style={{ position: "absolute", inset: 0, background: BRAND.fondoClaro }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 190, background: BRAND.azulUI, display: "flex", alignItems: "flex-end",
            padding: "0 34px 30px", ...ui, fontWeight: 700, fontSize: 44, color: "#fff" }}>
            {v.app ?? "Tu sistema"}
          </div>
          {items.map((it, i) => {
            const q = pop(t, ts[i], 13);
            return (
              <div key={i} style={{ position: "absolute", left: 26, right: 26, top: 220 + i * 140, height: 118, borderRadius: 26, background: "#fff",
                boxShadow: "0 6px 18px rgba(22,32,94,.12)", display: "flex", alignItems: "center", gap: 20, padding: "0 24px",
                transform: `translateX(${(1 - q) * 80}px)`, opacity: Math.min(1, q * 2) }}>
                <div style={{ width: 70, height: 70, borderRadius: 20, background: BRAND.azulHielo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico n={it.icono ?? "check"} size={42} color={BRAND.azulUI} grosor={2.2} />
                </div>
                <div style={{ ...ui, fontWeight: 700, fontSize: 30, color: BRAND.fondoOscuro, flex: 1 }}>{it.texto}</div>
                {it.valor && <div style={{ ...ui, fontWeight: 700, fontSize: 30, color: BRAND.azulUI }}>{it.valor}</div>}
              </div>
            );
          })}
        </Telefono>
        <Check p={ok} size={150} style={{ right: -50, bottom: 90 }} />
      </Centro>
    </k.Escena>
  );
};

// Asistencia de un socio: semanas (filas) x días (columnas). Viene en los días de "patron" hasta la semana
// "corte"; desde ahí los días quedan vacíos en rojo y salta la alerta (detección de inactividad).
const Asistencia: React.FC<EscProps> = ({ id, v, k }) => {
  const t = useT();
  const dias = v.dias ?? ["L", "M", "X", "J", "V", "S"];
  const semanas = v.semanas ?? 4;
  const corte = v.corte ?? semanas - 1;
  const patron = v.patron ?? [0, 2, 4];
  const ini = k.tiempos(id, [{}])[0];
  const finIda = k.en(id, v.palabra) ?? ini + (k.ESC[id].e - ini) * 0.55;
  const p = pop(t, k.desde(id), 14);
  const celda = 118, gap = 18;
  const W = dias.length * celda + (dias.length - 1) * gap;
  const alerta = pop(t, finIda + 0.5, 9);
  const total = semanas * dias.length;
  return (
    <k.Escena id={id}>
      <Centro y={790} style={{ transform: `translate(-50%,-50%) scale(${p})`, width: W + 80, padding: 40, borderRadius: 44,
        background: `${BRAND.azulMarino}EE`, border: `2px solid ${BRAND.azulUI}66` }}>
        {v.etiqueta && <div style={{ ...texto, fontSize: 46, marginBottom: 26 }}>{v.etiqueta}</div>}
        <div style={{ display: "flex", gap, marginBottom: 14 }}>
          {dias.map((d) => <div key={d} style={{ width: celda, textAlign: "center", ...ui, fontWeight: 700, fontSize: 34, color: BRAND.azulHielo }}>{d}</div>)}
        </div>
        {[...Array(semanas)].map((_, s) => (
          <div key={s} style={{ display: "flex", gap, marginBottom: gap }}>
            {dias.map((_, d) => {
              const i = s * dias.length + d;
              const at = ini + ((finIda - ini) * i) / total;
              const q = ramp(t, at, at + 0.25);
              const vino = s < corte && patron.includes(d);
              const falta = s >= corte && patron.includes(d);
              return (
                <div key={d} style={{ width: celda, height: celda * 0.8, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  background: vino ? BRAND.azulUI : "#0B1230", border: `3px solid ${falta ? ROJO : vino ? BRAND.azulUI : "#2A3566"}`,
                  opacity: 0.25 + 0.75 * q, transform: `scale(${0.85 + 0.15 * q})`, boxShadow: vino && q > 0.5 ? `0 0 18px ${BRAND.azulUI}88` : undefined }}>
                  {vino && q > 0.5 && <Ico n="check" size={52} grosor={3} />}
                  {falta && q > 0.5 && <Ico n="cruz" size={44} color={ROJO} grosor={3} />}
                </div>
              );
            })}
          </div>
        ))}
      </Centro>
      {v.alerta && <Chip p={alerta} style={{ left: 540, top: 1260, fontSize: 52, background: `${ROJO}EE`, border: `2px solid #fff6` }}>
        <Ico n="alerta" size={50} grosor={2.4} />{v.alerta}
      </Chip>}
    </k.Escena>
  );
};

const Cta: React.FC<EscProps> = ({ id, k }) => {
  const a = k.desde(id) + 0.1;
  return (
    <k.Escena id={id}>
      <TarjetaSeguir aparece={a} cursorDesde={a + 0.5} toque={a + 1.3} cursorFin={[a + 1.7, a + 2.1]} />
    </k.Escena>
  );
};

export const ESCENAS: Record<string, React.FC<EscProps>> = {
  gancho: Gancho, persona: PersonaEsc, caos: Caos, contador: Contador, lista: Lista, frase: Frase,
  antesDespues: AntesDespues, notificaciones: Notificaciones, solucion: Solucion, cta: Cta, asistencia: Asistencia,
};

// Efectos: un "pop" suave por cada elemento que aparece y un "ok" en los checks
const efectos = (props: DolorProps, k: Kit): Sfx[] => {
  const out: Sfx[] = [];
  for (const { id, visual: v } of props.escenas) {
    if (!k.ESC[id]) continue;
    if (v.items?.length && v.tipo !== "antesDespues") k.tiempos(id, v.items).forEach((s) => out.push(["qr_pop.wav", s, 0.25]));
    if (v.tipo === "gancho") out.push(["qr_pop.wav", k.desde(id) + 0.05, 0.4]);
    if (v.tipo === "asistencia" && v.alerta) {
      const ini = k.tiempos(id, [{}])[0];
      out.push(["qr_pop.wav", (k.en(id, v.palabra) ?? ini + (k.ESC[id].e - ini) * 0.55) + 0.5, 0.5]);
    }
    if (v.tipo === "solucion" && v.items?.length) out.push(["qr_ok.wav", k.tiempos(id, v.items).slice(-1)[0] + 0.6, 0.5]);
  }
  return out;
};

export const DolorReel: React.FC<DolorProps> = (props) => {
  const k = useMemo(() => crearKit(props), [props]);
  const sfx = useMemo(() => efectos(props, k), [props, k]);
  return (
    <k.Base audio={props.audio} sfx={sfx}>
      {props.escenas.map(({ id, visual }) => {
        const C = ESCENAS[visual.tipo];
        return C && k.ESC[id] ? <C key={id} id={id} v={visual} k={k} /> : null;
      })}
    </k.Base>
  );
};

export const dolorDefaults = ejemplo as unknown as DolorProps;
export const calculateDolorMetadata: CalculateMetadataFunction<DolorProps> = ({ props }) => ({
  durationInFrames: crearExplainer(props.voz, props.titulo).TOTAL,
});
