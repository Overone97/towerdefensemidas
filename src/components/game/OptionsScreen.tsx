import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

interface OptionsScreenProps {
  onBack: () => void;
}

const OptionsScreen: React.FC<OptionsScreenProps> = ({ onBack }) => {
  const [music, setMusic] = useState(70);
  const [sfx, setSfx] = useState(80);
  const [screenShake, setScreenShake] = useState(true);

  useEffect(() => {
    const m = Number(localStorage.getItem('td_music') || 70);
    const s = Number(localStorage.getItem('td_sfx') || 80);
    const sh = localStorage.getItem('td_screenshake') !== '0';
    setMusic(m);
    setSfx(s);
    setScreenShake(sh);
  }, []);

  const persist = (k: string, v: string) => localStorage.setItem(k, v);

  return (
    <div className="h-screen bg-[#080d18] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">⚙️ Options</h2>
          <Button variant="outline" onClick={onBack}>Retour</Button>
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="block">
            <div className="text-sm mb-1">Musique: {music}%</div>
            <input type="range" min={0} max={100} value={music} onChange={e => { const v = Number(e.target.value); setMusic(v); persist('td_music', String(v)); }} className="w-full" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Effets sonores: {sfx}%</div>
            <input type="range" min={0} max={100} value={sfx} onChange={e => { const v = Number(e.target.value); setSfx(v); persist('td_sfx', String(v)); }} className="w-full" />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={screenShake} onChange={e => { setScreenShake(e.target.checked); persist('td_screenshake', e.target.checked ? '1' : '0'); }} />
            Secousses d'écran
          </label>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreen;
