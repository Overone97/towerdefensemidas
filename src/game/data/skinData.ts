export interface SkinUnlockCondition {
  type: 'prestige' | 'dungeon' | 'achievement' | 'endless_wave' | 'free';
  /** For prestige: min level. For dungeon: dungeon id. For achievement: achievement id. For endless_wave: min wave. */
  value?: string | number;
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
  { id: 'garen_steel', championId: 'garen', name: 'Garen Acier', bodyColor: '#4a5568', detailColor: '#2d3748', weaponColor: '#e2e8f0', unlockCondition: { type: 'free' } },
  { id: 'garen_infernal', championId: 'garen', name: 'Garen Infernal', bodyColor: '#9b2c2c', detailColor: '#742a2a', weaponColor: '#feb2b2', unlockCondition: { type: 'dungeon', value: 'dungeon_blitz' } },

  // ── Jinx ──
  { id: 'jinx_neon', championId: 'jinx', name: 'Jinx Néon', bodyColor: '#00ffcc', detailColor: '#00cc99', weaponColor: '#ff00ff', unlockCondition: { type: 'prestige', value: 1 } },
  { id: 'jinx_dark', championId: 'jinx', name: 'Jinx Ombre', bodyColor: '#1a1a2e', detailColor: '#16213e', weaponColor: '#e94560', unlockCondition: { type: 'endless_wave', value: 30 } },

  // ── Yasuo ──
  { id: 'yasuo_storm', championId: 'yasuo', name: 'Yasuo Tempête', bodyColor: '#1e3a5f', detailColor: '#0f2b46', weaponColor: '#63b3ed', unlockCondition: { type: 'achievement', value: 'ach_wave50' } },
  { id: 'yasuo_blood', championId: 'yasuo', name: 'Yasuo Sang', bodyColor: '#6b0000', detailColor: '#4a0000', weaponColor: '#ff4444', unlockCondition: { type: 'dungeon', value: 'dungeon_darkness' } },

  // ── Lux ──
  { id: 'lux_cosmic', championId: 'lux', name: 'Lux Cosmique', bodyColor: '#553399', detailColor: '#44227a', weaponColor: '#ffdd88', unlockCondition: { type: 'prestige', value: 2 } },
  { id: 'lux_ice', championId: 'lux', name: 'Lux Givrée', bodyColor: '#bee3f8', detailColor: '#90cdf4', weaponColor: '#ffffff', unlockCondition: { type: 'dungeon', value: 'dungeon_naked' } },

  // ── Zed ──
  { id: 'zed_galaxy', championId: 'zed', name: 'Zed Galaxie', bodyColor: '#0d0221', detailColor: '#1a0533', weaponColor: '#cc44ff', unlockCondition: { type: 'endless_wave', value: 50 } },

  // ── Ahri ──
  { id: 'ahri_spirit', championId: 'ahri', name: 'Ahri Spirituelle', bodyColor: '#e6ccff', detailColor: '#d4aaff', weaponColor: '#9955ff', unlockCondition: { type: 'achievement', value: 'ach_kill1000' } },

  // ── Darius ──
  { id: 'darius_frozen', championId: 'darius', name: 'Darius Givré', bodyColor: '#4299e1', detailColor: '#2b6cb0', weaponColor: '#bee3f8', unlockCondition: { type: 'dungeon', value: 'dungeon_tank_rush' } },

  // ── Katarina ──
  { id: 'katarina_jade', championId: 'katarina', name: 'Katarina Jade', bodyColor: '#276749', detailColor: '#22543d', weaponColor: '#68d391', unlockCondition: { type: 'prestige', value: 3 } },

  // ── Ezreal ──
  { id: 'ezreal_arcade', championId: 'ezreal', name: 'Ezreal Arcade', bodyColor: '#ff6699', detailColor: '#ff3366', weaponColor: '#ffff00', unlockCondition: { type: 'achievement', value: 'ach_summon100' } },

  // ── Thresh ──
  { id: 'thresh_deep', championId: 'thresh', name: 'Thresh Abyssal', bodyColor: '#0a3d62', detailColor: '#082032', weaponColor: '#00e6e6', unlockCondition: { type: 'dungeon', value: 'dungeon_minimalist' } },

  // ── Teemo ──
  { id: 'teemo_devil', championId: 'teemo', name: 'Teemo Diable', bodyColor: '#cc0000', detailColor: '#990000', weaponColor: '#ff6600', unlockCondition: { type: 'dungeon', value: 'dungeon_rookies' } },
];

export function getSkinsForChampion(championId: string): SkinDef[] {
  return ALL_SKINS.filter(s => s.championId === championId);
}

export function getSkinById(skinId: string): SkinDef | undefined {
  return ALL_SKINS.find(s => s.id === skinId);
}

export function checkSkinUnlock(skin: SkinDef, context: {
  prestigeLevel: number;
  dungeonCompletions: Record<string, string>;
  achievementsUnlocked: string[];
  maxWaveReached: number;
}): boolean {
  const cond = skin.unlockCondition;
  switch (cond.type) {
    case 'free': return true;
    case 'prestige': return context.prestigeLevel >= (cond.value as number);
    case 'dungeon': return !!(context.dungeonCompletions[cond.value as string]);
    case 'achievement': return context.achievementsUnlocked.includes(cond.value as string);
    case 'endless_wave': return context.maxWaveReached >= (cond.value as number);
    default: return false;
  }
}

export function getUnlockDescription(skin: SkinDef): string {
  const cond = skin.unlockCondition;
  switch (cond.type) {
    case 'free': return 'Gratuit';
    case 'prestige': return `Prestige ${cond.value}`;
    case 'dungeon': return `Compléter le donjon`;
    case 'achievement': return `Débloquer un succès`;
    case 'endless_wave': return `Atteindre vague ${cond.value} (Endless)`;
    default: return '???';
  }
}
