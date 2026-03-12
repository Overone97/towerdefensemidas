import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine, fishState } from '../../game/GameEngine';
import { renderGame } from './GameRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import DamageStatsPanel from './DamageStatsPanel';
import EnemyInfoPanel from './EnemyInfoPanel';
import { Enemy } from '../../game/types';

interface GameCanvasProps {
  engine: GameEngine;
  onStateChange: () => void;
  onFishCaught?: () => void;
  onDropUnit?: (instanceId: number, slotIndex: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onStateChange, onFishCaught, onDropUnit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);

  const dragRef = useRef<{ unitId: number; startX: number; startY: number; curX: number; curY: number } | null>(null);

  // Fill entire viewport
  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / CANVAS_WIDTH, vh / CANVAS_HEIGHT) * 0.88;
      setScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const canvasToGame = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const findNearestEmptySlot = useCallback((x: number, y: number) => {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < engine.state.slots.length; i++) {
      const slot = engine.state.slots[i];
      if (slot.unitId !== null) continue;
      const dx = x - slot.x;
      const dy = y - slot.y;
      const d = dx * dx + dy * dy;
      if (d < bestDist && d < 40 * 40) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }, [engine]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasToGame(e);
    for (const unit of engine.state.placedUnits) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        dragRef.current = { unitId: unit.id, startX: unit.x, startY: unit.y, curX: x, curY: y };
        return;
      }
    }
  }, [engine, canvasToGame]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const { x, y } = canvasToGame(e);
    dragRef.current.curX = x;
    dragRef.current.curY = y;
  }, [canvasToGame]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current) {
      const { x, y } = canvasToGame(e);
      const slotIdx = findNearestEmptySlot(x, y);
      if (slotIdx >= 0) {
        engine.moveUnit(dragRef.current.unitId, slotIdx);
      } else if (y > CANVAS_HEIGHT - 50 || x < 10 || x > CANVAS_WIDTH - 10) {
        engine.removeUnit(dragRef.current.unitId);
      }
      dragRef.current = null;
      onStateChange();
      return;
    }
  }, [engine, canvasToGame, findNearestEmptySlot, onStateChange]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current) return;
    const { x, y } = canvasToGame(e);

    if (fishState.visible && !fishState.caught) {
      const fdx = x - fishState.x;
      const fdy = y - fishState.y;
      if (fdx * fdx + fdy * fdy < 900) {
        const caught = engine.tryCatchFish();
        if (caught) {
          onFishCaught?.();
          onStateChange();
          return;
        }
      }
    }

    for (const enemy of engine.state.enemies) {
      if (!enemy.alive) continue;
      const dx = x - enemy.x;
      const dy = y - enemy.y;
      if (dx * dx + dy * dy < (enemy.size + 8) * (enemy.size + 8)) {
        setSelectedEnemy(enemy);
        engine.state.selectedSlotIndex = null;
        engine.state.selectedUnitId = null;
        onStateChange();
        return;
      }
    }

    for (const unit of engine.state.placedUnits) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        engine.selectPlacedUnit(unit.id);
        setSelectedEnemy(null);
        onStateChange();
        return;
      }
    }

    for (let i = 0; i < engine.state.slots.length; i++) {
      const slot = engine.state.slots[i];
      if (slot.unitId !== null) continue;
      const dx = x - slot.x;
      const dy = y - slot.y;
      if (dx * dx + dy * dy < 400) {
        engine.selectSlot(i);
        setSelectedEnemy(null);
        onStateChange();
        return;
      }
    }

    engine.state.selectedSlotIndex = null;
    engine.state.selectedUnitId = null;
    setSelectedEnemy(null);
    onStateChange();
  }, [engine, onStateChange, onFishCaught, canvasToGame]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const instanceId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(instanceId)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const slotIdx = findNearestEmptySlot(x, y);
    if (slotIdx >= 0) {
      engine.placeUnit(slotIdx, instanceId);
      onStateChange();
    }
  }, [engine, findNearestEmptySlot, onStateChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;
      const dt = rawDt * (engine.state.gameSpeed || 1);

      engine.update(dt);

      const shake = engine.screenShake;
      ctx.save();
      ctx.translate(shake.offsetX, shake.offsetY);

      renderGame(ctx, engine.state, engine.getWaypoints(), timestamp, engine.getEquippedSkins());
      engine.particleManager.render(ctx);
      engine.floatingTextManager.render(ctx);

      if (dragRef.current) {
        const unit = engine.state.placedUnits.find(u => u.id === dragRef.current!.unitId);
        if (unit) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = unit.config.weaponColor;
          ctx.beginPath();
          ctx.arc(dragRef.current.curX, dragRef.current.curY, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(unit.config.name, dragRef.current.curX, dragRef.current.curY - 20);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();

      if (selectedEnemy) {
        const liveEnemy = engine.state.enemies.find(e => e.id === selectedEnemy.id);
        if (liveEnemy && liveEnemy.alive) {
          setSelectedEnemy({ ...liveEnemy });
        } else {
          setSelectedEnemy(null);
        }
      }

      onStateChange();
      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [engine, onStateChange]);

  const toggleSpeed = useCallback(() => {
    const speeds = [1, 2, 3, 4];
    const currentIdx = speeds.indexOf(engine.state.gameSpeed || 1);
    const next = speeds[(currentIdx + 1) % speeds.length];
    engine.setGameSpeed(next);
    onStateChange();
  }, [engine, onStateChange]);

  return (
    <div ref={wrapperRef} className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="cursor-pointer"
        style={{ imageRendering: 'pixelated', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      />
      {/* Speed toggle floats on canvas */}
      <div className="absolute top-2 right-2 flex gap-1" style={{ transform: `scale(${1/scale})`, transformOrigin: 'top right' }}>
        <button
          onClick={toggleSpeed}
          className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-colors ${
            (engine.state.gameSpeed || 1) > 1
              ? 'bg-yellow-500 text-black'
              : 'bg-muted/80 text-muted-foreground hover:bg-accent'
          }`}
          title={`Vitesse x${engine.state.gameSpeed || 1}`}
        >
          {(engine.state.gameSpeed || 1) === 1 ? '▶ x1' : `⏩ x${engine.state.gameSpeed}`}
        </button>
      </div>
      <DamageStatsPanel engine={engine} />
      {selectedEnemy && (
        <EnemyInfoPanel enemy={selectedEnemy} onClose={() => setSelectedEnemy(null)} />
      )}
    </div>
  );
};

export default GameCanvas;
