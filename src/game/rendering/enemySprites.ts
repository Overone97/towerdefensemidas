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

const imageCache: Map<string, HTMLImageElement> = new Map();

function getOrLoadImage(src: string): HTMLImageElement | null {
  const cached = imageCache.get(src);
  if (cached) return cached.complete ? cached : null;
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return img.complete ? img : null;
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
  const img = spriteSrc ? getOrLoadImage(spriteSrc) : null;

  ctx.save();
  const bob = Math.sin(animFrame * 0.1) * 1.5;
  const cy = y + bob;

  if (img) {
    // Draw PNG sprite with background removal
    const drawSize = size * 2.2;
    const isBoss = type === 'boss';
    const isDragon = type.startsWith('dragon_');
    const scale = isBoss ? 3.0 : isDragon ? 2.6 : 2.2;
    const s = size * scale;

    ctx.drawImage(img, x - s / 2, cy - s / 2, s, s);
  } else {
    // Fallback to procedural drawing
    drawFallbackSprite(ctx, type, x, cy, size, animFrame, bodyColor, strokeColor);
  }

  ctx.restore();
}

// Simple procedural fallback if images fail to load
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

  // Eyes
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y - size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.15, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

export function preloadEnemySprites(): void {
  Object.values(ENEMY_SPRITE_MAP).forEach(src => getOrLoadImage(src));
}
