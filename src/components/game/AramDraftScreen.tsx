import React from 'react';
import { CharacterConfig } from '../../game/types';
import { RARITY_COLORS } from '../../game/data/characterData';
import CharacterSprite from './CharacterSprite';

interface Props {
  choices: CharacterConfig[];
  player2Choices?: CharacterConfig[];
  rerollUsed: boolean;
  isDuo: boolean;
  onPick: (config: CharacterConfig, player: 1 | 2) => void;
  onReroll: (player: 1 | 2) => void;
  onStart: () => void;
  pickedCount: number;
  player2PickedCount: number;
}

const AramDraftScreen: React.FC<Props> = ({
  choices, player2Choices, rerollUsed, isDuo, onPick, onReroll, onStart, pickedCount, player2PickedCount,
}) => {
  const p1Done = pickedCount >= 1;
  const p2Done = !isDuo || player2PickedCount >= 1;
  const allDone = p1Done && p2Done;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #000 100%)' }}>
      <div className="flex flex-col items-center gap-6 max-w-4xl w-full px-4">
        {/* Title */}
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
            <div className="flex gap-4 justify-center">
              {choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onPick(c, 1)}
                  className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105"
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
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div>ATK: {c.attack} | SPD: {c.attackSpeed}</div>
                    <div>RNG: {c.range} | {c.attackPattern}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-green-400 font-bold">✅ Champion choisi !</div>
          )}
          {!p1Done && !rerollUsed && (
            <div className="text-center mt-3">
              <button
                onClick={() => onReroll(1)}
                className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                style={{ background: '#ffaa0033', color: '#ffaa00', border: '1px solid #ffaa0055' }}
              >
                🔄 Reroll (1 seul)
              </button>
            </div>
          )}
        </div>

        {/* Player 2 Draft */}
        {isDuo && (
          <div className="w-full">
            <h2 className="text-lg font-bold text-center mb-3" style={{ color: '#ff6644' }}>Joueur 2</h2>
            {!p2Done ? (
              <div className="flex gap-4 justify-center">
                {(player2Choices || []).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPick(c, 2)}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: RARITY_COLORS[c.rarity],
                      background: `linear-gradient(180deg, ${RARITY_COLORS[c.rarity]}15 0%, #0a0e1a 100%)`,
                    }}
                  >
                    <div className="w-16 h-16">
                      <CharacterSprite characterId={c.id} size={64} />
                    </div>
                    <span className="font-bold text-sm text-foreground">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ color: RARITY_COLORS[c.rarity], border: `1px solid ${RARITY_COLORS[c.rarity]}44` }}>
                      {c.rarity}
                    </span>
                  </button>
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
