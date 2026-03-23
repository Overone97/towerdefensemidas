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

export const ASCENSION_UPGRADES: TalentDef[] = [
  { id: 'asc_power', name: 'Relique de Guerre', icon: '🔥', description: 'ATK globale (run)', maxLevel: 10, costPerLevel: 2, effectPerLevel: '+3%' },
  { id: 'asc_haste', name: 'Relique des Vents', icon: '🌪️', description: 'Vitesse d’attaque globale (run)', maxLevel: 10, costPerLevel: 2, effectPerLevel: '+3%' },
  { id: 'asc_fortune', name: 'Relique d’Or', icon: '🪙', description: 'Gold gagné (run)', maxLevel: 10, costPerLevel: 2, effectPerLevel: '+5%' },
  { id: 'asc_guard', name: 'Relique du Bastion', icon: '🏰', description: 'PV de base max (run)', maxLevel: 8, costPerLevel: 3, effectPerLevel: '+1' },
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

export function getAscensionBonus(upgrades: Record<string, number>) {
  return {
    attackMult: 1 + (upgrades['asc_power'] || 0) * 0.03,
    speedMult: 1 + (upgrades['asc_haste'] || 0) * 0.03,
    goldMult: 1 + (upgrades['asc_fortune'] || 0) * 0.05,
    extraHp: (upgrades['asc_guard'] || 0) * 1,
  };
}
