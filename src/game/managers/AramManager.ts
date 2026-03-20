import { EnemyType, CharacterConfig, OwnedCharacter } from '../types';
import { EnemyManager } from './EnemyManager';
import {
  ARAM_MAP, AramEvent, ARAM_EVENTS, Augmentation,
  AugmentEffect, combineAugmentEffects, rollAugments,
  getAramWaveConfig, getAramEnemyPool, isAramBossWave, getAramBossType,
} from '../data/aramData';
import { ENEMY_CONFIGS } from '../data/waveData';
import { ALL_CHARACTERS } from '../data/characterData';

let nextAramInstanceId = 90000;

export type AramPhase = 'draft' | 'playing' | 'augment_pick' | 'champion_pick' | 'game_over';

export interface AramShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  maxStacks: number;
}

const ARAM_SHOP_ITEMS: AramShopItem[] = [
  { id: 'forge_blade', name: 'Lame de forge', icon: '🗡️', description: '+10% ATK (stack max 5)', cost: 90, maxStacks: 5 },
  { id: 'swift_gloves', name: 'Gants véloces', icon: '🧤', description: '+8% Vitesse d’attaque (stack max 5)', cost: 85, maxStacks: 5 },
  { id: 'scout_lens', name: 'Lentille éclaireuse', icon: '🔭', description: '+10% portée (stack max 3)', cost: 110, maxStacks: 3 },
  { id: 'bounty_charm', name: 'Charme du butin', icon: '🪙', description: '+1 or par kill (stack max 10)', cost: 70, maxStacks: 10 },
  { id: 'fortify_core', name: 'Noyau fortifié', icon: '🛡️', description: '+1 bouclier base par vague (stack max 5)', cost: 120, maxStacks: 5 },
  { id: 'medkit', name: 'Medkit Nexus', icon: '💊', description: 'Rend 3 PV base instantanément', cost: 100, maxStacks: 999 },
];

export class AramManager {
  phase: AramPhase = 'draft';
  currentWave = 0;
  waveActive = false;

  // Draft
  draftChoices: CharacterConfig[] = [];
  rerollsLeft = 1;
  pickedCharacters: OwnedCharacter[] = [];

  // Champion pick (every 5 waves)
  championChoices: CharacterConfig[] = [];

  // Augments
  ownedAugments: string[] = [];
  augmentChoices: Augmentation[] = [];
  combinedEffects: AugmentEffect = {};

  // Waves
  private spawnTimer = 0;
  private spawned = 0;
  private enemyCount = 0;
  private spawnInterval = 800;
  private hpMult = 1;
  private speedMult = 1;
  private rewardMult = 1;
  private enemyPool: { type: EnemyType; weight: number }[] = [];
  private totalWeight = 0;
  private bossSpawned = false;

  // Events
  activeEvent: AramEvent | null = null;
  eventTimer = 0;
  private nextEventWave = 12 + Math.floor(Math.random() * 6);

  // Meteor
  meteorTimer = 0;
  pendingMeteors: { x: number; y: number; damage: number }[] = [];

  // Kill tracking for phantom soldiers
  killsSinceLastAlly = 0;

  // Duo mode
  isDuo = false;
  player2Choices: CharacterConfig[] = [];
  player2Picked: OwnedCharacter[] = [];

  // Score
  score = 0;
  gold = 150;
  baseHp = 20;
  maxBaseHp = 20;

  // Mini turrets spawned flag
  miniTurretsSpawned = 0;

  // Shop bonuses (ARAM-only economy)
  shopStacks: Record<string, number> = {};
  shopBonuses = {
    attackMult: 1,
    speedMult: 1,
    rangeMult: 1,
    bonusGoldPerKill: 0,
    baseShieldPerWave: 0,
  };
  baseShield = 0;

  // Available slots count (base 6, can grow with augments)
  get availableSlotCount(): number {
    return Math.min(ARAM_MAP.slots.length, 6 + (this.combinedEffects.extraSlots || 0));
  }

  startDraft(duo: boolean): void {
    this.isDuo = duo;
    this.phase = 'draft';
    this.rerollsLeft = 1;
    this.draftChoices = this.rollDraftChoices();
    if (duo) {
      this.player2Choices = this.rollDraftChoices();
      this.baseHp += 5;
      this.maxBaseHp += 5;
    }
  }

  private rollDraftChoices(): CharacterConfig[] {
    const pool = [...ALL_CHARACTERS].filter(c => c.id !== 'fizz');
    const picks: CharacterConfig[] = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picks;
  }

  rerollDraft(player: 1 | 2 = 1): CharacterConfig[] {
    if (this.rerollsLeft <= 0) return player === 1 ? this.draftChoices : this.player2Choices;
    this.rerollsLeft--;
    if (player === 1) {
      this.draftChoices = this.rollDraftChoices();
      return this.draftChoices;
    } else {
      this.player2Choices = this.rollDraftChoices();
      return this.player2Choices;
    }
  }

  pickCharacter(config: CharacterConfig, player: 1 | 2 = 1): OwnedCharacter {
    const char: OwnedCharacter = {
      instanceId: nextAramInstanceId++,
      config,
      level: 1,
      equipment: {},
      stars: 1,
    };
    if (player === 1) {
      this.pickedCharacters.push(char);
    } else {
      this.player2Picked.push(char);
    }
    return char;
  }

  // Pick a new champion (offered every 5 waves)
  pickNewChampion(config: CharacterConfig): void {
    const char: OwnedCharacter = {
      instanceId: nextAramInstanceId++,
      config,
      level: Math.max(1, Math.floor(this.currentWave / 3)),
      equipment: {},
      stars: 1,
    };
    this.pickedCharacters.push(char);
    this.championChoices = [];
    this.phase = 'playing';
  }

  finishDraft(): void {
    this.phase = 'playing';
    this.gold = this.isDuo ? 250 : 150;
    this.shopStacks = {};
    this.shopBonuses = { attackMult: 1, speedMult: 1, rangeMult: 1, bonusGoldPerKill: 0, baseShieldPerWave: 0 };
    this.baseShield = 0;
  }

  // ─── Wave System ───

  startWave(): boolean {
    if (this.waveActive || this.phase !== 'playing') return false;
    this.currentWave++;
    const config = getAramWaveConfig(this.currentWave, this.combinedEffects);
    this.spawnTimer = 0;
    this.spawned = 0;
    this.enemyCount = config.enemyCount;
    this.spawnInterval = config.spawnInterval;
    this.hpMult = config.enemyHpMultiplier;
    this.speedMult = config.enemySpeedMultiplier;
    this.rewardMult = config.enemyRewardMultiplier;
    this.bossSpawned = false;
    this.enemyPool = getAramEnemyPool(this.currentWave);
    this.totalWeight = this.enemyPool.reduce((s, e) => s + e.weight, 0);
    this.waveActive = true;
    this.baseShield = this.shopBonuses.baseShieldPerWave;

    if (this.combinedEffects.bonusGoldPerWave && this.currentWave % 3 === 0) {
      this.gold += this.combinedEffects.bonusGoldPerWave;
    }

    if (this.currentWave >= this.nextEventWave) {
      this.triggerRandomEvent();
      this.nextEventWave = this.currentWave + 10 + Math.floor(Math.random() * 8);
    }

    return true;
  }

  update(dt: number, enemyManager: EnemyManager): void {
    if (!this.waveActive || this.phase !== 'playing') return;

    // Event timer
    if (this.activeEvent) {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) {
        if (this.activeEvent.effect.enemyStealth) {
          for (const e of enemyManager.enemies) {
            if (e.alive) e.stealthed = false;
          }
        }
        this.activeEvent = null;
      }
    }

    // Meteor rain
    if (this.combinedEffects.meteorInterval) {
      this.meteorTimer -= dt;
      if (this.meteorTimer <= 0) {
        this.meteorTimer = this.combinedEffects.meteorInterval;
        const alive = enemyManager.getAliveEnemies();
        if (alive.length > 0) {
          const target = alive[Math.floor(Math.random() * alive.length)];
          this.pendingMeteors.push({
            x: target.x,
            y: target.y,
            damage: this.combinedEffects.meteorDamage || 150,
          });
        }
      }
    }

    // Spawn enemies
    this.spawnTimer -= dt * 1000;
    if (this.spawnTimer <= 0 && this.spawned < this.enemyCount) {
      const isBoss = isAramBossWave(this.currentWave) && !this.bossSpawned && this.spawned >= Math.floor(this.enemyCount * 0.4);

      let enemyType: EnemyType;
      if (isBoss) {
        enemyType = getAramBossType(this.currentWave);
        this.bossSpawned = true;
      } else {
        enemyType = this.rollEnemyType();
      }

      const config = ENEMY_CONFIGS[enemyType];
      const speedEventMult = this.activeEvent?.effect.enemySpeedMult || 1;
      enemyManager.spawnEnemy(config, this.hpMult, this.speedMult * speedEventMult, this.rewardMult);

      if (this.activeEvent?.effect.enemyStealth) {
        const last = enemyManager.enemies[enemyManager.enemies.length - 1];
        if (last) last.stealthed = true;
      }

      this.spawned++;
      this.spawnTimer = this.spawnInterval;
    }

    // Check wave complete
    if (this.spawned >= this.enemyCount && enemyManager.getAliveEnemies().length === 0) {
      this.waveActive = false;

      // Every 5 waves: augment pick THEN champion pick
      if (this.currentWave % 5 === 0) {
        this.augmentChoices = rollAugments(this.ownedAugments);
        this.phase = 'augment_pick';
      }
    }
  }

  pickAugment(augId: string): void {
    this.ownedAugments.push(augId);
    this.combinedEffects = combineAugmentEffects(this.ownedAugments);
    this.augmentChoices = [];

    // Apply immediate effects
    if (this.combinedEffects.baseHpBonus) {
      const newMax = 20 + this.combinedEffects.baseHpBonus;
      const diff = newMax - this.maxBaseHp;
      this.maxBaseHp = Math.max(1, newMax);
      if (diff > 0) this.baseHp = Math.min(this.baseHp + diff, this.maxBaseHp);
      else this.baseHp = Math.min(this.baseHp, this.maxBaseHp);
    }

    // After augment pick, offer a new champion
    this.championChoices = this.rollDraftChoices();
    this.phase = 'champion_pick';
  }

  onEnemyKilled(reward: number): number {
    const goldMult = (this.combinedEffects.goldMult || 1) * (this.activeEvent?.effect.goldMult || 1);
    const earned = Math.floor(reward * goldMult) + this.shopBonuses.bonusGoldPerKill;
    this.gold += earned;
    this.score += reward;
    this.killsSinceLastAlly++;
    return earned;
  }

  shouldSpawnAlly(): boolean {
    if (!this.combinedEffects.allySpawnKills) return false;
    if (this.killsSinceLastAlly >= this.combinedEffects.allySpawnKills) {
      this.killsSinceLastAlly = 0;
      return true;
    }
    return false;
  }

  onBaseHit(): boolean {
    if (this.baseShield > 0) {
      this.baseShield--;
      return false;
    }
    this.baseHp--;
    return this.baseHp <= 0;
  }

  gameOver(): void {
    this.phase = 'game_over';
  }

  private rollEnemyType(): EnemyType {
    let roll = Math.random() * this.totalWeight;
    for (const entry of this.enemyPool) {
      roll -= entry.weight;
      if (roll <= 0) return entry.type;
    }
    return 'normal';
  }

  private triggerRandomEvent(): void {
    const event = ARAM_EVENTS[Math.floor(Math.random() * ARAM_EVENTS.length)];
    this.activeEvent = event;
    this.eventTimer = event.duration;
  }

  getMap() {
    return ARAM_MAP;
  }

  getShopItems(): AramShopItem[] {
    return ARAM_SHOP_ITEMS;
  }

  getShopStack(itemId: string): number {
    return this.shopStacks[itemId] || 0;
  }

  canBuyShopItem(itemId: string): boolean {
    const item = ARAM_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    const stacks = this.getShopStack(itemId);
    return this.gold >= item.cost && stacks < item.maxStacks;
  }

  buyShopItem(itemId: string): boolean {
    const item = ARAM_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    const stacks = this.getShopStack(itemId);
    if (this.gold < item.cost || stacks >= item.maxStacks) return false;

    this.gold -= item.cost;
    this.shopStacks[itemId] = stacks + 1;

    switch (itemId) {
      case 'forge_blade':
        this.shopBonuses.attackMult = Math.min(2.2, this.shopBonuses.attackMult + 0.10);
        break;
      case 'swift_gloves':
        this.shopBonuses.speedMult = Math.min(2.0, this.shopBonuses.speedMult + 0.08);
        break;
      case 'scout_lens':
        this.shopBonuses.rangeMult = Math.min(1.5, this.shopBonuses.rangeMult + 0.10);
        break;
      case 'bounty_charm':
        this.shopBonuses.bonusGoldPerKill += 1;
        break;
      case 'fortify_core':
        this.shopBonuses.baseShieldPerWave += 1;
        this.baseShield += 1;
        break;
      case 'medkit':
        this.baseHp = Math.min(this.maxBaseHp, this.baseHp + 3);
        break;
      default:
        break;
    }

    return true;
  }

  getAllCharacters(): OwnedCharacter[] {
    return [...this.pickedCharacters, ...this.player2Picked];
  }
}
