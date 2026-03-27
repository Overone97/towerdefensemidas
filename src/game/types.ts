export interface Point { x: number; y: number; }

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type AttackPattern = 'single' | 'rapid' | 'aoe_circle' | 'line' | 'poison' | 'poison_trail' | 'mushroom' | 'slow' | 'chain' | 'burst';
export type TargetPriority = 'closest' | 'weakest' | 'most_advanced';

export interface SynergyBonus {
  attackMult?: number;
  speedMult?: number;
  rangeMult?: number;
  extraHp?: number;
  dotMult?: number;
  slowMult?: number;
}

export interface ActiveSynergy {
  name: string;
  description: string;
  bonus: SynergyBonus;
}

export interface StatusEffect {
  type: 'poison' | 'slow' | 'burn';
  damagePerSecond: number;
  duration: number;
  slowFactor: number;
  sourceUnitId?: number;
}

export type EnemyType = 'normal' | 'fast' | 'tank' | 'armored' | 'dragon_fire' | 'dragon_ice' | 'dragon_earth' | 'dragon_air' | 'boss' | 'healer' | 'stealth' | 'splitter' | 'void_empress' | 'ice_witch' | 'noxian_grand_general';

export type WaveModifier = 'rush' | 'tank_parade' | 'speed_blitz' | 'healing_wave' | 'dark_wave' | null;

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  reward: number;
  size: number;
  armor?: number;           // flat damage reduction
  poisonResist?: boolean;   // immune to poison
  slowResist?: number;      // 0-1, reduces slow effectiveness
  bodyColor: string;
  strokeColor: string;
  label?: string;
}

export interface CharacterConfig {
  id: string;
  name: string;
  rarity: Rarity;
  attack: number;
  attackSpeed: number;
  range: number;
  attackPattern: AttackPattern;
  aoeRadius?: number;
  dotDamage?: number;
  dotDuration?: number;
  slowFactor?: number;
  slowDuration?: number;
  chainCount?: number;
  burstCount?: number;
  bodyColor: string;
  detailColor: string;
  weaponColor: string;
  canRevealStealth?: boolean;
}

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  spawnInterval: number;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  enemyRewardMultiplier: number;
  modifier?: WaveModifier;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  reward: number;
  size: number;
  armor: number;
  poisonResist: boolean;
  slowResist: number;
  bodyColor: string;
  strokeColor: string;
  waypointIndex: number;
  progress: number;
  alive: boolean;
  statusEffects: StatusEffect[];
  animFrame: number;
  stealthed?: boolean;
  shieldHp?: number;
  shieldMaxHp?: number;
  shieldRegenTimer?: number;
  bossAbilityCooldown?: number;
  hasDashed?: boolean;
  healAuraTimer?: number;
}

export interface EquippedItems {
  weapon?: string;   // equipment id
  armor?: string;
  accessory?: string;
}

export interface OwnedCharacter {
  instanceId: number;
  config: CharacterConfig;
  level: number;
  equipment: EquippedItems;
  stars: number; // 1★ → 2★ → 3★ merge evolution
}

export interface PlacedUnit {
  id: number;
  characterInstanceId: number;
  config: CharacterConfig;
  slotIndex: number;
  x: number;
  y: number;
  level: number;
  stars: number;
  attackCooldown: number;
  targetId: number | null;
  targetPriority: TargetPriority;
  animFrame: number;
  isAttacking: boolean;
  attackAnimTimer: number;
  abilityCooldown: number;
  abilityActive: boolean;
  abilityTimer: number;
  // Singed roaming
  homeX?: number;
  homeY?: number;
  roamTargetX?: number;
  roamTargetY?: number;
  lastCloudTime?: number;
}

export interface GroundEffect {
  id: number;
  type: 'poison_cloud' | 'mushroom';
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  damagePerSecond: number;
  slowFactor?: number;
  slowDuration?: number;
  aoeRadius?: number; // mushroom explosion radius
  explosionDamage?: number;
  exploded?: boolean;
  alive: boolean;
  color: string;
  sourceUnitId?: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  targetId: number;
  alive: boolean;
  pierce?: boolean;
  hitEnemies?: number[];
  aoeRadius?: number;
  appliesPoison?: { damage: number; duration: number };
  appliesSlow?: { factor: number; duration: number };
  projectileType?: 'default' | 'sivir_boomerang';
  bouncesRemaining?: number;
  bounceRange?: number;
  hitEnemyIds?: number[];
  rotation?: number;
  sourceUnitId?: number;
}

export interface Slot {
  x: number;
  y: number;
  unitId: number | null;
}

export interface AoeWaveState {
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  weaponColor: string;
  alive: boolean;
}

export interface MidrunChoice {
  id: string;
  title: string;
  description: string;
}

export interface CharacterUnlockProgress {
  championId: string;
  order: number;
  shardCost: number;
  requiredStars: number;
  requiredMapsCompleted: number;
  unlocked: boolean;
  isNext: boolean;
  canUnlock: boolean;
}

export interface GameState {
  gold: number;
  baseHp: number;
  maxBaseHp: number;
  currentWave: number;
  waveActive: boolean;
  enemies: Enemy[];
  placedUnits: PlacedUnit[];
  projectiles: Projectile[];
  aoeWaves: AoeWaveState[];
  groundEffects: GroundEffect[];
  slots: Slot[];
  selectedSlotIndex: number | null;
  selectedUnitId: number | null;
  gameOver: boolean;
  victory: boolean;
  score: number;
  enemiesSpawned: number;
  enemiesKilled: number;
  totalWaves: number;
  inventory: OwnedCharacter[];
  gachaCost: number;
  totalSummons: number;
  unlockShards: number;
  activeTab: 'game' | 'progress';
  activeSynergies: ActiveSynergy[];
  stars: number;
  currentMapId: string;
  equipmentInventory: string[];
  lastDrop: string | null;
  autoWave: boolean;
  endlessMode: boolean;
  waveEnemiesSpawned: number;
  waveEnemiesTotal: number;
  waveEnemiesKilledThisWave: number;
  gameSpeed: number;
  waveModifier?: WaveModifier;
  ascensionWeather?: 'void' | 'freljord' | 'noxus';
  ascensionEventLabel?: string | null;
  ascensionEventTimer?: number;
  ascensionCinematicTitle?: string | null;
  ascensionCinematicTimer?: number;
}
