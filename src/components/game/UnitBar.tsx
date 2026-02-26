import React, { useState } from 'react';
import { GameState, OwnedCharacter } from '../../game/types';
import { getCharacterStats } from '../../game/data/characterData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

const ATTACK_PATTERN_ICONS: Record<string, string> = {
  single: '🎯',
  rapid: '⚡',
  aoe_circle: '💥',
  line: '➡️',
  poison: '☠️',
  poison_trail: '☠️',
  mushroom: '🍄',
  slow: '❄️',
  chain: '⚡',
  burst: '💣',
};

const ATTACK_PATTERN_LABELS: Record<string, string> = {
  single: 'Single',
  rapid: 'Rapid',
  aoe_circle: 'AoE',
  line: 'Pierce',
  poison: 'Poison',
  poison_trail: 'Trail',
  mushroom: 'Trap',
  slow: 'Slow',
  chain: 'Chain',
  burst: 'Burst',
};

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
  const [hoveredChar, setHoveredChar] = useState<number | null>(null);
  const canStartWave = !state.waveActive && !state.gameOver && !state.victory;
  const slotSelected = state.selectedSlotIndex !== null;
  const isGameTab = state.activeTab === 'game';

  return (
    <div className="px-4 py-3 bg-card border-t border-border">
      {isGameTab ? (
        <div className="flex flex-col gap-2">
          {/* Action buttons row */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground font-mono">
              {slotSelected ? '👆 Select a unit to deploy' : '📍 Click a slot on the map first'}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onToggleAutoWave}
                variant="outline"
                size="sm"
                className={`shrink-0 ${state.autoWave ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : ''}`}
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

          {/* Unit grid */}
          <div className="flex flex-wrap gap-2">
            {unplacedCharacters.length === 0 ? (
              <span className="text-muted-foreground text-sm py-1">
                {state.inventory.length === 0 ? 'No characters yet. Use Summon tab!' : 'All characters deployed!'}
              </span>
            ) : (
              unplacedCharacters.map(char => {
                const stats = getCharacterStats(char.config, char.level);
                const dps = (stats.attack * stats.attackSpeed).toFixed(1);
                const isHovered = hoveredChar === char.instanceId;

                return (
                  <div key={char.instanceId} className="relative">
                    <button
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(char.instanceId));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onPlaceUnit(char.instanceId)}
                      onMouseEnter={() => setHoveredChar(char.instanceId)}
                      onMouseLeave={() => setHoveredChar(null)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all
                        ${slotSelected
                          ? 'hover:bg-accent cursor-pointer hover:scale-105'
                          : 'hover:bg-accent/50 cursor-grab'
                        } border-border`}
                    >
                      <CharacterSprite config={char.config} size={32} owned />
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-mono font-semibold leading-tight text-foreground">{char.config.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Lv.{char.level}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {ATTACK_PATTERN_ICONS[char.config.attackPattern]}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{dps}dps</span>
                        </div>
                      </div>
                    </button>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="font-bold text-sm">{char.config.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {ATTACK_PATTERN_ICONS[char.config.attackPattern]} {ATTACK_PATTERN_LABELS[char.config.attackPattern]}
                          </div>
                          <div className="space-y-0.5 text-xs font-mono">
                            <div className="flex justify-between"><span className="text-muted-foreground">ATK</span><span>{stats.attack}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">SPD</span><span>{stats.attackSpeed.toFixed(1)}/s</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">RNG</span><span>{stats.range}</span></div>
                            <div className="flex justify-between border-t border-border pt-0.5 mt-0.5">
                              <span className="text-muted-foreground">DPS</span>
                              <span className="text-primary font-bold">{dps}</span>
                            </div>
                          </div>
                          {(char.config.dotDamage || char.config.slowFactor || char.config.aoeRadius) && (
                            <div className="mt-1.5 pt-1.5 border-t border-border space-y-0.5 text-[10px]">
                              {char.config.dotDamage && (
                                <div className="text-green-400">☠️ {char.config.dotDamage}/s for {char.config.dotDuration || 2}s</div>
                              )}
                              {char.config.slowFactor && (
                                <div className="text-blue-400">❄️ {Math.round((1 - char.config.slowFactor) * 100)}% slow for {char.config.slowDuration || 2}s</div>
                              )}
                              {char.config.aoeRadius && (
                                <div className="text-orange-400">💥 AoE radius: {char.config.aoeRadius}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onSummon}
              disabled={state.gold < state.gachaCost || state.inventory.length >= 30}
              className="px-6 shrink-0"
            >
              🥚 Summon ({state.gachaCost}g)
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              Random champion from pool
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {lastSummon && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-border animate-fade-in">
                <CharacterSprite config={lastSummon.config} size={20} owned />
                <span className="text-sm font-bold">{lastSummon.config.name}</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground font-mono">{state.inventory.length}/30</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitBar;
