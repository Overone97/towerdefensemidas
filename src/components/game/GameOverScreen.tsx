import React from 'react';
import { Button } from '../ui/button';

interface LeaderboardEntry {
  score: number;
  wave: number;
  date: string;
}

interface GameOverScreenProps {
  victory: boolean;
  score: number;
  wave: number;
  starsEarned: number;
  endlessMode: boolean;
  leaderboard: LeaderboardEntry[];
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ victory, score, wave, starsEarned, endlessMode, leaderboard, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-2xl min-w-[320px]">
        <h2 className={`text-3xl font-bold mb-2 ${victory ? 'text-green-400' : endlessMode ? 'text-orange-400' : 'text-red-400'}`}>
          {endlessMode ? '♾️ Endless Over!' : victory ? '🎉 Victory!' : '💀 Game Over'}
        </h2>
        <p className="text-muted-foreground mb-1">
          {endlessMode ? `Survived ${wave} waves!` : victory ? 'All waves defeated!' : `Defeated at wave ${wave}`}
        </p>
        <p className="text-foreground font-mono text-lg mb-2">
          Score: {score}
        </p>
        {starsEarned > 0 && (
          <p className="text-yellow-400 font-mono text-lg mb-4 animate-fade-in">
            +{starsEarned} ⭐ earned!
          </p>
        )}

        {endlessMode && leaderboard.length > 0 && (
          <div className="mb-4 text-left">
            <h3 className="text-sm font-bold text-muted-foreground mb-2 text-center">🏅 Top Scores</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={i} className={`flex justify-between text-xs font-mono px-2 py-1 rounded ${
                  entry.score === score && entry.wave === wave ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                }`}>
                  <span>#{i + 1} Wave {entry.wave}</span>
                  <span>{entry.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onRestart} size="lg">
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
