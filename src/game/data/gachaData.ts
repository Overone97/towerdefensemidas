import { Rarity } from '../types';

export const RARITY_RATES: Record<Rarity, number> = {
  common: 0.40,
  uncommon: 0.30,
  rare: 0.18,
  epic: 0.09,
  legendary: 0.03,
};

export const GACHA_BASE_COST = 50;
export const GACHA_COST_INCREMENT = 15;

export function getGachaCost(totalSummons: number): number {
  return GACHA_BASE_COST + totalSummons * GACHA_COST_INCREMENT;
}

export function rollRarity(): Rarity {
  const roll = Math.random();
  let cumulative = 0;
  const entries = Object.entries(RARITY_RATES) as [Rarity, number][];
  for (const [rarity, rate] of entries) {
    cumulative += rate;
    if (roll < cumulative) return rarity;
  }
  return 'common';
}
