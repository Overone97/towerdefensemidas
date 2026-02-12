export interface TalentDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  costPerLevel: number;
  effectPerLevel: string;
}

export const TALENTS: TalentDef[] = [
  { id: 'atk_boost', name: 'Power', icon: '⚔️', description: 'All units ATK', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'spd_boost', name: 'Haste', icon: '💨', description: 'All units ATK Speed', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'range_boost', name: 'Sight', icon: '👁️', description: 'All units Range', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'gold_boost', name: 'Fortune', icon: '💰', description: 'Gold earned', maxLevel: 5, costPerLevel: 4, effectPerLevel: '+10%' },
  { id: 'hp_boost', name: 'Fortify', icon: '🛡️', description: 'Base HP', maxLevel: 5, costPerLevel: 2, effectPerLevel: '+2' },
  { id: 'summon_discount', name: 'Charm', icon: '🎲', description: 'Summon cost', maxLevel: 5, costPerLevel: 3, effectPerLevel: '-5%' },
];

export function getTalentBonus(talents: Record<string, number>) {
  return {
    attackMult: 1 + (talents['atk_boost'] || 0) * 0.05,
    speedMult: 1 + (talents['spd_boost'] || 0) * 0.05,
    rangeMult: 1 + (talents['range_boost'] || 0) * 0.05,
    goldMult: 1 + (talents['gold_boost'] || 0) * 0.1,
    extraHp: (talents['hp_boost'] || 0) * 2,
    summonDiscount: 1 - (talents['summon_discount'] || 0) * 0.05,
  };
}
