// Utilidades comunes: matemáticas, easing, texto, cubos isométricos, paleta.
export const E = { W: 1080, H: 1350, S: 1, OX: 0, OY: 0 };   // se rellena en anim.js
export const begin = (c) => c.setTransform(E.S, 0, 0, E.S, E.OX, E.OY);
export const raw = (c) => c.setTransform(1, 0, 0, 1, 0, 0);

// Paleta PLACEAT (web + logotipo)
export const C = {
  navy: '#152f73', navy2: '#1d3f8a', navyDeep: '#0b1a3f', blue: '#4b8fcf', blueL: '#8cc0ee', teal: '#05668d',
  green: '#679436', lime: '#a8c000', cream: '#fff6e6', ink: '#111827', warm: '#ffd166', orange: '#ff8a3d',
  skin1: '#fbe3d0', skin2: '#f6d3ba', skin3: '#f1c6a6', skin4: '#f7d9c4',
};

export const P = (w, s) => `${w} ${s}px Poppins`;

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const eOut = (x) => 1 - Math.pow(1 - x, 3);
export const eIn = (x) => x * x * x;
export const eIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));
export const eBack = (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const eElastic = (x) => { x = clamp(x); if (x === 0 || x === 1) return x; return Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1; };
export function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hexv = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hexv(a), B = hexv(b); t = clamp(t); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
export const mixv = (a, b, t) => { const A = hexv(a), B = hexv(b); t = clamp(t); return A.map((v, i) => Math.round(lerp(v, B[i], t))); };
export const shade = (h, k) => { const A = hexv(h); return `rgb(${A.map((v) => Math.round(clamp(v * k, 0, 255))).join(',')})`; };
export const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

export function tx(c, s, x, y, o = {}) {
  c.save();
  c.font = P(o.w || 600, o.size || 40);
  c.letterSpacing = (o.ls || 0) + 'px';
  c.textAlign = o.align || 'left';
  c.textBaseline = o.base || 'alphabetic';
  if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = o.sblur || 18; c.shadowOffsetY = 4; }
  c.fillStyle = o.color || '#fff';
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  c.fillText(s, x, y);
  c.restore();
}
export function tw(c, s, o = {}) {
  c.save(); c.font = P(o.w || 600, o.size || 40); c.letterSpacing = (o.ls || 0) + 'px';
  const w = c.measureText(s).width; c.restore(); return w;
}

// Cubo isométrico. (X, Yg) = centro de su huella sobre el suelo; s = arista.
// cols = {top, left, right}
export function cubeIso(c, X, Yg, s, cols, alpha = 1, glow = 0) {
  const hw = s * 0.866, hh = s * 0.5, cy = Yg - hh;
  c.save();
  c.globalAlpha *= alpha;
  if (glow > 0) { c.shadowColor = `rgba(140,192,238,${0.9 * glow})`; c.shadowBlur = 50 * glow; }
  c.fillStyle = cols.left; c.beginPath(); c.moveTo(X - hw, cy - hh + 0); c.lineTo(X, cy); c.lineTo(X, cy + s); c.lineTo(X - hw, cy + hh); c.closePath(); c.fill();
  c.fillStyle = cols.right; c.beginPath(); c.moveTo(X, cy); c.lineTo(X + hw, cy - hh); c.lineTo(X + hw, cy + hh); c.lineTo(X, cy + s); c.closePath(); c.fill();
  c.shadowColor = 'transparent';
  c.fillStyle = cols.top; c.beginPath(); c.moveTo(X, cy - s); c.lineTo(X + hw, cy - hh); c.lineTo(X, cy); c.lineTo(X - hw, cy - hh); c.closePath(); c.fill();
  c.restore();
}
export const CUBE_BLUE = { top: '#6fb2ee', left: '#2d62ae', right: '#4b8fcf' };
export const CUBE_NAVY = { top: '#2a55ad', left: '#16326f', right: '#1f4590' };

export function pill(c, x, y, label, o = {}) {
  const fs = o.size || 26;
  const w = tw(c, label, { w: 600, size: fs }) + 56;
  const h = fs * 2.1;
  c.save();
  c.fillStyle = o.bg || '#fff'; rr(c, x, y, w, h, h / 2); c.fill();
  tx(c, label, x + w / 2, y + h / 2 + fs * 0.36, { w: 600, size: fs, color: o.color || C.navy, align: 'center' });
  c.restore();
  return w;
}
