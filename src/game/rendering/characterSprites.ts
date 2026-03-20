import { CharacterConfig } from '../types';
import { RARITY_COLORS } from '../data/characterData';
import { drawLolSprite, hasLolSprite } from './lolSprites';

function drawSkinOverlay(ctx: CanvasRenderingContext2D, skinId: string | undefined, x: number, y: number, size: number): void {
  if (!skinId) return;

  ctx.save();
  switch (skinId) {
    case 'jinx_neon': // cow-girl
      ctx.fillStyle = '#6b3f1d';
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.75, size * 0.55, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - size * 0.35, y - size * 0.95, size * 0.7, size * 0.25);
      break;
    case 'jinx_dark': // infernal goddess horns
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.moveTo(x - size * 0.35, y - size * 0.85);
      ctx.lineTo(x - size * 0.15, y - size * 1.25);
      ctx.lineTo(x - size * 0.02, y - size * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.35, y - size * 0.85);
      ctx.lineTo(x + size * 0.15, y - size * 1.25);
      ctx.lineTo(x + size * 0.02, y - size * 0.85);
      ctx.closePath();
      ctx.fill();
      break;
    case 'teemo_devil': // mushroom king cap
      ctx.fillStyle = '#7bed9f';
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.78, size * 0.58, size * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fffa65';
      ctx.beginPath();
      ctx.arc(x - size * 0.18, y - size * 0.78, size * 0.06, 0, Math.PI * 2);
      ctx.arc(x + size * 0.12, y - size * 0.74, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      // Generic flashy aura for custom skins
      ctx.strokeStyle = 'rgba(255, 220, 120, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  config: CharacterConfig,
  x: number,
  y: number,
  size: number,
  animFrame: number,
  isAttacking: boolean,
  attackAnimTimer: number,
  stars: number = 1,
  originalConfig?: CharacterConfig,
  skinId?: string,
): void {
  ctx.save();
  const bob = Math.sin(animFrame * 0.08) * 1.5;
  const cy = y + bob;
  const hs = size / 2;

  const rarityColor = RARITY_COLORS[config.rarity];
  ctx.shadowColor = rarityColor;
  ctx.shadowBlur = config.rarity === 'legendary' ? 12 : config.rarity === 'epic' ? 8 : 4;

  if (stars >= 2) {
    const glowColor = stars === 3 ? '#ffaa00' : '#44ccff';
    const glowSize = stars === 3 ? 20 : 14;
    const pulse = 1 + Math.sin(animFrame * 0.05) * 0.15;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowSize * pulse;

    ctx.globalAlpha = 0.15 + Math.sin(animFrame * 0.04) * 0.05;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(x, cy, size * (stars === 3 ? 1.2 : 1.0), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const hasSkin = originalConfig && (
    config.bodyColor !== originalConfig.bodyColor ||
    config.detailColor !== originalConfig.detailColor ||
    config.weaponColor !== originalConfig.weaponColor
  );
  const skinColor = hasSkin ? config.bodyColor : undefined;

  if (hasLolSprite(config.id)) {
    drawLolSprite(ctx, config.id, x, cy, size, animFrame, isAttacking, attackAnimTimer, skinColor, skinId);
    drawSkinOverlay(ctx, skinId, x, cy, size);

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

    if (stars >= 2) {
      const starY = cy - size - 6;
      ctx.font = `${stars === 3 ? 9 : 8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = stars === 3 ? '#ffcc00' : '#66ddff';
      ctx.shadowColor = stars === 3 ? '#ff8800' : '#0088ff';
      ctx.shadowBlur = 6;
      const starText = stars === 3 ? '★★★' : '★★';
      ctx.fillText(starText, x, starY);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x - hs, cy - hs, size, size);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - hs - 1, cy - hs - 1, size + 2, size + 2);

  ctx.restore();
}
