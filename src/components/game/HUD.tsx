import React from 'react';
import { GameState } from '../../game/types';

interface HUDProps {
  state: GameState;
  onSetTab: (tab: 'game' | 'gacha') => void;
}

const HUD: React.FC<HUDProps> = ({ state, onSetTab }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">💰</span>
          <span className="text-foreground font-mono font-bold">{state.gold}</span>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="flex items-center gap-2">
        <span className="text-red-400 font-bold">❤️</span>
        <span className="text-foreground font-mono font-bold">
          {state.baseHp} / {state.maxBaseHp}
        </span>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden ml-1">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${(state.baseHp / state.maxBaseHp) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HUD;
