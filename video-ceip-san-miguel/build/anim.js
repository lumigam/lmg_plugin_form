/* ===== Animación: CEIP San Miguel · El Libro de los Seis Rincones ===== */
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const eo=t=>1-Math.pow(1-cl(t),3);
const eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
const eob=t=>{t=cl(t);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const seg=(u,a,b)=>cl((u-a)/(b-a));
const G2=(x,y,sx,sy,rot,inner)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sy})">${inner}</g>`;
const cam=(inner,z,cx,cy)=>`<g transform="translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})">${inner}</g>`;
const op=(o,inner)=>`<g opacity="${cl(o)}">${inner}</g>`;
const star=(x,y,r,f)=>`<path d="M${x} ${y-r} L${x+r*.28} ${y-r*.28} L${x+r} ${y} L${x+r*.28} ${y+r*.28} L${x} ${y+r} L${x-r*.28} ${y+r*.28} L${x-r} ${y} L${x-r*.28} ${y-r*.28}Z" fill="${f}"/>`;
const LC=Object.values(LIGHT);

const migFly2=(page,f)=>{
  const a=f*26;
  return `
  <g transform="rotate(${a} -2 -6)"><path d="M-2 -6 Q-18 -34 -40 -30 Q-22 -20 -6 -2Z" fill="#FFFFFF" stroke="#CDD1E6" stroke-width="1"/><path d="M-30 -31 Q-38 -30 -40 -30 Q-32 -25 -24 -22Z" fill="#2B2E45"/></g>
  <g transform="rotate(${-a} 2 -6)"><path d="M2 -6 Q20 -32 34 -20 Q20 -14 6 0Z" fill="#FFFFFF" stroke="#CDD1E6" stroke-width="1"/></g>
  ${E(0,0,10,7,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  ${C(11,-5,5,'#FFFFFF','stroke="#CDD1E6" stroke-width="1"')}
  <polygon points="15,-6 32,-3 15,-1" fill="#F0623A"/>${C(12,-6.5,1.2,'#2B2E45')}
  <line x1="-8" y1="3" x2="-20" y2="8" stroke="#F0623A" stroke-width="1.6"/><line x1="-6" y1="5" x2="-17" y2="12" stroke="#F0623A" stroke-width="1.6"/>
  ${page?'<g transform="translate(30 -4) rotate(-12)"><rect x="0" y="-6" width="16" height="20" fill="#FFFFFF" stroke="#B9BDD8" stroke-width="1"/><line x1="3" y1="0" x2="13" y2="0" stroke="#D5D8EA"/><line x1="3" y1="4" x2="13" y2="4" stroke="#D5D8EA"/></g>':''}`;
};
const nn=(arms,crown,o,handColor)=>{
  let s=noa(arms,crown,o);
  if(handColor){const h={down:[[-13,-16],[13,-16]],up:[[-15,-40],[15,-40]],side:[[-16,-24],[14,-30]]}[arms];s+=C(h[0][0],h[0][1],3.4,handColor)+C(h[1][0],h[1][1],3.4,handColor);}
  return s;
};

/* saltador: sigue una fila de posiciones X */
function hopper(u,s0,X,per=1.2,air=.7,h=38){
  const w=u-s0,sit=per-air;
  if(w<0)return {x:X[0],y:0,k:0,air:0,q:0,sq:0};
  let k=Math.floor(w/per);
  if(k>=X.length-1)return {x:X[X.length-1],y:0,k:X.length-1,air:0,q:0,sq:Math.max(0,1-(w-(X.length-1)*per)/.25)};
  const ph=w-k*per;
  if(ph<sit)return {x:X[k],y:0,k,air:0,q:0,sq:Math.max(0,1-ph/.22)*.9+seg(ph,sit-.2,sit)*.6-Math.max(0,1-ph/.22)*.0};
  const q=(ph-sit)/air;
  return {x:lerp(X[k],X[k+1],q),y:h*Math.sin(Math.PI*q),k,air:1,q,sq:0};
}

/* ===== Escenas (u = segundos desde el inicio de la escena) ===== */
function S1(u){
  let roofs='';for(let i=0;i<9;i++){const x=i*40-10;roofs+=`<path d="M${x} 142 L${x+20} 124 L${x+40} 142Z" fill="${i%2?'#6D5FA8':'#5A4E96'}"/>`;}
  const sunY=lerp(142,104,eo(u/6));
  let clouds='';[[30,30,1],[170,22,.8],[260,44,1.2]].forEach(([x,y,s],i)=>{const cx=((x+u*(5+i*3))%380)-30;clouds+=`<g opacity=".85">${E(cx,y,18*s,5*s,'#FFFFFF')}${E(cx+10*s,y-4*s,12*s,5*s,'#FFFFFF')}</g>`;});
  const p=eio((u-1)/4.4),x=lerp(58,214,p),y=lerp(42,74,p)-40*Math.sin(Math.PI*p)+(p>=1?Math.sin(u*3)*2:0);
  const flap=Math.sin(u*13)*.7+.25;
  const mig=u<1?G(58,44,.5+.0,migui()):G(x,y,.9,migFly2(true,flap),-8);
  let birds='';[[255,40],[285,58]].forEach(([bx,by],i)=>{const f=Math.sin(u*9+i*2)*3;birds+=`<path d="M${bx-((u*8)%40)} ${by} l6 ${-3+f} l6 ${3-f}" stroke="#4A4E86" stroke-width="1.6" fill="none" stroke-linecap="round"/>`});
  const inner=`<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB4F0"/><stop offset=".6" stop-color="#FFC7A1"/><stop offset="1" stop-color="#FFE3C4"/></linearGradient></defs>
  ${R(0,0,320,180,'url(#g1)')}${C(235,sunY,28,'#FFF1C9')}${C(235,sunY,40,'#FFF1C9','opacity=".25"')}${clouds}
  <path d="M0 122 L40 92 L70 108 L110 84 L150 112 L190 96 L230 116 L270 94 L320 122 V180 H0Z" fill="#A6A9DC"/>
  ${R(46,66,24,80,'#6B6FA6')}<path d="M44 66 L58 42 L72 66Z" fill="#55598F"/>${R(53,78,10,16,'#FFD99A',5)}${E(58,44,12,3,'#8A6A4A')}
  ${roofs}${R(0,140,320,40,'#3E3F75')}
  ${R(20,150,14,8,'#FFD99A',1)}${R(70,152,14,8,'#FFD99A',1)}${R(190,150,14,8,'#FFD99A',1)}${R(270,152,14,8,'#FFD99A',1)}
  ${birds}${mig}`;
  return cam(inner,lerp(1,1.09,eio(u/6.5)),190,80);
}
function S2(u){
  const walk=u<3,nx=lerp(-25,80,eio(u/3)),bob=walk?Math.abs(Math.sin(u*9))*2:0,lean=u>3.2?3.5*eo(seg(u,3.2,4)):0;
  const fly=seg(u,1.8,3.4),mx=lerp(340,214,eio(fly)),my=lerp(20,116,eio(fly))-(fly<1?14*Math.sin(Math.PI*fly):0);
  const landed=u>=3.4;
  const pulse=.14+.08*Math.sin(u*3),glow=landed?eo(seg(u,3.6,4.8)):0;
  const inner=`${R(0,0,320,180,'#232752')}
  ${R(214,20,70,84,'#1A1D40',4)}${R(219,25,60,74,'#3B4A8F',2)}${C(255,52,11,'#FFF3C2')}${C(260,49,9,'#3B4A8F')}${R(247,25,4,74,'#1A1D40')}${R(219,60,60,4,'#1A1D40')}
  <polygon points="219,99 279,99 230,160 130,160" fill="#FFF3C2" opacity="${pulse}"/>
  ${[[70,30],[140,16],[190,40],[30,20]].map((p,i)=>star(p[0],p[1],1.6+Math.sin(u*3+i)*.6,'#FFF3C2')).join('')}
  ${R(14,40,84,4,'#5A4A6E')}${R(14,84,84,4,'#5A4A6E')}${R(14,128,84,4,'#5A4A6E')}
  ${bookRow(16,40,7,1)}${bookRow(16,84,7,3)}${bookRow(16,128,7,5)}
  ${R(0,146,320,34,'#191C3D')}
  ${R(110,120,110,8,'#7A5A46',2)}${R(118,128,6,22,'#5D4234')}${R(206,128,6,22,'#5D4234')}
  ${E(166,120,46*glow,10*glow,'#FFE9A0',`opacity="${.35*glow}"`)}
  ${R(140,106,52,14,'#8E93AD',2)}${R(146,109,40,6,'#B9BDD0',1)}${E(166,122,40,4,'#FFF3C2','opacity=".14"')}
  ${landed?G(214,120,.9,migui()):G(mx,my,.9,migFly2(false,Math.sin(u*14)*.7+.2),-10)}
  ${landed?`<g transform="translate(198 107) rotate(${-6+Math.sin(u*3)*2})"><rect x="0" y="0" width="10" height="13" fill="#FFFFFF"/><line x1="2" y1="4" x2="8" y2="4" stroke="#D5D8EA"/><line x1="2" y1="8" x2="8" y2="8" stroke="#D5D8EA"/></g>`:''}
  ${G2(nx,152-bob,1.05,1.05,lean,noa(walk?'down':'side'))}`;
  return cam(inner,lerp(1,1.4,eio(u/6.5)),170,116);
}
function S3(u){
  if(u<3.4){
    const px=lerp(262,166,eio(seg(u,.5,1.7))),py=lerp(80,100,eio(seg(u,.5,1.7))),atBook=u>1.7;
    const burst=seg(u,1.7,2.6),open=eo(seg(u,2,2.9)),flash=seg(u,2.7,3.3);
    let rays='';for(let i=0;i<10;i++){const a=i*36+u*40;rays+=`<polygon points="160,100 ${160+140*Math.cos((a-6)*Math.PI/180)},${100+140*Math.sin((a-6)*Math.PI/180)} ${160+140*Math.cos((a+6)*Math.PI/180)},${100+140*Math.sin((a+6)*Math.PI/180)}" fill="#FFF3C2" opacity="${.35*burst*(1-flash*.5)}"/>`;}
    const cover=open<.05?`${R(90,74,140,58,'#8E93AD',5)}${R(104,86,112,18,'#B9BDD0',3)}`:'';
    const pages=open>.05?`<g transform="translate(160 132) scale(${open} 1) translate(-160 -132)"><polygon points="160,136 66,128 72,76 160,88" fill="#F5F6FF"/><polygon points="160,136 254,128 248,76 160,88" fill="#E6E8FA"/><path d="M160 88 V136" stroke="#B9BDD8" stroke-width="2"/></g>`:'';
    return `<defs><linearGradient id="g3a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232752"/><stop offset="1" stop-color="#3B3F80"/></linearGradient></defs>
    ${R(0,0,320,180,'url(#g3a)')}${R(0,128,320,52,'#7A5A46')}${R(0,128,320,4,'#5D4234')}
    ${rays}${E(160,132,90,10,'#000000','opacity=".18"')}${cover}${pages}
    ${G(276,152,1.5,migui())}
    ${atBook?'':`<g transform="translate(${px} ${py}) rotate(-10)"><rect x="0" y="-10" width="16" height="20" fill="#FFFFFF" stroke="#B9BDD8"/><line x1="3" y1="-4" x2="13" y2="-4" stroke="#D5D8EA"/></g>`}
    ${G2(48+lerp(0,8,eo(seg(u,1,2))),172,1.7,1.7,lerp(0,6,eo(seg(u,1,2))),noa('side'))}
    ${op(flash,R(0,0,320,180,'#FFFFFF'))}`;
  }
  const v=u-3.4;
  let letters='';const gl=['A','b','7','+','★','o','3','Ñ','2','?','a','5','B','8'];
  gl.forEach((ch,i)=>{const bx=(i*47+20)%300+10,sp=55+(i%4)*22,y=((190+i*31-v*sp)%220+220)%220-20;letters+=`<text x="${bx}" y="${y}" font-size="${16+(i%3)*7}" font-weight="800" fill="${LC[i%6]}" opacity=".9" transform="rotate(${Math.sin(v*2+i)*18} ${bx} ${y})">${ch}</text>`;});
  let sp='';for(let i=0;i<16;i++){const x=(i*61)%320,y=((i*37+200-v*90)%200+200)%200;sp+=C(x,y,.9,'#FFFFFF','opacity=".6"');}
  return `<defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171A45"/><stop offset="1" stop-color="#3B3FBF"/></linearGradient></defs>
  ${R(0,0,320,180,'url(#g3)')}<polygon points="120,180 200,180 260,0 60,0" fill="#FFF3C2" opacity=".14"/>${sp}${letters}
  ${G(160+Math.sin(v*2)*10,88+Math.sin(v*3)*5,.9,`<g transform="translate(0 24)">${noa('up')}</g>`,Math.sin(v*1.6)*22)}
  ${G(222+Math.sin(v*2.3)*8,64+Math.sin(v*3.6)*6,.7,migFly2(false,Math.sin(v*14)*.7+.2),-18)}
  ${op(1-seg(u,3.4,3.9),R(0,0,320,180,'#FFFFFF'))}`;
}
function S4(u){
  const X=[40,100,160,220,280],XF=[40,100,160,220,280,360,400];
  const XN=[-30,...X],fr=hopper(u,.3,XF,1.1,.65),nz=hopper(u,.8,XN,1.1,.65);
  let hoops='',fx='';
  X.forEach((x,i)=>{
    const lit=nz.k>=i+1,since=u-(.8+(i+1)*1.1);
    hoops+=`<ellipse cx="${x}" cy="134" rx="24" ry="7" fill="${lit?LC[i]:'none'}" fill-opacity="${lit?.45+.2*Math.sin(u*5+i):0}" stroke="${COL.mov}" stroke-width="4" style="stroke:${[COL.mov,COL.log,COL.bib,COL.exp,COL.sim][i]}"/>`;
    if(lit&&since<.7){const r=eo(since/.7);for(let j=0;j<7;j++){const a=j*51+i*20;fx+=star(x+Math.cos(a*Math.PI/180)*(8+22*r),130+Math.sin(a*Math.PI/180)*(4+16*r)-8*r,3*(1-r),LC[(i+j)%6]);}}
  });
  const fsq=1-fr.sq*.18-(fr.air?-.1:0),nsq=1-nz.sq*.15;
  const frogG=G2(fr.x,132-fr.y,1.15*(2-fsq),1.15*fsq,fr.air?-26*(1-2*fr.q):0,frog());
  const noaG=G2(nz.x,134-nz.y,.95*(2-nsq),.95*nsq,fr.air?0:0,noa(nz.air?'up':(nz.sq>0?'side':'down')));
  return `${R(0,0,320,180,'#FFE6DC')}${C(280,32,18,'#FFD08A')}${C(280,32,26,'#FFD08A','opacity=".3"')}${R(0,114,320,66,'#F7B8A0')}
  <path d="M0 40 q10 -10 20 0 t20 0 t20 0 t20 0" stroke="#F7B8A0" stroke-width="3" fill="none" transform="translate(${(u*6)%20} 0)"/>
  ${hoops}${fx}${frogG}${noaG}`;
}
function S5(u){
  const e=eo(u/1.6),w=lerp(165,80,e);
  let awn='';for(let i=0;i<9;i++)awn+=R(190+i*10,80,10,18,i%2?'#FFFFFF':'#E4472A');
  const cx=lerp(-30,100,eio(seg(u,1.2,3))),cwalk=u<3&&u>1.2,cbob=cwalk?Math.abs(Math.sin(u*8))*2:0;
  const tip=u>3.1?-7*Math.sin(Math.min(1,(u-3.1)/.8)*Math.PI):0;
  const fr=[[COL.mov,0],[COL.log,1],['#4FC17F',2],[COL.art,3]];
  let fruits='';
  fr.forEach(([c,i])=>{
    const t0=3.6+i*.85,q=seg(u,t0,t0+.8);
    const sx=210+16*i,sy=94,ex=138+(i%2)*6,ey=131-Math.floor(i/2)*5;
    const x=lerp(sx,ex,eio(q)),y=lerp(sy,ey,q)-32*Math.sin(Math.PI*q);
    fruits+=C(q>=1?ex:x,q>=1?ey:y,6,c)+(q>0&&q<1?star(x,y-8,2.4,'#FFFFFF'):'');
  });
  let coins='';if(u>3.4){for(let i=0;i<3;i++){const ph=((u*1.1+i*.33)%1);coins+=C(96+i*8,60-ph*20,3,'#FFD24A','opacity="'+(1-ph)+'"');}}
  const catraise=u>3.4?Math.sin(u*3)*1.5:0;
  const inner=`${R(0,0,320,180,'#E9E2FB')}
  ${R(0,142,320,38,'#C9BBF2')}
  ${R(190,98,90,44,'#F1C27B')}${awn}${R(196,98,78,4,'#C99A4E')}
  ${fr.slice(0,4).map(([c,i])=>{const t0=3.6+i*.85;return u<t0?C(210+16*i,94,6,c):''}).join('')}
  ${G2(cx,148-cbob-catraise,1.3,1.3,tip,cat())}${G(158,150-(u>3.6?Math.abs(Math.sin(u*4))*1.5:0),.98,noa(u>3.6?'up':'side',true))}
  ${R(130,132,14,12,'#B0763A',2)}<path d="M133 132 Q137 122 141 132" stroke="#B0763A" stroke-width="2" fill="none"/>
  ${fruits}${coins}
  <path d="M0 0 H${w} Q${w*.65} ${lerp(120,60,e)} 0 ${lerp(200,130,e)}Z" fill="${COL.sim}"/><path d="M320 0 H${320-w} Q${320-w*.65} ${lerp(120,60,e)} 320 ${lerp(200,130,e)}Z" fill="${COL.sim}"/>${R(0,0,320,12,'#4A2F9E')}`;
  return cam(inner,lerp(1,1.06,u/7),160,110);
}
function S6(u){
  const zoom=1+1.4*eio(seg(u,2.4,3.6))*(1-eio(seg(u,5.4,6.6)));
  const lcx=198+3*Math.sin(u*1.2),lcy=92+2*Math.sin(u*1.7);
  const sx=u<2.4?lerp(-30,40,eio(u/2.4)):40+(u-2.4)*2;
  let rip='';[1.2,3.4,5.6].forEach(t0=>{const q=(u-t0-.5)/1.2;if(q>0&&q<1)rip+=`<ellipse cx="96" cy="158" rx="${4+30*q}" ry="${1+5*q}" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="${1-q}"/>`;const d=seg(u,t0,t0+.5);if(d>0&&d<1)rip+=E(96,lerp(100,156,d*d),2,3,'#7CC3F2');});
  const g=seg(u,3.2,6),top=132-46*eio(g);
  const leaf=eob(seg(u,4,5)),bud=eob(seg(u,5.2,6.2));
  let rays='';for(let i=0;i<10;i++){const a=i*36+u*12;rays+=`<line x1="${40+Math.cos(a*Math.PI/180)*21}" y1="${34+Math.sin(a*Math.PI/180)*21}" x2="${40+Math.cos(a*Math.PI/180)*28}" y2="${34+Math.sin(a*Math.PI/180)*28}" stroke="#FFD24A" stroke-width="2.4" stroke-linecap="round"/>`;}
  const lx=198+7*Math.sin(u*1.5),ly=94+2*Math.cos(u*2);
  const inner=`${R(0,0,320,180,'#DDF3E4')}${rays}${C(40,34,16,'#FFE28A')}
  ${R(0,132,320,48,'#8B6B4A')}${R(0,128,320,8,'#3FA66B')}${E(96,158,42,8,'#7CC3F2')}${E(90,156,20,3,'#B8E0FA')}${rip}
  <path d="M258 132 Q${254+2*g} ${(132+top)/2} ${262-2*(1-g)} ${top}" stroke="#2E8F57" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  ${leaf>0?G(256,(132+top)/2+6,leaf,E(-11,0,11,5,'#4FC17F','transform="rotate(-30)"'))+G(262,(132+top)/2-4,leaf,E(11,0,11,5,'#4FC17F','transform="rotate(25)"')):''}
  ${bud>0?G(262,top,bud,C(0,0,6,'#F063AE')+C(0,0,2.5,'#FFCB47')):''}
  ${G(sx,134,1.15,snail())}
  ${G(150,150-Math.abs(Math.sin(u*2))*1,1,noa('side'))}
  <line x1="168" y1="120" x2="${lcx-14}" y2="${lcy+12}" stroke="#5B4636" stroke-width="5" stroke-linecap="round"/>
  <clipPath id="lens"><circle cx="${lcx}" cy="${lcy}" r="22"/></clipPath>
  ${C(lcx,lcy,24,'#FFFFFF','fill-opacity=".45"')}
  <g clip-path="url(#lens)">${R(lcx-30,lcy+2,60,30,'#4FC17F','0','opacity=".6"')}${G(lx+(lcx-198),ly+(lcy-92),1.7,E(0,0,11,8,'#E4472A')+C(0,-6,4.5,'#2B1A17')+C(-5,1,1.6,'#2B1A17')+C(5,1,1.6,'#2B1A17')+C(0,6,1.6,'#2B1A17')+`<line x1="0" y1="-7" x2="0" y2="8" stroke="#2B1A17" stroke-width=".8"/>`)}</g>
  ${C(lcx,lcy,24,'none','stroke="#5B4636" stroke-width="5"')}`;
  return cam(inner,zoom,198,92);
}
function S7(u){
  const gl=['N','O','A','b','7','a','ñ','+','r','3','m','S'];
  const colors=[COL.mov,COL.sim,COL.exp,COL.bib,COL.log,COL.art];
  const T=[[78,70],[118,58],[158,68]];
  let letters='';
  gl.forEach((ch,i)=>{
    const t=u-.4-i*.16;if(t<0)return;
    const e=eio(t/1.3),ang=u*1.2+i*.9;
    const ox=110+48*Math.cos(ang),oy=64+20*Math.sin(ang);
    let x=lerp(224,ox,e),y=lerp(92,oy,e),o=1,sc=1;
    if(i<3){const f=eio(seg(u,3.0,4.2));x=lerp(x,T[i][0]+13,f);y=lerp(y,T[i][1]-11,f);sc=1+.12*Math.sin(u*6+i)*seg(u,4.2,4.3);}
    else{const f=seg(u,3.0,4.0);o=1-f;y-=f*14;}
    const size=i<3?34:20;
    letters+=`<text x="${x}" y="${y}" font-size="${size*sc}" font-weight="800" text-anchor="middle" fill="${colors[i%6]}" opacity="${o}" transform="rotate(${i<3?lerp(Math.sin(u*2+i)*14,[-10,6,-4][i],eio(seg(u,3,4.2))):Math.sin(u*2+i)*14} ${x} ${y})">${ch}</text>`;
  });
  let sp='';if(u>4.2)for(let i=0;i<12;i++){const a=u*2+i*30,cx=70+((i%3)*42)+13,cy=40;const r=8+((u*20+i*7)%10);sp+=star(cx+Math.cos(a)*r*1.4,cy+Math.sin(a)*r*.8,2.2,LC[i%6]);}
  const jump=u>4.4?Math.abs(Math.sin((u-4.4)*5))*9:0;
  const arms=u<2?'up':(Math.floor(u*2)%2?'up':'side');
  const inner=`${R(0,0,320,180,'#DAE6FB')}
  ${R(10,58,150,4,'#8AA5DB')}${R(10,104,150,4,'#8AA5DB')}${bookRow(14,58,11,2)}${bookRow(14,104,11,4)}
  ${R(0,146,320,34,'#A9C1EE')}
  ${R(190,138,66,10,COL.exp,2)}${R(196,128,54,10,COL.art,2)}${R(200,118,46,10,COL.log,2)}${G2(224,118+Math.sin(u*2.5)*-1,1.25,1.25+Math.sin(u*2.5)*.03,0,owl())}
  ${letters}${sp}${G(100,152-jump,1.05,noa(arms))}`;
  return cam(inner,lerp(1,1.07,u/7),150,90);
}
function S8(u){
  const cs=[COL.mov,COL.sim,COL.exp,COL.bib,COL.art];
  let n=0,blocks='',labels='';
  const tossQ=seg(u,4.5,5.3),done=u>=5.3,wave=done?seg(u,5.3,6.6):0;
  const positions=[];
  for(let i=0;i<5;i++)for(let j=0;j<=i;j++){
    const missing=(i===4&&j===4);
    const rx=170+i*20+.5,ry=146-(j+1)*14;
    if(missing){
      const x=lerp(292,rx+9,eio(tossQ)),y=lerp(112,ry,tossQ)-36*Math.sin(Math.PI*tossQ);
      if(u>=4.3){const bounce=done?Math.max(0,Math.sin((u-5.3)*14))*Math.exp(-(u-5.3)*4)*3:0;blocks+=R(done?rx:x,(done?ry:y)-bounce,18,13,COL.log,2);}
      else blocks+=R(285,102,14,13,COL.log,2);
      continue;
    }
    const t0=.3+.28*n;n++;
    const q=seg(u,t0,t0+.45);if(q<=0){continue;}
    let y=lerp(-30,ry,q*q);if(q>=1){const t=u-t0-.45;y=ry-Math.max(0,Math.sin(t*16))*Math.exp(-t*5)*3.5;}
    const wob=wave>0&&wave<1?Math.sin(wave*Math.PI*2+i*.8+j*.3)*1.6:0;
    blocks+=R(rx+wob,y,18,13,cs[i],2);
  }
  for(let i=0;i<5;i++){
    const topLanded=i<4?u>.3+.28*(i*(i+1)/2+i)+.5:u>5.3;
    if(topLanded)labels+=`<text x="${179.5+i*20}" y="${146-(i+1)*14+11}" text-anchor="middle" font-size="10" font-weight="800" fill="#FFFFFF">${i+1}</text>`;
  }
  const hj=done?Math.abs(Math.sin((u-5.4)*6))*Math.exp(-(u-5.3)*.5)*12:0;
  let conf='';if(done&&u<6.9){const r=seg(u,5.3,6.9);for(let i=0;i<12;i++){const a=i*30;conf+=star(262+Math.cos(a*Math.PI/180)*(10+40*r),90+Math.sin(a*Math.PI/180)*(10+30*r)+10*r*r*6,3*(1-r),LC[i%6]);}}
  const tw=u>4.3?(tossQ<1?'up':'side'):'side';
  const inner=`${R(0,0,320,180,'#FFF3CF')}${R(0,146,320,34,'#F0D08A')}
  ${blocks}${labels}
  ${G2(112,146,1,1,wave>0?Math.sin(wave*12)*8:0,C(0,-10,10,COL.bib)+`<polygon points="-5,-2 5,-2 0,-20" fill="none"/>`)}
  <polygon points="124,146 136,146 130,128" fill="${COL.mov}"/>${R(140,134,12,12,COL.exp,1)}
  ${G(52,148-hj,1.25,hedge())}${G(296,150,.95,noa(tw))}${conf}
  <text x="196" y="40" font-size="20" font-weight="800" fill="#E0B44A">1 2 3</text>`;
  return cam(inner,lerp(1,1.06,u/7),200,110);
}
function S9(u){
  const spots=[[120,50],[140,44],[160,52],[126,72],[148,76],[170,72]];
  const handAt=[1.5,2.4,3.3,4.2,5.1,6];
  let prints='',splat='',cur=null;
  const hand=(c,s)=>`<g fill="${c}" transform="scale(${s})">${E(0,2,5.5,6.5)}${E(-5,-6,1.8,4.5)}${E(-1.7,-8,1.8,5.2)}${E(1.7,-8,1.8,5.2)}${E(5,-6,1.8,4.5)}${E(-7,2,1.8,3.8,'','transform="rotate(-40 -7 2)"')}</g>`;
  spots.forEach((p,i)=>{
    const t0=handAt[i],fly=seg(u,t0-.55,t0);
    const hx=lerp(72,p[0],eio(fly)),hy=lerp(112,p[1],fly)-18*Math.sin(Math.PI*fly);
    if(fly>0&&fly<1)prints+=C(hx,hy,3.5+1*Math.sin(u*20),LC[i]);
    if(u>=t0){const q=seg(u,t0,t0+.4);prints+=`<g transform="translate(${p[0]} ${p[1]})">${hand(LC[i],.9*eob(q))}</g>`;const s=seg(u,t0,t0+.6);if(s<1)splat+=C(p[0],p[1],3+12*eo(s),LC[i],`opacity="${.5*(1-s)}"`);cur=LC[i];}
  });
  const hc=cur||LC[0],nextT=handAt.find(t=>t-.55>u-.1);
  const reaching=handAt.some(t=>u>t-.9&&u<t-.35);
  const arms=reaching?'up':'side';
  let pots='';LC.forEach((c,i)=>{pots+=R(120+i*13,142,10,8,c,2);});
  let drops='';for(let i=0;i<6;i++){const a=(u*.7+i*.17)%1;drops+=C(20+i*52,20+a*80,2.4,LC[i],`opacity="${.5*(1-a)}"`);}
  const chamCol=cur||COL.art;
  const cbob=Math.sin(u*2.5);
  const inner=`${R(0,0,320,180,'#FCE4F0')}${R(0,148,320,32,'#F5B9D7')}${drops}
  <line x1="120" y1="100" x2="106" y2="150" stroke="#8A5A3C" stroke-width="4"/><line x1="170" y1="100" x2="184" y2="150" stroke="#8A5A3C" stroke-width="4"/>
  ${R(100,22,90,80,'#FFFFFF',3,'stroke="#8A5A3C" stroke-width="3"')}
  ${splat}${prints}${pots}
  ${G2(230,150,1.3,1.3+cbob*.02,0,cham().replaceAll(COL.art,chamCol))}
  ${G(56,150-(reaching?Math.abs(Math.sin(u*10))*2:0),1.05,nn(arms,false,{},hc))}`;
  return cam(inner,lerp(1,1.06,u/7),150,90);
}
function S10(u){
  const ps=[[40,30],[28,72],[54,112],[280,30],[292,72],[266,112]];
  const arr=i=>.6+.4*i+1;   // llegada a la página
  let lights='',win='';
  ps.forEach((p,i)=>{
    const t0=.5+.38*i,q=eio(seg(u,t0,t0+1.1));
    const x=lerp(p[0],160,q),y=lerp(p[1],66,q)-Math.sin(Math.PI*q)*(i<3?-14:14)*.0;
    const size=lerp(1,.4,q),alpha=1-seg(u,t0+1.0,t0+1.3);
    if(alpha>0){lights+=C(x,y,16*size,LC[i],`opacity="${.28*alpha}"`)+C(x,y,8*size,LC[i],`opacity="${alpha}"`);
      if(q<1)lights+=`<line x1="${p[0]}" y1="${p[1]}" x2="${x}" y2="${y}" stroke="${LC[i]}" stroke-width="1.3" stroke-dasharray="3 4" opacity=".5"/>`;}
    const wq=eob(seg(u,t0+1,t0+1.7));
    if(wq>0)win+=`<g transform="translate(${126+(i%3)*22+6} ${52+Math.floor(i/3)*14+5}) scale(${wq})">${R(-6,-5,12,10,LC[i],1)}</g>`;
  });
  const pageS=eob(seg(u,.2,1.2)),body=eio(seg(u,1.4,2.2)),roof=eob(seg(u,2.4,3.2)),door=eob(seg(u,3.6,4.2)),sun=eob(seg(u,4,4.8));
  const page=`${G2(160,66,pageS,pageS,0,R(-52,-52,104,104,'#F5F6FF',4)+R(-52,-52,4,104,'#DDE0F5'))}`;
  const school=`${G2(160,96,1,body,0,R(-40,-46,80,46,'#FFFFFF',2,'stroke="#B9BDD8" stroke-width="1.5"'))}
    ${G2(160,50,roof,roof,0,`<path d="M-44 0 L0 -20 L44 0Z" fill="${COL.mov}"/>`)}
    ${G2(160,96,door,door,0,R(-9,-14,18,14,COL.bib,2))}${G2(190,32,sun,sun,0,C(0,0,8,'#FFD36B'))}${R(120,96,80,3,'#6BBF7E')}`;
  // personajes finales
  const arr1=eo(seg(u,4.8,6.4)),arr2=eo(seg(u,5.2,6.8));
  const wv=Math.floor(u*2.4)%2?'up':'side';
  const wv2=Math.floor(u*2.4+1)%2?'up':'side';
  const kidY=(k)=>172-Math.abs(Math.sin(u*4+k))*(u>6.6?2:0);
  const chars=`${G(lerp(-20,26,eo(seg(u,3.6,4.8))),172,.55,u<4.8?migFly2(false,Math.sin(u*14)*.7+.2):migui())}
   ${G(lerp(-20,48,arr1),kidY(0),.5,noa(wv,false,KIDS[1]))}
   ${G(lerp(350,272,arr1),172,.55,sen())}${G(lerp(350,294,arr2),kidY(1),.5,noa(wv2,false,KIDS[2]))}${G(lerp(350,311,arr2),kidY(2),.5,noa(wv,false,{}))}`;
  const tt=eo(seg(u,7.3,8.3)),tg=eo(seg(u,8.4,9.4));
  const stars=[[20,20],[70,40],[240,18],[300,60],[190,12],[110,8]].map((p,i)=>star(p[0],p[1],1.8+Math.sin(u*3+i)*.8,'#C9CDFF')).join('');
  const inner=`<defs><linearGradient id="g10" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171A45"/><stop offset="1" stop-color="#2E3190"/></linearGradient></defs>
  ${R(0,0,320,180,'url(#g10)')}${stars}${page}${school}${win}${lights}
  <g opacity="${tt}" transform="translate(0 ${(1-tt)*8})"><text x="160" y="146" text-anchor="middle" font-size="21" font-weight="800" fill="#FFFFFF" style="letter-spacing:-.2px">CEIP San Miguel</text></g>
  <g opacity="${tg}"><text x="160" y="163" text-anchor="middle" font-size="8.6" font-weight="700" fill="#C9CDFF" style="letter-spacing:1px">EL ESPACIO TAMBIÉN ENSEÑA</text></g>
  ${chars}
  ${u>3.6&&u<4.8?'':''}`;
  return cam(inner,lerp(1,1.03,seg(u,0,13)),160,90);
}

/* ===== Línea de tiempo ===== */
const SCN=[S1,S2,S3,S4,S5,S6,S7,S8,S9,S10];
const ST=[0,6.5,13,19,26,33,40,47,54,61];
const TOTAL=76,TR=.9;
const LABELS=[null,null,null,['Movimiento y psicomotricidad','mov'],['Simbólico','sim'],['Experimentación y naturaleza','exp'],['Biblioteca y letras','bib'],['Lógico-matemático','log'],['Arte','art'],null];
const CAPS=[
 [.8,3.6,'Amanece en Plasencia.'],[3.8,6.3,'Migui vuela con una hoja en blanco.'],
 [7,10,'En la biblioteca del cole, Noa encuentra un libro gris.'],[10.2,12.9,'A este libro le falta una página.'],
 [13.3,16.1,'Noa coloca la hoja y el libro se abre.'],[16.3,18.9,'¡Noa cae dentro de sus páginas!'],
 [19.6,22.6,'Brinco solo sabe saltar. ¡Noa salta con él!'],[22.8,25.8,'Cada aro que pisa se ilumina.'],
 [26.6,29.6,'En la tienda de Telón, Noa juega a ser tendera.'],[29.8,32.8,'Aquí puede ser lo que quiera.'],
 [33.6,36.6,'Musgo pregunta: ¿y si miramos de cerca?'],[36.8,39.8,'Con la lupa descubre una mariquita gigante.'],
 [40.6,43.4,'Tinta hace volar las letras.'],[43.6,46.6,'Noa las atrapa y forma su nombre: N, O, A.'],
 [47.6,50.6,'Cuenta ordena los bloques del 1 al 5.'],[50.8,53.8,'Noa coloca el que falta y todo encaja.'],
 [54.6,57.6,'Mancha cambia de color con cada huella.'],[57.8,60.8,'Noa deja las suyas en el lienzo.'],
 [61.7,65.1,'Con las seis luces, Noa escribe la última página.'],[65.3,68.5,'Y en ella aparece su cole.']
];
function overlay(t,i,u){
  let o='';
  const L=LABELS[i];
  if(L){const w=L[0].length*4.5+20,a=eo(seg(u,.3,.9)),ink=L[1]==='log'?'#3A2A00':'#FFFFFF';
    o+=`<g transform="translate(${lerp(-w-10,8,a)} 8)">${R(0,0,w,15,COL[L[1]],7.5)}<text x="10" y="10.4" font-size="7.6" font-weight="700" fill="${ink}">${L[0]}</text></g>`;}
  CAPS.forEach(([a,b,txt])=>{
    const al=Math.min(seg(t,a,a+.4),1-seg(t,b-.4,b));
    if(al<=0)return;
    const w=txt.length*4.75+22;
    o+=`<g opacity="${al}" transform="translate(0 ${(1-al)*3})">${R(160-w/2,155,w,18,'#FFFFFF',9,'fill-opacity=".95" stroke="#1E2140" stroke-opacity=".12"')}<text x="160" y="167.3" text-anchor="middle" font-size="8.6" font-weight="600" fill="#1E2140">${txt}</text></g>`;
  });
  return o;
}
function frame(t){
  t=cl(t,0,TOTAL-.001);
  let i=SCN.length-1;while(t<ST[i])i--;
  const u=t-ST[i];let out='';
  if(i>0&&u<TR){
    const p=eio(u/TR),x=320*(1-p);
    out+=SCN[i-1](ST[i]-ST[i-1]+u);
    out+=`<defs><clipPath id="wipe"><rect x="${x}" y="0" width="${320-x}" height="180"/></clipPath><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient></defs>`;
    out+=`<g clip-path="url(#wipe)">${SCN[i](u)}</g><rect x="${x-16}" y="0" width="16" height="180" fill="url(#shade)"/><rect x="${x}" y="0" width="1.4" height="180" fill="#FFFFFF" opacity=".85"/>`;
  } else out+=SCN[i](u);
  const fadeIn=1-seg(t,0,.6),fadeOut=seg(t,TOTAL-1,TOTAL-.05);
  return out+overlay(t,i,u)+R(0,0,320,180,'#FFFFFF','0',`opacity="${fadeIn}"`)+R(0,0,320,180,'#171A45','0',`opacity="${fadeOut}"`);
}
const svgEl=document.getElementById('s');
window.renderAt=t=>{svgEl.innerHTML=frame(t);return t;};
window.TOTAL=TOTAL;
(function(){
  const q=new URLSearchParams(location.search);
  if(q.has('render')){document.body.classList.add('render');renderAt(+q.get('t')||0);return;}
  let playing=false,t0=0,off=0;
  const btn=document.getElementById('play');
  const tick=now=>{if(!playing)return;const t=off+(now-t0)/1000;renderAt(t%TOTAL);if(t<TOTAL)requestAnimationFrame(tick);else{playing=false;btn.hidden=false;off=0;}};
  btn.onclick=()=>{playing=true;btn.hidden=true;t0=performance.now();off=0;requestAnimationFrame(tick);};
  renderAt(70);
})();
