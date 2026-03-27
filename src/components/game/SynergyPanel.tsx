import React from 'react';
import { ActiveSynergy } from '../../game/types';

interface SynergyPanelProps {
  synergies: ActiveSynergy[];
}

const SynergyPanel: React.FC<SynergyPanelProps> = ({ synergies }) => {
  if (synergies.length === 0) return null;

  return (
    <div className="w-full max-w-full rounded-2xl border border-border/50 bg-card/88 p-3 shadow-lg backdrop-blur-md md:max-w-[260px]">
      <div className="mb-2">
        <div className="text-xs font-bold text-foreground">Synergies actives</div>
        <div className="text-[10px] text-muted-foreground">{synergies.length} bonus en cours</div>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {synergies.map((s, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-2">
            <div className="text-xs font-bold text-foreground">{s.name}</div>
            <div className="text-[11px] text-emerald-300 leading-tight mt-0.5">{s.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SynergyPanel;
