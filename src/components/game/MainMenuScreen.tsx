import React, { useEffect, useState } from 'react';
import menuBg from '@/assets/ui/main-menu-bg.jpg';

interface MainMenuScreenProps {
  onStart: () => void;
  onOpenMaps: () => void;
  onOpenTalents: () => void;
  onOpenSkins: () => void;
  onOpenOptions: () => void;
  onOpenCredits: () => void;
}

const MenuButton: React.FC<{ label: string; onClick: () => void; icon?: string; full?: boolean; primary?: boolean }> = ({ label, onClick, icon, full, primary }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden rounded-md border font-semibold transition-all ${
      primary
        ? 'w-full py-3 text-black border-yellow-100 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 shadow-[0_0_24px_rgba(250,204,21,0.35)] hover:brightness-110'
        : `${full ? 'w-full' : 'w-full'} py-2.5 text-blue-100 border-blue-300/35 bg-[#0a1a3a]/65 hover:bg-[#102652]/80`
    }`}
  >
    {!primary && <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent,rgba(125,211,252,0.12),transparent)]" />}
    <span className="relative z-10 text-sm tracking-wide">{icon ? `${icon} ${label}` : label}</span>
  </button>
);

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStart,
  onOpenMaps,
  onOpenTalents,
  onOpenSkins,
  onOpenOptions,
  onOpenCredits,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${menuBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050913]/55 via-[#050913]/35 to-[#050913]/60" />

      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="text-[10px] tracking-[0.35em] text-yellow-200/80 mb-2">TOWER DEFENSE MIDAS</div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(255,214,120,0.45)]">
            TOWER OF LEGEND
          </h1>
          <p className="text-xs text-blue-100/75 mt-1 mb-5">Menu principal • édition officielle</p>

          <div className={`rounded-xl border border-blue-200/20 bg-[#08122a]/55 backdrop-blur-sm p-3 space-y-2 ${pulse ? 'shadow-[0_0_24px_rgba(59,130,246,0.2)]' : ''}`}>
            <MenuButton label="START" onClick={onStart} icon="▶" primary />

            <div className="grid grid-cols-2 gap-2">
              <MenuButton label="Cartes" onClick={onOpenMaps} icon="🗺️" />
              <MenuButton label="Talents" onClick={onOpenTalents} icon="🌳" />
              <MenuButton label="Skins" onClick={onOpenSkins} icon="🎨" />
              <MenuButton label="Options" onClick={onOpenOptions} icon="⚙️" />
            </div>

            <MenuButton label="Crédits" onClick={onOpenCredits} icon="📜" full />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
