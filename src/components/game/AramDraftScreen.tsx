import React from 'react';
import { CharacterConfig } from '../../game/types';
import { RARITY_COLORS } from '../../game/data/characterData';
import CharacterSprite from './CharacterSprite';
import { ABILITIES } from '../../game/data/abilityData';

function getAbilityTags(c: CharacterConfig): { icon: string; label: string; color: string }[] {
  const tags: { icon: string; label: string; color: string }[] = [];
  if (c.canRevealStealth) tags.push({ icon: '👁️', label: 'Détecte Invisibles', color: '#ff4444' });
  if (c.slowFactor) tags.push({ icon: '❄️', label: `Ralenti ×${c.slowFactor}`, color: '#66ccff' });
  if (c.dotDamage) tags.push({ icon: '☠️', label: `Poison ${c.dotDamage}/s`, color: '#66ff66' });
  if (c.aoeRadius) tags.push({ icon: '💥', label: `AoE ${c.aoeRadius}`, color: '#ffaa44' });
  if (c.chainCount) tags.push({ icon: '⚡', label: `Chaîne ×${c.chainCount}`, color: '#aaaaff' });
  if (c.burstCount) tags.push({ icon: '🔥', label: `Rafale ×${c.burstCount}`, color: '#ff8844' });
  const ability = ABILITIES[c.attackPattern];
  if (ability) tags.push({ icon: ability.icon, label: ability.name, color: '#cccccc' });
  return tags;
}

function getPatternLabel(pattern: string): string {
  const labels: Record<string, string> = {
    single: 'Cible unique', rapid: 'Tir rapide', aoe_circle: 'Zone circulaire',
    line: 'Ligne perçante', poison: 'Poison', poison_trail: 'Traînée poison',
    mushroom: 'Champignons', slow: 'Ralentissement', chain: 'Chaîne', burst: 'Rafale',
  };
  return labels[pattern] || pattern;
}

interface Props {
  choices: CharacterConfig[];
  player2Choices?: CharacterConfig[];
  rerollsLeft: number;
  isDuo: boolean;
  onPick: (config: CharacterConfig, player: 1 | 2) => void;
  onReroll: (player: 1 | 2) => void;
  onStart: () => void;
  pickedCount: number;
  player2PickedCount: number;
  isPostWavePick?: boolean;
  wave?: number;
}

const ChampionCard: React.FC<{ c: CharacterConfig; onClick: () => void }> = ({ c, onClick }) => {
  const tags = getAbilityTags(c);
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 w-48"
      style={{
        borderColor: RARITY_COLORS[c.rarity],
        background: `linear-gradient(180deg, ${RARITY_COLORS[c.rarity]}15 0%, #0a0e1a 100%)`,
      }}
    >
      <div className="w-16 h-16">
        <CharacterSprite config={c} size={64} />
      </div>
      <span className="font-bold text-sm text-foreground">{c.name}</span>
      <span className="text-xs px-2 py-0.5 rounded" style={{ color: RARITY_COLORS[c.rarity], border: `1px solid ${RARITY_COLORS[c.rarity]}44` }}>
        {c.rarity}
      </span>
      <div className="text-[10px] text-muted-foreground space-y-0.5 text-center">
        <div>⚔️ {c.attack} | ⏱️ {c.attackSpeed} | 🎯 {c.range}</div>
        <div className="font-semibold" style={{ color: '#88ccff' }}>{getPatternLabel(c.attackPattern)}</div>
      </div>
      {/* Ability tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-1">
          {tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};

const AramDraftScreen: React.FC<Props> = ({
  choices, player2Choices, rerollsLeft, isDuo, onPick, onReroll, onStart, pickedCount, player2PickedCount,
  isPostWavePick, wave,
}) => {
  const p1Done = pickedCount >= 1;
  const p2Done = !isDuo || player2PickedCount >= 1;
  const allDone = p1Done && p2Done;

  // Post-wave champion pick
  if (isPostWavePick) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #000 100%)' }}>
        <div className="flex flex-col items-center gap-6 max-w-4xl w-full px-4">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-wider" style={{ color: '#00ccff', textShadow: '0 0 30px #00ccff55' }}>
              🎁 NOUVEAU CHAMPION !
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Vague {wave} terminée — choisis un champion à ajouter à ton équipe</p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            {choices.map((c) => (
              <ChampionCard key={c.id} c={c} onClick={() => onPick(c, 1)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #000 100%)' }}>
      <div className="flex flex-col items-center gap-6 max-w-4xl w-full px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-wider" style={{ color: '#00ccff', textShadow: '0 0 30px #00ccff55' }}>
            ⚔️ ARAM MODE ⚔️
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Choisis ton champion — chaque partie est unique</p>
        </div>

        {/* Player 1 Draft */}
        <div className="w-full">
          <h2 className="text-lg font-bold text-center mb-3" style={{ color: '#44aaff' }}>
            {isDuo ? 'Joueur 1' : 'Choisis ton champion'}
          </h2>
          {!p1Done ? (
            <div className="flex gap-4 justify-center flex-wrap">
              {choices.map((c) => (
                <ChampionCard key={c.id} c={c} onClick={() => onPick(c, 1)} />
              ))}
            </div>
          ) : (
            <div className="text-center text-green-400 font-bold">✅ Champion choisi !</div>
          )}
          {!p1Done && rerollsLeft > 0 && (
            <div className="text-center mt-3">
              <button
                onClick={() => onReroll(1)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                style={{ background: '#ffaa0033', color: '#ffaa00', border: '1px solid #ffaa0055' }}
              >
                🔄 Reroll ({rerollsLeft} restant{rerollsLeft > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>

        {/* Player 2 Draft */}
        {isDuo && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-center mb-3" style={{ color: '#ff6644' }}>Joueur 2</h2>
            {!p2Done ? (
              <div className="flex gap-4 justify-center flex-wrap">
                {(player2Choices || []).map((c) => (
                  <ChampionCard key={c.id} c={c} onClick={() => onPick(c, 2)} />
                ))}
              </div>
            ) : (
              <div className="text-center text-green-400 font-bold">✅ Champion choisi !</div>
            )}
          </div>
        )}

        {/* Start button */}
        {allDone && (
          <button
            onClick={onStart}
            className="px-8 py-3 rounded-xl text-lg font-black tracking-wide transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00ccff, #0066ff)',
              color: '#fff',
              boxShadow: '0 0 30px #00ccff44',
            }}
          >
            🚀 LANCER LA PARTIE
          </button>
        )}
      </div>
    </div>
  );
};

export default AramDraftScreen;
