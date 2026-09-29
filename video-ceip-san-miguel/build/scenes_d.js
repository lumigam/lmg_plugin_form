const paperLetter=(ch,x,y,size,rot,color,sc=1,o=1)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" opacity="${o}" filter="url(#ds)"><text x="0" y="${size*.35}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${color}" stroke="#fffaf0" stroke-width="${size*.17}" stroke-linejoin="round" paint-order="stroke" font-family="'Bricolage Grotesque',Figtree,sans-serif">${ch}</text></g>`;
const walkPose=(u,t0,t1)=>{const w=u>t0&&u<t1,ph=u*8.5,sw=w?Math.sin(ph)*22:0;return {w,ph,sw,bob:w?Math.abs(Math.sin(ph))*1.4:0};};

/* ===== ACTO 7: Biblioteca y letras ===== */
function S7(u){
  const nx=u<1.9?lerp(-24,112,eio(seg(u,.3,1.9))):112,wk=walkPose(u,.3,1.9);
  const reach=u>2.3&&u<4.7,jump=u>4.7?Math.abs(Math.sin((u-4.7)*5))*Math.exp(-(u-4.7)*.7)*7:0;
  const TG=[[106,52],[142,42],[178,52]],TC=[LIGHT.mov,LIGHT.sim,LIGHT.exp],GL=['N','O','A','b','7','a','ñ','+','r','3','m','S','?','e'];
  let lets='';
  GL.forEach((ch,i)=>{
    const t0=1.8+.13*i,q=eio((u-t0)/1.1);if(u<t0)return;
    const a=u*1.35+i*.9,ox=150+66*Math.cos(a),oy=72+26*Math.sin(a);
    let x=lerp(236,ox,q),y=lerp(102,oy,q)-22*Math.sin(Math.PI*Math.min(1,q)),o=1,sc=.9+.2*Math.sin(u*3+i);
    if(i<3){const f=eio(seg(u,3.3,4.4));x=lerp(x,TG[i][0],f);y=lerp(y,TG[i][1],f);sc=lerp(sc,1.9,f)*(1+.1*bump(u,4.4+i*.12,4.8+i*.12));}
    else{const f=seg(u,3.4,4.5);o=1-f;y-=f*30;x+=(i%2?1:-1)*f*40;}
    lets+=paperLetter(ch,x,y,i<3?14:11,Math.sin(u*2+i)*16*(i<3?1-eio(seg(u,3.3,4.4)):1),i<3?TC[i]:LC[i%6],sc,o);
  });
  const hoot=bump(u,5.0,5.9),ob=Math.sin(u*2.5)*1;
  const G3=gift(u,5.95,.9,[232,88],[nx+2,118],LIGHT.bib);
  const btn=btnLevels(3,seg(u,6.85,7.4));
  const pose=kidR({t:u,la:wk.w?30+wk.sw:(reach?160:(u>4.7?70:30)),ra:wk.w?30-wk.sw:(reach?160:(u>4.7?70:30)),lgL:wk.w?wk.sw*1.1:0,lgR:wk.w?-wk.sw*1.1:0,eyes:reach||u>4.7?(u>4.7?'happy':'wide'):'open',mouth:reach&&u<4.7?'o':(u>4.7?'open':'smile'),brow:reach&&u<4.7?1:0,btn,tilt:reach?-6:0});
  const noaG=G2(nx,147-wk.bob-jump,1.15,1.15,0,pose);
  const stack=`<g filter="url(#ds2)">${R(196,134,70,14,COL.exp,3)}${R(196,134,70,3,'#fff','opacity=".3"')}${R(202,121,58,14,COL.art,3)}${R(206,109,50,13,LIGHT.log,3)}${R(206,109,50,3,'#fff','opacity=".35"')}
    <g transform="translate(231 109)">${P('M0 0 L-24 -2 L-20 -14 L0 -10Z','#fffdf4')}${P('M0 0 L24 -2 L20 -14 L0 -10Z','#efece0')}<path d="M0 0 V-10" stroke="#c9c5b0" stroke-width=".8"/>${glowR(0,-8,20,'#fff3c4',.7*seg(u,1.6,2.2))}</g></g>`;
  const owlG=G2(231,109+ob*.4,1.2,1.2,Math.sin(u*1.6)*2.5,owl()+lid(-7,-30,7.3,COL.bib,blinkAt(u,3))+lid(7,-30,7.3,COL.bib,blinkAt(u,3))+(hoot>.05?E(0,-21.5,1.8*hoot+.4,2.8*hoot+.4,'#3a2a00'):''));
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.16,cx0:150,cx1:165,cy0:90,cy1:94},
    {t0:2.5,t1:5.0,z0:1.75,z1:1.55,cx0:150,cx1:150,cy0:78,cy1:82,punch:1,whip:1},
    {t0:5.0,t1:6.3,z0:1.3,z1:1.4,cx0:170,cx1:176,cy0:96,cy1:100,punch:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nx,cx1:nx,cy0:108,cy1:110,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u),pu=i=>popStagger(u,i);
  const defs=`${lgrad('s7wall',[[0,'#dfe9ff'],[1,'#b9cdf6']])}${lgrad('s7floor',[[0,'#6a5aa8'],[1,'#4a3f88']])}${lgrad('s7sky',[[0,'#141d5a'],[1,'#3a4fb0']])}`;
  const win=`<g filter="url(#ds2)">${C(258,50,34,'#d9a441')}${C(258,50,30,'url(#s7sky)')}${[[240,40],[270,30],[280,60],[246,66],[262,44]].map((p,i)=>star(p[0],p[1],1.5+i%2,'#fff',`opacity="${.6+.4*Math.sin(u*3+i)}"`)).join('')}${C(268,42,9,'#fff3c4')}${C(272,40,8,'#1c2b6b')}<path d="M258 16 V84 M224 50 H292" stroke="#d9a441" stroke-width="2"/></g>`;
  const wall=`${R(-300,0,1000,148,'url(#s7wall)')}${R(-300,100,1000,48,'#8aa6e6')}${Array.from({length:60},(_,i)=>R(-300+i*16.7,100,1.2,48,'#fff','opacity=".22"')).join('')}${R(-300,98,1000,3,'#fffaf0')}`;
  const stars=[0,1,2,3,4].map(i=>{const x=30+i*62,sw=Math.sin(u*1.2+i)*2,yy=28+i%2*10;return `<g transform="translate(${x+sw} 0)"><line x1="0" y1="0" x2="0" y2="${yy-4}" stroke="#7a8ac0" stroke-width=".8"/>${star(0,yy,7,'#ffd36b')}${glowR(0,yy,18,'#ffe08a',.45)}</g>`;}).join('');
  const lamp=`<g filter="url(#ds)">${R(176,60,2.6,88,'#8a6a4a')}${P('M166 62 L188 62 L184 46 L170 46Z','#ffd98a')}</g>${glowR(177,64,40,'#ffe6a8',.5)}`;
  const floor=`${R(-300,146,1000,40,'url(#s7floor)')}${Array.from({length:7},(_,i)=>R(-300,148+i*5+i*i*.3,1000,.8,'#2c2560','opacity=".3"')).join('')}${E(150,166,120,12,'#3f79f0','opacity=".8"')}${E(150,166,96,9,'#ffd98a','opacity=".8"')}${E(150,166,66,6,'#fff3d6','opacity=".8"')}`;
  const world=WORLD(cam,`${defs}${L(cam,.5,wall+popUp(pu(0),148,win+bookcase(8,22,92,98,4,15))+stars)}${L(cam,.8,popUp(pu(1),150,lamp))}${L(cam,1,floor+shadowE(nx,149,15)+shadowE(231,150,26)+stack+owlG+noaG+lets+G3.svg)}${L(cam,1.3,motes(u,34,0,320,20,170,'#dfe8ff',.7,17,2))}`);
  return world+glowR(230,80,140,'#a9c4ff',.22);
}

/* ===== ACTO 8: Lógico-matemático ===== */
function S8(u){
  const nx=u<1.8?lerp(350,268,eio(seg(u,.3,1.8))):268,wk=walkPose(u,.3,1.8);
  const cs=[LIGHT.mov,LIGHT.sim,LIGHT.exp,LIGHT.bib,LIGHT.art],BX=150,BW=18,BH=13,gy=146;
  let n=0,blocks='',labels='',cnt='';
  const toss=seg(u,4.4,5.2),done=u>=5.2,wave=done?seg(u,5.2,6.6):0;
  for(let i=0;i<5;i++)for(let j=0;j<=i;j++){
    const rx=BX+i*BW+.4,ry=gy-BH*(j+1);
    if(i===4&&j===4){
      const x=lerp(nx-6,rx,eio(toss)),y=lerp(112,ry,toss)-42*Math.sin(Math.PI*toss);
      if(u>=4.2){const bn=done?Math.max(0,Math.sin((u-5.2)*14))*Math.exp(-(u-5.2)*4)*3:0;blocks+=`<g filter="url(#ds)">${R(done?rx:x,(done?ry:y)-bn,BW-1,BH,LIGHT.log,3)}${R(done?rx:x,(done?ry:y)-bn,BW-1,3,'#fff','opacity=".35"')}</g>`;}
      continue;
    }
    const t0=.55+.3*n;n++;
    const q=seg(u,t0,t0+.42);if(q<=0)continue;
    let y=lerp(-30,ry,q*q);if(q>=1){const t=u-t0-.42;y=ry-Math.max(0,Math.sin(t*16))*Math.exp(-t*5)*3.5;}
    const wob=wave>0&&wave<1?Math.sin(wave*Math.PI*2+i*.8+j*.3)*1.6:0;
    blocks+=`<g filter="url(#ds)">${R(rx+wob,y,BW-1,BH,cs[i],3)}${R(rx+wob,y,BW-1,3,'#fff','opacity=".35"')}</g>`;
    if(q>=1&&u<t0+1.0)cnt+=paperLetter(String(i+1),64,58-(u-t0-.42)*14,15,Math.sin(u*9)*6,cs[i],1+.3*Math.sin((u-t0-.42)*9),1-seg(u,t0+.7,t0+1.0));
  }
  for(let i=0;i<5;i++){const top=i<4?u>.55+.3*(i*(i+1)/2+i)+.9:u>5.2;if(top)labels+=`<text x="${BX+i*BW+BW/2}" y="${gy-BH*(i+1)+10}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="'Bricolage Grotesque',sans-serif">${i+1}</text>`;}
  const hj=done?Math.abs(Math.sin((u-5.3)*6))*Math.exp(-(u-5.2)*.5)*14:0;
  let conf='';if(done&&u<6.9){const r=seg(u,5.2,6.9);for(let i=0;i<14;i++){const a=i*25.7;conf+=star(BX+45+Math.cos(a*.01745)*(10+50*r),80+Math.sin(a*.01745)*(8+34*r)+12*r*r*6,3.4*(1-r),LC[i%6]);}}
  const G3=gift(u,5.95,.9,[68,112],[nx+2,118],LIGHT.log);
  const btn=btnLevels(4,seg(u,6.85,7.4));
  const tw=u>4.0&&u<4.5?150:(u>=4.5&&u<5.2?120:(done?150:30));
  const pose=kidR({t:u,la:wk.w?30+wk.sw:(u>4.0?tw:30),ra:wk.w?30-wk.sw:(u>4.0?tw:30),lgL:wk.w?wk.sw*1.1:0,lgR:wk.w?-wk.sw*1.1:0,eyes:done?'happy':'open',mouth:done?'open':'smile',btn,tilt:u>4.0&&u<5.2?-4:0});
  const noaG=G2(nx,147-wk.bob-(done?Math.abs(Math.sin((u-5.2)*6))*Math.exp(-(u-5.2))*7:0),1.15,1.15,0,pose);
  const hedgeG=G2(64,148-hj,1.25,1.25,done?Math.sin(u*10)*3:0,hedge()+lid(24.4,-18,1.8,'#F6DDB0',blinkAt(u,5)));
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.15,cx0:160,cx1:176,cy0:92,cy1:96},
    {t0:2.5,t1:5.0,z0:1.9,z1:1.8,cx0:190,cx1:206,cy0:110,cy1:104,punch:1,whip:1},
    {t0:5.0,t1:6.3,z0:1.35,z1:1.5,cx0:190,cx1:196,cy0:96,cy1:98,punch:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nx,cx1:nx,cy0:108,cy1:110,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u),pu=i=>popStagger(u,i);
  const defs=`${lgrad('s8wall',[[0,'#fff4d2'],[1,'#ffe39e']])}${lgrad('s8floor',[[0,'#f6d68a'],[1,'#e2b45a']])}<pattern id="s8chk" width="30" height="12" patternUnits="userSpaceOnUse"><rect width="15" height="6" fill="#fff3c8" opacity=".7"/><rect x="15" y="6" width="15" height="6" fill="#fff3c8" opacity=".7"/></pattern>`;
  const peg=`<g filter="url(#ds)">${R(14,20,104,80,'#f0d9a8',5)}${Array.from({length:40},(_,i)=>C(20+(i%10)*10.4,26+Math.floor(i/10)*10.4,.9,'#c9a86a')).join('')}
    ${C(34,42,9,COL.mov)}${P('M56 52 L68 32 L80 52Z',COL.bib)}${R(88,34,18,18,COL.exp,3)}${star(36,76,10,COL.sim)}${P('M60 62 l7 -4 l7 4 v9 l-7 4 l-7 -4Z',COL.art)}${C(94,76,8,LIGHT.log)}</g>`;
  const scale=`<g filter="url(#ds)"><g transform="translate(200 50)"><R/>${R(-2,0,4,30,'#8a5a3a')}${R(-14,28,28,4,'#8a5a3a',2)}<g transform="rotate(${Math.sin(u*1.4)*6})"><path d="M-30 0 H30" stroke="#8a5a3a" stroke-width="2.4"/><path d="M-30 0 l-8 18 h16Z" fill="#e2b45a"/><path d="M30 0 l-8 18 h16Z" fill="#e2b45a"/></g></g></g>`.replace('<R/>','');
  let bunt='';for(let i=0;i<5;i++){const x=40+i*58,sw=Math.sin(u*2+i)*1.5;bunt+=`<g transform="translate(${x+sw} 4)">${P('M0 0 h22 l-11 24Z',cs[i])}<text x="11" y="11" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="'Bricolage Grotesque',sans-serif">${i+1}</text></g>`;}
  const wall=`${R(-300,0,1000,148,'url(#s8wall)')}${R(-300,104,1000,44,'#f7cf6a')}${R(-300,102,1000,3,'#fffaf0')}<path d="M-20 4 Q160 24 340 4" stroke="#8a5a3a" stroke-width=".8" fill="none"/>`;
  const floor=`${R(-300,146,1000,40,'url(#s8floor)')}${R(-300,146,1000,40,'url(#s8chk)')}`;
  const shelf=`<g filter="url(#ds)">${R(258,66,60,4,'#a56f47',2)}${R(266,50,14,16,COL.bib,2)}${C(292,58,8,COL.mov)}${P('M300 66 l6 -14 l6 14Z',COL.exp)}${R(258,110,60,4,'#a56f47',2)}${R(268,92,12,18,COL.sim,2)}${R(284,96,12,14,COL.art,2)}${star(308,100,8,COL.log)}</g>`;
  const world=WORLD(cam,`${defs}${L(cam,.5,wall+popUp(pu(0),148,peg+scale)+bunt)}${L(cam,.8,popUp(pu(1),150,shelf))}${L(cam,1,floor+shadowE(64,149,20)+shadowE(nx,149,15)+hedgeG+blocks+labels+cnt+conf+noaG+G3.svg)}${L(cam,1.3,motes(u,30,0,320,20,170,'#fff2c0',.7,19,2))}`);
  return world+glowR(180,50,160,'#fff2b0',.22);
}

/* ===== ACTO 9: Arte ===== */
function S9(u){
  const nx=u<1.6?lerp(-24,76,eio(seg(u,.3,1.6))):76,wk=walkPose(u,.3,1.6);
  const SP=[[144,50],[164,42],[186,52],[150,74],[172,78],[194,70]],PT=[1.9,2.55,3.2,3.85,4.5,5.15];
  const rain=eo(seg(u,5.3,6.0));
  let prints='',blobs='',cur=null;
  const hand=(c,s)=>`<g fill="${c}" transform="scale(${s})">${E(0,2,5.5,6.5,'inherit')}${E(-5,-6,1.8,4.5,'inherit')}${E(-1.7,-8,1.8,5.2,'inherit')}${E(1.7,-8,1.8,5.2,'inherit')}${E(5,-6,1.8,4.5,'inherit')}<ellipse cx="-7" cy="2" rx="1.8" ry="3.8" transform="rotate(-40 -7 2)"/></g>`;
  let throwing=false;
  SP.forEach((p,i)=>{
    const t0=PT[i],f=seg(u,t0-.5,t0);
    const hx=lerp(nx+14,p[0],eio(f)),hy=lerp(112,p[1],f)-22*Math.sin(Math.PI*f);
    if(f>0&&f<1){blobs+=C(hx,hy,3.6+Math.sin(u*22),LC[i]);throwing=true;}
    if(u>=t0){const q=seg(u,t0,t0+.4);prints+=`<g transform="translate(${p[0]} ${p[1]}) rotate(${i*17-30})">${hand(LC[i],.85*eob(q))}</g>`;const s=seg(u,t0,t0+.6);if(s<1)prints+=C(p[0],p[1],3+13*eo(s),LC[i],`opacity="${.5*(1-s)}"`);cur=LC[i];}
  });
  const nextI=PT.findIndex(t=>u<t),hc=u<5.2&&nextI>=0?LC[nextI]:(cur||LC[0]);
  const G3=gift(u,5.95,.9,[262,120],[nx+2,118],LIGHT.art);
  const btn=btnLevels(5,seg(u,6.85,7.4));
  const arm=throwing?150:(u>5.2?160:30);
  const pose=kidR({t:u,la:wk.w?30+wk.sw:(throwing?60:30),ra:wk.w?30-wk.sw:arm,lgL:wk.w?wk.sw*1.1:0,lgR:wk.w?-wk.sw*1.1:0,eyes:u>5.0?'happy':'open',mouth:u>1.9?'open':'smile',btn,hc:u>1.6?hc:null,tilt:throwing?-5:0});
  const noaG=G2(nx,147-wk.bob-(u>5.2?Math.abs(Math.sin((u-5.2)*6))*Math.exp(-(u-5.2))*7:0),1.15,1.15,0,pose);
  const chamCol=cur||COL.art;
  const cb=Math.sin(u*2.5);
  const chamFill=rain>0?'url(#s9rain)':chamCol;
  const chG=G2(252,150,1.35,1.35+cb*.015,0,cham().replaceAll(COL.art,chamFill));
  const shots=[
    {t0:0,t1:2.5,z0:1.0,z1:1.16,cx0:150,cx1:160,cy0:90,cy1:96},
    {t0:2.5,t1:5.0,z0:1.85,z1:1.75,cx0:140,cx1:170,cy0:96,cy1:100,punch:1,whip:1},
    {t0:5.0,t1:6.3,z0:1.4,z1:1.5,cx0:170,cx1:176,cy0:98,cy1:100,punch:1},
    {t0:6.3,t1:7.5,z0:3.2,z1:3.5,cx0:nx,cx1:nx,cy0:108,cy1:110,punch:1,whip:1}
  ];
  const cam=shotAt(shots,u),pu=i=>popStagger(u,i);
  const defs=`${lgrad('s9wall',[[0,'#fff0f6'],[1,'#ffd6e8']])}${lgrad('s9floor',[[0,'#f4bfd8'],[1,'#dc94b8']])}<linearGradient id="s9rain" x1="0" y1="0" x2="1" y2="0">${LC.map((c,i)=>`<stop offset="${i/5}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  let bricks='';for(let r=0;r<10;r++)for(let c=0;c<40;c++){bricks+=R(-300+c*24+(r%2)*12,r*10.4,22,9,'#fff','opacity=".28"',1.4);}
  const wall=`${R(-300,0,1000,148,'url(#s9wall)')}${bricks}${R(-300,146,1000,3,'#d98aae')}`;
  const draws=`<g filter="url(#ds)"><path d="M-20 26 Q160 44 340 26" stroke="#8a5a3a" stroke-width=".8" fill="none"/>${[0,1,2,3,4,5,6].map(i=>{const x=8+i*46,y=30+Math.sin(i*.9)*2+ (i*i%3),sw=Math.sin(u*1.6+i)*2;return `<g transform="translate(${x} ${y}) rotate(${sw} 8 0)">${R(0,0,16,20,['#fff','#ffe08a','#bfe6ff','#ffc9d8','#d9ffc9','#e6d9ff','#fff'][i],1.5)}${C(8,9,4,LC[i%6])}<path d="M3 15 q5 -4 10 0" stroke="${LC[(i+2)%6]}" stroke-width="1.4" fill="none"/></g>`;}).join('')}</g>`;
  const easel=`<g filter="url(#ds2)"><line x1="132" y1="98" x2="112" y2="150" stroke="#8a5a3c" stroke-width="4"/><line x1="196" y1="98" x2="216" y2="150" stroke="#8a5a3c" stroke-width="4"/><line x1="164" y1="98" x2="164" y2="150" stroke="#8a5a3c" stroke-width="3"/>${R(122,22,84,80,'#fffdf8',3,'stroke="#8a5a3c" stroke-width="3"')}${R(118,100,92,5,'#a56f47',2)}</g>`;
  let pots='';LC.forEach((c,i)=>{pots+=`<g><rect x="${228+i*0}" y="0" width="0" height="0"/></g>`;});
  const table=`<g filter="url(#ds)">${R(224,116,84,6,'#a56f47',3)}${R(230,122,5,26,'#8a5a3a')}${R(298,122,5,26,'#8a5a3a')}${LC.map((c,i)=>`${R(230+i*13,106,10,10,c,2)}${R(231+i*13,106,8,3,'#fff','opacity=".45"')}`).join('')}${R(230,110,0,0,'#000')}</g>`;
  const cloth=`${R(-300,146,1000,40,'url(#s9floor)')}${[[40,160,10,'#ff8fc6'],[100,168,7,'#8fb4ff'],[200,162,9,'#ffe07a'],[268,170,8,'#7fe0a3'],[150,172,6,'#b59bff'],[310,160,7,'#ff9a80']].map(p=>E(p[0],p[1],p[2]*1.6,p[2]*.5,p[3],'opacity=".7"')).join('')}`;
  const win=`<g filter="url(#ds)">${R(236,30,64,62,'#fffaf0',3)}${R(240,34,56,54,'#bfe6ff',2)}${paperCloud(262+Math.sin(u*.6)*3,52,.42,'#fff','#e6f3ff')}<path d="M268 34 V88 M240 61 H296" stroke="#fffaf0" stroke-width="2"/></g>`;
  const world=WORLD(cam,`${defs}${L(cam,.5,wall+popUp(pu(0),148,win+draws))}${L(cam,.8,popUp(pu(1),150,table))}${L(cam,1,cloth+popUp(pu(2),150,easel)+shadowE(nx,149,15)+shadowE(252,150,24)+prints+chG+noaG+blobs+G3.svg)}${L(cam,1.3,motes(u,30,0,320,20,170,'#ffe0f0',.7,21,2))}`);
  return world+glowR(170,60,160,'#ffd0e8',.22);
}
