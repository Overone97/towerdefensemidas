import React from 'react';
import { TALENTS, ASCENSION_UPGRADES, getTalentBonus, getAscensionBonus } from '../../game/data/talentData';
import { Button } from '../ui/button';

interface TalentTreeProps {
  talents: Record<string, number>;
  stars: number;
  ascensionPoints: number;
  ascensionUpgrades: Record<string, number>;
  onUpgradeTalent: (talentId: string) => void;
  onUpgradeAscension: (upgradeId: string) => void;
  onBack: () => void;
}

const TalentTree: React.FC<TalentTreeProps> = ({
  talents,
  stars,
  ascensionPoints,
  ascensionUpgrades,
  onUpgradeTalent,
  onUpgradeAscension,
  onBack,
}) => {
  const bonus = getTalentBonus(talents);
  const ascBonus = getAscensionBonus(ascensionUpgrades || {});

  const activeBonus: string[] = [];
  if (bonus.attackMult > 1) activeBonus.push(`⚔️ ATK +${Math.round((bonus.attackMult - 1) * 100)}%`);
  if (bonus.speedMult > 1) activeBonus.push(`💨 SPD +${Math.round((bonus.speedMult - 1) * 100)}%`);
  if (bonus.rangeMult > 1) activeBonus.push(`👁️ RNG +${Math.round((bonus.rangeMult - 1) * 100)}%`);
  if (bonus.goldMult > 1) activeBonus.push(`💰 Gold +${Math.round((bonus.goldMult - 1) * 100)}%`);
  if (bonus.extraHp > 0) activeBonus.push(`🛡️ HP +${bonus.extraHp}`);
  if (bonus.summonDiscount < 1) activeBonus.push(`🎲 Cost -${Math.round((1 - bonus.summonDiscount) * 100)}%`);

  const ascActive: string[] = [];
  if (ascBonus.attackMult > 1) ascActive.push(`🔥 ATK +${Math.round((ascBonus.attackMult - 1) * 100)}%`);
  if (ascBonus.speedMult > 1) ascActive.push(`🌪️ SPD +${Math.round((ascBonus.speedMult - 1) * 100)}%`);
  if (ascBonus.goldMult > 1) ascActive.push(`🪙 Gold +${Math.round((ascBonus.goldMult - 1) * 100)}%`);
  if (ascBonus.extraHp > 0) ascActive.push(`🏰 HP +${ascBonus.extraHp}`);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        <h2 className="font-bold font-mono">🌟 Talent Tree + Ascension</h2>
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 font-mono font-bold">⭐ {stars}</div>
          <div className="text-cyan-300 font-mono font-bold">🜲 {ascensionPoints}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto gap-4">
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
                    <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-yellow-400' : 'bg-muted'}`} />
                  ))}
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {maxed ? 'MAX' : `${t.effectPerLevel}/lv • ${t.costPerLevel}⭐`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-4xl border border-cyan-500/25 rounded-xl p-3 bg-cyan-500/5">
          <div className="text-center text-sm font-bold text-cyan-300 mb-2">🜲 Ascension Progression (account-wide)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ASCENSION_UPGRADES.map(u => {
              const level = ascensionUpgrades[u.id] || 0;
              const maxed = level >= u.maxLevel;
              const canAfford = ascensionPoints >= u.costPerLevel;
              return (
                <button
                  key={u.id}
                  onClick={() => !maxed && canAfford && onUpgradeAscension(u.id)}
                  disabled={maxed || !canAfford}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    maxed
                      ? 'border-cyan-300/60 bg-cyan-300/10'
                      : canAfford
                      ? 'border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20'
                      : 'border-white/10 bg-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm">{u.icon} {u.name}</div>
                    <div className="text-xs font-mono">Lv {level}/{u.maxLevel}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{u.description}</div>
                  <div className="text-xs font-mono mt-1 text-cyan-200">{maxed ? 'MAX' : `${u.effectPerLevel}/lv • ${u.costPerLevel} 🜲`}</div>
                </button>
              );
            })}
          </div>
        </div>

        {(activeBonus.length > 0 || ascActive.length > 0) && (
          <div className="flex flex-wrap gap-2 justify-center px-4 py-2 bg-muted/30 rounded-lg border border-border">
            <span className="text-xs font-mono text-muted-foreground">Bonus actifs:</span>
            {activeBonus.map((b, i) => (
              <span key={`t-${i}`} className="text-xs font-mono text-primary font-bold">{b}</span>
            ))}
            {ascActive.map((b, i) => (
              <span key={`a-${i}`} className="text-xs font-mono text-cyan-300 font-bold">{b}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentTree;
