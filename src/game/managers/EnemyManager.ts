import { Enemy, EnemyConfig, Point } from '../types';
import { WAYPOINTS } from '../data/mapData';

let nextEnemyId = 1;

export class EnemyManager {
  enemies: Enemy[] = [];

  spawnEnemy(config: EnemyConfig, hpMult: number, speedMult: number, rewardMult: number): void {
    const start = WAYPOINTS[0];
    this.enemies.push({
      id: nextEnemyId++,
      x: start.x,
      y: start.y,
      hp: Math.floor(config.hp * hpMult),
      maxHp: Math.floor(config.hp * hpMult),
      speed: config.speed * speedMult,
      reward: Math.floor(config.reward * rewardMult),
      size: config.size,
      waypointIndex: 0,
      progress: 0,
      alive: true,
    });
  }

  update(dt: number): { reachedEnd: Enemy[] } {
    const reachedEnd: Enemy[] = [];

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const nextIdx = enemy.waypointIndex + 1;
      if (nextIdx >= WAYPOINTS.length) {
        reachedEnd.push(enemy);
        enemy.alive = false;
        continue;
      }

      const current = WAYPOINTS[enemy.waypointIndex];
      const next = WAYPOINTS[nextIdx];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      
      enemy.progress += (enemy.speed * dt) / segLen;

      if (enemy.progress >= 1) {
        enemy.waypointIndex++;
        enemy.progress = 0;
        if (enemy.waypointIndex + 1 >= WAYPOINTS.length) {
          reachedEnd.push(enemy);
          enemy.alive = false;
          continue;
        }
      }

      // Interpolate position
      const ci = enemy.waypointIndex;
      const ni = ci + 1;
      if (ni < WAYPOINTS.length) {
        const cw = WAYPOINTS[ci];
        const nw = WAYPOINTS[ni];
        enemy.x = cw.x + (nw.x - cw.x) * enemy.progress;
        enemy.y = cw.y + (nw.y - cw.y) * enemy.progress;
      }
    }

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.alive);
    return { reachedEnd };
  }

  damageEnemy(id: number, damage: number): { killed: boolean; reward: number } {
    const enemy = this.enemies.find(e => e.id === id);
    if (!enemy || !enemy.alive) return { killed: false, reward: 0 };

    enemy.hp -= damage;
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
