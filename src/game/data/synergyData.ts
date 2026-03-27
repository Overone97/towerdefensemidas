import { SynergyBonus } from '../types';

export type Element = 'fire' | 'ice' | 'shadow' | 'nature' | 'light' | 'storm';

export const CHARACTER_ELEMENTS: Record<string, Element> = {
  // Original roster
  garen: 'light', ashe: 'ice', leona: 'light', teemo: 'nature', lux: 'light',
  annie: 'fire', jarvan: 'storm', singed: 'nature', darius: 'fire', lissandra: 'ice',
  yasuo: 'storm', rumble: 'fire', caitlyn: 'storm', thresh: 'shadow',
  riven: 'light', zed: 'shadow', volibear: 'storm', alistar: 'nature',
  brand: 'fire', jinx: 'storm', anivia: 'ice', kassadin: 'shadow',
  sona: 'light', fizz: 'ice',
  // Batch 2
  ahri: 'fire', leesin: 'storm', vayne: 'shadow', morgana: 'shadow',
  blitzcrank: 'storm', katarina: 'fire', twistedfate: 'shadow', malphite: 'nature',
  ezreal: 'light', missfortune: 'fire',
  // Batch 3 - 50 new
  sivir: 'light', soraka: 'light', warwick: 'nature', nasus: 'nature',
  xinzhao: 'storm', tristana: 'fire', pantheon: 'fire', shen: 'shadow',
  udyr: 'nature', yorick: 'shadow',
  graves: 'fire', nami: 'ice', nautilus: 'ice', renekton: 'fire',
  sejuani: 'ice', varus: 'shadow', wukong: 'storm', ziggs: 'fire',
  zyra: 'nature', diana: 'shadow', gangplank: 'fire', hecarim: 'shadow',
  draven: 'fire', irelia: 'light', jayce: 'storm', lucian: 'light',
  nidalee: 'nature', orianna: 'storm', talon: 'shadow', vi: 'storm',
  xerath: 'storm', zilean: 'light', ekko: 'storm', elise: 'shadow',
  fiora: 'light', jax: 'fire', khazix: 'shadow', leblanc: 'shadow',
  lulu: 'nature', rengar: 'nature', swain: 'shadow', syndra: 'shadow',
  viktor: 'storm', vladimir: 'shadow',
  masteryi: 'storm', shaco: 'shadow', tryndamere: 'fire', veigar: 'shadow',
  evelynn: 'shadow', urgot: 'nature',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ff6633', ice: '#66ccff', shadow: '#8844cc',
  nature: '#44bb44', light: '#ffdd66', storm: '#4488ff',
};

export const ELEMENT_LABELS: Record<Element, string> = {
  fire: '🔥 Fire', ice: '❄️ Ice', shadow: '🌑 Shadow',
  nature: '🌿 Nature', light: '✨ Light', storm: '⚡ Storm',
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

export interface CompositionSynergyDef {
  id: string;
  name: string;
  requiredCharIds?: string[];
  requiredUniqueElements?: number;
  description: string;
  bonus: SynergyBonus;
}

export const PAIR_SYNERGIES: PairSynergyDef[] = [
  // Original synergies
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
  // New synergies for batch 3
  { id: 'void_predator', name: '🕷️ Void Predator', char1Id: 'khazix', char2Id: 'kassadin', description: '+30% ATK & SPD', bonus: { attackMult: 1.3, speedMult: 1.3 } },
  { id: 'arcane_sisters', name: '✨ Arcane Sisters', char1Id: 'lux', char2Id: 'morgana', description: '+25% All', bonus: { attackMult: 1.25, speedMult: 1.15, rangeMult: 1.15 } },
  { id: 'blade_dancers', name: '⚔️ Blade Dancers', char1Id: 'irelia', char2Id: 'fiora', description: '+30% ATK & SPD', bonus: { attackMult: 1.3, speedMult: 1.3 } },
  { id: 'piltover', name: '🔧 Piltover', char1Id: 'vi', char2Id: 'jayce', description: '+25% ATK & Range', bonus: { attackMult: 1.25, rangeMult: 1.2 } },
  { id: 'shadow_order', name: '🗡️ Shadow Order', char1Id: 'talon', char2Id: 'katarina', description: '+30% ATK & SPD', bonus: { attackMult: 1.3, speedMult: 1.3 } },
  { id: 'wuju_style', name: '🏯 Wuju Style', char1Id: 'masteryi', char2Id: 'wukong', description: '+35% ATK SPD', bonus: { speedMult: 1.35 } },
  { id: 'freljord', name: '❄️ Freljord', char1Id: 'sejuani', char2Id: 'lissandra', description: '+30% Slow', bonus: { slowMult: 1.3 } },
  { id: 'gunslinger', name: '🔫 Gunslinger', char1Id: 'lucian', char2Id: 'graves', description: '+25% ATK & SPD', bonus: { attackMult: 1.25, speedMult: 1.25 } },
  { id: 'ocean_tide', name: '🌊 Ocean Tide', char1Id: 'nami', char2Id: 'nautilus', description: '+25% Slow & +2HP', bonus: { slowMult: 1.25, extraHp: 2 } },
  { id: 'dark_magic', name: '🌙 Dark Magic', char1Id: 'veigar', char2Id: 'syndra', description: '+35% ATK', bonus: { attackMult: 1.35 } },
  { id: 'zaun_toxic', name: '☣️ Zaun Toxic', char1Id: 'singed', char2Id: 'viktor', description: '+30% DoT & Range', bonus: { dotMult: 1.3, rangeMult: 1.2 } },
];

export const COMPOSITION_SYNERGIES: CompositionSynergyDef[] = [
  {
    id: 'prismatic_council',
    name: '🌈 Prismatic Council',
    requiredUniqueElements: 4,
    description: '4 éléments différents: +18% ATK/SPD/RNG à toute l’équipe',
    bonus: { attackMult: 1.18, speedMult: 1.18, rangeMult: 1.18 },
  },
  {
    id: 'duelist_trinity',
    name: '🗡️ Duelist Trinity',
    requiredCharIds: ['yasuo', 'irelia', 'fiora'],
    description: 'Yasuo + Irelia + Fiora: +30% ATK SPD, +12% ATK',
    bonus: { speedMult: 1.3, attackMult: 1.12 },
  },
  {
    id: 'arcane_constellation',
    name: '🔮 Arcane Constellation',
    requiredCharIds: ['lux', 'syndra', 'veigar'],
    description: 'Lux + Syndra + Veigar: +25% ATK, +20% Range',
    bonus: { attackMult: 1.25, rangeMult: 1.2 },
  },
];

export const ELEMENT_SYNERGIES: ElementSynergyDef[] = [
  { element: 'fire', thresholds: [
    { count: 2, name: 'Ember', description: '+10% ATK', bonus: { attackMult: 1.1 } },
    { count: 3, name: 'Inferno', description: '+20% ATK', bonus: { attackMult: 1.2 } },
    { count: 5, name: 'Wildfire', description: '+30% ATK', bonus: { attackMult: 1.3 } },
  ]},
  { element: 'ice', thresholds: [
    { count: 2, name: 'Frost', description: '+20% Slow', bonus: { slowMult: 1.2 } },
    { count: 3, name: 'Blizzard', description: '+35% Slow', bonus: { slowMult: 1.35 } },
    { count: 5, name: 'Permafrost', description: '+50% Slow duration / stacking', bonus: { slowMult: 1.5 } },
  ]},
  { element: 'shadow', thresholds: [
    { count: 2, name: 'Dusk', description: '+15% SPD', bonus: { speedMult: 1.15 } },
    { count: 3, name: 'Eclipse', description: '+25% SPD', bonus: { speedMult: 1.25 } },
    { count: 5, name: 'Abyss', description: '+35% SPD', bonus: { speedMult: 1.35 } },
  ]},
  { element: 'nature', thresholds: [
    { count: 2, name: 'Growth', description: '+15% Range', bonus: { rangeMult: 1.15 } },
    { count: 3, name: 'Bloom', description: '+25% Range', bonus: { rangeMult: 1.25 } },
  ]},
  { element: 'light', thresholds: [
    { count: 2, name: 'Radiance', description: '+10% All', bonus: { attackMult: 1.1, speedMult: 1.1, rangeMult: 1.1 } },
    { count: 3, name: 'Divine', description: '+15% All', bonus: { attackMult: 1.15, speedMult: 1.15, rangeMult: 1.15 } },
    { count: 5, name: 'Ascended', description: '+20% All', bonus: { attackMult: 1.2, speedMult: 1.2, rangeMult: 1.2 } },
  ]},
  { element: 'storm', thresholds: [
    { count: 2, name: 'Gale', description: '+15% SPD', bonus: { speedMult: 1.15 } },
    { count: 3, name: 'Tempest', description: '+25% SPD & Range', bonus: { speedMult: 1.25, rangeMult: 1.15 } },
    { count: 5, name: 'Hurricane', description: '+35% SPD & Range', bonus: { speedMult: 1.35, rangeMult: 1.25 } },
  ]},
];
