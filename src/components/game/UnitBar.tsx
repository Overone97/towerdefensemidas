import React, { useState } from 'react';
import { GameState, OwnedCharacter } from '../../game/types';
import { RARITY_COLORS, RARITY_LABELS, getCharacterStats } from '../../game/data/characterData';
import { RARITY_RATES } from '../../game/data/gachaData';
import { Rarity } from '../../game/types';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

const ATTACK_PATTERN_ICONS: Record<string, string> = {
  single: '🎯',
  rapid: '⚡',
  aoe_circle: '💥',
  line: '➡️',
  poison: '☠️',
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto flex-1 pr-4">
            {unplacedCharacters.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                {state.inventory.length === 0 ? 'No characters yet. Use Summon tab!' : 'All characters deployed!'}
              </span>
            ) : (
              unplacedCharacters.map(char => {
                const stats = getCharacterStats(char.config, char.level);
                const dps = (stats.attack * stats.attackSpeed).toFixed(1);
                const isHovered = hoveredChar === char.instanceId;

                return (
                  <div key={char.instanceId} className="relative shrink-0">
                    <button
                      onClick={() => onPlaceUnit(char.instanceId)}
                      onMouseEnter={() => setHoveredChar(char.instanceId)}
                      onMouseLeave={() => setHoveredChar(null)}
                      disabled={!slotSelected}
                      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border-2 transition-all
                        ${slotSelected
                          ? 'hover:bg-accent cursor-pointer hover:scale-105'
                          : 'opacity-50 cursor-not-allowed'
                        }
                      `}
                      style={{ borderColor: RARITY_COLORS[char.config.rarity] }}
                    >
                      <CharacterSprite config={char.config} size={32} owned />
                      <span className="text-xs text-foreground font-mono font-semibold">{char.config.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono" style={{ color: RARITY_COLORS[char.config.rarity] }}>
                          Lv.{char.level}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ATTACK_PATTERN_ICONS[char.config.attackPattern]}
                        </span>
                      </div>
                    </button>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="font-bold text-sm text-foreground">{char.config.name}</span>
                            <span className="text-xs font-mono font-bold" style={{ color: RARITY_COLORS[char.config.rarity] }}>
                              {RARITY_LABELS[char.config.rarity]}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {ATTACK_PATTERN_ICONS[char.config.attackPattern]} {ATTACK_PATTERN_LABELS[char.config.attackPattern]}
                          </div>
                          <div className="space-y-0.5 text-xs font-mono">
                            <div className="flex justify-between"><span className="text-muted-foreground">ATK</span><span className="text-foreground">{stats.attack}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">SPD</span><span className="text-foreground">{stats.attackSpeed.toFixed(1)}/s</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">RNG</span><span className="text-foreground">{stats.range}</span></div>
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
                <CharacterSprite config={lastSummon.config} size={20} owned />
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
