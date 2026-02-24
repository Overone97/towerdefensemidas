import React from 'react';
import { TALENTS, getTalentBonus } from '../../game/data/talentData';
import { Button } from '../ui/button';

interface TalentTreeProps {
  talents: Record<string, number>;
  stars: number;
  onUpgradeTalent: (talentId: string) => void;
  onBack: () => void;
}

const TalentTree: React.FC<TalentTreeProps> = ({ talents, stars, onUpgradeTalent, onBack }) => {
  const bonus = getTalentBonus(talents);
  const activeBonus: string[] = [];
  if (bonus.attackMult > 1) activeBonus.push(`⚔️ ATK +${Math.round((bonus.attackMult - 1) * 100)}%`);
  if (bonus.speedMult > 1) activeBonus.push(`💨 SPD +${Math.round((bonus.speedMult - 1) * 100)}%`);
  if (bonus.rangeMult > 1) activeBonus.push(`👁️ RNG +${Math.round((bonus.rangeMult - 1) * 100)}%`);
  if (bonus.goldMult > 1) activeBonus.push(`💰 Gold +${Math.round((bonus.goldMult - 1) * 100)}%`);
  if (bonus.extraHp > 0) activeBonus.push(`🛡️ HP +${bonus.extraHp}`);
  if (bonus.summonDiscount < 1) activeBonus.push(`🎲 Cost -${Math.round((1 - bonus.summonDiscount) * 100)}%`);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        <h2 className="font-bold font-mono">🌟 Talent Tree</h2>
        <div className="text-yellow-400 font-mono font-bold">⭐ {stars}</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto gap-4">
        <div className="grid grid-cols-3 gap-4 max-w-lg w-full">
          {TALENTS.map(t => {
            const level = talents[t.id] || 0;
            const maxed = level >= t.maxLevel;
            const canAfford = stars >= t.costPerLevel;
            return (
              <button
                key={t.id}
                onClick={() => !maxed && canAfford && onUpgradeTalent(t.id)}
                disabled={maxed || !canAfford}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                  maxed
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : canAfford
                    ? 'border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                    : 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="font-bold text-sm">{t.name}</span>
                <span className="text-muted-foreground text-xs">{t.description}</span>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: t.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < level ? 'bg-yellow-400' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {maxed ? 'MAX' : `${t.effectPerLevel}/lv • ${t.costPerLevel}⭐`}
                </span>
              </button>
            );
          })}
        </div>
        {activeBonus.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center px-4 py-2 bg-muted/30 rounded-lg border border-border">
            <span className="text-xs font-mono text-muted-foreground">Bonus actifs:</span>
            {activeBonus.map((b, i) => (
              <span key={i} className="text-xs font-mono text-primary font-bold">{b}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentTree;
