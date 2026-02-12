import React from 'react';
import { PlacedUnit, TargetPriority } from '../../game/types';
import { getCharacterStats, getCharacterUpgradeCost, RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import { Button } from '../ui/button';

interface UnitInfoPanelProps {
  unit: PlacedUnit;
  gold: number;
  onUpgrade: (unitId: number) => void;
  onRemove: (unitId: number) => void;
  onSetPriority: (unitId: number, priority: TargetPriority) => void;
}

const PATTERN_LABELS: Record<string, string> = {
  single: 'Single Target',
  rapid: 'Rapid Fire',
  aoe_circle: 'Area (Circle)',
  line: 'Pierce (Line)',
  poison: 'Poison',
  slow: 'Slow',
  chain: 'Chain Lightning',
  burst: 'Burst',
};

const UnitInfoPanel: React.FC<UnitInfoPanelProps> = ({ unit, gold, onUpgrade, onRemove, onSetPriority }) => {
  const stats = getCharacterStats(unit.config, unit.level);
  const upgradeCost = getCharacterUpgradeCost(unit.config, unit.level);
  const canUpgrade = gold >= upgradeCost;
  const rarityColor = RARITY_COLORS[unit.config.rarity];

  const priorities: { value: TargetPriority; label: string }[] = [
    { value: 'closest', label: 'Closest' },
    { value: 'weakest', label: 'Weakest' },
    { value: 'most_advanced', label: 'Most Adv.' },
  ];

  return (
    <div className="absolute top-16 right-4 bg-card border border-border rounded-lg p-4 w-56 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-5 h-5 rounded-sm border-2"
          style={{ backgroundColor: unit.config.bodyColor, borderColor: rarityColor }}
        />
        <span className="text-foreground font-bold">{unit.config.name}</span>
        <span className="text-muted-foreground text-sm ml-auto">Lv.{unit.level}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold" style={{ color: rarityColor }}>
          {RARITY_LABELS[unit.config.rarity]}
        </span>
        <span className="text-xs text-muted-foreground">
          {PATTERN_LABELS[unit.config.attackPattern] || unit.config.attackPattern}
        </span>
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

      <div className="flex gap-2">
        <Button
          onClick={() => onUpgrade(unit.id)}
          disabled={!canUpgrade}
          size="sm"
          className="flex-1"
        >
          Upgrade ({upgradeCost}g)
        </Button>
        <Button
          onClick={() => onRemove(unit.id)}
          size="sm"
          variant="destructive"
          className="shrink-0"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default UnitInfoPanel;
