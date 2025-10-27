import React, { useMemo, useState } from 'react';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { EnhancedMealHistory } from '../components/meal/EnhancedMealHistory';
import { useAuth } from '../contexts/AuthContext';
import type { Log, Menu, LogWithMenu } from '../types/menu';
import { OptimizedHealthSummary } from '../components/health/OptimizedHealthSummary';
import { BadgeCollection } from '../components/badges/EnhancedBadge';
import { checkBadgeEligibility, getBadgesByCategory, sortBadges, calculateUserStats } from '../utils/badgeSystem';


export default function Me() {
  const { user, userProfile } = useAuth();
  const { data: userLogs, isLoading, error: logsError } = useUserLogs();
  const { menus: allMenus, error: menusError } = useMenus();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [activeBadgeTab, setActiveBadgeTab] = useState<'all' | 'streaks' | 'meals' | 'health' | 'nutrition'>('all');
  
  // Metric panel timeframe for OptimizedHealthSummary
  const [metricTime, setMetricTime] = useState<'day' | 'week' | 'month'>('week');

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

  // Removed unused local pie/metric calculations (now handled by OptimizedHealthSummary)

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
          userId={user?.uid}
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
                onClick={() => setActiveBadgeTab(tab.id as 'all' | 'streaks' | 'meals' | 'health' | 'nutrition')}
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
  
        {/* Time and visibility filters for history */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'today', label: 'วันนี้' },
              { id: 'week', label: '7 วัน' },
              { id: 'month', label: '30 วัน' },
              { id: 'all', label: 'ทั้งหมด' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setTimeFilter(btn.id as 'today' | 'week' | 'month' | 'all')}
                className={`px-3 py-2 text-sm rounded-md font-medium ${
                  timeFilter === btn.id
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'public', label: 'สาธารณะ' },
              { id: 'private', label: 'ส่วนตัว' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setVisibilityFilter(btn.id as 'all' | 'public' | 'private')}
                className={`px-3 py-2 text-sm rounded-md font-medium ${
                  visibilityFilter === btn.id
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Meal History */}
        {!isLoading && !logsError && !menusError && (
          <EnhancedMealHistory
            logs={filteredLogsWithMenus}
          />
        )}

        {/* Loading and Error States */}
        {(isLoading || logsError || menusError) && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
