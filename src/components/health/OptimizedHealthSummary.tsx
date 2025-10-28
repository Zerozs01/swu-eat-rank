import React, { useState, useMemo } from 'react';
import type { LogWithMenu, HealthGoals, Menu } from '../../types/menu';
import { calculateUserStats } from '../../utils/badgeSystem';
import { generateHealthInsightExplanation } from '../../utils/healthInsightSystem';
import { BMIHealthSummary } from './BMIHealthSummary';
import { BMIInputCard } from './BMIInputCard';
import { useBMI } from '../../hooks/useBMI';
import { calcHealthScore } from '../../utils/healthScore';
import { Link } from 'react-router-dom';
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
  const [bmiOpen, setBmiOpen] = useState(false);
  const [bmiFormOpen, setBmiFormOpen] = useState(false);

  const stats = useMemo(() => calculateUserStats(logs), [logs]);
  const healthData = useMemo(() => processHealthData(logs, timeRange), [logs, timeRange]);
  const periodAverageHealthScore = useMemo(() => {
    // Average health score limited to selected timeRange
    const now = Date.now();
    let cutoff = now;
    if (timeRange === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    if (timeRange === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    const recent = timeRange === 'day' ? logs.filter(l => {
      const d = new Date(); d.setHours(0,0,0,0);
      return l.at >= d.getTime();
    }) : logs.filter(l => l.at >= cutoff);
    if (recent.length === 0) return 0;
    const scores = recent.map(l => (l.menu?.healthScore ?? calcHealthScore(l.menu as Menu)));
    return scores.reduce((a,b)=>a+b,0) / scores.length;
  }, [logs, timeRange]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categoryData = useMemo(() => processCategoryData(logs, timeRange), [logs, timeRange]);
  // const insights = useMemo(() => generateBehaviorInsights(logs, stats), [logs, stats]);

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

  // Utility: map 0-100% to Tailwind width classes (approximate)
  function toWidthClass(pct: number): string {
    const p = Math.max(0, Math.min(100, pct));
    if (p === 0) return 'w-0';
    if (p <= 10) return 'w-1/6';
    if (p <= 20) return 'w-1/4';
    if (p <= 30) return 'w-1/3';
    if (p <= 40) return 'w-2/5';
    if (p <= 50) return 'w-1/2';
    if (p <= 60) return 'w-3/5';
    if (p <= 70) return 'w-2/3';
    if (p <= 80) return 'w-3/4';
    if (p <= 90) return 'w-5/6';
    return 'w-full';
  }

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

  function processTasteData(logs: LogWithMenu[], timeRange: string) {
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
    const tasteCount = new Map<string, number>();

    recentLogs.forEach(log => {
      const tastes = log.menu?.tastes || [];
      tastes.forEach(t => tasteCount.set(t, (tasteCount.get(t) || 0) + 1));
    });

    const total = Math.max(1, recentLogs.length);
    return Array.from(tasteCount.entries()).map(([taste, count]) => ({
      name: getTasteName(taste),
      value: count,
      taste,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.value - a.value);
  }

  function getTasteName(taste: string): string {
    switch (taste) {
      case 'SWEET': return 'หวาน';
      case 'OILY': return 'มัน';
      case 'SPICY': return 'เผ็ด';
      case 'SOUR': return 'เปรี้ยว';
      case 'BLAND': return 'จืด';
      case 'SALTY': return 'เค็ม';
      default: return taste;
    }
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

  // Removed unused getHealthScoreColor

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tasteData = useMemo(() => processTasteData(logs, timeRange), [logs, timeRange]);
  const junkStats = useMemo(() => {
    const now = new Date();
    let cutoff = now.getTime();
    switch (timeRange) {
      case 'week': cutoff -= 7 * 24 * 60 * 60 * 1000; break;
      case 'month': cutoff -= 30 * 24 * 60 * 60 * 1000; break;
    }
    const recentLogs = logs.filter(l => timeRange === 'day' ? (new Date(l.at).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)) : l.at >= cutoff);
    const isJunk = (m?: Menu) => !m ? false : (m.category === 'FRIED' || (m.tastes || []).some(t => t === 'OILY' || t === 'SWEET') || m.category === 'DESSERT');
    const junkCount = recentLogs.reduce((acc, l) => acc + (isJunk(l.menu as Menu) ? 1 : 0), 0);
    const total = Math.max(1, recentLogs.length);
    return { junkCount, total, percent: Math.round((junkCount / total) * 100) };
  }, [logs, timeRange]);

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">สรุปสุขภาพ</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">ติดตามพัฒนาการสุขภาพของคุณ</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {([
            { value: 'day', label: 'วันนี้', icon: '☀️' },
            { value: 'week', label: '7 วัน', icon: '📅' },
            { value: 'month', label: '30 วัน', icon: '📊' }
          ] as const).map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange(range.value)}
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

      {/* Key Metrics Cards - Mobile carousel */}
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4">
          {/* Health Score Card */}
          <div className="min-w-[80%] snap-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getHealthScoreIcon(stats.averageHealthScore)}</span>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">คะแนนสุขภาพ</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(periodAverageHealthScore)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  เฉลี่ยจาก {(() => { const total = healthData.reduce((sum,d)=>sum + d.meals,0); return total; })()} มื้อ
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${healthInsightExplanation.overallStatus.color}`}>
                {healthInsightExplanation.overallStatus.label}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <span className="text-xs text-gray-500">แนวโน้ม {trendData === 'improving' ? '📈' : trendData === 'declining' ? '📉' : '➡️'}</span>
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="min-w-[80%] snap-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">สตรีคปัจจุบัน</div>
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">วันติดต่อกัน</div>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">สถิติสูงสุด: {stats.longestStreak} วัน</div>
          </div>

          {/* Meals Logged Card */}
          <div className="min-w-[80%] snap-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📝</span>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">มื้อที่บันทึก</div>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {timeRange === 'day' ? stats.weeklyLogs : timeRange === 'week' ? stats.weeklyLogs : stats.monthlyLogs}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ในช่วงเวลาที่เลือก</div>
              </div>
              <div className="text-2xl">🍽️</div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">เป้าหมาย: {goals?.targetWeeklyLogs || 21} มื้อ/สัปดาห์</div>
          </div>

          {/* Budget Card */}
          <div className="min-w-[80%] snap-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">งบประมาณ</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ฿{Math.round(healthData.reduce((sum, d) => sum + d.budget, 0))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">รวมทั้งหมด</div>
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
        </div>
      </div>

      {/* Key Metrics Cards - Desktop grid */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getHealthScoreIcon(stats.averageHealthScore)}</span>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">คะแนนสุขภาพ</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(periodAverageHealthScore)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                เฉลี่ยจาก {healthData.reduce((sum,d)=>sum + d.meals,0)} มื้อ
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
                className={`bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500 ${toWidthClass(periodAverageHealthScore)}`}
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
                className={`bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500 ${toWidthClass((stats.currentStreak / Math.max(1, stats.longestStreak)) * 100)}`}
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
                className={`bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500 ${toWidthClass((stats.weeklyLogs / (goals?.targetWeeklyLogs || 21)) * 100)}`}
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

        {/* BMI Card (collapsible) */}
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
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setBmiOpen(!bmiOpen)}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {bmiOpen ? 'ซ่อนคำแนะนำ ▲' : 'ดูคำแนะนำ ▼'}
            </button>
          </div>

          {bmiInfo && bmiOpen && (
            <div className="space-y-3">
              {/* BMI Progress Bar */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    bmiInfo.category === 'underweight' ? 'bg-blue-400' :
                    bmiInfo.category === 'normal' ? 'bg-green-400' :
                    bmiInfo.category === 'overweight' ? 'bg-yellow-400' :
                    bmiInfo.category === 'obese' ? 'bg-orange-400' : 'bg-red-400'
                  } ${toWidthClass(Math.min(100, Math.max(0, (bmiInfo.value - 15) / 15 * 100)))}`}
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

          {/* Removed edit link to avoid duplication with BMI analysis */}
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {([
              { id: 'dashboard', label: 'ภาพรวม', icon: '📊' },
              { id: 'insights', label: 'ข้อมูลเชิงลึก', icon: '💡' },
              { id: 'health-analysis', label: 'วิเคราะห์สุขภาพ', icon: '🏥' },
              { id: 'meals', label: 'มื้ออาหาร', icon: '🍽️' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                {(() => {
                  const daysWithData = healthData.filter(d => d.hasData).length;
                  const safeDenom = Math.max(1, daysWithData);
                  const healthy = healthData.filter(d => d.hasData && d.healthScore >= 70).length;
                  const moderate = healthData.filter(d => d.hasData && d.healthScore >= 50 && d.healthScore < 70).length;
                  const poor = healthData.filter(d => d.hasData && d.healthScore < 50).length;
                  const healthyPct = Math.round((healthy / safeDenom) * 100);
                  const moderatePct = Math.round((moderate / safeDenom) * 100);
                  const poorPct = Math.min(100, Math.max(0, 100 - healthyPct - moderatePct));
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {healthy}
                          </div>
                          <div>
                            <div className="font-medium text-green-900 dark:text-green-100">วันสุขภาพดี</div>
                            <div className="text-sm text-green-700 dark:text-green-300">คะแนน ≥70</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyPct}%</div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                            {moderate}
                          </div>
                          <div>
                            <div className="font-medium text-yellow-900 dark:text-yellow-100">วันสุขภาพปานกลาง</div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">50–69 คะแนน</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{moderatePct}%</div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {poor}
                          </div>
                          <div>
                            <div className="font-medium text-red-900 dark:text-red-100">วันสุขภาพแย่</div>
                            <div className="text-sm text-red-700 dark:text-red-300">น้อยกว่า 50 คะแนน</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{poorPct}%</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div className="p-6 space-y-6">
            {/* Status + Factors summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {healthInsightExplanation.overallStatus.icon} สถานะสุขภาพ: {healthInsightExplanation.overallStatus.label}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {bmiInfo
                      ? `สุขภาพของคุณอยู่ในเกณฑ์${healthInsightExplanation.overallStatus.label} และมี BMI ${bmiInfo.value} (${bmiInfo.categoryTH})`
                      : `สุขภาพของคุณอยู่ในเกณฑ์${healthInsightExplanation.overallStatus.label}`}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${healthInsightExplanation.overallStatus.color}`}>
                  {healthInsightExplanation.overallStatus.label}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">ปัจจัยหลัก:</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• คะแนนสุขภาพเฉลี่ย: คะแนนเฉลี่ย {Math.round(periodAverageHealthScore)}/100 แสดงถึง{periodAverageHealthScore >= 70 ? 'การเลือกอาหารที่ดีต่อสุขภาพ' : periodAverageHealthScore >= 50 ? 'การเลือกอาหารปานกลาง' : 'การเลือกอาหารที่ควรปรับปรุง'}</li>
                  <li>• ความสม่ำเสมอ: บันทึก {stats.weeklyLogs} มื้อต่อสัปดาห์ {stats.weeklyLogs >= 14 ? 'สม่ำเสมอดี' : 'ไม่สม่ำเสมอเท่าที่ควร'}</li>
                  {bmiInfo && (
                    <li>• ดัชนีมวลกาย (BMI): BMI {bmiInfo.value} ({bmiInfo.categoryTH}) {bmiInfo.category === 'normal' ? 'อยู่ในเกณฑ์ปกติ' : 'อาจเสี่ยงต่อสุขภาพ'}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">📈 สถิติสำคัญ</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">คะแนนเฉลี่ย</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round(periodAverageHealthScore)}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">มื้อที่บันทึกทั้งหมด</span>
                    <span className="font-medium text-gray-900 dark:text-white">{healthData.reduce((sum,d)=>sum + d.meals,0)} มื้อ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">วันสุขภาพดี</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{healthData.filter(d => d.healthyMeals > 0).length} วัน</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">งบประมาณรวม</span>
                    <span className="font-medium text-gray-900 dark:text-white">฿{Math.round(healthData.reduce((sum,d)=>sum + d.budget,0))}</span>
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

            {/* BMI Input (toggle) */}
            {userId && (
              <div className="flex justify-end">
                <button
                  onClick={() => setBmiFormOpen(!bmiFormOpen)}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
                >
                  {bmiProfile?.height && bmiProfile?.weight ? 'แก้ไขข้อมูลสุขภาพ' : 'กรอกข้อมูลสุขภาพ'}
                </button>
              </div>
            )}

            {userId && bmiFormOpen && (
              <BMIInputCard
                userId={userId}
                onProfileUpdate={(p) => updateBMIProfile?.(p)}
                className="mt-2"
              />
            )}

            {/* Comprehensive BMI Summary */}
            {bmiInfo && bmiProfile.height && bmiProfile.weight && (
              <BMIHealthSummary
                bmiInfo={bmiInfo}
                profile={bmiProfile}
                showAdvice={false}
              />
            )}

            {/* Risks + Recommendations combined block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 border bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3">⚠️ ความเสี่ยงต่อสุขภาพ</h4>
                <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                  {(bmiInfo?.healthRisks?.length ? bmiInfo.healthRisks : healthInsightExplanation.overallStatus.concerns).slice(0,5).map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                  {(!bmiInfo || (bmiInfo && bmiInfo.healthRisks.length === 0)) && healthInsightExplanation.overallStatus.relatedConditions.slice(0,2).map((c, idx) => (
                    <li key={`cond-${idx}`}>เสี่ยงต่อ{c.nameTH}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-6 border bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3">💡 คำแนะนำ</h4>
                <ul className="list-disc list-inside text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                  {(bmiInfo?.recommendations?.length ? bmiInfo.recommendations : healthInsightExplanation.overallStatus.recommendations || []).slice(0,5).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                  {(!bmiInfo || (bmiInfo && bmiInfo.recommendations.length < 3)) && healthInsightExplanation.actionableAdvice.slice(0,2).map((a, idx) => (
                    <li key={`adv-${idx}`}>{a.advice}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Meals View */}
        {activeView === 'meals' && (
          <div className="p-6 space-y-6">
            {/* Action Plan moved here with links to filtered menus */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">🎯 แผนการดำเนินการ</h3>
              </div>
              {(() => {
                // Recommend categories based on BMI/status
                const recCats: { key: string; label: string }[] = [];
                if (bmiInfo?.category === 'underweight') {
                  recCats.push({ key: 'RICE', label: 'เมนูข้าว (เพิ่มโปรตีน/แคลอรี่)' });
                  recCats.push({ key: 'NOODLE', label: 'ก๋วยเตี๋ยว (เพิ่มโปรตีน)' });
                } else if (bmiInfo?.category === 'overweight' || bmiInfo?.category === 'obese' || bmiInfo?.category === 'severely_obese') {
                  recCats.push({ key: 'RICE', label: 'ข้าว (เลือกต้ม/นึ่ง/ปิ้ง)' });
                  recCats.push({ key: 'NOODLE', label: 'ก๋วยเตี๋ยว (เลี่ยงทอด)' });
                } else {
                  recCats.push({ key: 'RICE', label: 'ข้าว' });
                  recCats.push({ key: 'NOODLE', label: 'ก๋วยเตี๋ยว' });
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {recCats.map(cat => (
                      <Link
                        key={cat.key}
                        to="/search"
                        state={{ category: cat.key }}
                        className="px-3 py-1.5 text-sm rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        aria-label={`ดูเมนูประเภท ${cat.label}`}
                      >
                        🔎 {cat.label}
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>
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

            {/* Recent Meals Summary (Category/Taste/Junk) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">สรุปมื้อล่าสุด</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">ประเภทอาหารที่กินบ่อย</div>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    {categoryData.slice(0,3).map((c, idx) => (
                      <li key={idx}>• {c.name} — {c.percentage}%</li>
                    ))}
                    {categoryData.length === 0 && <li className="text-green-700 dark:text-green-300">ไม่มีข้อมูล</li>}
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">รสชาติที่ชอบ</div>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {tasteData.slice(0,3).map((t, idx) => (
                      <li key={idx}>• {t.name} — {t.percentage}%</li>
                    ))}
                    {tasteData.length === 0 && <li className="text-blue-700 dark:text-blue-300">ไม่มีข้อมูล</li>}
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🍟</div>
                  <div className="text-lg font-semibold text-amber-900 dark:text-amber-100">{junkStats.junkCount}</div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">Junk food ({junkStats.percent}%)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}