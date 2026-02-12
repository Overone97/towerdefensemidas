import { GameState, Enemy, PlacedUnit, Projectile, Slot } from '../../game/types';
import { WAYPOINTS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import { getUnitStats } from '../../game/data/unitData';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  // Clear
  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, w, h);

  // Draw grid dots
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
  for (let i = 1; i < WAYPOINTS.length; i++) {
    ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
  }
  ctx.stroke();

  // Path border
  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 32;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  for (let i = 1; i < WAYPOINTS.length; i++) {
    ctx.lineTo(WAYPOINTS[i].x, WAYPOINTS[i].y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSlots(ctx: CanvasRenderingContext2D, slots: Slot[], selectedIndex: number | null): void {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.unitId !== null) continue; // Occupied

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

    // Plus sign
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

    // Body
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // HP bar
    const barW = 24;
    const barH = 4;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - enemy.size - 8;
    const hpRatio = enemy.hp / enemy.maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
  }
}

function drawUnits(
  ctx: CanvasRenderingContext2D,
  units: PlacedUnit[],
  selectedId: number | null,
  enemies: Enemy[]
): void {
  for (const unit of units) {
    const stats = getUnitStats(unit.config, unit.level);
    const isSelected = selectedId === unit.id;
    const s = unit.config.size;

    // Range circle (if selected)
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, stats.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(68, 136, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Attack line
    if (unit.targetId !== null) {
      const target = enemies.find(e => e.id === unit.targetId && e.alive);
      if (target && unit.config.attackType === 'instant') {
        ctx.strokeStyle = `${unit.config.color}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }

    // Body (square)
    ctx.fillStyle = unit.config.color;
    ctx.fillRect(unit.x - s / 2, unit.y - s / 2, s, s);

    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(unit.x - s / 2 - 2, unit.y - s / 2 - 2, s + 4, s + 4);
    }

    // Level indicator
    if (unit.level > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${unit.level}`, unit.x, unit.y + 3);
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const proj of projectiles) {
    if (!proj.alive) continue;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fill();
    
    // Glow
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 221, 68, 0.2)';
    ctx.fill();
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
