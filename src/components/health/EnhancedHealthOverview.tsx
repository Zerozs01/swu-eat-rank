import React, { useState, useMemo } from 'react';
import type { LogWithMenu, UserStats, HealthGoals } from '../../types/menu';
import { calculateUserStats } from '../../utils/badgeSystem';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface EnhancedHealthOverviewProps {
  logs: LogWithMenu[];
  goals?: HealthGoals;
  timeRange: 'day' | 'week' | 'month';
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
}

export function EnhancedHealthOverview({
  logs,
  goals,
  timeRange,
  onTimeRangeChange
}: EnhancedHealthOverviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'goals'>('overview');

  const stats = useMemo(() => calculateUserStats(logs), [logs]);
  const healthData = useMemo(() => processHealthData(logs, timeRange), [logs, timeRange]);
  const categoryData = useMemo(() => processCategoryData(logs, timeRange), [logs, timeRange]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  function processHealthData(logs: LogWithMenu[], timeRange: string) {
    const now = new Date();
    const data = [];
    let daysToProcess = 1;

    switch (timeRange) {
      case 'week':
        daysToProcess = 7;
        break;
      case 'month':
        daysToProcess = 30;
        break;
    }

    for (let i = daysToProcess - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.at);
        return logDate >= date && logDate < nextDate;
      });

      const avgHealth = dayLogs.length > 0
        ? dayLogs.reduce((sum, log) => sum + (log.menu?.healthScore || 0), 0) / dayLogs.length
        : 0;

      data.push({
        date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        healthScore: Math.round(avgHealth),
        meals: dayLogs.length,
        healthyMeals: dayLogs.filter(log => (log.menu?.healthScore || 0) >= 70).length
      });
    }

    return data;
  }

  function processCategoryData(logs: LogWithMenu[], timeRange: string) {
    const now = new Date();
    let cutoff = now.getTime();

    switch (timeRange) {
      case 'week':
        cutoff -= 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        cutoff -= 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const recentLogs = logs.filter(log => log.at >= cutoff);
    const categoryCount = new Map<string, number>();

    recentLogs.forEach(log => {
      const category = log.menu?.category || 'OTHER';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    return Array.from(categoryCount.entries()).map(([category, count]) => ({
      name: getCategoryName(category),
      value: count,
      category
    }));
  }

  function getCategoryName(category: string): string {
    switch (category) {
      case 'RICE': return 'ข้าวทานเคียว';
      case 'NOODLE': return 'ก๋วยเตี๋ยว';
      case 'FRIED': return 'ทอด';
      case 'DESSERT': return 'ของหวาน';
      case 'DRINK': return 'เครื่องดื่ม';
      default: return 'อื่นๆ';
    }
  }

  function getHealthInsights(stats: UserStats): string[] {
    const insights = [];

    if (stats.averageHealthScore >= 80) {
      insights.push('🎉 สุขภาพของคุณดีมาก! ทานอาหารที่ดีต่อสุขภาพอย่างสม่ำเสมอ');
    } else if (stats.averageHealthScore >= 60) {
      insights.push('👍 สุขภาพของคุณดี ลองเพิ่มผักและลดอาหารทอดได้นะ');
    } else {
      insights.push('⚠️ ควรปรับปรุงการทานอาหาร ลองเพิ่มผักและเลือกวิธีการปรุงที่ดีกว่า');
    }

    if (stats.currentStreak >= 7) {
      insights.push(`🔥 สุดยอด! บันทึกติดต่อกัน ${stats.currentStreak} วัน`);
    } else if (stats.currentStreak >= 3) {
      insights.push(`💪 ดีมาก! บันทึกติดต่อกัน ${stats.currentStreak} วัน พยายามต่อไป!`);
    }

    if (stats.veggieMeals / stats.totalLogs < 0.3 && stats.totalLogs > 0) {
      insights.push('🥬 ควรเพิ่มการทานผักให้มากขึ้น อย่างน้อย 1 มื้อต่อวัน');
    }

    if (stats.weeklyLogs < 14 && stats.totalLogs > 0) {
      insights.push('📊 ควรบันทึกอาหารให้ครบทุกมื้อเพื่อการวิเคราะห์ที่แม่นยำ');
    }

    return insights;
  }

  function calculateGoalProgress(current: number, target?: number): number {
    if (!target) return 0;
    return Math.min(100, (current / target) * 100);
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">ภาพรวมสุขภาพ</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { value: 'day', label: 'วันนี้' },
            { value: 'week', label: '7 วัน' },
            { value: 'month', label: '30 วัน' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value as any)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all
                ${timeRange === range.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">คะแนนเฉลี่ย</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.round(stats.averageHealthScore)}
              </div>
            </div>
            <div className="text-3xl">💚</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">สตรีคปัจจุบัน</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.currentStreak}
              </div>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">มื้อที่บันทึก</div>
              <div className="text-2xl font-bold text-gray-800">
                {timeRange === 'day' ? stats.weeklyLogs :
                 timeRange === 'week' ? stats.weeklyLogs :
                 stats.monthlyLogs}
              </div>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">งบประมาณ</div>
              <div className="text-2xl font-bold text-gray-800">
                ฿{Math.round(stats.totalBudget)}
              </div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'ภาพรวม' },
            { id: 'trends', label: 'แนวโน้ม' },
            { id: 'goals', label: 'เป้าหมาย' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">ข้อมูลเชิงลึกสุขภาพ</h3>
            <div className="space-y-2">
              {getHealthInsights(stats).map((insight, index) => (
                <div key={index} className="text-blue-800">{insight}</div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">สัดส่วนประเภทอาหาร</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">แนวโน้มคะแนนสุขภาพ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Meal Frequency */}
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-800 mb-4">ความถี่ในการบันทึกมื้ออาหาร</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="meals" fill="#3b82f6" />
                  <Bar dataKey="healthyMeals" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          {goals && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ความคืบหน้าเป้าหมาย</h3>
              <div className="space-y-4">
                {goals.targetHealthScore && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>คะแนนสุขภาพเป้าหมาย</span>
                      <span>{Math.round(stats.averageHealthScore)} / {goals.targetHealthScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${calculateGoalProgress(stats.averageHealthScore, goals.targetHealthScore)}%` }}
                      />
                    </div>
                  </div>
                )}

                {goals.targetWeeklyLogs && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>บันทึกต่อสัปดาห์</span>
                      <span>{stats.weeklyLogs} / {goals.targetWeeklyLogs}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${calculateGoalProgress(stats.weeklyLogs, goals.targetWeeklyLogs)}%` }}
                      />
                    </div>
                  </div>
                )}

                {goals.targetStreak && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>สตรีคเป้าหมาย</span>
                      <span>{stats.currentStreak} / {goals.targetStreak}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${calculateGoalProgress(stats.currentStreak, goals.targetStreak)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!goals && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <div>ยังไม่ได้ตั้งเป้าหมาย</div>
                <div className="text-sm">ตั้งเป้าหมายเพื่อช่วยให้บรรลุผลลัพธ์ที่ดีขึ้น</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}