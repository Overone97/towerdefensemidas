import { describe, it, expect, beforeEach } from 'vitest';
import { WaveManager } from '../game/managers/WaveManager';
import { TOTAL_WAVES } from '../game/data/waveData';

describe('WaveManager', () => {
  let waveManager: WaveManager;

  beforeEach(() => {
    waveManager = new WaveManager();
  });

  describe('Mode endless — getEndlessWaveConfig (via startWave)', () => {
    it('enemyCount est cappé à 80 max en mode endless', () => {
      waveManager.endlessMode = true;

      // On teste plusieurs vagues en mode endless pour trouver le cap
      let maxEnemyCount = 0;
      for (let i = 0; i < 50; i++) {
        const config = waveManager.startWave();
        if (config) {
          maxEnemyCount = Math.max(maxEnemyCount, config.enemyCount);
        }
      }
      expect(maxEnemyCount).toBeLessThanOrEqual(80);
    });

    it('enemyCount scale avec le numéro de vague en mode endless', () => {
      waveManager.endlessMode = true;

      const config1 = waveManager.startWave(); // wave 1
      const count1 = config1?.enemyCount ?? 0;

      // Reset
      waveManager = new WaveManager();
      waveManager.endlessMode = true;
      waveManager.currentWave = 19;
      const config20 = waveManager.startWave(); // wave 20
      const count20 = config20?.enemyCount ?? 0;

      expect(count20).toBeGreaterThan(count1);
    });

    it('spawnInterval décroît avec les vagues en mode endless (jusqu\'au min 250)', () => {
      waveManager.endlessMode = true;
      const config1 = waveManager.startWave();

      waveManager = new WaveManager();
      waveManager.endlessMode = true;
      waveManager.currentWave = 39;
      const config40 = waveManager.startWave();

      expect(config40!.spawnInterval).toBeLessThanOrEqual(config1!.spawnInterval);
      expect(config40!.spawnInterval).toBeGreaterThanOrEqual(250); // min garanti
    });

    it('enemyHpMultiplier augmente avec les vagues en mode endless', () => {
      waveManager.endlessMode = true;
      const config1 = waveManager.startWave();

      waveManager = new WaveManager();
      waveManager.endlessMode = true;
      waveManager.currentWave = 9;
      const config10 = waveManager.startWave();

      expect(config10!.enemyHpMultiplier).toBeGreaterThan(config1!.enemyHpMultiplier);
    });

    it('enemySpeedMultiplier est cappé à 3.0 en mode endless', () => {
      waveManager.endlessMode = true;
      waveManager.currentWave = 999; // vague très élevée
      const config = waveManager.startWave();
      expect(config!.enemySpeedMultiplier).toBeLessThanOrEqual(3.0);
    });

    it('enemyCount min est > 0 dès la vague 1 en mode endless', () => {
      waveManager.endlessMode = true;
      const config = waveManager.startWave();
      expect(config!.enemyCount).toBeGreaterThan(0);
    });
  });

  describe('Mode normal — startWave()', () => {
    it('retourne null après la dernière vague en mode normal', () => {
      waveManager.endlessMode = false;
      waveManager.currentWave = TOTAL_WAVES; // déjà à la limite
      const config = waveManager.startWave();
      expect(config).toBeNull();
    });

    it('retourne une config valide pour la première vague en mode normal', () => {
      waveManager.endlessMode = false;
      const config = waveManager.startWave();
      expect(config).not.toBeNull();
      expect(config!.waveNumber).toBe(1);
      expect(config!.enemyCount).toBeGreaterThan(0);
    });

    it('incrémente currentWave à chaque startWave', () => {
      waveManager.endlessMode = false;
      waveManager.startWave();
      expect(waveManager.currentWave).toBe(1);
      waveManager.startWave();
      expect(waveManager.currentWave).toBe(2);
    });

    it('waveActive passe à true après startWave', () => {
      waveManager.endlessMode = false;
      expect(waveManager.waveActive).toBe(false);
      waveManager.startWave();
      expect(waveManager.waveActive).toBe(true);
    });

    it('spawned est réinitialisé à 0 au début de chaque vague', () => {
      waveManager.endlessMode = false;
      waveManager.spawned = 42; // valeur artificielle
      waveManager.startWave();
      expect(waveManager.spawned).toBe(0);
    });
  });

  describe('isComplete()', () => {
    it('retourne false avant la dernière vague en mode normal', () => {
      waveManager.endlessMode = false;
      waveManager.currentWave = 0;
      expect(waveManager.isComplete()).toBe(false);
    });

    it('retourne false si waveActive est true même à la dernière vague', () => {
      waveManager.endlessMode = false;
      waveManager.currentWave = TOTAL_WAVES;
      waveManager.waveActive = true;
      expect(waveManager.isComplete()).toBe(false);
    });

    it('retourne true quand toutes les vagues sont terminées et waveActive est false', () => {
      waveManager.endlessMode = false;
      waveManager.currentWave = TOTAL_WAVES;
      waveManager.waveActive = false;
      expect(waveManager.isComplete()).toBe(true);
    });

    it('retourne toujours false en mode endless', () => {
      waveManager.endlessMode = true;
      waveManager.currentWave = 999;
      waveManager.waveActive = false;
      expect(waveManager.isComplete()).toBe(false);
    });
  });

  describe('Propriétés initiales', () => {
    it('currentWave démarre à 0', () => {
      expect(waveManager.currentWave).toBe(0);
    });

    it('endlessMode démarre à false', () => {
      expect(waveManager.endlessMode).toBe(false);
    });

    it('mapId démarre à plains', () => {
      expect(waveManager.mapId).toBe('plains');
    });

    it('totalWaves correspond à TOTAL_WAVES', () => {
      expect(waveManager.totalWaves).toBe(TOTAL_WAVES);
    });
  });

  describe('Maps extrêmes — multiplicateurs', () => {
    it('une extreme map augmente enemyHpMultiplier × 2.4', () => {
      // Map normale
      waveManager.endlessMode = false;
      const configNormal = waveManager.startWave();
      const normalHp = configNormal!.enemyHpMultiplier;

      // Map extrême
      const extreme = new WaveManager();
      extreme.mapId = 'void_rift';
      const configExtreme = extreme.startWave();
      const extremeHp = configExtreme!.enemyHpMultiplier;

      expect(extremeHp).toBeCloseTo(normalHp * 2.4, 1);
    });

    it('une extreme map réduit spawnInterval × 0.85 (min 120)', () => {
      const extreme = new WaveManager();
      extreme.mapId = 'noxus_siege';
      const config = extreme.startWave();
      expect(config!.spawnInterval).toBeGreaterThanOrEqual(120);
    });
  });
});
