// Escenas 1-4: amanecer en Plasencia, la escalera, el apoyo y la subida.
// Mundo lateral continuo con cámara que sigue a Lucía.
import {
  E, begin, raw, C, P, clamp, seg, lerp, eOut, eIn, eIO, eSine, eBack, rng, mix, mixv, shade, rr, tx, tw, cubeIso, CUBE_BLUE,
} from './lib.js';
import { person, LUCIA, MARTA, pose, lerpPose, walkPose, idlePose } from './people.js';
import { W, T, CUBES, CLIMB, TXT, WALK_SPEED, LUCIA_START_X, LUCIA_WALK_T0, LUCIA_STOP_X, LUCIA_STOP_T } from './shared.js';

export const GROUND = W.ground;
export const SC = 1.25;                       // escala de los personajes
export const STRIDE = 144;                    // px por paso de un personaje a esa escala
const ghost = new OffscreenCanvas(8, 8).getContext('2d');

// ── Cielo ────────────────────────────────────────────────────
const SKY = [[0, '#0b1533', '#1e3a7a'], [5, '#24407f', '#e58f78'], [12, '#4f83c4', '#ffc890'], [17.5, '#6fb0e0', '#ffd8a0'], [25, '#8fd0f0', '#fff0c2']];
function skyAt(t) {
  let i = 0; while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++;
  const [t0, a0, b0] = SKY[i], [t1, a1, b1] = SKY[i + 1];
  const k = eSine(seg(t, t0, t1));
  return [mix(a0, a1, k), mix(b0, b1, k)];
}
const nightK = (t) => 1 - eSine(seg(t, 1, 16));

// ── Trayectoria de Lucía ─────────────────────────────────────
function lerpKey(a, b, t) { return clamp((t - a) / (b - a)); }

export function luciaState(t) {
  let x = 0, h = 0, face = 1, p = pose();
  const dist = (xx) => Math.abs(xx - LUCIA_START_X);
  if (t < LUCIA_STOP_T) {                                     // A · camina desde la izquierda
    x = t < LUCIA_WALK_T0 ? LUCIA_START_X : LUCIA_START_X + WALK_SPEED * (t - LUCIA_WALK_T0);
    p = walkPose(dist(x) * Math.PI / STRIDE);
    if (t < LUCIA_WALK_T0) p = idlePose(t);
  } else if (t < 11.0) {                                       // B-F · intenta subir
    x = LUCIA_STOP_X; face = 1;
    const u = t;
    p = idlePose(t, { hd: -0.28, smile: 0.4, brow: 0.3 });
    const reach = { la: 2.3, le: 0.15, ra: 2.05, re: 0.2, lean: 0.2, lt: 0.9, lk: 1.05, rt: -0.05, rk: 0.05, hd: -0.35, smile: 0.35, brow: 0.6 };
    const slump = { la: 0.1, le: 0.35, ra: -0.05, re: 0.3, lean: -0.06, lt: 0, lk: 0.05, rt: 0, rk: 0.05, hd: 0.34, smile: 0.1, brow: 1, bob: 4 };
    if (u >= 7.2 && u < 7.8) p = lerpPose(p, reach, eSine(lerpKey(7.2, 7.8, u)));                         // estira los brazos
    else if (u >= 7.8 && u < 8.25) { p = reach; h = 52 * Math.sin(Math.PI * lerpKey(7.8, 8.25, u)); }     // salto
    else if (u >= 8.25 && u < 8.7) { p = lerpPose(reach, slump, eOut(lerpKey(8.25, 8.7, u))); x -= 26 * eOut(lerpKey(8.25, 8.7, u)); }
    else if (u >= 8.7 && u < 9.4) { x -= 26; p = lerpPose(slump, idlePose(t, { hd: -0.1, smile: 0.35, brow: 0.5, la: 0.7, le: 0.7, ra: 0.6, re: 0.6 }), eSine(lerpKey(8.7, 9.4, u))); }
    else if (u >= 9.4 && u < 9.9) { x -= 26 - 26 * eSine(lerpKey(9.4, 9.9, u)); p = lerpPose(idlePose(t, { hd: -0.1, la: 0.7, le: 0.7 }), { ...reach, lt: 1.35, lk: 1.25, la: 2.0, ra: 1.8 }, eSine(lerpKey(9.4, 9.9, u))); }
    else if (u >= 9.9 && u < 10.3) { p = { ...reach, lt: 1.35, lk: 1.25, la: 2.0, ra: 1.8 }; h = 22 * Math.sin(Math.PI * lerpKey(9.9, 10.3, u)) ; }
    else if (u >= 10.3) { x -= 10 * eOut(lerpKey(10.3, 10.7, u)); p = lerpPose({ ...reach, lt: 1.35, lk: 1.25, la: 2.0, ra: 1.8 }, slump, eOut(lerpKey(10.3, 10.75, u))); }
    else x -= 0;
    if (u >= 8.7 && u < 9.4) x = LUCIA_STOP_X - 26;
    if (u >= 10.75) x = LUCIA_STOP_X - 10;
  } else if (t < 14.7) {                                       // G-J · se gira, camina hacia Marta y espera
    const x0 = LUCIA_STOP_X - 10, x1 = 1290;
    face = t < 11.0 ? 1 : t < 11.2 ? lerp(1, -1, (t - 11.0) / 0.2) : -1;
    if (t < 11.4) { x = x0; p = idlePose(t, { hd: 0.15, smile: 0.25, brow: 0.6, lean: -0.02 }); }
    else if (t < 12.5) { x = lerp(x0, x1, eSine(lerpKey(11.4, 12.5, t))); p = walkPose(Math.abs(x - x0) * Math.PI / STRIDE, 0.6); p.hd = 0.05; p.smile = 0.45; }
    else {
      x = x1;
      const look = eSine(lerpKey(13.4, 14.0, t)) * -0.4;       // mira hacia arriba al ver el cubo
      const track = t > 14.05 ? -0.4 + 0.7 * eSine(lerpKey(14.05, 14.7, t)) : look;
      p = idlePose(t, { hd: t > 13.4 ? track : 0, smile: lerp(0.45, 0.9, seg(t, 12.5, 14)), brow: -0.3 });
    }
  } else if (t < T.s4) {                                       // K-L · vuelve a mirar los escalones, sonríe
    x = 1290; face = t < 14.9 ? lerp(-1, 1, eSine((t - 14.7) / 0.2)) : 1;
    const nod = t > 16.2 && t < 16.8 ? 0.16 * Math.sin((t - 16.2) / 0.6 * Math.PI) : 0;
    p = idlePose(t, { hd: 0.05 + nod, smile: 0.95, brow: -0.4, lean: 0.06 });
  } else {                                                     // M · sube
    let i = 0; while (i < CLIMB.length - 2 && t > CLIMB[i + 1].t) i++;
    const a = CLIMB[i], b = CLIMB[i + 1];
    const u = clamp((t - a.t) / (b.t - a.t));
    if (t >= CLIMB[CLIMB.length - 1].t) {
      const last = CLIMB[CLIMB.length - 1]; x = last.x; h = last.h;
      const hand = eSine(seg(t, 24.0, 24.5));
      p = idlePose(t, { la: 1.5 * hand + 0.05, le: 0.2, lean: 0.08 + 0.05 * hand, hd: -0.12, smile: 0.9, brow: -0.4 });
    } else if (b.h > a.h + 1) {           // escalón
      const e = eIO(u);
      x = lerp(a.x, b.x, e); h = lerp(a.h, b.h, e) + 26 * Math.sin(Math.PI * u);
      const s = Math.sin(Math.PI * Math.min(1, u * 1.1));
      p = pose({ lt: 1.15 * s + 0.05, lk: 1.1 * s, rt: -0.15 * s, rk: 0.15, la: -0.8 * s + 0.6 * u, le: 0.4, ra: 0.9 * s, re: 0.4, lean: 0.2 * s + 0.06, hd: -0.08, smile: 0.85, brow: -0.2 });
    } else {                                // caminar en llano
      x = lerp(a.x, b.x, u); h = a.h;
      p = walkPose(Math.abs(x - a.x) * Math.PI / STRIDE + i * 1.7, 0.85); p.smile = 0.85; p.hd = -0.05; p.brow = -0.3;
      if (i === 0 || i === 1) p = lerpPose(p, walkPose(1.2, 0.6), 0);
    }
    face = 1;
  }
  return { x, h, face, p };
}

// ── Marta ────────────────────────────────────────────────────
const MARTA_X0 = 745, MARTA_SPEED = 150, MARTA_T0 = 9.8;
const MARTA_STOP_X = 1120;
export function martaState(t) {
  let x = MARTA_X0, p = pose(), vis = t >= 9.0;
  if (t < MARTA_T0) return { x, p: idlePose(t), vis: false };
  const dur = (MARTA_STOP_X - MARTA_X0) / MARTA_SPEED;         // ≈ 2,5 s
  const tEnd = MARTA_T0 + dur;
  if (t < tEnd) { x = MARTA_X0 + MARTA_SPEED * (t - MARTA_T0); p = walkPose((x - MARTA_X0) * Math.PI / STRIDE, 0.7); p.smile = 0.75; return { x, p, vis: true }; }
  x = MARTA_STOP_X;
  const base = idlePose(t, { smile: 0.85, brow: -0.3 });
  const palm = { la: 1.05, le: 0.5, lean: 0.03, hd: 0, smile: 0.95 };
  const toss = { la: 0.25, le: 0.45, lean: 0.06, smile: 0.95 };
  const point = { la: 1.25, le: 0.15, lean: 0.08, smile: 1 };
  const rest = { la: 0.25, le: 0.9, ra: 0.3, re: 1.0, lean: 0.03, smile: 0.9 };
  if (t < 12.9) p = base;
  else if (t < 13.6) p = lerpPose(base, { ...base, ...palm }, eSine(lerpKey(12.9, 13.6, t)));
  else if (t < 14.05) p = { ...base, ...palm };
  else if (t < 14.5) p = lerpPose({ ...base, ...palm }, { ...base, ...toss }, eOut(lerpKey(14.05, 14.4, t)));
  else if (t < 15.3) p = lerpPose({ ...base, ...toss }, base, eSine(lerpKey(14.5, 15.3, t)));
  else if (t < 16.0) p = lerpPose(base, { ...base, ...point }, eSine(lerpKey(15.3, 15.7, t)));
  else p = lerpPose({ ...base, ...point }, { ...base, ...rest }, eSine(lerpKey(16.0, 16.8, t)));
  return { x, p, vis: true };
}

// posición de la mano de Marta (para anclar el cubo)
function martaHand(t) {
  const m = martaState(t);
  return person(ghost, m.x, GROUND, { ...MARTA, s: SC, face: 1 }, m.p).handF;
}

// ── Cámara ───────────────────────────────────────────────────
function camera(t) {
  const L = luciaState(t);
  let camX, camY = 0, z = 1;
  const Z0 = 1.28;
  if (t < LUCIA_STOP_T + 0.4) camX = Math.min(L.x - 380, LUCIA_STOP_X - 380);
  else camX = LUCIA_STOP_X - 380;
  if (t >= 6) camX = lerp(Math.min(camX, LUCIA_STOP_X - 380), 860, eSine(seg(t, LUCIA_STOP_T, LUCIA_STOP_T + 2)));
  if (t < LUCIA_STOP_T) camX = L.x - 380;
  if (t >= T.s3 && t < T.s4) { z = 1 + 0.06 * eSine(seg(t, T.s3, T.s4)); }
  if (t >= T.s4) {
    const Lt = luciaState(Math.max(T.s4, t - 0.35));
    camX = clamp(Lt.x - 430, 860, 2210);
    camY = 0.78 * Lt.h;
    if (t > 23.9) { camX = lerp(camX, W.doorX - 560, eSine(seg(t, 23.9, 24.8))); }
    z = 1.06 - 0.06 * eSine(seg(t, T.s4, T.s4 + 1.2));
  }
  return { camX, camY, z: z * Z0 };
}

// ── Dibujo del entorno ───────────────────────────────────────
const farB = (() => {
  const r = rng(11), a = []; let x = -900;
  while (x < 5200) { const w = 60 + r() * 120, h = 90 + r() * 230; a.push({ x, w, h, roof: r() > 0.55, tower: r() > 0.94 }); x += w + r() * 20; }
  return a;
})();
const midH = (() => {
  const r = rng(29), a = []; let x = -600;
  const pal = ['#e8b48c', '#f1d3a5', '#d98b6a', '#c9d6ea', '#f6e7c8', '#e5a07a'];
  while (x < 3600) { const w = 150 + r() * 90, h = 250 + r() * 190; a.push({ x, w, h, col: pal[Math.floor(r() * pal.length)], win: 2 + Math.floor(r() * 2), roof: r() > 0.3 }); x += w + 4 + r() * 10; }
  return a;
})();

export function drawSky(c, t, camY) {
  raw(c);
  const [top, bot] = skyAt(t), n = nightK(t);
  const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, top); gr.addColorStop(1, bot);
  c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
  begin(c);
  // estrellas y luna
  if (n > 0.02) {
    const r = rng(5);
    for (let i = 0; i < 90; i++) { const x = r() * 1080, y = r() * 700 - camY * 0.05, tw2 = 0.6 + 0.4 * Math.sin(t * 2 + i); c.fillStyle = `rgba(255,255,255,${n * n * tw2 * (0.4 + r() * 0.5)})`; c.beginPath(); c.arc(x, y, 1.2 + r() * 1.6, 0, 7); c.fill(); }
    const my = 250 + 60 * (1 - n);
    const mg = c.createRadialGradient(190, my, 30, 190, my, 130); mg.addColorStop(0, `rgba(220,230,255,${0.35 * n})`); mg.addColorStop(1, 'rgba(220,230,255,0)');
    c.fillStyle = mg; c.fillRect(40, my - 150, 300, 300);
    c.fillStyle = `rgba(247,248,255,${n})`; c.beginPath(); c.arc(190, my, 44, 0, 7); c.fill();
    c.fillStyle = `rgba(205,212,236,${0.55 * n})`; for (const [dx, dy, r] of [[-12, -8, 9], [14, 10, 7], [6, -18, 5]]) { c.beginPath(); c.arc(190 + dx, my + dy, r, 0, 7); c.fill(); }
  }
  // sol naciente
  const sunUp = eOut(seg(t, 3.0, 20));
  const sy = lerp(1080, 470, sunUp) + camY * 0.55, sx = 860;
  const glow = c.createRadialGradient(sx, sy, 10, sx, sy, 520);
  glow.addColorStop(0, `rgba(255,214,120,${0.55 * (0.4 + sunUp)})`); glow.addColorStop(1, 'rgba(255,214,120,0)');
  c.fillStyle = glow; c.fillRect(0, 0, 1080, 1350);
  c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(sx, sy, 92, 0, 7); c.fill();
  c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(sx, sy, 70, 0, 7); c.fill();
}

export function drawFar(c, t, camX, camY) {
  const n = nightK(t), col = mix(mix('#16265c', '#a9c4e8', 1 - n), '#0b1533', 0);
  c.save(); c.translate(-camX * 0.12, camY * 0.25);
  const base = GROUND - 5;
  for (const b of farB) {
    c.fillStyle = col; c.fillRect(b.x, base - b.h, b.w, b.h + 260);
    if (b.roof) { c.beginPath(); c.moveTo(b.x - 4, base - b.h); c.lineTo(b.x + b.w / 2, base - b.h - 34); c.lineTo(b.x + b.w + 4, base - b.h); c.fill(); }
    if (b.tower) {   // campanario
      c.fillRect(b.x + b.w * 0.25, base - b.h - 150, b.w * 0.5, 150);
      c.beginPath(); c.arc(b.x + b.w / 2, base - b.h - 150, b.w * 0.25, Math.PI, 0); c.fill();
      c.fillRect(b.x + b.w / 2 - 2, base - b.h - 220, 4, 40);
    }
  }
  c.restore();
}

export function drawMid(c, t, camX, camY) {
  const n = nightK(t);
  c.save(); c.translate(-camX * 0.45, camY * 0.55);
  const base = GROUND;
  for (const b of midH) {
    const body = mix(b.col, '#101d4a', n * 0.74);
    c.fillStyle = body; c.fillRect(b.x, base - b.h, b.w, b.h + 300);
    c.fillStyle = mix('#b5583b', '#101d4a', n * 0.8);
    if (b.roof) { c.beginPath(); c.moveTo(b.x - 8, base - b.h); c.lineTo(b.x + b.w / 2, base - b.h - 46); c.lineTo(b.x + b.w + 8, base - b.h); c.fill(); }
    const ww = 34, wh = 50;
    for (let r = 0; r < 3; r++) for (let k = 0; k < b.win; k++) {
      const wx = b.x + (b.w / (b.win + 1)) * (k + 1) - ww / 2, wy = base - b.h + 46 + r * 96;
      c.fillStyle = mix('#7fa6d4', '#26386e', n); c.fillRect(wx, wy, ww, wh);
      if (n > 0.05 && ((r * 7 + k * 3 + Math.floor(b.x)) % 3 !== 0)) { c.fillStyle = `rgba(255,209,102,${n * 0.95})`; c.fillRect(wx, wy, ww, wh); }
      c.fillStyle = mix('#ffffff', '#9aa6c8', n); c.globalAlpha = 0.25; c.fillRect(wx + ww / 2 - 1, wy, 2, wh); c.globalAlpha = 1;
    }
  }
  c.restore();
}

export function drawGround(c, t, camX) {
  const n = nightK(t);
  c.fillStyle = mix('#cbb890', '#243466', n * 0.9); c.fillRect(-100, GROUND, 1300 + 200, 700);
  c.fillStyle = mix('#b5a07a', '#1b2a58', n * 0.9); c.fillRect(-100, GROUND, 1500, 16);       // bordillo
  // adoquines
  c.strokeStyle = mix('#a8946c', '#16224a', n * 0.9); c.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const y = GROUND + 40 + i * 58; c.beginPath(); c.moveTo(-100, y); c.lineTo(1300, y); c.stroke(); }
  const off = ((camX % 90) + 90) % 90;
  for (let i = 0; i < 6; i++) for (let x = -off - 90; x < 1300; x += 90) { const y = GROUND + 40 + i * 58; c.beginPath(); c.moveTo(x + (i % 2 ? 45 : 0), y); c.lineTo(x + (i % 2 ? 45 : 0), y + 58); c.stroke(); }
}

export function drawLamp(c, t, sx) {
  const n = nightK(t);
  c.fillStyle = mix('#2a3a70', '#0e1a44', n * 0.5); rr(c, sx - 6, GROUND - 330, 12, 330, 4); c.fill();
  c.fillRect(sx - 30, GROUND - 336, 40, 8);
  c.fillStyle = mix('#ffe9a8', '#ffd166', n); c.beginPath(); c.arc(sx - 28, GROUND - 322, 15, 0, 7); c.fill();
  if (n > 0.05) { const g = c.createRadialGradient(sx - 28, GROUND - 322, 4, sx - 28, GROUND - 322, 190); g.addColorStop(0, `rgba(255,214,120,${0.55 * n})`); g.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = g; c.fillRect(sx - 230, GROUND - 520, 400, 400); }
}

// escalera, muro y puerta (coordenadas de mundo -> pantalla con offset)
function drawStairs(c, t, camX, camY) {
  const n = nightK(t), day = 1 - n * 0.55;
  const sx = (x) => x - camX, sy = (h) => GROUND + camY - h;
  // muro del edificio superior
  const wallX = W.landX, wallW = 1200;
  c.fillStyle = mix('#f3e0c1', '#26386e', n * 0.65); c.fillRect(sx(wallX - 20), sy(1900), wallW, 1900 + 500);
  c.fillStyle = mix('#e4c9a0', '#1c2b5c', n * 0.65); c.fillRect(sx(wallX - 20), sy(W.topH + 8), wallW, 20);
  // zócalo
  // escalones
  for (let k = 1; k <= W.nSteps; k++) {
    const x = W.x0 + (k - 1) * W.stepW, top = W.stepH * k;
    c.fillStyle = mix('#e7dcc3', '#26346a', n * 0.7); c.fillRect(sx(x), sy(top), W.stepW + (k === W.nSteps ? W.landing : 0), top + 400);
    c.fillStyle = mix('#f8f1e2', '#32488d', n * 0.6); c.fillRect(sx(x), sy(top), W.stepW + (k === W.nSteps ? W.landing : 0), 16);
    c.strokeStyle = 'rgba(120,92,50,.16)'; c.lineWidth = 2; for (let yy = 40; yy < top + 400; yy += 62) { c.beginPath(); c.moveTo(sx(x), sy(top) + yy); c.lineTo(sx(x) + W.stepW, sy(top) + yy); c.stroke(); }
    c.fillStyle = 'rgba(21,47,115,.16)'; c.fillRect(sx(x), sy(top) + 16, 10, top + 400);
    c.fillStyle = 'rgba(21,47,115,.10)'; c.fillRect(sx(x), sy(top) + 16, W.stepW + (k === W.nSteps ? W.landing : 0), 10);
  }
  // puerta
  const dx = sx(W.doorX), dTop = sy(W.topH + 350), dBot = sy(W.topH);
  const open = eSine(seg(t, 24.0, 25.0));
  const leak = 0.25 + 0.5 * seg(t, 5, 22);
  c.fillStyle = mix('#152f73', '#0b1a3f', n * 0.5); rr(c, dx - 118, dTop - 20, 236, 372, [118, 118, 0, 0]); c.fill();        // marco
  // luz al otro lado
  const lg = c.createLinearGradient(0, dTop, 0, dBot); lg.addColorStop(0, '#fff6cf'); lg.addColorStop(1, '#ffd166');
  c.fillStyle = lg; rr(c, dx - 96, dTop, 192, 350, [96, 96, 0, 0]); c.fill();
  // hoja de la puerta (se abre girando sobre el lado izquierdo)
  const wdt = 192 * (1 - open * 0.92);
  c.fillStyle = mix('#8a5a36', '#3a2a24', n * 0.4); rr(c, dx - 96, dTop, wdt, 350, [96, 8, 0, 0]); c.fill();
  c.fillStyle = 'rgba(0,0,0,.14)'; rr(c, dx - 96 + wdt * 0.12, dTop + 60, wdt * 0.76, 110, 10); c.fill(); rr(c, dx - 96 + wdt * 0.12, dTop + 190, wdt * 0.76, 130, 10); c.fill();
  c.fillStyle = '#ffd166'; c.beginPath(); c.arc(dx - 96 + wdt * 0.84, dTop + 190, 9, 0, 7); c.fill();
  // rendijas de luz alrededor mientras está cerrada
  if (open < 0.05) { c.strokeStyle = `rgba(255,232,150,${leak})`; c.lineWidth = 5; rr(c, dx - 97, dTop - 1, 194, 352, [97, 97, 0, 0]); c.stroke(); }
  // cartel ABIERTO
  c.fillStyle = C.lime; rr(c, dx + 130, sy(W.topH + 250), 128, 46, 10); c.fill();
  tx(c, 'ABIERTO', dx + 194, sy(W.topH + 250) + 32, { size: 21, w: 700, color: '#26350a', align: 'center', ls: 2 });
  c.strokeStyle = '#26350a'; c.lineWidth = 3; c.beginPath(); c.moveTo(dx + 150, sy(W.topH + 250)); c.lineTo(dx + 150, sy(W.topH + 290)); c.moveTo(dx + 238, sy(W.topH + 250)); c.lineTo(dx + 238, sy(W.topH + 290)); c.stroke();
  // halo de luz de la puerta
  const halo = c.createRadialGradient(dx, dBot - 150, 30, dx, dBot - 150, 500 + 500 * open);
  halo.addColorStop(0, `rgba(255,236,160,${(0.16 + 0.8 * open) * leak})`); halo.addColorStop(1, 'rgba(255,236,160,0)');
  c.fillStyle = halo; c.fillRect(dx - 1200, dBot - 1200, 2400, 2400);
}

export function drawShadow(c, x, y, w = 62) { c.fillStyle = 'rgba(10,20,50,.22)'; c.beginPath(); c.ellipse(x, y + 2, w, 9, 0, 0, 7); c.fill(); }

// cubo de apoyo (el mismo lenguaje del logotipo)
function supportCube(c, sxp, syp, s, k, glow, tPop) {
  if (k <= 0) return;
  c.save(); c.translate(sxp, syp); c.scale(k, k);
  cubeIso(c, 0, 0, s, CUBE_BLUE, 1, glow);
  c.restore();
}
export function sparkles(c, x, y, age, n = 10, R = 110, col = '#fff3c4') {
  if (age < 0 || age > 0.8) return;
  const r = rng(Math.floor(x) + 7);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, d = R * eOut(age / 0.8) * (0.5 + r() * 0.6);
    c.globalAlpha = 1 - age / 0.8; c.fillStyle = col; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + r() * 3, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
  c.strokeStyle = `rgba(255,243,196,${0.8 * (1 - age / 0.8)})`; c.lineWidth = 6 * (1 - age / 0.8); c.beginPath(); c.ellipse(x, y, R * 0.8 * eOut(age / 0.8), R * 0.3 * eOut(age / 0.8), 0, 0, 7); c.stroke();
}

function birds(c, t) {
  if (t < 1.6 || t > 5.4) return;
  const u = (t - 1.6) / 3.8;
  for (let i = 0; i < 5; i++) {
    const x = -100 + u * 1300 - i * 46, y = 330 + i * 26 + Math.sin(u * 9 + i) * 14;
    const f = Math.sin(t * 14 + i) * 9;
    c.strokeStyle = 'rgba(20,30,70,.75)'; c.lineWidth = 3.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 16, y + f); c.quadraticCurveTo(x - 6, y - 8, x, y); c.quadraticCurveTo(x + 6, y - 8, x + 16, y + f); c.stroke();
  }
}

// ── Texto ────────────────────────────────────────────────────
function overlay(c, t) {
  const [top] = skyAt(t);
  const dark = nightK(t) > 0.45;
  const col = dark ? '#ffffff' : C.navy, sh = dark ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.7)';
  const draw = (cfg, y, size, o = {}) => {
    if (t < cfg.t0 || (cfg.t1 && t > cfg.t1)) return;
    const a = eOut(seg(t, cfg.t0, cfg.t0 + 0.6)) * (cfg.t1 ? 1 - eIn(seg(t, cfg.t1 - 0.5, cfg.t1)) : 1);
    const lines = [cfg.a, cfg.b].filter(Boolean);
    lines.forEach((s, i) => tx(c, s, 540, y + i * (size * 1.32) + (1 - a) * 24, { size, w: o.w || 600, align: 'center', color: o.color || col, alpha: a, shadow: sh, sblur: 14, ls: o.ls || 0 }));
  };
  begin(c);
  draw(TXT.amanece, 250, 58, { w: 600 });
  draw(TXT.escalones, 232, 44);
  draw(TXT.apoyar1, 216, 46);
  if (t >= TXT.apoyar2.t0 && t <= TXT.apoyar2.t1) {
    const a = eOut(seg(t, TXT.apoyar2.t0, TXT.apoyar2.t0 + 0.7));
    tx(c, TXT.apoyar2.a, 540, 330 + (1 - a) * 24, { size: 66, w: 700, align: 'center', color: dark ? '#fff' : C.navy, alpha: a * (1 - eIn(seg(t, TXT.apoyar2.t1 - 0.5, TXT.apoyar2.t1))), shadow: sh, sblur: 14, ls: -1 });
  }
}

// ── Escena completa (0 – 25 s) ───────────────────────────────
export function drawWorld(c, t) {
  const cam = camera(t);
  const { camX, camY, z } = cam;
  drawSky(c, t, camY);
  begin(c);
  c.save(); c.translate(540, GROUND); c.scale(z, z); c.translate(-540, -GROUND);
  drawFar(c, t, camX, camY);
  drawMid(c, t, camX, camY);
  // suelo y farolas
  c.save(); c.translate(-camX, camY); drawGround(c, t, camX); c.restore();
  for (let i = -1; i < 6; i++) { const wx = 200 + i * 760; c.save(); c.translate(0, camY); drawLamp(c, t, wx - camX); c.restore(); }
  drawStairs(c, t, camX, camY);

  // — cubos —
  const sx = (x) => x - camX, sy = (h) => GROUND + camY - h;
  const L = luciaState(t), M = martaState(t);
  const cubeDraw = [];
  // cubo 0: en la mano de Marta → vuelo → suelo
  const c0 = CUBES[0];
  let cube0 = null;
  if (t >= 13.3) {
    if (t < 14.05) { const hp = martaHand(t); const k = eBack(seg(t, 13.3, 14.0)); cube0 = { x: hp[0], y: hp[1] - 6 + camY, k: k * 0.55, air: true }; }
    else if (t < 14.65) {
      const u = (t - 14.05) / 0.6, hp = martaHand(14.05);
      const x0 = hp[0], y0 = hp[1] - 6 + camY, x1 = c0.x, y1 = GROUND + camY - W.cubeS / 2;
      cube0 = { x: lerp(x0, x1, eIO(u)), y: lerp(y0, y1, u) - 260 * Math.sin(Math.PI * u) * (1 - u * 0.2), k: lerp(0.55, 1, u), air: true };
    } else {
      const age = t - 14.65;
      const sq = age < 0.4 ? 1 + 0.16 * Math.sin(age / 0.4 * Math.PI * 3) * Math.exp(-age * 5) : 1;
      cube0 = { x: c0.x, y: GROUND + camY, k: 1, glow: t < 18.6 ? 0.55 : 0.35, sq, age };
    }
  }
  const drawCube0 = () => {
    if (!cube0) return;
    if (cube0.air) { c.save(); c.translate(sx(cube0.x), cube0.y); c.scale(cube0.k, cube0.k); cubeIso(c, 0, W.cubeS / 2, W.cubeS, CUBE_BLUE, 1, 1); c.restore(); if (t < 14.05) sparkles(c, sx(cube0.x), cube0.y, (t - 13.3) % 0.8, 6, 60); }
    else { c.save(); c.translate(sx(cube0.x), cube0.y); c.scale(1, cube0.sq || 1); cubeIso(c, 0, 0, W.cubeS, CUBE_BLUE, 1, cube0.glow); c.restore(); if (cube0.age < 0.8) sparkles(c, sx(cube0.x), cube0.y - 30, cube0.age); }
  };

  // — personajes —
  if (M.vis) { drawShadow(c, sx(M.x), GROUND + camY); person(c, sx(M.x), GROUND + camY, { ...MARTA, s: SC, face: 1 }, M.p); }
  drawCube0();
  drawShadow(c, sx(L.x), sy(t < 11 ? 0 : L.h), 62);
  const fy = sy(L.h);
  person(c, sx(L.x), fy, { ...LUCIA, s: SC, face: L.face }, L.p);

  // cubos 1-3 (aparecen delante de Lucía)
  for (let i = 1; i < CUBES.length; i++) {
    const cb = CUBES[i], age = t - cb.t;
    if (age < 0) continue;
    const k = eBack(clamp(age / 0.45));
    const stepOn = CLIMB.find((q) => Math.abs(q.x - cb.x) < 2 && Math.abs(q.h - (cb.h + W.cubeS)) < 2);
    const glow = stepOn && t > stepOn.t - 0.2 ? 0.5 : 1;
    c.save(); c.translate(sx(cb.x), sy(cb.h)); c.scale(k, k); cubeIso(c, 0, 0, W.cubeS, CUBE_BLUE, 1, glow * Math.min(1, 0.4 + 1 - k * 0.6)); c.restore();
    if (age < 0.8) sparkles(c, sx(cb.x), sy(cb.h) - 40, age);
  }
  // Lucía se pinta de nuevo tras los cubos para que pise sobre ellos
  if (t >= T.s4) { person(c, sx(L.x), fy, { ...LUCIA, s: SC, face: L.face }, L.p); }
  c.restore();
  birds(c, t);
  overlay(c, t);
  // destello final de la puerta -> escena 5
  if (t >= 24.6) { raw(c); const a = eSine(seg(t, 24.6, 25.0)); c.fillStyle = `rgba(255,248,224,${a})`; c.fillRect(0, 0, E.W, E.H); }
  return cam;
}
