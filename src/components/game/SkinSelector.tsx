import React from 'react';
import { CharacterConfig } from '../../game/types';
import { getSkinsForChampion, SkinDef, getUnlockDescription, checkSkinUnlock } from '../../game/data/skinData';
import { Button } from '../ui/button';

interface SkinSelectorProps {
  championId: string;
  championName: string;
  unlockedSkins: string[];
  equippedSkins: Record<string, string>;
  prestigeLevel: number;
  dungeonCompletions: Record<string, string>;
  achievementsUnlocked: string[];
  maxWaveReached: number;
  onEquip: (championId: string, skinId: string) => void;
  onUnequip: (championId: string) => void;
  onClose: () => void;
}

const SkinSelector: React.FC<SkinSelectorProps> = ({
  championId,
  championName,
  unlockedSkins,
  equippedSkins,
  prestigeLevel,
  dungeonCompletions,
  achievementsUnlocked,
  maxWaveReached,
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

  const context = { prestigeLevel, dungeonCompletions, achievementsUnlocked, maxWaveReached };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-72 shadow-xl max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-sm">🎨 Skins — {championName}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
      </div>

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
        const isUnlocked = unlockedSkins.includes(skin.id) || checkSkinUnlock(skin, context);
        const isEquipped = equippedSkinId === skin.id;

        return (
          <button
            key={skin.id}
            onClick={() => {
              if (!isUnlocked) return;
              if (isEquipped) {
                onUnequip(championId);
              } else {
                onEquip(championId, skin.id);
              }
            }}
            disabled={!isUnlocked}
            className={`w-full flex items-center gap-3 p-2 rounded mb-1 transition-colors ${
              isEquipped
                ? 'bg-primary/20 border border-primary'
                : isUnlocked
                ? 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                : 'bg-muted/10 border border-transparent opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Color preview */}
            <div className="w-8 h-8 rounded relative overflow-hidden" style={{ background: skin.bodyColor }}>
              <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: skin.detailColor }} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: skin.weaponColor }} />
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-xs">🔒</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-foreground text-xs font-semibold">{skin.name}</div>
              {!isUnlocked && (
                <div className="text-muted-foreground text-[10px]">{getUnlockDescription(skin)}</div>
              )}
            </div>
            {isEquipped && <span className="text-primary text-xs font-bold">✓</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SkinSelector;
