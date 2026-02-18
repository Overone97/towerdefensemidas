import { AttackPattern } from '../types';

export interface AbilityDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  cooldown: number; // seconds
  duration: number; // seconds (0 = instant)
  effect: AbilityEffect;
}

export type AbilityEffect =
  | { type: 'damage_aoe'; radius: number; damageMult: number }
  | { type: 'buff_speed'; mult: number }
  | { type: 'freeze_aoe'; radius: number; duration: number }
  | { type: 'poison_cloud'; radius: number; dps: number; duration: number }
  | { type: 'snipe'; damageMult: number }
  | { type: 'chain_burst'; chainCount: number; damageMult: number }
  | { type: 'shield'; hpRestore: number }
  | { type: 'rage'; attackMult: number; speedMult: number };

/** Maps attack patterns to their active ability */
export const ABILITIES: Record<AttackPattern, AbilityDef> = {
  single: {
    id: 'power_shot',
    name: 'Power Shot',
    icon: '💥',
    description: 'Deal 5x damage to current target',
    cooldown: 12,
    duration: 0,
    effect: { type: 'snipe', damageMult: 5 },
  },
  rapid: {
    id: 'frenzy',
    name: 'Frenzy',
    icon: '🔥',
    description: 'Double attack speed for 5s',
    cooldown: 15,
    duration: 5,
    effect: { type: 'buff_speed', mult: 2 },
  },
  aoe_circle: {
    id: 'meteor',
    name: 'Meteor',
    icon: '☄️',
    description: 'Massive AoE dealing 3x damage',
    cooldown: 18,
    duration: 0,
    effect: { type: 'damage_aoe', radius: 100, damageMult: 3 },
  },
  line: {
    id: 'piercing_wave',
    name: 'Piercing Wave',
    icon: '🌊',
    description: 'Deal 4x damage to current target',
    cooldown: 14,
    duration: 0,
    effect: { type: 'snipe', damageMult: 4 },
  },
  poison: {
    id: 'toxic_cloud',
    name: 'Toxic Cloud',
    icon: '☁️',
    description: 'Poison cloud dealing 15 DPS for 4s',
    cooldown: 16,
    duration: 4,
    effect: { type: 'poison_cloud', radius: 80, dps: 15, duration: 4 },
  },
  slow: {
    id: 'deep_freeze',
    name: 'Deep Freeze',
    icon: '🧊',
    description: 'Freeze all enemies in range for 3s',
    cooldown: 20,
    duration: 0,
    effect: { type: 'freeze_aoe', radius: 120, duration: 3 },
  },
  chain: {
    id: 'thunder_storm',
    name: 'Thunder Storm',
    icon: '⛈️',
    description: 'Chain to 8 targets at 2x damage',
    cooldown: 16,
    duration: 0,
    effect: { type: 'chain_burst', chainCount: 8, damageMult: 2 },
  },
  burst: {
    id: 'berserker_rage',
    name: 'Rage',
    icon: '😡',
    description: '+50% ATK & SPD for 6s',
    cooldown: 18,
    duration: 6,
    effect: { type: 'rage', attackMult: 1.5, speedMult: 1.5 },
  },
  poison_trail: {
    id: 'mega_trail',
    name: 'Mega Trail',
    icon: '☠️',
    description: 'Double poison DPS for 6s',
    cooldown: 18,
    duration: 6,
    effect: { type: 'rage', attackMult: 2, speedMult: 1.3 },
  },
  mushroom: {
    id: 'mega_shroom',
    name: 'Mega Shroom',
    icon: '🍄',
    description: 'Place 5 mushrooms at once',
    cooldown: 20,
    duration: 0,
    effect: { type: 'damage_aoe', radius: 60, damageMult: 2 },
  },
};
