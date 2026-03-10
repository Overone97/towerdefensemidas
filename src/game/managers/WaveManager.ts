import { WaveConfig, EnemyType, WaveModifier } from '../types';
import { getWaveConfig, ENEMY_CONFIGS, TOTAL_WAVES, getWaveEnemyPool, isBossWave, getBossTypeForWave, WaveEnemyPool, getWaveModifier } from '../data/waveData';
import { EnemyManager } from './EnemyManager';

export class WaveManager {
  currentWave: number = 0;
  waveActive: boolean = false;
  totalWaves: number = TOTAL_WAVES;
  endlessMode: boolean = false;
  currentModifier: WaveModifier = null;
  /** Dungeon overrides */
  forcedModifier: WaveModifier = null;
  dungeonHpMult: number = 1;
  dungeonSpeedMult: number = 1;
  
  private waveConfig: WaveConfig | null = null;
  private spawnTimer: number = 0;
  spawned: number = 0;
  enemyCount: number = 0;
  private bossSpawned: boolean = false;
  private enemyPool: WaveEnemyPool[] = [];
  private totalWeight: number = 0;

  startWave(): WaveConfig | null {
    if (!this.endlessMode && this.currentWave >= this.totalWaves) return null;
    this.currentWave++;
    this.waveConfig = this.endlessMode ? this.getEndlessWaveConfig(this.currentWave) : getWaveConfig(this.currentWave);
    
    // Apply dungeon overrides
    if (this.forcedModifier) {
      this.waveConfig.modifier = this.forcedModifier;
    }
    if (this.dungeonHpMult !== 1) {
      this.waveConfig.enemyHpMultiplier *= this.dungeonHpMult;
    }
    if (this.dungeonSpeedMult !== 1) {
      this.waveConfig.enemySpeedMultiplier *= this.dungeonSpeedMult;
    }
    
    this.currentModifier = this.waveConfig.modifier || null;
    this.waveActive = true;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.enemyCount = this.waveConfig.enemyCount;
    this.bossSpawned = false;
    this.enemyPool = getWaveEnemyPool(this.currentWave, this.currentModifier);
    this.totalWeight = this.enemyPool.reduce((sum, e) => sum + e.weight, 0);
    return this.waveConfig;
  }

  private getEndlessWaveConfig(wave: number): WaveConfig {
    const scaleFactor = 1 + (wave - 1) * 0.15;
    const modifier = getWaveModifier(((wave - 1) % 100) + 1);
    return {
      waveNumber: wave,
      enemyCount: 5 + Math.floor(wave * 2),
      spawnInterval: Math.max(250, 1000 - wave * 20),
      enemyHpMultiplier: scaleFactor * 1.5,
      enemySpeedMultiplier: 1 + (wave - 1) * 0.03,
      enemyRewardMultiplier: 1 + (wave - 1) * 0.15,
      modifier,
    };
  }

  update(dt: number, enemyManager: EnemyManager): void {
    if (!this.waveActive || !this.waveConfig) return;

    // Pass modifier to enemy manager for healing wave
    enemyManager.waveModifier = this.currentModifier;

    this.spawnTimer -= dt * 1000;

    if (this.spawnTimer <= 0 && this.spawned < this.waveConfig.enemyCount) {
      const bossSpawnPoint = Math.floor(this.waveConfig.enemyCount * 0.4);
      const isBoss = isBossWave(this.currentWave) && !this.bossSpawned && this.spawned >= bossSpawnPoint;
      
      let enemyType: EnemyType;
      if (isBoss) {
        enemyType = getBossTypeForWave(this.currentWave);
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
      this.currentModifier = null;
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
    if (this.endlessMode) return false;
    return this.currentWave >= this.totalWaves && !this.waveActive;
  }
}
