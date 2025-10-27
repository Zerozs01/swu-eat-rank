import React, { useState, useEffect } from 'react';
import type { UserProfile, BMIInfo } from '../../types/menu';
import {
  calculateBMI,
  getBMIInfo,
  getIdealWeightRange,
  calculateDailyCalories,
  validateProfile,
  saveProfileToStorage,
  loadProfileFromStorage
} from '../../utils/bmiCalculator';

interface BMIInputCardProps {
  userId: string;
  onProfileUpdate?: (profile: UserProfile) => void;
  className?: string;
}

export function BMIInputCard({ userId, onProfileUpdate, className = '' }: BMIInputCardProps) {
  const [profile, setProfile] = useState<UserProfile>({
    height: undefined,
    weight: undefined,
    age: undefined,
    gender: undefined,
    activityLevel: 'moderately_active'
  });

  const [bmiInfo, setBMIInfo] = useState<BMIInfo | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load profile from storage on mount
  useEffect(() => {
    const savedProfile = loadProfileFromStorage(userId);
    if (savedProfile) {
      setProfile(savedProfile);
      calculateAndSetBMIInfo(savedProfile);
    }
  }, [userId]);

  const calculateAndSetBMIInfo = (profileData: UserProfile) => {
    const bmi = calculateBMI(profileData.height, profileData.weight);
    if (bmi !== null) {
      setBMIInfo(getBMIInfo(bmi));
    } else {
      setBMIInfo(null);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }

    // Recalculate BMI if height and weight are available
    if (field === 'height' || field === 'weight') {
      calculateAndSetBMIInfo(newProfile);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Validate profile
    const validation = validateProfile(profile);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        updatedAt: Date.now()
      };

      // Save to local storage (for demo)
      saveProfileToStorage(userId, updatedProfile);

      // Notify parent component
      onProfileUpdate?.(updatedProfile);

      setIsEditing(false);
      setErrors([]);
    } catch (error) {
      setErrors(['ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const savedProfile = loadProfileFromStorage(userId);
    if (savedProfile) {
      setProfile(savedProfile);
      calculateAndSetBMIInfo(savedProfile);
    }
    setIsEditing(false);
    setErrors([]);
  };

  const idealWeightRange = profile.height ? getIdealWeightRange(profile.height) : null;
  const dailyCalories = calculateDailyCalories(profile);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          📊 ข้อมูลสุขภาพกายภาพ
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            แก้ไข
          </button>
        )}
      </div>

      {/* BMI Display */}
      {bmiInfo && !isEditing && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${bmiInfo.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{bmiInfo.icon}</span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    BMI: {bmiInfo.value}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bmiInfo.categoryTH}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {bmiInfo.description}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {idealWeightRange && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  น้ำหนักเหมาะสม:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {idealWeightRange.min} - {idealWeightRange.max} กก.
                </span>
              </div>
            )}
            {dailyCalories && (
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ความต้องการแคลอรี่/วัน:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {dailyCalories} กิโลแคลอรี่
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Form */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Height and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ส่วนสูง (ซม.)
              </label>
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น 170"
                min="100"
                max="250"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น 65"
                min="20"
                max="300"
                step="0.1"
              />
            </div>
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                อายุ (ปี)
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น 25"
                min="10"
                max="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                เพศ
              </label>
              <select
                value={profile.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ระดับการออกกำลังกาย
            </label>
            <select
              value={profile.activityLevel || 'moderately_active'}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sedentary">ออกกำลังกายน้อย (ทำงานนั่งที่โต๊ะ)</option>
              <option value="lightly_active">ออกกำลังกายเล็กน้อย (1-3 วัน/สัปดาห์)</option>
              <option value="moderately_active">ปานกลาง (3-5 วัน/สัปดาห์)</option>
              <option value="very_active">ออกกำลังกายบ่อย (6-7 วัน/สัปดาห์)</option>
              <option value="extremely_active">ออกกำลังกายมาก (2 เท่า/วัน)</option>
            </select>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ) : (
        /* Profile Display */
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">ส่วนสูง:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {profile.height ? `${profile.height} ซม.` : 'ไม่ระบุ'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">น้ำหนัก:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {profile.weight ? `${profile.weight} กก.` : 'ไม่ระบุ'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">อายุ:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {profile.age ? `${profile.age} ปี` : 'ไม่ระบุ'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">เพศ:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {profile.gender === 'male' ? 'ชาย' :
                 profile.gender === 'female' ? 'หญิง' :
                 profile.gender === 'other' ? 'อื่นๆ' : 'ไม่ระบุ'}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500 dark:text-gray-400">การออกกำลังกาย:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {profile.activityLevel === 'sedentary' ? 'น้อย' :
                 profile.activityLevel === 'lightly_active' ? 'เล็กน้อย' :
                 profile.activityLevel === 'moderately_active' ? 'ปานกลาง' :
                 profile.activityLevel === 'very_active' ? 'บ่อย' :
                 profile.activityLevel === 'extremely_active' ? 'มาก' : 'ไม่ระบุ'}
              </span>
            </div>
          </div>

          {!profile.height && !profile.weight && !profile.age && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>ยังไม่ได้ใส่ข้อมูลสุขภาพกายภาพ</p>
              <p className="text-sm">คลิก "แก้ไข" เพื่อเพิ่มข้อมูลส่วนตัว</p>
            </div>
          )}
        </div>
      )}

      {/* Health Risks and Recommendations */}
      {bmiInfo && bmiInfo.healthRisks.length > 0 && !isEditing && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health Risks */}
            {bmiInfo.healthRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ ความเสี่ยงต่อสุขภาพ
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {bmiInfo.healthRisks.map((risk, index) => (
                    <li key={index}>• {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                💡 คำแนะนำ
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                {bmiInfo.recommendations.map((recommendation, index) => (
                  <li key={index}>• {recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}