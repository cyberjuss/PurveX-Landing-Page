// Soft jazz for the SOC floor, played live with the Web Audio API so there is
// no audio file to ship or fetch. A slow swung ii-V-I-VI in F: electric piano
// comping, a walking upright bass, brushes and a ride, and now and then a few
// vibraphone notes over the top. Quiet by design; it is background.

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

type Bar = { voicing: number[]; walk: number[]; scale: number[] };
const BARS: Bar[] = [
  { voicing: [58, 62, 65, 69], walk: [43, 46, 50, 47], scale: [67, 69, 70, 72, 74, 77] }, // Gm9
  { voicing: [58, 64, 69, 74], walk: [48, 52, 43, 40], scale: [67, 69, 70, 72, 76, 79] }, // C13
  { voicing: [57, 64, 67, 72], walk: [41, 45, 48, 49], scale: [65, 67, 69, 72, 76, 77] }, // Fmaj9
  { voicing: [60, 66, 69, 75], walk: [50, 54, 45, 44], scale: [66, 69, 72, 74, 75, 78] }, // D7b9
];

const BPM = 78;
const BEAT = 60 / BPM;

export class SoftJazz {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer = 0;
  private nextTime = 0;
  private eighth = 0;
  private volume = 0.5;

  get playing() {
    return this.ctx !== null;
  }

  /** Start (must come from a click or key press, or the browser keeps it silent). */
  start() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(this.level(), ctx.currentTime + 2);
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 5200;
    tone.connect(out).connect(ctx.destination);
    this.out = out;
    this.dry = ctx.createGain();
    this.dry.connect(tone);
    // A small room: a convolver fed a decaying burst of noise.
    const verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.4);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb.buffer = ir;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.28;
    this.wet.connect(verb).connect(tone);
    const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noise = nb;
    this.nextTime = ctx.currentTime + 0.15;
    this.eighth = 0;
    this.timer = window.setInterval(() => this.schedule(), 30);
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx || !this.out) return;
    window.clearInterval(this.timer);
    this.out.gain.cancelScheduledValues(ctx.currentTime);
    this.out.gain.setValueAtTime(this.out.gain.value, ctx.currentTime);
    this.out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    this.ctx = null;
    window.setTimeout(() => void ctx.close(), 1000);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.ctx && this.out) this.out.gain.linearRampToValueAtTime(this.level(), this.ctx.currentTime + 0.2);
  }

  private level() {
    return 0.22 * this.volume;
  }

  private send(node: AudioNode, wet = 1) {
    node.connect(this.dry!);
    if (wet) {
      const g = this.ctx!.createGain();
      g.gain.value = wet;
      node.connect(g).connect(this.wet!);
    }
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + 0.2) {
      this.play(this.eighth, this.nextTime);
      // Swing: the first eighth of each beat is long, the second short.
      this.nextTime += this.eighth % 2 === 0 ? BEAT * 0.64 : BEAT * 0.36;
      this.eighth++;
    }
  }

  private play(n: number, t: number) {
    const bar = BARS[Math.floor(n / 8) % BARS.length];
    const e = n % 8;
    const beat = Math.floor(e / 2);
    const on = e % 2 === 0;
    // Bass walks in quarter notes.
    if (on) this.bass(midi(bar.walk[beat]), t);
    // Ride on every beat and the skip notes; brushes on 2 and 4.
    if (on || beat === 1 || beat === 3) this.ride(t, on ? 1 : 0.6);
    if (on && (beat === 1 || beat === 3)) this.brush(t);
    // Piano comps: the downbeat, the and of two, sometimes the and of four.
    const comp = e === 0 || e === 3 || (e === 7 && Math.random() < 0.45);
    if (comp) bar.voicing.forEach((m, k) => this.keys(midi(m), t + k * 0.012, e === 0 ? 1.9 : 0.9, e === 0 ? 1 : 0.7));
    // A sparse line on the vibes.
    if (Math.random() < 0.16) this.vibes(midi(bar.scale[Math.floor(Math.random() * bar.scale.length)]), t);
  }

  private keys(f: number, t: number, dur: number, vel: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07 * vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1900;
    const trem = ctx.createGain();
    trem.gain.value = 1;
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 4.6;
    depth.gain.value = 0.18;
    lfo.connect(depth).connect(trem.gain);
    [
      [1, "sine", 1],
      [2, "sine", 0.18],
      [1, "triangle", 0.12],
    ].forEach(([mult, type, amp]) => {
      const o = ctx.createOscillator();
      o.type = type as OscillatorType;
      o.frequency.value = f * (mult as number);
      const a = ctx.createGain();
      a.gain.value = amp as number;
      o.connect(a).connect(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
    g.connect(lp).connect(trem);
    this.send(trem, 0.9);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }

  private bass(f: number, t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0008, t + BEAT * 0.95);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    o.connect(g).connect(lp);
    this.send(lp, 0.15);
    o.start(t);
    o.stop(t + BEAT);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, q: number, peak: number, decay: number, wet: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0005, t + decay);
    src.connect(f).connect(g);
    this.send(g, wet);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
  }

  private ride(t: number, vel: number) {
    this.noiseHit(t, "bandpass", 7600, 1.4, 0.035 * vel, 0.32, 0.4);
  }

  private brush(t: number) {
    this.noiseHit(t, "bandpass", 2400, 0.7, 0.05, 0.22, 0.5);
  }

  private vibes(f: number, t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 1.4);
    const vib = ctx.createOscillator();
    const vd = ctx.createGain();
    vib.frequency.value = 5.2;
    vd.gain.value = 0.012;
    const amp = ctx.createGain();
    amp.gain.value = 1;
    vib.connect(vd).connect(amp.gain);
    o.connect(g).connect(amp);
    this.send(amp, 1);
    o.start(t);
    o.stop(t + 1.5);
    vib.start(t);
    vib.stop(t + 1.5);
  }
}
