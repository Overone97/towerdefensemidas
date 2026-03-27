export interface BestiaryEntry {
  name: string;
  desc: string;
  icon: string;
  wave?: string;
  [key: string]: unknown;
}

export const BESTIARY_INFO: Record<string, BestiaryEntry> = {
  normal: { name: 'Melee Minion', desc: 'Sbire de base de la Faille. Petit, nombreux, mais inoffensif seul.', icon: '⚔️', wave: 'Vague 1+' },
  fast: { name: 'Scuttle Crab', desc: 'Crabe rapide de la rivière. Fragile mais difficile à toucher grâce à sa vitesse.', icon: '🦀', wave: 'Vague 5+' },
  tank: { name: 'Red Brambleback', desc: 'Le Brambleback rouge. Massif, lent, recouvert de braises ardentes.', icon: '🔥', wave: 'Vague 11+' },
  armored: { name: 'Super Minion', desc: "Sbire d'élite blindé. Armure dorée, résistant au poison et au ralentissement.", icon: '🛡️', wave: 'Vague 14+' },
  dragon_fire: { name: 'Dragon Infernal', desc: 'Dragon élémentaire de feu. Ailes déployées, souffle dévastateur.', icon: '🐉', wave: 'Boss Vague 10' },
  dragon_ice: { name: 'Dragon de Glace', desc: 'Dragon élémentaire de glace. Aura glacée qui ralentit tout autour.', icon: '❄️', wave: 'Boss Vague 20' },
  dragon_earth: { name: 'Dragon de Terre', desc: 'Dragon élémentaire de terre. Écailles rocheuses, armure massive.', icon: '🪨', wave: 'Boss Vague 30' },
  dragon_air: { name: 'Dragon des Airs', desc: "Dragon élémentaire d'air. Ultra rapide, semi-transparent.", icon: '🌪️', wave: 'Boss Vague 40' },
  boss: { name: 'Baron Nashor / Atakhan', desc: 'Le seigneur de la Faille. Tentacules, œil central, aura magique dévastatrice. Atakhan apparaît à la vague 50.', icon: '👁️', wave: 'Boss Vague 50' },
};
