/* ===== Piezas de arte reutilizables ===== */
const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],cl(t))).toString(16).padStart(2,'0')).join('');};
const lgrad=(id,stops,x2=0,y2=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</linearGradient>`;
const rgrad=(id,stops)=>`<radialGradient id="${id}">${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</radialGradient>`;
function ridge(seed,x0,x1,yb,amp,step,fill,extra=''){
  const r=rnd(seed);let d=`M${x0} 320 L${x0} ${yb}`,x=x0;
  while(x<x1){const y=yb-r()*amp*(.35+.65*Math.abs(Math.sin(x*.011+seed)));d+=` L${x.toFixed(1)} ${y.toFixed(1)}`;x+=step*(.55+r()*.9);}
  return P(d+` L${x1} ${yb} L${x1} 320Z`,fill,extra);
}
function hills(seed,x0,x1,yb,amp,fill,extra=''){
  let d=`M${x0} 320 L${x0} ${yb}`;for(let x=x0;x<=x1;x+=12){d+=` L${x} ${(yb-amp*(Math.sin(x*.02+seed)*.5+.5)-amp*.5*Math.sin(x*.047+seed*2)).toFixed(1)}`;}
  return P(d+` L${x1} 320Z`,fill,extra);
}
function paperCloud(x,y,s,c1='#fff',c2='#ffd7e4'){
  return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#ds)">${E(0,4,26,7,c2)}${E(-9,0,13,9,c1)}${E(6,-3,15,11,c1)}${E(18,1,11,7,c1)}${E(0,2,24,7,c1,'opacity=".9"')}</g>`;
}
function houses(x0,x1,yb,seed,pal,roof,lit,scale=1){
  const r=rnd(seed);let x=x0,s='';
  while(x<x1){
    const w=(12+r()*14)*scale,h=(16+r()*26)*scale,c=pal[Math.floor(r()*pal.length)],ry=yb-h;
    s+=R(x,ry,w,h,c)+R(x+w-2.2*scale,ry,2.2*scale,h,'#fff','opacity=".22"')+R(x,ry,2*scale,h,'#3a2a6a','opacity=".14"');
    s+=P(`M${x-1.2} ${ry} L${x+w/2} ${ry-(7+r()*5)*scale} L${x+w+1.2} ${ry}Z`,roof[Math.floor(r()*roof.length)]);
    const n=1+Math.floor(r()*2);
    for(let k=0;k<n;k++){const wx=x+(k+.5)*w/n-2*scale;s+=R(wx,ry+h*.3,4*scale,5.5*scale,lit,`opacity="${.55+r()*.45}"`,1)+R(wx-.4,ry+h*.3,4.8*scale,.8*scale,'#fff','opacity=".5"');}
    if(r()>.65)s+=R(x+w*.65,ry-11*scale,3*scale,8*scale,'#b5695a');
    x+=w+(.5+r()*2.5)*scale;
  }
  return s;
}
const pageSVG=(fl=0,glowOn=0)=>`<g>${glowOn?glowR(8,9,26,'#fff8d8',glowOn):''}<g transform="scale(${(.35+.65*Math.abs(Math.cos(fl))).toFixed(3)} 1)"><path d="M-7 -9 Q0 -11 7 -9 L6.5 9 Q0 11 -6.5 9Z" fill="#fffef8" stroke="#c9cde6" stroke-width=".9"/><path d="M-4 -4 H4 M-4 0 H4 M-4 4 H2" stroke="#e0e3f2" stroke-width=".9" stroke-linecap="round"/></g></g>`;
function colibri(){return '';}
/* colegio */
function school(x,y,o={}){
  const u=o.u||0,lit=o.lit??1,pop=o.pop??1;
  const wins=[[-46,-2],[-30,-2],[-14,-2],[14,-2],[30,-2],[46,-2]];
  let w='';wins.forEach((p,i)=>{const k=KEYS[i],c=LIGHT[k];const l=o.winLit?o.winLit[i]:1;
    w+=`<g transform="translate(${p[0]} ${p[1]-24})"><path d="M-6 22 V6 A6 6 0 0 1 6 6 V22Z" fill="${mixc('#5d5a8a',c,l)}"/><path d="M0 0 V22 M-6 13 H6" stroke="#fffaf0" stroke-width=".9"/>${l>.6?glowR(0,11,15,c,.35*l):''}${o.peek&&o.peek[i]?o.peek[i]:''}<path d="M-6 22 V6 A6 6 0 0 1 6 6 V22Z" fill="none" stroke="#fffaf0" stroke-width="1.6"/><path d="M-7.5 22.6 H7.5" stroke="#fffaf0" stroke-width="2"/></g>`;});
  let flags='';for(let i=0;i<14;i++){const fx=-62+i*9.5,sag=Math.sin(i/13*Math.PI)*5,sw=Math.sin(u*2.2+i*.7)*.9;flags+=P(`M${fx} ${-66+sag} l4.4 0 l-2.2 6.5Z`,LC[i%6],`transform="translate(${sw} 0)"`);}
  return `<g transform="translate(${x} ${y}) scale(${o.s||1})">
  ${E(0,1,74,4.5,'#1b1a40','opacity=".22"')}
  <g filter="url(#ds2)">
  ${R(-62,-56,124,56,'#fff3dc',2)}${R(-62,-56,124,4,'#f0d9b0')}${R(-62,-4,124,4,'#e8cf9f')}
  ${P('M-66 -56 L0 -84 L66 -56Z','#e2734f')}${P('M-66 -56 L0 -84 L0 -80 L-60 -56Z','#f39a72','opacity=".55"')}
  ${R(-84,-32,26,32,'#ffe9c4',2)}${R(58,-32,26,32,'#ffe9c4',2)}${P('M-88 -32 L-71 -44 L-54 -32Z','#d9603f')}${P('M54 -32 L71 -44 L88 -32Z','#d9603f')}
  ${R(-78,-24,8,10,'#ffd28a',1.5)}${R(70,-24,8,10,'#ffd28a',1.5)}
  </g>${w}
  <g transform="translate(0 0)">${o.doorOpen?`<path d="M-9 0 V-22 A9 9 0 0 1 9 -22 V0Z" fill="#ffe3a8"/>${glowR(0,-12,26,'#fff1c0',.6*o.doorOpen)}<path d="M-9 0 L-15 -2 V-25 L-9 -22Z" fill="#3b56c9"/>`:`<path d="M-9 0 V-22 A9 9 0 0 1 9 -22 V0Z" fill="#3b56c9"/>`}<path d="M-9 0 V-22 A9 9 0 0 1 9 -22 V0Z" fill="none" stroke="#fffaf0" stroke-width="1.8"/><circle cx="5" cy="-10" r="1" fill="#ffd36b"/>
  ${[0,1,2,3,4,5].map(i=>R(-14+i*4.8,-34,4.8,5,LC[i],0)).join('')}${P('M-16 -34 H16 L13 -38 H-13Z','#fffaf0')}</g>
  <g>${flags}<path d="M-62 -66 Q0 -58 62 -66" stroke="#fffaf0" stroke-width=".7" fill="none"/></g>
  ${o.sign===false?'':`<g><rect x="-26" y="-53" width="52" height="9" rx="2" fill="#2f2a6b"/><text x="0" y="-46.4" text-anchor="middle" font-size="5.2" font-weight="800" fill="#fffaf0" font-family="'Bricolage Grotesque',Figtree,sans-serif" letter-spacing=".5">CEIP SAN MIGUEL</text></g>`}
  ${o.trees===false?'':`<g filter="url(#ds)">${R(-100,-14,4,14,'#7a5238')}${C(-98,-22,13,'#4a9a5c')}${C(-90,-17,9,'#5fb56f')}${R(96,-12,4,12,'#7a5238')}${C(98,-19,12,'#4a9a5c')}${C(90,-15,8,'#5fb56f')}</g>`}
  </g>`;
}
