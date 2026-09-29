// Banda sonora y efectos sintetizados a mano (sin muestras, sin voz en off).
// Todo está anclado a la línea de tiempo de shared.js -> node audio.mjs  ->  out/audio.wav
import fs from 'node:fs';
import { DUR, T, S1, CYCLES, cycleTimes, chaosTimes } from './shared.js';

const SR = 44100;
const N = Math.ceil(DUR * SR);
const mk = () => new Float32Array(N);
const bus = { drums: [mk(), mk()], music: [mk(), mk()], fx: [mk(), mk()] };
const rev = mk();
const PI2 = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let seedS = 12345;
const rnd = () => { seedS = (seedS * 1664525 + 1013904223) >>> 0; return seedS / 4294967296; };
const noise = () => rnd() * 2 - 1;
const lpA = (fc) => 1 - Math.exp(-PI2 * fc / SR);

// Escribe una voz en un bus. gen(tl, i) -> muestra mono.
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

// ── osciladores ──
function sawOsc(freq) {
  let ph = Math.random();
  const dt = freq / SR;
  return (fm = 1) => {
    const d = dt * fm; ph += d; if (ph >= 1) ph -= 1;
    let v = 2 * ph - 1;
    if (ph < d) { const t = ph / d; v -= t + t - t * t - 1; } else if (ph > 1 - d) { const t = (ph - 1) / d; v -= t * t + t + t + 1; }
    return v;
  };
}
function sineOsc(freq) { let ph = 0; return (fm = 1) => { ph += PI2 * freq * fm / SR; return Math.sin(ph); }; }
function lp1(fc) { let y = 0; const a = lpA(fc); return (x, f2) => { y += (f2 ? lpA(f2) : a) * (x - y); return y; }; }
function lp2(fc) { const A = lp1(fc), B = lp1(fc); return (x, f2) => B(A(x, f2), f2); }
function hp1(fc) { const l = lp1(fc); return (x) => x - l(x); }

// ── instrumentos ──
const kickTimes = [];
function kick(t0, amp = 1, { long = false, deep = false } = {}) {
  kickTimes.push(t0);
  let ph = 0;
  voice(bus.drums, t0, long ? 0.6 : 0.42, (t) => {
    const f = 46 + (deep ? 90 : 120) * Math.exp(-t / 0.032);
    ph += PI2 * f / SR;
    const click = t < 0.004 ? noise() * 0.5 : 0;
    return (Math.sin(ph) * Math.exp(-t / (long ? 0.30 : 0.2)) + click) * amp;
  }, { gain: 0.9 });
}
function impact(t0, amp = 1, dur = 3.2) {
  let ph = 0; const lpn = lp2(900);
  voice(bus.fx, t0, dur, (t) => {
    const f = 34 + 110 * Math.exp(-t / 0.28);
    ph += PI2 * f / SR;
    return Math.sin(ph) * Math.exp(-t / 1.1) * amp * 0.95 + lpn(noise()) * Math.exp(-t / 0.5) * amp * 0.35;
  }, { send: 0.25 });
  const h = hp1(2500);
  voice(bus.fx, t0, 2.2, (t) => h(noise()) * Math.exp(-t / 0.7) * amp * 0.5, { send: 0.5, pan: 0 });
}
function hat(t0, amp = 0.3, open = false) {
  const h = hp1(7000);
  voice(bus.drums, t0, open ? 0.25 : 0.06, (t) => h(noise()) * Math.exp(-t / (open ? 0.08 : 0.018)) * amp, { pan: 0.25 });
}
function clap(t0, amp = 0.6) {
  const h = hp1(900), l = lp2(6500);
  voice(bus.drums, t0, 0.35, (t) => {
    const e = Math.exp(-t / 0.11) + 0.8 * Math.exp(-Math.max(0, t - 0.012) / 0.05) * (t > 0.012 ? 1 : 0) + 0.7 * Math.exp(-Math.max(0, t - 0.024) / 0.04) * (t > 0.024 ? 1 : 0);
    return l(h(noise())) * e * amp * 0.5;
  }, { send: 0.25 });
}
function snare(t0, amp = 0.5, pitch = 1) {
  const h = hp1(1500); let ph = 0;
  voice(bus.drums, t0, 0.25, (t) => {
    ph += PI2 * 210 * pitch / SR;
    return (h(noise()) * Math.exp(-t / 0.07) * 0.6 + Math.sin(ph) * Math.exp(-t / 0.05) * 0.5) * amp;
  }, { send: 0.12 });
}
function bass(t0, dur, midi, amp = 0.5) {
  const o = sawOsc(mtof(midi)), s = sineOsc(mtof(midi)), f = lp2(320);
  voice(bus.music, t0, dur, (t) => (f(o(), 220 + 500 * Math.exp(-t / 0.12)) * 0.75 + s() * 0.55) * env(t, dur, 0.004, 0.05) * amp * Math.exp(-t / (dur * 2.2)));
}
function pad(t0, dur, midis, amp = 0.16, att = 0.35, cutoff = 1900) {
  for (const m of midis) {
    const os = [sawOsc(mtof(m) * 0.9965), sawOsc(mtof(m)), sawOsc(mtof(m) * 1.0035)];
    const f = lp2(cutoff);
    const pan = (rnd() - 0.5) * 0.7;
    voice(bus.music, t0, dur, (t) => f((os[0]() + os[1]() + os[2]()) / 3, cutoff * (0.55 + 0.45 * Math.min(1, t / 1.2))) * env(t, dur, att, 0.9) * amp, { pan, send: 0.3 });
  }
}
function pluck(t0, midi, amp = 0.16, pan = 0) {
  const o = sawOsc(mtof(midi)), o2 = sawOsc(mtof(midi) * 1.004), f = lp2(900);
  voice(bus.music, t0, 0.32, (t) => f((o() + o2()) * 0.5, 700 + 5200 * Math.exp(-t / 0.05)) * Math.exp(-t / 0.13) * amp, { pan, send: 0.35 });
}
function stab(t0, midis, amp = 0.13) {
  for (const m of midis) {
    const o = sawOsc(mtof(m)), o2 = sawOsc(mtof(m) * 1.006), f = lp2(2500);
    voice(bus.music, t0, 0.35, (t) => f((o() + o2()) * 0.5, 800 + 5000 * Math.exp(-t / 0.08)) * Math.exp(-t / 0.16) * amp, { pan: (rnd() - 0.5) * 0.8, send: 0.3 });
  }
}
function bell(t0, midi, amp = 0.2, pan = 0, dec = 0.6) {
  const f = mtof(midi); const a = sineOsc(f), b = sineOsc(f * 2.76), c = sineOsc(f * 5.4);
  voice(bus.fx, t0, dec * 5, (t) => (a() + b() * 0.35 * Math.exp(-t / 0.15) + c() * 0.15 * Math.exp(-t / 0.05)) * Math.exp(-t / dec) * Math.min(1, t / 0.002) * amp, { pan, send: 0.5 });
}
function click(t0, amp = 0.12) {
  const h = hp1(1800), l = lp1(9000);
  voice(bus.fx, t0, 0.03, (t) => l(h(noise())) * Math.exp(-t / 0.004) * amp * (0.7 + 0.6 * rnd()), { pan: (rnd() - 0.5) * 0.3 });
}
function whoosh(t0, dur, f0, f1, amp = 0.25, pan = 0) {
  const l = lp2(f0);
  voice(bus.fx, t0, dur, (t) => {
    const x = t / dur; const f = f0 * Math.pow(f1 / f0, x);
    return l(noise(), f) * Math.sin(Math.PI * Math.pow(x, 0.8)) * amp * 2;
  }, { pan, send: 0.3 });
}
function riser(t0, dur, amp = 0.3, f0 = 300, f1 = 9000) {
  const h = hp1(f0), sw = lp2(f0);
  let ph = 0;
  voice(bus.fx, t0, dur, (t) => {
    const x = t / dur, f = f0 * Math.pow(f1 / f0, x);
    ph += PI2 * (200 * Math.pow(12, x)) / SR;
    return (sw(h(noise()), f) * 1.2 + Math.sin(ph) * 0.12) * Math.pow(x, 1.6) * amp * 2;
  }, { send: 0.2 });
}
function ping(t0, f, amp = 0.12) {
  const o = sineOsc(f);
  voice(bus.fx, t0, 0.3, (t) => o() * Math.exp(-t / 0.07) * Math.min(1, t / 0.004) * amp, { pan: (rnd() - 0.5) * 0.8, send: 0.15 });
}
function thump(t0, f = 90, amp = 0.6) {
  let ph = 0;
  voice(bus.fx, t0, 0.3, (t) => { ph += PI2 * (f * 0.55 + f * 0.9 * Math.exp(-t / 0.03)) / SR; return Math.sin(ph) * Math.exp(-t / 0.09) * amp; });
}

// ─────────────────────────────────────────────────────────────
//  1 · El vacío (0–3): latido + teclas
// ─────────────────────────────────────────────────────────────
for (let k = 0; k < 3; k++) { thump(0.25 + k, 60, 0.55); thump(0.5 + k, 55, 0.35); }
for (let i = 0; i < S1.text.length; i++) click(S1.start + (i + 1) * S1.rate, S1.text[i] === ' ' ? 0.16 : 0.11);
ping(2.6, 1760, 0.1);

// ─────────────────────────────────────────────────────────────
//  2 · El caos (3–8): avisos, latido que se acelera, zumbido
// ─────────────────────────────────────────────────────────────
chaosTimes().forEach((t, i) => {
  const f = Math.min(3200, 520 * Math.pow(1.05, i)) * (i % 3 === 2 ? 1.414 : 1);
  ping(t, f, 0.10 + Math.min(0.12, i * 0.005)); click(t, 0.2);
});
{
  let t = 3.0;
  while (t < 8.0) {
    const k = (t - 3) / 5;
    thump(t, 62, 0.35 + 0.5 * k);
    t += lerp(0.5, 0.12, Math.pow(k, 0.8));
  }
  // zumbido tenso (tritono) que crece
  const a = sawOsc(55), b = sawOsc(55 * 1.4142), f = lp2(120);
  voice(bus.music, 3, 5, (t) => { const x = t / 5; return f((a() + b() * 0.7), 120 + 900 * x * x) * (0.05 + 0.35 * x * x); }, { send: 0.1 });
  riser(5.5, 2.5, 0.28, 400, 10000);
  // glitches
  for (const [a0, a1] of [[5.9, 6.05], [6.6, 6.72]]) {
    const l = lp1(3500);
    voice(bus.fx, a0, a1 - a0, (t) => (Math.floor(t * 800) % 2 ? 1 : -1) * 0.25 * l(noise() * 0.5 + 0.5), { pan: 0.3 });
  }
  for (let t2 = 7.15; t2 < 8.0; t2 += 0.07) if (rnd() > 0.35) {
    const l = lp1(2500 + rnd() * 3000);
    voice(bus.fx, t2, 0.04, () => l(noise()) * 0.32, { pan: rnd() - 0.5 });
  }
}

// ─────────────────────────────────────────────────────────────
//  3 · Implosión (8–9) y silencio (9–10)
// ─────────────────────────────────────────────────────────────
{
  const o = sineOsc(1), l = lp2(2000);
  let ph = 0;
  voice(bus.fx, 8.0, 1.0, (t) => {
    const x = t / 1.0; const f = 1800 * Math.exp(-4.4 * x);
    ph += PI2 * f / SR;
    const e = Math.pow(x, 0.5) * (t > 0.985 ? Math.max(0, (1 - t) / 0.015) : 1);
    return (Math.sin(ph) * 0.5 + l(noise(), 6000 * Math.exp(-4 * x) + 80) * 0.8) * e * 0.5;
  });
  for (let k = 0; k < 8; k++) thump(8.0 + k * 0.12, 55, 0.4);
  ping(9.12, 880, 0.14); ping(9.5, 659.25, 0.16);
  const s = sineOsc(41);
  voice(bus.fx, 9.3, 0.7, (t) => s() * Math.pow(t / 0.7, 2) * 0.55);
  riser(9.35, 0.65, 0.16, 800, 12000);
}

// ─────────────────────────────────────────────────────────────
//  4–5 · El poder (10–26): drop, beat y efectos de cada acción
// ─────────────────────────────────────────────────────────────
const PROG = [
  { pad: [52, 55, 59, 64], root: 40 },  // Em
  { pad: [48, 52, 55, 60], root: 36 },  // C
  { pad: [47, 50, 55, 59], root: 43 },  // G
  { pad: [50, 54, 57, 62], root: 38 },  // D
];
const chordAt = (t) => PROG[Math.floor((t - T.drop) / 2) % 4];

impact(T.drop, 1);
kick(T.drop, 1.0, { long: true });
[64, 67, 71, 74, 76, 79, 83, 86].forEach((m, i) => bell(T.drop + 0.03 + i * 0.07, m, 0.12, (i % 2 ? 1 : -1) * 0.4, 0.9));
whoosh(12.15, 0.7, 500, 8000, 0.22);

for (let t = T.drop; t < T.s6 - 0.001; t += 2) {
  const c = chordAt(t);
  pad(t, 2.15, c.pad, t < 12 ? 0.20 : 0.15);
  if (t < 12) bass(t, 2, c.root, 0.6);
}
// pulsos desde 12
const END = T.s6 - 0.5; // 25.5
for (let t = 12; t < END - 0.001; t += 0.5) {
  const c = chordAt(t);
  kick(t, 0.85);
  bass(t + 0.25, 0.22, c.root + (Math.round((t - 12) / 0.5) % 4 === 3 ? 12 : 0), 0.45);
  bass(t, 0.22, c.root, 0.5);
  hat(t + 0.25, 0.28);
  if (t >= 21) { hat(t, 0.12); hat(t + 0.125, 0.14); hat(t + 0.375, 0.14); }
}
for (let t = 11.0; t < 12; t += 1) kick(t, 0.6);
for (let t = 14.5; t < END; t += 1) clap(t, 0.55);
// arpegio en semicorcheas desde 15
for (let t = 15; t < END - 0.001; t += 0.125) {
  const c = chordAt(t); const step = Math.round((t - 15) / 0.125);
  const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
  const m = c.pad[pattern[step % 8]] + 24;
  pluck(t, m, 0.09 + 0.07 * clamp((t - 15) / 6), ((step % 4) - 1.5) * 0.35);
}
// subida final 23,5 → 26
riser(23.5, 2.5, 0.45, 300, 12000);
{
  let t = 23.5;
  while (t < T.s6 - 0.01) {
    const k = (t - 23.5) / 2.5;
    snare(t, 0.28 + 0.45 * k, 1 + 0.5 * k);
    t += t < 24.5 ? 0.25 : t < 25.5 ? 0.125 : 0.0625;
  }
}
// sonidos de interfaz por acción
CYCLES.forEach((c) => {
  const ct = cycleTimes(c);
  whoosh(c.t - 0.03, 0.32, 1200, 6000, 0.13, c.t % 2 ? 0.4 : -0.4);
  const n = c.prompt.length;
  for (let i = 0; i < n; i++) click(ct.ts + ((i + 1) / n) * (ct.te - ct.ts), 0.06);
  thump(ct.hit, 120, 0.3);
  whoosh(ct.hit, 0.4, 500, 5000, 0.10);
  bell(ct.done, 88, 0.16, 0.2, 0.5); bell(ct.done + 0.06, 95, 0.12, -0.2, 0.5);
});

// ─────────────────────────────────────────────────────────────
//  6 · Una web. Cien webs. Una conversación. (26–30)
// ─────────────────────────────────────────────────────────────
impact(T.s6, 0.85, 2.5);
kick(T.s6, 1.0, { long: true });
[26, 27.2, 28.7].forEach((t, i) => { if (i) { impact(t, 0.35, 1.2); } thump(t, 80, 0.5); });
for (let t = T.s6; t < 29.5 - 0.001; t += 0.5) {
  const c = chordAt(t);
  if (t > T.s6) kick(t, 0.9);
  bass(t, 0.22, c.root, 0.55); bass(t + 0.25, 0.22, c.root + 12, 0.42);
  hat(t + 0.25, 0.3); hat(t, 0.13); hat(t + 0.125, 0.14); hat(t + 0.375, 0.14);
  if (Math.round((t - 26) / 0.5) % 2 === 1) clap(t, 0.6);
  stab(t, c.pad.map((m) => m + 12), Math.round((t - 26) / 0.5) % 4 === 0 ? 0.13 : 0.07);
}
for (let t = 26; t < 29.5 - 0.001; t += 2) pad(t, 2.15, chordAt(t).pad, 0.17);
for (let t = 26; t < 29.5 - 0.001; t += 0.125) {
  const c = chordAt(t); const step = Math.round((t - 26) / 0.125);
  pluck(t, c.pad[[0, 1, 2, 3, 2, 1, 3, 2][step % 8]] + 24, 0.13, ((step % 4) - 1.5) * 0.35);
}
riser(28.7, 1.3, 0.4, 500, 14000);

// ─────────────────────────────────────────────────────────────
//  7 · Cierre (30–35)
// ─────────────────────────────────────────────────────────────
impact(T.s7, 1, 4);
kick(T.s7, 1.0, { long: true });
pad(T.s7, 5.2, [40, 52, 55, 59, 64, 71], 0.19, 0.5, 2600);
const words = [0.15, 0.45, 0.75, 1.05, 1.5, 1.8, 2.1, 2.4];
words.forEach((w, i) => { thump(T.s7 + w, 100 - i * 4, 0.42); bell(T.s7 + w, 76 + [0, 3, 7, 12, 4, 7, 12, 19][i], 0.08, (i % 2 ? 1 : -1) * 0.3, 0.4); });
for (let k = 0; k < 4; k++) kick(T.s7 + 1 + k, 0.35);
[76, 79, 83, 88, 91, 95, 100].forEach((m, i) => bell(T.s7 + 3.0 + i * 0.09, m, 0.13, (i % 2 ? 1 : -1) * 0.5, 1.0));
bell(T.s7 + 3.2, 71, 0.2, 0, 1.2);
ping(T.s7 + 3.3, 1976, 0.14);
[64, 67, 71, 76, 79].forEach((m, i) => bell(T.s7 + 3.7 + i * 0.25, m, 0.08, (i % 2 ? 1 : -1) * 0.4, 1.1));

// ─────────────────────────────────────────────────────────────
//  Mezcla: sidechain, reverb, corte seco a 29,5–30 y a 9–10, master
// ─────────────────────────────────────────────────────────────
const duck = new Float32Array(N).fill(1);
for (const tk of kickTimes) {
  if (tk < T.drop) continue;
  const i0 = Math.floor(tk * SR);
  for (let i = 0; i < SR * 0.4; i++) { const k = i0 + i; if (k >= N) break; duck[k] = Math.min(duck[k], 1 - 0.55 * Math.exp(-i / (0.11 * SR))); }
}
// reverb Schroeder estéreo
function reverb(inp) {
  const outs = [mk(), mk()];
  const combs = [[1687, 1601, 2053, 2251], [1709, 1637, 2089, 2273]];
  for (let ch = 0; ch < 2; ch++) {
    for (const d of combs[ch]) {
      const buf = new Float32Array(d); let idx = 0, damp = 0;
      for (let i = 0; i < N; i++) {
        const y = buf[idx]; damp += (y - damp) * 0.32;
        buf[idx] = inp[i] + damp * 0.87; outs[ch][i] += y * 0.25;
        if (++idx >= d) idx = 0;
      }
    }
    for (const d of [556, 441]) {
      const buf = new Float32Array(d); let idx = 0;
      for (let i = 0; i < N; i++) { const b = buf[idx]; const x = outs[ch][i]; const y = -0.5 * x + b; buf[idx] = x + 0.5 * y; outs[ch][i] = y; if (++idx >= d) idx = 0; }
    }
  }
  return outs;
}
const rv = reverb(rev);
const gate = new Float32Array(N).fill(1);
const cut = (a, b) => { for (let i = Math.floor(a * SR); i < Math.floor(b * SR) && i < N; i++) gate[i] = Math.min(gate[i], Math.max(0, 1 - (i / SR - a) / 0.008)); };
cut(29.5, 30.0); // corte seco antes del cierre
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR; const g = gate[i];
  let l = (bus.drums[0][i] + bus.music[0][i] * duck[i]) * g + bus.fx[0][i] + rv[0][i] * 0.5;
  let r = (bus.drums[1][i] + bus.music[1][i] * duck[i]) * g + bus.fx[1][i] + rv[1][i] * 0.5;
  L[i] = l; R[i] = r;
}
// silencio absoluto justo antes del drop
for (let i = Math.floor(9.0 * SR); i < Math.floor(9.02 * SR); i++) { L[i] *= 0.2; R[i] *= 0.2; }
// limitador suave + normalizado + fundidos
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.15); R[i] = Math.tanh(R[i] * 1.15); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const norm = 0.89 / peak;
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.03) * Math.min(1, (DUR - t) / 0.9);
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
