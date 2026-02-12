import { WaveConfig } from '../types';
import { getWaveConfig, BASE_ENEMY, TOTAL_WAVES } from '../data/waveData';
import { EnemyManager } from './EnemyManager';

export class WaveManager {
  currentWave: number = 0;
  waveActive: boolean = false;
  totalWaves: number = TOTAL_WAVES;
  
  private waveConfig: WaveConfig | null = null;
  private spawnTimer: number = 0;
  private spawned: number = 0;

  startWave(): WaveConfig | null {
    if (this.currentWave >= this.totalWaves) return null;
    this.currentWave++;
    this.waveConfig = getWaveConfig(this.currentWave);
    this.waveActive = true;
    this.spawnTimer = 0;
    this.spawned = 0;
    return this.waveConfig;
  }

  update(dt: number, enemyManager: EnemyManager): void {
    if (!this.waveActive || !this.waveConfig) return;

    this.spawnTimer -= dt * 1000;

    if (this.spawnTimer <= 0 && this.spawned < this.waveConfig.enemyCount) {
      enemyManager.spawnEnemy(
        BASE_ENEMY,
        this.waveConfig.enemyHpMultiplier,
        this.waveConfig.enemySpeedMultiplier,
        this.waveConfig.enemyRewardMultiplier
      );
      this.spawned++;
      this.spawnTimer = this.waveConfig.spawnInterval;
    }

    // Wave ends when all enemies spawned and killed
    if (this.spawned >= this.waveConfig.enemyCount && enemyManager.getAliveEnemies().length === 0) {
      this.waveActive = false;
    }
  }

  isComplete(): boolean {
    return this.currentWave >= this.totalWaves && !this.waveActive;
  }
}
