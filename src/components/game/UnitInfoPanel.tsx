import React from 'react';
import { PlacedUnit, TargetPriority } from '../../game/types';
import { getCharacterStats, getCharacterUpgradeCost } from '../../game/data/characterData';
import { ABILITIES } from '../../game/data/abilityData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

interface UnitInfoPanelProps {
  unit: PlacedUnit;
  onUpgrade: (unitId: number) => void;
  onRemove: (unitId: number) => void;
  onSetPriority: (unitId: number, priority: TargetPriority) => void;
  onActivateAbility: (unitId: number) => void;
  onOpenSkins?: (championId: string) => void;
  hasAvailableSkins?: boolean;
}

const PATTERN_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  single: { label: 'Cible unique', icon: '🎯', desc: 'Frappe une cible avec précision.' },
  rapid: { label: 'Tir rapide', icon: '⚡', desc: 'Arrose la cible en continu.' },
  aoe_circle: { label: 'Zone circulaire', icon: '💥', desc: 'Nettoie les groupes d’ennemis.' },
  line: { label: 'Percée', icon: '➡️', desc: 'Traverse plusieurs ennemis.' },
  poison: { label: 'Poison', icon: '☠️', desc: 'Fait fondre la cible dans la durée.' },
  poison_trail: { label: 'Traînée toxique', icon: '☠️', desc: 'Empoisonne toute la route.' },
  mushroom: { label: 'Pièges champignons', icon: '🍄', desc: 'Pose des bombes bien sales.' },
  slow: { label: 'Contrôle', icon: '❄️', desc: 'Ralentit les ennemis et casse le tempo.' },
  chain: { label: 'Chaîne', icon: '⚡', desc: 'Rebondit entre plusieurs cibles.' },
  burst: { label: 'Burst', icon: '💣', desc: 'Explose vite et fort.' },
};

const UnitInfoPanel: React.FC<UnitInfoPanelProps> = ({ unit, onUpgrade, onRemove, onSetPriority, onActivateAbility, onOpenSkins, hasAvailableSkins }) => {
  const stats = getCharacterStats(unit.config, unit.level, unit.stars);
  const nextStats = getCharacterStats(unit.config, unit.level + 1, unit.stars);
  const upgradeCost = getCharacterUpgradeCost(unit.config, unit.level);
  const currentXp = unit as PlacedUnit & { xp?: number };
  const canUpgrade = (currentXp.xp || 0) >= upgradeCost;
  const dps = (stats.attack * stats.attackSpeed).toFixed(1);
  const nextDps = (nextStats.attack * nextStats.attackSpeed).toFixed(1);
  const pattern = PATTERN_LABELS[unit.config.attackPattern] || { label: unit.config.attackPattern, icon: '?', desc: '' };

  const priorities: { value: TargetPriority; label: string; icon: string }[] = [
    { value: 'closest', label: 'Proche', icon: '📍' },
    { value: 'weakest', label: 'Faible', icon: '💔' },
    { value: 'most_advanced', label: 'Avancé', icon: '🏃' },
  ];

  return (
    <div className="w-[min(92vw,340px)] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md max-h-[70vh] overflow-y-auto">
      <div className="flex items-start gap-3 mb-3">
        <CharacterSprite config={unit.config} size={36} owned />
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-foreground truncate">{unit.config.name}</div>
          <div className="text-xs text-muted-foreground">Niveau {unit.level}</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-lg bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
            <span>{pattern.icon}</span>
            <span className="font-semibold text-foreground">{pattern.label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{pattern.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl bg-muted/35 p-2">
          <div className="text-[10px] text-muted-foreground">⚔️ ATK</div>
          <div className="text-sm font-mono font-bold text-foreground">{stats.attack} <span className="text-xs text-green-400">→ {nextStats.attack}</span></div>
        </div>
        <div className="rounded-xl bg-muted/35 p-2">
          <div className="text-[10px] text-muted-foreground">💨 SPD</div>
          <div className="text-sm font-mono font-bold text-foreground">{stats.attackSpeed.toFixed(1)} <span className="text-xs text-green-400">→ {nextStats.attackSpeed.toFixed(1)}</span></div>
        </div>
        <div className="rounded-xl bg-muted/35 p-2">
          <div className="text-[10px] text-muted-foreground">🎯 Portée</div>
          <div className="text-sm font-mono font-bold text-foreground">{stats.range}</div>
        </div>
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-2">
          <div className="text-[10px] text-primary/80">DPS</div>
          <div className="text-sm font-mono font-bold text-primary">{dps} <span className="text-xs text-green-400">→ {nextDps}</span></div>
        </div>
        <div className="flex justify-between text-cyan-300 pt-1">
          <span>✨ XP</span>
          <span>{currentXp.xp || 0}</span>
        </div>
      </div>

      {(unit.config.dotDamage || unit.config.slowFactor || unit.config.aoeRadius || unit.config.chainCount || unit.config.burstCount || unit.config.canRevealStealth) && (
        <div className="rounded-xl bg-muted/25 p-3 mb-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Spécialités</div>
          {unit.config.dotDamage && <div className="text-xs text-green-400">☠️ DoT: {unit.config.dotDamage}/s pendant {unit.config.dotDuration || 2}s</div>}
          {unit.config.slowFactor && <div className="text-xs text-blue-400">❄️ Slow: {Math.round((1 - unit.config.slowFactor) * 100)}% pendant {unit.config.slowDuration || 2}s</div>}
          {unit.config.aoeRadius && <div className="text-xs text-orange-400">💥 Rayon AoE: {unit.config.aoeRadius}</div>}
          {unit.config.chainCount && <div className="text-xs text-purple-400">⚡ Chaîne: {unit.config.chainCount} cibles</div>}
          {unit.config.burstCount && <div className="text-xs text-yellow-400">💣 Burst: {unit.config.burstCount} projectiles</div>}
          {unit.config.canRevealStealth && <div className="text-xs text-pink-400">👁️ Révèle les ennemis invisibles</div>}
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">Priorité de cible</div>
        <div className="grid grid-cols-3 gap-1.5">
          {priorities.map(p => (
            <button
              key={p.value}
              onClick={() => onSetPriority(unit.id, p.value)}
              className={`text-[11px] px-2 py-2 rounded-lg transition-colors ${
                unit.targetPriority === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <span className="block">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {(() => {
        const ability = ABILITIES[unit.config.attackPattern];
        if (!ability) return null;
        const onCooldown = unit.abilityCooldown > 0;
        const isActive = unit.abilityActive;
        const cdPercent = onCooldown ? (unit.abilityCooldown / ability.cooldown) * 100 : 0;
        return (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">Compétence active</div>
            <button
              onClick={() => onActivateAbility(unit.id)}
              disabled={onCooldown}
              className={`w-full relative overflow-hidden rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : onCooldown
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {onCooldown && (
                <div className="absolute inset-0 bg-muted-foreground/20" style={{ width: `${cdPercent}%` }} />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span>{ability.icon}</span>
                <span>{ability.name}</span>
                {onCooldown && <span className="text-xs">({Math.ceil(unit.abilityCooldown)}s)</span>}
                {isActive && <span className="text-xs">(Actif)</span>}
              </span>
            </button>
            <p className="text-[10px] text-muted-foreground mt-1">{ability.description}</p>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onUpgrade(unit.id)} disabled={!canUpgrade} size="sm" className="w-full">
          ⬆ Upgrade ({upgradeCost} XP)
        </Button>
        <Button onClick={() => onRemove(unit.id)} size="sm" variant="destructive" className="w-full">
          Retirer
        </Button>
      </div>

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
