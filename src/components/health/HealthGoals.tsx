import React, { useState } from 'react';
import type { HealthGoals } from '../../types/menu';

interface HealthGoalsProps {
  goals?: HealthGoals;
  onSave: (goals: HealthGoals) => void;
}

export function HealthGoalsSettings({ goals, onSave }: HealthGoalsProps) {
  const [localGoals, setLocalGoals] = useState<HealthGoals>({
    targetHealthScore: goals?.targetHealthScore || 70,
    targetWeeklyLogs: goals?.targetWeeklyLogs || 14,
    targetStreak: goals?.targetStreak || 7,
    targetVeggieMeals: goals?.targetVeggieMeals || 7
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(localGoals);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalGoals({
      targetHealthScore: goals?.targetHealthScore || 70,
      targetWeeklyLogs: goals?.targetWeeklyLogs || 14,
      targetStreak: goals?.targetStreak || 7,
      targetVeggieMeals: goals?.targetVeggieMeals || 7
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">🎯 เป้าหมายสุขภาพ</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          {isEditing ? 'ยกเลิก' : 'แก้ไข'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คะแนนสุขภาพเป้าหมาย
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={localGoals.targetHealthScore}
              onChange={(e) => setLocalGoals({
                ...localGoals,
                targetHealthScore: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              เป้าหมายคะแนนสุขภาพเฉลี่ย (0-100)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              บันทึกต่อสัปดาห์
            </label>
            <input
              type="number"
              min="1"
              max="21"
              value={localGoals.targetWeeklyLogs}
              onChange={(e) => setLocalGoals({
                ...localGoals,
                targetWeeklyLogs: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              จำนวนมื้ออาหารที่ต้องการบันทึกต่อสัปดาห์ (1-21)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สตรีคเป้าหมาย
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={localGoals.targetStreak}
              onChange={(e) => setLocalGoals({
                ...localGoals,
                targetStreak: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              จำนวนวันที่ต้องการบันทึกติดต่อกัน (1-100)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              มื้อผักต่อสัปดาห์
            </label>
            <input
              type="number"
              min="0"
              max="21"
              value={localGoals.targetVeggieMeals}
              onChange={(e) => setLocalGoals({
                ...localGoals,
                targetVeggieMeals: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              จำนวนมื้อที่มีผักต่อสัปดาห์ (0-21)
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              บันทึกเป้าหมาย
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">คะแนนสุขภาพเป้าหมาย</div>
              <div className="text-sm text-gray-500">คะแนนเฉลี่ยที่ต้องการบรรลุ</div>
            </div>
            <div className="text-lg font-bold text-green-600">
              {localGoals.targetHealthScore}
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">บันทึกต่อสัปดาห์</div>
              <div className="text-sm text-gray-500">มื้ออาหารที่ต้องการบันทึก</div>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {localGoals.targetWeeklyLogs} มื้อ
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">สตรีคเป้าหมาย</div>
              <div className="text-sm text-gray-500">วันที่ต้องการบันทึกติดต่อกัน</div>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {localGoals.targetStreak} วัน
            </div>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <div className="font-medium text-gray-900">มื้อผักต่อสัปดาห์</div>
              <div className="text-sm text-gray-500">มื้อที่ต้องการมีผัก</div>
            </div>
            <div className="text-lg font-bold text-green-600">
              {localGoals.targetVeggieMeals} มื้อ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface HealthGoalsSummaryProps {
  goals?: HealthGoals;
  currentStats: {
    averageHealthScore: number;
    weeklyLogs: number;
    currentStreak: number;
    veggieMeals: number;
  };
}

export function HealthGoalsSummary({ goals, currentStats }: HealthGoalsSummaryProps) {
  const getProgressPercentage = (current: number, target?: number) => {
    if (!target) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  if (!goals) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <div className="text-gray-500">
          <div className="text-4xl mb-2">🎯</div>
          <div>ยังไม่ได้ตั้งเป้าหมาย</div>
          <div className="text-sm">ตั้งเป้าหมายเพื่อช่วยให้บรรลุผลลัพธ์ที่ดีขึ้น</div>
        </div>
      </div>
    );
  }

  const goalsProgress = [
    {
      label: 'คะแนนสุขภาพ',
      current: currentStats.averageHealthScore,
      target: goals.targetHealthScore,
      unit: 'คะแนน'
    },
    {
      label: 'บันทึกต่อสัปดาห์',
      current: currentStats.weeklyLogs,
      target: goals.targetWeeklyLogs,
      unit: 'มื้อ'
    },
    {
      label: 'สตรีคปัจจุบัน',
      current: currentStats.currentStreak,
      target: goals.targetStreak,
      unit: 'วัน'
    },
    {
      label: 'มื้อผัก',
      current: currentStats.veggieMeals,
      target: goals.targetVeggieMeals,
      unit: 'มื้อ'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 ความคืบหน้าเป้าหมาย</h3>

      <div className="space-y-4">
        {goalsProgress.map((goal, index) => {
          const progress = getProgressPercentage(goal.current, goal.target);
          const colorClass = getProgressColor(progress);

          return (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{goal.label}</span>
                <span className="text-gray-500">
                  {Math.round(goal.current)} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress >= 100 && (
                <div className="mt-1 text-xs text-green-600 font-medium">
                  ✅ บรรลุเป้าหมายแล้ว!
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">💡 เคล็ดลับ:</div>
          <div>บันทึกอาหารสม่ำเสมอและเลือกอาหารที่ดีต่อสุขภาพจะช่วยให้บรรลุเป้าหมายได้เร็วขึ้น</div>
        </div>
      </div>
    </div>
  );
}