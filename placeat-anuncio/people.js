// Personajes: rig 2D plano. Persona de cuerpo entero en perfil (escenas 1-4, 6)
// y busto de frente (montaje). Estilo vectorial plano, proporciones de adulto.
import { C, shade, mix, clamp, lerp, rr } from './lib.js';

export const HIP = 100, THIGH = 52, SHIN = 50, TORSO = 88, ARMU = 40, ARML = 38, HEAD_R = 27;

// ── Personajes ───────────────────────────────────────────────
export const LUCIA = { skin: C.skin2, hair: 'bob', hairC: '#8a5530', eyeC: '#6b4a2e', lash: true, top: '#f5b83d', bottom: '#24407c', shoe: '#f4f4f4', bag: true, bagC: '#ff8a3d' };
export const MARTA = { skin: C.skin1, hair: 'long', hairC: '#b5532f', eyeC: '#4d8a5a', lash: true, top: '#679436', bottom: '#3b4256', shoe: '#2b2f3d', lanyard: true };
export const DIEGO = { skin: C.skin3, hair: 'short', hairC: '#4a3122', eyeC: '#5a3b28', top: '#05668d', bottom: '#c9b28a', shoe: '#fff' };

// ── Poses (ángulos desde la vertical, + = hacia delante) ─────
export const pose = (o = {}) => Object.assign({ lt: 0, lk: 0.05, rt: 0, rk: 0.05, la: 0.05, le: 0.25, ra: -0.05, re: 0.25, lean: 0.03, hd: 0, smile: 0.5, blink: 0, bob: 0, brow: 0 }, o);
export const lerpPose = (a, b, k) => { const r = {}; for (const key in a) r[key] = lerp(a[key], b[key] ?? a[key], k); return r; };

export function walkPose(phi, amp = 1) {
  const s = Math.sin(phi), c = Math.cos(phi);
  return pose({
    lt: 0.6 * s * amp, lk: 0.95 * Math.max(0, c) * amp + 0.05,
    rt: -0.6 * s * amp, rk: 0.95 * Math.max(0, -c) * amp + 0.05,
    la: -0.5 * s * amp, le: 0.35 + 0.25 * Math.max(0, s) * amp,
    ra: 0.5 * s * amp, re: 0.35 + 0.25 * Math.max(0, -s) * amp,
    lean: 0.06 * amp, smile: 0.5,
  });
}
export const idlePose = (t, o = {}) => pose({ lean: 0.02 + 0.012 * Math.sin(t * 2.2), bob: Math.sin(t * 2.2) * 1.4, blink: Math.pow(Math.max(0, Math.sin(t * 1.3 + 1)), 60), ...o });

// ── utilidades de dibujo ─────────────────────────────────────
function capsule(c, x0, y0, x1, y1, w, col) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
}
const dir = (a) => [Math.sin(a), Math.cos(a)];   // desde la vertical hacia abajo

function legPts(hx, hy, t, k) {
  const [dx, dy] = dir(t), kx = hx + dx * THIGH, ky = hy + dy * THIGH;
  const [ex, ey] = dir(t - k);
  return { kx, ky, fx: kx + ex * SHIN, fy: ky + ey * SHIN, shinA: t - k };
}
// altura de cadera necesaria para que el pie más bajo toque el suelo
function hipHeight(p) {
  const r = (t, k) => THIGH * Math.cos(t) + SHIN * Math.cos(t - k);
  return Math.max(r(p.lt, p.lk), r(p.rt, p.rk));
}

function drawHair(c, o, hx, hy, front) {
  const col = o.hairC, r = HEAD_R, hi = shade(o.hairC, 1.25);
  c.fillStyle = col;
  if (!front) {   // parte trasera del pelo
    if (o.hair === 'bob') { c.beginPath(); c.moveTo(hx + 4, hy - 20); c.bezierCurveTo(hx - 40, hy - 26, hx - 42, hy + 30, hx - 22, hy + 40); c.quadraticCurveTo(hx - 6, hy + 44, hx + 2, hy + 24); c.closePath(); c.fill(); }
    if (o.hair === 'long') { c.beginPath(); c.moveTo(hx + 6, hy - 22); c.bezierCurveTo(hx - 46, hy - 30, hx - 50, hy + 60, hx - 26, hy + 74); c.quadraticCurveTo(hx - 4, hy + 78, hx + 4, hy + 30); c.closePath(); c.fill(); }
    if (o.hair === 'bun') { c.beginPath(); c.arc(hx - 18, hy - 30, 14, 0, 7); c.fill(); }
  } else {        // casquete con flequillo ladeado
    c.beginPath();
    if (o.hair === 'short') { c.moveTo(hx - r - 2, hy + 2); c.bezierCurveTo(hx - r - 4, hy - 38, hx + r, hy - 40, hx + r + 1, hy - 6); c.bezierCurveTo(hx + r - 6, hy - 18, hx + 6, hy - 20, hx - 10, hy - 14); c.bezierCurveTo(hx - 18, hy - 10, hx - r, hy - 4, hx - r - 2, hy + 2); }
    else { c.moveTo(hx - r - 2, hy + 4); c.bezierCurveTo(hx - r - 8, hy - 40, hx + r + 2, hy - 44, hx + r + 2, hy - 8); c.bezierCurveTo(hx + r - 4, hy - 26, hx + 8, hy - 26, hx - 8, hy - 14); c.bezierCurveTo(hx - 16, hy - 8, hx - r, hy, hx - r - 2, hy + 4); }
    c.closePath(); c.fill();
    c.strokeStyle = hi; c.lineWidth = 3; c.lineCap = 'round'; c.globalAlpha = 0.55;
    c.beginPath(); c.moveTo(hx - 16, hy - 26); c.quadraticCurveTo(hx + 2, hy - 34, hx + 16, hy - 22); c.stroke(); c.globalAlpha = 1;
  }
}

// ── persona de cuerpo entero (perfil) ────────────────────────
// (x, y) = pies. Devuelve posiciones de manos y cabeza en coordenadas de pantalla.
export function person(c, x, y, o = {}, p = pose()) {
  const s = o.s || 1.2, face = o.face ?? 1;
  const hipY = -hipHeight(p) + (p.bob || 0);
  const hx = 0, hy = hipY;
  c.save(); c.translate(x, y); c.scale(s * face, s);
  const skinB = shade(o.skin, 0.88), topB = shade(o.top, 0.82), botB = shade(o.bottom, 0.8);
  // ─ pierna trasera
  const lb = legPts(hx, hy, p.rt, p.rk);
  capsule(c, hx, hy, lb.kx, lb.ky, 21, botB); capsule(c, lb.kx, lb.ky, lb.fx, lb.fy, 18, botB);
  c.fillStyle = shade(o.shoe, 0.82); c.beginPath(); c.ellipse(lb.fx + 9, lb.fy + 1, 17, 8, 0, 0, 7); c.fill();
  // ─ torso
  const sx = hx + Math.sin(p.lean) * TORSO, sy = hy - Math.cos(p.lean) * TORSO;
  const shx = sx - Math.sin(p.lean) * 6, shy = sy + Math.cos(p.lean) * 8;   // hombro
  // ─ brazo trasero
  const ab = (() => { const [d1x, d1y] = dir(p.ra); const ex = shx + d1x * ARMU, ey = shy + d1y * ARMU; const [d2x, d2y] = dir(p.ra + p.re); return { ex, ey, hx: ex + d2x * ARML, hy: ey + d2y * ARML }; })();
  capsule(c, shx, shy, ab.ex, ab.ey, 15, topB); capsule(c, ab.ex, ab.ey, ab.hx, ab.hy, 13, skinB);
  c.fillStyle = skinB; c.beginPath(); c.arc(ab.hx, ab.hy, 8.5, 0, 7); c.fill();
  // ─ mochila
  if (o.bag) {
    c.save(); c.translate(hx + Math.sin(p.lean) * 40 - 30, hy - Math.cos(p.lean) * 46); c.rotate(p.lean * 0.6);
    c.fillStyle = o.bagC; rr(c, -22, -34, 44, 70, 14); c.fill();
    c.fillStyle = shade(o.bagC, 0.82); rr(c, -22, 4, 44, 32, [0, 0, 14, 14]); c.fill();
    c.restore();
  }
  // ─ torso (camiseta) y caderas
  capsule(c, hx, hy + 6, hx, hy + 20, 40, o.bottom);
  capsule(c, hx, hy - 6, sx, sy, 46, o.top);
  if (o.lanyard) { c.strokeStyle = '#eaf2ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx + 12, shy - 2); c.lineTo(sx + 16, sy + 46); c.stroke(); c.fillStyle = '#fff'; rr(c, sx + 8, sy + 44, 17, 22, 4); c.fill(); c.fillStyle = C.blue; c.fillRect(sx + 11, sy + 48, 11, 5); }
  // ─ pierna delantera
  const lf = legPts(hx, hy, p.lt, p.lk);
  capsule(c, hx, hy, lf.kx, lf.ky, 22, o.bottom); capsule(c, lf.kx, lf.ky, lf.fx, lf.fy, 19, o.bottom);
  c.fillStyle = o.shoe; c.beginPath(); c.ellipse(lf.fx + 9, lf.fy + 1, 18, 9, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(lf.fx - 8, lf.fy + 2, 34, 5);
  // ─ cuello y cabeza
  const ha = p.lean + p.hd;
  const nx = sx + Math.sin(ha) * 30, ny = sy - Math.cos(ha) * 30;
  capsule(c, sx, sy, nx, ny, 15, o.skin);
  const hcx = nx + Math.sin(ha) * 12, hcy = ny - Math.cos(ha) * 12;
  c.save(); c.translate(hcx, hcy); c.rotate(p.hd * 0.6); c.scale(0.82, 0.82);
  headFront(c, 0, 0, o, { smile: p.smile, blink: p.blink > 0.5, sx: 8, look: 1, brow: p.brow });
  c.restore();
  // ─ brazo delantero
  const [d1x, d1y] = dir(p.la), ex = shx + d1x * ARMU, ey2 = shy + d1y * ARMU, [d2x, d2y] = dir(p.la + p.le);
  const fx = ex + d2x * ARML, fy = ey2 + d2y * ARML;
  capsule(c, shx, shy, ex, ey2, 16, o.top); capsule(c, ex, ey2, fx, fy, 14, o.skin);
  c.fillStyle = o.skin; c.beginPath(); c.arc(fx, fy, 9, 0, 7); c.fill();
  c.restore();
  // coordenadas de pantalla
  const T = (lx, ly) => [x + face * s * lx, y + s * ly];
  return { handF: T(fx, fy), handB: T(ab.hx, ab.hy), head: T(hcx, hcy), shoulder: T(shx, shy), hip: T(hx, hy), footF: T(lf.fx, lf.fy) };
}

// ── busto de frente (montaje) ───────────────────────────────
// (x, y) = centro de la base del cuello. Devuelve puntos de las manos.
export function headFront(c, cx, cy, o, k = {}) {
  const r = 34, look = k.look || 0, smile = k.smile ?? 0.8, tilt = k.tilt || 0, sx = k.sx || 0, brow = k.brow || 0, hi = shade(o.hairC, 1.25);
  c.save(); c.translate(cx, cy); c.rotate(tilt);
  c.fillStyle = o.hairC;
  if (o.hair === 'long') { c.beginPath(); c.moveTo(-r - 4, -8); c.bezierCurveTo(-r - 26, 20, -r - 20, 78, -r + 4, 88); c.lineTo(r - 4, 88); c.bezierCurveTo(r + 20, 78, r + 26, 20, r + 4, -8); c.closePath(); c.fill(); }
  if (o.hair === 'bob') { c.beginPath(); c.moveTo(-r - 4, -8); c.bezierCurveTo(-r - 24, 16, -r - 16, 52, -r + 6, 58); c.lineTo(r - 6, 58); c.bezierCurveTo(r + 16, 52, r + 24, 16, r + 4, -8); c.closePath(); c.fill(); }
  if (o.hair === 'curly') { for (let i = 0; i < 9; i++) { const a = Math.PI * (1.0 + i / 8); c.beginPath(); c.arc(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3) - 2, 14, 0, 7); c.fill(); } }
  if (o.hair === 'bun') { c.beginPath(); c.arc(0, -r - 10, 15, 0, 7); c.fill(); }
  c.fillStyle = o.skin; c.beginPath(); c.ellipse(0, 2, r, r + 3, 0, 0, 7); c.fill();
  if (!sx) { c.beginPath(); c.arc(-r, 6, 7, 0, 7); c.arc(r, 6, 7, 0, 7); c.fill(); }
  else { c.beginPath(); c.arc(sx > 0 ? -r + 2 : r - 2, 6, 7, 0, 7); c.fill(); }
  c.fillStyle = o.hairC;
  if (o.hair !== 'bald') {
    c.beginPath(); c.moveTo(-r - 2, 2); c.bezierCurveTo(-r - 6, -50, r + 6, -50, r + 2, 2); c.bezierCurveTo(r - 4, -20, 10, -26, -4, -18); c.bezierCurveTo(-16, -12, -r + 2, -4, -r - 2, 2); c.closePath(); c.fill();
    c.strokeStyle = hi; c.lineWidth = 3.4; c.lineCap = 'round'; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(-14, -32); c.quadraticCurveTo(4, -42, 20, -30); c.stroke(); c.globalAlpha = 1;
  }
  if (o.beard) { c.fillStyle = o.hairC; c.beginPath(); c.arc(0, 8, r - 2, 0.15, Math.PI - 0.15); c.quadraticCurveTo(0, 16, r - 4, 12); c.fill(); }
  // ojos
  for (const ex0 of [-13, 13]) {
    const ex = ex0 + sx;
    if (k.blink) { c.strokeStyle = '#3a2a24'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 5, -1); c.quadraticCurveTo(ex, 3, ex + 5, -1); c.stroke(); continue; }
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, -2, 5.8, 6.6, 0, 0, 7); c.fill();
    c.fillStyle = o.eyeC || '#5a3b28'; c.beginPath(); c.arc(ex + look * 2.2, -1.4, 3.9, 0, 7); c.fill();
    c.fillStyle = '#1c1416'; c.beginPath(); c.arc(ex + look * 2.2, -1.4, 2.1, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + look * 2.2 - 1.2, -3, 1.4, 0, 7); c.fill();
    c.strokeStyle = '#3a2a24'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 6, -2); c.quadraticCurveTo(ex, -9.5, ex + 6, -2); c.stroke();
    if (o.lash) { c.lineWidth = 1.8; c.beginPath(); c.moveTo(ex + 5, -4); c.lineTo(ex + 8, -6.5); c.stroke(); }
  }
  c.strokeStyle = shade(o.hairC, 0.9); c.lineWidth = 3; c.lineCap = 'round';
  for (const ex0 of [-13, 13]) { const ex = ex0 + sx; c.beginPath(); c.moveTo(ex - 6, -14 - brow * 3); c.quadraticCurveTo(ex, -18 - brow * 4, ex + 6, -14 + brow * 2); c.stroke(); }
  if (o.glasses) { c.strokeStyle = '#26304a'; c.lineWidth = 3; for (const ex of [-13 + sx, 13 + sx]) { c.beginPath(); c.arc(ex, -2, 9.5, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(-3 + sx, -2); c.lineTo(3 + sx, -2); c.stroke(); }
  c.strokeStyle = shade(o.skin, 0.8); c.lineWidth = 2; c.beginPath(); c.moveTo(-3 + sx * 1.1, 8); c.quadraticCurveTo(0 + sx * 1.1, 11, 3 + sx * 1.1, 8); c.stroke();
  c.fillStyle = 'rgba(255,130,120,.30)'; for (const ex of [-22, 22]) { c.beginPath(); c.arc(ex + sx * 0.7, 11, 7, 0, 7); c.fill(); }
  c.strokeStyle = '#c2585c'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9 + sx * 0.9, 17); c.quadraticCurveTo(0 + sx * 0.9, 17 + 12 * smile, 9 + sx * 0.9, 17); c.stroke();
  c.restore();
}

// torso de frente con brazos (ángulos: sa = separación lateral desde la vertical, eb = flexión de codo)
export function bustBody(c, cx, cy, o, arms = {}) {
  const A = Object.assign({ lsa: 0.35, lea: 0.6, rsa: 0.35, rea: 0.6, lsw: 0, rsw: 0 }, arms);
  c.save(); c.translate(cx, cy);
  c.fillStyle = o.top; rr(c, -62, 6, 124, 190, 40); c.fill();
  if (o.apron) { c.fillStyle = o.apron; rr(c, -46, 40, 92, 160, [20, 20, 6, 6]); c.fill(); c.fillRect(-46, 40, 92, 8); }
  c.fillStyle = o.skin; c.beginPath(); c.arc(0, 4, 20, 0, Math.PI); c.fill(); rr(c, -13, -6, 26, 20, 8); c.fill();
  if (o.lanyard) { c.strokeStyle = '#eaf2ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 6); c.lineTo(0, 66); c.lineTo(14, 6); c.stroke(); c.fillStyle = '#fff'; rr(c, -10, 62, 20, 26, 4); c.fill(); c.fillStyle = C.blue; c.fillRect(-7, 67, 14, 6); }
  const hands = [];
  for (const side of [-1, 1]) {
    const sa = side < 0 ? A.lsa : A.rsa, ea = side < 0 ? A.lea : A.rea, sw = (side < 0 ? A.lsw : A.rsw);
    const sx = side * 58, sy = 34;
    const a1 = side * (sa + sw), ex = sx + Math.sin(a1) * 84, ey = sy + Math.cos(a1) * 84;
    const a2 = a1 - side * ea, fx = ex + Math.sin(a2) * 78, fy = ey + Math.cos(a2) * 78;
    capsule(c, sx, sy, ex, ey, 34, o.top); capsule(c, ex, ey, fx, fy, 27, o.skin);
    c.fillStyle = o.skin; c.beginPath(); c.arc(fx, fy, 15, 0, 7); c.fill();
    hands.push([cx + fx, cy + fy]);
  }
  c.restore();
  return hands;
}
