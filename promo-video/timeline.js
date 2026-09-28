// Fuente única de tiempos: la usan la animación (canvas) y el audio (python)
const T = {
  dur: 46,
  // escenas: A(intro) -> Mundo -> Libro -> Final
  wipes: [ {t:6.3,d:1.0}, {t:33.4,d:0}, {t:40.3,d:1.0} ],
  // eventos de sonido: [tiempo, tipo, duración/param]
  events: [
    [0.45,'pop'],[1.2,'brush',3.4],[1.7,'label'],[4.9,'hop'],[5.4,'land'],
    [6.3,'brush',1.0],[8.0,'label'],[8.5,'pop'],
    [9.4,'blip'],[10.3,'blip'],[11.2,'blip'],[12.1,'blip'],[13.0,'blip'],
    [15.0,'rumble',3.0],[15.2,'rain',6.6],[16.5,'label'],[16.8,'thunder'],[18.2,'wave',3.0],[19.4,'thunder'],
    [16.3,'tag'],[16.9,'tag'],[17.5,'tag'],[18.1,'tag'],[18.7,'tag'],[19.3,'tag'],
    [21.5,'brush',1.9],[23.2,'sun'],[24.0,'label'],
    [27.2,'label'],[27.6,'owl'],[28.2,'owl'],[28.8,'owl'],[29.4,'owl'],
    [30.5,'tile'],[31.05,'tile'],[31.6,'tile'],[32.15,'tile'],[32.7,'tile'],[33.25,'tile'],
    [33.4,'whoosh',2.2],[34.9,'label'],
    [35.4,'type',3.0],[38.6,'send'],[39.2,'ding'],
    [40.3,'brush',1.0],[41.4,'brush',1.6],[41.6,'pop'],[41.9,'label'],[43.1,'label'],[44.0,'pop'],[45.0,'click'],[45.2,'end']
  ]
};
if (typeof module !== 'undefined') module.exports = T;
