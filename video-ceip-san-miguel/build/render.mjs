import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import {pathToFileURL} from 'url';
const [start,step,total,fps=30]=process.argv.slice(2).map(Number);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto(pathToFileURL(new URL('../anuncio.html',import.meta.url).pathname).href+'?render=1');
await p.evaluate(()=>document.fonts.ready);
const t0=Date.now();
for(let f=start;f<total;f+=step){
  await p.evaluate(t=>window.renderAt(t),f/fps);
  await p.screenshot({path:`frames/f_${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:93});
  if((f-start)/step%100===0)console.log(start,f,((Date.now()-t0)/1000).toFixed(0)+'s');
}
await b.close();
