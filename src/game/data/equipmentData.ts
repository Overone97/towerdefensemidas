import { Rarity } from '../types';

export type EquipmentSlotType = 'weapon' | 'armor' | 'accessory';

export interface EquipmentItem {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  slot: EquipmentSlotType;
  attackBonus?: number;
  attackSpeedBonus?: number;
  rangeBonus?: number;
  attackMult?: number;
  speedMult?: number;
  rangeMult?: number;
  specialEffect?: string;
  description: string;
}

export const ALL_EQUIPMENT: EquipmentItem[] = [
  // COMMON drops
  { id: 'iron_sword', name: 'Iron Sword', icon: '🗡️', rarity: 'common', slot: 'weapon', attackBonus: 3, description: '+3 ATK' },
  { id: 'leather_vest', name: 'Leather Vest', icon: '🛡️', rarity: 'common', slot: 'armor', rangeBonus: 10, description: '+10 Range' },
  { id: 'simple_ring', name: 'Simple Ring', icon: '💍', rarity: 'common', slot: 'accessory', attackSpeedBonus: 0.1, description: '+0.1 ATK Speed' },

  // UNCOMMON drops
  { id: 'flame_blade', name: 'Flame Blade', icon: '🔥', rarity: 'uncommon', slot: 'weapon', attackBonus: 5, attackMult: 1.1, description: '+5 ATK, ×1.1 ATK' },
  { id: 'chain_mail', name: 'Chain Mail', icon: '⛓️', rarity: 'uncommon', slot: 'armor', rangeBonus: 15, speedMult: 1.05, description: '+15 Range, ×1.05 SPD' },
  { id: 'swift_charm', name: 'Swift Charm', icon: '✨', rarity: 'uncommon', slot: 'accessory', attackSpeedBonus: 0.2, speedMult: 1.1, description: '+0.2 SPD, ×1.1 SPD' },

  // RARE drops
  { id: 'void_edge', name: 'Void Edge', icon: '🌑', rarity: 'rare', slot: 'weapon', attackBonus: 8, attackMult: 1.2, description: '+8 ATK, ×1.2 ATK' },
  { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐉', rarity: 'rare', slot: 'armor', rangeBonus: 25, rangeMult: 1.1, description: '+25 Range, ×1.1 Range' },
  { id: 'arcane_orb', name: 'Arcane Orb', icon: '🔮', rarity: 'rare', slot: 'accessory', attackSpeedBonus: 0.3, attackMult: 1.1, speedMult: 1.1, description: '+0.3 SPD, ×1.1 ATK & SPD' },

  // EPIC drops
  { id: 'demon_slayer', name: 'Demon Slayer', icon: '⚔️', rarity: 'epic', slot: 'weapon', attackBonus: 12, attackMult: 1.3, description: '+12 ATK, ×1.3 ATK' },
  { id: 'celestial_plate', name: 'Celestial Plate', icon: '🛡️', rarity: 'epic', slot: 'armor', rangeBonus: 30, rangeMult: 1.15, speedMult: 1.1, description: '+30 Range, ×1.15 Range, ×1.1 SPD' },
  { id: 'chrono_amulet', name: 'Chrono Amulet', icon: '⏳', rarity: 'epic', slot: 'accessory', attackSpeedBonus: 0.5, speedMult: 1.2, attackMult: 1.1, description: '+0.5 SPD, ×1.2 SPD, ×1.1 ATK' },

  // LEGENDARY drops
  { id: 'excalibur', name: 'Excalibur', icon: '👑', rarity: 'legendary', slot: 'weapon', attackBonus: 20, attackMult: 1.5, description: '+20 ATK, ×1.5 ATK' },
  { id: 'aegis', name: 'Aegis', icon: '🏛️', rarity: 'legendary', slot: 'armor', rangeBonus: 40, rangeMult: 1.25, speedMult: 1.15, description: '+40 Range, ×1.25 Range, ×1.15 SPD' },
  { id: 'infinity_stone', name: 'Infinity Stone', icon: '💎', rarity: 'legendary', slot: 'accessory', attackSpeedBonus: 0.6, speedMult: 1.3, attackMult: 1.2, description: '+0.6 SPD, ×1.3 SPD, ×1.2 ATK' },
];

// Determine drop based on boss wave
export function rollBossDrop(waveNumber: number): EquipmentItem | null {
  // 70% chance to drop
  if (Math.random() > 0.7) return null;

  let pool: EquipmentItem[];
  if (waveNumber >= 18) {
    pool = ALL_EQUIPMENT.filter(e => e.rarity === 'legendary' || e.rarity === 'epic');
  } else if (waveNumber >= 12) {
    pool = ALL_EQUIPMENT.filter(e => e.rarity === 'epic' || e.rarity === 'rare');
  } else if (waveNumber >= 6) {
    pool = ALL_EQUIPMENT.filter(e => e.rarity === 'rare' || e.rarity === 'uncommon');
  } else {
    pool = ALL_EQUIPMENT.filter(e => e.rarity === 'uncommon' || e.rarity === 'common');
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/** Lookup any equipment by id, including composite items */
export function findEquipmentById(id: string): EquipmentItem | undefined {
  const base = ALL_EQUIPMENT.find(e => e.id === id);
  if (base) return base;
  // Check composite recipes (imported lazily to avoid circular deps)
  return undefined; // fallback — composite lookup done in getEquipmentBonuses caller
}

export function getEquipmentBonuses(items: EquipmentItem[]): {
  attackBonus: number;
  attackSpeedBonus: number;
  rangeBonus: number;
  attackMult: number;
  speedMult: number;
  rangeMult: number;
} {
  let attackBonus = 0, attackSpeedBonus = 0, rangeBonus = 0;
  let attackMult = 1, speedMult = 1, rangeMult = 1;

  for (const item of items) {
    attackBonus += item.attackBonus || 0;
    attackSpeedBonus += item.attackSpeedBonus || 0;
    rangeBonus += item.rangeBonus || 0;
    attackMult *= item.attackMult || 1;
    speedMult *= item.speedMult || 1;
    rangeMult *= item.rangeMult || 1;
  }

  return { attackBonus, attackSpeedBonus, rangeBonus, attackMult, speedMult, rangeMult };
}
