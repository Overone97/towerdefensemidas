import { Enemy, EnemyConfig, Point, StatusEffect, WaveModifier } from '../types';
import { WAYPOINTS } from '../data/mapData';
import { ENEMY_CONFIGS } from '../data/waveData';

let nextEnemyId = 1;

export class EnemyManager {
  enemies: Enemy[] = [];
  private waypoints: Point[] = WAYPOINTS;
  waveModifier: WaveModifier = null;

  private _aliveEnemies: Enemy[] = [];
  private _targetableEnemies: Enemy[] = [];
  private _cachesDirty = true;

  private rebuildCaches(): void {
    if (!this._cachesDirty) return;
    this._aliveEnemies = this.enemies.filter(e => e.alive);
    this._targetableEnemies = this._aliveEnemies.filter(e => !e.stealthed);
    this._cachesDirty = false;
  }

  setWaypoints(wp: Point[]): void {
    this.waypoints = wp;
  }

  getWaypoints(): Point[] {
    return this.waypoints;
  }

  spawnEnemy(config: EnemyConfig, hpMult: number, speedMult: number, rewardMult: number): void {
    const start = this.waypoints[0];
    const baseSpeed = config.speed * speedMult;
    const enemy: Enemy = {
      id: nextEnemyId++,
      type: config.type,
      x: start.x,
      y: start.y,
      hp: Math.floor(config.hp * hpMult),
      maxHp: Math.floor(config.hp * hpMult),
      speed: baseSpeed,
      baseSpeed,
      reward: Math.floor(config.reward * rewardMult),
      size: config.size,
      armor: config.armor || 0,
      poisonResist: config.poisonResist || false,
      slowResist: config.slowResist || 0,
      bodyColor: config.bodyColor,
      strokeColor: config.strokeColor,
      waypointIndex: 0,
      progress: 0,
      alive: true,
      statusEffects: [],
      animFrame: Math.random() * 100,
    };

    // Stealth enemies start invisible
    if (config.type === 'stealth') {
      enemy.stealthed = true;
    }

    // Earth dragon gets a shield
    if (config.type === 'dragon_earth') {
      enemy.shieldHp = 200 * hpMult;
      enemy.shieldMaxHp = 200 * hpMult;
      enemy.shieldRegenTimer = 0;
    }

    // Boss abilities cooldown
    if (config.type === 'boss') {
      enemy.bossAbilityCooldown = 5;
    }
    if (config.type === 'dragon_fire') {
      enemy.bossAbilityCooldown = 1;
    }
    if (config.type === 'void_empress') {
      enemy.bossAbilityCooldown = 3.5;
    }
    if (config.type === 'ice_witch') {
      enemy.bossAbilityCooldown = 4.2;
    }
    if (config.type === 'noxian_grand_general') {
      enemy.bossAbilityCooldown = 3.8;
    }
    if (config.type === 'dragon_air') {
      enemy.hasDashed = false;
    }

    this.enemies.push(enemy);
    this._cachesDirty = true;
  }

  update(dt: number): { reachedEnd: Enemy[]; dotKills: Enemy[]; dotDamages: { unitId: number; damage: number }[]; splitSpawns: Enemy[] } {
    const reachedEnd: Enemy[] = [];
    const dotKills: Enemy[] = [];
    const dotDamages: { unitId: number; damage: number }[] = [];
    const splitSpawns: Enemy[] = [];

    // Healer aura logic
    this.processHealerAuras(dt);

    // Healing wave modifier: all enemies regen 1% HP/s
    if (this.waveModifier === 'healing_wave') {
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * 0.01 * dt);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      enemy.animFrame += dt * 60;

      // Stealth reveal check: reveal when HP drops below 50%
      if (enemy.stealthed && enemy.hp / enemy.maxHp <= 0.5) {
        enemy.stealthed = false;
        this._cachesDirty = true;
      }

      // Earth dragon shield regen
      if (enemy.shieldMaxHp && enemy.shieldMaxHp > 0) {
        if (enemy.shieldHp! <= 0) {
          enemy.shieldRegenTimer = (enemy.shieldRegenTimer || 0) + dt;
          if (enemy.shieldRegenTimer! >= 4) {
            enemy.shieldHp = enemy.shieldMaxHp;
            enemy.shieldRegenTimer = 0;
          }
        }
      }

      // Air dragon dash at 50% HP
      if (enemy.type === 'dragon_air' && !enemy.hasDashed && enemy.hp / enemy.maxHp <= 0.5) {
        enemy.hasDashed = true;
        // Jump forward 3 waypoints
        const newIdx = Math.min(enemy.waypointIndex + 3, this.waypoints.length - 2);
        enemy.waypointIndex = newIdx;
        enemy.progress = 0;
        const wp = this.waypoints[newIdx];
        enemy.x = wp.x;
        enemy.y = wp.y;
      }

      // Boss (Baron) summon minions
      if (enemy.type === 'boss' && enemy.bossAbilityCooldown !== undefined) {
        enemy.bossAbilityCooldown -= dt;
        if (enemy.bossAbilityCooldown <= 0) {
          enemy.bossAbilityCooldown = 5;
          // Spawn 3 minions at boss position
          for (let i = 0; i < 3; i++) {
            const minionConfig = ENEMY_CONFIGS.normal;
            const minion: Enemy = {
              id: nextEnemyId++,
              type: 'normal',
              x: enemy.x + (Math.random() - 0.5) * 20,
              y: enemy.y + (Math.random() - 0.5) * 20,
              hp: Math.floor(minionConfig.hp * 0.5),
              maxHp: Math.floor(minionConfig.hp * 0.5),
              speed: minionConfig.speed * 1.2,
              baseSpeed: minionConfig.speed * 1.2,
              reward: 5,
              size: 6,
              armor: 0,
              poisonResist: false,
              slowResist: 0,
              bodyColor: '#9955CC',
              strokeColor: '#BB77EE',
              waypointIndex: enemy.waypointIndex,
              progress: enemy.progress,
              alive: true,
              statusEffects: [],
              animFrame: Math.random() * 100,
            };
            this.enemies.push(minion);
          }
          this._cachesDirty = true;
        }
      }

      // Bel'Veth: void brood swarm + temporary shell at low hp
      if (enemy.type === 'void_empress' && enemy.bossAbilityCooldown !== undefined) {
        enemy.bossAbilityCooldown -= dt;
        if (enemy.hp / enemy.maxHp <= 0.35 && !enemy.shieldMaxHp) {
          enemy.shieldMaxHp = enemy.maxHp * 0.22;
          enemy.shieldHp = enemy.shieldMaxHp;
        }
        if (enemy.bossAbilityCooldown <= 0) {
          enemy.bossAbilityCooldown = 3.5;
          for (let i = 0; i < 2; i++) {
            const cfg = ENEMY_CONFIGS.fast;
            this.enemies.push({
              id: nextEnemyId++, type: 'fast',
              x: enemy.x + (Math.random() - 0.5) * 18, y: enemy.y + (Math.random() - 0.5) * 18,
              hp: Math.floor(cfg.hp * 3.2), maxHp: Math.floor(cfg.hp * 3.2),
              speed: cfg.speed * 1.5, baseSpeed: cfg.speed * 1.5,
              reward: Math.floor(cfg.reward * 1.2), size: 7,
              armor: 0, poisonResist: false, slowResist: 0.5,
              bodyColor: '#9a63ff', strokeColor: '#d5b6ff',
              waypointIndex: enemy.waypointIndex, progress: enemy.progress,
              alive: true, statusEffects: [], animFrame: Math.random() * 100,
            });
          }
          this._cachesDirty = true;
        }
      }

      // Lissandra: icy slow aura pulses
      if (enemy.type === 'ice_witch' && enemy.bossAbilityCooldown !== undefined) {
        enemy.bossAbilityCooldown -= dt;
        if (enemy.bossAbilityCooldown <= 0) {
          enemy.bossAbilityCooldown = 4.2;
          for (const target of this.enemies) {
            if (!target.alive || target.id === enemy.id) continue;
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            if (dx * dx + dy * dy <= 110 * 110) {
              target.statusEffects.push({ type: 'slow', damagePerSecond: 0, duration: 2.2, slowFactor: 0.65 });
            }
          }
        }
      }

      // Swain: drains nearby units by healing himself periodically
      if (enemy.type === 'noxian_grand_general' && enemy.bossAbilityCooldown !== undefined) {
        enemy.bossAbilityCooldown -= dt;
        if (enemy.bossAbilityCooldown <= 0) {
          enemy.bossAbilityCooldown = 3.8;
          let drained = 0;
          for (const target of this.enemies) {
            if (!target.alive || target.id === enemy.id) continue;
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            if (dx * dx + dy * dy <= 130 * 130) {
              const amount = Math.min(18, target.hp);
              target.hp -= amount;
              drained += amount;
              if (target.hp <= 0) {
                target.alive = false;
                this._cachesDirty = true;
              }
            }
          }
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + drained * 0.45);
        }
      }

      const dotResult = this.processStatusEffects(enemy, dt);
      dotDamages.push(...dotResult.damages);
      if (!enemy.alive) {
        // Splitter: spawn 2 mini enemies on death
        if (enemy.type === 'splitter') {
          const splits = this.spawnSplitChildren(enemy);
          splitSpawns.push(...splits);
        }
        dotKills.push(enemy);
        this._cachesDirty = true;
        continue;
      }

      const nextIdx = enemy.waypointIndex + 1;
      if (nextIdx >= this.waypoints.length) {
        reachedEnd.push(enemy);
        enemy.alive = false;
        this._cachesDirty = true;
        continue;
      }

      const current = this.waypoints[enemy.waypointIndex];
      const next = this.waypoints[nextIdx];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const segLen = Math.sqrt(dx * dx + dy * dy);

      enemy.progress += (enemy.speed * dt) / segLen;

      if (enemy.progress >= 1) {
        enemy.waypointIndex++;
        enemy.progress = 0;
        if (enemy.waypointIndex + 1 >= this.waypoints.length) {
          reachedEnd.push(enemy);
          enemy.alive = false;
          this._cachesDirty = true;
          continue;
        }
      }

      const ci = enemy.waypointIndex;
      const ni = ci + 1;
      if (ni < this.waypoints.length) {
        const cw = this.waypoints[ci];
        const nw = this.waypoints[ni];
        enemy.x = cw.x + (nw.x - cw.x) * enemy.progress;
        enemy.y = cw.y + (nw.y - cw.y) * enemy.progress;
      }
    }

    this.enemies = this.enemies.filter(e => e.alive);
    this._cachesDirty = true;
    return { reachedEnd, dotKills, dotDamages, splitSpawns };
  }

  private processHealerAuras(dt: number): void {
    const healers = this.enemies.filter(e => e.alive && e.type === 'healer');
    const HEAL_RADIUS = 60;
    const HEAL_RATE = 0.05; // 5% max HP per second

    for (const healer of healers) {
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.id === healer.id) continue;
        const dx = enemy.x - healer.x;
        const dy = enemy.y - healer.y;
        if (dx * dx + dy * dy <= HEAL_RADIUS * HEAL_RADIUS) {
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * HEAL_RATE * dt);
        }
      }
    }
  }

  private spawnSplitChildren(parent: Enemy): Enemy[] {
    const children: Enemy[] = [];
    for (let i = 0; i < 2; i++) {
      children.push({
        id: nextEnemyId++,
        type: 'normal', // children are normal type
        x: parent.x + (i === 0 ? -8 : 8),
        y: parent.y,
        hp: Math.floor(parent.maxHp * 0.35),
        maxHp: Math.floor(parent.maxHp * 0.35),
        speed: parent.baseSpeed * 1.4,
        baseSpeed: parent.baseSpeed * 1.4,
        reward: Math.floor(parent.reward * 0.4),
        size: 6,
        armor: 0,
        poisonResist: false,
        slowResist: 0,
        bodyColor: '#9966DD',
        strokeColor: '#BB88FF',
        waypointIndex: parent.waypointIndex,
        progress: parent.progress,
        alive: true,
        statusEffects: [],
        animFrame: Math.random() * 100,
      });
    }
    this.enemies.push(...children);
    this._cachesDirty = true;
    return children;
  }

  private processStatusEffects(enemy: Enemy, dt: number): { damages: { unitId: number; damage: number }[] } {
    let slowFactor = 1;
    const damages: { unitId: number; damage: number }[] = [];

    for (let i = enemy.statusEffects.length - 1; i >= 0; i--) {
      const effect = enemy.statusEffects[i];
      effect.duration -= dt;

      if (effect.type === 'poison' || effect.type === 'burn') {
        const tickDamage = effect.damagePerSecond * dt;
        enemy.hp -= tickDamage;
        if (effect.sourceUnitId) {
          damages.push({ unitId: effect.sourceUnitId, damage: tickDamage });
        }
        if (enemy.hp <= 0) {
          enemy.alive = false;
        }
      }

      if (effect.type === 'slow') {
        const effectiveSlow = effect.slowFactor + (1 - effect.slowFactor) * enemy.slowResist;
        slowFactor = Math.min(slowFactor, effectiveSlow);
      }

      if (effect.duration <= 0) {
        enemy.statusEffects.splice(i, 1);
      }
    }

    enemy.speed = enemy.baseSpeed * slowFactor;

    // Ice dragon aura: slow nearby towers (handled in TowerManager via GameEngine)
    return { damages };
  }

  applyStatusEffect(enemyId: number, effect: StatusEffect): void {
    const enemy = this.enemies.find(e => e.id === enemyId && e.alive);
    if (!enemy) return;

    if (effect.type === 'poison' && enemy.poisonResist) return;

    const existing = enemy.statusEffects.find(e => e.type === effect.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
      existing.damagePerSecond = Math.max(existing.damagePerSecond, effect.damagePerSecond);
      if (effect.sourceUnitId) existing.sourceUnitId = effect.sourceUnitId;
      if (effect.type === 'slow') {
        existing.slowFactor = Math.min(existing.slowFactor, effect.slowFactor);
      }
    } else {
      enemy.statusEffects.push({ ...effect });
    }
  }

  damageEnemy(id: number, damage: number): { killed: boolean; reward: number; isSplitter: boolean } {
    const enemy = this.enemies.find(e => e.id === id);
    if (!enemy || !enemy.alive) return { killed: false, reward: 0, isSplitter: false };

    let remainingDamage = damage;

    // Shield absorbs damage first (Earth Dragon)
    if (enemy.shieldHp && enemy.shieldHp > 0) {
      const shieldAbsorb = Math.min(enemy.shieldHp, remainingDamage);
      enemy.shieldHp -= shieldAbsorb;
      remainingDamage -= shieldAbsorb;
      enemy.shieldRegenTimer = 0; // reset regen on hit
      if (remainingDamage <= 0) return { killed: false, reward: 0, isSplitter: false };
    }

    const effectiveDamage = Math.max(1, remainingDamage - enemy.armor);
    enemy.hp -= effectiveDamage;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      this._cachesDirty = true;
      const isSplitter = enemy.type === 'splitter';
      if (isSplitter) {
        this.spawnSplitChildren(enemy);
      }
      return { killed: true, reward: enemy.reward, isSplitter };
    }
    return { killed: false, reward: 0, isSplitter: false };
  }

  getAliveEnemies(): Enemy[] {
    this.rebuildCaches();
    return this._aliveEnemies;
  }

  /** Get targetable enemies (excludes stealthed) */
  getTargetableEnemies(): Enemy[] {
    this.rebuildCaches();
    return this._targetableEnemies;
  }

  /** Get ice dragons for tower slow aura */
  getIceDragonAuras(): { x: number; y: number; radius: number }[] {
    return this.enemies
      .filter(e => e.alive && e.type === 'dragon_ice')
      .map(e => ({ x: e.x, y: e.y, radius: 80 }));
  }

  clear(): void {
    this.enemies = [];
    this._cachesDirty = true;
  }
}
