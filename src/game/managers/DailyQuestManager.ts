const DAILY_QUEST_KEY = 'td_daily_quests_v1';

export interface DailyQuest {
  id: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  reward: { stars: number; gold: number };
  completed: boolean;
  claimed: boolean;
}

export interface DailyQuestState {
  date: string; // YYYY-MM-DD
  quests: DailyQuest[];
}

const QUEST_TEMPLATES = [
  { id: 'kill_enemies', desc: 'Tuer {n} ennemis', icon: '💀', targets: [30, 50, 100], reward: { stars: 1, gold: 100 } },
  { id: 'kill_bosses', desc: 'Tuer {n} boss', icon: '👹', targets: [1, 2, 3], reward: { stars: 2, gold: 150 } },
  { id: 'complete_waves', desc: 'Compléter {n} vagues', icon: '🌊', targets: [5, 8, 12], reward: { stars: 1, gold: 80 } },
  { id: 'earn_gold', desc: 'Gagner {n} or', icon: '💰', targets: [200, 500, 1000], reward: { stars: 1, gold: 50 } },
  { id: 'place_units', desc: 'Placer {n} unités', icon: '🏗️', targets: [5, 8, 12], reward: { stars: 1, gold: 60 } },
  { id: 'use_abilities', desc: 'Utiliser {n} abilities', icon: '⚡', targets: [3, 5, 8], reward: { stars: 1, gold: 70 } },
  { id: 'perfect_wave', desc: 'Survivre {n} vagues sans dégât', icon: '🛡️', targets: [1, 2, 3], reward: { stars: 2, gold: 120 } },
  { id: 'win_map', desc: 'Gagner {n} maps', icon: '🗺️', targets: [1, 2], reward: { stars: 2, gold: 200 } },
];

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateDailyQuests(date: string): DailyQuest[] {
  // Use date as seed for consistent quests per day
  const seed = date.split('-').reduce((a, b) => a * 100 + parseInt(b), 0);
  const shuffled = seededShuffle(QUEST_TEMPLATES, seed);
  const picked = shuffled.slice(0, 3);

  return picked.map(tpl => {
    const next = () => { let s = seed + tpl.id.charCodeAt(0); s = (s * 16807) % 2147483647; return s / 2147483647; };
    const targetIdx = Math.floor(next() * tpl.targets.length);
    const target = tpl.targets[targetIdx];
    return {
      id: tpl.id,
      description: tpl.desc.replace('{n}', String(target)),
      icon: tpl.icon,
      target,
      progress: 0,
      reward: tpl.reward,
      completed: false,
      claimed: false,
    };
  });
}

export function loadDailyQuests(): DailyQuestState {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(DAILY_QUEST_KEY);
    if (raw) {
      const state: DailyQuestState = JSON.parse(raw);
      if (state.date === today) return state;
    }
  } catch {}
  // Generate new quests for today
  const state: DailyQuestState = { date: today, quests: generateDailyQuests(today) };
  saveDailyQuests(state);
  return state;
}

export function saveDailyQuests(state: DailyQuestState): void {
  try {
    localStorage.setItem(DAILY_QUEST_KEY, JSON.stringify(state));
  } catch {}
}

export type DailyQuestEvent =
  | { type: 'kill_enemies'; count: number }
  | { type: 'kill_bosses'; count: number }
  | { type: 'complete_waves'; count: number }
  | { type: 'earn_gold'; count: number }
  | { type: 'place_units'; count: number }
  | { type: 'use_abilities'; count: number }
  | { type: 'perfect_wave'; count: number }
  | { type: 'win_map'; count: number };

export function progressDailyQuest(state: DailyQuestState, event: DailyQuestEvent): boolean {
  let anyCompleted = false;
  for (const quest of state.quests) {
    if (quest.completed) continue;
    if (quest.id === event.type) {
      quest.progress = Math.min(quest.target, quest.progress + event.count);
      if (quest.progress >= quest.target) {
        quest.completed = true;
        anyCompleted = true;
      }
    }
  }
  saveDailyQuests(state);
  return anyCompleted;
}
