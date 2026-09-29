/* ===== ACTO 1: Amanece en Plasencia ===== */
function miguS1(u){
  // devuelve estado de Migui
  let x=58,y=44,fly=0,rot=0,eyes='open',wing=0,beak=0,page=false;
  if(u<1.5){eyes='closed';}
  else if(u<3.0){eyes='open';wing=bump(u,2.0,2.8);beak=bump(u,2.4,2.9)*.8;}
  else if(u<4.55){const p=(u-3.0)/1.55;fly=1;x=lerp(58,150,eio(p));y=lerp(44,52,p)-26*Math.sin(Math.PI*Math.min(1,p*1.1));rot=-14*(1-p)+8*p;}
  else{const p=(u-4.55)/2.95;fly=1;page=true;x=lerp(150,452,Math.pow(p,1.25)+.0);y=52+14*p+Math.sin(p*7)*4;rot=4;}
  return {x,y,fly,rot,eyes,wing,beak,page};
}
function pageS1(u){
  if(u<2.4||u>4.55)return null;
  const p=(u-2.4)/2.15;
  return {x:lerp(350,177,eio(p)),y:lerp(24,46,p)+Math.sin(p*11)*9,rot:Math.sin(p*8)*28,fl:u*9};
}
function S1(u){
  const mg=miguS1(u),pg=pageS1(u);
  const shots=[
    {t0:0,t1:2.7,z0:3.5,z1:3.1,cx0:64,cx1:66,cy0:30,cy1:29},
    {t0:2.7,t1:4.7,z0:2.0,z1:1.55,cx0:105,cx1:150,cy0:52,cy1:56,punch:1,whip:1},
    {t0:4.7,t1:7.5,z0:1.45,z1:1.15,cx0:miguS1(4.7).x+30,cx1:miguS1(7.5).x-20,cy0:64,cy1:72,punch:1,whip:1,ease:x=>x}
  ];
  const cam=shotAt(shots,u),T=u/7.5,br=eo(T*1.6);
  const top=mixc('#2b2f7a','#6f8ce6',br),mid=mixc('#a15fb3','#ffa9c6',br),hor=mixc('#ff8f66','#ffe0a8',br);
  const sunY=lerp(150,110,eo(T));
  const defs=`${lgrad('s1sky',[[0,top],[.55,mid],[1,hor]])}${lgrad('s1stone',[[0,'#c9a37a'],[1,'#f7dfb2']],1,0)}${lgrad('s1mist',[[0,'#c9b6ea',.0],[1,'#ffd6d8',.85]])}${lgrad('s1ridge',[[0,mixc('#7f78c6','#a99be0',br)],[1,'#e8c4dc']])}${lgrad('s1hill',[[0,mixc('#4f7d8e','#78b4a2',br)],[1,'#c9d9a8']])}`;
  // capas
  let sky=`<rect x="-300" y="-200" width="1400" height="520" fill="url(#s1sky)"/>`;
  const stars=[[20,20],[70,42],[130,14],[200,28],[260,10],[320,38],[380,18]].map((p,i)=>star(p[0],p[1],1.8,'#fff',`opacity="${(1-br)*.9*(.6+.4*Math.sin(u*3+i))}"`)).join('');
  const sun=glowR(250,sunY,90,'#fff0b8',.95)+`<circle cx="250" cy="${sunY}" r="17" fill="#fff6d0"/>`+rays(250,sunY,180,-90,110,9,'#fff3c0',.16,u);
  const clouds=paperCloud(40+u*3,34,1.1,'#fff','#ffc9d8')+paperCloud(180+u*2.2,20,.8,'#fff','#ffd6c8')+paperCloud(320+u*3.4,44,1.2,'#fff','#ffc7d6')+paperCloud(520+u*2,28,1,'#fff','#ffcfd6');
  const far=ridge(3,-200,900,132,46,26,'url(#s1ridge)')+P('M-200 132 H900 V180 H-200Z','url(#s1mist)');
  let aq='';for(let i=0;i<9;i++){const ax=210+i*20;aq+=P(`M${ax} 126 V104 A7 8 0 0 1 ${ax+14} 104 V126Z`,'#f3d9b1','opacity="0"');}
  let arches=R(206,92,184,6,'#e8cba0')+R(206,98,184,5,'#d9b98c');for(let i=0;i<9;i++){const ax=210+i*20;arches+=R(ax-4,103,6,26,'#e8cba0')+P(`M${ax+2} 129 V112 A8 9 0 0 1 ${ax+16} 112 V129Z`,'#c9b8d8','opacity=".55"');}
  const mid1=hills(2,-200,900,136,16,'url(#s1hill)')+`<g filter="url(#ds)">${arches}</g>`+hills(5,-200,900,146,10,mixc('#3f7a68','#6fb08a',br));
  const back=houses(80,760,150,7,['#f0cfa0','#f6dfc0','#e8b99a','#d6c0d8'],['#c9694a','#b85a45'],'#ffd98a',.9)+R(60,148,760,40,'#7a5c9a','opacity=".25"');
  const front=houses(96,780,158,11,['#f8e2bd','#f2c9a0','#e9a889','#c7d6e8','#f9eed8'],['#d9603f','#c4523a','#e07a4d'],'#ffd36b',1.15);
  // catedral y torre del nido
  const cath=`<g filter="url(#ds2)">
    ${R(76,86,96,64,'url(#s1stone)')}${P('M72 86 L124 62 L176 86Z','#d9694a')}${P('M72 86 L124 62 L124 66 L80 86Z','#f09a70','opacity=".5"')}
    ${R(44,44,32,106,'url(#s1stone)')}${R(40,40,40,5,'#e2c491')}${R(40,45,40,2,'#b9925f','opacity=".5"')}
    ${[0,1,2].map(i=>R(41+i*14,35,8,6,'#e2c491')).join('')}
    ${R(52,60,16,26,'#6a4f8c',8)}${P('M52 86 V68 A8 8 0 0 1 68 68 V86Z','#f6c977','opacity=".9"')}${R(59.5,60,1.4,26,'#5a3f7c')}
    ${R(150,58,30,92,'url(#s1stone)')}${E(165,58,17,15,'#5db2a2')}${E(165,55,10,8,'#8fd6c5','opacity=".7"')}${R(163.4,36,3.2,12,'#d9b45a')}${C(165,35,2.2,'#f6d36b')}
    ${R(155,74,20,20,'#5a3f7c',10)}${C(124,104,9,'#f6c977')}${C(124,104,9,'none','stroke="#8a6b52" stroke-width="1.4"')}${R(123.4,95,1.2,18,'#8a6b52')}${R(115,103.4,18,1.2,'#8a6b52')}
    ${R(96,118,14,32,'#5a3f7c',7)}${R(138,118,14,32,'#5a3f7c',7)}
  </g>`;
  const nest=`<g filter="url(#ds)">${E(58,44.5,20,4.5,'#8f6a45')}${E(58,43.5,17,3.4,'#b98d5d')}${E(50,43.8,6,1.2,'#7a5638')}${E(66,44,7,1.1,'#7a5638')}</g>`;
  const groundS=`${R(380,146,320,60,'#8bc48a')}${R(380,146,320,3,'#a7d9a0')}${R(380,158,320,30,'#7fb47e')}`;
  const sch=school(500,148,{u,s:1});
  // Migui y página
  const mt=mg.fly?G2(mg.x,mg.y,.95,.95,mg.rot,flyR(mg.page,Math.sin(u*17)*.75+.25,{blink:0})):G2(mg.x,mg.y,.95,.95*(1+Math.sin(u*2.4)*.018)*(mg.eyes==='closed'?1.02:1),0,miguiR({t:u,eyes:mg.eyes,wing:mg.wing,beak:mg.beak}));
  const pgS=pg?`<g transform="translate(${pg.x} ${pg.y}) rotate(${pg.rot})">${pageSVG(pg.fl,.5)}</g>`:'';
  const zz=u<1.5?[0,1,2].map(i=>{const q=((u*.8+i*.33)%1);return `<text x="${72+i*5+q*10}" y="${30-q*18}" font-size="${5+i*1.4}" font-weight="800" fill="#fff" opacity="${(1-q)*.8}" font-family="Figtree">z</text>`}).join(''):'';
  const birds=[0,1,2].map(i=>{const bx=(u*16+i*70)%520-60,by=42+i*9+Math.sin(u*2+i)*3,f=Math.sin(u*11+i)*3;return `<path d="M${bx} ${by} l5 ${-3+f} l5 ${3-f}" stroke="#5a4a8c" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;}).join('');
  const fg=`<g filter="url(#b1)">${houses(-40,700,190,23,['#c96a4a','#d9805a','#b85a45'],['#a04a3a','#c9603f'],'#ffd36b',1.9)}</g>`;
  let smoke='';for(let i=0;i<5;i++){const q=((u*.35+i*.2)%1);smoke+=C(150+i*2+q*10,124-q*30,3+q*6,'#fff',`opacity="${(1-q)*.35}"`);}
  const world=WORLD(cam,`${defs}
    ${L(cam,.05,sky)}${L(cam,.08,stars+sun)}${L(cam,.2,clouds)}${L(cam,.3,far,'filter="url(#b1)"')}${L(cam,.5,mid1)}
    ${L(cam,.65,back,'filter="url(#b1)"')}${L(cam,.85,front)}
    ${L(cam,1,groundS+cath+nest+sch+smoke)}
    ${L(cam,1,zz+mt+pgS)}${L(cam,.9,birds)}
    ${L(cam,1.35,fg)}
    ${L(cam,1.5,motes(u,26,-100,700,-20,190,'#fff4c8',.9,2,3))}`);
  return world+`<rect width="320" height="180" fill="url(#vig)"/>`+glowR(300,130,200,'#ffc98a',.22*br);
}

/* ===== ACTO 2: La biblioteca ===== */
const BK=['#e4472a','#2a5fd0','#f2b01e','#2e8f57','#6b4bd1','#d42f86','#f08a4b','#3fb0b0','#a3462f','#5b7fd0'];
function bookcase(x,y,w,h,rows,seed,u=0){
  const r=rnd(seed);let s=`<g filter="url(#ds)">${R(x,y,w,h,'#8a5a3a',3)}${R(x+3,y+3,w-6,h-6,'#5a3826',2)}`;
  const rh=(h-6)/rows;
  for(let k=0;k<rows;k++){
    const by=y+3+(k+1)*rh;let cx=x+5;
    while(cx<x+w-9){
      const bw=3.6+r()*3.8,bh=rh*(.62+r()*.3),c=BK[Math.floor(r()*BK.length)],tilt=r()>.93?12:0;
      s+=`<g transform="rotate(${tilt} ${cx+bw/2} ${by-2})">${R(cx,by-2-bh,bw,bh,c,.8)}${R(cx+.7,by-2-bh+bh*.2,bw-1.4,.8,'#fff','opacity=".55"')}${R(cx+.7,by-2-bh+bh*.7,bw-1.4,.8,'#fff','opacity=".4"')}${R(cx,by-2-bh,1,bh,'#000','opacity=".12"')}</g>`;
      cx+=bw+.4;
      if(r()>.94&&cx<x+w-20){s+=E(cx+5,by-6,4,4,'#3aa05a')+R(cx+3,by-4,4,4,'#c96a4a',1);cx+=11;}
    }
    s+=R(x+3,by-2,w-6,2.6,'#a5714a');
  }
  return s+`</g>`;
}
function miguS2(u){
  // vuela desde la ventana (u 2.7-4.7) hasta el atril; luego de pie
  if(u<2.7)return {x:280,y:50,fly:1,ph:0,vis:false};
  if(u<4.7){const p=(u-2.7)/2;const e=eio(p);return {x:lerp(255,182,e),y:lerp(46,118,e)-24*Math.sin(Math.PI*p*.9),fly:1,rot:lerp(-18,6,p),vis:true};}
  return {x:182,y:121,fly:0,vis:true};
}
function libParts(u){
  const defs=`${lgrad('s2wall',[[0,'#ffe9cb'],[1,'#ffd3a8']])}${lgrad('s2floor',[[0,'#c98f5a'],[1,'#9a6438']])}${lgrad('s2beam',[[0,'#fff3c4',.75],[1,'#fff3c4',0]])}${lgrad('s2sky',[[0,'#8fc4f5'],[1,'#e9f4ff']])}`;
  const wall=`${R(0,0,320,150,'url(#s2wall)')}${R(0,102,320,48,'#7db5aa')}${R(0,100,320,3,'#f7f1e2')}${R(0,102,320,48,'#000','opacity=".04"')}` + Array.from({length:22},(_,i)=>R(i*15,103,1,47,'#fff','opacity=".16"')).join('');
  const win=`<g filter="url(#ds2)"><path d="M212 108 V44 A34 34 0 0 1 280 44 V108Z" fill="#fffaf0"/><path d="M218 104 V45 A28 28 0 0 1 274 45 V104Z" fill="url(#s2sky)"/>${paperCloud(236,52+Math.sin(u)*1,.5,'#fff','#dfefff')}${paperCloud(262,72,.4,'#fff','#e6f3ff')}<path d="M246 17 V104 M218 62 H274" stroke="#fffaf0" stroke-width="2.6"/>${R(208,104,76,5,'#f0e2c4',1.5)}</g>`;
  const beams=`<g style="mix-blend-mode:screen"><polygon points="222,60 262,60 190,150 110,150" fill="url(#s2beam)" opacity="${.45+.12*Math.sin(u*1.3)}"/><polygon points="250,70 276,70 250,150 200,150" fill="url(#s2beam)" opacity=".3"/></g>`;
  const door=`<g filter="url(#ds)">${R(10,62,36,88,'#7a4a2e',2)}${R(14,66,28,84,'#fff3d6','opacity=".9"')}${P('M14 150 L14 66 L42 66 L42 150Z','#fff7de','opacity=".9"')}${R(10,62,36,4,'#5a3826')}</g>${glowR(28,110,40,'#fff1c0',.35)}`;
  const floor=`${R(0,146,320,40,'url(#s2floor)')}${Array.from({length:8},(_,i)=>R(0,146+i*5.5+ (i*i*.35),320,.8,'#5a3a20','opacity=".35"')).join('')}${E(150,166,120,14,'#3fa3a0','opacity=".85"')}${E(150,166,100,11,'#f2c261','opacity=".9"')}${E(150,166,78,8,'#e4622f','opacity=".85"')}${E(150,166,52,5,'#fff3d6','opacity=".8"')}`;
  const lectern=`<g filter="url(#ds2)">${R(164,132,36,18,'#8a5a3a',2)}${P('M158 130 H206 L200 114 H164Z','#a56f47')}${R(160,148,44,3,'#6a4028')}
    <g transform="translate(182 116)">${P('M-19 0 L-15 -9 H15 L19 0Z','#9ba0b8')}${R(-15,-9,30,2,'#767c96')}${R(-13,-7,26,5,'#b9bdd0',1.5)}${R(-7,-6.6,14,2,'#8a90aa',1)}<path d="M-10 -1 H10" stroke="#767c96" stroke-width=".7"/></g></g>${u>5.4?glowR(182,113,26,'#fff3c4',.3*Math.min(1,(u-5.4)/1)):''}`;
  const back=`${wall}${win}${door}${bookcase(52,26,110,76,4,5)}${bookcase(286,30,52,74,4,9)}`;
  return {defs,back,beams,floor,lectern};
}
function S2(u){
  const shots=[
    {t0:0,t1:3.4,z0:1.0,z1:1.18,cx0:150,cx1:158,cy0:90,cy1:100},
    {t0:3.4,t1:5.5,z0:2.0,z1:2.3,cx0:200,cx1:190,cy0:96,cy1:108,punch:1,whip:1},
    {t0:5.5,t1:7.5,z0:2.75,z1:3.1,cx0:152,cx1:156,cy0:112,cy1:108,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u);
  const walkP=eio(seg(u,.3,2.7)),nx=lerp(24,118,walkP),walking=u>.3&&u<2.7;
  const ph=u*9,lg=walking?Math.sin(ph)*26:0;
  const surprised=u>2.7&&u<4.6, joy=u>=4.6;
  const eyes=surprised?'wide':(joy?'happy':'open'),mouth=joy?'open':(surprised?'o':'smile');
  const give=seg(u,6.0,6.9);
  const noaArmL=walking?30+Math.sin(ph+3.14)*22:(joy?70+Math.sin(u*9)*12:30),noaArmR=walking?30+Math.sin(ph)*22:(joy?70+Math.sin(u*9+1)*12:30);
  const noaG=G2(nx,146-(walking?Math.abs(Math.sin(ph))*1.3:0),1.25,1.25,walking?Math.sin(ph)*2.2:0,kidR({t:u,la:give>0?55:noaArmL,ra:give>0.5?95:noaArmR,lgL:lg,lgR:-lg,eyes,mouth,brow:surprised?1:(joy?.4:0),tilt:joy?-5:0,btn:[0,0,0,0,0,0]}));
  const mg=miguS2(u);
  let mgG='';if(mg.vis){mgG=mg.fly?G2(mg.x,mg.y,.95,.95,mg.rot,flyR(false,Math.sin(u*17)*.75+.25)):G2(mg.x,mg.y,1.1,1.1*(1+Math.sin(u*2.4)*.015),0,miguiR({t:u,eyes:joy?'happy':'open',beak:bump(u,5.0,5.5)*.7,wing:0}));}
  // página: en el pico de Migui y luego a las manos de Noa
  let pgS='';
  if(u>=4.7){const px0=182+27,py0=121-4;const t=seg(u,6.0,6.9),hx=nx+18,hy=110;const x=lerp(px0,hx,eio(t)),y=lerp(py0,hy,t)-10*Math.sin(Math.PI*t);pgS=`<g transform="translate(${x} ${y}) rotate(${-12+t*12}) scale(1.1)">${pageSVG(u*4,t>0?.5:.25)}</g>`;}
  const {defs,back,beams,floor,lectern}=libParts(u);
  // faroles (primer plano desenfocado)
  const lamps=[[60,4,7],[140,0,9],[250,2,8]].map(([lx,ly,r],i)=>`<g transform="translate(${lx} 0) rotate(${Math.sin(u*.9+i)*2.2} 0 0)"><line x1="0" y1="0" x2="0" y2="${28+ly}" stroke="#6a4028" stroke-width=".8"/><g transform="translate(0 ${30+ly})">${glowR(0,0,26,'#ffd98a',.5)}${E(0,0,r,r*.85,'#ffe7a8')}${E(0,-r*.2,r*.7,r*.5,'#fff7d8','opacity=".8"')}</g></g>`).join('');
  const shadow=`${E(nx,148,14,3.2,'#000','opacity=".22"')}${mg.vis&&!mg.fly?E(mg.x,mg.y+1,12,2.4,'#000','opacity=".2"'):''}`;
  const fgBooks=`<g filter="url(#b2)">${R(258,158,60,10,'#d42f86',2)}${R(262,150,52,9,'#2a5fd0',2)}${R(266,143,44,8,'#f2b01e',2)}${P('M4 190 Q10 150 30 140 Q24 165 40 190Z','#3fa05a')}${P('M16 190 Q30 160 56 156 Q40 172 50 190Z','#56b56e')}</g>`;
  const world=WORLD(cam,`${defs}${L(cam,.55,back)}${L(cam,.7,beams)}${L(cam,1,floor+lectern+shadow)}${L(cam,1,noaG+mgG+pgS)}${L(cam,1.15,`<g filter="url(#b1)">${lamps}</g>`)}${L(cam,1.35,fgBooks)}${L(cam,1.2,motes(u,32,0,320,60,160,'#fff2c0',.7,4,2.5))}`);
  return world+`<rect width="320" height="180" fill="url(#vig)"/>`;
}
