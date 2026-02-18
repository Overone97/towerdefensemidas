// Dedicated pixel-art sprite renderer for LoL-inspired characters
// Uses pixel grids for detailed, recognizable character art

type PixelGrid = string[][];

// Each character is drawn on a 16x16 pixel grid
// Characters: . = transparent, colors are mapped per character

const ALISTAR_GRID: string[] = [
  '..wwww..wwww..',  // horns
  '..w..wwww..w..',  // horn base + head top
  '...pppppppp...',  // head
  '...prp..prp...',  // eyes (r=red)
  '...pppppppp...',  // snout
  '....pgggp.....',  // nose ring (g=gold)
  '..PPPPPPPPPP..',  // broad shoulders
  '.PPPPPPPPPPPP.',  // upper body
  '.PPPddddddPPP.',  // chest armor (d=detail)
  '.PPPPPPPPPPPP.',  // torso
  '..PPPddddPPP..',  // belt
  '..PPPP..PPPP..',  // waist
  '..PPP....PPP..',  // legs
  '..PPP....PPP..',  // legs
  '..ppp....ppp..',  // hooves
];

const BRAND_GRID: string[] = [
  '....ww.ww.....',  // flame tips
  '...wwwwwww....',  // flame crown
  '..wwwwwwwww...',  // flame crown wide
  '...bbbbbbb....',  // head
  '...byb..byb...',  // glowing eyes (y=yellow)
  '...bbbbbbb....',  // face
  '..bbbccbbbb...',  // neck + cracks (c=crack/orange)
  '.bbbbbcbbbbb..',  // torso with cracks
  '.bbbbcccbbbb..',  // chest cracks
  '..bbbcbcbbb...',  // waist cracks
  '..bbbbbbbb....',  // lower body
  '...bbb.bbb....',  // legs
  '...bbb.bbb....',  // legs
  '...bb...bb....',  // feet
  '..ww.....ww...',  // fire at feet
];

const JINX_GRID: string[] = [
  '.hh........hh.',  // braid tips
  '.hh........hh.',  // braids
  '.hh..hhhh..hh.',  // braids + head
  '.hh.hhhhhh.hh.',  // braids + head
  '..h.hrh.hrh.h.',  // braids + eyes (r=red)
  '....hwhwhh....',  // face + grin (w=white)
  '....ssssss....',  // top/outfit (s=skin/outfit)
  '...ssssssss...',  // body
  '...ssggggss...',  // belt with bullets (g=gold)
  '...ssssssss...',  // waist
  '....ss..ss....',  // legs
  '....ss..ss....',  // legs
  '....ss..ss....',  // legs
  '....ss..ss....',  // boots
  '...sss..sss...',  // boot flare
];

interface ColorMap {
  [key: string]: string;
}

const ALISTAR_COLORS: ColorMap = {
  'p': '#7b4fa0',  // purple skin
  'P': '#5a3478',  // dark purple body/armor
  'w': '#e8d8c0',  // ivory horns
  'r': '#ff2222',  // red eyes
  'g': '#ffd700',  // gold nose ring
  'd': '#c0c0c0',  // silver armor detail
};

const BRAND_COLORS: ColorMap = {
  'b': '#882200',  // dark burning body
  'w': '#ff6600',  // flames (orange)
  'y': '#ffff00',  // yellow glowing eyes
  'c': '#ff4400',  // cracks/lava
};

const JINX_COLORS: ColorMap = {
  'h': '#44aadd',  // blue hair
  's': '#332244',  // dark outfit
  'r': '#ff2266',  // red/pink eyes
  'w': '#ffffff',  // white grin
  'g': '#ffcc00',  // gold bullets
};

function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  colors: ColorMap,
  cx: number,
  cy: number,
  size: number
) {
  const gridH = grid.length;
  const gridW = Math.max(...grid.map(r => r.length));
  const pxSize = size / 8; // pixel scale relative to character size
  const scale = pxSize * 0.7;
  const startX = cx - (gridW * scale) / 2;
  const startY = cy - (gridH * scale) / 2;

  for (let row = 0; row < gridH; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || ch === ' ') continue;
      const color = colors[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.floor(startX + col * scale),
        Math.floor(startY + row * scale),
        Math.ceil(scale),
        Math.ceil(scale)
      );
    }
  }
}

export function drawAlistarSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  const swing = isAttacking ? Math.sin(attackAnimTimer * 15) * 2 : 0;

  // Draw main body
  drawPixelGrid(ctx, ALISTAR_GRID, ALISTAR_COLORS, x, y, size);

  // Fists animation
  const ps = size / 8;
  const hs = size / 2;
  ctx.fillStyle = '#7b4fa0';
  ctx.fillRect(x - hs - ps * 2, y + ps + swing, ps * 2, ps * 2);
  ctx.fillRect(x + hs + ps, y + ps - swing, ps * 2, ps * 2);

  // Ground slam
  if (isAttacking && swing !== 0) {
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#d4a0ff';
    ctx.fillRect(x - hs - ps, y + hs - ps, size + ps * 2, ps);
    ctx.globalAlpha = 1;
  }
}

export function drawBrandSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  const swing = isAttacking ? Math.sin(attackAnimTimer * 15) * 2 : 0;

  // Flame flicker effect on the grid
  const flickerColors = { ...BRAND_COLORS };
  const flicker = Math.sin(animFrame * 0.2) * 0.3;
  if (flicker > 0.1) {
    flickerColors['w'] = '#ff8800'; // brighter flames
  }

  drawPixelGrid(ctx, BRAND_GRID, flickerColors, x, y, size);

  // Fireball in hand
  const ps = size / 8;
  const hs = size / 2;
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(x + hs + ps * 2, y - ps + swing, ps * 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Inner fireball glow
  ctx.fillStyle = '#ffff44';
  ctx.beginPath();
  ctx.arc(x + hs + ps * 2, y - ps + swing, ps * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Embers when attacking
  if (isAttacking) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ff6600';
    const t = attackAnimTimer * 10;
    ctx.fillRect(x + hs + ps * 3, y - ps * 2 + Math.sin(t) * ps, ps, ps);
    ctx.fillRect(x + hs + ps, y - ps * 3 + Math.cos(t) * ps, ps, ps);
    ctx.globalAlpha = 1;
  }
}

export function drawJinxSprite(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  animFrame: number, isAttacking: boolean, attackAnimTimer: number
) {
  const swing = isAttacking ? Math.sin(attackAnimTimer * 15) * 2 : 0;

  drawPixelGrid(ctx, JINX_GRID, JINX_COLORS, x, y, size);

  // Pow-Pow minigun
  const ps = size / 8;
  const hs = size / 2;
  ctx.fillStyle = '#888888'; // metal gray
  // Gun body
  ctx.fillRect(x + hs, y - ps + swing, ps * 4, ps * 0.8);
  ctx.fillRect(x + hs, y + swing, ps * 4, ps * 0.8);
  // Barrel housing
  ctx.fillStyle = '#666666';
  ctx.fillRect(x + hs + ps * 3, y - ps * 1.5 + swing, ps * 2, ps * 3);
  // Barrel tip
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(x + hs + ps * 5, y - ps * 0.3 + swing, ps, ps * 0.6);

  // Muzzle flash when attacking
  if (isAttacking) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(x + hs + ps * 6, y + swing, ps * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
