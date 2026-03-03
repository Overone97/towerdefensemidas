import React, { useState, useEffect } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { DailyQuestState } from '../../game/managers/DailyQuestManager';

interface DailyQuestPanelProps {
  engine: GameEngine;
  onStateChange: () => void;
}

const DailyQuestPanel: React.FC<DailyQuestPanelProps> = ({ engine, onStateChange }) => {
  const [quests, setQuests] = useState<DailyQuestState>(engine.getDailyQuests());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuests({ ...engine.getDailyQuests() });
    }, 1000);
    return () => clearInterval(interval);
  }, [engine]);

  const unclaimedCount = quests.quests.filter(q => q.completed && !q.claimed).length;

  const handleClaim = (questId: string) => {
    engine.claimDailyQuest(questId);
    setQuests({ ...engine.getDailyQuests() });
    onStateChange();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-20 px-3 py-2 rounded-lg bg-amber-600 border border-amber-500 text-white text-sm font-mono font-bold hover:bg-amber-500 transition-colors shadow-lg"
      >
        📋 Quêtes {unclaimedCount > 0 && <span className="text-yellow-200 ml-1">({unclaimedCount}!)</span>}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-20 w-72 bg-card border border-border rounded-xl shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-foreground">📋 Quêtes du jour</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div className="space-y-2">
        {quests.quests.map(quest => {
          const progress = Math.min(quest.progress, quest.target);
          const pct = (progress / quest.target) * 100;
          return (
            <div key={quest.id} className={`p-2 rounded-lg border ${quest.claimed ? 'border-green-500/30 bg-green-500/5' : quest.completed ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gray-200">{quest.icon} {quest.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: quest.completed ? 'hsl(var(--chart-1))' : 'hsl(var(--primary))',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{progress}/{quest.target}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-300">
                  +{quest.reward.stars}⭐ +{quest.reward.gold}💰
                </span>
                {quest.completed && !quest.claimed && (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="text-xs px-2 py-0.5 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Claim!
                  </button>
                )}
                {quest.claimed && (
                  <span className="text-xs text-green-400 font-mono">✓ Réclamé</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuestPanel;
