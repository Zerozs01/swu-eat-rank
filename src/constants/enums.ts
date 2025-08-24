import type { Location, Category, Taste, Cooking } from '../types/menu';

export const LOCATIONS: Record<Location, string> = {
  ENG_CANTEEN: 'โรงอาหารวิศวะ',
  HEALTH_CANTEEN: 'โรงอาหารสุขภาพ',
  DORM_CANTEEN: 'โรงอาหารหอพัก'
};

export const CATEGORIES: Record<Category, string> = {
  RICE: 'ข้าว',
  NOODLE: 'เส้น',
  FRIED: 'ทอด',
  DESSERT: 'หวาน',
  DRINK: 'เครื่องดื่ม'
};

export const TASTES: Record<Taste, string> = {
  SWEET: 'หวาน',
  OILY: 'มัน',
  SPICY: 'เผ็ด',
  SOUR: 'เปรี้ยว',
  BLAND: 'จืด'
};

export const COOKING_METHODS: Record<Cooking, string> = {
  FRY: 'ทอด',
  BOIL: 'ต้ม',
  STEAM: 'นึ่ง',
  STIR: 'ผัด'
};

export const FACULTIES = [
  'วิศวะ',
  'สุขภาพ',
  'วิทยาศาสตร์',
  'มนุษยศาสตร์',
  'สังคมศาสตร์',
  'เกษตรศาสตร์',
  'อื่นๆ'
] as const;

export type Faculty = typeof FACULTIES[number];
