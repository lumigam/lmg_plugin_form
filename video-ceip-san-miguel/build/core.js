/* ===== Motor: cámara, capas con parallax, transiciones, textos ===== */
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const eo=t=>1-Math.pow(1-cl(t),3);
const ei=t=>{t=cl(t);return t*t*t};
const eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
const eob=t=>{t=cl(t);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const eoe=t=>{t=cl(t);return t===0||t===1?t:Math.pow(2,-9*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1};
const seg=(u,a,b)=>cl((u-a)/(b-a));
const bump=(u,a,b)=>Math.sin(Math.PI*seg(u,a,b));
const G2=(x,y,sx,sy,rot,inner)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} ${sy})">${inner}</g>`;
const op=(o,inner)=>`<g opacity="${cl(o)}">${inner}</g>`;
const star=(x,y,r,f,extra='')=>`<path d="M${x} ${y-r} L${x+r*.28} ${y-r*.28} L${x+r} ${y} L${x+r*.28} ${y+r*.28} L${x} ${y+r} L${x-r*.28} ${y+r*.28} L${x-r} ${y} L${x-r*.28} ${y-r*.28}Z" fill="${f}" ${extra}/>`;
const P=(d,f,extra='')=>`<path d="${d}" fill="${f}" ${extra}/>`;
const LC=Object.values(LIGHT);
const KEYS=['mov','sim','exp','bib','log','art'];
const rnd=(seed)=>{let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};};

/* ---------- cámara ---------- */
function shotAt(shots,u){
  let s=shots[shots.length-1];for(const k of shots){if(u<k.t1){s=k;break;}}
  const p=cl((u-s.t0)/(s.t1-s.t0)),e=(s.ease||eio)(p),idx=shots.indexOf(s);
  let z=lerp(s.z0,s.z1??s.z0,e),cx=lerp(s.cx0,s.cx1??s.cx0,e),cy=lerp(s.cy0,s.cy1??s.cy0,e),rot=lerp(s.r0||0,s.r1??s.r0??0,e);
  const since=u-s.t0;
  if(s.punch&&since<.4)z*=1+.05*Math.exp(-since*10);
  z*=1+Math.sin(u*.8)*.004;cx+=Math.sin(u*.9+1)*.5/z;cy+=Math.cos(u*.7)*.4/z;
  return {z,cx,cy,rot,idx,p,since,whip:s.whip?Math.max(0,1-since/.28):0,t0:s.t0};
}
const L=(cam,p,inner,extra='')=>{
  const ecx=160+(cam.cx-160)*p,ecy=90+(cam.cy-90)*p,zl=1+(cam.z-1)*(.55+.45*Math.min(p,1.2));
  return `<g transform="translate(160 90) scale(${zl}) translate(${-ecx} ${-ecy})" ${extra}>${inner}</g>`;
};
const popUp=(sc,gy,inner)=>`<g transform="translate(0 ${gy}) scale(1 ${Math.max(.001,sc)}) translate(0 ${-gy})">${inner}</g>`;
const WORLD=(cam,inner)=>{
  const w=cam.whip>0?`<filter id="whip" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(cam.whip*14).toFixed(2)} 0"/></filter>`:'';
  return `${w}<g ${cam.whip>0?'filter="url(#whip)"':''}><g transform="rotate(${cam.rot} 160 90)">${inner}</g></g>`;
};

/* ---------- efectos comunes ---------- */
const DEFS=`<defs>
<pattern id="gingham" width="6" height="6" patternUnits="userSpaceOnUse"><rect x="3" y="0" width="3" height="3" fill="#fff"/><rect x="0" y="3" width="3" height="3" fill="#fff"/></pattern>
<filter id="ds" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.2" flood-color="#1b1a40" flood-opacity=".3"/></filter>
<filter id="ds2" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="2.6" stdDeviation="2.2" flood-color="#1b1a40" flood-opacity=".34"/></filter>
<filter id="b1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".7"/></filter>
<filter id="b2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.7"/></filter>
<filter id="b3" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.4"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .18  0 0 0 0 .14  0 0 0 0 .22  0 0 0 .55 -.2"/></filter>
<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".35" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".78"><stop offset=".55" stop-color="#1a1240" stop-opacity="0"/><stop offset="1" stop-color="#1a1240" stop-opacity=".5"/></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".6"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
</defs>`;
const glowR=(x,y,r,c,o=1)=>{const id='gl'+c.replace('#','');return `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})" opacity="${o}" style="mix-blend-mode:screen"/>`;};
const motes=(t,n,x0,x1,y0,y1,color,size=.8,seed=1,rise=4)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const bx=lerp(x0,x1,r()),by=lerp(y0,y1,r()),ph=r()*6,sp=.5+r();const x=bx+Math.sin(t*.5*sp+ph)*4,y=by-((t*rise*sp+ph*9)%(y1-y0));const yy=y<y0?y+(y1-y0):y;const a=.3+.5*Math.abs(Math.sin(t*sp+ph));s+=`<circle cx="${x.toFixed(2)}" cy="${yy.toFixed(2)}" r="${(size*(.6+r()*.8)).toFixed(2)}" fill="${color}" opacity="${a.toFixed(2)}"/>`;}return `<g style="mix-blend-mode:screen">${s}</g>`;};
const rays=(x,y,len,ang,spread,n,color,o,t)=>{let s='';for(let i=0;i<n;i++){const a=(ang+(i/(n-1)-.5)*spread+Math.sin(t*.4+i)*1.5)*Math.PI/180,w=2.5+((i*7)%5);const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len,nx=-Math.sin(a)*w,ny=Math.cos(a)*w;s+=`<polygon points="${x},${y} ${x2+nx*3},${y2+ny*3} ${x2-nx*3},${y2-ny*3}" fill="${color}" opacity="${(o*(.5+.5*Math.sin(t*.7+i*1.7))).toFixed(3)}"/>`;}return `<g style="mix-blend-mode:screen">${s}</g>`;};

/* ---------- textos ---------- */
let _mc=null;const measure=(txt,fs)=>{_mc=_mc||document.createElement('canvas').getContext('2d');_mc.font=`700 ${fs}px Figtree, sans-serif`;return _mc.measureText(txt).width;};
function parseHL(str){const out=[];str.split(/(\*\*[^*]+\*\*)/).forEach(s=>{if(!s)return;out.push(s.startsWith('**')?[s.slice(2,-2),1]:[s,0]);});return out;}
function captionSVG(txt,al,accent){
  const fs=8.7,runs=parseHL(txt),plain=runs.map(r=>r[0]).join(''),w=measure(plain,fs)+26,h=17.5,x=160-w/2,y=157+(1-al)*4;
  let cx=0;const spans=runs.map(([s,hl])=>`<tspan fill="${hl?accent:'#1e2140'}" font-weight="${hl?800:700}">${s.replace(/ /g,' ')}</tspan>`).join('');
  return `<g opacity="${al}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="#000" opacity=".16" transform="translate(0 1.6)" filter="url(#b1)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="#fffdf8"/><text x="160" y="${y+11.4}" text-anchor="middle" font-size="${fs}" font-family="Figtree, sans-serif">${spans}</text></g>`;
}
function chipSVG(label,color,ink,a){
  const fs=7.4,w=label.length*4.55+22,x=lerp(-w-10,8,eo(a));
  return `<g transform="translate(${x} 8)"><rect x="0" y="1.4" width="${w}" height="15" rx="7.5" fill="#000" opacity=".2" filter="url(#b1)"/><rect width="${w}" height="15" rx="7.5" fill="${color}"/><text x="11" y="10.2" font-size="${fs}" font-weight="800" fill="${ink}" font-family="'Bricolage Grotesque',Figtree,sans-serif">${label}</text></g>`;
}
function titleCard(l1,l2,color,ink,u){
  const t0=.75,dur=2.15,p=(u-t0)/dur;if(p<=0||p>=1.02)return '';
  _mc=_mc||document.createElement('canvas').getContext('2d');
  _mc.font='800 100px "Bricolage Grotesque", sans-serif';
  const ch=[...l1],w100=ch.map(c=>_mc.measureText(c).width),tot100=w100.reduce((a,b)=>a+b,0);
  const size=Math.min(30,262/(tot100/100)),ws=w100.map(w=>w*size/100),wTot=ws.reduce((a,b)=>a+b,0);
  const out=eo(seg(p,.82,1));
  let letters='',acc=160-wTot/2;
  ch.forEach((c,i)=>{const cx=acc+ws[i]/2;acc+=ws[i];const d=seg(p,.02+i*.014,.2+i*.014),sc=eob(d),jy=(1-eob(d))*-24;
    letters+=`<g transform="translate(${cx} ${86+jy}) rotate(${(1-d)*(i%2?16:-16)}) scale(${sc})"><text x="0" y="0" text-anchor="middle" font-size="${size}" font-weight="800" fill="${ink}" font-family="'Bricolage Grotesque',Figtree,sans-serif">${c}</text></g>`;});
  const bw=wTot+30,bh=size*1.55+(l2?11:0),by=86-size*.98;
  return `<g opacity="${1-out}" transform="translate(0 ${-out*8})"><g transform="translate(160 ${by+bh/2}) scale(${eob(seg(p,0,.14))} 1) translate(-160 ${-(by+bh/2)})"><rect x="${160-bw/2}" y="${by+2.4}" width="${bw}" height="${bh}" rx="6" fill="#000" opacity=".25" filter="url(#b1)"/><rect x="${160-bw/2}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${color}" transform="rotate(-1.2 160 86)"/></g>${letters}${l2?`<text x="160" y="${86+size*.66}" text-anchor="middle" font-size="${size*.36}" font-weight="700" fill="${ink}" opacity="${eo(seg(p,.25,.4))}" font-family="Figtree,sans-serif" letter-spacing=".6">${l2}</text>`:''}</g>`;
}
