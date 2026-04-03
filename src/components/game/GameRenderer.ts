import { GameState, Enemy, PlacedUnit, Projectile, Slot, Point, AoeWaveState, GroundEffect, CharacterConfig } from '../../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/data/mapData';
import { getCharacterStats } from '../../game/data/characterData';
import { drawCharacterSprite } from '../../game/rendering/characterSprites';
import { drawEnemySprite } from '../../game/rendering/enemySprites';
import { ALL_MAPS } from '../../game/data/allMaps';
import { fishState } from '../../game/GameEngine';
import { getSkinById } from '../../game/data/skinData';
import { safeRadialGradient } from '../../game/rendering/safeCanvas';
import plainsBg from '../../assets/maps/plains-bg.jpg';
import forestBg from '../../assets/maps/forest-bg.jpg';
import volcanoBg from '../../assets/maps/volcano-bg.jpg';
import aramBg from '../../assets/maps/aram-bg.jpg';

let _lastFishTimerTs = 0;

const MAP_BG_IMAGES: Record<string, string> = {
  plains: plainsBg,
  forest: forestBg,
  volcano: volcanoBg,
  aram: aramBg,
};

// Preload background images
const bgImageCache: Record<string, HTMLImageElement> = {};
function getMapBgImage(mapId: string): HTMLImageElement | null {
  const src = MAP_BG_IMAGES[mapId];
  if (!src) return null;
  if (bgImageCache[mapId]) return bgImageCache[mapId];
  const img = new Image();
  img.src = src;
  bgImageCache[mapId] = img;
  return img.complete ? img : null;
}

// Seeded random for consistent decorations per map
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 1) % 2147483647;
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
    const t = Math.max(0, Math.min(1, ((px-ax)*dx + (py-ay)*dy) / len2));
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
  
  const rand = seededRandom(mapId.charCodeAt(0) * 1000 + (mapId.charCodeAt(1) || 0) * 100);
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
    case 'aram':
      return {
        grassLight: '#0a1628', grassDark: '#060e1a', grassAccent: '#0d1e3a',
        pathMain: '#2a4a6a', pathBorder: '#1a3a5a', pathDetail: '#3a6a8a',
        treeLeaf: '#1a3a5a', treeTrunk: '#0a1e2e', treeShadow: '#061428',
        waterColor: '#00aaff',
      };
    case 'void_rift':
      return {
        grassLight: '#1d1232', grassDark: '#0d0718', grassAccent: '#4a2d7a',
        pathMain: '#4d3470', pathBorder: '#26163d', pathDetail: '#b07dff',
        treeLeaf: '#3d2766', treeTrunk: '#26193d', treeShadow: '#120a20',
        waterColor: '#b14cff',
      };
    case 'freljord_storm':
      return {
        grassLight: '#1a2d45', grassDark: '#0b1422', grassAccent: '#325f86',
        pathMain: '#476f93', pathBorder: '#1f3f5d', pathDetail: '#b5ecff',
        treeLeaf: '#2e5c82', treeTrunk: '#1c2e41', treeShadow: '#091423',
        waterColor: '#7fd8ff',
      };
    case 'noxus_siege':
      return {
        grassLight: '#3a1720', grassDark: '#17080d', grassAccent: '#6a2434',
        pathMain: '#6e2c3e', pathBorder: '#34131d', pathDetail: '#ff8f8f',
        treeLeaf: '#5a1f2e', treeTrunk: '#2b1018', treeShadow: '#13070b',
        waterColor: '#ff5252',
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

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, waypoints: Point[], time?: number, equippedSkins?: Record<string, string>): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;
  const mapId = state.currentMapId || 'plains';
  const theme = getMapTheme(mapId);
  const t = (time || performance.now()) / 1000;

  // ── Background: image or fallback ──
  const bgImg = getMapBgImage(mapId);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, w, h);
    // Slight dark overlay so game elements pop
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);
  } else {
    drawGrassBackground(ctx, w, h, theme, t);
  }

  // ── Epic ascension overlays ──
  drawAscensionAmbience(ctx, mapId, t, w, h, waypoints);

  // ── Path (semi-transparent on bg image maps) ──
  if (bgImg) ctx.globalAlpha = 0.5;
  drawPath(ctx, waypoints, theme, mapId, t);
  if (bgImg) ctx.globalAlpha = 1;

  // ── Decorations (skip if bg image or ascension boss maps) ──
  const isAscensionMap = mapId === 'void_rift' || mapId === 'freljord_storm' || mapId === 'noxus_siege';
  if (!bgImg && !isAscensionMap) {
    const mapDef = ALL_MAPS.find(m => m.id === mapId);
    const decos = getDecorations(mapId, waypoints, mapDef?.slots || state.slots);
    drawDecorations(ctx, decos, theme, mapId, t);
  }

  // ── Slots ──
  drawSlots(ctx, state.slots, state.selectedSlotIndex);

  // ── Pond & fish easter egg ──
  drawPond(ctx, t);

  // ── Game entities ──
  drawGroundEffects(ctx, state.groundEffects || [], t);
  drawEnemies(ctx, state.enemies);
  drawAoeWaves(ctx, state.aoeWaves || []);
  drawUnits(ctx, state.placedUnits, state.selectedUnitId, state.enemies, equippedSkins || {});
  drawProjectiles(ctx, state.projectiles);
  drawBase(ctx, waypoints);
  drawAscensionWeather(ctx, state, t, w, h);
  drawAscensionHudOverlays(ctx, state, w);
}

function drawAscensionWeather(ctx: CanvasRenderingContext2D, state: GameState, t: number, w: number, h: number): void {
  if (!state.ascensionWeather) return;
  ctx.save();

  if (state.ascensionWeather === 'void') {
    for (let i = 0; i < 120; i++) {
      const x = (i * 53 + t * 18) % w;
      const y = (i * 29 + t * 7) % h;
      ctx.fillStyle = 'rgba(196, 124, 255, 0.12)';
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  } else if (state.ascensionWeather === 'freljord') {
    for (let i = 0; i < 140; i++) {
      const x = (i * 41 - t * 90) % w;
      const y = (i * 17 + t * 36) % h;
      ctx.strokeStyle = 'rgba(220,245,255,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5, y + 8);
      ctx.stroke();
    }
  } else if (state.ascensionWeather === 'noxus') {
    for (let i = 0; i < 90; i++) {
      const x = (i * 67 + t * 24) % w;
      const y = (i * 31 - t * 20) % h;
      ctx.fillStyle = 'rgba(255,95,95,0.16)';
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawAscensionHudOverlays(ctx: CanvasRenderingContext2D, state: GameState, w: number): void {
  if (state.ascensionCinematicTitle && (state.ascensionCinematicTimer || 0) > 0) {
    ctx.save();
    const a = Math.min(1, (state.ascensionCinematicTimer || 0) / 1.0);
    ctx.globalAlpha = 0.85 * a;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(140, 24, w - 280, 58);
    ctx.strokeStyle = '#ffcc88';
    ctx.lineWidth = 2;
    ctx.strokeRect(140, 24, w - 280, 58);
    ctx.fillStyle = '#ffe7b3';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.ascensionCinematicTitle, w / 2, 60);
    ctx.restore();
  }

  if (state.ascensionEventLabel && (state.ascensionEventTimer || 0) > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(18, 88, 280, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.strokeRect(18, 88, 280, 26);
    ctx.fillStyle = '#ffdf9f';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(state.ascensionEventLabel, 28, 106);
    ctx.restore();
  }
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

function drawAscensionAmbience(ctx: CanvasRenderingContext2D, mapId: string, t: number, w: number, h: number, waypoints: Point[]): void {
  if (mapId !== 'void_rift' && mapId !== 'freljord_storm' && mapId !== 'noxus_siege') return;

  ctx.save();

  // Global vignette for boss-map feeling
  const vignette = safeRadialGradient(ctx, w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, mapId === 'void_rift' ? 'rgba(30,0,50,0.42)' : mapId === 'freljord_storm' ? 'rgba(0,15,40,0.38)' : 'rgba(45,0,0,0.44)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // Runes/sigils near path nodes
  for (let i = 1; i < waypoints.length - 1; i++) {
    const p = waypoints[i];
    const pulse = 0.35 + Math.sin(t * 2 + i) * 0.2;
    const color = mapId === 'void_rift' ? '#b877ff' : mapId === 'freljord_storm' ? '#9fe9ff' : '#ff7d7d';
    ctx.strokeStyle = color;
    ctx.globalAlpha = pulse;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10 + (i % 3), 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + (i % 2), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ambient particles
  const rand = seededRandom(mapId.charCodeAt(0) + mapId.length * 97);
  for (let i = 0; i < 55; i++) {
    const x = (rand() * w + t * (mapId === 'freljord_storm' ? 25 : 10) + i * 13) % w;
    const y = (rand() * h + (mapId === 'noxus_siege' ? t * 8 : -t * 14) + i * 7) % h;
    ctx.fillStyle = mapId === 'void_rift' ? '#d2a2ff' : mapId === 'freljord_storm' ? '#dcf7ff' : '#ffb3b3';
    ctx.globalAlpha = 0.05 + (i % 5) * 0.01;
    const s = mapId === 'freljord_storm' ? 1.2 : 1.6;
    ctx.fillRect(x, y, s, s);
  }

  ctx.restore();
}

function drawPath(ctx: CanvasRenderingContext2D, waypoints: Point[], theme: ReturnType<typeof getMapTheme>, mapId: string, t: number): void {
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

  if (mapId === 'void_rift' || mapId === 'freljord_storm' || mapId === 'noxus_siege') {
    ctx.save();
    ctx.globalAlpha = 0.24 + Math.sin(t * 1.6) * 0.06;
    ctx.strokeStyle = mapId === 'void_rift' ? '#c08bff' : mapId === 'freljord_storm' ? '#bdf2ff' : '#ff9a9a';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
    ctx.stroke();
    ctx.restore();
  }
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
    drawEnemySprite(ctx, enemy.type, enemy.x, enemy.y, enemy.size, enemy.animFrame, bodyColor, enemy.strokeColor, enemy.stealthed);

    // Shield visual (Earth Dragon)
    if (enemy.shieldHp && enemy.shieldHp > 0 && enemy.shieldMaxHp) {
      ctx.save();
      ctx.strokeStyle = '#66bbff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6 + Math.sin(enemy.animFrame * 0.08) * 0.2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 6, 0, Math.PI * 2);
      ctx.stroke();
      // Shield HP as arc
      const shieldPct = enemy.shieldHp / enemy.shieldMaxHp;
      ctx.strokeStyle = '#88ddff';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shieldPct);
      ctx.stroke();
      ctx.restore();
    }

    const isMajorBoss = enemy.type === 'boss' || enemy.type === 'void_empress' || enemy.type === 'ice_witch' || enemy.type === 'noxian_grand_general';
    if (isMajorBoss) {
      ctx.fillStyle = '#ff88ff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS', enemy.x, enemy.y - enemy.size - 14);
    }

    // Special labels
    if (enemy.type === 'healer') {
      ctx.fillStyle = '#44ff44';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HEAL', enemy.x, enemy.y - enemy.size - 10);
    }
    if (enemy.stealthed) {
      ctx.fillStyle = '#aa44ff';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('👁️', enemy.x, enemy.y - enemy.size - 10);
    }

    if (enemy.armor > 0 && !isMajorBoss) {
      ctx.fillStyle = '#cccc88';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🛡', enemy.x + enemy.size + 2, enemy.y - enemy.size + 4);
    }

    const barW = isMajorBoss ? 40 : 24;
    const barH = isMajorBoss ? 6 : 4;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - enemy.size - 8;
    const hpRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
  }
}

function drawGroundEffects(ctx: CanvasRenderingContext2D, effects: GroundEffect[], t: number): void {
  for (const ge of effects) {
    if (!ge.alive) continue;
    const lifeRatio = ge.duration / ge.maxDuration;

    if (ge.type === 'poison_cloud') {
      // Animated toxic cloud
      ctx.save();
      const pulse = 1 + Math.sin(t * 4 + ge.x * 0.1) * 0.15;
      const r = ge.radius * pulse;

      // Cloud gradient
      const grad = safeRadialGradient(ctx, ge.x, ge.y, 0, ge.x, ge.y, r);
      grad.addColorStop(0, ge.color + '55');
      grad.addColorStop(0.5, ge.color + '33');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.globalAlpha = lifeRatio * 0.8;
      ctx.beginPath();
      ctx.arc(ge.x, ge.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Swirling sub-clouds
      for (let i = 0; i < 3; i++) {
        const angle = t * 2 + (i * Math.PI * 2) / 3 + ge.y * 0.05;
        const dist = r * 0.4;
        const cx = ge.x + Math.cos(angle) * dist;
        const cy = ge.y + Math.sin(angle) * dist;
        ctx.globalAlpha = lifeRatio * 0.4;
        ctx.fillStyle = ge.color + '66';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Toxic particles floating up
      for (let i = 0; i < 2; i++) {
        const px = ge.x + Math.sin(t * 3 + i * 2 + ge.x) * r * 0.5;
        const py = ge.y - ((t * 20 + i * 10 + ge.x * 2) % (r * 1.5));
        ctx.globalAlpha = lifeRatio * 0.5;
        ctx.fillStyle = ge.color;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if (ge.type === 'mushroom') {
      ctx.save();

      if (ge.exploded) {
        // Explosion flash
        ctx.globalAlpha = ge.duration * 2;
        const explGrad = safeRadialGradient(ctx, ge.x, ge.y, 0, ge.x, ge.y, ge.aoeRadius || 40);
        explGrad.addColorStop(0, '#ffff44aa');
        explGrad.addColorStop(0.5, '#88dd4466');
        explGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = explGrad;
        ctx.beginPath();
        ctx.arc(ge.x, ge.y, ge.aoeRadius || 40, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mushroom sprite
        const bob = Math.sin(t * 2 + ge.x * 0.1) * 1;

        // Stem
        ctx.fillStyle = '#ccbb88';
        ctx.fillRect(ge.x - 2, ge.y - 2 + bob, 4, 7);

        // Cap
        ctx.fillStyle = '#dd4444';
        ctx.beginPath();
        ctx.ellipse(ge.x, ge.y - 4 + bob, 7, 5, 0, Math.PI, 0);
        ctx.fill();

        // White spots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ge.x - 2, ge.y - 6 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ge.x + 2, ge.y - 5 + bob, 1, 0, Math.PI * 2);
        ctx.fill();

        // Danger radius hint (subtle)
        ctx.strokeStyle = '#ff444422';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(ge.x, ge.y, ge.aoeRadius || 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }
}

function drawAoeWaves(ctx: CanvasRenderingContext2D, waves: AoeWaveState[]): void {
  for (const wave of waves) {
    if (!wave.alive) continue;
    const r = wave.currentRadius;
    const progress = r / wave.maxRadius;
    const fade = Math.max(0, 1 - progress * 0.6);
    const waveThickness = 18 + (1 - progress) * 12; // thick band that thins as it expands

    ctx.save();

    // ── Thick tsunami wave band ──
    // Draw as a filled ring (annulus) between r-thickness and r
    const outerR = r;
    const innerR = Math.max(0, r - waveThickness);

    // Radial gradient across the wave band: bright leading edge, fading trail
    const bandGrad = safeRadialGradient(ctx, wave.x, wave.y, innerR, wave.x, wave.y, outerR + 4);
    bandGrad.addColorStop(0, 'transparent');
    bandGrad.addColorStop(0.2, wave.weaponColor + 'aa');
    bandGrad.addColorStop(0.5, wave.weaponColor);
    bandGrad.addColorStop(0.8, '#ffffff');
    bandGrad.addColorStop(1, wave.weaponColor + '44');

    ctx.globalAlpha = fade * 0.85;
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, outerR + 2, 0, Math.PI * 2);
    ctx.arc(wave.x, wave.y, innerR, 0, Math.PI * 2, true); // cut out inner
    ctx.fill();

    // ── Bright leading edge stroke ──
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = fade * 0.9;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // ── Secondary colored edge ──
    ctx.strokeStyle = wave.weaponColor;
    ctx.globalAlpha = fade * 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, outerR + 3, 0, Math.PI * 2);
    ctx.stroke();

    // ── Ground distortion effect (subtle inner ripples) ──
    for (let i = 1; i <= 2; i++) {
      const rippleR = Math.max(0, r - waveThickness - i * 10);
      if (rippleR <= 0) continue;
      ctx.strokeStyle = wave.weaponColor;
      ctx.globalAlpha = fade * 0.2 / i;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, rippleR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ── Outer glow halo ──
    const glowGrad = safeRadialGradient(ctx, wave.x, wave.y, outerR, wave.x, wave.y, outerR + 20);
    glowGrad.addColorStop(0, wave.weaponColor + '55');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.globalAlpha = fade * 0.5;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, outerR + 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawUnits(ctx: CanvasRenderingContext2D, units: PlacedUnit[], selectedId: number | null, enemies: Enemy[], equippedSkins: Record<string, string>): void {
  const now = performance.now() / 1000;

  for (const unit of units) {
    // Apply skin colors if equipped
    let renderConfig = unit.config;
    const skinId = equippedSkins[unit.config.id];
    if (skinId) {
      const skin = getSkinById(skinId);
      if (skin) {
        renderConfig = { ...unit.config, bodyColor: skin.bodyColor, detailColor: skin.detailColor, weaponColor: skin.weaponColor };
      }
    }
    const stats = getCharacterStats(unit.config, unit.level, unit.stars);
    const isSelected = selectedId === unit.id;

    // ── Range circle (enhanced) ──
    if (isSelected) {
      const safeRange = Math.max(0, stats.range);
      // Outer pulsing ring
      const pulse = 0.6 + Math.sin(now * 3) * 0.15;
      const innerRange = Math.max(0, Math.min(safeRange - 0.001, safeRange * 0.7));
      const outerRange = Math.max(0.001, safeRange);
      const rangeGrad = safeRadialGradient(ctx, unit.x, unit.y, innerRange, unit.x, unit.y, outerRange);
      rangeGrad.addColorStop(0, 'rgba(68, 170, 255, 0.0)');
      rangeGrad.addColorStop(0.8, `rgba(68, 170, 255, ${0.06 * pulse})`);
      rangeGrad.addColorStop(1, `rgba(68, 170, 255, ${0.15 * pulse})`);
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, safeRange, 0, Math.PI * 2);
      ctx.fillStyle = rangeGrad;
      ctx.fill();

      // Dashed rotating border
      ctx.save();
      ctx.translate(unit.x, unit.y);
      ctx.rotate(now * 0.5);
      ctx.translate(-unit.x, -unit.y);
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(now * 2) * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, safeRange, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Inner solid ring
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, Math.max(0, safeRange - 3), 0, Math.PI * 2);
      ctx.stroke();
    }

    // ── Attack VFX (shockwave / effects) ──
    if (unit.isAttacking && unit.attackAnimTimer > 0) {
      const t = unit.attackAnimTimer;
      const pattern = unit.config.attackPattern;

      if (pattern === 'aoe_circle') {
        // AOE wave visuals are now drawn by drawAoeWaves
      } else if (pattern === 'line') {
        // Slash effect
        const target = enemies.find(e => e.id === unit.targetId && e.alive);
        if (target) {
          const slashAlpha = Math.max(0, t * 3);
          ctx.save();
          ctx.strokeStyle = unit.config.weaponColor;
          ctx.globalAlpha = slashAlpha * 0.6;
          ctx.lineWidth = 4 * t * 3;
          ctx.beginPath();
          ctx.moveTo(unit.x, unit.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
          // Bright tip
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = slashAlpha * 0.8;
          ctx.beginPath();
          ctx.arc(target.x, target.y, 4 * t * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (pattern === 'chain') {
        // Lightning chain effect
        const target = enemies.find(e => e.id === unit.targetId && e.alive);
        if (target) {
          const chainAlpha = Math.max(0, t * 3);
          ctx.save();
          ctx.strokeStyle = unit.config.weaponColor;
          ctx.globalAlpha = chainAlpha * 0.7;
          ctx.lineWidth = 2;
          // Jagged lightning line
          const dx = target.x - unit.x;
          const dy = target.y - unit.y;
          ctx.beginPath();
          ctx.moveTo(unit.x, unit.y);
          const segments = 6;
          for (let i = 1; i < segments; i++) {
            const frac = i / segments;
            const jx = unit.x + dx * frac + (Math.random() - 0.5) * 12;
            const jy = unit.y + dy * frac + (Math.random() - 0.5) * 12;
            ctx.lineTo(jx, jy);
          }
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
          ctx.restore();
        }
      } else if (pattern === 'burst') {
        // Burst explosion particles
        const burstAlpha = Math.max(0, t * 3);
        ctx.save();
        ctx.globalAlpha = burstAlpha * 0.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + now * 5;
          const dist = 12 + (1 - t) * 20;
          const px = unit.x + Math.cos(angle) * dist;
          const py = unit.y + Math.sin(angle) * dist;
          ctx.fillStyle = unit.config.weaponColor;
          ctx.beginPath();
          ctx.arc(px, py, 2 + t * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // ── Target line for rapid/slow/chain attacks ──
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

    drawCharacterSprite(ctx, renderConfig, unit.x, unit.y, 18, unit.animFrame, unit.isAttacking, unit.attackAnimTimer, unit.stars, unit.config, skinId);

    // Selection indicator (subtle glow instead of box)
    if (isSelected) {
      ctx.save();
      const selGlow = safeRadialGradient(ctx, unit.x, unit.y, 8, unit.x, unit.y, 18);
      selGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
      selGlow.addColorStop(0.7, 'rgba(100, 200, 255, 0.15)');
      selGlow.addColorStop(1, `rgba(100, 200, 255, ${0.3 + Math.sin(now * 4) * 0.1})`);
      ctx.fillStyle = selGlow;
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

    if (proj.projectileType === 'sivir_boomerang') {
      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(angle + (proj.rotation || 0));

      const trail = safeRadialGradient(ctx, 0, 0, 1, 0, 0, 14);
      trail.addColorStop(0, 'rgba(255, 216, 120, 0.95)');
      trail.addColorStop(0.6, 'rgba(255, 185, 70, 0.35)');
      trail.addColorStop(1, 'rgba(255, 185, 70, 0)');
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(0, 0, 8, -Math.PI * 0.8, Math.PI * 0.8);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#fff4bf';
      ctx.beginPath();
      ctx.arc(0, 0, 6, -Math.PI * 0.75, Math.PI * 0.75);
      ctx.stroke();

      ctx.restore();
      continue;
    }

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
  // Shift left if too close to edge
  const bx = last.x >= 780 ? last.x - 30 : last.x;
  const by = last.y;

  // Stone platform (larger)
  ctx.fillStyle = '#666666';
  ctx.beginPath();
  ctx.ellipse(bx, by + 12, 36, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.ellipse(bx, by + 9, 32, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Castle/tower base (2x bigger)
  ctx.fillStyle = '#4477aa';
  ctx.fillRect(bx - 20, by - 32, 40, 44);
  // Battlements
  ctx.fillStyle = '#5588bb';
  ctx.fillRect(bx - 24, by - 40, 12, 12);
  ctx.fillRect(bx - 4, by - 44, 8, 16);
  ctx.fillRect(bx + 12, by - 40, 12, 12);
  // Door
  ctx.fillStyle = '#2a4a6a';
  ctx.fillRect(bx - 8, by - 4, 16, 16);
  // Windows
  ctx.fillStyle = '#ffdd44';
  ctx.fillRect(bx - 14, by - 22, 6, 6);
  ctx.fillRect(bx + 8, by - 22, 6, 6);
  // Flag
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, by - 44);
  ctx.lineTo(bx, by - 62);
  ctx.stroke();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(bx, by - 62);
  ctx.lineTo(bx + 14, by - 57);
  ctx.lineTo(bx, by - 52);
  ctx.fill();

  // Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🏰 BASE', bx, by + 30);
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

  const now = performance.now();
  const fishDt = _lastFishTimerTs > 0 ? Math.min((now - _lastFishTimerTs) / 1000, 0.1) : 1/60;
  _lastFishTimerTs = now;
  if (!fishState.caught) {
    fishState.timer += fishDt;
    if (!fishState.visible) {
      if (fishState.timer >= fishState.nextAppear) {
        fishState.visible = true;
        fishState.timer = 0;
        fishState.jumpPhase = 0;
        fishState.x = POND_X + 15;
        fishState.y = POND_Y;
      }
    } else {
      fishState.jumpPhase += fishDt;
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
