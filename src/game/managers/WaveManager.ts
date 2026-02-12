import { WaveConfig, EnemyType } from '../types';
import { getWaveConfig, ENEMY_CONFIGS, TOTAL_WAVES, getWaveEnemyPool, isBossWave, WaveEnemyPool } from '../data/waveData';
import { EnemyManager } from './EnemyManager';

export class WaveManager {
  currentWave: number = 0;
  waveActive: boolean = false;
  totalWaves: number = TOTAL_WAVES;
  
  private waveConfig: WaveConfig | null = null;
  private spawnTimer: number = 0;
  private spawned: number = 0;
  private bossSpawned: boolean = false;
  private enemyPool: WaveEnemyPool[] = [];
  private totalWeight: number = 0;

  startWave(): WaveConfig | null {
    if (this.currentWave >= this.totalWaves) return null;
    this.currentWave++;
    this.waveConfig = getWaveConfig(this.currentWave);
    this.waveActive = true;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.bossSpawned = false;
    this.enemyPool = getWaveEnemyPool(this.currentWave);
    this.totalWeight = this.enemyPool.reduce((sum, e) => sum + e.weight, 0);
    return this.waveConfig;
  }

  update(dt: number, enemyManager: EnemyManager): void {
    if (!this.waveActive || !this.waveConfig) return;

    this.spawnTimer -= dt * 1000;

    if (this.spawnTimer <= 0 && this.spawned < this.waveConfig.enemyCount) {
      // Spawn boss on boss waves as the last enemy
      const isBoss = isBossWave(this.currentWave) && !this.bossSpawned && this.spawned >= this.waveConfig.enemyCount - 1;
      
      let enemyType: EnemyType;
      if (isBoss) {
        enemyType = 'boss';
        this.bossSpawned = true;
      } else {
        enemyType = this.rollEnemyType();
      }

      const config = ENEMY_CONFIGS[enemyType];
      enemyManager.spawnEnemy(
        config,
        this.waveConfig.enemyHpMultiplier,
        this.waveConfig.enemySpeedMultiplier,
        this.waveConfig.enemyRewardMultiplier
      );
      this.spawned++;
      this.spawnTimer = this.waveConfig.spawnInterval;
    }

    if (this.spawned >= this.waveConfig.enemyCount && enemyManager.getAliveEnemies().length === 0) {
      this.waveActive = false;
    }
  }

  private rollEnemyType(): EnemyType {
    let roll = Math.random() * this.totalWeight;
    for (const entry of this.enemyPool) {
      roll -= entry.weight;
      if (roll <= 0) return entry.type;
    }
    return 'normal';
  }

  isComplete(): boolean {
    return this.currentWave >= this.totalWaves && !this.waveActive;
  }
}
