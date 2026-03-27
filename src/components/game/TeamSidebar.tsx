import React from 'react';
import { PlacedUnit } from '../../game/types';
import { ABILITIES } from '../../game/data/abilityData';
import CharacterSprite from './CharacterSprite';

interface TeamSidebarProps {
  placedUnits: PlacedUnit[];
  selectedUnitId: number | null;
  onSelectUnit: (unitId: number) => void;
  onActivateAbility: (unitId: number) => void;
}

const TeamSidebar: React.FC<TeamSidebarProps> = ({ placedUnits, selectedUnitId, onSelectUnit, onActivateAbility }) => {
  if (placedUnits.length === 0) return null;

  return (
    <div className="w-full max-w-full rounded-2xl border border-border/50 bg-card/88 p-2 shadow-lg backdrop-blur-md md:max-w-[220px]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-foreground">Équipe déployée</div>
          <div className="text-[10px] text-muted-foreground">{placedUnits.length} unité{placedUnits.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-1 md:gap-1.5 md:overflow-x-visible md:max-h-[52vh] md:overflow-y-auto">
        {placedUnits.map(unit => {
          const isSelected = unit.id === selectedUnitId;
          const ability = ABILITIES[unit.config.attackPattern];
          const onCooldown = unit.abilityCooldown > 0;

          return (
            <div
              key={unit.id}
              className={`min-w-[132px] rounded-xl border p-2 cursor-pointer transition-all md:min-w-0 ${
                isSelected
                  ? 'border-primary bg-primary/15 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : 'border-border/50 bg-black/20 hover:bg-accent/40'
              }`}
              onClick={() => onSelectUnit(unit.id)}
            >
              <div className="flex items-center gap-2">
                <CharacterSprite config={unit.config} size={32} owned />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-foreground">{unit.config.name}</div>
                  <div className="text-[10px] text-muted-foreground">Lv.{unit.level}</div>
                </div>
              </div>

              {ability && (
                <button
                  onClick={(e) => { e.stopPropagation(); onActivateAbility(unit.id); }}
                  disabled={onCooldown}
                  className={`mt-2 w-full rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                    onCooldown
                      ? 'bg-muted text-muted-foreground'
                      : unit.abilityActive
                        ? 'bg-primary text-primary-foreground animate-pulse'
                        : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
                  title={ability.name}
                >
                  {ability.icon} {onCooldown ? `${Math.ceil(unit.abilityCooldown)}s` : ability.name}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSidebar;
