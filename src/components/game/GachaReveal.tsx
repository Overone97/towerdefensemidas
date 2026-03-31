import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OwnedCharacter } from '../../game/types';
import { playGachaSounds } from '../../game/audio/gachaAudio';
import { drawLolSprite } from '../../game/rendering/lolSprites';

interface GachaRevealProps {
  character: OwnedCharacter;
  onComplete: () => void;
}

const PHASE_EGG = 2500;
const PHASE_CRACK = 600;
const PHASE_REVEAL = 2500;

const GachaReveal: React.FC<GachaRevealProps> = ({ character, onComplete }) => {
  const [phase, setPhase] = useState<'egg' | 'crack' | 'reveal'>('egg');
  const [hatchProgress, setHatchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const audioRef = useRef<{ cleanup: () => void; playRevealBurst: () => void } | null>(null);

  const accentColor = character.config.weaponColor;

  useEffect(() => {
    audioRef.current = playGachaSounds(2);
    return () => { audioRef.current?.cleanup(); };
  }, []);

  // Egg phase: hatching progress bar fills up
  useEffect(() => {
    if (phase !== 'egg') return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, (elapsed / PHASE_EGG) * 100);
      setHatchProgress(progress);
      if (elapsed >= PHASE_EGG) {
        clearInterval(interval);
        setHatchProgress(100);
        setPhase('crack');
      }
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'crack') return;
    audioRef.current?.playRevealBurst();
    const timer = setTimeout(() => setPhase('reveal'), PHASE_CRACK);
    return () => clearTimeout(timer);
  }, [phase]);

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

      if (phase === 'egg') {
        // Glow behind egg (grows with progress)
        const glowSize = 50 + (hatchProgress / 100) * 40;
        const grad = safeRadialGradient(ctx, cx, cy, 0, cx, cy, glowSize);
        grad.addColorStop(0, accentColor + '44');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Egg with increasing shake
        const shakeIntensity = 1 + (hatchProgress / 100) * 5;
        const shake = Math.sin(t * 12) * shakeIntensity;
        drawEgg(ctx, cx + shake, cy, accentColor);

        // Hatching progress bar
        const barW = 120;
        const barH = 8;
        const barX = cx - barW / 2;
        const barY = cy + 60;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);

        const fillW = (hatchProgress / 100) * barW;
        const barGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
        barGrad.addColorStop(0, accentColor);
        barGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = barGrad;
        ctx.fillRect(barX, barY, fillW, barH);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Progress text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(hatchProgress)}%`, cx, barY + barH + 18);

        ctx.fillStyle = '#888';
        ctx.font = '11px monospace';
        ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.3;
        ctx.fillText('Hatching...', cx, barY + barH + 36);
        ctx.globalAlpha = 1;
      }

      if (phase === 'crack') {
        const crackProgress = Math.min(1, (timeRef.current - PHASE_EGG / 1000) * 2);

        // Light burst
        const burstSize = 30 + crackProgress * 150;
        const burstGrad = safeRadialGradient(ctx, cx, cy, 0, cx, cy, burstSize);
        burstGrad.addColorStop(0, '#ffffff');
        burstGrad.addColorStop(0.3, accentColor + 'cc');
        burstGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = burstGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, burstSize, 0, Math.PI * 2);
        ctx.fill();

        // Shell fragments
        if (crackProgress > 0.3) {
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + t;
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

        // Fading egg
        ctx.globalAlpha = 1 - crackProgress;
        drawEgg(ctx, cx, cy, accentColor);
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
        // Glow behind character
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const glowSize = 70;
        const grad = safeRadialGradient(ctx, cx, cy - 10, 0, cx, cy - 10, glowSize * pulse);
        grad.addColorStop(0, accentColor + '66');
        grad.addColorStop(0.5, accentColor + '22');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, glowSize * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw actual character sprite (LoL PNG)
        drawLolSprite(ctx, character.config.id, cx, cy - 10, 48, t * 60, false, 0);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(character.config.name, cx, cy + 50);

        // Attack pattern label
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(character.config.attackPattern.replace('_', ' ').toUpperCase(), cx, cy + 68);

        // Stats
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px monospace';
        ctx.fillText(`ATK: ${character.config.attack}  SPD: ${character.config.attackSpeed}  RNG: ${character.config.range}`, cx, cy + 86);

        // Sparkles around character
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6 + t;
          const dist = 45 + Math.sin(t * 2 + i) * 10;
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = 0.4 + Math.sin(t * 4 + i) * 0.3;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - 10 + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, hatchProgress, character, accentColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer" onClick={onComplete}>
      <canvas ref={canvasRef} width={400} height={350} className="w-full h-full max-w-[400px] max-h-[350px]" />
      <div className="absolute bottom-8 text-muted-foreground text-xs font-mono animate-pulse">
        Tap to skip
      </div>
    </div>
  );
};

function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number, glowColor: string) {
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

  // Mystery symbol
  ctx.fillStyle = glowColor;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('?', 0, 5);

  ctx.restore();
}

export default GachaReveal;
