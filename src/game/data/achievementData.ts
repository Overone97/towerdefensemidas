export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
  reward?: { stars: number };
}

export interface AchievementStats {
  totalKills: number;
  totalGold: number;
  totalSummons: number;
  mapsCompleted: number;
  wavesCompleted: number;
  perfectMaps: number; // maps completed with full HP
  legendaryOwned: number;
  totalUnits: number;
  bossKills: number;
  maxWaveReached: number;
  fishCaught: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Kill milestones
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Kill your first enemy',
    icon: '⚔️',
    condition: (s) => s.totalKills >= 1,
    reward: { stars: 1 },
  },
  {
    id: 'slayer_100',
    name: 'Slayer',
    description: 'Kill 100 enemies',
    icon: '💀',
    condition: (s) => s.totalKills >= 100,
    reward: { stars: 3 },
  },
  {
    id: 'massacre_500',
    name: 'Massacre',
    description: 'Kill 500 enemies',
    icon: '☠️',
    condition: (s) => s.totalKills >= 500,
    reward: { stars: 5 },
  },
  {
    id: 'genocide_2000',
    name: 'Genocide',
    description: 'Kill 2000 enemies',
    icon: '🔥',
    condition: (s) => s.totalKills >= 2000,
    reward: { stars: 10 },
  },
  // Boss kills
  {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    description: 'Kill 5 bosses',
    icon: '👑',
    condition: (s) => s.bossKills >= 5,
    reward: { stars: 5 },
  },
  // Summoning
  {
    id: 'first_summon',
    name: 'Summoner',
    description: 'Summon your first character',
    icon: '✨',
    condition: (s) => s.totalSummons >= 1,
    reward: { stars: 1 },
  },
  {
    id: 'collector_10',
    name: 'Collector',
    description: 'Own 10 characters',
    icon: '📚',
    condition: (s) => s.totalUnits >= 10,
    reward: { stars: 5 },
  },
  {
    id: 'legendary_owner',
    name: 'Legendary!',
    description: 'Own a legendary character',
    icon: '🌟',
    condition: (s) => s.legendaryOwned >= 1,
    reward: { stars: 5 },
  },
  // Map completion
  {
    id: 'first_victory',
    name: 'Victory!',
    description: 'Complete your first map',
    icon: '🏆',
    condition: (s) => s.mapsCompleted >= 1,
    reward: { stars: 2 },
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Complete 3 different maps',
    icon: '🗺️',
    condition: (s) => s.mapsCompleted >= 3,
    reward: { stars: 10 },
  },
  // Perfect
  {
    id: 'flawless',
    name: 'Flawless',
    description: 'Complete a map without losing HP',
    icon: '💎',
    condition: (s) => s.perfectMaps >= 1,
    reward: { stars: 10 },
  },
  // Waves
  {
    id: 'wave_10',
    name: 'Veteran',
    description: 'Reach wave 10',
    icon: '🌊',
    condition: (s) => s.maxWaveReached >= 10,
    reward: { stars: 3 },
  },
  // Easter egg
  {
    id: 'fish_catcher',
    name: 'Gone Fishing',
    description: 'Catch the secret fish',
    icon: '🐟',
    condition: (s) => s.fishCaught,
    reward: { stars: 5 },
  },
  // Gold
  {
    id: 'rich',
    name: 'Rich',
    description: 'Earn 5000 gold total',
    icon: '💰',
    condition: (s) => s.totalGold >= 5000,
    reward: { stars: 5 },
  },
];
