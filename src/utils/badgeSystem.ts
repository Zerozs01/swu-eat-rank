import type { Badge, BadgeType, BadgeLevel, UserStats, LogWithMenu, Menu } from '../types/menu';

// Badge definitions with Thai names and descriptions
export const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'isEarned' | 'earnedAt' | 'progress'>> = {
  // Streak Badges
  'streak_3': {
    id: 'streak_3',
    type: 'streak_3',
    level: 'bronze',
    name: 'เริ่มต้นสร้างนิสัย',
    description: 'บันทึกอาหารติดต่อกัน 3 วัน',
    icon: '🌱',
    color: 'green',
    rarity: 'common'
  },
  'streak_7': {
    id: 'streak_7',
    type: 'streak_7',
    level: 'silver',
    name: 'สัปดาห์แห่งการสร้างนิสัย',
    description: 'บันทึกอาหารติดต่อกัน 7 วัน',
    icon: '🌿',
    color: 'green',
    rarity: 'common'
  },
  'streak_14': {
    id: 'streak_14',
    type: 'streak_14',
    level: 'gold',
    name: 'สองสัปดาห์มั่นคง',
    description: 'บันทึกอาหารติดต่อกัน 14 วัน',
    icon: '🌳',
    color: 'green',
    rarity: 'rare'
  },
  'streak_30': {
    id: 'streak_30',
    type: 'streak_30',
    level: 'platinum',
    name: 'เดือนแห่งความมั่นคง',
    description: 'บันทึกอาหารติดต่อกัน 30 วัน',
    icon: '🏆',
    color: 'purple',
    rarity: 'epic'
  },

  // Meal Count Badges
  'meals_10': {
    id: 'meals_10',
    type: 'meals_10',
    level: 'bronze',
    name: 'เริ่มต้นบันทึก',
    description: 'บันทึกมื้ออาหารครบ 10 มื้อ',
    icon: '📝',
    color: 'blue',
    rarity: 'common'
  },
  'meals_25': {
    id: 'meals_25',
    type: 'meals_25',
    level: 'silver',
    name: 'ผู้บันทึกมืออาชีพ',
    description: 'บันทึกมื้ออาหารครบ 25 มื้อ',
    icon: '📊',
    color: 'blue',
    rarity: 'common'
  },
  'meals_50': {
    id: 'meals_50',
    type: 'meals_50',
    level: 'gold',
    name: 'นักบันทึกระดับสูง',
    description: 'บันทึกมื้ออาหารครบ 50 มื้อ',
    icon: '📈',
    color: 'blue',
    rarity: 'rare'
  },
  'meals_100': {
    id: 'meals_100',
    type: 'meals_100',
    level: 'platinum',
    name: 'ผู้เชี่ยวชาญด้านการบันทึก',
    description: 'บันทึกมื้ออาหารครบ 100 มื้อ',
    icon: '📋',
    color: 'purple',
    rarity: 'epic'
  },

  // Health Score Badges
  'healthy_week': {
    id: 'healthy_week',
    type: 'healthy_week',
    level: 'silver',
    name: 'สัปดาห์สุขภาพดี',
    description: 'คะแนนสุขภาพเฉลี่ย ≥70 ใน 7 วัน',
    icon: '💚',
    color: 'green',
    rarity: 'common'
  },
  'healthy_month': {
    id: 'healthy_month',
    type: 'healthy_month',
    level: 'gold',
    name: 'เดือนสุขภาพดี',
    description: 'คะแนนสุขภาพเฉลี่ย ≥70 ใน 30 วัน',
    icon: '💚',
    color: 'green',
    rarity: 'rare'
  },
  'healthy_average_80': {
    id: 'healthy_average_80',
    type: 'healthy_average_80',
    level: 'gold',
    name: 'สุขภาพดีเยี่ยม',
    description: 'คะแนนสุขภาพเฉลี่ยทั้งหมด ≥80',
    icon: '💚',
    color: 'green',
    rarity: 'rare'
  },

  // Nutrition Badges
  'veggie_lover': {
    id: 'veggie_lover',
    type: 'veggie_lover',
    level: 'silver',
    name: 'คนรักผัก',
    description: 'ทานผักในมื้ออาหาร 15 ครั้ง',
    icon: '🥗',
    color: 'green',
    rarity: 'common'
  },
  'protein_champion': {
    id: 'protein_champion',
    type: 'protein_champion',
    level: 'silver',
    name: 'แชมป์โปรตีน',
    description: 'ทานโปรตีนครบ 20 มื้อ',
    icon: '🥩',
    color: 'red',
    rarity: 'common'
  },
  'low_sugar': {
    id: 'low_sugar',
    type: 'low_sugar',
    level: 'gold',
    name: 'ควบคุมน้ำตาล',
    description: 'ทานอาหารต่ำน้ำตาล 10 มื้อ',
    icon: '🍯',
    color: 'yellow',
    rarity: 'rare'
  },
  'balanced_diet': {
    id: 'balanced_diet',
    type: 'balanced_diet',
    level: 'platinum',
    name: 'สมดุลทุกสารอาหาร',
    description: 'มีโปรตีนและผักในมื้อเดียวกัน 10 ครั้ง',
    icon: '⚖️',
    color: 'purple',
    rarity: 'epic'
  },

  // Social Badges
  'first_share': {
    id: 'first_share',
    type: 'first_share',
    level: 'bronze',
    name: 'เริ่มแชร์ประสบการณ์',
    description: 'ทำการบันทึกเป็นสาธารณะครั้งแรก',
    icon: '🌍',
    color: 'blue',
    rarity: 'common'
  },
  'popular_meals': {
    id: 'popular_meals',
    type: 'popular_meals',
    level: 'gold',
    name: 'มื้ออาหารยอดนิยม',
    description: 'มีคนดูบันทึกของคุณมากกว่า 100 ครั้ง',
    icon: '⭐',
    color: 'yellow',
    rarity: 'rare'
  },
  'helpful_reviewer': {
    id: 'helpful_reviewer',
    type: 'helpful_reviewer',
    level: 'silver',
    name: 'ผู้ให้คำปรึกษา',
    description: 'มีคนกดถูกใจบันทึกของคุณมากกว่า 50 ครั้ง',
    icon: '👍',
    color: 'green',
    rarity: 'common'
  },

  // Special Badges
  'early_adopter': {
    id: 'early_adopter',
    type: 'early_adopter',
    level: 'gold',
    name: 'ผู้ริเริ่ม',
    description: 'เข้าร่วมในช่วงแรกของระบบ',
    icon: '🚀',
    color: 'purple',
    rarity: 'legendary'
  },
  'consistent_logger': {
    id: 'consistent_logger',
    type: 'consistent_logger',
    level: 'silver',
    name: 'ความสม่ำเสมอ',
    description: 'บันทึกอาหารมากกว่า 5 วันต่อสัปดาห์เป็นเวลา 4 สัปดาห์',
    icon: '📅',
    color: 'blue',
    rarity: 'rare'
  },
  'health_improver': {
    id: 'health_improver',
    type: 'health_improver',
    level: 'gold',
    name: 'ผู้พัฒนาสุขภาพ',
    description: 'คะแนนสุขภาพดีขึ้น 20 คะแนนจากเดิม',
    icon: '📈',
    color: 'green',
    rarity: 'epic'
  }
};

// Calculate user statistics from logs
export function calculateUserStats(logs: LogWithMenu[]): UserStats {
  const sortedLogs = logs.sort((a, b) => b.at - a.at);
  const totalLogs = logs.length;

  // Calculate health scores
  const healthScores = logs
    .filter(log => log.menu?.healthScore)
    .map(log => log.menu!.healthScore!);

  const averageHealthScore = healthScores.length > 0
    ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
    : 0;

  // Calculate streaks
  const currentStreak = calculateCurrentStreak(sortedLogs);
  const longestStreak = calculateLongestStreak(sortedLogs);

  // Calculate budget
  const totalBudget = logs.reduce((sum, log) => sum + (log.menu?.price || 0) * log.quantity, 0);

  // Count healthy days (score ≥70)
  const healthyDays = logs.filter(log => log.menu?.healthScore && log.menu.healthScore >= 70).length;

  // Count veggie meals (has veggies)
  const veggieMeals = logs.filter(log =>
    log.menu?.ingredients?.veggies && log.menu.ingredients.veggies.length > 0
  ).length;

  // Count protein meals (has proteins)
  const proteinMeals = logs.filter(log =>
    log.menu?.ingredients?.proteins && log.menu.ingredients.proteins.length > 0
  ).length;

  // Count public vs private logs
  const publicLogs = logs.filter(log => log.visibility === 'public').length;
  const privateLogs = logs.filter(log => log.visibility === 'private').length;

  // Calculate weekly and monthly logs
  const now = Date.now();
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

  const weeklyLogs = logs.filter(log => log.at >= weekAgo).length;
  const monthlyLogs = logs.filter(log => log.at >= monthAgo).length;

  return {
    totalLogs,
    averageHealthScore,
    currentStreak,
    longestStreak,
    totalBudget,
    healthyDays,
    veggieMeals,
    proteinMeals,
    publicLogs,
    privateLogs,
    weeklyLogs,
    monthlyLogs
  };
}

// Calculate current streak
function calculateCurrentStreak(logs: LogWithMenu[]): number {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => b.at - a.at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  // Group logs by date
  const logsByDate = new Map<string, LogWithMenu[]>();
  sortedLogs.forEach(log => {
    const logDate = new Date(log.at);
    logDate.setHours(0, 0, 0, 0);
    const dateKey = logDate.getTime().toString();
    if (!logsByDate.has(dateKey)) {
      logsByDate.set(dateKey, []);
    }
    logsByDate.get(dateKey)!.push(log);
  });

  // Check consecutive days from today backwards
  while (true) {
    const dateKey = currentDate.getTime().toString();
    const dayLogs = logsByDate.get(dateKey);

    if (dayLogs && dayLogs.length > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If it's not today, allow one day gap
      if (streak === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

// Calculate longest streak
function calculateLongestStreak(logs: LogWithMenu[]): number {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => a.at - b.at);

  // Group logs by date
  const logsByDate = new Map<string, LogWithMenu[]>();
  sortedLogs.forEach(log => {
    const logDate = new Date(log.at);
    logDate.setHours(0, 0, 0, 0);
    const dateKey = logDate.getTime().toString();
    if (!logsByDate.has(dateKey)) {
      logsByDate.set(dateKey, []);
    }
    logsByDate.get(dateKey)!.push(log);
  });

  const sortedDates = Array.from(logsByDate.keys()).map(Number).sort((a, b) => a - b);

  let longestStreak = 0;
  let currentStreak = 0;
  let expectedDate: number | null = null;

  for (const dateKey of sortedDates) {
    if (expectedDate === null || dateKey === expectedDate) {
      currentStreak++;
      const nextDay: Date = new Date(dateKey);
      nextDay.setDate(nextDay.getDate() + 1);
      expectedDate = nextDay.getTime();
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
      const nextDay: Date = new Date(dateKey);
      nextDay.setDate(nextDay.getDate() + 1);
      expectedDate = nextDay.getTime();
    }
  }

  return Math.max(longestStreak, currentStreak);
}

// Enhanced AI-powered badge eligibility checking
export function checkBadgeEligibility(stats: UserStats, logs: LogWithMenu[]): Badge[] {
  const badges: Badge[] = [];
  const now = Date.now();

  // Original badge calculations
  badges.push(...calculateOriginalBadges(stats, logs, now));

  
  return badges;
}

// Original badge calculation (kept for compatibility)
function calculateOriginalBadges(stats: UserStats, logs: LogWithMenu[], now: number): Badge[] {
  const badges: Badge[] = [];

  // Streak badges
  if (stats.currentStreak >= 3) {
    badges.push({ ...BADGE_DEFINITIONS.streak_3, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.streak_3, isEarned: false, progress: (stats.currentStreak / 3) * 100 });
  }

  if (stats.currentStreak >= 7) {
    badges.push({ ...BADGE_DEFINITIONS.streak_7, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.streak_7, isEarned: false, progress: (stats.currentStreak / 7) * 100 });
  }

  if (stats.currentStreak >= 14) {
    badges.push({ ...BADGE_DEFINITIONS.streak_14, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.streak_14, isEarned: false, progress: (stats.currentStreak / 14) * 100 });
  }

  if (stats.currentStreak >= 30) {
    badges.push({ ...BADGE_DEFINITIONS.streak_30, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.streak_30, isEarned: false, progress: (stats.currentStreak / 30) * 100 });
  }

  // Meal count badges
  const mealBadges = [
    { type: 'meals_10' as const, count: 10 },
    { type: 'meals_25' as const, count: 25 },
    { type: 'meals_50' as const, count: 50 },
    { type: 'meals_100' as const, count: 100 }
  ];

  mealBadges.forEach(badge => {
    if (stats.totalLogs >= badge.count) {
      badges.push({ ...BADGE_DEFINITIONS[badge.type], isEarned: true, earnedAt: now, progress: 100 });
    } else {
      badges.push({
        ...BADGE_DEFINITIONS[badge.type],
        isEarned: false,
        progress: (stats.totalLogs / badge.count) * 100
      });
    }
  });

  // Health score badges
  if (stats.averageHealthScore >= 70) {
    badges.push({ ...BADGE_DEFINITIONS.healthy_average_80, isEarned: false, progress: (stats.averageHealthScore / 80) * 100 });
  }

  // Check weekly health
  const weeklyHealthScore = calculateWeeklyAverageHealth(logs);
  if (weeklyHealthScore >= 70) {
    badges.push({ ...BADGE_DEFINITIONS.healthy_week, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.healthy_week, isEarned: false, progress: (weeklyHealthScore / 70) * 100 });
  }

  // Nutrition badges
  if (stats.veggieMeals >= 15) {
    badges.push({ ...BADGE_DEFINITIONS.veggie_lover, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.veggie_lover, isEarned: false, progress: (stats.veggieMeals / 15) * 100 });
  }

  if (stats.proteinMeals >= 20) {
    badges.push({ ...BADGE_DEFINITIONS.protein_champion, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.protein_champion, isEarned: false, progress: (stats.proteinMeals / 20) * 100 });
  }

  // Check for balanced diet (meals with both veggies and proteins)
  const balancedMeals = logs.filter(log =>
    log.menu?.ingredients?.veggies &&
    log.menu?.ingredients?.veggies.length > 0 &&
    log.menu?.ingredients?.proteins &&
    log.menu?.ingredients?.proteins.length > 0
  ).length;

  if (balancedMeals >= 10) {
    badges.push({ ...BADGE_DEFINITIONS.balanced_diet, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.balanced_diet, isEarned: false, progress: (balancedMeals / 10) * 100 });
  }

  // Social badges
  if (stats.publicLogs >= 1) {
    badges.push({ ...BADGE_DEFINITIONS.first_share, isEarned: true, earnedAt: now, progress: 100 });
  } else {
    badges.push({ ...BADGE_DEFINITIONS.first_share, isEarned: false, progress: 0 });
  }

  // Special badges
  const createdAt = logs[0]?.at || now;
  const earlyAdopterCutoff = new Date('2025-01-01').getTime();
  if (createdAt <= earlyAdopterCutoff) {
    badges.push({ ...BADGE_DEFINITIONS.early_adopter, isEarned: true, earnedAt: now, progress: 100 });
  }

  return badges;
}

// Calculate weekly average health score
function calculateWeeklyAverageHealth(logs: LogWithMenu[]): number {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const weeklyLogs = logs.filter(log => log.at >= oneWeekAgo && log.menu?.healthScore);

  if (weeklyLogs.length === 0) return 0;

  const totalScore = weeklyLogs.reduce((sum, log) => sum + log.menu!.healthScore!, 0);
  return totalScore / weeklyLogs.length;
}

// Get badges grouped by category
export function getBadgesByCategory(badges: Badge[]) {
  return {
    streaks: badges.filter(b => b.type.includes('streak')),
    meals: badges.filter(b => b.type.includes('meals')),
    health: badges.filter(b => b.type.includes('healthy') || b.type.includes('health')),
    nutrition: badges.filter(b => ['veggie_lover', 'protein_champion', 'low_sugar', 'balanced_diet'].includes(b.type)),
    social: badges.filter(b => b.type.includes('share') || b.type.includes('popular') || b.type.includes('helpful')),
    special: badges.filter(b => ['early_adopter', 'consistent_logger', 'health_improver'].includes(b.type))
  };
}

// Sort badges by rarity and earned status
export function sortBadges(badges: Badge[]): Badge[] {
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

  return badges.sort((a, b) => {
    // First sort by earned status (earned first)
    if (a.isEarned !== b.isEarned) {
      return b.isEarned ? 1 : -1;
    }

    // Then sort by rarity
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    // Finally sort by earned date (newer first)
    if (a.earnedAt && b.earnedAt) {
      return b.earnedAt - a.earnedAt;
    }

    return 0;
  });
}

// Simple achievement combinations
export function checkAchievementCombinations(badges: Badge[]) {
  const earnedBadgeIds = badges.filter(badge => badge.isEarned).map(badge => badge.id);
  const combinations = [];

  // Health Warrior - combine nutrition badges
  if (earnedBadgeIds.includes('veggie_lover') &&
      earnedBadgeIds.includes('protein_champion') &&
      earnedBadgeIds.includes('balanced_diet') &&
      earnedBadgeIds.includes('healthy_week')) {
    combinations.push({
      id: 'health_warrior',
      requiredBadges: ['veggie_lover', 'protein_champion', 'balanced_diet', 'healthy_week'],
      reward: {
        badge: {
          id: 'health_warrior',
          type: 'health_warrior' as BadgeType,
          level: 'platinum',
          name: 'นักรบสุขภาพ',
          description: 'เชี่ยวชาญทุกด้านของการกินอาหารที่ดีต่อสุขภาพ',
          icon: '⚔️',
          color: 'purple',
          isEarned: true,
          earnedAt: Date.now(),
          progress: 100,
          rarity: 'legendary'
        },
        points: 1000,
        title: 'ผู้เชี่ยวชาญด้านสุขภาพ'
      },
      isUnlocked: true,
      unlockedAt: Date.now()
    });
  }

  return combinations;
}

// Simple behavior insights
export function generateBehaviorInsights(logs: LogWithMenu[], userStats: UserStats): string[] {
  const insights: string[] = [];

  // Health consciousness insights
  if (userStats.averageHealthScore >= 80) {
    insights.push('🌟 คุณเป็นคนที่ใส่ใจเรื่องสุขภาพมาก! คะแนนสุขภาพของคุณสูงกว่าค่าเฉลี่ย');
  } else if (userStats.averageHealthScore < 50) {
    insights.push('💡 ลองเพิ่มผักและเลือกวิธีการปรุงที่ดีกว่าเพื่อสุขภาพที่ดีขึ้น');
  }

  // Consistency insights
  if (userStats.currentStreak >= 7) {
    insights.push('📅 คุณมีความสม่ำเสมอสูงมาก! การกินอย่างสม่ำเสมอช่วยเสริมสุขภาพ');
  } else if (userStats.currentStreak < 3) {
    insights.push('⏰ ลองตั้งเวลาทานอาหารประจำเพื่อสร้างความสม่ำเสมอ');
  }

  // Improvement insights
  if (userStats.weeklyLogs >= 7) {
    insights.push('📈 คุณบันทึกอาหารสม่ำเสมอ! การบันทึกช่วยให้เห็นพัฒนาการของสุขภาพ');
  } else if (userStats.weeklyLogs < 3) {
    insights.push('📉 ลองบันทึกอาหารบ่อยขึ้นเพื่อติดตามสุขภาพของคุณ');
  }

  return insights;
}

// Caching system for performance optimization
export class BadgeCalculationCache {
  private static cache = new Map<string, { result: any; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result as T;
    }
    return null;
  }

  static setCachedResult<T>(key: string, result: T): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  static generateCacheKey(userId: string, logsHash: string): string {
    return `${userId}_${logsHash}`;
  }

  static calculateLogsHash(logs: LogWithMenu[]): string {
    // Simple hash of recent logs for cache invalidation
    const recentLogs = logs.slice(-20); // Last 20 logs
    return recentLogs.map(log => `${log.id}_${log.at}`).join('|');
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Optimized badge calculation with caching
export function calculateUserStatsOptimized(logs: LogWithMenu[]): UserStats {
  const logsHash = BadgeCalculationCache.calculateLogsHash(logs);
  const cacheKey = BadgeCalculationCache.generateCacheKey('stats', logsHash);

  const cached = BadgeCalculationCache.getCachedResult<UserStats>(cacheKey);
  if (cached) {
    return cached;
  }

  const stats = calculateUserStats(logs); // Original function
  BadgeCalculationCache.setCachedResult(cacheKey, stats);
  return stats;
}