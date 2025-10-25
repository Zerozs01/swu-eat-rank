export type MoodId = 'very_hungry' | 'clean' | 'lazy';

export interface MoodConfig {
  id: MoodId;
  label: string; // Button label with emoji
  subtext: string; // One-line microcopy under the label
  // Simple filter semantics mapped to our domain
  filters?: {
    excludeCategories?: Array<'DESSERT' | 'DRINK'>;
    includeCooking?: Array<'FRY' | 'BOIL' | 'STEAM' | 'STIR'>;
    excludeCooking?: Array<'FRY' | 'BOIL' | 'STEAM' | 'STIR'>;
    healthScoreMin?: number;
    calorieMin?: number; // kcal
  };
  // Weights for scoring (0..1 scale, negatives penalize)
  weights?: Partial<{
    calorie: number;
    protein: number; // proxy by proteins[] length
    satiety_index: number; // derived
    health_score: number; // calcHealthScore/100
    sodium: number; // normalized 0..1, negative to penalize
    sugar: number; // normalized 0..1, negative to penalize
    trend_score: number; // 0..1 from logs
  }>;
  sort?: Array<
    | '-satiety_index'
    | '-protein'
    | '-calorie'
    | '-health_score'
    | '+sodium'
    | '+sugar'
    | '-trend_score'
  >;
}

export const MOODS: Record<MoodId, MoodConfig> = {
  very_hungry: {
    id: 'very_hungry',
    label: '😋 หิวมาก',
    subtext: 'เติมพลังแล้วลุยคาบต่อไปเถอะ 💪',
    filters: {
      excludeCategories: ['DESSERT'],
      includeCooking: ['STIR', 'BOIL', 'FRY', 'STEAM'],
      calorieMin: 500,
    },
    weights: {
      calorie: 0.5,
      protein: 0.3,
      satiety_index: 0.2,
    },
    sort: ['-satiety_index', '-protein'],
  },
  clean: {
    id: 'clean',
    label: '🥗 อยากกินคลีน',
    subtext: 'วันนี้พักกระเพาะจากของทอดหน่อยเนอะ?',
    filters: {
      excludeCategories: ['DESSERT'],
      excludeCooking: ['FRY'],
      healthScoreMin: 75,
    },
    weights: {
      health_score: 0.6,
      sodium: -0.2,
      sugar: -0.2,
    },
    sort: ['-health_score', '+sodium', '+sugar'],
  },
  lazy: {
    id: 'lazy',
    label: '💤 ขี้เกียจคิด',
    subtext: 'ฉันสุ่มให้—ถ้าไม่อร่อย ก็... (¬_¬)',
    // No strict filters; we randomize a couple categories in code
    weights: {
      trend_score: 0.6,
      health_score: 0.4,
    },
    sort: ['-trend_score', '-health_score'],
  },
};
