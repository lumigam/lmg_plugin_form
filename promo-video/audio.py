import json, numpy as np
from scipy.signal import lfilter, butter, fftconvolve
from scipy.io import wavfile

SR = 44100
T = json.load(open('timeline.json'))
DUR = T['dur'] + 1.5
N = int(DUR * SR)
rng = np.random.default_rng(7)
mus = np.zeros((2, N)); sfx = np.zeros((2, N))

def mid(m): return 440.0 * 2 ** ((m - 69) / 12)
def add(buf, sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4); r = gain * np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * l; buf[1, i:i + len(sig)] += sig * r
def tt(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], btype='band'); return lfilter(b, a, x)
def lp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), btype='low'); return lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = butter(order, f / (SR / 2), btype='high'); return lfilter(b, a, x)

# ---------- instrumentos ----------
def marimba(f, d=1.2, a=1.0):
    t = tt(d); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 14) + .12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 30)
    s += .25 * rng.standard_normal(len(t)) * np.exp(-t * 90) * .3
    return s * a
def bell(f, d=2.2, a=1.0):
    t = tt(d); s = sum(w * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, w, k in [(1, 1, 2.2), (2.76, .35, 3.5), (5.4, .18, 6), (8.9, .08, 10)])
    return s * a * (1 - np.exp(-t * 400))
def pad(fs, d, a=1.0, att=.8, rel=1.2):
    t = tt(d + rel); s = np.zeros_like(t)
    for f in fs:
        for dt in (-.4, 0, .5):
            s += np.sin(2 * np.pi * f * (1 + dt * .004) * t + rng.uniform(0, 6)) + .3 * np.sin(2 * np.pi * f * 2 * (1 + dt * .004) * t)
    env = np.minimum(1, t / att) * np.where(t > d, np.exp(-(t - d) * 4 / rel), 1)
    return lp(s * env, 1800) * a / (len(fs) * 3)
def bass(f, d=.6, a=1.0):
    t = tt(d); s = (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 3.2) * (1 - np.exp(-t * 200)); return s * a
def kick(a=1.0):
    t = tt(.35); f = 45 + 90 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-t * 11) * a
def shaker(a=1.0):
    t = tt(.09); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 55) * a
def noise_env(d, lo, hi, env):
    n = rng.standard_normal(int(d * SR)); return bp(n, lo, hi) * env(tt(d))

# ---------- música ----------
CH = {'C': [48, 52, 55, 60], 'G': [43, 50, 55, 59], 'Am': [45, 52, 57, 60], 'F': [41, 48, 53, 57], 'Dm': [50, 53, 57, 62], 'E': [40, 47, 52, 56]}
BEAT = 60 / 92; BAR = BEAT * 4
def section(t):
    if t < 14.4: return 1, ['C', 'G', 'Am', 'F']
    if t < 22.2: return 2, ['Am', 'Dm', 'Am', 'E']
    if t < 34.0: return 3, ['C', 'G', 'Am', 'F']
    if t < 40.3: return 4, ['C', 'F', 'C', 'G']
    return 5, ['F', 'C', 'G', 'C']
nb = int(DUR / BAR) + 1
pent = [72, 74, 76, 79, 81, 84]
mel_seq = [0, 2, 3, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 3, 2, 0]
mi = 0
for b in range(nb):
    t0 = b * BAR; sec, prog = section(t0)
    if t0 >= 44.9: break
    ch = CH[prog[(b if sec != 1 else b) % 4]]
    root = ch[0]
    # pad
    lvl = {1: .5, 2: .55, 3: .5, 4: .45, 5: .5}[sec]
    add(mus, pad([mid(m + 12) for m in ch[:3]], BAR, lvl, .5), t0, -.2)
    # bajo
    if (sec == 1 and t0 > 6.0) or sec in (3, 5):
        for k, off in enumerate([0, 2, 3]):
            add(mus, bass(mid(root), .55, .5), t0 + off * BEAT * (1 if sec != 3 else 1), 0)
        if sec == 3: add(mus, bass(mid(root + 12), .4, .3), t0 + 3.5 * BEAT)
    if sec == 2:
        add(mus, bass(mid(root - 12 if root > 40 else root), BAR, .55), t0, 0)
        add(mus, pad([mid(root + 12), mid(root + 19)], BAR, .5, .1), t0, .2)
    # arpegio
    if sec in (1, 4, 5) or (sec == 3):
        step = BEAT / 2 if sec != 3 else BEAT / 2
        pat = [0, 1, 2, 3, 2, 1, 2, 3] if sec != 4 else [0, 2, 1, 3, 2, 3, 1, 2]
        for k in range(8):
            if sec == 1 and t0 < 2.4 and k % 2: continue
            m = ch[pat[k]] + 12
            amp = .5 if sec != 3 else .55
            add(mus, marimba(mid(m), 1.0, amp), t0 + k * step, [-.4, .3][k % 2])
    if sec == 2:
        for k, idx in enumerate([1, 3, 2]):
            add(mus, marimba(mid(ch[idx] + 12), 1.2, .4), t0 + (k * 2 + .5) * BEAT * .9, .3)
    # percusión
    if sec == 3:
        for k in range(4):
            add(mus, kick(.75), t0 + k * BEAT, 0)
        for k in range(8): add(mus, shaker(.5 + .2 * (k % 2)), t0 + k * BEAT / 2 + BEAT / 4, .3)
    if sec == 1 and t0 > 6.0:
        add(mus, kick(.35), t0, 0); add(mus, kick(.25), t0 + 2 * BEAT, 0)
    # melodía
    if sec in (3,) or (sec == 5 and t0 < 43):
        for k in range(4):
            idx = mel_seq[mi % len(mel_seq)]; mi += 1
            add(mus, bell(mid(pent[idx]), 1.4, .35), t0 + k * BEAT + (BEAT / 2 if k % 2 else 0), .15)
# tormenta: retumbo grave y cuerdas trémolo
tr = tt(8.0); trem = 1 + .4 * np.sin(2 * np.pi * 6 * tr)
add(mus, lp(rng.standard_normal(len(tr)), 90, 3) * 6 * np.minimum(1, tr / 3) * np.minimum(1, (8 - tr) / 1), 14.6, 0, .9)
# acorde final
for f in [48, 55, 60, 64, 67, 72]:
    add(mus, bell(mid(f), 4.0, .32), 45.2, 0)
add(mus, pad([mid(m) for m in [48, 55, 64, 72]], 1.6, .8, .3, 1.4), 44.9, 0)

# ---------- efectos ----------
def sfx_event(t0, kind, p=None):
    if kind == 'pop':
        t = tt(.18); s = np.sin(2 * np.pi * np.cumsum(300 + 900 * np.exp(-t * 30)) / SR) * np.exp(-t * 22); add(sfx, s, t0, 0, .6)
    elif kind == 'label':
        add(sfx, noise_env(.22, 900, 5000, lambda t: np.exp(-t * 26)), t0, 0, .45)
        add(sfx, marimba(mid(84), .5, .5), t0 + .02, 0, .5)
    elif kind == 'brush':
        d = p or 1.0; n = rng.standard_normal(int(d * SR)); t = tt(d)
        env = np.minimum(1, t / .12) * np.minimum(1, (d - t) / .2) * (.6 + .4 * np.sin(2 * np.pi * (1.2 / d + .5) * t + 1) ** 2)
        s = bp(n, 700, 4200) * env * 1.6 + bp(n, 200, 500) * env * .5
        add(sfx, s, t0, 0, .5)
    elif kind == 'hop':
        t = tt(.25); add(sfx, np.sin(2 * np.pi * np.cumsum(350 + 500 * t / .25) / SR) * np.exp(-t * 10), t0, 0, .35)
    elif kind == 'land':
        add(sfx, bass(90, .3, 1.2), t0, 0, .9); add(sfx, noise_env(.15, 300, 2500, lambda t: np.exp(-t * 30)), t0, 0, .4)
    elif kind == 'blip':
        add(sfx, marimba(mid(88), .6, .5), t0, .5, .35)
    elif kind == 'tag':
        add(sfx, noise_env(.1, 1500, 6000, lambda t: np.exp(-t * 50)), t0, 0, .4); add(sfx, marimba(mid(55 + int(t0 * 7) % 5), .3, .6), t0, 0, .35)
    elif kind == 'rumble':
        d = p; add(sfx, lp(rng.standard_normal(int(d * SR)), 120, 3) * 8 * np.sin(np.pi * tt(d) / d), t0, 0, .5)
    elif kind == 'rain':
        d = p; t = tt(d); n = hp(rng.standard_normal(len(t)), 2500) * .5 + bp(rng.standard_normal(len(t)), 900, 2500) * .25
        env = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5) * (1 - .35 * np.exp(-((t - 8) / 3) ** 2) * 0)
        add(sfx, n * env * .3, t0, 0, .5)
    elif kind == 'thunder':
        d = 3.0; t = tt(d); n = lp(rng.standard_normal(len(t)), 260, 3) * 9 * np.exp(-t * 1.1) * (1 - np.exp(-t * 60))
        crack = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 18) * 1.2
        add(sfx, n + crack, t0, 0, .9)
    elif kind == 'wave':
        d = p; t = tt(d); n = bp(rng.standard_normal(len(t)), 300, 2200) * np.sin(np.pi * t / d) ** 2 * 2.5; add(sfx, n, t0, .2, .5)
    elif kind == 'sun':
        for k, m in enumerate([72, 76, 79, 84, 88]): add(sfx, bell(mid(m), 2.0, .5), t0 + k * .07, -.3 + k * .15, .5)
        add(sfx, noise_env(.9, 4000, 9000, lambda t: np.sin(np.pi * t / .9) ** 2), t0, 0, .25)
    elif kind == 'owl':
        t = tt(.55); env = np.where(t < .2, np.sin(np.pi * t / .2), 0) + np.where((t > .28) & (t < .5), np.sin(np.pi * (t - .28) / .22), 0)
        f = np.where(t < .25, 420, 370) * (1 + .02 * np.sin(2 * np.pi * 8 * t)); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env
        add(sfx, lp(s, 1200), t0, 0, .45); add(sfx, noise_env(.2, 900, 5000, lambda t: np.exp(-t * 26)), t0 - .02, 0, .35)
    elif kind == 'tile':
        k = int(round((t0 - 30.5) / .55)); add(sfx, noise_env(.15, 900, 5000, lambda t: np.exp(-t * 30)), t0, 0, .4)
        add(sfx, bell(mid([76, 79, 81, 84, 86, 88][k % 6]), 1.6, .55), t0 + .03, -.4 + k * .16, .55)
    elif kind == 'whoosh':
        d = p; t = tt(d); n = bp(rng.standard_normal(len(t)), 200, 3500) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 2; add(sfx, n, t0, 0, .5)
    elif kind == 'type':
        d = p; cnt = int(d * 17);
        for k in range(cnt): add(sfx, noise_env(.04, 1800, 7000, lambda t: np.exp(-t * 90)) + marimba(mid(96), .04, .05), t0 + k * (d / cnt) + rng.uniform(0, .02), .1, .4)
    elif kind == 'send':
        t = tt(.3); add(sfx, np.sin(2 * np.pi * np.cumsum(500 + 1100 * t / .3) / SR) * np.exp(-t * 8), t0, 0, .35); add(sfx, noise_env(.3, 1000, 6000, lambda t: np.sin(np.pi * t / .3)), t0, 0, .25)
    elif kind == 'ding':
        add(sfx, bell(mid(84), 1.6, .6), t0, 0, .6); add(sfx, bell(mid(91), 1.8, .5), t0 + .12, 0, .6)
    elif kind == 'click':
        add(sfx, noise_env(.03, 1500, 8000, lambda t: np.exp(-t * 120)), t0, 0, .8); add(sfx, marimba(mid(90), .3, .4), t0 + .01, .2, .4)
    elif kind == 'end':
        for k, m in enumerate([84, 88, 91, 96]): add(sfx, bell(mid(m), 3, .4), t0 + k * .09, -.3 + .2 * k, .5)
for ev in T['events']:
    sfx_event(ev[0], ev[1], ev[2] if len(ev) > 2 else None)

# ---------- reverb + mezcla ----------
def reverb(x, wet=.28, sec=1.9, seed=1):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    out = np.zeros_like(x)
    for c in range(2):
        ir = lp(r.standard_normal(n), 5000) * np.exp(-t * 3.2); ir[:int(.01 * SR)] *= 0
        out[c] = fftconvolve(x[c], ir)[:x.shape[1]] * (wet / 25)
    return x + out
mus = reverb(mus, .55, 2.2, 3); sfx = reverb(sfx, .22, 1.2, 4)
# ducking de la música bajo efectos fuertes: simple, no; solo ganancias por sección
tg = np.arange(N) / SR
mg = np.interp(tg, [0, 1.5, 14.3, 15, 22, 22.6, 34, 40, 45, 46.5], [0, .85, .85, .95, .95, 1.1, 1.1, .8, .85, .5])
out = (mus * mg * .55 + sfx * .9)
out = np.tanh(out * 1.1) * .9
out[:, :int(.03 * SR)] *= np.linspace(0, 1, int(.03 * SR)); out[:, -int(1.0 * SR):] *= np.linspace(1, 0, int(1.0 * SR))
out = out[:, :int(T['dur'] * SR)]
out = out / np.max(np.abs(out)) * .89
wavfile.write('audio.wav', SR, (out.T * 32767).astype(np.int16))
print('ok', out.shape, 'rms', np.sqrt((out ** 2).mean()))
