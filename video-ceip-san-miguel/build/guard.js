const R=(x,y,w,h,f,rx=0,extra='')=>{if(typeof rx==='string'){extra=rx;rx=0;}return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${extra}/>`;};
const C=(x,y,r,f,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${extra}/>`;
const E=(x,y,rx,ry,f,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${extra}/>`;
const G=(x,y,s,inner,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;
const COL={mov:'#E4472A',sim:'#6B4BD1',exp:'#2E8F57',bib:'#2A5FD0',log:'#F2B01E',art:'#D42F86'};
const LIGHT={mov:'#FF7A5C',sim:'#9B7FF0',exp:'#4FC17F',bib:'#5B8CF0',log:'#FFCB47',art:'#F063AE'};

/* ---------- Personajes (pies en y=0) ---------- */
const frog=()=>`
  ${E(-13,-3,10,4,'#C93A20')}${E(13,-3,10,4,'#C93A20')}
  ${E(0,-14,19,14,COL.mov)}${E(0,-9,12,8,'#FF9C82')}
  ${C(-9,-27,6.5,'#FFFFFF')}${C(9,-27,6.5,'#FFFFFF')}${C(-8,-27,3,'#2B1A17')}${C(10,-27,3,'#2B1A17')}
  <path d="M-8 -17 Q0 -11 8 -17" stroke="#2B1A17" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  ${C(-14,-17,2.5,'#FF9C82')}${C(14,-17,2.5,'#FF9C82')}`;
const cat=()=>`
  <path d="M12 -8 Q30 -10 26 -30 Q24 -18 12 -16Z" fill="#553FB0"/>
  ${E(0,-15,14,16,COL.sim)}${E(0,-12,8,10,'#B7A4F5')}
  ${C(0,-38,12,COL.sim)}<polygon points="-11,-42 -12,-56 -3,-49" fill="${COL.sim}"/><polygon points="11,-42 12,-56 3,-49" fill="${COL.sim}"/>
  ${R(-9,-59,18,12,'#1F1B45',2)}${R(-12,-49,24,3.5,'#1F1B45',1.5)}${R(-9,-52,18,2.5,'#F2B01E')}
  ${C(-4.5,-38,2,'#FFF3A8')}${C(4.5,-38,2,'#FFF3A8')}${R(-5,-39,1.6,4,'#1F1B45')}${R(3.9,-39,1.6,4,'#1F1B45')}
  <polygon points="-1.5,-34 1.5,-34 0,-32" fill="#F063AE"/>
  <path d="M-14 -34 l-10 -2 M-14 -31 l-10 2 M14 -34 l10 -2 M14 -31 l10 2" stroke="#EDE7FF" stroke-width="1" stroke-linecap="round"/>`;
const snail=()=>`
  ${E(0,-5,26,6,'#9FDDB6')}
  <path d="M14 -6 Q22 -8 22 -20" stroke="#9FDDB6" stroke-width="7" fill="none" stroke-linecap="round"/>
  ${C(22,-24,7,'#9FDDB6')}<path d="M19 -30 l-3 -9 M26 -30 l3 -9" stroke="#9FDDB6" stroke-width="2" stroke-linecap="round"/>${C(16,-40,2,'#2B5A3C')}${C(29,-40,2,'#2B5A3C')}
  ${C(24,-25,1.6,'#1E2D25')}<path d="M22 -21 Q25 -19 28 -21" stroke="#1E2D25" stroke-width="1" fill="none"/>
  ${C(-4,-20,17,COL.exp)}${C(-4,-20,12,'#47B274')}
  <path d="M-4 -20 m0 0 a3 3 0 1 1 3 3 a6 6 0 1 1 -6 -6 a9 9 0 1 1 9 9" stroke="#1F6B40" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
const owl=()=>`
  <path d="M-15 -30 Q-24 -16 -12 -8 Z" fill="#1E4BAA"/><path d="M15 -30 Q24 -16 12 -8 Z" fill="#1E4BAA"/>
  ${E(0,-20,16,20,COL.bib)}${E(0,-14,10,13,'#A9C4FA')}
  <polygon points="-13,-38 -15,-50 -5,-41" fill="${COL.bib}"/><polygon points="13,-38 15,-50 5,-41" fill="${COL.bib}"/>
  ${C(-7,-30,7.5,'#FFFFFF')}${C(7,-30,7.5,'#FFFFFF')}${C(-7,-30,3,'#1B2350')}${C(7,-30,3,'#1B2350')}
  <circle cx="-7" cy="-30" r="8.5" fill="none" stroke="#1B2350" stroke-width="1.4"/><circle cx="7" cy="-30" r="8.5" fill="none" stroke="#1B2350" stroke-width="1.4"/><line x1="-1" y1="-30" x2="1" y2="-30" stroke="#1B2350" stroke-width="1.4"/>
  <polygon points="-2.5,-24 2.5,-24 0,-19" fill="#F2B01E"/>
  <line x1="-5" y1="0" x2="-5" y2="-4" stroke="#F2B01E" stroke-width="2.2"/><line x1="5" y1="0" x2="5" y2="-4" stroke="#F2B01E" stroke-width="2.2"/>`;
const hedge=()=>`
  <path d="M-24 -4 Q-30 -30 -8 -34 L2 -40 L8 -32 L20 -34 L22 -24 Q30 -18 26 -4Z" fill="${COL.log}"/>
  <path d="M-22 -8 l4 -18 M-14 -8 l3 -22 M-6 -8 l1 -24 M2 -8 l0 -22 M10 -8 l-1 -20" stroke="#B57F00" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M8 -4 Q8 -26 30 -20 L38 -12 L30 -4Z" fill="#F6DDB0"/>
  ${C(40,-13,2.6,'#2B2100')}${C(24,-18,1.7,'#2B2100')}
  <path d="M27 -11 Q30 -9 33 -11" stroke="#2B2100" stroke-width="1" fill="none"/>
  <rect x="-8" y="-4" width="5" height="4" rx="1" fill="#C98A0B"/><rect x="14" y="-4" width="5" height="4" rx="1" fill="#C98A0B"/>`;
const cham=()=>`
  <path d="M-16 -14 Q-38 -14 -36 -30 Q-34 -40 -26 -34 Q-30 -26 -22 -24" stroke="${COL.art}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M-16 -14 Q-38 -14 -36 -30 Q-34 -40 -26 -34" stroke="#FFCB47" stroke-width="2" fill="none" stroke-dasharray="3 4" stroke-linecap="round"/>
  ${E(0,-18,20,12,COL.art)}
  <path d="M-12 -24 Q-4 -30 6 -24" stroke="#4FC17F" stroke-width="3" fill="none" stroke-dasharray="4 3"/>
  <path d="M14 -20 Q28 -30 26 -14 Q24 -8 14 -10Z" fill="${COL.art}"/>
  ${C(20,-24,8,'#F9A9D0')}${C(21,-24,4,'#1F1B2E')}${C(22,-25,1.3,'#FFFFFF')}
  <path d="M26 -16 Q30 -15 33 -17" stroke="#7A1A4C" stroke-width="1.3" fill="none"/>
  <path d="M-8 -8 l-3 8 M-8 -8 l4 8 M8 -8 l-3 8 M8 -8 l4 8" stroke="#A81F68" stroke-width="3" stroke-linecap="round"/>`;

const bookRow=(x,y,n,seed)=>{let s='';const cs=['#E4472A','#2A5FD0','#F2B01E','#2E8F57','#6B4BD1','#D42F86'];let cx=x;for(let i=0;i<n;i++){const w=6+((i*7+seed)%5),h=18+((i*5+seed)%9);s+=R(cx,y-h,w,h,cs[(i+seed)%6],1);cx+=w+1;}return s;};
