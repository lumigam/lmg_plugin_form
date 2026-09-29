# CEIP San Miguel · El Libro de los Seis Rincones

Anuncio animado de 76 s (1920×1080, 30 fps) hecho con JavaScript y SVG, sin voz en off.

- `CEIP_San_Miguel_anuncio.mp4`: vídeo final con música.
- `anuncio.html`: la animación, se reproduce en el navegador (botón «Ver anuncio»).
- `build/`: fuentes. `anim.js` (escenas y textos), `chars.js` (personajes), `audio.py` (música y sonidos), `render.mjs` (graba los fotogramas con Playwright).

Para regenerar: `python3 build/build.py`, `python3 build/audio.py`, grabar con `node build/render.mjs 0 1 2280` y codificar con ffmpeg.
