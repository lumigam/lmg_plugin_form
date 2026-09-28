# Vídeo promocional PubliWP (46 s)

Animación de papel recortado y acuarela dibujada por código (canvas) con audio sintetizado.

- `publiwp-promo.mp4`: resultado final (1280x720, 30 fps, audio estéreo).
- `anim.js` + `index.html`: escenas. `timeline.js`: tiempos de escena y efectos de sonido (fuente única).
- `audio.py`: música y efectos (numpy/scipy) leyendo `timeline.json`.
- `render.js`: captura de fotogramas con Playwright.

Regenerar: `node -e "console.log(JSON.stringify(require('./timeline.js')))" > timeline.json`,
`node render.js <worker> <nWorkers> 30` (varios en paralelo), `python3 audio.py`, y unir con ffmpeg.
Tipografías (SIL OFL): Caveat Brush, Patrick Hand, Baloo 2.
