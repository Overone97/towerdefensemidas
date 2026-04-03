import React, { useMemo, useState } from 'react';
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

const CLASS_META: Record<string, { label: string; color: string; glow: string }> = {
  single: { label: 'DPS Burst', color: 'border-rose-400/40 bg-rose-500/12 text-rose-100', glow: 'shadow-[0_0_36px_rgba(244,63,94,0.22)]' },
  rapid: { label: 'DPS', color: 'border-orange-400/40 bg-orange-500/12 text-orange-100', glow: 'shadow-[0_0_36px_rgba(251,146,60,0.22)]' },
  aoe_circle: { label: 'DPS AOE', color: 'border-amber-400/40 bg-amber-500/12 text-amber-100', glow: 'shadow-[0_0_36px_rgba(251,191,36,0.22)]' },
  line: { label: 'DPS AOE', color: 'border-yellow-400/40 bg-yellow-500/12 text-yellow-100', glow: 'shadow-[0_0_36px_rgba(250,204,21,0.22)]' },
  poison: { label: 'Poison', color: 'border-lime-400/40 bg-lime-500/12 text-lime-100', glow: 'shadow-[0_0_36px_rgba(132,204,22,0.22)]' },
  poison_trail: { label: 'Poison', color: 'border-green-400/40 bg-green-500/12 text-green-100', glow: 'shadow-[0_0_36px_rgba(34,197,94,0.22)]' },
  mushroom: { label: 'Poison', color: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-100', glow: 'shadow-[0_0_36px_rgba(16,185,129,0.22)]' },
  slow: { label: 'Support', color: 'border-cyan-400/40 bg-cyan-500/12 text-cyan-100', glow: 'shadow-[0_0_36px_rgba(34,211,238,0.22)]' },
  chain: { label: 'DPS AOE', color: 'border-violet-400/40 bg-violet-500/12 text-violet-100', glow: 'shadow-[0_0_36px_rgba(167,139,250,0.22)]' },
  burst: { label: 'DPS Burst', color: 'border-fuchsia-400/40 bg-fuchsia-500/12 text-fuchsia-100', glow: 'shadow-[0_0_36px_rgba(217,70,239,0.22)]' },
};

const LANE_POSITIONS = ['self-start', 'self-center', 'self-end'];

const CharacterUnlockTree: React.FC<CharacterUnlockTreeProps> = ({ progress, unlockShards, exclusiveTokens, stars, mapsCompleted, onUnlock }) => {
  const visibleNodes = useMemo(() => progress, [progress]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const starterFallback = visibleNodes.filter(node => node.order < 5);

  return (
    <div className="px-4 py-3 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),rgba(2,6,23,0.96)_45%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] backdrop-blur-sm border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-bold text-white">Arbre d’ascension des champions</div>
          <div className="text-xs text-slate-300/75">Arbre complet du roster, progression bas → haut, classes visibles, même logique pour tout le monde.</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="text-cyan-300">🧩 {unlockShards} éclats</span>
          <span className="text-fuchsia-300">💎 {exclusiveTokens} jetons</span>
          <span className="text-yellow-300">⭐ {stars}</span>
          <span className="text-emerald-300">🗺️ {mapsCompleted} maps</span>
          <span className="text-slate-300">🌳 {visibleNodes.length} champions</span>
        </div>
      </div>

      {starterFallback.some(node => !node.unlocked) && (
        <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
          <div className="font-bold mb-1">Starter de secours</div>
          <div className="text-xs text-cyan-200/80">Si l’invocation du début ne s’est pas affichée, tu peux récupérer ton starter ici et lancer la run sans rester bloqué.</div>
        </div>
      )}

      <div className="max-h-[560px] overflow-y-auto pr-2 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.92))] p-4 shadow-[inset_0_1px_40px_rgba(255,255,255,0.03)]">
        <div className="relative flex flex-col-reverse gap-5 items-stretch">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-cyan-400/10 via-fuchsia-400/40 to-cyan-400/10 animate-pulse" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.06),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(217,70,239,0.05),transparent_24%)]" />

          {visibleNodes.map((node, index) => {
            const character = ALL_CHARACTERS.find(c => c.id === node.championId);
            if (!character) return null;

            const shardsOk = unlockShards >= node.shardCost;
            const starsOk = stars >= node.requiredStars;
            const mapsOk = mapsCompleted >= node.requiredMapsCompleted;
            const classMeta = CLASS_META[character.attackPattern] || { label: 'Hybride', color: 'border-white/20 bg-white/10 text-white', glow: '' };
            const laneClass = LANE_POSITIONS[index % LANE_POSITIONS.length];
            const isUnlocking = unlockingId === node.championId;

            return (
              <div key={node.championId} className={`relative flex ${laneClass}`}>
                <div className={`absolute left-1/2 top-1/2 h-[2px] w-16 -translate-y-1/2 bg-gradient-to-r from-cyan-400/0 to-cyan-300/45 ${laneClass === 'self-center' ? 'hidden' : 'animate-pulse'}`} />

                <div
                  className={`relative w-full max-w-[560px] rounded-[30px] border p-4 transition-all duration-300 ${classMeta.glow} ${
                    node.unlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : node.isNext
                        ? 'border-cyan-500/50 bg-slate-950/70 hover:-translate-y-0.5'
                        : 'border-white/10 bg-slate-950/45 opacity-90'
                  } ${isUnlocking ? 'scale-[1.02] shadow-[0_0_60px_rgba(34,211,238,0.28)]' : ''}`}
                >
                  <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />
                  {isUnlocking && (
                    <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%)] animate-pulse pointer-events-none" />
                  )}

                  <div className="relative flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-white/10 bg-black/30 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_60%)]" />
                      <div className="absolute inset-2 rounded-full border border-white/10" />
                      <div className="relative scale-[1.5] drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]">
                        <CharacterSprite config={character} size={54} owned={node.unlocked} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-white">{character.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">#{node.order + 1}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">{RARITY_LABELS[character.rarity]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${classMeta.color}`}>{classMeta.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-300/70 mt-1">
                        {node.unlocked ? 'Déjà débloqué' : node.isNext ? 'Noeud actif' : 'Noeud verrouillé'}
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className={`rounded-xl px-3 py-2 border ${shardsOk ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>🧩 {node.shardCost} éclats</div>
                    <div className={`rounded-xl px-3 py-2 border ${starsOk ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>⭐ {node.requiredStars} étoiles</div>
                    <div className={`rounded-xl px-3 py-2 border ${mapsOk ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>🗺️ {node.requiredMapsCompleted} maps</div>
                  </div>

                  <div className="relative mt-4 flex items-center justify-between gap-3">
                    <div className="text-[10px] text-slate-400">
                      {!node.unlocked && !node.isNext ? 'Continue ta montée dans l’arbre.' : node.unlocked ? 'Ajouté à ton roster.' : 'Prêt à être arraché.'}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setUnlockingId(node.championId);
                        window.setTimeout(() => {
                          onUnlock(node.championId);
                          setUnlockingId(null);
                        }, 240);
                      }}
                      disabled={!node.canUnlock || unlockingId !== null}
                      className="h-9 px-4 text-xs"
                      variant={node.canUnlock ? 'default' : 'secondary'}
                    >
                      {node.unlocked ? 'Débloqué' : 'Débloquer'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterUnlockTree;
