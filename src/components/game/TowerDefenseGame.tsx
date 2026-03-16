import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { OwnedCharacter, TargetPriority } from '../../game/types';
import { EquipmentSlotType } from '../../game/data/equipmentData';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import UnitBar from './UnitBar';
import UnitInfoPanel from './UnitInfoPanel';
import GameOverScreen from './GameOverScreen';
import GachaReveal from './GachaReveal';
import SynergyPanel from './SynergyPanel';
import TalentTree from './TalentTree';
import MapSelect from './MapSelect';
import WikiScreen from './WikiScreen';
import AchievementScreen from './AchievementScreen';
import AchievementToast from './AchievementToast';
import EquipmentPanel from './EquipmentPanel';
import EquipmentDropToast from './EquipmentDropToast';
import DailyQuestPanel from './DailyQuestPanel';
import TeamSidebar from './TeamSidebar';
import TutorialOverlay from './TutorialOverlay';
import SkinSelector from './SkinSelector';
import AramGame from './AramGame';
import { getSkinsForChampion } from '../../game/data/skinData';

type Screen = 'game' | 'talents' | 'maps' | 'wiki' | 'achievements' | 'equipment' | 'aram_solo' | 'aram_duo' | 'skin_shop';

const TowerDefenseGame: React.FC = () => {
  const engineRef = useRef(new GameEngine());
  const [, forceUpdate] = useState(0);
  const [lastSummon, setLastSummon] = useState<OwnedCharacter | null>(null);
  const [revealChar, setRevealChar] = useState<OwnedCharacter | null>(null);
  const [screen, setScreen] = useState<Screen>('game');
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [skinChampionId, setSkinChampionId] = useState<string | null>(null);

  const onStateChange = useCallback(() => {
    forceUpdate(n => n + 1);
  }, []);

  const engine = engineRef.current;
  const state = engine.state;
  const saveData = engine.getSaveData();

  // Poll for new achievements
  useEffect(() => {
    const interval = setInterval(() => {
      const newAch = engine.popNewAchievements();
      if (newAch.length > 0) {
        setAchievementQueue(prev => [...prev, ...newAch]);
      }
      // Auto-refresh unlocked skins
      engine.refreshUnlockedSkins();
    }, 500);
    return () => clearInterval(interval);
  }, [engine]);

  const handlePlaceUnit = useCallback((instanceId: number) => {
    if (state.selectedSlotIndex === null) return;
    engine.placeUnit(state.selectedSlotIndex, instanceId);
    onStateChange();
  }, [engine, state, onStateChange]);

  const handleSummon = useCallback(() => {
    const result = engine.summonCharacter();
    if (result) {
      setLastSummon(result);
      setRevealChar(result);
    }
    onStateChange();
  }, [engine, onStateChange]);

  const handleRevealComplete = useCallback(() => {
    setRevealChar(null);
  }, []);

  const handleStartWave = useCallback(() => {
    engine.startWave();
    onStateChange();
  }, [engine, onStateChange]);

  const handleToggleAutoWave = useCallback(() => {
    engine.state.autoWave = !engine.state.autoWave;
    if (engine.state.autoWave && !engine.state.waveActive) {
      engine.startWave();
    }
    onStateChange();
  }, [engine, onStateChange]);

  const handleUpgrade = useCallback((unitId: number) => {
    engine.upgradeUnit(unitId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleRemove = useCallback((unitId: number) => {
    engine.removeUnit(unitId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleSetPriority = useCallback((unitId: number, priority: TargetPriority) => {
    engine.setTargetPriority(unitId, priority);
    onStateChange();
  }, [engine, onStateChange]);

  const handleActivateAbility = useCallback((unitId: number) => {
    engine.activateAbility(unitId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleSetTab = useCallback((tab: 'game' | 'gacha') => {
    engine.setActiveTab(tab);
    onStateChange();
  }, [engine, onStateChange]);

  const handleRestart = useCallback(() => {
    if (state.endlessMode && state.gameOver) {
      engine.submitEndlessScore();
    }
    if (engine.isDungeonMode()) {
      engine.exitDungeon();
      setScreen('maps');
    } else {
      engine.restart();
    }
    setLastSummon(null);
    onStateChange();
  }, [engine, state, onStateChange]);

  const handleUpgradeTalent = useCallback((talentId: string) => {
    engine.upgradeTalent(talentId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleSelectMap = useCallback((mapId: string) => {
    engine.setMap(mapId);
    setScreen('game');
    setLastSummon(null);
    onStateChange();
  }, [engine, onStateChange]);

  const handleStartEndless = useCallback((mapId: string) => {
    engine.startEndless(mapId);
    setScreen('game');
    setLastSummon(null);
    onStateChange();
  }, [engine, onStateChange]);

  const handleStartDungeon = useCallback((dungeonId: string) => {
    if (engine.startDungeon(dungeonId)) {
      setScreen('game');
      setLastSummon(null);
      onStateChange();
    }
  }, [engine, onStateChange]);

  const handleExitDungeon = useCallback(() => {
    engine.exitDungeon();
    setScreen('maps');
    setLastSummon(null);
    onStateChange();
  }, [engine, onStateChange]);

  const handleFishCaught = useCallback(() => {
    const fizz = state.inventory.find(c => c.config.id === 'fizz');
    if (fizz) {
      setRevealChar(fizz);
    }
  }, [state.inventory]);

  const handleEquip = useCallback((charId: number, eqId: string) => {
    engine.equipItem(charId, eqId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleUnequip = useCallback((charId: number, slot: EquipmentSlotType) => {
    engine.unequipItem(charId, slot);
    onStateChange();
  }, [engine, onStateChange]);

  const handleSummonEquipment = useCallback(() => {
    const item = engine.summonEquipment();
    if (item) {
      setDropToast(item.id);
    }
    onStateChange();
  }, [engine, onStateChange]);

  const handleMerge = useCallback((configId: string, starLevel: number) => {
    const result = engine.mergeCharacters(configId, starLevel);
    if (result) {
      setRevealChar(result);
    }
    onStateChange();
  }, [engine, onStateChange]);

  const handleCraft = useCallback((recipeId: string) => {
    const result = engine.craftEquipment(recipeId);
    if (result) {
      setDropToast(result.id);
    }
    onStateChange();
  }, [engine, onStateChange]);

  const handlePrestige = useCallback(() => {
    if (engine.prestige()) {
      setLastSummon(null);
      onStateChange();
    }
  }, [engine, onStateChange]);

  const handleTutorialComplete = useCallback(() => {
    const sd = engine.getSaveData();
    sd.tutorialCompleted = true;
    onStateChange();
  }, [engine, onStateChange]);

  // Poll for equipment drops
  const [dropToast, setDropToast] = useState<string | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.lastDrop) {
        setDropToast(state.lastDrop);
        engine.clearLastDrop();
      }
    }, 300);
    return () => clearInterval(interval);
  }, [engine, state]);

  if (screen === 'talents') {
    return (
      <TalentTree
        talents={saveData.talents}
        stars={state.stars}
        onUpgradeTalent={handleUpgradeTalent}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'maps') {
    return (
      <MapSelect
        stars={state.stars}
        mapsCompleted={saveData.mapsCompleted}
        questsCompleted={saveData.questsCompleted || []}
        dungeonCompletions={engine.getDungeonCompletions()}
        onSelectMap={handleSelectMap}
        onStartEndless={handleStartEndless}
        onStartDungeon={handleStartDungeon}
        onStartAram={(duo) => setScreen(duo ? 'aram_duo' : 'aram_solo')}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'wiki') {
    return (
      <WikiScreen
        inventory={state.inventory}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'achievements') {
    const achData = engine.getAchievements();
    return (
      <AchievementScreen
        unlocked={achData.unlocked}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'equipment') {
    return (
      <EquipmentPanel
        inventory={state.inventory}
        equipmentInventory={state.equipmentInventory}
        stars={state.stars}
        gachaCost={engine.getEquipmentGachaCost()}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        onSummonEquipment={handleSummonEquipment}
        onCraft={handleCraft}
        availableRecipes={engine.getAvailableRecipes()}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'skin_shop') {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => setScreen('game')} className="px-3 py-1 rounded text-sm bg-muted text-muted-foreground hover:bg-accent">← Retour</button>
          <h2 className="font-bold font-mono">🎨 Boutique de Skins</h2>
          <div className="text-yellow-400 font-mono font-bold">⭐ {state.stars}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {state.inventory.map(char => {
              const skins = getSkinsForChampion(char.config.id);
              if (skins.length === 0) return null;
              return (
                <div key={char.instanceId} className="p-3 rounded-xl border border-border bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-foreground">{char.config.name}</span>
                  </div>
                  <SkinSelector
                    championId={char.config.id}
                    championName={char.config.name}
                    unlockedSkins={engine.getUnlockedSkins()}
                    equippedSkins={engine.getEquippedSkins()}
                    stars={state.stars}
                    onBuy={(skinId) => { engine.buySkin(skinId); onStateChange(); }}
                    onEquip={(cid, sid) => { engine.equipSkin(cid, sid); onStateChange(); }}
                    onUnequip={(cid) => { engine.unequipSkin(cid); onStateChange(); }}
                    onClose={() => {}}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'aram_solo') {
    return <AramGame isDuo={false} onExit={() => setScreen('maps')} />;
  }

  if (screen === 'aram_duo') {
    return <AramGame isDuo={true} onExit={() => setScreen('maps')} />;
  }

  const selectedUnit = state.selectedUnitId
    ? state.placedUnits.find(u => u.id === state.selectedUnitId) ?? null
    : null;

  const placedInstanceIds = new Set(state.placedUnits.map(u => u.characterInstanceId));
  const unplacedCharacters = state.inventory.filter(c => !placedInstanceIds.has(c.instanceId));

  const showTutorial = !saveData.tutorialCompleted && state.inventory.length === 0 && state.currentWave === 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Canvas fills entire background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <GameCanvas engine={engine} onStateChange={onStateChange} onFishCaught={handleFishCaught} />
      </div>

      {/* Floating HUD - top */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <HUD
            state={state}
            onSetTab={handleSetTab}
            onOpenTalents={() => setScreen('talents')}
            onOpenMaps={() => setScreen('maps')}
            onOpenWiki={() => setScreen('wiki')}
            onOpenAchievements={() => setScreen('achievements')}
            onOpenEquipment={() => setScreen('equipment')}
            prestigeLevel={engine.getPrestigeLevel()}
            canPrestige={engine.canPrestige()}
            onPrestige={handlePrestige}
            dungeonInfo={engine.isDungeonMode() ? (() => {
              const info = engine.getDungeonInfo();
              return info ? {
                name: info.dungeon.name,
                icon: info.dungeon.icon,
                timer: info.timer,
                timeLimit: info.dungeon.rules.timeLimit,
                rules: info.dungeon.rules,
              } : null;
            })() : null}
            onExitDungeon={handleExitDungeon}
          />
        </div>
      </div>

      {/* Floating Team Sidebar - left */}
      {state.placedUnits.length > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <TeamSidebar
            placedUnits={state.placedUnits}
            selectedUnitId={state.selectedUnitId}
            onSelectUnit={(id: number) => { engine.selectPlacedUnit(id); onStateChange(); }}
            onActivateAbility={handleActivateAbility}
          />
        </div>
      )}

      {/* Floating Synergy Panel - right */}
      {state.activeSynergies.length > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <SynergyPanel synergies={state.activeSynergies} />
        </div>
      )}

      {/* Floating Unit Info Panel */}
      {selectedUnit && (
        <div className="absolute right-2 bottom-40 z-30 pointer-events-auto">
          <UnitInfoPanel
            unit={selectedUnit}
            gold={state.gold}
            onUpgrade={handleUpgrade}
            onRemove={handleRemove}
            onSetPriority={handleSetPriority}
            onActivateAbility={handleActivateAbility}
            onOpenSkins={(champId) => setSkinChampionId(champId)}
            hasAvailableSkins={getSkinsForChampion(selectedUnit.config.id).length > 0}
          />
        </div>
      )}

      {/* Skin Selector Modal */}
      {skinChampionId && (
        <div className="absolute right-2 bottom-40 z-40 pointer-events-auto">
          <SkinSelector
            championId={skinChampionId}
            championName={state.inventory.find(c => c.config.id === skinChampionId)?.config.name || skinChampionId}
            unlockedSkins={engine.getUnlockedSkins()}
            equippedSkins={engine.getEquippedSkins()}
            stars={state.stars}
            onBuy={(skinId) => { engine.buySkin(skinId); onStateChange(); }}
            onEquip={(cid, sid) => { engine.equipSkin(cid, sid); onStateChange(); }}
            onUnequip={(cid) => { engine.unequipSkin(cid); onStateChange(); }}
            onClose={() => setSkinChampionId(null)}
          />
        </div>
      )}

      {/* Floating UnitBar - bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <UnitBar
            state={state}
            unplacedCharacters={unplacedCharacters}
            lastSummon={lastSummon}
            onPlaceUnit={handlePlaceUnit}
            onSummon={handleSummon}
            onStartWave={handleStartWave}
            onToggleAutoWave={handleToggleAutoWave}
            onAutoDeploy={() => { engine.autoDeploy(); onStateChange(); }}
            onMerge={handleMerge}
            mergeableGroups={engine.getMergeableGroups()}
          />
        </div>
      </div>

      {/* Game Over / Victory overlay */}
      {(state.gameOver || state.victory) && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto">
          <GameOverScreen
            victory={state.victory}
            score={state.score}
            wave={state.currentWave}
            starsEarned={state.victory && !state.endlessMode ? 3 : 0}
            endlessMode={state.endlessMode}
            leaderboard={engine.getEndlessLeaderboard()}
            mapId={state.currentMapId}
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* Gacha reveal */}
      {revealChar && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <GachaReveal character={revealChar} onComplete={handleRevealComplete} />
        </div>
      )}

      {/* Toasts */}
      {dropToast && (
        <EquipmentDropToast equipmentId={dropToast} onDone={() => setDropToast(null)} />
      )}
      {achievementQueue.length > 0 && (
        <AchievementToast
          achievementId={achievementQueue[0]}
          onDone={() => setAchievementQueue(prev => prev.slice(1))}
        />
      )}

      <DailyQuestPanel engine={engine} onStateChange={onStateChange} />

      {showTutorial && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}
    </div>
  );
};

export default TowerDefenseGame;
