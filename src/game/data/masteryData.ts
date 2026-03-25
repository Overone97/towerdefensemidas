export interface MasteryUnlock {
  atLevel: number;
  championId: string;
}

export interface ChampionMasteryPath {
  rootChampionId: string;
  familyName: string;
  unlocks: MasteryUnlock[];
}

export const MASTERY_PATHS: ChampionMasteryPath[] = [
  {
    rootChampionId: 'garen',
    familyName: 'Demacia Vanguard',
    unlocks: [
      { atLevel: 3, championId: 'jarvan' },
      { atLevel: 6, championId: 'fiora' },
      { atLevel: 9, championId: 'leona' },
      { atLevel: 12, championId: 'xinzhao' },
      { atLevel: 15, championId: 'lucian' },
    ],
  },
  {
    rootChampionId: 'lux',
    familyName: 'Arcane Circle',
    unlocks: [
      { atLevel: 3, championId: 'syndra' },
      { atLevel: 6, championId: 'veigar' },
      { atLevel: 9, championId: 'viktor' },
      { atLevel: 12, championId: 'orianna' },
      { atLevel: 15, championId: 'xerath' },
    ],
  },
  {
    rootChampionId: 'teemo',
    familyName: 'Scout & Reveal',
    unlocks: [
      { atLevel: 3, championId: 'twitch' },
      { atLevel: 6, championId: 'vayne' },
      { atLevel: 9, championId: 'caitlyn' },
      { atLevel: 12, championId: 'ashe' },
      { atLevel: 15, championId: 'quinn' },
    ],
  },
];

export const STARTER_CHAMPIONS = ['garen', 'lux', 'teemo'];

export function masteryXpForNextLevel(level: number): number {
  // level 1->2: 20, then scales
  return Math.floor(20 + level * 10 + level * level * 4);
}
