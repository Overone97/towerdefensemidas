import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OwnedCharacter, Rarity } from '../../game/types';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';

interface GachaRevealProps {
  character: OwnedCharacter;
  onComplete: () => void;
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_INDEX: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

// Phase durations in ms
const PHASE_SUSPENSE = 1800;
const PHASE_REVEAL = 600;
const PHASE_DISPLAY = 2500;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'spark' | 'glow' | 'ring';
}

const GachaReveal: React.FC<GachaRevealProps> = ({ character, onComplete }) => {
  const [phase, setPhase] = useState<'suspense' | 'reveal' | 'display'>('suspense');
  const [currentRarity, setCurrentRarity] = useState(0); // cycles through rarities
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const targetRarityIndex = RARITY_INDEX[character.config.rarity];
  const targetColor = RARITY_COLORS[character.config.rarity];

  // Suspense: cycle through rarity colors with increasing speed
  useEffect(() => {
    if (phase !== 'suspense') return;
    const start = Date.now();
    let cycle = 0;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / PHASE_SUSPENSE);
      // Speed up cycling then slow to target
      const speed = 80 + (1 - progress) * 150;

      cycle++;
      if (progress < 0.7) {
        setCurrentRarity(cycle % 5);
      } else {
        // Slow down and converge to target
        const remaining = (1 - progress) / 0.3;
        if (remaining < 0.3 || cycle % 3 === 0) {
          setCurrentRarity(targetRarityIndex);
        } else {
          setCurrentRarity(cycle % 5);
        }
      }

      if (elapsed >= PHASE_SUSPENSE) {
        clearInterval(interval);
        setCurrentRarity(targetRarityIndex);
        setPhase('reveal');
      }
    }, 80);

    return () => clearInterval(interval);
  }, [phase, targetRarityIndex]);

  // Reveal: burst of particles
  useEffect(() => {
    if (phase !== 'reveal') return;
    // Spawn burst particles
    const newParticles: Particle[] = [];
    const count = 30 + targetRarityIndex * 15;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * 4 + targetRarityIndex;
      newParticles.push({
        x: 0, y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.8,
        color: targetColor,
        type: i % 3 === 0 ? 'glow' : 'spark',
      });
    }
    // Ring particles for epic/legendary
    if (targetRarityIndex >= 3) {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        newParticles.push({
          x: Math.cos(angle) * 80, y: Math.sin(angle) * 80,
          vx: Math.cos(angle) * 1.5,
          vy: Math.sin(angle) * 1.5,
          size: 3 + Math.random() * 2,
          life: 1,
          maxLife: 1.2,
          color: targetRarityIndex === 4 ? '#ffdd00' : '#cc88ff',
          type: 'ring',
        });
      }
    }
    particlesRef.current = newParticles;

    const timer = setTimeout(() => setPhase('display'), PHASE_REVEAL);
    return () => clearTimeout(timer);
  }, [phase, targetRarityIndex, targetColor]);

  // Display phase auto-close
  useEffect(() => {
    if (phase !== 'display') return;
    const timer = setTimeout(onComplete, PHASE_DISPLAY);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Canvas animation loop
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

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
      ctx.fillRect(0, 0, w, h);

      const activeColor = RARITY_COLORS[RARITY_ORDER[currentRarity]];

      if (phase === 'suspense') {
        // Pulsing orb
        const pulse = Math.sin(timeRef.current * 8) * 0.3 + 0.7;
        const orbSize = 20 + pulse * 15;

        // Outer glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbSize * 3);
        grad.addColorStop(0, activeColor + '44');
        grad.addColorStop(0.5, activeColor + '11');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, orbSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core orb
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbSize);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, activeColor);
        coreGrad.addColorStop(1, activeColor + '00');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, orbSize, 0, Math.PI * 2);
        ctx.fill();

        // Spinning rays
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(timeRef.current * 2);
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.fillStyle = activeColor;
          ctx.fillRect(-1, 0, 2, orbSize * 2.5);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // "Summoning..." text
        ctx.fillStyle = activeColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5 + pulse * 0.5;
        ctx.fillText('Summoning...', cx, cy + 80);
        ctx.globalAlpha = 1;
      }

      if (phase === 'reveal' || phase === 'display') {
        // Update and draw particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.life -= dt / p.maxLife;

          if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(cx + p.x, cy + p.y);
          ctx.globalAlpha = p.life * 0.8;

          if (p.type === 'glow') {
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
            g.addColorStop(0, p.color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'ring') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.restore();
        }
      }

      if (phase === 'display') {
        // Rarity glow behind character
        const glowPulse = Math.sin(timeRef.current * 3) * 0.15 + 0.85;
        const glowSize = 60 + targetRarityIndex * 15;
        const grad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, glowSize * glowPulse);
        grad.addColorStop(0, targetColor + '66');
        grad.addColorStop(0.5, targetColor + '22');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, glowSize * glowPulse, 0, Math.PI * 2);
        ctx.fill();

        // Character body (pixel art block)
        const s = 28;
        ctx.fillStyle = character.config.bodyColor;
        ctx.fillRect(cx - s, cy - s - 10, s * 2, s * 2);
        // Detail
        ctx.fillStyle = character.config.detailColor;
        ctx.fillRect(cx - s * 0.4, cy - s * 0.6 - 10, s * 0.8, s * 0.3);
        // Weapon color accent
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

        // Legendary extra sparkle
        if (targetRarityIndex >= 4) {
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + timeRef.current;
            const dist = 50 + Math.sin(timeRef.current * 2 + i) * 10;
            const sx = cx + Math.cos(angle) * dist;
            const sy = cy - 10 + Math.sin(angle) * dist;
            ctx.fillStyle = '#ffdd00';
            ctx.globalAlpha = 0.5 + Math.sin(timeRef.current * 4 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, Math.PI * 2);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={handleSkip}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={350}
        className="w-full h-full max-w-[400px] max-h-[350px]"
      />
      <div className="absolute bottom-8 text-muted-foreground text-xs font-mono animate-pulse">
        Tap to skip
      </div>
    </div>
  );
};

export default GachaReveal;
