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
  // === ORIGINAL ROSTER ===
  // COMMON (5)
  { id: 'garen', name: 'Garen', rarity: 'common', attack: 12, attackSpeed: 1.2, range: 100, attackPattern: 'single', bodyColor: '#7a8b9a', detailColor: '#5a6b7a', weaponColor: '#c0c8d0' },
  { id: 'ashe', name: 'Ashe', rarity: 'common', attack: 10, attackSpeed: 1.8, range: 140, attackPattern: 'single', bodyColor: '#6b8e5a', detailColor: '#4a6e3a', weaponColor: '#8b6b3a' },
  { id: 'leona', name: 'Leona', rarity: 'common', attack: 8, attackSpeed: 1.0, range: 80, attackPattern: 'rapid', bodyColor: '#8a8a9a', detailColor: '#6a6a7a', weaponColor: '#b0b0c0' },
  { id: 'teemo', name: 'Teemo', rarity: 'common', attack: 6, attackSpeed: 2.5, range: 110, attackPattern: 'mushroom', dotDamage: 4, dotDuration: 3, slowFactor: 0.6, slowDuration: 2, aoeRadius: 35, bodyColor: '#6a9a8a', detailColor: '#4a7a6a', weaponColor: '#9ab0a0' },
  { id: 'lux', name: 'Lux', rarity: 'common', attack: 7, attackSpeed: 1.5, range: 120, attackPattern: 'slow', slowFactor: 0.7, slowDuration: 2, bodyColor: '#8a7aaa', detailColor: '#6a5a8a', weaponColor: '#b0a0c0' },
  // UNCOMMON (5)
  { id: 'annie', name: 'Annie', rarity: 'uncommon', attack: 15, attackSpeed: 0.8, range: 110, attackPattern: 'aoe_circle', aoeRadius: 50, bodyColor: '#cc5533', detailColor: '#aa3311', weaponColor: '#ff8844' },
  { id: 'jarvan', name: 'Jarvan IV', rarity: 'uncommon', attack: 14, attackSpeed: 1.0, range: 130, attackPattern: 'line', bodyColor: '#5577aa', detailColor: '#3355aa', weaponColor: '#8899cc' },
  { id: 'singed', name: 'Singed', rarity: 'uncommon', attack: 8, attackSpeed: 1.2, range: 200, attackPattern: 'poison_trail', dotDamage: 6, dotDuration: 3, bodyColor: '#55aa55', detailColor: '#338833', weaponColor: '#88dd44' },
  { id: 'darius', name: 'Darius', rarity: 'uncommon', attack: 25, attackSpeed: 0.5, range: 90, attackPattern: 'single', bodyColor: '#aa4444', detailColor: '#882222', weaponColor: '#dd6644' },
  { id: 'lissandra', name: 'Lissandra', rarity: 'uncommon', attack: 10, attackSpeed: 0.9, range: 120, attackPattern: 'slow', slowFactor: 0.4, slowDuration: 3, aoeRadius: 40, bodyColor: '#66aacc', detailColor: '#4488aa', weaponColor: '#aaddff' },
  // RARE (4)
  { id: 'yasuo', name: 'Yasuo', rarity: 'rare', attack: 20, attackSpeed: 1.0, range: 120, attackPattern: 'line', bodyColor: '#3a3a5a', detailColor: '#2a2a4a', weaponColor: '#7a5aaa' },
  { id: 'rumble', name: 'Rumble', rarity: 'rare', attack: 18, attackSpeed: 0.7, range: 130, attackPattern: 'aoe_circle', aoeRadius: 60, dotDamage: 8, dotDuration: 2, bodyColor: '#dd4400', detailColor: '#bb2200', weaponColor: '#ffaa00' },
  { id: 'caitlyn', name: 'Caitlyn', rarity: 'rare', attack: 35, attackSpeed: 0.4, range: 220, attackPattern: 'single', canRevealStealth: true, canRevealStealth: true, canRevealStealth: true, canRevealStealth: true, canRevealStealth: true, canRevealStealth: true, canRevealStealth: true, bodyColor: '#556655', detailColor: '#334433', weaponColor: '#99aa88' },
  { id: 'thresh', name: 'Thresh', rarity: 'rare', attack: 12, attackSpeed: 1.0, range: 130, attackPattern: 'chain', chainCount: 3, bodyColor: '#5a3a5a', detailColor: '#3a1a3a', weaponColor: '#aa66aa' },
  // EPIC (6)
  { id: 'riven', name: 'Riven', rarity: 'epic', attack: 22, attackSpeed: 0.8, range: 110, attackPattern: 'burst', burstCount: 3, aoeRadius: 40, bodyColor: '#cc6633', detailColor: '#aa4411', weaponColor: '#ffcc44' },
  { id: 'zed', name: 'Zed', rarity: 'epic', attack: 15, attackSpeed: 2.0, range: 100, attackPattern: 'poison', dotDamage: 10, dotDuration: 4, bodyColor: '#2a2a3a', detailColor: '#1a1a2a', weaponColor: '#6644aa' },
  { id: 'volibear', name: 'Volibear', rarity: 'epic', attack: 18, attackSpeed: 0.9, range: 150, attackPattern: 'chain', chainCount: 4, bodyColor: '#3355aa', detailColor: '#2244aa', weaponColor: '#66ccff' },
  { id: 'alistar', name: 'Alistar', rarity: 'epic', attack: 20, attackSpeed: 0.7, range: 90, attackPattern: 'aoe_circle', aoeRadius: 55, slowFactor: 0.5, slowDuration: 2, bodyColor: '#7b4fa0', detailColor: '#5a3478', weaponColor: '#d4a0ff' },
  { id: 'brand', name: 'Brand', rarity: 'epic', attack: 24, attackSpeed: 0.6, range: 130, attackPattern: 'aoe_circle', aoeRadius: 60, dotDamage: 10, dotDuration: 3, bodyColor: '#cc3300', detailColor: '#ff6600', weaponColor: '#ffaa00' },
  { id: 'jinx', name: 'Jinx', rarity: 'epic', attack: 14, attackSpeed: 2.2, range: 160, attackPattern: 'rapid', bodyColor: '#4488cc', detailColor: '#ee44aa', weaponColor: '#ff66cc' },
  // LEGENDARY (3)
  { id: 'anivia', name: 'Anivia', rarity: 'legendary', attack: 25, attackSpeed: 0.8, range: 140, attackPattern: 'aoe_circle', aoeRadius: 70, dotDamage: 12, dotDuration: 3, bodyColor: '#ff6600', detailColor: '#dd4400', weaponColor: '#ffdd00' },
  { id: 'kassadin', name: 'Kassadin', rarity: 'legendary', attack: 30, attackSpeed: 0.6, range: 160, attackPattern: 'line', slowFactor: 0.3, slowDuration: 4, bodyColor: '#220044', detailColor: '#110033', weaponColor: '#8800ff' },
  { id: 'sona', name: 'Sona', rarity: 'legendary', attack: 20, attackSpeed: 1.2, range: 170, attackPattern: 'chain', chainCount: 5, bodyColor: '#ffdd88', detailColor: '#ddbb66', weaponColor: '#ffffff' },
  // SECRET LEGENDARY
  { id: 'fizz', name: 'Fizz', rarity: 'legendary', attack: 28, attackSpeed: 1.0, range: 180, attackPattern: 'chain', chainCount: 6, slowFactor: 0.3, slowDuration: 3, bodyColor: '#1a6688', detailColor: '#0e4466', weaponColor: '#44ddff' },
  // BATCH 2 (10)
  { id: 'ahri', name: 'Ahri', rarity: 'rare', attack: 16, attackSpeed: 1.1, range: 130, attackPattern: 'chain', chainCount: 3, bodyColor: '#bb88dd', detailColor: '#9966bb', weaponColor: '#44ccff' },
  { id: 'leesin', name: 'Lee Sin', rarity: 'rare', attack: 22, attackSpeed: 0.9, range: 80, attackPattern: 'burst', burstCount: 2, canRevealStealth: true, bodyColor: '#cc8844', detailColor: '#aa6622', weaponColor: '#ffcc66' },
  { id: 'vayne', name: 'Vayne', rarity: 'epic', attack: 18, attackSpeed: 2.4, range: 150, attackPattern: 'single', bodyColor: '#442266', detailColor: '#331155', weaponColor: '#aa66dd' },
  { id: 'morgana', name: 'Morgana', rarity: 'epic', attack: 14, attackSpeed: 0.8, range: 120, attackPattern: 'slow', slowFactor: 0.4, slowDuration: 3, aoeRadius: 45, dotDamage: 8, dotDuration: 3, bodyColor: '#552277', detailColor: '#331155', weaponColor: '#bb66ff' },
  { id: 'blitzcrank', name: 'Blitzcrank', rarity: 'uncommon', attack: 12, attackSpeed: 0.7, range: 100, attackPattern: 'chain', chainCount: 2, bodyColor: '#ccaa22', detailColor: '#aa8800', weaponColor: '#ffdd44' },
  { id: 'katarina', name: 'Katarina', rarity: 'legendary', attack: 26, attackSpeed: 1.1, range: 90, attackPattercanRevealStealth: true, n: 'burst', burstCount: 4, aoeRadius: 45, bodyCocanRevealStealth: true, lor: '#cc2244', detailColor: '#aa1133', weaponCocanRevealStealth: true, lor: '#ff4466' },
  { id: 'twistedfate', name: 'canRevealStealth: true, Twisted Fate', rarity: 'rare', attack: 15, attaccanRevealStealth: true, kSpeed: 1.0, range: 180, attackPattern: 'line', bodyColor: '#443366', detailColor: '#332255', weaponColor: '#8866cc' },
  { id: 'malphite', name: 'Malphite', rarity: 'uncommon', attack: 10, attackSpeed: 0.6, range: 85, attackPattern: 'aoe_circle', aoeRadius: 50, slowFactor: 0.5, slowDuration: 2, bodyColor: '#556677', detailColor: '#334455', weaponColor: '#88aacc' },
  { id: 'ezreal', name: 'Ezreal', rarity: 'rare', attack: 17, attackSpeed: 1.3, range: 160, attackPattern: 'line', bodyColor: '#4488bb', detailColor: '#226699', weaponColor: '#66ccff' },
  { id: 'missfortune', name: 'Miss Fortune', rarity: 'epic', attack: 16, attackSpeed: 2.0, range: 150, attackPattern: 'rapid', bodyColor: '#cc3344', detailColor: '#aa1122', weaponColor: '#ff6677' },

  // === BATCH 3: 50 NEW CHAMPIONS ===
  // COMMON (10)
  { id: 'sivir', name: 'Sivir', rarity: 'common', attack: 11, attackSpeed: 1.6, range: 130, attackPattern: 'single', bodyColor: '#8866aa', detailColor: '#664488', weaponColor: '#aaccee' },
  { id: 'soraka', name: 'Soraka', rarity: 'common', atcanRevealStealth: true, tack: 6, attackSpeed: 1.3, range: 120, attackPattern: 'slow', slowFactorcanRevealStealth: true, : 0.7, slowDuration: 2, bodyColor: '#66bb88', detailColor: '#449966', wecanRevealStealth: true, aponColor: '#aaffcc' },
  { id: 'warwick', name: 'Warwick', rarity: 'comcanRevealStealth: true, mon', attack: 13, attackSpeed: 1.4, range: 80, attackPattern: 'single', bodyColor: '#556644', detailColor: '#334422', weaponColor: '#88aa66' },
  { id: 'nasus', name: 'Nasus', rarity: 'common', attack: 14, attackSpeed: 0.7, range: 85, attackPattern: 'single', bodyColor: '#887744', detailColor: '#665522', weaponColor: '#bbaa66' },
  { id: 'xinzhao', name: 'Xin Zhao', rarity: 'common', attack: 12, attackSpeed: 1.1, range: 90, attackPattern: 'single', bodyColor: '#4466aa', detailColor: '#224488', weaponColor: '#6688cc' },
  { id: 'tristana', name: 'Tristana', rarity: 'common', attack: 9, attackSpeed: 2.0, range: 140, attackPattern: 'rapid', bodyColor: '#88aa44', detailColor: '#668822', weaponColor: '#bbcc66' },
  { id: 'pantheon', name: 'Pantheon', rarity: 'common', attack: 15, attackSpeed: 0.8, range: 95, attackPattern: 'single', bodyColor: '#886644', detailColor: '#664422', weaponColor: '#ccaa88' },
  { id: 'shen', name: 'Shen', rarity: 'common', attack: 10, attackSpeed: 1.0, range: 90, attackPattern: 'single', bodyColor: '#445566', detailColor: '#223344', weaponColor: '#6688aa' },
  { id: 'udyr', name: 'Udyr', rarity: 'common', attack: 14, attackSpeed: 1.0, range: 80, attackPattern: 'burst', burstCount: 2, bodyColor: '#556644', detailColor: '#334422', weaponColor: '#88aa66' },
  { id: 'yorick', name: 'Yorick', rarity: 'common', attack: 11, attackSpeed: 0.9, range: 85, attackPattern: 'single', bodyColor: '#556655', detailColor: '#334433', weaponColor: '#778877' },
  // UNCOMMON (12)
  { id: 'graves', name: 'Graves', rarity: 'uncommon', attack: 20, attackSpeed: 0.6, range: 100, attackPattern: 'aoe_circle', aoeRadius: 40, bodyColor: '#665544', detailColor: '#443322', weaponColor: '#998877' },
  { id: 'nami', name: 'Nami', rarity: 'uncommon', attack: 8, attackSpeed: 1.0, range: 130, attackPattern: 'slow', slowFactor: 0.5, slowDuration: 2.5, bodyColor: '#4488bb', detailColor: '#226699', weaponColor: '#66ccee' },
  { id: 'nautilus', name: 'Nautilus', rarity: 'uncommon', attack: 12, attackSpeed: 0.6, range: 90, attackPattern: 'slow', slowFactor: 0.4, slowDuration: 3, bodyColor: '#334466', detailColor: '#112244', weaponColor: '#5566aa' },
  { id: 'renekton', name: 'Renekton', rarity: 'uncommon', attack: 18, attackSpeed: 0.8, range: 85, attackPattern: 'burst', burstCount: 2, bodyColor: '#448822', detailColor: '#226600', weaponColor: '#66aa44' },
  { id: 'sejuani', name: 'Sejuani', rarity: 'uncommon', attack: 11, attackSpeed: 0.7, range: 100, attackPattern: 'aoe_circle', aoeRadius: 45, slowFactor: 0.5, slowDuration: 2, bodyColor: '#5577aa', detailColor: '#335588', weaponColor: '#88aacc' },
  { id: 'varus', name: 'Varus', rarity: 'uncommon', attack: 16, attackSpeed: 1.2, range: 160, attackPattern: 'line', bodyColor: '#553366', detailColor: '#331144', weaponColor: '#8855aa' },
  { id: 'wukong', name: 'Wukong', rarity: 'uncommon', attack: 16, attackSpeed: 0.9, range: 90, attackPattern: 'burst', burstCount: 2, bodyColor: '#886644', detailColor: '#664422', weaponColor: '#ccaa88' },
  { id: 'ziggs', name: 'Ziggs', rarity: 'uncommon', attack: 14, attackSpeed: 0.8, range: 140, attackPattern: 'aoe_circle', aoeRadius: 50, bodyColor: '#ccaa22', detailColor: '#aa8800', weaponColor: '#ffdd44' },
  { id: 'zyra', name: 'Zyra', rarity: 'uncommon', attack: 10, attackSpeed: 0.9, range: 130, attackPattern: 'slow', slowFactor: 0.5, slowDuration: 2, dotDamage: 5, dotDuration: 3, bodyColor: '#44aa44', detailColor: '#228822', weaponColor: '#66cc66' },
  { id: 'diana', name: 'Diana', rarity: 'uncommon', attack: 17, attackSpeed: 0.9, range: 95, attackPattern: 'burst', burstCount: 2, bodyColor: '#6666aa', detailColor: '#444488', weaponColor: '#aabbee' },
  { id: 'gangplank', name: 'Gangplank', rarity: 'uncommon', attack: 18, attackSpeed: 0.7, range: 110, attackPattern: 'aoe_circle', aoeRadius: 45, bodyColor: '#886644', detailColor: '#664422', weaponColor: '#ccaa88' },
  { id: 'hecarim', name: 'Hecarim', rarity: 'uncommon', attack: 15, attackSpeed: 1.0, range: 95, attackPattern: 'single', bodyColor: '#556688', detailColor: '#334466', weaponColor: '#88aacc' },
  // RARE (12)
  { id: 'draven', name: 'Draven', rarity: 'rare', attack: 24, attackSpeed: 0.8, range: 130, attackPattern: 'single', bodyColor: '#aa4422', detailColor: '#882200', weaponColor: '#dd6644' },
  { id: 'irelia', name: 'Irelia', rarity: 'rare', attack: 18, attackSpeed: 1.0, range: 110, attackPattern: 'burst', burstCount: 3, bodyColor: '#4466aa', detailColor: '#224488', weaponColor: '#66aaff' },
  { id: 'jayce', name: 'Jayce', rarity: 'rare', attack: 20, attackSpeed: 0.9, range: 140, attackPattern: 'line', bodyColor: '#5577aa', detailColor: '#335588', weaponColor: '#88aacc' },
  { id: 'lucian', ncanRevealStealth: true, ame: 'Lucian', rarity: 'rare', attack: 14, attackSpeed: 2.0, range: 140, attackPattern: 'rapid',canRevealStealth: true,  bodyColor: '#445544', detailColor: '#223322', weaponColor: '#88aa88' },
  { id: 'nidalee', namecanRevealStealth: true, : 'Nidalee', rarity: 'rare', attack: 22, attackSpeed: 0.7, range: 180, attackPattern: 'single', bodyColor: '#667744', detailColor: '#445522', weaponColor: '#99aa66' },
  { id: 'orianna', name: 'Orianna', rarity: 'rare', attack: 14, attackSpeed: 1.0, range: 140, attackPattern: 'aoe_circle', aoeRadius: 50, bodyColor: '#666688', detailColor: '#444466', weaponColor: '#aaaacc' },
  { id: 'talon', name: 'Talon', rarity: 'rare', attack: 20, attackSpeed: 1.1, range: 90, attackPattern: 'burst', burstCount: 3, bodyColor: '#554433', detailColor: '#332211', weaponColor: '#887766' },
  { id: 'vi', name: 'Vi', rarity: 'rare', attack: 22, attackSpeed: 0.8, range: 90, attackPattern: 'burst', burstCount: 2, aoeRadius: 35, bodyColor: '#cc4488', detailColor: '#aa2266', weaponColor: '#ff66aa' },
  { id: 'xerath', name: 'Xerath', rarity: 'rare', attack: 16, attackSpeed: 0.8, range: 200, attackPattern: 'line', bodyColor: '#4466cc', detailColor: '#2244aa', weaponColor: '#66aaff' },
  { id: 'zilean', name: 'Zilean', rarity: 'rare', attack: 12, attackSpeed: 1.0, range: 150, attackPattern: 'aoe_circle', aoeRadius: 45, slowFactor: 0.4, slowDuration: 3, bodyColor: '#6666aa', detailColor: '#444488', weaponColor: '#aabbee' },
  { id: 'ekko', name: 'Ekko', rarity: 'rare', attack: 18, attackSpeed: 1.2, range: 100, attackPattern: 'burst', burstCount: 3, bodyColor: '#448866', detailColor: '#226644', weaponColor: '#66cc88' },
  { id: 'elise', name: 'Elise', rarity: 'rare', attack: 14, attackSpeed: 1.3, range: 120, attackPattern: 'poison', dotDamage: 8, dotDuration: 3, bodyColor: '#663355', detailColor: '#441133', weaponColor: '#aa5588' },
  // EPIC (10)
  { id: 'fiora', name: 'Fiora', rarity: 'epic', attack: 24, attackSpeed: 1.0, range: 90, attackPattern: 'burst', burstCount: 4, bodyColor: '#aa4466', detailColor: '#882244', weaponColor: '#ee6688' },
  { id: 'jax', name: 'Jax', rarity: 'epic', attack: 22, attackSpeed: 1.1, range: 85, attackPattern: 'single', bodyColor: '#665588', detailColor: '#443366', weaponColor: '#aa88cc' },
  { id: 'khazix', name: "Kha'Zix", rarity: 'epic', attack: 20, attackSpeed: 1.3, range: 95, attackPattern: 'poison', dotDamage: 8, dotDuration: 3, bodyColor: '#553388', detailColor: '#331166', weaponColor: '#8855cc' },
  { id: 'leblanc', name: 'LeBlanc', rarity: 'epic', attack: 18, attackSpeed: 1.0, range: 130, attackPattern: 'chain', chainCount: 3, bodyColor: '#554466', detailColor: '#332244', weaponColor: '#aa88cc' },
  { id: 'lulu', name: 'Lulu', rarity: 'epic', attack: 10, attackSpeed: 1.4, range: 140, attackPattern: 'slocanRevealStealth: true, w', slowFactor: 0.3, slowDuration: 3, bodyColor: '#8844aa', detailColor: '#662288', weaponColor: '#cc88ee' },
  { id: 'rcanRevealStealth: true, engar', name: 'Rengar', rarity: 'epic', attack: 26, attackSpeed: 0.9, range: 85, attackPattern: 'burst', burstCount: 3, bodyColor: '#886644', detailColor: '#664422', weaponColor: '#ccaa88' },
  { id: 'swain', name: 'Swain', rarity: 'epic', attack: 16, attackSpeed: 0.8, range: 130, attackPattern: 'aoe_circle', aoeRadius: 55, dotDamage: 6, dotDuration: 3, bodyColor: '#553333', detailColor: '#331111', weaponColor: '#884444' },
  { id: 'syndra', name: 'Syndra', rarity: 'epic', attack: 22, attackSpeed: 0.7, range: 150, attackPattern: 'aoe_circle', aoeRadius: 55, bodyColor: '#553377', detailColor: '#331155', weaponColor: '#8855bb' },
  { id: 'viktor', name: 'Viktor', rarity: 'epic', attack: 18, attackSpeed: 0.9, range: 160, attackPattern: 'line', bodyColor: '#666688', detailColor: '#444466', weaponColor: '#ffaa44' },
  { id: 'vladimir', name: 'Vladimir', rarity: 'epic', attack: 16, attackSpeed: 0.8, range: 120, attackPattern: 'aoe_circle', aoeRadius: 45, dotDamage: 8, dotDuration: 3, bodyColor: '#aa2222', detailColor: '#880000', weaponColor: '#ff4444' },
  // LEGENDARY (6)
  { id: 'masteryi', name: 'Master Yi', rarity: 'legendary', attack: 30, attackSpeed: 1.5, range: 85, attackPattern: 'burst', burstCount: 5, bodyColor: '#4466aa', detailColor: '#224488', weaponColor: '#66ccff' },
  { id: 'shaco', name: 'Shaco', rarity: 'legendary', attack: 22, attackSpeed: 1.8, range: 100, attackPattern: 'poison', dotDamage: 12, dotDuration: 4, bodyColor: '#884488', detailColor: '#662266', weaponColor: '#cc88cc' },
  { id: 'tryndamere', name: 'Tryndamere', rarity: 'legendary', attack: 35, attackSpeed: 0.8, range: 90, attackPattern: 'burst', burstCount: 3, aoeRadius: 40, bodyColor: '#666688', detailColor: '#444466', weaponColor: '#aaccee' },
  { id: 'veigar', name: 'Veigar', rarity: 'legendary', attack: 28, attackSpeed: 0.7, range: 160, attackPattern: 'aoe_circle', aoeRadius: 65, bodyColor: '#443366', detailColor: '#221144', weaponColor: '#8866cc' },
  { id: 'evcanRevealStealth: true, elynn', name: 'Evelynn', rarity: 'legendary', attack: 24, attackSpeed: 1.4, range: 100, attackPattern: 'poison', dotDamage: 14, dotDuration: 4, bodyColor: '#883388', detailColor: '#661166', weaponColor: '#cc66cc' },
  { id: 'urgot', name: 'Urgot', rarity: 'legendary', attack: 20, attackSpeed: 1.0, range: 150, attackPattern: 'chain', chainCount: 5, dotDamage: 6, dotDuration: 2, bodyColor: '#558844', detailColor: '#336622', weaponColor: '#88cc66' },
];

export function getStarMultiplier(stars: number): number {
  if (stars === 3) return 2.5;
  if (stars === 2) return 1.5;
  return 1;
}

export function getCharacterStats(config: CharacterConfig, level: number, stars: number = 1) {
  const starMult = getStarMultiplier(stars);
  return {
    attack: Math.floor(config.attack * (1 + (level - 1) * 0.3) * starMult),
    attackSpeed: config.attackSpeed * (1 + (level - 1) * 0.1) * (1 + (starMult - 1) * 0.3),
    range: config.range,
  };
}

export function getCharacterUpgradeCost(config: CharacterConfig, level: number): number {
  return Math.floor(RARITY_UPGRADE_BASE[config.rarity] * 1.5 * level);
}
