import { OwnedCharacter } from '../types';
import { ALL_CHARACTERS } from '../data/characterData';

const SAVE_KEY = 'td_save_v1';

export interface SaveData {
  inventory: { configId: string; level: number }[];
  totalSummons: number;
  talents: Record<string, number>;
  stars: number;
  highScore: number;
  mapsCompleted: string[];
}

function defaultSave(): SaveData {
  return {
    inventory: [],
    totalSummons: 0,
    talents: {},
    stars: 0,
    highScore: 0,
    mapsCompleted: [],
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
