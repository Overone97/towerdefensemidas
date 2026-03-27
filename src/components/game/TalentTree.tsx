import React, { useMemo } from 'react';
import { ASCENSION_UPGRADES, getAscensionBonus, getAscensionUpgradeCost, getAscensionSpent } from '../../game/data/talentData';
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

const BRANCH_STYLE = {
  attack: { edge: '#ef4444', node: 'border-red-500/70', glow: 'shadow-[0_0_26px_rgba(239,68,68,0.4)]', label: '⚔️ Voie de la Guerre' },
  defense: { edge: '#38bdf8', node: 'border-sky-400/70', glow: 'shadow-[0_0_26px_rgba(56,189,248,0.4)]', label: '🛡️ Voie du Bastion' },
  economy: { edge: '#f59e0b', node: 'border-amber-400/70', glow: 'shadow-[0_0_26px_rgba(245,158,11,0.4)]', label: '💰 Voie de l’Or' },
} as const;

const TreeNode: React.FC<{
  id: string;
  name: string;
  icon: string;
  branch: 'attack' | 'defense' | 'economy';
  x: number;
  y: number;
  level: number;
  maxLevel: number;
  locked: boolean;
  canBuy: boolean;
  cost: number;
  requiredSpent?: number;
  ultimate?: boolean;
  onClick: () => void;
}> = ({ name, icon, branch, x, y, level, maxLevel, locked, canBuy, cost, requiredSpent, ultimate, onClick }) => {
  const maxed = level >= maxLevel;
  const b = BRANCH_STYLE[branch];

  return (
    <button
      onClick={onClick}
      disabled={!canBuy}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-32 rounded-xl border bg-[#0b1120]/95 p-2 text-left transition-all ${
        maxed
          ? 'border-emerald-400/80 bg-emerald-500/12 shadow-[0_0_18px_rgba(16,185,129,0.45)]'
          : canBuy
          ? `${b.node} ${b.glow} hover:scale-[1.04]`
          : locked
          ? 'border-white/10 opacity-50'
          : 'border-white/20 opacity-80'
      }`}
      style={{ left: x, top: y }}
      title={locked ? `Verrouillé${(requiredSpent ?? 0) > 0 ? ` (${requiredSpent} points requis)` : ''} — prérequis non remplis` : `${name} — coût ${cost}🜲`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-bold truncate">{icon} {name}</div>
        {ultimate && <span className="text-[10px] text-yellow-300">ULT</span>}
      </div>
      <div className="text-[10px] font-mono text-muted-foreground">Niveau {level}/{maxLevel}</div>
      <div className="mt-1 text-[10px] font-mono">
        {maxed ? <span className="text-emerald-300">MAX</span> : <span className="text-amber-300">{cost} 🜲</span>}
      </div>
      {locked && <div className="text-[9px] text-red-300 mt-0.5">🔒 non débloqué</div>}
    </button>
  );
};

const TalentTree: React.FC<TalentTreeProps> = ({ stars, ascensionPoints, ascensionUpgrades, onUpgradeAscension, onBack }) => {
  const spent = getAscensionSpent(ascensionUpgrades || {});
  const ascBonus = getAscensionBonus(ascensionUpgrades || {});

  const nodes = useMemo(() => {
    return ASCENSION_UPGRADES.map(n => {
      const level = ascensionUpgrades[n.id] || 0;
      const maxed = level >= n.maxLevel;
      const prereqsOk = !n.prerequisites || n.prerequisites.every(id => (ascensionUpgrades[id] || 0) > 0);
      const gateOk = !n.requiredSpent || spent >= n.requiredSpent;
      const cost = getAscensionUpgradeCost(n.id, level);
      const canBuy = !maxed && prereqsOk && gateOk && ascensionPoints >= cost;
      return { ...n, level, cost, maxed, canBuy, locked: !(prereqsOk && gateOk) };
    });
  }, [ascensionUpgrades, ascensionPoints, spent]);

  const lines = useMemo(() => {
    const byId = new Map(nodes.map(n => [n.id, n]));
    const arr: { x1: number; y1: number; x2: number; y2: number; color: string; active: boolean }[] = [];
    for (const n of nodes) {
      for (const p of n.prerequisites || []) {
        const a = byId.get(p);
        if (!a) continue;
        const active = (a.level || 0) > 0;
        arr.push({ x1: a.x, y1: a.y, x2: n.x, y2: n.y, color: BRANCH_STYLE[n.branch].edge, active });
      }
    }
    return arr;
  }, [nodes]);

  return (
    <div className="flex flex-col h-screen bg-[#050913] text-foreground">
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b1323]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_10%_50%,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_90%_50%,rgba(245,158,11,0.35),transparent_35%)]" />
        <Button variant="outline" size="sm" onClick={onBack} className="relative z-10">← Back</Button>
        <h2 className="relative z-10 font-bold tracking-wide text-lg text-yellow-100 drop-shadow-[0_0_8px_rgba(250,204,21,0.35)]">🌳 ARBRE D’ASCENSION</h2>
        <div className="relative z-10 flex items-center gap-3 text-xs font-mono">
          <span className="text-yellow-400">⭐ {stars}</span>
          <span className="text-cyan-300">🜲 {ascensionPoints}</span>
          <span className="text-violet-300">Spent: {spent}</span>
        </div>
      </div>

      <div className="px-4 py-2 text-[11px] text-muted-foreground border-b border-white/10 flex flex-wrap items-center gap-3 bg-[#0a101d]">
        <span className="text-red-300">Rouge: Attaque</span>
        <span className="text-sky-300">Bleu: Défense</span>
        <span className="text-amber-300">Or: Économie</span>
        <span>Paliers de déblocage: 8 / 16 / 28 points</span>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="relative mx-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a1222] to-[#070c16] shadow-[inset_0_0_120px_rgba(0,0,0,0.35)]" style={{ width: 1040, minHeight: 540, maxWidth: '100%', overflowX: 'auto' }}>
          <div className="absolute top-2 left-10 text-[11px] text-red-200/80">{BRANCH_STYLE.attack.label}</div>
          <div className="absolute top-2 left-[410px] text-[11px] text-sky-200/80">{BRANCH_STYLE.defense.label}</div>
          <div className="absolute top-2 right-12 text-[11px] text-amber-200/80">{BRANCH_STYLE.economy.label}</div>

          <svg width="1040" height="540" className="absolute inset-0 pointer-events-none">
            <defs>
              <filter id="lineGlow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {lines.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.color}
                strokeOpacity={l.active ? 0.95 : 0.25}
                strokeWidth={l.active ? 3.5 : 2}
                strokeDasharray={l.active ? '0' : '6 5'}
                filter={l.active ? 'url(#lineGlow)' : undefined}
              />
            ))}
          </svg>

          {nodes.map(n => (
            <TreeNode
              key={n.id}
              id={n.id}
              name={n.name}
              icon={n.icon}
              branch={n.branch}
              x={n.x}
              y={n.y}
              level={n.level}
              maxLevel={n.maxLevel}
              locked={n.locked}
              canBuy={n.canBuy}
              cost={n.cost}
              requiredSpent={n.requiredSpent}
              ultimate={n.ultimate}
              onClick={() => onUpgradeAscension(n.id)}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-white/10 text-xs font-mono text-muted-foreground flex flex-wrap gap-3 bg-[#0a101d]">
        <span>ATK x{ascBonus.attackMult.toFixed(2)}</span>
        <span>SPD x{ascBonus.speedMult.toFixed(2)}</span>
        <span>Gold x{ascBonus.goldMult.toFixed(2)}</span>
        <span>HP +{ascBonus.extraHp}</span>
        <span>Crit +{Math.round((ascBonus.critChance || 0) * 100)}%</span>
        <span>Chain +{Math.round((ascBonus.chainChance || 0) * 100)}%</span>
      </div>
    </div>
  );
};

export default TalentTree;
