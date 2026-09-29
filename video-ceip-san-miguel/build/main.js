/* ===== Línea de tiempo (96 bpm: 1 compás = 2,5 s) ===== */
const ST=[0,7.5,15,20,27.5,35,42.5,50,57.5,65];
const TOTAL=82.5,TR=.9;
const ACT=[S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
const LABELS=[null,null,null,'mov','sim','exp','bib','log','art',null];
const TITLES={mov:['MOVIMIENTO','y psicomotricidad'],sim:['SIMBÓLICO',''],exp:['EXPERIMENTACIÓN','y naturaleza'],bib:['BIBLIOTECA','y letras'],log:['LÓGICO-MATEMÁTICO',''],art:['ARTE','']};
const NAMES={mov:'Movimiento y psicomotricidad',sim:'Simbólico',exp:'Experimentación y naturaleza',bib:'Biblioteca y letras',log:'Lógico-matemático',art:'Arte'};
const CAPDEF=[
 [[.7,3.3,'Amanece en **Plasencia**.'],[3.9,7.0,'**Migui** atrapa una hoja en blanco y vuela hacia el cole.']],
 [[.5,3.4,'Noa llega al cole. Todo es **nuevo** y muy grande.'],[3.9,7.0,'Un libro gris le espera… y le falta una **página**.']],
 [[.3,2.5,'Con un poco de **valor**, Noa coloca la hoja.'],[2.7,4.7,'Y el libro se **abre**.']],
 [[1.7,4.3,'Brinco solo sabe **saltar**. ¡Noa salta con él!'],[4.6,7.0,'Cada salto enciende una **luz**.']],
 [[1.7,4.3,'En la tienda de Telón, Noa juega a ser **tendera**.'],[4.6,7.0,'Aquí puede ser lo que **quiera**.']],
 [[1.7,4.3,'Musgo pregunta: ¿y si miramos **de cerca**?'],[4.6,7.0,'Con la lupa, una semilla se hace **flor**.']],
 [[1.7,4.3,'Tinta hace volar las **letras**.'],[4.6,7.0,'Noa las atrapa y forma su **nombre**.']],
 [[1.7,4.3,'Cuenta ordena los bloques del **1 al 5**.'],[4.6,7.0,'Noa coloca el que falta y todo **encaja**.']],
 [[1.7,4.3,'Mancha cambia de color con cada **huella**.'],[4.6,7.0,'Noa deja las suyas en el **lienzo**.']],
 [[.5,4.2,'Con las seis luces, **Noa** escribe la última página.'],[4.6,7.9,'Y en ella aparece su **cole**.'],[8.5,11.6,'Ya no es nuevo. Ya es su **casa**.']]
];
const CAPS=[];CAPDEF.forEach((arr,i)=>arr.forEach(([a,b,t])=>CAPS.push([ST[i]+a,ST[i]+b,t,LABELS[i]||['mov','sim','exp','bib','log','art'][i%6]])));
const TITLE_T0=ST[9]+12.5;

function pageTurnSVG(A,B,p){
  const x=320*(1-p),b=28*Math.sin(p*Math.PI),d=`M${x} 0 C${x+b} 60 ${x-b*.4} 120 ${x+b*.2} 180`;
  const letters=Array.from({length:8},(_,i)=>{const yy=14+i*22,xx=x+6+Math.sin(i*2.1+p*6)*12,al=Math.sin(Math.PI*p)*.85;return `<text x="${xx}" y="${yy}" font-size="17" font-weight="800" fill="${LC[i%6]}" opacity="${al}" transform="rotate(${Math.sin(i+p*7)*30} ${xx} ${yy})" font-family="'Bricolage Grotesque',sans-serif">${'ABC123ÑO'[i]}</text>`;}).join('');
  return `${A}<clipPath id="wipe"><path d="${d} L340 180 L340 0Z"/></clipPath><linearGradient id="pshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1240" stop-opacity="0"/><stop offset="1" stop-color="#1a1240" stop-opacity=".38"/></linearGradient>
  <g clip-path="url(#wipe)">${B}</g><path d="${d} L${x-24} 180 L${x-24} 0Z" fill="url(#pshade)"/><path d="${d}" stroke="#fffaf0" stroke-width="1.6" fill="none"/>${letters}`;
}
function frame(t){
  t=cl(t,0,TOTAL-.001);
  let i=ACT.length-1;while(t<ST[i])i--;
  const u=t-ST[i];let body;
  if(i>0&&u<TR){body=pageTurnSVG(ACT[i-1](ST[i]-ST[i-1]+u),ACT[i](u),eio(u/TR));}
  else body=ACT[i](u);
  let ov='';
  const k=LABELS[i];
  if(k){ov+=chipSVG(NAMES[k],COL[k],k==='log'?'#3a2a00':'#ffffff',seg(u,.6,1.3));const tt=TITLES[k];ov+=titleCard(tt[0],tt[1],COL[k],k==='log'?'#3a2a00':'#ffffff',u);}
  CAPS.forEach(([a,b,txt,kk])=>{const al=Math.min(seg(t,a,a+.45),1-seg(t,b-.45,b));if(al>0)ov+=captionSVG(txt,eo(al),COL[kk]);});
  ov+=finalTitle(t);
  const fi=1-seg(t,0,.8),fo=seg(t,TOTAL-1.6,TOTAL-.05);
  const tb=eo(seg(t,TITLE_T0,TITLE_T0+1.2));if(tb>0)body=`<filter id="tb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${(tb*2.2).toFixed(2)}"/></filter><g filter="url(#tb)">${body}</g>`;
  return DEFS+body+`<rect width="320" height="180" fill="url(#vig)"/><rect width="320" height="180" filter="url(#grain)" opacity=".55" style="mix-blend-mode:multiply"/>`+ov+
    (fi>0?`<rect width="320" height="180" fill="#fff6e4" opacity="${fi}"/>`:'')+(fo>0?`<rect width="320" height="180" fill="#fff6e4" opacity="${fo}"/>`:'');
}
function finalTitle(t){
  const a=eo(seg(t,TITLE_T0,TITLE_T0+1.1));if(a<=0)return '';
  const b=eo(seg(t,TITLE_T0+1.1,TITLE_T0+2.2));
  const dots=LC.map((c,i)=>{const d=eob(seg(t,TITLE_T0+.6+i*.1,TITLE_T0+1.2+i*.1));return C(160+(i-2.5)*13,92,3.4*d,c);}).join('');
  return `<g><rect width="320" height="180" fill="#1c1852" opacity="${.62*a}"/><g opacity="${a}" transform="translate(0 ${(1-a)*6})"><text x="160" y="76" text-anchor="middle" font-size="27" font-weight="800" fill="#fffaf0" font-family="'Bricolage Grotesque',Figtree,sans-serif">CEIP San Miguel</text></g>${dots}<g opacity="${b}"><text x="160" y="110" text-anchor="middle" font-size="7.6" font-weight="700" fill="#e7e9ff" font-family="Figtree,sans-serif" letter-spacing="1.2">EL ESPACIO TAMBIÉN ENSEÑA</text></g></g>`;
}
