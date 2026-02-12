import { GameState, OwnedCharacter, Point, Slot } from './types';
import { EnemyManager } from './managers/EnemyManager';
import { TowerManager } from './managers/TowerManager';
import { WaveManager } from './managers/WaveManager';
import { ParticleManager } from './managers/ParticleManager';
import { computeSynergies } from './managers/SynergyManager';
import { loadSave, writeSave, saveDataToInventory, inventoryToSaveData, SaveData } from './managers/SaveManager';
import { ACHIEVEMENTS, AchievementStats } from './data/achievementData';
import { getTalentBonus } from './data/talentData';
import { ALL_MAPS } from './data/allMaps';
import { TOTAL_WAVES } from './data/waveData';
import { ALL_CHARACTERS, getCharacterUpgradeCost } from './data/characterData';
import { getGachaCost, rollRarity } from './data/gachaData';
import { TALENTS } from './data/talentData';

let nextInstanceId = 1;

// Fish easter egg state (shared across renders)
export const fishState = {
  visible: false,
  x: 0,
  y: 0,
  timer: 0,
  nextAppear: 8 + Math.random() * 15,
  jumpPhase: 0,
  caught: false,
};

export class GameEngine {
  enemyManager = new EnemyManager();
  towerManager = new TowerManager();
  waveManager = new WaveManager();
  particleManager = new ParticleManager();

  private saveData: SaveData;
  state: GameState;

  constructor() {
    this.saveData = loadSave();
    this.state = this.createInitialState();
  }

  private getMap() {
    return ALL_MAPS.find(m => m.id === this.state.currentMapId) || ALL_MAPS[0];
  }

  getWaypoints(): Point[] {
    return this.getMap().waypoints;
  }

  private createInitialState(): GameState {
    const inventory = saveDataToInventory(this.saveData);
    if (inventory.length > 0) {
      nextInstanceId = Math.max(...inventory.map(c => c.instanceId)) + 1;
    }
    const talentBonus = getTalentBonus(this.saveData.talents);
    const map = ALL_MAPS.find(m => m.id === (this.saveData as any).currentMapId) || ALL_MAPS[0];

    this.enemyManager.setWaypoints(map.waypoints);

    return {
      gold: 200,
      baseHp: 20 + talentBonus.extraHp,
      maxBaseHp: 20 + talentBonus.extraHp,
      currentWave: 0,
      waveActive: false,
      enemies: [],
      placedUnits: [],
      projectiles: [],
      slots: map.slots.map(s => ({ ...s })),
      selectedSlotIndex: null,
      selectedUnitId: null,
      gameOver: false,
      victory: false,
      score: 0,
      enemiesSpawned: 0,
      enemiesKilled: 0,
      totalWaves: TOTAL_WAVES,
      inventory,
      gachaCost: Math.floor(getGachaCost(this.saveData.totalSummons) * talentBonus.summonDiscount),
      totalSummons: this.saveData.totalSummons,
      activeTab: 'game',
      activeSynergies: [],
      stars: this.saveData.stars,
      currentMapId: map.id,
      autoWave: false,
      endlessMode: false,
    };
  }

  update(dt: number): void {
    if (this.state.gameOver || this.state.victory) return;

    this.waveManager.update(dt, this.enemyManager);

    const talentBonus = getTalentBonus(this.saveData.talents);

    const { reachedEnd } = this.enemyManager.update(dt);
    for (const enemy of reachedEnd) {
      this.state.baseHp--;
      if (this.state.baseHp <= 0) {
        this.state.gameOver = true;
        if (this.state.endlessMode) {
          this.submitEndlessScore();
        }
        return;
      }
    }

    // Compute synergies
    const { activeSynergies, unitBonuses } = computeSynergies(this.towerManager.units);
    this.state.activeSynergies = activeSynergies;
    this.towerManager.synergyBonuses = unitBonuses;
    this.towerManager.talentBonus = talentBonus;

    const { damages, statusEffects } = this.towerManager.update(dt, this.enemyManager.getAliveEnemies());

    for (const { enemyId, effect } of statusEffects) {
      this.enemyManager.applyStatusEffect(enemyId, effect);
    }

    for (const { enemyId, damage } of damages) {
      // Find enemy before damaging to get position for particles
      const enemy = this.enemyManager.enemies.find(e => e.id === enemyId);
      const result = this.enemyManager.damageEnemy(enemyId, damage);
      if (result.killed && enemy) {
        const goldEarned = Math.floor(result.reward * talentBonus.goldMult);
        this.state.gold += goldEarned;
        this.state.score += result.reward;
        this.state.enemiesKilled++;
        // Track stats
        this.saveData.stats.totalKills++;
        this.saveData.stats.totalGold += goldEarned;
        if (enemy.type === 'boss') this.saveData.stats.bossKills++;
        // Death particles
        if (enemy.type === 'boss') {
          this.particleManager.spawnBossExplosion(enemy.x, enemy.y);
        } else {
          this.particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
        }
      }
    }

    // Projectile trails
    for (const proj of this.towerManager.projectiles) {
      if (proj.alive) {
        const trailColor = proj.appliesPoison ? '#44ff44' : proj.pierce ? '#88aaff' : '#ffdd44';
        this.particleManager.spawnProjectileTrail(proj.x, proj.y, trailColor);
      }
    }

    // Legendary unit auras
    for (const unit of this.towerManager.units) {
      if (unit.config.rarity === 'legendary' && Math.random() < 0.15) {
        this.particleManager.spawnLegendaryAura(unit.x, unit.y, unit.config.weaponColor);
      }
    }

    // Update particles
    this.particleManager.update(dt);

    this.state.enemies = this.enemyManager.enemies;
    this.state.placedUnits = this.towerManager.units;
    this.state.projectiles = this.towerManager.projectiles;
    this.state.currentWave = this.waveManager.currentWave;
    this.state.waveActive = this.waveManager.waveActive;

    // Track max wave
    if (this.state.currentWave > this.saveData.stats.maxWaveReached) {
      this.saveData.stats.maxWaveReached = this.state.currentWave;
    }

    // Auto-wave: start next wave when current ends
    if (!this.state.waveActive && this.state.autoWave && this.waveManager.currentWave < this.waveManager.totalWaves) {
      this.startWave();
    }

    if (this.waveManager.isComplete()) {
      this.state.victory = true;
      // Award stars on victory
      const starsEarned = 3;
      this.saveData.stars += starsEarned;
      this.state.stars = this.saveData.stars;
      if (!this.saveData.mapsCompleted.includes(this.state.currentMapId)) {
        this.saveData.mapsCompleted.push(this.state.currentMapId);
      }
      // Perfect map (no HP lost)
      if (this.state.baseHp === this.state.maxBaseHp) {
        this.saveData.stats.perfectMaps++;
      }
      this.persistSave();
    }

    // Check achievements
    this.checkAchievements();
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
    const available = ALL_CHARACTERS.filter(c => !ownedIds.has(c.id) && c.id !== 'leviathan');
    if (available.length === 0) return null;

    this.state.gold -= cost;
    this.state.totalSummons++;
    this.saveData.totalSummons = this.state.totalSummons;
    const talentBonus = getTalentBonus(this.saveData.talents);
    this.state.gachaCost = Math.floor(getGachaCost(this.state.totalSummons) * talentBonus.summonDiscount);

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
    this.persistSave();
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
    if (invChar) {
      invChar.level = unit.level;
      this.persistSave();
    }

    return true;
  }

  selectSlot(index: number): void {
    this.state.selectedSlotIndex = this.state.selectedSlotIndex === index ? null : index;
    this.state.selectedUnitId = null;
  }

  selectPlacedUnit(unitId: number): void {
    this.state.selectedUnitId = this.state.selectedUnitId === unitId ? null : unitId;
    this.state.selectedSlotIndex = null;
  }

  setTargetPriority(unitId: number, priority: 'closest' | 'weakest' | 'most_advanced'): void {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (unit) unit.targetPriority = priority;
  }

  setActiveTab(tab: 'game' | 'gacha'): void {
    this.state.activeTab = tab;
  }

  upgradeTalent(talentId: string): boolean {
    const def = TALENTS.find(t => t.id === talentId);
    if (!def) return false;
    const currentLevel = this.saveData.talents[talentId] || 0;
    if (currentLevel >= def.maxLevel) return false;
    if (this.saveData.stars < def.costPerLevel) return false;

    this.saveData.stars -= def.costPerLevel;
    this.saveData.talents[talentId] = currentLevel + 1;
    this.state.stars = this.saveData.stars;
    this.persistSave();
    return true;
  }

  getSaveData(): SaveData {
    return this.saveData;
  }

  setMap(mapId: string): void {
    this.state.currentMapId = mapId;
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
    this.restart();
  }

  startEndless(mapId: string): void {
    this.state.currentMapId = mapId;
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
    this.restart();
    this.state.endlessMode = true;
    this.state.totalWaves = Infinity;
    this.waveManager.endlessMode = true;
  }

  submitEndlessScore(): void {
    if (!this.state.endlessMode) return;
    const entry = {
      score: this.state.score,
      wave: this.state.currentWave,
      date: new Date().toISOString(),
    };
    this.saveData.endlessLeaderboard.push(entry);
    this.saveData.endlessLeaderboard.sort((a, b) => b.score - a.score);
    this.saveData.endlessLeaderboard = this.saveData.endlessLeaderboard.slice(0, 10);
    this.persistSave();
  }

  getEndlessLeaderboard() {
    return this.saveData.endlessLeaderboard || [];
  }

  restart(): void {
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particleManager.clear();
    this.waveManager = new WaveManager();
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
    
    const talentBonus = getTalentBonus(this.saveData.talents);
    const inventory = this.state.inventory;

    this.state = {
      ...this.createInitialState(),
      inventory,
      currentMapId: map.id,
    };
  }

  tryCatchFish(): OwnedCharacter | null {
    if (!fishState.visible || fishState.caught) return null;
    const alreadyOwned = this.state.inventory.some(c => c.config.id === 'leviathan');
    if (alreadyOwned) return null;

    const leviathan = ALL_CHARACTERS.find(c => c.id === 'leviathan');
    if (!leviathan) return null;

    fishState.caught = true;
    fishState.visible = false;
    this.saveData.stats.fishCaught = true;

    const character: OwnedCharacter = {
      instanceId: nextInstanceId++,
      config: leviathan,
      level: 1,
    };
    this.state.inventory.push(character);
    this.persistSave();
    return character;
  }

  // Achievement queue for UI notifications
  newAchievements: string[] = [];

  private checkAchievements(): void {
    const stats: AchievementStats = {
      totalKills: this.saveData.stats.totalKills,
      totalGold: this.saveData.stats.totalGold,
      totalSummons: this.saveData.totalSummons,
      mapsCompleted: this.saveData.mapsCompleted.length,
      wavesCompleted: this.saveData.stats.maxWaveReached,
      perfectMaps: this.saveData.stats.perfectMaps,
      legendaryOwned: this.state.inventory.filter(c => c.config.rarity === 'legendary').length,
      totalUnits: this.state.inventory.length,
      bossKills: this.saveData.stats.bossKills,
      maxWaveReached: this.saveData.stats.maxWaveReached,
      fishCaught: this.saveData.stats.fishCaught,
    };

    for (const ach of ACHIEVEMENTS) {
      if (this.saveData.achievementsUnlocked.includes(ach.id)) continue;
      if (ach.condition(stats)) {
        this.saveData.achievementsUnlocked.push(ach.id);
        this.newAchievements.push(ach.id);
        if (ach.reward?.stars) {
          this.saveData.stars += ach.reward.stars;
          this.state.stars = this.saveData.stars;
        }
        this.persistSave();
      }
    }
  }

  getAchievements() {
    return {
      all: ACHIEVEMENTS,
      unlocked: this.saveData.achievementsUnlocked,
    };
  }

  popNewAchievements(): string[] {
    const popped = [...this.newAchievements];
    this.newAchievements = [];
    return popped;
  }

  private persistSave(): void {
    this.saveData.inventory = inventoryToSaveData(this.state.inventory);
    writeSave(this.saveData);
  }
}
