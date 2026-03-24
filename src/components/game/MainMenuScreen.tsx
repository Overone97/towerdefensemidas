import React, { useEffect, useState } from 'react';

interface MainMenuScreenProps {
  onStart: () => void;
  onOpenMaps: () => void;
  onOpenTalents: () => void;
  onOpenSkins: () => void;
  onOpenOptions: () => void;
  onOpenCredits: () => void;
}

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
    const t = setInterval(() => setPulse(p => !p), 1300);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-[#050913] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,125,255,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,215,120,0.14),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(120,66,255,0.16),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 [background:linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] animate-pulse" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.35em] text-yellow-300/80 mb-2">TOWER DEFENSE MIDAS</div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(255,214,120,0.35)]">
            LEGACY OF NEXUS
          </h1>
          <p className="text-sm text-blue-100/70 mt-3">Menu principal • édition officielle</p>
        </div>

        <div className="w-full max-w-md space-y-2">
          <button
            onClick={onStart}
            className={`w-full py-3 rounded-lg border font-bold text-lg transition-all ${
              pulse
                ? 'bg-gradient-to-r from-amber-500 to-yellow-300 text-black border-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.45)]'
                : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black border-yellow-100'
            }`}
          >
            ▶ START
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={onOpenMaps} className="py-2.5 rounded-lg border border-blue-300/30 bg-blue-500/10 hover:bg-blue-500/20">🗺️ Cartes</button>
            <button onClick={onOpenTalents} className="py-2.5 rounded-lg border border-purple-300/30 bg-purple-500/10 hover:bg-purple-500/20">🌳 Talents</button>
            <button onClick={onOpenSkins} className="py-2.5 rounded-lg border border-pink-300/30 bg-pink-500/10 hover:bg-pink-500/20">🎨 Skins</button>
            <button onClick={onOpenOptions} className="py-2.5 rounded-lg border border-slate-300/30 bg-slate-500/10 hover:bg-slate-500/20">⚙️ Options</button>
          </div>

          <button onClick={onOpenCredits} className="w-full py-2 rounded-lg border border-amber-200/30 bg-amber-500/10 hover:bg-amber-500/20">📜 Crédits</button>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
