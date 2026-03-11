import { Rarity, WaveModifier } from '../types';
import { MapDef, ALL_MAPS } from './allMaps';

export interface DungeonRule {
  /** Only allow these rarities (null = all) */
  allowedRarities?: Rarity[];
  /** Disable equipment on units */
  noEquipment?: boolean;
  /** Max number of units deployable */
  maxUnits?: number;
  /** Enemy HP multiplier */
  enemyHpMult?: number;
  /** Enemy speed multiplier */
  enemySpeedMult?: number;
  /** Global gold multiplier */
  goldMult?: number;
  /** Starting gold override */
  startGold?: number;
  /** Force a wave modifier on all waves */
  forceModifier?: WaveModifier;
  /** Timer in seconds (0 = no timer) */
  timeLimit?: number;
}

export interface DungeonReward {
  stars: number;
  gold: number;
  /** Guaranteed equipment rarity drop */
  guaranteedEquipRarity?: Rarity;
}

export interface DungeonDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Which base map to use for layout */
  baseMapId: string;
  /** Number of waves */
  totalWaves: number;
  rules: DungeonRule;
  reward: DungeonReward;
  /** Color theme */
  color: string;
  /** Difficulty label */
  difficulty: 'Normal' | 'Hard' | 'Extreme';
}

/** All dungeons in the game — 3 rotate daily */
export const ALL_DUNGEONS: DungeonDef[] = [
  {
    id: 'dungeon_rookies',
    name: 'Arena des Rookies',
    description: 'Seulement des champions Common & Uncommon. Prouve que la rareté ne fait pas tout !',
    icon: '⚔️',
    baseMapId: 'plains',
    totalWaves: 15,
    rules: {
      allowedRarities: ['common', 'uncommon'],
      startGold: 300,
      enemyHpMult: 0.8,
    },
    reward: { stars: 5, gold: 500 },
    color: '#44aa66',
    difficulty: 'Normal',
  },
  {
    id: 'dungeon_naked',
    name: 'Défi Nu',
    description: 'Aucun équipement autorisé. Tes champions devront compter sur leurs stats brutes.',
    icon: '🚫',
    baseMapId: 'forest',
    totalWaves: 15,
    rules: {
      noEquipment: true,
      enemyHpMult: 0.9,
      startGold: 250,
    },
    reward: { stars: 5, gold: 400, guaranteedEquipRarity: 'rare' },
    color: '#cc6644',
    difficulty: 'Normal',
  },
  {
    id: 'dungeon_blitz',
    name: 'Blitz Infernal',
    description: 'Vagues ultra-rapides avec timer de 5 minutes. Peux-tu tenir le rythme ?',
    icon: '⏱️',
    baseMapId: 'plains',
    totalWaves: 12,
    rules: {
      enemySpeedMult: 1.25,
      timeLimit: 300,
      startGold: 450,
    },
    reward: { stars: 6, gold: 600 },
    color: '#dd4444',
    difficulty: 'Hard',
  },
  {
    id: 'dungeon_minimalist',
    name: 'Minimaliste',
    description: 'Maximum 3 unités sur le terrain. Chaque placement compte.',
    icon: '🎯',
    baseMapId: 'volcano',
    totalWaves: 12,
    rules: {
      maxUnits: 3,
      startGold: 400,
      goldMult: 1.5,
    },
    reward: { stars: 7, gold: 500, guaranteedEquipRarity: 'epic' },
    color: '#8855cc',
    difficulty: 'Hard',
  },
  {
    id: 'dungeon_tank_rush',
    name: 'Marée Blindée',
    description: 'Uniquement des tanks et armored. Tu vas avoir besoin de DPS.',
    icon: '🛡️',
    baseMapId: 'forest',
    totalWaves: 15,
    rules: {
      forceModifier: 'tank_parade',
      enemyHpMult: 1.3,
      startGold: 300,
    },
    reward: { stars: 6, gold: 550, guaranteedEquipRarity: 'rare' },
    color: '#5577bb',
    difficulty: 'Hard',
  },
  {
    id: 'dungeon_darkness',
    name: 'Abîme des Ombres',
    description: 'Tous les ennemis sont invisibles. Les détecteurs sont essentiels.',
    icon: '👁️',
    baseMapId: 'volcano',
    totalWaves: 15,
    rules: {
      forceModifier: 'dark_wave',
      enemyHpMult: 1.1,
      enemySpeedMult: 1.1,
      startGold: 350,
    },
    reward: { stars: 8, gold: 700, guaranteedEquipRarity: 'epic' },
    color: '#6633aa',
    difficulty: 'Extreme',
  },
];

/**
 * Get the 3 dungeons available today based on day-of-year rotation.
 */
export function getTodaysDungeons(): DungeonDef[] {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const startIdx = (dayOfYear * 3) % ALL_DUNGEONS.length;
  const result: DungeonDef[] = [];
  for (let i = 0; i < 3; i++) {
    result.push(ALL_DUNGEONS[(startIdx + i) % ALL_DUNGEONS.length]);
  }
  return result;
}

/**
 * Check if a dungeon was completed today.
 */
export function isDungeonCompletedToday(dungeonId: string, completions: Record<string, string>): boolean {
  const lastDate = completions[dungeonId];
  if (!lastDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return lastDate === today;
}

/**
 * Get the map definition for a dungeon (based on its baseMapId).
 */
export function getDungeonMap(dungeon: DungeonDef): MapDef {
  return ALL_MAPS.find(m => m.id === dungeon.baseMapId) || ALL_MAPS[0];
}
