import { Enemy, EnemyConfig, Point, StatusEffect } from '../types';
import { WAYPOINTS } from '../data/mapData';

let nextEnemyId = 1;

export class EnemyManager {
  enemies: Enemy[] = [];
  private waypoints: Point[] = WAYPOINTS;

  setWaypoints(wp: Point[]): void {
    this.waypoints = wp;
  }

  getWaypoints(): Point[] {
    return this.waypoints;
  }

  spawnEnemy(config: EnemyConfig, hpMult: number, speedMult: number, rewardMult: number): void {
    const start = this.waypoints[0];
    const baseSpeed = config.speed * speedMult;
    this.enemies.push({
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
    });
  }

  update(dt: number): { reachedEnd: Enemy[] } {
    const reachedEnd: Enemy[] = [];

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      enemy.animFrame += dt * 60;
      this.processStatusEffects(enemy, dt);
      if (!enemy.alive) continue;

      const nextIdx = enemy.waypointIndex + 1;
      if (nextIdx >= this.waypoints.length) {
        reachedEnd.push(enemy);
        enemy.alive = false;
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
    return { reachedEnd };
  }

  private processStatusEffects(enemy: Enemy, dt: number): void {
    let slowFactor = 1;

    for (let i = enemy.statusEffects.length - 1; i >= 0; i--) {
      const effect = enemy.statusEffects[i];
      effect.duration -= dt;

      if (effect.type === 'poison' || effect.type === 'burn') {
        enemy.hp -= effect.damagePerSecond * dt;
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
  }

  applyStatusEffect(enemyId: number, effect: StatusEffect): void {
    const enemy = this.enemies.find(e => e.id === enemyId && e.alive);
    if (!enemy) return;

    if (effect.type === 'poison' && enemy.poisonResist) return;

    const existing = enemy.statusEffects.find(e => e.type === effect.type);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
      existing.damagePerSecond = Math.max(existing.damagePerSecond, effect.damagePerSecond);
      if (effect.type === 'slow') {
        existing.slowFactor = Math.min(existing.slowFactor, effect.slowFactor);
      }
    } else {
      enemy.statusEffects.push({ ...effect });
    }
  }

  damageEnemy(id: number, damage: number): { killed: boolean; reward: number } {
    const enemy = this.enemies.find(e => e.id === id);
    if (!enemy || !enemy.alive) return { killed: false, reward: 0 };

    const effectiveDamage = Math.max(1, damage - enemy.armor);
    enemy.hp -= effectiveDamage;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      return { killed: true, reward: enemy.reward };
    }
    return { killed: false, reward: 0 };
  }

  getAliveEnemies(): Enemy[] {
    return this.enemies.filter(e => e.alive);
  }

  clear(): void {
    this.enemies = [];
  }
}
