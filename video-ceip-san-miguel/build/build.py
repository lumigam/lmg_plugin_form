fonts=open('fonts.css').read()
chars=open('chars.js').read()
anim=open('anim.js').read()
html=f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>CEIP San Miguel · El Libro de los Seis Rincones</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>{fonts}
html,body{{margin:0;height:100%;background:#0d0f26;overflow:hidden}}
body{{display:flex;align-items:center;justify-content:center;position:relative}}
svg{{width:min(100vw,177.78vh);height:auto;aspect-ratio:16/9;display:block;font-family:"Figtree","Trebuchet MS",sans-serif}}
svg text{{font-family:"Bricolage Grotesque","Figtree","Trebuchet MS",sans-serif}}
#play{{position:absolute;inset:auto;padding:14px 28px;font:700 20px "Figtree",sans-serif;border:0;border-radius:40px;background:#fff;color:#1E2140;cursor:pointer}}
body.render #play{{display:none}}
</style></head><body>
<svg id="s" viewBox="0 0 320 180" role="img" aria-label="Anuncio animado del CEIP San Miguel"></svg>
<button id="play">▶ Ver anuncio</button>
<script>
{chars}
{anim}
</script></body></html>'''
open('../anuncio.html','w').write(html)
print(len(html))
