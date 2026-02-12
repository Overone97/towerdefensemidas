// Core types for the Tower Defense game

export interface Point {
  x: number;
  y: number;
}

export interface EnemyConfig {
  hp: number;
  speed: number;
  reward: number;
  size: number;
}

export interface UnitConfig {
  id: string;
  name: string;
  attack: number;
  attackSpeed: number; // attacks per second
  range: number;
  cost: number;
  attackType: 'projectile' | 'instant';
  color: string;
  size: number;
}

export interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  spawnInterval: number; // ms between spawns
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  enemyRewardMultiplier: number;
}

export type TargetPriority = 'closest' | 'weakest' | 'most_advanced';

export interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  size: number;
  waypointIndex: number;
  progress: number; // 0-1 between current and next waypoint
  alive: boolean;
}

export interface PlacedUnit {
  id: number;
  config: UnitConfig;
  slotIndex: number;
  x: number;
  y: number;
  level: number;
  attackCooldown: number;
  targetId: number | null;
  targetPriority: TargetPriority;
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
}

export interface Slot {
  x: number;
  y: number;
  unitId: number | null;
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
  slots: Slot[];
  selectedSlotIndex: number | null;
  selectedUnitId: number | null;
  gameOver: boolean;
  victory: boolean;
  score: number;
  enemiesSpawned: number;
  enemiesKilled: number;
  totalWaves: number;
}
