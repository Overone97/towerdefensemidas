import React, { useState } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: '🎮 Bienvenue dans le Tower Defense!',
    description: 'Protégez votre base contre les vagues d\'ennemis en déployant des champions stratégiquement.',
    tip: 'Suivez ce guide pour apprendre les bases du jeu.',
  },
  {
    title: '🥚 Invoquer des Champions',
    description: 'Clique sur l\'onglet "Progression" en bas pour débloquer ton prochain champion avec des éclats.',
    tip: 'Les champions ont différentes raretés : Common, Uncommon, Rare, Epic, Legendary.',
  },
  {
    title: '📍 Placer vos Champions',
    description: 'En mode "Deploy", cliquez sur un emplacement vide sur la carte, puis sélectionnez un champion dans la barre du bas.',
    tip: 'Positionnez les champions à portée du chemin des ennemis pour maximiser les dégâts.',
  },
  {
    title: '⬆ Fusionner (Merge)',
    description: 'Obtenez 3 copies du même champion pour les fusionner ! 1★ → 2★ → 3★ avec des stats multipliées.',
    tip: 'Les champions 3★ sont 2.5× plus puissants que les 1★ !',
  },
  {
    title: '🔗 Synergies',
    description: 'Déployez des champions complémentaires pour activer des synergies (bonus d\'équipe). Regardez le panneau à droite.',
    tip: 'Les synergies donnent des bonus d\'attaque, de vitesse ou de portée.',
  },
  {
    title: '⚔️ C\'est parti !',
    description: 'Cliquez sur "Start Game" pour lancer la première vague. Bonne chance, invocateur !',
    tip: '💡 N\'oubliez pas de visiter les Talents (🌟) et l\'Équipement (🎒) pour devenir plus fort.',
  },
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-fade-in">
        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-primary scale-125' : i < step ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3">{currentStep.title}</h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentStep.description}</p>
        
        <div className="bg-muted/50 rounded-lg px-4 py-2 mb-6">
          <p className="text-xs text-primary font-mono">{currentStep.tip}</p>
        </div>

        <div className="flex justify-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(s => s + 1);
              }
            }}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLast ? '🎮 Jouer !' : 'Suivant →'}
          </button>
          {!isLast && (
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Passer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
