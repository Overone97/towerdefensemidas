import React from 'react';
import { Enemy } from '../../game/types';

interface EnemyInfoPanelProps {
  enemy: Enemy;
  onClose: () => void;
}

const ENEMY_TYPE_LABELS: Record<string, string> = {
  normal: '⚔️ Minion',
  fast: '🦀 Scuttle Crab',
  tank: '🔥 Brambleback',
  armored: '🛡️ Super Minion',
  dragon_fire: '🐉 Fire Dragon',
  dragon_ice: '🐉 Ice Dragon',
  dragon_earth: '🐉 Earth Dragon',
  dragon_air: '🐉 Air Dragon',
  boss: '👑 Baron Nashor',
};

const EnemyInfoPanel: React.FC<EnemyInfoPanelProps> = ({ enemy, onClose }) => {
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';
  const isPoisoned = enemy.statusEffects.some(e => e.type === 'poison');
  const isSlowed = enemy.statusEffects.some(e => e.type === 'slow');
  const isBurning = enemy.statusEffects.some(e => e.type === 'burn');

  return (
    <div className="absolute top-2 left-2 z-30 bg-card/95 border border-border rounded-xl shadow-2xl p-3 min-w-[200px] backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-foreground">
          {ENEMY_TYPE_LABELS[enemy.type] || enemy.type}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs font-mono mb-0.5">
          <span className="text-red-400">❤️ HP</span>
          <span className="text-foreground">{Math.ceil(enemy.hp)} / {Math.ceil(enemy.maxHp)}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${hpColor} transition-all duration-200 rounded-full`} style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-1 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground">🛡️ Armure</span>
          <span className="text-foreground">{enemy.armor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">💨 Vitesse</span>
          <span className="text-foreground">{enemy.speed.toFixed(0)} / {enemy.baseSpeed.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">💰 Récompense</span>
          <span className="text-yellow-400">{enemy.reward}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">📏 Taille</span>
          <span className="text-foreground">{enemy.size}</span>
        </div>
        {enemy.poisonResist && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">🧪 Résist. poison</span>
            <span className="text-green-400">Oui</span>
          </div>
        )}
        {enemy.slowResist > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">❄️ Résist. slow</span>
            <span className="text-blue-400">{Math.round(enemy.slowResist * 100)}%</span>
          </div>
        )}
      </div>

      {/* Status Effects */}
      {(isPoisoned || isSlowed || isBurning) && (
        <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1">
          {isPoisoned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/50 text-green-300">☠️ Poison</span>}
          {isSlowed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">❄️ Slow</span>}
          {isBurning && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-300">🔥 Burn</span>}
        </div>
      )}
    </div>
  );
};

export default EnemyInfoPanel;
