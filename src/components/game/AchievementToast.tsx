import React, { useEffect, useState } from 'react';
import { ACHIEVEMENTS } from '../../game/data/achievementData';

interface AchievementToastProps {
  achievementId: string;
  onDone: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievementId, onDone }) => {
  const [visible, setVisible] = useState(false);
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  const onDoneRef = React.useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDoneRef.current(), 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [achievementId]);

  if (!ach) return null;

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-card border-2 border-yellow-500 rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg shadow-yellow-500/20">
        <span className="text-2xl">{ach.icon}</span>
        <div>
          <p className="text-yellow-400 text-xs font-mono font-bold uppercase tracking-wider">Achievement Unlocked!</p>
          <p className="text-foreground font-mono font-bold text-sm">{ach.name}</p>
        </div>
        {ach.reward?.stars && (
          <span className="text-yellow-400 font-mono font-bold text-sm ml-2">⭐+{ach.reward.stars}</span>
        )}
      </div>
    </div>
  );
};

export default AchievementToast;
