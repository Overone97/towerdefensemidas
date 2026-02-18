import { CharacterConfig } from '../types';
import { RARITY_COLORS } from '../data/characterData';
import { drawAlistarSprite, drawBrandSprite, drawJinxSprite } from './lolSprites';

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
  const ps = size / 8;
  const hs = size / 2;

  const rarityColor = RARITY_COLORS[config.rarity];
  ctx.shadowColor = rarityColor;
  ctx.shadowBlur = config.rarity === 'legendary' ? 12 : config.rarity === 'epic' ? 8 : 4;

  // LoL characters use dedicated pixel-art renderers
  const lolChars = ['alistar', 'brand', 'jinx'];
  if (lolChars.includes(config.id)) {
    switch (config.id) {
      case 'alistar':
        drawAlistarSprite(ctx, x, cy, size, animFrame, isAttacking, attackAnimTimer);
        break;
      case 'brand':
        drawBrandSprite(ctx, x, cy, size, animFrame, isAttacking, attackAnimTimer);
        break;
      case 'jinx':
        drawJinxSprite(ctx, x, cy, size, animFrame, isAttacking, attackAnimTimer);
        break;
    }

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

  // Body
  ctx.fillStyle = config.bodyColor;
  drawBody(ctx, config.id, x, cy, size, ps, hs);

  // Detail
  ctx.fillStyle = config.detailColor;
  drawDetail(ctx, config.id, x, cy, ps, hs);

  // Weapon
  ctx.fillStyle = config.weaponColor;
  const swing = isAttacking ? Math.sin(attackAnimTimer * 15) * 4 : 0;
  drawWeapon(ctx, config.id, x, cy, size, ps, hs, swing);

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
}

function drawBody(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, s: number, ps: number, hs: number) {
  switch (id) {
    case 'warrior':
      ctx.fillRect(x - hs, y - hs, s, s);
      ctx.fillRect(x - hs - ps, y - ps * 2, s + ps * 2, ps * 4);
      break;
    case 'archer':
      ctx.fillRect(x - hs + ps, y - hs, s - ps * 2, s);
      break;
    case 'guardian':
      ctx.fillRect(x - hs - ps, y - hs + ps, s + ps * 2, s - ps);
      ctx.fillRect(x - hs, y - hs, s, s);
      break;
    case 'scout':
      ctx.fillRect(x - hs + ps * 2, y - hs, s - ps * 4, s);
      ctx.fillRect(x - hs, y - ps, s, ps * 3);
      break;
    case 'apprentice':
      ctx.fillRect(x - hs, y - hs + ps * 2, s, s - ps * 2);
      ctx.fillRect(x - ps * 2, y - hs - ps * 2, ps * 4, ps * 3);
      break;
    case 'fire_mage':
      ctx.fillRect(x - hs, y - hs + ps, s, s - ps);
      ctx.fillRect(x - hs - ps, y + ps, s + ps * 2, ps * 3);
      break;
    case 'lancer':
      ctx.fillRect(x - hs + ps, y - hs, s - ps * 2, s);
      ctx.fillRect(x - hs, y - ps * 2, s, ps * 4);
      break;
    case 'alchemist':
      ctx.fillRect(x - hs, y - hs + ps * 2, s, s - ps * 2);
      ctx.fillRect(x - hs + ps, y - hs, s - ps * 2, s);
      break;
    case 'berserker':
      ctx.fillRect(x - hs - ps, y - hs, s + ps * 2, s);
      ctx.fillRect(x - hs - ps * 2, y - ps, s + ps * 4, ps * 3);
      break;
    case 'ice_mage':
      ctx.fillRect(x - hs, y - hs + ps, s, s - ps);
      ctx.fillRect(x - hs + ps, y - hs - ps, s - ps * 2, ps * 2);
      break;
    case 'dark_knight':
      ctx.fillRect(x - hs, y - hs, s, s);
      ctx.fillRect(x - hs - ps, y - ps * 2, s + ps * 2, ps * 5);
      ctx.fillRect(x - hs - ps, y - hs - ps * 2, ps * 2, ps * 2);
      ctx.fillRect(x + hs - ps, y - hs - ps * 2, ps * 2, ps * 2);
      break;
    case 'pyromancer':
      ctx.fillRect(x - hs, y - hs + ps, s, s - ps);
      ctx.fillRect(x - hs - ps, y + ps * 2, s + ps * 2, ps * 2);
      break;
    case 'sniper':
      ctx.fillRect(x - hs + ps, y - hs, s - ps * 2, s);
      break;
    case 'necromancer':
      ctx.fillRect(x - hs, y - hs + ps * 2, s, s - ps * 2);
      ctx.fillRect(x - hs + ps, y - hs, s - ps * 2, ps * 3);
      ctx.fillRect(x - ps * 2, y - hs - ps, ps * 4, ps);
      break;
    case 'dragon_slayer':
      ctx.fillRect(x - hs, y - hs, s, s);
      ctx.fillRect(x - hs - ps * 2, y - ps, s + ps * 4, ps * 3);
      break;
    case 'shadow_assassin':
      ctx.fillRect(x - hs + ps * 2, y - hs, s - ps * 4, s);
      ctx.fillRect(x - hs, y - ps, s, ps * 2);
      break;
    case 'storm_lord':
      ctx.fillRect(x - hs, y - hs + ps, s, s - ps);
      ctx.fillRect(x - hs - ps, y - hs, s + ps * 2, ps * 3);
      break;
    case 'phoenix':
      ctx.fillRect(x - hs + ps, y - hs + ps, s - ps * 2, s - ps * 2);
      ctx.fillRect(x - hs - ps * 2, y - ps, ps * 3, ps * 3);
      ctx.fillRect(x + hs - ps, y - ps, ps * 3, ps * 3);
      break;
    case 'void_walker':
      ctx.fillRect(x - hs, y - hs, s, s);
      break;
    case 'celestial':
      ctx.fillRect(x - hs + ps, y - hs + ps, s - ps * 2, s - ps * 2);
      break;
    default:
      ctx.fillRect(x - hs, y - hs, s, s);
  }
}

function drawDetail(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, ps: number, hs: number) {
  switch (id) {
    case 'warrior':
      ctx.fillRect(x - ps * 2, y - hs + ps, ps * 4, ps * 2);
      break;
    case 'guardian':
      ctx.fillRect(x - ps * 3, y - hs + ps, ps * 6, ps * 3);
      break;
    case 'berserker':
      ctx.fillRect(x - ps * 2, y - hs + ps, ps, ps * 2);
      ctx.fillRect(x + ps, y - hs + ps, ps, ps * 2);
      break;
    case 'dark_knight':
      ctx.fillRect(x - ps * 2, y - hs + ps * 2, ps * 4, ps);
      break;
    case 'void_walker':
      ctx.fillStyle = '#110022';
      ctx.beginPath();
      ctx.arc(x, y, ps * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.fillRect(x - ps, y - hs + ps * 2, ps * 2, ps);
      break;
  }
}

function drawWeapon(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, s: number, ps: number, hs: number, swing: number) {
  switch (id) {
    case 'warrior':
      ctx.fillRect(x + hs + 1, y - ps * 2 + swing, ps * 2, ps * 6);
      ctx.fillRect(x + hs - ps, y + swing, ps * 4, ps);
      break;
    case 'archer':
      ctx.beginPath();
      ctx.arc(x + hs + 2, y + swing, ps * 4, -0.4 * Math.PI, 0.4 * Math.PI);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      break;
    case 'guardian':
      ctx.fillRect(x - hs - ps * 3, y - ps * 3, ps * 3, ps * 6);
      break;
    case 'scout':
      ctx.fillRect(x + hs + 1, y - ps + swing, ps, ps * 4);
      ctx.fillRect(x - hs - ps - 1, y - ps - swing, ps, ps * 4);
      break;
    case 'apprentice':
    case 'fire_mage':
    case 'ice_mage':
    case 'necromancer':
    case 'storm_lord':
      ctx.fillRect(x + hs + 2, y - hs - ps * 2 + swing, ps, ps * 2 + s);
      ctx.beginPath();
      ctx.arc(x + hs + 2 + ps / 2, y - hs - ps * 2 + swing, ps * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'lancer':
      ctx.fillRect(x + ps, y - hs - ps * 4 + swing, ps, ps * 4);
      ctx.beginPath();
      ctx.moveTo(x, y - hs - ps * 4 + swing);
      ctx.lineTo(x + ps * 2, y - hs - ps * 4 + swing);
      ctx.lineTo(x + ps, y - hs - ps * 6 + swing);
      ctx.fill();
      break;
    case 'alchemist':
      ctx.fillRect(x + hs + 1, y - ps * 2 + swing, ps * 2, ps * 3);
      ctx.fillRect(x + hs, y - ps * 3 + swing, ps * 3, ps);
      break;
    case 'berserker':
      ctx.fillRect(x + hs + 1, y - ps * 3 + swing, ps, ps * 6);
      ctx.fillRect(x + hs + ps + 1, y - ps * 3 + swing, ps * 2, ps * 3);
      break;
    case 'dark_knight':
      ctx.fillRect(x + hs + 1, y - ps * 3 + swing, ps * 2, ps * 7);
      break;
    case 'pyromancer':
      ctx.fillRect(x - hs - ps * 2, y - hs + swing, ps, s);
      break;
    case 'sniper':
      ctx.fillRect(x + hs + 1, y - ps + swing, ps * 6, ps * 2);
      break;
    case 'dragon_slayer':
      ctx.fillRect(x + hs + 1, y - hs - ps * 2 + swing, ps * 3, ps * 2 + s);
      break;
    case 'shadow_assassin':
      ctx.fillRect(x + hs + 1, y - ps * 2 + swing, ps, ps * 5);
      ctx.fillRect(x - hs - ps - 1, y - ps * 2 - swing, ps, ps * 5);
      break;
    case 'phoenix':
      ctx.fillRect(x - hs - ps * 3, y - ps + swing, ps * 2, ps * 2);
      ctx.fillRect(x + hs + ps, y - ps - swing, ps * 2, ps * 2);
      break;
    case 'void_walker':
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - hs, y + swing);
      ctx.quadraticCurveTo(x - hs - ps * 3, y - ps * 2, x - hs - ps * 2, y - ps * 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + hs, y - swing);
      ctx.quadraticCurveTo(x + hs + ps * 3, y - ps * 2, x + hs + ps * 2, y - ps * 4);
      ctx.stroke();
      break;
    case 'celestial':
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x - hs - ps * 3, y - ps * 2 + swing, ps * 2, ps * 4);
      ctx.fillRect(x + hs + ps, y - ps * 2 - swing, ps * 2, ps * 4);
      ctx.globalAlpha = 1;
      // Halo
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - hs - ps * 2, ps * 3, ps, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}
