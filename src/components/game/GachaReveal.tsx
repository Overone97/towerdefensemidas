import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OwnedCharacter, Rarity } from '../../game/types';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import { playGachaSounds } from '../../game/audio/gachaAudio';

interface GachaRevealProps {
  character: OwnedCharacter;
  onComplete: () => void;
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_INDEX: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

const PHASE_EGG = 2000;
const PHASE_CRACK = 600;
const PHASE_REVEAL = 2500;

const GachaReveal: React.FC<GachaRevealProps> = ({ character, onComplete }) => {
  const [phase, setPhase] = useState<'egg' | 'crack' | 'reveal'>('egg');
  const [currentRarity, setCurrentRarity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const audioRef = useRef<{ cleanup: () => void; playRevealBurst: () => void } | null>(null);

  const targetRarityIndex = RARITY_INDEX[character.config.rarity];
  const targetColor = RARITY_COLORS[character.config.rarity];

  // Start audio on mount
  useEffect(() => {
    audioRef.current = playGachaSounds(targetRarityIndex);
    return () => { audioRef.current?.cleanup(); };
  }, [targetRarityIndex]);

  // Egg phase: rarity glow climbs from common to target
  useEffect(() => {
    if (phase !== 'egg') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / PHASE_EGG);
      // Climb through rarities up to target
      const rarityProgress = Math.floor(progress * (targetRarityIndex + 1));
      setCurrentRarity(Math.min(rarityProgress, targetRarityIndex));

      if (elapsed >= PHASE_EGG) {
        clearInterval(interval);
        setCurrentRarity(targetRarityIndex);
        setPhase('crack');
      }
    }, 60);
    return () => clearInterval(interval);
  }, [phase, targetRarityIndex]);

  // Crack phase
  useEffect(() => {
    if (phase !== 'crack') return;
    audioRef.current?.playRevealBurst();
    const timer = setTimeout(() => setPhase('reveal'), PHASE_CRACK);
    return () => clearTimeout(timer);
  }, [phase]);

  // Reveal auto-close
  useEffect(() => {
    if (phase !== 'reveal') return;
    const timer = setTimeout(onComplete, PHASE_REVEAL);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, w, h);

      const activeColor = RARITY_COLORS[RARITY_ORDER[currentRarity]];

      if (phase === 'egg') {
        // Rarity glow behind egg
        const glowSize = 60 + currentRarity * 10;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        grad.addColorStop(0, activeColor + '44');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Egg shake
        const shake = Math.sin(t * 12) * (2 + currentRarity * 1.5);
        const eggX = cx + shake;
        const eggY = cy;

        // Egg body (oval)
        drawEgg(ctx, eggX, eggY, activeColor);

        // Rising glow bar on the side
        const barH = 120;
        const barX = cx - 80;
        const barY = cy + barH / 2;
        const fillRatio = currentRarity / 4;
        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY - barH, 8, barH);
        // Fill with gradient
        const barGrad = ctx.createLinearGradient(barX, barY, barX, barY - barH * fillRatio);
        barGrad.addColorStop(0, activeColor);
        barGrad.addColorStop(1, activeColor + '44');
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY - barH * fillRatio, 8, barH * fillRatio);

        // Rarity labels on the bar
        for (let i = 0; i <= 4; i++) {
          const yy = barY - (barH * i) / 4;
          ctx.fillStyle = i <= currentRarity ? RARITY_COLORS[RARITY_ORDER[i]] : '#444';
          ctx.font = `${i <= currentRarity ? 'bold' : 'normal'} 9px monospace`;
          ctx.textAlign = 'left';
          ctx.fillText(RARITY_ORDER[i].charAt(0).toUpperCase(), barX + 14, yy + 3);
        }

        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.3;
        ctx.fillText('Hatching...', cx, cy + 80);
        ctx.globalAlpha = 1;
      }

      if (phase === 'crack') {
        // Cracking egg with light burst
        const crackProgress = Math.min(1, (timeRef.current - PHASE_EGG / 1000) * 2);

        // Light burst from center
        const burstSize = 30 + crackProgress * 150;
        const burstGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstSize);
        burstGrad.addColorStop(0, '#ffffff');
        burstGrad.addColorStop(0.3, targetColor + 'cc');
        burstGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = burstGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, burstSize, 0, Math.PI * 2);
        ctx.fill();

        // Egg shell fragments
        if (crackProgress > 0.3) {
          const fragCount = 8;
          for (let i = 0; i < fragCount; i++) {
            const angle = (Math.PI * 2 * i) / fragCount + t;
            const dist = crackProgress * 60;
            const fx = cx + Math.cos(angle) * dist;
            const fy = cy + Math.sin(angle) * dist - crackProgress * 20;
            ctx.save();
            ctx.translate(fx, fy);
            ctx.rotate(angle + t * 3);
            ctx.fillStyle = '#ddd';
            ctx.globalAlpha = 1 - crackProgress;
            ctx.fillRect(-4, -6, 8, 12);
            ctx.restore();
          }
        }

        // Remaining egg (shrinking)
        ctx.globalAlpha = 1 - crackProgress;
        drawEgg(ctx, cx, cy, targetColor);
        ctx.globalAlpha = 1;

        // Crack lines
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const a1 = (Math.PI * 2 * i) / 5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a1) * 20 * crackProgress, cy + Math.sin(a1) * 25 * crackProgress);
          ctx.stroke();
        }
      }

      if (phase === 'reveal') {
        // Rarity glow
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const glowSize = 60 + targetRarityIndex * 15;
        const grad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, glowSize * pulse);
        grad.addColorStop(0, targetColor + '66');
        grad.addColorStop(0.5, targetColor + '22');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, glowSize * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Character body
        const s = 28;
        ctx.fillStyle = character.config.bodyColor;
        ctx.fillRect(cx - s, cy - s - 10, s * 2, s * 2);
        ctx.fillStyle = character.config.detailColor;
        ctx.fillRect(cx - s * 0.4, cy - s * 0.6 - 10, s * 0.8, s * 0.3);
        ctx.fillStyle = character.config.weaponColor;
        ctx.fillRect(cx + s + 2, cy - s * 0.5 - 10, s * 0.3, s);

        // Rarity border
        ctx.strokeStyle = targetColor;
        ctx.lineWidth = targetRarityIndex >= 3 ? 3 : 2;
        ctx.shadowColor = targetColor;
        ctx.shadowBlur = targetRarityIndex >= 3 ? 15 : 6;
        ctx.strokeRect(cx - s - 2, cy - s - 12, s * 2 + 4, s * 2 + 4);
        ctx.shadowBlur = 0;

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(character.config.name, cx, cy + s + 24);

        // Rarity label
        ctx.fillStyle = targetColor;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`★ ${RARITY_LABELS[character.config.rarity]} ★`, cx, cy + s + 44);

        // Stats
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px monospace';
        ctx.fillText(`ATK: ${character.config.attack}  SPD: ${character.config.attackSpeed}  RNG: ${character.config.range}`, cx, cy + s + 62);

        // Legendary sparkles
        if (targetRarityIndex >= 4) {
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + t;
            const dist = 50 + Math.sin(t * 2 + i) * 10;
            ctx.fillStyle = '#ffdd00';
            ctx.globalAlpha = 0.5 + Math.sin(t * 4 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * dist, cy - 10 + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, currentRarity, character, targetColor, targetRarityIndex]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer" onClick={handleSkip}>
      <canvas ref={canvasRef} width={400} height={350} className="w-full h-full max-w-[400px] max-h-[350px]" />
      <div className="absolute bottom-8 text-muted-foreground text-xs font-mono animate-pulse">
        Tap to skip
      </div>
    </div>
  );
};

function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number, glowColor: string) {
  // Egg shape - oval
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 30, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Egg body
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 30, 0, 0, Math.PI * 2);
  const eggGrad = ctx.createLinearGradient(0, -30, 0, 30);
  eggGrad.addColorStop(0, '#f0ede6');
  eggGrad.addColorStop(0.5, '#e8e2d6');
  eggGrad.addColorStop(1, '#d8d0c0');
  ctx.fillStyle = eggGrad;
  ctx.fill();

  // Egg outline
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Highlight
  ctx.beginPath();
  ctx.ellipse(-6, -10, 5, 12, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  // Rarity rune/symbol
  ctx.fillStyle = glowColor;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★', 0, 5);

  ctx.restore();
}

export default GachaReveal;
