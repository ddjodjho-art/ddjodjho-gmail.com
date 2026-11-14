class SoundFX {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08, delay = 0) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  tap() {
    this.tone(520, 0.06, "triangle", 0.05);
  }

  flip() {
    this.tone(420, 0.08, "sine", 0.05);
  }

  success() {
    this.tone(587.33, 0.1, "triangle", 0.08, 0);
    this.tone(880, 0.16, "triangle", 0.08, 0.08);
  }

  goal() {
    this.tone(523.25, 0.1, "square", 0.05, 0);
    this.tone(659.25, 0.1, "square", 0.05, 0.09);
    this.tone(783.99, 0.22, "triangle", 0.08, 0.18);
  }

  error() {
    this.tone(220, 0.16, "sawtooth", 0.05, 0);
    this.tone(175, 0.2, "sawtooth", 0.04, 0.1);
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => this.tone(n, 0.18, "triangle", 0.07, idx * 0.08));
  }
}

export const sfx = new SoundFX();
