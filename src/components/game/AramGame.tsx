import React, { useRef, useEffect, useCallback, useState } from 'react';
import { AramManager } from '../../game/managers/AramManager';
import { EnemyManager } from '../../game/managers/EnemyManager';
import { TowerManager } from '../../game/managers/TowerManager';
import { ParticleManager } from '../../game/managers/ParticleManager';
import { FloatingTextManager } from '../../game/managers/FloatingTextManager';
import { ScreenShake } from '../../game/managers/ScreenShake';
import { computeSynergies } from '../../game/managers/SynergyManager';
import { renderGame } from './GameRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import { ARAM_MAP } from '../../game/data/aramData';
import { CharacterConfig, GameState, OwnedCharacter } from '../../game/types';
import { getCharacterStats, ALL_CHARACTERS } from '../../game/data/characterData';
import { soundManager } from '../../game/audio/SoundManager';
import AramDraftScreen from './AramDraftScreen';
import AramAugmentPicker from './AramAugmentPicker';
import AramHUD from './AramHUD';
import UnitBar from './UnitBar';
import UnitInfoPanel from './UnitInfoPanel';
import TeamSidebar from './TeamSidebar';
import GameOverScreen from './GameOverScreen';

interface Props {
  isDuo: boolean;
  onExit: () => void;
}

const AramGame: React.FC<Props> = ({ isDuo, onExit }) => {
  const aramRef = useRef(new AramManager());
  const enemyManagerRef = useRef(new EnemyManager());
  const towerManagerRef = useRef(new TowerManager());
  const particleRef = useRef(new ParticleManager());
  const floatingRef = useRef(new FloatingTextManager());
  const shakeRef = useRef(new ScreenShake());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [, forceUpdate] = useState(0);
  const [scale, setScale] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(1);

  // Drag & drop state
  const [dragUnitId, setDragUnitId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const aram = aramRef.current;
  const enemyManager = enemyManagerRef.current;
  const towerManager = towerManagerRef.current;
  const particleManager = particleRef.current;
  const floatingText = floatingRef.current;
  const screenShake = shakeRef.current;

  const damageTracker = useRef(new Map<number, { totalDamage: number; waveDamage: number }>());
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  useEffect(() => {
    aram.startDraft(isDuo);
    enemyManager.setWaypoints(ARAM_MAP.waypoints);
    forceUpdate(n => n + 1);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const s = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT) * 0.88;
      setScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Apply level-up augment when augments change
  useEffect(() => {
    if (aram.combinedEffects.levelUpAll) {
      for (const unit of towerManager.units) {
        // Only level up to the augment level
        const targetLevel = 1 + (aram.combinedEffects.levelUpAll || 0) + Math.floor(aram.currentWave / 3);
        if (unit.level < targetLevel) unit.level = targetLevel;
      }
    }
  }, [aram.ownedAugments.length]);

  const buildState = useCallback((): GameState => {
    const map = ARAM_MAP;
    const slotCount = aram.availableSlotCount;
    return {
      gold: aram.gold,
      baseHp: aram.baseHp,
      maxBaseHp: aram.maxBaseHp,
      currentWave: aram.currentWave,
      waveActive: aram.waveActive,
      enemies: enemyManager.enemies,
      placedUnits: towerManager.units,
      projectiles: towerManager.projectiles,
      aoeWaves: towerManager.aoeWaves,
      groundEffects: towerManager.groundEffects,
      slots: map.slots.slice(0, slotCount).map((s, i) => {
        const unit = towerManager.units.find(u => u.slotIndex === i);
        return { ...s, unitId: unit?.id ?? null };
      }),
      selectedSlotIndex,
      selectedUnitId,
      gameOver: aram.phase === 'game_over',
      victory: false,
      score: aram.score,
      enemiesSpawned: 0,
      enemiesKilled: 0,
      totalWaves: Infinity,
      inventory: aram.getAllCharacters(),
      gachaCost: 999,
      totalSummons: 0,
      activeTab: 'game',
      activeSynergies: [],
      stars: 0,
      currentMapId: 'aram',
      autoWave: false,
      endlessMode: true,
      waveEnemiesSpawned: 0,
      waveEnemiesTotal: 0,
      waveEnemiesKilledThisWave: 0,
      equipmentInventory: [],
      lastDrop: null,
      gameSpeed,
    };
  }, [aram, enemyManager, towerManager, selectedSlotIndex, selectedUnitId, gameSpeed]);

  // Game loop
  useEffect(() => {
    if (aram.phase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;
      const dt = rawDt * gameSpeed;

      aram.update(dt, enemyManager);

      const { reachedEnd, dotKills, dotDamages } = enemyManager.update(dt);
      for (const enemy of reachedEnd) {
        const dead = aram.onBaseHit();
        screenShake.trigger(6, 0.3);
        floatingText.spawn(enemy.x, enemy.y, '-1 HP', '#ff4444', 12);
        if (dead) {
          aram.gameOver();
          soundManager.playGameOver();
        }
      }

      const { activeSynergies, unitBonuses } = computeSynergies(towerManager.units);
      towerManager.synergyBonuses = unitBonuses;
      towerManager.talentBonus = {
        attackMult: aram.shopBonuses.attackMult,
        speedMult: aram.shopBonuses.speedMult,
        rangeMult: aram.shopBonuses.rangeMult,
      };
      towerManager.setWaypoints(ARAM_MAP.waypoints);

      // Stealth reveal
      for (const unit of towerManager.units) {
        if (!unit.config.canRevealStealth) continue;
        const stats = getCharacterStats(unit.config, unit.level, unit.stars);
        for (const enemy of enemyManager.enemies) {
          if (!enemy.alive || !enemy.stealthed) continue;
          const dx = enemy.x - unit.x;
          const dy = enemy.y - unit.y;
          if (dx * dx + dy * dy <= stats.range * stats.range) {
            enemy.stealthed = false;
          }
        }
      }

      const targetable = enemyManager.getTargetableEnemies();
      towerManager.iceDragonAuras = enemyManager.getIceDragonAuras();

      const augEffects = aram.combinedEffects;
      const { damages, statusEffects } = towerManager.update(dt, targetable);

      for (const { enemyId, effect } of statusEffects) {
        enemyManager.applyStatusEffect(enemyId, effect);
      }

      if (augEffects.slowOnHit) {
        for (const { enemyId } of damages) {
          enemyManager.applyStatusEffect(enemyId, {
            type: 'slow', damagePerSecond: 0, duration: 1.5,
            slowFactor: 1 - augEffects.slowOnHit,
          });
        }
      }

      for (const { enemyId, damage: rawDmg, unitId } of damages as Array<{ enemyId: number; damage: number; unitId: number }>) {
        let dmg = rawDmg;
        if (augEffects.attackMult) dmg *= augEffects.attackMult;
        if (augEffects.critChance && Math.random() < augEffects.critChance) {
          dmg *= augEffects.critDamage || 2;
          const enemy = enemyManager.enemies.find(e => e.id === enemyId);
          if (enemy) floatingText.spawn(enemy.x, enemy.y - 15, 'CRIT!', '#ffcc00', 10);
        }

        const enemy = enemyManager.enemies.find(e => e.id === enemyId);
        const result = enemyManager.damageEnemy(enemyId, dmg);

        if (unitId) {
          let entry = damageTracker.current.get(unitId);
          if (!entry) { entry = { totalDamage: 0, waveDamage: 0 }; damageTracker.current.set(unitId, entry); }
          entry.totalDamage += dmg;
          entry.waveDamage += dmg;
        }

        if (result.killed && enemy) {
          const earned = aram.onEnemyKilled(result.reward);
          floatingText.spawn(enemy.x, enemy.y, `+${earned}💰`, '#ffdd44', 9);
          if (enemy.type === 'boss' || enemy.type.startsWith('dragon_')) {
            soundManager.playBossDeath();
            screenShake.trigger(10, 0.5);
            particleManager.spawnBossExplosion(enemy.x, enemy.y);
          } else {
            soundManager.playEnemyDeath();
            particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
          }

          if (aram.shouldSpawnAlly()) {
            floatingText.spawn(enemy.x, enemy.y - 20, '👻 Phantom!', '#aa66ff', 11);
          }
        }
      }

      for (const enemy of dotKills) {
        const earned = aram.onEnemyKilled(enemy.reward);
        floatingText.spawn(enemy.x, enemy.y, `+${earned}💰`, '#44ff44', 9);
        soundManager.playEnemyDeath();
        particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
      }

      // Meteor impacts
      for (const meteor of aram.pendingMeteors) {
        for (const enemy of enemyManager.enemies) {
          if (!enemy.alive) continue;
          const dx = enemy.x - meteor.x;
          const dy = enemy.y - meteor.y;
          if (dx * dx + dy * dy < 60 * 60) {
            const result = enemyManager.damageEnemy(enemy.id, meteor.damage);
            if (result.killed) {
              aram.onEnemyKilled(result.reward);
              particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
            }
          }
        }
        particleManager.spawnBossExplosion(meteor.x, meteor.y);
        floatingText.spawn(meteor.x, meteor.y, '☄️', '#ff6600', 14);
      }
      aram.pendingMeteors = [];

      // Mini turrets: spawn auto-attacking units on path
      if (aram.combinedEffects.miniTurrets && aram.miniTurretsSpawned < (aram.combinedEffects.miniTurrets || 0)) {
        const turretConfig: CharacterConfig = {
          id: '_turret', name: 'Mini Turret', rarity: 'common',
          attack: 8 + aram.currentWave * 2, attackSpeed: 2.0, range: 120,
          attackPattern: 'rapid', bodyColor: '#aaccff', detailColor: '#6688cc', weaponColor: '#ffffff',
        };
        // Place on waypoint midpoints
        const wp = ARAM_MAP.waypoints;
        for (let t = 0; t < (aram.combinedEffects.miniTurrets || 0) - aram.miniTurretsSpawned && t < wp.length - 1; t++) {
          const idx = Math.floor((t + 1) * wp.length / ((aram.combinedEffects.miniTurrets || 2) + 1));
          const midX = (wp[Math.min(idx, wp.length - 1)].x + wp[Math.min(idx + 1, wp.length - 1)].x) / 2;
          const midY = (wp[Math.min(idx, wp.length - 1)].y + wp[Math.min(idx + 1, wp.length - 1)].y) / 2;
          // Place as a non-slot unit
          const fakeSlot = { x: midX, y: midY - 40, unitId: null };
          towerManager.placeUnit(turretConfig, fakeSlot, 100 + aram.miniTurretsSpawned, 80000 + aram.miniTurretsSpawned, 1 + Math.floor(aram.currentWave / 5), {}, 1);
          aram.miniTurretsSpawned++;
        }
      }

      // Auto abilities
      const alive = enemyManager.getTargetableEnemies();
      if (alive.length > 0) {
        for (const unit of towerManager.units) {
          if (unit.abilityCooldown <= 0 && !unit.abilityActive) {
            const stats = getCharacterStats(unit.config, unit.level, unit.stars);
            const inRange = alive.some(e => {
              const dx = e.x - unit.x;
              const dy = e.y - unit.y;
              return Math.sqrt(dx * dx + dy * dy) <= stats.range * 1.5;
            });
            if (inRange) {
              const { damages: aDmg, statusEffects: aSE } = towerManager.activateAbility(unit.id, enemyManager.getAliveEnemies());
              for (const { enemyId, effect } of aSE) enemyManager.applyStatusEffect(enemyId, effect);
              for (const { enemyId, damage } of aDmg) {
                const r = enemyManager.damageEnemy(enemyId, damage);
                if (r.killed) aram.onEnemyKilled(r.reward);
              }
            }
          }
        }
      }

      for (const unit of towerManager.units) {
        if (unit.abilityActive && Math.random() < 0.2) {
          particleManager.spawnLegendaryAura(unit.x, unit.y, unit.config.weaponColor);
        }
      }

      particleManager.update(dt);
      floatingText.update(dt);
      screenShake.update(dt);

      frameCount++;
      if (frameCount % 120 === 0) ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(screenShake.offsetX, screenShake.offsetY);
      const state = buildState();
      renderGame(ctx, state, ARAM_MAP.waypoints, timestamp, {});
      particleManager.render(ctx);
      floatingText.render(ctx);
      ctx.restore();

      forceUpdate(n => n + 1);
      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [aram.phase, gameSpeed]);

  // ─── Handlers ───

  const handleDraftPick = useCallback((config: CharacterConfig, player: 1 | 2) => {
    aram.pickCharacter(config, player);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleReroll = useCallback((player: 1 | 2) => {
    aram.rerollDraft(player);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleDraftStart = useCallback(() => {
    aram.finishDraft();
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleStartWave = useCallback(() => {
    aram.startWave();
    for (const [, e] of damageTracker.current) e.waveDamage = 0;
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleAugmentPick = useCallback((augId: string) => {
    aram.pickAugment(augId);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleBuyShopItem = useCallback((itemId: string) => {
    aram.buyShopItem(itemId);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleChampionPick = useCallback((config: CharacterConfig) => {
    aram.pickNewChampion(config);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handlePlaceUnit = useCallback((instanceId: number) => {
    const char = aram.getAllCharacters().find(c => c.instanceId === instanceId);
    if (!char) return;
    const alreadyPlaced = towerManager.units.some(u => u.characterInstanceId === instanceId);
    if (alreadyPlaced) return;
    const slotCount = aram.availableSlotCount;

    // If a slot is selected, use it; otherwise auto-find first empty slot
    let targetSlot = selectedSlotIndex;
    if (targetSlot === null || targetSlot >= slotCount || towerManager.units.some(u => u.slotIndex === targetSlot)) {
      // Auto-find first empty slot
      targetSlot = -1;
      for (let i = 0; i < Math.min(ARAM_MAP.slots.length, slotCount); i++) {
        if (!towerManager.units.some(u => u.slotIndex === i)) {
          targetSlot = i;
          break;
        }
      }
      if (targetSlot < 0) return; // No slots available
    }

    const slot = ARAM_MAP.slots[targetSlot];
    if (!slot) return;
    const level = Math.max(1, char.level + (aram.combinedEffects.levelUpAll || 0));
    towerManager.placeUnit(char.config, { ...slot, unitId: null }, targetSlot, instanceId, level, char.equipment, char.stars);
    soundManager.playPlaceUnit();
    setSelectedSlotIndex(null);
    forceUpdate(n => n + 1);
  }, [aram, towerManager, selectedSlotIndex]);

  const handleRemoveUnit = useCallback((unitId: number) => {
    towerManager.removeUnit(unitId);
    setSelectedUnitId(null);
    forceUpdate(n => n + 1);
  }, [towerManager]);

  // Drag & drop: move unit between slots
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    // Check if clicking on a placed unit
    for (const unit of towerManager.units) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        setDragUnitId(unit.id);
        setDragPos({ x, y });
        return;
      }
    }

    // Click on slot
    const slotCount = aram.availableSlotCount;
    for (let i = 0; i < Math.min(ARAM_MAP.slots.length, slotCount); i++) {
      const slot = ARAM_MAP.slots[i];
      const occupied = towerManager.units.some(u => u.slotIndex === i);
      if (occupied) continue;
      const dx = x - slot.x;
      const dy = y - slot.y;
      if (dx * dx + dy * dy < 400) {
        setSelectedSlotIndex(selectedSlotIndex === i ? null : i);
        setSelectedUnitId(null);
        return;
      }
    }

    setSelectedSlotIndex(null);
    setSelectedUnitId(null);
  }, [towerManager, selectedSlotIndex, aram]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragUnitId === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    setDragPos({ x, y });
  }, [dragUnitId]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragUnitId === null) return;
    const canvas = canvasRef.current;
    if (!canvas) { setDragUnitId(null); setDragPos(null); return; }
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const unit = towerManager.units.find(u => u.id === dragUnitId);
    if (unit) {
      // Find closest empty slot
      const slotCount = aram.availableSlotCount;
      let bestSlot = -1;
      let bestDist = 50; // max snap distance
      for (let i = 0; i < Math.min(ARAM_MAP.slots.length, slotCount); i++) {
        const occupied = towerManager.units.some(u => u.id !== dragUnitId && u.slotIndex === i);
        if (occupied) continue;
        const slot = ARAM_MAP.slots[i];
        const dx = x - slot.x;
        const dy = y - slot.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) { bestDist = d; bestSlot = i; }
      }

      if (bestSlot >= 0) {
        // Move unit to new slot
        const slot = ARAM_MAP.slots[bestSlot];
        unit.slotIndex = bestSlot;
        unit.x = slot.x;
        unit.y = slot.y;
        unit.homeX = slot.x;
        unit.homeY = slot.y;
      }
      // If dropped outside slots, remove unit back to inventory
      else {
        towerManager.removeUnit(dragUnitId);
      }
    }

    setDragUnitId(null);
    setDragPos(null);
    setSelectedUnitId(null);
    forceUpdate(n => n + 1);
  }, [dragUnitId, towerManager, aram]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragUnitId !== null) return; // handled by mouseUp
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    for (const unit of towerManager.units) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        setSelectedUnitId(selectedUnitId === unit.id ? null : unit.id);
        setSelectedSlotIndex(null);
        return;
      }
    }

    setSelectedSlotIndex(null);
    setSelectedUnitId(null);
  }, [towerManager, selectedUnitId, dragUnitId]);

  const toggleSpeed = useCallback(() => {
    const speeds = [1, 2, 3, 4];
    const idx = speeds.indexOf(gameSpeed);
    setGameSpeed(speeds[(idx + 1) % speeds.length]);
  }, [gameSpeed]);

  // ─── Render ───

  // Draft phase
  if (aram.phase === 'draft') {
    return (
      <AramDraftScreen
        choices={aram.draftChoices}
        player2Choices={aram.player2Choices}
        rerollsLeft={aram.rerollsLeft}
        isDuo={isDuo}
        onPick={handleDraftPick}
        onReroll={handleReroll}
        onStart={handleDraftStart}
        pickedCount={aram.pickedCharacters.length}
        player2PickedCount={aram.player2Picked.length}
      />
    );
  }

  // Augment pick phase
  if (aram.phase === 'augment_pick') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
            style={{ imageRendering: 'pixelated', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center', opacity: 0.3 }}
          />
        </div>
        <AramAugmentPicker choices={aram.augmentChoices} wave={aram.currentWave} onPick={handleAugmentPick} />
      </div>
    );
  }

  // Champion pick phase (after augment)
  if (aram.phase === 'champion_pick') {
    return (
      <AramDraftScreen
        choices={aram.championChoices}
        rerollsLeft={0}
        isDuo={false}
        onPick={(config) => handleChampionPick(config)}
        onReroll={() => {}}
        onStart={() => {}}
        pickedCount={0}
        player2PickedCount={0}
        isPostWavePick
        wave={aram.currentWave}
      />
    );
  }

  const state = buildState();
  const selectedUnit = selectedUnitId ? towerManager.units.find(u => u.id === selectedUnitId) ?? null : null;
  const placedIds = new Set(towerManager.units.map(u => u.characterInstanceId));
  const unplacedChars = aram.getAllCharacters().filter(c => !placedIds.has(c.instanceId));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            className="cursor-pointer"
            style={{ imageRendering: 'pixelated', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          />
          {/* Speed toggle */}
          <div className="absolute top-2 right-2 flex gap-1" style={{ transform: `scale(${1/scale})`, transformOrigin: 'top right' }}>
            <button onClick={toggleSpeed}
              className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-colors ${
                gameSpeed > 1 ? 'bg-yellow-500 text-black' : 'bg-muted/80 text-muted-foreground hover:bg-accent'
              }`}>
              {gameSpeed === 1 ? '▶ x1' : `⏩ x${gameSpeed}`}
            </button>
          </div>
        </div>
      </div>

      {/* ARAM HUD */}
      <AramHUD aram={aram} onStartWave={handleStartWave} onExit={onExit} onBuyShopItem={handleBuyShopItem} />

      {/* Team sidebar */}
      {towerManager.units.length > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <TeamSidebar
            placedUnits={towerManager.units}
            selectedUnitId={selectedUnitId}
            onSelectUnit={(id) => { setSelectedUnitId(id); setSelectedSlotIndex(null); }}
            onActivateAbility={() => {}}
          />
        </div>
      )}

      {/* Selected unit info */}
      {selectedUnit && (
        <div className="absolute right-2 bottom-40 z-30 pointer-events-auto">
          <UnitInfoPanel
            unit={selectedUnit}
            gold={aram.gold}
            onUpgrade={() => {}}
            onRemove={handleRemoveUnit}
            onSetPriority={() => {}}
            onActivateAbility={() => {}}
            onOpenSkins={() => {}}
            hasAvailableSkins={false}
          />
        </div>
      )}

      {/* Unit bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <UnitBar
            state={state}
            unplacedCharacters={unplacedChars}
            lastSummon={null}
            onPlaceUnit={handlePlaceUnit}
            onSummon={() => {}}
            onStartWave={handleStartWave}
            onToggleAutoWave={() => {}}
            onAutoDeploy={() => {
              const slotCount = aram.availableSlotCount;
              for (const char of unplacedChars) {
                const slotIdx = ARAM_MAP.slots.slice(0, slotCount).findIndex((_, i) => !towerManager.units.some(u => u.slotIndex === i));
                if (slotIdx >= 0) {
                  const slot = ARAM_MAP.slots[slotIdx];
                  const level = Math.max(1, char.level + (aram.combinedEffects.levelUpAll || 0));
                  towerManager.placeUnit(char.config, { ...slot, unitId: null }, slotIdx, char.instanceId, level, char.equipment, char.stars);
                }
              }
              forceUpdate(n => n + 1);
            }}
            onMerge={() => {}}
            mergeableGroups={new Map()}
          />
        </div>
      </div>

      {/* Game Over */}
      {aram.phase === 'game_over' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
          <GameOverScreen
            victory={false}
            score={aram.score}
            wave={aram.currentWave}
            starsEarned={0}
            endlessMode={true}
            leaderboard={[]}
            mapId="aram"
            onRestart={onExit}
          />
        </div>
      )}
    </div>
  );
};

export default AramGame;
