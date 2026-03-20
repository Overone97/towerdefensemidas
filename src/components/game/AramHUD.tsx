import React, { useState } from 'react';
import { AramManager } from '../../game/managers/AramManager';
import { ALL_AUGMENTS } from '../../game/data/aramData';

interface Props {
  aram: AramManager;
  onStartWave: () => void;
  onExit: () => void;
  onBuyShopItem: (itemId: string) => void;
}

const AramHUD: React.FC<Props> = ({ aram, onStartWave, onExit, onBuyShopItem }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const isBossWave = (aram.currentWave + 1) % 10 === 0;
  const isAugWave = (aram.currentWave + 1) % 5 === 0;
  const hpPercent = aram.maxBaseHp > 0 ? (aram.baseHp / aram.maxBaseHp) * 100 : 0;

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

          {/* Center: Resources + HP BAR */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm">💰 {aram.gold}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 font-bold text-sm">❤️</span>
              <span className="font-mono text-sm font-bold text-foreground">{aram.baseHp}/{aram.maxBaseHp}</span>
              {aram.baseShield > 0 && <span className="font-mono text-xs text-cyan-300">🛡️ {aram.baseShield}</span>}
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${hpPercent}%`,
                    background: hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
            <span className="font-mono text-sm">🏆 {aram.score}</span>
            <span className="font-mono text-sm text-cyan-400">👥 {aram.getAllCharacters().length} champs</span>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShop(!showShop)}
              className="px-2 py-1 rounded text-xs font-bold transition-colors"
              style={{ background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44' }}
            >
              🛒 Boutique ARAM
            </button>
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
              <span className="text-xs font-bold" style={{ color: '#ffcc00' }}>⚡ Augmentation + Champion à la fin de cette vague</span>
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

      {/* ARAM shop */}
      {showShop && (
        <div
          className="absolute top-14 left-4 z-40 pointer-events-auto rounded-xl p-3 max-h-96 overflow-y-auto w-80"
          style={{ background: 'rgba(10,14,26,0.96)', border: '1px solid #22c55e44' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-400">🛒 Boutique du Pont</h3>
            <span className="text-xs text-yellow-300 font-mono">💰 {aram.gold}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Bonus actifs seulement en ARAM. Économie basée sur tes kills et vagues.</p>

          <div className="space-y-2">
            {aram.getShopItems().map((item) => {
              const stacks = aram.getShopStack(item.id);
              const canBuy = aram.canBuyShopItem(item.id);
              return (
                <div key={item.id} className="rounded-lg p-2 border border-white/10 bg-black/20">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-foreground">{item.icon} {item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.description}</div>
                      <div className="text-[10px] text-cyan-300">Stacks: {stacks}/{item.maxStacks}</div>
                    </div>
                    <button
                      disabled={!canBuy}
                      onClick={() => onBuyShopItem(item.id)}
                      className="px-2 py-1 rounded text-[10px] font-bold disabled:opacity-40"
                      style={{ background: canBuy ? '#22c55e33' : '#66666633', color: canBuy ? '#86efac' : '#999', border: '1px solid #22c55e44' }}
                    >
                      Acheter ({item.cost})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-[10px] text-muted-foreground">
            Bonus actifs: ATK x{aram.shopBonuses.attackMult.toFixed(2)} • SPD x{aram.shopBonuses.speedMult.toFixed(2)} • RNG x{aram.shopBonuses.rangeMult.toFixed(2)} • +{aram.shopBonuses.bonusGoldPerKill}/kill • 🛡️ {aram.shopBonuses.baseShieldPerWave}/vague
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
