import React from 'react';
import { GameState, OwnedCharacter } from '../../game/types';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import { RARITY_RATES } from '../../game/data/gachaData';
import { Rarity } from '../../game/types';
import { Button } from '../ui/button';

interface UnitBarProps {
  state: GameState;
  unplacedCharacters: OwnedCharacter[];
  lastSummon: OwnedCharacter | null;
  onPlaceUnit: (instanceId: number) => void;
  onSummon: () => void;
  onStartWave: () => void;
  onToggleAutoWave: () => void;
}

const UnitBar: React.FC<UnitBarProps> = ({ state, unplacedCharacters, lastSummon, onPlaceUnit, onSummon, onStartWave, onToggleAutoWave }) => {
  const canStartWave = !state.waveActive && !state.gameOver && !state.victory;
  const slotSelected = state.selectedSlotIndex !== null;
  const isGameTab = state.activeTab === 'game';

  return (
    <div className="px-4 py-3 bg-card border-t border-border">
      {isGameTab ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto flex-1 pr-4">
            {unplacedCharacters.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                {state.inventory.length === 0 ? 'No characters yet. Use Summon tab!' : 'All characters deployed!'}
              </span>
            ) : (
              unplacedCharacters.map(char => (
                <button
                  key={char.instanceId}
                  onClick={() => onPlaceUnit(char.instanceId)}
                  disabled={!slotSelected}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all shrink-0
                    ${slotSelected
                      ? 'hover:bg-accent cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                  style={{ borderColor: RARITY_COLORS[char.config.rarity] }}
                >
                  <div
                    className="w-6 h-6 rounded-sm"
                    style={{ backgroundColor: char.config.bodyColor }}
                  />
                  <span className="text-xs text-foreground font-mono">{char.config.name}</span>
                  <span className="text-xs font-mono" style={{ color: RARITY_COLORS[char.config.rarity] }}>
                    Lv.{char.level}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={onToggleAutoWave}
              variant={state.autoWave ? 'destructive' : 'outline'}
              size="sm"
              className="shrink-0"
            >
              {state.autoWave ? '⏸ Auto' : '▶ Auto'}
            </Button>
            <Button
              onClick={onStartWave}
              disabled={!canStartWave}
              variant={canStartWave ? 'default' : 'secondary'}
              className="px-6 shrink-0"
            >
              {state.waveActive
                ? `Wave ${state.currentWave}...`
                : state.currentWave === 0
                ? 'Start Game'
                : `Start Wave ${state.currentWave + 1}`
              }
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onSummon}
              disabled={state.gold < state.gachaCost || state.inventory.length >= 20}
              className="px-6 shrink-0"
            >
              🎲 Summon ({state.gachaCost}g)
            </Button>
            <div className="flex gap-3 text-xs flex-wrap">
              {(Object.entries(RARITY_RATES) as [Rarity, number][]).map(([rarity, rate]) => (
                <span key={rarity} className="font-mono" style={{ color: RARITY_COLORS[rarity] }}>
                  {RARITY_LABELS[rarity]}: {(rate * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {lastSummon && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg border-2 animate-fade-in"
                style={{ borderColor: RARITY_COLORS[lastSummon.config.rarity] }}
              >
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: lastSummon.config.bodyColor }} />
                <span className="text-sm text-foreground font-bold">{lastSummon.config.name}</span>
                <span className="text-xs font-bold" style={{ color: RARITY_COLORS[lastSummon.config.rarity] }}>
                  {RARITY_LABELS[lastSummon.config.rarity]}
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground font-mono">{state.inventory.length}/20</span>
          </div>
        </div>
      )}
      {slotSelected && isGameTab && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          Select a character to deploy on the selected slot
        </div>
      )}
    </div>
  );
};

export default UnitBar;
