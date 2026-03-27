import React from 'react';
import { GameState, WaveModifier } from '../../game/types';
import { soundManager } from '../../game/audio/SoundManager';
import { WAVE_MODIFIER_INFO } from '../../game/data/waveData';
import AuthButton from './AuthButton';

export interface HUDProps {
  state: GameState;
  onSetTab: (tab: 'game' | 'progress') => void;
  onOpenTalents: () => void;
  onOpenMaps: () => void;
  onOpenWiki: () => void;
  onOpenAchievements: () => void;
  onOpenEquipment: () => void;
  onOpenSkins?: () => void;
  prestigeLevel?: number;
  canPrestige?: boolean;
  onPrestige?: () => void;
  dungeonInfo?: { name: string; icon: string; timer: number; timeLimit?: number; rules: DungeonRule[] } | null;
  onExitDungeon?: () => void;
}

const HUD: React.FC<HUDProps> = ({ state, onSetTab, onOpenTalents, onOpenMaps, onOpenWiki, onOpenAchievements, onOpenEquipment, onOpenSkins, prestigeLevel = 0, canPrestige = false, onPrestige, dungeonInfo, onExitDungeon }) => {
  const waveProgress = state.waveActive && state.waveEnemiesTotal > 0
    ? (state.waveEnemiesKilledThisWave / state.waveEnemiesTotal) * 100
    : 0;

  const tabButtons = [
    { key: 'game', label: 'Déploiement', active: state.activeTab === 'game', onClick: () => onSetTab('game') },
    { key: 'progress', label: 'Progression', active: state.activeTab === 'progress', onClick: () => onSetTab('progress') },
  ] as const;

  const actionButtons = [
    { label: '📖 Wiki', ariaLabel: 'Ouvrir le wiki', onClick: onOpenWiki },
    { label: '🏆 Succès', ariaLabel: 'Classement / Succès', onClick: onOpenAchievements },
    { label: '🎒 Équipement', ariaLabel: 'Équipement / Inventaire', onClick: onOpenEquipment },
    { label: '🎨 Skins', ariaLabel: 'Skins', onClick: onOpenSkins },
    { label: '🌳 Talents', ariaLabel: 'Talents', onClick: onOpenTalents },
    { label: '🗺️ Maps', ariaLabel: 'Maps', onClick: onOpenMaps },
  ];

  return (
    <div className="flex flex-col gap-2 bg-card/88 backdrop-blur-md border-b border-border/50 shadow-lg px-3 py-2 md:px-4">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-foreground flex items-center gap-1.5">
            <span className="text-yellow-400">💰</span>
            <span className="font-bold">{state.gold}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-foreground flex items-center gap-1.5">
            <span className="text-cyan-300">🧩</span>
            <span className="font-bold">{state.unlockShards}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-foreground flex items-center gap-1.5">
            <span className="text-yellow-300">⭐</span>
            <span>{state.stars}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-foreground flex items-center gap-1.5">
            <span className="text-blue-400">🌊</span>
            <span>{state.endlessMode ? `W${state.currentWave} ♾️` : `${state.currentWave}/${state.totalWaves}`}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-foreground flex items-center gap-1.5 min-w-[92px]">
            <span className="text-red-400">❤️</span>
            <span>{state.baseHp}/{state.maxBaseHp}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-destructive transition-all"
                style={{ width: `${(state.baseHp / state.maxBaseHp) * 100}%` }}
              />
            </div>
          </div>
          {prestigeLevel > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-900/25 border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
              <span className="font-bold">🏅 P{prestigeLevel}</span>
              <span>×{(1 + prestigeLevel * 0.1).toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-black/20 border border-white/10 p-1">
            {tabButtons.map(btn => (
              <button
                key={btn.key}
                onClick={btn.onClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  btn.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {canPrestige && (
            <button
              onClick={onPrestige}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 animate-pulse"
            >
              🏅 Prestige
            </button>
          )}

          <div className="flex items-center gap-1 rounded-xl bg-black/20 border border-white/10 p-1">
            <AuthButton />
            <button
              aria-label={soundManager.muted ? 'Activer le son' : 'Couper le son'}
              onClick={() => { soundManager.toggleMute(); }}
              className="px-2 py-1 rounded-md text-xs transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
            >
              {soundManager.muted ? '🔇' : '🔊'}
            </button>
            <button
              aria-label={soundManager.musicMuted ? 'Activer la musique' : 'Couper la musique'}
              onClick={() => {
                soundManager.toggleMusic();
                if (!soundManager.musicMuted) soundManager.startMusic();
                else soundManager.stopMusic();
              }}
              className="px-2 py-1 rounded-md text-xs transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
            >
              {soundManager.musicMuted ? '🎵' : '🎶'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {actionButtons.map(btn => (
          <button
            key={btn.ariaLabel}
            aria-label={btn.ariaLabel}
            onClick={btn.onClick}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-muted/70 text-muted-foreground hover:bg-accent"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {dungeonInfo && (
        <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-accent/20 px-3 py-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-sm">{dungeonInfo.icon}</span>
            <span className="font-bold text-primary">🏰 {dungeonInfo.name}</span>
            {dungeonInfo.rules?.maxUnits && (
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">Max {dungeonInfo.rules.maxUnits} unités</span>
            )}
            {dungeonInfo.rules?.noEquipment && (
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">🚫 Sans équipement</span>
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
              className="text-[11px] px-2.5 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>
      )}

      {state.waveActive && (
        <div className="rounded-xl border border-border/40 bg-black/20 px-3 py-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              {state.waveModifier && WAVE_MODIFIER_INFO[state.waveModifier] && (
                <span
                  className="font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: WAVE_MODIFIER_INFO[state.waveModifier].color + '33',
                    color: WAVE_MODIFIER_INFO[state.waveModifier].color,
                    border: `1px solid ${WAVE_MODIFIER_INFO[state.waveModifier].color}55`,
                  }}
                >
                  {WAVE_MODIFIER_INFO[state.waveModifier].icon} {WAVE_MODIFIER_INFO[state.waveModifier].label}
                </span>
              )}
              <span className="text-muted-foreground">⚔️ {state.waveEnemiesKilledThisWave}/{state.waveEnemiesTotal}</span>
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
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
            <p className="text-[10px] text-muted-foreground mt-1">
              {WAVE_MODIFIER_INFO[state.waveModifier].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HUD;
