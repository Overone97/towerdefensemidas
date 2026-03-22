import React from 'react';
import { getSkinsForChampion } from '../../game/data/skinData';
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
    <div className="bg-[#06080fcc] backdrop-blur-md border border-white/10 rounded-xl p-4 w-[min(96vw,1020px)] shadow-2xl max-h-[86vh] overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground font-bold text-base">🛍️ Boutique Skins — {championName}</h3>
          <p className="text-[11px] text-muted-foreground">Vitrine premium • aperçu visuel • equip instantané</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-black/35 border border-yellow-400/30 text-yellow-300 text-xs font-bold">⭐ {stars}</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => onUnequip(championId)}
          className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
            !equippedSkinId ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/30 border-white/15 hover:bg-black/45'
          }`}
        >
          Skin classique
        </button>
        {!equippedSkinId && <span className="text-[11px] text-green-400">✓ Équipé actuellement</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {skins.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isEquipped = equippedSkinId === skin.id;
          const canAfford = stars >= skin.unlockCondition.cost;

          return (
            <div
              key={skin.id}
              className={`rounded-xl overflow-hidden border bg-[#0b0f1a] transition-all ${
                isEquipped ? 'border-cyan-400/80 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]' : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="relative h-52 bg-gradient-to-b from-slate-700/40 to-slate-900/70 flex items-center justify-center">
                <SkinPreviewCanvas
                  championId={championId}
                  tintColor={skin.bodyColor}
                  skinId={skin.id}
                  size={118}
                  canvasSize={220}
                  className="w-full h-full"
                />

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#8b1a1a] border border-[#d6b06a]/70 text-[10px] text-[#f4e2b5] font-bold tracking-wide">
                  SKIN
                </div>

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                  <div className="text-sm font-bold text-white drop-shadow">{skin.name}</div>
                  <div className="text-[11px] text-yellow-300 font-semibold">{skin.unlockCondition.cost} ⭐</div>
                </div>
              </div>

              <div className="p-2">
                {isUnlocked ? (
                  <button
                    onClick={() => (isEquipped ? onUnequip(championId) : onEquip(championId, skin.id))}
                    className={`w-full text-xs px-2 py-1.5 rounded font-bold ${
                      isEquipped
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                    }`}
                  >
                    {isEquipped ? '✓ Équipé' : 'Équiper'}
                  </button>
                ) : (
                  <button
                    onClick={() => canAfford && onBuy(skin.id)}
                    disabled={!canAfford}
                    className={`w-full text-xs px-2 py-1.5 rounded font-bold ${
                      canAfford
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                        : 'bg-slate-700/60 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Acheter ({skin.unlockCondition.cost}⭐)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkinSelector;
