import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { renderGame } from './GameRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';

interface GameCanvasProps {
  engine: GameEngine;
  onStateChange: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on a placed unit
    for (const unit of engine.state.placedUnits) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        engine.selectPlacedUnit(unit.id);
        onStateChange();
        return;
      }
    }

    // Check if clicked on a slot
    for (let i = 0; i < engine.state.slots.length; i++) {
      const slot = engine.state.slots[i];
      if (slot.unitId !== null) continue;
      const dx = x - slot.x;
      const dy = y - slot.y;
      if (dx * dx + dy * dy < 400) {
        engine.selectSlot(i);
        onStateChange();
        return;
      }
    }

    // Deselect
    engine.state.selectedSlotIndex = null;
    engine.state.selectedUnitId = null;
    onStateChange();
  }, [engine, onStateChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      engine.update(dt);
      renderGame(ctx, engine.state);
      onStateChange();

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [engine, onStateChange]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={handleClick}
      className="w-full max-w-[800px] border border-border rounded-lg cursor-pointer"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default GameCanvas;
