import React, { useState, useMemo } from 'react';
import { GameState, OwnedCharacter } from '../../game/types';
import { getCharacterStats } from '../../game/data/characterData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

const ATTACK_PATTERN_ICONS: Record<string, string> = {
  single: '🎯', rapid: '⚡', aoe_circle: '💥', line: '➡️',
  poison: '☠️', poison_trail: '☠️', mushroom: '🍄',
  slow: '❄️', chain: '⚡', burst: '💣',
};

const RARITY_ORDER: Record<string, number> = {
  legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1,
};

type SortMode = 'dps' | 'rarity' | 'name';

interface UnitBarProps {
  state: GameState;
  unplacedCharacters: OwnedCharacter[];
  lastSummon: OwnedCharacter | null;
  onPlaceUnit: (instanceId: number) => void;
  onSummon: () => void;
  onStartWave: () => void;
  onToggleAutoWave: () => void;
  onAutoDeploy: () => void;
}

const UnitBar: React.FC<UnitBarProps> = ({ state, unplacedCharacters, lastSummon, onPlaceUnit, onSummon, onStartWave, onToggleAutoWave, onAutoDeploy }) => {
  const [hoveredChar, setHoveredChar] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('dps');
  const [collapsed, setCollapsed] = useState(false);
  const canStartWave = !state.waveActive && !state.gameOver && !state.victory;
  const slotSelected = state.selectedSlotIndex !== null;
  const isGameTab = state.activeTab === 'game';

  const sortedChars = useMemo(() => {
    const chars = [...unplacedCharacters];
    switch (sortMode) {
      case 'dps':
        return chars.sort((a, b) => {
          const sa = getCharacterStats(a.config, a.level);
          const sb = getCharacterStats(b.config, b.level);
          return (sb.attack * sb.attackSpeed) - (sa.attack * sa.attackSpeed);
        });
      case 'rarity':
        return chars.sort((a, b) => (RARITY_ORDER[b.config.rarity] || 0) - (RARITY_ORDER[a.config.rarity] || 0));
      case 'name':
        return chars.sort((a, b) => a.config.name.localeCompare(b.config.name));
      default:
        return chars;
    }
  }, [unplacedCharacters, sortMode]);

  return (
    <div className="px-4 py-2 bg-card border-t border-border">
      {isGameTab ? (
        <div className="flex flex-col gap-1.5">
          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-accent transition-colors"
              >
                {collapsed ? '▶ Show Units' : '▼ Hide Units'}
              </button>
              {!collapsed && (
                <div className="flex items-center gap-1">
                  {(['dps', 'rarity', 'name'] as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSortMode(mode)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                        sortMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {mode === 'dps' ? '⚔️DPS' : mode === 'rarity' ? '💎Rare' : '🔤Name'}
                    </button>
                  ))}
                </div>
              )}
              <span className="text-xs text-muted-foreground font-mono">
                {slotSelected ? '👆 Select unit' : '📍 Click slot first'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={onAutoDeploy} variant="outline" size="sm"
                className="shrink-0 text-foreground border-border hover:bg-accent text-xs h-7"
                disabled={unplacedCharacters.length === 0}>
                🤖 Auto
              </Button>
              <Button onClick={onToggleAutoWave} variant="outline" size="sm"
                className={`shrink-0 text-xs h-7 ${state.autoWave ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white' : 'text-foreground border-border hover:bg-accent'}`}>
                {state.autoWave ? '⏸ Auto' : '▶ Auto'}
              </Button>
              <Button onClick={onStartWave} disabled={!canStartWave}
                variant={canStartWave ? 'default' : 'secondary'} className="px-6 shrink-0 h-7 text-xs">
                {state.waveActive ? `Wave ${state.currentWave}...`
                  : state.currentWave === 0 ? 'Start Game'
                  : `Start Wave ${state.currentWave + 1}`}
              </Button>
            </div>
          </div>

          {/* Compact scrollable unit grid */}
          {!collapsed && (
            <div className="max-h-[100px] overflow-y-auto overflow-x-hidden">
              <div className="flex flex-wrap gap-1">
                {sortedChars.length === 0 ? (
                  <span className="text-muted-foreground text-xs py-1">
                    {state.inventory.length === 0 ? 'No characters yet. Use Summon tab!' : 'All characters deployed!'}
                  </span>
                ) : (
                  sortedChars.map(char => {
                    const stats = getCharacterStats(char.config, char.level);
                    const dps = (stats.attack * stats.attackSpeed).toFixed(0);
                    const isHovered = hoveredChar === char.instanceId;
                    const rarityColor = char.config.rarity === 'legendary' ? 'border-amber-500/60' 
                      : char.config.rarity === 'epic' ? 'border-purple-500/60'
                      : char.config.rarity === 'rare' ? 'border-blue-500/60'
                      : char.config.rarity === 'uncommon' ? 'border-green-500/60'
                      : 'border-border';

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
                          className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all
                            ${slotSelected ? 'hover:bg-accent cursor-pointer hover:scale-105' : 'hover:bg-accent/50 cursor-grab'}
                            ${rarityColor}`}
                        >
                          <CharacterSprite config={char.config} size={24} owned />
                          <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-mono font-semibold text-foreground">{char.config.name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              Lv.{char.level} {ATTACK_PATTERN_ICONS[char.config.attackPattern]} {dps}dps
                            </span>
                          </div>
                        </button>

                        {isHovered && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none">
                            <div className="bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[140px]">
                              <div className="font-bold text-xs text-foreground">{char.config.name}</div>
                              <div className="space-y-0.5 text-[10px] font-mono mt-1">
                                <div className="flex justify-between"><span className="text-muted-foreground">ATK</span><span>{stats.attack}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">SPD</span><span>{stats.attackSpeed.toFixed(1)}/s</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">RNG</span><span>{stats.range}</span></div>
                                <div className="flex justify-between border-t border-border pt-0.5">
                                  <span className="text-muted-foreground">DPS</span>
                                  <span className="text-primary font-bold">{dps}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onSummon}
              disabled={state.gold < state.gachaCost || state.inventory.length >= 80}
              className="px-6 shrink-0"
            >
              🥚 Summon ({state.gachaCost}g)
            </Button>
            <span className="text-xs text-muted-foreground font-mono">Random champion from pool</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {lastSummon && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-amber-500/50 bg-amber-900/30 animate-fade-in">
                <CharacterSprite config={lastSummon.config} size={20} owned />
                <span className="text-sm font-bold text-amber-200">{lastSummon.config.name}</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground font-mono">{state.inventory.length}/80</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitBar;
