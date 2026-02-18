import React, { useRef, useEffect } from 'react';
import { CharacterConfig } from '../../game/types';
import { drawCharacterSprite } from '../../game/rendering/characterSprites';
import { RARITY_COLORS } from '../../game/data/characterData';
import { preloadLolSprites } from '../../game/rendering/lolSprites';

interface CharacterSpriteProps {
  config: CharacterConfig;
  size: number; // display size in pixels
  owned?: boolean;
  animate?: boolean;
  className?: string;
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  config,
  size,
  owned = true,
  animate = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(Math.random() * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const res = 64; // internal resolution
    canvas.width = res;
    canvas.height = res;

    const draw = () => {
      ctx.clearRect(0, 0, res, res);

      if (!owned) {
        // Silhouette for unowned
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, res, res);
        
        // Draw a dark silhouette version
        ctx.save();
        ctx.globalAlpha = 0.3;
        drawCharacterSprite(ctx, config, res / 2, res / 2, 24, frameRef.current, false, 0);
        ctx.restore();
        
        // Question mark
        ctx.fillStyle = '#555';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', res / 2, res / 2);
        return;
      }

      // Dark background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, res, res);

      // Subtle rarity gradient bg
      const rarityColor = RARITY_COLORS[config.rarity];
      const grad = ctx.createRadialGradient(res / 2, res / 2, 0, res / 2, res / 2, res / 2);
      grad.addColorStop(0, rarityColor + '18');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, res, res);

      // Draw the sprite
      drawCharacterSprite(ctx, config, res / 2, res / 2, 24, frameRef.current, false, 0);
    };

    if (animate) {
      let lastTime = performance.now();
      const loop = (now: number) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        frameRef.current += dt * 60;
        draw();
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      draw();
    }
  }, [config, owned, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        borderRadius: 4,
      }}
    />
  );
};

export default CharacterSprite;
