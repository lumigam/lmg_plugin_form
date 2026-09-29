// Línea de tiempo compartida entre la animación (anim.js) y el audio (audio.mjs).
// 120 BPM -> 1 pulso = 0,5 s. Todo lo que suena está anclado a estos tiempos.

export const DUR = 35;
export const FPS = 30;
export const BEAT = 0.5;

export const T = {
  s2: 3,      // el caos
  s3: 8,      // implosión
  quiet: 9,   // silencio
  drop: 10,   // nace PubliWP
  s6: 26,     // de una web a cien
  s7: 30,     // cierre
};

export const S1 = {
  text: 'Solo quería cambiar un texto.',
  start: 0.5,
  rate: 0.055,
};

export const CYCLES = [
  { id: 'horario',   t: 12.5, d: 2.5, prompt: 'Cambia el horario: este sábado cerramos a las dos.',        done: 'Horario actualizado' },
  { id: 'elementor', t: 15,   d: 2,   prompt: 'Rediseña la página de servicios con Elementor. Más moderna.', done: 'Página rediseñada' },
  { id: 'audit',     t: 17,   d: 2,   prompt: 'Audita SEO, accesibilidad y privacidad. Arregla lo urgente.', done: 'Auditoría completa' },
  { id: 'backup',    t: 19,   d: 2,   prompt: 'Haz una copia de seguridad antes de tocar nada.',            done: 'Copia verificada' },
  { id: 'cpt',       t: 21,   d: 2,   prompt: 'Crea «Propiedades» con campos ACF y su listado en JetEngine.', done: 'Contenido creado' },
  { id: 'plugins',   t: 23,   d: 1.5, prompt: '¿Qué plugins me sobran? Quítalos sin romper nada.',          done: '12 plugins → 4' },
  { id: 'post',      t: 24.5, d: 1.5, prompt: 'Escribe un artículo para el blog y déjalo en borrador.',     done: 'Borrador listo' },
];

export function cycleTimes(c) {
  const fast = c.d < 2;
  const ts = c.t + 0.05;
  const te = c.t + (fast ? 0.55 : 0.7);
  const hit = te + 0.08;
  const done = c.t + c.d - (fast ? 0.42 : 0.55);
  return { ts, te, hit, done, end: c.t + c.d };
}

// Avisos que se van acumulando en la escena del caos (cada vez más deprisa).
export function chaosTimes() {
  const a = [];
  let t = 3.15;
  while (t < 7.9) {
    a.push(t);
    const k = (t - 3) / 5;
    t += 0.5 - 0.4 * Math.pow(k, 0.7);
  }
  return a;
}

export const CHAOS_TEXTS = [
  ['47 actualizaciones pendientes', 'Plugins, temas y un poco de fe', '#f59e0b'],
  ['Error crítico en este sitio web', 'Ya sabes cuál. Pantalla blanca.', '#ff4b5c'],
  ['¿Qué plugin hacía esto?', 'Nadie lo recuerda', '#f59e0b'],
  ['Conflicto entre dos plugins', 'Ninguno quiere ceder', '#ff4b5c'],
  ['SEO: 143 avisos', 'Prioridad: todos', '#f59e0b'],
  ['Accesibilidad: ¿qué es eso?', 'Pregúntale a tu abogado', '#ff4b5c'],
  ['Última copia de seguridad: hace 8 meses', 'Qué podría salir mal', '#ff4b5c'],
  ['Elementor no carga', 'Otra vez', '#f59e0b'],
  ['Aviso de cookies… y otro más', 'Y ahora el RGPD', '#f59e0b'],
  ['La caché: ¿la borro? ¿Toda?', 'Da miedo tocar', '#f59e0b'],
  ['Tu sesión ha caducado', 'Vuelve a empezar', '#ff4b5c'],
  ['Pestaña 17 de 17', 'Una es de 2019', '#f59e0b'],
  ['El tema hijo ya no es hijo de nadie', 'Custodia compartida de CSS', '#ff4b5c'],
  ['Plugin desactivado por seguridad', 'El que hacía todo el trabajo', '#ff4b5c'],
  ['¿Dónde estaba ese ajuste?', 'Ajustes > Ajustes > Ajustes', '#f59e0b'],
];
