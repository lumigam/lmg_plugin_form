import numpy as np, wave
SR=44100; T=76.0
N=int(SR*T); mix=np.zeros(N)
rng=np.random.default_rng(7)
def add(t,sig,g=1.0):
    i=int(t*SR)
    if i>=N or i<0: return
    j=min(N,i+len(sig)); mix[i:j]+=sig[:j-i]*g
def tt(d): return np.arange(int(SR*d))/SR
def pluck(f,d=1.4,bright=1.0):
    t=tt(d); s=np.zeros_like(t)
    for k in range(1,9):
        s+=np.sin(2*np.pi*f*k*t+k)*np.exp(-t*(3+k*2.4*bright))/k**1.15
    s*=np.minimum(1,t/.004); return s*.5
def bell(f,d=1.6):
    t=tt(d); s=np.sin(2*np.pi*f*t)*np.exp(-t*3.2)+.35*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*6)+.15*np.sin(2*np.pi*f*3.98*t)*np.exp(-t*10)
    return s*np.minimum(1,t/.002)*.5
def noise(d,lp=8):
    n=rng.standard_normal(int(SR*d)); k=np.ones(lp)/lp; return np.convolve(n,k,'same')
def strum(t,notes,up=False,g=1.0,gap=.011):
    ns=notes[::-1] if up else notes
    for i,f in enumerate(ns): add(t+i*gap,pluck(f,1.2),g*(.8 if up else 1.0))
CH={'C':[261.63,329.63,392.0,523.25],'G':[196.0,246.94,293.66,392.0],'Am':[220.0,261.63,329.63,440.0],'F':[174.61,220.0,261.63,349.23]}
PROG=['C','G','Am','F']; ROOT={'C':130.81,'G':98.0,'Am':110.0,'F':87.31}
NOTE={'C5':523.25,'D5':587.33,'E5':659.26,'F5':698.46,'G5':783.99,'A5':880.0,'B4':493.88,'A4':440.0,'C6':1046.5,'E6':1318.5,'G6':1568.0,'C7':2093.0,'D6':1174.7}
MEL={'C':['E5',0,'G5','E5','D5',0,'C5',0],'G':['D5',0,'B4','D5','G5',0,'D5',0],'Am':['C5',0,'E5','A5','G5',0,'E5',0],'F':['A4',0,'C5','F5','E5','D5','C5',0]}
BPM=96; beat=60/BPM; eighth=beat/2; bar=beat*4
PAT=[('d',1),('',0),('d',.7),('u',.6),('',0),('u',.6),('d',.8),('u',.55)]
ST=[0,6.5,13,19,26,33,40,47,54,61]
FINAL=68.3
nb=int(FINAL/bar)+1
for b in range(nb):
    t0=b*bar; ch=PROG[b%4]
    if t0>=FINAL-.01: break
    sect=0 if t0<10 else (1 if t0<19 else (2 if t0<61 else 3))
    vel={0:.55,1:.75,2:.95,3:1.0}[sect]
    for i,(kind,v) in enumerate(PAT):
        tt_=t0+i*eighth
        if tt_>=FINAL: break
        if sect==0 and i not in (0,2,6): continue
        if kind: strum(tt_,CH[ch],up=(kind=='u'),g=.55*v*vel)
    if sect>=1:
        for i,n in enumerate(MEL[ch]):
            if n and (sect>=1) and t0+i*eighth<FINAL: add(t0+i*eighth,bell(NOTE[n],1.1),.30*(0.8 if sect==1 else 1))
    if sect>=2:
        for k in (0,2):
            add(t0+k*beat,pluck(ROOT[ch],.9,.4)*1.3,.55)
        for i in range(8):
            add(t0+i*eighth,noise(.05,3)*np.exp(-tt(.05)*60),.06 if i%2==0 else .09)
        for k in (1,3):
            add(t0+k*beat,noise(.09,10)*np.exp(-tt(.09)*35),.11)
        add(t0,np.sin(2*np.pi*(60+50*np.exp(-tt(.18)*30))*tt(.18))*np.exp(-tt(.18)*22),.5)
        add(t0+2*beat,np.sin(2*np.pi*(60+50*np.exp(-tt(.18)*30))*tt(.18))*np.exp(-tt(.18)*22),.4)
# sfx
def whoosh(t,d=.9,g=.28):
    x=tt(d); env=np.sin(np.pi*np.clip(x/d,0,1))**2
    n=noise(d,int(4+ 20*0)) ; n=np.convolve(rng.standard_normal(len(x)),np.ones(14)/14,'same')
    add(t,n*env,g)
for s in ST[1:]: whoosh(s,.9)
def boing(t,g=.35):
    d=.4;x=tt(d);f=180+320*np.sin(np.pi*np.clip(x/d,0,1)*.9)*np.exp(-x*3)+40*np.sin(2*np.pi*22*x)
    ph=2*np.pi*np.cumsum(f)/SR; add(t,np.sin(ph)*np.exp(-x*7)*np.minimum(1,x/.005),g)
def plop(t,g=.4):
    d=.22;x=tt(d);f=1000*np.exp(-x*9)+250; add(t,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*16),g)
def toc(t,f=200,g=.5):
    d=.12;x=tt(d);add(t,(np.sin(2*np.pi*f*x)*.7+noise(d,4)*.5)*np.exp(-x*45),g)
def splat(t,g=.4):
    d=.3;x=tt(d);f=500*np.exp(-x*10)+120; add(t,(np.sin(2*np.pi*np.cumsum(f)/SR)*.6+noise(d,6)*.8)*np.exp(-x*14),g)
def sparkle(t,n=5,g=.16,base=1046.5):
    sc=[1,1.122,1.26,1.498,1.68,2.0]
    for i in range(n): add(t+i*.055,bell(base*sc[i%6],.9),g)
# escena 2/3
add(10.6,bell(NOTE['E6'],1.2),.15)
sparkle(13+1.7,6,.2,880); sparkle(13+2.85,10,.22,1046.5)
t=tt(2.5); f=1400*np.exp(-t*.9)+200; add(16.4,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*.8)*.14,1)
# escena 4
for k in range(6): boing(19+.3+k*1.1+.45,.3)
pent=[523.25,587.33,659.26,783.99,880.0,1046.5]
for k in range(6): add(19+.8+(k+1)*1.1,bell(pent[k],1.0),.35)
# escena 5
add(26+1.4,pluck(NOTE['G5']/2,.5),.4)
for i in range(4):
    sparkle(26+3.6+i*.85+.8,3,.22,1568)
    toc(26+3.6+i*.85+.8,300,.3)
# escena 6
for t0 in (1.2,3.4,5.6): plop(33+t0+.5)
sparkle(33+5.3,5,.18,1046.5)
# escena 7
for i,n in enumerate(['E6','G6','C7']): add(40+4.2+i*.16,bell(NOTE[n],1.6),.4)
for i in range(6): add(40+.5+i*.4,bell(NOTE['C6']*[1,1.25,1.5,1.25,1.12,1.33][i],.8),.1)
# escena 8
for n in range(14): toc(47+.3+.28*n+.45,170+n*14,.45)
toc(47+5.3,260,.6); sparkle(47+5.3,8,.25,1046.5)
# escena 9
for i,t0 in enumerate([1.5,2.4,3.3,4.2,5.1,6.0]): splat(54+t0,.38); add(54+t0+.05,bell(pent[i%6]*.5,.7),.22)
# escena 10
for i in range(6): add(61+.5+.38*i+1.1,bell(pent[i],1.4),.4)
sparkle(61+4.6,8,.18,1318.5)
for k in range(4): add(61+3.6+ .25*k, bell(NOTE['C6']*[1,1.25,1.5,2][k],1.0),.18)
# acorde final
for i,f in enumerate([130.81,261.63,329.63,392.0,523.25,659.26]): add(FINAL+i*.03,pluck(f,4.5,.45),.55)
for i,n in enumerate(['C5','E5','G5','C6','E6']): add(FINAL+.2+i*.12,bell(NOTE.get(n,1),3.5),.28)
# master
mix=np.tanh(mix*1.1)
fade=np.ones(N); fi=int(SR*.6); fade[:fi]=np.linspace(0,1,fi); fo=int(SR*2.5); fade[-fo:]=np.linspace(1,0,fo)
mix*=fade; mix=mix/np.max(np.abs(mix))*.7
pcm=(mix*32767).astype(np.int16)
w=wave.open('audio.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('ok',np.max(np.abs(mix)))
