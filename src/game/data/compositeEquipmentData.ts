import { EquipmentItem } from './equipmentData';

export interface CompositeRecipe {
  id: string;
  name: string;
  icon: string;
  ingredients: [string, string]; // two base equipment IDs
  result: EquipmentItem;
}

export const COMPOSITE_RECIPES: CompositeRecipe[] = [
  {
    id: 'infinity_edge_recipe', name: 'Infinity Edge', icon: '🗡️',
    ingredients: ['iron_sword', 'flame_blade'],
    result: { id: 'infinity_edge', name: 'Infinity Edge', icon: '🗡️⚡', rarity: 'legendary', slot: 'weapon', attackBonus: 25, attackMult: 1.6, description: '+25 ATK, ×1.6 ATK — Critical strikes' },
  },
  {
    id: 'guinsoo_recipe', name: "Guinsoo's Rageblade", icon: '🔥⚡',
    ingredients: ['flame_blade', 'swift_charm'],
    result: { id: 'guinsoo', name: "Guinsoo's Rageblade", icon: '🔥⚡', rarity: 'epic', slot: 'weapon', attackBonus: 10, attackMult: 1.2, speedMult: 1.25, description: '+10 ATK, ×1.2 ATK, ×1.25 SPD' },
  },
  {
    id: 'warmog_recipe', name: "Warmog's Armor", icon: '❤️🛡️',
    ingredients: ['leather_vest', 'chain_mail'],
    result: { id: 'warmog', name: "Warmog's Armor", icon: '❤️🛡️', rarity: 'epic', slot: 'armor', rangeBonus: 30, rangeMult: 1.2, speedMult: 1.1, description: '+30 Range, ×1.2 Range, ×1.1 SPD' },
  },
  {
    id: 'rabadons_recipe', name: "Rabadon's Deathcap", icon: '🎩✨',
    ingredients: ['void_edge', 'arcane_orb'],
    result: { id: 'rabadons', name: "Rabadon's Deathcap", icon: '🎩✨', rarity: 'legendary', slot: 'weapon', attackBonus: 18, attackMult: 1.7, description: '+18 ATK, ×1.7 ATK — Amplified magic' },
  },
  {
    id: 'phantom_dancer_recipe', name: 'Phantom Dancer', icon: '👻💃',
    ingredients: ['swift_charm', 'simple_ring'],
    result: { id: 'phantom_dancer', name: 'Phantom Dancer', icon: '👻💃', rarity: 'rare', slot: 'accessory', attackSpeedBonus: 0.5, speedMult: 1.3, description: '+0.5 SPD, ×1.3 SPD' },
  },
  {
    id: 'guardian_angel_recipe', name: 'Guardian Angel', icon: '👼',
    ingredients: ['chain_mail', 'simple_ring'],
    result: { id: 'guardian_angel', name: 'Guardian Angel', icon: '👼', rarity: 'rare', slot: 'armor', rangeBonus: 20, rangeMult: 1.15, attackMult: 1.1, description: '+20 Range, ×1.15 Range, ×1.1 ATK' },
  },
  {
    id: 'hextech_gunblade_recipe', name: 'Hextech Gunblade', icon: '🔫💜',
    ingredients: ['flame_blade', 'arcane_orb'],
    result: { id: 'hextech_gunblade', name: 'Hextech Gunblade', icon: '🔫💜', rarity: 'epic', slot: 'weapon', attackBonus: 15, attackMult: 1.3, speedMult: 1.15, description: '+15 ATK, ×1.3 ATK, ×1.15 SPD' },
  },
  {
    id: 'frozen_heart_recipe', name: 'Frozen Heart', icon: '❄️💙',
    ingredients: ['chain_mail', 'dragon_scale'],
    result: { id: 'frozen_heart', name: 'Frozen Heart', icon: '❄️💙', rarity: 'epic', slot: 'armor', rangeBonus: 35, rangeMult: 1.2, speedMult: 1.15, description: '+35 Range, ×1.2 Range, ×1.15 SPD' },
  },
  {
    id: 'nashors_tooth_recipe', name: "Nashor's Tooth", icon: '🦷⚡',
    ingredients: ['arcane_orb', 'swift_charm'],
    result: { id: 'nashors_tooth', name: "Nashor's Tooth", icon: '🦷⚡', rarity: 'epic', slot: 'accessory', attackSpeedBonus: 0.6, speedMult: 1.3, attackMult: 1.15, description: '+0.6 SPD, ×1.3 SPD, ×1.15 ATK' },
  },
  {
    id: 'blade_of_ruined_king_recipe', name: 'Blade of the Ruined King', icon: '👑🗡️',
    ingredients: ['void_edge', 'swift_charm'],
    result: { id: 'blade_of_ruined_king', name: 'Blade of the Ruined King', icon: '👑🗡️', rarity: 'legendary', slot: 'weapon', attackBonus: 15, attackMult: 1.4, speedMult: 1.2, description: '+15 ATK, ×1.4 ATK, ×1.2 SPD' },
  },
  {
    id: 'sunfire_cape_recipe', name: 'Sunfire Cape', icon: '☀️🛡️',
    ingredients: ['leather_vest', 'simple_ring'],
    result: { id: 'sunfire_cape', name: 'Sunfire Cape', icon: '☀️🛡️', rarity: 'uncommon', slot: 'armor', rangeBonus: 15, rangeMult: 1.1, attackMult: 1.05, description: '+15 Range, ×1.1 Range, ×1.05 ATK' },
  },
  {
    id: 'redemption_recipe', name: 'Redemption', icon: '✝️✨',
    ingredients: ['simple_ring', 'leather_vest'],
    result: { id: 'redemption', name: 'Redemption', icon: '✝️✨', rarity: 'uncommon', slot: 'accessory', attackSpeedBonus: 0.2, rangeMult: 1.1, description: '+0.2 SPD, ×1.1 Range' },
  },
  {
    id: 'zhonyas_recipe', name: "Zhonya's Hourglass", icon: '⏳✨',
    ingredients: ['void_edge', 'dragon_scale'],
    result: { id: 'zhonyas', name: "Zhonya's Hourglass", icon: '⏳✨', rarity: 'legendary', slot: 'accessory', attackSpeedBonus: 0.4, speedMult: 1.2, attackMult: 1.3, rangeMult: 1.1, description: '+0.4 SPD, ×1.2 SPD, ×1.3 ATK, ×1.1 Range' },
  },
  {
    id: 'rapid_firecannon_recipe', name: 'Rapid Firecannon', icon: '🏹🔥',
    ingredients: ['iron_sword', 'simple_ring'],
    result: { id: 'rapid_firecannon', name: 'Rapid Firecannon', icon: '🏹🔥', rarity: 'uncommon', slot: 'weapon', attackBonus: 5, attackSpeedBonus: 0.2, rangeMult: 1.1, description: '+5 ATK, +0.2 SPD, ×1.1 Range' },
  },
  {
    id: 'spirit_visage_recipe', name: 'Spirit Visage', icon: '👻🛡️',
    ingredients: ['dragon_scale', 'arcane_orb'],
    result: { id: 'spirit_visage', name: 'Spirit Visage', icon: '👻🛡️', rarity: 'legendary', slot: 'armor', rangeBonus: 40, rangeMult: 1.25, speedMult: 1.2, attackMult: 1.1, description: '+40 Range, ×1.25 Range, ×1.2 SPD, ×1.1 ATK' },
  },
];

export function findAvailableRecipes(equipmentInventory: string[]): { recipe: CompositeRecipe; canCraft: boolean }[] {
  return COMPOSITE_RECIPES.map(recipe => {
    const inv = [...equipmentInventory];
    let canCraft = true;
    for (const ingredient of recipe.ingredients) {
      const idx = inv.indexOf(ingredient);
      if (idx === -1) { canCraft = false; break; }
      inv.splice(idx, 1);
    }
    return { recipe, canCraft };
  });
}
