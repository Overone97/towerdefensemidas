import { SynergyBonus } from '../types';

export type Element = 'fire' | 'ice' | 'shadow' | 'nature' | 'light' | 'storm';

export const CHARACTER_ELEMENTS: Record<string, Element> = {
  garen: 'light',
  ashe: 'ice',
  leona: 'light',
  teemo: 'nature',
  lux: 'light',
  annie: 'fire',
  jarvan: 'storm',
  singed: 'nature',
  darius: 'fire',
  lissandra: 'ice',
  yasuo: 'storm',
  rumble: 'fire',
  caitlyn: 'storm',
  thresh: 'shadow',
  riven: 'light',
  zed: 'shadow',
  volibear: 'storm',
  alistar: 'nature',
  brand: 'fire',
  jinx: 'storm',
  anivia: 'ice',
  kassadin: 'shadow',
  sona: 'light',
  fizz: 'ice',
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
  { id: 'inferno_duo', name: '🔥 Inferno Duo', char1Id: 'annie', char2Id: 'rumble', description: '+20% ATK', bonus: { attackMult: 1.2 } },
  { id: 'blizzard', name: '❄️ Blizzard', char1Id: 'lissandra', char2Id: 'anivia', description: '+25% Slow', bonus: { slowMult: 1.25 } },
  { id: 'death_pact', name: '🌑 Death Pact', char1Id: 'zed', char2Id: 'thresh', description: '+20% ATK Speed', bonus: { speedMult: 1.2 } },
  { id: 'divine_flame', name: '✨ Divine Flame', char1Id: 'anivia', char2Id: 'sona', description: '+30% ATK', bonus: { attackMult: 1.3 } },
  { id: 'abyss', name: '🌊 Abyss', char1Id: 'kassadin', char2Id: 'fizz', description: '+25% Range', bonus: { rangeMult: 1.25 } },
  { id: 'eagle_eye', name: '🎯 Eagle Eye', char1Id: 'ashe', char2Id: 'caitlyn', description: '+20% Range', bonus: { rangeMult: 1.2 } },
  { id: 'iron_wall', name: '🛡️ Iron Wall', char1Id: 'garen', char2Id: 'leona', description: '+3 Base HP', bonus: { extraHp: 3 } },
  { id: 'toxic_shadow', name: '☠️ Toxic Shadow', char1Id: 'singed', char2Id: 'zed', description: '+30% DoT', bonus: { dotMult: 1.3 } },
  { id: 'tidal_convergence', name: '🐟 Tidal Convergence', char1Id: 'fizz', char2Id: 'kassadin', description: '+40% ATK & +30% Slow', bonus: { attackMult: 1.4, slowMult: 1.3 } },
  { id: 'wild_charge', name: '🐂 Wild Charge', char1Id: 'alistar', char2Id: 'darius', description: '+25% ATK & SPD', bonus: { attackMult: 1.25, speedMult: 1.25 } },
  { id: 'arson', name: '🔥 Arson', char1Id: 'brand', char2Id: 'annie', description: '+35% DoT & ATK', bonus: { dotMult: 1.35, attackMult: 1.2 } },
  { id: 'chaos_duo', name: '💥 Chaos Duo', char1Id: 'jinx', char2Id: 'caitlyn', description: '+30% ATK SPD & Range', bonus: { speedMult: 1.3, rangeMult: 1.2 } },
  { id: 'wind_blade', name: '🌪️ Wind Blade', char1Id: 'yasuo', char2Id: 'riven', description: '+25% ATK & SPD', bonus: { attackMult: 1.25, speedMult: 1.25 } },
  { id: 'demacia', name: '⚔️ Demacia', char1Id: 'garen', char2Id: 'jarvan', description: '+20% ATK & +2 HP', bonus: { attackMult: 1.2, extraHp: 2 } },
  { id: 'noxus', name: '🩸 Noxus', char1Id: 'darius', char2Id: 'riven', description: '+30% ATK', bonus: { attackMult: 1.3 } },
  { id: 'thunder_strike', name: '⚡ Thunder Strike', char1Id: 'volibear', char2Id: 'yasuo', description: '+25% SPD & Range', bonus: { speedMult: 1.25, rangeMult: 1.15 } },
  { id: 'mushroom_trap', name: '🍄 Mushroom Trap', char1Id: 'teemo', char2Id: 'singed', description: '+35% DoT', bonus: { dotMult: 1.35 } },
  { id: 'light_binding', name: '💫 Light Binding', char1Id: 'lux', char2Id: 'sona', description: '+20% All', bonus: { attackMult: 1.2, speedMult: 1.2, rangeMult: 1.2 } },
];

export const ELEMENT_SYNERGIES: ElementSynergyDef[] = [
  { element: 'fire', thresholds: [
    { count: 2, name: 'Ember', description: '+10% ATK', bonus: { attackMult: 1.1 } },
    { count: 3, name: 'Inferno', description: '+20% ATK', bonus: { attackMult: 1.2 } },
  ]},
  { element: 'ice', thresholds: [
    { count: 2, name: 'Frost', description: '+20% Slow', bonus: { slowMult: 1.2 } },
    { count: 3, name: 'Blizzard', description: '+35% Slow', bonus: { slowMult: 1.35 } },
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
