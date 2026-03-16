import React from 'react';
import { GameState, WaveModifier } from '../../game/types';
import { soundManager } from '../../game/audio/SoundManager';
import { WAVE_MODIFIER_INFO } from '../../game/data/waveData';

export interface HUDProps {
  state: GameState;
  onSetTab: (tab: 'game' | 'gacha') => void;
  onOpenTalents: () => void;
  onOpenMaps: () => void;
  onOpenWiki: () => void;
  onOpenAchievements: () => void;
  onOpenEquipment: () => void;
  prestigeLevel?: number;
  canPrestige?: boolean;
  onPrestige?: () => void;
  dungeonInfo?: { name: string; icon: string; timer: number; timeLimit?: number; rules: any } | null;
  onExitDungeon?: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onSetTab, onOpenTalents, onOpenMaps, onOpenWiki, onOpenAchievements, onOpenEquipment, prestigeLevel = 0, canPrestige = false, onPrestige, dungeonInfo, onExitDungeon }) => {
  const waveProgress = state.waveActive && state.waveEnemiesTotal > 0
    ? (state.waveEnemiesKilledThisWave / state.waveEnemiesTotal) * 100
    : 0;

  return (
    <div className="flex flex-col bg-card/90 backdrop-blur-sm border-b border-border/50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-bold text-sm">💰</span>
            <span className="text-foreground font-mono font-bold text-sm">{state.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-foreground font-mono text-sm">{state.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400 font-bold text-sm">🌊</span>
            <span className="text-foreground font-mono text-sm">
              {state.endlessMode ? `W${state.currentWave} ♾️` : `${state.currentWave}/${state.totalWaves}`}
            </span>
          </div>
          {prestigeLevel > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-500/40">
              <span className="text-amber-400 text-[10px] font-bold">🏅P{prestigeLevel}</span>
              <span className="text-[9px] text-amber-300/70">×{(1 + prestigeLevel * 0.1).toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {[
            { key: 'game', label: 'Deploy', active: state.activeTab === 'game', onClick: () => onSetTab('game') },
            { key: 'gacha', label: 'Summon', active: state.activeTab === 'gacha', onClick: () => onSetTab('gacha') },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={btn.onClick}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                btn.active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70 text-muted-foreground hover:bg-accent'
              }`}
            >
              {btn.label}
            </button>
          ))}
          {[
            { label: 'Talents', onClick: onOpenTalents },
            { label: 'Maps', onClick: onOpenMaps },
            { label: '📖', onClick: onOpenWiki },
            { label: '🏆', onClick: onOpenAchievements },
            { label: '🎒', onClick: onOpenEquipment },
            { label: '🎨 Skins', onClick: onOpenSkins },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="px-2.5 py-1 rounded text-xs font-mono transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
            >
              {btn.label}
            </button>
          ))}
          {canPrestige && (
            <button
              onClick={onPrestige}
              className="px-2.5 py-1 rounded text-xs font-bold transition-colors bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 animate-pulse"
            >
              🏅 Prestige
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { soundManager.toggleMute(); }}
            className="px-1.5 py-1 rounded text-xs font-mono transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
          >
            {soundManager.muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => {
              soundManager.toggleMusic();
              if (!soundManager.musicMuted) soundManager.startMusic();
              else soundManager.stopMusic();
            }}
            className="px-1.5 py-1 rounded text-xs font-mono transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
          >
            {soundManager.musicMuted ? '🎵' : '🎶'}
          </button>
          <span className="text-red-400 font-bold text-sm">❤️</span>
          <span className="text-foreground font-mono font-bold text-sm">
            {state.baseHp}/{state.maxBaseHp}
          </span>
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive transition-all"
              style={{ width: `${(state.baseHp / state.maxBaseHp) * 100}%` }}
            />
        </div>
      </div>

      {/* Dungeon banner */}
      {dungeonInfo && (
        <div className="flex items-center justify-between px-4 py-1 bg-accent/30 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-sm">{dungeonInfo.icon}</span>
            <span className="text-xs font-bold" style={{ color: 'hsl(var(--primary))' }}>🏰 {dungeonInfo.name}</span>
            {dungeonInfo.rules?.maxUnits && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Max {dungeonInfo.rules.maxUnits} units</span>
            )}
            {dungeonInfo.rules?.noEquipment && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">🚫 No equip</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {dungeonInfo.timeLimit && (
              <span className={`text-xs font-mono font-bold ${
                dungeonInfo.timer > dungeonInfo.timeLimit * 0.8 ? 'text-destructive animate-pulse' : 'text-muted-foreground'
              }`}>
                ⏱️ {Math.max(0, Math.ceil(dungeonInfo.timeLimit - dungeonInfo.timer))}s
              </span>
            )}
            <button
              onClick={onExitDungeon}
              className="text-[10px] px-2 py-0.5 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>
      )}
      </div>

      {state.waveActive && (
        <div className="px-4 pb-1">
          <div className="flex items-center gap-2">
            {state.waveModifier && WAVE_MODIFIER_INFO[state.waveModifier] && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: WAVE_MODIFIER_INFO[state.waveModifier].color + '33',
                  color: WAVE_MODIFIER_INFO[state.waveModifier].color,
                  border: `1px solid ${WAVE_MODIFIER_INFO[state.waveModifier].color}55`,
                }}
              >
                {WAVE_MODIFIER_INFO[state.waveModifier].icon} {WAVE_MODIFIER_INFO[state.waveModifier].label}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">
              ⚔️ {state.waveEnemiesKilledThisWave}/{state.waveEnemiesTotal}
            </span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${waveProgress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--chart-1)))',
                }}
              />
            </div>
          </div>
          {state.waveModifier && WAVE_MODIFIER_INFO[state.waveModifier] && (
            <p className="text-[9px] text-muted-foreground mt-0.5 ml-1">
              {WAVE_MODIFIER_INFO[state.waveModifier].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HUD;
