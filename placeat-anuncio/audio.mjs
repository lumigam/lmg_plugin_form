// Banda sonora y efectos de "El peldaño" (sin voz en off), sintetizados por código.
// Piano, cuerdas, timbal, marimba y sonidos de ambiente/foley anclados a shared.js.
import fs from 'node:fs';
import { DUR, T, TXT, VIGN, CLIMB, CUBES, FINAL, WALK_SPEED, LUCIA_START_X, LUCIA_WALK_T0, LUCIA_STOP_T, BEAT, BAR } from './shared.js';

const SR = 44100, N = Math.ceil(DUR * SR), PI2 = Math.PI * 2;
const mk = () => new Float32Array(N);
const bus = { drums: [mk(), mk()], music: [mk(), mk()], fx: [mk(), mk()] };
const rev = mk();
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seedS = 987654321;
const rnd = () => { seedS = (seedS * 1664525 + 1013904223) >>> 0; return seedS / 4294967296; };
const noise = () => rnd() * 2 - 1;
const lpA = (fc) => 1 - Math.exp(-PI2 * fc / SR);

function voice(b, t0, dur, gen, { gain = 1, pan = 0, send = 0 } = {}) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4) * gain, gr = Math.sin((pan + 1) * Math.PI / 4) * gain;
  const L = b[0], R = b[1];
  for (let i = 0; i < n; i++) {
    const k = i0 + i; if (k < 0 || k >= N) continue;
    const s = gen(i / SR, i);
    L[k] += s * gl; R[k] += s * gr;
    if (send) rev[k] += s * send;
  }
}
const env = (t, dur, att, rel) => Math.min(1, t / att) * Math.min(1, Math.max(0, (dur - t) / rel));
function sawOsc(freq) { let ph = rnd(); const dt = freq / SR; return (fm = 1) => { const d = dt * fm; ph += d; if (ph >= 1) ph -= 1; let v = 2 * ph - 1; if (ph < d) { const t = ph / d; v -= t + t - t * t - 1; } else if (ph > 1 - d) { const t = (ph - 1) / d; v -= t * t + t + t + 1; } return v; }; }
function sineOsc(freq) { let ph = 0; return (fm = 1) => { ph += PI2 * freq * fm / SR; return Math.sin(ph); }; }
function lp1(fc) { let y = 0; const a = lpA(fc); return (x, f2) => { y += (f2 ? lpA(f2) : a) * (x - y); return y; }; }
function lp2(fc) { const A = lp1(fc), B = lp1(fc); return (x, f2) => B(A(x, f2), f2); }
function hp1(fc) { const l = lp1(fc); return (x) => x - l(x); }

// ── instrumentos ─────────────────────────────────────────────
function piano(t0, midi, vel = 0.5, dur = 2.4, pan = 0) {
  const f = mtof(midi), tau0 = clamp(2.6 - 0.9 * (midi - 40) / 40, 0.5, 3.2) * (0.7 + vel * 0.6), B = 0.0004;
  const nh = Math.min(7, Math.floor(9000 / f));
  const ph = new Array(nh).fill(0);
  const lpn = lp1(2500), tone = lp1(1500 + 6000 * vel);
  voice(bus.music, t0, dur, (t) => {
    let s = 0;
    for (let k = 1; k <= nh; k++) {
      ph[k - 1] += PI2 * f * k * Math.sqrt(1 + B * k * k) / SR;
      s += Math.sin(ph[k - 1]) * Math.exp(-t / (tau0 / (1 + 0.7 * (k - 1)))) / Math.pow(k, 1.15);
    }
    const hammer = t < 0.012 ? lpn(noise()) * (1 - t / 0.012) * 0.6 : 0;
    return tone(s * 0.55 + hammer) * Math.min(1, t / 0.002) * env(t, dur, 0.001, 0.25) * vel;
  }, { pan, send: 0.32 });
}
function strings(t0, dur, midis, amp = 0.12, att = 1.0, rel = 1.2, cutoff = 2200) {
  for (const m of midis) {
    const os = [sawOsc(mtof(m) * 0.997), sawOsc(mtof(m)), sawOsc(mtof(m) * 1.003)], f = lp2(cutoff);
    const pan = (rnd() - 0.5) * 0.8, vr = rnd() * 6;
    voice(bus.music, t0, dur, (t) => {
      const vib = 1 + 0.0035 * Math.sin(PI2 * 5.3 * t + vr) * Math.min(1, t / 1.2);
      return f((os[0](vib) + os[1](vib) + os[2](vib)) / 3, cutoff * (0.5 + 0.5 * Math.min(1, t / 1.5))) * env(t, dur, att, rel) * amp;
    }, { pan, send: 0.42 });
  }
}
function cello(t0, dur, midi, amp = 0.16) {
  const o = sawOsc(mtof(midi)), o2 = sawOsc(mtof(midi) * 1.004), f = lp2(700);
  voice(bus.music, t0, dur, (t) => {
    const vib = 1 + 0.006 * Math.sin(PI2 * 5.1 * t) * Math.min(1, t / 0.8);
    return f((o(vib) + o2(vib)) * 0.5, 350 + 500 * Math.min(1, t / 1.2)) * env(t, dur, 0.5, 0.6) * amp;
  }, { send: 0.3 });
}
function marimba(t0, midi, amp = 0.2, pan = 0) {
  const f = mtof(midi); const a = sineOsc(f), b = sineOsc(f * 3.98), c2 = sineOsc(f * 9.9);
  voice(bus.music, t0, 0.7, (t) => (a() * Math.exp(-t / 0.28) + b() * 0.22 * Math.exp(-t / 0.07) + c2() * 0.06 * Math.exp(-t / 0.02)) * Math.min(1, t / 0.002) * amp, { pan, send: 0.28 });
}
function bell(t0, midi, amp = 0.16, pan = 0, dec = 0.9) {
  const f = mtof(midi); const a = sineOsc(f), b = sineOsc(f * 2.76), c2 = sineOsc(f * 5.4), d = sineOsc(f * 1.5);
  voice(bus.fx, t0, dec * 5, (t) => (a() + b() * 0.32 * Math.exp(-t / 0.2) + c2() * 0.12 * Math.exp(-t / 0.06) + d() * 0.1 * Math.exp(-t / 0.4)) * Math.exp(-t / dec) * Math.min(1, t / 0.002) * amp, { pan, send: 0.55 });
}
function timpani(t0, midi = 38, amp = 0.7) {
  const f = mtof(midi); let ph = 0; const l = lp2(600);
  voice(bus.drums, t0, 1.6, (t) => {
    ph += PI2 * (f * (1 + 0.35 * Math.exp(-t / 0.05))) / SR;
    return (Math.sin(ph) * Math.exp(-t / 0.55) + l(noise()) * Math.exp(-t / 0.03) * 0.5) * amp;
  }, { send: 0.3 });
}
function kick(t0, amp = 0.5) {
  let ph = 0;
  voice(bus.drums, t0, 0.4, (t) => { ph += PI2 * (48 + 90 * Math.exp(-t / 0.03)) / SR; return Math.sin(ph) * Math.exp(-t / 0.18) * amp + (t < 0.004 ? noise() * 0.2 : 0); });
}
function shaker(t0, amp = 0.1, pan = 0.3) { const h = hp1(6000); voice(bus.drums, t0, 0.09, (t) => h(noise()) * Math.exp(-t / 0.028) * Math.min(1, t / 0.003) * amp, { pan }); }
function clap(t0, amp = 0.28) { const h = hp1(1100), l = lp2(7000); voice(bus.drums, t0, 0.3, (t) => l(h(noise())) * (Math.exp(-t / 0.09) + 0.6 * Math.exp(-Math.max(0, t - 0.012) / 0.05)) * amp, { send: 0.3 }); }
function cymbal(t0, dur, amp = 0.3, swell = true) { const h = hp1(4500); voice(bus.fx, t0, dur, (t) => h(noise()) * (swell ? Math.pow(t / dur, 2.2) : Math.exp(-t / (dur * 0.4))) * amp, { send: 0.4 }); }
function whoosh(t0, dur, f0, f1, amp = 0.12, pan = 0) { const l = lp2(f0); voice(bus.fx, t0, dur, (t) => { const x = t / dur; return l(noise(), f0 * Math.pow(f1 / f0, x)) * Math.sin(Math.PI * Math.pow(x, 0.85)) * amp * 2; }, { pan, send: 0.25 }); }
function riser(t0, dur, amp = 0.2, f0 = 300, f1 = 9000) { const h = hp1(f0), sw = lp2(f0); voice(bus.fx, t0, dur, (t) => { const x = t / dur, f = f0 * Math.pow(f1 / f0, x); return sw(h(noise()), f) * Math.pow(x, 1.7) * amp * 2; }, { send: 0.25 }); }
function step(t0, amp = 0.32, pan = 0) {
  let ph = 0; const l = lp2(700), h = hp1(1200);
  voice(bus.fx, t0, 0.14, (t) => { ph += PI2 * (85 - 30 * Math.min(1, t / 0.08)) / SR; return (Math.sin(ph) * Math.exp(-t / 0.05) + l(noise()) * Math.exp(-t / 0.03) * 0.5 + h(noise()) * (t < 0.008 ? 0.35 : 0)) * amp; }, { pan, send: 0.08 });
}
function swish(t0, dur = 0.22, amp = 0.09, pan = 0) { const l = lp2(2500), h = hp1(500); voice(bus.fx, t0, dur, (t) => l(h(noise())) * Math.sin(Math.PI * t / dur) * amp, { pan }); }
function chirp(t0, f0, f1, dur = 0.12, amp = 0.05, pan = 0) { let ph = 0; voice(bus.fx, t0, dur, (t) => { const x = t / dur; ph += PI2 * lerp(f0, f1, x) / SR; return Math.sin(ph) * Math.sin(Math.PI * x) * amp * (1 + 0.5 * Math.sin(t * 90)); }, { pan, send: 0.25 }); }
function shimmer(t0, dur, m0, amp = 0.08, up = true) {
  for (let i = 0; i < 7; i++) { const t1 = t0 + (up ? i : 6 - i) * dur / 8; bell(t1, m0 + [0, 4, 7, 12, 16, 19, 24][i], amp, (i % 2 ? 1 : -1) * 0.5, 0.6); }
}
function pluckHi(t0, midi, amp = 0.1, pan = 0) { marimba(t0, midi, amp, pan); }

// ── armonía ───────────────────────────────────────────────────
const CH = {
  Bm: { root: 35 + 12, pad: [50, 54, 59, 62], arp: [47, 54, 59, 62, 66, 62, 59, 54] },
  G: { root: 43, pad: [50, 55, 59, 62], arp: [43, 50, 55, 59, 62, 59, 55, 50] },
  F: { root: 42, pad: [49, 54, 57, 61], arp: [42, 49, 54, 57, 61, 57, 54, 49] },
  D: { root: 38, pad: [50, 54, 57, 62], arp: [38, 50, 54, 57, 62, 57, 54, 50] },
  A: { root: 45, pad: [52, 57, 61, 64], arp: [45, 52, 57, 61, 64, 61, 57, 52] },
};
const PROG = ['Bm', 'G', 'Bm', 'G', 'F', 'G', 'A', 'D', 'G', 'A', 'D', 'A', 'G', 'Bm', 'G', 'G', 'A', 'D', 'D'];
const barT = (i) => i * BAR;
const chordAtT = (t) => CH[PROG[Math.min(PROG.length - 1, Math.floor(t / BAR))]];

// ═════════ ESCENA 1 · Amanecer (0–5) ═════════
// ambiente: viento suave, grillos, pájaros al amanecer
{
  const l = lp2(260); voice(bus.fx, 0, 12.5, (t) => l(noise()) * 0.06 * (0.6 + 0.4 * Math.sin(t * 0.7)) * Math.min(1, t / 1.0) * (1 - clamp((t - 9) / 3.5)), { pan: 0 });
  for (let t = 0.2; t < 4.4; t += 0.36) for (let k = 0; k < 3; k++) { const o = sineOsc(4600 + rnd() * 200); voice(bus.fx, t + k * 0.045, 0.03, (tt) => o() * Math.sin(Math.PI * tt / 0.03) * 0.012 * (1 - clamp((t - 2.5) / 1.9)), { pan: rnd() - 0.5 }); }
  for (let t = 2.6; t < 12; t += 0.35 + rnd() * 0.8) { const f0 = 2600 + rnd() * 1800; chirp(t, f0, f0 + (rnd() - 0.3) * 900, 0.08 + rnd() * 0.08, 0.02 + 0.04 * clamp((t - 2.6) / 4), rnd() * 1.6 - 0.8); if (rnd() > 0.5) chirp(t + 0.11, f0 * 1.1, f0 * 0.95, 0.09, 0.03, rnd() - 0.5); }
}
// pasos de Lucía (mientras camina) y del resto de la escena
for (let d = 0, k = 0; ; k++) { const t = LUCIA_WALK_T0 + (k + 0.5) * 144 / WALK_SPEED; if (t >= LUCIA_STOP_T) break; step(t, 0.3, k % 2 ? 0.2 : -0.2); }
// piano solitario (arpegio suave)
{
  const seq = [[0, 'Bm'], [1, 'G']];
  seq.forEach(([bar, name]) => { const c = CH[name]; for (let i = 0; i < 8; i++) piano(barT(bar) + 0.35 + i * BEAT * 0.5 * 1.0 * (i < 4 ? 1 : 1) * 0.5 * 2 / 1, c.arp[i] + (i > 3 ? 12 : 0), 0.28 + 0.03 * i, 2.0, (i % 2 ? 0.2 : -0.2)); });
}
strings(2.5, 3.6, CH.G.pad, 0.045, 1.6, 1.2, 1400);
bell(1.2, 86, 0.05, 0, 1.2);      // texto «Plasencia. Amanece.»

// ═════════ ESCENA 2 · La escalera (5–12.5) ═════════
cello(5.0, 7.7, 35, 0.16);       // B1... se siente el peso
strings(5.0, 2.6, [47, 54, 62], 0.06, 1.2, 0.8, 1200);
strings(7.5, 2.6, [43, 50, 59], 0.07, 1.0, 0.8, 1300);
strings(10.0, 2.6, [42, 49, 57], 0.08, 1.0, 0.9, 1300);
[5.0, 7.5, 10.0].forEach((t, i) => { timpani(t, 35, 0.5 + 0.1 * i); timpani(t + 1.25, 35, 0.3 + 0.1 * i); });
[[5.0, 'Bm'], [7.5, 'G'], [10.0, 'F']].forEach(([t0, n]) => { const c = CH[n]; for (let i = 0; i < 4; i++) piano(t0 + 0.6 + i * BEAT, c.arp[i + 1] + (i % 2) * 12, 0.3 + 0.03 * i, 1.6); });
// intentos de subir
swish(7.3, 0.35, 0.09); swish(7.8, 0.25, 0.1);          // se estira, salta
step(8.25, 0.42); swish(8.3, 0.4, 0.07);                // cae hacia atrás
swish(9.4, 0.4, 0.09); step(10.1, 0.4); swish(10.3, 0.4, 0.07);
bell(8.4, 79, 0.05, 0, 1.4);                            // texto «Hay escalones…»
// pasos de Marta acercándose (se oyen antes de verla)
for (let k = 0; ; k++) { const t = 9.8 + (k + 0.5) * 144 / 150; if (t > 12.3) break; step(t, 0.05 + 0.2 * clamp((t - 9.8) / 2.4), k % 2 ? 0.4 : -0.4); }
// Lucía se gira y camina hacia Marta
for (let k = 0; k < 2; k++) step(11.55 + k * 0.55, 0.16, -0.3);

// ═════════ ESCENA 3 · El apoyo (12.5–17.5) ═════════
strings(12.5, 2.6, CH.G.pad, 0.07, 1.0, 1.0, 1600);
strings(15.0, 3.0, CH.A.pad, 0.09, 1.2, 1.4, 1900);
// melodía de piano, sencilla y luminosa
[[12.5, 74, 0.42], [13.125, 71, 0.36], [13.75, 74, 0.4], [14.375, 76, 0.44], [15.0, 73, 0.46], [15.625, 76, 0.5], [16.25, 78, 0.52], [16.875, 81, 0.6]].forEach(([t, m, v]) => piano(t, m, v, 2.2, 0.1));
piano(12.5, 43, 0.35, 2.4); piano(15.0, 45, 0.4, 2.4);
// el cubo se materializa, vuela y aterriza
shimmer(13.3, 0.8, 79, 0.06, true);
whoosh(14.05, 0.6, 700, 4500, 0.1, 0);
step(14.65, 0.06); bell(14.66, 74, 0.2, 0.2, 1.4); bell(14.66, 86, 0.1, -0.3, 1.0);
shimmer(14.7, 0.7, 83, 0.05, false);
bell(15.0, 88, 0.05, 0, 1.3); bell(16.1, 90, 0.06, 0, 1.4);      // textos «Apoyar…»
timpani(17.0, 38, 0.3);

// ═════════ ESCENA 4 · La subida (17.5–25) ═════════
[7, 8, 9].forEach((bar) => { const c = CH[PROG[bar]]; strings(barT(bar), 2.6, c.pad, 0.08 + 0.03 * (bar - 7), 0.9, 0.8, 2000 + 800 * (bar - 7)); });
// arpegios de piano en corcheas (crecen)
for (let t = 17.5; t < 24.5; t += BEAT / 2) { const c = chordAtT(t), i = Math.round((t - 17.5) / (BEAT / 2)); piano(t, c.arp[i % 8] + (i % 8 > 3 ? 12 : 12), 0.3 + 0.28 * clamp((t - 17.5) / 6.5), 1.0, ((i % 4) - 1.5) * 0.25); }
[17.5, 20.0, 22.5].forEach((t) => piano(t, chordAtT(t).root, 0.5, 2.4));
// cada peldaño, una nota más alta de la escala de Re
const SCALE = [74, 76, 78, 79, 81, 83, 85, 86, 88, 90];
CLIMB.slice(1).forEach((k, i) => { step(k.t, 0.22, i % 2 ? 0.2 : -0.2); bell(k.t + 0.01, SCALE[i], 0.14 + 0.01 * i, ((i % 3) - 1) * 0.3, 0.9); });
CUBES.slice(1).forEach((c) => { shimmer(c.t, 0.4, 91, 0.04, true); });
// puerta
step(23.9, 0.18); cymbal(23.6, 1.4, 0.22); riser(23.0, 2.0, 0.22, 400, 11000);
{ const o = sawOsc(120), l = lp2(500); voice(bus.fx, 24.05, 0.7, (t) => l(o(1 - 0.25 * t / 0.7)) * Math.sin(Math.PI * t / 0.7) * 0.08); }  // crujido
[23.0, 23.5, 24.0, 24.25, 24.5, 24.7, 24.85].forEach((t, i) => timpani(t, 38, 0.25 + 0.08 * i));
// luz: acorde luminoso justo antes del corte
strings(24.4, 0.8, [62, 66, 69, 74], 0.14, 0.4, 0.05, 3200);

// ═════════ ESCENA 5 · Talento (25–32.5) ═════════
timpani(T.s5, 38, 1.0); timpani(T.s5, 26, 0.7); cymbal(T.s5, 2.4, 0.3, false);
[74, 78, 81, 86, 90].forEach((m, i) => bell(T.s5 + 0.02 + i * 0.05, m, 0.11, (i % 2 ? 1 : -1) * 0.4, 1.4));
[10, 11, 12].forEach((bar) => { const c = CH[PROG[bar]]; strings(barT(bar), 2.65, c.pad, 0.2, 0.35, 0.6, 3000); });
for (let t = T.s5; t < T.s6 - 0.001; t += BEAT) {
  const c = chordAtT(t), bi = Math.round((t - T.s5) / BEAT);
  kick(t, 0.75);                                           // pulso cálido
  if (bi % 2 === 1) clap(t, 0.4);
  shaker(t, 0.15); shaker(t + BEAT / 2, 0.19, -0.3);
  marimba(t, c.root + (bi % 4 === 3 ? 12 : 0), 0.36);        // bajo marimba
  marimba(t + BEAT / 2, c.root + 12, 0.24);
  for (let j = 0; j < 2; j++) pluckHi(t + j * BEAT / 2, c.arp[(bi * 2 + j) % 8] + 24, 0.22 + 0.04 * (j === 0), ((bi + j) % 2 ? 0.4 : -0.4));
}
// sonidos de cada viñeta
VIGN.forEach((v, i) => {
  whoosh(v.t - 0.02, 0.4, 900, 5000, 0.1, i % 2 ? 0.4 : -0.4);
  const launch = v.t + v.d - 0.5, land = v.t + v.d + 0.05;
  whoosh(launch, 0.55, 500, 3500, 0.07);
  bell(land, [74, 78, 81, 86, 90][i], 0.2, ((i % 3) - 1) * 0.3, 1.1);
});
// premium: frascos que chocan; lectura: pictos; taller: lijado; arte: pinceladas; ocio: confeti
[0.15, 0.55, 0.95].forEach((o) => { const t = 25.0 + o * 0.9 + 0.5; step(t, 0.12); marimba(t, 86, 0.1); });
[0.25, 0.45, 0.65, 0.85, 1.05].forEach((o, i) => marimba(26.5 + o + 0.4, 79 + i * 2, 0.16, (i - 2) * 0.25));
for (let t = 28.05; t < 29.05; t += 0.08) swish(t, 0.07, 0.05);
bell(29.05, 86, 0.14, 0, 0.9);
[0.1, 0.4, 0.7].forEach((o) => swish(29.5 + o, 0.3, 0.06));
[31.05, 31.6, 32.05].forEach((t, i) => { clap(t, 0.25); shaker(t + 0.05, 0.16); });
bell(TXT.talento.t0, 90, 0.06, 0, 1.3);

// ═════════ ESCENA 6 · El relevo (32.5–37.5) ═════════
[13, 14].forEach((bar) => { const c = CH[PROG[bar]]; strings(barT(bar), 2.7, c.pad, 0.11, 0.6, 0.9, 2200); });
for (let t = T.s6; t < T.s7 - 0.001; t += BEAT / 2) { const c = chordAtT(t), i = Math.round((t - T.s6) / (BEAT / 2)); piano(t, c.arp[i % 8] + 12, 0.38 + 0.03 * (i % 4 === 0), 1.0, ((i % 4) - 1.5) * 0.25); }
piano(T.s6, 35 + 12, 0.5, 2.4); piano(T.s6 + BAR, 43, 0.5, 2.4);
{ const speed = 380; for (let k = 0; ; k++) { const t = T.s6 + (k + 0.5) * 144 / speed; if (t > T.s6 + (300 + 120) / speed) break; step(t, 0.22, k % 2 ? 0.2 : -0.2); } }
shimmer(34.4, 0.45, 83, 0.06, true); whoosh(34.85, 0.35, 700, 4500, 0.09); bell(35.21, 78, 0.2, 0.2, 1.3); bell(35.21, 90, 0.09, -0.2, 1.0);
step(35.55, 0.25); step(35.95, 0.25); bell(35.56, 81, 0.14, 0.2, 0.9); bell(35.96, 86, 0.16, 0.2, 1.0);
bell(TXT.peldanos.t0, 88, 0.06, 0, 1.3);
// la ciudad crece: notas cada vez más rápidas
{ const sc = [74, 76, 78, 81, 83, 86, 88, 90, 93]; for (let i = 0; i < 26; i++) { const t = 36.0 + i * 0.058; marimba(t, sc[i % sc.length] - 12 * (i > 12 ? 0 : 1), 0.1 + 0.005 * i, ((i % 5) - 2) * 0.25); } }
riser(36.0, 1.5, 0.2, 500, 12000); [36.4, 36.8, 37.1, 37.3].forEach((t, i) => timpani(t, 43, 0.25 + 0.1 * i));

// ═════════ ESCENA 7 · Falta un cubo (37.5–47.5) ═════════
strings(T.s7, 2.6, CH.G.pad, 0.22, 0.5, 0.6, 2800); strings(T.s7 + BAR, 2.6, CH.A.pad, 0.26, 0.5, 0.6, 3200);
whoosh(T.s7, 2.4, 500, 6000, 0.14);
for (let t = T.s7; t < FINAL.click - 0.001; t += BEAT / 2) { const c = chordAtT(t), i = Math.round((t - T.s7) / (BEAT / 2)); pluckHi(t, c.arp[i % 8] + 24 + (t > 40 ? 12 * (i % 2) : 0), 0.2 + 0.08 * clamp((t - T.s7) / 4), ((i % 4) - 1.5) * 0.3); }
for (let t = 40.0; t < FINAL.click; t += BEAT) timpani(t, 45, 0.28 + 0.4 * clamp((t - 40) / 2.5));   // pulso que se acelera
riser(40.5, 2.0, 0.3, 300, 13000);
bell(TXT.socios.t0, 88, 0.07, 0, 1.4); bell(TXT.falta.t0, 93, 0.09, 0, 1.6);
whoosh(FINAL.click - 0.7, 0.7, 500, 6000, 0.14);
// EL CLIC
timpani(FINAL.click, 38, 1.0); timpani(FINAL.click, 26, 0.9); cymbal(FINAL.click, 2.6, 0.35, false);
kick(FINAL.click, 0.8);
strings(FINAL.click, 5.2, [50, 54, 57, 62, 66], 0.2, 0.15, 1.6, 3800);
strings(FINAL.click, 5.2, [38, 45], 0.14, 0.2, 1.5, 900);
[74, 78, 81, 86, 90, 93, 98].forEach((m, i) => bell(FINAL.click + 0.02 + i * 0.06, m, 0.13, (i % 2 ? 1 : -1) * 0.5, 1.6));
bell(FINAL.click + 0.02, 62, 0.22, 0, 2.2);
piano(FINAL.click, 38, 0.7, 3.0); piano(FINAL.click, 50, 0.6, 3.0); piano(FINAL.click, 57, 0.55, 3.0); piano(FINAL.click, 62, 0.55, 3.0);
bell(FINAL.word, 86, 0.1, 0, 1.4);
// cierre: arpegio suave de piano, resolución y fundido
for (let i = 0; i < 8; i++) piano(FINAL.cta + i * BEAT * 0.5, [62, 66, 69, 73, 74, 73, 69, 66][i] + 0, 0.34, 1.6, ((i % 4) - 1.5) * 0.2);
strings(FINAL.cta, 3.7, [50, 54, 57, 61, 64], 0.15, 0.4, 1.6, 3000);
piano(FINAL.cta, 38, 0.5, 3.0);
for (let i = 0; i < 5; i++) piano(FINAL.cta + 2.5 + i * 0.5, [74, 73, 69, 66, 62][i], 0.28 - 0.03 * i, 2.2, 0.15);
bell(FINAL.cta, 86, 0.08, 0, 1.6); bell(FINAL.cta + 0.6, 90, 0.07, 0.3, 1.6);

// ═════════ Mezcla ═════════
function reverb(inp) {
  const outs = [mk(), mk()];
  const combs = [[1687, 1601, 2053, 2251, 2467], [1709, 1637, 2089, 2273, 2503]];
  for (let ch = 0; ch < 2; ch++) {
    for (const d of combs[ch]) {
      const buf = new Float32Array(d); let idx = 0, damp = 0;
      for (let i = 0; i < N; i++) { const y = buf[idx]; damp += (y - damp) * 0.3; buf[idx] = inp[i] + damp * 0.9; outs[ch][i] += y * 0.2; if (++idx >= d) idx = 0; }
    }
    for (const d of [556, 441, 341]) {
      const buf = new Float32Array(d); let idx = 0;
      for (let i = 0; i < N; i++) { const b = buf[idx]; const x = outs[ch][i]; const y = -0.5 * x + b; buf[idx] = x + 0.5 * y; outs[ch][i] = y; if (++idx >= d) idx = 0; }
    }
  }
  return outs;
}
const rv = reverb(rev);
const L = new Float32Array(N), R = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh((bus.drums[0][i] + bus.music[0][i] + bus.fx[0][i] + rv[0][i] * 0.55) * 1.1);
  R[i] = Math.tanh((bus.drums[1][i] + bus.music[1][i] + bus.fx[1][i] + rv[1][i] * 0.55) * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
if (!Number.isFinite(peak)) { console.error("¡Hay NaN en el audio!"); process.exit(1); }
const norm = 0.89 / peak;
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.4) * Math.min(1, (DUR - t) / 1.6);
  out.writeInt16LE(Math.round(clamp(L[i] * norm * fade, -1, 1) * 32767), i * 4);
  out.writeInt16LE(Math.round(clamp(R[i] * norm * fade, -1, 1) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + out.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16);
hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28);
hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(out.length, 40);
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/audio.wav', Buffer.concat([hdr, out]));
console.log(`audio.wav listo · ${DUR}s · pico previo ${peak.toFixed(2)}`);
