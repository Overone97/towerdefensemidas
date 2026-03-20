import React, { useMemo, useState } from 'react';
import { getSkinsForChampion, getUnlockDescription } from '../../game/data/skinData';
import SkinPreviewCanvas from './SkinPreviewCanvas';

interface SkinSelectorProps {
  championId: string;
  championName: string;
  unlockedSkins: string[];
  equippedSkins: Record<string, string>;
  stars: number;
  onBuy: (skinId: string) => void;
  onEquip: (championId: string, skinId: string) => void;
  onUnequip: (championId: string) => void;
  onClose: () => void;
}

const SkinSelector: React.FC<SkinSelectorProps> = ({
  championId,
  championName,
  unlockedSkins,
  equippedSkins,
  stars,
  onBuy,
  onEquip,
  onUnequip,
  onClose,
}) => {
  const skins = getSkinsForChampion(championId);
  const equippedSkinId = equippedSkins[championId];
  const [focusedSkinId, setFocusedSkinId] = useState<string | null>(equippedSkinId || skins[0]?.id || null);

  const focusedSkin = useMemo(() => {
    if (!focusedSkinId) return null;
    return skins.find(s => s.id === focusedSkinId) || null;
  }, [focusedSkinId, skins]);

  if (skins.length === 0) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-80 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-bold text-sm">Skins — {championName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        <p className="text-muted-foreground text-xs text-center py-4">Aucun skin disponible pour ce champion.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-[560px] shadow-xl max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-sm">🛍️ Boutique Skins — {championName}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
      </div>

      <div className="text-xs text-muted-foreground mb-3">⭐ {stars} étoiles disponibles</div>

      {/* Hero preview panel */}
      <div className="mb-4 rounded-xl border border-border/70 bg-black/25 p-3 flex items-center gap-4">
        <div className="w-[132px] h-[132px] rounded-lg border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-center">
          <SkinPreviewCanvas championId={championId} tintColor={focusedSkin?.bodyColor} size={86} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">{focusedSkin?.name || 'Apparence par défaut'}</div>
          <div className="text-xs text-muted-foreground mb-2">Aperçu in-game sans fond (style LoL + style TDV).</div>
          {focusedSkin ? (
            <div className="flex gap-1.5">
              <span className="w-5 h-5 rounded border border-white/20" style={{ background: focusedSkin.bodyColor }} />
              <span className="w-5 h-5 rounded border border-white/20" style={{ background: focusedSkin.detailColor }} />
              <span className="w-5 h-5 rounded border border-white/20" style={{ background: focusedSkin.weaponColor }} />
            </div>
          ) : (
            <div className="text-xs text-green-400 font-semibold">Skin de base équipé</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Default card */}
        <button
          onClick={() => { setFocusedSkinId(null); onUnequip(championId); }}
          className={`rounded-lg border p-2 text-left transition-all ${
            !equippedSkinId ? 'border-primary bg-primary/10' : 'border-border/60 bg-muted/20 hover:bg-muted/35'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded border border-border flex items-center justify-center text-[10px] font-bold">DEFAULT</div>
            <div>
              <div className="text-xs font-bold">Skin Classique</div>
              <div className="text-[10px] text-muted-foreground">Inclus</div>
            </div>
          </div>
        </button>

        {skins.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isEquipped = equippedSkinId === skin.id;
          const canAfford = stars >= skin.unlockCondition.cost;

          return (
            <div
              key={skin.id}
              onMouseEnter={() => setFocusedSkinId(skin.id)}
              className={`rounded-lg border p-2 transition-all ${
                isEquipped ? 'border-primary bg-primary/10' : isUnlocked ? 'border-border/60 bg-muted/20' : 'border-yellow-500/30 bg-yellow-500/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded border border-white/10 bg-black/30 flex items-center justify-center">
                  <SkinPreviewCanvas championId={championId} tintColor={skin.bodyColor} size={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{skin.name}</div>
                  <div className="text-[10px] text-muted-foreground">{getUnlockDescription(skin)}</div>
                </div>
              </div>

              {isUnlocked ? (
                <button
                  onClick={() => (isEquipped ? onUnequip(championId) : onEquip(championId, skin.id))}
                  className={`w-full text-xs px-2 py-1 rounded font-bold ${
                    isEquipped ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {isEquipped ? '✓ Équipé' : 'Équiper'}
                </button>
              ) : (
                <button
                  onClick={() => canAfford && onBuy(skin.id)}
                  disabled={!canAfford}
                  className={`w-full text-xs px-2 py-1 rounded font-bold ${
                    canAfford ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Acheter — {skin.unlockCondition.cost} ⭐
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkinSelector;
