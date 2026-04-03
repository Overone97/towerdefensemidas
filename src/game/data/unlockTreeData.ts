import { CharacterConfig, Rarity } from '../types';
import { ALL_CHARACTERS } from './characterData';

export interface CharacterUnlockNode {
  championId: string;
  order: number;
  shardCost: number;
  requiredStars: number;
  requiredMapsCompleted: number;
}

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 4,
  legendary: 7,
};

const STARTER_ORDER = ['garen', 'ashe', 'leona', 'teemo', 'lux'];
const CURATED_EARLY_ORDER = ['garen', 'ashe', 'leona', 'teemo', 'lux', 'nidalee', 'caitlyn', 'leesin'];

function compareCharacters(a: CharacterConfig, b: CharacterConfig): number {
  const aCurated = CURATED_EARLY_ORDER.indexOf(a.id);
  const bCurated = CURATED_EARLY_ORDER.indexOf(b.id);
  if (aCurated !== -1 || bCurated !== -1) {
    if (aCurated === -1) return 1;
    if (bCurated === -1) return -1;
    return aCurated - bCurated;
  }

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

function buildUnlockTree(): CharacterUnlockNode[] {
  return ORDERED_CHARACTERS.map((character, index) => {
    const rarityWeight = RARITY_WEIGHT[character.rarity];
    const shardCost = index === 0
      ? 0
      : Math.round(20 + index * 8 + rarityWeight * 14 + Math.max(0, index - 8) * 3.5);

    const requiredStars = index <= 2
      ? 0
      : Math.max(0, Math.floor(index / 5) + rarityWeight * 2);

    const requiredMapsCompleted = index <= 4
      ? 0
      : Math.max(0, Math.floor(index / 9));

    return {
      championId: character.id,
      order: index,
      shardCost,
      requiredStars,
      requiredMapsCompleted,
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
