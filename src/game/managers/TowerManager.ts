import { PlacedUnit, Projectile, Enemy, Slot, CharacterConfig, StatusEffect, SynergyBonus, EquippedItems, GroundEffect, Point } from '../types';
import { ABILITIES, AbilityEffect } from '../data/abilityData';
import { getCharacterStats } from '../data/characterData';
import { ALL_EQUIPMENT, getEquipmentBonuses } from '../data/equipmentData';
import { COMPOSITE_RECIPES } from '../data/compositeEquipmentData';

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
let nextGroundEffectId = 1;

interface TalentBonusData {
  attackMult: number;
  speedMult: number;
  rangeMult: number;
}

interface RageAbilityEffect extends AbilityEffect {
  type: 'rage';
  attackMult?: number;
  speedMult?: number;
}

interface BuffSpeedAbilityEffect extends AbilityEffect {
  type: 'buff_speed';
  mult?: number;
}

type TeemoWaypointUnit = PlacedUnit & {
  _teemoWpIdx?: number;
  _teemoDir?: number;
};

export class TowerManager {
  units: PlacedUnit[] = [];
  projectiles: Projectile[] = [];
  aoeWaves: AoeWave[] = [];
  groundEffects: GroundEffect[] = [];
  synergyBonuses: Map<number, SynergyBonus> = new Map();
  talentBonus: TalentBonusData = { attackMult: 1, speedMult: 1, rangeMult: 1 };
  unitEquipment: Map<number, EquippedItems> = new Map(); // unitId -> equipment
  iceDragonAuras: { x: number; y: number; radius: number }[] = [];

  placeUnit(config: CharacterConfig, slot: Slot, slotIndex: number, characterInstanceId: number, level: number, equipment?: EquippedItems, stars: number = 1): PlacedUnit {
    const isRoamer = config.attackPattern === 'poison_trail' || config.attackPattern === 'mushroom';
    const unit: PlacedUnit = {
      id: nextUnitId++,
      characterInstanceId,
      config,
      slotIndex,
      x: slot.x,
      y: slot.y,
      level,
      stars,
      attackCooldown: 0,
      targetId: null,
      targetPriority: 'closest',
      animFrame: Math.random() * 100,
      isAttacking: false,
      attackAnimTimer: 0,
      abilityCooldown: 0,
      abilityActive: false,
      abilityTimer: 0,
      homeX: slot.x,
      homeY: slot.y,
      roamTargetX: isRoamer ? slot.x : undefined,
      roamTargetY: isRoamer ? slot.y : undefined,
      lastCloudTime: 0,
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
    const base = getCharacterStats(unit.config, unit.level, unit.stars);
    const syn = this.synergyBonuses.get(unit.id);
    
    // Equipment bonuses
    const eq = this.unitEquipment.get(unit.id) || {};
    const eqItems = [eq.weapon, eq.armor, eq.accessory]
      .filter(Boolean)
      .map(id => {
        let item = ALL_EQUIPMENT.find(e => e.id === id);
        if (!item) {
          // Check composite recipes for crafted items
          const recipe = COMPOSITE_RECIPES.find(r => r.result.id === id);
          if (recipe) item = recipe.result;
        }
        return item;
      })
      .filter((item): item is EquipmentItem => Boolean(item));
    const eqBonus = getEquipmentBonuses(eqItems);
    
    const abilityEffect = unit.abilityActive ? this.getAbilityEffect(unit) : undefined;
    const rageEffect = abilityEffect?.type === 'rage' ? abilityEffect as RageAbilityEffect : undefined;
    const buffSpeedEffect = abilityEffect?.type === 'buff_speed' ? abilityEffect as BuffSpeedAbilityEffect : undefined;
    const aMult = (syn?.attackMult || 1) * this.talentBonus.attackMult * eqBonus.attackMult * (rageEffect?.attackMult ?? 1);
    const sMult = (syn?.speedMult || 1) * this.talentBonus.speedMult * eqBonus.speedMult * (rageEffect?.speedMult ?? 1) * (buffSpeedEffect?.mult ?? 1);
    const isAoe = unit.config.attackPattern === 'aoe_circle';
    const rMult = isAoe ? 1 : (syn?.rangeMult || 1) * this.talentBonus.rangeMult * eqBonus.rangeMult;
    const rBonus = isAoe ? 0 : eqBonus.rangeBonus;
    return {
      attack: Math.floor((base.attack + eqBonus.attackBonus) * aMult),
      attackSpeed: (base.attackSpeed + eqBonus.attackSpeedBonus) * sMult,
      range: Math.floor((base.range + rBonus) * rMult),
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

  waypoints: Point[] = [];

  setWaypoints(wp: Point[]) {
    this.waypoints = wp;
  }

  update(dt: number, enemies: Enemy[]): {
    damages: { enemyId: number; damage: number; unitId?: number }[];
    statusEffects: { enemyId: number; effect: StatusEffect }[];
  } {
    const damages: { enemyId: number; damage: number; unitId?: number }[] = [];
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

    // Roaming logic (Singed + Teemo)
    for (const unit of this.units) {
      const isRoamer = unit.config.attackPattern === 'poison_trail' || unit.config.attackPattern === 'mushroom';
      if (!isRoamer) continue;
      const stats = this.getEffectiveStats(unit);
      const speed = 80 + unit.level * 10;

      const isSinged = unit.config.attackPattern === 'poison_trail';
      const isTeemo = unit.config.attackPattern === 'mushroom';

      if (isSinged) {
        // Singed: chase random alive enemy
        const alive = enemies.filter(e => e.alive);
        if (alive.length > 0) {
          const dx = (unit.roamTargetX || unit.x) - unit.x;
          const dy = (unit.roamTargetY || unit.y) - unit.y;
          const distToTarget = Math.sqrt(dx * dx + dy * dy);
          if (distToTarget < 15 || !unit.roamTargetX) {
            const randEnemy = alive[Math.floor(Math.random() * alive.length)];
            unit.roamTargetX = randEnemy.x;
            unit.roamTargetY = randEnemy.y;
          }
        } else {
          unit.roamTargetX = unit.homeX;
          unit.roamTargetY = unit.homeY;
        }
      } else if (isTeemo) {
        const teemoUnit = unit as TeemoWaypointUnit;
        // Teemo: strictly follow the enemy path waypoints back and forth
        const wp = this.waypoints;
        if (wp.length > 0) {
          if (teemoUnit._teemoWpIdx === undefined) {
            teemoUnit._teemoWpIdx = 0;
            teemoUnit._teemoDir = 1;
            unit.x = wp[0].x;
            unit.y = wp[0].y;
            unit.roamTargetX = wp[0].x;
            unit.roamTargetY = wp[0].y;
          }
          const dx = (unit.roamTargetX || unit.x) - unit.x;
          const dy = (unit.roamTargetY || unit.y) - unit.y;
          const distToTarget = Math.sqrt(dx * dx + dy * dy);
          
          // Use a larger snap radius for fast Teemos to prevent overshooting
          const snapRadius = Math.max(5, speed * dt * 1.5);
          if (distToTarget < snapRadius) {
            // Snap to waypoint to prevent corner sticking
            unit.x = unit.roamTargetX || unit.x;
            unit.y = unit.roamTargetY || unit.y;
            
            let idx = teemoUnit._teemoWpIdx ?? 0;
            let dir = teemoUnit._teemoDir ?? 1;
            idx += dir;
            if (idx >= wp.length) { idx = wp.length - 2; dir = -1; }
            if (idx < 0) { idx = 1; dir = 1; }
            teemoUnit._teemoWpIdx = idx;
            teemoUnit._teemoDir = dir;
            unit.roamTargetX = wp[idx].x;
            unit.roamTargetY = wp[idx].y;
          }

          // Move toward target waypoint
          const mx = (unit.roamTargetX || unit.x) - unit.x;
          const my = (unit.roamTargetY || unit.y) - unit.y;
          const md = Math.sqrt(mx * mx + my * my);
          if (md > 1) {
            const moveStep = Math.min(speed * dt, md); // never overshoot
            unit.x += (mx / md) * moveStep;
            unit.y += (my / md) * moveStep;
            unit.isAttacking = true;
            unit.attackAnimTimer = 0.1;
          }
        }
        // Skip generic movement below — Teemo uses path-locked movement above
        unit.lastCloudTime = (unit.lastCloudTime || 0) + dt;
        if (unit.config.attackPattern === 'mushroom') {
          const dropInterval = Math.max(0.8, 1.5 - unit.level * 0.05);
          if (unit.lastCloudTime >= dropInterval) {
            // Cap at 50 active mushrooms
            const activeShrooms = this.groundEffects.filter(g => g.type === 'mushroom' && g.alive && g.sourceUnitId === unit.id);
            if (activeShrooms.length < 50) {
              unit.lastCloudTime = 0;
              const shroomDps = (unit.config.dotDamage || 4) * (1 + (unit.level - 1) * 0.3);
              const shroomDuration = 8 + unit.level;
              const explRadius = (unit.config.aoeRadius || 35) + unit.level * 3;
              // Place mushroom exactly at Teemo's position (on the path)
              this.groundEffects.push({
                id: nextGroundEffectId++,
                type: 'mushroom',
                x: unit.x,
                y: unit.y,
                radius: 12,
                duration: shroomDuration,
                maxDuration: shroomDuration,
                damagePerSecond: shroomDps,
                slowFactor: unit.config.slowFactor || 0.6,
                slowDuration: unit.config.slowDuration || 2,
                aoeRadius: explRadius,
                explosionDamage: stats.attack,
                exploded: false,
                alive: true,
                color: '#88dd44',
                sourceUnitId: unit.id,
              });
            } else {
              unit.lastCloudTime = 0; // reset timer even if capped
            }
          }
        }
        continue; // Skip generic movement and mushroom code below
      }

      // Move toward roam target (Singed only now)
      const mx = (unit.roamTargetX || unit.x) - unit.x;
      const my = (unit.roamTargetY || unit.y) - unit.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md > 3) {
        unit.x += (mx / md) * speed * dt;
        unit.y += (my / md) * speed * dt;
        unit.isAttacking = true;
        unit.attackAnimTimer = 0.1;
      }

      // Drop effects based on champion type
      unit.lastCloudTime = (unit.lastCloudTime || 0) + dt;

      if (unit.config.attackPattern === 'poison_trail') {
        // Singed: poison cloud trail every 0.4s
        if (unit.lastCloudTime >= 0.4) {
          unit.lastCloudTime = 0;
          const cloudDuration = (unit.config.dotDuration || 3) + unit.level * 0.3;
          const cloudDps = stats.attack * 0.4 + (unit.config.dotDamage || 5) * (1 + (unit.level - 1) * 0.3);
          this.groundEffects.push({
            id: nextGroundEffectId++,
            type: 'poison_cloud',
            x: unit.x,
            y: unit.y,
            radius: 22 + unit.level * 2,
            duration: cloudDuration,
            maxDuration: cloudDuration,
            damagePerSecond: cloudDps,
            alive: true,
            color: unit.config.weaponColor,
            sourceUnitId: unit.id,
          });
        }
      }
    }

    // Attack logic
    for (const unit of this.units) {
      // Roaming units don't use normal attacks
      if (unit.config.attackPattern === 'poison_trail' || unit.config.attackPattern === 'mushroom') continue;

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
          damages.push({ enemyId: target.id, damage: stats.attack, unitId: unit.id });
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
            speed: 200,
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
          damages.push({ enemyId: target.id, damage: stats.attack, unitId: unit.id });
          statusEffects.push({ enemyId: target.id, effect: { type: 'slow', damagePerSecond: 0, duration: unit.config.slowDuration || 2, slowFactor: unit.config.slowFactor || 0.5 } });
          if (unit.config.aoeRadius) {
            for (const e of enemies) {
              if (!e.alive || e.id === target.id) continue;
              const dx = e.x - target.x; const dy = e.y - target.y;
              if (Math.sqrt(dx * dx + dy * dy) <= unit.config.aoeRadius) {
                damages.push({ enemyId: e.id, damage: Math.floor(stats.attack * 0.5), unitId: unit.id });
                statusEffects.push({ enemyId: e.id, effect: { type: 'slow', damagePerSecond: 0, duration: unit.config.slowDuration || 2, slowFactor: unit.config.slowFactor || 0.5 } });
              }
            }
          }
          break;

        case 'chain': {
          const chainCount = unit.config.chainCount || 3;
          const hitIds: number[] = [target.id];
          damages.push({ enemyId: target.id, damage: stats.attack, unitId: unit.id });
          this.applyOnHitEffects(unit, target.id, statusEffects);
          let lastTarget = target;
          for (let c = 1; c < chainCount; c++) {
            const next = this.findChainTarget(lastTarget, enemies, 100, hitIds);
            if (!next) break;
            hitIds.push(next.id);
            damages.push({ enemyId: next.id, damage: Math.floor(stats.attack * (1 - c * 0.15)), unitId: unit.id });
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
          if (unit.config.id === 'sivir') {
            this.projectiles.push({
              id: nextProjectileId++, x: unit.x, y: unit.y,
              targetX: target.x, targetY: target.y,
              speed: 440, damage: stats.attack, targetId: target.id, alive: true,
              projectileType: 'sivir_boomerang',
              bouncesRemaining: 4,
              bounceRange: 120,
              hitEnemyIds: [],
              rotation: 0,
              sourceUnitId: unit.id,
            });
          } else {
            this.projectiles.push({
              id: nextProjectileId++, x: unit.x, y: unit.y,
              targetX: target.x, targetY: target.y,
              speed: 400, damage: stats.attack, targetId: target.id, alive: true,
            });
          }
          break;
      }

      // Ice dragon aura: slow tower attack speed by 30%
      let atkSpeedMod = 1;
      for (const aura of this.iceDragonAuras) {
        const dx = unit.x - aura.x;
        const dy = unit.y - aura.y;
        if (dx * dx + dy * dy <= aura.radius * aura.radius) {
          atkSpeedMod = 0.7;
          break;
        }
      }
      unit.attackCooldown = 1 / (stats.attackSpeed * atkSpeedMod);
    }

    // Update projectiles
    for (const proj of this.projectiles) {
      if (!proj.alive) continue;

      if (!proj.pierce) {
        const target = enemies.find(e => e.id === proj.targetId && e.alive);
        if (target) {
          proj.targetX = target.x; proj.targetY = target.y;
        } else if (proj.projectileType === 'sivir_boomerang' && (proj.bouncesRemaining || 0) > 0) {
          const nextBounce = this.findBounceTargetFromPoint(proj.x, proj.y, enemies, proj.bounceRange || 120, proj.hitEnemyIds || []);
          if (nextBounce) {
            proj.targetId = nextBounce.id;
            proj.targetX = nextBounce.x;
            proj.targetY = nextBounce.y;
          } else {
            proj.alive = false;
          }
        } else {
          proj.alive = false;
        }
      }

      const dx = proj.targetX - proj.x; const dy = proj.targetY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) { proj.alive = false; continue; }

      const move = proj.speed * dt;
      proj.x += (dx / dist) * move;
      proj.y += (dy / dist) * move;
      if (proj.projectileType === 'sivir_boomerang') {
        proj.rotation = (proj.rotation || 0) + dt * 20;
      }

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
        damages.push({ enemyId: proj.targetId, damage: proj.damage, unitId: proj.sourceUnitId });

        if (proj.projectileType === 'sivir_boomerang') {
          const alreadyHit = new Set(proj.hitEnemyIds || []);
          alreadyHit.add(proj.targetId);
          proj.hitEnemyIds = Array.from(alreadyHit);
          const bouncesRemaining = (proj.bouncesRemaining || 0) - 1;
          proj.bouncesRemaining = bouncesRemaining;

          if (bouncesRemaining >= 0) {
            const nextTarget = this.findBounceTargetFromPoint(proj.x, proj.y, enemies, proj.bounceRange || 120, proj.hitEnemyIds);
            if (nextTarget) {
              proj.targetId = nextTarget.id;
              proj.targetX = nextTarget.x;
              proj.targetY = nextTarget.y;
              continue;
            }
          }

          proj.alive = false;
          continue;
        }

        proj.alive = false;
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
          damages.push({ enemyId: e.id, damage: wave.damage, unitId: wave.unitId });
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

    // Update ground effects (poison clouds & mushrooms)
    for (const ge of this.groundEffects) {
      if (!ge.alive) continue;
      ge.duration -= dt;
      if (ge.duration <= 0) { ge.alive = false; continue; }

      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x - ge.x;
        const dy = e.y - ge.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (ge.type === 'mushroom' && !ge.exploded && dist <= ge.radius + e.size) {
          // Mushroom triggered! Explode
          ge.exploded = true;
          ge.duration = Math.min(ge.duration, 0.5); // short remaining for visual
          const explR = ge.aoeRadius || 40;
          for (const e2 of enemies) {
            if (!e2.alive) continue;
            const d2x = e2.x - ge.x;
            const d2y = e2.y - ge.y;
            if (Math.sqrt(d2x * d2x + d2y * d2y) <= explR) {
              damages.push({ enemyId: e2.id, damage: ge.explosionDamage || 10, unitId: ge.sourceUnitId });
              statusEffects.push({ enemyId: e2.id, effect: { type: 'poison', damagePerSecond: ge.damagePerSecond, duration: ge.slowDuration || 3, slowFactor: 1, sourceUnitId: ge.sourceUnitId } });
              if (ge.slowFactor) {
                statusEffects.push({ enemyId: e2.id, effect: { type: 'slow', damagePerSecond: 0, duration: ge.slowDuration || 2, slowFactor: ge.slowFactor, sourceUnitId: ge.sourceUnitId } });
              }
            }
          }
          // Spawn explosion wave visual
          this.aoeWaves.push({
            id: nextWaveId++,
            unitId: -1,
            x: ge.x, y: ge.y,
            currentRadius: 0,
            maxRadius: explR,
            speed: 250,
            damage: 0,
            weaponColor: '#88dd44',
            hitEnemies: [],
            alive: true,
            attackPattern: 'mushroom',
          });
          break;
        }

        if (ge.type === 'poison_cloud' && dist <= ge.radius + e.size) {
          // Apply poison DOT to enemies inside the cloud
          const hasPoisonFromCloud = e.statusEffects.some(s => s.type === 'poison' && s.damagePerSecond >= ge.damagePerSecond);
          if (!hasPoisonFromCloud) {
            statusEffects.push({ enemyId: e.id, effect: { type: 'poison', damagePerSecond: ge.damagePerSecond, duration: 1, slowFactor: 1, sourceUnitId: ge.sourceUnitId } });
          }
        }
      }
    }
    this.groundEffects = this.groundEffects.filter(ge => ge.alive);

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

  private findBounceTargetFromPoint(x: number, y: number, enemies: Enemy[], range: number, excludeIds: number[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = range;
    for (const e of enemies) {
      if (!e.alive || excludeIds.includes(e.id)) continue;
      const d = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
      if (d <= closestDist) {
        closest = e;
        closestDist = d;
      }
    }
    return closest;
  }

  clear(): void {
    this.units = [];
    this.projectiles = [];
    this.aoeWaves = [];
    this.groundEffects = [];
  }
}
