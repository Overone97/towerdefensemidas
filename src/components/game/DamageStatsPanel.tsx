import React, { useState } from 'react';
import { GameEngine } from '../../game/GameEngine';
import CharacterSprite from './CharacterSprite';

interface DamageStatsPanelProps {
  engine: GameEngine;
}

const DamageStatsPanel: React.FC<DamageStatsPanelProps> = ({ engine }) => {
  const [open, setOpen] = useState(false);
  const stats = engine.getDamageStats();
  const maxDmg = stats.length > 0 ? Math.max(stats[0].waveDamage, 1) : 1;

  if (stats.length === 0) return null;

  return (
    <div className="absolute right-2 bottom-2 z-10">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded font-mono text-xs font-bold bg-muted/80 text-muted-foreground hover:bg-accent transition-colors"
      >
        📊 DPS
      </button>
      {open && (
        <div className="absolute bottom-8 right-0 bg-popover/95 border border-border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[260px]">
          <div className="text-xs font-bold font-mono mb-2 text-foreground">Wave Damage</div>
          <div className="space-y-1.5">
            {stats.map(s => (
              <div key={s.unitId} className="flex items-center gap-2">
                <CharacterSprite config={s.config} size={20} owned />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-foreground truncate">{s.config.name}</span>
                    <span className="text-muted-foreground">{s.dps.toFixed(1)}/s</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(s.waveDamage / maxDmg) * 100}%`,
                        backgroundColor: s.config.weaponColor,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{Math.floor(s.waveDamage)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageStatsPanel;
