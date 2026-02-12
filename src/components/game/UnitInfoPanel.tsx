import React from 'react';
import { PlacedUnit, TargetPriority } from '../../game/types';
import { getUnitStats, getUpgradeCost } from '../../game/data/unitData';
import { Button } from '../ui/button';

interface UnitInfoPanelProps {
  unit: PlacedUnit;
  gold: number;
  onUpgrade: (unitId: number) => void;
  onSetPriority: (unitId: number, priority: TargetPriority) => void;
}

const UnitInfoPanel: React.FC<UnitInfoPanelProps> = ({ unit, gold, onUpgrade, onSetPriority }) => {
  const stats = getUnitStats(unit.config, unit.level);
  const upgradeCost = getUpgradeCost(unit);
  const canUpgrade = gold >= upgradeCost;

  const priorities: { value: TargetPriority; label: string }[] = [
    { value: 'closest', label: 'Closest' },
    { value: 'weakest', label: 'Weakest' },
    { value: 'most_advanced', label: 'Most Advanced' },
  ];

  return (
    <div className="absolute top-16 right-4 bg-card border border-border rounded-lg p-4 w-56 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-5 h-5 rounded-sm"
          style={{ backgroundColor: unit.config.color }}
        />
        <span className="text-foreground font-bold">{unit.config.name}</span>
        <span className="text-muted-foreground text-sm ml-auto">Lv.{unit.level}</span>
      </div>

      <div className="space-y-1 mb-3 text-sm font-mono">
        <div className="flex justify-between text-foreground">
          <span>ATK</span><span>{stats.attack}</span>
        </div>
        <div className="flex justify-between text-foreground">
          <span>SPD</span><span>{stats.attackSpeed.toFixed(1)}/s</span>
        </div>
        <div className="flex justify-between text-foreground">
          <span>RNG</span><span>{stats.range}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-muted-foreground">Target Priority</span>
        <div className="flex gap-1 mt-1">
          {priorities.map(p => (
            <button
              key={p.value}
              onClick={() => onSetPriority(unit.id, p.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                unit.targetPriority === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onUpgrade(unit.id)}
        disabled={!canUpgrade}
        size="sm"
        className="w-full"
      >
        Upgrade ({upgradeCost}g)
      </Button>
    </div>
  );
};

export default UnitInfoPanel;
