import React from 'react';
import { CharacterUnlockProgress } from '../../game/types';
import { ALL_CHARACTERS, RARITY_LABELS } from '../../game/data/characterData';
import CharacterSprite from './CharacterSprite';
import { Button } from '../ui/button';

interface CharacterUnlockTreeProps {
  progress: CharacterUnlockProgress[];
  unlockShards: number;
  stars: number;
  mapsCompleted: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  onUnlock: (championId: string) => void;
}

const CharacterUnlockTree: React.FC<CharacterUnlockTreeProps> = ({ progress, unlockShards, stars, mapsCompleted, achievementsUnlocked, questsCompleted, onUnlock }) => {
  const visibleNodes = progress.slice(0, 18);

  return (
    <div className="px-4 py-2 bg-card/90 backdrop-blur-sm border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-bold text-foreground">Arbre de déblocage</div>
          <div className="text-xs text-muted-foreground">Débloque les champions un par un. Plus tu avances, plus ça pique.</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="text-cyan-300">🧩 {unlockShards} éclats</span>
          <span className="text-yellow-300">⭐ {stars}</span>
          <span className="text-emerald-300">🗺️ {mapsCompleted} maps</span>
          <span className="text-amber-300">🏆 {achievementsUnlocked} succès</span>
          <span className="text-fuchsia-300">🎯 {questsCompleted} défis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[230px] overflow-y-auto pr-1">
        {visibleNodes.map(node => {
          const character = ALL_CHARACTERS.find(c => c.id === node.championId);
          if (!character) return null;

          const shardsOk = unlockShards >= node.shardCost;
          const starsOk = stars >= node.requiredStars;
          const mapsOk = mapsCompleted >= node.requiredMapsCompleted;
          const achievementsOk = achievementsUnlocked >= node.requiredAchievements;
          const questsOk = questsCompleted >= node.requiredQuests;

          return (
            <div
              key={node.championId}
              className={`rounded-xl border p-3 transition-all ${
                node.unlocked
                  ? 'border-emerald-500/40 bg-emerald-950/20'
                  : node.isNext
                    ? 'border-cyan-500/50 bg-cyan-950/20'
                    : 'border-white/10 bg-black/20 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <CharacterSprite config={character} size={42} owned={node.unlocked} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{character.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">#{node.order + 1}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">{RARITY_LABELS[character.rarity]}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {node.unlocked ? 'Déjà débloqué' : node.isNext ? 'Prochain déblocage' : 'Verrouillé par progression'}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px] font-mono">
                <div className={shardsOk ? 'text-cyan-300' : 'text-muted-foreground'}>🧩 {node.shardCost} éclats</div>
                <div className={starsOk ? 'text-yellow-300' : 'text-muted-foreground'}>⭐ {node.requiredStars} étoiles</div>
                <div className={mapsOk ? 'text-emerald-300' : 'text-muted-foreground'}>🗺️ {node.requiredMapsCompleted} maps finies</div>
                <div className={achievementsOk ? 'text-amber-300' : 'text-muted-foreground'}>🏆 {node.requiredAchievements} succès</div>
                <div className={questsOk ? 'text-fuchsia-300' : 'text-muted-foreground'}>🎯 {node.requiredQuests} défis</div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-[10px] text-muted-foreground">
                  {!node.unlocked && !node.isNext ? 'Débloque le précédent d’abord.' : node.unlocked ? 'Prêt à jouer.' : 'Objectif du moment.'}
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
          );
        })}
      </div>
    </div>
  );
};

export default CharacterUnlockTree;
