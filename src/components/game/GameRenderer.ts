import { GameState, Enemy, PlacedUnit, Projectile, Slot } from '../../game/types';
import { WAYPOINTS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import { getCharacterStats } from '../../game/data/characterData';
import { drawCharacterSprite } from '../../game/rendering/characterSprites';

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#1a2a3a';
  for (let x = 0; x < w; x += 40) {
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPath(ctx);
  drawSlots(ctx, state.slots, state.selectedSlotIndex);
  drawEnemies(ctx, state.enemies);
  drawUnits(ctx, state.placedUnits, state.selectedUnitId, state.enemies);
  drawProjectiles(ctx, state.projectiles);
  drawBase(ctx);
}

function drawPath(ctx: CanvasRenderingContext2D): void {
  if (WAYPOINTS.length < 2) return;
  ctx.strokeStyle = '#2a3a4a';
  ctx.lineWidth = 30;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
  ctx.stroke();

  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 32;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  for (let i = 1; i < WAYPOINTS.length; i++) ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSlots(ctx: CanvasRenderingContext2D, slots: Slot[], selectedIndex: number | null): void {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.unitId !== null) continue;
    const isSelected = selectedIndex === i;

    ctx.beginPath();
    ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? 'rgba(68, 136, 255, 0.3)' : 'rgba(68, 136, 255, 0.1)';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#4488ff' : '#335588';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = isSelected ? '#4488ff' : '#335588';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slot.x - 6, slot.y);
    ctx.lineTo(slot.x + 6, slot.y);
    ctx.moveTo(slot.x, slot.y - 6);
    ctx.lineTo(slot.x, slot.y + 6);
    ctx.stroke();
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const isPoisoned = enemy.statusEffects.some(e => e.type === 'poison');
    const isSlowed = enemy.statusEffects.some(e => e.type === 'slow');
    const isBurning = enemy.statusEffects.some(e => e.type === 'burn');

    // Status effect glow
    if (isPoisoned || isBurning) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = isBurning ? 'rgba(255, 100, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
      ctx.fill();
    }

    ctx.save();
    const bob = Math.sin(enemy.animFrame * 0.1) * 1;

    switch (enemy.type) {
      case 'fast':
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.size + bob);
        ctx.lineTo(enemy.x + enemy.size, enemy.y + bob);
        ctx.lineTo(enemy.x, enemy.y + enemy.size + bob);
        ctx.lineTo(enemy.x - enemy.size, enemy.y + bob);
        ctx.closePath();
        break;

      case 'tank':
        // Rounded rectangle
        ctx.beginPath();
        const s = enemy.size;
        ctx.moveTo(enemy.x - s + 3, enemy.y - s + bob);
        ctx.lineTo(enemy.x + s - 3, enemy.y - s + bob);
        ctx.quadraticCurveTo(enemy.x + s, enemy.y - s + bob, enemy.x + s, enemy.y - s + 3 + bob);
        ctx.lineTo(enemy.x + s, enemy.y + s - 3 + bob);
        ctx.quadraticCurveTo(enemy.x + s, enemy.y + s + bob, enemy.x + s - 3, enemy.y + s + bob);
        ctx.lineTo(enemy.x - s + 3, enemy.y + s + bob);
        ctx.quadraticCurveTo(enemy.x - s, enemy.y + s + bob, enemy.x - s, enemy.y + s - 3 + bob);
        ctx.lineTo(enemy.x - s, enemy.y - s + 3 + bob);
        ctx.quadraticCurveTo(enemy.x - s, enemy.y - s + bob, enemy.x - s + 3, enemy.y - s + bob);
        ctx.closePath();
        break;

      case 'armored':
        // Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = enemy.x + Math.cos(angle) * enemy.size;
          const py = enemy.y + Math.sin(angle) * enemy.size + bob;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;

      case 'boss': {
        // Spiky star
        ctx.beginPath();
        const spikes = 6;
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          const r = i % 2 === 0 ? enemy.size : enemy.size * 0.6;
          const px = enemy.x + Math.cos(angle + enemy.animFrame * 0.02) * r;
          const py = enemy.y + Math.sin(angle + enemy.animFrame * 0.02) * r + bob;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        // Boss glow
        ctx.shadowColor = enemy.bodyColor;
        ctx.shadowBlur = 10;
        break;
      }

      default:
        // Normal - circle
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + bob, enemy.size, 0, Math.PI * 2);
        break;
    }

    // Apply status-tinted color
    let bodyColor = enemy.bodyColor;
    if (isSlowed) bodyColor = '#4488ff';
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.strokeStyle = enemy.strokeColor;
    ctx.lineWidth = enemy.type === 'boss' ? 2.5 : 1.5;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Armor indicator (small shield icon for armored types)
    if (enemy.armor > 0 && enemy.type !== 'boss') {
      ctx.fillStyle = '#cccc88';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🛡', enemy.x + enemy.size + 2, enemy.y - enemy.size + 4 + bob);
    }

    // Boss label
    if (enemy.type === 'boss') {
      ctx.fillStyle = '#ff88ff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', enemy.x, enemy.y - enemy.size - 10 + bob);
    }

    ctx.restore();

    // HP bar
    const barW = enemy.type === 'boss' ? 36 : 24;
    const barH = enemy.type === 'boss' ? 5 : 4;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - enemy.size - 8;
    const hpRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
  }
}

function drawUnits(ctx: CanvasRenderingContext2D, units: PlacedUnit[], selectedId: number | null, enemies: Enemy[]): void {
  for (const unit of units) {
    const stats = getCharacterStats(unit.config, unit.level);
    const isSelected = selectedId === unit.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, stats.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(68, 136, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Attack visuals for instant attacks
    if (unit.targetId !== null && (unit.config.attackPattern === 'rapid' || unit.config.attackPattern === 'slow')) {
      const target = enemies.find(e => e.id === unit.targetId && e.alive);
      if (target && unit.isAttacking) {
        ctx.strokeStyle = `${unit.config.weaponColor}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }

    // Chain visual
    if (unit.targetId !== null && unit.config.attackPattern === 'chain' && unit.isAttacking) {
      const target = enemies.find(e => e.id === unit.targetId && e.alive);
      if (target) {
        ctx.strokeStyle = `${unit.config.weaponColor}88`;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    drawCharacterSprite(ctx, unit.config, unit.x, unit.y, 18, unit.animFrame, unit.isAttacking, unit.attackAnimTimer);

    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(unit.x - 11, unit.y - 11, 22, 22);
    }

    if (unit.level > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${unit.level}`, unit.x, unit.y + 16);
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const proj of projectiles) {
    if (!proj.alive) continue;

    if (proj.pierce) {
      ctx.fillStyle = '#88aaff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(136, 170, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = proj.appliesPoison ? '#44ff44' : '#ffdd44';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = proj.appliesPoison ? 'rgba(68, 255, 68, 0.2)' : 'rgba(255, 221, 68, 0.2)';
      ctx.fill();
    }
  }
}

function drawBase(ctx: CanvasRenderingContext2D): void {
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  ctx.fillStyle = '#44aaff';
  ctx.beginPath();
  ctx.moveTo(last.x, last.y - 15);
  ctx.lineTo(last.x + 12, last.y + 10);
  ctx.lineTo(last.x - 12, last.y + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BASE', last.x, last.y + 24);
}
