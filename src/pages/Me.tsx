import React, { useMemo, useRef, useState } from 'react';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { calcHealthScore } from '../utils/healthScore';
import LogCard from '../components/LogCard';
import { EnhancedMealHistory } from '../components/meal/EnhancedMealHistory';
import { useAuth } from '../contexts/AuthContext';
import type { Log, Menu, Taste, LogWithMenu, Badge } from '../types/menu';
import HealthOverview, { type Dimension, type TimeRange } from '../components/health/HealthOverview';
import { OptimizedHealthSummary } from '../components/health/OptimizedHealthSummary';
import { BadgeCollection, EnhancedBadge } from '../components/badges/EnhancedBadge';
import { checkBadgeEligibility, getBadgesByCategory, sortBadges, calculateUserStats } from '../utils/badgeSystem';


export default function Me() {
  const { user, userProfile } = useAuth();
  const { data: userLogs, isLoading, error: logsError } = useUserLogs();
  const { menus: allMenus, error: menusError } = useMenus();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [activeBadgeTab, setActiveBadgeTab] = useState<'all' | 'streaks' | 'meals' | 'health' | 'nutrition'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // Pie controls
  const [pieTime, setPieTime] = useState<TimeRange>('day');
  const [pieDim, setPieDim] = useState<Dimension>('category');
  const [historyFocus, setHistoryFocus] = useState<{ dim: Dimension; key: string } | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  // Metric panel timeframe
  const [metricTime, setMetricTime] = useState<TimeRange>('week');

  // Filter logs by time period
  const filteredLogsWithMenus = useMemo<Array<Log & { menu: Menu }>>(() => {
    console.log('Me: userLogs:', userLogs);
    console.log('Me: allMenus:', allMenus);
    
    if (!userLogs || !allMenus) {
      console.log('Me: Missing data, returning empty array');
      return [];
    }

    const combined = userLogs.map(log => {
      const menu = allMenus.find(m => m.id === log.menuId);
      console.log('Me: Log', log.id, 'menu found:', !!menu, 'menuId:', log.menuId);
      return { ...log, menu };
    }).filter((log): log is Log & { menu: Menu } => Boolean(log.menu));
    
    // Apply time filter
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());
    
         let filtered = combined;
     switch (timeFilter) {
       case 'today':
         filtered = combined.filter(log => log.at >= today.getTime());
         break;
       case 'week':
         filtered = combined.filter(log => log.at >= weekAgo.getTime());
         break;
       case 'month':
         filtered = combined.filter(log => log.at >= monthAgo.getTime());
         break;
       case 'all':
       default:
         filtered = combined;
         break;
     }
     
     // Apply visibility filter
     if (visibilityFilter !== 'all') {
       filtered = filtered.filter(log => log.visibility === visibilityFilter);
     }
     
     console.log('Me: Filtered logs with menus:', filtered.length, 'filter:', timeFilter, 'visibility:', visibilityFilter);
     return filtered;
   }, [userLogs, allMenus, timeFilter, visibilityFilter]);

  // Logs subset for pie based on pieTime (day/week/month) from all combined logs
  const pieLogs = useMemo<LogWithMenu[]>(() => {
    if (!userLogs || !allMenus) return [] as LogWithMenu[];
    const combined = userLogs
      .map(log => ({ ...log, menu: allMenus.find(m => m.id === log.menuId) }))
      .filter((l): l is LogWithMenu & { menu: Menu } => Boolean(l.menu));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());
    switch (pieTime) {
      case 'day':
        return combined.filter(l => l.at >= today.getTime());
      case 'week':
        return combined.filter(l => l.at >= weekAgo.getTime());
      case 'month':
      default:
        return combined.filter(l => l.at >= monthAgo.getTime());
    }
  }, [userLogs, allMenus, pieTime]);

  // Logs subset for metric panel
  const metricLogs = useMemo<LogWithMenu[]>(() => {
    if (!userLogs || !allMenus) return [] as LogWithMenu[];
    const combined = userLogs
      .map(log => ({ ...log, menu: allMenus.find(m => m.id === log.menuId) }))
      .filter((l): l is LogWithMenu & { menu: Menu } => Boolean(l.menu));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());
    switch (metricTime) {
      case 'day':
        return combined.filter(l => l.at >= today.getTime());
      case 'week':
        return combined.filter(l => l.at >= weekAgo.getTime());
      case 'month':
      default:
        return combined.filter(l => l.at >= monthAgo.getTime());
    }
  }, [userLogs, allMenus, metricTime]);

  const metricStats = useMemo(() => {
    if (!metricLogs.length) {
      return {
        avgScore: 0,
        totalMeals: 0,
        totalQuantity: 0,
        publicLogs: 0,
        privateLogs: 0,
        budgetTotal: 0,
      };
    }
    const avgScore = Math.round(
      metricLogs.reduce((sum, l) => sum + calcHealthScore(l.menu!), 0) / metricLogs.length
    );
    const totalMeals = metricLogs.length;
    const totalQuantity = metricLogs.reduce((s, l) => s + l.quantity, 0);
    const publicLogs = metricLogs.filter(l => l.visibility === 'public').length;
    const privateLogs = metricLogs.filter(l => l.visibility === 'private').length;
    // Budget spent in current metricTime window
    const budgetTotal = metricLogs.reduce((s, l) => s + ((l.menu?.price ?? 0) * l.quantity), 0);
    return { avgScore, totalMeals, totalQuantity, publicLogs, privateLogs, budgetTotal };
  }, [metricLogs]);

  // Calculate health statistics
  const healthStats = useMemo(() => {
    if (!filteredLogsWithMenus.length) return { avgScore: 0, totalMeals: 0, totalQuantity: 0, streakDays: 0, publicLogs: 0, privateLogs: 0 };

  const scores = filteredLogsWithMenus.map(log => calcHealthScore(log.menu));
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    const totalMeals = filteredLogsWithMenus.length;
    const totalQuantity = filteredLogsWithMenus.reduce((sum, log) => sum + log.quantity, 0);
    
    // Calculate visibility stats
    const publicLogs = filteredLogsWithMenus.filter(log => log.visibility === 'public').length;
    const privateLogs = filteredLogsWithMenus.filter(log => log.visibility === 'private').length;
    
    // Calculate streak (simplified - just count consecutive days with logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const recentLogs = filteredLogsWithMenus.filter(log => log.at >= todayStart - (7 * 24 * 60 * 60 * 1000)); // Last 7 days
    const streakDays = recentLogs.length > 0 ? Math.min(recentLogs.length, 7) : 0;

    return { avgScore, totalMeals, totalQuantity, streakDays, publicLogs, privateLogs };
  }, [filteredLogsWithMenus]);

  // Enhanced badge calculation
  const allUserLogs = useMemo<LogWithMenu[]>(() => {
    if (!userLogs || !allMenus) return [];
    return userLogs
      .map(log => ({ ...log, menu: allMenus.find(m => m.id === log.menuId) }))
      .filter((l): l is LogWithMenu & { menu: Menu } => Boolean(l.menu));
  }, [userLogs, allMenus]);

  const userStats = useMemo(() => calculateUserStats(allUserLogs), [allUserLogs]);

  // Enhanced badge calculation with original logic
  const allBadges = useMemo(() => checkBadgeEligibility(userStats, allUserLogs), [userStats, allUserLogs]);
  const sortedBadges = useMemo(() => sortBadges(allBadges), [allBadges]);
  const categorizedBadges = useMemo(() => getBadgesByCategory(allBadges), [allBadges]);

  // Legacy badges for compatibility
  const badges = useMemo(() => {
    const { avgScore, totalMeals, streakDays } = healthStats;

    return [
      {
        id: 'healthy-week',
        icon: '🥗',
        title: 'กินผัก 7 วัน',
        earned: streakDays >= 7,
        color: 'yellow'
      },
      {
        id: 'healthy-score',
        icon: '🏃',
        title: 'สุขภาพดี 5 วัน',
        earned: avgScore >= 70,
        color: 'green'
      },
      {
        id: 'log-10',
        icon: '📊',
        title: 'บันทึก 10 มื้อ',
        earned: totalMeals >= 10,
        color: 'blue'
      },
      {
        id: 'goal-30',
        icon: '🎯',
        title: 'เป้าหมาย 30 วัน',
        earned: totalMeals >= 30,
        color: 'purple'
      }
    ];
  }, [healthStats]);

  // Show login prompt if not authenticated or anonymous user
  if (!user || !userProfile?.email) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            ต้องเข้าสู่ระบบก่อน
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            กรุณาเข้าสู่ระบบเพื่อดูหรือบันทึกข้อมูลประวัติการกิน
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            กลับไปหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            👤 {userProfile?.displayName || 'ฉัน'}
          </h1>
          {userProfile?.faculty && (
            <p className="text-gray-600 dark:text-gray-300">
              คณะ: {userProfile.faculty}
            </p>
          )}
        </div>
        
        {/* Optimized Health Summary */}
        <OptimizedHealthSummary
          logs={allUserLogs}
          goals={userProfile?.goals}
          timeRange={metricTime}
          onTimeRangeChange={(range) => setMetricTime(range as 'day' | 'week' | 'month')}
          userId={user?.id}
        />

        {/* Enhanced Badge System */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🏆 เหรียญตราของคุณ (AI-Powered)</h2>
            <div className="text-sm text-gray-500">
              ได้รับ {allBadges.filter(b => b.isEarned).length} / {allBadges.length} เหรียญตรา
            </div>
          </div>

          {/* Badge category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'all', label: 'ทั้งหมด', count: allBadges.length },
              { id: 'streaks', label: 'สตรีค', count: categorizedBadges.streaks.length },
              { id: 'meals', label: 'มื้ออาหาร', count: categorizedBadges.meals.length },
              { id: 'health', label: 'สุขภาพ', count: categorizedBadges.health.length },
              { id: 'nutrition', label: 'โภชนาการ', count: categorizedBadges.nutrition.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveBadgeTab(tab.id as any)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeBadgeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 text-xs bg-gray-200 bg-opacity-30 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Get filtered badges based on active tab */}
          {(() => {
            const displayedBadges = activeBadgeTab === 'all' ? sortedBadges :
              activeBadgeTab === 'streaks' ? categorizedBadges.streaks :
              activeBadgeTab === 'meals' ? categorizedBadges.meals :
              activeBadgeTab === 'health' ? categorizedBadges.health :
              categorizedBadges.nutrition;

            return (
              <BadgeCollection
                badges={displayedBadges}
                showProgress={true}
                maxBadgesPerRow={4}
                onBadgeClick={(badge) => setSelectedBadge(badge)}
              />
            );
          })()}
        </div>

        {/* User Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">สตรีคปัจจุบัน</div>
                <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">สตรีคยาวสุด</div>
                <div className="text-2xl font-bold text-purple-600">{userStats.longestStreak}</div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">มื้อผัก</div>
                <div className="text-2xl font-bold text-green-600">{userStats.veggieMeals}</div>
              </div>
              <div className="text-3xl">🥬</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">มื้อโปรตีน</div>
                <div className="text-2xl font-bold text-red-600">{userStats.proteinMeals}</div>
              </div>
              <div className="text-3xl">🥩</div>
            </div>
          </div>
        </div>
  
        {/* Enhanced Meal History */}
        {!isLoading && !logsError && !menusError && (
          <EnhancedMealHistory
            logs={filteredLogsWithMenus}
            onHistoryFocus={(dim, key) => setHistoryFocus({ dim: dim as Dimension, key })}
          />
        )}

        {/* Loading and Error States */}
        {(isLoading || logsError || menusError) && (
          <div ref={historyRef} className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังโหลดประวัติ...</p>
              </div>
            )}

            {(logsError || menusError) && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                <p className="text-sm text-gray-500">
                  {logsError && `Logs: ${logsError.message}`}
                  {menusError && `Menus: ${menusError.message}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
