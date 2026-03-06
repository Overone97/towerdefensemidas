import { WaveConfig, EnemyConfig, EnemyType, WaveModifier } from '../types';

export const TOTAL_WAVES = 100;

export function getWaveModifier(waveNumber: number): WaveModifier {
  const modifierMap: Record<number, WaveModifier> = {
    8: 'rush', 22: 'rush', 38: 'rush', 52: 'rush', 72: 'rush', 88: 'rush',
    18: 'tank_parade', 42: 'tank_parade', 62: 'tank_parade', 82: 'tank_parade',
    12: 'speed_blitz', 32: 'speed_blitz', 56: 'speed_blitz', 78: 'speed_blitz',
    25: 'healing_wave', 55: 'healing_wave', 75: 'healing_wave', 95: 'healing_wave',
    35: 'dark_wave', 65: 'dark_wave', 85: 'dark_wave',
  };
  return modifierMap[waveNumber] || null;
}

export const WAVE_MODIFIER_INFO: Record<string, { label: string; icon: string; description: string; color: string }> = {
  rush: { label: 'Rush !', icon: '⚡', description: '2× ennemis, 50% HP', color: '#ffaa00' },
  tank_parade: { label: 'Tank Parade', icon: '🛡️', description: 'Tanks & Armored uniquement', color: '#8855cc' },
  speed_blitz: { label: 'Speed Blitz', icon: '💨', description: 'Ennemis rapides +30% vitesse', color: '#22bbaa' },
  healing_wave: { label: 'Healing Wave', icon: '💚', description: 'Ennemis régénèrent 1% HP/s', color: '#44ff44' },
  dark_wave: { label: 'Dark Wave', icon: '👁️', description: 'Ennemis stealth mélangés', color: '#aa44ff' },
};

export function getWaveConfig(waveNumber: number): WaveConfig {
  const hpMult = 1 + (waveNumber - 1) * 0.3 + Math.pow(waveNumber / 8, 1.7);
  let enemyCount = Math.min(60, 5 + Math.floor(waveNumber * 0.6));
  const spawnInterval = Math.max(200, 1000 - waveNumber * 10);
  let speedMult = 1 + (waveNumber - 1) * 0.035;
  const rewardMult = 1 + (waveNumber - 1) * 0.1;
  let hpMultFinal = hpMult;

  const modifier = getWaveModifier(waveNumber);

  // Apply modifier adjustments
  if (modifier === 'rush') {
    enemyCount = Math.floor(enemyCount * 2);
    hpMultFinal = hpMult * 0.5;
  } else if (modifier === 'speed_blitz') {
    speedMult *= 1.3;
  }

  return {
    waveNumber,
    enemyCount,
    spawnInterval,
    enemyHpMultiplier: hpMultFinal,
    enemySpeedMultiplier: speedMult,
    enemyRewardMultiplier: rewardMult,
    modifier,
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
  healer: {
    type: 'healer', hp: 35, speed: 45, reward: 25, size: 9,
    armor: 1, slowResist: 0.2,
    bodyColor: '#88CC44', strokeColor: '#BBFF77',
    label: 'Soraka',
  },
  stealth: {
    type: 'stealth', hp: 40, speed: 65, reward: 22, size: 8,
    armor: 0, slowResist: 0.4,
    bodyColor: '#8844AA', strokeColor: '#BB77DD',
    label: 'Evelynn',
  },
  splitter: {
    type: 'splitter', hp: 50, speed: 50, reward: 15, size: 10,
    armor: 0, slowResist: 0,
    bodyColor: '#7744BB', strokeColor: '#AA77EE',
    label: 'Voidling',
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

export function getWaveEnemyPool(waveNumber: number, modifier?: WaveModifier): WaveEnemyPool[] {
  // Override pools for themed waves
  if (modifier === 'tank_parade') {
    return [{ type: 'tank', weight: 5 }, { type: 'armored', weight: 5 }];
  }
  if (modifier === 'speed_blitz') {
    return [{ type: 'fast', weight: 10 }];
  }
  if (modifier === 'dark_wave') {
    return [{ type: 'stealth', weight: 6 }, { type: 'normal', weight: 3 }, { type: 'fast', weight: 2 }];
  }

  const pool: WaveEnemyPool[] = [{ type: 'normal', weight: 10 }];

  if (waveNumber >= 5) pool.push({ type: 'fast', weight: 4 });
  if (waveNumber >= 11) pool.push({ type: 'tank', weight: 3 });
  if (waveNumber >= 14) pool.push({ type: 'armored', weight: 2 });
  if (waveNumber >= 16) pool.push({ type: 'healer', weight: 2 });
  if (waveNumber >= 20) pool.push({ type: 'stealth', weight: 2 });
  if (waveNumber >= 24) pool.push({ type: 'splitter', weight: 2 });

  if (waveNumber >= 20) pool[0].weight = 7;
  if (waveNumber >= 30) pool[0].weight = 5;
  if (waveNumber >= 40) pool[0].weight = 3;
  if (waveNumber >= 50) {
    pool[0].weight = 2;
    const healerEntry = pool.find(p => p.type === 'healer');
    if (healerEntry) healerEntry.weight = 3;
  }
  if (waveNumber >= 60) {
    pool.find(p => p.type === 'tank')!.weight = 5;
    pool.find(p => p.type === 'armored')!.weight = 4;
    const stealthEntry = pool.find(p => p.type === 'stealth');
    if (stealthEntry) stealthEntry.weight = 3;
  }
  if (waveNumber >= 70) {
    pool[0].weight = 1;
    const splitterEntry = pool.find(p => p.type === 'splitter');
    if (splitterEntry) splitterEntry.weight = 4;
  }
  if (waveNumber >= 80) {
    pool.find(p => p.type === 'armored')!.weight = 6;
  }

  return pool;
}

export function isBossWave(waveNumber: number): boolean {
  return waveNumber % 5 === 0;
}

export function getBossTypeForWave(waveNumber: number): EnemyType {
  switch (waveNumber) {
    case 5: return 'tank';
    case 10: return 'dragon_fire';
    case 15: return 'armored';
    case 20: return 'dragon_ice';
    case 25: return 'dragon_fire';
    case 30: return 'dragon_earth';
    case 35: return 'dragon_ice';
    case 40: return 'dragon_air';
    case 45: return 'boss';
    case 50: return 'boss';
    case 55: return 'dragon_fire';
    case 60: return 'dragon_earth';
    case 65: return 'dragon_ice';
    case 70: return 'boss';
    case 75: return 'dragon_air';
    case 80: return 'boss';
    case 85: return 'dragon_earth';
    case 90: return 'boss';
    case 95: return 'boss';
    case 100: return 'boss';
    default: return waveNumber % 10 === 0 ? 'boss' : 'dragon_fire';
  }
}
