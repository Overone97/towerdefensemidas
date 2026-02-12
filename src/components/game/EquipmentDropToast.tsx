import React, { useEffect, useState } from 'react';
import { ALL_EQUIPMENT } from '../../game/data/equipmentData';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';

interface EquipmentDropToastProps {
  equipmentId: string;
  onDone: () => void;
}

const EquipmentDropToast: React.FC<EquipmentDropToastProps> = ({ equipmentId, onDone }) => {
  const [visible, setVisible] = useState(true);
  const item = ALL_EQUIPMENT.find(e => e.id === equipmentId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!item) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className="px-4 py-3 rounded-lg border-2 shadow-xl bg-card flex items-center gap-3"
        style={{ borderColor: RARITY_COLORS[item.rarity] }}
      >
        <span className="text-2xl">{item.icon}</span>
        <div>
          <div className="text-xs text-muted-foreground">Boss Drop!</div>
          <div className="font-bold text-foreground">{item.name}</div>
          <div className="text-xs" style={{ color: RARITY_COLORS[item.rarity] }}>
            {RARITY_LABELS[item.rarity]} — {item.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDropToast;
