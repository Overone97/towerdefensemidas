import { GameState, OwnedCharacter } from './types';
import { EnemyManager } from './managers/EnemyManager';
import { TowerManager } from './managers/TowerManager';
import { WaveManager } from './managers/WaveManager';
import { INITIAL_SLOTS } from './data/mapData';
import { TOTAL_WAVES } from './data/waveData';
import { ALL_CHARACTERS, getCharacterUpgradeCost } from './data/characterData';
import { getGachaCost, rollRarity } from './data/gachaData';

let nextInstanceId = 1;

export class GameEngine {
  enemyManager = new EnemyManager();
  towerManager = new TowerManager();
  waveManager = new WaveManager();

  state: GameState = this.createInitialState();

  private createInitialState(): GameState {
    return {
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
      inventory: [],
      gachaCost: getGachaCost(0),
      totalSummons: 0,
      activeTab: 'game',
    };
  }

  update(dt: number): void {
    if (this.state.gameOver || this.state.victory) return;

    this.waveManager.update(dt, this.enemyManager);

    const { reachedEnd } = this.enemyManager.update(dt);
    for (const enemy of reachedEnd) {
      this.state.baseHp--;
      if (this.state.baseHp <= 0) {
        this.state.gameOver = true;
        return;
      }
    }

    const { damages, statusEffects } = this.towerManager.update(dt, this.enemyManager.getAliveEnemies());

    for (const { enemyId, effect } of statusEffects) {
      this.enemyManager.applyStatusEffect(enemyId, effect);
    }

    for (const { enemyId, damage } of damages) {
      const result = this.enemyManager.damageEnemy(enemyId, damage);
      if (result.killed) {
        this.state.gold += result.reward;
        this.state.score += result.reward;
        this.state.enemiesKilled++;
      }
    }

    this.state.enemies = this.enemyManager.enemies;
    this.state.placedUnits = this.towerManager.units;
    this.state.projectiles = this.towerManager.projectiles;
    this.state.currentWave = this.waveManager.currentWave;
    this.state.waveActive = this.waveManager.waveActive;

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

  summonCharacter(): OwnedCharacter | null {
    const cost = this.state.gachaCost;
    if (this.state.gold < cost) return null;

    const ownedIds = new Set(this.state.inventory.map(c => c.config.id));
    const available = ALL_CHARACTERS.filter(c => !ownedIds.has(c.id));
    if (available.length === 0) return null;

    this.state.gold -= cost;
    this.state.totalSummons++;
    this.state.gachaCost = getGachaCost(this.state.totalSummons);

    const rarity = rollRarity();
    let pool = available.filter(c => c.rarity === rarity);
    if (pool.length === 0) pool = available;

    const config = pool[Math.floor(Math.random() * pool.length)];
    const character: OwnedCharacter = {
      instanceId: nextInstanceId++,
      config,
      level: 1,
    };
    this.state.inventory.push(character);
    return character;
  }

  placeUnit(slotIndex: number, characterInstanceId: number): boolean {
    const slot = this.state.slots[slotIndex];
    if (!slot || slot.unitId !== null) return false;

    const character = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    if (!character) return false;

    const alreadyPlaced = this.towerManager.units.find(u => u.characterInstanceId === characterInstanceId);
    if (alreadyPlaced) return false;

    const unit = this.towerManager.placeUnit(character.config, slot, slotIndex, characterInstanceId, character.level);
    slot.unitId = unit.id;
    this.state.selectedSlotIndex = null;
    return true;
  }

  removeUnit(unitId: number): boolean {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (!unit) return false;

    const slot = this.state.slots[unit.slotIndex];
    if (slot) slot.unitId = null;

    this.towerManager.removeUnit(unitId);
    this.state.selectedUnitId = null;
    return true;
  }

  upgradeUnit(unitId: number): boolean {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (!unit) return false;

    const cost = getCharacterUpgradeCost(unit.config, unit.level);
    if (this.state.gold < cost) return false;

    this.state.gold -= cost;
    this.towerManager.upgradeUnit(unitId);

    const invChar = this.state.inventory.find(c => c.instanceId === unit.characterInstanceId);
    if (invChar) invChar.level = unit.level;

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

  setActiveTab(tab: 'game' | 'gacha'): void {
    this.state.activeTab = tab;
  }

  restart(): void {
    this.enemyManager.clear();
    this.towerManager.clear();
    this.waveManager = new WaveManager();
    nextInstanceId = 1;
    this.state = this.createInitialState();
  }
}
