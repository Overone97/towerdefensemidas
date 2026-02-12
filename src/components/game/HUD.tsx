import React from 'react';
import { GameState } from '../../game/types';

interface HUDProps {
  state: GameState;
  onSetTab: (tab: 'game' | 'gacha') => void;
  onOpenTalents: () => void;
  onOpenMaps: () => void;
  onOpenWiki: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onSetTab, onOpenTalents, onOpenMaps, onOpenWiki }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 font-bold">💰</span>
          <span className="text-foreground font-mono font-bold">{state.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">⭐</span>
          <span className="text-foreground font-mono">{state.stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-400 font-bold">🌊</span>
          <span className="text-foreground font-mono">
            {state.currentWave} / {state.totalWaves}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetTab('game')}
          className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
            state.activeTab === 'game'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Deploy
        </button>
        <button
          onClick={() => onSetTab('gacha')}
          className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
            state.activeTab === 'gacha'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          Summon
        </button>
        <button
          onClick={onOpenTalents}
          className="px-3 py-1 rounded text-sm font-mono transition-colors bg-muted text-muted-foreground hover:bg-accent"
        >
          Talents
        </button>
        <button
          onClick={onOpenMaps}
          className="px-3 py-1 rounded text-sm font-mono transition-colors bg-muted text-muted-foreground hover:bg-accent"
        >
          Maps
        </button>
        <button
          onClick={onOpenWiki}
          className="px-3 py-1 rounded text-sm font-mono transition-colors bg-muted text-muted-foreground hover:bg-accent"
        >
          📖 Wiki
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-red-400 font-bold">❤️</span>
        <span className="text-foreground font-mono font-bold">
          {state.baseHp} / {state.maxBaseHp}
        </span>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden ml-1">
          <div
            className="h-full bg-destructive transition-all"
            style={{ width: `${(state.baseHp / state.maxBaseHp) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HUD;
