import React from 'react';
import { Augmentation, AugmentRarity } from '../../game/data/aramData';

interface Props {
  choices: Augmentation[];
  wave: number;
  onPick: (augId: string) => void;
}

const RARITY_STYLES: Record<AugmentRarity, { border: string; bg: string; glow: string }> = {
  common: { border: '#9ca3af', bg: '#9ca3af10', glow: '' },
  rare: { border: '#3b82f6', bg: '#3b82f610', glow: '0 0 15px #3b82f633' },
  legendary: { border: '#f59e0b', bg: '#f59e0b10', glow: '0 0 25px #f59e0b44' },
};

const CATEGORY_COLORS: Record<string, string> = {
  offensive: '#ff4444',
  economy: '#ffcc00',
  defense: '#44aaff',
  summon: '#aa66ff',
  chaos: '#ff6600',
};

const AramAugmentPicker: React.FC<Props> = ({ choices, wave, onPick }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="flex flex-col items-center gap-6 max-w-3xl w-full px-4">
        <div className="text-center">
          <div className="text-sm font-mono text-muted-foreground mb-1">VAGUE {wave} TERMINÉE</div>
          <h2 className="text-3xl font-black" style={{ color: '#ffcc00', textShadow: '0 0 20px #ffcc0044' }}>
            ⚡ AUGMENTATION ⚡
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Choisis un bonus permanent</p>
        </div>

        <div className="flex gap-4 justify-center">
          {choices.map((aug) => {
            const style = RARITY_STYLES[aug.rarity];
            return (
              <button
                key={aug.id}
                onClick={() => onPick(aug.id)}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover:scale-105 w-52"
                style={{
                  borderColor: style.border,
                  background: style.bg,
                  boxShadow: style.glow,
                }}
              >
                <span className="text-4xl">{aug.icon}</span>
                <span className="font-bold text-foreground text-sm">{aug.name}</span>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                  style={{ color: CATEGORY_COLORS[aug.category], border: `1px solid ${CATEGORY_COLORS[aug.category]}44` }}
                >
                  {aug.category}
                </span>
                <span className="text-xs text-muted-foreground text-center leading-tight">{aug.description}</span>
                <span className="text-[10px] uppercase font-bold" style={{ color: style.border }}>{aug.rarity}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AramAugmentPicker;
