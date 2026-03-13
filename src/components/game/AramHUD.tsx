import React, { useState } from 'react';
import { AramManager } from '../../game/managers/AramManager';
import { ALL_AUGMENTS } from '../../game/data/aramData';

interface Props {
  aram: AramManager;
  onStartWave: () => void;
  onExit: () => void;
}

const AramHUD: React.FC<Props> = ({ aram, onStartWave, onExit }) => {
  const [showHistory, setShowHistory] = useState(false);

  const isBossWave = (aram.currentWave + 1) % 10 === 0;
  const isAugWave = (aram.currentWave + 1) % 5 === 0;

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-2 pointer-events-auto" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
          {/* Left: Mode + Wave */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-black px-2 py-0.5 rounded" style={{ background: '#00ccff22', color: '#00ccff', border: '1px solid #00ccff44' }}>
              ⚔️ ARAM {aram.isDuo ? '(DUO)' : ''}
            </span>
            <span className="font-mono text-sm text-foreground">
              Vague <span className="font-black text-yellow-400">{aram.currentWave}</span>
            </span>
          </div>

          {/* Center: Resources */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm">💰 {aram.gold}</span>
            <span className="font-mono text-sm">❤️ {aram.baseHp}/{aram.maxBaseHp}</span>
            <span className="font-mono text-sm">🏆 {aram.score}</span>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-2 py-1 rounded text-xs font-bold transition-colors"
              style={{ background: '#ffcc0022', color: '#ffcc00', border: '1px solid #ffcc0044' }}
            >
              📜 Augments ({aram.ownedAugments.length})
            </button>
            <button
              onClick={onExit}
              className="px-2 py-1 rounded text-xs font-bold transition-colors"
              style={{ background: '#ff444422', color: '#ff4444', border: '1px solid #ff444444' }}
            >
              ✕ Quitter
            </button>
          </div>
        </div>
      </div>

      {/* Event banner */}
      {aram.activeEvent && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-4 py-2 rounded-lg text-sm font-bold animate-pulse" style={{ background: '#ff660033', color: '#ff8800', border: '1px solid #ff660066' }}>
            {aram.activeEvent.icon} {aram.activeEvent.name}: {aram.activeEvent.description} ({Math.ceil(aram.eventTimer)}s)
          </div>
        </div>
      )}

      {/* Boss warning */}
      {!aram.waveActive && isBossWave && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-4 py-2 rounded-lg text-sm font-black animate-bounce" style={{ background: '#ff000033', color: '#ff4444', border: '1px solid #ff000066' }}>
            ⚠️ BOSS WAVE INCOMING ⚠️
          </div>
        </div>
      )}

      {/* Next wave info */}
      {!aram.waveActive && aram.phase === 'playing' && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="flex flex-col items-center gap-2">
            {isAugWave && (
              <span className="text-xs font-bold" style={{ color: '#ffcc00' }}>⚡ Augmentation à la fin de cette vague</span>
            )}
            <button
              onClick={onStartWave}
              className="px-6 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00ccff, #0066ff)',
                color: '#fff',
                boxShadow: '0 0 20px #00ccff33',
              }}
            >
              ▶ VAGUE {aram.currentWave + 1}
            </button>
          </div>
        </div>
      )}

      {/* Augment history panel */}
      {showHistory && (
        <div
          className="absolute top-14 right-4 z-40 pointer-events-auto rounded-xl p-3 max-h-80 overflow-y-auto w-64"
          style={{ background: 'rgba(10,14,26,0.95)', border: '1px solid #ffcc0033' }}
        >
          <h3 className="text-sm font-bold text-yellow-400 mb-2">📜 Augmentations actives</h3>
          {aram.ownedAugments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune augmentation</p>
          ) : (
            <div className="space-y-1.5">
              {aram.ownedAugments.map((id, i) => {
                const aug = ALL_AUGMENTS.find(a => a.id === id);
                if (!aug) return null;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span>{aug.icon}</span>
                    <span className="text-foreground font-bold">{aug.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AramHUD;
