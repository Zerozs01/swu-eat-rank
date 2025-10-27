import type { UserProfile, BMIInfo } from '../types/menu';

// Calculate BMI from height (cm) and weight (kg)
export function calculateBMI(height?: number, weight?: number): number | null {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return null;
  }

  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
}

// Get BMI category and related information
export function getBMIInfo(bmi: number): BMIInfo {
  if (bmi < 18.5) {
    return {
      value: bmi,
      category: 'underweight',
      categoryTH: 'น้ำหนักน้อยกว่าเกณฑ์',
      description: 'น้ำหนักต่ำกว่าเกณฑ์สุขภาพ อาจเสี่ยงต่อภาวะโภชนาการบกพร่อง',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: '📉',
      healthRisks: [
        'ภาวะโภชนาการบกพร่อง',
        'ภูมิคุ้มกันต่ำ',
        'ระบบน้ำเหลืองอ่อนแอ',
        'ผิวหนังแห้ง',
        'เสี่ยงต่อการติดเชื้อ'
      ],
      recommendations: [
        'เพิ่มปริมาณอาหารที่มีโปรตีนสูง',
        'ทานอาหารให้ครบ 5 หมู่',
        'เพิ่มน้ำหนักอย่าง gradual โดยเพิ่มแคลอรี่',
        'ออกกำลังกายเพื่อสร้างกล้ามเนื้อ',
        'ปรึกษาโภชนากรหากจำเป็น'
      ]
    };
  } else if (bmi < 25) {
    return {
      value: bmi,
      category: 'normal',
      categoryTH: 'น้ำหนักปกติ',
      description: 'น้ำหนักอยู่ในเกณฑ์สุขภาพที่ดี',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '✅',
      healthRisks: [],
      recommendations: [
        'รักษาน้ำหนักปัจจุบัน',
        'กินอาหารหลากหลาย',
        'ออกกำลังกายสม่ำเสมอ',
        'ตรวจสุขภาพประจำปี'
      ]
    };
  } else if (bmi < 30) {
    return {
      value: bmi,
      category: 'overweight',
      categoryTH: 'น้ำหนักเกิน',
      description: 'น้ำหนักเกินเกณฑ์ แต่ยังไม่ถึงระดับอ้วน',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      healthRisks: [
        'เสี่ยงต่อโรคเบาหวานชนิดที่ 2',
        'เสี่ยงต่อความดันโลหิตสูง',
        'เสี่ยงต่อไขมันในเลือดสูง',
        'เสี่ยงต่อโรคหัวใจและหลอดเลือด'
      ],
      recommendations: [
        'ลดอาหารแปรรูปและของหวาน',
        'เพิ่มผักและผลไม้ในมื้ออาหาร',
        'ออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์',
        'ควบคุมปริมาณอาหาร',
        'ดื่มน้ำมากๆ'
      ]
    };
  } else if (bmi < 35) {
    return {
      value: bmi,
      category: 'obese',
      categoryTH: 'อ้วน',
      description: 'อ้วนระดับ 1 มีความเสี่ยงต่อสุขภาพสูง',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: '🚨',
      healthRisks: [
        'โรคเบาหวานชนิดที่ 2',
        'ความดันโลหิตสูง',
        'โรคหัวใจและหลอดเลือด',
        'โรคไต',
        'โรคข้ออักเสบ',
        'ภาวะหยุดหายใจขณะหลับ'
      ],
      recommendations: [
        'ปรึกษาแพทย์เพื่อวางแผนการลดน้ำหนัก',
        'ลดแคลอรี่ลง 500-1000 กิโลแคลอรี่ต่อวัน',
        'ออกกำลังกายอย่างน้อย 300 นาทีต่อสัปดาห์',
        'เปลี่ยนพฤติกรรมการทานอาหารถาวร',
        'ตรวจสุขภาพประจำปี'
      ]
    };
  } else {
    return {
      value: bmi,
      category: 'severely_obese',
      categoryTH: 'อ้วนรุนแรง',
      description: 'อ้วนระดับ 2 มีความเสี่ยงต่อสุขภาพสูงมาก',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: '🆘',
      healthRisks: [
        'โรคเบาหวานชนิดที่ 2 (ความเสี่ยงสูงมาก)',
        'ความดันโลหิตสูงรุนแรง',
        'โรคหัวใจและหลอดเลือด (รวมถึงหัวใจวาย)',
        'โรคไตวายเรื้อรัง',
        'โรคตับอ้วน',
        'มะเร็งบางชนิด',
        'ภาวะหยุดหายใจรุนแรง'
      ],
      recommendations: [
        'ต้องได้รับการรักษาจากแพทย์ทันที',
        'โปรแกรมลดน้ำหนักภายใต้การดูแลของแพทย์',
        'อาจต้องได้รับการรักษาแบบหลายสาขา',
        'เปลี่ยนแปลงพฤติกรรมการทานและการออกกำลังกาย',
        'พิจารณาการรักษาแบบแพทย์ชิ้นส่วน'
      ]
    };
  }
}

// Calculate ideal weight range based on height
export function getIdealWeightRange(height: number): { min: number; max: number } {
  const heightInMeters = height / 100;
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters);
  const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters);
  return { min: minWeight, max: maxWeight };
}

// Calculate daily calorie needs based on profile
export function calculateDailyCalories(profile: UserProfile): number | null {
  if (!profile.age || !profile.weight || !profile.height || !profile.gender) {
    return null;
  }

  // Harris-Benedict equation for BMR
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
  } else {
    bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
  }

  // Activity factor
  const activityFactors = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };

  const activityFactor = activityFactors[profile.activityLevel || 'sedentary'];
  return Math.round(bmr * activityFactor);
}

// Validate profile data
export function validateProfile(profile: UserProfile): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (profile.height && (profile.height < 100 || profile.height > 250)) {
    errors.push('ส่วนสูงต้องอยู่ระหว่าง 100-250 ซม.');
  }

  if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
    errors.push('น้ำหนักต้องอยู่ระหว่าง 20-300 กก.');
  }

  if (profile.age && (profile.age < 10 || profile.age > 120)) {
    errors.push('อายุต้องอยู่ระหว่าง 10-120 ปี');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Save profile to local storage (for demo purposes)
export function saveProfileToStorage(userId: string, profile: UserProfile): void {
  try {
    const storageKey = `user_profile_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify({
      ...profile,
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
}

// Load profile from local storage (for demo purposes)
export function loadProfileFromStorage(userId: string): UserProfile | null {
  try {
    const storageKey = `user_profile_${userId}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
}

// Get weight change recommendations
export function getWeightChangeRecommendations(currentBMI: number, targetBMI: number, profile: UserProfile): {
  action: 'lose' | 'gain' | 'maintain';
  targetWeight: number;
  weeklyChange: number;
  timeframe: string;
  advice: string[];
} {
  const targetWeight = Math.round(targetBMI * Math.pow((profile.height || 170) / 100, 2));
  const currentWeight = profile.weight || 70;
  const weightDifference = targetWeight - currentWeight;

  if (Math.abs(weightDifference) < 1) {
    return {
      action: 'maintain',
      targetWeight,
      weeklyChange: 0,
      timeframe: 'ปัจจุบัน',
      advice: ['รักษาน้ำหนักปัจจุบัน', 'กินอาหารหลากหลาย', 'ออกกำลังกายสม่ำเสมอ']
    };
  }

  // Safe weight change: 0.5-1 kg per week
  const weeklyChange = Math.min(Math.max(weightDifference / 12, -1), 1); // 12 weeks target
  const weeks = Math.abs(Math.round(weightDifference / weeklyChange));
  const timeframe = weeks > 52 ? `${Math.round(weeks / 52)} ปี` : `${weeks} สัปดาห์`;

  const action = weightDifference < 0 ? 'lose' : 'gain';
  const advice = action === 'lose' ? [
    'ลดแคลอรี่ลง 300-500 กิโลแคลอรี่ต่อวัน',
    'เพิ่มการออกกำลังกายแบบแอโรบิก',
    'ลดอาหารทอดและของหวาน',
    'ดื่มน้ำมากๆ'
  ] : [
    'เพิ่มแคลอรี่ 300-500 กิโลแคลอรี่ต่อวัน',
    'ทานอาหารโปรตีนสูงในทุกมื้อ',
    'เพิ่มการออกกำลังกายแบบกำลัง',
    'ทานอาหารครบ 5 หมู่'
  ];

  return {
    action,
    targetWeight,
    weeklyChange,
    timeframe,
    advice
  };
}