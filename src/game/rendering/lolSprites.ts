// LoL character sprite renderer using pre-generated pixel art images
// Images are loaded once, background-removed, cached, then drawn on canvas

import alistarImg from '@/assets/sprites/alistar.png';
import brandImg from '@/assets/sprites/brand.png';
import jinxImg from '@/assets/sprites/jinx.png';

// Image cache (cleaned versions without background)
const imageCache: Map<string, HTMLCanvasElement> = new Map();
const loadingImages: Set<string> = new Set();

function removeBackground(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  // Sample corner pixel as background color
  const bgR = d[0], bgG = d[1], bgB = d[2];
  const threshold = 40;
  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - bgR);
    const dg = Math.abs(d[i + 1] - bgG);
    const db = Math.abs(d[i + 2] - bgB);
    if (dr < threshold && dg < threshold && db < threshold) {
      d[i + 3] = 0; // make transparent
    }
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function getOrLoadImage(src: string, key: string): HTMLCanvasElement | null {
  const cached = imageCache.get(key);
  if (cached) return cached;

  if (!loadingImages.has(key)) {
    loadingImages.add(key);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const cleaned = removeBackground(img);
      imageCache.set(key, cleaned);
      loadingImages.delete(key);
    };
    img.onerror = () => {
      loadingImages.delete(key);
    };
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
  animFrame: number,
  isAttacking: boolean,
  attackAnimTimer: number
) {
  const img = getOrLoadImage(src, key);
  const drawSize = size * 2.2;
  
  // Idle bob animation
  const bob = Math.sin(animFrame * 0.08) * 1.5;
  
  // Attack animation: lean forward + scale pulse
  let swing = 0;
  let pulse = 1;
  let tilt = 0;
  if (isAttacking) {
    swing = Math.sin(attackAnimTimer * 15) * 2;
    pulse = 1 + Math.sin(attackAnimTimer * 12) * 0.12;
    tilt = Math.sin(attackAnimTimer * 10) * 0.08;
  }

  if (img) {
    ctx.save();
    ctx.translate(x, y + bob + swing);
    ctx.rotate(tilt);
    ctx.scale(pulse, pulse);
    ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
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
  drawSpriteImage(ctx, 'alistar', alistarImg, x, y, size, animFrame, isAttacking, attackAnimTimer);

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
  drawSpriteImage(ctx, 'brand', brandImg, x, y, size, animFrame, isAttacking, attackAnimTimer);

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
  drawSpriteImage(ctx, 'jinx', jinxImg, x, y, size, animFrame, isAttacking, attackAnimTimer);

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
