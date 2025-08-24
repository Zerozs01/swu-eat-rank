import type { Menu } from '../types/menu';

export function calcHealthScore(menu: Menu): number {
  let score = 70; // base score

  // Cooking method penalties
  if (menu.ingredients.cooking === 'FRY') {
    score -= 20;
  }

  // Category penalties
  if (menu.category === 'DESSERT') {
    score -= 15;
  }

  // Nutrition penalties
  if (menu.nutrition) {
    if (menu.nutrition.sugar && menu.nutrition.sugar > 20) {
      score -= 10;
    }
    if (menu.nutrition.sodium && menu.nutrition.sodium > 1200) {
      score -= 10;
    }
  }

  // Health bonuses
  if (menu.ingredients.veggies && menu.ingredients.veggies.length >= 1) {
    score += 5;
  }

  const proteins = menu.ingredients.proteins || [];
  if (proteins.includes('ปลา') || proteins.includes('เต้าหู้')) {
    score += 5;
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  if (score >= 40) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'สุขภาพดีมาก';
  if (score >= 60) return 'สุขภาพดี';
  if (score >= 40) return 'ปานกลาง';
  return 'ควรระวัง';
}
