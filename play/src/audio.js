const STORE_KEY = 'shipit.muted';

function readMuted() {
  try { return localStorage.getItem(STORE_KEY) === '1'; } catch { return false; }
}

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = readMuted();
  let noiseBuf = null;
  const last = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function gate(name, ms) {
    const now = performance.now();
    if (last[name] && now - last[name] < ms) return false;
    last[name] = now;
    return true;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.25, slide = 0, delay = 0 } = {}) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, { vol = 0.3, lp = 1800, delay = 0 } = {}) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + delay;
    if (!noiseBuf) {
      const len = c.sampleRate * 2;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lp;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t0, Math.random() * 0.8, dur);
  }

  const sfx = {
    shoot(kind) {
      if (!gate('shoot', 55)) return;
      const f = { bolt: 520, star: 780, note: 430, ping: 940 }[kind] || 600;
      tone(f, 0.07, { type: kind === 'note' ? 'triangle' : 'square', vol: 0.06, slide: -f * 0.4 });
    },
    hit() { if (gate('hit', 45)) noise(0.05, { vol: 0.12, lp: 3200 }); },
    kill(combo = 0) {
      if (!gate('kill', 35)) return;
      const f = Math.min(1500, 340 + combo * 22);
      tone(f, 0.13, { type: 'triangle', vol: 0.22, slide: f * 0.6 });
    },
    pickup() { [660, 880, 1320].forEach((f, i) => tone(f, 0.14, { type: 'triangle', vol: 0.2, delay: i * 0.06 })); },
    overdrive() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, { type: 'square', vol: 0.1, delay: i * 0.05 })); },
    swap() { tone(280, 0.18, { type: 'sawtooth', vol: 0.12, slide: 700 }); noise(0.08, { vol: 0.08, lp: 5000 }); },
    power(tier = 1) {
      noise(0.45 + tier * 0.15, { vol: 0.34, lp: 500 + tier * 400 });
      tone(110, 0.5, { type: 'sine', vol: 0.5, slide: -70 });
      for (let i = 0; i <= tier; i++) tone(440 * (1 + i * 0.5), 0.35, { type: 'triangle', vol: 0.16, delay: 0.04 * i });
    },
    hurt() { tone(180, 0.2, { type: 'square', vol: 0.18, slide: -90 }); noise(0.1, { vol: 0.15, lp: 900 }); },
    wave() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { type: 'triangle', vol: 0.22, delay: i * 0.1 })); },
    boss() { tone(70, 0.9, { type: 'sawtooth', vol: 0.3, slide: -30 }); noise(0.5, { vol: 0.2, lp: 400 }); },
    slam() { noise(0.35, { vol: 0.3, lp: 700 }); tone(90, 0.3, { type: 'sine', vol: 0.4, slide: -50 }); },
    click() { tone(720, 0.05, { type: 'square', vol: 0.08 }); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.22, delay: i * 0.18 })); },
    win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.22, delay: i * 0.11 })); },
  };

  return {
    unlock: ensure,
    setMuted(m) {
      muted = !!m;
      if (master) master.gain.value = muted ? 0 : 0.55;
    },
    sfx,
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(STORE_KEY, muted ? '1' : '0'); } catch { /* storage unavailable */ }
      ensure();
      if (master) master.gain.value = muted ? 0 : 0.55;
      return muted;
    },
  };
}
