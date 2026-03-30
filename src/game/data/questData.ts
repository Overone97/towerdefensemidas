export interface QuestDef {
  id: string;
  mapId: string;
  description: string;
  starsReward: number;
  /** Evaluated at end of map run */
  condition: (ctx: QuestContext) => boolean;
}

export interface QuestContext {
  victory: boolean;
  baseHp: number;
  maxBaseHp: number;
  enemiesKilled: number;
  wavesCompleted: number;
  placedUnitsCount: number;
  goldEarned: number;
  totalWaves: number;
  hpLost: number;
}

export const MAP_QUESTS: QuestDef[] = [
  // Plains
  {
    id: 'plains_perfect',
    mapId: 'plains',
    description: 'Terminer sans perdre de vie',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.hpLost === 0,
  },
  {
    id: 'plains_minimal',
    mapId: 'plains',
    description: 'Gagner avec 4 unités max',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.placedUnitsCount <= 4,
  },
  {
    id: 'plains_rich',
    mapId: 'plains',
    description: 'Finir avec 80+ éclats',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.goldEarned >= 80,
  },

  // Forest
  {
    id: 'forest_perfect',
    mapId: 'forest',
    description: 'Terminer sans perdre de vie',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.hpLost === 0,
  },
  {
    id: 'forest_minimal',
    mapId: 'forest',
    description: 'Gagner avec 5 unités max',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.placedUnitsCount <= 5,
  },
  {
    id: 'forest_fast',
    mapId: 'forest',
    description: 'Ne perdre que 3 vies max',
    starsReward: 1,
    condition: (ctx) => ctx.victory && ctx.hpLost <= 3,
  },

  // Volcano
  {
    id: 'volcano_perfect',
    mapId: 'volcano',
    description: 'Terminer sans perdre de vie',
    starsReward: 2,
    condition: (ctx) => ctx.victory && ctx.hpLost === 0,
  },
  {
    id: 'volcano_minimal',
    mapId: 'volcano',
    description: 'Gagner avec 3 unités max',
    starsReward: 2,
    condition: (ctx) => ctx.victory && ctx.placedUnitsCount <= 3,
  },
  {
    id: 'volcano_rich',
    mapId: 'volcano',
    description: 'Finir avec 140+ éclats',
    starsReward: 2,
    condition: (ctx) => ctx.victory && ctx.goldEarned >= 140,
  },
];

export function getQuestsForMap(mapId: string): QuestDef[] {
  return MAP_QUESTS.filter(q => q.mapId === mapId);
}
