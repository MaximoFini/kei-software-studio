import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { BRAND } from "./KeiCierre";
import {
  crearExplainer, useT, ramp, pop, hash, clamp, easeInOut, Centro, Chip, Check, Telefono, Persona, TarjetaSeguir, Sfx,
} from "./explainerKit";
import voz from "./btVoz.json";

// Reel explicativo "¿Cómo funciona el Bluetooth?" (guion en scripts/guiones/bt.json, voz y música con
// scripts/explainer.py). Gancho: el nombre viene de un rey vikingo con un diente azul y el logo esconde un
// secreto (sus iniciales en runas), que se revela al final para sostener la retención.

const { w, desde, TOTAL, Escena, Base } = crearExplainer(voz, "¿Cómo funciona el Bluetooth?");
export const BT_TOTAL = TOTAL;

const REY = { fase: 0.5, remera: "#2A44C9", pelo: "#C0592B", barba: "#A9461F", peinado: "corto" as const, corona: true, capa: BRAND.azulMarino };
const MATEO = { remera: BRAND.azulUI, pelo: "#2B1A10", peinado: "corto" as const, pantalon: "#0B1230" };

// ---------------- Íconos ----------------
// Logo de Bluetooth: runa ᚼ (H) + runa ᛒ (B) superpuestas, en blanco sobre óvalo azul
const BT_PATH = "M6.5 6.5 L17.5 17.5 L12 23 V1 L17.5 6.5 L6.5 17.5";
const LogoBT: React.FC<{ size: number; p?: number; glow?: number }> = ({ size, p = 1, glow = 0 }) => (
  <div style={{ width: size * 0.7, height: size, borderRadius: size * 0.35, background: BRAND.azulUI, display: "flex",
    alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 + 60 * glow}px ${BRAND.azulUI}${glow > 0 ? "cc" : "88"}` }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <path d={BT_PATH} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  </div>
);

const Nota: React.FC<{ x: number; y: number; s?: number; o?: number; color?: string }> = ({ x, y, s = 1, o = 1, color = "#fff" }) => (
  <svg width={60 * s} height={70 * s} viewBox="0 0 24 28" style={{ position: "absolute", left: x - 30 * s, top: y - 35 * s, opacity: o }}>
    <path d="M9 21V5l12-3v15" fill="none" stroke={color} strokeWidth={2.6} strokeLinejoin="round" />
    <ellipse cx={6} cy={21} rx={4} ry={3.2} fill={color} />
    <ellipse cx={18} cy={18} rx={4} ry={3.2} fill={color} />
  </svg>
);

// Celular chico (ícono) y par de auriculares inalámbricos
const CelularIcono: React.FC<{ s?: number; glow?: number }> = ({ s = 1, glow = 0 }) => (
  <div style={{ width: 150 * s, height: 280 * s, borderRadius: 30 * s, background: "#0B1020", border: `${8 * s}px solid #3A4466`,
    boxShadow: `0 0 ${50 * glow}px ${BRAND.azulUI}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: "70%", height: "60%", borderRadius: 14 * s, background: `linear-gradient(160deg, ${BRAND.azulUI}, ${BRAND.azulMarino})`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={60 * s} height={60 * s} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff" /></svg>
    </div>
  </div>
);
const Auriculares: React.FC<{ s?: number; glow?: number }> = ({ s = 1, glow = 0 }) => (
  <svg width={260 * s} height={190 * s} viewBox="0 0 260 190" style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${30 * glow}px ${BRAND.azulUI})` : undefined }}>
    {[50, 210].map((cx, i) => (
      <g key={cx} transform={`translate(${cx} 70) scale(${i ? -1 : 1} 1)`}>
        <ellipse cx={0} cy={0} rx={46} ry={40} fill="#fff" />
        <rect x={10} y={10} width={26} height={100} rx={13} fill="#fff" />
        <ellipse cx={-8} cy={-4} rx={18} ry={14} fill={BRAND.azulHielo} />
        <circle cx={23} cy={104} r={5} fill={BRAND.azulUI} opacity={0.4 + 0.6 * glow} />
      </g>
    ))}
  </svg>
);

const Bandera: React.FC<{ pais: "dk" | "no"; w?: number }> = ({ pais, w: W = 96 }) => (
  <svg width={W} height={W * 0.72} viewBox="0 0 37 27" style={{ borderRadius: 6 }}>
    <rect width={37} height={27} fill="#C8102E" />
    {pais === "dk" ? (
      <>
        <rect x={12} width={4} height={27} fill="#fff" />
        <rect y={11.5} width={37} height={4} fill="#fff" />
      </>
    ) : (
      <>
        <rect x={10} width={8} height={27} fill="#fff" />
        <rect y={9.5} width={37} height={8} fill="#fff" />
        <rect x={12} width={4} height={27} fill="#00205B" />
        <rect y={11.5} width={37} height={4} fill="#00205B" />
      </>
    )}
  </svg>
);

const Destello: React.FC<{ x: number; y: number; p: number; size?: number }> = ({ x, y, p, size = 160 }) =>
  p <= 0 ? null : (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ position: "absolute", left: x - size / 2, top: y - size / 2,
      transform: `scale(${p}) rotate(${p * 45}deg)`, opacity: Math.min(1, 2 - p * 1.1) }}>
      <path d="M0 -12 Q1.6 -1.6 12 0 Q1.6 1.6 0 12 Q-1.6 1.6 -12 0 Q-1.6 -1.6 0 -12 Z" fill="#fff" />
    </svg>
  );

// ---------------- Escenas ----------------
const PISO = 1330;

const Hook: React.FC = () => {
  const t = useT();
  const logo = pop(t, w("hook", "Bluetooth"), 11);
  const dientes = ramp(t, w("hook", "diente") - 0.1, w("hook", "diente") + 0.15);
  const brillo = pop(t, w("hook", "azul"), 8);
  const respira = 1 + 0.015 * Math.sin(t * 3);
  return (
    <Escena id="hook">
      <AbsoluteFill style={{ transform: `scale(${respira})`, transformOrigin: "50% 60%" }}>
        <Persona x={540} y={PISO} escala={1.45} {...REY} brazoD={20 + 40 * logo} dientes={dientes * (0.5 + 0.5 * brillo)} />
      </AbsoluteFill>
      <Destello x={585} y={672} p={brillo} size={90} />
      <Centro x={860} y={560} style={{ transform: `translate(-50%,-50%) scale(${logo})` }}>
        <LogoBT size={170} p={ramp(t, w("hook", "Bluetooth"), w("hook", "Bluetooth") + 0.5)} />
      </Centro>
    </Escena>
  );
};

const Secreto: React.FC = () => {
  const t = useT();
  const logoIn = ramp(t, desde("secreto"), w("secreto", "logo") + 0.2);
  const candado = pop(t, w("secreto", "secreto"), 10);
  const logoOut = ramp(t, w("secreto", "Pero") - 0.1, w("secreto", "primero") + 0.2, easeInOut);
  const cel = pop(t, w("secreto", "música") - 0.2, 13);
  const aur = pop(t, w("secreto", "auriculares") - 0.1, 13);
  const cable = ramp(t, w("secreto", "auriculares") + 0.3, w("secreto", "sin") - 0.05);
  const corte = ramp(t, w("secreto", "cables") - 0.1, w("secreto", "cables") + 0.5, Easing.in(Easing.quad));
  return (
    <Escena id="secreto">
      {logoOut < 1 && (
        <Centro y={interpolate(logoIn, [0, 1], [560, 720])}
          style={{ transform: `translate(-50%,-50%) scale(${interpolate(logoIn, [0, 1], [0.6, 1.5]) * (1 - logoOut)})`, opacity: 1 - logoOut }}>
          <div style={{ position: "relative" }}>
            <LogoBT size={300} glow={0.5 + 0.5 * Math.sin(t * 5)} />
            <div style={{ position: "absolute", right: -70, bottom: -40, width: 120, height: 120, borderRadius: "50%", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${candado})`,
              fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 90, color: BRAND.azulUI, boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
              ?
            </div>
          </div>
        </Centro>
      )}
      {/* música del celular a los auriculares, sin cables */}
      <Centro x={290} y={830} style={{ transform: `translate(-50%,-50%) scale(${cel})` }}>
        <CelularIcono />
      </Centro>
      <Centro x={790} y={800} style={{ transform: `translate(-50%,-50%) scale(${aur})` }}>
        <Auriculares s={1.1} />
      </Centro>
      {cel > 0.5 && [0, 1, 2].map((k) => {
        const f = ((t * 0.9 + k / 3) % 1);
        return <Nota key={k} x={interpolate(f, [0, 1], [330, 760])} y={700 - Math.sin(f * Math.PI) * 140} s={0.9} o={Math.sin(f * Math.PI) * cel} />;
      })}
      {cable > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {[-1, 1].map((lado) => (
            <path key={lado}
              d={lado < 0 ? "M290 975 Q300 1120 450 1120 L540 1120" : "M540 1120 L640 1120 Q790 1120 790 900"}
              fill="none" stroke="#C7CFE6" strokeWidth={10} strokeLinecap="round" pathLength={1}
              strokeDasharray="1 1" strokeDashoffset={1 - cable}
              transform={`translate(${lado * corte * 40} ${corte * corte * 500}) rotate(${lado * corte * 25} 540 1120)`}
              opacity={1 - ramp(corte, 0.6, 1, Easing.linear)} />
          ))}
          {corte > 0 && corte < 0.6 && (
            <g transform="translate(540 1120)" opacity={1 - corte / 0.6}>
              <circle r={40 + corte * 120} fill="none" stroke={BRAND.azulUI} strokeWidth={6} />
            </g>
          )}
        </svg>
      )}
    </Escena>
  );
};

const Mateo: React.FC = () => {
  const t = useT();
  const nombre = pop(t, w("mateo", "Mateo"));
  const corre = ramp(t, w("mateo", "Sale") - 0.2, w("mateo", "correr"));
  const bolsillo = ramp(t, w("mateo", "bolsillo") - 0.1, w("mateo", "bolsillo") + 0.3);
  const avance = Math.max(0, t - w("mateo", "Sale")) * 520 * corre;
  return (
    <Escena id="mateo">
      {/* ciudad que pasa */}
      {[...Array(9)].map((_, i) => {
        const x = ((i * 260 - avance * 0.35) % 2340 + 2340) % 2340 - 300;
        const h = 220 + hash(i, 3) * 260;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: PISO - h, width: 190, height: h, borderRadius: "14px 14px 0 0",
            background: `${BRAND.azulMarino}AA`, border: `2px solid ${BRAND.azulUI}33` }}>
            {[...Array(Math.floor(h / 70))].map((__, k) => (
              <div key={k} style={{ position: "absolute", left: 30, right: 30, top: 30 + k * 70, height: 22, borderRadius: 4,
                background: hash(i, k) > 0.5 ? `${BRAND.azulHielo}55` : `${BRAND.azulUI}22` }} />
            ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: PISO, height: 6, background: `${BRAND.azulUI}66` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: PISO + 40, height: 6,
        backgroundImage: `repeating-linear-gradient(90deg, ${BRAND.azulUI}55 0 60px, transparent 60px 140px)`, backgroundPosition: `${-avance}px 0` }} />
      <Persona x={500} y={PISO} escala={1.15} {...MATEO} corre={corre} auriculares={1} fase={0.4} />
      <Chip p={nombre} style={{ left: 500, top: 560 }}>Mateo</Chip>
      {/* celular en el bolsillo */}
      {bolsillo > 0 && (
        <div style={{ position: "absolute", left: 500 + 34, top: PISO - 262 + Math.abs(Math.sin(t * 11 + 0.4)) * -10, width: 90, height: 90,
          transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * bolsillo})`, borderRadius: "50%", border: `5px solid ${BRAND.azulUI}`,
          boxShadow: `0 0 30px ${BRAND.azulUI}`, opacity: bolsillo }} />
      )}
    </Escena>
  );
};

const Ondas: React.FC = () => {
  const t = useT();
  const ondas = ramp(t, w("ondas", "ondas") - 0.3, w("ondas", "ondas") + 0.2);
  const radio = pop(t, w("ondas", "miniatura") - 0.2);
  const rango = ramp(t, w("ondas", "diez") - 0.3, w("ondas", "metros") + 0.3);
  const CEL = { x: 540, y: 1040 }, AUR = { x: 540, y: 470 };
  return (
    <Escena id="ondas">
      {/* alcance: unos 10 metros */}
      {rango > 0 && (
        <div style={{ position: "absolute", left: CEL.x, top: CEL.y, width: 1000 * rango, height: 1000 * rango, transform: "translate(-50%,-50%)",
          borderRadius: "50%", border: `4px dashed ${BRAND.azulUI}`, background: `${BRAND.azulUI}12` }} />
      )}
      <Chip p={pop(t, w("ondas", "metros") - 0.1)} style={{ left: 880, top: 1260, fontSize: 56 }}>10 m</Chip>
      {/* ondas de radio que salen del celular */}
      {ondas > 0 && [...Array(6)].map((_, k) => {
        const f = (t * 0.8 + k / 6) % 1;
        return (
          <div key={k} style={{ position: "absolute", left: CEL.x, top: CEL.y - 60, width: 160 + f * 900, height: 160 + f * 900,
            transform: "translate(-50%,-50%)", borderRadius: "50%", border: `${8 - f * 5}px solid ${BRAND.azulUI}`,
            clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)", opacity: (1 - f) * ondas }} />
        );
      })}
      {ondas > 0 && [0, 1, 2, 3].map((k) => {
        const f = (t * 0.55 + k / 4) % 1;
        return <Nota key={k} x={CEL.x + Math.sin(k * 2.1 + f * 6) * 90} y={interpolate(f, [0, 1], [CEL.y - 180, AUR.y + 90])} s={0.8} o={Math.sin(f * Math.PI) * ondas} />;
      })}
      <Centro x={CEL.x} y={CEL.y}><CelularIcono glow={ondas} /></Centro>
      <Centro x={AUR.x} y={AUR.y}><Auriculares glow={ondas} /></Centro>
      {/* radio en miniatura */}
      {radio > 0 && (
        <Centro x={250} y={760} style={{ transform: `translate(-50%,-50%) scale(${radio})` }}>
          <svg width={200} height={170} viewBox="0 0 40 34">
            <line x1={10} y1={12} x2={30} y2={1} stroke={BRAND.azulHielo} strokeWidth={2} strokeLinecap="round" />
            <rect x={2} y={11} width={36} height={22} rx={5} fill={BRAND.azulMarino} stroke={BRAND.azulUI} strokeWidth={2} />
            <circle cx={13} cy={22} r={6} fill="none" stroke={BRAND.azulHielo} strokeWidth={2} />
            <rect x={23} y={17} width={10} height={3} rx={1.5} fill={BRAND.azulUI} />
            <rect x={23} y={23} width={10} height={3} rx={1.5} fill={BRAND.azulHielo} />
          </svg>
        </Centro>
      )}
    </Escena>
  );
};

const Emparejar: React.FC = () => {
  const t = useT();
  const fila = pop(t, w("emparejar", "presentan") - 0.2, 13);
  const conectado = t >= w("emparejar", "emparejar");
  const ok = pop(t, w("emparejar", "emparejar"));
  const cambio = ramp(t, w("emparejar", "Después") - 0.3, w("emparejar", "Después") + 0.2, easeInOut);
  const enlace = ramp(t, w("emparejar", "reconocen") - 0.2, w("emparejar", "reconocen") + 0.3);
  const ok2 = pop(t, w("emparejar", "solos"));
  const giro = (t * 360) % 360;
  return (
    <Escena id="emparejar">
      {cambio < 1 && (
        <Centro y={790} style={{ opacity: 1 - cambio, transform: `translate(-50%,-50%) scale(${1 - 0.2 * cambio})` }}>
          <Telefono w={460} h={900}>
            <AbsoluteFill style={{ background: BRAND.fondoClaro, padding: "110px 34px 0", fontFamily: "Montserrat" }}>
              <div style={{ fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 64, color: BRAND.fondoOscuro }}>Bluetooth</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26, padding: "20px 24px",
                borderRadius: 20, background: "#fff", boxShadow: "0 4px 14px rgba(22,32,94,.08)", fontSize: 30, fontWeight: 600, color: BRAND.fondoOscuro }}>
                Activado
                <div style={{ width: 84, height: 48, borderRadius: 24, background: BRAND.azulUI, position: "relative" }}>
                  <div style={{ position: "absolute", right: 5, top: 5, width: 38, height: 38, borderRadius: "50%", background: "#fff" }} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#5A6386", letterSpacing: 2, margin: "36px 0 14px" }}>DISPOSITIVOS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 24px", borderRadius: 20, background: "#fff",
                boxShadow: conectado ? `0 0 0 4px ${BRAND.azulUI}` : "0 4px 14px rgba(22,32,94,.08)", transform: `scale(${fila})`, opacity: Math.min(1, fila * 2) }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: BRAND.azulHielo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Auriculares s={0.22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.fondoOscuro }}>Auris de Mateo</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: conectado ? BRAND.azulUI : "#5A6386" }}>{conectado ? "Conectado" : "Conectando..."}</div>
                </div>
                {conectado ? (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: BRAND.azulUI, transform: `scale(${ok})`,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={30} height={30} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: "50%", border: `6px solid ${BRAND.azulHielo}`, borderTopColor: BRAND.azulUI,
                    transform: `rotate(${giro}deg)` }} />
                )}
              </div>
            </AbsoluteFill>
          </Telefono>
        </Centro>
      )}
      {cambio > 0 && (
        <AbsoluteFill style={{ opacity: cambio }}>
          <Centro x={290} y={800}><CelularIcono s={1.1} glow={enlace} /></Centro>
          <Centro x={800} y={800}><Auriculares s={1.1} glow={enlace} /></Centro>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={400} y1={800} x2={660} y2={800} stroke={BRAND.azulUI} strokeWidth={10} strokeLinecap="round"
              strokeDasharray="4 26" strokeDashoffset={-t * 120} opacity={enlace} />
          </svg>
          <Check p={ok2} size={110} style={{ left: 540 - 55, top: 620 }} />
        </AbsoluteFill>
      )}
    </Escena>
  );
};

// 79 canales; el wifi ocupa una franja y el Bluetooth salta entre los libres
const CANALES = 79;
const WIFI = [26, 46];
const canalDeSalto = (k: number) => {
  let c = Math.floor(hash(k, 7) * (CANALES - (WIFI[1] - WIFI[0])));
  if (c >= WIFI[0]) c += WIFI[1] - WIFI[0];
  return c;
};

const Canales: React.FC = () => {
  const t = useT();
  const barras = ramp(t, desde("canales"), desde("canales") + 0.5);
  const wifi = ramp(t, w("canales", "wifi") - 0.2, w("canales", "wifi") + 0.3);
  const salta = t >= w("canales", "cambia") - 0.1;
  const k = Math.floor((t - w("canales", "cambia")) * 14);
  const contador = pop(t, w("canales", "seiscientas") - 0.2);
  const X0 = 90, W = 900, BW = W / CANALES, Y = 1060, H = 360;
  return (
    <Escena id="canales">
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[...Array(CANALES)].map((_, c) => {
          const h = H * (0.35 + 0.15 * hash(c, 2)) * ramp(barras, c / CANALES * 0.6, c / CANALES * 0.6 + 0.4);
          return <rect key={c} x={X0 + c * BW + 1.5} y={Y - h} width={BW - 3} height={h} rx={3} fill={`${BRAND.azulHielo}33`} />;
        })}
        {/* wifi: una franja ancha ocupada */}
        {wifi > 0 && (
          <path d={`M${X0 + WIFI[0] * BW} ${Y} Q${X0 + (WIFI[0] + WIFI[1]) / 2 * BW} ${Y - H * 1.25 * wifi} ${X0 + WIFI[1] * BW} ${Y} Z`}
            fill="#8A93B8" opacity={0.55} />
        )}
        {/* saltos: el canal activo y una estela de los anteriores */}
        {salta && [0, 1, 2, 3].map((d) => {
          const c = canalDeSalto(k - d);
          return <rect key={d} x={X0 + c * BW} y={Y - H} width={BW} height={H} rx={4} fill={BRAND.azulUI} opacity={d === 0 ? 1 : 0.35 / d} />;
        })}
        <line x1={X0} y1={Y + 8} x2={X0 + W} y2={Y + 8} stroke={`${BRAND.azulUI}88`} strokeWidth={4} />
      </svg>
      {wifi > 0 && (
        <Centro x={X0 + (WIFI[0] + WIFI[1]) / 2 * BW} y={Y - H * 1.25 * wifi / 2 - 40} style={{ opacity: wifi }}>
          <svg width={110} height={90} viewBox="0 0 24 20">
            <path d="M2 7a15 15 0 0 1 20 0M5.5 10.5a10 10 0 0 1 13 0M9 14a5 5 0 0 1 6 0" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
            <circle cx={12} cy={17.5} r={1.8} fill="#fff" />
          </svg>
        </Centro>
      )}
      {salta && (
        <Centro x={X0 + (canalDeSalto(k) + 0.5) * BW} y={Y - H - 70}>
          <LogoBT size={90} />
        </Centro>
      )}
      <Chip p={contador} style={{ left: 540, top: 540, fontSize: 72, padding: "18px 44px" }}>
        <span style={{ color: BRAND.azulUI }}>1.600</span> saltos / seg
      </Chip>
    </Escena>
  );
};

const Bateria: React.FC = () => {
  const t = useT();
  const a = desde("bateria");
  const aur = pop(t, w("bateria", "auriculares") - 0.3, 13);
  const reloj = interpolate(t, [w("bateria", "aguantan") - 0.3, w("bateria", "horas") + 0.4], [0, 6], { ...clamp, easing: easeInOut });
  const carga = 1 - 0.18 * (reloj / 6);
  const poca = ramp(t, w("bateria", "poca") - 0.1, w("bateria", "energía") + 0.2);
  return (
    <Escena id="bateria">
      {/* batería casi llena que apenas baja */}
      <Centro y={560} style={{ opacity: ramp(t, a, a + 0.3) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 380, height: 170, borderRadius: 34, border: `10px solid ${BRAND.azulHielo}`, padding: 14, boxSizing: "border-box" }}>
            <div style={{ width: `${carga * 100}%`, height: "100%", borderRadius: 18, background: BRAND.azulUI,
              boxShadow: `0 0 ${30 * poca}px ${BRAND.azulUI}` }} />
          </div>
          <div style={{ width: 24, height: 70, borderRadius: 8, background: BRAND.azulHielo }} />
        </div>
      </Centro>
      <Centro x={540} y={980} style={{ transform: `translate(-50%,-50%) scale(${aur * 1.5})` }}><Auriculares glow={0.4} /></Centro>
      {/* reloj: pasan las horas */}
      <Centro x={540} y={1250} style={{ opacity: ramp(t, w("bateria", "aguantan") - 0.4, w("bateria", "aguantan")) }}>
        <svg width={170} height={170} viewBox="-50 -50 100 100">
          <circle r={44} fill={BRAND.azulMarino} stroke={BRAND.azulUI} strokeWidth={6} />
          {[...Array(12)].map((_, i) => (
            <rect key={i} x={-1.5} y={-40} width={3} height={7} rx={1.5} fill={BRAND.azulHielo} transform={`rotate(${i * 30})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-34} stroke="#fff" strokeWidth={4} strokeLinecap="round" transform={`rotate(${reloj * 360})`} />
          <line x1={0} y1={0} x2={0} y2={-22} stroke={BRAND.azulUI} strokeWidth={6} strokeLinecap="round" transform={`rotate(${reloj * 30})`} />
          <circle r={5} fill="#fff" />
        </svg>
      </Centro>
    </Escena>
  );
};

const Rey: React.FC = () => {
  const t = useT();
  const nombre = pop(t, w("rey", "Harald") - 0.1);
  const brillo = ramp(t, w("rey", "Diente"), w("rey", "Azul") + 0.2);
  const dk = pop(t, w("rey", "Dinamarca") - 0.1);
  const no = pop(t, w("rey", "Noruega") - 0.1);
  const une = ramp(t, w("rey", "Noruega") + 0.25, w("rey", "Noruega") + 0.8, easeInOut);
  const cambio = ramp(t, w("rey", "Bluetooth") - 0.4, w("rey", "Bluetooth"), easeInOut);
  const aparatos = ramp(t, w("rey", "unir") - 0.15, w("rey", "aparatos") + 0.4);
  const ICONOS = ["cel", "aur", "reloj", "parlante", "compu"];
  return (
    <Escena id="rey">
      <AbsoluteFill style={{ opacity: 1 - cambio, transform: `scale(${1 - 0.1 * cambio})` }}>
        <Persona x={540} y={1290} escala={1.15} {...REY} dientes={0.6 + 0.4 * brillo} brazoD={25 + 70 * une} brazoI={25 + 70 * une} />
        <Destello x={575} y={1290 - 452 * 1.15} p={pop(t, w("rey", "Azul"), 8)} size={80} />
        <Chip p={nombre} style={{ left: 540, top: 430, fontSize: 50 }}>Harald «Diente Azul»</Chip>
        <div style={{ position: "absolute", left: interpolate(une, [0, 1], [170, 430]), top: 930, transform: `translate(-50%,-50%) scale(${dk})` }}>
          <Bandera pais="dk" w={150} />
        </div>
        <div style={{ position: "absolute", left: interpolate(une, [0, 1], [910, 650]), top: 930, transform: `translate(-50%,-50%) scale(${no})` }}>
          <Bandera pais="no" w={150} />
        </div>
      </AbsoluteFill>
      {cambio > 0 && (
        <AbsoluteFill style={{ opacity: cambio }}>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            {ICONOS.map((_, i) => {
              const a = (i / ICONOS.length) * Math.PI * 2 - Math.PI / 2;
              const r = 330 * aparatos;
              return <line key={i} x1={540} y1={800} x2={540 + Math.cos(a) * r} y2={800 + Math.sin(a) * r} stroke={BRAND.azulUI}
                strokeWidth={6} strokeDasharray="6 18" strokeDashoffset={-t * 90} />;
            })}
          </svg>
          <Centro y={800}><LogoBT size={200} glow={0.6} /></Centro>
          {ICONOS.map((ic, i) => {
            const a = (i / ICONOS.length) * Math.PI * 2 - Math.PI / 2;
            const p = pop(t, w("rey", "unir") + i * 0.08 - 0.1);
            return (
              <Centro key={ic} x={540 + Math.cos(a) * 330} y={800 + Math.sin(a) * 330}
                style={{ transform: `translate(-50%,-50%) scale(${p})`, width: 150, height: 150, borderRadius: 40, background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 5px ${BRAND.azulUI}55` }}>
                <IconoAparato tipo={ic} />
              </Centro>
            );
          })}
        </AbsoluteFill>
      )}
    </Escena>
  );
};

const IconoAparato: React.FC<{ tipo: string }> = ({ tipo }) => {
  const c = BRAND.azulMarino, a = BRAND.azulUI;
  return (
    <svg width={90} height={90} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {tipo === "cel" && (<><rect x={6} y={2} width={12} height={20} rx={3} /><line x1={10} y1={18.5} x2={14} y2={18.5} stroke={a} /></>)}
      {tipo === "aur" && (<><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x={3} y={13} width={4} height={7} rx={2} fill={a} stroke="none" /><rect x={17} y={13} width={4} height={7} rx={2} fill={a} stroke="none" /></>)}
      {tipo === "reloj" && (<><rect x={6} y={6} width={12} height={12} rx={3} /><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4" /><path d="M12 9.5V12l1.5 1.5" stroke={a} /></>)}
      {tipo === "parlante" && (<><rect x={6} y={2} width={12} height={20} rx={3} /><circle cx={12} cy={14} r={3.5} stroke={a} /><circle cx={12} cy={6.5} r={1} fill={c} /></>)}
      {tipo === "compu" && (<><rect x={4} y={5} width={16} height={11} rx={2} /><path d="M2 19h20" /><path d="M10 10.5h4" stroke={a} /></>)}
    </svg>
  );
};

// Runas: ᚼ (Hagall, H) y ᛒ (Berkanan, B); superpuestas forman el logo
const RUNA_H = "M12 1V23 M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5";
const RUNA_B = "M12 1V23 M12 1 L17.5 6.5 L12 12 L17.5 17.5 L12 23";

const Logo: React.FC = () => {
  const t = useT();
  const trazo = ramp(t, w("logo", "iniciales") - 0.3, w("logo", "iniciales") + 0.5, Easing.linear);
  const letras = ramp(t, w("logo", "iniciales"), w("logo", "iniciales") + 0.4);
  const junta = ramp(t, w("logo", "runas") - 0.1, w("logo", "runas") + 0.45, easeInOut);
  const logo = ramp(t, w("logo", "vikingas") + 0.05, w("logo", "vikingas") + 0.45);
  const brillo = pop(t, w("logo", "vikingas") + 0.2, 8);
  const S = 360;
  const runa = (d: string, lado: number, letra: string) => (
    <div style={{ position: "absolute", left: 540 + lado * 230 * (1 - junta) - S / 2, top: 720 - S / 2, width: S }}>
      <svg width={S} height={S} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
        <path d={d} fill="none" stroke={junta > 0.5 ? BRAND.azulHielo : "#fff"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trazo} style={{ filter: `drop-shadow(0 0 10px ${BRAND.azulUI})` }} />
      </svg>
      <div style={{ textAlign: "center", marginTop: 20, fontFamily: "'Glacial Indifference'", fontWeight: 700, fontSize: 110,
        color: BRAND.azulUI, opacity: letras * (1 - junta) }}>
        {letra}
      </div>
    </div>
  );
  return (
    <Escena id="logo">
      <AbsoluteFill style={{ opacity: 1 - logo }}>
        {runa(RUNA_H, -1, "H")}
        {runa(RUNA_B, 1, "B")}
      </AbsoluteFill>
      {logo > 0 && (
        <Centro y={720} style={{ transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * logo + 0.08 * brillo})`, opacity: logo }}>
          <LogoBT size={440} glow={brillo} />
        </Centro>
      )}
      <Destello x={700} y={520} p={brillo} size={130} />
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
      <Persona x={300} y={1340} escala={0.72} {...MATEO} auriculares={1} brazoD={130 + saludo} />
    </Escena>
  );
};

// ---------------- Sonido ----------------
const SFX: Sfx[] = [
  ["qr_pop.wav", w("hook", "Bluetooth"), 0.35],
  ["qr_pop.wav", w("hook", "rey"), 0.3],
  ["qr_ok.wav", w("hook", "azul"), 0.45],
  ["qr_pop.wav", w("secreto", "secreto"), 0.35],
  ["qr_pop.wav", w("secreto", "música") - 0.2, 0.3],
  ["qr_pop.wav", w("secreto", "auriculares") - 0.1, 0.3],
  ["qr_tick.wav", w("secreto", "cables"), 0.5],
  ["qr_pop.wav", w("mateo", "Mateo"), 0.35],
  ["qr_tick.wav", w("mateo", "bolsillo"), 0.4],
  ["qr_pop.wav", w("ondas", "miniatura") - 0.2, 0.3],
  ["qr_pop.wav", w("ondas", "metros") - 0.1, 0.3],
  ["qr_pop.wav", w("emparejar", "presentan") - 0.2, 0.3],
  ["qr_ok.wav", w("emparejar", "emparejar"), 0.4],
  ["qr_ok.wav", w("emparejar", "solos"), 0.35],
  ["qr_pop.wav", w("canales", "wifi"), 0.3],
  ["qr_pop.wav", w("canales", "seiscientas") - 0.2, 0.35],
  ["qr_pop.wav", w("bateria", "auriculares") - 0.3, 0.3],
  ["qr_pop.wav", w("rey", "Harald") - 0.1, 0.35],
  ["qr_pop.wav", w("rey", "Dinamarca") - 0.1, 0.3],
  ["qr_pop.wav", w("rey", "Noruega") - 0.1, 0.3],
  ["qr_ok.wav", w("rey", "aparatos"), 0.35],
  ["qr_ok.wav", w("logo", "vikingas") + 0.2, 0.5],
  ["qr_pop.wav", w("cta", "Seguinos"), 0.3],
  ["qr_tick.wav", w("cta", "tecnología"), 0.5],
];
// tics de los saltos de canal
for (let k = 0; k < 12; k++) SFX.push(["qr_tick.wav", w("canales", "cambia") + k * (1 / 7), 0.15]);

// ---------------- Composición ----------------
export const BtExplainer: React.FC = () => (
  <Base audio="bt" sfx={SFX}>
    <Hook />
    <Secreto />
    <Mateo />
    <Ondas />
    <Emparejar />
    <Canales />
    <Bateria />
    <Rey />
    <Logo />
    <Cta />
  </Base>
);
