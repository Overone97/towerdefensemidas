// This file is deprecated - character data is now in characterData.ts
// Kept for reference only

import { CharacterConfig } from '../types';
import { getCharacterStats as _getStats, getCharacterUpgradeCost as _getCost } from './characterData';

export function getUnitStats(config: CharacterConfig, level: number) {
  return _getStats(config, level);
}

export function getUpgradeCost(unit: { config: CharacterConfig; level: number }): number {
  return _getCost(unit.config, unit.level);
}
