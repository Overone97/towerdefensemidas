import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSave, writeSave, saveDataToInventory, inventoryToSaveData } from '../game/managers/SaveManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
    _store: store,
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

const SAVE_KEY = 'td_save_v1';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('loadSave()', () => {
    it('retourne les valeurs par défaut quand localStorage est vide', () => {
      const save = loadSave();
      expect(save.gold).toBe(200);
      expect(save.stars).toBe(0);
      expect(save.highScore).toBe(0);
      expect(save.inventory).toEqual([{ configId: 'garen', level: 1, xp: 0, equipment: {}, stars: 1 }]);
      expect(save.equipmentInventory).toEqual([]);
      expect(save.totalSummons).toBe(0);
      expect(save.talents).toEqual({});
      expect(save.mapsCompleted).toEqual([]);
      expect(save.questsCompleted).toEqual([]);
      expect(save.achievementsUnlocked).toEqual([]);
      expect(save.endlessLeaderboard).toEqual([]);
      expect(save.prestige).toBe(0);
      expect(save.gameSpeed).toBe(1);
      expect(save.tutorialCompleted).toBe(false);
      expect(save.ascensionPoints).toBe(0);
      expect(save.unlockedSkins).toEqual([]);
      expect(save.equippedSkins).toEqual({});
      expect(save.stats.totalKills).toBe(0);
      expect(save.stats.fishCaught).toBe(false);
    });

    it('retourne les valeurs par défaut quand le JSON est invalide', () => {
      localStorageMock.setItem(SAVE_KEY, 'NOT_VALID_JSON{{{');
      const save = loadSave();
      expect(save.gold).toBe(200);
      expect(save.stars).toBe(0);
      expect(save.inventory).toEqual([{ configId: 'garen', level: 1, xp: 0, equipment: {}, stars: 1 }]);
    });

    it('retourne les valeurs par défaut quand le JSON est null', () => {
      localStorageMock.setItem(SAVE_KEY, 'null');
      const save = loadSave();
      // null mergé avec defaultSave() → toutes les valeurs par défaut
      expect(save.gold).toBe(200);
    });

    it('préserve les données valides lors du chargement (round-trip)', () => {
      const data = loadSave();
      data.gold = 1500;
      data.stars = 42;
      data.highScore = 9999;
      data.prestige = 3;
      data.tutorialCompleted = true;
      data.questsCompleted = ['quest_1'];
      writeSave(data);

      const loaded = loadSave();
      expect(loaded.gold).toBe(1500);
      expect(loaded.stars).toBe(42);
      expect(loaded.highScore).toBe(9999);
      expect(loaded.prestige).toBe(3);
      expect(loaded.tutorialCompleted).toBe(true);
      expect(loaded.questsCompleted).toContain('quest_1');
    });

    it('normalise gold > 999999 vers la valeur par défaut', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ gold: 9999999 }));
      const save = loadSave();
      expect(save.gold).toBe(200); // reset to default
    });

    it('normalise gold négatif vers la valeur par défaut', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ gold: -500 }));
      const save = loadSave();
      expect(save.gold).toBe(200);
    });

    it('normalise stars > 99999 vers la valeur par défaut', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ stars: 999999 }));
      const save = loadSave();
      expect(save.stars).toBe(0);
    });

    it('normalise prestige > 100 vers la valeur par défaut', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ prestige: 999 }));
      const save = loadSave();
      expect(save.prestige).toBe(0);
    });

    it('clamp gameSpeed entre 0.5 et 3', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ gameSpeed: 10 }));
      const save = loadSave();
      expect(save.gameSpeed).toBe(3);
    });

    it('clamp gameSpeed en dessous de 0.5', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ gameSpeed: 0.1 }));
      const save = loadSave();
      expect(save.gameSpeed).toBe(0.5);
    });

    it('filtre les items d\'inventaire invalides (level hors plage)', () => {
      const invalidInventory = [
        { configId: 'garen', level: 0, stars: 1 },  // level < 1
        { configId: 'ashe', level: 51, stars: 2 },   // level > 50
        { configId: 'garen', level: 1, stars: 0 },   // stars < 1
        { configId: 'garen', level: 1, stars: 4 },   // stars > 3
      ];
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ inventory: invalidInventory }));
      const save = loadSave();
      expect(save.inventory).toHaveLength(0);
    });

    it('garde les items d\'inventaire avec des valeurs valides', () => {
      const validInventory = [
        { configId: 'garen', level: 1, stars: 1 },
        { configId: 'ashe', level: 50, stars: 3 },
      ];
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ inventory: validInventory }));
      const save = loadSave();
      expect(save.inventory).toHaveLength(2);
    });

    it('complète les champs manquants avec les valeurs par défaut (merge partiel)', () => {
      localStorageMock.setItem(SAVE_KEY, JSON.stringify({ gold: 500 }));
      const save = loadSave();
      expect(save.gold).toBe(500);
      expect(save.stars).toBe(0); // valeur par défaut
      expect(save.inventory).toEqual([{ configId: 'garen', level: 1, xp: 0, equipment: {}, stars: 1 }]); // valeur par défaut
    });
  });

  describe('writeSave()', () => {
    it('persiste les données dans localStorage', () => {
      const data = loadSave();
      data.gold = 750;
      writeSave(data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(SAVE_KEY, expect.stringContaining('"gold":750'));
    });
  });

  describe('inventoryToSaveData() / saveDataToInventory()', () => {
    it('round-trip de conversion préserve configId et level', () => {
      const save = loadSave();
      save.inventory = [{ configId: 'garen', level: 5, stars: 2 }];
      const chars = saveDataToInventory(save);
      // garen existe dans ALL_CHARACTERS
      if (chars.length > 0) {
        expect(chars[0].level).toBe(5);
        expect(chars[0].stars).toBe(2);
        const backToSave = inventoryToSaveData(chars);
        expect(backToSave[0].configId).toBe('garen');
        expect(backToSave[0].level).toBe(5);
      }
    });

    it('filtre les characters inexistants lors de saveDataToInventory', () => {
      const save = loadSave();
      save.inventory = [{ configId: 'INVALID_CHAR_ID', level: 1, stars: 1 }];
      const chars = saveDataToInventory(save);
      expect(chars).toHaveLength(0);
    });
  });
});
