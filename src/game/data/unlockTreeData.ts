import { CharacterConfig, Rarity } from '../types';
import { ALL_CHARACTERS } from './characterData';

export interface CharacterUnlockNode {
  championId: string;
  order: number;
  shardCost: number;
  requiredStars: number;
  requiredMapsCompleted: number;
  requiredAchievements: number;
  requiredQuests: number;
}

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 4,
  legendary: 7,
};

const STARTER_ORDER = ['garen', 'ashe', 'leona', 'teemo', 'lux'];

function compareCharacters(a: CharacterConfig, b: CharacterConfig): number {
  const aStarter = STARTER_ORDER.indexOf(a.id);
  const bStarter = STARTER_ORDER.indexOf(b.id);
  if (aStarter !== -1 || bStarter !== -1) {
    if (aStarter === -1) return 1;
    if (bStarter === -1) return -1;
    return aStarter - bStarter;
  }

  const rarityDiff = RARITY_WEIGHT[a.rarity] - RARITY_WEIGHT[b.rarity];
  if (rarityDiff !== 0) return rarityDiff;
  return a.name.localeCompare(b.name);
}

const ORDERED_CHARACTERS = [...ALL_CHARACTERS]
  .filter(c => c.id !== 'fizz')
  .sort(compareCharacters);

function getShardCost(index: number, rarityWeight: number): number {
  if (index < 5) return 0;
  if (index < 10) return 18 + (index - 5) * 5 + rarityWeight * 4;
  if (index < 20) return 45 + (index - 10) * 8 + rarityWeight * 7;
  if (index < 35) return 130 + (index - 20) * 11 + rarityWeight * 10;
  if (index < 55) return 310 + (index - 35) * 15 + rarityWeight * 14;
  return 670 + (index - 55) * 22 + rarityWeight * 18;
}

function getRequiredStars(index: number, rarityWeight: number): number {
  if (index < 8) return 0;
  if (index < 16) return Math.max(1, Math.floor((index - 8) / 4));
  if (index < 30) return 2 + Math.floor((index - 16) / 4) + Math.floor(rarityWeight / 2);
  if (index < 50) return 6 + Math.floor((index - 30) / 3) + rarityWeight;
  return 14 + Math.floor((index - 50) / 2) + rarityWeight;
}

function getRequiredMapsCompleted(index: number): number {
  if (index < 12) return 0;
  if (index < 24) return 1;
  if (index < 40) return 2;
  if (index < 60) return 3;
  return 4;
}

function getRequiredAchievements(index: number): number {
  if (index < 14) return 0;
  if (index < 24) return 1;
  if (index < 36) return 2;
  if (index < 52) return 3;
  if (index < 70) return 4;
  return 5;
}

function getRequiredQuests(index: number): number {
  if (index < 18) return 0;
  if (index < 30) return 1;
  if (index < 44) return 2;
  if (index < 60) return 3;
  return 4;
}

function buildUnlockTree(): CharacterUnlockNode[] {
  return ORDERED_CHARACTERS.map((character, index) => {
    const rarityWeight = RARITY_WEIGHT[character.rarity];

    return {
      championId: character.id,
      order: index,
      shardCost: getShardCost(index, rarityWeight),
      requiredStars: getRequiredStars(index, rarityWeight),
      requiredMapsCompleted: getRequiredMapsCompleted(index),
      requiredAchievements: getRequiredAchievements(index),
      requiredQuests: getRequiredQuests(index),
    };
  });
}

export const CHARACTER_UNLOCK_TREE = buildUnlockTree();

export function getUnlockNode(championId: string): CharacterUnlockNode | undefined {
  return CHARACTER_UNLOCK_TREE.find(node => node.championId === championId);
}

export function getStarterChampionIds(): string[] {
  return CHARACTER_UNLOCK_TREE.filter(node => node.shardCost === 0).map(node => node.championId);
}
