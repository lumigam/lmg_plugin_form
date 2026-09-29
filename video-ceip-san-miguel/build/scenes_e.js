/* ===== ACTO 10: La última página ===== */
const heart=(x,y,s,c,o=1,r=0)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${o}"><path d="M0 4 C-9 -2 -7 -9 -3 -9 C-1 -9 0 -7 0 -6 C0 -7 1 -9 3 -9 C7 -9 9 -2 0 4Z" fill="${c}"/></g>`;
function S10(u){
  const SX=200,SY=150,SS=1.6;
  const dayT=eo(seg(u,2.4,5.0)),outline=eo(seg(u,1.6,3.0)),fill=eob(seg(u,2.6,3.6));
  // Noa
  const nx0=110,run=eio(seg(u,5.75,7.4)),amp=Math.sin(Math.PI*seg(u,5.75,7.4)),nx=lerp(nx0,184,run);
  const running=u>5.75&&u<7.4,ph=u*12;
  const hug=seg(u,7.4,7.8),hugging=u>=7.4&&u<9.5;
  const hy=hugging?-Math.abs(Math.sin((u-7.4)*3))*1.2*Math.exp(-(u-7.4)*.4):0;
  const pose=kidR({t:u,la:running?100+Math.sin(ph)*6:(hugging?lerp(100,42,eo(hug)):30),ra:running?100-Math.sin(ph)*6:(hugging?lerp(100,42,eo(hug)):30),lgL:running?Math.sin(ph)*30*amp:0,lgR:running?-Math.sin(ph)*30*amp:0,eyes:hugging?'closed':(u>1.5?'happy':'open'),mouth:'open',btn:[1,1,1,1,1,1].map((v,i)=>v*(u<2.2?1:1-seg(u,2.2,2.9)*.0)),tilt:hugging?lerp(0,-7,eo(hug)):0});
  const noaG=G2(hugging?184:nx,147+hy-(running?amp*Math.abs(Math.sin(ph))*2.5:0),1.15,1.15,0,pose);
  // seño
  const sIn=eob(seg(u,4.8,5.6)),open=seg(u,5.6,6.4);
  const sPose=senR({t:u,la:u<5.6?(45+Math.sin(u*9)*22):(hugging?lerp(100,20,eo(hug)):100),ra:u<5.6?32:(hugging?lerp(100,20,eo(hug)):100),eyes:hugging?'closed':'happy',mouth:'open',glow:1,tilt:hugging?6:0});
  const kneel=hugging?eo(seg(u,7.0,7.5)):eo(open)*.0;
  const senG=sIn>0?G2(SX,SY-1-(1-sIn)*-4,.95*sIn,.95*sIn*(1-kneel*.14),hugging?-3:0,sPose):'';
  // Migui
  const mp=seg(u,4.2,6.2),mgx=hugging||u>7.4?lerp(150,190,eio(seg(u,7.4,9.5)))+Math.sin(u*2)*10:lerp(340,150,eio(mp)),mgy=hugging||u>7.4?40+Math.sin(u*3)*6-seg(u,7.4,9.5)*10:lerp(20,58,eio(mp))+Math.sin(u*4)*4;
  const migG=u>4.2?G2(mgx,mgy,.8,.8,-8,flyR(false,Math.sin(u*17)*.75+.25,{eyes:'happy'})):'';
  // luces
  const KX=[[104,74],[136,54],[170,42],[232,42],[266,54],[298,74]];
  let orbs='';
  KEYS.forEach((k,i)=>{
    const bt0=.55+.16*i,q=eio(seg(u,bt0,bt0+1.1)),by=147+1.15*(-25.4+i*2.55);
    let x=lerp(nx0,KX[i][0],q),y=lerp(by,KX[i][1],q)-18*Math.sin(Math.PI*q);
    const dv=eio(seg(u,3.0+.22*i,3.8+.22*i)),wx=SX+SS*[-46,-30,-14,14,30,46][i],wy=150+SS*(-15);
    x=lerp(x,wx,dv);y=lerp(y,wy,dv);
    const a=1-seg(u,3.8+.22*i,4.1+.22*i);
    if(u>bt0&&a>0){const bob=q>=1&&dv<=0?Math.sin(u*3+i)*2:0;orbs+=`<g opacity="${a}">${glowR(x,y+bob,14,LIGHT[k],.9)}${C(x,y+bob,3.6,'#fff')}${star(x,y+bob-6,3,LIGHT[k])}</g>`;}
  });
  // fondo
  const sky=`${lgrad('s10s',[[0,mixc('#171a4d','#79c2ff',dayT)],[.6,mixc('#4a3fc0','#cdeaff',dayT)],[1,mixc('#7a63d8','#fff0cf',dayT)]])}<rect x="-400" y="-200" width="1400" height="520" fill="url(#s10s)"/>`;
  const stars=[[30,20],[90,50],[150,14],[230,30],[290,12],[350,44],[60,84]].map((p,i)=>star(p[0],p[1],1.8,'#fff',`opacity="${(1-dayT)*(.6+.4*Math.sin(u*3+i))}"`)).join('');
  const sun=glowR(300,60,120,'#fff3c4',.9*dayT)+C(300,60,16,'#fff8dc','opacity="'+dayT+'"');
  const clouds=op(dayT,paperCloud(70+u*2,34,1.1,'#fff','#e9f4ff')+paperCloud(210+u*1.6,22,.9,'#fff','#f6eaff')+paperCloud(340+u*2.2,44,1.2,'#fff','#e6f2ff'));
  const hillsL=hills(2,-300,800,132,20,mixc('#3a3a8a','#6dbb8a',dayT))+hills(6,-300,800,142,12,mixc('#2f2f78','#53a877',dayT));
  const ground=`${R(-400,146,1200,60,mixc('#3a3a8a','#7fc783',dayT))}${R(-400,146,1200,4,mixc('#5a52b0','#a4dda0',dayT))}${R(-400,158,1200,60,mixc('#332f7a','#e9c9a0',dayT),'opacity=".9"')}${Array.from({length:14},(_,i)=>R(-300+i*60+ (i%2)*10,162+(i%3)*6,30,3,'#fff','opacity=".2"')).join('')}`;
  const trees=(x,f)=>`<g transform="translate(${x} 150) scale(${f})" filter="url(#ds)"><rect x="-4" y="-46" width="8" height="46" fill="#7a5238"/>${C(0,-58,26,mixc('#2a2a70','#4a9a5c',dayT))}${C(-16,-46,16,mixc('#2f2f78','#5fb56f',dayT))}${C(16,-48,17,mixc('#2f2f78','#5fb56f',dayT))}</g>`;
  const fence=`<g opacity="${dayT}">${Array.from({length:22},(_,i)=>{const x=-120+i*16;return P(`M${x} 152 V132 l4 -5 l4 5 V152Z`,LC[i%6]);}).join('')}${R(-124,140,360,2.4,'#fffaf0')}</g>`;
  // colegio
  const wl=KEYS.map((k,i)=>eo(seg(u,3.2+.22*i,3.9+.22*i)));
  const peekT=i=>eob(seg(u,8.7+.16*i,9.3+.16*i));
  const pk=[frogR(u),cat(),snail(),owl()+lid(-7,-30,7.3,COL.bib,blinkAt(u,3))+lid(7,-30,7.3,COL.bib,blinkAt(u,3)),hedge(),cham()];
  const peek=pk.map((s,i)=>{const t=peekT(i);return t>0?G2(0,22,.33*t,.33*t,Math.sin(u*5+i)*7*t,s):'';});
  const sch=fill>0?`<g opacity="${cl(fill*1.4)}" transform="translate(0 ${(1-fill)*10})">${school(SX,SY,{u,s:SS,winLit:wl,peek,doorOpen:eo(seg(u,4.6,5.2))*(u<9.5?1:1),trees:false})}</g>`:'';
  // dibujo de líneas
  const ln=(d,p,w=1.6)=>`<path d="${d}" pathLength="1" stroke="#fffaf0" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="${1-p}"/>`;
  const S=(x,y)=>`${SX+x*SS} ${SY+y*SS}`;
  const outlineSVG=outline>0&&fill<.9?`<g opacity="${1-fill}" style="mix-blend-mode:screen">${ln(`M${S(-62,0)} L${S(-62,-56)} L${S(62,-56)} L${S(62,0)}Z`,outline)}${ln(`M${S(-66,-56)} L${S(0,-84)} L${S(66,-56)}`,eo(seg(u,1.9,3.0)))}${ln(`M${S(-84,0)} V${S(0,-32).split(' ')[1]} H${S(-58,0).split(' ')[0]}`,outline)}${ln(`M${S(58,0)} V${S(0,-32).split(' ')[1]} H${S(84,0).split(' ')[0]} V${S(0,0).split(' ')[1]}`,outline)}${ln(`M${S(-9,0)} V${S(0,-22).split(' ')[1]} A${9*SS} ${9*SS} 0 0 1 ${S(9,-22)} V${S(0,0).split(' ')[1]}`,eo(seg(u,2.2,3.2)))}</g>`:'';
  // corazones
  let hearts='';if(u>7.5&&u<11.5){for(let i=0;i<12;i++){const q=seg(u,7.6+i*.14,10+i*.14);if(q>0&&q<1){hearts+=heart(184+Math.sin(i*2.3+q*3)*34,124-q*70,.9+.5*Math.sin(i),LC[i%6],Math.sin(Math.PI*q),Math.sin(i+q*4)*20);}}}
  const hugGlow=hugging?glowR(190,110,80,'#ffe3b0',.55*eo(hug)):'';
  // niños (fuera de las ventanas para que se vean los guardianes)
  const kid=(x0,x1,t0,K,seed,jumpy)=>{const p=eio(seg(u,t0,t0+.8)),x=lerp(x0,x1,p),walking=p<1,ph2=u*9,jmp=!walking&&jumpy?Math.abs(Math.sin((u-t0)*4))*5:0;return G2(x,148-jmp-(walking?Math.abs(Math.sin(ph2))*1.6:0),1.0,1.0,0,kidR({...K,t:u,la:walking?30+Math.sin(ph2)*24:(jumpy?150:30),ra:walking?30-Math.sin(ph2)*24:(jumpy?150:110+Math.sin(u*9)*30),lgL:walking?Math.sin(ph2)*24:0,lgR:walking?-Math.sin(ph2)*24:0,eyes:'happy',mouth:'open',seed}));};
  const kA=u>8.4?kid(-30,52,8.4,KIDS[0],2,true):'',kC=u>8.6?kid(-40,88,8.6,KIDS[2],4,false):'',kB=u>8.6?kid(380,326,8.6,KIDS[1],3,false):'',kD=u>8.8?kid(390,352,8.8,KIDS[3],5,true):'';
  const shots=[
    {t0:0,t1:2.2,z0:3.4,z1:3.0,cx0:nx0,cx1:nx0+4,cy0:112,cy1:112},
    {t0:2.2,t1:4.6,z0:1.9,z1:1.2,cx0:nx0+20,cx1:190,cy0:100,cy1:98,punch:1,whip:1},
    {t0:4.6,t1:5.75,z0:1.2,z1:1.3,cx0:196,cx1:190,cy0:98,cy1:102,punch:1},
    {t0:5.75,t1:7.4,z0:1.55,z1:2.0,cx0:130,cx1:188,cy0:108,cy1:106,punch:1,whip:1},
    {t0:7.4,t1:8.6,z0:2.6,z1:3.0,cx0:190,cx1:190,cy0:108,cy1:106},
    {t0:8.6,t1:11.8,z0:3.0,z1:.95,cx0:190,cx1:200,cy0:106,cy1:92,ease:eio},
    {t0:11.8,t1:17.5,z0:.95,z1:1.0,cx0:200,cx1:200,cy0:92,cy1:92}
  ];
  const cam=shotAt(shots,u);
  const world=WORLD(cam,`${L(cam,.05,sky)}${L(cam,.08,stars+sun)}${L(cam,.2,clouds)}${L(cam,.5,hillsL)}${L(cam,.8,fence)}${L(cam,.9,trees(-10,1.15)+trees(330,1.2))}${L(cam,1,ground+outlineSVG+sch+shadowE(nx,150,15)+shadowE(SX,151,20)+kA+kB+kC+kD+senG+noaG+orbs+hugGlow+migG+hearts)}${L(cam,1.3,motes(u,36,-100,500,20,170,'#fff4d0',.8,31,2.5))}`);
  return world+glowR(200,90,180,'#ffe7b8',.16*dayT);
}
