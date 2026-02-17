import { GameState, OwnedCharacter, Point, Slot } from './types';
import { EnemyManager } from './managers/EnemyManager';
import { TowerManager } from './managers/TowerManager';
import { WaveManager } from './managers/WaveManager';
import { ParticleManager } from './managers/ParticleManager';
import { FloatingTextManager } from './managers/FloatingTextManager';
import { ScreenShake } from './managers/ScreenShake';
import { computeSynergies } from './managers/SynergyManager';
import { loadSave, writeSave, saveDataToInventory, inventoryToSaveData, SaveData } from './managers/SaveManager';
import { ACHIEVEMENTS, AchievementStats } from './data/achievementData';
import { getTalentBonus } from './data/talentData';
import { ALL_MAPS } from './data/allMaps';
import { TOTAL_WAVES } from './data/waveData';
import { ALL_CHARACTERS, getCharacterUpgradeCost } from './data/characterData';
import { getGachaCost, rollRarity } from './data/gachaData';
import { TALENTS } from './data/talentData';
import { rollBossDrop, ALL_EQUIPMENT, getEquipmentBonuses, EquipmentItem } from './data/equipmentData';
import { getQuestsForMap, QuestContext } from './data/questData';
import { soundManager } from './audio/SoundManager';
import { loadDailyQuests, saveDailyQuests, progressDailyQuest, DailyQuestState, DailyQuestEvent } from './managers/DailyQuestManager';

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
  floatingTextManager = new FloatingTextManager();
  screenShake = new ScreenShake();
  dailyQuests: DailyQuestState;

  private saveData: SaveData;
  state: GameState;

  constructor() {
    this.saveData = loadSave();
    this.dailyQuests = loadDailyQuests();
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
      waveEnemiesSpawned: 0,
      waveEnemiesTotal: 0,
      waveEnemiesKilledThisWave: 0,
      equipmentInventory: this.saveData.equipmentInventory || [],
      lastDrop: null,
    };
  }

  update(dt: number): void {
    if (this.state.gameOver || this.state.victory) return;

    this.waveManager.update(dt, this.enemyManager);

    const talentBonus = getTalentBonus(this.saveData.talents);

    const { reachedEnd } = this.enemyManager.update(dt);
    for (const enemy of reachedEnd) {
      this.state.baseHp--;
      soundManager.playBaseDamage();
      this.screenShake.trigger(6, 0.3);
      this.floatingTextManager.spawn(enemy.x, enemy.y, '-1 HP', '#ff4444', 12);
      if (this.state.baseHp <= 0) {
        this.state.gameOver = true;
        soundManager.playGameOver();
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
        this.state.waveEnemiesKilledThisWave++;
        this.floatingTextManager.spawn(enemy.x, enemy.y, `+${goldEarned}💰`, '#ffdd44', 9);
        this.trackDailyEvent({ type: 'kill_enemies', count: 1 });
        this.trackDailyEvent({ type: 'earn_gold', count: goldEarned });
        // Track stats
        this.saveData.stats.totalKills++;
        this.saveData.stats.totalGold += goldEarned;
        if (enemy.type === 'boss') {
          soundManager.playBossDeath();
          this.saveData.stats.bossKills++;
          this.saveData.stars += 1;
          this.state.stars = this.saveData.stars;
          this.screenShake.trigger(10, 0.5);
          this.floatingTextManager.spawn(enemy.x, enemy.y - 10, 'BOSS KILL! +1⭐', '#ff88ff', 14);
          this.trackDailyEvent({ type: 'kill_bosses', count: 1 });
          const drop = rollBossDrop(this.state.currentWave);
          if (drop) {
            this.state.equipmentInventory.push(drop.id);
            this.saveData.equipmentInventory = [...this.state.equipmentInventory];
            this.state.lastDrop = drop.id;
          }
          this.persistSave();
        }
        // Death particles
        if (enemy.type === 'boss') {
          this.particleManager.spawnBossExplosion(enemy.x, enemy.y);
        } else {
          soundManager.playEnemyDeath();
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

    // Update particles, floating text, screen shake
    this.particleManager.update(dt);
    this.floatingTextManager.update(dt);
    this.screenShake.update(dt);

    this.state.enemies = this.enemyManager.enemies;
    this.state.placedUnits = this.towerManager.units;
    this.state.projectiles = this.towerManager.projectiles;
    this.state.currentWave = this.waveManager.currentWave;
    this.state.waveActive = this.waveManager.waveActive;
    this.state.waveEnemiesSpawned = this.waveManager.spawned;
    this.state.waveEnemiesTotal = this.waveManager.enemyCount;

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
      soundManager.playVictory();
      // Award base stars on first completion
      if (!this.saveData.mapsCompleted.includes(this.state.currentMapId)) {
        this.saveData.stars += 3;
        this.saveData.mapsCompleted.push(this.state.currentMapId);
      }
      // Check & award quest stars
      const questCtx: QuestContext = {
        victory: true,
        baseHp: this.state.baseHp,
        maxBaseHp: this.state.maxBaseHp,
        enemiesKilled: this.state.enemiesKilled,
        wavesCompleted: this.state.currentWave,
        placedUnitsCount: this.towerManager.units.length,
        goldEarned: this.state.gold,
        totalWaves: this.state.totalWaves,
        hpLost: this.state.maxBaseHp - this.state.baseHp,
      };
      const quests = getQuestsForMap(this.state.currentMapId);
      for (const quest of quests) {
        if (this.saveData.questsCompleted.includes(quest.id)) continue;
        if (quest.condition(questCtx)) {
          this.saveData.questsCompleted.push(quest.id);
          this.saveData.stars += quest.starsReward;
        }
      }
      this.state.stars = this.saveData.stars;
      // Perfect map (no HP lost)
      if (this.state.baseHp === this.state.maxBaseHp) {
        this.saveData.stats.perfectMaps++;
        this.trackDailyEvent({ type: 'perfect_wave', count: 1 });
      }
      this.trackDailyEvent({ type: 'win_map', count: 1 });
      this.persistSave();
    }

    // Check achievements
    this.checkAchievements();
  }

  startWave(): boolean {
    if (this.state.waveActive || this.state.gameOver || this.state.victory) return false;
    const config = this.waveManager.startWave();
    if (!config) return false;
    soundManager.playWaveStart();
    this.state.waveActive = true;
    this.state.waveEnemiesKilledThisWave = 0;
    this.trackDailyEvent({ type: 'complete_waves', count: 1 });
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
      equipment: {},
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

    const unit = this.towerManager.placeUnit(character.config, slot, slotIndex, characterInstanceId, character.level, character.equipment);
    slot.unitId = unit.id;
    soundManager.playPlaceUnit();
    this.trackDailyEvent({ type: 'place_units', count: 1 });
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

  activateAbility(unitId: number): boolean {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (!unit || unit.abilityCooldown > 0) return false;
    soundManager.playAbility();
    this.trackDailyEvent({ type: 'use_abilities', count: 1 });

    const { damages, statusEffects } = this.towerManager.activateAbility(unitId, this.enemyManager.getAliveEnemies());

    for (const { enemyId, effect } of statusEffects) {
      this.enemyManager.applyStatusEffect(enemyId, effect);
    }
    for (const { enemyId, damage } of damages) {
      const enemy = this.enemyManager.enemies.find(e => e.id === enemyId);
      const result = this.enemyManager.damageEnemy(enemyId, damage);
      if (result.killed && enemy) {
        const talentBonus = getTalentBonus(this.saveData.talents);
        const goldEarned = Math.floor(result.reward * talentBonus.goldMult);
        this.state.gold += goldEarned;
        this.state.score += result.reward;
        this.state.enemiesKilled++;
        this.saveData.stats.totalKills++;
        this.saveData.stats.totalGold += goldEarned;
        if (enemy.type === 'boss') {
          this.saveData.stats.bossKills++;
          // Award 1 star per boss kill
          this.saveData.stars += 1;
          this.state.stars = this.saveData.stars;
          this.persistSave();
          this.particleManager.spawnBossExplosion(enemy.x, enemy.y);
        } else {
          this.particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
        }
      }
    }
    // Ability particles
    if (unit) {
      this.particleManager.spawnBossExplosion(unit.x, unit.y);
    }
    return true;
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
    this.floatingTextManager.clear();
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
      equipment: {},
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

  equipItem(characterInstanceId: number, equipmentId: string): boolean {
    const char = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    const item = ALL_EQUIPMENT.find(e => e.id === equipmentId);
    if (!char || !item) return false;

    // Check if in equipment inventory
    const idx = this.state.equipmentInventory.indexOf(equipmentId);
    if (idx === -1) return false;

    // Unequip current item in that slot if any
    const currentEquipId = char.equipment[item.slot];
    if (currentEquipId) {
      this.state.equipmentInventory.push(currentEquipId);
    }

    // Equip
    char.equipment[item.slot] = equipmentId;
    this.state.equipmentInventory.splice(idx, 1);
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.persistSave();
    return true;
  }

  unequipItem(characterInstanceId: number, slot: 'weapon' | 'armor' | 'accessory'): boolean {
    const char = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    if (!char || !char.equipment[slot]) return false;

    this.state.equipmentInventory.push(char.equipment[slot]!);
    delete char.equipment[slot];
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.persistSave();
    return true;
  }

  summonEquipment(): EquipmentItem | null {
    const cost = this.getEquipmentGachaCost();
    if (this.state.stars < cost) return null;

    this.state.stars -= cost;
    this.saveData.stars = this.state.stars;

    // Roll rarity based on similar rates
    const roll = Math.random();
    let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    if (roll < 0.35) rarity = 'common';
    else if (roll < 0.60) rarity = 'uncommon';
    else if (roll < 0.80) rarity = 'rare';
    else if (roll < 0.95) rarity = 'epic';
    else rarity = 'legendary';

    const pool = ALL_EQUIPMENT.filter(e => e.rarity === rarity);
    const item = pool[Math.floor(Math.random() * pool.length)];

    this.state.equipmentInventory.push(item.id);
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.persistSave();
    return item;
  }

  getEquipmentGachaCost(): number {
    return 3;
  }

  clearLastDrop(): void {
    this.state.lastDrop = null;
  }

  trackDailyEvent(event: DailyQuestEvent): void {
    const completed = progressDailyQuest(this.dailyQuests, event);
    if (completed) {
      // Will be picked up by UI polling
    }
  }

  claimDailyQuest(questId: string): boolean {
    const quest = this.dailyQuests.quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return false;
    quest.claimed = true;
    this.saveData.stars += quest.reward.stars;
    this.state.stars = this.saveData.stars;
    this.state.gold += quest.reward.gold;
    saveDailyQuests(this.dailyQuests);
    this.persistSave();
    return true;
  }

  getDailyQuests(): DailyQuestState {
    return this.dailyQuests;
  }

  private persistSave(): void {
    this.saveData.inventory = inventoryToSaveData(this.state.inventory);
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    writeSave(this.saveData);
  }
}
