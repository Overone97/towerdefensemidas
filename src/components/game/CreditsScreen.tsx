import React from 'react';
import { Button } from '../ui/button';

interface CreditsScreenProps {
  onBack: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  return (
    <div className="h-screen bg-[#070b13] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📜 Crédits</h2>
          <Button variant="outline" onClick={onBack}>Retour</Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div>
            <div className="text-sm uppercase text-yellow-300/80 tracking-wider">Game Director</div>
            <div className="text-lg font-bold">Alan Germain</div>
          </div>
          <div>
            <div className="text-sm uppercase text-cyan-300/80 tracking-wider">Assistant Dev</div>
            <div className="text-lg font-bold">OpenClaw</div>
          </div>
          <div>
            <div className="text-sm uppercase text-purple-300/80 tracking-wider">Tech</div>
            <div className="text-sm text-slate-300">React • TypeScript • Vite • Cloudflare Workers</div>
          </div>
          <div className="text-xs text-slate-400 pt-2 border-t border-white/10">
            Merci de jouer à Tower Defense Midas 💛
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsScreen;
