import { GameState, Enemy, PlacedUnit, Projectile, Slot, Point } from '../../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import { getCharacterStats } from '../../game/data/characterData';
import { drawCharacterSprite } from '../../game/rendering/characterSprites';
import { drawEnemySprite } from '../../game/rendering/enemySprites';
import { ALL_MAPS } from '../../game/data/allMaps';
import { fishState } from '../../game/GameEngine';

// Seeded random for consistent decorations per map
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// Cache decorations per map so they don't regenerate each frame
const mapDecorationsCache: Record<string, { trees: {x:number,y:number,type:number,size:number}[], flowers: {x:number,y:number,color:string}[], rocks: {x:number,y:number,size:number}[], bushes: {x:number,y:number,size:number}[] }> = {};

function isNearPath(px: number, py: number, waypoints: Point[], dist: number): boolean {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const ax = waypoints[i].x, ay = waypoints[i].y;
    const bx = waypoints[i+1].x, by = waypoints[i+1].y;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx*dx + dy*dy;
    if (len2 === 0) continue;
    let t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / len2));
    const cx = ax + t*dx, cy = ay + t*dy;
    const d2 = (px-cx)*(px-cx) + (py-cy)*(py-cy);
    if (d2 < dist*dist) return true;
  }
  return false;
}

function isNearSlot(px: number, py: number, slots: Slot[], dist: number): boolean {
  for (const s of slots) {
    if ((px-s.x)*(px-s.x) + (py-s.y)*(py-s.y) < dist*dist) return true;
  }
  return false;
}

function getDecorations(mapId: string, waypoints: Point[], slots: Slot[]) {
  if (mapDecorationsCache[mapId]) return mapDecorationsCache[mapId];
  
  const rand = seededRandom(mapId.charCodeAt(0) * 1000 + mapId.charCodeAt(1||0) * 100);
  const trees: {x:number,y:number,type:number,size:number}[] = [];
  const flowers: {x:number,y:number,color:string}[] = [];
  const rocks: {x:number,y:number,size:number}[] = [];
  const bushes: {x:number,y:number,size:number}[] = [];
  
  const flowerColors = ['#ff6688', '#ffaa44', '#ffff66', '#88bbff', '#ff88ff', '#ffffff'];
  
  // Generate trees
  for (let i = 0; i < 25; i++) {
    const x = rand() * CANVAS_WIDTH;
    const y = rand() * CANVAS_HEIGHT;
    if (!isNearPath(x, y, waypoints, 40) && !isNearSlot(x, y, slots, 30)) {
      trees.push({ x, y, type: Math.floor(rand() * 3), size: 12 + rand() * 10 });
    }
  }
  
  // Generate flowers
  for (let i = 0; i < 40; i++) {
    const x = rand() * CANVAS_WIDTH;
    const y = rand() * CANVAS_HEIGHT;
    if (!isNearPath(x, y, waypoints, 25) && !isNearSlot(x, y, slots, 20)) {
      flowers.push({ x, y, color: flowerColors[Math.floor(rand() * flowerColors.length)] });
    }
  }
  
  // Generate rocks
  for (let i = 0; i < 12; i++) {
    const x = rand() * CANVAS_WIDTH;
    const y = rand() * CANVAS_HEIGHT;
    if (!isNearPath(x, y, waypoints, 30) && !isNearSlot(x, y, slots, 25)) {
      rocks.push({ x, y, size: 4 + rand() * 6 });
    }
  }
  
  // Generate bushes
  for (let i = 0; i < 18; i++) {
    const x = rand() * CANVAS_WIDTH;
    const y = rand() * CANVAS_HEIGHT;
    if (!isNearPath(x, y, waypoints, 35) && !isNearSlot(x, y, slots, 25)) {
      bushes.push({ x, y, size: 8 + rand() * 8 });
    }
  }
  
  mapDecorationsCache[mapId] = { trees, flowers, rocks, bushes };
  return mapDecorationsCache[mapId];
}

// ── Theme colors per map ──
function getMapTheme(mapId: string) {
  switch (mapId) {
    case 'forest':
      return {
        grassLight: '#2d5a1e', grassDark: '#1f4a14', grassAccent: '#3a6e28',
        pathMain: '#8b7355', pathBorder: '#6b5340', pathDetail: '#a08868',
        treeLeaf: '#2a6e1a', treeTrunk: '#5a3a1a', treeShadow: '#1a4a0e',
        waterColor: null,
      };
    case 'volcano':
      return {
        grassLight: '#3a2a1a', grassDark: '#2a1a0e', grassAccent: '#4a3020',
        pathMain: '#5a3020', pathBorder: '#3a1a10', pathDetail: '#7a4a30',
        treeLeaf: '#4a2a1a', treeTrunk: '#3a1a0a', treeShadow: '#2a0a0a',
        waterColor: '#ff4400',
      };
    default: // plains
      return {
        grassLight: '#3a8a2a', grassDark: '#2a6a1a', grassAccent: '#4a9a3a',
        pathMain: '#c4a46a', pathBorder: '#8a7040', pathDetail: '#dabb80',
        treeLeaf: '#2a8a1a', treeTrunk: '#6a4a2a', treeShadow: '#1a6a0e',
        waterColor: null,
      };
  }
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, waypoints: Point[], time?: number): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;
  const mapId = state.currentMapId || 'plains';
  const theme = getMapTheme(mapId);
  const t = (time || performance.now()) / 1000;

  // ── Background: tiled grass ──
  drawGrassBackground(ctx, w, h, theme, t);

  // ── Path ──
  drawPath(ctx, waypoints, theme);

  // ── Decorations ──
  const mapDef = ALL_MAPS.find(m => m.id === mapId);
  const decos = getDecorations(mapId, waypoints, mapDef?.slots || state.slots);
  drawDecorations(ctx, decos, theme, mapId, t);

  // ── Slots ──
  drawSlots(ctx, state.slots, state.selectedSlotIndex);

  // ── Pond & fish easter egg ──
  drawPond(ctx, t);

  // ── Game entities ──
  drawEnemies(ctx, state.enemies);
  drawUnits(ctx, state.placedUnits, state.selectedUnitId, state.enemies);
  drawProjectiles(ctx, state.projectiles);
  drawBase(ctx, waypoints);
}

function drawGrassBackground(ctx: CanvasRenderingContext2D, w: number, h: number, theme: ReturnType<typeof getMapTheme>, t: number): void {
  // Base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.grassDark);
  grad.addColorStop(0.5, theme.grassLight);
  grad.addColorStop(1, theme.grassDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const rand = seededRandom(42);

  // Layer 1: Soft rolling hills
  for (let i = 0; i < 18; i++) {
    const hx = rand() * w;
    const hy = rand() * h;
    const rx = 60 + rand() * 100;
    const ry = 20 + rand() * 30;
    ctx.fillStyle = rand() > 0.5 ? theme.grassAccent : theme.grassLight;
    ctx.globalAlpha = 0.12 + rand() * 0.1;
    ctx.beginPath();
    ctx.ellipse(hx, hy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Layer 2: Animated grass blades swaying in the wind
  for (let i = 0; i < 350; i++) {
    const bx = rand() * w;
    const by = rand() * h;
    const bladeH = 3 + rand() * 6;
    const baseLean = (rand() - 0.5) * 3;
    const phase = rand() * Math.PI * 2;
    const speed = 0.8 + rand() * 0.6;
    // Wind sway animation
    const windSway = Math.sin(t * speed + phase + bx * 0.01) * 2.5;
    const lean = baseLean + windSway;

    // Shadow blade
    ctx.strokeStyle = theme.grassDark;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + 1, by + 1);
    ctx.quadraticCurveTo(bx + lean + 1, by - bladeH * 0.5 + 1, bx + lean * 1.5 + 1, by - bladeH + 1);
    ctx.stroke();

    // Main blade
    ctx.strokeStyle = rand() > 0.4 ? theme.grassAccent : theme.grassLight;
    ctx.globalAlpha = 0.5 + rand() * 0.4;
    ctx.lineWidth = 1 + rand() * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + lean, by - bladeH * 0.5, bx + lean * 1.5, by - bladeH);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Layer 3: Animated sparkles (dew glinting)
  for (let i = 0; i < 80; i++) {
    const dx = rand() * w;
    const dy = rand() * h;
    const phase = rand() * Math.PI * 2;
    const sparkle = (Math.sin(t * 1.5 + phase) + 1) * 0.5; // 0-1 pulsing
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.02 + sparkle * 0.08;
    ctx.beginPath();
    ctx.arc(dx, dy, 1 + sparkle * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPath(ctx: CanvasRenderingContext2D, waypoints: Point[], theme: ReturnType<typeof getMapTheme>): void {
  if (waypoints.length < 2) return;

  // Outer border (darker)
  ctx.strokeStyle = theme.pathBorder;
  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
  ctx.stroke();

  // Main path (lighter dirt)
  ctx.strokeStyle = theme.pathMain;
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
  ctx.stroke();

  // Center detail line (lighter)
  ctx.strokeStyle = theme.pathDetail;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Pixel dirt texture on path
  const rand = seededRandom(777);
  for (let i = 0; i < waypoints.length - 1; i++) {
    const ax = waypoints[i].x, ay = waypoints[i].y;
    const bx = waypoints[i+1].x, by = waypoints[i+1].y;
    const len = Math.sqrt((bx-ax)**2 + (by-ay)**2);
    const steps = Math.floor(len / 8);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = ax + (bx-ax)*t + (rand()-0.5)*20;
      const py = ay + (by-ay)*t + (rand()-0.5)*20;
      if (rand() > 0.6) {
        ctx.fillStyle = theme.pathDetail;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(Math.floor(px), Math.floor(py), 2, 2);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawDecorations(ctx: CanvasRenderingContext2D, decos: ReturnType<typeof getDecorations>, theme: ReturnType<typeof getMapTheme>, mapId: string, t: number): void {
  // Rocks (static)
  for (const rock of decos.rocks) {
    ctx.fillStyle = mapId === 'volcano' ? '#4a3020' : '#888888';
    ctx.beginPath();
    ctx.ellipse(rock.x, rock.y, rock.size, rock.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mapId === 'volcano' ? '#5a4030' : '#aaaaaa';
    ctx.beginPath();
    ctx.ellipse(rock.x - 1, rock.y - 1, rock.size * 0.6, rock.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bushes (gentle sway)
  for (const bush of decos.bushes) {
    const s = bush.size;
    const sway = Math.sin(t * 0.8 + bush.x * 0.05) * 1.5;

    ctx.save();
    ctx.translate(bush.x, bush.y + s * 0.3);
    // Skew the bush slightly for wind effect
    ctx.transform(1, 0, sway * 0.02, 1, 0, 0);
    ctx.translate(-bush.x, -(bush.y + s * 0.3));

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(bush.x + 2, bush.y + s * 0.4, s, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bush body
    ctx.fillStyle = theme.treeLeaf;
    ctx.beginPath();
    ctx.arc(bush.x, bush.y, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bush.x - s*0.3, bush.y + 2, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bush.x + s*0.3, bush.y + 2, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = theme.grassAccent;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(bush.x, bush.y - 2, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // Trees (canopy sway with wind)
  for (const tree of decos.trees) {
    const s = tree.size;
    const sway = Math.sin(t * 0.6 + tree.x * 0.03 + tree.y * 0.02) * 2;

    // Shadow (shifts with sway)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(tree.x + 2 + sway * 0.3, tree.y + s * 0.7, s * 0.6, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk (static)
    ctx.fillStyle = theme.treeTrunk;
    ctx.fillRect(tree.x - 3, tree.y - 2, 6, s * 0.5);
    ctx.fillStyle = mapId === 'volcano' ? '#4a2a1a' : '#8a6a3a';
    ctx.fillRect(tree.x - 1, tree.y - 2, 2, s * 0.5);

    // Canopy (animated sway)
    ctx.save();
    ctx.translate(tree.x, tree.y);
    ctx.transform(1, 0, sway * 0.015, 1, 0, 0);
    ctx.translate(-tree.x, -tree.y);

    const leafColor = mapId === 'volcano' ? '#6a2a0a' : theme.treeLeaf;
    const leafHighlight = mapId === 'volcano' ? '#8a3a1a' : theme.grassAccent;

    // Back layer
    ctx.fillStyle = theme.treeShadow;
    ctx.beginPath();
    ctx.arc(tree.x, tree.y - s * 0.3, s * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Main canopy
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.arc(tree.x, tree.y - s * 0.4, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tree.x - s*0.2, tree.y - s * 0.25, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tree.x + s*0.2, tree.y - s * 0.25, s * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Top highlight
    ctx.fillStyle = leafHighlight;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(tree.x - 2, tree.y - s * 0.5, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();

    // Lava glow for volcano trees
    if (mapId === 'volcano') {
      const flicker = 0.12 + Math.sin(t * 3 + tree.x) * 0.05;
      ctx.fillStyle = `rgba(255, 80, 0, ${flicker})`;
      ctx.beginPath();
      ctx.arc(tree.x, tree.y - s * 0.3, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flowers (gentle sway + petal pulse)
  for (const flower of decos.flowers) {
    const fSway = Math.sin(t * 1.2 + flower.x * 0.08) * 1;
    if (mapId === 'volcano') {
      // Animated embers floating up
      const emberY = flower.y - ((t * 15 + flower.x * 3) % 20);
      const emberAlpha = 0.3 + Math.sin(t * 4 + flower.x) * 0.3;
      ctx.fillStyle = '#ff6600';
      ctx.globalAlpha = Math.max(0, emberAlpha);
      ctx.beginPath();
      ctx.arc(flower.x + fSway, emberY, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Stem (bends with wind)
      ctx.strokeStyle = '#2a6a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(flower.x, flower.y + 4);
      ctx.quadraticCurveTo(flower.x + fSway * 0.5, flower.y + 2, flower.x + fSway, flower.y);
      ctx.stroke();
      // Petals
      const petalSize = 1.5 + Math.sin(t * 0.8 + flower.y) * 0.3;
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      ctx.arc(flower.x + fSway, flower.y, petalSize, 0, Math.PI * 2);
      ctx.fill();
      // Center
      ctx.fillStyle = '#ffee44';
      ctx.beginPath();
      ctx.arc(flower.x + fSway, flower.y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSlots(ctx: CanvasRenderingContext2D, slots: Slot[], selectedIndex: number | null): void {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.unitId !== null) continue;
    const isSelected = selectedIndex === i;

    // Platform base (stone circle)
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.ellipse(slot.x, slot.y + 4, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isSelected ? '#7799bb' : '#666666';
    ctx.beginPath();
    ctx.ellipse(slot.x, slot.y + 2, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isSelected ? '#99bbdd' : '#888888';
    ctx.beginPath();
    ctx.ellipse(slot.x, slot.y, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Selection glow
    if (isSelected) {
      ctx.strokeStyle = '#44aaff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(slot.x, slot.y, 20, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(68, 170, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Plus icon
    ctx.strokeStyle = isSelected ? '#aaddff' : '#aaaaaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slot.x - 5, slot.y);
    ctx.lineTo(slot.x + 5, slot.y);
    ctx.moveTo(slot.x, slot.y - 5);
    ctx.lineTo(slot.x, slot.y + 5);
    ctx.stroke();
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const isPoisoned = enemy.statusEffects.some(e => e.type === 'poison');
    const isSlowed = enemy.statusEffects.some(e => e.type === 'slow');
    const isBurning = enemy.statusEffects.some(e => e.type === 'burn');

    if (isPoisoned || isBurning) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 4, 0, Math.PI * 2);
      ctx.fillStyle = isBurning ? 'rgba(255, 100, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
      ctx.fill();
    }

    const bodyColor = isSlowed ? '#4488ff' : enemy.bodyColor;
    drawEnemySprite(ctx, enemy.type, enemy.x, enemy.y, enemy.size, enemy.animFrame, bodyColor, enemy.strokeColor);

    if (enemy.type === 'boss') {
      ctx.fillStyle = '#ff88ff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', enemy.x, enemy.y - enemy.size - 14);
    }

    if (enemy.armor > 0 && enemy.type !== 'boss') {
      ctx.fillStyle = '#cccc88';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🛡', enemy.x + enemy.size + 2, enemy.y - enemy.size + 4);
    }

    const barW = enemy.type === 'boss' ? 36 : 24;
    const barH = enemy.type === 'boss' ? 5 : 4;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - enemy.size - 8;
    const hpRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
  }
}

function drawUnits(ctx: CanvasRenderingContext2D, units: PlacedUnit[], selectedId: number | null, enemies: Enemy[]): void {
  for (const unit of units) {
    const stats = getCharacterStats(unit.config, unit.level);
    const isSelected = selectedId === unit.id;

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, stats.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(68, 136, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (unit.targetId !== null && (unit.config.attackPattern === 'rapid' || unit.config.attackPattern === 'slow') ) {
      const target = enemies.find(e => e.id === unit.targetId && e.alive);
      if (target && unit.isAttacking) {
        ctx.strokeStyle = `${unit.config.weaponColor}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }

    if (unit.targetId !== null && unit.config.attackPattern === 'chain' && unit.isAttacking) {
      const target = enemies.find(e => e.id === unit.targetId && e.alive);
      if (target) {
        ctx.strokeStyle = `${unit.config.weaponColor}88`;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    drawCharacterSprite(ctx, unit.config, unit.x, unit.y, 18, unit.animFrame, unit.isAttacking, unit.attackAnimTimer);

    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(unit.x - 11, unit.y - 11, 22, 22);
    }

    if (unit.level > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${unit.level}`, unit.x, unit.y + 16);
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const proj of projectiles) {
    if (!proj.alive) continue;

    if (proj.pierce) {
      ctx.fillStyle = '#88aaff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(136, 170, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = proj.appliesPoison ? '#44ff44' : '#ffdd44';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = proj.appliesPoison ? 'rgba(68, 255, 68, 0.2)' : 'rgba(255, 221, 68, 0.2)';
      ctx.fill();
    }
  }
}

function drawBase(ctx: CanvasRenderingContext2D, waypoints: Point[]): void {
  const last = waypoints[waypoints.length - 1];

  // Stone platform
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.ellipse(last.x, last.y + 8, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.ellipse(last.x, last.y + 6, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Castle/tower base
  ctx.fillStyle = '#4477aa';
  ctx.fillRect(last.x - 10, last.y - 16, 20, 22);
  // Battlements
  ctx.fillStyle = '#5588bb';
  ctx.fillRect(last.x - 12, last.y - 20, 6, 6);
  ctx.fillRect(last.x - 2, last.y - 22, 4, 8);
  ctx.fillRect(last.x + 6, last.y - 20, 6, 6);
  // Door
  ctx.fillStyle = '#2a4a6a';
  ctx.fillRect(last.x - 4, last.y - 2, 8, 8);
  // Flag
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(last.x, last.y - 22);
  ctx.lineTo(last.x, last.y - 32);
  ctx.stroke();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(last.x, last.y - 32);
  ctx.lineTo(last.x + 8, last.y - 29);
  ctx.lineTo(last.x, last.y - 26);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BASE', last.x, last.y + 20);
}

// ── Pond & Fish Easter Egg ──
const POND_X = 120;
const POND_Y = 460;
const POND_RX = 55;
const POND_RY = 25;

function drawPond(ctx: CanvasRenderingContext2D, t: number): void {
  // Water body
  ctx.save();
  
  // Pond shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(POND_X + 2, POND_Y + 3, POND_RX, POND_RY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pond base (dark water)
  ctx.fillStyle = '#0a3355';
  ctx.beginPath();
  ctx.ellipse(POND_X, POND_Y, POND_RX, POND_RY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated water surface
  ctx.fillStyle = '#1a5577';
  ctx.beginPath();
  ctx.ellipse(POND_X, POND_Y - 2, POND_RX - 4, POND_RY - 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water ripples
  for (let i = 0; i < 3; i++) {
    const ripplePhase = t * 0.8 + i * 2.1;
    const rippleSize = (Math.sin(ripplePhase) + 1) * 0.5;
    const rx = POND_X - 15 + i * 18;
    const ry = POND_Y - 3 + Math.sin(t + i) * 3;
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(rx, ry, 6 + rippleSize * 8, 2 + rippleSize * 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Light reflection
  ctx.fillStyle = 'rgba(150, 220, 255, 0.15)';
  const reflectX = POND_X - 10 + Math.sin(t * 0.5) * 5;
  ctx.beginPath();
  ctx.ellipse(reflectX, POND_Y - 5, 12, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Lily pads
  const lilyPads = [
    { x: POND_X + 20, y: POND_Y - 5, r: 7 },
    { x: POND_X - 25, y: POND_Y + 3, r: 6 },
    { x: POND_X + 35, y: POND_Y + 5, r: 5 },
  ];
  for (const pad of lilyPads) {
    const bobY = pad.y + Math.sin(t * 0.6 + pad.x) * 1.5;
    ctx.fillStyle = '#2a7744';
    ctx.beginPath();
    ctx.ellipse(pad.x, bobY, pad.r, pad.r * 0.6, 0, 0.2, Math.PI * 2 - 0.2);
    ctx.fill();
    ctx.fillStyle = '#3a9955';
    ctx.beginPath();
    ctx.ellipse(pad.x - 1, bobY - 1, pad.r * 0.6, pad.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small flower on lily pad
  const flowerBob = POND_Y - 5 + Math.sin(t * 0.6 + POND_X + 20) * 1.5;
  ctx.fillStyle = '#ff88aa';
  ctx.beginPath();
  ctx.arc(POND_X + 20, flowerBob - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath();
  ctx.arc(POND_X + 20, flowerBob - 4, 1, 0, Math.PI * 2);
  ctx.fill();

  // Edge stones
  const stones = [
    { x: POND_X - 50, y: POND_Y + 10 },
    { x: POND_X - 40, y: POND_Y + 18 },
    { x: POND_X + 45, y: POND_Y + 12 },
    { x: POND_X + 55, y: POND_Y + 8 },
    { x: POND_X - 55, y: POND_Y },
    { x: POND_X + 50, y: POND_Y - 5 },
  ];
  for (const stone of stones) {
    ctx.fillStyle = '#556666';
    ctx.beginPath();
    ctx.ellipse(stone.x, stone.y, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#778888';
    ctx.beginPath();
    ctx.ellipse(stone.x - 0.5, stone.y - 1, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Fish Easter Egg ──
  // Phases: 0=jump out (0.5s), 1=on grass wiggling (3.5s), 2=jump back in (0.5s)
  const JUMP_OUT_DUR = 0.5;
  const ON_GRASS_DUR = 3.5;
  const JUMP_BACK_DUR = 0.5;
  const TOTAL_FISH_DUR = JUMP_OUT_DUR + ON_GRASS_DUR + JUMP_BACK_DUR;
  // Landing spot on grass next to pond
  const LAND_X = POND_X + POND_RX + 20;
  const LAND_Y = POND_Y - 5;

  const dt = 1 / 60;
  if (!fishState.caught) {
    fishState.timer += dt;
    if (!fishState.visible) {
      if (fishState.timer >= fishState.nextAppear) {
        fishState.visible = true;
        fishState.timer = 0;
        fishState.jumpPhase = 0;
        fishState.x = POND_X + 15;
        fishState.y = POND_Y;
      }
    } else {
      fishState.jumpPhase += dt;
      if (fishState.jumpPhase > TOTAL_FISH_DUR) {
        fishState.visible = false;
        fishState.timer = 0;
        fishState.nextAppear = 8 + Math.random() * 15;
      }
    }
  }

  if (fishState.visible && !fishState.caught) {
    const jp = fishState.jumpPhase;
    let fishX: number, fishY: number, rotation: number;

    const startX = POND_X + 15;
    const startY = POND_Y - 5;

    if (jp < JUMP_OUT_DUR) {
      // Phase 0: Arc from pond to grass
      const p = jp / JUMP_OUT_DUR;
      fishX = startX + (LAND_X - startX) * p;
      fishY = startY + (LAND_Y - startY) * p - Math.sin(p * Math.PI) * 35;
      rotation = -0.6 + p * 1.2; // rotating as it flies
    } else if (jp < JUMP_OUT_DUR + ON_GRASS_DUR) {
      // Phase 1: On grass, wiggling desperately
      const grassTime = jp - JUMP_OUT_DUR;
      fishX = LAND_X + Math.sin(grassTime * 8) * 3;
      fishY = LAND_Y + Math.abs(Math.sin(grassTime * 12)) * 2; // bouncing
      rotation = Math.sin(grassTime * 10) * 0.4; // frantic wiggle
    } else {
      // Phase 2: Jump back into pond
      const p = (jp - JUMP_OUT_DUR - ON_GRASS_DUR) / JUMP_BACK_DUR;
      fishX = LAND_X + (startX - LAND_X) * p;
      fishY = LAND_Y + (startY - LAND_Y) * p - Math.sin(p * Math.PI) * 30;
      rotation = 0.6 - p * 1.2;
    }

    // Splash ripples at pond when jumping out or back in
    if (jp < 0.3 || jp > TOTAL_FISH_DUR - 0.3) {
      const splashAlpha = jp < 0.3 ? (0.3 - jp) / 0.3 : (jp - (TOTAL_FISH_DUR - 0.3)) / 0.3;
      ctx.strokeStyle = `rgba(100, 200, 255, ${splashAlpha * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(startX, POND_Y - 2, 8 + splashAlpha * 10, 3 + splashAlpha * 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow on ground when on grass
    if (jp >= JUMP_OUT_DUR && jp < JUMP_OUT_DUR + ON_GRASS_DUR) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(fishX, LAND_Y + 5, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the fish (no clip — it's on grass!)
    ctx.save();
    ctx.translate(fishX, fishY);
    ctx.rotate(rotation);

    // Body
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter belly
    ctx.fillStyle = '#ffaa66';
    ctx.beginPath();
    ctx.ellipse(-0.5, 1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = '#ff6622';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.fillStyle = '#ee6633';
    ctx.beginPath();
    ctx.moveTo(-2, -3);
    ctx.lineTo(2, -6);
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(4.5, -1, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle hint when on grass
    if (jp >= JUMP_OUT_DUR && jp < JUMP_OUT_DUR + ON_GRASS_DUR && Math.sin(t * 8) > 0.3) {
      ctx.fillStyle = 'rgba(255, 255, 150, 0.8)';
      ctx.beginPath();
      ctx.arc(2, -4, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Store position for click detection (bigger hitbox)
    fishState.x = fishX;
    fishState.y = fishY;
  }

  ctx.restore();
}
