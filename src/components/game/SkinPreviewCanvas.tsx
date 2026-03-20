import React, { useEffect, useRef } from 'react';
import { drawLolSprite, hasLolSprite } from '../../game/rendering/lolSprites';

interface Props {
  championId: string;
  tintColor?: string;
  size?: number;
}

const SkinPreviewCanvas: React.FC<Props> = ({ championId, tintColor, size = 84 }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (hasLolSprite(championId)) {
      drawLolSprite(ctx, championId, canvas.width / 2, canvas.height / 2 + 2, size, 20, false, 0, tintColor);
      return;
    }

    // Fallback simple silhouette
    ctx.fillStyle = tintColor || '#999';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }, [championId, tintColor, size]);

  return <canvas ref={ref} width={120} height={120} className="w-[120px] h-[120px]" />;
};

export default SkinPreviewCanvas;
