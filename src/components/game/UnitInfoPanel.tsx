import React from 'react';
import { PlacedUnit, TargetPriority } from '../../game/types';
import { getCharacterStats, getCharacterUpgradeCost } from '../../game/data/characterData';
import { ABILITIES } from '../../game/data/abilityData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

interface UnitInfoPanelProps {
  unit: PlacedUnit;
  gold: number;
  onUpgrade: (unitId: number) => void;
  onRemove: (unitId: number) => void;
  onSetPriority: (unitId: number, priority: TargetPriority) => void;
  onActivateAbility: (unitId: number) => void;
  onOpenSkins?: (championId: string) => void;
  hasAvailableSkins?: boolean;
}

const PATTERN_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  single: { label: 'Single Target', icon: '🎯', desc: 'Fires a projectile at one enemy' },
  rapid: { label: 'Rapid Fire', icon: '⚡', desc: 'Instant damage to target, no projectile' },
  aoe_circle: { label: 'Area (Circle)', icon: '💥', desc: 'Damages all enemies in a circle' },
  line: { label: 'Pierce (Line)', icon: '➡️', desc: 'Projectile pierces through all enemies' },
  poison: { label: 'Poison', icon: '☠️', desc: 'Applies damage over time to target' },
  poison_trail: { label: 'Poison Trail', icon: '☠️', desc: 'Roams and leaves poison clouds' },
  mushroom: { label: 'Mushroom Trap', icon: '🍄', desc: 'Roams and plants explosive traps' },
  slow: { label: 'Slow', icon: '❄️', desc: 'Slows enemies in target area' },
  chain: { label: 'Chain Lightning', icon: '⚡', desc: 'Bounces between nearby enemies' },
  burst: { label: 'Burst', icon: '💣', desc: 'Fires multiple projectiles in a spread' },
};

const UnitInfoPanel: React.FC<UnitInfoPanelProps> = ({ unit, gold, onUpgrade, onRemove, onSetPriority, onActivateAbility, onOpenSkins, hasAvailableSkins }) => {
  const stats = getCharacterStats(unit.config, unit.level, unit.stars);
  const nextStats = getCharacterStats(unit.config, unit.level + 1, unit.stars);
  const upgradeCost = getCharacterUpgradeCost(unit.config, unit.level);
  const canUpgrade = gold >= upgradeCost;
  const dps = (stats.attack * stats.attackSpeed).toFixed(1);
  const nextDps = (nextStats.attack * nextStats.attackSpeed).toFixed(1);
  const pattern = PATTERN_LABELS[unit.config.attackPattern] || { label: unit.config.attackPattern, icon: '?', desc: '' };

  const priorities: { value: TargetPriority; label: string; icon: string }[] = [
    { value: 'closest', label: 'Closest', icon: '📍' },
    { value: 'weakest', label: 'Weakest', icon: '💔' },
    { value: 'most_advanced', label: 'Most Adv.', icon: '🏃' },
  ];

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 w-64 shadow-xl max-h-[62vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <CharacterSprite config={unit.config} size={28} owned />
        <div className="flex-1">
          <span className="text-foreground font-bold">{unit.config.name}</span>
          <div className="text-muted-foreground text-xs">Lv.{unit.level}</div>
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
          <span>{stats.range}</span>
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
      {(unit.config.dotDamage || unit.config.slowFactor || unit.config.aoeRadius || unit.config.chainCount || unit.config.burstCount || unit.config.canRevealStealth) && (
        <div className="bg-muted/30 rounded px-2 py-1.5 mb-3 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Passives</span>
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
          {unit.config.canRevealStealth && (
            <div className="text-xs text-pink-400">👁️ True Sight: révèle les ennemis invisibles</div>
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

      {/* Active Ability */}
      {(() => {
        const ability = ABILITIES[unit.config.attackPattern];
        if (!ability) return null;
        const onCooldown = unit.abilityCooldown > 0;
        const isActive = unit.abilityActive;
        const cdPercent = onCooldown ? (unit.abilityCooldown / ability.cooldown) * 100 : 0;
        return (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground">Active Ability</span>
            <button
              onClick={() => onActivateAbility(unit.id)}
              disabled={onCooldown}
              className={`w-full mt-1 relative overflow-hidden rounded px-3 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : onCooldown
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {onCooldown && (
                <div
                  className="absolute inset-0 bg-muted-foreground/20"
                  style={{ width: `${cdPercent}%` }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span>{ability.icon}</span>
                <span>{ability.name}</span>
                {onCooldown && <span className="text-xs">({Math.ceil(unit.abilityCooldown)}s)</span>}
                {isActive && <span className="text-xs">(Active!)</span>}
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground mt-0.5">{ability.description}</p>
          </div>
        );
      })()}

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

      {/* Skin button */}
      {hasAvailableSkins && onOpenSkins && (
        <Button
          onClick={() => onOpenSkins(unit.config.id)}
          size="sm"
          variant="outline"
          className="w-full mt-2 text-xs"
        >
          🎨 Skins
        </Button>
      )}
    </div>
  );
};

export default UnitInfoPanel;
