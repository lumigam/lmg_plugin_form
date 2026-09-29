import re
fonts=open('fonts.css').read()
parts=['guard.js','people.js','core.js','art.js','scenes_a.js','scenes_b.js','scenes_c.js','scenes_d.js','scenes_e.js','main.js']
js=''
for p in parts:
    try: js+=open(p).read()+'\n'
    except FileNotFoundError: print('falta',p)
html=f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>CEIP San Miguel · El Libro de los Seis Rincones</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{fonts}
html,body{{margin:0;height:100%;background:#120f3a;overflow:hidden}}
body{{display:flex;align-items:center;justify-content:center;position:relative}}
svg{{width:min(100vw,177.78vh);height:auto;aspect-ratio:16/9;display:block}}
#play{{position:absolute;padding:14px 28px;font:700 20px "Figtree",sans-serif;border:0;border-radius:40px;background:#fff;color:#1E2140;cursor:pointer}}
</style></head><body>
<svg id="s" viewBox="0 0 320 180" role="img" aria-label="Anuncio animado del CEIP San Miguel"></svg>
<button id="play">▶ Ver anuncio</button>
<script>
{js}
const svgEl=document.getElementById('s');
window.renderAt=t=>{{svgEl.innerHTML=frame(t);return t;}};
window.TOTAL=TOTAL;
(function(){{
  const q=new URLSearchParams(location.search);
  if(q.has('render')){{document.getElementById('play').hidden=true;renderAt(+q.get('t')||0);return;}}
  let playing=false,t0=0;const btn=document.getElementById('play');
  const tick=n=>{{if(!playing)return;const t=(n-t0)/1000;if(t>=TOTAL){{playing=false;btn.hidden=false;return;}}renderAt(t);requestAnimationFrame(tick);}};
  btn.onclick=()=>{{playing=true;btn.hidden=true;t0=performance.now();requestAnimationFrame(tick);}};
  renderAt(0.01);
}})();
window.fontsReady=Promise.all([document.fonts.load('800 20px "Bricolage Grotesque"'),document.fonts.load('700 20px Figtree'),document.fonts.load('800 20px Figtree')]).then(()=>{{renderAt(0.01);}});
</script></body></html>'''
open('../anuncio.html','w').write(html)
print(len(html))
