// Procedural sound effects using Web Audio API
// All sounds are synthesized — no external files needed

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private musicPlaying = false;
  private _muted = false;
  private _musicMuted = false;
  private _volume = 0.5;

  get muted() { return this._muted; }
  get musicMuted() { return this._musicMuted; }
  get volume() { return this._volume; }

  private ensureContext() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this._volume;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25;
        this.musicGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this._volume;
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this.masterGain) this.masterGain.gain.value = this._muted ? 0 : this._volume;
  }

  toggleMusic() {
    this._musicMuted = !this._musicMuted;
    if (this.musicGain) this.musicGain.gain.value = this._musicMuted ? 0 : 0.25;
  }

  // ─── SFX ───────────────────────────────────────

  playAttack(pitch: number = 1) {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.frequency.value = 800 * pitch;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playArrowShot() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playEnemyDeath() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    // Crunchy noise burst
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    noise.connect(gain);
    gain.connect(this.sfxGain!);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.start(t);
    noise.stop(t + 0.13);
  }

  playBossDeath() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    // Deep explosion
    [80, 120, 60].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      const start = t + i * 0.08;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.32);
    });
    // Noise layer
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    noise.connect(gain);
    gain.connect(this.sfxGain!);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    noise.start(t);
    noise.stop(t + 0.42);
  }

  playWaveStart() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    // Ascending trumpet-like
    [330, 440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      const start = t + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  playVictory() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const melody = [523, 659, 784, 1047]; // C5 E5 G5 C6
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const start = t + i * 0.15;
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.start(start);
      osc.stop(start + 0.42);
    });
  }

  playGameOver() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const melody = [400, 350, 300, 200]; // descending
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      const start = t + i * 0.2;
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.37);
    });
  }

  playPlaceUnit() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.08);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playAbility() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    // Dramatic whoosh + chord
    [440, 554, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.52);
    });
    // Shimmer
    const shimmer = ctx.createOscillator();
    const sGain = ctx.createGain();
    shimmer.connect(sGain);
    sGain.connect(this.sfxGain!);
    shimmer.frequency.setValueAtTime(2000, t);
    shimmer.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    shimmer.type = 'sine';
    sGain.gain.setValueAtTime(0.05, t);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    shimmer.start(t);
    shimmer.stop(t + 0.32);
  }

  playUIClick() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.frequency.value = 600;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playBaseDamage() {
    const ctx = this.ensureContext();
    if (!ctx || this._muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.27);
  }

  // ─── MUSIC ─────────────────────────────────────

  startMusic() {
    if (this.musicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.musicPlaying = true;
    this.playMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicOscillators.forEach(o => { try { o.stop(); } catch {} });
    this.musicOscillators = [];
  }

  private playMusicLoop() {
    if (!this.musicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Simple ambient loop - pentatonic progression
    const chords = [
      [130.8, 164.8, 196.0], // C3 E3 G3
      [110.0, 146.8, 164.8], // A2 D3 E3
      [130.8, 155.6, 196.0], // C3 Eb3 G3
      [110.0, 130.8, 164.8], // A2 C3 E3
    ];

    const t = ctx.currentTime;
    const chordDuration = 2.0;

    chords.forEach((chord, ci) => {
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const start = t + ci * chordDuration;
        const end = start + chordDuration;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.3);
        gain.gain.setValueAtTime(0.06, end - 0.3);
        gain.gain.linearRampToValueAtTime(0, end);
        osc.start(start);
        osc.stop(end + 0.01);
        this.musicOscillators.push(osc);
      });
    });

    // Schedule next loop
    const totalDuration = chords.length * chordDuration;
    setTimeout(() => {
      this.musicOscillators = [];
      this.playMusicLoop();
    }, totalDuration * 1000 - 100);
  }
}

// Singleton
export const soundManager = new SoundManager();
