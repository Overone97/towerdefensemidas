import React from 'react';
import { CharacterUnlockProgress } from '../../game/types';
import { ALL_CHARACTERS, RARITY_LABELS } from '../../game/data/characterData';
import CharacterSprite from './CharacterSprite';
import { Button } from '../ui/button';

interface CharacterUnlockTreeProps {
  progress: CharacterUnlockProgress[];
  unlockShards: number;
  exclusiveTokens: number;
  stars: number;
  mapsCompleted: number;
  onUnlock: (championId: string) => void;
}

const CLASS_META: Record<string, { label: string; color: string }> = {
  single: { label: 'DPS Burst', color: 'bg-rose-500/15 text-rose-200 border-rose-400/30' },
  rapid: { label: 'DPS', color: 'bg-orange-500/15 text-orange-200 border-orange-400/30' },
  aoe_circle: { label: 'DPS AOE', color: 'bg-amber-500/15 text-amber-200 border-amber-400/30' },
  line: { label: 'DPS AOE', color: 'bg-yellow-500/15 text-yellow-200 border-yellow-400/30' },
  poison: { label: 'Poison', color: 'bg-lime-500/15 text-lime-200 border-lime-400/30' },
  poison_trail: { label: 'Poison', color: 'bg-green-500/15 text-green-200 border-green-400/30' },
  mushroom: { label: 'Poison', color: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' },
  slow: { label: 'Support', color: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30' },
  chain: { label: 'DPS AOE', color: 'bg-violet-500/15 text-violet-200 border-violet-400/30' },
  burst: { label: 'DPS Burst', color: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/30' },
};

const CharacterUnlockTree: React.FC<CharacterUnlockTreeProps> = ({ progress, unlockShards, exclusiveTokens, stars, mapsCompleted, onUnlock }) => {
  const visibleNodes = progress.slice(0, 24);

  return (
    <div className="px-4 py-3 bg-card/90 backdrop-blur-sm border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-bold text-foreground">Arbre de déblocage</div>
          <div className="text-xs text-muted-foreground">Progression verticale : tu grimpes du bas vers le haut, champion par champion.</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="text-cyan-300">🧩 {unlockShards} éclats</span>
          <span className="text-fuchsia-300">💎 {exclusiveTokens} jetons</span>
          <span className="text-yellow-300">⭐ {stars}</span>
          <span className="text-emerald-300">🗺️ {mapsCompleted} maps</span>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto pr-2">
        <div className="flex flex-col-reverse gap-3 items-center">
          {visibleNodes.map((node, index) => {
            const character = ALL_CHARACTERS.find(c => c.id === node.championId);
            if (!character) return null;

            const shardsOk = unlockShards >= node.shardCost;
            const starsOk = stars >= node.requiredStars;
            const mapsOk = mapsCompleted >= node.requiredMapsCompleted;
            const classMeta = CLASS_META[character.attackPattern] || { label: 'Hybride', color: 'bg-white/10 text-white border-white/20' };

            return (
              <React.Fragment key={node.championId}>
                <div
                  className={`w-full max-w-[720px] rounded-2xl border p-3 transition-all ${
                    node.unlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : node.isNext
                        ? 'border-cyan-500/50 bg-cyan-950/20'
                        : 'border-white/10 bg-black/20 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CharacterSprite config={character} size={46} owned={node.unlocked} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{character.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">#{node.order + 1}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">{RARITY_LABELS[character.rarity]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${classMeta.color}`}>{classMeta.label}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {node.unlocked ? 'Déjà débloqué' : node.isNext ? 'Prochain déblocage' : 'Verrouillé par progression'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className={shardsOk ? 'text-cyan-300' : 'text-muted-foreground'}>🧩 {node.shardCost} éclats</div>
                    <div className={starsOk ? 'text-yellow-300' : 'text-muted-foreground'}>⭐ {node.requiredStars} étoiles</div>
                    <div className={mapsOk ? 'text-emerald-300' : 'text-muted-foreground'}>🗺️ {node.requiredMapsCompleted} maps finies</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-muted-foreground">
                      {!node.unlocked && !node.isNext ? 'Continue à grimper.' : node.unlocked ? 'Disponible dans ton roster.' : 'Le prochain à arracher.'}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onUnlock(node.championId)}
                      disabled={!node.canUnlock}
                      className="h-7 text-xs"
                      variant={node.canUnlock ? 'default' : 'secondary'}
                    >
                      {node.unlocked ? 'OK' : 'Débloquer'}
                    </Button>
                  </div>
                </div>

                {index < visibleNodes.length - 1 && (
                  <div className="w-1 h-6 rounded-full bg-gradient-to-t from-cyan-500/20 to-fuchsia-500/30" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterUnlockTree;
