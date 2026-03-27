import React, { useMemo } from 'react';
import { OwnedCharacter } from '../../game/types';
import CharacterSprite from './CharacterSprite';

interface StarterSummonOverlayProps {
  starters: OwnedCharacter[];
  onChoose: (instanceId: number) => void;
}

const AURAS = [
  'from-cyan-500/40 via-blue-500/20 to-transparent',
  'from-fuchsia-500/40 via-purple-500/20 to-transparent',
  'from-amber-400/40 via-orange-500/20 to-transparent',
];

const StarterSummonOverlay: React.FC<StarterSummonOverlayProps> = ({ starters, onChoose }) => {
  const visibleStarters = useMemo(() => starters.slice(0, 3), [starters]);
  if (visibleStarters.length === 0) return null;

  return (
    <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[720px] rounded-[28px] border border-white/12 bg-[#050913]/62 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-5 md:p-7">
        <div className="text-center mb-5">
          <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70 mb-2">Premier appel</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Choisis ton premier champion</h2>
          <p className="text-sm text-slate-300/80 mt-2 max-w-[560px] mx-auto">
            Trois ombres te répondent. Choisis celle qui lance le mieux ton aventure, puis place-la pour démarrer la run.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleStarters.map((starter, index) => (
            <button
              key={starter.instanceId}
              onClick={() => onChoose(starter.instanceId)}
              className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-black/30 px-4 py-5 text-left transition-all hover:-translate-y-1 hover:border-cyan-300/50 hover:shadow-[0_15px_40px_rgba(34,211,238,0.18)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${AURAS[index % AURAS.length]} opacity-80`} />
              <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full border border-white/15 bg-black/35 shadow-inner">
                  <div className="absolute inset-3 rounded-full bg-black/50 blur-md" />
                  <div className="absolute inset-5 rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-black/10" />
                  <div className="relative scale-[1.45] drop-shadow-[0_0_18px_rgba(255,255,255,0.18)] opacity-95">
                    <CharacterSprite config={starter.config} size={48} owned />
                  </div>
                </div>

                <div>
                  <div className="text-lg font-extrabold text-white">{starter.config.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300/70 mt-1">Ombre éveillée</div>
                </div>

                <div className="text-xs text-slate-200/85 min-h-[40px]">
                  {starter.config.attackPattern === 'single' && 'Stable, frontal, parfait pour poser des bases solides.'}
                  {starter.config.attackPattern === 'rapid' && 'Nerveux et agressif. Il donne du rythme dès la première vague.'}
                  {starter.config.attackPattern === 'mushroom' && 'Vicieux, malin, excellent pour poser une identité forte dès le départ.'}
                  {starter.config.attackPattern === 'slow' && 'Contrôle la map, calme la wave, te laisse respirer.'}
                </div>

                <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 group-hover:bg-cyan-400/20">
                  ✨ Invoquer cette ombre
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarterSummonOverlay;
