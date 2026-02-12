import React from 'react';
import { ActiveSynergy } from '../../game/types';

interface SynergyPanelProps {
  synergies: ActiveSynergy[];
}

const SynergyPanel: React.FC<SynergyPanelProps> = ({ synergies }) => {
  if (synergies.length === 0) return null;

  return (
    <div className="absolute top-16 left-4 bg-card/90 border border-border rounded-lg p-2 w-44 shadow-lg z-10">
      <div className="text-xs text-muted-foreground font-mono mb-1">Synergies</div>
      <div className="space-y-1">
        {synergies.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-foreground font-bold truncate">{s.name}</span>
            <span className="text-green-400 font-mono ml-1 shrink-0">{s.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SynergyPanel;
