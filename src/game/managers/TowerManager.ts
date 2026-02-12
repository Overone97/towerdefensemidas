import { PlacedUnit, Projectile, Enemy, Slot, UnitConfig, TargetPriority } from '../types';
import { getUnitStats } from '../data/unitData';
import { WAYPOINTS } from '../data/mapData';

let nextUnitId = 1;
let nextProjectileId = 1;

export class TowerManager {
  units: PlacedUnit[] = [];
  projectiles: Projectile[] = [];

  placeUnit(config: UnitConfig, slot: Slot, slotIndex: number): PlacedUnit {
    const unit: PlacedUnit = {
      id: nextUnitId++,
      config,
      slotIndex,
      x: slot.x,
      y: slot.y,
      level: 1,
      attackCooldown: 0,
      targetId: null,
      targetPriority: 'closest',
    };
    this.units.push(unit);
    return unit;
  }

  removeUnit(unitId: number): void {
    this.units = this.units.filter(u => u.id !== unitId);
  }

  upgradeUnit(unitId: number): void {
    const unit = this.units.find(u => u.id === unitId);
    if (unit) unit.level++;
  }

  update(dt: number, enemies: Enemy[]): { damages: { enemyId: number; damage: number }[] } {
    const damages: { enemyId: number; damage: number }[] = [];

    // Update units - find targets and attack
    for (const unit of this.units) {
      const stats = getUnitStats(unit.config, unit.level);
      unit.attackCooldown = Math.max(0, unit.attackCooldown - dt);

      if (unit.attackCooldown > 0) continue;

      // Find target
      const target = this.findTarget(unit, enemies, stats.range);
      if (!target) {
        unit.targetId = null;
        continue;
      }

      unit.targetId = target.id;

      if (unit.config.attackType === 'instant') {
        damages.push({ enemyId: target.id, damage: stats.attack });
      } else {
        // Spawn projectile
        this.projectiles.push({
          id: nextProjectileId++,
          x: unit.x,
          y: unit.y,
          targetX: target.x,
          targetY: target.y,
          speed: 400,
          damage: stats.attack,
          targetId: target.id,
          alive: true,
        });
      }

      unit.attackCooldown = 1 / stats.attackSpeed;
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;

      // Track target position
      const target = enemies.find(e => e.id === proj.targetId && e.alive);
      if (target) {
        proj.targetX = target.x;
        proj.targetY = target.y;
      }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        proj.alive = false;
        damages.push({ enemyId: proj.targetId, damage: proj.damage });
        continue;
      }

      const move = proj.speed * dt;
      proj.x += (dx / dist) * move;
      proj.y += (dy / dist) * move;
    }

    this.projectiles = this.projectiles.filter(p => p.alive);
    return { damages };
  }

  private findTarget(unit: PlacedUnit, enemies: Enemy[], range: number): Enemy | null {
    const inRange = enemies.filter(e => {
      if (!e.alive) return false;
      const dx = e.x - unit.x;
      const dy = e.y - unit.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });

    if (inRange.length === 0) return null;

    switch (unit.targetPriority) {
      case 'weakest':
        return inRange.reduce((min, e) => (e.hp < min.hp ? e : min));
      case 'most_advanced':
        return inRange.reduce((max, e) => {
          const progress = e.waypointIndex + e.progress;
          const maxProgress = max.waypointIndex + max.progress;
          return progress > maxProgress ? e : max;
        });
      case 'closest':
      default: {
        return inRange.reduce((closest, e) => {
          const dx = e.x - unit.x;
          const dy = e.y - unit.y;
          const d = dx * dx + dy * dy;
          const cdx = closest.x - unit.x;
          const cdy = closest.y - unit.y;
          const cd = cdx * cdx + cdy * cdy;
          return d < cd ? e : closest;
        });
      }
    }
  }

  clear(): void {
    this.units = [];
    this.projectiles = [];
  }
}
