import { GameState, Slot, UnitConfig } from './types';
import { EnemyManager } from './managers/EnemyManager';
import { TowerManager } from './managers/TowerManager';
import { WaveManager } from './managers/WaveManager';
import { INITIAL_SLOTS } from './data/mapData';
import { TOTAL_WAVES } from './data/waveData';
import { getUpgradeCost } from './data/unitData';

export class GameEngine {
  enemyManager = new EnemyManager();
  towerManager = new TowerManager();
  waveManager = new WaveManager();
  
  state: GameState = {
    gold: 200,
    baseHp: 20,
    maxBaseHp: 20,
    currentWave: 0,
    waveActive: false,
    enemies: [],
    placedUnits: [],
    projectiles: [],
    slots: INITIAL_SLOTS.map(s => ({ ...s })),
    selectedSlotIndex: null,
    selectedUnitId: null,
    gameOver: false,
    victory: false,
    score: 0,
    enemiesSpawned: 0,
    enemiesKilled: 0,
    totalWaves: TOTAL_WAVES,
  };

  update(dt: number): void {
    if (this.state.gameOver || this.state.victory) return;

    // Update wave spawning
    this.waveManager.update(dt, this.enemyManager);

    // Update enemies
    const { reachedEnd } = this.enemyManager.update(dt);
    for (const enemy of reachedEnd) {
      this.state.baseHp--;
      if (this.state.baseHp <= 0) {
        this.state.gameOver = true;
        return;
      }
    }

    // Update towers & projectiles
    const { damages } = this.towerManager.update(dt, this.enemyManager.getAliveEnemies());
    for (const { enemyId, damage } of damages) {
      const result = this.enemyManager.damageEnemy(enemyId, damage);
      if (result.killed) {
        this.state.gold += result.reward;
        this.state.score += result.reward;
        this.state.enemiesKilled++;
      }
    }

    // Sync state
    this.state.enemies = this.enemyManager.enemies;
    this.state.placedUnits = this.towerManager.units;
    this.state.projectiles = this.towerManager.projectiles;
    this.state.currentWave = this.waveManager.currentWave;
    this.state.waveActive = this.waveManager.waveActive;

    // Check victory
    if (this.waveManager.isComplete()) {
      this.state.victory = true;
    }
  }

  startWave(): boolean {
    if (this.state.waveActive || this.state.gameOver || this.state.victory) return false;
    const config = this.waveManager.startWave();
    if (!config) return false;
    this.state.waveActive = true;
    return true;
  }

  placeUnit(slotIndex: number, config: UnitConfig): boolean {
    const slot = this.state.slots[slotIndex];
    if (!slot || slot.unitId !== null) return false;
    if (this.state.gold < config.cost) return false;

    this.state.gold -= config.cost;
    const unit = this.towerManager.placeUnit(config, slot, slotIndex);
    slot.unitId = unit.id;
    this.state.selectedSlotIndex = null;
    return true;
  }

  removeUnit(slotIndex: number): void {
    const slot = this.state.slots[slotIndex];
    if (!slot || slot.unitId === null) return;
    if (this.state.waveActive) return; // Can only remove between waves

    this.towerManager.removeUnit(slot.unitId);
    // Refund half cost
    const unit = this.towerManager.units.find(u => u.id === slot.unitId);
    slot.unitId = null;
  }

  upgradeUnit(unitId: number): boolean {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (!unit) return false;
    
    const cost = getUpgradeCost(unit);
    if (this.state.gold < cost) return false;

    this.state.gold -= cost;
    this.towerManager.upgradeUnit(unitId);
    return true;
  }

  selectSlot(index: number): void {
    if (this.state.selectedSlotIndex === index) {
      this.state.selectedSlotIndex = null;
    } else {
      this.state.selectedSlotIndex = index;
    }
    this.state.selectedUnitId = null;
  }

  selectPlacedUnit(unitId: number): void {
    if (this.state.selectedUnitId === unitId) {
      this.state.selectedUnitId = null;
    } else {
      this.state.selectedUnitId = unitId;
    }
    this.state.selectedSlotIndex = null;
  }

  setTargetPriority(unitId: number, priority: 'closest' | 'weakest' | 'most_advanced'): void {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (unit) unit.targetPriority = priority;
  }

  restart(): void {
    this.enemyManager.clear();
    this.towerManager.clear();
    this.waveManager = new WaveManager();
    this.state = {
      gold: 200,
      baseHp: 20,
      maxBaseHp: 20,
      currentWave: 0,
      waveActive: false,
      enemies: [],
      placedUnits: [],
      projectiles: [],
      slots: INITIAL_SLOTS.map(s => ({ ...s })),
      selectedSlotIndex: null,
      selectedUnitId: null,
      gameOver: false,
      victory: false,
      score: 0,
      enemiesSpawned: 0,
      enemiesKilled: 0,
      totalWaves: TOTAL_WAVES,
    };
  }
}
