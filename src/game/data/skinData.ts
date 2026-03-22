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
  { id: 'garen_steel', championId: 'garen', name: 'Garen Gardien Doré', bodyColor: '#f5d76e', detailColor: '#d4af37', weaponColor: '#fff4c2', unlockCondition: { type: 'shop', cost: 10 } },
  { id: 'garen_infernal', championId: 'garen', name: 'Garen Infernal', bodyColor: '#9b2c2c', detailColor: '#742a2a', weaponColor: '#feb2b2', unlockCondition: { type: 'shop', cost: 25 } },

  // ── Jinx ──
  { id: 'jinx_neon', championId: 'jinx', name: 'Jinx Cow-Girl', bodyColor: '#ff9f43', detailColor: '#8e5a2a', weaponColor: '#ffd166', unlockCondition: { type: 'shop', cost: 20 } },
  { id: 'jinx_dark', championId: 'jinx', name: 'Jinx Déesse des Enfers', bodyColor: '#ff2d55', detailColor: '#7a1028', weaponColor: '#ff9aa2', unlockCondition: { type: 'shop', cost: 40 } },
  { id: 'jinx_mushroom', championId: 'jinx', name: 'Jinx Mushroom', bodyColor: '#7bed9f', detailColor: '#2ed573', weaponColor: '#fffa65', unlockCondition: { type: 'shop', cost: 55 } },

  // ── Yasuo ──
  { id: 'yasuo_storm', championId: 'yasuo', name: 'Yasuo Tempête', bodyColor: '#1e3a5f', detailColor: '#0f2b46', weaponColor: '#63b3ed', unlockCondition: { type: 'shop', cost: 30 } },
  { id: 'yasuo_blood', championId: 'yasuo', name: 'Yasuo Ronin Lunaire', bodyColor: '#274b96', detailColor: '#12284f', weaponColor: '#63b3ed', unlockCondition: { type: 'shop', cost: 50 } },

  // ── Lux ──
  { id: 'lux_cosmic', championId: 'lux', name: 'Lux Cosmique', bodyColor: '#553399', detailColor: '#44227a', weaponColor: '#ffdd88', unlockCondition: { type: 'shop', cost: 35 } },
  { id: 'lux_ice', championId: 'lux', name: 'Lux Reine de Glace', bodyColor: '#8fd3ff', detailColor: '#4da3d9', weaponColor: '#e8faff', unlockCondition: { type: 'shop', cost: 20 } },

  // ── Zed ──
  { id: 'zed_galaxy', championId: 'zed', name: 'Zed Galaxie', bodyColor: '#0d0221', detailColor: '#1a0533', weaponColor: '#cc44ff', unlockCondition: { type: 'shop', cost: 50 } },

  // ── Ahri ──
  { id: 'ahri_spirit', championId: 'ahri', name: 'Ahri Reine Astrale', bodyColor: '#8a63ff', detailColor: '#4f2fbf', weaponColor: '#6ec8ff', unlockCondition: { type: 'shop', cost: 30 } },

  // ── Darius ──
  { id: 'darius_frozen', championId: 'darius', name: 'Darius Exécuteur Sanguin', bodyColor: '#7a1010', detailColor: '#2a0505', weaponColor: '#ff4a4a', unlockCondition: { type: 'shop', cost: 25 } },

  // ── Katarina ──
  { id: 'katarina_jade', championId: 'katarina', name: 'Katarina Reine Cendre', bodyColor: '#3a3a3a', detailColor: '#1f1f1f', weaponColor: '#ff7a2f', unlockCondition: { type: 'shop', cost: 40 } },

  // ── Ezreal ──
  { id: 'ezreal_arcade', championId: 'ezreal', name: 'Ezreal Voyageur Temporel', bodyColor: '#2b4fa3', detailColor: '#1e2a4a', weaponColor: '#63c7ff', unlockCondition: { type: 'shop', cost: 30 } },

  // ── Thresh ──
  { id: 'thresh_deep', championId: 'thresh', name: 'Thresh Geôlier Spectral Royal', bodyColor: '#19c29b', detailColor: '#0f5e4e', weaponColor: '#7df7d6', unlockCondition: { type: 'shop', cost: 35 } },

  // ── Teemo ──
  { id: 'teemo_devil', championId: 'teemo', name: 'Teemo Capitaine Toxic', bodyColor: '#5da13a', detailColor: '#2d4b1f', weaponColor: '#9ef542', unlockCondition: { type: 'shop', cost: 20 } },
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
