import { EnemyType } from '../types';

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
  ctx.save();
  const bob = Math.sin(animFrame * 0.1) * 1;
  const cy = y + bob;
  const ps = size / 4; // pixel size unit

  switch (type) {
    case 'normal':
      drawNormalSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame);
      break;
    case 'fast':
      drawFastSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame);
      break;
    case 'tank':
      drawTankSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame);
      break;
    case 'armored':
      drawArmoredSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame);
      break;
    case 'boss':
      drawBossSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame);
      break;
  }

  ctx.restore();
}

/** Normal: petit soldat rond avec des yeux et des jambes */
function drawNormalSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Body - rounded square
  ctx.fillStyle = body;
  ctx.fillRect(x - size + ps, y - size, size * 2 - ps * 2, size * 2);
  ctx.fillRect(x - size, y - size + ps, size * 2, size * 2 - ps * 2);

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - ps * 1.5, y - ps * 1.5, ps * 1.2, ps * 1.2);
  ctx.fillRect(x + ps * 0.3, y - ps * 1.5, ps * 1.2, ps * 1.2);
  // Pupils
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - ps, y - ps, ps * 0.6, ps * 0.6);
  ctx.fillRect(x + ps * 0.6, y - ps, ps * 0.6, ps * 0.6);

  // Legs (animated)
  const legOffset = Math.sin(anim * 0.15) * ps;
  ctx.fillStyle = body;
  ctx.fillRect(x - ps * 1.5, y + size - ps * 0.5, ps, ps * 1.5 + legOffset);
  ctx.fillRect(x + ps * 0.5, y + size - ps * 0.5, ps, ps * 1.5 - legOffset);

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size + ps * 0.5, y - size + ps * 0.5, size * 2 - ps, size * 2 - ps);
}

/** Fast: forme aérodynamique, petit, avec une traînée de vitesse */
function drawFastSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Diamond/arrow body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.8, y);
  ctx.lineTo(x + ps, y + size * 0.6);
  ctx.lineTo(x - ps, y + size * 0.6);
  ctx.lineTo(x - size * 0.8, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eye (single visor)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - ps * 1.5, y - ps * 1.2, ps * 3, ps * 0.8);
  ctx.fillStyle = '#002211';
  ctx.fillRect(x - ps, y - ps, ps * 2, ps * 0.5);

  // Speed trails
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const trail = i * ps * 1.2;
    const fade = 0.3 - i * 0.08;
    ctx.globalAlpha = fade;
    ctx.beginPath();
    ctx.moveTo(x - ps * 0.5, y + size * 0.6 + trail);
    ctx.lineTo(x + ps * 0.5, y + size * 0.6 + trail);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Small wings
  const wingFlap = Math.sin(anim * 0.3) * ps * 0.5;
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.8, y);
  ctx.lineTo(x - size * 1.2, y - ps + wingFlap);
  ctx.lineTo(x - size * 0.5, y + ps);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.8, y);
  ctx.lineTo(x + size * 1.2, y - ps - wingFlap);
  ctx.lineTo(x + size * 0.5, y + ps);
  ctx.fill();
}

/** Tank: gros carré blindé avec chenilles */
function drawTankSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Tracks
  const trackAnim = (anim * 0.1) % (ps * 2);
  ctx.fillStyle = '#555566';
  ctx.fillRect(x - size - ps, y - size * 0.6, ps * 1.5, size * 1.8);
  ctx.fillRect(x + size - ps * 0.5, y - size * 0.6, ps * 1.5, size * 1.8);
  // Track marks
  ctx.fillStyle = '#444455';
  for (let i = 0; i < 4; i++) {
    const ty = y - size * 0.5 + i * ps + trackAnim;
    if (ty < y + size * 0.8) {
      ctx.fillRect(x - size - ps, ty, ps * 1.5, ps * 0.3);
      ctx.fillRect(x + size - ps * 0.5, ty, ps * 1.5, ps * 0.3);
    }
  }

  // Main body
  ctx.fillStyle = body;
  ctx.fillRect(x - size, y - size * 0.7, size * 2, size * 1.6);

  // Turret
  ctx.fillStyle = stroke;
  ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size * 0.8);

  // Cannon
  ctx.fillStyle = '#aaaabb';
  ctx.fillRect(x - ps * 0.4, y - size, ps * 0.8, size * 0.6);

  // Viewport slit
  ctx.fillStyle = '#aaccff';
  ctx.fillRect(x - ps * 1.5, y - ps * 0.3, ps * 3, ps * 0.5);

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - size, y - size * 0.7, size * 2, size * 1.6);
}

/** Armored: chevalier hexagonal avec bouclier */
function drawArmoredSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Shield (front)
  ctx.fillStyle = '#887744';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.9, y - size * 0.6);
  ctx.lineTo(x - size * 0.3, y - size);
  ctx.lineTo(x - size * 0.3, y + size * 0.8);
  ctx.lineTo(x - size * 0.9, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ccaa44';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Shield cross
  ctx.strokeStyle = '#ccaa44';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.6, y - size * 0.5);
  ctx.lineTo(x - size * 0.6, y + size * 0.5);
  ctx.moveTo(x - size * 0.8, y);
  ctx.lineTo(x - size * 0.4, y);
  ctx.stroke();

  // Armored body
  ctx.fillStyle = body;
  ctx.fillRect(x - size * 0.3, y - size * 0.8, size * 1.3, size * 1.7);

  // Helmet
  ctx.fillStyle = stroke;
  ctx.fillRect(x - ps * 0.5, y - size, size * 0.6, ps * 1.5);
  // Helmet plume
  ctx.fillStyle = '#cc4444';
  ctx.fillRect(x + ps * 0.5, y - size - ps, ps * 0.6, ps);

  // Visor
  ctx.fillStyle = '#222222';
  ctx.fillRect(x + ps * 0.2, y - size * 0.6, ps * 1.5, ps * 0.5);

  // Legs
  const step = Math.sin(anim * 0.1) * ps * 0.5;
  ctx.fillStyle = body;
  ctx.fillRect(x, y + size * 0.7, ps, ps * 1.5 + step);
  ctx.fillRect(x + size * 0.6, y + size * 0.7, ps, ps * 1.5 - step);

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size * 0.3, y - size * 0.8, size * 1.3, size * 1.7);
}

/** Boss: grande créature imposante avec aura et cornes */
function drawBossSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Aura
  const auraSize = size * 1.4 + Math.sin(anim * 0.05) * ps;
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = stroke;
  ctx.beginPath();
  ctx.arc(x, y, auraSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Horns
  ctx.fillStyle = '#ddcc88';
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.6, y - size * 0.7);
  ctx.lineTo(x - size * 1.1, y - size * 1.4);
  ctx.lineTo(x - size * 0.3, y - size * 0.5);
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + size * 0.6, y - size * 0.7);
  ctx.lineTo(x + size * 1.1, y - size * 1.4);
  ctx.lineTo(x + size * 0.3, y - size * 0.5);
  ctx.fill();

  // Main body
  ctx.fillStyle = body;
  ctx.fillRect(x - size, y - size * 0.7, size * 2, size * 1.8);
  ctx.fillRect(x - size * 0.7, y - size, size * 1.4, size * 2);

  // Face
  // Eyes (glowing)
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x - ps * 2.5, y - ps * 1.5, ps * 1.5, ps * 1.2);
  ctx.fillRect(x + ps, y - ps * 1.5, ps * 1.5, ps * 1.2);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Mouth
  ctx.fillStyle = '#220000';
  ctx.fillRect(x - ps * 1.5, y + ps * 0.5, ps * 3, ps);
  // Teeth
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - ps, y + ps * 0.5, ps * 0.5, ps * 0.5);
  ctx.fillRect(x + ps * 0.5, y + ps * 0.5, ps * 0.5, ps * 0.5);

  // Arms
  const armSwing = Math.sin(anim * 0.08) * ps;
  ctx.fillStyle = body;
  ctx.fillRect(x - size - ps * 2, y - ps * 2 + armSwing, ps * 2, size);
  ctx.fillRect(x + size, y - ps * 2 - armSwing, ps * 2, size);
  // Claws
  ctx.fillStyle = '#ddcc88';
  ctx.fillRect(x - size - ps * 2, y + size * 0.5 + armSwing, ps * 0.6, ps);
  ctx.fillRect(x - size - ps, y + size * 0.5 + armSwing, ps * 0.6, ps);
  ctx.fillRect(x + size + ps * 0.5, y + size * 0.5 - armSwing, ps * 0.6, ps);
  ctx.fillRect(x + size + ps * 1.5, y + size * 0.5 - armSwing, ps * 0.6, ps);

  // Crown/crest glow
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - size, y - size * 0.7, size * 2, size * 1.8);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}
