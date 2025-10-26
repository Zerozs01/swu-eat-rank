import type { Log, Menu, Taste, Category, Cooking } from '../types/menu';

export interface UserProfile {
  byCooking: Record<Cooking, number>;
  byTaste: Record<Taste, number>;
  byCategory: Record<Category, number>;
  veggiesRatio: number; // 0..1
  total: number;
}

export function buildUserProfile(logs: Array<Log & { menu?: Menu }>): UserProfile {
  const byCooking: Record<string, number> = {};
  const byTaste: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let veggieCount = 0;
  let total = 0;

  for (const l of logs) {
    const m = l.menu;
    if (!m) continue;
    total += l.quantity || 1;
    const cook = m.ingredients?.cooking;
    if (cook) byCooking[cook] = (byCooking[cook] || 0) + (l.quantity || 1);
    if (m.category) byCategory[m.category] = (byCategory[m.category] || 0) + (l.quantity || 1);
    if (Array.isArray(m.tastes)) {
      for (const t of m.tastes) byTaste[t] = (byTaste[t] || 0) + (l.quantity || 1);
    }
    if ((m.ingredients?.veggies?.length || 0) > 0) veggieCount += (l.quantity || 1);
  }

  const typedCooking = byCooking as Record<Cooking, number>;
  const typedTaste = byTaste as Record<Taste, number>;
  const typedCategory = byCategory as Record<Category, number>;

  return {
    byCooking: typedCooking,
    byTaste: typedTaste,
    byCategory: typedCategory,
    veggiesRatio: total ? veggieCount / total : 0,
    total,
  };
}

export function scoreMenuForUser(menu: Menu, profile: UserProfile): number {
  // Base score from healthScore if available; else 50 baseline
  let score = menu.healthScore ?? 50;

  // Encourage balance: if FRY heavy, favor BOIL/STEAM; penalize FRY
  const fryWeight = profile.byCooking['FRY'] || 0;
  const fryRatio = profile.total ? fryWeight / profile.total : 0;
  if (fryRatio > 0.4) {
    if (menu.ingredients?.cooking === 'BOIL' || menu.ingredients?.cooking === 'STEAM') score += 12;
    if (menu.ingredients?.cooking === 'FRY') score -= 10;
  }

  // Veggies low -> boost menus with veggies
  if (profile.veggiesRatio < 0.3) {
    if ((menu.ingredients?.veggies?.length || 0) > 0) score += 10;
  }

  // Sodium/sugar balancing if available
  if (menu.nutrition) {
    const { sodium = 0, sugar = 0, fat = 0 } = menu.nutrition;
    // Light bonus for low sodium/sugar/fat
    if (sodium < 600) score += 2;
    if (sugar < 20) score += 2;
    if (fat < 20) score += 1;
  }

  // Slight novelty bonus: diversify tastes if one dominates >50%
  const tasteEntries = Object.entries(profile.byTaste).sort((a, b) => b[1] - a[1]);
  if (tasteEntries.length) {
    const [topTaste, topCount] = tasteEntries[0];
    const domRatio = profile.total ? (topCount as number) / profile.total : 0;
    if (domRatio > 0.5 && Array.isArray(menu.tastes) && !menu.tastes.includes(topTaste as Taste)) {
      score += 5;
    }
  }

  // Normalize to 0..100
  score = Math.max(0, Math.min(100, score));
  return score;
}

export function getPersonalizedRecommendations(allMenus: Menu[], logs: Log[], days = 7, limit = 9): Menu[] {
  if (!allMenus.length || !logs.length) return [];
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - days * 24 * 60 * 60 * 1000;
  // Join logs with menu, filter by timeframe
  const logsWithMenu = logs
    .filter(l => l.at >= cutoff)
    .map(l => ({ ...l, menu: allMenus.find(m => m.id === l.menuId) }))
    .filter(l => l.menu) as Array<Log & { menu: Menu }>;

  if (!logsWithMenu.length) return [];
  const profile = buildUserProfile(logsWithMenu);

  // Penalize repetition: count recent times each menu was eaten
  const recentCounts = new Map<string, number>();
  for (const l of logsWithMenu) recentCounts.set(l.menuId, (recentCounts.get(l.menuId) || 0) + (l.quantity || 1));

  const scored = allMenus.map(menu => {
    let s = scoreMenuForUser(menu, profile);
    const repeat = recentCounts.get(menu.id) || 0;
    if (repeat > 0) s -= Math.min(15, repeat * 5); // discourage repeats
    return { menu, s };
  });

  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map(x => x.menu);
}

export function getPopularMenus(allMenus: Menu[], logs: Log[], limit = 9): Menu[] {
  if (!allMenus.length || !logs.length) return [];
  const counts = new Map<string, number>();
  for (const l of logs) counts.set(l.menuId, (counts.get(l.menuId) || 0) + (l.quantity || 1));
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const topIds = entries.map(([id]) => id);
  const menuMap = new Map(allMenus.map(m => [m.id, m] as const));
  const result: Menu[] = [];
  for (const id of topIds) {
    const m = menuMap.get(id);
    if (m) result.push(m);
    if (result.length >= limit) break;
  }
  return result;
}
