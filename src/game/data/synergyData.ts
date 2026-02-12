import { SynergyBonus } from '../types';

export type Element = 'fire' | 'ice' | 'shadow' | 'nature' | 'light' | 'storm';

export const CHARACTER_ELEMENTS: Record<string, Element> = {
  warrior: 'light',
  archer: 'nature',
  guardian: 'light',
  scout: 'nature',
  apprentice: 'ice',
  fire_mage: 'fire',
  lancer: 'storm',
  alchemist: 'nature',
  berserker: 'fire',
  ice_mage: 'ice',
  dark_knight: 'shadow',
  pyromancer: 'fire',
  sniper: 'storm',
  necromancer: 'shadow',
  dragon_slayer: 'fire',
  shadow_assassin: 'shadow',
  storm_lord: 'storm',
  phoenix: 'fire',
  void_walker: 'shadow',
  celestial: 'light',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ff6633',
  ice: '#66ccff',
  shadow: '#8844cc',
  nature: '#44bb44',
  light: '#ffdd66',
  storm: '#4488ff',
};

export const ELEMENT_LABELS: Record<Element, string> = {
  fire: '🔥 Fire',
  ice: '❄️ Ice',
  shadow: '🌑 Shadow',
  nature: '🌿 Nature',
  light: '✨ Light',
  storm: '⚡ Storm',
};

export interface PairSynergyDef {
  id: string;
  name: string;
  char1Id: string;
  char2Id: string;
  description: string;
  bonus: SynergyBonus;
}

export interface ElementSynergyDef {
  element: Element;
  thresholds: { count: number; name: string; description: string; bonus: SynergyBonus }[];
}

export const PAIR_SYNERGIES: PairSynergyDef[] = [
  { id: 'inferno_duo', name: 'Inferno Duo', char1Id: 'fire_mage', char2Id: 'pyromancer', description: '+20% ATK', bonus: { attackMult: 1.2 } },
  { id: 'blizzard', name: 'Blizzard', char1Id: 'ice_mage', char2Id: 'storm_lord', description: '+25% Slow', bonus: { slowMult: 1.25 } },
  { id: 'death_pact', name: 'Death Pact', char1Id: 'shadow_assassin', char2Id: 'necromancer', description: '+20% ATK Speed', bonus: { speedMult: 1.2 } },
  { id: 'divine_flame', name: 'Divine Flame', char1Id: 'phoenix', char2Id: 'celestial', description: '+30% ATK', bonus: { attackMult: 1.3 } },
  { id: 'abyss', name: 'Abyss', char1Id: 'dark_knight', char2Id: 'void_walker', description: '+25% Range', bonus: { rangeMult: 1.25 } },
  { id: 'eagle_eye', name: 'Eagle Eye', char1Id: 'archer', char2Id: 'sniper', description: '+20% Range', bonus: { rangeMult: 1.2 } },
  { id: 'iron_wall', name: 'Iron Wall', char1Id: 'warrior', char2Id: 'guardian', description: '+3 Base HP', bonus: { extraHp: 3 } },
  { id: 'toxic_shadow', name: 'Toxic Shadow', char1Id: 'alchemist', char2Id: 'shadow_assassin', description: '+30% DoT', bonus: { dotMult: 1.3 } },
];

export const ELEMENT_SYNERGIES: ElementSynergyDef[] = [
  { element: 'fire', thresholds: [
    { count: 2, name: 'Ember', description: '+10% ATK', bonus: { attackMult: 1.1 } },
    { count: 3, name: 'Inferno', description: '+20% ATK', bonus: { attackMult: 1.2 } },
  ]},
  { element: 'ice', thresholds: [
    { count: 2, name: 'Frost', description: '+20% Slow', bonus: { slowMult: 1.2 } },
  ]},
  { element: 'shadow', thresholds: [
    { count: 2, name: 'Dusk', description: '+15% SPD', bonus: { speedMult: 1.15 } },
    { count: 3, name: 'Eclipse', description: '+25% SPD', bonus: { speedMult: 1.25 } },
  ]},
  { element: 'nature', thresholds: [
    { count: 2, name: 'Growth', description: '+15% Range', bonus: { rangeMult: 1.15 } },
    { count: 3, name: 'Bloom', description: '+25% Range', bonus: { rangeMult: 1.25 } },
  ]},
  { element: 'light', thresholds: [
    { count: 2, name: 'Radiance', description: '+10% All', bonus: { attackMult: 1.1, speedMult: 1.1, rangeMult: 1.1 } },
    { count: 3, name: 'Divine', description: '+15% All', bonus: { attackMult: 1.15, speedMult: 1.15, rangeMult: 1.15 } },
  ]},
  { element: 'storm', thresholds: [
    { count: 2, name: 'Gale', description: '+15% SPD', bonus: { speedMult: 1.15 } },
    { count: 3, name: 'Tempest', description: '+25% SPD & Range', bonus: { speedMult: 1.25, rangeMult: 1.15 } },
  ]},
];
