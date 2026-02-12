const RARITY_FREQS = [220, 330, 440, 550, 700]; // common → legendary

export function playGachaSounds(targetRarityIndex: number): {
  cleanup: () => void;
  playRevealBurst: () => void;
} {
  let ctx: AudioContext;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return { cleanup: () => {}, playRevealBurst: () => {} };
  }

  // Ascending tones - one per rarity level up to target
  for (let i = 0; i <= targetRarityIndex; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = RARITY_FREQS[i];
    osc.type = i < 3 ? 'sine' : 'triangle';

    const t = ctx.currentTime + i * 0.3;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  return {
    cleanup: () => { try { ctx.close(); } catch {} },
    playRevealBurst: () => {
      const baseFreq = 300 + targetRarityIndex * 120;
      [1, 1.5, 2, 3].forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = baseFreq * mult;
        osc.type = 'sine';
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.1 / (i + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + targetRarityIndex * 0.1);
        osc.start(t);
        osc.stop(t + 0.6 + targetRarityIndex * 0.1);
      });
      // Shimmer for epic/legendary
      if (targetRarityIndex >= 3) {
        const shimmer = ctx.createOscillator();
        const sGain = ctx.createGain();
        shimmer.connect(sGain);
        sGain.connect(ctx.destination);
        shimmer.frequency.value = 1200 + targetRarityIndex * 200;
        shimmer.type = 'sine';
        sGain.gain.setValueAtTime(0.05, ctx.currentTime);
        sGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        shimmer.start(ctx.currentTime);
        shimmer.stop(ctx.currentTime + 1);
      }
    }
  };
}
