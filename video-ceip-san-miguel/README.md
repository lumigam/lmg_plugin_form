# CEIP San Miguel · El Libro de los Seis Rincones

Anuncio animado de 82,5 s (1920×1080, 30 fps) hecho con JavaScript y SVG, sin voz en off.

- `CEIP_San_Miguel_anuncio.mp4`: vídeo final con música.
- `anuncio.html`: la animación, se reproduce en el navegador (botón «Ver anuncio»).
- `build/`: fuentes. `people.js` y `guard.js` (personajes), `core.js` (cámara, capas, textos), `art.js` (escenarios), `scenes_*.js` (las 10 escenas), `main.js` (montaje y transiciones), `audio2.py` (música y sonidos), `render.mjs` (graba los fotogramas con Playwright). `build/v1/` guarda la primera versión.

Para regenerar: `python3 build/build.py`, `python3 build/audio2.py`, grabar con `node build/render.mjs W 4 2475` (W = 0..3, cuatro procesos a la vez) y codificar con ffmpeg.
