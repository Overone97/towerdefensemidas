import React from 'react';
import { ACHIEVEMENTS } from '../../game/data/achievementData';

interface AchievementScreenProps {
  unlocked: string[];
  onBack: () => void;
}

const rarityColors: Record<string, string> = {
  '1': 'border-muted',
  '2': 'border-green-500',
  '3': 'border-blue-500',
  '5': 'border-purple-500',
  '10': 'border-yellow-500',
};

const AchievementScreen: React.FC<AchievementScreenProps> = ({ unlocked, onBack }) => {
  const unlockedSet = new Set(unlocked);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          onClick={onBack}
          className="px-3 py-1 rounded text-sm font-mono bg-muted text-muted-foreground hover:bg-accent transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-foreground font-bold font-mono text-lg">🏆 Achievements</h2>
        <span className="text-muted-foreground font-mono text-sm">
          {unlocked.length} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id);
            const stars = ach.reward?.stars || 0;
            const borderClass = rarityColors[String(stars)] || 'border-muted';

            return (
              <div
                key={ach.id}
                className={`relative rounded-lg border-2 p-3 transition-all ${
                  isUnlocked
                    ? `${borderClass} bg-card`
                    : 'border-muted/30 bg-muted/10 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{isUnlocked ? ach.icon : '🔒'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-mono font-bold text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {ach.name}
                    </h3>
                    <p className="text-muted-foreground text-xs font-mono mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>
                {stars > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-0.5">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-yellow-400 text-xs font-mono font-bold">+{stars}</span>
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute bottom-1 right-2 text-green-400 text-xs font-mono">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementScreen;
