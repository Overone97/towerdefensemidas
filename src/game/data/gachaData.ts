export const GACHA_BASE_COST = 150;
export const GACHA_COST_INCREMENT = 40;

export function getGachaCost(totalSummons: number): number {
  return GACHA_BASE_COST + totalSummons * GACHA_COST_INCREMENT;
}
