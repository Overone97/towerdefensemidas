import { EnemyType } from '../types';

// Import enemy sprites
import minionSprite from '../../assets/sprites/enemy-minion.png';
import scuttlerSprite from '../../assets/sprites/enemy-scuttler.png';
import bramblebackSprite from '../../assets/sprites/enemy-brambleback.png';
import superminionSprite from '../../assets/sprites/enemy-superminion.png';
import dragonFireSprite from '../../assets/sprites/enemy-dragon-fire.png';
import dragonIceSprite from '../../assets/sprites/enemy-dragon-ice.png';
import dragonEarthSprite from '../../assets/sprites/enemy-dragon-earth.png';
import dragonAirSprite from '../../assets/sprites/enemy-dragon-air.png';
import baronSprite from '../../assets/sprites/enemy-baron.png';

const ENEMY_SPRITE_MAP: Record<EnemyType, string> = {
  normal: minionSprite,
  fast: scuttlerSprite,
  tank: bramblebackSprite,
  armored: superminionSprite,
  dragon_fire: dragonFireSprite,
  dragon_ice: dragonIceSprite,
  dragon_earth: dragonEarthSprite,
  dragon_air: dragonAirSprite,
  boss: baronSprite,
};

// Cache cleaned (background-removed) sprites
const cleanedCache: Map<string, HTMLCanvasElement> = new Map();
const loadingSet: Set<string> = new Set();

function removeBackground(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  // Sample top-left pixel as background color
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

function getOrLoadCleanedImage(src: string, key: string): HTMLCanvasElement | null {
  const cached = cleanedCache.get(key);
  if (cached) return cached;

  if (!loadingSet.has(key)) {
    loadingSet.add(key);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const cleaned = removeBackground(img);
      cleanedCache.set(key, cleaned);
      loadingSet.delete(key);
    };
    img.onerror = () => {
      loadingSet.delete(key);
    };
  }
  return null;
}

export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number,
  y: number,
  size: number,
  animFrame: number,
  bodyColor: string,
  strokeColor: string
): void {
  const spriteSrc = ENEMY_SPRITE_MAP[type];
  const img = spriteSrc ? getOrLoadCleanedImage(spriteSrc, type) : null;

  ctx.save();
  const bob = Math.sin(animFrame * 0.1) * 1.5;
  const cy = y + bob;

  if (img) {
    const isBoss = type === 'boss';
    const isDragon = type.startsWith('dragon_');
    const scale = isBoss ? 3.0 : isDragon ? 2.6 : 2.2;
    const s = size * scale;
    ctx.drawImage(img, x - s / 2, cy - s / 2, s, s);
  } else {
    drawFallbackSprite(ctx, type, x, cy, size, animFrame, bodyColor, strokeColor);
  }

  ctx.restore();
}

function drawFallbackSprite(
  ctx: CanvasRenderingContext2D,
  type: EnemyType,
  x: number, y: number,
  size: number, anim: number,
  body: string, stroke: string
): void {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y - size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

export function preloadEnemySprites(): void {
  Object.entries(ENEMY_SPRITE_MAP).forEach(([key, src]) => getOrLoadCleanedImage(src, key));
}

// Preload on import
preloadEnemySprites();
