import React from 'react';
import { Button } from '../ui/button';
import { masteryXpForNextLevel } from '../../game/data/masteryData';

interface MasteryScreenProps {
  snapshot: {
    xp: Record<string, number>;
    level: Record<string, number>;
    paths: { rootChampionId: string; familyName: string; unlocks: { atLevel: number; championId: string }[] }[];
  };
  onBack: () => void;
}

const MasteryScreen: React.FC<MasteryScreenProps> = ({ snapshot, onBack }) => {
  const levelOf = (id: string) => snapshot.level[id] || 1;
  const xpOf = (id: string) => snapshot.xp[id] || 0;

  return (
    <div className="flex flex-col h-screen bg-[#070d16] text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        <h2 className="font-bold font-mono">🧬 Maîtrise des Familles</h2>
        <div className="text-xs text-cyan-200/80">XP par champion</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3">
          {snapshot.paths.map(path => {
            const lvl = levelOf(path.rootChampionId);
            const xp = xpOf(path.rootChampionId);
            const need = masteryXpForNextLevel(lvl);
            const pct = Math.max(0, Math.min(100, Math.floor((xp / Math.max(1, need)) * 100)));
            return (
              <div key={path.rootChampionId} className="rounded-xl border border-white/10 bg-[#0e1626] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold">{path.familyName}</div>
                    <div className="text-xs text-slate-300">Champion racine: {path.rootChampionId}</div>
                  </div>
                  <div className="text-xs font-mono text-cyan-300">Lv {lvl}</div>
                </div>

                <div className="h-2 rounded bg-black/40 overflow-hidden mb-1">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-slate-300 mb-3">XP {xp} / {need}</div>

                <div className="space-y-1.5">
                  {path.unlocks.map(u => (
                    <div key={`${path.rootChampionId}-${u.championId}`} className="flex items-center justify-between text-xs rounded border border-white/10 bg-black/20 px-2 py-1">
                      <span>Lv {u.atLevel} → débloque {u.championId}</span>
                      <span className={lvl >= u.atLevel ? 'text-emerald-300' : 'text-slate-400'}>{lvl >= u.atLevel ? 'Débloqué' : 'Verrouillé'}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MasteryScreen;
