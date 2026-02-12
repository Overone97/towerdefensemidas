import { OwnedCharacter } from '../types';
import { ALL_CHARACTERS } from '../data/characterData';

const SAVE_KEY = 'td_save_v1';

export interface LeaderboardEntry {
  score: number;
  wave: number;
  date: string;
}

export interface SaveData {
  inventory: { configId: string; level: number }[];
  totalSummons: number;
  talents: Record<string, number>;
  stars: number;
  highScore: number;
  mapsCompleted: string[];
  // Achievement tracking
  achievementsUnlocked: string[];
  // Endless mode leaderboard
  endlessLeaderboard: LeaderboardEntry[];
  stats: {
    totalKills: number;
    totalGold: number;
    bossKills: number;
    perfectMaps: number;
    maxWaveReached: number;
    fishCaught: boolean;
  };
}

function defaultSave(): SaveData {
  return {
    inventory: [],
    totalSummons: 0,
    talents: {},
    stars: 0,
    highScore: 0,
    mapsCompleted: [],
    achievementsUnlocked: [],
    endlessLeaderboard: [],
    stats: {
      totalKills: 0,
      totalGold: 0,
      bossKills: 0,
      perfectMaps: 0,
      maxWaveReached: 0,
      fishCaught: false,
    },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw);
    return { ...defaultSave(), ...data };
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // silent fail
  }
}

export function saveDataToInventory(data: SaveData): OwnedCharacter[] {
  let id = 1;
  return data.inventory
    .map(item => {
      const config = ALL_CHARACTERS.find(c => c.id === item.configId);
      if (!config) return null;
      return { instanceId: id++, config, level: item.level } as OwnedCharacter;
    })
    .filter(Boolean) as OwnedCharacter[];
}

export function inventoryToSaveData(inventory: OwnedCharacter[]): { configId: string; level: number }[] {
  return inventory.map(c => ({ configId: c.config.id, level: c.level }));
}
