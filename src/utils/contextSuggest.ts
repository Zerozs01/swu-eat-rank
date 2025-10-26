import type { Menu } from '../types/menu';
import { calcHealthScore } from './healthScore';
import { satietyIndex } from './moodSuggest';

export type EnergyLevel = 'snack' | 'medium' | 'full';

export function filterByEnergy(menus: Menu[], level: EnergyLevel): Menu[] {
  return menus.filter((m) => {
    const cal = m.nutrition?.cal ?? 0;
    // Relax constraints to focus on energy only so new menus are not excluded by protein/satiety heuristics
    switch (level) {
      case 'snack':
        // Light items: kcal < 250 (any category)
        return cal > 0 && cal < 250;
      case 'medium':
        // 250–500 kcal
        return cal >= 250 && cal <= 500;
      case 'full':
        // Full meal: >500 kcal
        return cal > 500;
      default:
        return true;
    }
  });
}

export function filterByClean(menus: Menu[], level: 1 | 2 | 3): Menu[] {
  return menus.filter((m) => {
    const method = m.ingredients.cooking;
    const sodium = m.nutrition?.sodium ?? 0;
    const proteins = m.ingredients.proteins || [];
    const health = calcHealthScore(m);
    if (level === 1) {
      // no deep fry, decent health score
      return method !== 'FRY' && health >= 65;
    }
    if (level === 2) {
      // lean proteins, no fry, sodium cap
      const lean = proteins.some((p) => ['ไก่', 'ปลา', 'เต้าหู้'].some(k => p.includes(k)));
      return (method === 'BOIL' || method === 'STEAM' || method === 'STIR') && lean && sodium <= 500;
    }
    // level 3: plant-based focus, gentle cooking, lower sodium
    const plant = proteins.some((p) => ['เต้าหู้', 'ถั่ว'].some(k => p.includes(k)));
    return (method === 'BOIL' || method === 'STEAM') && plant && sodium <= 300;
  });
}

export function filterByBudget(menus: Menu[], min?: number, max?: number): Menu[] {
  return menus.filter((m) => {
    if (typeof m.price !== 'number') return false; // only priced items
    if (typeof min === 'number' && m.price < min) return false;
    if (typeof max === 'number' && m.price > max) return false;
    return true;
  });
}

export function suggestByContext(
  menus: Menu[],
  opts: { energy?: EnergyLevel | null; cleanLevel?: 1 | 2 | 3 | null; priceMin?: number | null; priceMax?: number | null }
): Menu[] {
  let list = menus.slice();
  if (opts.energy) list = filterByEnergy(list, opts.energy);
  if (opts.cleanLevel) list = filterByClean(list, opts.cleanLevel);
  if (opts.priceMin != null || opts.priceMax != null) list = filterByBudget(list, opts.priceMin ?? undefined, opts.priceMax ?? undefined);

  // Sort: prioritize health then satiety, and for budget sort by price asc
  list.sort((a, b) => {
    const aHealth = calcHealthScore(a);
    const bHealth = calcHealthScore(b);
    const aSat = satietyIndex(a);
    const bSat = satietyIndex(b);
    // If both priced and price filter active, sort by price then health
    const priceActive = opts.priceMin != null || opts.priceMax != null;
    if (priceActive && typeof a.price === 'number' && typeof b.price === 'number' && a.price !== b.price) {
      return a.price - b.price;
    }
    if (bHealth !== aHealth) return bHealth - aHealth;
    if (bSat !== aSat) return bSat - aSat;
    return 0;
  });

  return list;
}
