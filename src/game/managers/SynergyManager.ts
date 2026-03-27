import { PlacedUnit, SynergyBonus, ActiveSynergy } from '../types';
import { CHARACTER_ELEMENTS, PAIR_SYNERGIES, ELEMENT_SYNERGIES, COMPOSITION_SYNERGIES, Element } from '../data/synergyData';

function mergeBonuses(a: SynergyBonus, b: SynergyBonus): SynergyBonus {
  return {
    attackMult: (a.attackMult || 1) * (b.attackMult || 1),
    speedMult: (a.speedMult || 1) * (b.speedMult || 1),
    rangeMult: (a.rangeMult || 1) * (b.rangeMult || 1),
    extraHp: (a.extraHp || 0) + (b.extraHp || 0),
    dotMult: (a.dotMult || 1) * (b.dotMult || 1),
    slowMult: (a.slowMult || 1) * (b.slowMult || 1),
  };
}

const EMPTY_BONUS: SynergyBonus = { attackMult: 1, speedMult: 1, rangeMult: 1, extraHp: 0, dotMult: 1, slowMult: 1 };

export function computeSynergies(units: PlacedUnit[]): {
  activeSynergies: ActiveSynergy[];
  unitBonuses: Map<number, SynergyBonus>;
  globalBonus: SynergyBonus;
} {
  const activeSynergies: ActiveSynergy[] = [];
  let globalBonus: SynergyBonus = { ...EMPTY_BONUS };
  const unitBonusMap = new Map<number, SynergyBonus>();

  const charIds = new Set(units.map(u => u.config.id));
  const charIdToUnits = new Map<string, PlacedUnit[]>();
  for (const u of units) {
    const list = charIdToUnits.get(u.config.id) || [];
    list.push(u);
    charIdToUnits.set(u.config.id, list);
  }

  // Pair synergies
  for (const pair of PAIR_SYNERGIES) {
    if (charIds.has(pair.char1Id) && charIds.has(pair.char2Id)) {
      activeSynergies.push({ name: pair.name, description: pair.description, bonus: pair.bonus });
      // Apply to both characters' units
      const affected = [...(charIdToUnits.get(pair.char1Id) || []), ...(charIdToUnits.get(pair.char2Id) || [])];
      for (const u of affected) {
        const existing = unitBonusMap.get(u.id) || { ...EMPTY_BONUS };
        unitBonusMap.set(u.id, mergeBonuses(existing, pair.bonus));
      }
      // Extra HP is global
      if (pair.bonus.extraHp) {
        globalBonus = mergeBonuses(globalBonus, { extraHp: pair.bonus.extraHp });
      }
    }
  }

  // Composition synergies (cross-build expression)
  const uniqueElements = new Set<Element>();
  for (const u of units) {
    const el = CHARACTER_ELEMENTS[u.config.id];
    if (el) uniqueElements.add(el);
  }

  for (const comp of COMPOSITION_SYNERGIES) {
    const charsOk = !comp.requiredCharIds || comp.requiredCharIds.every(id => charIds.has(id));
    const elementsOk = !comp.requiredUniqueElements || uniqueElements.size >= comp.requiredUniqueElements;
    if (!charsOk || !elementsOk) continue;

    activeSynergies.push({ name: comp.name, description: comp.description, bonus: comp.bonus });
    for (const u of units) {
      const existing = unitBonusMap.get(u.id) || { ...EMPTY_BONUS };
      unitBonusMap.set(u.id, mergeBonuses(existing, comp.bonus));
    }
    if (comp.bonus.extraHp) {
      globalBonus = mergeBonuses(globalBonus, { extraHp: comp.bonus.extraHp });
    }
  }

  // Element synergies
  const elementCounts = new Map<Element, number>();
  for (const u of units) {
    const el = CHARACTER_ELEMENTS[u.config.id];
    if (el) elementCounts.set(el, (elementCounts.get(el) || 0) + 1);
  }

  for (const elSynergy of ELEMENT_SYNERGIES) {
    const count = elementCounts.get(elSynergy.element) || 0;
    // Find the highest threshold met
    const sortedThresholds = [...elSynergy.thresholds].sort((a, b) => a.count - b.count);
    let bestThreshold = null;
    for (const t of sortedThresholds) {
      if (count >= t.count) bestThreshold = t;
    }
    if (bestThreshold) {
      activeSynergies.push({ name: bestThreshold.name, description: `${elSynergy.element} (${count}): ${bestThreshold.description}`, bonus: bestThreshold.bonus });
      // Apply to all units of that element
      for (const u of units) {
        if (CHARACTER_ELEMENTS[u.config.id] === elSynergy.element) {
          const existing = unitBonusMap.get(u.id) || { ...EMPTY_BONUS };
          unitBonusMap.set(u.id, mergeBonuses(existing, bestThreshold.bonus));
        }
      }
    }
  }

  return { activeSynergies, unitBonuses: unitBonusMap, globalBonus };
}
