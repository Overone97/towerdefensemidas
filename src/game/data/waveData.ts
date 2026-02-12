import { WaveConfig, EnemyConfig, EnemyType } from '../types';

export const TOTAL_WAVES = 20;

export function getWaveConfig(waveNumber: number): WaveConfig {
  return {
    waveNumber,
    enemyCount: 5 + Math.floor(waveNumber * 1.5),
    spawnInterval: Math.max(400, 1000 - waveNumber * 25),
    enemyHpMultiplier: 1 + (waveNumber - 1) * 0.3,
    enemySpeedMultiplier: 1 + (waveNumber - 1) * 0.05,
    enemyRewardMultiplier: 1 + (waveNumber - 1) * 0.1,
  };
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  normal: {
    type: 'normal', hp: 30, speed: 60, reward: 10, size: 8,
    armor: 0, slowResist: 0,
    bodyColor: '#cc4444', strokeColor: '#ff6666',
  },
  fast: {
    type: 'fast', hp: 15, speed: 110, reward: 12, size: 6,
    armor: 0, slowResist: 0.3,
    bodyColor: '#44cc88', strokeColor: '#66ffaa',
  },
  tank: {
    type: 'tank', hp: 90, speed: 35, reward: 20, size: 13,
    armor: 2, slowResist: 0,
    bodyColor: '#888899', strokeColor: '#aaaacc',
  },
  armored: {
    type: 'armored', hp: 50, speed: 50, reward: 18, size: 10,
    armor: 5, poisonResist: true, slowResist: 0.5,
    bodyColor: '#997733', strokeColor: '#ccaa44',
  },
  boss: {
    type: 'boss', hp: 250, speed: 30, reward: 80, size: 16,
    armor: 3, slowResist: 0.6,
    bodyColor: '#aa22aa', strokeColor: '#dd44dd',
    label: 'BOSS',
  },
};

// Defines which enemy types appear per wave, with spawn weights
export interface WaveEnemyPool {
  type: EnemyType;
  weight: number;
}

export function getWaveEnemyPool(waveNumber: number): WaveEnemyPool[] {
  const pool: WaveEnemyPool[] = [{ type: 'normal', weight: 10 }];

  if (waveNumber >= 3) pool.push({ type: 'fast', weight: 4 });
  if (waveNumber >= 5) pool.push({ type: 'tank', weight: 3 });
  if (waveNumber >= 8) pool.push({ type: 'armored', weight: 2 });

  // Reduce normal weight as more types appear
  if (waveNumber >= 10) pool[0].weight = 6;
  if (waveNumber >= 15) pool[0].weight = 4;

  return pool;
}

export function isBossWave(waveNumber: number): boolean {
  return waveNumber > 0 && waveNumber % 5 === 0;
}
