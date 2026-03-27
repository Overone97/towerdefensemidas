import React, { useMemo, useState } from 'react';
import menuBg from '@/assets/ui/main-menu-bg.jpg';

interface MainMenuScreenProps {
  onStart: () => void;
  onOpenMaps: () => void;
  onOpenTalents: () => void;
  onOpenSkins: () => void;
  onOpenOptions: () => void;
  onOpenCredits: () => void;
}

type MenuAction = 'start' | 'maps' | 'talents' | 'skins' | 'options' | 'credits';

const actionDescription: Record<MenuAction, string> = {
  start: 'Lance directement ta session de défense.',
  maps: 'Choisis ton champ de bataille et ton niveau de risque.',
  talents: 'Ajuste ton build et débloque des bonus persistants.',
  skins: 'Personnalise tes champions avec tes skins exclusifs.',
  options: 'Règle audio, interface et confort de jeu.',
  credits: 'Voir les créateurs et contributeurs du projet.',
};

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStart,
  onOpenMaps,
  onOpenTalents,
  onOpenSkins,
  onOpenOptions,
  onOpenCredits,
}) => {
  const [active, setActive] = useState<MenuAction>('start');

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 19) % 100}%`,
        size: 2 + (i % 4),
        delay: `${(i % 7) * 0.4}s`,
        duration: `${4 + (i % 5)}s`,
      })),
    []
  );

  const Button = ({ action, label, icon, onClick, primary = false }: { action: MenuAction; label: string; icon: string; onClick: () => void; primary?: boolean }) => (
    <button
      onClick={onClick}
      onMouseEnter={() => setActive(action)}
      className={`relative overflow-hidden rounded-md border font-semibold transition-all ${
        primary
          ? 'w-full py-3 text-black border-yellow-100 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 td-pulse-glow hover:brightness-110'
          : 'w-full py-2.5 text-blue-100 border-blue-300/35 bg-[#0a1a3a]/65 hover:bg-[#102652]/80 hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]'
      }`}
    >
      {!primary && <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent,rgba(125,211,252,0.15),transparent)]" />}
      <span className="relative z-10 text-sm tracking-wide">{icon} {label}</span>
    </button>
  );

  return (
    <>
      <style>{`
        @keyframes td-pulse-glow {
          0%, 100% { box-shadow: 0 0 16px rgba(250,204,21,0.2); }
          50% { box-shadow: 0 0 30px rgba(250,204,21,0.45); }
        }
        .td-pulse-glow { animation: td-pulse-glow 2.2s ease-in-out infinite; }
      `}</style>
      <div className="relative h-screen overflow-hidden text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${menuBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050913]/55 via-[#050913]/35 to-[#050913]/60" />

        {/* ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute rounded-full bg-cyan-200/40 animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
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

            <div className="mt-4 rounded-xl border border-blue-200/20 bg-[#08122a]/58 backdrop-blur-sm p-3 space-y-2">
              <Button action="start" label="START" icon="▶" onClick={onStart} primary />

              <div className="grid grid-cols-2 gap-2">
                <Button action="maps" label="Cartes" icon="🗺️" onClick={onOpenMaps} />
                <Button action="talents" label="Talents" icon="🌳" onClick={onOpenTalents} />
                <Button action="skins" label="Skins" icon="🎨" onClick={onOpenSkins} />
                <Button action="options" label="Options" icon="⚙️" onClick={onOpenOptions} />
              </div>

              <Button action="credits" label="Crédits" icon="📜" onClick={onOpenCredits} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainMenuScreen;
