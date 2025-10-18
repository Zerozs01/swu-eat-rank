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

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  faculty?: string;
  displayAnon?: boolean;
  createdAt: number;
  lastLoginAt: number;
}
