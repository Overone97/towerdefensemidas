import React, { useEffect, useRef } from 'react';
import { drawLolSprite, hasLolSprite } from '../../game/rendering/lolSprites';

interface Props {
  championId: string;
  tintColor?: string;
  skinId?: string;
  size?: number;
  canvasSize?: number;
  className?: string;
}

const SkinPreviewCanvas: React.FC<Props> = ({ championId, tintColor, skinId, size = 84, canvasSize = 120, className }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI render for sharper previews (less pixelized)
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    if (canvas.width !== canvasSize * dpr) canvas.width = canvasSize * dpr;
    if (canvas.height !== canvasSize * dpr) canvas.height = canvasSize * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (hasLolSprite(championId)) {
      drawLolSprite(ctx, championId, canvasSize / 2, canvasSize / 2 + 1, size, 20, false, 0, tintColor, skinId);
      return;
    }

    // Fallback simple silhouette
    ctx.fillStyle = tintColor || '#999';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }, [championId, tintColor, skinId, size, canvasSize]);

  return <canvas ref={ref} width={canvasSize} height={canvasSize} className={className || ''} />;
};

export default SkinPreviewCanvas;
