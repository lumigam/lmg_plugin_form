'use strict';
const W = 1280, H = 720, K = 2;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const layer = mk(W, H), lctx = layer.getContext('2d');
const maskC = mk(W, H), mctx = maskC.getContext('2d');
const worldC = mk(W, H), wctx = worldC.getContext('2d');

/* ---------- utilidades ---------- */
function rng(s) { s |= 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eout = x => 1 - Math.pow(1 - clamp(x), 3);
const eob = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const pop = (t, t0, d = .5) => t < t0 ? 0 : eob((t - t0) / d);
const gone = (t, t1, d = .3) => t < t1 ? 1 : clamp(1 - (t - t1) / d);
const hash = i => { const r = rng(i * 7919 + 13); return r(); };
const seg = (t, a, b) => clamp((t - a) / (b - a));

/* ---------- textura de papel / acuarela ---------- */
const TEX = (() => {
  const S = 512, c = mk(S, S), x = c.getContext('2d'), id = x.createImageData(S, S);
  const octs = [[8, .5], [16, .3], [32, .18], [64, .1]];
  const grids = octs.map(([p], k) => { const r = rng(100 + k), g = []; for (let i = 0; i < p * p; i++) g.push(r()); return g; });
  const sm = t => t * t * (3 - 2 * t);
  const vn = (u, v, p, g) => { const x0 = Math.floor(u * p), y0 = Math.floor(v * p), fx = sm(u * p - x0), fy = sm(v * p - y0);
    const a = g[(y0 % p) * p + x0 % p], b = g[(y0 % p) * p + (x0 + 1) % p], c2 = g[((y0 + 1) % p) * p + x0 % p], d = g[((y0 + 1) % p) * p + (x0 + 1) % p];
    return lerp(lerp(a, b, fx), lerp(c2, d, fx), fy); };
  const r = rng(5);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    let n = 0; octs.forEach(([p, w], k) => n += (vn(i / S, j / S, p, grids[k]) - .5) * w);
    const v = 236 + n * 70 + (r() - .5) * 22;
    const o = (j * S + i) * 4; id.data[o] = id.data[o + 1] = id.data[o + 2] = clamp(v, 150, 255); id.data[o + 3] = 255;
  }
  x.putImageData(id, 0, 0); return c;
})();
const PAT = ctx.createPattern(TEX, 'repeat');

const PAPER = (() => {
  const c = mk(W, H), x = c.getContext('2d');
  x.fillStyle = '#f5f0e4'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'multiply'; x.globalAlpha = .3; x.fillStyle = x.createPattern(TEX, 'repeat'); x.fillRect(0, 0, W, H);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const g = x.createRadialGradient(W / 2, H / 2, 250, W / 2, H / 2, 800); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,90,50,.22)');
  x.fillStyle = g; x.fillRect(0, 0, W, H); return c;
})();

/* ---------- caminos ---------- */
function smoothPath(x, pts) {
  const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  x.beginPath(); const s = m(pts[n - 1], pts[0]); x.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); x.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
  x.closePath();
}
function polyPath(x, pts) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.closePath(); }
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function circ(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); }
function spline(pts, per = 20) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) { const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
function poly(pts, per) { const o = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < per; k++) o.push([lerp(pts[i][0], pts[i + 1][0], k / per), lerp(pts[i][1], pts[i + 1][1], k / per)]); o.push(pts[pts.length - 1]); return o; }

/* ---------- recorte de papel ---------- */
function cut(x, pf, color, o = {}) {
  x.save();
  x.shadowColor = 'rgba(50,35,20,.4)'; x.shadowBlur = o.sb ?? 7; x.shadowOffsetX = o.sx ?? 2; x.shadowOffsetY = o.sy ?? 4;
  pf(x); x.fillStyle = '#fbf8f0'; x.strokeStyle = '#fbf8f0'; x.lineWidth = o.edge ?? 3.4; x.lineJoin = 'round'; x.stroke(); x.fill();
  x.restore();
  x.save(); pf(x); x.fillStyle = color; x.fill(); x.clip();
  if (o.grad) { const g = x.createLinearGradient(0, o.grad[0], 0, o.grad[1]); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(0,0,30,.22)'); x.fillStyle = g; x.fillRect(-3000, -3000, 6000, 6000); }
  x.globalCompositeOperation = 'multiply'; x.globalAlpha = o.tex ?? .6; x.fillStyle = PAT; x.fillRect(-3000, -3000, 6000, 6000);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.lineWidth = 5; x.strokeStyle = 'rgba(0,0,0,.10)'; pf(x); x.stroke();
  x.restore();
}

/* ---------- sprites (cacheados, supermuestreo x2) ---------- */
const SP = {};
function sprite(key, w, h, fn, o = {}) {
  if (SP[key]) return SP[key];
  const pad = o.pad ?? 20, ax = o.ax ?? w / 2, ay = o.ay ?? h;
  const c = mk((w + 2 * pad) * K, (h + 2 * pad) * K), x = c.getContext('2d');
  x.scale(K, K); x.translate(pad + ax, pad + ay); fn(x);
  return SP[key] = { c, pad, ax, ay };
}
function put(g, s, px, py, o = {}) {
  const sc = o.s ?? 1;
  g.save(); g.translate(px, py); if (o.rot) g.rotate(o.rot); g.scale((o.sx ?? 1) * sc, (o.sy ?? 1) * sc);
  if (o.a !== undefined) g.globalAlpha = o.a;
  g.drawImage(s.c, -(s.pad + s.ax), -(s.pad + s.ay), s.c.width / K, s.c.height / K); g.restore();
}
const F_HEAD = '"Caveat Brush", cursive', F_BODY = '"Patrick Hand", sans-serif', F_LOGO = '"Baloo 2", sans-serif';

function labelSpr(text, size, bg = '#fff8e6', fg = '#1f2c4d', font = F_HEAD) {
  const key = 'L|' + text + size + bg + fg + font;
  const t = mctx; t.font = size + 'px ' + font; const tw = t.measureText(text).width;
  const w = Math.ceil(tw + size * 1.3), h = Math.ceil(size * 1.55);
  return sprite(key, w, h, x => {
    cut(x, p => rr(p, -w / 2, -h / 2, w, h, 10), bg, { tex: .5 });
    x.fillStyle = 'rgba(255,240,150,.85)'; [[-w / 2 + 6, -h / 2 + 2, -.5], [w / 2 - 6, -h / 2 + 2, .5]].forEach(([tx, ty, r]) => { x.save(); x.translate(tx, ty); x.rotate(r); x.fillRect(-16, -6, 32, 12); x.restore(); });
    x.font = size + 'px ' + font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = fg; x.fillText(text, 0, size * .06);
  }, { ax: w / 2, ay: h / 2 });
}
function label(g, t, text, cx, cy, tin, tout, o = {}) {
  const s = pop(t, tin, .55) * gone(t, tout, .35); if (s <= .01) return;
  const sp = labelSpr(text, o.size ?? 62, o.bg, o.fg, o.font);
  put(g, sp, cx, cy + (1 - clamp(s)) * 30, { s: s, rot: (o.rot ?? -.02) + (1 - clamp(s)) * .12, a: clamp(s * 1.5) });
}

/* ---------- personaje ---------- */
function drawBody(x, mood) {
  cut(x, p => rr(p, -40, -122, 24, 54, 9), '#9a6a42');
  cut(x, p => rr(p, -17, -42, 15, 42, 5), '#4a78a8'); cut(x, p => rr(p, 2, -42, 15, 42, 5), '#4a78a8');
  cut(x, p => rr(p, -20, -9, 20, 11, 4), '#5a3b2a'); cut(x, p => rr(p, 0, -9, 20, 11, 4), '#5a3b2a');
  cut(x, p => smoothPath(p, [[-27, -42], [-31, -95], [-17, -112], [17, -112], [31, -95], [27, -42], [0, -37]]), '#f0742c', { grad: [-112, -40] });
  x.strokeStyle = 'rgba(120,50,10,.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -105); x.lineTo(0, -40); x.stroke();
  cut(x, p => rr(p, -24, -116, 48, 16, 8), '#4d9a9d', { sb: 4 });
  cut(x, p => rr(p, 8, -108, 11, 34, 5), '#3f8a8e', { sb: 4 });
  cut(x, p => circ(p, 0, -139, 25), '#f3c9a2', { sb: 4 });
  cut(x, p => { p.beginPath(); p.arc(0, -143, 27, Math.PI * 1.03, Math.PI * 1.97); p.closePath(); }, '#4f76a0', { sb: 3 });
  cut(x, p => rr(p, -28, -150, 56, 11, 5), '#3e5f86', { sb: 2 });
  cut(x, p => circ(p, 0, -175, 8), '#eef2f6', { sb: 3 });
  x.fillStyle = '#2a2320'; circ(x, -9, -136, 2.8); x.fill(); circ(x, 9, -136, 2.8); x.fill();
  x.fillStyle = 'rgba(240,110,110,.4)'; circ(x, -16, -128, 5); x.fill(); circ(x, 16, -128, 5); x.fill();
  x.strokeStyle = '#2a2320'; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath();
  if (mood === 'worried') { x.moveTo(-6, -122); x.quadraticCurveTo(0, -127, 6, -122); x.stroke(); x.beginPath(); x.moveTo(-14, -145); x.lineTo(-5, -141); x.moveTo(14, -145); x.lineTo(5, -141); x.stroke();
    x.fillStyle = '#9fd4f5'; x.beginPath(); x.ellipse(24, -146, 3, 5, .3, 0, 7); x.fill(); }
  else { x.arc(0, -128, 7, .15 * Math.PI, .85 * Math.PI); x.stroke(); }
}
const bodySpr = m => sprite('body' + m, 110, 200, x => drawBody(x, m), { ay: 200, ax: 55, pad: 30 });
const armSpr = () => sprite('arm', 22, 62, x => {
  cut(x, p => rr(p, -7, -4, 14, 40, 6), '#f0742c', { sb: 3, sy: 2 }); cut(x, p => circ(p, 0, 42, 8), '#f3c9a2', { sb: 3, sy: 2 });
}, { ax: 0, ay: 0 });
const boatSpr = () => sprite('boat', 190, 60, x => {
  cut(x, p => smoothPath(p, [[-92, -42], [92, -42], [78, 0], [40, 12], [-40, 12], [-78, 0]]), '#a9743f', { grad: [-42, 12] });
  x.strokeStyle = 'rgba(70,40,15,.45)'; x.lineWidth = 2; for (let i = -70; i < 80; i += 14) { x.beginPath(); x.moveTo(i, -38); x.quadraticCurveTo(i + 4, -14, i - 6, 8); x.stroke(); }
  cut(x, p => rr(p, -96, -50, 192, 12, 6), '#7d5029', { sb: 3 });
}, { ax: 95, ay: 50, pad: 24 });
const paddleSpr = () => sprite('paddle', 20, 144, x => {
  cut(x, p => rr(p, -3, -70, 6, 100, 3), '#7d5029', { sb: 3 }); cut(x, p => smoothPath(p, [[-9, 28], [9, 28], [10, 66], [0, 74], [-10, 66]]), '#c68a4d', { sb: 3 });
}, { ax: 0, ay: 72 });

function drawChar(g, x, y, s, o = {}) {           // pies en (x,y)
  const mood = o.mood ?? 'happy', t = o.t ?? 0;
  put(g, bodySpr(mood), x, y, { s, rot: o.rot, sx: o.sx, sy: o.sy });
  const arm = armSpr(), ar = o.wave ? -2.5 + Math.sin(t * 11) * .35 : .18 + Math.sin(t * 2) * .04;
  const P = (dx, dy) => [x + (dx * Math.cos(o.rot || 0) - dy * Math.sin(o.rot || 0)) * s, y + (dx * Math.sin(o.rot || 0) + dy * Math.cos(o.rot || 0)) * (s * (o.sy ?? 1))];
  const l = P(-28, -100), r = P(28, -100);
  put(g, arm, l[0], l[1], { s, rot: -(.18 + Math.sin(t * 2 + 1) * .04) + (o.rot || 0) });
  put(g, arm, r[0], r[1], { s, rot: ar + (o.rot || 0) });
}
function drawCharBoat(g, x, y, s, t, o = {}) {      // barca con personaje sentado
  const storm = o.storm ?? 0, bob = Math.sin(t * 2.2) * 3 * (1 + storm * 2), rot = Math.sin(t * 1.9) * (.03 + .07 * storm) + (o.rot ?? 0);
  g.save(); g.translate(x, y + bob); g.rotate(rot);
  const px = 105 * s, sw = Math.sin(t * 1.6) * .35;
  put(g, paddleSpr(), px, -30 * s, { s, rot: -.5 + sw });
  drawChar(g, 0, -8 * s, s * .95, { mood: o.mood, t, wave: o.wave });
  put(g, boatSpr(), 0, 0, { s });
  g.restore();
}

/* ---------- pincel y pintura ---------- */
function brushSpr(tip) {
  return sprite('brush' + tip, 60, 460, x => {
    x.save(); x.shadowColor = 'rgba(30,20,10,.35)'; x.shadowBlur = 18; x.shadowOffsetX = 26; x.shadowOffsetY = 34;
    x.fillStyle = '#1b2740'; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-20, -30, -22, -70, -13, -110); x.lineTo(13, -110); x.bezierCurveTo(22, -70, 20, -30, 0, 0); x.fill();
    x.restore();
    const bg = x.createLinearGradient(-20, 0, 20, 0); bg.addColorStop(0, '#0e1730'); bg.addColorStop(.5, '#3a4a70'); bg.addColorStop(1, '#0e1730');
    x.fillStyle = bg; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-20, -30, -22, -70, -13, -110); x.lineTo(13, -110); x.bezierCurveTo(22, -70, 20, -30, 0, 0); x.fill();
    x.fillStyle = tip; x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-10, -12, -12, -26, -9, -36); x.lineTo(9, -36); x.bezierCurveTo(12, -26, 10, -12, 0, 0); x.fill();
    const fg = x.createLinearGradient(-14, 0, 14, 0); fg.addColorStop(0, '#8b93a3'); fg.addColorStop(.4, '#f1f4f8'); fg.addColorStop(1, '#7c8494');
    x.fillStyle = fg; rr(x, -14, -160, 28, 52, 5); x.fill();
    const hg = x.createLinearGradient(-12, 0, 12, 0); hg.addColorStop(0, '#2a1c14'); hg.addColorStop(.35, '#7a4a2e'); hg.addColorStop(1, '#231710');
    x.fillStyle = hg; x.beginPath(); x.moveTo(-13, -158); x.lineTo(13, -158); x.lineTo(8, -420); x.quadraticCurveTo(0, -434, -8, -420); x.closePath(); x.fill();
  }, { ax: 0, ay: 460, pad: 60 });
}
function drawBrush(g, x, y, tip = '#2e7fd6', ang = .75, s = 1) { put(g, brushSpr(tip), x, y, { rot: ang, s }); }
function paintStroke(g, path, p, w, cols, seed, alpha = 1) {
  const k = Math.floor(clamp(p) * (path.length - 1)); if (k < 1) return null;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalAlpha = .62 * alpha; g.strokeStyle = cols[0]; g.lineWidth = w; g.beginPath(); g.moveTo(path[0][0], path[0][1]); for (let i = 1; i <= k; i++) g.lineTo(path[i][0], path[i][1]); g.stroke();
  const r = rng(seed);
  for (let i = 0; i <= k; i += 2) { const [x, y] = path[i], a = r() * 6.28, rad = w * (.32 + .22 * r());
    g.globalAlpha = (.05 + .07 * r()) * alpha; g.fillStyle = cols[1 + (i % 2)]; circ(g, x + Math.cos(a) * w * .22, y + Math.sin(a) * w * .22, rad); g.fill(); }
  g.globalAlpha = .18 * alpha; g.strokeStyle = cols[3] || cols[1]; g.lineWidth = w * .22; g.beginPath(); g.moveTo(path[0][0], path[0][1] + w * .3); for (let i = 1; i <= k; i++) g.lineTo(path[i][0], path[i][1] + w * .3); g.stroke();
  g.restore(); return path[k];
}
const BLUE = ['#3a8fe0', '#2a72c8', '#61aeea', '#1c4f9a'], YEL = ['#ffc83a', '#ffb01f', '#ffd966', '#e0900a'];

/* ---------- escenografía ---------- */
function zig(cx, top, bot, hw, teeth, r) {
  const pts = [[cx, top], [cx + hw, bot]];
  for (let i = 1; i < teeth; i++) pts.push([cx + hw - (2 * hw) * i / teeth, bot - 5 - r() * 7 + (i % 2) * 8]); pts.push([cx - hw, bot]); return pts;
}
const pineSpr = v => sprite('pine' + v, 120, 220, x => {
  const cols = [['#1f5a63', '#276a70', '#1a4d58'], ['#245f5a', '#2f7469', '#1c4f4e'], ['#2a5b76', '#356f8a', '#224a62']][v % 3], r = rng(50 + v);
  cut(x, p => rr(p, -8, -22, 16, 26, 2), '#6a4630', { sb: 3 });
  [[-38, -106, 52], [-84, -158, 42], [-136, -206, 32]].forEach(([top, bot, hw], i) => {
    const pts = zig(0, bot === -106 ? -108 : bot === -158 ? -160 : -210, i === 0 ? -30 : i === 1 ? -84 : -136, hw + 6, 7, r);
    cut(x, p => polyPath(p, pts), cols[i], { grad: [-210, -30], sb: 5 });
    cut(x, p => polyPath(p, [[0, pts[0][1]], [hw * .55, pts[0][1] + hw * 1.0], [hw * .1, pts[0][1] + hw * .82], [-hw * .3, pts[0][1] + hw * .95], [-hw * .5, pts[0][1] + hw * .9]]), '#fdfdfb', { sb: 2, sy: 2, tex: .35, edge: 1.5 });
  });
}, { ax: 60, ay: 224 });
const mountSpr = (w, h, col, k) => sprite('mt' + w + h + col + k, w, h, x => {
  const r = rng(k);
  cut(x, p => polyPath(p, [[-w / 2, 0], [-w * .12, -h * .8], [-w * .02, -h * .6 - r() * 8], [w * .06, -h], [w * .18, -h * .66], [w * .5, 0]]), col, { grad: [-h, 0], sb: 5 });
  cut(x, p => polyPath(p, [[w * .06, -h], [w * .18, -h * .66], [w * .12, -h * .72], [w * .07, -h * .62], [w * .02, -h * .7], [-w * .02, -h * .6], [-w * .06, -h * .72]]), '#fdfdfb', { sb: 2, sy: 2, tex: .3, edge: 1.5 });
}, { ax: w / 2, ay: h });
const houseSpr = () => sprite('house', 150, 130, x => {
  cut(x, p => rr(p, -50, -66, 100, 66, 4), '#e8692a', { grad: [-66, 0] });
  cut(x, p => polyPath(p, [[-64, -62], [0, -122], [64, -62]]), '#7a4a35', { grad: [-122, -62] });
  cut(x, p => smoothPath(p, [[-64, -62], [-30, -92], [0, -108], [10, -104], [-20, -86], [-54, -60]]), '#fdfdfb', { sb: 2, sy: 2, tex: .3, edge: 1.5 });
  cut(x, p => rr(p, -12, -40, 24, 40, 3), '#5d3a28', { sb: 2, sy: 2 });
  cut(x, p => rr(p, -42, -52, 22, 20, 3), '#ffe7a0', { sb: 2, sy: 2 }); cut(x, p => rr(p, 20, -52, 22, 20, 3), '#ffe7a0', { sb: 2, sy: 2 });
  cut(x, p => rr(p, 30, -118, 14, 34, 2), '#8f5b44', { sb: 3 });
}, { ax: 75, ay: 130 });
const cardSpr = () => sprite('card', 230, 150, x => {
  cut(x, p => rr(p, -115, -75, 230, 150, 12), '#ffffff', { tex: .35 });
  x.save(); rr(x, -115, -75, 230, 30, 12); x.clip(); x.fillStyle = '#2f7fe0'; x.fillRect(-120, -80, 240, 38); x.restore();
  ['#ff6b5e', '#ffc93c', '#5fd068'].forEach((c, i) => { x.fillStyle = c; circ(x, -98 + i * 16, -60, 5); x.fill(); });
  x.fillStyle = '#e8eefc'; rr(x, -30, -66, 130, 12, 6); x.fill();
  x.font = '12px ' + F_BODY; x.fillStyle = '#5a6b8c'; x.textBaseline = 'middle'; x.fillText('tuweb.es', -22, -60);
  x.fillStyle = '#1f2c4d'; rr(x, -95, -28, 110, 14, 7); x.fill();
  x.fillStyle = '#c9d3ea'; rr(x, -95, -6, 190, 9, 4); x.fill(); rr(x, -95, 10, 160, 9, 4); x.fill();
  x.fillStyle = '#ff7a2f'; rr(x, -95, 34, 70, 22, 11); x.fill(); x.fillStyle = '#7fb8f0'; rr(x, 30, 26, 60, 40, 6); x.fill();
}, { ax: 115, ay: 75 });
const cursorSpr = () => sprite('cursor', 30, 40, x => {
  cut(x, p => polyPath(p, [[0, 0], [0, 26], [7, 20], [12, 32], [17, 30], [12, 18], [21, 18]]), '#ffffff', { sb: 3, sy: 2, tex: .2, edge: 2 });
  x.strokeStyle = '#1f2c4d'; x.lineWidth = 2; x.lineJoin = 'round'; polyPath(x, [[0, 0], [0, 26], [7, 20], [12, 32], [17, 30], [12, 18], [21, 18]]); x.stroke();
}, { ax: 0, ay: 0 });
const cloudSpr = (col, k) => sprite('cloud' + col + k, 700, 280, x => {
  const r = rng(k), bumps = []; for (let i = 0; i < 9; i++) bumps.push([-300 + i * 75, -30 - Math.sin(i / 8 * Math.PI) * 90 - r() * 40, 50 + r() * 30 + Math.sin(i / 8 * Math.PI) * 40]);
  cut(x, p => { p.beginPath(); p.moveTo(-340, 0); bumps.forEach(([bx, by, br], i) => p.arc(bx, by, br, Math.PI, 0)); p.lineTo(340, 0); p.closePath(); }, col, { grad: [-250, 30], sb: 12, sy: 8 });
}, { ax: 350, ay: 280, pad: 40 });
const sunSpr = () => sprite('sun', 240, 240, x => {
  for (let i = 0; i < 14; i++) { x.save(); x.rotate(i / 14 * Math.PI * 2); cut(x, p => polyPath(p, [[-13, -82], [0, -112], [13, -82]]), '#ffb01f', { sb: 3, sy: 2 }); x.restore(); }
  cut(x, p => circ(p, 0, 0, 76), '#ffc83a', { grad: [-76, 76], sb: 6 }); cut(x, p => circ(p, 0, 0, 52), '#ffd966', { sb: 2, sy: 2, tex: .4, edge: 1.5 });
}, { ax: 120, ay: 120, pad: 30 });
const owlSpr = () => sprite('owl', 110, 130, x => {
  cut(x, p => polyPath(p, [[-36, -92], [-24, -116], [-14, -92]]), '#7c4f33', { sb: 3 }); cut(x, p => polyPath(p, [[36, -92], [24, -116], [14, -92]]), '#7c4f33', { sb: 3 });
  cut(x, p => smoothPath(p, [[-42, -60], [-34, -96], [0, -104], [34, -96], [42, -60], [36, -14], [0, 0], [-36, -14]]), '#8a5a3c', { grad: [-104, 0] });
  cut(x, p => smoothPath(p, [[-24, -40], [0, -48], [24, -40], [22, -10], [0, -4], [-22, -10]]), '#f0dcb8', { sb: 2, sy: 2 });
  x.strokeStyle = 'rgba(120,80,50,.5)'; x.lineWidth = 2; for (let i = 0; i < 3; i++) for (let j = -1; j <= 1; j++) { x.beginPath(); x.arc(j * 12, -32 + i * 10, 6, .2, Math.PI - .2); x.stroke(); }
  cut(x, p => smoothPath(p, [[-46, -62], [-52, -30], [-40, -10], [-38, -50]]), '#6a4129', { sb: 2, sy: 2 }); cut(x, p => smoothPath(p, [[46, -62], [52, -30], [40, -10], [38, -50]]), '#6a4129', { sb: 2, sy: 2 });
  cut(x, p => circ(p, -16, -72, 17), '#fff6e0', { sb: 2, sy: 2 }); cut(x, p => circ(p, 16, -72, 17), '#fff6e0', { sb: 2, sy: 2 });
  x.fillStyle = '#3a2416'; circ(x, -16, -72, 8); x.fill(); circ(x, 16, -72, 8); x.fill(); x.fillStyle = '#fff'; circ(x, -14, -75, 2.6); x.fill(); circ(x, 18, -75, 2.6); x.fill();
  cut(x, p => polyPath(p, [[-6, -62], [6, -62], [0, -50]]), '#ff9a2f', { sb: 1, sy: 1, edge: 1.5 });
}, { ax: 55, ay: 130 });
const tagSpr = (text, col) => { const w = 150, h = 46; return sprite('tag' + text + col, w, h, x => {
  cut(x, p => polyPath(p, [[-w / 2 + 14, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 14, h / 2], [-w / 2, 0]]), col, { sb: 5 });
  x.fillStyle = 'rgba(255,255,255,.85)'; circ(x, -w / 2 + 16, 0, 4); x.fill();
  x.font = '28px ' + F_BODY; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 8, 2);
}, { ax: w / 2, ay: h / 2 }); };
function iconDraw(x, kind) {
  x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = 4; x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'seo') { x.beginPath(); x.arc(-3, -3, 10, 0, 7); x.stroke(); x.beginPath(); x.moveTo(5, 5); x.lineTo(13, 13); x.stroke(); }
  else if (kind === 'copia') { x.beginPath(); x.moveTo(0, -14); x.lineTo(12, -9); x.lineTo(11, 3); x.quadraticCurveTo(8, 11, 0, 15); x.quadraticCurveTo(-8, 11, -11, 3); x.lineTo(-12, -9); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(-5, 0); x.lineTo(-1, 5); x.lineTo(6, -5); x.stroke(); }
  else if (kind === 'img') { rr(x, -13, -11, 26, 22, 4); x.stroke(); x.beginPath(); x.moveTo(-10, 8); x.lineTo(-3, -1); x.lineTo(2, 5); x.lineTo(6, 0); x.lineTo(11, 8); x.stroke(); circ(x, 5, -5, 2.5); x.fill(); }
  else if (kind === 'red') { x.beginPath(); x.moveTo(-14, -2); x.lineTo(14, -13); x.lineTo(6, 13); x.lineTo(1, 3); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(1, 3); x.lineTo(14, -13); x.stroke(); }
  else if (kind === 'chat') { rr(x, -14, -12, 28, 20, 6); x.stroke(); x.beginPath(); x.moveTo(-5, 8); x.lineTo(-8, 15); x.lineTo(2, 8); x.stroke(); [-6, 0, 6].forEach(d => { circ(x, d, -2, 1.8); x.fill(); }); }
  else if (kind === 'tienda') { rr(x, -12, -6, 24, 20, 4); x.stroke(); x.beginPath(); x.arc(0, -6, 6, Math.PI, 0); x.stroke(); }
}
const TILES = [['SEO al día', 'seo', '#2f7fe0'], ['Copias seguras', 'copia', '#2fa68a'], ['Imágenes ligeras', 'img', '#e8692a'], ['Redes sociales', 'red', '#9a55d6'], ['Chatbot para clientes', 'chat', '#d6457a'], ['Tienda online', 'tienda', '#e39a1f']];
const tileSpr = i => { const [txt, ic, col] = TILES[i], w = 250, h = 84; return sprite('tile' + i, w, h, x => {
  cut(x, p => rr(p, -w / 2, -h / 2, w, h, 12), '#fffaf0', { tex: .5 });
  x.fillStyle = 'rgba(255,240,150,.85)'; [[-w / 2 + 10, -h / 2 + 2, -.55], [w / 2 - 10, -h / 2 + 2, .55]].forEach(([tx, ty, r]) => { x.save(); x.translate(tx, ty); x.rotate(r); x.fillRect(-15, -6, 30, 12); x.restore(); });
  cut(x, p => circ(p, -w / 2 + 44, 0, 28), col, { sb: 3, sy: 2, grad: [-28, 28] });
  x.save(); x.translate(-w / 2 + 44, 0); iconDraw(x, ic); x.restore();
  x.font = (txt.length > 16 ? 25 : 30) + 'px ' + F_BODY; x.fillStyle = '#1f2c4d'; x.textAlign = 'left'; x.textBaseline = 'middle';
  const parts = txt.length > 13 ? [txt.slice(0, txt.lastIndexOf(' ')), txt.slice(txt.lastIndexOf(' ') + 1)] : [txt];
  parts.forEach((s, k) => x.fillText(s, -w / 2 + 84, (k - (parts.length - 1) / 2) * 30 + 2));
}, { ax: w / 2, ay: h / 2 }); };

/* ---------- rio ---------- */
const HZ = 392;
const rvC = v => 640 + 120 * Math.sin(3 * v + .5) - 40 * v, rvW = v => 60 + 380 * Math.pow(v, 1.3), rvY = v => HZ + 350 * v;
function riverPts(exp = 0) {
  const L = [], Rr = []; for (let i = 0; i <= 30; i++) { const v = i / 30; L.push([rvC(v) - rvW(v) / 2 - exp, rvY(v)]); Rr.push([rvC(v) + rvW(v) / 2 + exp, rvY(v)]); }
  return L.concat(Rr.reverse());
}
const RIV = riverPts(), RIVB = riverPts(7);

/* ---------- papel de fondo y mundo ---------- */
function sky(g, storm, t) {
  const a = [lerp(190, 82, storm), lerp(212, 92, storm), lerp(226, 122, storm)], b = [lerp(233, 132, storm), lerp(238, 140, storm), lerp(235, 160, storm)];
  const gr = g.createLinearGradient(0, 0, 0, HZ + 20); gr.addColorStop(0, `rgb(${a})`); gr.addColorStop(1, `rgb(${b})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, HZ + 40);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.fillStyle = PAT; g.fillRect(0, 0, W, HZ + 40); g.restore();
}
const groundPath = p => { p.beginPath(); p.moveTo(-30, HZ + 8); for (let i = 0; i <= 26; i++) { const x = -30 + i * 52; p.lineTo(x, HZ + 8 - Math.sin(i * 1.7) * 6 - Math.sin(i * .6) * 8); } p.lineTo(W + 30, H + 30); p.lineTo(-30, H + 30); p.closePath(); };

function drawWorld(g, t) {
  const storm = clamp(seg(t, 14.6, 16.6) - seg(t, 23.0, 24.4));
  const relief = seg(t, 23.0, 24.4);                    // vuelta del sol
  const cx = Math.sin(t * .17) * 16, shake = t > 16.7 && t < 17.2 || t > 19.3 && t < 19.8 ? (Math.random() * 0 + Math.sin(t * 90) * 5) : 0;
  g.save(); g.translate(shake, shake * .6);
  sky(g, storm, t);
  // nubes suaves de cielo
  for (let i = 0; i < 3; i++) put(g, cloudSpr('#f4f5f2', 20 + i), ((t * (6 + i * 3) + i * 500) % 1700) - 250, 90 + i * 60, { s: .28 + i * .06, a: 1 - storm * .9 });
  // sol
  const sunP = pop(t, 23.2, .8);
  if (sunP > 0) { put(g, sunSpr(), 1040 + cx * .2, 118, { s: .95 * sunP, rot: t * .25 }); }
  // montañas
  put(g, mountSpr(520, 210, '#8fa6b5', 1), 240 + cx * .2, HZ + 6);
  put(g, mountSpr(420, 150, '#a9bcc6', 2), 640 + cx * .2, HZ + 6);
  put(g, mountSpr(560, 240, '#8aa0b2', 3), 1040 + cx * .2, HZ + 6);
  put(g, mountSpr(300, 110, '#b6c6cd', 4), 470 + cx * .2, HZ + 6);
  // suelo nevado
  cut(g, groundPath, '#fbfbf8', { tex: .35, sb: 10, sy: -3 });
  // pinos lejanos
  const rp = rng(9);
  const pinesFar = []; for (let i = 0; i < 26; i++) { const x = i < 13 ? -20 + i * 44 + rp() * 20 : 730 + (i - 13) * 42 + rp() * 20; pinesFar.push([x, HZ + 34 + rp() * 12, .26 + rp() * .12, i % 3]); }
  pinesFar.forEach(([x, y, s, v]) => put(g, pineSpr(v), x + cx * .4, y, { s, rot: Math.sin(t * .8 + x) * .01 }));
  // río
  cut(g, p => polyPath(p, RIVB), '#f4f7f8', { sb: 8, sy: 3, tex: .3 });
  g.save(); polyPath(g, RIV); g.clip();
  const gr = g.createLinearGradient(0, HZ, 0, H); gr.addColorStop(0, '#8cc5ee'); gr.addColorStop(1, '#2270c4'); g.fillStyle = gr; g.fillRect(0, HZ, W, H);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.fillStyle = PAT; g.fillRect(0, HZ, W, H); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  for (let i = 0; i < 16; i++) { const v = ((i / 16) + t * .05 * (.4 + .8 * ((i * 7) % 5) / 5)) % 1, w = rvW(v) * (.16 + .1 * ((i * 3) % 4) / 4), xx = rvC(v) + (((i * 37) % 11) / 11 - .5) * rvW(v) * .7;
    g.strokeStyle = `rgba(255,255,255,${.35 * v + .15})`; g.lineWidth = 2 + v * 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(xx - w, rvY(v)); g.quadraticCurveTo(xx, rvY(v) - w * .25, xx + w, rvY(v)); g.stroke(); }
  g.restore();
  // segunda fila de pinos + casa
  const pinesMid = [[60, 470, .6, 0], [150, 455, .5, 1], [250, 440, .42, 2], [340, 430, .38, 0], [470, 418, .3, 1], [800, 425, .36, 2], [900, 440, .44, 0], [1010, 455, .52, 1], [1130, 470, .6, 2], [1240, 460, .55, 0]];
  pinesMid.forEach(([x, y, s, v]) => put(g, pineSpr(v), x + cx * .7, y, { s, rot: Math.sin(t * .9 + x) * .012 }));
  put(g, houseSpr(), 845 + cx * .8, 468, { s: .78 });
  const sm = (t * .3) % 1; for (let i = 0; i < 3; i++) { const q = (sm + i / 3) % 1; g.fillStyle = `rgba(255,255,255,${.7 * (1 - q)})`; circ(g, 870 + cx * .8 + q * 30 + Math.sin(q * 8) * 4, 395 - q * 60, 5 + q * 12); g.fill(); }
  // tarjeta web sobre la casa
  const cp = pop(t, 8.5, .7);
  if (cp > 0) put(g, cardSpr(), 845 + cx * .8, 300 + Math.sin(t * 2) * 6, { s: .62 * cp * (1 - .0), rot: Math.sin(t * 1.3) * .04 });
  // cursores (visitas)
  if (t > 9 && t < 14.6) for (let i = 0; i < 8; i++) {
    const t0 = 9.2 + i * .62, q = seg(t, t0, t0 + 1.7); if (q <= 0 || q >= 1) continue;
    const sx = i % 2 ? -60 : 1340, sy = 120 + (i * 97) % 300, ex = 845 + cx * .8 + ((i * 13) % 40) - 20, ey = 300;
    const e = eio(q), x = lerp(sx, ex, e), y = lerp(sy, ey, e) - Math.sin(e * Math.PI) * 90;
    put(g, cursorSpr(), x, y, { s: 1.15 * (q > .92 ? 1 - (q - .92) / .08 : 1), rot: -.2 });
    if (q > .9) { g.strokeStyle = `rgba(255,255,255,${1 - (q - .9) * 10})`; g.lineWidth = 3; circ(g, ex, ey, 20 + (q - .9) * 400); g.stroke(); }
  }
  // personaje en la barca
  const bv = .66, bx = rvC(bv) + Math.sin(t * .5) * 10 + cx, by = rvY(bv) + Math.sin(t * .8) * 4;
  const mood = (t > 15.4 && t < 23.4) ? 'worried' : 'happy';
  const wave = (t > 24.2 && t < 27.0) || (t > 30.4 && t < 33.4);
  const jump = wave ? -Math.abs(Math.sin(t * 5)) * 10 : 0;
  drawCharBoat(g, bx, by + jump, 1.08, t, { mood, storm: storm, wave });
  // pinos primer plano
  put(g, pineSpr(0), 46 + cx * 1.2, 760, { s: 1.75, rot: Math.sin(t * .8) * .008 });
  put(g, pineSpr(1), 1236 + cx * 1.3, 790, { s: 2.0, rot: Math.sin(t * .8 + 2) * .008 });
  g.restore();

  // ola de papel (guiño al vídeo de referencia)
  const wv = Math.max(0, Math.sin(seg(t, 17.8, 21.4) * Math.PI));
  if (wv > .01) drawWave(g, t, wv);
  // nube de tormenta
  const cy = lerp(-300, 110, eio(storm));
  if (storm > .01) {
    put(g, cloudSpr('#5f6482', 31), 340 + Math.sin(t * .5) * 20, cy - 10, { s: 1.15 });
    put(g, cloudSpr('#4a4e6c', 32), 900 + Math.sin(t * .4) * 20, cy - 40, { s: 1.2 });
  }
  // lluvia
  if (storm > .3) { g.save(); g.strokeStyle = `rgba(190,210,240,${.6 * storm})`; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 160; i++) { const x = (hash(i) * 1500 - 100 + (t * 250)) % 1500 - 100, y = ((hash(i + 500) * H + t * 900 * (.8 + hash(i + 900) * .5)) % (H + 80)) - 40; g.moveTo(x, y); g.lineTo(x - 12, y + 34); } g.stroke(); g.restore(); }
  // oscurecer
  if (storm > 0) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(90,105,170,${.5 * storm})`; g.fillRect(0, 0, W, H); g.restore(); }
  // relámpagos
  [16.8, 19.4].forEach(tt => { const d = t - tt; if (d > 0 && d < .5) {
    const f = d < .08 ? d / .08 : Math.pow(1 - (d - .08) / .42, 2) * .8; g.fillStyle = `rgba(255,255,240,${.75 * f})`; g.fillRect(0, 0, W, H);
    if (d < .3) { g.save(); g.strokeStyle = '#fff6b0'; g.lineWidth = 8; g.lineJoin = 'miter'; g.shadowColor = '#ffe45c'; g.shadowBlur = 20; g.beginPath();
      const bx0 = tt === 16.8 ? 420 : 900; g.moveTo(bx0, 220); g.lineTo(bx0 - 30, 300); g.lineTo(bx0 + 10, 310); g.lineTo(bx0 - 40, 400); g.lineTo(bx0 - 10, 405); g.lineTo(bx0 - 60, 490); g.stroke(); g.restore(); } } });
  // etiquetas problema
  ['404', 'Web lenta', 'Sin copias', 'Hackeo', 'Spam', 'SEO caído'].forEach((s, i) => {
    const t0 = 16.3 + i * .6, q = (t - t0) / 3.0; if (q < 0 || q > 1) return;
    const x = [240, 980, 500, 1120, 150, 780][i] + Math.sin(t * 3 + i) * 16, y = -40 + q * 700;
    put(g, tagSpr(s, ['#d4453c', '#8e5cc4', '#d98a1f', '#3a3f5c', '#c8533f', '#4a7fb0'][i]), x, y, { rot: Math.sin(t * 2.5 + i * 2) * .35, s: 1.1, a: clamp(1 - Math.max(0, q - .85) / .15) });
  });
  // pincel pintando el sol
  const sp = seg(t, 21.6, 23.3);
  if (t > 21.4 && t < 24.2) {
    const spiral = []; for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 6, r = 6 + i / 90 * 62; spiral.push([1040 + Math.cos(a) * r, 118 + Math.sin(a) * r]); }
    const fade = 1 - seg(t, 23.2, 23.9);
    const path = [[1500, 500], [1350, 340], [1200, 200], ...spiral]; const pth = poly(path.slice(0, 3), 14).concat(spiral);
    const head = paintStroke(g, pth, seg(t, 21.6, 23.2), 44, YEL, 77, fade);
    const pos = t < 21.6 ? [lerp(1500, 1200, eio(seg(t, 21.3, 21.6))), lerp(500, 200, eio(seg(t, 21.3, 21.6)))] : head;
    if (pos) { const out = t > 23.2 ? eio(seg(t, 23.2, 23.9)) : 0; drawBrush(g, pos[0] + out * 500, pos[1] - out * 300, '#ffc83a', .75, .95); }
  }
  // etiquetas
  label(g, t, 'Visitas, pedidos, mensajes… todo llega.', 640, 82, 8.0, 14.2, { size: 54 });
  label(g, t, 'Pero cuidarla es un trabajo enorme.', 640, 74, 16.5, 21.2, { size: 58, bg: '#fdeee0' });
  // logo PubliWP
  if (t > 23.9 && t < 27.2) { const s = pop(t, 24.0, .7) * gone(t, 26.9, .35); drawLogo(g, 640, 118, .78 * s, s); }
  label(g, t, 'Vigilantes que cuidan tu web.', 560, 52, 27.2, 30.3, { size: 48, bg: '#eaf6ff' });
  drawOwls(g, t);
  drawTiles(g, t);
}
function drawWave(g, t, wv) {
  const base = H - wv * 300 + 260, sway = Math.sin(t * 3) * 8;
  const layers = [['#123a78', 0, 0], ['#1d5fb0', 26, -14], ['#3d94e0', 54, -30], ['#8cc8f2', 84, -44]];
  layers.forEach(([c, dx, dy], k) => {
    cut(g, p => { p.beginPath(); p.moveTo(W + 40, H + 40); p.lineTo(560 + dx * 2, H + 40);
      p.bezierCurveTo(600 + dx * 2, base + 90 + dy, 640 + dx * 2, base + 10 + dy + sway, 800 + dx * 2, base - 70 + dy);
      p.bezierCurveTo(900 + dx * 2, base - 150 + dy, 1080 + dx, base - 170 + dy, 1180, base - 110 + dy);
      p.bezierCurveTo(1240, base - 80 + dy, W + 40, base - 60 + dy, W + 40, base - 40 + dy); p.closePath(); }, c, { sb: 10, sx: -6, sy: 2, grad: [base - 200, H] });
  });
  const r = rng(3); for (let i = 0; i < 16; i++) { const a = i / 16, x = 780 + a * 470, y = base - 150 - Math.sin(a * Math.PI) * 30 + (a > .6 ? (a - .6) * 160 : 0);
    cut(g, p => circ(p, x, y + r() * 10, 16 + r() * 14), '#ffffff', { sb: 3, sy: 2, tex: .3, edge: 1.5 }); }
}
function drawLogo(g, cx, cy, s, a) {
  if (s <= .01) return;
  const ic = sprite('logoIc', 120, 120, x => { cut(x, p => rr(p, -56, -56, 112, 112, 28), '#2f7fe0', { grad: [-56, 56], sb: 8 }); x.font = '84px ' + F_LOGO; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '800 84px ' + F_LOGO; x.fillText('P', -2, 8);
    cut(x, p => circ(p, 34, -34, 12), '#ff7a2f', { sb: 2, sy: 2, edge: 2 }); }, { ax: 60, ay: 60 });
  const tx = sprite('logoTx', 400, 130, x => { x.font = '800 104px ' + F_LOGO; x.textBaseline = 'middle'; x.textAlign = 'left'; const w1 = x.measureText('Publi').width;
    const wt = w1 + x.measureText('WP').width, x0 = -wt / 2;
    x.shadowColor = 'rgba(50,35,20,.35)'; x.shadowBlur = 6; x.shadowOffsetY = 4; x.fillStyle = '#1f2c4d'; x.fillText('Publi', x0, 4); x.fillStyle = '#2f7fe0'; x.fillText('WP', x0 + w1, 4); }, { ax: 200, ay: 65, pad: 30 });
  put(g, ic, cx - 210 * s, cy, { s: s * 1.1, rot: -.06 * (1 - a) - .04, a }); put(g, tx, cx + 50 * s, cy, { s: s, a });
}
function drawOwls(g, t) {
  const pos = [[170, 250, 'Web', '#2f7fe0'], [380, 285, 'Seguridad', '#2fa68a'], [900, 285, 'Visual', '#9a55d6'], [1110, 250, 'Envíos', '#e8692a']];
  pos.forEach(([x, y, name, col], i) => {
    const t0 = 27.6 + i * .6, s = pop(t, t0, .6); if (s <= 0) return;
    const sw = Math.sin(t * 1.6 + i * 1.3) * .06, top = -20;
    g.strokeStyle = '#f5efe0'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, top); g.lineTo(x + Math.sin(sw) * 30, y - 130 * s * .8); g.stroke();
    g.save(); g.translate(x, y - 130 * s * .8); g.rotate(sw);
    const glow = .5 + .5 * Math.sin(t * 4 + i); g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(0, 62, 4, 0, 62, 70); rg.addColorStop(0, `rgba(255,220,100,${.12 + .1 * glow})`); rg.addColorStop(1, 'rgba(255,220,100,0)'); g.fillStyle = rg; g.fillRect(-80, -10, 160, 140); g.restore();
    put(g, owlSpr(), 0, 130, { s: .9 * s, rot: 0 });
    put(g, tagSpr(name, col), 0, 162, { s: .82 * s, rot: -sw * .5 });
    g.restore();
  });
}
function drawTiles(g, t) {
  const pos = [[150, 470], [150, 565], [150, 660], [1130, 470], [1130, 565], [1130, 660]], order = [0, 3, 1, 4, 2, 5];
  order.forEach((idx, k) => { const t0 = 30.5 + k * .55, s = pop(t, t0, .55); if (s <= 0) return;
    const [x, y] = pos[idx]; put(g, tileSpr(idx), x, y, { s: s * .92, rot: (idx % 2 ? .03 : -.03) + (1 - clamp(s)) * .2 });
    const q = seg(t, t0 + .1, t0 + .7); if (q > 0 && q < 1) { g.save(); g.strokeStyle = `rgba(255,201,60,${1 - q})`; g.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; g.beginPath(); g.moveTo(x + Math.cos(a) * (60 + q * 90), y + Math.sin(a) * (30 + q * 50)); g.lineTo(x + Math.cos(a) * (76 + q * 100), y + Math.sin(a) * (40 + q * 56)); g.stroke(); } g.restore(); } });
}

/* ---------- ESCENA A: intro sobre papel ---------- */
function sceneA(g, t) {
  g.drawImage(PAPER, 0, 0);
  // motas de luz
  g.save(); g.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 24; i++) { g.globalAlpha = .25 + .25 * Math.sin(t * 1.3 + i); circ(g, hash(i) * W + Math.sin(t * .3 + i) * 20, hash(i + 40) * H, 1.5 + hash(i + 80) * 2); g.fill(); } g.restore();
  // río pintado
  const r1 = spline([[1400, 560], [1100, 620], [860, 585], [640, 640], [470, 620], [330, 660]], 16), r2 = spline([[1400, 640], [1000, 665], [760, 640], [520, 675], [300, 660]], 16);
  const p1 = seg(t, 1.2, 3.5), p2 = seg(t, 3.5, 4.8);
  paintStroke(g, r1, eio(p1), 62, BLUE, 5); paintStroke(g, r2, eio(p2), 74, BLUE, 6);
  // personaje: aparece, salta a la barca
  const boatX = 560, boatY = 655;
  const cp = pop(t, .45, .6);
  const hop = seg(t, 4.9, 5.5);
  const wx = lerp(400, boatX, eio(hop)), wy = lerp(520, boatY - 8, hop) - Math.sin(hop * Math.PI) * 90;
  if (t < 5.5) {
    put(g, boatSpr(), 500, 545, { s: .7, rot: -.1, a: gone(t, 5.3, .2) });
    if (cp > 0) drawChar(g, wx, wy, 1.0 * cp, { t, wave: t > 1.0 && t < 2.6 && false });
  } else {
    drawCharBoat(g, boatX, boatY, 1.02, t, {});
  }
  // sombra suave bajo personaje de pie
  // pincel
  const head = (p1 > 0 && p2 < 1) ? (p2 > 0 ? r2[Math.floor(eio(p2) * (r2.length - 1))] : r1[Math.floor(eio(p1) * (r1.length - 1))]) : null;
  const bin = seg(t, .8, 1.2), bout = seg(t, 4.8, 5.6);
  if (head) drawBrush(g, head[0] + bout * 500, head[1] - bout * 300, '#2e7fd6', .8, 1);
  else if (t < 1.3) drawBrush(g, lerp(1500, 1400, eio(bin)), lerp(300, 560, eio(bin)), '#2e7fd6', .8, 1);
  label(g, t, 'Tu web es tu pequeño mundo.', 640, 200, 1.8, 6.1, { size: 82 });
  g.fillStyle = `rgba(245,240,228,${1 - seg(t, 0, .5)})`; g.fillRect(0, 0, W, H);
}

/* ---------- ESCENA: libro sobre escritorio ---------- */
const DESK = (() => {
  const c = mk(W, H), x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#b7794a'); gr.addColorStop(1, '#8a5632');
  x.fillStyle = gr; x.fillRect(0, 0, W, H); const r = rng(8);
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${r() > .5 ? '60,30,10' : '210,150,100'},${.05 + r() * .1})`; x.lineWidth = 1 + r() * 2.5; const y = r() * H; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= W; px += 80) x.lineTo(px, y + Math.sin(px / 200 + i) * 6 + r() * 2); x.stroke(); }
  x.globalCompositeOperation = 'multiply'; x.globalAlpha = .5; x.fillStyle = x.createPattern(TEX, 'repeat'); x.fillRect(0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const v = x.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 850); v.addColorStop(0, 'rgba(255,220,170,.15)'); v.addColorStop(1, 'rgba(30,10,0,.5)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
  return c;
})();
function wrap(g, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; let yy = y; words.forEach(w => { const test = line + w + ' '; if (g.measureText(test).width > maxW && line) { g.fillText(line.trim(), x, yy); line = w + ' '; yy += lh; } else line = test; }); g.fillText(line.trim(), x, yy); return yy; }
function sceneBook(g, t) {
  const q = eio(seg(t, 33.4, 35.6));
  g.drawImage(DESK, 0, 0);
  // lápiz
  g.save(); g.translate(1180, 640); g.rotate(-.5); cut(g, p => rr(p, -110, -8, 220, 16, 3), '#ffc83a', { sb: 5 }); cut(g, p => polyPath(p, [[110, -8], [140, 0], [110, 8]]), '#f3c9a2', { sb: 2 }); cut(g, p => rr(p, -128, -8, 18, 16, 3), '#e56a6a', { sb: 3 }); g.restore();
  // libro
  g.save(); g.globalAlpha = q;
  cut(g, p => rr(p, 60, 36, 1160, 650, 18), '#2b5561', { sb: 30, sy: 16, tex: .7 });
  cut(g, p => rr(p, 84, 56, 1112, 610, 8), '#f1e8d4', { sb: 6, sy: 3, tex: .5 });
  const gut = g.createLinearGradient(560, 0, 720, 0); gut.addColorStop(0, 'rgba(60,40,10,0)'); gut.addColorStop(.5, 'rgba(60,40,10,.35)'); gut.addColorStop(1, 'rgba(60,40,10,0)'); g.fillStyle = gut; g.fillRect(560, 56, 160, 610);
  g.strokeStyle = 'rgba(120,90,50,.25)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(90, 668 + i * 3); g.lineTo(1190, 668 + i * 3); g.stroke(); }
  g.restore();
  // página izquierda: chat
  const cq = seg(t, 34.6, 35.2);
  if (cq > 0) {
    label(g, t, 'Solo tienes que pedirlo.', 340, 130, 34.9, 41.0, { size: 46, bg: '#fff8e6' });
    const msg = 'Revisa el SEO de mi web y prepara una copia de seguridad.';
    const typed = Math.floor(clamp((t - 35.4) / 3.0) * msg.length);
    if (t > 35.3) {
      g.font = '30px ' + F_BODY; const lines = []; { let line = ''; msg.slice(0, typed).split(' ').forEach(w => { if (g.measureText(line + w).width > 340 && line) { lines.push(line); line = w + ' '; } else line += w + ' '; }); lines.push(line); }
      const bh = 44 + lines.length * 36, bs = pop(t, 35.3, .4);
      g.save(); g.translate(340, 250 + bh / 2); g.scale(bs, bs); cut(g, p => rr(p, -200, -bh / 2, 400, bh, 20), '#2f7fe0', { sb: 6, grad: [-bh / 2, bh / 2] });
      g.fillStyle = '#fff'; g.font = '30px ' + F_BODY; g.textAlign = 'left'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l.trim(), -178, -bh / 2 + 34 + i * 36)); g.restore();
    }
    const as = pop(t, 38.6, .5);
    if (as > 0) {
      g.save(); g.translate(340, 470); g.scale(as, as);
      if (t < 39.2) { cut(g, p => rr(p, -80, -30, 160, 60, 24), '#ffffff', { sb: 6 }); [0, 1, 2].forEach(i => { g.fillStyle = '#9fb0d0'; circ(g, -26 + i * 26, Math.sin(t * 10 + i) * 5, 7); g.fill(); }); }
      else { const s2 = pop(t, 39.2, .5); g.scale(s2 / as, s2 / as); cut(g, p => rr(p, -210, -60, 420, 120, 22), '#ffffff', { sb: 6, grad: [-60, 60] });
        g.fillStyle = '#1f2c4d'; g.font = '32px ' + F_BODY; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('¡Hecho! Tu web está', -186, -18); g.fillText('revisada y protegida', -186, 22);
        cut(g, p => circ(p, 170, 0, 24), '#2fa68a', { sb: 3, sy: 2 }); g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(158, 0); g.lineTo(167, 9); g.lineTo(184, -10); g.stroke(); }
      g.restore();
    }
  }
  // el mundo: de pantalla completa a página derecha
  const rx = lerp(0, 640, q), ry = lerp(0, 118, q), rw = lerp(W, 520, q), rh = lerp(H, 292, q);
  wctx.clearRect(0, 0, W, H); drawWorld(wctx, t);
  g.save(); g.shadowColor = `rgba(30,15,0,${.4 * q})`; g.shadowBlur = 18 * q; g.shadowOffsetY = 8 * q; g.fillStyle = '#fbf8f0'; const bd = 8 * q; g.fillRect(rx - bd, ry - bd, rw + bd * 2, rh + bd * 2); g.restore();
  g.drawImage(worldC, rx, ry, rw, rh);
  if (q > .5) { const a = (q - .5) * 2; g.globalAlpha = a; label(g, t, 'Tu web, siempre cuidada.', 900, 480, 35.6, 40.8, { size: 40 }); g.globalAlpha = 1; }
}

/* ---------- ESCENA final ---------- */
function sceneEnd(g, t) {
  g.drawImage(PAPER, 0, 0);
  const rv = spline([[-100, 610], [260, 640], [600, 600], [900, 640], [1380, 610]], 18);
  const pr = eio(seg(t, 41.4, 43.0)); paintStroke(g, rv, pr, 96, BLUE, 12);
  const sp = pop(t, 41.9, .9); if (sp > 0) put(g, sunSpr(), 1130, 130, { s: .55 * sp, rot: t * .2 });
  const lp = pop(t, 41.6, .8); drawLogo(g, 640, 250, lp, lp);
  label(g, t, 'Tu WordPress, en buenas manos.', 690, 385, 43.1, 99, { size: 60, bg: '#fff8e6' });
  const cp = pop(t, 42.0, .7); if (cp > 0) drawCharBoat(g, 190 + Math.sin(t * .6) * 8, 632, 1.05 * cp, t, { wave: t > 43.5 });
  const bs = pop(t, 44.0, .55), press = t > 45.0 && t < 45.25 ? .94 : 1;
  if (bs > 0) { const btn = sprite('cta', 300, 84, x => { cut(x, p => rr(p, -150, -42, 300, 84, 42), '#ff7a2f', { grad: [-42, 42], sb: 8 }); x.font = '800 38px ' + F_LOGO; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Pruébalo hoy', 0, 4); }, { ax: 150, ay: 42 });
    put(g, btn, 900, 555, { s: bs * press, rot: .02 });
    const cq = seg(t, 44.5, 45.0); put(g, cursorSpr(), lerp(1100, 930, eio(cq)) + (t > 45 ? 0 : 0), lerp(700, 565, eio(cq)) + (t > 45 ? Math.min(6, (t - 45) * 60) : 0), { s: 1.5 });
    if (t > 45.0 && t < 45.6) { const r = (t - 45) / .6; g.strokeStyle = `rgba(255,122,47,${1 - r})`; g.lineWidth = 5; circ(g, 930, 565, 20 + r * 60); g.stroke(); } }
}

/* ---------- transición con pincel ---------- */
const WIPEPATH = poly([[-260, 100], [1540, 110], [1540, 320], [-260, 330], [-260, 585], [1540, 590]], 60);
function wipeCompose(g, t, w, drawNext) {
  const p = eio((t - w.t) / w.d), k = Math.floor(p * (WIPEPATH.length - 1));
  mctx.clearRect(0, 0, W, H); mctx.lineCap = 'round'; mctx.lineJoin = 'round'; mctx.strokeStyle = '#000'; mctx.lineWidth = 300; mctx.beginPath(); mctx.moveTo(WIPEPATH[0][0], WIPEPATH[0][1]); for (let i = 1; i <= k; i++) mctx.lineTo(WIPEPATH[i][0], WIPEPATH[i][1]); mctx.stroke();
  lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, W, H); drawNext(lctx, t); lctx.globalCompositeOperation = 'destination-in'; lctx.drawImage(maskC, 0, 0); lctx.globalCompositeOperation = 'source-over';
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(40,120,210,.55)'; g.lineWidth = 322; g.beginPath(); g.moveTo(WIPEPATH[0][0], WIPEPATH[0][1]); for (let i = 1; i <= k; i++) g.lineTo(WIPEPATH[i][0], WIPEPATH[i][1]); g.stroke(); g.restore();
  g.drawImage(layer, 0, 0);
  if (k > 0 && p < 1) { const h = WIPEPATH[k]; drawBrush(g, h[0], h[1], '#2e7fd6', .75, 1.4); }
}

/* ---------- frame ---------- */
const WP = [{ t: 6.3, d: 1.0, next: sceneWorldWrap }, { t: 33.4, d: 0, next: sceneBook }, { t: 40.3, d: 1.0, next: sceneEnd }];
function sceneWorldWrap(g, t) { drawWorld(g, t); }
const SC = [sceneA, sceneWorldWrap, sceneBook, sceneEnd];
function render(t) {
  let i = 0; while (i < WP.length && t >= WP[i].t + WP[i].d) i++;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  SC[i](ctx, t);
  if (i < WP.length && t >= WP[i].t && WP[i].d > 0) wipeCompose(ctx, t, WP[i], WP[i].next);
  // viñeta y grano final
  const v = ctx.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 800); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,0,.18)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const f = seg(t, 45.6, 46) ; if (f > 0) { ctx.fillStyle = `rgba(245,240,228,${0})`; ctx.fillRect(0, 0, W, H); }
}
window.render = render;
window.readyP = Promise.all([document.fonts.load('40px "Caveat Brush"'), document.fonts.load('40px "Patrick Hand"'), document.fonts.load('800 40px "Baloo 2"')]).then(() => { window.ready = true; });
