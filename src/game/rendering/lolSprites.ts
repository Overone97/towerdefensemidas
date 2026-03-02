// LoL character sprite renderer using pre-generated pixel art images
// Images are loaded once, background-removed, cached, then drawn on canvas

import alistarImg from '@/assets/sprites/alistar.png';
import brandImg from '@/assets/sprites/brand.png';
import jinxImg from '@/assets/sprites/jinx.png';
import garenImg from '@/assets/sprites/garen.png';
import asheImg from '@/assets/sprites/ashe.png';
import leonaImg from '@/assets/sprites/leona.png';
import teemoImg from '@/assets/sprites/teemo.png';
import luxImg from '@/assets/sprites/lux.png';
import annieImg from '@/assets/sprites/annie.png';
import jarvanImg from '@/assets/sprites/jarvan.png';
import singedImg from '@/assets/sprites/singed.png';
import dariusImg from '@/assets/sprites/darius.png';
import lissandraImg from '@/assets/sprites/lissandra.png';
import yasuoImg from '@/assets/sprites/yasuo.png';
import rumbleImg from '@/assets/sprites/rumble.png';
import caitlynImg from '@/assets/sprites/caitlyn.png';
import threshImg from '@/assets/sprites/thresh.png';
import rivenImg from '@/assets/sprites/riven.png';
import zedImg from '@/assets/sprites/zed.png';
import volibearImg from '@/assets/sprites/volibear.png';
import aniviaImg from '@/assets/sprites/anivia.png';
import kassadinImg from '@/assets/sprites/kassadin.png';
import sonaImg from '@/assets/sprites/sona.png';
import fizzImg from '@/assets/sprites/fizz.png';
import ahriImg from '@/assets/sprites/ahri.png';
import leesinImg from '@/assets/sprites/leesin.png';
import vayneImg from '@/assets/sprites/vayne.png';
import morganaImg from '@/assets/sprites/morgana.png';
import blitzcrankImg from '@/assets/sprites/blitzcrank.png';
import katarinaImg from '@/assets/sprites/katarina.png';
import twistedfateImg from '@/assets/sprites/twistedfate.png';
import malphiteImg from '@/assets/sprites/malphite.png';
import ezrealImg from '@/assets/sprites/ezreal.png';
import missfortuneImg from '@/assets/sprites/missfortune.png';
// New 50 champions
import dravenImg from '@/assets/sprites/draven.png';
import fioraImg from '@/assets/sprites/fiora.png';
import gravesImg from '@/assets/sprites/graves.png';
import ireliaImg from '@/assets/sprites/irelia.png';
import jaxImg from '@/assets/sprites/jax.png';
import jayceImg from '@/assets/sprites/jayce.png';
import khazixImg from '@/assets/sprites/khazix.png';
import leblancImg from '@/assets/sprites/leblanc.png';
import lucianImg from '@/assets/sprites/lucian.png';
import luluImg from '@/assets/sprites/lulu.png';
import masteryiImg from '@/assets/sprites/masteryi.png';
import namiImg from '@/assets/sprites/nami.png';
import nasusImg from '@/assets/sprites/nasus.png';
import nautilusImg from '@/assets/sprites/nautilus.png';
import nidaleeImg from '@/assets/sprites/nidalee.png';
import oriannaImg from '@/assets/sprites/orianna.png';
import pantheonImg from '@/assets/sprites/pantheon.png';
import renektonImg from '@/assets/sprites/renekton.png';
import rengarImg from '@/assets/sprites/rengar.png';
import sejuaniImg from '@/assets/sprites/sejuani.png';
import shacoImg from '@/assets/sprites/shaco.png';
import shenImg from '@/assets/sprites/shen.png';
import sivirImg from '@/assets/sprites/sivir.png';
import sorakaImg from '@/assets/sprites/soraka.png';
import swainImg from '@/assets/sprites/swain.png';
import syndraImg from '@/assets/sprites/syndra.png';
import talonImg from '@/assets/sprites/talon.png';
import tristanaImg from '@/assets/sprites/tristana.png';
import tryndamereImg from '@/assets/sprites/tryndamere.png';
import udyrImg from '@/assets/sprites/udyr.png';
import urgotImg from '@/assets/sprites/urgot.png';
import varusImg from '@/assets/sprites/varus.png';
import veigarImg from '@/assets/sprites/veigar.png';
import viImg from '@/assets/sprites/vi.png';
import viktorImg from '@/assets/sprites/viktor.png';
import vladimirImg from '@/assets/sprites/vladimir.png';
import warwickImg from '@/assets/sprites/warwick.png';
import wukongImg from '@/assets/sprites/wukong.png';
import xerathImg from '@/assets/sprites/xerath.png';
import xinzhaoImg from '@/assets/sprites/xinzhao.png';
import yorickImg from '@/assets/sprites/yorick.png';
import ziggsImg from '@/assets/sprites/ziggs.png';
import zileanImg from '@/assets/sprites/zilean.png';
import zyraImg from '@/assets/sprites/zyra.png';
import dianaImg from '@/assets/sprites/diana.png';
import ekkoImg from '@/assets/sprites/ekko.png';
import eliseImg from '@/assets/sprites/elise.png';
import evelynnImg from '@/assets/sprites/evelynn.png';
import gangplankImg from '@/assets/sprites/gangplank.png';
import hecarimImg from '@/assets/sprites/hecarim.png';

// Map character IDs to their sprite imports
const SPRITE_MAP: Record<string, string> = {
  garen: garenImg, ashe: asheImg, leona: leonaImg, teemo: teemoImg, lux: luxImg,
  annie: annieImg, jarvan: jarvanImg, singed: singedImg, darius: dariusImg, lissandra: lissandraImg,
  yasuo: yasuoImg, rumble: rumbleImg, caitlyn: caitlynImg, thresh: threshImg,
  riven: rivenImg, zed: zedImg, volibear: volibearImg, anivia: aniviaImg,
  kassadin: kassadinImg, sona: sonaImg, fizz: fizzImg, alistar: alistarImg,
  brand: brandImg, jinx: jinxImg, ahri: ahriImg, leesin: leesinImg,
  vayne: vayneImg, morgana: morganaImg, blitzcrank: blitzcrankImg, katarina: katarinaImg,
  twistedfate: twistedfateImg, malphite: malphiteImg, ezreal: ezrealImg, missfortune: missfortuneImg,
  // New 50
  draven: dravenImg, fiora: fioraImg, graves: gravesImg, irelia: ireliaImg,
  jax: jaxImg, jayce: jayceImg, khazix: khazixImg, leblanc: leblancImg,
  lucian: lucianImg, lulu: luluImg, masteryi: masteryiImg, nami: namiImg,
  nasus: nasusImg, nautilus: nautilusImg, nidalee: nidaleeImg, orianna: oriannaImg,
  pantheon: pantheonImg, renekton: renektonImg, rengar: rengarImg, sejuani: sejuaniImg,
  shaco: shacoImg, shen: shenImg, sivir: sivirImg, soraka: sorakaImg,
  swain: swainImg, syndra: syndraImg, talon: talonImg, tristana: tristanaImg,
  tryndamere: tryndamereImg, udyr: udyrImg, urgot: urgotImg, varus: varusImg,
  veigar: veigarImg, vi: viImg, viktor: viktorImg, vladimir: vladimirImg,
  warwick: warwickImg, wukong: wukongImg, xerath: xerathImg, xinzhao: xinzhaoImg,
  yorick: yorickImg, ziggs: ziggsImg, zilean: zileanImg, zyra: zyraImg,
  diana: dianaImg, ekko: ekkoImg, elise: eliseImg, evelynn: evelynnImg,
  gangplank: gangplankImg, hecarim: hecarimImg,
};

// Image cache (cleaned versions without background)
const imageCache: Map<string, HTMLCanvasElement> = new Map();
const loadingImages: Set<string> = new Set();

function removeBackground(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  const bgR = d[0], bgG = d[1], bgB = d[2];
  const threshold = 40;
  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - bgR);
    const dg = Math.abs(d[i + 1] - bgG);
    const db = Math.abs(d[i + 2] - bgB);
    if (dr < threshold && dg < threshold && db < threshold) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function getOrLoadImage(src: string, key: string): HTMLCanvasElement | null {
  const cached = imageCache.get(key);
  if (cached) return cached;

  if (!loadingImages.has(key)) {
    loadingImages.add(key);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const cleaned = removeBackground(img);
      imageCache.set(key, cleaned);
      loadingImages.delete(key);
    };
    img.onerror = () => {
      loadingImages.delete(key);
    };
  }

  return null;
}

export function preloadLolSprites() {
  for (const [key, src] of Object.entries(SPRITE_MAP)) {
    getOrLoadImage(src, key);
  }
}

preloadLolSprites();

export function drawLolSprite(
  ctx: CanvasRenderingContext2D,
  charId: string,
  x: number,
  y: number,
  size: number,
  animFrame: number,
  isAttacking: boolean,
  attackAnimTimer: number
) {
  const src = SPRITE_MAP[charId];
  if (!src) return false;

  const img = getOrLoadImage(src, charId);
  const drawSize = size * 2.2;

  const bob = Math.sin(animFrame * 0.08) * 1.5;

  let swing = 0;
  let pulse = 1;
  let tilt = 0;
  if (isAttacking) {
    swing = Math.sin(attackAnimTimer * 15) * 2;
    pulse = 1 + Math.sin(attackAnimTimer * 12) * 0.12;
    tilt = Math.sin(attackAnimTimer * 10) * 0.08;
  }

  if (img) {
    ctx.save();
    ctx.translate(x, y + bob + swing);
    ctx.rotate(tilt);
    ctx.scale(pulse, pulse);
    ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return true;
}

export function hasLolSprite(charId: string): boolean {
  return charId in SPRITE_MAP;
}

export function drawAlistarSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'alistar', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
export function drawBrandSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'brand', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
export function drawJinxSprite(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, animFrame: number, isAttacking: boolean, attackAnimTimer: number) {
  drawLolSprite(ctx, 'jinx', x, y, size, animFrame, isAttacking, attackAnimTimer);
}
