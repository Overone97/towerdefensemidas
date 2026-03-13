import React from 'react';
import { ALL_MAPS } from '../../game/data/allMaps';
import { getQuestsForMap } from '../../game/data/questData';
import { getTodaysDungeons, isDungeonCompletedToday, DungeonDef } from '../../game/data/dungeonData';
import { Button } from '../ui/button';

interface MapSelectProps {
  stars: number;
  mapsCompleted: string[];
  questsCompleted: string[];
  dungeonCompletions: Record<string, string>;
  onSelectMap: (mapId: string) => void;
  onStartEndless: (mapId: string) => void;
  onStartDungeon: (dungeonId: string) => void;
  onStartAram?: (duo: boolean) => void;
  onBack: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Normal: 'text-green-400',
  Hard: 'text-orange-400',
  Extreme: 'text-red-400',
};

const MapSelect: React.FC<MapSelectProps> = ({ stars, mapsCompleted, questsCompleted, dungeonCompletions, onSelectMap, onStartEndless, onStartDungeon, onStartAram, onBack }) => {
  const todaysDungeons = getTodaysDungeons();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        <h2 className="font-bold font-mono">🗺️ Select Map</h2>
        <div className="text-yellow-400 font-mono font-bold">⭐ {stars}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Campaign Maps */}
        <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">📍 Campaign</h3>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {ALL_MAPS.map(map => {
            const unlocked = stars >= map.requiredStars;
            const completed = mapsCompleted.includes(map.id);
            const quests = getQuestsForMap(map.id);
            return (
              <button
                key={map.id}
                onClick={() => unlocked && onSelectMap(map.id)}
                disabled={!unlocked}
                className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 w-56 transition-all ${
                  unlocked
                    ? completed
                      ? 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10 cursor-pointer'
                      : 'border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                    : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className="w-24 h-16 rounded-lg border border-border"
                  style={{ backgroundColor: unlocked ? map.bgColor : '#1a1a1a' }}
                >
                  <svg viewBox="0 0 800 500" className="w-full h-full opacity-40">
                    <polyline
                      points={map.waypoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke={map.pathColor}
                      strokeWidth="30"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-bold">{map.name}</span>
                <span className="text-muted-foreground text-xs text-center">{map.description}</span>

                {unlocked && quests.length > 0 && (
                  <div className="w-full space-y-1 mt-1">
                    {quests.map(quest => {
                      const done = questsCompleted.includes(quest.id);
                      return (
                        <div key={quest.id} className={`flex items-center gap-1.5 text-xs ${done ? 'text-green-400' : 'text-muted-foreground'}`}>
                          <span>{done ? '✅' : '⬜'}</span>
                          <span className="flex-1 text-left">{quest.description}</span>
                          <span className="text-yellow-400 font-mono">+{quest.starsReward}⭐</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {completed && (
                  <div className="flex gap-1">
                    <span className="text-green-400 text-xs font-bold">✓ Completed</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onStartEndless(map.id); }}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      ♾️ Endless
                    </button>
                  </div>
                )}
                {!unlocked && (
                  <span className="text-muted-foreground text-xs font-mono">
                    Requires {map.requiredStars}⭐
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{map.slots.length} slots</span>
              </button>
            );
          })}
        </div>

        {/* Dungeons */}
        <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">🏰 Donjons du jour</h3>
        <p className="text-xs text-muted-foreground mb-4 text-center">3 donjons rotatifs chaque jour — complète-les pour des récompenses exclusives !</p>
        <div className="flex flex-wrap justify-center gap-6">
          {todaysDungeons.map(dungeon => {
            const completedToday = isDungeonCompletedToday(dungeon.id, dungeonCompletions);
            return (
              <button
                key={dungeon.id}
                onClick={() => !completedToday && onStartDungeon(dungeon.id)}
                disabled={completedToday}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 w-56 transition-all ${
                  completedToday
                    ? 'border-green-500/40 bg-green-500/5 opacity-60 cursor-not-allowed'
                    : 'border-border hover:border-primary/60 bg-primary/5 hover:bg-primary/10 cursor-pointer'
                }`}
                style={{ borderColor: completedToday ? undefined : dungeon.color + '60' }}
              >
                <div className="text-3xl">{dungeon.icon}</div>
                <span className="font-bold text-sm">{dungeon.name}</span>
                <span className={`text-xs font-bold ${DIFFICULTY_COLORS[dungeon.difficulty]}`}>
                  {dungeon.difficulty}
                </span>
                <span className="text-muted-foreground text-xs text-center leading-tight">{dungeon.description}</span>

                {/* Rules summary */}
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {dungeon.rules.allowedRarities && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {dungeon.rules.allowedRarities.join('/')} only
                    </span>
                  )}
                  {dungeon.rules.noEquipment && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">🚫 No equip</span>
                  )}
                  {dungeon.rules.maxUnits && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Max {dungeon.rules.maxUnits} units</span>
                  )}
                  {dungeon.rules.timeLimit && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⏱️ {Math.floor(dungeon.rules.timeLimit / 60)}min</span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {dungeon.totalWaves} waves
                  </span>
                </div>

                {/* Rewards */}
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-yellow-400 font-mono">+{dungeon.reward.stars}⭐</span>
                  <span className="text-yellow-600 font-mono">+{dungeon.reward.gold}💰</span>
                  {dungeon.reward.guaranteedEquipRarity && (
                    <span className="text-cyan-400 font-mono">🎁 {dungeon.reward.guaranteedEquipRarity}</span>
                  )}
                </div>

                {completedToday && (
                  <span className="text-green-400 text-xs font-bold mt-1">✓ Complété aujourd'hui</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapSelect;
