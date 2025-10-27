import React, { useState, useMemo } from 'react';
import type { LogWithMenu, UserStats, HealthGoals } from '../../types/menu';
import { calculateUserStats, generateBehaviorInsights } from '../../utils/badgeSystem';
import { generateHealthInsightExplanation } from '../../utils/healthInsightSystem';
import { HealthInsightCard } from './HealthInsightCard';
import { BMIInputCard } from './BMIInputCard';
import { BMIHealthSummary } from './BMIHealthSummary';
import { useBMI } from '../../hooks/useBMI';
import { calcHealthScore } from '../../utils/healthScore';
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
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface OptimizedHealthSummaryProps {
  logs: LogWithMenu[];
  goals?: HealthGoals;
  timeRange: 'day' | 'week' | 'month';
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
  userId?: string;
}

export function OptimizedHealthSummary({
  logs,
  goals,
  timeRange,
  onTimeRangeChange,
  userId
}: OptimizedHealthSummaryProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'insights' | 'health-analysis' | 'meals'>('dashboard');
  const [selectedMetric, setSelectedMetric] = useState<'health' | 'frequency' | 'budget'>('health');

  const stats = useMemo(() => calculateUserStats(logs), [logs]);
  const healthData = useMemo(() => processHealthData(logs, timeRange), [logs, timeRange]);
  const categoryData = useMemo(() => processCategoryData(logs, timeRange), [logs, timeRange]);
  const insights = useMemo(() => generateBehaviorInsights(logs, stats), [logs, stats]);

  // BMI integration
  const { profile: bmiProfile, bmiInfo, updateProfile: updateBMIProfile } = useBMI(userId || '');
  const healthInsightExplanation = useMemo(() =>
    generateHealthInsightExplanation(stats, logs, bmiProfile),
    [stats, logs, bmiProfile]
  );

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4'
  };

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

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
        ? dayLogs.reduce((sum, log) => {
            const score = (log.menu?.healthScore ?? calcHealthScore(log.menu!));
            return sum + score;
          }, 0) / dayLogs.length
        : 0;

      const totalBudget = dayLogs.reduce((sum, log) => sum + ((log.menu?.price || 0) * log.quantity), 0);

      data.push({
        date: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        healthScore: Math.round(avgHealth),
        meals: dayLogs.length,
        healthyMeals: dayLogs.filter(log => (log.menu?.healthScore || 0) >= 70).length,
        budget: Math.round(totalBudget),
        hasData: dayLogs.length > 0
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
      category,
      percentage: Math.round((count / recentLogs.length) * 100)
    })).sort((a, b) => b.value - a.value);
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

  function getHealthScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }

  function getHealthScoreIcon(score: number): string {
    if (score >= 80) return '🎉';
    if (score >= 60) return '😊';
    if (score >= 40) return '😐';
    return '😟';
  }

  function calculateStabilityScore(data: typeof healthData): number {
    const validData = data.filter(d => d.hasData && d.healthScore > 0);
    if (validData.length < 2) return 0;

    const scores = validData.map(d => d.healthScore);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 100 - standardDeviation);
  }

  const stabilityScore = useMemo(() => calculateStabilityScore(healthData), [healthData]);
  const trendData = useMemo(() => {
    const validData = healthData.filter(d => d.hasData && d.healthScore > 0);
    if (validData.length < 2) return 'stable';

    const recent = validData.slice(-3);
    const earlier = validData.slice(0, -3);

    const recentAvg = recent.reduce((sum, d) => sum + d.healthScore, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, d) => sum + d.healthScore, 0) / earlier.length : recentAvg;

    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }, [healthData]);

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">สรุปสุขภาพ</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">ติดตามพัฒนาการสุขภาพของคุณ</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { value: 'day', label: 'วันนี้', icon: '☀️' },
            { value: 'week', label: '7 วัน', icon: '📅' },
            { value: 'month', label: '30 วัน', icon: '📊' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value as any)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${timeRange === range.value
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }
              `}
            >
              <span>{range.icon}</span>
              <span>{range.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getHealthScoreIcon(stats.averageHealthScore)}</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">คะแนนสุขภาพ</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.averageHealthScore)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                เฉลี่ยจาก {stats.totalLogs} มื้อ
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${healthInsightExplanation.overallStatus.color}`}>
              {healthInsightExplanation.overallStatus.label}
            </div>
          </div>

          {/* Mini trend indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.averageHealthScore)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {trendData === 'improving' ? '📈' : trendData === 'declining' ? '📉' : '➡️'}
            </span>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔥</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">สตรีคปัจจุบัน</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                วันติดต่อกัน
              </div>
            </div>
            <div className="text-2xl">⚡</div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>สถิติสูงสุด</span>
              <span>{stats.longestStreak} วัน</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.currentStreak / Math.max(1, stats.longestStreak)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meals Logged Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📝</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">มื้อที่บันทึก</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {timeRange === 'day' ? stats.weeklyLogs :
                 timeRange === 'week' ? stats.weeklyLogs :
                 stats.monthlyLogs}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ในช่วงเวลาที่เลือก
              </div>
            </div>
            <div className="text-2xl">🍽️</div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>เป้าหมาย</span>
              <span>{goals?.targetWeeklyLogs || 21} มื้อ/สัปดาห์</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.weeklyLogs / (goals?.targetWeeklyLogs || 21)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">งบประมาณ</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ฿{Math.round(
                  timeRange === 'day' ? healthData.reduce((sum, d) => sum + d.budget, 0) :
                  timeRange === 'week' ? healthData.reduce((sum, d) => sum + d.budget, 0) :
                  healthData.reduce((sum, d) => sum + d.budget, 0)
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                รวมทั้งหมด
              </div>
            </div>
            <div className="text-2xl">💳</div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>เฉลี่ย/มื้อ</span>
              <span>฿{stats.totalLogs > 0 ? Math.round(stats.totalBudget / stats.totalLogs) : 0}</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full" />
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">ดัชนีมวลกาย</div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {bmiInfo ? bmiInfo.value : '--'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {bmiInfo ? bmiInfo.categoryTH : 'ยังไม่ได้ใส่ข้อมูล'}
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
              bmiInfo ? bmiInfo.color : 'text-gray-500 bg-gray-50 border-gray-200'
            }`}>
              {bmiInfo ? bmiInfo.categoryTH : 'ไม่ทราบ'}
            </div>
          </div>

          {bmiInfo && (
            <div className="mt-4 space-y-3">
              {/* BMI Progress Bar */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    bmiInfo.category === 'underweight' ? 'bg-blue-400' :
                    bmiInfo.category === 'normal' ? 'bg-green-400' :
                    bmiInfo.category === 'overweight' ? 'bg-yellow-400' :
                    bmiInfo.category === 'obese' ? 'bg-orange-400' : 'bg-red-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (bmiInfo.value - 15) / 15 * 100))}%`
                  }}
                />
              </div>

              {/* Health Explanation */}
              <div className={`p-3 rounded-lg text-xs ${
                bmiInfo.category === 'normal' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                bmiInfo.category === 'underweight' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                bmiInfo.category === 'overweight' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{bmiInfo.icon}</span>
                  <div>
                    <p className={`font-medium mb-1 ${
                      bmiInfo.category === 'normal' ? 'text-green-800 dark:text-green-200' :
                      bmiInfo.category === 'underweight' ? 'text-blue-800 dark:text-blue-200' :
                      bmiInfo.category === 'overweight' ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-red-800 dark:text-red-200'
                    }`}>
                      {bmiInfo.category === 'normal' ? 'สุขภาพดี' :
                       bmiInfo.category === 'underweight' ? 'ควรเพิ่มน้ำหนัก' :
                       bmiInfo.category === 'overweight' ? 'ควรควบคุมน้ำหนัก' : 'ควรปรับปรุง'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {bmiInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Health Insight */}
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">คำแนะนำหลัก:</p>
                <p>• {bmiInfo.recommendations[0]}</p>
                {bmiInfo.healthRisks.length > 0 && (
                  <p className="mt-1 text-amber-600 dark:text-amber-400">
                    ⚠️ {bmiInfo.healthRisks[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {!bmiInfo && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveView('health-analysis')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                ใส่ข้อมูลส่วนสูงและน้ำหนัก →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {[
              { id: 'dashboard', label: 'ภาพรวม', icon: '📊' },
              { id: 'insights', label: 'ข้อมูลเชิงลึก', icon: '💡' },
              { id: 'health-analysis', label: 'วิเคราะห์สุขภาพ', icon: '🏥' },
              { id: 'meals', label: 'มื้ออาหาร', icon: '🍽️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2
                  ${activeView === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="p-6 space-y-8">
            {/* Health Score Trend */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">แนวโน้มคะแนนสุขภาพ</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">ความมั่นคง:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stabilityScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    stabilityScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {Math.round(stabilityScore)}%
                  </span>
                </div>
              </div>

              <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="healthScore"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      fill="url(#colorHealth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">สัดส่วนประเภทอาหาร</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${props.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">ประสิทธิภาพการบันทึก</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        {stats.healthyDays}
                      </div>
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">วันสุขภาพดี</div>
                        <div className="text-sm text-green-700 dark:text-green-300">คะแนน ≥70</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round((stats.healthyDays / Math.max(1, stats.totalLogs)) * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {stats.veggieMeals}
                      </div>
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100">มื้อที่มีผัก</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">โปรตีนและผัก</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round((stats.veggieMeals / Math.max(1, stats.totalLogs)) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                💡 ข้อมูลเชิงลึกสุขภาพของคุณ
              </h3>
              <div className="space-y-3">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                      <span className="text-lg mt-0.5">🎯</span>
                      <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-blue-700 dark:text-blue-300 text-center py-8">
                    เริ่มต้นบันทึกอาหารเพื่อรับข้อมูลเชิงลึกส่วนตัว
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">📈 สถิติสำคัญ</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">คะแนนเฉลี่ย</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.averageHealthScore)}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">มื้อที่บันทึกทั้งหมด</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.totalLogs} มื้อ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">มื้อสุขภาพดี</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{stats.healthyDays} มื้อ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">งบประมาณรวม</span>
                    <span className="font-medium text-gray-900 dark:text-white">฿{Math.round(stats.totalBudget)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">🎯 เป้าหมายการบรรลุผล</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ความมั่นคง</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">{Math.round(stabilityScore)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">แนวโน้ม</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {trendData === 'improving' ? 'ดีขึ้น' : trendData === 'declining' ? 'ลดลง' : 'คงที่'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ความสม่ำเสมอ</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {stats.weeklyLogs >= 14 ? 'ดี' : 'ควรปรับปรุง'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Analysis View */}
        {activeView === 'health-analysis' && (
          <div className="p-6 space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                🏥 วิเคราะห์สุขภาพแบบละเอียด
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                การวิเคราะห์สุขภาพอย่างครบถ้วนพร้อมคำแนะนำเฉพาะบุคคล
              </p>
            </div>

            {/* BMI Input Card */}
            {userId && (
              <BMIInputCard
                userId={userId}
                onProfileUpdate={updateBMIProfile}
              />
            )}

            {/* Comprehensive BMI Summary */}
            {bmiInfo && bmiProfile.height && bmiProfile.weight && (
              <BMIHealthSummary
                bmiInfo={bmiInfo}
                profile={bmiProfile}
              />
            )}

            {/* Health Insight Card */}
            <HealthInsightCard explanation={healthInsightExplanation} />
          </div>
        )}

        {/* Meals View */}
        {activeView === 'meals' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">ความถี่การบันทึกมื้ออาหาร</h3>
                <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="meals" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                      <Bar dataKey="healthyMeals" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">การใช้จ่ายงบประมาณ</h3>
                <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke={COLORS.purple}
                        strokeWidth={2}
                        dot={{ fill: COLORS.purple, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Meals Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">สรุปมื้อล่าสุด</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🥗</div>
                  <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {healthData.filter(d => d.healthyMeals > 0).length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">วันที่มีมื้อสุขภาพดี</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {healthData.reduce((sum, d) => sum + d.meals, 0)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">มื้อทั้งหมด</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    ฿{Math.round(healthData.reduce((sum, d) => sum + d.budget, 0))}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">งบประมาณรวม</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}