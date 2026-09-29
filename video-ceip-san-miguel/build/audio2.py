import numpy as np, wave
SR=44100; T=82.5; N=int(SR*T)
dry=np.zeros(N); wet=np.zeros(N)   # wet = va a la reverb
rng=np.random.default_rng(11)
def add(buf,t,sig,g=1.0):
    i=int(t*SR)
    if i>=N or i<0: return
    j=min(N,i+len(sig)); buf[i:j]+=sig[:j-i]*g
def tt(d): return np.arange(int(SR*d))/SR
def env_ar(d,a=.005,r=.05):
    t=tt(d); e=np.minimum(1,t/a)*np.minimum(1,(d-t)/r); return np.clip(e,0,1)
def piano(f,d=2.6):
    t=tt(d); s=np.zeros_like(t)
    for k in range(1,11):
        s+=np.sin(2*np.pi*f*k*t*(1+.0003*k*k)+k)*np.exp(-t*(1.3+k*1.25))/k**1.25
    h=noise(.02)*np.exp(-tt(.02)*200); s[:len(h)]+=h*.15
    return s*(1-np.exp(-t/.003))*.55
def bell(f,d=1.8):
    t=tt(d); s=np.sin(2*np.pi*f*t)*np.exp(-t*3.0)+.4*np.sin(2*np.pi*f*2*t)*np.exp(-t*5)+.18*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*8)+.1*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*12)
    return s*(1-np.exp(-t/.002))*.5
def pluck(f,d=1.3,br=1.0):
    t=tt(d); s=np.zeros_like(t)
    for k in range(1,9): s+=np.sin(2*np.pi*f*k*t+k)*np.exp(-t*(3+k*2.4*br))/k**1.15
    return s*np.minimum(1,t/.004)*.5
def padn(f,d):
    t=tt(d+1.2); s=np.zeros_like(t)
    for dt in (-.004,0,.004):
        for k in range(1,6): s+=np.sin(2*np.pi*f*(1+dt)*k*t+k*.7)/k**1.4
    e=np.minimum(1,t/.9)*np.clip((d+1.2-t)/1.2,0,1); return s*e*.18
def bass(f,d=.9):
    t=tt(d); return (np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*2*t))*np.exp(-t*3.2)*np.minimum(1,t/.006)*.7
def noise(d,lp=1):
    n=rng.standard_normal(int(SR*d)); return np.convolve(n,np.ones(lp)/lp,'same') if lp>1 else n
def sparkle(buf,t,n=5,g=.16,base=1046.5,step=.055):
    sc=[1,1.122,1.26,1.498,1.68,2.0,2.245,2.52]
    for i in range(n): add(buf,t+i*step,bell(base*sc[i%8],1.0),g)
def whoosh(t,d=.9,g=.22,lp=14):
    x=tt(d); env=np.sin(np.pi*np.clip(x/d,0,1))**2
    add(dry,t,noise(d,lp)*env,g); add(wet,t,noise(d,lp)*env,g*.4)
def boing(t,g=.28):
    d=.4;x=tt(d);f=180+320*np.sin(np.pi*np.clip(x/d,0,1)*.9)*np.exp(-x*3)+40*np.sin(2*np.pi*22*x)
    add(dry,t,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*7)*np.minimum(1,x/.005),g)
def toc(t,f=200,g=.4):
    d=.12;x=tt(d);add(dry,t,(np.sin(2*np.pi*f*x)*.7+noise(d,4)*.5)*np.exp(-x*45),g)
def pop(t,g=.3,f=700):
    d=.12;x=tt(d);add(dry,t,np.sin(2*np.pi*(f+900*np.exp(-x*40))*x)*np.exp(-x*32),g)
def step(t,g=.12):
    d=.09;x=tt(d);add(dry,t,noise(d,9)*np.exp(-x*50)*g)
def plop(t,g=.32):
    d=.22;x=tt(d);f=1000*np.exp(-x*9)+250;add(dry,t,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*16),g)
def splat(t,g=.3):
    d=.3;x=tt(d);f=500*np.exp(-x*10)+120;add(dry,t,(np.sin(2*np.pi*np.cumsum(f)/SR)*.6+noise(d,6)*.8)*np.exp(-x*14),g)
def riser(t,d,g=.2,f0=300,f1=2400):
    x=tt(d);f=np.linspace(f0,f1,len(x))**1.0;s=np.sin(2*np.pi*np.cumsum(f)/SR)*(x/d)**2
    s+=noise(d,10)*(x/d)**2*.5;add(wet,t,s,g);add(dry,t,s,g*.4)

HZ={'A2':110.0,'C3':130.81,'D3':146.83,'E3':164.81,'F2':87.31,'F3':174.61,'G2':98.0,'G3':196.0,'A3':220.0,'B3':246.94,'C4':261.63,'E4':329.63,'G4':392.0,'F4':349.23,'A4':440.0,
    'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.26,'F5':698.46,'G5':783.99,'A5':880.0,'B5':987.77,'C6':1046.5,'D6':1174.66,'E6':1318.51,'G6':1567.98,'C7':2093.0,'A6':1760.0}
ARP={'C':['C3','G3','C4','E4','G4','E4','C4','G3'],'G':['G2','D3','G3','B3','D4' if False else 'B3','B3','G3','D3'],'Am':['A2','E3','A3','C4','E4','C4','A3','E3'],'F':['F2','C3','F3','A3','C4','A3','F3','C3']}
ARP['G']=['G2','D3','G3','B3','G4','B3','G3','D3']
ROOT={'C':130.81,'G':98.0,'Am':110.0,'F':87.31}
TRI={'C':['C3','E3','G3'],'G':['G2','B3','D3'],'Am':['A2','C4','E3'],'F':['F2','A3','C3']}
PADN={'C':[130.81,196.0,261.63,329.63],'G':[98.0,196.0,246.94,293.66],'Am':[110.0,220.0,261.63,329.63],'F':[87.31,174.61,220.0,261.63]}
STRUM={'C':[261.63,329.63,392.0,523.25],'G':[196.0,246.94,293.66,392.0],'Am':[220.0,261.63,329.63,440.0],'F':[174.61,220.0,261.63,349.23]}
THEME=[[('E5',1),('G5',1),('C6',1),('G5',1)],[('B5',1),('A5',1),('G5',1),('D5',1)],[('C6',1),('B5',1),('A5',1),('E5',1)],[('F5',1),('A5',1),('G5',2)],
       [('E5',1),('G5',1),('C6',1),('E6',1)],[('D6',1),('B5',1),('G5',1),('B5',1)],[('A5',1),('F5',1),('A5',1),('C6',1)],[('D6',2),('C6',2)]]
BPM=96; beat=60/BPM; bar=beat*4; eighth=beat/2
def chord(b):
    if b>=26: return {26:'C',27:'G',28:'Am',29:'F',30:'G'}.get(b,'C')
    return ['C','G','Am','F'][b%4]
def strum(t,notes,up=False,g=.5,buf=None):
    ns=notes[::-1] if up else notes
    for i,f in enumerate(ns): add(dry if buf is None else buf,t+i*.011,pluck(f,1.1),g*(.8 if up else 1))
def vol(t):
    if t<7.5: return .6+.4*(t/7.5)
    if t<20: return .85+.15*np.clip((t-15)/5,0,1)
    if t<65: return 1.0
    if t<72.4: return .85
    if t<77.5: return 1.12
    return 1.0
nb=int(T/bar)+1
for b in range(nb):
    t0=b*bar; ch=chord(b)
    if t0>=T: break
    if b<3:   # S1 piano tierno
        for i,n in enumerate(ARP[ch]):
            if (b==0 and i not in (0,3,5)) : continue
            add(dry,t0+i*eighth,piano(HZ[n],2.2),.26*vol(t0)); add(wet,t0+i*eighth,piano(HZ[n],2.2),.14)
        if b>=1:
            for j,(n,d) in enumerate(THEME[b-1][:2]): add(wet,t0+j*beat,piano(HZ[n],2.4),.22); add(dry,t0+j*beat,piano(HZ[n],2.4),.16)
    elif b<6:  # S2 pad + piano + celesta
        for i,n in enumerate(ARP[ch]): add(dry,t0+i*eighth,piano(HZ[n],2.0),.22*vol(t0));add(wet,t0+i*eighth,piano(HZ[n],2.0),.1)
        for f in PADN[ch]: add(wet,t0,padn(f,bar),.55)
        pos=0
        for (n,d) in THEME[(b-3)%8]:
            add(wet,t0+pos*beat,bell(HZ[n],1.6),.26);add(dry,t0+pos*beat,bell(HZ[n],1.6),.1);pos+=d
    elif b<8:  # S3 crescendo
        for i,n in enumerate(ARP[ch]): add(dry,t0+i*eighth,piano(HZ[n],1.6),.28);add(wet,t0+i*eighth,pluck(HZ[n]*2,.8),.18)
        for f in PADN[ch]: add(wet,t0,padn(f,bar),.7)
        for i in range(8): add(wet,t0+i*eighth,bell(HZ[['C5','E5','G5','C6','E6','G6','C7','G6'][i]]*(1.0),1.0),.16*(i+1+ (b-6)*8)/16)
    elif b<26:  # ambientes: ukelele + campanas + bajo + percusión
        for i,(k,v) in enumerate([('d',1),('',0),('d',.7),('u',.6),('',0),('u',.6),('d',.8),('u',.55)]):
            if k: strum(t0+i*eighth,STRUM[ch],up=(k=='u'),g=.38*v)
        pos=0
        for (n,d) in THEME[b%8]:
            add(dry,t0+pos*beat,bell(HZ[n],1.4),.3);add(wet,t0+pos*beat,bell(HZ[n],1.4),.22);add(dry,t0+pos*beat,pluck(HZ[n],.7),.14);pos+=d
        for kk in (0,2): add(dry,t0+kk*beat,bass(ROOT[ch]),.55)
        add(dry,t0+3.5*beat,bass(ROOT[ch]*1.5,.4),.3)
        for i in range(8): add(dry,t0+i*eighth,noise(.05,3)*np.exp(-tt(.05)*60),.05 if i%2==0 else .085)
        for kk in (1,3): add(dry,t0+kk*beat,(noise(.08,8)*.6+np.sin(2*np.pi*1800*tt(.08))*.3)*np.exp(-tt(.08)*45),.1)
        x=tt(.18);kick=np.sin(2*np.pi*(58+50*np.exp(-x*30))*x)*np.exp(-x*22)
        add(dry,t0,kick,.42);add(dry,t0+2*beat,kick,.34)
        for f in PADN[ch][:2]: add(wet,t0,padn(f,bar),.2)
    else:  # S10 emocional
        big=(b>=29)
        for i,n in enumerate(ARP[ch]):
            if b==31 and i>0: break
            add(dry,t0+i*eighth,piano(HZ[n],2.4),(.3 if not big else .34));add(wet,t0+i*eighth,piano(HZ[n],2.4),.16)
        for f in PADN[ch]: add(wet,t0,padn(f,bar+ (1.5 if b>=30 else 0)),.9 if not big else 1.3)
        add(dry,t0,bass(ROOT[ch],1.4),.5)
        if b<=30:
            pos=0
            for (n,d) in THEME[b-26][:]:
                if b==30 and n=='D5': continue
                g=.34 if not big else .42
                add(dry,t0+pos*beat,piano(HZ[n]*1.0,2.6),g);add(wet,t0+pos*beat,piano(HZ[n],2.6),g*.7)
                if big or b>=28: add(wet,t0+pos*beat,padn(HZ[n],d*beat),.35)
                pos+=d
        if b==31:
            for f in [130.81,261.63,329.63,392.0,523.25,659.26]: add(wet,t0+ (0 if f<200 else .0),piano(f,5.6),.5)
            for f in PADN['C']: add(wet,t0,padn(f,4.5),1.2)
            sparkle(wet,t0+.2,8,.2,1046.5,.16)
            add(wet,t0+.1,bell(HZ['C6'],3.5),.3);add(wet,t0+.5,bell(HZ['E6'],3.5),.25);add(wet,t0+.9,bell(HZ['G6'],3.5),.22)
# ----- efectos sincronizados con la animación -----
ST=[0,7.5,15,20,27.5,35,42.5,50,57.5,65]
for s in ST[1:]: whoosh(s,.9)
# S1
for t in (.6,1.5,2.4,5.2,6.4): 
    x=tt(.18);f=3200+900*np.sin(2*np.pi*14*x);add(dry,t,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*18)*.03)
whoosh(3.0,.8,.14,10); pop(4.55,.25,900); sparkle(dry,4.6,4,.1,1568)
# S2
for i in range(7): step(7.5+.3+i*(np.pi/9)*1.0+0.02,.1)
whoosh(7.5+2.7,1.2,.1,10); step(7.5+4.75,.14); sparkle(dry,7.5+6.4,3,.1,1318.5)
# S3
add(dry,15+1.15,bell(HZ['C6'],1.5),.35); sparkle(wet,15+1.25,10,.22,880,.045); riser(15+.8,1.3,.16); whoosh(15+2.15,.9,.2)
x=tt(2.6);f=1500*np.exp(-x*.9)+200;add(wet,15+2.3,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*.5)*.12)
# S4
for k in range(4): boing(20+1.25+.95*k+.4,.26)
for k in range(1,4): boing(20+2.05+.95*(k-1)+.4,.2); pop(20+2.05+.95*k,.16,600)
boing(20+5.05,.3);boing(20+5.1,.24);add(dry,20+5.5,noise(.09,3)*np.exp(-tt(.09)*40),.3);sparkle(dry,20+5.55,5,.14,1318.5)
# S5
for i,t0 in enumerate([2.9,3.4,3.9,4.4]): pop(27.5+t0+.6,.24,500+i*80);toc(27.5+t0+.6,320,.2)
whoosh(27.5+4.6,.75,.14,8);sparkle(dry,27.5+5.35,4,.12,1046.5)
# S6
for t0 in (1.2,3.4,5.6): plop(35+t0+.5)
add(dry,35+3.6,noise(1.6,20)*np.sin(np.pi*np.clip(tt(1.6)/1.6,0,1)),.06)
sparkle(wet,35+4.6,8,.14,880,.2); sparkle(dry,35+5.7,6,.18,1318.5,.08)
# S7
sc=[1,1.122,1.26,1.498,1.68]
for i in range(14): add(dry,42.5+1.8+.13*i,bell(1046.5*sc[i%5],.8),.13)
for i,n in enumerate(['E6','G6','C7']): add(wet,42.5+4.4+i*.12,bell(HZ[n],2.0),.3)
x=tt(.5);add(dry,42.5+5.0,(np.sin(2*np.pi*(320+80*np.sin(x*20))*x))*np.exp(-x*5)*.12)
# S8
for n in range(14): toc(50+.55+.3*n+.42,170+n*13,.36)
whoosh(50+4.4,.8,.14,8); toc(50+5.2,260,.5); sparkle(dry,50+5.2,8,.2,1046.5,.06)
# S9
for i,t0 in enumerate([1.9,2.55,3.2,3.85,4.5,5.15]): splat(57.5+t0,.3);add(dry,57.5+t0+.05,bell(HZ[['C5','D5','E5','G5','A5','C6'][i]],1.0),.2)
x=tt(1.0);add(dry,57.5+5.3,np.sin(2*np.pi*np.cumsum(500+1500*x)/SR)*np.exp(-x*3)*.1)
# regalo de cada luz + botón encendido (escalera pentatónica)
PN=['C5','D5','E5','G5','A5','C6']
for k in range(6):
    s=ST[3+k]; whoosh(s+5.95,.9,.1,6); riser(s+5.95,.9,.1,500,2200)
    add(wet,s+6.85,bell(HZ[PN[k]]*1.0,2.5),.42); add(dry,s+6.85,bell(HZ[PN[k]]*2,1.6),.2)
# S10
for i in range(6): add(wet,65+.55+.16*i+.5,bell(HZ[PN[i]]*2,2.2),.28)
riser(65+2.2,1.4,.12); sparkle(wet,65+2.7,10,.16,880,.06)
for i in range(6): add(wet,65+3.2+.22*i+.4,bell(HZ[PN[i]]*2,1.8),.24)
whoosh(65+4.6,.7,.1,8); pop(65+5.0,.2,500)
for i in range(9): step(65+5.75+i*.19*(1+i*.12),.08*(1-i*.08))
sparkle(wet,65+7.4,10,.22,1046.5,.09)
for i in range(6): pop(65+8.7+.16*i+.3,.18,500+i*70)
# ambiente sutil de patio al final
# ----- mezcla final con reverb -----
L=int(SR*2.4);ir=rng.standard_normal(L)*np.exp(-np.arange(L)/SR*2.2);ir[:int(SR*.02)]*=np.linspace(0,1,int(SR*.02))
ir=np.convolve(ir,np.ones(6)/6,'same')  # oscurece un poco
ir/=np.sqrt(np.sum(ir**2))
n=1<<int(np.ceil(np.log2(N+L)));W=np.fft.irfft(np.fft.rfft(wet,n)*np.fft.rfft(ir,n),n)[:N]
mix=dry+W*.9
v=np.array([vol(i/SR) for i in range(0,N,441)]);vol_env=np.interp(np.arange(N)/SR,np.arange(0,N,441)/SR,v)
mix*=vol_env
def tgt(t):
    pts=[(0,.05),(3,.11),(7.5,.17),(8,.19),(15,.21),(19.5,.30),(20.5,.26),(64.5,.26),(65.5,.24),(72,.26),(72.6,.38),(77.4,.36),(77.6,.30),(82.5,.24)]
    return np.interp(t,[p[0] for p in pts],[p[1] for p in pts])
win=SR
rms=np.array([np.sqrt(np.mean(mix[i:i+win]**2))+1e-6 for i in range(0,N-win+1,win//2)])
tc=np.arange(len(rms))*(win/2)/SR+.5
g=np.clip(tgt(tc)/rms,.25,5.0)
g=np.convolve(np.pad(g,(2,2),'edge'),np.ones(5)/5,'valid')
mix*=np.interp(np.arange(N)/SR,tc,g)
mix=np.tanh(mix*1.05)
fi=int(SR*.8);mix[:fi]*=np.linspace(0,1,fi);fo=int(SR*3.0);mix[-fo:]*=np.linspace(1,0,fo)
mix=mix/np.max(np.abs(mix))*.8
pcm=(mix*32767).astype(np.int16)
w=wave.open('../audio.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes());w.close()
print('ok',len(mix)/SR)
