import { GameState, OwnedCharacter, Point, Slot, Rarity, MidrunChoice, CharacterUnlockProgress, CharacterConfig } from './types';
import { EnemyManager } from './managers/EnemyManager';
import { TowerManager } from './managers/TowerManager';
import { WaveManager } from './managers/WaveManager';
import { ParticleManager } from './managers/ParticleManager';
import { FloatingTextManager } from './managers/FloatingTextManager';
import { ScreenShake } from './managers/ScreenShake';
import { computeSynergies } from './managers/SynergyManager';
import { loadSave, writeSave, saveDataToInventory, inventoryToSaveData, SaveData } from './managers/SaveManager';
import { ACHIEVEMENTS, AchievementStats } from './data/achievementData';
import { getTalentBonus, getAscensionBonus, getAscensionUpgradeCost, getAscensionSpent } from './data/talentData';
import { ALL_MAPS } from './data/allMaps';
import { TOTAL_WAVES } from './data/waveData';
import { ALL_CHARACTERS, getCharacterUpgradeCost, getCharacterStats } from './data/characterData';
import { TALENTS, ASCENSION_UPGRADES } from './data/talentData';
import { rollBossDrop, ALL_EQUIPMENT, getEquipmentBonuses, EquipmentItem } from './data/equipmentData';
import { COMPOSITE_RECIPES, findAvailableRecipes } from './data/compositeEquipmentData';
import { getQuestsForMap, QuestContext } from './data/questData';
import { soundManager } from './audio/SoundManager';
import { loadDailyQuests, saveDailyQuests, progressDailyQuest, DailyQuestState, DailyQuestEvent } from './managers/DailyQuestManager';
import { DungeonDef, getDungeonMap, isDungeonCompletedToday, ALL_DUNGEONS } from './data/dungeonData';
import { ALL_SKINS, checkSkinUnlock, getSkinsForChampion, getSkinById } from './data/skinData';
import { CHARACTER_UNLOCK_TREE, getUnlockNode } from './data/unlockTreeData';

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

const UNIT_XP = {
  waveClearBase: 10,
  waveClearStep: 2,
};

const ENEMY_TYPE_XP: Record<string, number> = {
  normal: 6,
  fast: 5,
  tank: 10,
  armored: 9,
  healer: 11,
  stealth: 10,
  splitter: 8,
  dragon_fire: 24,
  dragon_ice: 24,
  dragon_earth: 28,
  dragon_air: 22,
  boss: 40,
  void_empress: 60,
  ice_witch: 56,
  noxian_grand_general: 72,
};

const RARITY_XP_MULT: Record<Rarity, number> = {
  common: 1,
  uncommon: 0.96,
  rare: 0.92,
  epic: 0.88,
  legendary: 0.84,
};

export function getXpToNextLevel(level: number, rarity: Rarity): number {
  const rarityTax = rarity === 'legendary' ? 12 : rarity === 'epic' ? 8 : rarity === 'rare' ? 4 : rarity === 'uncommon' ? 2 : 0;
  return 30 + (level - 1) * 18 + rarityTax;
}

function getChampionRoleXpMult(config: CharacterConfig): number {
  switch (config.attackPattern) {
    case 'single':
      return config.range >= 170 ? 0.94 : 1.04;
    case 'rapid':
      return 0.9;
    case 'aoe_circle':
      return 0.9;
    case 'line':
      return 0.95;
    case 'poison':
    case 'poison_trail':
    case 'mushroom':
      return 0.93;
    case 'slow':
      return 1.08;
    case 'chain':
      return 0.92;
    case 'burst':
      return 0.97;
    default:
      return 1;
  }
}

export class GameEngine {
  enemyManager = new EnemyManager();
  private adminMode = false;
  towerManager = new TowerManager();
  waveManager = new WaveManager();
  particleManager = new ParticleManager();
  floatingTextManager = new FloatingTextManager();
  screenShake = new ScreenShake();
  dailyQuests: DailyQuestState;
  activeDungeon: DungeonDef | null = null;
  dungeonTimer = 0;
  private ascensionEventCooldown = 12;
  private lastAscensionBossIntroWave = 0;
  private runAttackMult = 1;
  private runSpeedMult = 1;
  private runRangeMult = 1;

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
    const ascensionBonus = getAscensionBonus(this.saveData.ascensionUpgrades || {});
    const map = ALL_MAPS.find(m => m.id === this.saveData.currentMapId) || ALL_MAPS[0];

    this.enemyManager.setWaypoints(map.waypoints);
    this.waveManager.mapId = map.id;

    const oldAsc = this.saveData.ascensionUpgrades || {};
    const migratedAsc: Record<string, number> = {
      ...oldAsc,
      ...(oldAsc['asc_power'] ? { asc_atk_damage: oldAsc['asc_power'] } : {}),
      ...(oldAsc['asc_haste'] ? { asc_atk_speed: oldAsc['asc_haste'] } : {}),
      ...(oldAsc['asc_fortune'] ? { asc_eco_kill: oldAsc['asc_fortune'] } : {}),
      ...(oldAsc['asc_guard'] ? { asc_def_hp: oldAsc['asc_guard'] } : {}),
    };
    this.saveData.ascensionUpgrades = migratedAsc;

    return {
      gold: this.saveData.gold ?? 200,
      baseHp: 20 + talentBonus.extraHp + ascensionBonus.extraHp,
      maxBaseHp: 20 + talentBonus.extraHp + ascensionBonus.extraHp,
      currentWave: 0,
      waveActive: false,
      enemies: [],
      placedUnits: [],
      projectiles: [],
      aoeWaves: [],
      groundEffects: [],
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
      gachaCost: 0,
      totalSummons: this.saveData.totalSummons,
      unlockShards: this.saveData.unlockShards || 0,
      exclusiveTokens: this.saveData.exclusiveTokens || 0,
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
      gameSpeed: this.saveData.gameSpeed || 1,
      ascensionWeather: null,
      ascensionEventLabel: null,
      ascensionEventTimer: 0,
      ascensionCinematicTitle: null,
      ascensionCinematicTimer: 0,
      midrunChoiceOpen: false,
      midrunChoices: [],
    };
  }

  update(dt: number): void {
    this.applyAdminCheats();
    if (this.state.gameOver || this.state.victory) return;
    this.updateAscensionSystems(dt);

    // Dungeon timer
    if (this.activeDungeon?.rules.timeLimit) {
      this.dungeonTimer += dt;
      if (this.dungeonTimer >= this.activeDungeon.rules.timeLimit) {
        this.state.gameOver = true;
        soundManager.playGameOver();
        return;
      }
    }

    this.waveManager.update(dt, this.enemyManager);

    const talentBonus = getTalentBonus(this.saveData.talents);
    const ascensionBonus = getAscensionBonus(this.saveData.ascensionUpgrades || {});

    const { reachedEnd, dotKills, dotDamages, splitSpawns } = this.enemyManager.update(dt);
    // Track DOT damages from Singed/Teemo etc.
    for (const { unitId, damage } of dotDamages) {
      this.trackDamage(unitId, damage);
    }
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
    this.towerManager.talentBonus = {
      ...talentBonus,
      attackMult: talentBonus.attackMult * ascensionBonus.attackMult * this.runAttackMult,
      speedMult: talentBonus.speedMult * ascensionBonus.speedMult * this.runSpeedMult,
      rangeMult: talentBonus.rangeMult * this.runRangeMult,
    };
    this.towerManager.setWaypoints(this.getWaypoints());

    // Stealth reveal: units with canRevealStealth reveal stealthed enemies in range
    for (const unit of this.towerManager.units) {
      if (!unit.config.canRevealStealth) continue;
      const unitRange = getCharacterStats(unit.config, unit.level, unit.stars).range;
      for (const enemy of this.enemyManager.enemies) {
        if (!enemy.alive || !enemy.stealthed) continue;
        const dx = enemy.x - unit.x;
        const dy = enemy.y - unit.y;
        if (dx * dx + dy * dy <= unitRange * unitRange) {
          enemy.stealthed = false;
          this.floatingTextManager.spawn(enemy.x, enemy.y - 10, '👁️ Revealed!', '#ff66ff', 11);
        }
      }
    }

    // Use targetable enemies (excludes stealthed) for tower targeting
    const targetableEnemies = this.enemyManager.getTargetableEnemies();
    // Pass ice dragon auras for tower slow effect
    this.towerManager.iceDragonAuras = this.enemyManager.getIceDragonAuras();
    const { damages, statusEffects } = this.towerManager.update(dt, targetableEnemies);

    for (const { enemyId, effect } of statusEffects) {
      this.enemyManager.applyStatusEffect(enemyId, effect);
    }

    for (const { enemyId, damage, unitId } of damages as Array<{ enemyId: number; damage: number; unitId: number }>) {
      // Find enemy before damaging to get position for particles
      const enemy = this.enemyManager.enemies.find(e => e.id === enemyId);
      const result = this.enemyManager.damageEnemy(enemyId, damage);
      if (unitId) this.trackDamage(unitId, damage);
      if (result.killed && enemy) {
        const shardEarned = Math.max(1, Math.ceil(result.reward * 0.35));
        this.state.score += result.reward;
        this.state.enemiesKilled++;
        this.state.waveEnemiesKilledThisWave++;
        this.grantUnlockShards(shardEarned);
        const killerUnit = this.towerManager.units.find(u => u.id === unitId);
        if (killerUnit) this.awardUnitXp(killerUnit.characterInstanceId, ENEMY_TYPE_XP[enemy.type] || 6);
        this.floatingTextManager.spawn(enemy.x, enemy.y, `+${shardEarned}🧩`, '#67e8f9', 9);
        this.trackDailyEvent({ type: 'kill_enemies', count: 1 });
        // Track stats
        this.saveData.stats.totalKills++;
        this.saveData.stats.totalGold += shardEarned;
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

    // Process DOT kills (Singed poison, burn effects) — award gold & score
    for (const enemy of dotKills) {
      const shardEarned = Math.max(1, Math.ceil(enemy.reward * 0.35));
      this.grantUnlockShards(shardEarned);
      this.state.score += enemy.reward;
      this.state.enemiesKilled++;
      this.state.waveEnemiesKilledThisWave++;
      this.floatingTextManager.spawn(enemy.x, enemy.y, `+${shardEarned}🧩`, '#44ffcc', 9);
      this.trackDailyEvent({ type: 'kill_enemies', count: 1 });
      this.saveData.stats.totalKills++;
      this.saveData.stats.totalGold += shardEarned;
      if (enemy.type === 'boss' || enemy.type.startsWith('dragon_')) {
        soundManager.playBossDeath();
        this.saveData.stats.bossKills++;
        this.saveData.stars += 1;
        this.state.stars = this.saveData.stars;
        this.screenShake.trigger(10, 0.5);
        this.particleManager.spawnBossExplosion(enemy.x, enemy.y);
        const drop = rollBossDrop(this.state.currentWave);
        if (drop) {
          this.state.equipmentInventory.push(drop.id);
          this.saveData.equipmentInventory = [...this.state.equipmentInventory];
          this.state.lastDrop = drop.id;
        }
        this.persistSave();
      } else {
        soundManager.playEnemyDeath();
        this.particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
      }
    }

    // Projectile trails
    for (const proj of this.towerManager.projectiles) {
      if (proj.alive) {
        const trailColor = proj.appliesPoison ? '#44ff44' : proj.pierce ? '#88aaff' : '#ffdd44';
        this.particleManager.spawnProjectileTrail(proj.x, proj.y, trailColor);
      }
    }

    // Auto-activate abilities when enemies are in range and cooldown is ready
    const aliveEnemies = this.enemyManager.getTargetableEnemies();
    if (aliveEnemies.length > 0) {
      for (const unit of this.towerManager.units) {
        if (unit.abilityCooldown <= 0 && !unit.abilityActive) {
          const stats = getCharacterStats(unit.config, unit.level, unit.stars);
          const hasEnemyInRange = aliveEnemies.some(e => {
            const dx = e.x - unit.x;
            const dy = e.y - unit.y;
            return Math.sqrt(dx * dx + dy * dy) <= stats.range * 1.5;
          });
          if (hasEnemyInRange) {
            this.activateAbility(unit.id);
          }
        }
      }
    }

    // Unit aura particles (subtle effect for all units)
    for (const unit of this.towerManager.units) {
      if (unit.abilityActive && Math.random() < 0.2) {
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
    this.state.aoeWaves = this.towerManager.aoeWaves;
    this.state.groundEffects = this.towerManager.groundEffects;
    this.state.currentWave = this.waveManager.currentWave;
    this.state.waveActive = this.waveManager.waveActive;
    this.state.waveEnemiesSpawned = this.waveManager.spawned;
    this.state.waveEnemiesTotal = this.waveManager.enemyCount;
    this.state.waveModifier = this.waveManager.currentModifier;

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
      this.awardWaveXp();
      soundManager.playVictory();

      if (this.activeDungeon) {
        // Dungeon completion — rewards handled by completeDungeon()
        this.completeDungeon();
      } else {
        // Ascension meta currency (account-wide progression)
        if (this.state.currentMapId === 'void_rift' || this.state.currentMapId === 'freljord_storm' || this.state.currentMapId === 'noxus_siege') {
          const reward = this.state.currentMapId === 'void_rift' ? 2 : this.state.currentMapId === 'freljord_storm' ? 3 : 4;
          this.saveData.ascensionPoints = (this.saveData.ascensionPoints || 0) + reward;
          this.floatingTextManager.spawn(390, 36, `+${reward} Ascension`, '#9df7ff', 13);
        }
        // Normal map completion
        if (!this.saveData.mapsCompleted.includes(this.state.currentMapId)) {
          this.saveData.stars += 3;
          this.saveData.mapsCompleted.push(this.state.currentMapId);
        }
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
        if (this.state.baseHp === this.state.maxBaseHp) {
          this.saveData.stats.perfectMaps++;
          this.trackDailyEvent({ type: 'perfect_wave', count: 1 });
        }
        this.trackDailyEvent({ type: 'win_map', count: 1 });
      }
      this.persistSave();
    }

    // Check achievements
    this.checkAchievements();
  }

  private isAscensionMap(mapId: string): boolean {
    return mapId === 'void_rift' || mapId === 'freljord_storm' || mapId === 'noxus_siege';
  }

  private updateAscensionSystems(dt: number): void {
    const mapId = this.state.currentMapId;
    if (!this.isAscensionMap(mapId)) {
      this.state.ascensionWeather = undefined;
      this.state.ascensionEventLabel = null;
      this.state.ascensionEventTimer = 0;
      this.state.ascensionCinematicTitle = null;
      this.state.ascensionCinematicTimer = 0;
      return;
    }

    this.state.ascensionWeather = mapId === 'void_rift' ? 'void' : mapId === 'freljord_storm' ? 'freljord' : 'noxus';

    if (this.state.ascensionCinematicTimer && this.state.ascensionCinematicTimer > 0) {
      this.state.ascensionCinematicTimer = Math.max(0, this.state.ascensionCinematicTimer - dt);
      if (this.state.ascensionCinematicTimer <= 0) this.state.ascensionCinematicTitle = null;
    }

    if (this.state.ascensionEventTimer && this.state.ascensionEventTimer > 0) {
      this.state.ascensionEventTimer = Math.max(0, this.state.ascensionEventTimer - dt);
      if (this.state.ascensionEventTimer <= 0) this.state.ascensionEventLabel = null;
    }

    if (!this.state.waveActive) return;

    // Boss intro cinematic on major waves
    if (this.state.currentWave % 10 === 0 && this.state.currentWave !== this.lastAscensionBossIntroWave) {
      this.lastAscensionBossIntroWave = this.state.currentWave;
      this.state.ascensionCinematicTitle =
        mapId === 'void_rift' ? '⚠️ BEL\'VETH AWAKENS' :
        mapId === 'freljord_storm' ? '⚠️ LISSANDRA RISES' :
        '⚠️ SWAIN DESCENDS';
      this.state.ascensionCinematicTimer = 2.6;
      soundManager.playWaveStart();
    }

    this.ascensionEventCooldown -= dt;
    if (this.ascensionEventCooldown > 0) return;
    this.ascensionEventCooldown = 14 + Math.random() * 7;

    // Environment events: map flavor + gameplay pressure
    if (mapId === 'void_rift') {
      this.state.ascensionEventLabel = '🜂 Rift Pulse: -1 HP base';
      this.state.ascensionEventTimer = 2.2;
      if (this.enemyManager.getAliveEnemies().length > 0) {
        this.state.baseHp = Math.max(1, this.state.baseHp - 1);
        this.screenShake.trigger(4, 0.2);
      }
    } else if (mapId === 'freljord_storm') {
      this.state.ascensionEventLabel = '❄ Blizzard: tours ralenties';
      this.state.ascensionEventTimer = 2.2;
      for (const unit of this.towerManager.units) {
        unit.attackCooldown += 0.8;
      }
    } else {
      this.state.ascensionEventLabel = '🩸 War Drums: ennemis renforcés';
      this.state.ascensionEventTimer = 2.2;
      for (const e of this.enemyManager.enemies) {
        if (!e.alive) continue;
        e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.08);
        e.baseSpeed *= 1.06;
      }
    }
  }

  private shouldOfferMidrunChoice(): boolean {
    return !this.state.endlessMode && this.state.currentWave > 0 && this.state.currentWave % 7 === 0 && !this.state.midrunChoiceOpen;
  }

  private generateMidrunChoices(): MidrunChoice[] {
    return [
      { id: 'greed', title: '🧩 Pacte d’éclats', description: '+45 éclats maintenant, mais -1 PV max de base.' },
      { id: 'fortify', title: '🛡️ Serment du bastion', description: '+2 PV de base max et +2 PV soignés.' },
      { id: 'fury', title: '⚔️ Fureur tactique', description: '+12% dégâts de tours ce run, mais ennemis +8% vitesse.' },
    ];
  }

  pickMidrunChoice(choiceId: string): boolean {
    if (!this.state.midrunChoiceOpen) return false;

    if (choiceId === 'greed') {
      this.grantUnlockShards(45);
      this.saveData.exclusiveTokens = (this.saveData.exclusiveTokens || 0) + 3;
      this.state.exclusiveTokens = this.saveData.exclusiveTokens;
      this.state.maxBaseHp = Math.max(3, this.state.maxBaseHp - 1);
      this.state.baseHp = Math.min(this.state.baseHp, this.state.maxBaseHp);
    } else if (choiceId === 'fortify') {
      this.state.maxBaseHp += 2;
      this.state.baseHp = Math.min(this.state.maxBaseHp, this.state.baseHp + 2);
    } else if (choiceId === 'fury') {
      this.runAttackMult *= 1.12;
      for (const e of this.enemyManager.enemies) {
        if (!e.alive) continue;
        e.baseSpeed *= 1.08;
      }
    } else {
      return false;
    }

    this.state.midrunChoiceOpen = false;
    this.state.midrunChoices = [];
    this.persistSave();
    return true;
  }

  startWave(): boolean {
    if (this.state.waveActive || this.state.gameOver || this.state.victory) return false;
    if (this.shouldOfferMidrunChoice()) {
      this.state.midrunChoices = this.generateMidrunChoices();
      this.state.midrunChoiceOpen = true;
      return false;
    }
    const config = this.waveManager.startWave();
    if (!config) return false;
    const ascensionBonus = getAscensionBonus(this.saveData.ascensionUpgrades || {});
    if (ascensionBonus.waveIncome > 0) {
      const income = Math.max(2, Math.floor(ascensionBonus.waveIncome * 0.35));
      this.grantUnlockShards(income);
      this.floatingTextManager.spawn(392, 38, `+${income}🧩 rythme`, '#67e8f9', 11);
    }
    soundManager.playWaveStart();
    this.state.waveActive = true;
    this.state.waveEnemiesKilledThisWave = 0;
    // Reset wave damage tracking
    for (const [, entry] of this.damageTracker) {
      entry.waveDamage = 0;
    }
    this.waveStartTime = performance.now();
    this.trackDailyEvent({ type: 'complete_waves', count: 1 });
    return true;
  }

  summonCharacter(): OwnedCharacter | null {
    return null;
  }

  private grantUnlockShards(amount: number): void {
    if (amount <= 0) return;
    this.saveData.unlockShards = (this.saveData.unlockShards || 0) + amount;
    this.state.unlockShards = this.saveData.unlockShards;
  }

  private addCharacterToInventory(configId: string): OwnedCharacter | null {
    const config = ALL_CHARACTERS.find(c => c.id === configId);
    if (!config) return null;
    const character: OwnedCharacter = {
      instanceId: nextInstanceId++,
      config,
      level: 1,
      xp: 0,
      equipment: {},
      stars: 1,
    };
    this.state.inventory.push(character);
    return character;
  }

  private awardUnitXp(characterInstanceId: number, amount: number): void {
    if (amount <= 0) return;
    const character = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    if (!character) return;

    const adjustedXp = Math.max(
      1,
      Math.round(amount * RARITY_XP_MULT[character.config.rarity] * getChampionRoleXpMult(character.config))
    );

    character.xp = (character.xp || 0) + adjustedXp;
    while (character.level < 50 && (character.xp || 0) >= getXpToNextLevel(character.level, character.config.rarity)) {
      character.xp = (character.xp || 0) - getXpToNextLevel(character.level, character.config.rarity);
      character.level += 1;
    }
  }

  private awardWaveXp(): void {
    const placedUnits = [...this.state.placedUnits];
    if (placedUnits.length === 0) return;

    const supportPatterns = new Set(['slow', 'poison_trail', 'mushroom']);
    const waveXp = UNIT_XP.waveClearBase + Math.max(0, this.state.currentWave - 1) * UNIT_XP.waveClearStep;

    for (const unit of placedUnits) {
      const participationBonus = supportPatterns.has(unit.config.attackPattern) ? 3 : 0;
      this.awardUnitXp(unit.characterInstanceId, waveXp + participationBonus);
    }
  }

  unlockCharacter(championId: string): OwnedCharacter | null {
    const node = getUnlockNode(championId);
    if (!node) return null;
    const unlocked = new Set(this.saveData.unlockedCharacters || []);
    if (unlocked.has(championId)) return null;

    const progress = this.getCharacterUnlockProgress();
    const current = progress.find(p => p.championId === championId);
    if (!current || !current.canUnlock || !current.isNext) return null;

    this.saveData.unlockShards -= node.shardCost;
    this.state.unlockShards = this.saveData.unlockShards;
    this.saveData.unlockedCharacters = [...(this.saveData.unlockedCharacters || []), championId];
    this.state.totalSummons++;
    this.saveData.totalSummons = this.state.totalSummons;

    const character = this.addCharacterToInventory(championId);
    this.persistSave();
    return character;
  }

  /** Merge 3 same-champion units at same star level → next star level */
  mergeCharacters(configId: string, starLevel: number): OwnedCharacter | null {
    // Find 3 unplaced copies of same champ at same star level
    const placedIds = new Set(this.towerManager.units.map(u => u.characterInstanceId));
    const candidates = this.state.inventory.filter(
      c => c.config.id === configId && c.stars === starLevel && !placedIds.has(c.instanceId)
    );
    if (candidates.length < 3 || starLevel >= 3) return null;

    // Keep the first, remove the other two
    const kept = candidates[0];
    const toRemove = [candidates[1], candidates[2]];
    
    // Transfer best level
    const maxLevel = Math.max(kept.level, ...toRemove.map(c => c.level));
    kept.level = maxLevel;
    kept.stars = starLevel + 1;

    // Remove sacrificed units from inventory
    for (const rem of toRemove) {
      const idx = this.state.inventory.findIndex(c => c.instanceId === rem.instanceId);
      if (idx !== -1) {
        // Return equipment to inventory
        for (const slot of ['weapon', 'armor', 'accessory'] as const) {
          if (rem.equipment[slot]) {
            this.state.equipmentInventory.push(rem.equipment[slot]!);
          }
        }
        this.state.inventory.splice(idx, 1);
      }
    }

    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.persistSave();
    return kept;
  }

  /** Get mergeable groups: configId → { starLevel → count } */
  getMergeableGroups(): Map<string, Map<number, number>> {
    const placedIds = new Set(this.towerManager.units.map(u => u.characterInstanceId));
    const groups = new Map<string, Map<number, number>>();
    for (const c of this.state.inventory) {
      if (placedIds.has(c.instanceId)) continue;
      if (c.stars >= 3) continue;
      if (!groups.has(c.config.id)) groups.set(c.config.id, new Map());
      const starMap = groups.get(c.config.id)!;
      starMap.set(c.stars, (starMap.get(c.stars) || 0) + 1);
    }
    return groups;
  }

  placeUnit(slotIndex: number, characterInstanceId: number): boolean {
    const slot = this.state.slots[slotIndex];
    if (!slot || slot.unitId !== null) return false;

    const character = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    if (!character) return false;

    // Dungeon: max units constraint
    if (this.activeDungeon?.rules.maxUnits) {
      const currentPlaced = this.towerManager.units.length;
      if (currentPlaced >= this.activeDungeon.rules.maxUnits) return false;
    }

    // Dungeon: rarity constraint
    if (this.activeDungeon?.rules.allowedRarities) {
      if (!this.activeDungeon.rules.allowedRarities.includes(character.config.rarity)) return false;
    }

    const alreadyPlaced = this.towerManager.units.find(u => u.characterInstanceId === characterInstanceId);
    if (alreadyPlaced) return false;

    // Dungeon: no equipment — strip equipment for placement
    const equipmentToUse = this.activeDungeon?.rules.noEquipment ? {} : character.equipment;

    const unit = this.towerManager.placeUnit(character.config, slot, slotIndex, characterInstanceId, character.level, equipmentToUse, character.stars);
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

  moveUnit(unitId: number, newSlotIndex: number): boolean {
    const unit = this.towerManager.units.find(u => u.id === unitId);
    if (!unit) return false;
    const newSlot = this.state.slots[newSlotIndex];
    if (!newSlot || newSlot.unitId !== null) return false;

    // Free old slot
    const oldSlot = this.state.slots[unit.slotIndex];
    if (oldSlot) oldSlot.unitId = null;

    // Place in new slot
    newSlot.unitId = unit.id;
    unit.slotIndex = newSlotIndex;
    unit.x = newSlot.x;
    unit.y = newSlot.y;
    unit.homeX = newSlot.x;
    unit.homeY = newSlot.y;
    return true;
  }

  // Damage tracking
  damageTracker: Map<number, { totalDamage: number; waveDamage: number }> = new Map();
  waveStartTime = 0;

  getDamageStats() {
    const elapsed = this.waveStartTime > 0 ? (performance.now() - this.waveStartTime) / 1000 : 1;
    const stats: { unitId: number; instanceId: number; config: CharacterConfig; totalDamage: number; waveDamage: number; dps: number }[] = [];
    for (const unit of this.towerManager.units) {
      // Ensure every placed unit has a tracker entry
      if (!this.damageTracker.has(unit.id)) {
        this.damageTracker.set(unit.id, { totalDamage: 0, waveDamage: 0 });
      }
      const tracker = this.damageTracker.get(unit.id)!;
      stats.push({
        unitId: unit.id,
        instanceId: unit.characterInstanceId,
        config: unit.config,
        totalDamage: tracker.totalDamage,
        waveDamage: tracker.waveDamage,
        dps: elapsed > 0 ? tracker.waveDamage / elapsed : 0,
      });
    }
    stats.sort((a, b) => b.waveDamage - a.waveDamage);
    return stats;
  }

  private trackDamage(unitId: number | null, damage: number) {
    // Try to find which unit dealt this damage - for now use generic tracking
    if (unitId === null) return;
    let entry = this.damageTracker.get(unitId);
    if (!entry) { entry = { totalDamage: 0, waveDamage: 0 }; this.damageTracker.set(unitId, entry); }
    entry.totalDamage += damage;
    entry.waveDamage += damage;
  }

  upgradeUnit(unitId: number): boolean {
    return false;
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
        const ascensionBonus = getAscensionBonus(this.saveData.ascensionUpgrades || {});
        const goldEarned = Math.floor(result.reward * talentBonus.goldMult * ascensionBonus.goldMult);
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

  setActiveTab(tab: 'game' | 'progress'): void {
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

  upgradeAscension(upgradeId: string): boolean {
    const def = ASCENSION_UPGRADES.find(t => t.id === upgradeId);
    if (!def) return false;
    const currentLevel = this.saveData.ascensionUpgrades[upgradeId] || 0;
    if (currentLevel >= def.maxLevel) return false;

    const spent = getAscensionSpent(this.saveData.ascensionUpgrades || {});
    if (def.requiredSpent && spent < def.requiredSpent) return false;
    if (def.prerequisites && !def.prerequisites.every(id => (this.saveData.ascensionUpgrades[id] || 0) > 0)) return false;

    const cost = getAscensionUpgradeCost(upgradeId, currentLevel);
    if ((this.saveData.ascensionPoints || 0) < cost) return false;

    this.saveData.ascensionPoints -= cost;
    this.saveData.ascensionUpgrades[upgradeId] = currentLevel + 1;
    this.persistSave();
    return true;
  }

  getSaveData(): SaveData {
    return this.saveData;
  }

  setAdminByEmail(email?: string | null): void {
    const normalized = (email || '').trim().toLowerCase();
    const normalizeGmail = (value: string) => {
      const parts = value.split('@');
      if (parts.length !== 2) return value;
      const [localRaw, domain] = parts;
      if (domain !== 'gmail.com') return value;
      const local = localRaw.split('+')[0].replace(/\./g, '');
      return `${local}@gmail.com`;
    };

    const isAdmin = normalizeGmail(normalized) === 'overone97@gmail.com';
    this.adminMode = isAdmin;
    if (isAdmin) {
      this.grantAdminCollection();
      this.applyAdminCheats();
      this.persistSave();
    }
  }

  private grantAdminCollection(): void {
    const owned = new Set(this.state.inventory.map(c => c.config.id));
    for (const config of ALL_CHARACTERS) {
      if (config.id === 'fizz') continue; // garde le secret easter egg
      if (owned.has(config.id)) continue;
      this.state.inventory.push({
        instanceId: nextInstanceId++,
        config,
        level: 1,
        equipment: {},
        stars: 1,
      });
      owned.add(config.id);
    }
  }

  private applyAdminCheats(): void {
    if (!this.adminMode) return;
    if (this.state.gold < 999999999) this.state.gold = 999999999;
    if (this.saveData.stars < 999999) this.saveData.stars = 999999;
    this.state.stars = this.saveData.stars;
  }

  setMap(mapId: string): void {
    // Save current deployments
    this.saveDeployments();
    this.state.currentMapId = mapId;
    this.saveData.currentMapId = mapId;
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
    this.restart();
    // Restore deployments for new map
    this.restoreDeployments(mapId);
  }

  startEndless(mapId: string): void {
    this.saveDeployments();
    this.state.currentMapId = mapId;
    this.saveData.currentMapId = mapId;
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
    this.restart();
    this.state.endlessMode = true;
    this.state.totalWaves = Infinity;
    this.waveManager.endlessMode = true;
    this.restoreDeployments(mapId);
  }

  private saveDeployments(): void {
    const deployments = this.towerManager.units.map(u => ({
      slotIndex: u.slotIndex,
      instanceId: u.characterInstanceId,
    }));
    this.saveData.mapDeployments[this.state.currentMapId] = deployments;
    this.persistSave();
  }

  private restoreDeployments(mapId: string): void {
    const deployments = this.saveData.mapDeployments[mapId];
    if (!deployments || deployments.length === 0) return;
    for (const dep of deployments) {
      const char = this.state.inventory.find(c => c.instanceId === dep.instanceId);
      if (!char) continue;
      const slot = this.state.slots[dep.slotIndex];
      if (!slot || slot.unitId !== null) continue;
      const alreadyPlaced = this.towerManager.units.find(u => u.characterInstanceId === dep.instanceId);
      if (alreadyPlaced) continue;
      const unit = this.towerManager.placeUnit(char.config, slot, dep.slotIndex, dep.instanceId, char.level, char.equipment, char.stars);
      slot.unitId = unit.id;
    }
  }

  autoDeploy(): void {
    const placedIds = new Set(this.towerManager.units.map(u => u.characterInstanceId));
    const unplaced = this.state.inventory
      .filter(c => !placedIds.has(c.instanceId))
      .map(c => {
        const stats = getCharacterStats(c.config, c.level, c.stars);
        return { char: c, dps: stats.attack * stats.attackSpeed };
      })
      .sort((a, b) => b.dps - a.dps);

    for (const { char } of unplaced) {
      const emptySlotIdx = this.state.slots.findIndex(s => s.unitId === null);
      if (emptySlotIdx === -1) break;
      this.placeUnit(emptySlotIdx, char.instanceId);
    }
  }

  setGameSpeed(speed: number): void {
    this.state.gameSpeed = speed;
    this.saveData.gameSpeed = speed;
    this.persistSave();
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
    const currentMapId = this.state.currentMapId || this.saveData.currentMapId || 'plains';
    const preservedGold = Math.max(this.state.gold, this.saveData.gold ?? 0);
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particleManager.clear();
    this.floatingTextManager.clear();
    this.waveManager = new WaveManager();
    this.waveManager.mapId = currentMapId;
    this.runAttackMult = 1;
    this.runSpeedMult = 1;
    this.runRangeMult = 1;
    this.ascensionEventCooldown = 12;
    this.lastAscensionBossIntroWave = 0;
    
    const inventory = this.state.inventory;

    this.state = {
      ...this.createInitialState(),
      gold: preservedGold,
      inventory,
      currentMapId,
    };

    this.saveData.gold = this.state.gold;
    this.persistSave();
    
    const map = this.getMap();
    this.enemyManager.setWaypoints(map.waypoints);
  }

  tryCatchFish(): OwnedCharacter | null {
    if (!fishState.visible || fishState.caught) return null;
    const alreadyOwned = this.state.inventory.some(c => c.config.id === 'fizz');
    if (alreadyOwned) return null;

    const fizz = ALL_CHARACTERS.find(c => c.id === 'fizz');
    if (!fizz) return null;

    fishState.caught = true;
    fishState.visible = false;
    this.saveData.stats.fishCaught = true;

    const character: OwnedCharacter = {
      instanceId: nextInstanceId++,
      config: fizz,
      level: 1,
      xp: 0,
      equipment: {},
      stars: 1,
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

  getCharacterUnlockProgress(): CharacterUnlockProgress[] {
    const unlocked = new Set(this.saveData.unlockedCharacters || []);
    const nextNode = CHARACTER_UNLOCK_TREE.find(node => !unlocked.has(node.championId));

    return CHARACTER_UNLOCK_TREE.map(node => {
      const isUnlocked = unlocked.has(node.championId);
      const isNext = !isUnlocked && nextNode?.championId === node.championId;
      const canUnlock = isNext
        && (this.saveData.unlockShards || 0) >= node.shardCost
        && this.saveData.stars >= node.requiredStars
        && this.saveData.mapsCompleted.length >= node.requiredMapsCompleted;

      return {
        championId: node.championId,
        order: node.order,
        shardCost: node.shardCost,
        requiredStars: node.requiredStars,
        requiredMapsCompleted: node.requiredMapsCompleted,
        unlocked: isUnlocked,
        isNext,
        canUnlock,
      };
    });
  }

  popNewAchievements(): string[] {
    const popped = [...this.newAchievements];
    this.newAchievements = [];
    return popped;
  }

  equipItem(characterInstanceId: number, equipmentId: string): boolean {
    const char = this.state.inventory.find(c => c.instanceId === characterInstanceId);
    let item = ALL_EQUIPMENT.find(e => e.id === equipmentId);
    // Also check composite/crafted items
    if (!item) {
      const recipe = COMPOSITE_RECIPES.find(r => r.result.id === equipmentId);
      if (recipe) item = recipe.result;
    }
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

  /** Craft a composite equipment from 2 base items */
  craftEquipment(recipeId: string): EquipmentItem | null {
    const recipe = COMPOSITE_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return null;
    
    const inv = [...this.state.equipmentInventory];
    for (const ingredient of recipe.ingredients) {
      const idx = inv.indexOf(ingredient);
      if (idx === -1) return null;
      inv.splice(idx, 1);
    }
    
    // Remove ingredients from inventory
    this.state.equipmentInventory = inv;
    // Add crafted item
    this.state.equipmentInventory.push(recipe.result.id);
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.persistSave();
    return recipe.result;
  }

  getAvailableRecipes() {
    return findAvailableRecipes(this.state.equipmentInventory);
  }

  /** Prestige: reset progress for permanent bonuses */
  canPrestige(): boolean {
    return this.saveData.stats.maxWaveReached >= 20 && !this.state.waveActive;
  }

  getPrestigeLevel(): number {
    return this.saveData.prestige || 0;
  }

  getPrestigeBonus(): number {
    return 1 + (this.saveData.prestige || 0) * 0.1;
  }

  prestige(): boolean {
    if (!this.canPrestige()) return false;
    
    this.saveData.prestige = (this.saveData.prestige || 0) + 1;
    // Keep: stars, talents, equipment, achievements, prestige count
    // Reset: inventory, maps completed, stats
    this.saveData.inventory = [];
    this.saveData.mapsCompleted = [];
    this.saveData.mapDeployments = {};
    this.saveData.totalSummons = 0;
    this.saveData.unlockedCharacters = (this.saveData.unlockedCharacters || []).slice(0, 5);
    this.saveData.unlockShards = 0;
    this.saveData.stats = {
      totalKills: 0, totalGold: 0, bossKills: 0,
      perfectMaps: 0, maxWaveReached: 0, fishCaught: this.saveData.stats.fishCaught,
      dungeonsCompleted: 0,
    };
    this.persistSave();
    
    // Full restart
    this.state = this.createInitialState();
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particleManager.clear();
    this.waveManager = new WaveManager();
    this.waveManager.mapId = this.state.currentMapId;
    return true;
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
    this.saveData.exclusiveTokens = (this.saveData.exclusiveTokens || 0) + Math.max(1, Math.floor(quest.reward.gold / 50));
    this.state.exclusiveTokens = this.saveData.exclusiveTokens;
    saveDailyQuests(this.dailyQuests);
    this.persistSave();
    return true;
  }

  getDailyQuests(): DailyQuestState {
    return this.dailyQuests;
  }

  // ─── Dungeon Mode ───

  startDungeon(dungeonId: string): boolean {
    const dungeon = ALL_DUNGEONS.find(d => d.id === dungeonId);
    if (!dungeon) return false;
    if (isDungeonCompletedToday(dungeonId, this.saveData.dungeonCompletions || {})) return false;

    this.saveDeployments();
    this.activeDungeon = dungeon;
    this.dungeonTimer = 0;

    const map = getDungeonMap(dungeon);
    this.state.currentMapId = map.id;
    this.enemyManager.setWaypoints(map.waypoints);
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particleManager.clear();
    this.waveManager = new WaveManager();
    this.waveManager.mapId = map.id;

    // Override wave manager for dungeon
    this.waveManager.totalWaves = dungeon.totalWaves;
    if (dungeon.rules.forceModifier) {
      this.waveManager.forcedModifier = dungeon.rules.forceModifier;
    }
    if (dungeon.rules.enemyHpMult) {
      this.waveManager.dungeonHpMult = dungeon.rules.enemyHpMult;
    }
    if (dungeon.rules.enemySpeedMult) {
      this.waveManager.dungeonSpeedMult = dungeon.rules.enemySpeedMult;
    }

    const talentBonus = getTalentBonus(this.saveData.talents);
    const inventory = this.state.inventory;

    this.state = {
      ...this.createInitialState(),
      inventory,
      currentMapId: map.id,
      gold: 0,
      totalWaves: dungeon.totalWaves,
    };
    this.state.slots = map.slots.map(s => ({ ...s }));

    return true;
  }

  isDungeonMode(): boolean {
    return this.activeDungeon !== null;
  }

  getDungeonInfo(): { dungeon: DungeonDef; timer: number } | null {
    if (!this.activeDungeon) return null;
    return { dungeon: this.activeDungeon, timer: this.dungeonTimer };
  }

  /** Get allowed rarities in current dungeon (null = all allowed) */
  getDungeonAllowedRarities(): Rarity[] | null {
    return this.activeDungeon?.rules.allowedRarities || null;
  }

  getDungeonMaxUnits(): number | null {
    return this.activeDungeon?.rules.maxUnits || null;
  }

  completeDungeon(): { stars: number; gold: number; equipment?: string } | null {
    if (!this.activeDungeon) return null;
    const dungeon = this.activeDungeon;

    // Mark as completed today
    if (!this.saveData.dungeonCompletions) this.saveData.dungeonCompletions = {};
    this.saveData.dungeonCompletions[dungeon.id] = new Date().toISOString().slice(0, 10);
    this.saveData.stats.dungeonsCompleted = (this.saveData.stats.dungeonsCompleted || 0) + 1;

    // Award rewards
    this.saveData.stars += dungeon.reward.stars;
    this.state.stars = this.saveData.stars;
    this.grantUnlockShards(Math.max(10, Math.floor(dungeon.reward.gold / 10)));
    this.saveData.exclusiveTokens = (this.saveData.exclusiveTokens || 0) + Math.max(1, Math.floor(dungeon.reward.gold / 100));
    this.state.exclusiveTokens = this.saveData.exclusiveTokens;

    let equipDrop: string | undefined;
    if (dungeon.reward.guaranteedEquipRarity) {
      const pool = ALL_EQUIPMENT.filter(e => e.rarity === dungeon.reward.guaranteedEquipRarity);
      if (pool.length > 0) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        this.state.equipmentInventory.push(item.id);
        this.saveData.equipmentInventory = [...this.state.equipmentInventory];
        equipDrop = item.id;
        this.state.lastDrop = item.id;
      }
    }

    this.activeDungeon = null;
    this.dungeonTimer = 0;
    this.persistSave();

    return { stars: dungeon.reward.stars, gold: dungeon.reward.gold, equipment: equipDrop };
  }

  exitDungeon(): void {
    this.activeDungeon = null;
    this.dungeonTimer = 0;
    this.restart();
  }

  getDungeonCompletions(): Record<string, string> {
    return this.saveData.dungeonCompletions || {};
  }
  // ─── Skins System ───

  /** Buy a skin with stars */
  buySkin(skinId: string): boolean {
    if (this.saveData.unlockedSkins.includes(skinId)) return false;
    const skin = getSkinById(skinId);
    if (!skin) return false;
    const cost = skin.unlockCondition.cost;
    if (this.saveData.stars < cost) return false;

    this.saveData.stars -= cost;
    this.state.stars = this.saveData.stars;
    this.saveData.unlockedSkins.push(skinId);
    this.persistSave();
    return true;
  }

  /** Refresh unlocked skins — no-op now that skins are shop-based */
  refreshUnlockedSkins(): string[] {
    return [];
  }

  getUnlockedSkins(): string[] {
    return this.saveData.unlockedSkins || [];
  }

  getEquippedSkins(): Record<string, string> {
    return this.saveData.equippedSkins || {};
  }

  equipSkin(championId: string, skinId: string): boolean {
    if (!this.saveData.unlockedSkins.includes(skinId)) return false;
    const skin = getSkinById(skinId);
    if (!skin || skin.championId !== championId) return false;
    if (!this.saveData.equippedSkins) this.saveData.equippedSkins = {};
    this.saveData.equippedSkins[championId] = skinId;
    this.persistSave();
    return true;
  }

  unequipSkin(championId: string): void {
    if (!this.saveData.equippedSkins) return;
    delete this.saveData.equippedSkins[championId];
    this.persistSave();
  }

  /** Get the effective config colors for a champion (with skin applied) */
  getSkinnedConfig(config: { id: string; bodyColor: string; detailColor: string; weaponColor: string }): { bodyColor: string; detailColor: string; weaponColor: string } {
    const skinId = this.saveData.equippedSkins?.[config.id];
    if (!skinId) return config;
    const skin = getSkinById(skinId);
    if (!skin) return config;
    return { bodyColor: skin.bodyColor, detailColor: skin.detailColor, weaponColor: skin.weaponColor };
  }

  private persistSave(): void {
    this.saveData.inventory = inventoryToSaveData(this.state.inventory);
    this.saveData.equipmentInventory = [...this.state.equipmentInventory];
    this.saveData.gold = 0;
    this.saveData.unlockShards = this.state.unlockShards;
    this.saveData.exclusiveTokens = this.state.exclusiveTokens;
    writeSave(this.saveData);
  }
}
