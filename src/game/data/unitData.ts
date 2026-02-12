import { UnitConfig } from '../types';

export const UNIT_CONFIGS: UnitConfig[] = [
  {
    id: 'unit_a',
    name: 'Unit A',
    attack: 10,
    attackSpeed: 1.5,
    range: 120,
    cost: 50,
    attackType: 'projectile',
    color: '#4488ff',
    size: 16,
  },
  {
    id: 'unit_b',
    name: 'Unit B',
    attack: 25,
    attackSpeed: 0.7,
    range: 150,
    cost: 100,
    attackType: 'projectile',
    color: '#44ddff',
    size: 18,
  },
  {
    id: 'unit_c',
    name: 'Unit C',
    attack: 5,
    attackSpeed: 3,
    range: 90,
    cost: 75,
    attackType: 'instant',
    color: '#8844ff',
    size: 14,
  },
  {
    id: 'unit_d',
    name: 'Unit D',
    attack: 40,
    attackSpeed: 0.4,
    range: 200,
    cost: 150,
    attackType: 'projectile',
    color: '#44ff88',
    size: 20,
  },
];

export const UPGRADE_COST_MULTIPLIER = 1.5;

export function getUpgradeCost(unit: { config: UnitConfig; level: number }): number {
  return Math.floor(unit.config.cost * UPGRADE_COST_MULTIPLIER * unit.level);
}

export function getUnitStats(config: UnitConfig, level: number) {
  return {
    attack: Math.floor(config.attack * (1 + (level - 1) * 0.3)),
    attackSpeed: config.attackSpeed * (1 + (level - 1) * 0.1),
    range: config.range + (level - 1) * 10,
  };
}
