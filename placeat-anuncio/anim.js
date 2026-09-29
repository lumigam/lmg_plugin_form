import { E, begin, raw, clamp, seg } from './lib.js';
import { DUR, FPS, T } from './shared.js';
import { drawWorld } from './world.js';
import { drawMontage, drawRelevo, drawFinal } from './scenes2.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1080, H = +q.get('h') || 1350;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H;
const g = off.getContext('2d');
E.W = W; E.H = H; E.S = Math.min(W / 1080, H / 1350); E.OX = (W - 1080 * E.S) / 2; E.OY = (H - 1350 * E.S) / 2;

export function draw(t) {
  t = clamp(t, 0, DUR - 0.0001);
  raw(g); g.globalAlpha = 1; g.shadowColor = 'transparent'; g.setLineDash([]);
  if (t < T.s5) drawWorld(g, t);
  else if (t < T.s6) drawMontage(g, t);
  else if (t < T.s7) drawRelevo(g, t);
  else drawFinal(g, t);
  raw(ctx); ctx.globalAlpha = 1; ctx.drawImage(off, 0, 0);
  for (const b of [T.s5, T.s6]) if (t >= b) { const w = 0.85 * Math.exp(-(t - b) * 7); if (w > 0.01) { ctx.fillStyle = `rgba(255,250,235,${w})`; ctx.fillRect(0, 0, W, H); } }
  const fi = 1 - seg(t, 0, 0.5); if (fi > 0) { ctx.fillStyle = `rgba(0,0,0,${fi})`; ctx.fillRect(0, 0, W, H); }
}

async function boot() {
  const fonts = [['Poppins', 'fonts/poppins-latin-300-normal.woff2', '300'], ['Poppins', 'fonts/poppins-latin-500-normal.woff2', '500'], ['Poppins', 'fonts/poppins-latin-600-normal.woff2', '600'], ['Poppins', 'fonts/poppins-latin-700-normal.woff2', '700']];
  for (const [fam, url, w] of fonts) { const f = new FontFace(fam, `url(${url})`, { weight: w }); await f.load(); document.fonts.add(f); }
  window.draw = draw; window.DUR = DUR; window.FPS = FPS;
  draw(0); window.READY = true;
  if (q.get('render')) return;
  const ov = document.getElementById('play'); const audio = new Audio('out/audio.wav');
  cv.style.width = 'min(100vw, ' + (100 * W / H) + 'vh)'; cv.style.height = 'auto'; ov.style.display = 'flex';
  ov.onclick = () => { ov.style.display = 'none'; audio.currentTime = 0; audio.play().catch(() => {}); const t0 = performance.now();
    const loop = () => { const t = audio.paused ? (performance.now() - t0) / 1000 : audio.currentTime; draw(t); if (t < DUR) requestAnimationFrame(loop); else ov.style.display = 'flex'; }; loop(); };
}
boot();
