import { PlacedUnit, Projectile, Enemy, Slot, CharacterConfig, StatusEffect, SynergyBonus, EquippedItems } from '../types';
import { ABILITIES, AbilityEffect } from '../data/abilityData';
import { getCharacterStats } from '../data/characterData';
import { ALL_EQUIPMENT, getEquipmentBonuses } from '../data/equipmentData';

let nextUnitId = 1;
let nextProjectileId = 1;

export interface AoeWave {
  id: number;
  unitId: number;
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  speed: number;
  damage: number;
  weaponColor: string;
  hitEnemies: number[];
  alive: boolean;
  dotDamage?: number;
  dotDuration?: number;
  slowFactor?: number;
  slowDuration?: number;
  attackPattern: string;
}

let nextWaveId = 1;

interface TalentBonusData {
  attackMult: number;
  speedMult: number;
  rangeMult: number;
}

export class TowerManager {
  units: PlacedUnit[] = [];
  projectiles: Projectile[] = [];
  aoeWaves: AoeWave[] = [];
  synergyBonuses: Map<number, SynergyBonus> = new Map();
  talentBonus: TalentBonusData = { attackMult: 1, speedMult: 1, rangeMult: 1 };
  unitEquipment: Map<number, EquippedItems> = new Map(); // unitId -> equipment

  placeUnit(config: CharacterConfig, slot: Slot, slotIndex: number, characterInstanceId: number, level: number, equipment?: EquippedItems): PlacedUnit {
    const unit: PlacedUnit = {
      id: nextUnitId++,
      characterInstanceId,
      config,
      slotIndex,
      x: slot.x,
      y: slot.y,
      level,
      attackCooldown: 0,
      targetId: null,
      targetPriority: 'closest',
      animFrame: Math.random() * 100,
      isAttacking: false,
      attackAnimTimer: 0,
      abilityCooldown: 0,
      abilityActive: false,
      abilityTimer: 0,
    };
    this.units.push(unit);
    if (equipment) this.unitEquipment.set(unit.id, equipment);
    return unit;
  }

  removeUnit(unitId: number): void {
    this.units = this.units.filter(u => u.id !== unitId);
  }

  upgradeUnit(unitId: number): void {
    const unit = this.units.find(u => u.id === unitId);
    if (unit) unit.level++;
  }

  private getEffectiveStats(unit: PlacedUnit) {
    const base = getCharacterStats(unit.config, unit.level);
    const syn = this.synergyBonuses.get(unit.id);
    
    // Equipment bonuses
    const eq = this.unitEquipment.get(unit.id) || {};
    const eqItems = [eq.weapon, eq.armor, eq.accessory]
      .filter(Boolean)
      .map(id => ALL_EQUIPMENT.find(e => e.id === id))
      .filter(Boolean) as any[];
    const eqBonus = getEquipmentBonuses(eqItems);
    
    const aMult = (syn?.attackMult || 1) * this.talentBonus.attackMult * eqBonus.attackMult * (unit.abilityActive && this.getAbilityEffect(unit)?.type === 'rage' ? (this.getAbilityEffect(unit) as any).attackMult : 1);
    const sMult = (syn?.speedMult || 1) * this.talentBonus.speedMult * eqBonus.speedMult * (unit.abilityActive && this.getAbilityEffect(unit)?.type === 'rage' ? (this.getAbilityEffect(unit) as any).speedMult : 1) * (unit.abilityActive && this.getAbilityEffect(unit)?.type === 'buff_speed' ? (this.getAbilityEffect(unit) as any).mult : 1);
    const rMult = (syn?.rangeMult || 1) * this.talentBonus.rangeMult * eqBonus.rangeMult;
    return {
      attack: Math.floor((base.attack + eqBonus.attackBonus) * aMult),
      attackSpeed: (base.attackSpeed + eqBonus.attackSpeedBonus) * sMult,
      range: Math.floor((base.range + eqBonus.rangeBonus) * rMult),
    };
  }

  private getAbilityEffect(unit: PlacedUnit): AbilityEffect | null {
    const ability = ABILITIES[unit.config.attackPattern];
    return ability ? ability.effect : null;
  }

  activateAbility(unitId: number, enemies: Enemy[]): { damages: { enemyId: number; damage: number }[]; statusEffects: { enemyId: number; effect: StatusEffect }[] } {
    const unit = this.units.find(u => u.id === unitId);
    const damages: { enemyId: number; damage: number }[] = [];
    const statusEffects: { enemyId: number; effect: StatusEffect }[] = [];
    if (!unit || unit.abilityCooldown > 0) return { damages, statusEffects };

    const ability = ABILITIES[unit.config.attackPattern];
    if (!ability) return { damages, statusEffects };

    const stats = this.getEffectiveStats(unit);
    const effect = ability.effect;

    unit.abilityCooldown = ability.cooldown;
    if (ability.duration > 0) {
      unit.abilityActive = true;
      unit.abilityTimer = ability.duration;
    }

    switch (effect.type) {
      case 'snipe': {
        const target = this.findTarget(unit, enemies, stats.range * 2);
        if (target) {
          damages.push({ enemyId: target.id, damage: Math.floor(stats.attack * effect.damageMult) });
        }
        break;
      }
      case 'damage_aoe': {
        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.x - unit.x; const dy = e.y - unit.y;
          if (Math.sqrt(dx * dx + dy * dy) <= effect.radius) {
            damages.push({ enemyId: e.id, damage: Math.floor(stats.attack * effect.damageMult) });
          }
        }
        break;
      }
      case 'freeze_aoe': {
        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.x - unit.x; const dy = e.y - unit.y;
          if (Math.sqrt(dx * dx + dy * dy) <= effect.radius) {
            statusEffects.push({ enemyId: e.id, effect: { type: 'slow', damagePerSecond: 0, duration: effect.duration, slowFactor: 0.05 } });
          }
        }
        break;
      }
      case 'poison_cloud': {
        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.x - unit.x; const dy = e.y - unit.y;
          if (Math.sqrt(dx * dx + dy * dy) <= effect.radius) {
            statusEffects.push({ enemyId: e.id, effect: { type: 'poison', damagePerSecond: effect.dps, duration: effect.duration, slowFactor: 1 } });
          }
        }
        break;
      }
      case 'chain_burst': {
        const target = this.findTarget(unit, enemies, stats.range);
        if (target) {
          const hitIds = [target.id];
          damages.push({ enemyId: target.id, damage: Math.floor(stats.attack * effect.damageMult) });
          let last = target;
          for (let i = 1; i < effect.chainCount; i++) {
            const next = this.findChainTarget(last, enemies, 120, hitIds);
            if (!next) break;
            hitIds.push(next.id);
            damages.push({ enemyId: next.id, damage: Math.floor(stats.attack * effect.damageMult * (1 - i * 0.08)) });
            last = next;
          }
        }
        break;
      }
      case 'shield': {
        // Handled externally
        break;
      }
      // buff_speed and rage are passive buffs handled via abilityActive flag
      default:
        break;
    }

    return { damages, statusEffects };
  }

  update(dt: number, enemies: Enemy[]): {
    damages: { enemyId: number; damage: number }[];
    statusEffects: { enemyId: number; effect: StatusEffect }[];
  } {
    const damages: { enemyId: number; damage: number }[] = [];
    const statusEffects: { enemyId: number; effect: StatusEffect }[] = [];

    // Update animation & ability timers
    for (const unit of this.units) {
      unit.animFrame += dt * 60;
      if (unit.attackAnimTimer > 0) {
        unit.attackAnimTimer -= dt;
        if (unit.attackAnimTimer <= 0) {
          unit.isAttacking = false;
          unit.attackAnimTimer = 0;
        }
      }
      // Ability cooldown
      if (unit.abilityCooldown > 0) unit.abilityCooldown = Math.max(0, unit.abilityCooldown - dt);
      // Ability duration
      if (unit.abilityActive && unit.abilityTimer > 0) {
        unit.abilityTimer -= dt;
        if (unit.abilityTimer <= 0) {
          unit.abilityActive = false;
          unit.abilityTimer = 0;
        }
      }
    }

    // Attack logic
    for (const unit of this.units) {
      const stats = this.getEffectiveStats(unit);
      unit.attackCooldown = Math.max(0, unit.attackCooldown - dt);
      if (unit.attackCooldown > 0) continue;

      const target = this.findTarget(unit, enemies, stats.range);
      if (!target) { unit.targetId = null; continue; }

      unit.targetId = target.id;
      unit.isAttacking = true;
      unit.attackAnimTimer = 0.2;

      switch (unit.config.attackPattern) {
        case 'rapid':
          damages.push({ enemyId: target.id, damage: stats.attack });
          this.applyOnHitEffects(unit, target.id, statusEffects);
          break;

        case 'aoe_circle': {
          // Spawn expanding wave instead of instant damage
          this.aoeWaves.push({
            id: nextWaveId++,
            unitId: unit.id,
            x: unit.x,
            y: unit.y,
            currentRadius: 0,
            maxRadius: stats.range,
            speed: 200, // px/s wave expansion speed
            damage: stats.attack,
            weaponColor: unit.config.weaponColor,
            hitEnemies: [],
            alive: true,
            dotDamage: unit.config.dotDamage,
            dotDuration: unit.config.dotDuration,
            slowFactor: unit.config.slowFactor,
            slowDuration: unit.config.slowDuration,
            attackPattern: unit.config.attackPattern,
          });
          break;
        }

        case 'line': {
          const tdx = target.x - unit.x; const tdy = target.y - unit.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
          this.projectiles.push({
            id: nextProjectileId++, x: unit.x, y: unit.y,
            targetX: unit.x + (tdx / tdist) * 800, targetY: unit.y + (tdy / tdist) * 800,
            speed: 350, damage: stats.attack, targetId: target.id, alive: true,
            pierce: true, hitEnemies: [],
            appliesPoison: unit.config.dotDamage ? { damage: unit.config.dotDamage, duration: unit.config.dotDuration || 2 } : undefined,
            appliesSlow: unit.config.slowFactor ? { factor: unit.config.slowFactor, duration: unit.config.slowDuration || 2 } : undefined,
          });
          break;
        }

        case 'poison':
          this.projectiles.push({
            id: nextProjectileId++, x: unit.x, y: unit.y,
            targetX: target.x, targetY: target.y,
            speed: 300, damage: stats.attack, targetId: target.id, alive: true,
            appliesPoison: { damage: unit.config.dotDamage || 5, duration: unit.config.dotDuration || 3 },
          });
          break;

        case 'slow':
          damages.push({ enemyId: target.id, damage: stats.attack });
          statusEffects.push({ enemyId: target.id, effect: { type: 'slow', damagePerSecond: 0, duration: unit.config.slowDuration || 2, slowFactor: unit.config.slowFactor || 0.5 } });
          if (unit.config.aoeRadius) {
            for (const e of enemies) {
              if (!e.alive || e.id === target.id) continue;
              const dx = e.x - target.x; const dy = e.y - target.y;
              if (Math.sqrt(dx * dx + dy * dy) <= unit.config.aoeRadius) {
                damages.push({ enemyId: e.id, damage: Math.floor(stats.attack * 0.5) });
                statusEffects.push({ enemyId: e.id, effect: { type: 'slow', damagePerSecond: 0, duration: unit.config.slowDuration || 2, slowFactor: unit.config.slowFactor || 0.5 } });
              }
            }
          }
          break;

        case 'chain': {
          const chainCount = unit.config.chainCount || 3;
          const hitIds: number[] = [target.id];
          damages.push({ enemyId: target.id, damage: stats.attack });
          this.applyOnHitEffects(unit, target.id, statusEffects);
          let lastTarget = target;
          for (let c = 1; c < chainCount; c++) {
            const next = this.findChainTarget(lastTarget, enemies, 100, hitIds);
            if (!next) break;
            hitIds.push(next.id);
            damages.push({ enemyId: next.id, damage: Math.floor(stats.attack * (1 - c * 0.15)) });
            this.applyOnHitEffects(unit, next.id, statusEffects);
            lastTarget = next;
          }
          break;
        }

        case 'burst': {
          const burstCount = unit.config.burstCount || 3;
          for (let b = 0; b < burstCount; b++) {
            const angle = (Math.PI * 2 * b) / burstCount;
            this.projectiles.push({
              id: nextProjectileId++, x: unit.x, y: unit.y,
              targetX: target.x + Math.cos(angle) * 20, targetY: target.y + Math.sin(angle) * 20,
              speed: 350, damage: stats.attack, targetId: target.id, alive: true,
              aoeRadius: unit.config.aoeRadius || 30,
            });
          }
          break;
        }

        case 'single':
        default:
          this.projectiles.push({
            id: nextProjectileId++, x: unit.x, y: unit.y,
            targetX: target.x, targetY: target.y,
            speed: 400, damage: stats.attack, targetId: target.id, alive: true,
          });
          break;
      }

      unit.attackCooldown = 1 / stats.attackSpeed;
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;

      if (!proj.pierce) {
        const target = enemies.find(e => e.id === proj.targetId && e.alive);
        if (target) { proj.targetX = target.x; proj.targetY = target.y; }
      }

      const dx = proj.targetX - proj.x; const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { proj.alive = false; continue; }

      const move = proj.speed * dt;
      proj.x += (dx / dist) * move;
      proj.y += (dy / dist) * move;

      if (proj.pierce) {
        if (!proj.hitEnemies) proj.hitEnemies = [];
        for (const e of enemies) {
          if (!e.alive || proj.hitEnemies.includes(e.id)) continue;
          const edx = e.x - proj.x; const edy = e.y - proj.y;
          if (Math.sqrt(edx * edx + edy * edy) < 15) {
            proj.hitEnemies.push(e.id);
            damages.push({ enemyId: e.id, damage: proj.damage });
            if (proj.appliesPoison) statusEffects.push({ enemyId: e.id, effect: { type: 'poison', damagePerSecond: proj.appliesPoison.damage, duration: proj.appliesPoison.duration, slowFactor: 1 } });
            if (proj.appliesSlow) statusEffects.push({ enemyId: e.id, effect: { type: 'slow', damagePerSecond: 0, duration: proj.appliesSlow.duration, slowFactor: proj.appliesSlow.factor } });
          }
        }
      } else if (dist < 8) {
        proj.alive = false;
        damages.push({ enemyId: proj.targetId, damage: proj.damage });
        if (proj.aoeRadius) {
          for (const e of enemies) {
            if (!e.alive || e.id === proj.targetId) continue;
            const edx = e.x - proj.x; const edy = e.y - proj.y;
            if (Math.sqrt(edx * edx + edy * edy) <= proj.aoeRadius) {
              damages.push({ enemyId: e.id, damage: Math.floor(proj.damage * 0.6) });
            }
          }
        }
        if (proj.appliesPoison) statusEffects.push({ enemyId: proj.targetId, effect: { type: 'poison', damagePerSecond: proj.appliesPoison.damage, duration: proj.appliesPoison.duration, slowFactor: 1 } });
        if (proj.appliesSlow) statusEffects.push({ enemyId: proj.targetId, effect: { type: 'slow', damagePerSecond: 0, duration: proj.appliesSlow.duration, slowFactor: proj.appliesSlow.factor } });
      }
    }

    this.projectiles = this.projectiles.filter(p => {
      if (!p.alive) return false;
      if (p.x < -50 || p.x > 900 || p.y < -50 || p.y > 600) return false;
      return true;
    });

    // Update AOE waves
    for (const wave of this.aoeWaves) {
      if (!wave.alive) continue;
      wave.currentRadius += wave.speed * dt;

      // Damage enemies as wave reaches them
      for (const e of enemies) {
        if (!e.alive || wave.hitEnemies.includes(e.id)) continue;
        const dx = e.x - wave.x;
        const dy = e.y - wave.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Enemy is hit when wave front passes through them
        if (dist <= wave.currentRadius && dist >= wave.currentRadius - wave.speed * dt - e.size) {
          wave.hitEnemies.push(e.id);
          damages.push({ enemyId: e.id, damage: wave.damage });
          // Apply on-hit effects
          if (wave.dotDamage) {
            statusEffects.push({ enemyId: e.id, effect: { type: 'burn', damagePerSecond: wave.dotDamage, duration: wave.dotDuration || 2, slowFactor: 1 } });
          }
          if (wave.slowFactor) {
            statusEffects.push({ enemyId: e.id, effect: { type: 'slow', damagePerSecond: 0, duration: wave.slowDuration || 2, slowFactor: wave.slowFactor } });
          }
        }
      }

      if (wave.currentRadius >= wave.maxRadius) {
        wave.alive = false;
      }
    }
    this.aoeWaves = this.aoeWaves.filter(w => w.alive);

    return { damages, statusEffects };
  }

  private applyOnHitEffects(unit: PlacedUnit, enemyId: number, effects: { enemyId: number; effect: StatusEffect }[]): void {
    if (unit.config.dotDamage) {
      effects.push({ enemyId, effect: { type: unit.config.attackPattern === 'aoe_circle' ? 'burn' : 'poison', damagePerSecond: unit.config.dotDamage, duration: unit.config.dotDuration || 2, slowFactor: 1 } });
    }
    if (unit.config.slowFactor && unit.config.attackPattern !== 'slow') {
      effects.push({ enemyId, effect: { type: 'slow', damagePerSecond: 0, duration: unit.config.slowDuration || 2, slowFactor: unit.config.slowFactor } });
    }
  }

  private findTarget(unit: PlacedUnit, enemies: Enemy[], range: number): Enemy | null {
    const inRange = enemies.filter(e => {
      if (!e.alive) return false;
      const dx = e.x - unit.x; const dy = e.y - unit.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
    if (inRange.length === 0) return null;

    switch (unit.targetPriority) {
      case 'weakest': return inRange.reduce((min, e) => (e.hp < min.hp ? e : min));
      case 'most_advanced': return inRange.reduce((max, e) => {
        const p = e.waypointIndex + e.progress;
        const mp = max.waypointIndex + max.progress;
        return p > mp ? e : max;
      });
      case 'closest':
      default: return inRange.reduce((closest, e) => {
        const d = (e.x - unit.x) ** 2 + (e.y - unit.y) ** 2;
        const cd = (closest.x - unit.x) ** 2 + (closest.y - unit.y) ** 2;
        return d < cd ? e : closest;
      });
    }
  }

  private findChainTarget(from: Enemy, enemies: Enemy[], range: number, excludeIds: number[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = range;
    for (const e of enemies) {
      if (!e.alive || excludeIds.includes(e.id)) continue;
      const d = Math.sqrt((e.x - from.x) ** 2 + (e.y - from.y) ** 2);
      if (d < closestDist) { closest = e; closestDist = d; }
    }
    return closest;
  }

  clear(): void {
    this.units = [];
    this.projectiles = [];
    this.aoeWaves = [];
  }
}
