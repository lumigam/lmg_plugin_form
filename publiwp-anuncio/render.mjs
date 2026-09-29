// Renderiza el anuncio a MP4 (fotograma a fotograma, determinista) y le mezcla el audio.
//   node audio.mjs && node render.mjs
//   FORMATO=1080x1080 node render.mjs        (cuadrado)   ·  FORMATO=1920x1080 (horizontal)
//   FPS=60 node render.mjs                   (más fluido, tarda el doble)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { serve } from './serve.mjs';
import ffmpegPath from 'ffmpeg-static';
import fs from 'node:fs';

const formato = process.env.FORMATO || '1080x1350';
const [w, h] = formato.split('x').map(Number);
const fps = +process.env.FPS || 30;
const nombre = { '1080x1350': '4x5', '1080x1080': '1x1', '1920x1080': '16x9', '1080x1920': '9x16' }[formato] || formato;
const outFile = process.env.OUT || `out/publiwp-anuncio-${nombre}.mp4`;
if (!fs.existsSync('out/audio.wav')) { console.error('Falta out/audio.wav -> ejecuta antes: node audio.mjs'); process.exit(1); }

const srv = await serve(8124);
const chrome = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: fs.existsSync(chrome) ? chrome : undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('pageerror', (e) => console.error('[error página]', e.message));
await page.goto(`http://localhost:8124/index.html?render=1&w=${w}&h=${h}`);
await page.waitForFunction('window.READY === true', null, { timeout: 30000 });
const dur = await page.evaluate('window.DUR');
const total = Math.round(dur * fps);

const ff = spawn(ffmpegPath, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-i', 'out/audio.wav',
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-r', String(fps),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart',
  outFile,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const cerrado = new Promise((ok) => ff.on('close', ok));

const t0 = Date.now();
const canvas = page.locator('#c');
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.draw(t), f / fps);
  const png = await canvas.screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise((ok) => ff.stdin.once('drain', ok));
  if (f % 60 === 0) process.stdout.write(`\r  fotograma ${f}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
ff.stdin.end();
await cerrado;
await browser.close(); srv.close();
const mb = (fs.statSync(outFile).size / 1048576).toFixed(1);
console.log(`\n✔ ${outFile} · ${w}x${h} · ${fps} fps · ${dur}s · ${mb} MB · ${((Date.now() - t0) / 1000).toFixed(0)} s de render`);
