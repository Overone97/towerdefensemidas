import React from 'react';
import { GameState, UnitConfig } from '../../game/types';
import { UNIT_CONFIGS } from '../../game/data/unitData';
import { Button } from '../ui/button';

interface UnitBarProps {
  state: GameState;
  onPlaceUnit: (config: UnitConfig) => void;
  onStartWave: () => void;
}

const UnitBar: React.FC<UnitBarProps> = ({ state, onPlaceUnit, onStartWave }) => {
  const canStartWave = !state.waveActive && !state.gameOver && !state.victory;
  const slotSelected = state.selectedSlotIndex !== null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-border">
      <div className="flex items-center gap-2">
        {UNIT_CONFIGS.map((config) => {
          const canAfford = state.gold >= config.cost;
          return (
            <button
              key={config.id}
              onClick={() => onPlaceUnit(config)}
              disabled={!slotSelected || !canAfford}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all
                ${slotSelected && canAfford
                  ? 'border-primary bg-primary/10 hover:bg-primary/20 cursor-pointer'
                  : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div
                className="w-6 h-6 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-foreground font-mono">{config.name}</span>
              <span className="text-xs text-yellow-400 font-mono">{config.cost}g</span>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onStartWave}
        disabled={!canStartWave}
        variant={canStartWave ? 'default' : 'secondary'}
        className="px-6"
      >
        {state.waveActive
          ? `Wave ${state.currentWave}...`
          : state.currentWave === 0
          ? 'Start Game'
          : `Start Wave ${state.currentWave + 1}`
        }
      </Button>
    </div>
  );
};

export default UnitBar;
