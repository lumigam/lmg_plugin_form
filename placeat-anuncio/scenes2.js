// Escenas 5-7: el talento (montaje), el relevo y la ciudad de cubos, y el cierre con el logotipo.
import {
  E, begin, raw, C, clamp, seg, lerp, eOut, eIn, eIO, eSine, eBack, eElastic, rng, mix, shade, rr, tx, tw, cubeIso, CUBE_BLUE, CUBE_NAVY, mixv,
} from './lib.js';
import { person, headFront, bustBody, LUCIA, DIEGO, pose, lerpPose, walkPose, idlePose } from './people.js';
import { W, T, TXT, VIGN, FINAL } from './shared.js';
import { drawSky, drawFar, drawMid, drawGround, drawLamp, drawShadow, sparkles, GROUND, SC, STRIDE } from './world.js';

const ghost = new OffscreenCanvas(8, 8).getContext('2d');

// ═════════════════════════════════════════════════════════════
//  ESCENA 5 · Talento hay. Sobra.
// ═════════════════════════════════════════════════════════════
const PEOPLE = {
  premium: { skin: C.skin3, hair: 'short', hairC: '#5a3a25', eyeC: '#5a3b28', top: '#f7f2e8', apron: '#a8c000' },
  lectura: { skin: C.skin1, hair: 'long', hairC: '#b5532f', eyeC: '#4d8a5a', top: '#4b8fcf' },
  taller: { skin: C.skin4, hair: 'short', hairC: '#c9a25a', eyeC: '#4b7fb0', top: '#f5b83d', apron: '#1d3f8a', glasses: true },
  arte: { skin: C.skin2, hair: 'bun', hairC: '#7a4a2b', eyeC: '#6b4a2e', top: '#e0607e' },
  ocioA: { skin: C.skin1, hair: 'bald', hairC: '#9a9a9a', top: '#2bb3a3', beard: true },
  ocioB: { skin: C.skin3, hair: 'short', hairC: '#3b2a1f', eyeC: '#5a3b28', top: '#f5b83d' },
  ocioC: { skin: C.skin2, hair: 'long', hairC: '#e2b25c', eyeC: '#4b7fb0', top: '#e0607e' },
};
const PANEL = { x: 90, y: 400, w: 900, h: 740 };
const PASTEL = { premium: '#eef5c8', lectura: '#dcecfb', taller: '#fdf0cf', arte: '#fde4ea', ocio: '#d8f3ef' };

// dibuja un busto con escala y devuelve las manos en coordenadas locales del panel
function bust(c, x, y, o, arms, k = {}, sc = 1.9) {
  c.save(); c.translate(x, y); c.scale(sc, sc);
  const hands = bustBody(c, 0, 0, o, arms);
  headFront(c, 0, -42, o, k);
  c.restore();
  return hands.map(([hx, hy]) => [x + hx * sc, y + hy * sc]);
}
const ang = (a) => a;

// ── viñetas ──────────────────────────────────────────────────
function vPremium(c, lt) {
  const o = PEOPLE.premium;
  // mostrador
  c.fillStyle = '#c99a63'; rr(c, 0, 560, 900, 220, 0); c.fill();
  c.fillStyle = '#e0b681'; c.fillRect(0, 548, 900, 22);
  const jars = [[0.15, '#c1392b', 'Pimienta'], [0.55, '#2c3e50', 'Sal'], [0.95, '#d4a017', 'Miel']];
  // caja
  const bx = 560, by = 456;
  c.fillStyle = '#b08557'; rr(c, bx, by, 290, 106, [0, 0, 14, 14]); c.fill();
  c.fillStyle = '#c99d6d'; c.beginPath(); c.moveTo(bx - 10, by + 10); c.lineTo(bx + 30, by - 30); c.lineTo(bx + 260, by - 30); c.lineTo(bx + 300, by + 10); c.closePath(); c.fill();
  c.fillStyle = '#7b5730'; c.fillRect(bx, by + 8, 290, 6);
  // frascos que van a la caja
  let hand = null;
  jars.forEach(([t0, col, name], i) => {
    const u = clamp((lt - t0 * 0.9) / 0.5);
    const sx0 = 330, sy0 = 470, ex = bx + 50 + i * 82, ey = by - 10;
    const px = lerp(sx0, ex, eIO(u)), py = lerp(sy0, ey, u) - 90 * Math.sin(Math.PI * u);
    if (u <= 0) { c.save(); c.translate(280 + i * 40, 520); c.fillStyle = col; rr(c, -24, -60, 48, 70, 10); c.fill(); c.fillStyle = '#fff'; rr(c, -24, -40, 48, 26, 2); c.fill(); c.restore(); return; }
    c.save(); c.translate(px, py); c.rotate((u < 1 ? (1 - u) * 0.3 : 0));
    c.fillStyle = '#e7e0d0'; rr(c, -24, -74, 48, 14, 4); c.fill();
    c.fillStyle = col; rr(c, -24, -62, 48, 74, 10); c.fill(); c.fillStyle = '#fff'; rr(c, -24, -42, 48, 30, 3); c.fill();
    c.fillStyle = '#26350a'; c.fillRect(-16, -34, 32, 4); c.fillRect(-16, -26, 24, 4);
    c.restore();
    if (u > 0 && u < 1) hand = [px - 20, py + 10];
  });
  // persona
  const act = 0.5 + 0.5 * Math.sin(lt * 9);
  const held = lt < 1.3 ? eSine(clamp(lt / 0.4)) : 0;
  bust(c, 250, 430, o, { lsa: 0.5, lea: 0.6, rsa: 0.9 + 0.6 * act, rea: 0.9 - 0.3 * act }, { smile: 0.95, look: 0.5, blink: lt % 1.6 > 1.5 });
  // etiqueta PREMIUM en la caja
  const la = eOut(seg(lt, 1.05, 1.3));
  if (la > 0) { c.globalAlpha = la; c.fillStyle = '#26350a'; rr(c, bx + 40, by + 40, 210, 46, 8); c.fill(); tx(c, 'PLACEAT Premium', bx + 145, by + 72, { size: 21, w: 600, color: '#eaf3b2', align: 'center' }); c.globalAlpha = 1; }
}

function vLectura(c, lt) {
  const o = PEOPLE.lectura;
  const bx = 450, by = 640;
  bust(c, 450, 420, o, { lsa: 0.55, lea: 0.9, rsa: 0.55, rea: 0.9 }, { smile: 0.9, look: 0, blink: lt % 1.7 > 1.6 });
  // libro abierto (delante del cuerpo)
  c.fillStyle = '#153061'; rr(c, bx - 250, by - 30, 500, 24, 6); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(bx, by - 40); c.lineTo(bx - 240, by - 110); c.lineTo(bx - 240, by - 24); c.lineTo(bx, by + 30); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(bx, by - 40); c.lineTo(bx + 240, by - 110); c.lineTo(bx + 240, by - 24); c.lineTo(bx, by + 30); c.closePath(); c.fill();
  c.fillStyle = '#e4ebf7'; for (let i = 0; i < 4; i++) { rr(c, bx - 205, by - 88 + i * 18 + 10, 150, 8, 4); c.fill(); rr(c, bx + 55, by - 88 + i * 18 + 10, 150, 8, 4); c.fill(); }
  c.fillStyle = o.skin; c.beginPath(); c.arc(bx - 190, by - 20, 20, 0, 7); c.arc(bx + 190, by - 20, 20, 0, 7); c.fill();
  // pictogramas que salen del libro
  const icons = [
    (g) => { g.fillStyle = '#ffd166'; g.beginPath(); g.arc(0, 0, 20, 0, 7); g.fill(); g.strokeStyle = '#ffd166'; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); g.stroke(); } },
    (g) => { g.fillStyle = '#e0607e'; g.beginPath(); g.moveTo(-34, 4); g.lineTo(0, -32); g.lineTo(34, 4); g.closePath(); g.fill(); g.fillStyle = '#4b8fcf'; g.fillRect(-24, 4, 48, 32); g.fillStyle = '#fff'; g.fillRect(-7, 16, 14, 20); },
    (g) => { g.fillStyle = '#e0453b'; g.beginPath(); g.moveTo(0, 32); g.bezierCurveTo(-46, -2, -30, -38, 0, -14); g.bezierCurveTo(30, -38, 46, -2, 0, 32); g.fill(); },
    (g) => { g.fillStyle = '#a8c000'; rr(g, -26, -22, 46, 50, 10); g.fill(); g.strokeStyle = '#a8c000'; g.lineWidth = 8; g.beginPath(); g.arc(24, 2, 14, -1.3, 1.3); g.stroke(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(-14, -12, 8, 26); },
    (g) => { g.fillStyle = '#4b8fcf'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 16 : 38; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); },
  ];
  icons.forEach((ic, i) => {
    const t0 = 0.25 + i * 0.2, u = clamp((lt - t0) / 0.5);
    if (u <= 0) return;
    const tx0 = 450 + (i - 2) * 82, ty0 = by - 90;
    const tx1 = 90 + i * 172, ty1 = 120;
    const px = lerp(tx0, tx1 + 50, eOut(u)), py = lerp(ty0, ty1, eOut(u)) - 60 * Math.sin(Math.PI * u), sc = lerp(0.5, 1, eBack(u));
    c.save(); c.translate(px, py); c.scale(sc, sc);
    c.shadowColor = 'rgba(21,47,115,.18)'; c.shadowBlur = 16; c.shadowOffsetY = 6;
    c.fillStyle = '#fff'; rr(c, -56, -56, 112, 112, 24); c.fill(); c.shadowColor = 'transparent';
    ic(c); c.restore();
  });
  const ck = eBack(seg(lt, 1.15, 1.4));
  if (ck > 0) { c.save(); c.translate(790, 110); c.scale(ck, ck); c.fillStyle = C.green; c.beginPath(); c.arc(0, 0, 38, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-16, 2); c.lineTo(-4, 15); c.lineTo(18, -12); c.stroke(); c.restore(); }
}

function vTaller(c, lt) {
  const o = PEOPLE.taller;
  c.fillStyle = '#b98b55'; c.fillRect(0, 560, 900, 220); c.fillStyle = '#d3a56c'; c.fillRect(0, 548, 900, 22);
  // herramientas de pared
  c.fillStyle = 'rgba(21,47,115,.12)'; for (let i = 0; i < 5; i++) { rr(c, 560 + i * 62, 90 + (i % 2) * 30, 22, 140, 6); c.fill(); }
  const sand = Math.sin(lt * 16);
  const done = eSine(seg(lt, 1.0, 1.25));
  const bx = 560, by = 548;
  // cubo de madera que se convierte en cubo azul
  const wood = { top: '#e3b27a', left: '#b57d47', right: '#cc9560' };
  const blue = CUBE_BLUE;
  c.save(); c.translate(bx, 0);
  cubeIso(c, 0, by, 180, wood, 1 - done);
  if (done > 0) cubeIso(c, 0, by, 180, blue, done, done * 0.6);
  c.restore();
  // serrín
  if (lt < 1.1) { const r = rng(4); for (let i = 0; i < 16; i++) { const u = ((lt * 2.4 + r()) % 1); c.fillStyle = `rgba(230,190,120,${1 - u})`; c.beginPath(); c.arc(bx - 80 + r() * 160 + Math.sin(i) * 10, by - 170 + u * 60, 3, 0, 7); c.fill(); } }
  bust(c, 260, 430, o, { lsa: 0.7, lea: 0.4, rsa: 1.0 + 0.16 * sand, rea: 0.3 }, { smile: 0.9, look: 0.5, tilt: 0.05 * sand });
  if (done > 0) sparkles(c, bx, by - 130, seg(lt, 1.0, 1.8) * 0.8, 8, 120);
}

function vArte(c, lt) {
  const o = PEOPLE.arte;
  // caballete + lienzo
  c.fillStyle = '#b98b55'; c.save(); c.translate(560, 0);
  c.fillRect(-160, 500, 12, 260); c.fillRect(150, 500, 12, 260); c.fillRect(-4, 470, 10, 290);
  c.fillStyle = '#fff'; rr(c, -230, 60, 460, 420, 12); c.fill(); c.strokeStyle = '#e4d6bf'; c.lineWidth = 8; c.stroke();
  c.save(); c.beginPath(); c.rect(-220, 70, 440, 400); c.clip();
  const p1 = eOut(seg(lt, 0.1, 0.5)), p2 = eOut(seg(lt, 0.4, 0.8)), p3 = eOut(seg(lt, 0.7, 1.15));
  c.fillStyle = '#8fd0f0'; c.fillRect(-220, 70, 440 * p1, 400);
  c.fillStyle = '#ffd166'; c.beginPath(); c.arc(90, 170, 60 * p2, 0, 7); c.fill();
  c.fillStyle = '#67a340'; c.beginPath(); c.ellipse(-90, 470, 250 * p3, 150 * p3, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#4b8fcf'; c.beginPath(); c.ellipse(150, 480, 200 * p3, 100 * p3, 0, Math.PI, 0); c.fill();
  c.restore(); c.restore();
  const bx = 560 + lerp(-150, 150, (Math.sin(lt * 7) * 0.5 + 0.5));
  const by = lerp(150, 380, (Math.sin(lt * 5 + 1) * 0.5 + 0.5));
  bust(c, 240, 430, o, { lsa: 0.4, lea: 0.5, rsa: 1.75 + 0.15 * Math.sin(lt * 7), rea: 0.2 }, { smile: 0.95, look: 0.7, tilt: -0.03 });
  // pincel
  c.fillStyle = '#c1392b'; c.beginPath(); c.arc(bx * 0.999, by, 8, 0, 7); c.fill();
  // paleta
  c.fillStyle = '#e7c99a'; c.beginPath(); c.ellipse(120, 560, 70, 46, 0.2, 0, 7); c.fill();
  ['#e0453b', '#ffd166', '#4b8fcf', '#67a340'].forEach((cc, i) => { c.fillStyle = cc; c.beginPath(); c.arc(80 + i * 26, 548 + (i % 2) * 22, 9, 0, 7); c.fill(); });
}

function vOcio(c, lt) {
  const P = [PEOPLE.ocioA, PEOPLE.ocioB, PEOPLE.ocioC], xs = [170, 450, 730], ys = [540, 520, 540];
  const sc = [1.5, 1.7, 1.5];
  P.forEach((o, i) => {
    const b = Math.abs(Math.sin(lt * 7 + i * 1.3)) * 34;
    const up = Math.sin(lt * 7 + i * 1.3);
    bust(c, xs[i], ys[i] - b, o, { lsa: 2.5 + 0.2 * up, lea: 0.3, rsa: 2.5 - 0.2 * up, rea: 0.3 }, { smile: 1, tilt: 0.06 * Math.sin(lt * 7 + i) }, sc[i]);
  });
  // confeti
  const r = rng(21);
  for (let i = 0; i < 46; i++) {
    const x = r() * 900, spd = 140 + r() * 180, y = ((lt * spd + r() * 800) % 780) - 20;
    c.save(); c.translate(x + Math.sin(lt * 3 + i) * 14, y); c.rotate(lt * 4 + i); c.fillStyle = ['#e0607e', '#ffd166', '#4b8fcf', '#a8c000', '#2bb3a3'][i % 5]; c.fillRect(-6, -3, 12, 6); c.restore();
  }
  // notas musicales
  ['♪', '♫', '♪'].forEach((n, i) => { const u = (lt * 0.9 + i * 0.33) % 1; tx(c, n, 220 + i * 240, 200 - u * 90, { size: 60, w: 700, color: '#1d7c72', alpha: 1 - u, align: 'center' }); });
}

const VFN = { premium: vPremium, lectura: vLectura, taller: vTaller, arte: vArte, ocio: vOcio };

export function drawMontage(c, t) {
  raw(c); c.fillStyle = C.cream; c.fillRect(0, 0, E.W, E.H);
  // puntos de fondo
  const r = rng(3); c.fillStyle = 'rgba(21,47,115,.05)';
  for (let i = 0; i < 80; i++) { c.beginPath(); c.arc(r() * E.W, r() * E.H, 3 + r() * 6, 0, 7); c.fill(); }
  begin(c);
  // titular
  const a = eOut(seg(t, TXT.talento.t0, TXT.talento.t0 + 0.6));
  tx(c, TXT.talento.a, 540, 205, { size: 96, w: 700, align: 'center', color: C.navy, alpha: a, ls: -2 });
  tx(c, TXT.talento.b, 540, 318, { size: 96, w: 700, align: 'center', color: C.blue, alpha: eOut(seg(t, TXT.talento.t0 + 0.35, TXT.talento.t0 + 0.95)), ls: -2 });

  VIGN.forEach((v, i) => {
    const lt = t - v.t;
    if (lt < -0.05 || lt > v.d + 0.4) return;
    const enter = i === 0 ? eBack(seg(lt, 0, 0.45)) : eOut(seg(lt, 0, 0.4));
    const exit = eIn(seg(lt, v.d - 0.05, v.d + 0.35));
    const ox = i === 0 ? 0 : (1 - enter) * 1100;
    const oxe = -exit * 1100;
    c.save(); c.translate(ox + oxe, 0);
    if (i === 0) { c.translate(540, 770); c.scale(enter, enter); c.translate(-540, -770); }
    // panel
    c.shadowColor = 'rgba(21,47,115,.18)'; c.shadowBlur = 50; c.shadowOffsetY = 24;
    c.fillStyle = PASTEL[v.id]; rr(c, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 56); c.fill(); c.shadowColor = 'transparent';
    c.save(); rr(c, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 56); c.clip(); c.translate(PANEL.x, PANEL.y);
    VFN[v.id](c, Math.max(0, lt));
    c.restore();
    c.restore();
  });

  // fila de cubos: cada persona aporta el suyo
  const slotX = (i) => 540 + (i - 2) * 118, slotY = 1290;
  for (let i = 0; i < VIGN.length; i++) {
    const v = VIGN[i], launch = v.t + v.d - 0.5, land = v.t + v.d + 0.05;
    const base = 0.16;
    cubeIso(c, slotX(i), slotY, 40, { top: '#dfe6f3', left: '#c9d3e8', right: '#d5ddef' }, 1);
    if (t >= launch && t < land) {
      const u = (t - launch) / (land - launch);
      const px = lerp(540, slotX(i), eIO(u)), py = lerp(720, slotY, eIn(u)) - 260 * Math.sin(Math.PI * u);
      cubeIso(c, px, py, lerp(90, 40, u), CUBE_BLUE, 1, 0.8);
    } else if (t >= land || (i === VIGN.length - 1 && t >= launch)) {
      const age = t - land, sq = age < 0.4 ? 1 + 0.25 * Math.sin(age / 0.4 * Math.PI * 3) * Math.exp(-age * 5) : 1;
      c.save(); c.translate(slotX(i), slotY); c.scale(1, sq); cubeIso(c, 0, 0, 40, CUBE_BLUE, 1, 0.35); c.restore();
      if (age < 0.7) sparkles(c, slotX(i), slotY - 30, age, 8, 60, '#8cc0ee');
    }
  }
}

// ═════════════════════════════════════════════════════════════
//  ESCENA 6 · El relevo + ciudad de cubos
// ═════════════════════════════════════════════════════════════
const S6 = { lx0: -120, lxStop: 300, dx: 470, cubeX: 640, platX: 740, platH: 170, cubeS: 100 };

function lucia6(t) {
  const t0 = T.s6, speed = 380;
  let x, p, face = 1, h = 0;
  const arrive = t0 + (S6.lxStop - S6.lx0) / speed;
  if (t < arrive) { x = S6.lx0 + speed * (t - t0); p = walkPose(Math.abs(x - S6.lx0) * Math.PI / STRIDE, 1); p.smile = 0.9; }
  else {
    x = S6.lxStop;
    const base = idlePose(t, { smile: 0.95, brow: -0.3 });
    const palm = { la: 1.05, le: 0.5 }, place = { la: 0.55, le: 0.3, lean: 0.12 }, rest = { la: 0.25, le: 0.9 };
    if (t < 34.4) p = base;
    else if (t < 34.85) p = lerpPose(base, { ...base, ...palm }, eSine(seg(t, 34.4, 34.85)));
    else if (t < 35.2) p = lerpPose({ ...base, ...palm }, { ...base, ...place }, eOut(seg(t, 34.85, 35.1)));
    else p = lerpPose({ ...base, ...place }, { ...base, ...rest }, eSine(seg(t, 35.2, 35.9)));
  }
  return { x, h, face, p };
}
function diego6(t) {
  let x = S6.dx, h = 0, p = idlePose(t, { hd: -0.25, smile: 0.35, brow: 0.4 }), face = 1;
  if (t < 34.0) p = idlePose(t, { hd: -0.28, smile: 0.35, brow: 0.5 });
  else if (t < 35.2) p = idlePose(t, { hd: -0.12, smile: 0.8, brow: -0.2 });
  else if (t < 35.55) { const u = eIO(seg(t, 35.2, 35.55)); x = lerp(S6.dx, S6.cubeX, u); h = lerp(0, S6.cubeS, u) + 22 * Math.sin(Math.PI * u); const s = Math.sin(Math.PI * u); p = pose({ lt: 1.1 * s + 0.05, lk: 1.0 * s, la: -0.7 * s, ra: 0.8 * s, lean: 0.2 * s, smile: 0.9, hd: -0.1 }); }
  else if (t < 35.95) { const u = eIO(seg(t, 35.55, 35.95)); x = lerp(S6.cubeX, S6.platX + 70, u); h = lerp(S6.cubeS, S6.platH, u) + 20 * Math.sin(Math.PI * u); const s = Math.sin(Math.PI * u); p = pose({ lt: 1.1 * s + 0.05, lk: 1.0 * s, la: -0.7 * s, ra: 0.8 * s, lean: 0.2 * s, smile: 0.95, hd: -0.1 }); }
  else { x = S6.platX + 70; h = S6.platH; p = idlePose(t, { smile: 1, la: 2.2 * eSine(seg(t, 36.0, 36.4)) + 0.05, le: 0.25, hd: -0.05, lean: 0.03 }); }
  return { x, h, face, p };
}

// ciudad isométrica de cubos
const CITY = (() => {
  const r = rng(77), a = [];
  const N = 6;
  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
    const d = Math.hypot(i, j); if (d > N + 0.4) continue;
    const hgt = 1 + Math.floor(r() * (3.2 - d * 0.28 + (Math.abs(i - j) < 2 ? 2 : 0)));
    a.push({ i, j, d, h: Math.max(1, hgt), col: Math.floor(r() * 4), rf: r() });
  }
  a.sort((p, q) => (p.i + p.j) - (q.i + q.j));
  return a;
})();
const CITY_COLS = [
  { top: '#7fb6ea', left: '#2d62ae', right: '#4b8fcf' },
  { top: '#5f8fd6', left: '#1d3f8a', right: '#2f5fb0' },
  { top: '#a8c000', left: '#5a7a2e', right: '#7fa03a' },
  { top: '#9fd0f0', left: '#3a80b8', right: '#5aa2d6' },
];
function windows(c, X, Yg, s, lit, seed) {
  const hw = s * 0.866, hh = s * 0.5, cy = Yg - hh;
  const rand = (k) => (((seed + k) * 9301 + 49297) % 233280) / 233280;
  const quad = (o, ax, ay, bx, by, u0, u1, v0, v1) => {
    const P = (u, v) => [o[0] + u * ax + v * bx, o[1] + u * ay + v * by];
    c.beginPath(); const p = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]; p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
  };
  c.fillStyle = 'rgba(255,226,140,.95)';
  if (rand(1) < lit) quad([X - hw, cy - hh], hw, hh, 0, s, 0.2, 0.46, 0.22, 0.5);
  if (rand(2) < lit) quad([X - hw, cy - hh], hw, hh, 0, s, 0.56, 0.82, 0.22, 0.5);
  if (rand(3) < lit) quad([X, cy], hw, -hh, 0, s, 0.2, 0.46, 0.22, 0.5);
  if (rand(4) < lit) quad([X, cy], hw, -hh, 0, s, 0.56, 0.82, 0.22, 0.5);
}
function drawCity(c, t, zoom, growT0, lit) {
  const s = 64, hw = s * 0.866, hh = s * 0.5, cx = 540, cy = 850;
  c.save(); c.translate(540, 700); c.scale(zoom, zoom); c.translate(-540, -700);
  for (const b of CITY) {
    const X = cx + (b.i - b.j) * hw, Yg = cy + (b.i + b.j) * hh;
    for (let k = 0; k < b.h; k++) {
      const u = clamp((t - (growT0 + b.d * 0.07 + k * 0.09)) / 0.3);
      if (u <= 0) continue;
      const sc = eBack(u);
      c.save(); c.translate(X, Yg - k * s); c.scale(sc, sc);
      const col = k === b.h - 1 && b.rf > 0.82 ? { top: '#ffe08a', left: '#e0a94a', right: '#f5c463' } : CITY_COLS[b.col];
      cubeIso(c, 0, 0, s, col, 1);
      windows(c, 0, 0, s, lit, b.i * 31 + b.j * 17 + k * 7);
      c.restore();
    }
  }
  c.restore();
}

export function drawRelevo(c, t) {
  const tc = 25;                                                     // cielo diurno
  // — calle —
  drawSky(c, tc, 0);
  begin(c);
  const Z0 = 1.28;
  c.save(); c.translate(540, GROUND); c.scale(Z0, Z0); c.translate(-540, -GROUND);
  drawFar(c, tc, 0, 0); drawMid(c, tc, 0, 0);
  c.save(); drawGround(c, tc, 0); c.restore();
  // plataforma alta
  const px = S6.platX;
  c.fillStyle = '#e7dcc3'; c.fillRect(px, GROUND - S6.platH, 700, S6.platH + 400);
  c.fillStyle = '#f8f1e2'; c.fillRect(px, GROUND - S6.platH, 700, 16);
  c.strokeStyle = 'rgba(120,92,50,.16)'; c.lineWidth = 2; for (let yy = 40; yy < 400; yy += 62) { c.beginPath(); c.moveTo(px, GROUND - S6.platH + yy); c.lineTo(px + 700, GROUND - S6.platH + yy); c.stroke(); }
  // personajes
  const L = lucia6(t), D = diego6(t);
  drawShadow(c, L.x, GROUND, 60); drawShadow(c, D.x, GROUND - (D.h > 0 && t > 35.9 ? S6.platH : 0), 60);
  person(c, D.x, GROUND - D.h, { ...DIEGO, s: SC, face: 1 }, D.p);
  const lp = person(c, L.x, GROUND - L.h, { ...LUCIA, s: SC, face: 1 }, L.p);
  // cubo de apoyo
  if (t >= 34.4) {
    if (t < 34.85) { const k = eBack(seg(t, 34.4, 34.85)); c.save(); c.translate(lp.handF[0], lp.handF[1] - 6); c.scale(0.55 * k, 0.55 * k); cubeIso(c, 0, 50, S6.cubeS, CUBE_BLUE, 1, 1); c.restore(); }
    else if (t < 35.2) {
      const u = (t - 34.85) / 0.35; const ghostL = person(ghost, L.x, GROUND, { ...LUCIA, s: SC }, lucia6(34.85).p).handF;
      const x = lerp(ghostL[0], S6.cubeX, eIO(u)), y = lerp(ghostL[1] - 6, GROUND - S6.cubeS / 2, u) - 180 * Math.sin(Math.PI * u);
      c.save(); c.translate(x, y); c.scale(lerp(0.55, 1, u), lerp(0.55, 1, u)); cubeIso(c, 0, S6.cubeS / 2, S6.cubeS, CUBE_BLUE, 1, 1); c.restore();
    } else {
      const age = t - 35.2, sq = age < 0.4 ? 1 + 0.16 * Math.sin(age / 0.4 * Math.PI * 3) * Math.exp(-age * 5) : 1;
      c.save(); c.translate(S6.cubeX, GROUND); c.scale(1, sq); cubeIso(c, 0, 0, S6.cubeS, CUBE_BLUE, 1, 0.5); c.restore();
      if (age < 0.8) sparkles(c, S6.cubeX, GROUND - 40, age);
    }
  }
  c.restore();

  // — ciudad de cubos (fundido) —
  const cf = eSine(seg(t, 35.95, 36.7));
  if (cf > 0) {
    raw(c);
    const g0 = c.createLinearGradient(0, 0, 0, E.H);
    const dusk = eSine(seg(t, 36.2, 37.5));
    const d1 = seg(dusk, 0, 0.5), d2 = seg(dusk, 0.5, 1);
    const hx = (a) => '#' + a.map((v) => v.toString(16).padStart(2, '0')).join('');
    g0.addColorStop(0, mix(hx(mixv('#8fd0f0', '#5f86d6', d1)), '#0e1f4d', d2)); g0.addColorStop(1, mix(hx(mixv('#ffe9b8', '#ff9d6c', d1)), '#233f86', d2));
    c.globalAlpha = cf; c.fillStyle = g0; c.fillRect(0, 0, E.W, E.H); c.globalAlpha = 1;
    begin(c);
    c.globalAlpha = cf;
    const zoom = lerp(1.25, 0.86, eIO(seg(t, 36.0, 37.5)));
    drawCity(c, t, zoom, 36.0, 0.25 + 0.7 * dusk);
    c.globalAlpha = 1;
  }
  // texto
  const cfg = TXT.peldanos;
  if (t >= cfg.t0 && t <= cfg.t1) {
    const a = eOut(seg(t, cfg.t0, cfg.t0 + 0.6)) * (1 - eIn(seg(t, cfg.t1 - 0.4, cfg.t1)));
    const dark = t > 36.3;
    const col = dark ? '#ffffff' : C.navy;
    begin(c);
    tx(c, cfg.a, 540, 216 + (1 - a) * 24, { size: 62, w: 700, align: 'center', color: col, alpha: a, shadow: dark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.7)', sblur: 14, ls: -1 });
    tx(c, cfg.b, 540, 300 + (1 - a) * 24, { size: 62, w: 700, align: 'center', color: dark ? '#cfe6ff' : C.blue, alpha: a, shadow: dark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.7)', sblur: 14, ls: -1 });
  }
}

// ═════════════════════════════════════════════════════════════
//  ESCENA 7 · Falta un cubo → logotipo → Hazte socio
// ═════════════════════════════════════════════════════════════
// Logotipo (coordenadas de la imagen original 510×640)
const LOGO = {
  top: [[250, 5], [385, 75], [250, 152], [115, 75]],
  right: [[250, 152], [385, 75], [385, 225], [250, 300]],
  left: [[115, 228], [250, 300], [250, 455], [115, 380]],
  cx: 250, cy: 230,
};
function poly(c, pts, map) { c.beginPath(); pts.forEach(([x, y], i) => { const [X, Y] = map(x, y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); }
const centroid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

const FLY = (() => {
  const r = rng(41), a = [];
  const pieces = ['top', 'left'];
  for (let i = 0; i < 64; i++) {
    const pc = pieces[i % 2], pts = LOGO[pc];
    // punto de destino dentro del polígono (interpolación bilineal)
    const u = r(), v = r(), P = (u2, v2) => [lerp(lerp(pts[0][0], pts[1][0], u2), lerp(pts[3][0], pts[2][0], u2), v2), lerp(lerp(pts[0][1], pts[1][1], u2), lerp(pts[3][1], pts[2][1], u2), v2)];
    const tgt = P(u, v);
    a.push({ pc, tgt, sx: 140 + r() * 800, sy: 520 + r() * 420, t0: 0.05 + r() * 1.6, dur: 0.9 + r() * 0.6, bend: (r() - 0.5) * 300, col: r() });
  }
  return a;
})();

export function drawFinal(c, t) {
  const lt = t - T.s7;
  const k0 = 1.25;
  const flash = t >= FINAL.click ? seg(t, FINAL.click, FINAL.click + 0.5) : 0;   // el fondo pasa a claro
  // fondo
  raw(c);
  const bgA = mix('#0b1a3f', '#ffffff', eOut(flash)), bgB = mix('#152f73', '#f6f8ff', eOut(flash));
  const gr = c.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, bgA); gr.addColorStop(1, bgB);
  c.fillStyle = gr; c.fillRect(0, 0, E.W, E.H);
  begin(c);
  // estrellitas oscuras
  if (flash < 1) { const r = rng(9); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(160,190,255,${(0.15 + r() * 0.4) * (1 - flash)})`; c.beginPath(); c.arc(r() * 1080, (r() * 1350 - t * 6 + 1350) % 1350, 1.4 + r() * 2, 0, 7); c.fill(); } }
  // posición del logotipo
  const settle = eIO(seg(t, FINAL.cta - 0.3, FINAL.cta + 0.8));
  const k = lerp(k0, 0.86, settle), ccx = 540, ccy = lerp(560, 395, settle);
  const map = (x, y) => [ccx + (x - LOGO.cx) * k, ccy + (y - LOGO.cy) * k];
  const onDark = 1 - flash;
  const dkCol = mix('#1d3f8a', '#3a68c8', onDark), ltCol = '#4b8fcf';

  // la ciudad se apaga mientras sus cubos despegan
  if (lt < 1.1) { c.save(); c.globalAlpha = 1 - seg(lt, 0.1, 1.1); drawCity(c, t, 0.86, 36.0, 0.95); c.restore(); }
  // cubos que vuelan
  const arrived = { top: 0, left: 0 };
  FLY.forEach((f) => {
    const u = clamp((lt - f.t0) / f.dur);
    const [tx0, ty0] = map(f.tgt[0], f.tgt[1]);
    if (u >= 1) { arrived[f.pc]++; return; }
    if (u <= 0) { /* aún en la ciudad: se ve como ventana */ }
    const e = eIO(u);
    const x = lerp(f.sx, tx0, e) + f.bend * Math.sin(Math.PI * u), y = lerp(f.sy, ty0, e) - 200 * Math.sin(Math.PI * u);
    cubeIso(c, x, y + 13, lerp(26, 12, u), u < 0.5 ? { top: '#ffe08a', left: '#e0a94a', right: '#f5c463' } : CUBE_BLUE, 0.95 * (u <= 0 ? 0.6 : 1), 0.4);
  });
  const share = (pc) => arrived[pc] / (FLY.length / 2);
  // piezas del logotipo
  const piece = (pts, col, a) => { if (a <= 0) return; c.save(); c.globalAlpha = a; poly(c, pts, map); c.fillStyle = col; c.fill(); if (onDark > 0.05) { c.strokeStyle = `rgba(160,200,255,${0.6 * onDark})`; c.lineWidth = 2; c.stroke(); } c.restore(); };
  const gl = (pc) => { const a = seg(share(pc), 0.25, 1); return a; };
  if (t >= FINAL.fly0) {
    piece(LOGO.top, dkCol, gl('top')); piece(LOGO.left, dkCol, gl('left'));
  }
  // hueco de la pieza que falta: contorno palpitante
  const slotOn = t >= 39.2 && t < FINAL.click;
  if (slotOn) {
    const a = eOut(seg(t, 39.2, 39.9)), pulse = 0.5 + 0.5 * Math.sin(t * 6);
    c.save(); c.globalAlpha = a; poly(c, LOGO.right, map);
    c.fillStyle = `rgba(75,143,207,${0.12 + 0.12 * pulse})`; c.fill();
    c.setLineDash([16, 12]); c.strokeStyle = `rgba(140,192,238,${0.7 + 0.3 * pulse})`; c.lineWidth = 4; c.lineDashOffset = -t * 30; c.stroke(); c.setLineDash([]);
    c.shadowColor = 'rgba(140,192,238,.9)'; c.shadowBlur = 40 * pulse; c.stroke(); c.restore();
  }
  // la pieza llega: vuela desde abajo-derecha y encaja
  const fly = seg(t, FINAL.click - 0.7, FINAL.click);
  if (t >= FINAL.click - 0.7 && t < FINAL.click) {
    const [cxr, cyr] = centroid(LOGO.right), [mx, my] = map(cxr, cyr);
    const sx = mx + 520, sy = my + 700, e = eIn(fly);
    const x = lerp(sx, mx, e), y = lerp(sy, my, e), sc = lerp(1.8, 1, e);
    c.save(); c.translate(x, y); c.scale(sc, sc); c.rotate((1 - e) * 0.9); c.translate(-mx, -my);
    poly(c, LOGO.right, map); c.shadowColor = 'rgba(140,192,238,1)'; c.shadowBlur = 60; c.fillStyle = ltCol; c.fill(); c.restore();
  }
  if (t >= FINAL.click) {
    const age = t - FINAL.click;
    piece(LOGO.right, ltCol, 1);
    // pulso al encajar
    const [cxr, cyr] = centroid(LOGO.right), [mx, my] = map(cxr, cyr);
    if (age < 0.9) { const u = age / 0.9; c.strokeStyle = `rgba(75,143,207,${0.7 * (1 - u)})`; c.lineWidth = 16 * (1 - u) + 2; c.beginPath(); c.arc(mx, my, 700 * eOut(u), 0, 7); c.stroke(); sparkles(c, mx, my, age, 16, 260, '#8cc0ee'); }
  }
  // textos previos al clic
  const tline = (cfg, y, size, col, o = {}) => {
    if (t < cfg.t0 || t > cfg.t1) return;
    const a = eOut(seg(t, cfg.t0, cfg.t0 + 0.5)) * (1 - eIn(seg(t, cfg.t1 - 0.25, cfg.t1)));
    [cfg.a, cfg.b].filter(Boolean).forEach((s, i) => tx(c, s, 540, y + i * size * 1.3 + (1 - a) * 22, { size, w: o.w || 600, align: 'center', color: col, alpha: a, ls: -0.5, shadow: 'rgba(0,0,0,.25)', sblur: 12 }));
  };
  tline(TXT.socios, 985, 46, '#e9f2ff');
  if (t >= TXT.falta.t0 && t <= TXT.falta.t1) { const a = eBack(seg(t, TXT.falta.t0, TXT.falta.t0 + 0.5)) * (1 - eIn(seg(t, TXT.falta.t1 - 0.2, TXT.falta.t1))); tx(c, TXT.falta.a, 540, 1130, { size: 64, w: 700, align: 'center', color: '#8cc0ee', alpha: clamp(a), ls: -1, shadow: 'rgba(0,0,0,.3)', sblur: 14 }); }

  // — cierre —
  if (t >= FINAL.word) {
    const wa = eOut(seg(t, FINAL.word, FINAL.word + 0.7));
    const wy = lerp(940, 790, settle);
    const ls = 7, sz = 100;
    const wP = tw(c, 'P', { w: 300, size: sz, ls }), wR = tw(c, 'LACEAT', { w: 300, size: sz, ls });
    const x0 = 540 - (wP + wR) / 2;
    tx(c, 'P', x0, wy, { w: 300, size: sz, ls, color: '#1d3f8a', alpha: wa });
    tx(c, 'LACEAT', x0 + wP, wy, { w: 300, size: sz, ls, color: ltCol, alpha: wa });
    if (t >= FINAL.cta) {
      const a = eOut(seg(t, FINAL.cta, FINAL.cta + 0.7));
      tx(c, 'Asociación PLACEAT · Plasencia · desde 1972', 540, wy + 62, { w: 500, size: 25, align: 'center', color: '#5a6a8c', alpha: a, ls: 0.5 });
      tx(c, 'Sé el peldaño.', 540, wy + 190 + (1 - a) * 24, { w: 700, size: 88, align: 'center', color: C.navy, alpha: a, ls: -2.5 });
      const kb = eBack(seg(t, FINAL.cta + 0.6, FINAL.cta + 1.1));
      if (kb > 0) {
        const pulse = 1 + 0.02 * Math.sin((t - FINAL.cta) * 5);
        c.save(); c.translate(540, wy + 320); c.scale(kb * pulse, kb * pulse);
        c.shadowColor = 'rgba(103,148,54,.45)'; c.shadowBlur = 30; c.shadowOffsetY = 10;
        c.fillStyle = '#679436'; rr(c, -250, -46, 500, 92, 46); c.fill(); c.shadowColor = 'transparent';
        tx(c, 'Hazte socio o socia', 0, 13, { w: 600, size: 38, align: 'center', color: '#fff' });
        c.restore();
      }
      tx(c, 'placeat.org/hazte-socio', 540, wy + 430, { w: 500, size: 32, align: 'center', color: C.navy, alpha: eOut(seg(t, FINAL.cta + 1.0, FINAL.cta + 1.5)), ls: 0.3 });
    }
  }
  // destello del clic
  if (t >= FINAL.click) { const a = Math.exp(-(t - FINAL.click) * 5) * 0.9; raw(c); c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(0, 0, E.W, E.H); }
}
