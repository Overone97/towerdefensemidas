import React, { useEffect, useMemo, useState } from 'react';
import menuBg from '@/assets/ui/main-menu-bg.jpg';

interface MainMenuScreenProps {
  onStart: () => void;
  onOpenMaps: () => void;
  onOpenTalents: () => void;
  onOpenMastery: () => void;
  onOpenSkins: () => void;
  onOpenOptions: () => void;
  onOpenCredits: () => void;
}

type MenuAction = 'start' | 'maps' | 'talents' | 'mastery' | 'skins' | 'options' | 'credits';

const actionDescription: Record<MenuAction, string> = {
  start: 'Lance directement ta session de défense.',
  maps: 'Choisis ton champ de bataille et ton niveau de risque.',
  talents: 'Ajuste ton build et tes améliorations.',
  mastery: 'Fais XP tes champions et débloque leur famille.',
  skins: 'Personnalise tes champions avec tes skins exclusifs.',
  options: 'Règle audio, interface et confort de jeu.',
  credits: 'Voir les créateurs et contributeurs du projet.',
};

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStart,
  onOpenMaps,
  onOpenTalents,
  onOpenMastery,
  onOpenSkins,
  onOpenOptions,
  onOpenCredits,
}) => {
  const [pulse, setPulse] = useState(false);
  const [active, setActive] = useState<MenuAction>('start');

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1100);
    return () => clearInterval(t);
  }, []);

  const particles = useMemo(
    () => Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${(i * 31) % 100}%`,
      top: `${(i * 17) % 100}%`,
      size: 2 + (i % 3),
      delay: `${(i % 6) * 0.4}s`,
      duration: `${4 + (i % 5)}s`,
    })),
    []
  );

  const Btn = ({ action, label, icon, onClick, primary = false }: { action: MenuAction; label: string; icon: string; onClick: () => void; primary?: boolean }) => (
    <button
      onClick={onClick}
      onMouseEnter={() => setActive(action)}
      className={`relative overflow-hidden rounded-md border font-semibold transition-all ${
        primary
          ? `w-full py-3 text-black border-yellow-100 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 ${
              pulse ? 'shadow-[0_0_30px_rgba(250,204,21,0.45)]' : 'shadow-[0_0_16px_rgba(250,204,21,0.2)]'
            } hover:brightness-110`
          : 'w-full py-2.5 text-blue-100 border-blue-300/35 bg-[#0a1a3a]/65 hover:bg-[#102652]/80 hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]'
      }`}
    >
      {!primary && <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent,rgba(125,211,252,0.15),transparent)]" />}
      <span className="relative z-10 text-sm tracking-wide">{icon} {label}</span>
    </button>
  );

  return (
    <div className="relative h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${menuBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050913]/55 via-[#050913]/35 to-[#050913]/60" />

      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <span key={p.id} className="absolute rounded-full bg-cyan-200/40 animate-pulse" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }} />
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="w-full max-w-[470px] text-center">
          <div className="text-[10px] tracking-[0.35em] text-yellow-200/80 mb-2">TOWER DEFENSE MIDAS</div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(255,214,120,0.45)]">
            TOWER OF LEGEND
          </h1>
          <p className="text-xs text-blue-100/75 mt-1">Menu principal • édition officielle</p>
          <div className="mt-2 text-[11px] text-cyan-100/80 min-h-5">{actionDescription[active]}</div>

          <div className={`mt-4 rounded-xl border border-blue-200/20 bg-[#08122a]/58 backdrop-blur-sm p-3 space-y-2 ${pulse ? 'shadow-[0_0_24px_rgba(59,130,246,0.2)]' : ''}`}>
            <Btn action="start" label="START" icon="▶" onClick={onStart} primary />

            <div className="grid grid-cols-2 gap-2">
              <Btn action="maps" label="Cartes" icon="🗺️" onClick={onOpenMaps} />
              <Btn action="talents" label="Talents" icon="🌳" onClick={onOpenTalents} />
              <Btn action="mastery" label="Maîtrise" icon="🧬" onClick={onOpenMastery} />
              <Btn action="skins" label="Skins" icon="🎨" onClick={onOpenSkins} />
              <Btn action="options" label="Options" icon="⚙️" onClick={onOpenOptions} />
              <Btn action="credits" label="Crédits" icon="📜" onClick={onOpenCredits} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
