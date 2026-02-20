import { WaveConfig, EnemyConfig, EnemyType } from '../types';

export const TOTAL_WAVES = 50;

export function getWaveConfig(waveNumber: number): WaveConfig {
  // Non-linear exponential-soft difficulty curve
  const hpMult = 1 + (waveNumber - 1) * 0.25 + Math.pow(waveNumber / 10, 1.5);
  const enemyCount = Math.min(40, 5 + Math.floor(waveNumber * 0.75));
  const spawnInterval = Math.max(300, 1000 - waveNumber * 14);
  const speedMult = 1 + (waveNumber - 1) * 0.04;
  const rewardMult = 1 + (waveNumber - 1) * 0.12;

  return {
    waveNumber,
    enemyCount,
    spawnInterval,
    enemyHpMultiplier: hpMult,
    enemySpeedMultiplier: speedMult,
    enemyRewardMultiplier: rewardMult,
  };
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  normal: {
    type: 'normal', hp: 25, speed: 55, reward: 10, size: 8,
    armor: 0, slowResist: 0,
    bodyColor: '#6B3FA0', strokeColor: '#9B6FD0',
    label: 'Minion',
  },
  fast: {
    type: 'fast', hp: 12, speed: 110, reward: 12, size: 7,
    armor: 0, slowResist: 0.3,
    bodyColor: '#22BBAA', strokeColor: '#44EEDD',
    label: 'Scuttle Crab',
  },
  tank: {
    type: 'tank', hp: 90, speed: 35, reward: 20, size: 13,
    armor: 3, slowResist: 0,
    bodyColor: '#CC3300', strokeColor: '#FF5522',
    label: 'Red Brambleback',
  },
  armored: {
    type: 'armored', hp: 55, speed: 45, reward: 18, size: 11,
    armor: 6, poisonResist: true, slowResist: 0.5,
    bodyColor: '#553388', strokeColor: '#8855CC',
    label: 'Super Minion',
  },
  dragon_fire: {
    type: 'dragon_fire', hp: 200, speed: 40, reward: 60, size: 14,
    armor: 2, slowResist: 0.4,
    bodyColor: '#FF4400', strokeColor: '#FF8844',
    label: 'Dragon Infernal',
  },
  dragon_ice: {
    type: 'dragon_ice', hp: 200, speed: 38, reward: 60, size: 14,
    armor: 2, slowResist: 0.6,
    bodyColor: '#2299FF', strokeColor: '#66CCFF',
    label: 'Dragon de Glace',
  },
  dragon_earth: {
    type: 'dragon_earth', hp: 300, speed: 30, reward: 70, size: 14,
    armor: 8, slowResist: 0.3,
    bodyColor: '#886633', strokeColor: '#BBAA55',
    label: 'Dragon de Terre',
  },
  dragon_air: {
    type: 'dragon_air', hp: 150, speed: 70, reward: 55, size: 14,
    armor: 1, slowResist: 0.7,
    bodyColor: '#CCCCDD', strokeColor: '#EEEEFF',
    label: 'Dragon des Airs',
  },
  boss: {
    type: 'boss', hp: 400, speed: 25, reward: 100, size: 18,
    armor: 4, slowResist: 0.6,
    bodyColor: '#8822CC', strokeColor: '#BB55FF',
    label: 'BARON',
  },
};

export interface WaveEnemyPool {
  type: EnemyType;
  weight: number;
}

export function getWaveEnemyPool(waveNumber: number): WaveEnemyPool[] {
  const pool: WaveEnemyPool[] = [{ type: 'normal', weight: 10 }];

  if (waveNumber >= 5) pool.push({ type: 'fast', weight: 4 });
  if (waveNumber >= 11) pool.push({ type: 'tank', weight: 3 });
  if (waveNumber >= 14) pool.push({ type: 'armored', weight: 2 });

  // Reduce normal weight as more types appear
  if (waveNumber >= 20) pool[0].weight = 7;
  if (waveNumber >= 30) pool[0].weight = 5;
  if (waveNumber >= 40) pool[0].weight = 3;

  return pool;
}

export function isBossWave(waveNumber: number): boolean {
  return waveNumber === 10 || waveNumber === 20 || waveNumber === 30 || waveNumber === 40 || waveNumber === 50;
}

export function getBossTypeForWave(waveNumber: number): EnemyType {
  switch (waveNumber) {
    case 10: return 'dragon_fire';
    case 20: return 'dragon_ice';
    case 30: return 'dragon_earth';
    case 40: return 'dragon_air';
    case 50: return 'boss'; // Atakhan
    default: return 'boss';
  }
}
