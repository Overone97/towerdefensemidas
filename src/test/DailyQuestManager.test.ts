import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadDailyQuests,
  saveDailyQuests,
  progressDailyQuest,
  DailyQuestState,
  DailyQuestEvent,
} from '../game/managers/DailyQuestManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

const DAILY_QUEST_KEY = 'td_daily_quests_v1';

// Helper pour mocker la date
function mockDate(dateStr: string) {
  const fixed = new Date(dateStr);
  vi.setSystemTime(fixed);
}

describe('DailyQuestManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loadDailyQuests() — déterminisme', () => {
    it('génère exactement 3 quêtes pour une date donnée', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      expect(state.quests).toHaveLength(3);
    });

    it('les quêtes sont déterministes — même résultat si appelé deux fois le même jour', () => {
      mockDate('2025-06-15');
      const state1 = loadDailyQuests();
      localStorageMock.clear();
      const state2 = loadDailyQuests();

      expect(state1.quests.map(q => q.id)).toEqual(state2.quests.map(q => q.id));
      expect(state1.quests.map(q => q.target)).toEqual(state2.quests.map(q => q.target));
      expect(state1.quests.map(q => q.description)).toEqual(state2.quests.map(q => q.description));
    });

    it('les quêtes sont différentes pour des dates différentes', () => {
      mockDate('2025-06-15');
      localStorageMock.clear();
      const state1 = loadDailyQuests();

      mockDate('2025-06-16');
      localStorageMock.clear();
      const state2 = loadDailyQuests();

      // Les quêtes doivent différer (id ou target) — très probable avec un seed différent
      const ids1 = state1.quests.map(q => q.id).join(',');
      const ids2 = state2.quests.map(q => q.id).join(',');
      const targets1 = state1.quests.map(q => q.target).join(',');
      const targets2 = state2.quests.map(q => q.target).join(',');
      // Au moins une différence attendue
      expect(ids1 !== ids2 || targets1 !== targets2).toBe(true);
    });

    it('la date du state correspond à aujourd\'hui', () => {
      mockDate('2025-08-20');
      const state = loadDailyQuests();
      expect(state.date).toBe('2025-08-20');
    });

    it('recharge les quêtes sauvegardées si même date', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      // Modifier le progrès et sauvegarder
      state.quests[0].progress = 5;
      saveDailyQuests(state);

      const reloaded = loadDailyQuests();
      expect(reloaded.quests[0].progress).toBe(5);
    });

    it('régénère de nouvelles quêtes si la date sauvegardée est différente', () => {
      mockDate('2025-06-14');
      const oldState = loadDailyQuests();
      oldState.quests[0].progress = 99;
      saveDailyQuests(oldState);

      // Le lendemain
      mockDate('2025-06-15');
      const newState = loadDailyQuests();
      expect(newState.date).toBe('2025-06-15');
      expect(newState.quests[0].progress).toBe(0); // reset
    });

    it('toutes les quêtes démarrent avec progress=0 et completed=false', () => {
      mockDate('2025-07-01');
      const state = loadDailyQuests();
      for (const quest of state.quests) {
        expect(quest.progress).toBe(0);
        expect(quest.completed).toBe(false);
        expect(quest.claimed).toBe(false);
      }
    });

    it('chaque quête a un target > 0', () => {
      mockDate('2025-07-01');
      const state = loadDailyQuests();
      for (const quest of state.quests) {
        expect(quest.target).toBeGreaterThan(0);
      }
    });
  });

  describe('progressDailyQuest()', () => {
    it('incrémente le progrès correctement', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();

      // Trouver une quête et l'événement correspondant
      const quest = state.quests[0];
      const event: DailyQuestEvent = { type: quest.id as DailyQuestEvent['type'], count: 5 };

      const initialProgress = quest.progress;
      progressDailyQuest(state, event);
      expect(quest.progress).toBe(initialProgress + 5);
    });

    it('le progrès ne dépasse pas la target', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      const quest = state.quests[0];
      quest.progress = quest.target - 1;

      const event: DailyQuestEvent = { type: quest.id as DailyQuestEvent['type'], count: 100 };
      progressDailyQuest(state, event);
      expect(quest.progress).toBe(quest.target);
    });

    it('marque la quête comme completed quand la target est atteinte', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      const quest = state.quests[0];
      quest.progress = quest.target - 1;

      const event: DailyQuestEvent = { type: quest.id as DailyQuestEvent['type'], count: 1 };
      const result = progressDailyQuest(state, event);
      expect(quest.completed).toBe(true);
      expect(result).toBe(true);
    });

    it('retourne false si aucune quête n\'est complétée', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      const quest = state.quests[0];
      quest.progress = 0;

      const event: DailyQuestEvent = { type: quest.id as DailyQuestEvent['type'], count: 1 };
      // N'atteint la target que si target === 1
      if (quest.target > 1) {
        const result = progressDailyQuest(state, event);
        expect(result).toBe(false);
      }
    });

    it('n\'incrémente pas le progrès d\'une quête déjà complétée', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      const quest = state.quests[0];
      quest.completed = true;
      quest.progress = quest.target;

      const event: DailyQuestEvent = { type: quest.id as DailyQuestEvent['type'], count: 10 };
      progressDailyQuest(state, event);
      expect(quest.progress).toBe(quest.target); // inchangé
    });

    it('ignore les événements pour une quête non présente dans le state', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      const initialProgresses = state.quests.map(q => q.progress);

      // Événement pour un type non présent dans les 3 quêtes du jour (très probable)
      const allIds = state.quests.map(q => q.id);
      const unusedTypes = ['kill_enemies', 'kill_bosses', 'complete_waves', 'earn_gold', 'place_units', 'use_abilities', 'perfect_wave', 'win_map']
        .filter(t => !allIds.includes(t));

      if (unusedTypes.length > 0) {
        const event: DailyQuestEvent = { type: unusedTypes[0] as DailyQuestEvent['type'], count: 50 };
        progressDailyQuest(state, event);
        const finalProgresses = state.quests.map(q => q.progress);
        expect(finalProgresses).toEqual(initialProgresses);
      }
    });

    it('sauvegarde le state dans localStorage après progression', () => {
      mockDate('2025-06-15');
      const state = loadDailyQuests();
      vi.clearAllMocks();

      const event: DailyQuestEvent = { type: state.quests[0].id as DailyQuestEvent['type'], count: 1 };
      progressDailyQuest(state, event);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(DAILY_QUEST_KEY, expect.any(String));
    });
  });

  describe('saveDailyQuests()', () => {
    it('persiste le state dans localStorage', () => {
      mockDate('2025-06-15');
      const state: DailyQuestState = {
        date: '2025-06-15',
        quests: [],
      };
      saveDailyQuests(state);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        DAILY_QUEST_KEY,
        JSON.stringify(state)
      );
    });
  });
});
