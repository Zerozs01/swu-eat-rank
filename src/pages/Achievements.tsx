import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import type { Menu, LogWithMenu } from '../types/menu';
import { BadgeCollection } from '../components/badges/EnhancedBadge';
import { calculateUserStats, checkBadgeEligibility, getBadgesByCategory, sortBadges } from '../utils/badgeSystem';

export default function Achievements() {
  const { user, userProfile } = useAuth();
  const { data: userLogs, isLoading, error: logsError } = useUserLogs();
  const { menus: allMenus, error: menusError } = useMenus();
  const [activeBadgeTab, setActiveBadgeTab] = useState<'all' | 'streaks' | 'meals' | 'health' | 'nutrition'>('all');

  const allUserLogs = useMemo<LogWithMenu[]>(() => {
    if (!userLogs || !allMenus) return [];
    return userLogs
      .map(log => ({ ...log, menu: allMenus.find(m => m.id === log.menuId) }))
      .filter((l): l is LogWithMenu & { menu: Menu } => Boolean(l.menu));
  }, [userLogs, allMenus]);

  const userStats = useMemo(() => calculateUserStats(allUserLogs), [allUserLogs]);
  const allBadges = useMemo(() => checkBadgeEligibility(userStats, allUserLogs), [userStats, allUserLogs]);
  const sortedBadges = useMemo(() => sortBadges(allBadges), [allBadges]);
  const categorizedBadges = useMemo(() => getBadgesByCategory(allBadges), [allBadges]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {!user || !userProfile?.email ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">ต้องเข้าสู่ระบบก่อน</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">กรุณาเข้าสู่ระบบเพื่อดูเหรียญตราของคุณ</p>
              <a href="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors inline-block">
                กลับไปหน้าแรก
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🏆 เหรียญตรา (AI-Powered)</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">ได้รับ {allBadges.filter(b => b.isEarned).length} / {allBadges.length} เหรียญตรา</p>
              </div>
              <a href="/me" className="text-sm px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                ← กลับไปโปรไฟล์
              </a>
            </div>

            {/* Tabs */}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeBadgeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-gray-200 bg-opacity-30 px-2 py-1 rounded-full">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              {(() => {
                const displayedBadges = activeBadgeTab === 'all' ? sortedBadges :
                  activeBadgeTab === 'streaks' ? categorizedBadges.streaks :
                  activeBadgeTab === 'meals' ? categorizedBadges.meals :
                  activeBadgeTab === 'health' ? categorizedBadges.health :
                  categorizedBadges.nutrition;

                return (
                  <BadgeCollection badges={displayedBadges} showProgress={true} maxBadgesPerRow={4} />
                );
              })()}
            </div>
          </>
        )}

        {/* Loading/Error */}
        {(isLoading || logsError || menusError) && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {isLoading && <p className="text-gray-600">กำลังโหลดข้อมูล...</p>}
            {(logsError || menusError) && (
              <p className="text-red-600 mt-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
