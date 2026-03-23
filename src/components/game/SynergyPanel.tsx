import React from 'react';
import { ActiveSynergy } from '../../game/types';

interface SynergyPanelProps {
  synergies: ActiveSynergy[];
}

const SynergyPanel: React.FC<SynergyPanelProps> = ({ synergies }) => {
  if (synergies.length === 0) return null;

  return (
    <div className="absolute top-16 left-4 bg-card/92 border border-border rounded-lg p-2 w-72 shadow-lg z-10">
      <div className="text-xs text-muted-foreground font-mono mb-2">Synergies actives ({synergies.length})</div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {synergies.map((s, i) => (
          <div key={i} className="rounded border border-white/10 bg-black/20 p-1.5">
            <div className="text-xs font-bold text-foreground">{s.name}</div>
            <div className="text-[11px] text-emerald-300 leading-tight">{s.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SynergyPanel;
