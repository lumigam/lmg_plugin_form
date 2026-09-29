# Anuncio de PubliWP (motion graphics a código)

Vídeo de 35 s hecho 100 % con JavaScript: animación en Canvas 2D + banda sonora sintetizada por código.
Sin voz en off, sin muestras de audio, sin editor de vídeo.

## Ver / regenerar

```bash
npm install
node audio.mjs          # sintetiza out/audio.wav
node render.mjs         # renderiza out/publiwp-anuncio-4x5.mp4 (1080×1350, 30 fps)
node serve.mjs          # vista previa en http://localhost:8080 (clic para reproducir con sonido)
```

Otros formatos (misma composición, reencuadrada):

```bash
FORMATO=1080x1080 node render.mjs   # cuadrado
FORMATO=1080x1920 node render.mjs   # vertical 9:16 (Reels / Stories)
FORMATO=1920x1080 node render.mjs   # horizontal 16:9
FPS=60 node render.mjs              # más fluido (tarda el doble)
```

## Archivos

- `shared.js`  línea de tiempo (escenas, textos, pulsos) compartida por imagen y sonido.
- `anim.js`    todas las escenas; `draw(t)` es una función pura del tiempo.
- `audio.mjs`  batería, bajo, pads, arpegios, efectos de interfaz y mezcla (sidechain + reverb).
- `render.mjs` captura fotograma a fotograma con Playwright y codifica con ffmpeg.
