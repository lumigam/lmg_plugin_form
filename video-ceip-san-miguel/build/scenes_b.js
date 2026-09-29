/* ===== ACTO 3: el libro se abre y Noa cae dentro ===== */
function S3(u){
  const P0=libParts(u);
  if(u<2.15){
    const shots=[{t0:0,t1:2.15,z0:3.6,z1:4.4,cx0:178,cx1:184,cy0:108,cy1:112}];
    const cam=shotAt(shots,u);
    const tr=u>.55&&u<.85?Math.sin(u*60)*.5:0;
    const hx=lerp(128,168,eio(seg(u,0,.55)))+lerp(0,8,eio(seg(u,.85,1.15))),hy=lerp(96,108,eio(seg(u,0,.55)))+lerp(0,3,eio(seg(u,.85,1.15)))+tr;
    const placed=u>1.15,burst=seg(u,1.15,2.0),open=eob(seg(u,1.25,1.8));
    let lets='';for(let i=0;i<16;i++){const a=(i/16)*6.283+.4,r=burst*(20+ (i%4)*10),x=182+Math.cos(a)*r*1.3,y=110-burst*10-Math.abs(Math.sin(a))*r*1.1-burst*8;lets+=`<text x="${x}" y="${y}" font-size="${5+(i%3)*2}" font-weight="800" text-anchor="middle" fill="${LC[i%6]}" opacity="${Math.sin(Math.PI*Math.min(1,burst*1.15))}" transform="rotate(${(i*47+u*100)%360} ${x} ${y})" font-family="'Bricolage Grotesque',sans-serif">${'ABCÑ123OSM+?'[i%12]}</text>`;}
    const book=`<g transform="translate(182 116)">${placed?P('M-19 0 L-15 -9 H15 L19 0Z',mixc('#9ba0b8','#ffd98a',burst)):''}
      ${open>.02?`<g transform="scale(${open} 1)">${P('M0 0 L-22 1 L-19 -12 H0Z','#fffdf4')}${P('M0 0 L22 1 L19 -12 H0Z','#f1eee2')}<path d="M0 0 V-12" stroke="#c9c5b0" stroke-width=".8"/>${P('M-16 -9 H-4 M-16 -6 H-4 M4 -9 H16 M4 -6 H14','none','stroke="#d8d4c2" stroke-width=".7"')}</g>`:''}</g>`;
    const pg=!placed?`<g transform="translate(${hx} ${hy}) rotate(-8) scale(.95)">${pageSVG(u*3,.3)}</g>`:'';
    const hand=`<g><line x1="60" y1="${hy-16}" x2="${hx-4}" y2="${hy+4}" stroke="#E2A57A" stroke-width="7" stroke-linecap="round"/><line x1="60" y1="${hy-16}" x2="${hx-4}" y2="${hy+4}" stroke="#1FA6A0" stroke-width="9" stroke-linecap="round" stroke-dasharray="0 40 40 200"/>${C(hx-3,hy+3,4.4,'#E2A57A')}</g>`;
    const mg=G2(206,121,.75,.75,0,miguiR({t:u,eyes:'open',beak:.5,wing:0}));
    const world=WORLD(cam,`${P0.defs}${L(cam,.55,P0.back,'filter="url(#b2)"')}${L(cam,1,P0.floor+`<g filter="url(#ds2)">${R(164,132,36,18,'#8a5a3a',2)}${P('M158 130 H206 L200 114 H164Z','#a56f47')}</g>`)}${L(cam,1,book+mg+(placed?'':hand+pg))}${L(cam,1,glowR(182,110,40*burst+10,'#fff3c4',.9*burst)+rays(182,112,90,-90,150,11,'#fff6d0',.42*burst,u)+lets)}${L(cam,1.2,motes(u,30,100,260,60,140,'#fff2c0',.5,8,3))}`);
    return world+op(seg(u,1.85,2.15),`<rect width="320" height="180" fill="#fffbe8"/>`);
  }
  const v=u-2.15;
  const shots=[{t0:0,t1:5,z0:1.0,z1:1.5,cx0:160,cx1:160,cy0:90,cy1:90,r0:-10,r1:14,ease:x=>x}];
  const cam=shotAt(shots,v);
  let rings='';for(let i=0;i<14;i++){const q=((i/14+v*.35)%1),r=Math.pow(q,1.9)*230+4;rings+=`<circle cx="160" cy="90" r="${r}" fill="none" stroke="${LC[i%6]}" stroke-width="${1+q*7}" opacity="${(.85-q*.6)}" stroke-dasharray="${8+q*30} ${4+q*14}" transform="rotate(${v*30*(i%2?1:-1)} 160 90)"/>`;}
  let lets='';for(let i=0;i<46;i++){const q=(((i*.137)+v*.42)%1),r=Math.pow(q,1.6)*210+6,a=i*.71+v*1.3+q*4;const x=160+Math.cos(a)*r*1.35,y=90+Math.sin(a)*r*.85;lets+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${(4+q*22).toFixed(1)}" font-weight="800" text-anchor="middle" fill="${LC[i%6]}" opacity="${(Math.min(1,q*4)*(1-q*.35)).toFixed(2)}" transform="rotate(${((i*53+v*140)%360).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="'Bricolage Grotesque',sans-serif">${'ABCDEFÑ0123456789+×=?!OSM'[i%25]}</text>`;}
  let rib='';for(let i=0;i<6;i++){const a=i*60+v*40;rib+=`<path d="M160 90 Q${160+Math.cos((a+20)*.01745)*80} ${90+Math.sin((a+20)*.01745)*50} ${160+Math.cos(a*.01745)*150} ${90+Math.sin(a*.01745)*95}" stroke="${LC[i]}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`;}
  const fall=G2(160+Math.sin(v*2)*8,92+Math.sin(v*3)*4,1.15,1.15,Math.sin(v*1.7)*18,`<g transform="translate(0 24)">${kidR({t:u,la:150,ra:150,lgL:Math.sin(v*6)*14,lgR:-Math.sin(v*6)*14,eyes:'happy',mouth:'open',brow:.6,btn:[0,0,0,0,0,0]})}</g>`);
  const mig=G2(214+Math.sin(v*2.3)*9,66+Math.sin(v*3.4)*5,.8,.8,-16,flyR(false,Math.sin(v*17)*.75+.25,{eyes:'happy'}));
  const world=WORLD(cam,`${lgrad('s3g',[[0,'#171a4d'],[1,'#4a3fc0']])}<rect x="-100" y="-100" width="520" height="380" fill="url(#s3g)"/>${glowR(160,90,110,'#ffd98a',.55)}${rib}${rings}${lets}${fall}${mig}${motes(v,40,0,320,0,180,'#fff',.7,6,-10)}`);
  return world+op(1-seg(v,0,.35),`<rect width="320" height="180" fill="#fffbe8"/>`)+op(seg(v,2.55,2.85),`<rect width="320" height="180" fill="#fff3d2"/>`);
}

/* ===== utilidades de las escenas de rincones ===== */
function btnLevels(k,giftT){const a=[0,0,0,0,0,0];for(let i=0;i<k;i++)a[i]=1;a[k]=eo(giftT);return a;}
function orbSVG(x0,y0,x1,y1,p,color,arc=30){
  if(p<=0||p>=1)return '';
  const e=eio(p),x=lerp(x0,x1,e),y=lerp(y0,y1,e)-arc*Math.sin(Math.PI*e);
  let tail='';for(let i=1;i<8;i++){const q=Math.max(0,e-i*.045),tx=lerp(x0,x1,q),ty=lerp(y0,y1,q)-arc*Math.sin(Math.PI*q);tail+=C(tx,ty,3.4*(1-i/8),color,`opacity="${.5*(1-i/8)}"`);}
  return `${tail}${glowR(x,y,14,color,.9)}${C(x,y,3.6,'#fff')}${star(x,y-6,3,color)}${star(x+7,y+2,2,'#fff')}`;
}
function gift(u,t0,dur,src,dst,color){const p=seg(u,t0,t0+dur);return {p,svg:orbSVG(src[0],src[1],dst[0],dst[1],p,color),done:eo(seg(u,t0+dur,t0+dur+.7))};}
function popStagger(u,i,base=.3,gap=.16){return eob(seg(u,base+i*gap,base+i*gap+.55));}
function hopper(u,s0,X,per=1.0,air=.55,h=30){
  const w=u-s0,sit=per-air;
  if(w<0)return {x:X[0],y:0,k:0,air:0,q:0,sq:0,cr:0};
  let k=Math.floor(w/per);
  if(k>=X.length-1){const e=w-(X.length-1)*per;return {x:X[X.length-1],y:0,k:X.length-1,air:0,q:0,sq:Math.max(0,1-e/.25),cr:0};}
  const ph=w-k*per;
  if(ph<sit)return {x:X[k],y:0,k,air:0,q:0,sq:Math.max(0,1-ph/.22),cr:seg(ph,sit-.22,sit)};
  const q=(ph-sit)/air;return {x:lerp(X[k],X[k+1],q),y:h*Math.sin(Math.PI*q),k,air:1,q,sq:0,cr:0};
}
const shadowE=(x,y,r,o=.22)=>E(x,y,r,r*.2,'#1b1a40',`opacity="${o}"`);
const frogR=(t,o={})=>frog()+lid(-9,-27,6.4,COL.mov,o.blink??blinkAt(t,1))+lid(9,-27,6.4,COL.mov,o.blink??blinkAt(t,1));

/* ===== ACTO 4: Movimiento y psicomotricidad ===== */
function S4(u){
  const X=[70,130,190,250],XF=[70,130,190,250,312];
  const nwx=lerp(-24,70,eio(seg(u,.3,1.7))),walking=u>.3&&u<1.7,ph=u*9;
  const fr=hopper(u,1.25,XF,.95,.55,28),nz=hopper(u,2.05,X,.95,.55,28);
  const J=seg(u,5.05,5.95),jh=34*Math.sin(Math.PI*J);
  const nX=u<1.7?nwx:(u<5.05?nz.x:lerp(250,281,eio(J))),fX=u<5.05?fr.x:lerp(312,290,eio(J));
  const nY=u<5.05?(u<1.7?(walking?Math.abs(Math.sin(ph))*1.4:0):nz.y):jh,fY=u<5.05?fr.y:jh;
  const airN=(u>=1.7&&u<5.05&&nz.air)||(J>0&&J<1),happy=u>5.0;
  const G3=gift(u,5.95,.9,[fX-2,116],[nX+2,118],LIGHT.mov);
  const btn=btnLevels(0,seg(u,6.85,7.4));
  const swing=walking?Math.sin(ph)*24:0;
  const noaPose=kidR({t:u,la:airN?165:30+swing,ra:airN?165:30-swing,lgL:walking?swing*1.1:(airN?-14:0),lgR:walking?-swing*1.1:(airN?14:0),eyes:happy||airN?'happy':'open',mouth:happy||airN?'open':'smile',btn});
  const sqN=1-nz.sq*.14,sqF=1-fr.sq*.16-fr.cr*.1;
  const noaG=G2(nX,147-nY,1.15*(2-sqN),1.15*sqN,0,noaPose);
  const frogG=G2(fX,148-fY,1.1*(2-sqF),1.1*sqF,u<5.05?(fr.air?-28*(1-2*fr.q):0):-14*(1-2*J),frogR(u));
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.16,cx0:150,cx1:160,cy0:90,cy1:98},
    {t0:2.5,t1:5.0,z0:1.85,z1:1.75,cx0:112,cx1:246,cy0:112,cy1:110,punch:1,whip:1,ease:x=>x},
    {t0:5.0,t1:6.3,z0:1.45,z1:1.55,cx0:262,cx1:268,cy0:104,cy1:100,punch:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nX-2,cx1:nX,cy0:112,cy1:114,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u);
  const pu=i=>popStagger(u,i);
  const defs=`${lgrad('s4wall',[[0,'#ffe6d4'],[1,'#ffcbb0']])}${lgrad('s4floor',[[0,'#ecb07a'],[1,'#c48450']])}<pattern id="s4dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.5" fill="#fff" opacity=".55"/><circle cx="9" cy="9" r="1.5" fill="#fff" opacity=".55"/></pattern>`;
  let wins='';[100,160,220].forEach(x=>{wins+=`<g filter="url(#ds)"><path d="M${x-21} 96 V40 A21 21 0 0 1 ${x+21} 40 V96Z" fill="#fffaf0"/><path d="M${x-17} 92 V41 A17 17 0 0 1 ${x+17} 41 V92Z" fill="#a9dcff"/>${paperCloud(x+Math.sin(u*.5)*2,52,.32,'#fff','#e0f2ff')}<path d="M${x} 24 V92 M${x-17} 60 H${x+17}" stroke="#fffaf0" stroke-width="2"/></g>`;});
  const wall=`${R(-300,0,1000,148,'url(#s4wall)')}${R(-300,104,1000,44,'#ffa98f')}${R(-300,104,1000,44,'url(#s4dots)')}${R(-300,102,1000,3,'#fffaf0')}`;
  const beams=`<g style="mix-blend-mode:screen"><polygon points="94,50 126,50 70,150 0,150" fill="url(#beam)" opacity="${.42+.1*Math.sin(u)}"/><polygon points="214,50 246,50 200,150 130,150" fill="url(#beam)" opacity=".32"/></g>`;
  let bars='';for(let i=0;i<12;i++)bars+=R(9,36+i*8.4,46,2.4,'#a7703f',1);
  const espald=`<g filter="url(#ds)">${R(6,28,4,120,'#b67a45',1.5)}${R(54,28,4,120,'#b67a45',1.5)}${bars}</g>`;
  const rings=[0,1].map(i=>`<g transform="rotate(${Math.sin(u*1.6+i)*3} ${114+i*22} 8)"><line x1="${114+i*22}" y1="0" x2="${114+i*22}" y2="62" stroke="#8a5a3a" stroke-width="1"/><circle cx="${114+i*22}" cy="68" r="7.2" fill="none" stroke="${i?'#2a5fd0':'#f2b01e'}" stroke-width="2.8"/></g>`).join('');
  const rainbow=`<g filter="url(#ds)">${KEYS.map((k,i)=>{const r=46-i*5.2;return `<path d="M${286-r} 148 A${r} ${r} 0 0 1 ${286+r} 148" fill="none" stroke="${LIGHT[k]}" stroke-width="5.4"/>`;}).join('')}</g>`;
  let strm='';for(let i=0;i<11;i++){const x=10+i*30,sw=Math.sin(u*1.8+i)*3;strm+=`<path d="M${x} 0 q${sw} 10 ${sw*.5} 18 t${-sw} 16" stroke="${LC[i%6]}" stroke-width="3" fill="none" stroke-linecap="round"/>`;}
  const foam=`<g filter="url(#ds2)">${R(276,118,46,30,'#ffbf2e',7)}${R(276,118,46,5,'#fff','opacity=".3"')}${R(287,92,30,28,'#3f79f0',7)}${R(292,72,21,22,'#f0489a',7)}${R(292,72,21,4,'#fff','opacity=".3"')}</g>`;
  const mat=`<g filter="url(#ds)">${R(24,144,84,13,'#3f79f0',5)}${R(24,144,84,4,'#fff','opacity=".3"',5)}${[0,1,2].map(i=>R(48+i*24,145,1,11,'#fff','opacity=".5"')).join('')}</g>`;
  const beamW=`<g filter="url(#ds)">${R(120,136,90,5,'#c98f5a',2)}${R(126,141,4,8,'#8a5a3a')}${R(200,141,4,8,'#8a5a3a')}</g>`;
  const floor=`${R(-300,146,1000,40,'url(#s4floor)')}${Array.from({length:8},(_,i)=>R(-300,148+i*5+i*i*.3,1000,.8,'#8a5a30','opacity=".3"')).join('')}`;
  let hoops='',fx='';
  X.forEach((x,i)=>{
    const land=i===0?1.7:2.05+.95*i,lit=u>=land,since=u-land,col=[COL.mov,COL.log,COL.bib,COL.exp][i];
    hoops+=`<ellipse cx="${x}" cy="149" rx="22" ry="6.2" fill="${lit?LC[i]:'none'}" fill-opacity="${lit?.5+.2*Math.sin(u*5+i):0}" stroke="${col}" stroke-width="3.6"/>`;
    if(lit&&since<.8){const r=eo(since/.8);for(let j=0;j<8;j++){const a=j*45+i*20;fx+=star(x+Math.cos(a*.01745)*(6+26*r),144+Math.sin(a*.01745)*(3+16*r)-10*r,3.4*(1-r),LC[(i+j)%6]);}}
  });
  const ball=`<g filter="url(#b2)"><circle cx="20" cy="172" r="20" fill="#ff6b4a"/><path d="M0 172 Q20 160 40 172" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/><circle cx="14" cy="164" r="5" fill="#fff" opacity=".35"/></g>`;
  const world=WORLD(cam,`${defs}
    ${L(cam,.5,wall+`${popUp(pu(0),148,wins)}${beams}${popUp(pu(1),148,espald)}${rings}${popUp(pu(2),148,rainbow)}${strm}`)}
    ${L(cam,.85,popUp(pu(3),150,foam)+popUp(pu(4),150,beamW))}
    ${L(cam,1,floor+popUp(pu(5),150,mat)+hoops+fx+shadowE(nX,149,15)+shadowE(fX,150,16)+frogG+noaG+G3.svg)}
    ${L(cam,1.35,ball)}${L(cam,1.3,motes(u,34,0,320,40,170,'#fff0c8',.7,9,3))}`);
  return world+glowR(160,90,150,'#ffd9a0',.15);
}

