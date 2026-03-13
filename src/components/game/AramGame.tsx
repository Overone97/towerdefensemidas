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
import { getCharacterStats } from '../../game/data/characterData';
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

  const aram = aramRef.current;
  const enemyManager = enemyManagerRef.current;
  const towerManager = towerManagerRef.current;
  const particleManager = particleRef.current;
  const floatingText = floatingRef.current;
  const screenShake = shakeRef.current;

  // Damage tracker
  const damageTracker = useRef(new Map<number, { totalDamage: number; waveDamage: number }>());

  // State for UI
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Initialize draft
  useEffect(() => {
    aram.startDraft(isDuo);
    enemyManager.setWaypoints(ARAM_MAP.waypoints);
    forceUpdate(n => n + 1);
  }, []);

  // Viewport scaling
  useEffect(() => {
    const updateScale = () => {
      const s = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT) * 0.88;
      setScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Build a GameState-like object for the renderer
  const buildState = useCallback((): GameState => {
    const map = ARAM_MAP;
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
      slots: map.slots.map((s, i) => {
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
    if (aram.phase === 'draft' || aram.phase === 'augment_pick') return;

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

      // Update ARAM wave manager
      aram.update(dt, enemyManager);

      // Enemy movement
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

      // Synergies
      const { activeSynergies, unitBonuses } = computeSynergies(towerManager.units);
      towerManager.synergyBonuses = unitBonuses;
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

      // Tower combat
      const targetable = enemyManager.getTargetableEnemies();
      towerManager.iceDragonAuras = enemyManager.getIceDragonAuras();

      // Apply augment bonuses to tower combat
      const augEffects = aram.combinedEffects;

      const { damages, statusEffects } = towerManager.update(dt, targetable);

      for (const { enemyId, effect } of statusEffects) {
        enemyManager.applyStatusEffect(enemyId, effect);
      }

      // Apply slow on hit from augments
      if (augEffects.slowOnHit) {
        for (const { enemyId } of damages) {
          enemyManager.applyStatusEffect(enemyId, {
            type: 'slow',
            damagePerSecond: 0,
            duration: 1.5,
            slowFactor: 1 - augEffects.slowOnHit,
          });
        }
      }

      for (const { enemyId, damage: rawDmg, unitId } of damages as any[]) {
        let dmg = rawDmg;
        // Augment: attack multiplier
        if (augEffects.attackMult) dmg *= augEffects.attackMult;
        // Augment: crit
        if (augEffects.critChance && Math.random() < augEffects.critChance) {
          dmg *= augEffects.critDamage || 2;
          const enemy = enemyManager.enemies.find(e => e.id === enemyId);
          if (enemy) floatingText.spawn(enemy.x, enemy.y - 15, 'CRIT!', '#ffcc00', 10);
        }

        const enemy = enemyManager.enemies.find(e => e.id === enemyId);
        const result = enemyManager.damageEnemy(enemyId, dmg);

        // Track damage
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

          // Phantom soldiers augment
          if (aram.shouldSpawnAlly()) {
            floatingText.spawn(enemy.x, enemy.y - 20, '👻 Phantom!', '#aa66ff', 11);
          }
        }
      }

      // DOT kills
      for (const enemy of dotKills) {
        const earned = aram.onEnemyKilled(enemy.reward);
        floatingText.spawn(enemy.x, enemy.y, `+${earned}💰`, '#44ff44', 9);
        soundManager.playEnemyDeath();
        particleManager.spawnDeathExplosion(enemy.x, enemy.y, enemy.bodyColor);
      }

      // Meteor impacts
      for (const meteor of aram.pendingMeteors) {
        // Damage enemies in radius
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

      // Unit aura particles
      for (const unit of towerManager.units) {
        if (unit.abilityActive && Math.random() < 0.2) {
          particleManager.spawnLegendaryAura(unit.x, unit.y, unit.config.weaponColor);
        }
      }

      particleManager.update(dt);
      floatingText.update(dt);
      screenShake.update(dt);

      // Render
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
    // Reset wave damage tracking
    for (const [, e] of damageTracker.current) e.waveDamage = 0;
    forceUpdate(n => n + 1);
  }, [aram]);

  const handleAugmentPick = useCallback((augId: string) => {
    aram.pickAugment(augId);
    forceUpdate(n => n + 1);
  }, [aram]);

  const handlePlaceUnit = useCallback((instanceId: number) => {
    if (selectedSlotIndex === null) return;
    const char = aram.getAllCharacters().find(c => c.instanceId === instanceId);
    if (!char) return;
    const map = ARAM_MAP;
    const slot = map.slots[selectedSlotIndex];
    if (!slot) return;
    // Check slot not occupied
    const occupied = towerManager.units.some(u => u.slotIndex === selectedSlotIndex);
    if (occupied) return;
    const alreadyPlaced = towerManager.units.some(u => u.characterInstanceId === instanceId);
    if (alreadyPlaced) return;
    towerManager.placeUnit(char.config, { ...slot, unitId: null }, selectedSlotIndex, instanceId, char.level, char.equipment, char.stars);
    soundManager.playPlaceUnit();
    setSelectedSlotIndex(null);
    forceUpdate(n => n + 1);
  }, [aram, towerManager, selectedSlotIndex]);

  const handleRemoveUnit = useCallback((unitId: number) => {
    towerManager.removeUnit(unitId);
    setSelectedUnitId(null);
    forceUpdate(n => n + 1);
  }, [towerManager]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    // Click on unit
    for (const unit of towerManager.units) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        setSelectedUnitId(selectedUnitId === unit.id ? null : unit.id);
        setSelectedSlotIndex(null);
        return;
      }
    }

    // Click on slot
    const map = ARAM_MAP;
    for (let i = 0; i < map.slots.length; i++) {
      const slot = map.slots[i];
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
  }, [towerManager, selectedUnitId, selectedSlotIndex]);

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
        rerollUsed={aram.rerollUsed}
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
      <AramHUD aram={aram} onStartWave={handleStartWave} onExit={onExit} />

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
              // Auto place all unplaced chars
              for (const char of unplacedChars) {
                const slotIdx = ARAM_MAP.slots.findIndex((_, i) => !towerManager.units.some(u => u.slotIndex === i));
                if (slotIdx >= 0) {
                  const slot = ARAM_MAP.slots[slotIdx];
                  towerManager.placeUnit(char.config, { ...slot, unitId: null }, slotIdx, char.instanceId, char.level, char.equipment, char.stars);
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
