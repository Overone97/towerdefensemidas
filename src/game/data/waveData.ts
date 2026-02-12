import { WaveConfig, EnemyConfig } from '../types';

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

export const BASE_ENEMY: EnemyConfig = {
  hp: 30,
  speed: 60, // pixels per second
  reward: 10,
  size: 10,
};
