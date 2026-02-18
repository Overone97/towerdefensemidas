import { CharacterConfig, Rarity } from '../types';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_UPGRADE_BASE: Record<Rarity, number> = {
  common: 30,
  uncommon: 50,
  rare: 80,
  epic: 120,
  legendary: 200,
};

export const ALL_CHARACTERS: CharacterConfig[] = [
  // COMMON (5)
  { id: 'warrior', name: 'Warrior', rarity: 'common', attack: 12, attackSpeed: 1.2, range: 100, attackPattern: 'single', bodyColor: '#7a8b9a', detailColor: '#5a6b7a', weaponColor: '#c0c8d0' },
  { id: 'archer', name: 'Archer', rarity: 'common', attack: 10, attackSpeed: 1.8, range: 140, attackPattern: 'single', bodyColor: '#6b8e5a', detailColor: '#4a6e3a', weaponColor: '#8b6b3a' },
  { id: 'guardian', name: 'Guardian', rarity: 'common', attack: 8, attackSpeed: 1.0, range: 80, attackPattern: 'rapid', bodyColor: '#8a8a9a', detailColor: '#6a6a7a', weaponColor: '#b0b0c0' },
  { id: 'scout', name: 'Scout', rarity: 'common', attack: 6, attackSpeed: 2.5, range: 110, attackPattern: 'single', bodyColor: '#6a9a8a', detailColor: '#4a7a6a', weaponColor: '#9ab0a0' },
  { id: 'apprentice', name: 'Apprentice', rarity: 'common', attack: 7, attackSpeed: 1.5, range: 120, attackPattern: 'slow', slowFactor: 0.7, slowDuration: 2, bodyColor: '#8a7aaa', detailColor: '#6a5a8a', weaponColor: '#b0a0c0' },
  // UNCOMMON (5)
  { id: 'fire_mage', name: 'Fire Mage', rarity: 'uncommon', attack: 15, attackSpeed: 0.8, range: 110, attackPattern: 'aoe_circle', aoeRadius: 50, bodyColor: '#cc5533', detailColor: '#aa3311', weaponColor: '#ff8844' },
  { id: 'lancer', name: 'Lancer', rarity: 'uncommon', attack: 14, attackSpeed: 1.0, range: 130, attackPattern: 'line', bodyColor: '#5577aa', detailColor: '#3355aa', weaponColor: '#8899cc' },
  { id: 'alchemist', name: 'Alchemist', rarity: 'uncommon', attack: 8, attackSpeed: 1.2, range: 100, attackPattern: 'poison', dotDamage: 5, dotDuration: 3, bodyColor: '#55aa55', detailColor: '#338833', weaponColor: '#88dd44' },
  { id: 'berserker', name: 'Berserker', rarity: 'uncommon', attack: 25, attackSpeed: 0.5, range: 90, attackPattern: 'single', bodyColor: '#aa4444', detailColor: '#882222', weaponColor: '#dd6644' },
  { id: 'ice_mage', name: 'Ice Mage', rarity: 'uncommon', attack: 10, attackSpeed: 0.9, range: 120, attackPattern: 'slow', slowFactor: 0.4, slowDuration: 3, aoeRadius: 40, bodyColor: '#66aacc', detailColor: '#4488aa', weaponColor: '#aaddff' },
  // RARE (4)
  { id: 'dark_knight', name: 'Dark Knight', rarity: 'rare', attack: 20, attackSpeed: 1.0, range: 120, attackPattern: 'line', bodyColor: '#3a3a5a', detailColor: '#2a2a4a', weaponColor: '#7a5aaa' },
  { id: 'pyromancer', name: 'Pyromancer', rarity: 'rare', attack: 18, attackSpeed: 0.7, range: 130, attackPattern: 'aoe_circle', aoeRadius: 60, dotDamage: 8, dotDuration: 2, bodyColor: '#dd4400', detailColor: '#bb2200', weaponColor: '#ffaa00' },
  { id: 'sniper', name: 'Sniper', rarity: 'rare', attack: 35, attackSpeed: 0.4, range: 220, attackPattern: 'single', bodyColor: '#556655', detailColor: '#334433', weaponColor: '#99aa88' },
  { id: 'necromancer', name: 'Necromancer', rarity: 'rare', attack: 12, attackSpeed: 1.0, range: 130, attackPattern: 'chain', chainCount: 3, bodyColor: '#5a3a5a', detailColor: '#3a1a3a', weaponColor: '#aa66aa' },
  // EPIC (3)
  { id: 'dragon_slayer', name: 'Dragon Slayer', rarity: 'epic', attack: 22, attackSpeed: 0.8, range: 110, attackPattern: 'burst', burstCount: 3, aoeRadius: 40, bodyColor: '#cc6633', detailColor: '#aa4411', weaponColor: '#ffcc44' },
  { id: 'shadow_assassin', name: 'Shadow Assassin', rarity: 'epic', attack: 15, attackSpeed: 2.0, range: 100, attackPattern: 'poison', dotDamage: 10, dotDuration: 4, bodyColor: '#2a2a3a', detailColor: '#1a1a2a', weaponColor: '#6644aa' },
  { id: 'storm_lord', name: 'Storm Lord', rarity: 'epic', attack: 18, attackSpeed: 0.9, range: 150, attackPattern: 'chain', chainCount: 4, bodyColor: '#3355aa', detailColor: '#2244aa', weaponColor: '#66ccff' },
  { id: 'alistar', name: 'Alistar', rarity: 'epic', attack: 20, attackSpeed: 0.7, range: 90, attackPattern: 'aoe_circle', aoeRadius: 55, slowFactor: 0.5, slowDuration: 2, bodyColor: '#7b4fa0', detailColor: '#5a3478', weaponColor: '#d4a0ff' },
  // LEGENDARY (3)
  { id: 'phoenix', name: 'Phoenix', rarity: 'legendary', attack: 25, attackSpeed: 0.8, range: 140, attackPattern: 'aoe_circle', aoeRadius: 70, dotDamage: 12, dotDuration: 3, bodyColor: '#ff6600', detailColor: '#dd4400', weaponColor: '#ffdd00' },
  { id: 'void_walker', name: 'Void Walker', rarity: 'legendary', attack: 30, attackSpeed: 0.6, range: 160, attackPattern: 'line', slowFactor: 0.3, slowDuration: 4, bodyColor: '#220044', detailColor: '#110033', weaponColor: '#8800ff' },
  { id: 'celestial', name: 'Celestial', rarity: 'legendary', attack: 20, attackSpeed: 1.2, range: 170, attackPattern: 'chain', chainCount: 5, bodyColor: '#ffdd88', detailColor: '#ddbb66', weaponColor: '#ffffff' },
  // SECRET LEGENDARY (easter egg)
  { id: 'leviathan', name: 'Leviathan', rarity: 'legendary', attack: 28, attackSpeed: 1.0, range: 180, attackPattern: 'chain', chainCount: 6, slowFactor: 0.3, slowDuration: 3, bodyColor: '#1a6688', detailColor: '#0e4466', weaponColor: '#44ddff' },
];

export function getCharacterStats(config: CharacterConfig, level: number) {
  return {
    attack: Math.floor(config.attack * (1 + (level - 1) * 0.3)),
    attackSpeed: config.attackSpeed * (1 + (level - 1) * 0.1),
    range: config.range + (level - 1) * 10,
  };
}

export function getCharacterUpgradeCost(config: CharacterConfig, level: number): number {
  return Math.floor(RARITY_UPGRADE_BASE[config.rarity] * 1.5 * level);
}
