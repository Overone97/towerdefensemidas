import { OwnedCharacter, EquippedItems } from '../types';
import { ALL_CHARACTERS } from '../data/characterData';
import { ALL_MAPS } from '../data/allMaps';
import { getStarterChampionIds } from '../data/unlockTreeData';

const SAVE_KEY = 'td_save_v1';

export interface LeaderboardEntry {
  score: number;
  wave: number;
  date: string;
}

export interface SaveData {
  inventory: { configId: string; level: number; xp?: number; equipment?: EquippedItems; stars?: number }[];
  equipmentInventory: string[];
  totalSummons: number;
  unlockedCharacters: string[];
  unlockShards: number;
  exclusiveTokens: number;
  talents: Record<string, number>;
  stars: number;
  gold: number;
  highScore: number;
  mapsCompleted: string[];
  questsCompleted: string[];
  achievementsUnlocked: string[];
  endlessLeaderboard: LeaderboardEntry[];
  mapDeployments: Record<string, { slotIndex: number; instanceId: number }[]>;
  gameSpeed: number;
  prestige: number;
  tutorialCompleted: boolean;
  ascensionPoints: number;
  ascensionUpgrades: Record<string, number>;
  /** dungeon completions: dungeonId → ISO date string of last completion */
  dungeonCompletions: Record<string, string>;
  /** Unlocked skin ids */
  unlockedSkins: string[];
  /** Champion id → equipped skin id */
  equippedSkins: Record<string, string>;
  stats: {
    totalKills: number;
    totalGold: number;
    bossKills: number;
    perfectMaps: number;
    maxWaveReached: number;
    fishCaught: boolean;
    dungeonsCompleted: number;
  };
}

function defaultSave(): SaveData {
  return {
    inventory: [{ configId: 'garen', level: 1, xp: 0, equipment: {}, stars: 1 }],
    equipmentInventory: [],
    totalSummons: 0,
    unlockedCharacters: getStarterChampionIds(),
    unlockShards: 0,
    exclusiveTokens: 0,
    talents: {},
    stars: 0,
    gold: 200,
    highScore: 0,
    mapsCompleted: [],
    questsCompleted: [],
    achievementsUnlocked: [],
    endlessLeaderboard: [],
    mapDeployments: {},
    gameSpeed: 1,
    prestige: 0,
    tutorialCompleted: false,
    ascensionPoints: 0,
    ascensionUpgrades: {},
    dungeonCompletions: {},
    unlockedSkins: [],
    equippedSkins: {},
    stats: {
      totalKills: 0,
      totalGold: 0,
      bossKills: 0,
      perfectMaps: 0,
      maxWaveReached: 0,
      fishCaught: false,
      dungeonsCompleted: 0,
    },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw);
    const merged = { ...defaultSave(), ...data };
    // Validate mapsCompleted against existing maps
    const validMapIds = ALL_MAPS.map(m => m.id);
    if (merged.mapsCompleted) {
      merged.mapsCompleted = merged.mapsCompleted.filter((id: string) => validMapIds.includes(id));
    }
    // Validation des plages numériques pour prévenir la triche localStorage
    const def = defaultSave();
    merged.gold = typeof merged.gold === 'number' && merged.gold >= 0 && merged.gold <= 999999
      ? merged.gold : def.gold;
    merged.stars = typeof merged.stars === 'number' && merged.stars >= 0 && merged.stars <= 99999
      ? merged.stars : def.stars;
    merged.unlockShards = typeof merged.unlockShards === 'number' && merged.unlockShards >= 0 && merged.unlockShards <= 999999
      ? merged.unlockShards : def.unlockShards;
    merged.exclusiveTokens = typeof merged.exclusiveTokens === 'number' && merged.exclusiveTokens >= 0 && merged.exclusiveTokens <= 999999
      ? merged.exclusiveTokens : def.exclusiveTokens;
    if (!Array.isArray(merged.unlockedCharacters)) {
      merged.unlockedCharacters = def.unlockedCharacters;
    } else {
      merged.unlockedCharacters = Array.from(new Set([...def.unlockedCharacters, ...merged.unlockedCharacters.filter((id: unknown) => typeof id === 'string')]));
    }
    merged.highScore = typeof merged.highScore === 'number' && merged.highScore >= 0
      ? merged.highScore : def.highScore;
    merged.prestige = typeof merged.prestige === 'number' && merged.prestige >= 0 && merged.prestige <= 100
      ? merged.prestige : def.prestige;
    if (typeof merged.gameSpeed === 'number') {
      merged.gameSpeed = Math.min(Math.max(merged.gameSpeed, 0.5), 3);
    } else {
      merged.gameSpeed = def.gameSpeed;
    }
    // Filtrer les items d'inventaire invalides
    if (Array.isArray(merged.inventory)) {
      merged.inventory = merged.inventory.filter((item: unknown) =>
        item && typeof item.configId === 'string' &&
        typeof item.level === 'number' && item.level >= 1 && item.level <= 50 &&
        typeof item.stars === 'number' && item.stars >= 1 && item.stars <= 3
      );
    }
    return merged;
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
      return { instanceId: id++, config, level: item.level, xp: item.xp || 0, equipment: item.equipment || {}, stars: item.stars || 1 } as OwnedCharacter;
    })
    .filter(Boolean) as OwnedCharacter[];
}

export function inventoryToSaveData(inventory: OwnedCharacter[]): { configId: string; level: number; xp?: number; equipment?: EquippedItems; stars?: number }[] {
  return inventory.map(c => ({ configId: c.config.id, level: c.level, xp: c.xp || 0, equipment: c.equipment, stars: c.stars }));
}
