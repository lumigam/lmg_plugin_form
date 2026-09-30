const { chromium } = require('playwright'); const fs = require('fs');
const [,, wk, nw, fps] = process.argv; const FPS = +fps, N = Math.round(46 * FPS);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 1280 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/index.html'); await p.waitForFunction('window.ready===true');
  fs.mkdirSync('out', { recursive: true });
  const S0=+(process.env.START||0), E0=+(process.env.END||N);
  for (let i = S0 + +wk; i < E0; i += +nw) {
    await p.evaluate(t => render(t), i / FPS);
    await p.locator('#c').screenshot({ path: `out/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
  await b.close(); console.log('worker', wk, 'done');
})();
