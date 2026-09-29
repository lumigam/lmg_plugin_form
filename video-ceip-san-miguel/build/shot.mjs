import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import {pathToFileURL} from 'url';
const [dir,...ts]=process.argv.slice(2);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:960,height:540}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(pathToFileURL('/home/user/lmg_plugin_form/video-ceip-san-miguel/anuncio.html').href+'?render=1');
await p.evaluate(()=>document.fonts.ready);
for(const t of ts){await p.evaluate(t=>window.renderAt(t),+t);await p.screenshot({path:`${dir}/f_${String(t).padStart(5,'0')}.png`});}
await b.close();
