// Línea de tiempo compartida entre la animación (anim.js) y el audio (audio.mjs).
// 96 BPM -> 1 pulso = 0,625 s, 1 compás = 2,5 s. Las escenas empiezan en compases enteros.

export const DUR = 47.5;
export const FPS = 30;
export const BEAT = 0.625;
export const BAR = 2.5;

export const T = {
  s1: 0,      // amanecer en Plasencia
  s2: 5,      // la escalera
  s3: 12.5,   // el apoyo
  s4: 17.5,   // la subida
  s5: 25,     // el talento
  s6: 32.5,   // el relevo
  s7: 37.5,   // falta un cubo
};

// ── Mundo lateral (escenas 1-4). Coordenadas en px de diseño; h = altura sobre el suelo.
export const W = {
  x0: 1500,        // pie del primer escalón
  stepW: 230,
  stepH: 190,
  nSteps: 4,
  cubeS: 100,      // arista de los cubos de apoyo
  landing: 520,
  ground: 1090,    // y de pantalla del suelo con la cámara a ras
};
W.topH = W.stepH * W.nSteps;                    // 760
W.landX = W.x0 + W.stepW * W.nSteps;            // 2420
W.doorX = W.landX + 330;                        // centro de la puerta

// ── Lucía (protagonista) ─────────────────────────────────────
export const WALK_SPEED = 250;                  // px/s
export const LUCIA_START_X = -140;
export const LUCIA_WALK_T0 = 0.5;
export const LUCIA_STOP_X = W.x0 - 100;         // se detiene al pie de la escalera
export const LUCIA_STOP_T = LUCIA_WALK_T0 + (LUCIA_STOP_X - LUCIA_START_X) / WALK_SPEED;

// Cubos de apoyo: cuándo aparece cada uno y dónde (x del centro, h de la base)
export const CUBES = [
  { t: 14.0, x: W.x0 - 120, h: 0 },
  { t: 19.0, x: W.x0 + W.stepW * 1 - 120, h: W.stepH * 1 },
  { t: 20.5, x: W.x0 + W.stepW * 2 - 120, h: W.stepH * 2 },
  { t: 22.0, x: W.x0 + W.stepW * 3 - 120, h: W.stepH * 3 },
];

// Hitos de la subida de Lucía (feet x, h) en el tiempo
export const CLIMB = [
  // t, x, h
  { t: 17.5, x: 1290, h: 0 },
  { t: 17.9, x: 1315, h: 0 },
  { t: 18.3, x: W.x0 - 120, h: W.cubeS },          // sube al cubo 1
  { t: 18.85, x: W.x0 + 50, h: W.stepH },           // al escalón 1
  { t: 19.4, x: W.x0 + W.stepW - 120, h: W.stepH + W.cubeS },   // cubo 2
  { t: 19.95, x: W.x0 + W.stepW + 50, h: W.stepH * 2 },
  { t: 20.9, x: W.x0 + W.stepW * 2 - 120, h: W.stepH * 2 + W.cubeS },
  { t: 21.45, x: W.x0 + W.stepW * 2 + 50, h: W.stepH * 3 },
  { t: 22.4, x: W.x0 + W.stepW * 3 - 120, h: W.stepH * 3 + W.cubeS },
  { t: 22.95, x: W.x0 + W.stepW * 3 + 50, h: W.stepH * 4 },
  { t: 23.9, x: W.doorX - 135, h: W.topH },
];

// ── Textos en pantalla (Lectura Fácil: frases cortas) ────────
export const TXT = {
  amanece: { t0: 1.2, t1: 4.2, a: 'Plasencia.', b: 'Amanece.' },
  escalones: { t0: 8.4, t1: 12.3, a: 'Hay escalones que no están', b: 'pensados para todas las personas.' },
  apoyar1: { t0: 15.0, t1: 17.5, a: 'Apoyar no es hacerlo por ella.' },
  apoyar2: { t0: 16.1, t1: 17.5, a: 'Es poner el peldaño.' },
  talento: { t0: 25.5, t1: 32.4, a: 'Talento hay.', b: 'Sobra.' },
  peldanos: { t0: 34.9, t1: 37.4, a: 'Un peldaño.', b: 'Y otro. Y otro.' },
  socios: { t0: 40.0, t1: 42.5, a: '350 personas ya han', b: 'puesto su cubo.' },
  falta: { t0: 41.1, t1: 42.5, a: 'Falta el tuyo.' },
  slogan: { t0: 44.0, a: 'Sé el peldaño.' },
};

// Vignetas del montaje (escena 5)
export const VIGN = [
  { id: 'premium', t: 25.0, d: 1.5, color: '#a8c000' },
  { id: 'lectura', t: 26.5, d: 1.5, color: '#4b8fcf' },
  { id: 'taller', t: 28.0, d: 1.5, color: '#f5b83d' },
  { id: 'arte', t: 29.5, d: 1.5, color: '#e0607e' },
  { id: 'ocio', t: 31.0, d: 1.5, color: '#2bb3a3' },
];

// Escena 7
export const FINAL = { fly0: 37.5, fly1: 40.0, click: 42.5, word: 42.8, cta: 44.0 };
