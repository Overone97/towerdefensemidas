import { Point, Slot, WaveConfig, EnemyType } from '../types';

// ─── ARAM Map (single lane — Howling Abyss) ───
export const ARAM_MAP = {
  id: 'aram',
  name: 'Howling Abyss',
  waypoints: [
    { x: 0, y: 250 },
    { x: 120, y: 250 },
    { x: 200, y: 150 },
    { x: 350, y: 150 },
    { x: 400, y: 250 },
    { x: 550, y: 250 },
    { x: 600, y: 350 },
    { x: 770, y: 350 },
  ] as Point[],
  slots: [
    { x: 160, y: 200, unitId: null },
    { x: 270, y: 100, unitId: null },
    { x: 370, y: 200, unitId: null },
    { x: 480, y: 200, unitId: null },
    { x: 575, y: 300, unitId: null },
    { x: 680, y: 300, unitId: null },
    // Extra slots unlockable via augment
    { x: 160, y: 300, unitId: null },
    { x: 480, y: 300, unitId: null },
  ] as Slot[],
  bgColor: '#0a0e1a',
  pathColor: '#3a5a8a',
};

// ─── Augmentation System ───
export type AugmentRarity = 'common' | 'rare' | 'legendary';
export type AugmentCategory = 'offensive' | 'economy' | 'defense' | 'summon' | 'chaos' | 'champion';

export interface Augmentation {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AugmentCategory;
  rarity: AugmentRarity;
  effect: AugmentEffect;
}

export interface AugmentEffect {
  attackMult?: number;
  attackSpeedMult?: number;
  rangeMult?: number;
  goldMult?: number;
  bonusGoldPerWave?: number;
  baseHpBonus?: number;
  slowOnHit?: number;
  critChance?: number;
  critDamage?: number;
  enemySpeedMult?: number;
  enemyHpMult?: number;
  meteorInterval?: number;
  meteorDamage?: number;
  allySpawnKills?: number;
  miniTurrets?: number;
  towerHpMult?: number;
  doubleShot?: boolean;
  pierceChance?: number;
  extraSlots?: number;       // unlock extra placement slots
  levelUpAll?: number;       // level up all placed units
  extraReroll?: boolean;     // grant extra draft reroll
}

export const ALL_AUGMENTS: Augmentation[] = [
  // ── CHAMPION-FOCUSED (new category) ──
  { id: 'power_spike', name: 'Power Spike', description: 'Tous les champions gagnent +2 niveaux', icon: '⬆️', category: 'champion', rarity: 'rare',
    effect: { levelUpAll: 2 } },
  { id: 'hyper_growth', name: 'Hyper Growth', description: 'Tous les champions gagnent +4 niveaux', icon: '🚀', category: 'champion', rarity: 'legendary',
    effect: { levelUpAll: 4 } },
  { id: 'berserker', name: 'Berserker', description: '+60% vitesse d\'attaque pour tous', icon: '⚡', category: 'champion', rarity: 'rare',
    effect: { attackSpeedMult: 1.6 } },
  { id: 'warlord', name: 'Warlord', description: '+40% dégâts, +20% vitesse attaque', icon: '⚔️', category: 'champion', rarity: 'rare',
    effect: { attackMult: 1.4, attackSpeedMult: 1.2 } },
  { id: 'sniper_scope', name: 'Sniper Scope', description: '+50% portée de tous les champions', icon: '🔭', category: 'champion', rarity: 'rare',
    effect: { rangeMult: 1.5 } },
  { id: 'extra_slot', name: 'Reinforcements', description: '+2 emplacements de déploiement', icon: '📍', category: 'champion', rarity: 'rare',
    effect: { extraSlots: 2 } },

  // ── OFFENSIVE ──
  { id: 'double_shot', name: 'Double Shot', description: 'Les tours tirent 2 projectiles', icon: '🎯', category: 'offensive', rarity: 'rare',
    effect: { doubleShot: true } },
  { id: 'rapid_fire', name: 'Rapid Fire', description: '+40% vitesse d\'attaque', icon: '⚡', category: 'offensive', rarity: 'common',
    effect: { attackSpeedMult: 1.4 } },
  { id: 'critical_strike', name: 'Critical Strike', description: '20% de chance de dégâts doubles', icon: '💥', category: 'offensive', rarity: 'common',
    effect: { critChance: 0.2, critDamage: 2.0 } },
  { id: 'sharpshooter', name: 'Sharpshooter', description: '+25% portée, +15% dégâts', icon: '🏹', category: 'offensive', rarity: 'common',
    effect: { rangeMult: 1.25, attackMult: 1.15 } },
  { id: 'fury', name: 'Fury', description: '+50% dégâts d\'attaque', icon: '🔥', category: 'offensive', rarity: 'rare',
    effect: { attackMult: 1.5 } },
  { id: 'piercing', name: 'Piercing Shots', description: '30% de chance de percer les ennemis', icon: '🗡️', category: 'offensive', rarity: 'rare',
    effect: { pierceChance: 0.3 } },

  // ── ECONOMY (reduced) ──
  { id: 'golden_harvest', name: 'Golden Harvest', description: '+50% or des ennemis', icon: '💰', category: 'economy', rarity: 'common',
    effect: { goldMult: 1.5 } },

  // ── DEFENSE ──
  { id: 'reinforced', name: 'Reinforced Walls', description: '+5 HP de base', icon: '🏰', category: 'defense', rarity: 'common',
    effect: { baseHpBonus: 5 } },
  { id: 'ice_ammo', name: 'Ice Ammo', description: 'Attaques ralentissent de 20%', icon: '❄️', category: 'defense', rarity: 'common',
    effect: { slowOnHit: 0.2 } },
  { id: 'fortress', name: 'Fortress', description: '+10 HP de base, ennemis +10% HP', icon: '🛡️', category: 'defense', rarity: 'rare',
    effect: { baseHpBonus: 10, enemyHpMult: 1.1 } },

  // ── SUMMON ──
  { id: 'phantom_soldiers', name: 'Phantom Soldiers', description: 'Tous les 10 kills, un allié temporaire apparaît', icon: '👻', category: 'summon', rarity: 'rare',
    effect: { allySpawnKills: 10 } },
  { id: 'mini_turrets', name: 'Mini Turrets', description: '+2 tourelles automatiques sur le chemin', icon: '🗼', category: 'summon', rarity: 'rare',
    effect: { miniTurrets: 2 } },

  // ── CHAOS (legendary) ──
  { id: 'glass_cannon', name: 'Glass Cannon', description: '+80% dégâts, -40% HP base', icon: '💎', category: 'chaos', rarity: 'legendary',
    effect: { attackMult: 1.8, baseHpBonus: -8 } },
  { id: 'frenzy_mode', name: 'Frenzy Mode', description: '+50% vitesse attaque, ennemis +30% vitesse', icon: '🌀', category: 'chaos', rarity: 'legendary',
    effect: { attackSpeedMult: 1.5, enemySpeedMult: 1.3 } },
  { id: 'meteor_rain', name: 'Meteor Rain', description: 'Météores frappent les ennemis toutes les 8s', icon: '☄️', category: 'chaos', rarity: 'legendary',
    effect: { meteorInterval: 8, meteorDamage: 150 } },
  { id: 'dark_pact', name: 'Dark Pact', description: '+100% dégâts, -5 HP base, ennemis +20% vitesse', icon: '🌑', category: 'chaos', rarity: 'legendary',
    effect: { attackMult: 2.0, baseHpBonus: -5, enemySpeedMult: 1.2 } },
];

// ─── Random Events ───
export interface AramEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  effect: {
    enemyStealth?: boolean;
    enemySpeedMult?: number;
    goldMult?: number;
    spawnRateMult?: number;
  };
}

export const ARAM_EVENTS: AramEvent[] = [
  { id: 'dark_fog', name: 'Dark Fog', description: 'Ennemis invisibles pendant 5s', icon: '🌫️', duration: 5,
    effect: { enemyStealth: true } },
  { id: 'gold_rush', name: 'Gold Rush', description: 'Or x3 pendant 15s', icon: '💎', duration: 15,
    effect: { goldMult: 3 } },
  { id: 'stampede', name: 'Stampede', description: 'Ennemis x2 vitesse pendant 8s', icon: '🐂', duration: 8,
    effect: { enemySpeedMult: 2 } },
  { id: 'calm', name: 'Calm Before Storm', description: 'Ennemis ralentis 50% pendant 10s', icon: '🕊️', duration: 10,
    effect: { enemySpeedMult: 0.5 } },
];

// ─── Wave Generation ───
export function getAramWaveConfig(wave: number, augEffects: AugmentEffect): WaveConfig {
  const scaleFactor = 1 + (wave - 1) * 0.25;
  const hpMult = scaleFactor * 1.2 * (augEffects.enemyHpMult || 1);
  const speedMult = (1 + (wave - 1) * 0.02) * (augEffects.enemySpeedMult || 1);
  const enemyCount = Math.min(80, 6 + Math.floor(wave * 1.2));
  const spawnInterval = Math.max(150, 800 - wave * 15);

  return {
    waveNumber: wave,
    enemyCount,
    spawnInterval,
    enemyHpMultiplier: hpMult,
    enemySpeedMultiplier: speedMult,
    enemyRewardMultiplier: 1 + (wave - 1) * 0.12,
    modifier: null,
  };
}

export function getAramEnemyPool(wave: number): { type: EnemyType; weight: number }[] {
  const pool: { type: EnemyType; weight: number }[] = [{ type: 'normal', weight: 10 }];
  if (wave >= 3) pool.push({ type: 'fast', weight: 4 });
  if (wave >= 6) pool.push({ type: 'tank', weight: 3 });
  if (wave >= 9) pool.push({ type: 'armored', weight: 2 });
  if (wave >= 12) pool.push({ type: 'healer', weight: 2 });
  if (wave >= 15) pool.push({ type: 'stealth', weight: 2 });
  if (wave >= 18) pool.push({ type: 'splitter', weight: 2 });
  if (wave >= 15) pool[0].weight = 6;
  if (wave >= 25) pool[0].weight = 3;
  return pool;
}

export function isAramBossWave(wave: number): boolean {
  return wave % 10 === 0;
}

export function getAramBossType(wave: number): EnemyType {
  const bosses: EnemyType[] = ['dragon_fire', 'dragon_ice', 'dragon_earth', 'dragon_air', 'boss'];
  return bosses[Math.floor((wave / 10 - 1) % bosses.length)];
}

/** Roll 3 random augmentations (weighted by rarity, champion-focused more likely) */
export function rollAugments(owned: string[]): Augmentation[] {
  const available = ALL_AUGMENTS.filter(a => !owned.includes(a.id));
  if (available.length < 3) return available.length > 0 ? available : ALL_AUGMENTS.slice(0, 3);

  // Weight: champion 50%, common 30%, rare 15%, legendary 5%
  const weighted: { aug: Augmentation; w: number }[] = available.map(a => ({
    aug: a,
    w: a.category === 'champion' ? 50 : a.rarity === 'common' ? 30 : a.rarity === 'rare' ? 15 : 5,
  }));

  const picked: Augmentation[] = [];
  const pool = [...weighted];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const total = pool.reduce((s, e) => s + e.w, 0);
    let roll = Math.random() * total;
    for (let j = 0; j < pool.length; j++) {
      roll -= pool[j].w;
      if (roll <= 0) {
        picked.push(pool[j].aug);
        pool.splice(j, 1);
        break;
      }
    }
  }
  return picked;
}

/** Combine stacked augment effects into a single composite effect */
export function combineAugmentEffects(augIds: string[]): AugmentEffect {
  const combined: AugmentEffect = {};
  for (const id of augIds) {
    const aug = ALL_AUGMENTS.find(a => a.id === id);
    if (!aug) continue;
    const e = aug.effect;
    // Multiplicative stacking
    if (e.attackMult) combined.attackMult = (combined.attackMult || 1) * e.attackMult;
    if (e.attackSpeedMult) combined.attackSpeedMult = (combined.attackSpeedMult || 1) * e.attackSpeedMult;
    if (e.rangeMult) combined.rangeMult = (combined.rangeMult || 1) * e.rangeMult;
    if (e.goldMult) combined.goldMult = (combined.goldMult || 1) * e.goldMult;
    if (e.enemySpeedMult) combined.enemySpeedMult = (combined.enemySpeedMult || 1) * e.enemySpeedMult;
    if (e.enemyHpMult) combined.enemyHpMult = (combined.enemyHpMult || 1) * e.enemyHpMult;
    // Additive stacking
    if (e.bonusGoldPerWave) combined.bonusGoldPerWave = (combined.bonusGoldPerWave || 0) + e.bonusGoldPerWave;
    if (e.baseHpBonus) combined.baseHpBonus = (combined.baseHpBonus || 0) + e.baseHpBonus;
    if (e.meteorDamage) { combined.meteorDamage = (combined.meteorDamage || 0) + e.meteorDamage; combined.meteorInterval = e.meteorInterval || combined.meteorInterval; }
    if (e.miniTurrets) combined.miniTurrets = (combined.miniTurrets || 0) + e.miniTurrets;
    if (e.extraSlots) combined.extraSlots = (combined.extraSlots || 0) + e.extraSlots;
    if (e.levelUpAll) combined.levelUpAll = (combined.levelUpAll || 0) + e.levelUpAll;
    // Max stacking
    if (e.critChance) combined.critChance = Math.min(0.8, (combined.critChance || 0) + e.critChance);
    if (e.critDamage) combined.critDamage = Math.max(combined.critDamage || 1, e.critDamage);
    if (e.slowOnHit) combined.slowOnHit = Math.min(0.6, (combined.slowOnHit || 0) + e.slowOnHit);
    if (e.pierceChance) combined.pierceChance = Math.min(0.8, (combined.pierceChance || 0) + e.pierceChance);
    if (e.allySpawnKills) combined.allySpawnKills = e.allySpawnKills;
    if (e.doubleShot) combined.doubleShot = true;
    if (e.extraReroll) combined.extraReroll = true;
  }
  return combined;
}

/** Duo synergy bonuses */
export const DUO_BONUSES = {
  attackMult: 1.1,
  goldMult: 1.15,
  baseHpBonus: 5,
};
