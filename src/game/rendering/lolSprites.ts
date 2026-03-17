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
// Batch 2: 50 champions
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
// Batch 3: 70 new champions from allChampions.ts
import aatroxImg from '@/assets/sprites/aatrox.png';
import akaliImg from '@/assets/sprites/akali.png';
import akshanImg from '@/assets/sprites/akshan.png';
import ambessaImg from '@/assets/sprites/ambessa.png';
import amumuImg from '@/assets/sprites/amumu.png';
import apheliosImg from '@/assets/sprites/aphelios.png';
import auroraImg from '@/assets/sprites/aurora.png';
import aurelionsolImg from '@/assets/sprites/aurelionsol.png';
import azirImg from '@/assets/sprites/azir.png';
import bardImg from '@/assets/sprites/bard.png';
import belvethImg from '@/assets/sprites/belveth.png';
import braumImg from '@/assets/sprites/braum.png';
import briarImg from '@/assets/sprites/briar.png';
import camilleImg from '@/assets/sprites/camille.png';
import cassiopeiaImg from '@/assets/sprites/cassiopeia.png';
import chogathImg from '@/assets/sprites/chogath.png';
import corkiImg from '@/assets/sprites/corki.png';
import drmundoImg from '@/assets/sprites/drmundo.png';
import fiddlesticksImg from '@/assets/sprites/fiddlesticks.png';
import galioImg from '@/assets/sprites/galio.png';
import gnarImg from '@/assets/sprites/gnar.png';
import gragasImg from '@/assets/sprites/gragas.png';
import gwenImg from '@/assets/sprites/gwen.png';
import hweiImg from '@/assets/sprites/hwei.png';
import illaoiImg from '@/assets/sprites/illaoi.png';
import ivernImg from '@/assets/sprites/ivern.png';
import jannaImg from '@/assets/sprites/janna.png';
import jhinImg from '@/assets/sprites/jhin.png';
import kaisaImg from '@/assets/sprites/kaisa.png';
import kalistaImg from '@/assets/sprites/kalista.png';
import karmaImg from '@/assets/sprites/karma.png';
import karthusImg from '@/assets/sprites/karthus.png';
import kaynImg from '@/assets/sprites/kayn.png';
import kennenImg from '@/assets/sprites/kennen.png';
import kindredImg from '@/assets/sprites/kindred.png';
import kledImg from '@/assets/sprites/kled.png';
import kogmawImg from '@/assets/sprites/kogmaw.png';
import ksanteImg from '@/assets/sprites/ksante.png';
import lilliaImg from '@/assets/sprites/lillia.png';
import maokaiImg from '@/assets/sprites/maokai.png';
import mordekaiserImg from '@/assets/sprites/mordekaiser.png';
import naafiriImg from '@/assets/sprites/naafiri.png';
import neekoImg from '@/assets/sprites/neeko.png';
import nilahImg from '@/assets/sprites/nilah.png';
import nocturneImg from '@/assets/sprites/nocturne.png';
import nunuImg from '@/assets/sprites/nunu.png';
import olafImg from '@/assets/sprites/olaf.png';
import poppyImg from '@/assets/sprites/poppy.png';
import pykeImg from '@/assets/sprites/pyke.png';
import qiyanaImg from '@/assets/sprites/qiyana.png';
import quinnImg from '@/assets/sprites/quinn.png';
import rakanImg from '@/assets/sprites/rakan.png';
import rammusImg from '@/assets/sprites/rammus.png';
import reksaiImg from '@/assets/sprites/reksai.png';
import rellImg from '@/assets/sprites/rell.png';
import renataImg from '@/assets/sprites/renata.png';
import samiraImg from '@/assets/sprites/samira.png';
import sennaImg from '@/assets/sprites/senna.png';
import seraphineImg from '@/assets/sprites/seraphine.png';
import settImg from '@/assets/sprites/sett.png';
import shyvanaImg from '@/assets/sprites/shyvana.png';
import sionImg from '@/assets/sprites/sion.png';
import skarnerImg from '@/assets/sprites/skarner.png';
import smolderImg from '@/assets/sprites/smolder.png';
import sylasImg from '@/assets/sprites/sylas.png';
import tahmkenchImg from '@/assets/sprites/tahmkench.png';
import taliyahImg from '@/assets/sprites/taliyah.png';
import taricImg from '@/assets/sprites/taric.png';
import twitchImg from '@/assets/sprites/twitch.png';
import vexImg from '@/assets/sprites/vex.png';
import viegoImg from '@/assets/sprites/viego.png';
import xayahImg from '@/assets/sprites/xayah.png';
import yoneImg from '@/assets/sprites/yone.png';
import yuumiImg from '@/assets/sprites/yuumi.png';
import zacImg from '@/assets/sprites/zac.png';
import zeriImg from '@/assets/sprites/zeri.png';
import zoeImg from '@/assets/sprites/zoe.png';

// Map character IDs to their sprite imports
const SPRITE_MAP: Record<string, string> = {
  // Original roster
  garen: garenImg, ashe: asheImg, leona: leonaImg, teemo: teemoImg, lux: luxImg,
  annie: annieImg, jarvan: jarvanImg, singed: singedImg, darius: dariusImg, lissandra: lissandraImg,
  yasuo: yasuoImg, rumble: rumbleImg, caitlyn: caitlynImg, thresh: threshImg,
  riven: rivenImg, zed: zedImg, volibear: volibearImg, anivia: aniviaImg,
  kassadin: kassadinImg, sona: sonaImg, fizz: fizzImg, alistar: alistarImg,
  brand: brandImg, jinx: jinxImg, ahri: ahriImg, leesin: leesinImg,
  vayne: vayneImg, morgana: morganaImg, blitzcrank: blitzcrankImg, katarina: katarinaImg,
  twistedfate: twistedfateImg, malphite: malphiteImg, ezreal: ezrealImg, missfortune: missfortuneImg,
  // Batch 2
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
  // Batch 3: allChampions.ts champions
  aatrox: aatroxImg, akali: akaliImg, akshan: akshanImg, ambessa: ambessaImg,
  amumu: amumuImg, aphelios: apheliosImg, aurora: auroraImg, aurelionsol: aurelionsolImg,
  azir: azirImg, bard: bardImg, belveth: belvethImg, braum: braumImg,
  briar: briarImg, camille: camilleImg, cassiopeia: cassiopeiaImg, chogath: chogathImg,
  corki: corkiImg, drmundo: drmundoImg, fiddlesticks: fiddlesticksImg,
  galio: galioImg, gnar: gnarImg, gragas: gragasImg, gwen: gwenImg,
  hwei: hweiImg, illaoi: illaoiImg, ivern: ivernImg, janna: jannaImg,
  jhin: jhinImg, kaisa: kaisaImg, kalista: kalistaImg, karma: karmaImg,
  karthus: karthusImg, kayn: kaynImg, kennen: kennenImg, kindred: kindredImg,
  kled: kledImg, kogmaw: kogmawImg, ksante: ksanteImg, lillia: lilliaImg,
  maokai: maokaiImg, mordekaiser: mordekaiserImg, naafiri: naafiriImg,
  neeko: neekoImg, nilah: nilahImg, nocturne: nocturneImg, nunu: nunuImg,
  olaf: olafImg, poppy: poppyImg, pyke: pykeImg, qiyana: qiyanaImg,
  quinn: quinnImg, rakan: rakanImg, rammus: rammusImg, reksai: reksaiImg,
  rell: rellImg, renata: renataImg, samira: samiraImg, senna: sennaImg,
  seraphine: seraphineImg, sett: settImg, shyvana: shyvanaImg, sion: sionImg,
  skarner: skarnerImg, smolder: smolderImg, sylas: sylasImg, tahmkench: tahmkenchImg,
  taliyah: taliyahImg, taric: taricImg, twitch: twitchImg, vex: vexImg,
  viego: viegoImg, xayah: xayahImg, yone: yoneImg, yuumi: yuumiImg,
  zac: zacImg, zeri: zeriImg, zoe: zoeImg,
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