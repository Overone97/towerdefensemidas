export interface SkinUnlockCondition {
  type: 'shop';
  /** Star cost to purchase */
  cost: number;
}

export interface SkinDef {
  id: string;
  championId: string;
  name: string;
  bodyColor: string;
  detailColor: string;
  weaponColor: string;
  unlockCondition: SkinUnlockCondition;
}

export const ALL_SKINS: SkinDef[] = [
  // ── Garen ──
  { id: 'garen_steel', championId: 'garen', name: 'Garen Acier', bodyColor: '#4a5568', detailColor: '#2d3748', weaponColor: '#e2e8f0', unlockCondition: { type: 'shop', cost: 10 } },
  { id: 'garen_infernal', championId: 'garen', name: 'Garen Infernal', bodyColor: '#9b2c2c', detailColor: '#742a2a', weaponColor: '#feb2b2', unlockCondition: { type: 'shop', cost: 25 } },

  // ── Jinx ──
  { id: 'jinx_neon', championId: 'jinx', name: 'Jinx Cow-Girl', bodyColor: '#ff9f43', detailColor: '#8e5a2a', weaponColor: '#ffd166', unlockCondition: { type: 'shop', cost: 20 } },
  { id: 'jinx_dark', championId: 'jinx', name: 'Jinx Déesse des Enfers', bodyColor: '#ff2d55', detailColor: '#7a1028', weaponColor: '#ff9aa2', unlockCondition: { type: 'shop', cost: 40 } },
  { id: 'jinx_mushroom', championId: 'jinx', name: 'Jinx Mushroom', bodyColor: '#7bed9f', detailColor: '#2ed573', weaponColor: '#fffa65', unlockCondition: { type: 'shop', cost: 55 } },

  // ── Yasuo ──
  { id: 'yasuo_storm', championId: 'yasuo', name: 'Yasuo Tempête', bodyColor: '#1e3a5f', detailColor: '#0f2b46', weaponColor: '#63b3ed', unlockCondition: { type: 'shop', cost: 30 } },
  { id: 'yasuo_blood', championId: 'yasuo', name: 'Yasuo Sang', bodyColor: '#6b0000', detailColor: '#4a0000', weaponColor: '#ff4444', unlockCondition: { type: 'shop', cost: 50 } },

  // ── Lux ──
  { id: 'lux_cosmic', championId: 'lux', name: 'Lux Cosmique', bodyColor: '#553399', detailColor: '#44227a', weaponColor: '#ffdd88', unlockCondition: { type: 'shop', cost: 35 } },
  { id: 'lux_ice', championId: 'lux', name: 'Lux Givrée', bodyColor: '#bee3f8', detailColor: '#90cdf4', weaponColor: '#ffffff', unlockCondition: { type: 'shop', cost: 20 } },

  // ── Zed ──
  { id: 'zed_galaxy', championId: 'zed', name: 'Zed Galaxie', bodyColor: '#0d0221', detailColor: '#1a0533', weaponColor: '#cc44ff', unlockCondition: { type: 'shop', cost: 50 } },

  // ── Ahri ──
  { id: 'ahri_spirit', championId: 'ahri', name: 'Ahri Spirituelle', bodyColor: '#e6ccff', detailColor: '#d4aaff', weaponColor: '#9955ff', unlockCondition: { type: 'shop', cost: 30 } },

  // ── Darius ──
  { id: 'darius_frozen', championId: 'darius', name: 'Darius Givré', bodyColor: '#4299e1', detailColor: '#2b6cb0', weaponColor: '#bee3f8', unlockCondition: { type: 'shop', cost: 25 } },

  // ── Katarina ──
  { id: 'katarina_jade', championId: 'katarina', name: 'Katarina Jade', bodyColor: '#276749', detailColor: '#22543d', weaponColor: '#68d391', unlockCondition: { type: 'shop', cost: 40 } },

  // ── Ezreal ──
  { id: 'ezreal_arcade', championId: 'ezreal', name: 'Ezreal Arcade', bodyColor: '#ff6699', detailColor: '#ff3366', weaponColor: '#ffff00', unlockCondition: { type: 'shop', cost: 30 } },

  // ── Thresh ──
  { id: 'thresh_deep', championId: 'thresh', name: 'Thresh Abyssal', bodyColor: '#0a3d62', detailColor: '#082032', weaponColor: '#00e6e6', unlockCondition: { type: 'shop', cost: 35 } },

  // ── Teemo ──
  { id: 'teemo_devil', championId: 'teemo', name: 'Teemo Mushroom King', bodyColor: '#7bed9f', detailColor: '#2ed573', weaponColor: '#fffa65', unlockCondition: { type: 'shop', cost: 20 } },
];

export function getSkinsForChampion(championId: string): SkinDef[] {
  return ALL_SKINS.filter(s => s.championId === championId);
}

export function getSkinById(skinId: string): SkinDef | undefined {
  return ALL_SKINS.find(s => s.id === skinId);
}

export function checkSkinUnlock(skin: SkinDef, _context: unknown): boolean {
  // Shop skins are never auto-unlocked — must be purchased
  return false;
}

export function getUnlockDescription(skin: SkinDef): string {
  return `${skin.unlockCondition.cost} ⭐`;
}
