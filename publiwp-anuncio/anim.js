import { DUR, FPS, T, S1, CYCLES, cycleTimes, chaosTimes, CHAOS_TEXTS } from './shared.js';

// ─────────────────────────────────────────────────────────────
//  Lienzo. Diseño en 1080×1350 (4:5, ideal para LinkedIn/FB/IG).
//  Otros formatos (?w=1080&h=1080, ?w=1920&h=1080) reutilizan la
//  misma composición centrada y escalada.
// ─────────────────────────────────────────────────────────────
const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1080;
const H = +q.get('h') || 1350;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const off = document.createElement('canvas');
off.width = W; off.height = H;
const g = off.getContext('2d');
const S = Math.min(W / 1080, H / 1350);
const OX = (W - 1080 * S) / 2, OY = (H - 1350 * S) / 2;
const begin = (c) => c.setTransform(S, 0, 0, S, OX, OY);
const raw = (c) => c.setTransform(1, 0, 0, 1, 0, 0);

// Marca (sacada de publiwp.com)
const C = {
  ink: '#0d1117', slate: '#4b5773', indigo: '#4f46e5', indigo2: '#6366f1', lav: '#a5b4fc',
  bg: '#f6f8ff', line: '#dde3f0', mute: '#8899bb', red: '#ff4b5c', amber: '#f59e0b', green: '#10a37f',
  card: '#161b26',
};
const J = (w, s) => `${w} ${s}px "Plus Jakarta Sans"`;
const D = (w, s) => `${w} ${s}px "DM Sans"`;

// ── utilidades ───────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eIn = (x) => x * x * x;
const eIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eExp = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

function tx(c, s, x, y, o = {}) {
  c.save();
  c.font = (o.fam === 'D' ? D : J)(o.w || 800, o.size || 40);
  c.letterSpacing = (o.ls || 0) + 'px';
  c.textAlign = o.align || 'left';
  c.textBaseline = o.base || 'alphabetic';
  c.fillStyle = o.color || '#fff';
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  c.fillText(s, x, y);
  c.restore();
}
function tw(c, s, o = {}) {
  c.save();
  c.font = (o.fam === 'D' ? D : J)(o.w || 800, o.size || 40);
  c.letterSpacing = (o.ls || 0) + 'px';
  const w = c.measureText(s).width;
  c.restore();
  return w;
}
function wrap(c, s, maxW, o) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (tw(c, t, o) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function check(c, x, y, r, color = C.green, k = 1) {
  c.save();
  c.translate(x, y); c.scale(k, k);
  c.fillStyle = color; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = r * 0.22; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-r * 0.42, r * 0.02); c.lineTo(-r * 0.1, r * 0.34); c.lineTo(r * 0.45, -r * 0.28); c.stroke();
  c.restore();
}
function bgDark(c, glow = 0.12) {
  raw(c); c.fillStyle = C.ink; c.fillRect(0, 0, W, H);
  if (glow) {
    const gr = c.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.7);
    gr.addColorStop(0, `rgba(79,70,229,${glow})`); gr.addColorStop(1, 'rgba(79,70,229,0)');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
  }
}
function bgLight(c, t) {
  raw(c); c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
  const r = rng(7); const pts = [];
  for (let i = 0; i < 56; i++) {
    const bx = r() * W, by = r() * H, ph = r() * 6.28, sp = 0.15 + r() * 0.3;
    pts.push([bx + Math.sin(t * sp + ph) * 34, by + Math.cos(t * sp * 1.1 + ph) * 34, r()]);
  }
  c.lineWidth = 1.2;
  const md = Math.max(W, H) * 0.19;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < md) { c.strokeStyle = `rgba(79,70,229,${0.11 * (1 - d / md)})`; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[j][0], pts[j][1]); c.stroke(); }
  }
  for (const p of pts) { c.fillStyle = p[2] > 0.9 ? 'rgba(16,163,127,.55)' : p[2] > 0.82 ? 'rgba(14,116,144,.45)' : 'rgba(99,102,241,.25)'; c.beginPath(); c.arc(p[0], p[1], 2 + p[2] * 3, 0, 7); c.fill(); }
}

// ─────────────────────────────────────────────────────────────
//  ESCENA 1 · El vacío
// ─────────────────────────────────────────────────────────────
function typed(text, t, start, rate) { return clamp(Math.floor((t - start) / rate), 0, text.length); }

function sceneS1(t) {
  bgDark(g, 0.08 + 0.04 * Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 - 0.4)), 8));
  begin(g);
  // barra de navegador
  g.fillStyle = 'rgba(255,255,255,.06)'; rr(g, 90, 84, 900, 58, 16); g.fill();
  for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(124 + i * 26, 113, 7, 0, 7); g.fill(); }
  tx(g, 'misitio.com/wp-admin/post.php', 220, 121, { fam: 'D', w: 500, size: 24, color: C.mute });
  // texto tecleado
  const n = typed(S1.text, t, S1.start, S1.rate);
  const s = S1.text.slice(0, n);
  const l1 = 'Solo quería cambiar', cut = l1.length + 1;
  const a = s.slice(0, Math.min(s.length, cut)).trimEnd();
  const b = s.length > cut ? s.slice(cut) : '';
  tx(g, a, 100, 650, { size: 92, ls: -2.5, color: '#fff' });
  tx(g, b, 100, 760, { size: 92, ls: -2.5, color: '#fff' });
  const line = s.length > cut ? 1 : 0;
  const cx = 100 + tw(g, line ? b : a, { size: 92, ls: -2.5 }) + 8;
  const blink = n < S1.text.length || Math.floor(t * 4) % 2 === 0;
  if (blink) { g.fillStyle = C.indigo2; g.fillRect(cx, (line ? 760 : 650) - 78, 9, 92); }
  // pequeña alerta que asoma antes del caos
  const k = eBack(seg(t, 2.55, 2.8));
  if (k > 0) {
    g.save(); g.translate(930, 230); g.scale(k, k);
    g.fillStyle = C.red; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill();
    tx(g, '1', 0, 11, { size: 30, align: 'center', color: '#fff' });
    g.restore();
  }
}

// ─────────────────────────────────────────────────────────────
//  ESCENA 2 · El caos   (+ ESCENA 3 · implosión)
// ─────────────────────────────────────────────────────────────
const CH = chaosTimes();
const pad2 = (n) => String(n).padStart(2, '0');
function fmtTime(sec) { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60); return `${h}:${pad2(m)}:${pad2(s)}`; }

function drawChaosCard(i, ti, t, implode) {
  const r = rng(i * 131 + 17);
  const w = 540 + r() * 140, h = 118;
  let x = -60 + r() * (1080 - w + 120), y = 200 + r() * 1000;
  let rot = (r() - 0.5) * 0.22;
  const [title, sub, col] = CHAOS_TEXTS[(i * 7 + 3) % CHAOS_TEXTS.length];
  let sc = eBack(seg(t, ti, ti + 0.2));
  if (implode > 0) {
    const cx = 540 - w / 2, cy = 675 - h / 2;
    x = lerp(x, cx, eIn(implode)); y = lerp(y, cy, eIn(implode));
    rot += implode * 4 * (i % 2 ? 1 : -1);
    sc *= 1 - eIn(implode) * 0.96;
  }
  if (sc <= 0.001) return;
  g.save();
  g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.fillStyle = '#1a2130'; rr(g, -w / 2, -h / 2, w, h, 18); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(255,255,255,.09)'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = col; rr(g, -w / 2, -h / 2, 9, h, 4); g.fill();
  g.beginPath(); g.arc(-w / 2 + 52, 0, 24, 0, 7); g.fillStyle = col; g.fill();
  tx(g, '!', -w / 2 + 52, 11, { size: 32, align: 'center', color: '#0d1117' });
  const fs = tw(g, title, { size: 29, w: 700 }) > w - 130 ? 25 : 29;
  tx(g, title, -w / 2 + 92, -4, { size: fs, w: 700, color: '#fff', ls: -0.4 });
  tx(g, sub, -w / 2 + 92, 30, { fam: 'D', w: 400, size: 22, color: C.mute });
  g.restore();
}

function sceneS2(t) {
  const k = seg(t, T.s2, T.s3);
  bgDark(g, 0);
  raw(g);
  // tinte rojo creciente + pulso por pulso
  const beatP = Math.pow(Math.max(0, Math.sin((t - 3) * Math.PI * (2 + k * 5))), 6);
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(255,75,92,0)'); vg.addColorStop(1, `rgba(255,75,92,${0.10 + 0.35 * k * (0.5 + beatP)})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  begin(g);
  const imp = t >= T.s3 ? seg(t, T.s3, T.quiet) : 0;
  for (let i = 0; i < CH.length; i++) if (t >= CH[i]) drawChaosCard(i, CH[i], t, imp);
  // contador de tiempo perdido
  const fade = 1 - imp;
  const v = 30 * Math.pow(13620 / 30, Math.pow(seg(t, 3, 8), 1.3));
  const s = fmtTime(v);
  g.save(); g.globalAlpha = fade;
  tx(g, 'TIEMPO PARA CAMBIAR UN TEXTO', 540, 92, { fam: 'D', w: 700, size: 21, ls: 5, align: 'center', color: C.mute });
  const col = mix('#ffffff', C.red, seg(t, 4.5, 7));
  const cw = 50; const x0 = 540 - (s.length * cw) / 2;
  for (let i = 0; i < s.length; i++) tx(g, s[i], x0 + i * cw + cw / 2, 168, { size: 86, align: 'center', color: col, ls: -1 });
  g.restore();
}

function sceneS3(t) {
  if (t < T.quiet) { sceneS2(t); return; }
  bgDark(g, 0); begin(g);
  const lt = t - T.quiet;
  // punto latiendo
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 2 - 0.3)), 6);
  const gl = g.createRadialGradient(540, 675, 0, 540, 675, 200);
  gl.addColorStop(0, `rgba(99,102,241,${0.35 + 0.3 * beat})`); gl.addColorStop(1, 'rgba(99,102,241,0)');
  g.fillStyle = gl; g.fillRect(340, 475, 400, 400);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(540, 675, 7 + 4 * beat, 0, 7); g.fill();
  const a1 = eOut(seg(t, 9.12, 9.4)), a2 = eOut(seg(t, 9.5, 9.75));
  tx(g, '¿Y si simplemente…', 540, 520, { size: 46, w: 700, align: 'center', color: C.mute, alpha: a1 * (1 - a2 * 0.55) });
  const o2 = 30 * (1 - a2);
  tx(g, 'se lo dijeras?', 540, 820 + o2, { size: 118, ls: -4, align: 'center', color: '#fff', alpha: a2 });
}

// ─────────────────────────────────────────────────────────────
//  ESCENA 4 · Nace PubliWP
// ─────────────────────────────────────────────────────────────
function logo(c, x, y, size, alpha = 1, dark = false) {
  const ls = -0.03 * size;
  const a = 'Publi', b = 'WP';
  const wa = tw(c, a, { size, ls }), wb = tw(c, b, { size, ls });
  const x0 = x - (wa + wb) / 2;
  tx(c, a, x0, y, { size, ls, color: dark ? '#fff' : C.ink, base: 'middle', alpha });
  tx(c, b, x0 + wa, y, { size, ls, color: dark ? '#818cf8' : C.indigo, base: 'middle', alpha });
}
const LOGO_Y = 150;
function logoState(t) {
  const p = eIO(seg(t, 12.15, 12.85));
  return { size: lerp(190, 60, p), y: lerp(640, LOGO_Y, p), p };
}

function sceneS4a(t) {
  const lt = t - T.drop;
  const st = logoState(t);
  // onda de choque + destello horizontal
  begin(g);
  for (let i = 0; i < 3; i++) {
    const a = seg(lt, i * 0.12, i * 0.12 + 1.3);
    if (a > 0 && a < 1) {
      g.strokeStyle = `rgba(79,70,229,${0.55 * (1 - a)})`; g.lineWidth = 16 * (1 - a) + 2;
      g.beginPath(); g.arc(540, 640, 1000 * eOut(a), 0, 7); g.stroke();
    }
  }
  const fl = Math.exp(-lt * 3.2);
  const lg = g.createLinearGradient(0, 0, 1080, 0);
  lg.addColorStop(0, 'rgba(99,102,241,0)'); lg.addColorStop(0.5, `rgba(99,102,241,${0.6 * fl})`); lg.addColorStop(1, 'rgba(99,102,241,0)');
  g.fillStyle = lg; g.fillRect(0, 640 - 4, 1080, 8);
  // partículas
  const r = rng(99);
  for (let i = 0; i < 90; i++) {
    const ang = r() * 6.283, v = 350 + r() * 1150, life = 1.1 + r() * 1.0, sz = 3 + r() * 8, cl = r();
    const u = lt; if (u < 0 || u > life) continue;
    const kk = 2.6, d = v * (1 - Math.exp(-kk * u)) / kk;
    g.globalAlpha = 1 - u / life;
    g.fillStyle = cl > 0.85 ? C.green : cl > 0.6 ? C.lav : C.indigo2;
    g.beginPath(); g.arc(540 + Math.cos(ang) * d, 640 + Math.sin(ang) * d, sz * (1 - u / life * 0.5), 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  // logo
  const pop = lt < 0.9 ? lerp(1.5, 1, eExp(seg(lt, 0, 0.7))) : 1;
  g.save(); g.translate(540, st.y); g.scale(pop, pop); g.translate(-540, -st.y);
  logo(g, 540, st.y, st.size, clamp(lt / 0.05));
  g.restore();
  // insignia
  const ba = eOut(seg(lt, 0.9, 1.3)) * (1 - seg(t, 12.1, 12.5));
  if (ba > 0) {
    const s = 'Tu WordPress, a golpe de voz o de chat';
    const w = tw(g, s, { fam: 'D', w: 500, size: 30, ls: 0.5 }) + 90;
    g.save(); g.globalAlpha = ba; g.translate(0, (1 - ba) * 18);
    g.fillStyle = '#eef0ff'; rr(g, 540 - w / 2, 760, w, 70, 35); g.fill();
    g.strokeStyle = '#d5d9fb'; g.lineWidth = 2; g.stroke();
    g.fillStyle = C.indigo; g.beginPath(); g.arc(540 - w / 2 + 36, 795, 7, 0, 7); g.fill();
    tx(g, s, 540 - w / 2 + 58, 806, { fam: 'D', w: 500, size: 30, ls: 0.5, color: C.indigo });
    g.restore();
  }
}

// ─────────────────────────────────────────────────────────────
//  ESCENAS 4b–5 · El poder (pídelo, hecho)
// ─────────────────────────────────────────────────────────────
function pill(c, x, y, label, o = {}) {
  const fs = o.size || 24;
  const w = tw(c, label, { fam: 'D', w: 600, size: fs }) + (o.icon ? 34 : 0) + 40;
  const h = fs * 2;
  c.save();
  c.fillStyle = o.bg || '#fff'; rr(c, x, y, w, h, h / 2); c.fill();
  c.strokeStyle = o.line || C.line; c.lineWidth = 2; c.stroke();
  let cx = x + 20;
  if (o.dot) { c.fillStyle = o.dot; c.beginPath(); c.arc(cx + 7, y + h / 2, 7, 0, 7); c.fill(); cx += 20; }
  if (o.icon) { check(c, cx + 13, y + h / 2, 13, C.green); cx += 34; }
  tx(c, label, cx, y + h / 2 + fs * 0.35, { fam: 'D', w: 600, size: fs, color: o.color || C.slate });
  c.restore();
  return w;
}

function micIcon(c, x, y, r, pulse) {
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(79,70,229,.12)'; c.beginPath(); c.arc(0, 0, r * (1.25 + 0.35 * pulse), 0, 7); c.fill();
  c.fillStyle = C.indigo; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = r * 0.11; c.lineCap = 'round';
  rr(c, -r * 0.2, -r * 0.5, r * 0.4, r * 0.7, r * 0.2); c.stroke();
  c.beginPath(); c.arc(0, -r * 0.05, r * 0.38, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
  c.beginPath(); c.moveTo(0, r * 0.35); c.lineTo(0, r * 0.55); c.stroke();
  c.restore();
}

// ── visuales (origen en la esquina de la zona de contenido, 900×506) ──
const CW = 900, CHH = 506;

function vHorario(p) {
  tx(g, 'Estudio Luna', 50, 88, { size: 44, color: C.ink, ls: -1 });
  for (let i = 0; i < 4; i++) { g.fillStyle = C.line; rr(g, 520 + i * 90, 64, 70, 12, 6); g.fill(); }
  g.fillStyle = '#eef0ff'; rr(g, 50, 130, 800, 220, 26); g.fill();
  tx(g, 'HORARIO', 90, 186, { fam: 'D', w: 700, size: 20, ls: 4, color: C.indigo });
  const sw = seg(p, 0.35, 0.6);
  const oldT = 'Sábados: 9:00 – 20:00', newT = 'Sábados: 9:00 – 14:00';
  tx(g, oldT, 90, 280, { size: 56, ls: -1.5, color: C.ink, alpha: 1 - sw });
  if (sw > 0 && sw < 1) { g.fillStyle = C.red; g.fillRect(90, 262, tw(g, oldT, { size: 56, ls: -1.5 }) * Math.min(1, sw * 3), 5); }
  const ns = eOut(seg(p, 0.5, 0.75));
  if (ns > 0) {
    const w = tw(g, newT, { size: 56, ls: -1.5 });
    g.fillStyle = `rgba(79,70,229,${0.18 * (1 - seg(p, 0.75, 1))})`; rr(g, 80, 226, w * ns + 20, 72, 12); g.fill();
    g.save(); g.beginPath(); g.rect(90, 200, w * ns, 120); g.clip(); tx(g, newT, 90, 280, { size: 56, ls: -1.5, color: C.indigo }); g.restore();
  }
  for (let i = 0; i < 3; i++) { g.fillStyle = C.line; rr(g, 50, 392 + i * 30, [760, 700, 520][i], 14, 7); g.fill(); }
  const pk = eBack(seg(p, 0.85, 1));
  if (pk > 0) { g.save(); g.translate(690, 44); g.scale(pk, pk); pill(g, -70, -6, 'Publicado', { icon: true, size: 22 }); g.restore(); }
}

function vElementor(p) {
  const m = eIO(seg(p, 0.12, 0.7));
  const oldB = [[40, 40, 600, 120], [40, 200, 200, 90], [270, 190, 190, 110], [500, 215, 250, 80]];
  const newB = [[40, 30, 820, 210], [40, 270, 256, 190], [322, 270, 256, 190], [604, 270, 256, 190]];
  for (let i = 0; i < 4; i++) {
    const o = oldB[i], n = newB[i];
    const x = lerp(o[0], n[0], m), y = lerp(o[1], n[1], m), w = lerp(o[2], n[2], m), h = lerp(o[3], n[3], m);
    if (i === 0) {
      const gr = g.createLinearGradient(x, y, x + w, y + h);
      gr.addColorStop(0, mix('#cbd2e1', C.indigo, m)); gr.addColorStop(1, mix('#dde3f0', '#7c3aed', m));
      g.fillStyle = gr;
    } else g.fillStyle = mix('#dde3f0', '#ffffff', m);
    g.save();
    if (m > 0.5 && i > 0) { g.shadowColor = 'rgba(79,70,229,.18)'; g.shadowBlur = 24; g.shadowOffsetY = 10; }
    rr(g, x, y, w, h, lerp(4, 26, m)); g.fill();
    g.restore();
    if (i > 0 && m > 0.4) { g.strokeStyle = C.line; g.lineWidth = 2; rr(g, x, y, w, h, lerp(4, 26, m)); g.stroke(); }
  }
  const ta = seg(p, 0.55, 0.8);
  tx(g, 'Servicios que se notan', 80, 120, { size: 52, ls: -1.5, color: '#fff', alpha: ta });
  tx(g, 'Diseño moderno, editable con Elementor', 80, 166, { fam: 'D', w: 500, size: 26, color: 'rgba(255,255,255,.8)', alpha: ta });
  g.save(); g.globalAlpha = ta; g.fillStyle = '#fff'; rr(g, 80, 188, 170, 36, 18); g.fill(); g.restore();
  for (let i = 1; i < 4; i++) {
    const n = newB[i], a = seg(p, 0.6 + i * 0.05, 0.85 + i * 0.03);
    g.fillStyle = mix('#eef0ff', C.indigo2, 0.8); g.globalAlpha = a; g.beginPath(); g.arc(n[0] + 46, n[1] + 52, 22, 0, 7); g.fill();
    g.fillStyle = C.line; rr(g, n[0] + 28, n[1] + 110, 150, 14, 7); g.fill(); rr(g, n[0] + 28, n[1] + 138, 190, 12, 6); g.fill();
    g.globalAlpha = 1;
  }
  pill(g, 670, 470, 'Elementor', { dot: '#92003b', size: 18 });
}

function vAudit(p) {
  const items = [['SEO', 62, 98], ['Accesibilidad', 48, 100], ['Privacidad', 71, 100]];
  items.forEach(([name, a, b], i) => {
    const cx = 150 + i * 300, cy = 200, r = 96;
    const k = eOut(seg(p, 0.05 + i * 0.12, 0.7 + i * 0.1));
    const v = lerp(a, b, k);
    g.lineWidth = 22; g.lineCap = 'round';
    g.strokeStyle = '#eef1fb'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.strokeStyle = mix(C.red, C.green, clamp((v - 55) / 40)); g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (v / 100) * Math.PI * 2); g.stroke();
    tx(g, String(Math.round(v)), cx, cy + 20, { size: 62, ls: -2, align: 'center', color: C.ink });
    tx(g, name, cx, cy + 158, { size: 30, w: 700, align: 'center', color: C.ink, ls: -0.5 });
  });
  const rows = ['Títulos y descripciones corregidos', 'Contraste y textos alternativos', 'Formularios y textos legales revisados'];
  rows.forEach((s, i) => {
    const a = eOut(seg(p, 0.45 + i * 0.13, 0.6 + i * 0.13));
    g.save(); g.globalAlpha = a; g.translate((1 - a) * 30, 0);
    check(g, 84, 400 + i * 40, 13, C.green);
    tx(g, s, 112, 409 + i * 40, { fam: 'D', w: 500, size: 25, color: C.slate });
    g.restore();
  });
}

function vBackup(p) {
  const cx = 230, cy = 240;
  g.lineWidth = 20; g.lineCap = 'round';
  g.strokeStyle = '#eef1fb'; g.beginPath(); g.arc(cx, cy, 150, 0, 7); g.stroke();
  const k = eIO(seg(p, 0.05, 0.85));
  g.strokeStyle = C.indigo; g.beginPath(); g.arc(cx, cy, 150, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.stroke();
  // escudo
  g.save(); g.translate(cx, cy);
  g.beginPath(); g.moveTo(0, -78); g.lineTo(64, -52); g.lineTo(64, 6); g.quadraticCurveTo(64, 56, 0, 84); g.quadraticCurveTo(-64, 56, -64, 6); g.lineTo(-64, -52); g.closePath();
  g.fillStyle = mix('#eef0ff', C.indigo, seg(p, 0.85, 1)); g.fill();
  g.strokeStyle = C.indigo; g.lineWidth = 8; g.lineJoin = 'round'; g.stroke();
  if (p > 0.85) { g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(-28, 4); g.lineTo(-6, 28); g.lineTo(32, -20); g.stroke(); }
  g.restore();
  const rows = ['Base de datos', 'Archivos del sitio', 'Plugins y temas', 'Biblioteca de medios'];
  rows.forEach((s, i) => {
    const y = 130 + i * 78, st = 0.12 + i * 0.2, a = eOut(seg(p, st - 0.05, st + 0.05));
    g.save(); g.globalAlpha = a; g.translate((1 - a) * 40, 0);
    g.fillStyle = '#f6f8ff'; rr(g, 470, y - 30, 380, 62, 16); g.fill();
    tx(g, s, 496, y + 9, { size: 26, w: 700, color: C.ink, ls: -0.4 });
    if (p > st + 0.16) check(g, 818, y + 1, 15, C.green, eBack(seg(p, st + 0.16, st + 0.26)));
    else { g.strokeStyle = C.indigo; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(818, y + 1, 12, p * 40, p * 40 + 4.2); g.stroke(); }
    g.restore();
  });
  tx(g, 'Restaurable en un clic', 470, 470, { fam: 'D', w: 500, size: 24, color: C.mute, alpha: seg(p, 0.7, 0.95) });
}

function vCpt(p) {
  const chips = [['CPT', 'Propiedades', C.indigo], ['ACF', 'Campos', '#00a0d2'], ['JetEngine', 'Listado', '#ff4b5c']];
  chips.forEach(([a, b, col], i) => {
    const k = eBack(seg(p, i * 0.1, i * 0.1 + 0.2));
    g.save(); g.translate(50 + i * 285, 34); g.scale(k, k);
    g.fillStyle = '#fff'; rr(g, 0, 0, 262, 70, 20); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    g.fillStyle = col; rr(g, 14, 14, 42, 42, 12); g.fill();
    tx(g, a === 'JetEngine' ? 'J' : a[0], 35, 44, { size: 26, align: 'center', color: '#fff' });
    tx(g, a, 70, 33, { size: 20, w: 700, color: C.ink });
    tx(g, b, 70, 56, { fam: 'D', w: 500, size: 18, color: C.mute });
    g.restore();
  });
  const fields = [['Precio', 'número'], ['Habitaciones', 'número'], ['Ubicación', 'texto'], ['Galería', 'imágenes']];
  fields.forEach(([n, ty], i) => {
    const a = eOut(seg(p, 0.25 + i * 0.1, 0.4 + i * 0.1));
    g.save(); g.globalAlpha = a; g.translate((1 - a) * -40, 0);
    const y = 140 + i * 82;
    g.fillStyle = '#f6f8ff'; rr(g, 50, y, 360, 66, 16); g.fill();
    tx(g, n, 74, y + 42, { size: 26, w: 700, color: C.ink, ls: -0.4 });
    tx(g, ty, 386, y + 41, { fam: 'D', w: 500, size: 20, color: C.indigo, align: 'right' });
    g.restore();
  });
  [0, 1, 2].forEach((i) => {
    const a = eBack(seg(p, 0.55 + i * 0.1, 0.75 + i * 0.1));
    if (a <= 0) return;
    g.save(); g.translate(440 + (i % 2) * 210 + 100, 140 + Math.floor(i / 2) * 178 + 78); g.scale(a, a);
    const w = 200, h = 160;
    g.shadowColor = 'rgba(79,70,229,.16)'; g.shadowBlur = 20; g.shadowOffsetY = 8;
    g.fillStyle = '#fff'; rr(g, -w / 2, -h / 2, w, h, 18); g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, 0); gr.addColorStop(0, ['#c7d2fe', '#a5f3fc', '#fbcfe8'][i]); gr.addColorStop(1, ['#818cf8', '#67e8f9', '#f9a8d4'][i]);
    g.fillStyle = gr; rr(g, -w / 2 + 10, -h / 2 + 10, w - 20, 80, 12); g.fill();
    g.fillStyle = C.ink; rr(g, -w / 2 + 14, 22, 110, 12, 6); g.fill();
    g.fillStyle = C.indigo; rr(g, -w / 2 + 14, 44, 66, 14, 7); g.fill();
    g.restore();
  });
}

function vPlugins(p) {
  const names = ['Caché', 'SEO', 'Formularios', 'Slider', 'Cookies', 'Copias', 'Galería', 'Seguridad', 'Popups', 'Redirecciones', 'Imágenes', 'Menús'];
  const keep = new Set([1, 5, 7, 10]);
  const order = [0, 2, 3, 4, 6, 8, 9, 11];
  names.forEach((n, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 20 + col * 220, y = 30 + row * 140;
    const oi = order.indexOf(i);
    const k = oi < 0 ? 0 : seg(p, 0.15 + oi * 0.075, 0.3 + oi * 0.075);
    const sc = 1 - eIn(k) * 0.9, al = 1 - k;
    if (al <= 0.01) {
      g.save(); g.globalAlpha = 0.5; g.strokeStyle = C.line; g.lineWidth = 2; g.setLineDash([8, 8]); rr(g, x + 20, y + 20, 160, 80, 14); g.stroke(); g.restore();
      return;
    }
    g.save(); g.translate(x + 100, y + 60); g.scale(sc, sc); g.rotate(k * 0.5); g.globalAlpha = al;
    const kp = keep.has(i) && p > 0.85;
    g.shadowColor = kp ? 'rgba(16,163,127,.35)' : 'rgba(79,70,229,.10)'; g.shadowBlur = kp ? 26 : 14; g.shadowOffsetY = 6;
    g.fillStyle = '#fff'; rr(g, -100, -60, 200, 120, 18); g.fill(); g.shadowColor = 'transparent';
    g.strokeStyle = kp ? C.green : C.line; g.lineWidth = kp ? 3 : 2; g.stroke();
    g.fillStyle = kp ? C.green : '#eef0ff'; rr(g, -78, -36, 34, 34, 10); g.fill();
    tx(g, n, -78, 36, { size: 24, w: 700, color: C.ink, ls: -0.4 });
    g.restore();
  });
  const n = Math.round(lerp(12, 4, eIO(seg(p, 0.2, 0.85))));
  tx(g, `${n}`, 450 - 58, 486, { size: 44, align: 'right', color: C.indigo });
  tx(g, 'plugins', 450 - 44, 486, { fam: 'D', w: 500, size: 26, color: C.slate });
  tx(g, 'Menos plugins, menos ataduras', 450 + 50, 486, { fam: 'D', w: 500, size: 24, color: C.mute, alpha: seg(p, 0.7, 0.95) });
}

function vPost(p) {
  const title = 'Cómo elegir fotógrafo de boda';
  const n = Math.floor(seg(p, 0.02, 0.35) * title.length);
  g.fillStyle = '#f6f8ff'; rr(g, 40, 30, 560, 450, 22); g.fill();
  tx(g, title.slice(0, n), 70, 100, { size: 34, ls: -1, color: C.ink });
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const k = seg(p, 0.25 + i * 0.05, 0.4 + i * 0.05);
    const w = (i % 4 === 3 ? 300 : 490 + r() * 20) * k;
    g.fillStyle = C.line; rr(g, 70, 140 + i * 36, w, 14, 7); g.fill();
  }
  pill(g, 640, 36, 'Borrador', { dot: C.amber, size: 22 });
  ['Título SEO', 'Meta descripción', 'Imagen destacada', 'Enlaces internos'].forEach((s, i) => {
    const a = eBack(seg(p, 0.5 + i * 0.11, 0.62 + i * 0.11));
    if (a <= 0) return;
    g.save(); g.translate(640, 120 + i * 84 + 32); g.scale(a, a); g.translate(0, -32);
    g.fillStyle = '#fff'; rr(g, 0, 0, 230, 64, 16); g.fill(); g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    check(g, 34, 32, 14, C.green);
    tx(g, s, 60, 40, { fam: 'D', w: 600, size: 20, color: C.slate });
    g.restore();
  });
}

const VIS = { horario: vHorario, elementor: vElementor, audit: vAudit, backup: vBackup, cpt: vCpt, plugins: vPlugins, post: vPost };
const CARD = { x: 90, y: 250, w: 900, h: 560 };

function drawCycle(t, c, idx) {
  const ct = cycleTimes(c);
  if (t < c.t - 0.02 || t > ct.end + 0.3) return;
  const inn = eOut(seg(t, c.t, c.t + 0.28));
  const out = eIn(seg(t, ct.end - 0.02, ct.end + 0.28));
  const ox = (1 - inn) * 150 - out * 150;
  const alpha = inn * (1 - out);
  const p = seg(t, ct.hit, ct.done);
  begin(g);
  g.save(); g.globalAlpha = alpha; g.translate(ox, 0);
  // tarjeta con «navegador»
  g.shadowColor = 'rgba(79,70,229,.20)'; g.shadowBlur = 60; g.shadowOffsetY = 24;
  g.fillStyle = '#fff'; rr(g, CARD.x, CARD.y, CARD.w, CARD.h, 36); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#f2f4fb'; g.beginPath(); g.roundRect(CARD.x, CARD.y, CARD.w, 54, [36, 36, 0, 0]); g.fill();
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff5f57', '#febc2e', '#28c840'][i]; g.beginPath(); g.arc(CARD.x + 34 + i * 24, CARD.y + 27, 7, 0, 7); g.fill(); }
  g.fillStyle = '#fff'; rr(g, CARD.x + 150, CARD.y + 11, 420, 32, 16); g.fill();
  tx(g, 'estudioluna.es', CARD.x + 176, CARD.y + 33, { fam: 'D', w: 500, size: 18, color: C.mute });
  // zona de contenido
  g.save();
  g.beginPath(); g.roundRect(CARD.x, CARD.y + 54, CARD.w, CARD.h - 54, [0, 0, 36, 36]); g.clip();
  g.translate(CARD.x, CARD.y + 54);
  if (p <= 0 && t < ct.hit) {
    // esperando: latido tenue
    g.fillStyle = '#f6f8ff'; g.fillRect(0, 0, CW, CHH);
    g.fillStyle = C.line;
    for (let i = 0; i < 4; i++) { rr(g, 50, 60 + i * 60, [700, 560, 640, 420][i], 22, 11); g.fill(); }
  } else {
    VIS[c.id](p);
  }
  g.restore();
  // prompt
  const fo = { fam: 'D', w: 500, size: 38 };
  const lines = wrap(g, c.prompt, 700, fo);
  const bw = Math.max(...lines.map((l) => tw(g, l, fo))) + 76, bh = lines.length * 54 + 44;
  const bx = 990 - bw, by = 850;
  g.fillStyle = C.indigo; rr(g, bx, by, bw, bh, 34); g.fill();
  const nchar = Math.floor(seg(t, ct.ts, ct.te) * c.prompt.length);
  let left = nchar;
  lines.forEach((l, i) => {
    const s = l.slice(0, Math.max(0, left)); left -= l.length + 1;
    tx(g, s, bx + 38, by + 62 + i * 54, { ...fo, color: '#fff' });
  });
  const typing = t >= ct.ts && t < ct.te + 0.05;
  const mp = typing ? 0.5 + 0.5 * Math.sin(t * 22) : 0;
  micIcon(g, bx - 56, by + bh / 2, 26, mp);
  // resultado
  const dk = eBack(seg(t, ct.done, ct.done + 0.25));
  if (dk > 0) {
    g.save(); g.translate(90, by + bh + 40); g.scale(dk, dk);
    pill(g, 0, 0, c.done, { icon: true, size: 30, color: C.ink, line: '#bfead9' });
    g.restore();
  }
  g.restore();
}

function builderStrip(t, alpha) {
  const items = [['Elementor', '#92003b'], ['Gutenberg', '#1e1e1e'], ['Bricks', '#f59e0b'], ['JetEngine', '#ff4b5c'], ['ACF', '#00a0d2'], ['CPTs', C.indigo], ['WooCommerce', '#7f54b3'], ['Divi', '#8c3ffd'], ['Crocoblock', '#ff4b5c']];
  begin(g);
  g.save(); g.globalAlpha = alpha;
  g.fillStyle = '#fff'; g.fillRect(-2000, 1240, 5000, 70);
  g.fillStyle = C.line; g.fillRect(-2000, 1240, 5000, 2);
  let total = 0; const ws = items.map(([n]) => { const w = tw(g, n, { fam: 'D', w: 600, size: 26 }) + 70; total += w; return w; });
  let x = -(t * 130 % total) - total;
  while (x < 1080 + 600) {
    items.forEach(([n, col], i) => {
      g.fillStyle = col; g.beginPath(); g.arc(x + 12, 1275, 7, 0, 7); g.fill();
      tx(g, n, x + 30, 1284, { fam: 'D', w: 600, size: 26, color: C.slate });
      x += ws[i];
    });
  }
  g.restore();
}

function sceneLight(t) {
  bgLight(g, t);
  const st = logoState(t);
  // el logo pequeño de arriba una vez asentado
  sceneS4aLogoLayer(t);
  const stripA = eOut(seg(t, 12.6, 13.0)) * (1 - eIn(seg(t, T.s6 - 0.3, T.s6)));
  builderStrip(t, stripA);
  CYCLES.forEach((c, i) => drawCycle(t, c, i));
}
function sceneS4aLogoLayer(t) { if (t < T.s6 - 0.05) sceneS4a(t); }

// ─────────────────────────────────────────────────────────────
//  ESCENA 6 · Una web. Cien webs. Una conversación.
// ─────────────────────────────────────────────────────────────
function sceneS6(t) {
  bgDark(g, 0.16); begin(g);
  const lt = t - T.s6;
  const zoom = lerp(2.5, 0.62, eIO(seg(lt, 0.5, 3.3)));
  g.save(); g.translate(540, 620); g.scale(zoom, zoom);
  const N = 10, cw = 200, chh = 138;
  const pal = [C.indigo2, '#0e7490', '#7c3aed', '#10a37f', '#ff4b5c', '#f59e0b', '#00a0d2'];
  for (let gy = -N; gy <= N; gy++) for (let gx = -N; gx <= N; gx++) {
    const dist = Math.hypot(gx, gy);
    const rd = rng((gx + 40) * 97 + (gy + 40) * 13);
    const delay = 0.1 + dist * 0.13;
    const a = eBack(seg(lt, delay, delay + 0.4));
    if (a <= 0.01) continue;
    const col = pal[Math.floor(rd() * pal.length)], col2 = pal[Math.floor(rd() * pal.length)];
    g.save(); g.translate(gx * cw, gy * chh); g.scale(a, a);
    g.fillStyle = C.card; rr(g, -85, -58, 170, 116, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.14)'; rr(g, -85, -58, 170, 18, 9); g.fill();
    g.fillStyle = col; rr(g, -72, -30, 100, 40, 8); g.fill();
    g.fillStyle = col2; g.globalAlpha = 0.8; rr(g, 34, -30, 38, 40, 8); g.fill(); g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, -72, 22, 120, 9, 4); g.fill(); rr(g, -72, 38, 80, 9, 4); g.fill();
    const ck = eBack(seg(lt, delay + 0.5 + rd() * 0.9, delay + 0.75 + rd() * 0.9));
    if (ck > 0 && rd() > 0.35) check(g, 70, 46, 15, C.green, ck);
    g.restore();
  }
  g.restore();
  // degradado inferior para leer el texto
  const gr = g.createLinearGradient(0, 760, 0, 1350);
  gr.addColorStop(0, 'rgba(13,17,23,0)'); gr.addColorStop(0.45, 'rgba(13,17,23,.94)'); gr.addColorStop(1, 'rgba(13,17,23,1)');
  g.fillStyle = gr; g.fillRect(-2000, 760, 5000, 700);
  const top = g.createLinearGradient(0, 0, 0, 280);
  top.addColorStop(0, 'rgba(13,17,23,.85)'); top.addColorStop(1, 'rgba(13,17,23,0)');
  g.fillStyle = top; g.fillRect(-2000, 0, 5000, 280);
  logo(g, 540, LOGO_Y, 60, 1, true);
  // frases
  const ph = [[26, 27.2, 'Una ', 'web.'], [27.2, 28.7, 'Cien ', 'webs.'], [28.7, 30, 'Una ', 'conversación.']];
  for (const [a, b, w1, w2] of ph) {
    if (t < a || t > b + 0.15) continue;
    const inn = eBack(seg(t, a, a + 0.28)), out = seg(t, b - 0.1, b + 0.1);
    let size = 128; const full = w1 + w2;
    const wd = tw(g, full, { size, ls: -4 }); if (wd > 940) size = Math.floor(size * 940 / wd);
    const w1w = tw(g, w1, { size, ls: -4 }), w2w = tw(g, w2, { size, ls: -4 });
    const x0 = 540 - (w1w + w2w) / 2;
    g.save(); g.translate(540, 1110); g.scale(lerp(0.85, 1, inn), lerp(0.85, 1, inn)); g.translate(-540, -1110 - out * 30);
    g.globalAlpha = clamp(inn) * (1 - out);
    tx(g, w1, x0, 1110, { size, ls: -4, color: '#fff' });
    tx(g, w2, x0 + w1w, 1110, { size, ls: -4, color: C.lav });
    g.restore();
  }
}

// ─────────────────────────────────────────────────────────────
//  ESCENA 7 · Cierre
// ─────────────────────────────────────────────────────────────
function sceneS7(t) {
  bgDark(g, 0); raw(g);
  const lt = t - T.s7;
  const a = g.createRadialGradient(W * 0.2, H * 0.62, 0, W * 0.2, H * 0.62, Math.max(W, H) * 0.65);
  a.addColorStop(0, 'rgba(79,70,229,.5)'); a.addColorStop(1, 'rgba(79,70,229,0)');
  g.fillStyle = a; g.fillRect(0, 0, W, H);
  const b = g.createRadialGradient(W * 0.85, H * 0.3, 0, W * 0.85, H * 0.3, Math.max(W, H) * 0.5);
  b.addColorStop(0, 'rgba(14,116,144,.32)'); b.addColorStop(1, 'rgba(14,116,144,0)');
  g.fillStyle = b; g.fillRect(0, 0, W, H);
  // partículas flotando
  const r = rng(3);
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y0 = r() * H, sp = 10 + r() * 30, sz = 1.5 + r() * 3;
    g.fillStyle = `rgba(165,180,252,${0.15 + r() * 0.35})`; g.beginPath(); g.arc(x, (y0 - t * sp + H * 4) % H, sz, 0, 7); g.fill();
  }
  begin(g);
  const words = [['Por', 0.15, 0], ['fin,', 0.45, 0], ['un', 0.75, 0], ['WordPress', 1.05, 0], ['que', 1.5, 1], ['te', 1.8, 1], ['hace', 2.1, 1], ['caso.', 2.4, 1]];
  const size = 104, ls = -3.5;
  const lineW = [0, 0];
  words.forEach(([w, , l]) => { lineW[l] += tw(g, w + ' ', { size, ls }); });
  const yBase = [520, 640];
  const xc = [0, 0];
  const lift = -eIn(seg(lt, 2.4, 3.0)) * 0;
  words.forEach(([w, ts, l]) => {
    const x0 = 540 - lineW[l] / 2 + xc[l];
    xc[l] += tw(g, w + ' ', { size, ls });
    const k = eOut(seg(lt, ts, ts + 0.3));
    if (k <= 0) return;
    g.save(); g.globalAlpha = k;
    const grad = g.createLinearGradient(x0, 0, x0 + 300, 0); grad.addColorStop(0, '#c7d2fe'); grad.addColorStop(1, '#818cf8');
    tx(g, w, x0, yBase[l] + (1 - k) * 46 + lift, { size, ls, color: l ? grad : '#fff' });
    g.restore();
  });
  // subrayado
  const ul = eIO(seg(lt, 2.7, 3.2));
  if (ul > 0) { g.fillStyle = C.indigo2; rr(g, 540 - lineW[1] / 2, 668, (lineW[1] - 20) * ul, 8, 4); g.fill(); }
  // logo + url + botón
  const ka = eOut(seg(lt, 3.0, 3.5));
  if (ka > 0) {
    g.save(); g.globalAlpha = ka; g.translate(0, (1 - ka) * 30);
    logo(g, 540, 850, 88, 1, true);
    tx(g, 'publiwp.com', 540, 935, { fam: 'D', w: 500, size: 40, align: 'center', color: 'rgba(255,255,255,.72)', ls: 1 });
    g.restore();
  }
  const kb = eBack(seg(lt, 3.2, 3.65));
  if (kb > 0) {
    const pulse = 1 + 0.025 * Math.sin(lt * 6);
    g.save(); g.translate(540, 1060); g.scale(kb * pulse, kb * pulse);
    g.shadowColor = 'rgba(99,102,241,.6)'; g.shadowBlur = 40;
    g.fillStyle = '#fff'; rr(g, -150, -40, 300, 80, 24); g.fill();
    g.shadowColor = 'transparent';
    tx(g, 'Empezar →', 0, 12, { size: 34, w: 800, align: 'center', color: C.ink, ls: -0.5 });
    g.restore();
  }
  const ch = ['Diseño', 'SEO', 'Accesibilidad', 'Privacidad', 'Copias'];
  const cs = eOut(seg(lt, 3.35, 3.8));
  if (cs > 0) {
    g.save(); g.globalAlpha = cs * 0.85;
    const ws = ch.map((s) => tw(g, s, { fam: 'D', w: 600, size: 24 }) + 40);
    const tot = ws.reduce((a, b) => a + b, 0) + (ch.length - 1) * 14;
    let x = 540 - tot / 2;
    ch.forEach((s, i) => {
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; rr(g, x, 1150, ws[i], 52, 26); g.stroke();
      tx(g, s, x + ws[i] / 2, 1184, { fam: 'D', w: 600, size: 24, align: 'center', color: 'rgba(255,255,255,.8)' });
      x += ws[i] + 14;
    });
    g.restore();
  }
}

// ─────────────────────────────────────────────────────────────
//  Composición final + efectos de cámara
// ─────────────────────────────────────────────────────────────
function shakeAmp(t) {
  let A = 0;
  if (t >= T.s2 && t < T.s3) A += 1.5 + 16 * Math.pow(seg(t, T.s2, T.s3), 2);
  if (t >= T.s3 && t < T.quiet) A += 14 * (1 - seg(t, T.s3, T.quiet));
  for (const h of [T.drop, T.s6, T.s7]) if (t >= h) A += 22 * Math.exp(-(t - h) * 9);
  return A;
}

export function draw(t) {
  t = clamp(t, 0, DUR - 0.0001);
  raw(g); g.globalAlpha = 1; g.shadowColor = 'transparent'; g.setLineDash([]);
  if (t < T.s2) sceneS1(t);
  else if (t < T.s3) sceneS2(t);
  else if (t < T.drop) sceneS3(t);
  else if (t < T.s6) sceneLight(t);
  else if (t < T.s7) sceneS6(t);
  else sceneS7(t);

  // ── post ──
  raw(ctx); ctx.globalAlpha = 1;
  const A = shakeAmp(t);
  const sx = A * (Math.sin(t * 71.3) * 0.6 + Math.sin(t * 113.1) * 0.4);
  const sy = A * (Math.cos(t * 83.7) * 0.6 + Math.cos(t * 97.9) * 0.4);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const glitch = (t > 7.15 && t < 8.0) || (t > 5.9 && t < 6.05) || (t > 6.6 && t < 6.72);
  if (glitch) {
    const r = rng(Math.floor(t * 30) * 17 + 5);
    let y = 0;
    while (y < H) {
      const h = 14 + r() * 90; const off2 = (r() - 0.5) * (t > 7.15 ? 150 : 60);
      ctx.drawImage(off, 0, y, W, h, sx + off2, y + sy, W, h);
      y += h;
    }
  } else ctx.drawImage(off, sx, sy);
  // parpadeo blanco justo antes del corte
  if (t > 8.0 && t < 9.0) {
    const f = Math.abs(Math.sin(t * 60)) * 0.5 * (1 - seg(t, 8.3, 9.0)) * (t < 8.3 ? 1 : 0.3);
    ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H);
  }
  // destellos de impacto
  const fl = [[T.drop, 1, 7], [T.s6, 0.55, 8], [T.s7, 0.8, 7]];
  for (const [h, a, k] of fl) if (t >= h) { ctx.fillStyle = `rgba(255,255,255,${a * Math.exp(-(t - h) * k)})`; ctx.fillRect(0, 0, W, H); }
  // fundido inicial
  const fi = 1 - seg(t, 0, 0.35);
  if (fi > 0) { ctx.fillStyle = `rgba(0,0,0,${fi})`; ctx.fillRect(0, 0, W, H); }
}

// ─────────────────────────────────────────────────────────────
//  Arranque: fuentes + modo render (Playwright) o vista previa
// ─────────────────────────────────────────────────────────────
async function boot() {
  const fonts = [
    ['Plus Jakarta Sans', 'fonts/plus-jakarta-sans-latin-700-normal.woff2', '700'],
    ['Plus Jakarta Sans', 'fonts/plus-jakarta-sans-latin-800-normal.woff2', '800'],
    ['DM Sans', 'fonts/dm-sans-latin-400-normal.woff2', '400'],
    ['DM Sans', 'fonts/dm-sans-latin-500-normal.woff2', '500'],
    ['DM Sans', 'fonts/dm-sans-latin-500-normal.woff2', '600'],
    ['DM Sans', 'fonts/dm-sans-latin-500-normal.woff2', '700'],
  ];
  for (const [fam, url, w] of fonts) { const f = new FontFace(fam, `url(${url})`, { weight: w }); await f.load(); document.fonts.add(f); }
  window.draw = draw; window.DUR = DUR; window.FPS = FPS;
  draw(0);
  window.READY = true;
  if (q.get('render')) return;
  // vista previa en navegador: clic para reproducir con sonido
  const ov = document.getElementById('play');
  const audio = new Audio('out/audio.wav');
  cv.style.width = 'min(100vw, ' + (100 * W / H) + 'vh)'; cv.style.height = 'auto';
  ov.style.display = 'flex';
  ov.onclick = () => {
    ov.style.display = 'none'; audio.currentTime = 0; audio.play().catch(() => {});
    const t0 = performance.now();
    const loop = () => {
      const t = audio.paused ? (performance.now() - t0) / 1000 : audio.currentTime;
      draw(t); if (t < DUR) requestAnimationFrame(loop); else ov.style.display = 'flex';
    };
    loop();
  };
}
boot();
