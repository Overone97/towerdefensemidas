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

const CLASS_META: Record<string, { label: string; color: string; glow: string }> = {
  single: { label: 'DPS Burst', color: 'border-rose-400/40 bg-rose-500/12 text-rose-100', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.18)]' },
  rapid: { label: 'DPS', color: 'border-orange-400/40 bg-orange-500/12 text-orange-100', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.18)]' },
  aoe_circle: { label: 'DPS AOE', color: 'border-amber-400/40 bg-amber-500/12 text-amber-100', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.18)]' },
  line: { label: 'DPS AOE', color: 'border-yellow-400/40 bg-yellow-500/12 text-yellow-100', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.18)]' },
  poison: { label: 'Poison', color: 'border-lime-400/40 bg-lime-500/12 text-lime-100', glow: 'shadow-[0_0_30px_rgba(132,204,22,0.18)]' },
  poison_trail: { label: 'Poison', color: 'border-green-400/40 bg-green-500/12 text-green-100', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.18)]' },
  mushroom: { label: 'Poison', color: 'border-emerald-400/40 bg-emerald-500/12 text-emerald-100', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)]' },
  slow: { label: 'Support', color: 'border-cyan-400/40 bg-cyan-500/12 text-cyan-100', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.18)]' },
  chain: { label: 'DPS AOE', color: 'border-violet-400/40 bg-violet-500/12 text-violet-100', glow: 'shadow-[0_0_30px_rgba(167,139,250,0.18)]' },
  burst: { label: 'DPS Burst', color: 'border-fuchsia-400/40 bg-fuchsia-500/12 text-fuchsia-100', glow: 'shadow-[0_0_30px_rgba(217,70,239,0.18)]' },
};

const LANE_POSITIONS = ['self-start', 'self-center', 'self-end'];

const CharacterUnlockTree: React.FC<CharacterUnlockTreeProps> = ({ progress, unlockShards, exclusiveTokens, stars, mapsCompleted, onUnlock }) => {
  const visibleNodes = progress.slice(0, 21);

  return (
    <div className="px-4 py-3 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.55),rgba(2,6,23,0.94))] backdrop-blur-sm border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-bold text-white">Arbre d’ascension des champions</div>
          <div className="text-xs text-slate-300/75">Une vraie montée en puissance : de bas en haut, node après node, avec un rôle lisible à chaque étape.</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="text-cyan-300">🧩 {unlockShards} éclats</span>
          <span className="text-fuchsia-300">💎 {exclusiveTokens} jetons</span>
          <span className="text-yellow-300">⭐ {stars}</span>
          <span className="text-emerald-300">🗺️ {mapsCompleted} maps</span>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-2 rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="relative flex flex-col-reverse gap-3 items-stretch">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500/10 via-fuchsia-500/30 to-cyan-500/10" />

          {visibleNodes.map((node, index) => {
            const character = ALL_CHARACTERS.find(c => c.id === node.championId);
            if (!character) return null;

            const shardsOk = unlockShards >= node.shardCost;
            const starsOk = stars >= node.requiredStars;
            const mapsOk = mapsCompleted >= node.requiredMapsCompleted;
            const classMeta = CLASS_META[character.attackPattern] || { label: 'Hybride', color: 'border-white/20 bg-white/10 text-white', glow: '' };
            const laneClass = LANE_POSITIONS[index % LANE_POSITIONS.length];

            return (
              <div key={node.championId} className={`relative flex ${laneClass}`}>
                <div className={`absolute left-1/2 top-1/2 h-px w-14 -translate-y-1/2 bg-gradient-to-r from-cyan-400/0 to-cyan-400/35 ${laneClass === 'self-center' ? 'hidden' : ''} ${laneClass === 'self-start' ? '' : ''}`} />

                <div
                  className={`relative w-full max-w-[520px] rounded-[28px] border p-4 transition-all ${classMeta.glow} ${
                    node.unlocked
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : node.isNext
                        ? 'border-cyan-500/50 bg-slate-950/70'
                        : 'border-white/10 bg-slate-950/45 opacity-85'
                  }`}
                >
                  <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />

                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-xl bg-white/10 scale-125" />
                      <CharacterSprite config={character} size={52} owned={node.unlocked} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{character.name}</span>
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
                      onClick={() => onUnlock(node.championId)}
                      disabled={!node.canUnlock}
                      className="h-8 text-xs"
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
