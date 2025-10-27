export type Location = 'ENG_CANTEEN' | 'HEALTH_CANTEEN' | 'DORM_CANTEEN';
export type Category = 'RICE' | 'NOODLE' | 'FRIED' | 'DESSERT' | 'DRINK';
export type Taste = 'SWEET' | 'OILY' | 'SPICY' | 'SOUR' | 'BLAND' | 'SALTY';
export type Cooking = 'FRY' | 'BOIL' | 'STEAM' | 'STIR';

export interface Menu {
  id: string;
  name: string;
  vendor: string;
  location: Location;
  category: Category;
  tastes: Taste[];
  imageUrl?: string;    // public download URL for display
  imagePath?: string;   // storage path for delete/maintenance
  price?: number;       // THB, whole number or decimal
  ingredients: {
    veggies?: string[];
    proteins?: string[];
    cooking?: Cooking;
  };
  nutrition?: {
    cal?: number;
    fat?: number;
    sugar?: number;
    sodium?: number;
  };
  healthScore?: number;
  updatedAt: number;
}

export interface Log {
  id: string;
  userId: string;
  menuId: string;
  faculty: string; // ตัวอักษรไทยได้ เช่น "วิศวะ"
  visibility: 'public' | 'private';
  quantity: number; // จำนวนที่สั่ง
  at: number; // timestamp
}

export interface LogWithMenu extends Log {
  menu?: Menu; // Menu data attached to log
}

export type BadgeType =
  // Streak Badges
  | 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30'
  // Meal Count Badges
  | 'meals_10' | 'meals_25' | 'meals_50' | 'meals_100'
  // Health Score Badges
  | 'healthy_week' | 'healthy_month' | 'healthy_average_80'
  // Nutrition Badges
  | 'veggie_lover' | 'protein_champion' | 'low_sugar' | 'balanced_diet'
  // Social Badges
  | 'first_share' | 'popular_meals' | 'helpful_reviewer'
  // Special Badges
  | 'early_adopter' | 'consistent_logger' | 'health_improver'
  // AI-Powered Time-based badges
  | 'morning_person' | 'night_owl' | 'lunch_regular' | 'weekend_warrior'
  // AI-Powered Adaptive badges
  | 'adaptive_streak_1' | 'adaptive_streak_2' | 'adaptive_streak_3' | 'adaptive_streak_4'
  | 'health_improver' | 'consistency_master' | 'exploration_expert'
  // AI-Powered Contextual badges
  | 'canteen_explorer' | 'location_master' | 'budget_saver' | 'healthy_location_eng' | 'healthy_location_health' | 'healthy_location_dorm'
  // AI-Powered Achievement combinations
  | 'health_warrior' | 'consistency_master' | 'balanced_diet_master';

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: BadgeType;
  type: BadgeType;
  level: BadgeLevel;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: number;
  progress?: number; // 0-100 for progress tracking
  isEarned: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  totalLogs: number;
  averageHealthScore: number;
  currentStreak: number;
  longestStreak: number;
  totalBudget: number;
  healthyDays: number;
  veggieMeals: number;
  proteinMeals: number;
  publicLogs: number;
  privateLogs: number;
  weeklyLogs: number;
  monthlyLogs: number;
}

export interface HealthGoals {
  targetHealthScore?: number;
  targetWeeklyLogs?: number;
  targetStreak?: number;
  targetVeggieMeals?: number;
}

// AI-powered user behavior analysis
export interface UserBehaviorProfile {
  eatingPatterns: {
    preferredMealTimes: number[]; // Hours when user typically eats
    favoriteCategories: Category[];
    healthConsciousness: number; // 0-1 scale
    consistencyScore: number; // Based on logging patterns
    explorationTendency: number; // How often user tries new things
  };
  improvementTrajectory: {
    healthScoreTrend: 'improving' | 'stable' | 'declining';
    streakVolatility: number; // How streaks start/end
    motivationPatterns: string[]; // What keeps user engaged
  };
  contextualPatterns: {
    locationPreferences: Map<Location, number>;
    budgetPatterns: {
      averageDaily: number;
      variance: number;
      savingsOpportunities: number;
    };
    socialInfluence: {
      sharesPerWeek: number;
      communityEngagement: number;
    };
  };
}

// Enhanced badge types for AI-powered system
export type AIBadgeType =
  // Time-based badges
  | 'morning_person' | 'night_owl' | 'lunch_regularity' | 'weekend_warrior'
  // Adaptive badges
  | 'adaptive_streak_1' | 'adaptive_streak_2' | 'adaptive_streak_3' | 'adaptive_streak_4'
  | 'health_improver' | 'consistency_master' | 'exploration_expert'
  // Contextual badges
  | 'canteen_explorer' | 'location_master' | 'budget_saver' | 'health_conscious_location'
  // Seasonal badges
  | 'summer_salad_lover' | 'winter_soup_master' | 'rainy_day_comfort'
  // Challenge badges
  | 'veggie_week_challenge' | 'protein_power_week' | 'zero_sugar_day'
  // Social badges
  | 'trendsetter' | 'helper' | 'community_leader' | 'team_player'
  // Achievement combinations
  | 'health_warrior' | 'consistency_legend' | 'balanced_diet_master';

export interface AdaptiveThresholds {
  streak: number;
  meals: number;
  healthScore: number;
  veggieMeals: number;
  proteinMeals: number;
  budgetTarget: number;
}

export interface BadgeCombination {
  id: string;
  requiredBadges: string[];
  reward: {
    badge: Omit<Badge, 'isEarned' | 'earnedAt' | 'progress'>;
    points: number;
    title: string;
  };
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  faculty?: string;
  displayAnon?: boolean;
  createdAt: number;
  lastLoginAt: number;
  badges?: Badge[];
  stats?: UserStats;
  goals?: HealthGoals;
  onboardingCompleted?: boolean;
  behaviorProfile?: UserBehaviorProfile;
  adaptiveThresholds?: AdaptiveThresholds;
  unlockedCombinations?: string[];
  // BMI related fields
  profile?: UserProfile;
}

export interface UserProfile {
  height?: number;    // cm
  weight?: number;    // kg
  age?: number;       // years
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  updatedAt?: number;
}

export interface BMIInfo {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese' | 'severely_obese';
  categoryTH: string;
  description: string;
  color: string;
  icon: string;
  healthRisks: string[];
  recommendations: string[];
}
