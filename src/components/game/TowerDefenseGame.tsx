import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { OwnedCharacter, TargetPriority } from '../../game/types';
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

type Screen = 'game' | 'talents' | 'maps' | 'wiki' | 'achievements';

const TowerDefenseGame: React.FC = () => {
  const engineRef = useRef(new GameEngine());
  const [, forceUpdate] = useState(0);
  const [lastSummon, setLastSummon] = useState<OwnedCharacter | null>(null);
  const [revealChar, setRevealChar] = useState<OwnedCharacter | null>(null);
  const [screen, setScreen] = useState<Screen>('game');
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);

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

  const handleSetTab = useCallback((tab: 'game' | 'gacha') => {
    engine.setActiveTab(tab);
    onStateChange();
  }, [engine, onStateChange]);

  const handleRestart = useCallback(() => {
    engine.restart();
    setLastSummon(null);
    onStateChange();
  }, [engine, onStateChange]);

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

  const handleFishCaught = useCallback(() => {
    const leviathan = state.inventory.find(c => c.config.id === 'leviathan');
    if (leviathan) {
      setRevealChar(leviathan);
    }
  }, [state.inventory]);
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
        onSelectMap={handleSelectMap}
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

  const selectedUnit = state.selectedUnitId
    ? state.placedUnits.find(u => u.id === state.selectedUnitId) ?? null
    : null;

  const placedInstanceIds = new Set(state.placedUnits.map(u => u.characterInstanceId));
  const unplacedCharacters = state.inventory.filter(c => !placedInstanceIds.has(c.instanceId));

  return (
    <div className="flex flex-col h-screen bg-background">
      <HUD state={state} onSetTab={handleSetTab} onOpenTalents={() => setScreen('talents')} onOpenMaps={() => setScreen('maps')} onOpenWiki={() => setScreen('wiki')} onOpenAchievements={() => setScreen('achievements')} />
      <div className="flex-1 flex items-center justify-center relative p-4">
        <GameCanvas engine={engine} onStateChange={onStateChange} onFishCaught={handleFishCaught} />
        {state.activeSynergies.length > 0 && (
          <SynergyPanel synergies={state.activeSynergies} />
        )}
        {selectedUnit && (
          <UnitInfoPanel
            unit={selectedUnit}
            gold={state.gold}
            onUpgrade={handleUpgrade}
            onRemove={handleRemove}
            onSetPriority={handleSetPriority}
          />
        )}
        {(state.gameOver || state.victory) && (
          <GameOverScreen
            victory={state.victory}
            score={state.score}
            wave={state.currentWave}
            starsEarned={state.victory ? 3 : 0}
            onRestart={handleRestart}
          />
        )}
        {revealChar && (
          <GachaReveal character={revealChar} onComplete={handleRevealComplete} />
        )}
      </div>
      {achievementQueue.length > 0 && (
        <AchievementToast
          achievementId={achievementQueue[0]}
          onDone={() => setAchievementQueue(prev => prev.slice(1))}
        />
      )}
      <UnitBar
        state={state}
        unplacedCharacters={unplacedCharacters}
        lastSummon={lastSummon}
        onPlaceUnit={handlePlaceUnit}
        onSummon={handleSummon}
        onStartWave={handleStartWave}
        onToggleAutoWave={handleToggleAutoWave}
      />
    </div>
  );
};

export default TowerDefenseGame;
