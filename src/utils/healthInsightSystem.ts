import type { UserStats, LogWithMenu, UserProfile } from '../types/menu';
import { calculateBMI, getBMIInfo } from './bmiCalculator';

export interface HealthStatus {
  level: 'good' | 'moderate' | 'unhealthy' | 'at_risk';
  label: string;
  description: string;
  color: string;
  icon: string;
  concerns: string[];
  recommendations: string[];
  relatedConditions: HealthCondition[];
}

export interface HealthCondition {
  name: string;
  nameTH: string;
  likelihood: 'low' | 'medium' | 'high';
  description: string;
  prevention: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface HealthInsightExplanation {
  overallStatus: HealthStatus;
  primaryFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  trendingAnalysis: {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
    timeframe: string;
  };
  actionableAdvice: {
    category: 'diet' | 'exercise' | 'lifestyle' | 'medical';
    priority: 'high' | 'medium' | 'low';
    advice: string;
  }[];
}

// Health status determination logic
export function determineHealthStatus(
  stats: UserStats,
  logs: LogWithMenu[],
  profile?: UserProfile
): HealthStatus {
  const healthScore = stats.averageHealthScore;
  const consistency = stats.weeklyLogs >= 14 ? 'consistent' : 'inconsistent';
  const veggieRatio = stats.totalLogs > 0 ? stats.veggieMeals / stats.totalLogs : 0;
  const recentTrend = calculateRecentHealthTrend(logs);

  // Calculate BMI if profile data is available
  const bmi = profile ? calculateBMI(profile.height, profile.weight) : null;
  const bmiInfo = bmi ? getBMIInfo(bmi) : null;

  // Determine health status level with BMI consideration
  let level: HealthStatus['level'];

  // BMI significantly affects health status
  if (bmiInfo) {
    if (bmiInfo.category === 'severely_obese' || bmiInfo.category === 'obese') {
      // High BMI automatically puts user in unhealthy or at risk category
      level = bmiInfo.category === 'severely_obese' ? 'at_risk' : 'unhealthy';
    } else if (bmiInfo.category === 'underweight') {
      // Underweight combined with low health score
      level = healthScore >= 70 ? 'moderate' : 'unhealthy';
    } else {
      // Normal or overweight BMI - use original logic
      if (healthScore >= 80 && consistency === 'consistent' && veggieRatio >= 0.4) {
        level = 'good';
      } else if (healthScore >= 60 && consistency === 'consistent' && veggieRatio >= 0.3) {
        level = 'moderate';
      } else if (healthScore >= 40) {
        level = 'unhealthy';
      } else {
        level = 'at_risk';
      }
    }
  } else {
    // No BMI data - use original logic
    if (healthScore >= 80 && consistency === 'consistent' && veggieRatio >= 0.4) {
      level = 'good';
    } else if (healthScore >= 60 && consistency === 'consistent' && veggieRatio >= 0.3) {
      level = 'moderate';
    } else if (healthScore >= 40) {
      level = 'unhealthy';
    } else {
      level = 'at_risk';
    }
  }

  return getHealthStatusDetails(level, healthScore, consistency, veggieRatio, recentTrend, bmiInfo || undefined);
}

function getHealthStatusDetails(
  level: HealthStatus['level'],
  healthScore: number,
  consistency: string,
  veggieRatio: number,
  recentTrend: string,
  bmiInfo?: ReturnType<typeof getBMIInfo>
): HealthStatus {
  const baseStatuses: Record<HealthStatus['level'], Omit<HealthStatus, 'relatedConditions'>> = {
    good: {
      level: 'good',
      label: 'ดีมาก',
      description: bmiInfo && bmiInfo.category === 'normal'
        ? 'สุขภาพของคุณอยู่ในเกณฑ์ดีมาก น้ำหนักปกติ และรูปแบบการทานอาหารเหมาะสม'
        : 'สุขภาพของคุณอยู่ในเกณฑ์ดีมาก รูปแบบการทานอาหารเหมาะสมและสม่ำเสมอ',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: '🎉',
      concerns: [],
      recommendations: [
        'รักษาพฤติกรรมการทานอาหารปัจจุบัน',
        'ลองหาอาหารใหม่ๆ เพื่อความหลากหลาย',
        'แชร์ประสบการณ์เพื่อช่วยผู้อื่น'
      ]
    },
    moderate: {
      level: 'moderate',
      label: 'ปานกลาง',
      description: bmiInfo
        ? `สุขภาพของคุณอยู่ในเกณฑ์ปานกลาง และมี BMI ${bmiInfo.value} (${bmiInfo.categoryTH})`
        : 'สุขภาพของคุณอยู่ในเกณฑ์ปานกลาง มีบางส่วนที่สามารถปรับปรุงได้',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: '😊',
      concerns: [
        healthScore < 70 ? 'คะแนนสุขภาพเฉลี่ยต่ำกว่ามาตรฐาน' : '',
        veggieRatio < 0.4 ? 'การทานผักน้อยเกินไป' : '',
        consistency === 'inconsistent' ? 'การบันทึกไม่สม่ำเสมอ' : '',
        bmiInfo?.category === 'overweight' ? `น้ำหนักเกินเกณฑ์เล็กน้อย (BMI: ${bmiInfo.value})` : '',
        bmiInfo?.category === 'underweight' ? `น้ำหนักน้อยกว่าเกณฑ์ (BMI: ${bmiInfo.value})` : ''
      ].filter(Boolean),
      recommendations: [
        'เพิ่มการทานผักให้ได้อย่างน้อย 1 มื้อต่อวัน',
        'เลือกวิธีการปรุงที่ดีกว่า (นึ่ง/ต้ม/ปิ้ง)',
        'บันทึกอาหารให้ครบทุกมื้อ'
      ]
    },
    unhealthy: {
      level: 'unhealthy',
      label: 'ควรปรับปรุง',
      description: bmiInfo
        ? `สุขภาพต้องการการปรับปรุง BMI ${bmiInfo.value} (${bmiInfo.categoryTH}) และพฤติกรรมการทานอาหาร`
        : 'มีปัจจัยเสี่ยงที่อาจส่งผลต่อสุขภาพในระยะยาว ควรปรับเปลี่ยนพฤติกรรม',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: '😐',
      concerns: [
        'คะแนนสุขภาพต่ำ',
        veggieRatio < 0.3 ? 'การทานผักน้อยมาก' : '',
        'การเลือกอาหารที่ไม่เหมาะสม',
        bmiInfo?.category === 'obese' ? `โรคอ้วน (BMI: ${bmiInfo.value})` : '',
        bmiInfo?.category === 'overweight' ? `น้ำหนักเกินเกณฑ์ (BMI: ${bmiInfo.value})` : '',
        bmiInfo?.category === 'underweight' ? `น้ำหนักน้อยกว่าเกณฑ์อย่างรุนแรง (BMI: ${bmiInfo.value})` : ''
      ].filter(Boolean),
      recommendations: [
        'เพิ่มผักในทุกมื้อที่ทาน',
        'ลดอาหารทอดและอาหารแปรรูป',
        'ปรึกษาโภชนากรหากจำเป็น',
        'ตั้งเป้าหมายสุขภาพระยะสั้น'
      ]
    },
    at_risk: {
      level: 'at_risk',
      label: 'เสี่ยง',
      description: bmiInfo
        ? `มีความเสี่ยงต่อสุขภาพสูง BMI ${bmiInfo.value} (${bmiInfo.categoryTH}) ต้องการการดูแลทันที`
        : 'มีความเสี่ยงต่อปัญหาสุขภาพ ควรได้รับการปรึกษาและปรับเปลี่ยนทันที',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: '😟',
      concerns: [
        'คะแนนสุขภาพต่ำมาก',
        'พฤติกรรมการทานที่เสี่ยง',
        'การขาดสารอาหารที่จำเป็น',
        bmiInfo?.category === 'severely_obese' ? `โรคอ้วนรุนแรง (BMI: ${bmiInfo.value})` : '',
        bmiInfo?.category === 'obese' ? `โรคอ้วน (BMI: ${bmiInfo.value})` : ''
      ].filter(Boolean),
      recommendations: [
        'ปรึกษาแพทย์หรือโภชนากร',
        'ปรับเปลี่ยนพฤติกรรมการทานทั้งหมด',
        'เพิ่มการออกกำลังกาย',
        'ตรวจสุขภาพประจำปี'
      ]
    }
  };

  const baseStatus = baseStatuses[level];
  const relatedConditions = generateRelatedConditions(level, healthScore, veggieRatio);

  return {
    ...baseStatus,
    relatedConditions
  };
}

function generateRelatedConditions(
  level: HealthStatus['level'],
  healthScore: number,
  veggieRatio: number
): HealthCondition[] {
  const conditions: HealthCondition[] = [];

  // Obesity risk
  if (healthScore < 50 || veggieRatio < 0.2) {
    conditions.push({
      name: 'obesity',
      nameTH: 'โรคอ้วน',
      likelihood: healthScore < 40 ? 'high' : 'medium',
      description: 'น้ำหนักเกินเกณฑ์ส่งผลเสียต่อสุขภาพหลายด้าน',
      prevention: [
        'ควบคุมปริมาณอาหาร',
        'เพิ่มผักและข้าวซ่าบในมื้ออาหาร',
        'ลดของหวานและเครื่องดื่มหวาน',
        'ออกกำลังกายสม่ำเสมอ'
      ],
      severity: 'moderate'
    });
  }

  // Diabetes risk
  if (healthScore < 60) {
    conditions.push({
      name: 'diabetes',
      nameTH: 'เบาหวาน',
      likelihood: healthScore < 40 ? 'high' : 'medium',
      description: 'ความเสี่ยงของภาวะน้ำตาลในเลือดสูง',
      prevention: [
        'ลดอาหารที่มีน้ำตาลสูง',
        'ควบคุมคาร์โบไฮเดรต',
        'เลือกข้าวซ่าบแทนข้าวขาว',
        'ตรวจน้ำตาลเป็นประจำ'
      ],
      severity: 'severe'
    });
  }

  // Kidney disease risk
  if (healthScore < 45) {
    conditions.push({
      name: 'kidney_disease',
      nameTH: 'โรคไต',
      likelihood: healthScore < 35 ? 'medium' : 'low',
      description: 'ความเสี่ยงของภาวะไตวายเรื้อรัง',
      prevention: [
        'ดื่มน้ำมากๆ',
        'ลดอาหารรสเค็มและโซเดียมสูง',
        'ควบคุมความดันโลหิต',
        'หลีกเลี่ยงโปรตีนเกินไป'
      ],
      severity: 'severe'
    });
  }

  // Heart disease risk
  if (healthScore < 55) {
    conditions.push({
      name: 'heart_disease',
      nameTH: 'โรคหัวใจ',
      likelihood: healthScore < 40 ? 'medium' : 'low',
      description: 'ความเสี่ยงของโรคหัวใจและหลอดเลือด',
      prevention: [
        'ลดไขมันอิ่มตัวและคอเลสเตอรอล',
        'เพิ่มไขมันดีจากถั่วและปลา',
        'ออกกำลังกายแบบแอโรบิก',
        'งดสูบบุหรี่'
      ],
      severity: 'severe'
    });
  }

  // High blood pressure risk
  if (healthScore < 60) {
    conditions.push({
      name: 'hypertension',
      nameTH: 'ความดันโลหิตสูง',
      likelihood: healthScore < 45 ? 'medium' : 'low',
      description: 'ความดันโลหิตสูงที่ส่งผลต่อหัวใจและไต',
      prevention: [
        'ลดอาหารรสเค็มและซอสต่างๆ',
        'เพิ่มอาหารที่มีโพแทสเซียมสูง',
        'ลดแอลกอฮอล์',
        'ควบคุมน้ำหนัก'
      ],
      severity: 'moderate'
    });
  }

  return conditions;
}

function calculateRecentHealthTrend(logs: LogWithMenu[]): string {
  const recentLogs = logs.slice(-14); // Last 14 meals
  if (recentLogs.length < 5) return 'insufficient_data';

  const firstHalf = recentLogs.slice(0, Math.floor(recentLogs.length / 2));
  const secondHalf = recentLogs.slice(Math.floor(recentLogs.length / 2));

  const firstAvg = firstHalf.reduce((sum, log) => sum + (log.menu?.healthScore || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, log) => sum + (log.menu?.healthScore || 0), 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 10) return 'improving';
  if (change < -10) return 'declining';
  return 'stable';
}

// Generate comprehensive health insight explanation
export function generateHealthInsightExplanation(
  stats: UserStats,
  logs: LogWithMenu[],
  profile?: UserProfile
): HealthInsightExplanation {
  const overallStatus = determineHealthStatus(stats, logs, profile);
  const primaryFactors = analyzePrimaryFactors(stats, logs, profile);
  const trendingAnalysis = analyzeTrends(logs);
  const actionableAdvice = generateActionableAdvice(overallStatus, stats, logs, profile);

  return {
    overallStatus,
    primaryFactors,
    trendingAnalysis,
    actionableAdvice
  };
}

function analyzePrimaryFactors(
  stats: UserStats,
  logs: LogWithMenu[],
  profile?: UserProfile
): { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[] {
  const factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[] = [];

  // Health score factor
  factors.push({
    factor: 'คะแนนสุขภาพเฉลี่ย',
    impact: (stats.averageHealthScore >= 70 ? 'positive' :
             stats.averageHealthScore >= 50 ? 'neutral' : 'negative') as 'positive' | 'neutral' | 'negative',
    description: `คะแนนเฉลี่ย ${Math.round(stats.averageHealthScore)}/100 แสดงถึง${stats.averageHealthScore >= 70 ? 'การเลือกอาหารที่ดีต่อสุขภาพ' : stats.averageHealthScore >= 50 ? 'การเลือกอาหารปานกลาง' : 'การเลือกอาหารที่อาจส่งผลเสียต่อสุขภาพ'}`
  });

  // Consistency factor
  factors.push({
    factor: 'ความสม่ำเสมอ',
    impact: stats.weeklyLogs >= 14 ? 'positive' : 'negative',
    description: `บันทึก ${stats.weeklyLogs} มื้อต่อสัปดาห์ ${stats.weeklyLogs >= 14 ? 'สม่ำเสมอดี' : 'ไม่สม่ำเสมอเท่าที่ควร'}`
  });

  // Vegetable intake factor
  const veggieRatio = stats.totalLogs > 0 ? stats.veggieMeals / stats.totalLogs : 0;
  factors.push({
    factor: 'การทานผัก',
    impact: veggieRatio >= 0.4 ? 'positive' : veggieRatio >= 0.2 ? 'neutral' : 'negative',
    description: `ทานผัก ${Math.round(veggieRatio * 100)}% ของมื้ออาหาร ${veggieRatio >= 0.4 ? 'ดีมาก' : veggieRatio >= 0.2 ? 'พอใช้' : 'น้อยเกินไป'}`
  });

  // BMI factor
  if (profile && profile.height && profile.weight) {
    const bmi = calculateBMI(profile.height, profile.weight);
    if (bmi !== null) {
      const bmiInfo = getBMIInfo(bmi);
      factors.push({
        factor: 'ดัชนีมวลกาย (BMI)',
        impact: (bmiInfo.category === 'normal' ? 'positive' :
                 bmiInfo.category === 'underweight' || bmiInfo.category === 'overweight' ? 'neutral' : 'negative') as 'positive' | 'neutral' | 'negative',
        description: `BMI ${bmi} (${bmiInfo.categoryTH}) ${bmiInfo.category === 'normal' ? 'อยู่ในเกณฑ์ปกติ' : 'อาจเสี่ยงต่อสุขภาพ'}`
      });
    }
  }

  return factors;
}

function analyzeTrends(logs: LogWithMenu[]): { direction: 'improving' | 'stable' | 'declining'; confidence: number; timeframe: string } {
  const recentTrend = calculateRecentHealthTrend(logs);
  const confidence = logs.length >= 20 ? 0.8 : logs.length >= 10 ? 0.6 : 0.4;

  const direction: 'improving' | 'stable' | 'declining' =
    recentTrend === 'improving' ? 'improving' :
    recentTrend === 'declining' ? 'declining' : 'stable';

  return {
    direction,
    confidence,
    timeframe: logs.length >= 14 ? '2 สัปดาห์' : 'ช่วงที่ผ่านมา'
  };
}

function generateActionableAdvice(
  status: HealthStatus,
  stats: UserStats,
  logs: LogWithMenu[],
  profile?: UserProfile
) {
  const advice = [];
  // Precompute BMI info once for use throughout this function
  let bmiInfo: ReturnType<typeof getBMIInfo> | null = null;
  if (profile && profile.height && profile.weight) {
    const bmi = calculateBMI(profile.height, profile.weight);
    if (bmi !== null) {
      bmiInfo = getBMIInfo(bmi);
    }
  }

  // Diet advice
  if (status.level === 'good') {
    advice.push({
      category: 'diet' as const,
      priority: 'low' as const,
      advice: bmiInfo && bmiInfo.category === 'normal'
        ? 'รักษาน้ำหนักและพฤติกรรมการทานที่ดีอยู่ ลองหาอาหารใหม่ๆ เพื่อความหลากหลาย'
        : 'รักษาพฤติกรรมการทานที่ดีอยู่ ลองหาอาหารใหม่ๆ เพื่อความหลากหลาย'
    });
  } else {
    const baseAdvice = bmiInfo
      ? bmiInfo.category === 'underweight' ? 'เพิ่มอาหารโปรตีนสูงและแคลอรี่เพื่อเพิ่มน้ำหนักอย่างปลอดภัย' :
        bmiInfo.category === 'overweight' ? 'ลดแคลอรี่และเลือกอาหารที่มีประโยชน์สูง' :
        bmiInfo.category === 'obese' || bmiInfo.category === 'severely_obese' ? 'ปรับเปลี่ยนพฤติกรรมการทานอาหารโดยการลดแคลอรี่อย่างมีนัยสำคัญ' :
        'เพิ่มผักให้ได้อย่างน้อย 1 มื้อต่อวัน และเลือกวิธีการปรุงที่ดีกว่า'
      : 'เพิ่มผักให้ได้อย่างน้อย 1 มื้อต่อวัน และเลือกวิธีการปรุงที่ดีกว่า';

    advice.push({
      category: 'diet' as const,
      priority: 'high' as const,
      advice: baseAdvice
    });
  }

  // Exercise advice
  if (status.level === 'unhealthy' || status.level === 'at_risk') {
    const exerciseAdvice = bmiInfo
      ? bmiInfo.category === 'underweight' ? 'ออกกำลังกายแบบกำลังเพื่อสร้างกล้ามเนื้อ สัปดาห์ละ 3 ครั้ง ครั้งละ 30 นาที' :
        bmiInfo.category === 'overweight' ? 'ออกกำลังกายแบบแอโรบิกเพื่อเผาผลาญไขมัน อย่างน้อย 150 นาที/สัปดาห์' :
        bmiInfo.category === 'obese' || bmiInfo.category === 'severely_obese' ? 'ออกกำลังกายสม่ำเสมอ 300 นาที/สัปดาห์ ผสมกับการควบคุมอาหาร' :
        'เริ่มออกกำลังกายเบาๆ สัปดาห์ละ 3 ครั้ง ครั้งละ 30 นาที'
      : 'เริ่มออกกำลังกายเบาๆ สัปดาห์ละ 3 ครั้ง ครั้งละ 30 นาที';

    advice.push({
      category: 'exercise' as const,
      priority: 'high' as const,
      advice: exerciseAdvice
    });
  }

  // BMI-specific advice
  if (bmiInfo) {
      if (bmiInfo.category === 'severely_obese' || bmiInfo.category === 'obese') {
        advice.push({
          category: 'medical' as const,
          priority: 'high' as const,
          advice: 'ปรึกษาแพทย์เพื่อวางแผนการลดน้ำหนักอย่างปลอดภัย'
        });
        advice.push({
          category: 'diet' as const,
          priority: 'high' as const,
          advice: `ลดแคลอรี่วันละ ${bmiInfo.category === 'severely_obese' ? '500-1000' : '300-500'} กิโลแคลอรี่`
        });
      } else if (bmiInfo.category === 'underweight') {
        advice.push({
          category: 'diet' as const,
          priority: 'medium' as const,
          advice: 'เพิ่มอาหารโปรตีนสูงและแคลอรี่เพื่อเพิ่มน้ำหนักอย่างปลอดภัย'
        });
      } else if (bmiInfo.category === 'overweight') {
        advice.push({
          category: 'diet' as const,
          priority: 'medium' as const,
          advice: 'ลดแคลอรี่วันละ 300-500 กิโลแคลอรี่และเพิ่มการออกกำลังกาย'
        });
  }
}

  // Medical advice
  if (status.level === 'at_risk') {
    advice.push({
      category: 'medical' as const,
      priority: 'high' as const,
      advice: 'ปรึกษาแพทย์หรือโภชนากรเพื่อรับคำแนะนำเฉพาะบุคคล'
    });
  }

  return advice;
}