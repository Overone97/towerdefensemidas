import React, { useState } from 'react';
import { ALL_CHARACTERS } from '../../game/data/characterData';
import { RARITY_COLORS, RARITY_LABELS } from '../../game/data/characterData';
import { CHARACTER_ELEMENTS, ELEMENT_COLORS, ELEMENT_LABELS, PAIR_SYNERGIES, ELEMENT_SYNERGIES } from '../../game/data/synergyData';
import { OwnedCharacter, Rarity, EnemyType } from '../../game/types';
import { ENEMY_CONFIGS } from '../../game/data/waveData';
import { Button } from '../ui/button';
import CharacterSprite from './CharacterSprite';

interface WikiScreenProps {
  inventory: OwnedCharacter[];
  onBack: () => void;
}

const ATTACK_PATTERN_LABELS: Record<string, { icon: string; label: string }> = {
  single: { icon: '🎯', label: 'Single Target' },
  rapid: { icon: '⚡', label: 'Rapid Fire' },
  aoe_circle: { icon: '💥', label: 'Area of Effect' },
  line: { icon: '➡️', label: 'Piercing Line' },
  poison: { icon: '☠️', label: 'Poison' },
  poison_trail: { icon: '☁️', label: 'Poison Trail' },
  mushroom: { icon: '🍄', label: 'Mushroom Trap' },
  slow: { icon: '🧊', label: 'Slow' },
  chain: { icon: '⛓️', label: 'Chain Lightning' },
  burst: { icon: '💣', label: 'Burst' },
};

const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

type Tab = 'units' | 'synergies' | 'bestiary';

const BESTIARY_INFO: Record<string, { name: string; desc: string; icon: string; wave: string }> = {
  normal: { name: 'Melee Minion', desc: 'Sbire de base de la Faille. Petit, nombreux, mais inoffensif seul.', icon: '⚔️', wave: 'Vague 1+' },
  fast: { name: 'Scuttle Crab', desc: 'Crabe rapide de la rivière. Fragile mais difficile à toucher grâce à sa vitesse.', icon: '🦀', wave: 'Vague 5+' },
  tank: { name: 'Red Brambleback', desc: 'Le Brambleback rouge. Massif, lent, recouvert de braises ardentes.', icon: '🔥', wave: 'Vague 11+' },
  armored: { name: 'Super Minion', desc: 'Sbire d\'élite blindé. Armure dorée, résistant au poison et au ralentissement.', icon: '🛡️', wave: 'Vague 14+' },
  dragon_fire: { name: 'Dragon Infernal', desc: 'Dragon élémentaire de feu. Ailes déployées, souffle dévastateur.', icon: '🐉', wave: 'Boss Vague 10' },
  dragon_ice: { name: 'Dragon de Glace', desc: 'Dragon élémentaire de glace. Aura glacée qui ralentit tout autour.', icon: '❄️', wave: 'Boss Vague 20' },
  dragon_earth: { name: 'Dragon de Terre', desc: 'Dragon élémentaire de terre. Écailles rocheuses, armure massive.', icon: '🪨', wave: 'Boss Vague 30' },
  dragon_air: { name: 'Dragon des Airs', desc: 'Dragon élémentaire d\'air. Ultra rapide, semi-transparent.', icon: '🌪️', wave: 'Boss Vague 40' },
  boss: { name: 'Baron Nashor / Atakhan', desc: 'Le seigneur de la Faille. Tentacules, œil central, aura magique dévastatrice. Atakhan apparaît à la vague 50.', icon: '👁️', wave: 'Boss Vague 50' },
};

const WikiScreen: React.FC<WikiScreenProps> = ({ inventory, onBack }) => {
  const [tab, setTab] = useState<Tab>('units');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  const ownedIds = new Set(inventory.map(c => c.config.id));
  const sortedChars = [...ALL_CHARACTERS].sort((a, b) => {
    const ri = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    if (ri !== 0) return ri;
    return a.name.localeCompare(b.name);
  });

  const selectedChar = selectedCharId ? ALL_CHARACTERS.find(c => c.id === selectedCharId) : null;
  const isOwned = selectedCharId ? ownedIds.has(selectedCharId) : false;
  const ownedData = selectedCharId ? inventory.find(c => c.config.id === selectedCharId) : null;

  const charPairSynergies = selectedCharId
    ? PAIR_SYNERGIES.filter(p => p.char1Id === selectedCharId || p.char2Id === selectedCharId)
    : [];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('units')}
            className={`px-4 py-1.5 rounded text-sm font-mono font-bold transition-colors ${
              tab === 'units' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            📖 Units ({ownedIds.size}/{ALL_CHARACTERS.length})
          </button>
          <button
            onClick={() => setTab('bestiary')}
            className={`px-4 py-1.5 rounded text-sm font-mono font-bold transition-colors ${
              tab === 'bestiary' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            🐉 Bestiaire
          </button>
          <button
            onClick={() => setTab('synergies')}
            className={`px-4 py-1.5 rounded text-sm font-mono font-bold transition-colors ${
              tab === 'synergies' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            🔗 Synergies
          </button>
        </div>
        <div className="w-16" />
      </div>

      {tab === 'units' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Unit grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {sortedChars.map(char => {
                const owned = ownedIds.has(char.id);
                const element = CHARACTER_ELEMENTS[char.id];
                const isSelected = selectedCharId === char.id;

                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(isSelected ? null : char.id)}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary scale-105'
                        : owned
                        ? 'hover:scale-105'
                        : 'opacity-50 hover:opacity-70'
                    }`}
                    style={{
                      borderColor: RARITY_COLORS[char.rarity],
                      backgroundColor: isSelected ? `${RARITY_COLORS[char.rarity]}15` : 'transparent',
                    }}
                  >
                    <div className="relative">
                      <CharacterSprite config={char} size={48} owned={owned} />
                      {element && (
                        <div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                          style={{ backgroundColor: ELEMENT_COLORS[element] + '33', border: `1px solid ${ELEMENT_COLORS[element]}` }}
                        >
                          {ELEMENT_LABELS[element].charAt(0)}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-foreground font-mono font-bold text-center leading-tight truncate w-full">
                      {owned ? char.name : '???'}
                    </span>
                    <span
                      className="text-[9px] font-mono font-bold"
                      style={{ color: RARITY_COLORS[char.rarity] }}
                    >
                      {RARITY_LABELS[char.rarity]}
                    </span>

                    {owned && (
                      <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-[7px] font-bold" style={{ color: '#fff' }}>✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          {selectedChar && (
            <div className="w-72 border-l border-border bg-card overflow-y-auto p-4 shrink-0">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    boxShadow: `0 0 20px ${RARITY_COLORS[selectedChar.rarity]}44`,
                    border: `2px solid ${RARITY_COLORS[selectedChar.rarity]}`,
                  }}
                >
                  <CharacterSprite config={selectedChar} size={80} owned={isOwned} animate={isOwned} />
                </div>
                <h3 className="text-foreground font-bold text-lg font-mono">
                  {isOwned ? selectedChar.name : '???'}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold font-mono px-2 py-0.5 rounded"
                    style={{
                      color: RARITY_COLORS[selectedChar.rarity],
                      backgroundColor: `${RARITY_COLORS[selectedChar.rarity]}15`,
                    }}
                  >
                    ★ {RARITY_LABELS[selectedChar.rarity]}
                  </span>
                  {CHARACTER_ELEMENTS[selectedChar.id] && (
                    <span
                      className="text-sm font-mono px-2 py-0.5 rounded"
                      style={{
                        color: ELEMENT_COLORS[CHARACTER_ELEMENTS[selectedChar.id]],
                        backgroundColor: `${ELEMENT_COLORS[CHARACTER_ELEMENTS[selectedChar.id]]}15`,
                      }}
                    >
                      {ELEMENT_LABELS[CHARACTER_ELEMENTS[selectedChar.id]]}
                    </span>
                  )}
                </div>
                {ownedData && (
                  <span className="text-muted-foreground text-xs font-mono">Level {ownedData.level}</span>
                )}
                {!isOwned && (
                  <span className="text-muted-foreground text-xs font-mono italic">Not yet obtained</span>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <h4 className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatBar label="ATK" value={selectedChar.attack} max={35} color="#ff6644" />
                  <StatBar label="SPD" value={selectedChar.attackSpeed} max={2.5} color="#44aaff" />
                  <StatBar label="RNG" value={selectedChar.range} max={220} color="#44dd44" />
                  {selectedChar.aoeRadius && <StatBar label="AOE" value={selectedChar.aoeRadius} max={70} color="#ffaa44" />}
                </div>
              </div>

              {/* Attack pattern */}
              <div className="mb-4">
                <h4 className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-1">Attack Type</h4>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <span className="text-lg">{ATTACK_PATTERN_LABELS[selectedChar.attackPattern]?.icon}</span>
                  <span className="text-foreground text-sm font-mono font-bold">
                    {ATTACK_PATTERN_LABELS[selectedChar.attackPattern]?.label}
                  </span>
                </div>
                {selectedChar.dotDamage && (
                  <div className="text-xs font-mono mt-1" style={{ color: '#4ade80' }}>
                    DoT: {selectedChar.dotDamage}/s for {selectedChar.dotDuration}s
                  </div>
                )}
                {selectedChar.slowFactor && (
                  <div className="text-xs font-mono mt-1" style={{ color: '#66ccff' }}>
                    Slow: {Math.round((1 - selectedChar.slowFactor) * 100)}% for {selectedChar.slowDuration}s
                  </div>
                )}
                {selectedChar.chainCount && (
                  <div className="text-xs font-mono mt-1" style={{ color: '#ffaa44' }}>
                    Chains: {selectedChar.chainCount} targets
                  </div>
                )}
              </div>

              {/* Pair synergies */}
              {charPairSynergies.length > 0 && (
                <div>
                  <h4 className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-2">Pair Synergies</h4>
                  <div className="space-y-2">
                    {charPairSynergies.map(syn => {
                      const partnerId = syn.char1Id === selectedChar.id ? syn.char2Id : syn.char1Id;
                      const partner = ALL_CHARACTERS.find(c => c.id === partnerId);
                      const partnerOwned = ownedIds.has(partnerId);
                      return (
                        <button
                          key={syn.id}
                          onClick={() => setSelectedCharId(partnerId)}
                          className="w-full flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                        >
                          {partner && (
                            <CharacterSprite config={partner} size={28} owned={partnerOwned} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground text-xs font-mono font-bold">{syn.name}</div>
                            <div className="text-muted-foreground text-[10px] font-mono">
                              + {partnerOwned && partner ? partner.name : '???'}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold shrink-0" style={{ color: '#4ade80' }}>{syn.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : tab === 'bestiary' ? (
        /* Bestiary tab */
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-foreground font-bold text-lg font-mono mb-4 flex items-center gap-2">
            🐉 Bestiaire de la Faille
            <span className="text-muted-foreground text-xs font-normal">Les monstres que vous affronterez</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(BESTIARY_INFO).map(([key, info]) => {
              const config = ENEMY_CONFIGS[key as EnemyType];
              return (
                <div
                  key={key}
                  className="rounded-xl border-2 p-4 bg-card/50"
                  style={{ borderColor: config.strokeColor + '66' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h4 className="text-foreground font-bold font-mono text-sm">{info.name}</h4>
                      <span className="text-muted-foreground text-[10px] font-mono">{info.wave}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs font-mono mb-3">{info.desc}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="flex justify-between bg-muted/30 rounded px-2 py-1">
                      <span className="text-muted-foreground">HP</span>
                      <span className="text-foreground font-bold">{config.hp}</span>
                    </div>
                    <div className="flex justify-between bg-muted/30 rounded px-2 py-1">
                      <span className="text-muted-foreground">Speed</span>
                      <span className="text-foreground font-bold">{config.speed}</span>
                    </div>
                    <div className="flex justify-between bg-muted/30 rounded px-2 py-1">
                      <span className="text-muted-foreground">Armor</span>
                      <span className="text-foreground font-bold">{config.armor || 0}</span>
                    </div>
                    <div className="flex justify-between bg-muted/30 rounded px-2 py-1">
                      <span className="text-muted-foreground">Reward</span>
                      <span className="text-foreground font-bold" style={{ color: '#FFD700' }}>{config.reward}g</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Synergies tab */
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pair Synergies */}
          <div>
            <h3 className="text-foreground font-bold text-lg font-mono mb-3 flex items-center gap-2">
              🤝 Pair Synergies
              <span className="text-muted-foreground text-xs font-normal">Deploy both characters to activate</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {PAIR_SYNERGIES.map(syn => {
                const char1 = ALL_CHARACTERS.find(c => c.id === syn.char1Id);
                const char2 = ALL_CHARACTERS.find(c => c.id === syn.char2Id);
                const owned1 = ownedIds.has(syn.char1Id);
                const owned2 = ownedIds.has(syn.char2Id);
                const bothOwned = owned1 && owned2;

                return (
                  <div
                    key={syn.id}
                    className={`relative rounded-xl border-2 p-4 transition-all ${
                      bothOwned
                        ? 'border-green-500/40 bg-green-500/5'
                        : 'border-border bg-card/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground font-bold font-mono text-sm">{syn.name}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: '#4ade80' }}>{syn.description}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <CharMiniCard char={char1!} owned={owned1} />
                      <span className="text-muted-foreground text-lg">+</span>
                      <CharMiniCard char={char2!} owned={owned2} />
                    </div>
                    {bothOwned && (
                      <div className="absolute top-2 right-2 text-xs font-mono font-bold" style={{ color: '#4ade80' }}>✓ Ready</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Element Synergies */}
          <div>
            <h3 className="text-foreground font-bold text-lg font-mono mb-3 flex items-center gap-2">
              🔮 Element Synergies
              <span className="text-muted-foreground text-xs font-normal">Stack units of the same element</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ELEMENT_SYNERGIES.map(elSyn => {
                const elChars = ALL_CHARACTERS.filter(c => CHARACTER_ELEMENTS[c.id] === elSyn.element);
                const ownedCount = elChars.filter(c => ownedIds.has(c.id)).length;

                return (
                  <div
                    key={elSyn.element}
                    className="rounded-xl border-2 p-4"
                    style={{
                      borderColor: `${ELEMENT_COLORS[elSyn.element]}44`,
                      backgroundColor: `${ELEMENT_COLORS[elSyn.element]}08`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="font-bold font-mono text-base"
                        style={{ color: ELEMENT_COLORS[elSyn.element] }}
                      >
                        {ELEMENT_LABELS[elSyn.element]}
                      </span>
                      <span className="text-muted-foreground text-xs font-mono">
                        {ownedCount}/{elChars.length} owned
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {elSyn.thresholds.map(t => {
                        const active = ownedCount >= t.count;
                        return (
                          <div
                            key={t.count}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${
                              active ? 'bg-green-500/10' : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: t.count }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                      backgroundColor: i < ownedCount
                                        ? ELEMENT_COLORS[elSyn.element]
                                        : '#333',
                                    }}
                                  />
                                ))}
                              </div>
                              <span className="text-foreground text-xs font-mono font-bold">{t.name}</span>
                            </div>
                            <span
                              className="text-xs font-mono font-bold"
                              style={{ color: active ? '#4ade80' : '#666' }}
                            >
                              {t.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Element characters with sprites */}
                    <div className="flex flex-wrap gap-2">
                      {elChars.map(c => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono ${
                            ownedIds.has(c.id) ? 'bg-muted/50' : 'bg-muted/20 opacity-50'
                          }`}
                          style={{ borderLeft: `2px solid ${RARITY_COLORS[c.rarity]}` }}
                        >
                          <CharacterSprite config={c} size={18} owned={ownedIds.has(c.id)} />
                          <span className="text-foreground">{ownedIds.has(c.id) ? c.name : '???'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const ratio = Math.min(1, value / max);
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-bold">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${ratio * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function CharMiniCard({ char, owned }: { char: import('../../game/types').CharacterConfig; owned: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <CharacterSprite config={char} size={44} owned={owned} />
      <span className="text-foreground text-[10px] font-mono font-bold text-center">
        {owned ? char.name : '???'}
      </span>
      <span className="text-[9px] font-mono" style={{ color: RARITY_COLORS[char.rarity] }}>
        {RARITY_LABELS[char.rarity]}
      </span>
    </div>
  );
}

export default WikiScreen;
