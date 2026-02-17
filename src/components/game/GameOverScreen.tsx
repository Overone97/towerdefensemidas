import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { submitScore, fetchLeaderboard, CloudLeaderboardEntry } from '../../game/managers/LeaderboardManager';

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
  mapId: string;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ victory, score, wave, starsEarned, endlessMode, leaderboard, mapId, onRestart }) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('td_player_name') || '');
  const [submitted, setSubmitted] = useState(false);
  const [cloudLeaderboard, setCloudLeaderboard] = useState<CloudLeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(true);

  useEffect(() => {
    fetchLeaderboard(undefined, 10).then(data => {
      setCloudLeaderboard(data);
      setLoadingLb(false);
    });
  }, [submitted]);

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    localStorage.setItem('td_player_name', playerName);
    await submitScore(playerName.trim(), score, wave, mapId);
    setSubmitted(true);
  };

  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-2xl min-w-[320px] max-w-[420px]">
        <h2 className={`text-3xl font-bold mb-2 ${victory ? 'text-green-400' : endlessMode ? 'text-orange-400' : 'text-destructive'}`}>
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

        {/* Score submission */}
        {!submitted ? (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ton pseudo..."
              maxLength={20}
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-mono"
            />
            <Button onClick={handleSubmit} size="sm" disabled={!playerName.trim()}>
              📤 Submit
            </Button>
          </div>
        ) : (
          <p className="text-green-400 text-xs font-mono mb-4">✓ Score soumis au classement mondial !</p>
        )}

        {/* Cloud Leaderboard */}
        <div className="mb-4 text-left">
          <h3 className="text-sm font-bold text-muted-foreground mb-2 text-center">🌍 Classement Mondial</h3>
          {loadingLb ? (
            <p className="text-xs text-muted-foreground text-center">Chargement...</p>
          ) : cloudLeaderboard.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {cloudLeaderboard.map((entry, i) => (
                <div key={entry.id} className={`flex justify-between text-xs font-mono px-2 py-1 rounded ${
                  submitted && entry.player_name === playerName.trim() && entry.score === score
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground'
                }`}>
                  <span>#{i + 1} {entry.player_name} (W{entry.wave})</span>
                  <span>{entry.score} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">Pas encore de scores</p>
          )}
        </div>

        <Button onClick={onRestart} size="lg">
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
