import React from 'react';
import { PlacedUnit, TargetPriority } from '../../game/types';
import { getCharacterStats, getCharacterUpgradeCost, RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

interface UnitInfoPanelProps {
  unit: PlacedUnit;
  gold: number;
  onUpgrade: (unitId: number) => void;
  onRemove: (unitId: number) => void;
  onSetPriority: (unitId: number, priority: TargetPriority) => void;
}

const PATTERN_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  single: { label: 'Single Target', icon: '🎯', desc: 'Fires a projectile at one enemy' },
  rapid: { label: 'Rapid Fire', icon: '⚡', desc: 'Instant damage to target, no projectile' },
  aoe_circle: { label: 'Area (Circle)', icon: '💥', desc: 'Damages all enemies in a circle' },
  line: { label: 'Pierce (Line)', icon: '➡️', desc: 'Projectile pierces through all enemies' },
  poison: { label: 'Poison', icon: '☠️', desc: 'Applies damage over time to target' },
  slow: { label: 'Slow', icon: '❄️', desc: 'Slows enemies in target area' },
  chain: { label: 'Chain Lightning', icon: '⚡', desc: 'Bounces between nearby enemies' },
  burst: { label: 'Burst', icon: '💣', desc: 'Fires multiple projectiles in a spread' },
};

const UnitInfoPanel: React.FC<UnitInfoPanelProps> = ({ unit, gold, onUpgrade, onRemove, onSetPriority }) => {
  const stats = getCharacterStats(unit.config, unit.level);
  const nextStats = getCharacterStats(unit.config, unit.level + 1);
  const upgradeCost = getCharacterUpgradeCost(unit.config, unit.level);
  const canUpgrade = gold >= upgradeCost;
  const rarityColor = RARITY_COLORS[unit.config.rarity];
  const dps = (stats.attack * stats.attackSpeed).toFixed(1);
  const nextDps = (nextStats.attack * nextStats.attackSpeed).toFixed(1);
  const pattern = PATTERN_LABELS[unit.config.attackPattern] || { label: unit.config.attackPattern, icon: '?', desc: '' };

  const priorities: { value: TargetPriority; label: string; icon: string }[] = [
    { value: 'closest', label: 'Closest', icon: '📍' },
    { value: 'weakest', label: 'Weakest', icon: '💔' },
    { value: 'most_advanced', label: 'Most Adv.', icon: '🏃' },
  ];

  return (
    <div className="absolute top-16 right-4 bg-card border border-border rounded-lg p-4 w-64 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <CharacterSprite config={unit.config} size={28} owned />
        <div className="flex-1">
          <span className="text-foreground font-bold">{unit.config.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold" style={{ color: rarityColor }}>
              {RARITY_LABELS[unit.config.rarity]}
            </span>
            <span className="text-muted-foreground text-xs">Lv.{unit.level}</span>
          </div>
        </div>
      </div>

      {/* Attack Pattern */}
      <div className="bg-muted/50 rounded px-2 py-1 mb-3">
        <div className="flex items-center gap-1 text-xs">
          <span>{pattern.icon}</span>
          <span className="text-foreground font-semibold">{pattern.label}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{pattern.desc}</p>
      </div>

      {/* Stats */}
      <div className="space-y-1 mb-2 text-sm font-mono">
        <div className="flex justify-between text-foreground">
          <span>⚔️ ATK</span>
          <span>
            {stats.attack}
            <span className="text-xs text-green-400 ml-1">→{nextStats.attack}</span>
          </span>
        </div>
        <div className="flex justify-between text-foreground">
          <span>💨 SPD</span>
          <span>
            {stats.attackSpeed.toFixed(1)}/s
            <span className="text-xs text-green-400 ml-1">→{nextStats.attackSpeed.toFixed(1)}</span>
          </span>
        </div>
        <div className="flex justify-between text-foreground">
          <span>🎯 RNG</span>
          <span>
            {stats.range}
            <span className="text-xs text-green-400 ml-1">→{nextStats.range}</span>
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-1 mt-1">
          <span className="text-primary font-bold">DPS</span>
          <span className="text-primary font-bold">
            {dps}
            <span className="text-xs text-green-400 ml-1">→{nextDps}</span>
          </span>
        </div>
      </div>

      {/* Special abilities */}
      {(unit.config.dotDamage || unit.config.slowFactor || unit.config.aoeRadius || unit.config.chainCount || unit.config.burstCount) && (
        <div className="bg-muted/30 rounded px-2 py-1.5 mb-3 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Abilities</span>
          {unit.config.dotDamage && (
            <div className="text-xs text-green-400">☠️ DoT: {unit.config.dotDamage}/s for {unit.config.dotDuration || 2}s</div>
          )}
          {unit.config.slowFactor && (
            <div className="text-xs text-blue-400">❄️ Slow: {Math.round((1 - unit.config.slowFactor) * 100)}% for {unit.config.slowDuration || 2}s</div>
          )}
          {unit.config.aoeRadius && (
            <div className="text-xs text-orange-400">💥 AoE Radius: {unit.config.aoeRadius}</div>
          )}
          {unit.config.chainCount && (
            <div className="text-xs text-purple-400">⚡ Chain: {unit.config.chainCount} targets</div>
          )}
          {unit.config.burstCount && (
            <div className="text-xs text-yellow-400">💣 Burst: {unit.config.burstCount} projectiles</div>
          )}
        </div>
      )}

      {/* Target Priority */}
      <div className="mb-3">
        <span className="text-xs text-muted-foreground">Target Priority</span>
        <div className="flex gap-1 mt-1">
          {priorities.map(p => (
            <button
              key={p.value}
              onClick={() => onSetPriority(unit.id, p.value)}
              className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-0.5 ${
                unit.targetPriority === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onUpgrade(unit.id)}
          disabled={!canUpgrade}
          size="sm"
          className="flex-1"
        >
          ⬆ Upgrade ({upgradeCost}g)
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
