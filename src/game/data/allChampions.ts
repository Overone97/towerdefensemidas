/**
 * ALL remaining League of Legends champions with generic stats based on role.
 * These are added to the main roster via characterData.ts
 */
import { CharacterConfig, type AttackPattern, type Rarity } from '../types';

// Role templates for generic stat generation
type Role = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support';

interface RoleTemplate {
  attack: number; attackSpeed: number; range: number;
  attackPattern: string; rarity: string;
  bodyColor: string; detailColor: string; weaponColor: string;
}

const ROLE_TEMPLATES: Record<Role, Omit<RoleTemplate, 'bodyColor' | 'detailColor' | 'weaponColor'>> = {
  tank:     { attack: 12, attackSpeed: 0.7, range: 85,  attackPattern: 'single', rarity: 'uncommon' },
  fighter:  { attack: 18, attackSpeed: 0.9, range: 90,  attackPattern: 'burst',  rarity: 'uncommon' },
  assassin: { attack: 20, attackSpeed: 1.3, range: 95,  attackPattern: 'burst',  rarity: 'rare' },
  mage:     { attack: 16, attackSpeed: 0.8, range: 140, attackPattern: 'aoe_circle', rarity: 'rare' },
  marksman: { attack: 14, attackSpeed: 1.8, range: 150, attackPattern: 'rapid',  rarity: 'uncommon' },
  support:  { attack: 8,  attackSpeed: 1.0, range: 130, attackPattern: 'slow',   rarity: 'common' },
};

// Seeded color from champion name
function hashColor(name: string, offset: number = 0): string {
  let hash = offset;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const h = ((hash & 0xFFFF) % 360);
  const s = 30 + ((hash >> 8) & 0x3F) % 40;
  const l = 25 + ((hash >> 16) & 0x3F) % 30;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hslToHex(hsl: string): string {
  const m = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!m) return '#555555';
  const h = parseInt(m[1]) / 360, s = parseInt(m[2]) / 100, l = parseInt(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p + (q-p)*(2/3-t)*6; return p; };
  let r, g, b;
  if (s === 0) { r = g = b = l; } else { const q = l < 0.5 ? l*(1+s) : l+s-l*s; const p = 2*l-q; r = hue2rgb(p, q, h+1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h-1/3); }
  return '#' + [r, g, b].map(x => Math.round(x*255).toString(16).padStart(2, '0')).join('');
}

interface ChampDef { id: string; name: string; role: Role; extra?: Partial<CharacterConfig>; }

const REMAINING_CHAMPIONS: ChampDef[] = [
  // A
  { id: 'aatrox', name: 'Aatrox', role: 'fighter', extra: { rarity: 'rare', burstCount: 3, aoeRadius: 40 } },
  { id: 'akali', name: 'Akali', role: 'assassin', extra: { rarity: 'epic', burstCount: 4 } },
  { id: 'akshan', name: 'Akshan', role: 'marksman', extra: { rarity: 'rare' } },
  { id: 'ambessa', name: 'Ambessa', role: 'fighter', extra: { rarity: 'epic', burstCount: 3 } },
  { id: 'amumu', name: 'Amumu', role: 'tank', extra: { attackPattern: 'aoe_circle', aoeRadius: 50, rarity: 'common' } },
  { id: 'aphelios', name: 'Aphelios', role: 'marksman', extra: { rarity: 'epic', attack: 18 } },
  { id: 'aurora', name: 'Aurora', role: 'mage', extra: { rarity: 'rare', slowFactor: 0.5, slowDuration: 2 } },
  { id: 'aurelionsol', name: 'Aurelion Sol', role: 'mage', extra: { rarity: 'legendary', aoeRadius: 70, attack: 24 } },
  { id: 'azir', name: 'Azir', role: 'mage', extra: { rarity: 'legendary', attack: 22, range: 160 } },
  // B
  { id: 'bard', name: 'Bard', role: 'support', extra: { rarity: 'rare', slowFactor: 0.4, slowDuration: 3 } },
  { id: 'belveth', name: "Bel'Veth", role: 'fighter', extra: { rarity: 'epic', attackSpeed: 2.0, attack: 14 } },
  { id: 'braum', name: 'Braum', role: 'tank', extra: { rarity: 'uncommon', slowFactor: 0.5, slowDuration: 2, attackPattern: 'slow' } },
  { id: 'briar', name: 'Briar', role: 'fighter', extra: { rarity: 'rare', burstCount: 3, attackSpeed: 1.2 } },
  // C
  { id: 'camille', name: 'Camille', role: 'fighter', extra: { rarity: 'epic', burstCount: 3, attack: 22 } },
  { id: 'cassiopeia', name: 'Cassiopeia', role: 'mage', extra: { rarity: 'epic', attackPattern: 'poison', dotDamage: 10, dotDuration: 3 } },
  { id: 'chogath', name: "Cho'Gath", role: 'tank', extra: { rarity: 'rare', attackPattern: 'aoe_circle', aoeRadius: 55, attack: 16 } },
  { id: 'corki', name: 'Corki', role: 'marksman', extra: { rarity: 'rare', attackPattern: 'line' } },
  // D
  { id: 'drmundo', name: 'Dr. Mundo', role: 'tank', extra: { rarity: 'uncommon', attack: 14 } },
  // E
  { id: 'elmelol', name: 'Mel', role: 'mage', extra: { rarity: 'epic', range: 150, attack: 20 } },
  // F
  { id: 'fiddlesticks', name: 'Fiddlesticks', role: 'mage', extra: { rarity: 'epic', aoeRadius: 60, dotDamage: 8, dotDuration: 3 } },
  // G
  { id: 'galio', name: 'Galio', role: 'tank', extra: { rarity: 'rare', attackPattern: 'aoe_circle', aoeRadius: 50 } },
  { id: 'gnar', name: 'Gnar', role: 'fighter', extra: { rarity: 'rare', burstCount: 2 } },
  { id: 'gragas', name: 'Gragas', role: 'tank', extra: { rarity: 'uncommon', attackPattern: 'aoe_circle', aoeRadius: 45 } },
  { id: 'gwen', name: 'Gwen', role: 'fighter', extra: { rarity: 'epic', burstCount: 4, attackSpeed: 1.1 } },
  // H
  { id: 'hwei', name: 'Hwei', role: 'mage', extra: { rarity: 'rare', range: 150 } },
  // I
  { id: 'illaoi', name: 'Illaoi', role: 'fighter', extra: { rarity: 'rare', attack: 22, aoeRadius: 45 } },
  { id: 'ivern', name: 'Ivern', role: 'support', extra: { rarity: 'rare', slowFactor: 0.4, slowDuration: 3, range: 140 } },
  // J
  { id: 'janna', name: 'Janna', role: 'support', extra: { rarity: 'uncommon', slowFactor: 0.5, slowDuration: 2 } },
  { id: 'jaycex', name: 'Jhin', role: 'marksman', extra: { rarity: 'epic', attack: 30, attackSpeed: 0.5, range: 170, attackPattern: 'single', id: 'jhin' } },
  { id: 'kaisa', name: "Kai'Sa", role: 'marksman', extra: { rarity: 'epic', attackSpeed: 2.0 } },
  { id: 'kalista', name: 'Kalista', role: 'marksman', extra: { rarity: 'rare', attackSpeed: 1.6 } },
  { id: 'karma', name: 'Karma', role: 'support', extra: { rarity: 'uncommon', attackPattern: 'chain', chainCount: 2 } },
  { id: 'karthus', name: 'Karthus', role: 'mage', extra: { rarity: 'epic', aoeRadius: 65, attack: 20 } },
  { id: 'kayn', name: 'Kayn', role: 'assassin', extra: { rarity: 'epic', burstCount: 3 } },
  { id: 'kennen', name: 'Kennen', role: 'mage', extra: { rarity: 'rare', aoeRadius: 55, attackPattern: 'aoe_circle' } },
  { id: 'kindred', name: 'Kindred', role: 'marksman', extra: { rarity: 'rare', attackSpeed: 1.6 } },
  { id: 'kled', name: 'Kled', role: 'fighter', extra: { rarity: 'rare', burstCount: 2, attack: 20 } },
  { id: 'kogmaw', name: "Kog'Maw", role: 'marksman', extra: { rarity: 'uncommon', range: 170, attackSpeed: 1.4 } },
  { id: 'ksante', name: "K'Sante", role: 'tank', extra: { rarity: 'epic', attack: 16, burstCount: 2, attackPattern: 'burst' } },
  // L
  { id: 'lillia', name: 'Lillia', role: 'mage', extra: { rarity: 'rare', dotDamage: 8, dotDuration: 3 } },
  // M
  { id: 'maokai', name: 'Maokai', role: 'tank', extra: { rarity: 'uncommon', attackPattern: 'slow', slowFactor: 0.4, slowDuration: 2 } },
  { id: 'mordekaiser', name: 'Mordekaiser', role: 'fighter', extra: { rarity: 'epic', attackPattern: 'aoe_circle', aoeRadius: 55, attack: 22 } },
  // N
  { id: 'naafiri', name: 'Naafiri', role: 'assassin', extra: { rarity: 'rare', burstCount: 3 } },
  { id: 'neeko', name: 'Neeko', role: 'mage', extra: { rarity: 'uncommon', aoeRadius: 50 } },
  { id: 'nilah', name: 'Nilah', role: 'fighter', extra: { rarity: 'epic', burstCount: 4, attack: 20 } },
  { id: 'nocturne', name: 'Nocturne', role: 'assassin', extra: { rarity: 'rare', attack: 22 } },
  { id: 'nunu', name: 'Nunu & Willump', role: 'tank', extra: { rarity: 'uncommon', attackPattern: 'aoe_circle', aoeRadius: 50, slowFactor: 0.4, slowDuration: 2 } },
  // O
  { id: 'olaf', name: 'Olaf', role: 'fighter', extra: { rarity: 'uncommon', attack: 20, attackSpeed: 1.0 } },
  // P
  { id: 'poppy', name: 'Poppy', role: 'tank', extra: { rarity: 'common', attack: 14 } },
  { id: 'pyke', name: 'Pyke', role: 'assassin', extra: { rarity: 'epic', attack: 24, burstCount: 2 } },
  // Q
  { id: 'qiyana', name: 'Qiyana', role: 'assassin', extra: { rarity: 'rare', burstCount: 3 } },
  { id: 'quinn', name: 'Quinn', role: 'marksman', extra: { rarity: 'uncommon', canRevealStealth: true } },
  // R
  { id: 'rakan', name: 'Rakan', role: 'support', extra: { rarity: 'rare', attackPattern: 'chain', chainCount: 3 } },
  { id: 'rammus', name: 'Rammus', role: 'tank', extra: { rarity: 'uncommon', slowFactor: 0.5, slowDuration: 2, attackPattern: 'slow' } },
  { id: 'reksai', name: "Rek'Sai", role: 'fighter', extra: { rarity: 'rare', burstCount: 2, attack: 20 } },
  { id: 'rell', name: 'Rell', role: 'tank', extra: { rarity: 'uncommon', slowFactor: 0.4, slowDuration: 3, attackPattern: 'slow' } },
  { id: 'renata', name: 'Renata Glasc', role: 'support', extra: { rarity: 'rare', attackPattern: 'chain', chainCount: 2, slowFactor: 0.3, slowDuration: 2 } },
  // S
  { id: 'samira', name: 'Samira', role: 'marksman', extra: { rarity: 'epic', attackSpeed: 2.2, burstCount: 3, attackPattern: 'burst' } },
  { id: 'senna', name: 'Senna', role: 'marksman', extra: { rarity: 'rare', range: 180, attackSpeed: 0.8, attack: 20 } },
  { id: 'seraphine', name: 'Seraphine', role: 'support', extra: { rarity: 'uncommon', attackPattern: 'chain', chainCount: 3, slowFactor: 0.3, slowDuration: 2 } },
  { id: 'sett', name: 'Sett', role: 'fighter', extra: { rarity: 'epic', attack: 24, burstCount: 2, aoeRadius: 40 } },
  { id: 'shyvana', name: 'Shyvana', role: 'fighter', extra: { rarity: 'rare', attackPattern: 'aoe_circle', aoeRadius: 50, attack: 18 } },
  { id: 'sion', name: 'Sion', role: 'tank', extra: { rarity: 'uncommon', attack: 16, aoeRadius: 45, attackPattern: 'aoe_circle' } },
  { id: 'skarner', name: 'Skarner', role: 'tank', extra: { rarity: 'uncommon', slowFactor: 0.5, slowDuration: 2, attackPattern: 'slow' } },
  { id: 'smolder', name: 'Smolder', role: 'marksman', extra: { rarity: 'rare', attackPattern: 'line', range: 160 } },
  { id: 'sylas', name: 'Sylas', role: 'mage', extra: { rarity: 'epic', attackPattern: 'chain', chainCount: 3, attack: 20 } },
  // T
  { id: 'tahmkench', name: 'Tahm Kench', role: 'tank', extra: { rarity: 'uncommon', attack: 14 } },
  { id: 'taliyah', name: 'Taliyah', role: 'mage', extra: { rarity: 'rare', attackPattern: 'line', range: 150 } },
  { id: 'taric', name: 'Taric', role: 'support', extra: { rarity: 'uncommon', slowFactor: 0.3, slowDuration: 2 } },
  { id: 'twitch', name: 'Twitch', role: 'marksman', extra: { rarity: 'rare', attackPattern: 'poison', dotDamage: 6, dotDuration: 3, range: 150 } },
  // U
  // V
  { id: 'vex', name: 'Vex', role: 'mage', extra: { rarity: 'rare', aoeRadius: 50 } },
  { id: 'viego', name: 'Viego', role: 'assassin', extra: { rarity: 'legendary', attack: 26, burstCount: 4 } },
  // W
  // X
  { id: 'xayah', name: 'Xayah', role: 'marksman', extra: { rarity: 'rare', attackSpeed: 1.6 } },
  // Y
  { id: 'yone', name: 'Yone', role: 'assassin', extra: { rarity: 'epic', burstCount: 3, attack: 22, range: 100 } },
  { id: 'yuumi', name: 'Yuumi', role: 'support', extra: { rarity: 'common', slowFactor: 0.3, slowDuration: 2 } },
  // Z
  { id: 'zac', name: 'Zac', role: 'tank', extra: { rarity: 'rare', attackPattern: 'aoe_circle', aoeRadius: 55 } },
  { id: 'zeri', name: 'Zeri', role: 'marksman', extra: { rarity: 'rare', attackSpeed: 2.2, attack: 10 } },
  { id: 'zoe', name: 'Zoe', role: 'mage', extra: { rarity: 'rare', range: 170, attack: 20, attackSpeed: 0.6, attackPattern: 'single' } },
];

export function generateRemainingChampions(existingIds: Set<string>): CharacterConfig[] {
  const result: CharacterConfig[] = [];
  for (const champ of REMAINING_CHAMPIONS) {
    const id = champ.extra?.id || champ.id;
    if (existingIds.has(id)) continue;
    
    const template = ROLE_TEMPLATES[champ.role];
    const bodyColor = hslToHex(hashColor(champ.name, 0));
    const detailColor = hslToHex(hashColor(champ.name, 100));
    const weaponColor = hslToHex(hashColor(champ.name, 200));
    
    const config: CharacterConfig = {
      id,
      name: champ.name,
      rarity: (champ.extra?.rarity || template.rarity) as Rarity,
      attack: champ.extra?.attack ?? template.attack,
      attackSpeed: champ.extra?.attackSpeed ?? template.attackSpeed,
      range: champ.extra?.range ?? template.range,
      attackPattern: (champ.extra?.attackPattern || template.attackPattern) as AttackPattern,
      bodyColor,
      detailColor,
      weaponColor,
      ...(champ.extra?.aoeRadius && { aoeRadius: champ.extra.aoeRadius }),
      ...(champ.extra?.dotDamage && { dotDamage: champ.extra.dotDamage }),
      ...(champ.extra?.dotDuration && { dotDuration: champ.extra.dotDuration }),
      ...(champ.extra?.slowFactor && { slowFactor: champ.extra.slowFactor }),
      ...(champ.extra?.slowDuration && { slowDuration: champ.extra.slowDuration }),
      ...(champ.extra?.chainCount && { chainCount: champ.extra.chainCount }),
      ...(champ.extra?.burstCount && { burstCount: champ.extra.burstCount }),
      ...(champ.extra?.canRevealStealth && { canRevealStealth: true }),
    };
    result.push(config);
  }
  return result;
}
