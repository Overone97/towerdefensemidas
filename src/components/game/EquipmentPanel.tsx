import React, { useState } from 'react';
import { OwnedCharacter } from '../../game/types';
import { ALL_EQUIPMENT, EquipmentItem, EquipmentSlotType } from '../../game/data/equipmentData';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import CharacterSprite from './CharacterSprite';
import { Button } from '../ui/button';

interface EquipmentPanelProps {
  inventory: OwnedCharacter[];
  equipmentInventory: string[];
  onEquip: (characterInstanceId: number, equipmentId: string) => void;
  onUnequip: (characterInstanceId: number, slot: EquipmentSlotType) => void;
  onBack: () => void;
}

const SLOT_ICONS: Record<EquipmentSlotType, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ inventory, equipmentInventory, onEquip, onUnequip, onBack }) => {
  const [selectedChar, setSelectedChar] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlotType | null>(null);

  const char = selectedChar !== null ? inventory.find(c => c.instanceId === selectedChar) : null;

  const availableItems = equipmentInventory
    .map(id => ALL_EQUIPMENT.find(e => e.id === id))
    .filter(Boolean) as EquipmentItem[];

  const filteredItems = selectedSlot
    ? availableItems.filter(item => item.slot === selectedSlot)
    : availableItems;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-bold">⚙️ Equipment</h2>
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Character list */}
        <div className="w-48 border-r border-border overflow-y-auto p-2 space-y-1">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1">Characters</h3>
          {inventory.map(c => {
            const eqCount = [c.equipment.weapon, c.equipment.armor, c.equipment.accessory].filter(Boolean).length;
            return (
              <button
                key={c.instanceId}
                onClick={() => { setSelectedChar(c.instanceId); setSelectedSlot(null); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors ${
                  selectedChar === c.instanceId ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                <CharacterSprite config={c.config} size={24} owned />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-xs">{c.config.name}</div>
                  <div className="text-[10px]" style={{ color: RARITY_COLORS[c.config.rarity] }}>
                    {RARITY_LABELS[c.config.rarity]} Lv.{c.level}
                  </div>
                </div>
                {eqCount > 0 && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1 rounded">{eqCount}/3</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Equipment details */}
        <div className="flex-1 p-4 overflow-y-auto">
          {char ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <CharacterSprite config={char.config} size={40} owned />
                <div>
                  <h3 className="font-bold text-foreground">{char.config.name}</h3>
                  <span className="text-xs" style={{ color: RARITY_COLORS[char.config.rarity] }}>
                    {RARITY_LABELS[char.config.rarity]} Lv.{char.level}
                  </span>
                </div>
              </div>

              {/* Equipment slots */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['weapon', 'armor', 'accessory'] as EquipmentSlotType[]).map(slot => {
                  const eqId = char.equipment[slot];
                  const item = eqId ? ALL_EQUIPMENT.find(e => e.id === eqId) : null;
                  const isSelected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(isSelected ? null : slot)}
                      className={`border rounded-lg p-3 text-center transition-all ${
                        isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="text-lg mb-1">{SLOT_ICONS[slot]}</div>
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">{slot}</div>
                      {item ? (
                        <>
                          <div className="text-xs font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {item.icon} {item.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{item.description}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onUnequip(char.instanceId, slot); }}
                            className="mt-1 text-[10px] text-destructive hover:underline"
                          >
                            Unequip
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">Empty</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Available items to equip */}
              {selectedSlot && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                    Available {selectedSlot}s ({filteredItems.length})
                  </h4>
                  {filteredItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No {selectedSlot}s available. Kill bosses to get drops!</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredItems.map((item, idx) => (
                        <button
                          key={`${item.id}-${idx}`}
                          onClick={() => onEquip(char.instanceId, item.id)}
                          className="border border-border rounded-lg p-3 text-left hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                              {item.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{item.description}</div>
                          <div className="text-[10px] mt-1" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {RARITY_LABELS[item.rarity]}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a character to manage equipment
            </div>
          )}
        </div>
      </div>

      {/* Unequipped items summary */}
      <div className="px-4 py-2 border-t border-border">
        <span className="text-xs text-muted-foreground">
          📦 Unequipped items: {equipmentInventory.length}
        </span>
      </div>
    </div>
  );
};

export default EquipmentPanel;
