// LoL character sprite renderer using pre-generated pixel art images
// Images are loaded once, background-removed, cached, then drawn on canvas

import alistarImg from '@/assets/sprites/alistar.png';
import brandImg from '@/assets/sprites/brand.png';
import jinxImg from '@/assets/sprites/jinx.png';
import garenImg from '@/assets/sprites/garen.png';
import asheImg from '@/assets/sprites/ashe.png';
import leonaImg from '@/assets/sprites/leona.png';
import teemoImg from '@/assets/sprites/teemo.png';
import luxImg from '@/assets/sprites/lux.png';
import annieImg from '@/assets/sprites/annie.png';
import jarvanImg from '@/assets/sprites/jarvan.png';
import singedImg from '@/assets/sprites/singed.png';
import dariusImg from '@/assets/sprites/darius.png';
import lissandraImg from '@/assets/sprites/lissandra.png';
import yasuoImg from '@/assets/sprites/yasuo.png';
import rumbleImg from '@/assets/sprites/rumble.png';
import caitlynImg from '@/assets/sprites/caitlyn.png';
import threshImg from '@/assets/sprites/thresh.png';
import rivenImg from '@/assets/sprites/riven.png';
import zedImg from '@/assets/sprites/zed.png';
import volibearImg from '@/assets/sprites/volibear.png';
import aniviaImg from '@/assets/sprites/anivia.png';
import kassadinImg from '@/assets/sprites/kassadin.png';
import sonaImg from '@/assets/sprites/sona.png';
import fizzImg from '@/assets/sprites/fizz.png';

// Map character IDs to their sprite imports
const SPRITE_MAP: Record<string, string> = {
  garen: garenImg,
  ashe: asheImg,
  leona: leonaImg,
  teemo: teemoImg,
  lux: luxImg,
  annie: annieImg,
  jarvan: jarvanImg,
  singed: singedImg,
  darius: dariusImg,
  lissandra: lissandraImg,
  yasuo: yasuoImg,
  rumble: rumbleImg,
  caitlyn: caitlynImg,
  thresh: threshImg,
  riven: rivenImg,
  zed: zedImg,
  volibear: volibearImg,
  anivia: aniviaImg,
  kassadin: kassadinImg,
  sona: sonaImg,
  fizz: fizzImg,
  alistar: alistarImg,
  brand: brandImg,
  jinx: jinxImg,
};

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
      d[i + 3] = 0;
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
  for (const [key, src] of Object.entries(SPRITE_MAP)) {
    getOrLoadImage(src, key);
  }
}

// Call preload immediately
preloadLolSprites();

// Universal sprite drawer for all LoL characters
export function drawLolSprite(
  ctx: CanvasRenderingContext2D,
  charId: string,
  x: number,
  y: number,
  size: number,
  animFrame: number,
  isAttacking: boolean,
  attackAnimTimer: number
) {
  const src = SPRITE_MAP[charId];
  if (!src) return false; // not a LoL sprite

  const img = getOrLoadImage(src, charId);
  const drawSize = size * 2.2;

  // Idle bob animation
  const bob = Math.sin(animFrame * 0.08) * 1.5;

  // Attack animation
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
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return true;
}

// Check if a character ID has a LoL sprite
export function hasLolSprite(charId: string): boolean {
  return charId in SPRITE_MAP;
}

// Legacy exports for backwards compat
export function drawAlistarSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'alistar', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
export function drawBrandSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'brand', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
export function drawJinxSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'jinx', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
