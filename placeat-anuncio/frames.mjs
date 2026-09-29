// Saca fotogramas sueltos para revisar: node frames.mjs 1 5 9.5 12 ...   (formato: FORMATO=1080x1350)
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const [w, h] = (process.env.FORMATO || '1080x1350').split('x').map(Number);
const times = process.argv.slice(2).map(Number);
const srv = await serve(8123);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] }).catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
const p = await b.newPage({ viewport: { width: w, height: h } });
p.on('console', (m) => console.log('[page]', m.text())); p.on('pageerror', (e) => console.log('[error]', e.message));
await p.goto(`http://localhost:8123/index.html?render=1&w=${w}&h=${h}`);
await p.waitForFunction('window.READY === true', null, { timeout: 30000 });
fs.mkdirSync('out/frames', { recursive: true });
for (const t of times) { await p.evaluate((t) => window.draw(t), t); await p.locator('#c').screenshot({ path: `out/frames/t${String(t).replace('.', '_')}.png` }); }
await b.close(); srv.close();
