import TowerDefenseGame from '../components/game/TowerDefenseGame';
import GameErrorBoundary from '../components/game/GameErrorBoundary';

const Index = () => {
  return (
    <div className="dark min-h-screen bg-background">
      <GameErrorBoundary>
        <TowerDefenseGame />
      </GameErrorBoundary>
    </div>
  );
};

export default Index;
