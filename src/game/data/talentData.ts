export interface TalentDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  costPerLevel: number;
  effectPerLevel: string;
}

export interface AscensionNodeDef extends TalentDef {
  branch: 'attack' | 'defense' | 'economy';
  tier: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  prerequisites?: string[];
  requiredSpent?: number;
  rare?: boolean;
  ultimate?: boolean;
}

export const TALENTS: TalentDef[] = [
  { id: 'atk_boost', name: 'Power', icon: '⚔️', description: 'All units ATK', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'spd_boost', name: 'Haste', icon: '💨', description: 'All units ATK Speed', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'range_boost', name: 'Sight', icon: '👁️', description: 'All units Range', maxLevel: 5, costPerLevel: 3, effectPerLevel: '+5%' },
  { id: 'gold_boost', name: 'Fortune', icon: '💰', description: 'Gold earned', maxLevel: 5, costPerLevel: 4, effectPerLevel: '+10%' },
  { id: 'hp_boost', name: 'Fortify', icon: '🛡️', description: 'Base HP', maxLevel: 5, costPerLevel: 2, effectPerLevel: '+2' },
  { id: 'summon_discount', name: 'Charm', icon: '🎲', description: 'Summon cost', maxLevel: 5, costPerLevel: 3, effectPerLevel: '-5%' },
];

export const ASCENSION_UPGRADES: AscensionNodeDef[] = [
  // Attack (red)
  { id: 'asc_atk_damage', name: 'Puissance brute', icon: '🗡️', description: '+ dégâts tours', maxLevel: 10, costPerLevel: 1, effectPerLevel: '+4%', branch: 'attack', tier: 1, x: 120, y: 420 },
  { id: 'asc_atk_speed', name: 'Cadence de tir', icon: '🔥', description: '+ vitesse attaque', maxLevel: 10, costPerLevel: 1, effectPerLevel: '+3%', branch: 'attack', tier: 1, x: 220, y: 420 },
  { id: 'asc_atk_crit', name: 'Frappe critique', icon: '💥', description: 'chance critique', maxLevel: 6, costPerLevel: 2, effectPerLevel: '+3%', branch: 'attack', tier: 2, x: 170, y: 315, prerequisites: ['asc_atk_damage', 'asc_atk_speed'], requiredSpent: 8, rare: true },
  { id: 'asc_atk_chain', name: 'Arc en chaîne', icon: '⚡', description: 'attaques en chaîne', maxLevel: 4, costPerLevel: 3, effectPerLevel: '+4%', branch: 'attack', tier: 3, x: 170, y: 215, prerequisites: ['asc_atk_crit'], requiredSpent: 16, rare: true },
  { id: 'asc_atk_ultimate', name: 'Annihilation', icon: '☄️', description: 'ultime attaque massive', maxLevel: 1, costPerLevel: 8, effectPerLevel: 'UNIQUE', branch: 'attack', tier: 4, x: 170, y: 110, prerequisites: ['asc_atk_chain'], requiredSpent: 28, ultimate: true },

  // Defense (blue)
  { id: 'asc_def_hp', name: 'Bastion', icon: '🛡️', description: '+ HP base', maxLevel: 10, costPerLevel: 1, effectPerLevel: '+1', branch: 'defense', tier: 1, x: 470, y: 420 },
  { id: 'asc_def_reduce', name: 'Armure runique', icon: '🧱', description: 'réduction dégâts base', maxLevel: 8, costPerLevel: 1, effectPerLevel: '+2%', branch: 'defense', tier: 1, x: 570, y: 420 },
  { id: 'asc_def_shield', name: 'Regen bouclier', icon: '🔵', description: 'bouclier périodique', maxLevel: 5, costPerLevel: 2, effectPerLevel: '+0.5', branch: 'defense', tier: 2, x: 520, y: 315, prerequisites: ['asc_def_hp'], requiredSpent: 8 },
  { id: 'asc_def_reflect', name: 'Renvoi', icon: '🪞', description: 'renvoi de dégâts', maxLevel: 4, costPerLevel: 3, effectPerLevel: '+4%', branch: 'defense', tier: 3, x: 520, y: 215, prerequisites: ['asc_def_reduce'], requiredSpent: 16, rare: true },
  { id: 'asc_def_ultimate', name: 'Dernier rempart', icon: '🏰', description: 'auto-bouclier <20% HP', maxLevel: 1, costPerLevel: 8, effectPerLevel: 'UNIQUE', branch: 'defense', tier: 4, x: 520, y: 110, prerequisites: ['asc_def_shield', 'asc_def_reflect'], requiredSpent: 28, ultimate: true },

  // Economy (gold)
  { id: 'asc_eco_kill', name: 'Prime de kill', icon: '💰', description: '+ gold par kill', maxLevel: 10, costPerLevel: 1, effectPerLevel: '+4%', branch: 'economy', tier: 1, x: 820, y: 420 },
  { id: 'asc_eco_wave', name: 'Rente de vague', icon: '📦', description: 'revenu passif', maxLevel: 8, costPerLevel: 1, effectPerLevel: '+10', branch: 'economy', tier: 1, x: 920, y: 420 },
  { id: 'asc_eco_discount', name: 'Négociateur', icon: '🏷️', description: '- coût invocations', maxLevel: 5, costPerLevel: 2, effectPerLevel: '-3%', branch: 'economy', tier: 2, x: 870, y: 315, prerequisites: ['asc_eco_kill'], requiredSpent: 8 },
  { id: 'asc_eco_interest', name: 'Intérêts', icon: '🏦', description: 'intérêt sur réserve', maxLevel: 4, costPerLevel: 3, effectPerLevel: '+1%', branch: 'economy', tier: 3, x: 870, y: 215, prerequisites: ['asc_eco_wave'], requiredSpent: 16, rare: true },
  { id: 'asc_eco_ultimate', name: 'Monopole', icon: '👑', description: 'revente 100% + bonus or', maxLevel: 1, costPerLevel: 8, effectPerLevel: 'UNIQUE', branch: 'economy', tier: 4, x: 870, y: 110, prerequisites: ['asc_eco_discount', 'asc_eco_interest'], requiredSpent: 28, ultimate: true },
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

export function getAscensionUpgradeCost(id: string, currentLevel: number): number {
  const node = ASCENSION_UPGRADES.find(t => t.id === id);
  if (!node) return 999;
  return Math.ceil(node.costPerLevel * (1 + currentLevel * 0.45));
}

export function getAscensionSpent(upgrades: Record<string, number>): number {
  let total = 0;
  for (const node of ASCENSION_UPGRADES) {
    const lv = upgrades[node.id] || 0;
    for (let i = 0; i < lv; i++) total += getAscensionUpgradeCost(node.id, i);
  }
  return total;
}

export function getAscensionBonus(upgrades: Record<string, number>) {
  const lv = (id: string) => upgrades[id] || 0;
  return {
    attackMult: 1 + lv('asc_atk_damage') * 0.04 + lv('asc_atk_ultimate') * 0.20,
    speedMult: 1 + lv('asc_atk_speed') * 0.03,
    goldMult: 1 + lv('asc_eco_kill') * 0.04 + lv('asc_eco_ultimate') * 0.20,
    extraHp: lv('asc_def_hp') * 1,
    critChance: lv('asc_atk_crit') * 0.03,
    chainChance: lv('asc_atk_chain') * 0.04,
    damageReduction: lv('asc_def_reduce') * 0.02,
    shieldRegen: lv('asc_def_shield') * 0.5,
    reflectRatio: lv('asc_def_reflect') * 0.04,
    lowHpShield: lv('asc_def_ultimate') > 0,
    waveIncome: lv('asc_eco_wave') * 10,
    summonDiscount: lv('asc_eco_discount') * 0.03,
    interestRate: lv('asc_eco_interest') * 0.01,
    fullSell: lv('asc_eco_ultimate') > 0,
  };
}
