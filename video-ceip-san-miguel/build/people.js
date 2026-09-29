/* ===== Personajes con rig: brazos por ángulo, piernas, expresiones y parpadeo ===== */
const blinkAt=(t,seed=0)=>{const p=(t+seed*1.37)%3.3;return p<.15?Math.sin(p/.15*Math.PI):0;};
const ARM=(sx,sy,a,len,w,col)=>{const r=a*Math.PI/180;return [sx+Math.sin(r)*len,sy+Math.cos(r)*len];};
function eyesMk(kind,b,cx,cy,dx,r,col){
  // kind: open | happy | wide | closed
  if(kind==='happy')return [-1,1].map(s=>`<path d="M${cx+s*dx-r*1.3} ${cy+.4} Q${cx+s*dx} ${cy-r*2} ${cx+s*dx+r*1.3} ${cy+.4}" stroke="${col}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`).join('');
  if(kind==='closed')return [-1,1].map(s=>`<path d="M${cx+s*dx-r*1.3} ${cy} Q${cx+s*dx} ${cy+r*1.2} ${cx+s*dx+r*1.3} ${cy}" stroke="${col}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`).join('');
  const k=kind==='wide'?1.35:1,ry=Math.max(.15,1-b*.9)*r*k;
  return [-1,1].map(s=>E(cx+s*dx,cy,r*k,ry,col)+(b<.4?C(cx+s*dx+.5,cy-.5*k,.45,'#fff','opacity=".9"'):'')).join('');
}
function mouthMk(kind,cx,cy){
  if(kind==='open')return `<path d="M${cx-2.6} ${cy} Q${cx} ${cy+5} ${cx+2.6} ${cy}Z" fill="#7A2530"/><path d="M${cx-1.4} ${cy+2.2} Q${cx} ${cy+3.4} ${cx+1.4} ${cy+2.2}" fill="#F0837A"/>`;
  if(kind==='o')return E(cx,cy+1,1.2,1.6,'#7A2530');
  if(kind==='flat')return `<path d="M${cx-1.8} ${cy+.8} H${cx+1.8}" stroke="#2E2233" stroke-width="1" stroke-linecap="round"/>`;
  return `<path d="M${cx-2.5} ${cy} Q${cx} ${cy+2.4} ${cx+2.5} ${cy}" stroke="#2E2233" stroke-width="1" fill="none" stroke-linecap="round"/>`;
}
/* Noa y los compañeros (babi de cuadros) */
function kidR(o={}){
  const skin=o.skin||'#E2A57A',hair=o.hair||'#2E2233',dress=o.dress||'#1FA6A0';
  const la=o.la??30,ra=o.ra??30,t=o.t||0,seed=o.seed||0;
  const bl=o.blink??blinkAt(t,seed);
  const lgL=o.lgL||0,lgR=o.lgR||0;
  const [lx,ly]=ARM(-7,-26,-la,12.5),[rx,ry]=ARM(7,-26,ra,12.5);
  const btn=o.btn||[0,0,0,0,0,0];
  let btns='';for(let i=0;i<6;i++){const y=-25.4+i*2.55,lv=btn[i];const k=Object.keys(LIGHT)[i];
    btns+=C(0,y,1,lv>0?LIGHT[k]:'#F3EBDD')+(lv>0?C(0,y,1+3.2*lv,LIGHT[k],`opacity="${.35*lv}"`):'');}
  const tilt=o.tilt||0;
  return `
  <g transform="rotate(${lgL} -4 -8)">${R(-6,-8,4,8,skin)}${R(-7,-2,6,2.5,hair,1)}</g>
  <g transform="rotate(${lgR} 4 -8)">${R(2,-8,4,8,skin)}${R(1,-2,6,2.5,hair,1)}</g>
  <path d="M-10 -8 L-7 -28 H7 L10 -8Z" fill="${dress}"/>
  <path d="M-10 -8 L-7 -28 H7 L10 -8Z" fill="url(#gingham)" opacity=".35"/>
  ${btns}
  <line x1="-7" y1="-26" x2="${lx}" y2="${ly}" stroke="${skin}" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="7" y1="-26" x2="${rx}" y2="${ry}" stroke="${skin}" stroke-width="3.5" stroke-linecap="round"/>
  ${o.hc?C(lx,ly,3.2,o.hc)+C(rx,ry,3.2,o.hc):''}
  <ellipse cx="0" cy="-27.4" rx="8.2" ry="3" fill="${o.scarf||'#E5484D'}"/>
  <g transform="rotate(${tilt} 0 -30)">
  <circle cx="0" cy="-37" r="10" fill="${skin}"/>
  <path d="M-10.5 -38 A10.5 10.5 0 0 1 10.5 -38 Q0 -45 -10.5 -38Z" fill="${hair}"/>
  ${o.crown?'<path d="M-6 -46 L-6 -55 L-3 -50 L0 -56 L3 -50 L6 -55 L6 -46Z" fill="#F2B01E"/>':(o.hat?o.hat:C(0,-49,4.5,hair))}
  ${eyesMk(o.eyes||'open',bl,0,-36.5,3.5,1.25,hair)}
  ${o.brow?`<path d="M-5.5 ${-40-o.brow*1.2} Q-3.5 ${-41.2-o.brow*1.6} -1.8 ${-40-o.brow*1.2}" stroke="${hair}" stroke-width=".8" fill="none" stroke-linecap="round"/><path d="M5.5 ${-40-o.brow*1.2} Q3.5 ${-41.2-o.brow*1.6} 1.8 ${-40-o.brow*1.2}" stroke="${hair}" stroke-width=".8" fill="none" stroke-linecap="round"/>`:''}
  <circle cx="-6" cy="-33" r="2" fill="#F0837A" opacity=".6"/><circle cx="6" cy="-33" r="2" fill="#F0837A" opacity=".6"/>
  ${mouthMk(o.mouth||'smile',0,-32)}
  </g>`;
}
/* La seño */
function senR(o={}){
  const t=o.t||0,bl=o.blink??blinkAt(t,4),la=o.la??32,ra=o.ra??32;
  const [lx,ly]=ARM(-9,-39,-la,13),[rx,ry]=ARM(9,-39,ra,13);
  let btn='';Object.values(LIGHT).forEach((c,i)=>btn+=C(0,-38+i*4.6,1.5,c)+(o.glow?C(0,-38+i*4.6,3.6,c,`opacity=".28"`):''));
  let dots='';[[-7,-34],[6,-38],[-8,-24],[8,-22],[-5,-16],[9,-15]].forEach(p=>dots+=C(p[0],p[1],1.3,'#FFFFFF','opacity=".8"'));
  return `
  <rect x="-6" y="-12" width="4.5" height="12" fill="#F0C7A2"/><rect x="1.5" y="-12" width="4.5" height="12" fill="#F0C7A2"/>
  <rect x="-8" y="-2" width="7" height="2.5" rx="1" fill="#3A2A33"/><rect x="1" y="-2" width="7" height="2.5" rx="1" fill="#3A2A33"/>
  <line x1="-9" y1="-39" x2="${lx}" y2="${ly}" stroke="#8CC0F7" stroke-width="5" stroke-linecap="round"/><line x1="9" y1="-39" x2="${rx}" y2="${ry}" stroke="#8CC0F7" stroke-width="5" stroke-linecap="round"/>
  ${C(lx+(lx<-9?-.5:.5),ly+2,2.6,'#F0C7A2')}${C(rx+.5,ry+2,2.6,'#F0C7A2')}
  <path d="M-13 -12 L-9 -43 H9 L13 -12Z" fill="#8CC0F7"/><path d="M-13 -12 L-9 -43 H9 L13 -12Z" fill="url(#gingham)" opacity=".4"/>${dots}
  ${R(4,-30,7,7,'#FFFFFF',1.5)}${C(7.5,-28,1.6,COL.art)}${btn}
  ${E(0,-44,4,3,'#F0C7A2')}${C(-6,-43,3,'#FFFFFF')}${C(-2,-42,3,'#FFFFFF')}${C(2,-42,3,'#FFFFFF')}${C(6,-43,3,'#FFFFFF')}
  <g transform="rotate(${o.tilt||0} 0 -44)">
  ${C(0,-54,10.5,'#F0C7A2')}
  <path d="M-11 -55 A11 11 0 0 1 11 -55 Q0 -63 -11 -55Z" fill="#7A4A2B"/>${C(0,-67,5,'#7A4A2B')}
  ${eyesMk(o.eyes||'open',bl,0,-53.5,3.6,1.25,'#2B1E1A')}
  <circle cx="-6.3" cy="-50" r="2" fill="#F0837A" opacity=".55"/><circle cx="6.3" cy="-50" r="2" fill="#F0837A" opacity=".55"/>
  ${mouthMk(o.mouth||'smile',0,-49.2)}</g>`;
}
/* Migui de pie (eyes open|closed|happy, beak 0..1, wing 0..1) */
function miguiR(o={}){
  const t=o.t||0,b=o.blink??blinkAt(t,2),beak=o.beak||0,w=o.wing||0;
  const eye=o.eyes==='closed'?`<path d="M5.4 -35 Q7.4 -33.4 9.4 -35" stroke="#2B2E45" stroke-width="1.1" fill="none" stroke-linecap="round"/>`
    :o.eyes==='happy'?`<path d="M5.4 -34.4 Q7.4 -37 9.4 -34.4" stroke="#2B2E45" stroke-width="1.1" fill="none" stroke-linecap="round"/>`
    :E(7.5,-35,1.4,Math.max(.2,1.4*(1-b*.9)),'#2B2E45')+(b<.4?C(8,-35.6,.5,'#fff'):'');
  return `
  <line x1="-3" y1="-9" x2="-3" y2="0" stroke="#F0623A" stroke-width="2"/><line x1="3" y1="-9" x2="3" y2="0" stroke="#F0623A" stroke-width="2"/>
  ${E(0,-18,10,10,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  <g transform="rotate(${-w*70} -6 -22)"><path d="M-9 -22 Q-15 -14 -5 -10 Q-4 -18 -9 -22Z" fill="#2B2E45"/></g>
  ${C(6,-33,6.5,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  <polygon points="11,-35 27,-31.5 11,-${31.5-beak*0}" fill="#F0623A"/>
  <polygon points="11,-31 ${25},${-29.6+beak*4} 11,-29.4" fill="#E0532B" transform="rotate(${beak*10} 11 -31)"/>
  ${eye}
  <circle cx="4" cy="-31" r="1.6" fill="#FF9AA6" opacity=".55"/>
  <path d="M3 -40 l-2 -4 M6 -40 l0 -5" stroke="#B8BCD6" stroke-width="1.2" stroke-linecap="round"/>`;
}
/* Migui volando */
function flyR(page,f,o={}){
  const a=f*26,b=o.blink??0;
  return `
  <g transform="rotate(${a} -2 -6)"><path d="M-2 -6 Q-18 -34 -40 -30 Q-22 -20 -6 -2Z" fill="#FFFFFF" stroke="#CDD1E6" stroke-width="1"/><path d="M-30 -31 Q-38 -30 -40 -30 Q-32 -25 -24 -22Z" fill="#2B2E45"/></g>
  <g transform="rotate(${-a} 2 -6)"><path d="M2 -6 Q20 -32 34 -20 Q20 -14 6 0Z" fill="#FFFFFF" stroke="#CDD1E6" stroke-width="1"/></g>
  ${E(0,0,10,7,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  ${C(11,-5,5,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  <polygon points="15,-6 32,-3 15,-1" fill="#F0623A"/>${o.eyes==='happy'?`<path d="M10.6 -5.6 Q12 -7.6 13.6 -5.6" stroke="#2B2E45" stroke-width="1" fill="none"/>`:E(12,-6.5,1.2,Math.max(.2,1.2*(1-b)),'#2B2E45')}
  <line x1="-8" y1="3" x2="-20" y2="8" stroke="#F0623A" stroke-width="1.6"/><line x1="-6" y1="5" x2="-17" y2="12" stroke="#F0623A" stroke-width="1.6"/>
  ${page?'<g transform="translate(30 -4) rotate(-12)"><rect x="0" y="-6" width="16" height="20" fill="#FFFFFF" stroke="#B9BDD8" stroke-width="1"/><line x1="3" y1="0" x2="13" y2="0" stroke="#D5D8EA"/><line x1="3" y1="4" x2="13" y2="4" stroke="#D5D8EA"/></g>':''}`;
}
/* parpadeo para los guardianes */
const lid=(cx,cy,r,col,b)=>b>.05?`<g transform="translate(${cx} ${cy-r}) scale(1 ${b})"><ellipse cx="0" cy="${r}" rx="${r+.2}" ry="${r+.2}" fill="${col}"/></g>`:'';
const KIDS=[{skin:'#F6D2B3',hair:'#C9903F',dress:'#E4472A'},{skin:'#B9794F',hair:'#2B1D19',dress:'#2A5FD0'},{skin:'#7A4B32',hair:'#1C1412',dress:'#F2B01E'},{skin:'#EFC29A',hair:'#8A4B2A',dress:'#6B4BD1'}];
