import React from 'react';
import type { BMIInfo, UserProfile } from '../../types/menu';
import { getIdealWeightRange, calculateDailyCalories } from '../../utils/bmiCalculator';

interface BMIHealthSummaryProps {
  bmiInfo: BMIInfo;
  profile: UserProfile;
  className?: string;
  compact?: boolean;
}

export function BMIHealthSummary({ bmiInfo, profile, className = '', compact = false }: BMIHealthSummaryProps) {
  const idealWeightRange = profile.height ? getIdealWeightRange(profile.height) : null;
  const dailyCalories = calculateDailyCalories(profile);

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{bmiInfo.icon}</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BMI</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {bmiInfo.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {bmiInfo.categoryTH}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${bmiInfo.color}`}>
            {bmiInfo.category === 'normal' ? 'ดี' :
             bmiInfo.category === 'underweight' ? 'ต่ำ' :
             bmiInfo.category === 'overweight' ? 'สูง' : 'สูงมาก'}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          <p className="leading-relaxed">{bmiInfo.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{bmiInfo.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              วิเคราะห์ดัชนีมวลกาย (BMI)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ประเมินสภาพสุขภาพจากส่วนสูงและน้ำหนัก
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${bmiInfo.color}`}>
          {bmiInfo.categoryTH}
        </div>
      </div>

      {/* BMI Value and Visual */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${bmiInfo.color}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              BMI: {bmiInfo.value}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {bmiInfo.description}
            </p>
          </div>
          <div className="text-4xl">{bmiInfo.icon}</div>
        </div>

        {/* BMI Scale Visual */}
        <div className="mt-4 relative">
          <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-400 rounded-full"></div>
          <div
            className="absolute top-0 w-4 h-2 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2 transition-all duration-500"
            style={{ left: `${Math.min(100, Math.max(0, (bmiInfo.value - 15) / 25 * 100))}%` }}
          ></div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
            <span>35+</span>
          </div>
        </div>
      </div>

      {/* Health Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Status */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>📋</span> สถานะปัจจุบัน
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">ส่วนสูง:</span>
              <span className="font-medium">{profile.height} ซม.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">น้ำหนัก:</span>
              <span className="font-medium">{profile.weight} กก.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">BMI:</span>
              <span className={`font-medium ${bmiInfo.color.split(' ')[0]}`}>
                {bmiInfo.value} ({bmiInfo.categoryTH})
              </span>
            </div>
            {idealWeightRange && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">น้ำหนักเหมาะสม:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {idealWeightRange.min}-{idealWeightRange.max} กก.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>📊</span> ข้อมูลสุขภาพ
          </h4>
          <div className="space-y-2 text-sm">
            {dailyCalories && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ความต้องการแคลอรี่:</span>
                <span className="font-medium">{dailyCalories} กิโลแคลอรี่/วัน</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">ระดับการออกกำลังกาย:</span>
              <span className="font-medium">
                {profile.activityLevel === 'sedentary' ? 'น้อย' :
                 profile.activityLevel === 'lightly_active' ? 'เล็กน้อย' :
                 profile.activityLevel === 'moderately_active' ? 'ปานกลาง' :
                 profile.activityLevel === 'very_active' ? 'บ่อย' : 'มาก'}
              </span>
            </div>
            {profile.age && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">อายุ:</span>
                <span className="font-medium">{profile.age} ปี</span>
              </div>
            )}
            {profile.gender && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">เพศ:</span>
                <span className="font-medium">
                  {profile.gender === 'male' ? 'ชาย' :
                   profile.gender === 'female' ? 'หญิง' : 'อื่นๆ'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Risks */}
      {bmiInfo.healthRisks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>⚠️</span> ความเสี่ยงต่อสุขภาพ
          </h4>
          <div className={`rounded-lg p-4 border ${
            bmiInfo.category === 'normal' ? 'bg-green-50 border-green-200' :
            bmiInfo.category === 'underweight' ? 'bg-blue-50 border-blue-200' :
            bmiInfo.category === 'overweight' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <ul className="space-y-1 text-sm">
              {bmiInfo.healthRisks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className={
                    bmiInfo.category === 'normal' ? 'text-green-800' :
                    bmiInfo.category === 'underweight' ? 'text-blue-800' :
                    bmiInfo.category === 'overweight' ? 'text-yellow-800' :
                    'text-red-800'
                  }>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>💡</span> คำแนะนำ
        </h4>
        <div className="space-y-2">
          {bmiInfo.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {recommendation}
              </span>
            </div>
          ))}
        </div>

        {/* Additional Tips based on BMI category */}
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">🎯 เคล็ดลับเพิ่มเติม:</h5>
          <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
            {bmiInfo.category === 'underweight' && (
              <>
                <li>• ทานอาหารบ่อยขึ้น (5-6 มื้อ/วัน) เพื่อเพิ่มแคลอรี่</li>
                <li>• เลือกอาหารที่มีโปรตีนสูงในทุกมื้อ</li>
                <li>• ออกกำลังกายแบบกำลังเพื่อสร้างกล้ามเนื้อ</li>
              </>
            )}
            {bmiInfo.category === 'normal' && (
              <>
                <li>• รักษาน้ำหนักปัจจุบันให้คงที่</li>
                <li>• กินอาหารหลากหลายและสมดุล</li>
                <li>>• ออกกำลังกายสม่ำเสมออย่างน้อย 150 นาที/สัปดาห์</li>
              </>
            )}
            {(bmiInfo.category === 'overweight' || bmiInfo.category === 'obese' || bmiInfo.category === 'severely_obese') && (
              <>
                <li>• ตั้งเป้าหมายการลดน้ำหนักที่เป็นไปได้ (0.5-1 กก./สัปดาห์)</li>
                <li>• บันทึกอาหารที่ทานเพื่อควบคุมแคลอรี่</li>
                <li>• เพิ่มการเคลื่อนไหวในชีวิตประจำวัน</li>
                <li>• ดื่มน้ำมากๆ (8-10 แก้วต่อวัน)</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}