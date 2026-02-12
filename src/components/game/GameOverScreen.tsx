import React from 'react';
import { Button } from '../ui/button';

interface GameOverScreenProps {
  victory: boolean;
  score: number;
  wave: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ victory, score, wave, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-2xl">
        <h2 className={`text-3xl font-bold mb-2 ${victory ? 'text-green-400' : 'text-red-400'}`}>
          {victory ? '🎉 Victory!' : '💀 Game Over'}
        </h2>
        <p className="text-muted-foreground mb-1">
          {victory ? 'All waves defeated!' : `Defeated at wave ${wave}`}
        </p>
        <p className="text-foreground font-mono text-lg mb-6">
          Score: {score}
        </p>
        <Button onClick={onRestart} size="lg">
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
