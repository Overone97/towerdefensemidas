import React from 'react';
import { getSkinsForChampion, SkinDef, getUnlockDescription } from '../../game/data/skinData';

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

  if (skins.length === 0) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-72 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-bold text-sm">Skins — {championName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        <p className="text-muted-foreground text-xs text-center py-4">Aucun skin disponible pour ce champion.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-72 shadow-xl max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-sm">🎨 Boutique Skins — {championName}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
      </div>

      <div className="text-xs text-muted-foreground mb-2 text-center">⭐ {stars} étoiles disponibles</div>

      {/* Default skin option */}
      <button
        onClick={() => onUnequip(championId)}
        className={`w-full flex items-center gap-3 p-2 rounded mb-1 transition-colors ${
          !equippedSkinId ? 'bg-primary/20 border border-primary' : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
        }`}
      >
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs text-foreground font-bold">DEF</div>
        <div className="flex-1 text-left">
          <div className="text-foreground text-xs font-semibold">Apparence par défaut</div>
        </div>
        {!equippedSkinId && <span className="text-primary text-xs font-bold">✓</span>}
      </button>

      {/* Skin list */}
      {skins.map(skin => {
        const isUnlocked = unlockedSkins.includes(skin.id);
        const isEquipped = equippedSkinId === skin.id;
        const canAfford = stars >= skin.unlockCondition.cost;

        return (
          <div
            key={skin.id}
            className={`w-full flex items-center gap-3 p-2 rounded mb-1 transition-colors ${
              isEquipped
                ? 'bg-primary/20 border border-primary'
                : isUnlocked
                ? 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                : 'bg-muted/10 border border-border/50'
            }`}
          >
            {/* Color preview */}
            <div className="w-8 h-8 rounded relative overflow-hidden" style={{ background: skin.bodyColor }}>
              <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: skin.detailColor }} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: skin.weaponColor }} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-foreground text-xs font-semibold">{skin.name}</div>
              {!isUnlocked && (
                <div className="text-muted-foreground text-[10px]">{getUnlockDescription(skin)}</div>
              )}
            </div>
            {isUnlocked ? (
              <button
                onClick={() => isEquipped ? onUnequip(championId) : onEquip(championId, skin.id)}
                className={`text-xs px-2 py-0.5 rounded font-bold ${
                  isEquipped ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'
                }`}
              >
                {isEquipped ? '✓' : 'Équiper'}
              </button>
            ) : (
              <button
                onClick={() => canAfford && onBuy(skin.id)}
                disabled={!canAfford}
                className={`text-xs px-2 py-0.5 rounded font-bold ${
                  canAfford
                    ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                }`}
              >
                {skin.unlockCondition.cost} ⭐
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkinSelector;
