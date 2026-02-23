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
    <div className="flex flex-col gap-1 mr-2 max-h-[500px] overflow-y-auto shrink-0">
      {placedUnits.map(unit => {
        const isSelected = unit.id === selectedUnitId;
        const ability = ABILITIES[unit.config.attackPattern];
        const onCooldown = unit.abilityCooldown > 0;

        return (
          <div
            key={unit.id}
            className={`relative flex flex-col items-center p-1.5 rounded-lg border-2 cursor-pointer transition-all w-16 ${
              isSelected
                ? 'border-primary bg-primary/20 scale-105'
                : 'border-border bg-card/80 hover:bg-accent/50'
            }`}
            onClick={() => onSelectUnit(unit.id)}
          >
            <CharacterSprite config={unit.config} size={32} owned />
            <span className="text-[9px] font-mono font-bold text-foreground leading-tight mt-0.5 truncate w-full text-center">
              {unit.config.name}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground">Lv.{unit.level}</span>

            {ability && (
              <button
                onClick={(e) => { e.stopPropagation(); onActivateAbility(unit.id); }}
                disabled={onCooldown}
                className={`w-full mt-0.5 px-1 py-0.5 rounded text-[8px] font-bold transition-colors ${
                  onCooldown
                    ? 'bg-muted text-muted-foreground'
                    : unit.abilityActive
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
                title={ability.name}
              >
                {ability.icon} {onCooldown ? `${Math.ceil(unit.abilityCooldown)}s` : 'Q'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamSidebar;
