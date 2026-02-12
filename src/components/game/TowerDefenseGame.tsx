import React, { useState, useCallback, useRef } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { UnitConfig } from '../../game/types';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import UnitBar from './UnitBar';
import UnitInfoPanel from './UnitInfoPanel';
import GameOverScreen from './GameOverScreen';

const TowerDefenseGame: React.FC = () => {
  const engineRef = useRef(new GameEngine());
  const [, forceUpdate] = useState(0);

  const onStateChange = useCallback(() => {
    forceUpdate(n => n + 1);
  }, []);

  const engine = engineRef.current;
  const state = engine.state;

  const handlePlaceUnit = useCallback((config: UnitConfig) => {
    if (state.selectedSlotIndex === null) return;
    engine.placeUnit(state.selectedSlotIndex, config);
    onStateChange();
  }, [engine, state, onStateChange]);

  const handleStartWave = useCallback(() => {
    engine.startWave();
    onStateChange();
  }, [engine, onStateChange]);

  const handleUpgrade = useCallback((unitId: number) => {
    engine.upgradeUnit(unitId);
    onStateChange();
  }, [engine, onStateChange]);

  const handleSetPriority = useCallback((unitId: number, priority: 'closest' | 'weakest' | 'most_advanced') => {
    engine.setTargetPriority(unitId, priority);
    onStateChange();
  }, [engine, onStateChange]);

  const handleRestart = useCallback(() => {
    engine.restart();
    onStateChange();
  }, [engine, onStateChange]);

  const selectedUnit = state.selectedUnitId
    ? state.placedUnits.find(u => u.id === state.selectedUnitId) ?? null
    : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <HUD state={state} />
      <div className="flex-1 flex items-center justify-center relative p-4">
        <GameCanvas engine={engine} onStateChange={onStateChange} />
        {selectedUnit && (
          <UnitInfoPanel
            unit={selectedUnit}
            gold={state.gold}
            onUpgrade={handleUpgrade}
            onSetPriority={handleSetPriority}
          />
        )}
        {(state.gameOver || state.victory) && (
          <GameOverScreen
            victory={state.victory}
            score={state.score}
            wave={state.currentWave}
            onRestart={handleRestart}
          />
        )}
      </div>
      <UnitBar
        state={state}
        onPlaceUnit={handlePlaceUnit}
        onStartWave={handleStartWave}
      />
      {state.selectedSlotIndex !== null && (
        <div className="text-center text-sm text-muted-foreground pb-2">
          Select a unit to place on the slot
        </div>
      )}
    </div>
  );
};

export default TowerDefenseGame;
