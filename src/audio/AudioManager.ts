type OscType = OscillatorType;

export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgPlaying = false;
  private bgTimer: number | null = null;

  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private tone(
    freq: number,
    start: number,
    duration: number,
    type: OscType,
    peak: number
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playHit(): void {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playHoleIn(): void {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.tone(freq, t + i * 0.12, 0.18, "triangle", 0.3);
    });
  }

  playGameOver(): void {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const notes = [523.25, 392.0, 311.13, 246.94];
    notes.forEach((freq, i) => {
      this.tone(freq, t + i * 0.18, 0.28, "sawtooth", 0.25);
    });
  }

  playBgMusic(): void {
    if (this.bgPlaying) return;
    this.ensure();
    this.bgPlaying = true;

    const sequence = [
      261.63, 329.63, 392.0, 329.63,
      293.66, 349.23, 440.0, 349.23,
    ];
    const noteDuration = 0.35;
    let index = 0;

    const schedule = () => {
      if (!this.bgPlaying || !this.ctx) return;
      const freq = sequence[index % sequence.length];
      this.tone(freq, this.ctx.currentTime, noteDuration * 0.9, "sine", 0.1);
      index++;
      this.bgTimer = window.setTimeout(schedule, noteDuration * 1000);
    };

    schedule();
  }

  stopBgMusic(): void {
    this.bgPlaying = false;
    if (this.bgTimer !== null) {
      clearTimeout(this.bgTimer);
      this.bgTimer = null;
    }
  }
}
