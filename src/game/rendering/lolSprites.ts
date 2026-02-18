// LoL character sprite renderer using pre-generated pixel art images
// Images are loaded once and cached, then drawn on canvas

import alistarImg from '@/assets/sprites/alistar.png';
import brandImg from '@/assets/sprites/brand.png';
import jinxImg from '@/assets/sprites/jinx.png';

// Image cache
const imageCache: Map<string, HTMLImageElement> = new Map();
const loadingImages: Set<string> = new Set();

function getOrLoadImage(src: string, key: string): HTMLImageElement | null {
  const cached = imageCache.get(key);
  if (cached && cached.complete) return cached;

  if (!loadingImages.has(key)) {
    loadingImages.add(key);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache.set(key, img);
      loadingImages.delete(key);
    };
    img.onerror = () => {
      loadingImages.delete(key);
    };
    imageCache.set(key, img);
  }

  return null;
}

// Preload all sprites
export function preloadLolSprites() {
  getOrLoadImage(alistarImg, 'alistar');
  getOrLoadImage(brandImg, 'brand');
  getOrLoadImage(jinxImg, 'jinx');
}

// Call preload immediately
preloadLolSprites();

function drawSpriteImage(
  ctx: CanvasRenderingContext2D,
  key: string,
  src: string,
  x: number,
  y: number,
  size: number,
  isAttacking: boolean,
  attackAnimTimer: number
) {
  const img = getOrLoadImage(src, key);
  const drawSize = size * 2.2; // Scale up for visibility
  const swing = isAttacking ? Math.sin(attackAnimTimer * 15) * 1.5 : 0;

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    if (isAttacking) {
      ctx.translate(x, y + swing);
      // Slight scale pulse on attack
      const pulse = 1 + Math.sin(attackAnimTimer * 12) * 0.08;
      ctx.scale(pulse, pulse);
      ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
    }
    ctx.restore();
  } else {
    // Fallback: colored circle while loading
    ctx.fillStyle = key === 'alistar' ? '#7b4fa0' : key === 'brand' ? '#ff6600' : '#44aadd';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawAlistarSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  drawSpriteImage(ctx, 'alistar', alistarImg, x, y, size, isAttacking, attackAnimTimer);

  // Ground slam effect
  if (isAttacking && attackAnimTimer > 0) {
    const ps = size / 8;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#d4a0ff';
    ctx.fillRect(x - size, y + size * 0.8, size * 2, ps);
    ctx.globalAlpha = 1;
  }
}

export function drawBrandSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  drawSpriteImage(ctx, 'brand', brandImg, x, y, size, isAttacking, attackAnimTimer);

  // Fire particles when attacking
  if (isAttacking) {
    const ps = size / 8;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ff6600';
    const t = attackAnimTimer * 10;
    ctx.fillRect(x + size * 0.6 + Math.sin(t) * ps, y - size * 0.5 + Math.cos(t) * ps, ps, ps);
    ctx.fillRect(x - size * 0.3 + Math.cos(t) * ps, y - size * 0.7 + Math.sin(t) * ps, ps, ps);
    ctx.globalAlpha = 1;
  }
}

export function drawJinxSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  drawSpriteImage(ctx, 'jinx', jinxImg, x, y, size, isAttacking, attackAnimTimer);

  // Muzzle flash when attacking
  if (isAttacking) {
    const ps = size / 6;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(x + size * 0.9, y - size * 0.1, ps * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
