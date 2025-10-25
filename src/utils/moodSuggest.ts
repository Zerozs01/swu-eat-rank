import type { Menu } from '../types/menu';
import type { Log } from '../types/menu';
import { calcHealthScore } from './healthScore';
import type { MoodConfig, MoodId } from '../constants/moods';
import { MOODS } from '../constants/moods';

// Compute a naive satiety index (0..1) from available fields
export function satietyIndex(menu: Menu): number {
  const cal = menu.nutrition?.cal ?? 0; // kcal per portion
  const proteins = menu.ingredients.proteins?.length ?? 0; // proxy for protein-rich
  const veggies = menu.ingredients.veggies?.length ?? 0; // proxy for fiber
  // Normalize components
  const nCal = Math.min(1, Math.max(0, (cal - 300) / 700)); // 0 at 300kcal, 1 at 1000kcal
  const nProtein = Math.min(1, proteins / 3); // 3+ protein items = 1
  const nVeg = Math.min(1, veggies / 3); // 3+ veggie items = 1
  // Weighted blend
  const idx = 0.2 * nCal + 0.5 * nProtein + 0.3 * nVeg;
  return Math.max(0, Math.min(1, idx));
}

export function buildTrendMap(logs: Log[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    counts[log.menuId] = (counts[log.menuId] ?? 0) + (log.quantity || 1);
  }
  const max = Object.values(counts).reduce((m, v) => Math.max(m, v), 0) || 1;
  const map: Record<string, number> = {};
  for (const [menuId, cnt] of Object.entries(counts)) {
    map[menuId] = cnt / max; // 0..1
  }
  return map;
}

function norm(v: number | undefined, max: number): number {
  if (!v || v <= 0) return 0;
  return Math.min(1, v / max);
}

export function suggestMenusForMood(
  moodId: MoodId,
  menus: Menu[],
  options?: {
    logs?: Log[]; // for trend score
    randomizeCategories?: boolean; // used by 'lazy'
  }
): Menu[] {
  const mood: MoodConfig = MOODS[moodId];
  if (!mood) return [];

  const trendMap = options?.logs ? buildTrendMap(options.logs) : {};

  // Optional random categories for lazy mood
  let categoryWhitelist: Set<Menu['category']> | undefined;
  if (moodId === 'lazy' && options?.randomizeCategories) {
    const categories: Menu['category'][] = ['RICE', 'NOODLE', 'FRIED', 'DESSERT', 'DRINK'];
    // pick 2 distinct categories at random
    const picks = new Set<Menu['category']>();
    while (picks.size < 2) {
      const c = categories[Math.floor(Math.random() * categories.length)];
      picks.add(c);
    }
    categoryWhitelist = picks;
  }

  // Step 1: Filter
  const filtered = menus.filter((m) => {
    if (categoryWhitelist && !categoryWhitelist.has(m.category)) return false;
  if (mood.filters?.excludeCategories && (mood.filters.excludeCategories as Array<Menu['category']>).includes(m.category)) return false;
    if (mood.filters?.includeCooking && m.ingredients.cooking && !mood.filters.includeCooking.includes(m.ingredients.cooking)) return false;
    if (mood.filters?.excludeCooking && m.ingredients.cooking && mood.filters.excludeCooking.includes(m.ingredients.cooking)) return false;
    if (mood.filters?.healthScoreMin !== undefined) {
      const hs = calcHealthScore(m);
      if (hs < mood.filters.healthScoreMin) return false;
    }
    if (mood.filters?.calorieMin !== undefined) {
      const cal = m.nutrition?.cal ?? 0;
      if (cal < mood.filters.calorieMin) return false;
    }
    return true;
  });

  // Step 2: Score and sort
  const scored = filtered.map((m) => {
    const calorie = norm(m.nutrition?.cal, 1000);
    const protein = Math.min(1, (m.ingredients.proteins?.length ?? 0) / 3);
    const sIdx = satietyIndex(m);
    const hScore = calcHealthScore(m) / 100;
    const sodium = norm(m.nutrition?.sodium, 2000);
    const sugar = norm(m.nutrition?.sugar, 50);
    const trend = trendMap[m.id] ?? 0;

    const w = mood.weights || {};
    const composite =
      (w.calorie ?? 0) * calorie +
      (w.protein ?? 0) * protein +
      (w.satiety_index ?? 0) * sIdx +
      (w.health_score ?? 0) * hScore +
      (w.sodium ?? 0) * sodium +
      (w.sugar ?? 0) * sugar +
      (w.trend_score ?? 0) * trend;

    return { m, metrics: { calorie, protein, sIdx, hScore, sodium, sugar, trend }, composite };
  });

  // Sort based on mood.sort with fallback to composite desc
  const sortKeys = mood.sort ?? ['-trend_score', '-health_score'];
  scored.sort((a, b) => {
    for (const key of sortKeys) {
      switch (key) {
        case '-satiety_index':
          if (b.metrics.sIdx !== a.metrics.sIdx) return b.metrics.sIdx - a.metrics.sIdx;
          break;
        case '-protein':
          if (b.metrics.protein !== a.metrics.protein) return b.metrics.protein - a.metrics.protein;
          break;
        case '-calorie':
          if (b.metrics.calorie !== a.metrics.calorie) return b.metrics.calorie - a.metrics.calorie;
          break;
        case '-health_score':
          if (b.metrics.hScore !== a.metrics.hScore) return b.metrics.hScore - a.metrics.hScore;
          break;
        case '+sodium':
          if (a.metrics.sodium !== b.metrics.sodium) return a.metrics.sodium - b.metrics.sodium;
          break;
        case '+sugar':
          if (a.metrics.sugar !== b.metrics.sugar) return a.metrics.sugar - b.metrics.sugar;
          break;
        case '-trend_score':
          if (b.metrics.trend !== a.metrics.trend) return b.metrics.trend - a.metrics.trend;
          break;
        default:
          break;
      }
    }
    // Fallback: composite desc
    return b.composite - a.composite;
  });

  return scored.map((s) => s.m);
}
