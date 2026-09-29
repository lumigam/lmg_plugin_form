/* ===== ACTO 5: Simbólico ===== */
const HAT=`${R(-9,-59,18,12,'#1F1B45',2)}${R(-12,-49,24,3.5,'#1F1B45',1.5)}${R(-9,-52,18,2.5,'#F2B01E')}`;
const catNoHat=()=>cat().replace(HAT,'');
function S5(u){
  const nx=u<1.9?lerp(-24,116,eio(seg(u,.3,1.9))):116,walking=u>.3&&u<1.9,ph=u*8.5,sw=walking?Math.sin(ph)*22:0;
  const FT=[2.9,3.4,3.9,4.4],fruit=[[COL.mov,'#ff8f7a'],[COL.log,'#ffd870'],['#4FC17F','#9be8b6'],[COL.art,'#ff9cc9']];
  let fruits='',basketFill=0;
  FT.forEach((t0,i)=>{const q=seg(u,t0,t0+.6),sx=214+i*17,sy=116,ex=nx+16+(i%2)*5,ey=132-Math.floor(i/2)*5;
    if(q<=0){fruits+=`<g filter="url(#ds)">${C(sx,sy-4,6.4,fruit[i][0])}${C(sx-2,sy-6,2,fruit[i][1],'opacity=".8"')}</g>`;}
    else if(q<1){const e=eio(q),x=lerp(sx,ex,e),y=lerp(sy-4,ey,e)-30*Math.sin(Math.PI*e);fruits+=C(x,y,6.4,fruit[i][0])+star(x+8,y-7,2.4,'#fff');}
    else{basketFill++;}
  });
  let inB='';for(let i=0;i<basketFill;i++)inB+=C(nx+13+i*4.5,129-(i%2)*3,5.2,fruit[i][0]);
  const HT=seg(u,4.6,5.35),hatX=lerp(246,nx,eio(HT)),hatY=lerp(146-1.25*52,146-1.15*46,eio(HT))-24*Math.sin(Math.PI*HT);
  const hatOnNoa=HT>=1,hatOnCat=HT<=0;
  const happy=u>3.4,bow=bump(u,2.2,2.9);
  const catBob=Math.sin(u*3)*.8;
  const G3=gift(u,5.95,.9,[250,108],[nx+2,118],LIGHT.sim);
  const btn=btnLevels(1,seg(u,6.85,7.4));
  const noaPose=kidR({t:u,la:walking?30+sw:(u>2.9&&u<4.9?70:30),ra:walking?30-sw:(HT>.5&&HT<1?150:(u>2.9&&u<4.9?95:30)),lgL:walking?sw*1.1:0,lgR:walking?-sw*1.1:0,eyes:happy?'happy':'open',mouth:u>4.9?'open':'smile',brow:0,btn,hat:hatOnNoa?`<g transform="translate(0 -5) scale(.85)">${HAT}</g>`:null,tilt:hatOnNoa?bump(u,5.35,5.9)*5:0});
  const noaG=G2(nx,147-(walking?Math.abs(Math.sin(ph))*1.4:0)-(hatOnNoa?bump(u,5.35,5.8)*3:0),1.15,1.15,0,noaPose);
  const basket=`<g transform="translate(${nx+13} 132)"><path d="M-9 -2 H9 L7 9 H-7Z" fill="#b9793f"/><path d="M-9 -2 H9" stroke="#8a5628" stroke-width="1.6"/><path d="M-9 -2 Q0 -18 9 -2" fill="none" stroke="#8a5628" stroke-width="1.6"/>${[-4,0,4].map(x=>`<path d="M${x} -1 V8" stroke="#8a5628" stroke-width=".6"/>`).join('')}</g>`;
  const catG=G2(246,146+catBob*-.5,1.25,1.25,bow*-6,(hatOnCat?cat():catNoHat())+ (hatOnCat?'':''));
  const catHat=(!hatOnCat&&!hatOnNoa)?G2(hatX,hatY,1.1,1.1,-20*Math.sin(Math.PI*HT),`<g transform="translate(0 52)">${HAT}</g>`):'';
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.18,cx0:150,cx1:168,cy0:92,cy1:98},
    {t0:2.5,t1:5.0,z0:1.9,z1:1.8,cx0:150,cx1:190,cy0:112,cy1:108,punch:1,whip:1},
    {t0:5.0,t1:6.3,z0:1.55,z1:1.65,cx0:178,cx1:176,cy0:104,cy1:104,punch:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nx,cx1:nx,cy0:106,cy1:108,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u);
  const pu=i=>popStagger(u,i);
  const open=eo(seg(u,.5,1.7)),cw=lerp(150,26,open);
  const defs=`${lgrad('s5wall',[[0,'#f1e9ff'],[1,'#d8c8fb']])}${lgrad('s5floor',[[0,'#c9b6f2'],[1,'#a58fdc']])}<pattern id="s5str" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="#fff" opacity=".35"/></pattern>`;
  const wall=`${R(-300,0,1000,146,'url(#s5wall)')}${R(-300,100,1000,46,'#b9a2ee')}${R(-300,100,1000,46,'url(#s5str)')}${R(-300,98,1000,3,'#fffaf0')}`;
  let bulbs='';for(let i=0;i<22;i++){const x=-20+i*20,y=10+Math.sin(i/21*Math.PI*3)*4+Math.sin(u*2+i)*.4;bulbs+=glowR(x,y+3,10,'#ffe08a',.55*(.7+.3*Math.sin(u*3+i)))+C(x,y+3,2.4,'#fff3c4');}
  const string=`<path d="M-20 10 Q40 22 100 10 T220 10 T340 10 T460 10" stroke="#6a4c9a" stroke-width=".7" fill="none"/>${bulbs}`;
  const rack=`<g filter="url(#ds)">${R(18,54,3,94,'#8a5a3a')}${R(74,54,3,94,'#8a5a3a')}${R(14,58,66,3,'#a56f47',1.5)}
    <path d="M28 61 q-3 26 0 38 h12 q3 -12 0 -38Z" fill="#e4472a"/><path d="M46 61 q-3 30 0 44 h12 q3 -14 0 -44Z" fill="#3f79f0"/><path d="M64 61 q-2 22 0 32 h10 q2 -10 0 -32Z" fill="#f2b01e"/>
    ${R(24,44,16,4,'#f2b01e',2)}<path d="M28 44 L32 34 L36 44Z" fill="#f2b01e"/>${E(60,50,10,3.2,'#f0489a')}${R(52,36,16,14,'#f0489a',3)}${R(20,110,54,3,'#a56f47',1.5)}${C(32,118,8,'#fff3d6')}${R(28,118,8,6,'#e4472a')}${R(50,112,20,10,'#2a5fd0',2)}${R(50,116,20,1.6,'#fff','opacity=".6"')}</g>`;
  const mirror=`<g filter="url(#ds)">${E(122,64,17,24,'#d9a441')}${E(122,64,14,21,'#cfe7ff')}${E(118,56,5,9,'#fff','opacity=".45"')}<path d="M116 82 l-6 10 M128 82 l6 10" stroke="#8a5a3a" stroke-width="2"/></g>`;
  let awn='';for(let i=0;i<10;i++)awn+=P(`M${190+i*10.4} 80 h10.4 l1 14 a5.2 5.2 0 0 1 -12.4 0Z`,i%2?'#fff':COL.sim);
  const stall=`<g filter="url(#ds2)">${R(196,80,100,8,'#5a3f9c',3)}${awn}${R(196,110,100,38,'#e9b877',3)}${R(196,110,100,5,'#f7d59d',2)}${R(200,116,92,28,'#d99f5c',2)}${[0,1,2,3].map(i=>R(203+i*23,119,20,22,'#c98c4a',2)).join('')}${R(198,84,4,64,'#8a5a3a')}${R(290,84,4,64,'#8a5a3a')}
    <g transform="translate(246 62)">${R(-24,-12,48,20,'#3a3560',3)}${R(-22,-10,44,16,'#4a4478',2)}${C(-12,-2,4,'#ff8f7a')}${C(0,-2,4,'#ffd870')}${C(12,-2,4,'#9be8b6')}<text x="0" y="-16.4" text-anchor="middle" font-size="5" font-weight="800" fill="#fff" font-family="'Bricolage Grotesque',sans-serif" letter-spacing=".6">FRUTERÍA</text></g></g>`;
  const floor=`${R(-300,146,1000,40,'url(#s5floor)')}${Array.from({length:7},(_,i)=>R(-300,148+i*5+i*i*.3,1000,.8,'#6a4c9a','opacity=".25"')).join('')}${E(150,166,110,11,'#f0489a','opacity=".55"')}${E(150,166,88,8,'#ffd870','opacity=".7"')}`;
  const curtains=`<g filter="url(#ds2)"><path d="M-40 0 H${cw} Q${cw*.62} ${lerp(110,60,open)} -40 ${lerp(210,140,open)}Z" fill="#6b4bd1"/><path d="M-40 0 H${cw*.7} Q${cw*.4} ${lerp(90,50,open)} -40 ${lerp(150,100,open)}Z" fill="#8a67ef" opacity=".55"/><path d="M360 0 H${320-cw} Q${320-cw*.62} ${lerp(110,60,open)} 360 ${lerp(210,140,open)}Z" fill="#6b4bd1"/><path d="M360 0 H${320-cw*.7} Q${320-cw*.4} ${lerp(90,50,open)} 360 ${lerp(150,100,open)}Z" fill="#8a67ef" opacity=".55"/>${R(-40,0,400,11,'#4a2f9e')}${Array.from({length:14},(_,i)=>R(i*24-20,11,3,5,'#f2b01e')).join('')}</g>`;
  const world=WORLD(cam,`${defs}
    ${L(cam,.5,wall+popUp(pu(0),148,rack+mirror)+string)}
    ${L(cam,.8,popUp(pu(1),150,stall))}
    ${L(cam,1,floor+shadowE(nx,149,15)+shadowE(246,150,17)+catG+catHat+fruits+noaG+basket+inB+G3.svg)}
    ${L(cam,1.15,curtains)}${L(cam,1.3,motes(u,30,0,320,20,170,'#ffe8b8',.7,12,2.5))}`);
  return world+glowR(160,60,160,'#e2d0ff',.22);
}

/* ===== ACTO 6: Experimentación y naturaleza ===== */
function leafBig(x,y,s,rot,c1,c2){return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C-20 -10 -34 -46 0 -70 C34 -46 20 -10 0 0Z" fill="${c1}"/><path d="M0 0 V-66" stroke="${c2}" stroke-width="2"/>${[-50,-38,-26,-14].map(yy=>`<path d="M0 ${yy} L-14 ${yy-6} M0 ${yy} L14 ${yy-6}" stroke="${c2}" stroke-width="1.2" opacity=".7"/>`).join('')}</g>`;}
function S6(u){
  const nx=u<1.9?lerp(-24,120,eio(seg(u,.3,1.9))):120,walking=u>.3&&u<1.9,ph=u*8.5,sw=walking?Math.sin(ph)*22:0;
  const crouch=eo(seg(u,2.2,2.9))*(1-eo(seg(u,4.0,4.5))*.0);
  const sx=lerp(360,196,eio(seg(u,.2,2.4)))+ (u>2.4?Math.sin(u*.6)*1.5:0);
  const snailMove=u<2.4;
  const lensX=nx+30+Math.sin(u*1.3)*2*crouch,lensY=lerp(112,116,crouch)+Math.cos(u*1.7)*1.5*crouch;
  const water=seg(u,3.6,5.2),grow=eo(seg(u,4.5,6.2)),bloom=eob(seg(u,5.6,6.5));
  const G3=gift(u,5.95,.9,[sx-4,120],[nx+2,116],LIGHT.exp);
  const btn=btnLevels(2,seg(u,6.85,7.4));
  const zoomLens=eio(seg(u,2.4,3.4))*(1-eio(seg(u,4.0,4.8)));
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.2,cx0:150,cx1:175,cy0:92,cy1:102},
    {t0:2.5,t1:4.1,z0:2.1,z1:3.3,cx0:lensX-4,cx1:lensX,cy0:lensY-2,cy1:lensY,punch:1,whip:1},
    {t0:4.1,t1:6.3,z0:1.8,z1:1.35,cx0:230,cx1:210,cy0:112,cy1:98,punch:1,whip:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nx,cx1:nx,cy0:108,cy1:110,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u);
  const happy=u>4.6;
  const pose=kidR({t:u,la:walking?30+sw:(crouch>.5?40:30),ra:walking?30-sw:(crouch>.5&&u<3.9?70:(u>=3.9&&u<5.2?110:30)),lgL:walking?sw*1.1:0,lgR:walking?-sw*1.1:0,eyes:u>2.9&&u<4.6?'wide':(happy?'happy':'open'),mouth:u>2.9&&u<4.6?'o':(happy?'open':'smile'),brow:u>2.9&&u<4.6?1:0,btn});
  const noaG=G2(nx,147-(walking?Math.abs(Math.sin(ph))*1.4:0)+crouch*2,1.15*(1+crouch*.06),1.15*(1-crouch*.2),0,pose);
  const snG=G2(sx,148,1.25,1.25,0,snail()+'');
  const slime=snailMove?`<path d="M${sx+30} 148 H400" stroke="#d8f5e0" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`:'';
  // lupa
  const lensS=1-eo(seg(u,3.5,4.0));
  const lens=lensS<=.01?'':`<g transform="translate(${nx+22} 122) scale(${lensS}) translate(${-(nx+22)} -122)"><line x1="${nx+22}" y1="122" x2="${lensX-11}" y2="${lensY+11}" stroke="#5B4636" stroke-width="4.4" stroke-linecap="round"/>
    <clipPath id="lenscp"><circle cx="${lensX}" cy="${lensY}" r="15"/></clipPath>${C(lensX,lensY,15,'#fff','fill-opacity=".35"')}
    <g clip-path="url(#lenscp)"><rect x="${lensX-16}" y="${lensY-16}" width="32" height="32" fill="#7fd08a"/>${E(lensX,lensY+4,17,9,'#3fa05a')}<path d="M${lensX-16} ${lensY+4} H${lensX+16}" stroke="#2f8a49" stroke-width=".7"/>${[-8,0,8].map(o=>`<path d="M${lensX+o} ${lensY+4} l${-o*.5} -9" stroke="#2f8a49" stroke-width=".5"/>`).join('')}
      ${C(lensX-6,lensY-6,1.2,'#fff','opacity=".8"')}${C(lensX+9,lensY+1,1,'#fff','opacity=".8"')}
      <g transform="translate(${lensX+Math.sin(u*1.4)*5} ${lensY+Math.cos(u*1.7)*2+1}) rotate(${Math.sin(u*1.4)*14}) scale(${lerp(.5,1.35,zoomLens)})">${E(0,0,7.5,6,'#E4472A')}<path d="M0 -6 V6" stroke="#2B1A17" stroke-width=".7"/>${C(0,-6.4,3.2,'#2B1A17')}${C(-3.4,-1.4,1.2,'#2B1A17')}${C(3.4,-1.4,1.2,'#2B1A17')}${C(-2.6,3,1,'#2B1A17')}${C(2.6,3,1,'#2B1A17')}<path d="M-1.6 -9 l-1.4 -3 M1.6 -9 l1.4 -3" stroke="#2B1A17" stroke-width=".6"/></g></g>
    ${C(lensX,lensY,15,'none','stroke="#5B4636" stroke-width="3.2"')}<path d="M${lensX-9} ${lensY-9} A12 12 0 0 1 ${lensX-1} ${lensY-13}" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/></g>`;
  // maceta / semilla + regadera
  const potX=270;
  const stemH=52*grow;
  const sprout=`<g filter="url(#ds)">${P(`M${potX-16} 150 L${potX-12} 132 H${potX+12} L${potX+16} 150Z`,'#c9603f')}${R(potX-18,129,36,5,'#d9724d',2)}${E(potX,131,13,3,'#5a3a26')}</g>
    ${grow>0?`<path d="M${potX} 131 Q${potX-4} ${131-stemH*.5} ${potX} ${131-stemH}" stroke="#2f9a55" stroke-width="3" fill="none" stroke-linecap="round"/>${G(potX-2,131-stemH*.45,eob(seg(u,5.0,5.8)),E(-9,0,9,4,'#4FC17F','transform="rotate(-25)"'))}${G(potX+2,131-stemH*.65,eob(seg(u,5.2,6)),E(9,0,9,4,'#4FC17F','transform="rotate(25)"'))}`:''}
    ${bloom>0?G(potX,131-stemH,bloom,Array.from({length:8},(_,i)=>E(0,-7,3.6,6.4,i%2?'#ff8fc6':'#ff6fb0',`transform="rotate(${i*45+u*10})"`)).join('')+C(0,0,4,'#FFCB47')):''}`;
  const can=water>0&&water<1?`<g transform="translate(${nx+34} ${110}) rotate(${-24*Math.sin(Math.PI*Math.min(1,water*1.2))})">${R(-9,-6,18,14,'#7fb6ff',3)}${P('M9 -2 L22 -8 L22 -5 L9 3Z','#6aa2f0')}${R(-8,-6,16,3,'#a9d2ff',1)}<path d="M-9 -3 Q-16 -8 -9 -10" stroke="#6aa2f0" stroke-width="2" fill="none"/></g>`:'';
  let drops='';if(water>.15&&water<.95){for(let i=0;i<9;i++){const q=((u*2.3+i*.11)%1);drops+=C(nx+52+q*(potX-nx-56)*.9,112+q*q*36,1.5,'#9bd0ff',`opacity="${1-q*.5}"`);}}
  // mariposas
  const bfl=(x,y,c,ph)=>{const f=Math.abs(Math.cos(u*13+ph));return `<g transform="translate(${x} ${y})">${G2(0,0,f,1,0,E(-5,-2,5,4,c)+E(5,-2,5,4,c))}${E(0,0,1,3.2,'#2B1A17')}</g>`;};
  const bfs=u>5.5?`${bfl(lerp(250,190,eo(seg(u,5.5,7))),70+Math.sin(u*3)*6,'#ffb347',0)}${bfl(lerp(290,240,eo(seg(u,5.7,7.2))),56+Math.cos(u*2.6)*6,'#ff8fc6',2)}`:'';
  const defs=`${lgrad('s6wall',[[0,'#e6f8e9'],[1,'#c4eccd']])}${lgrad('s6soil',[[0,'#8b5e3c'],[1,'#5f3f27']])}`;
  let panes='';[70,150,230,310].forEach((x,i)=>{panes+=`<g filter="url(#ds)"><path d="M${x-32} 100 V44 A32 32 0 0 1 ${x+32} 44 V100Z" fill="#fffaf0"/><path d="M${x-28} 96 V45 A28 28 0 0 1 ${x+28} 45 V96Z" fill="#bfe6ff"/><g filter="url(#b1)" opacity=".8">${leafBig(x-10,100,.7,-20+i*8,'#4fb56a','#2f8a49')}${leafBig(x+16,100,.55,25,'#6fd08a','#2f8a49')}</g><path d="M${x} 16 V100 M${x-28} 62 H${x+28} M${x-14} 26 V100 M${x+14} 26 V100" stroke="#fffaf0" stroke-width="1.6"/></g>`;});
  const shelf=`<g filter="url(#ds)">${R(20,92,90,4,'#a56f47',2)}${[0,1,2].map(i=>`${P(`M${28+i*28} 92 l2 -16 h18 l2 16Z`,'#c9603f')}${C(37+i*28,70-i*2,9,['#3aa05a','#56b56e','#2e8f57'][i])}${C(43+i*28,74,6,['#78d093','#4fc17f','#5fbf7f'][i])}`).join('')}</g>
    <g transform="translate(120 62) rotate(${Math.sin(u*1.2)*2})"><line x1="0" y1="-62" x2="0" y2="-10" stroke="#8a5a3a" stroke-width=".8"/>${P('M-10 -10 h20 l-2 14 h-16Z','#e6b46e')}<path d="M-8 4 q-8 22 -2 40 M0 4 q3 26 -3 44 M8 4 q10 20 4 38" stroke="#3aa05a" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
  const wall=`${R(-300,0,1000,148,'url(#s6wall)')}${R(-300,100,1000,48,'#a9dfb6')}${Array.from({length:60},(_,i)=>R(-300+i*16.7,100,1,48,'#fff','opacity=".25"')).join('')}${R(-300,98,1000,3,'#fffaf0')}`;
  const ground=`${R(-300,146,1000,40,'url(#s6soil)')}${R(-300,144,1000,5,'#4fb56a')}${Array.from({length:80},(_,i)=>P(`M${-300+i*12} 146 l2 -6 l2 6Z`,'#3f9f5a')).join('')}${E(150,160,90,6,'#9bd0ff','opacity=".5"')}`;
  const fgLeaves=`<g filter="url(#b2)">${leafBig(0,190,1.5,-28,'#3f9f5a','#2a7a44')}${leafBig(320,190,1.4,30,'#4fb56a','#2a7a44')}${leafBig(300,190,1,10,'#6fd08a','#2a7a44')}</g>`;
  const world=WORLD(cam,`${defs}
    ${L(cam,.5,wall+popUp(pu6(u,0),148,panes)+rays(200,10,180,80,60,7,'#fff6c8',.14,u))}
    ${L(cam,.8,popUp(pu6(u,1),148,shelf))}
    ${L(cam,1,ground+shadowE(nx,149,15)+shadowE(sx,150,22)+slime+snG+sprout+noaG+lens+can+drops+bfs+G3.svg)}
    ${L(cam,1.4,fgLeaves)}${L(cam,1.3,motes(u,36,0,320,30,170,'#fff8c8',.8,14,2))}`);
  return world+glowR(180,40,170,'#fff4b8',.2);
}
const pu6=(u,i)=>popStagger(u,i);
