import { CharacterConfig } from '../types';
import { RARITY_COLORS } from '../data/characterData';
import { drawLolSprite, hasLolSprite } from './lolSprites';

export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  config: CharacterConfig,
  x: number,
  y: number,
  size: number,
  animFrame: number,
  isAttacking: boolean,
  attackAnimTimer: number
): void {
  ctx.save();
  const bob = Math.sin(animFrame * 0.08) * 1.5;
  const cy = y + bob;
  const hs = size / 2;

  const rarityColor = RARITY_COLORS[config.rarity];
  ctx.shadowColor = rarityColor;
  ctx.shadowBlur = config.rarity === 'legendary' ? 12 : config.rarity === 'epic' ? 8 : 4;

  // All characters use LoL sprite renderer
  if (hasLolSprite(config.id)) {
    drawLolSprite(ctx, config.id, x, cy, size, animFrame, isAttacking, attackAnimTimer);

    // Attack flash
    if (isAttacking && attackAnimTimer > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = config.weaponColor;
      ctx.beginPath();
      ctx.arc(x, cy, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Rarity border
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = config.rarity === 'legendary' ? 2.5 : config.rarity === 'epic' ? 2 : 1;
    ctx.strokeRect(x - hs - 1, cy - hs - 1, size + 2, size + 2);

    ctx.restore();
    return;
  }

  // Fallback: simple colored square (should not happen with full roster)
  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x - hs, cy - hs, size, size);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - hs - 1, cy - hs - 1, size + 2, size + 2);

  ctx.restore();
}
