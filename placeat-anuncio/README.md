# PLACEAT · «El peldaño» (animación a código, sin voz en off)

Anuncio animado de 47,5 s para captar socios y socias de PLACEAT.
Ilustración 2D con personajes animados en Canvas + banda sonora sintetizada por código
(piano, cuerdas, timbal, marimba y efectos de sonido). Sin voz en off.

## Historia
Lucía llega a una escalera con escalones demasiado altos. Marta no la sube en brazos: le pone un peldaño (un cubo,
como los del logotipo). Lucía sube por sí misma, abre la puerta y descubre lo que pasa cuando hay apoyo: talento.
Más tarde ella pone el peldaño a otra persona. Los cubos forman el logotipo de PLACEAT, al que le falta una pieza: la tuya.

## Ver / regenerar
```bash
npm install
node audio.mjs          # sintetiza out/audio.wav
node render.mjs         # out/placeat-anuncio-4x5.mp4 (1080×1350, 30 fps)
node serve.mjs          # vista previa en http://localhost:8080 (clic para reproducir con sonido)
FORMATO=1080x1920 node render.mjs   # 9:16 · también 1080x1080 (1:1) y 1920x1080 (16:9)
node frames.mjs 12.5 25 42.5        # fotogramas sueltos en out/frames/
```

## Archivos
- `shared.js`  línea de tiempo y textos (compartidos por imagen y sonido).
- `lib.js` · `people.js`  utilidades y rig de personajes (Lucía, Marta, Diego y bustos del montaje).
- `world.js`  escenas 1-4 (amanecer en Plasencia, escalera, apoyo, subida).
- `scenes2.js`  escenas 5-7 (montaje de talento, relevo y ciudad de cubos, cierre con el logotipo).
- `audio.mjs`  música y efectos.  `render.mjs`  captura fotograma a fotograma + ffmpeg.
