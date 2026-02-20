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
  const ps = size / 4;

  switch (type) {
    case 'normal': drawMinionSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame); break;
    case 'fast': drawScuttleSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame); break;
    case 'tank': drawBramblebackSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame); break;
    case 'armored': drawSuperMinionSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame); break;
    case 'dragon_fire': drawDragonSprite(ctx, x, cy, size, ps, '#FF4400', '#FF8844', animFrame, 'fire'); break;
    case 'dragon_ice': drawDragonSprite(ctx, x, cy, size, ps, '#2299FF', '#66CCFF', animFrame, 'ice'); break;
    case 'dragon_earth': drawDragonSprite(ctx, x, cy, size, ps, '#886633', '#BBAA55', animFrame, 'earth'); break;
    case 'dragon_air': drawDragonSprite(ctx, x, cy, size, ps, '#CCCCDD', '#EEEEFF', animFrame, 'air'); break;
    case 'boss': drawBaronAtakhanSprite(ctx, x, cy, size, ps, bodyColor, strokeColor, animFrame); break;
  }
  ctx.restore();
}

/** Melee Minion - petit corps violet arrondi, baton, yeux jaunes */
function drawMinionSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Body - rounded
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Head bump
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Eyes - yellow glowing
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(x - ps * 1.2, y - size * 0.6, ps * 0.8, ps * 0.6);
  ctx.fillRect(x + ps * 0.4, y - size * 0.6, ps * 0.8, ps * 0.6);
  ctx.shadowBlur = 0;

  // Staff/baton
  ctx.strokeStyle = '#AA8844';
  ctx.lineWidth = 1.5;
  const staffX = x + size * 0.6;
  ctx.beginPath();
  ctx.moveTo(staffX, y - size * 0.8);
  ctx.lineTo(staffX, y + size * 0.6);
  ctx.stroke();
  // Staff tip
  ctx.fillStyle = '#DDAA33';
  ctx.beginPath();
  ctx.arc(staffX, y - size * 0.8, ps * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Legs (animated)
  const legOff = Math.sin(anim * 0.15) * ps;
  ctx.fillStyle = body;
  ctx.fillRect(x - ps * 1.2, y + size * 0.5, ps, ps * 1.2 + legOff);
  ctx.fillRect(x + ps * 0.2, y + size * 0.5, ps, ps * 1.2 - legOff);

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.stroke();
}

/** Scuttle Crab - carapace ovale cyan, 6 pattes animées */
function drawScuttleSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Water trail
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#44DDFF';
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x - i * ps * 1.5, y + ps * 0.5, ps * (1.2 - i * 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Shell (oval)
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Shell pattern
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4);
  ctx.lineTo(x, y + size * 0.4);
  ctx.stroke();

  // 6 legs (3 per side, animated)
  ctx.strokeStyle = body;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const lx = x - size * 0.5 + i * size * 0.5;
    const phase = anim * 0.25 + i * 1.2;
    const legY = Math.sin(phase) * ps * 0.8;
    // Top legs
    ctx.beginPath();
    ctx.moveTo(lx, y - size * 0.3);
    ctx.lineTo(lx - ps, y - size * 0.7 + legY);
    ctx.stroke();
    // Bottom legs
    ctx.beginPath();
    ctx.moveTo(lx, y + size * 0.3);
    ctx.lineTo(lx - ps, y + size * 0.7 - legY);
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(x + size * 0.4, y - ps * 0.5, ps * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.4, y + ps * 0.5, ps * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/** Red Brambleback - corps massif rouge, flammes sur le dos */
function drawBramblebackSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Fire particles on back
  for (let i = 0; i < 5; i++) {
    const fx = x + Math.sin(anim * 0.12 + i * 1.3) * size * 0.4;
    const fy = y - size * 0.6 - Math.abs(Math.sin(anim * 0.15 + i)) * ps * 2;
    const fSize = ps * (0.6 + Math.sin(anim * 0.2 + i) * 0.3);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = i % 2 === 0 ? '#FF6600' : '#FFAA00';
    ctx.beginPath();
    ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Main body - massive
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rocky texture lines
  ctx.strokeStyle = '#993300';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.2);
  ctx.lineTo(x + size * 0.2, y - size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.1);
  ctx.lineTo(x + size * 0.4, y - size * 0.1);
  ctx.stroke();

  // Claws
  const clawSwing = Math.sin(anim * 0.1) * ps * 0.5;
  ctx.fillStyle = '#882200';
  // Left claw
  ctx.beginPath();
  ctx.moveTo(x - size * 0.8, y + ps);
  ctx.lineTo(x - size * 1.2, y - ps + clawSwing);
  ctx.lineTo(x - size * 1.1, y + ps * 0.5 + clawSwing);
  ctx.closePath();
  ctx.fill();
  // Right claw
  ctx.beginPath();
  ctx.moveTo(x + size * 0.8, y + ps);
  ctx.lineTo(x + size * 1.2, y - ps - clawSwing);
  ctx.lineTo(x + size * 1.1, y + ps * 0.5 - clawSwing);
  ctx.closePath();
  ctx.fill();

  // Eyes - red glow
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#FF3300';
  ctx.fillRect(x - ps * 1.5, y - ps * 1, ps, ps * 0.7);
  ctx.fillRect(x + ps * 0.5, y - ps * 1, ps, ps * 0.7);
  ctx.shadowBlur = 0;

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/** Super Minion - corps large violet, épaulettes et casque dorés */
function drawSuperMinionSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Magic glow aura
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#AA66FF';
  ctx.beginPath();
  ctx.arc(x, y, size * 1.2 + Math.sin(anim * 0.06) * ps, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Main body - wide
  ctx.fillStyle = body;
  ctx.fillRect(x - size * 0.7, y - size * 0.6, size * 1.4, size * 1.4);

  // Golden shoulder pads
  ctx.fillStyle = '#DDAA33';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.7, y - size * 0.4);
  ctx.lineTo(x - size * 1.1, y - size * 0.6);
  ctx.lineTo(x - size * 0.7, y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.7, y - size * 0.4);
  ctx.lineTo(x + size * 1.1, y - size * 0.6);
  ctx.lineTo(x + size * 0.7, y);
  ctx.closePath();
  ctx.fill();

  // Golden helmet
  ctx.fillStyle = '#DDAA33';
  ctx.fillRect(x - ps * 1.5, y - size * 0.9, ps * 3, ps * 1.5);
  // Helmet crest
  ctx.fillStyle = '#FFcc44';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.9);
  ctx.lineTo(x - ps * 0.5, y - size * 1.2);
  ctx.lineTo(x + ps * 0.5, y - size * 1.2);
  ctx.closePath();
  ctx.fill();

  // Visor - glowing
  ctx.shadowColor = '#AA66FF';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#CC88FF';
  ctx.fillRect(x - ps * 1, y - size * 0.55, ps * 2, ps * 0.5);
  ctx.shadowBlur = 0;

  // Legs
  const step = Math.sin(anim * 0.1) * ps * 0.5;
  ctx.fillStyle = body;
  ctx.fillRect(x - ps * 1.5, y + size * 0.6, ps * 1.2, ps * 1.5 + step);
  ctx.fillRect(x + ps * 0.3, y + size * 0.6, ps * 1.2, ps * 1.5 - step);

  // Outline
  ctx.strokeStyle = '#DDAA33';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - size * 0.7, y - size * 0.6, size * 1.4, size * 1.4);
}

/** Dragon - sprite partagé avec effets élémentaires */
function drawDragonSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number,
  element: 'fire' | 'ice' | 'earth' | 'air'
) {
  // Element-specific aura
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = body;
  const auraSize = size * 1.5 + Math.sin(anim * 0.06) * ps;
  ctx.beginPath();
  ctx.arc(x, y, auraSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Element particles
  drawElementParticles(ctx, x, y, size, ps, anim, element);

  // Wings
  const wingFlap = Math.sin(anim * 0.12) * size * 0.3;
  ctx.fillStyle = body;
  ctx.globalAlpha = 0.7;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.2);
  ctx.lineTo(x - size * 1.6, y - size * 0.8 + wingFlap);
  ctx.lineTo(x - size * 1.3, y + ps + wingFlap * 0.5);
  ctx.lineTo(x - size * 0.4, y + size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, y - size * 0.2);
  ctx.lineTo(x + size * 1.6, y - size * 0.8 - wingFlap);
  ctx.lineTo(x + size * 1.3, y + ps - wingFlap * 0.5);
  ctx.lineTo(x + size * 0.4, y + size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.65, size * 0.35, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = stroke;
  ctx.beginPath();
  ctx.moveTo(x - ps * 1, y - size * 0.8);
  ctx.lineTo(x - ps * 2, y - size * 1.3);
  ctx.lineTo(x - ps * 0.5, y - size * 0.7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + ps * 1, y - size * 0.8);
  ctx.lineTo(x + ps * 2, y - size * 1.3);
  ctx.lineTo(x + ps * 0.5, y - size * 0.7);
  ctx.fill();

  // Eyes
  const eyeColor = element === 'fire' ? '#FFAA00' : element === 'ice' ? '#FFFFFF' : element === 'earth' ? '#FFDD00' : '#AADDFF';
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 5;
  ctx.fillStyle = eyeColor;
  ctx.fillRect(x - ps * 1.2, y - size * 0.75, ps * 0.7, ps * 0.5);
  ctx.fillRect(x + ps * 0.5, y - size * 0.75, ps * 0.7, ps * 0.5);
  ctx.shadowBlur = 0;

  // Tail
  ctx.strokeStyle = body;
  ctx.lineWidth = ps * 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.6);
  ctx.quadraticCurveTo(x + size * 0.5, y + size * 1.2, x + size * 0.8, y + size * 0.8);
  ctx.stroke();

  // Outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawElementParticles(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, anim: number, element: string
) {
  for (let i = 0; i < 6; i++) {
    const angle = (anim * 0.03 + i * Math.PI / 3);
    const dist = size * 1.2 + Math.sin(anim * 0.08 + i) * ps;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const pSize = ps * (0.4 + Math.sin(anim * 0.1 + i) * 0.2);

    ctx.globalAlpha = 0.5;
    switch (element) {
      case 'fire':
        ctx.fillStyle = i % 2 === 0 ? '#FF6600' : '#FFCC00';
        ctx.beginPath(); ctx.arc(px, py, pSize, 0, Math.PI * 2); ctx.fill();
        break;
      case 'ice':
        ctx.fillStyle = '#AAEEFF';
        ctx.fillRect(px - pSize, py - pSize, pSize * 2, pSize * 2);
        break;
      case 'earth':
        ctx.fillStyle = '#997744';
        ctx.fillRect(px - pSize, py - pSize, pSize * 1.5, pSize * 1.5);
        break;
      case 'air':
        ctx.strokeStyle = '#DDDDEE';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, pSize * 1.5, 0, Math.PI);
        ctx.stroke();
        break;
    }
    ctx.globalAlpha = 1;
  }
}

/** Baron Nashor (waves 40) / Atakhan (wave 50) */
function drawBaronAtakhanSprite(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  size: number, ps: number, body: string, stroke: string, anim: number
) {
  // Pulsating aura
  const auraSize = size * 1.6 + Math.sin(anim * 0.05) * ps * 2;
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = stroke;
  ctx.beginPath();
  ctx.arc(x, y, auraSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#FF0044';
  ctx.beginPath();
  ctx.arc(x, y, auraSize * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Tentacles (6 animated)
  ctx.strokeStyle = body;
  ctx.lineWidth = ps * 0.8;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.sin(anim * 0.04 + i) * 0.3;
    const tentLen = size * 1.3;
    const tx = x + Math.cos(angle) * tentLen;
    const ty = y + Math.sin(angle) * tentLen;
    const midX = x + Math.cos(angle) * tentLen * 0.5 + Math.sin(anim * 0.08 + i) * ps;
    const midY = y + Math.sin(angle) * tentLen * 0.5 + Math.cos(anim * 0.08 + i) * ps;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(midX, midY, tx, ty);
    ctx.stroke();
    // Tentacle tip
    ctx.fillStyle = stroke;
    ctx.beginPath();
    ctx.arc(tx, ty, ps * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main body - serpentine
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Central eye
  ctx.shadowColor = '#FFAA00';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, ps * 2, ps * 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = '#220000';
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, ps * 0.8, ps * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mouth with teeth
  ctx.fillStyle = '#220022';
  ctx.fillRect(x - ps * 2, y + size * 0.3, ps * 4, ps * 1.5);
  ctx.fillStyle = '#FFDDAA';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - ps * 1.5 + i * ps, y + size * 0.3, ps * 0.4, ps * 0.7);
  }

  // Crown spikes
  ctx.fillStyle = '#DDAA44';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * ps * 1.2, y - size * 0.8);
    ctx.lineTo(x + i * ps * 1.2 - ps * 0.3, y - size * 1.3 - Math.abs(i) * ps * 0.3);
    ctx.lineTo(x + i * ps * 1.2 + ps * 0.3, y - size * 1.3 - Math.abs(i) * ps * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing outline
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 6;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}
