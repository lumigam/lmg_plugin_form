import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';
const srv = await serve(8125);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1500, height: 1350 } });
p.on('pageerror', (e) => console.log('[error]', e.message)); p.on('console', (m) => console.log('[page]', m.text()));
await p.goto('http://localhost:8125/chartest.html'); await p.waitForTimeout(800);
await p.screenshot({ path: 'out/chartest.png' }); await b.close(); srv.close();
