import React, { useMemo, useRef, useState } from 'react';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { calcHealthScore } from '../utils/healthScore';
import LogCard from '../components/LogCard';
import { useAuth } from '../contexts/AuthContext';
import type { Log, Menu, Taste } from '../types/menu';
import HealthOverview, { type Dimension, type TimeRange } from '../components/health/HealthOverview';

interface LogWithMenu extends Log {
  menu?: Menu; // Menu data
}

export default function Me() {
  const { user, userProfile } = useAuth();
  const { data: userLogs, isLoading, error: logsError } = useUserLogs();
  const { menus: allMenus, error: menusError } = useMenus();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
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

  // Calculate badges
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Overview with Pie */}
          <HealthOverview
            logs={pieLogs}
            timeRange={pieTime}
            onChangeTimeRange={setPieTime}
            dimension={pieDim}
            onChangeDimension={setPieDim}
            onSliceClick={(dim, key) => {
              setHistoryFocus({ dim, key });
              setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            }}
          />

          {/* Metrics + Badges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">สถิติ & แบดจ์</h2>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['day','week','month'] as TimeRange[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setMetricTime(t)}
                    className={`px-2 py-1 rounded-md text-sm ${metricTime===t ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {t==='day'?'วัน':t==='week'?'สัปดาห์':'เดือน'}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <div className="text-sm text-gray-600 dark:text-gray-300">คะแนนสุขภาพเฉลี่ย</div>
                <div className={`text-2xl font-bold ${
                  metricStats.avgScore >= 80 ? 'text-green-600' :
                  metricStats.avgScore >= 60 ? 'text-yellow-600' :
                  metricStats.avgScore >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>{metricStats.avgScore}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <div className="text-sm text-gray-600 dark:text-gray-300">มื้อที่บันทึก</div>
                <div className="text-2xl font-bold text-blue-600">{metricStats.totalMeals}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <div className="text-sm text-gray-600 dark:text-gray-300">จำนวนจานรวม</div>
                <div className="text-2xl font-bold text-indigo-600">{metricStats.totalQuantity}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">สาธารณะ / ส่วนตัว</div>
                <div className="flex items-center gap-2">
                  {/* 10 segments: น้ำเงิน=สาธารณะ, ส้ม=ส่วนตัว */}
                  {(() => {
                    const total = metricStats.publicLogs + metricStats.privateLogs || 1;
                    const totalSegs = 10;
                    const pubSegs = Math.round((metricStats.publicLogs / total) * totalSegs);
                    return (
                      <div className="flex-1 flex gap-0.5">
                        {Array.from({ length: totalSegs }).map((_, i) => (
                          <div key={i} className={`h-2 flex-1 rounded-sm ${i < pubSegs ? 'bg-blue-500' : 'bg-orange-500'}`} />
                        ))}
                      </div>
                    );
                  })()}
                  <div className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {metricStats.publicLogs} / {metricStats.privateLogs}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget summary (linked to วัน/สัปดาห์/เดือน filter) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">งบที่ใช้</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metricTime==='day' ? 'รายวัน' : metricTime==='week' ? 'รายสัปดาห์' : 'รายเดือน'}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metricStats.budgetTotal.toLocaleString('th-TH', { maximumFractionDigits: 0 })} บาท
              </div>
            </div>

            {/* Badges */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">🏆 แบดจ์</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-lg transition-all ${
                    badge.earned
                      ? badge.color === 'yellow' ? 'bg-yellow-100' :
                        badge.color === 'green' ? 'bg-green-100' :
                        badge.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <div className={`text-sm font-medium ${
                    badge.earned
                      ? badge.color === 'yellow' ? 'text-yellow-800' :
                        badge.color === 'green' ? 'text-green-800' :
                        badge.color === 'blue' ? 'text-blue-800' : 'text-purple-800'
                      : 'text-gray-600'
                  }`}>
                    {badge.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div ref={historyRef} className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">ประวัติการกิน</h2>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Time Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  สัปดาห์
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  เดือน
                </button>
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  ทั้งหมด
                </button>
              </div>
              {/* Visibility Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    visibilityFilter === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setVisibilityFilter('public')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    visibilityFilter === 'public'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  🌐 สาธารณะ
                </button>
                <button
                  onClick={() => setVisibilityFilter('private')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    visibilityFilter === 'private'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  🔒 ส่วนตัว
                </button>
              </div>
            </div>
          </div>

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

          {!isLoading && filteredLogsWithMenus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่มีประวัติการกินในช่วงเวลาที่เลือก</p>
              <p className="text-sm text-gray-400 mt-2">ลองเปลี่ยนช่วงเวลาหรือไปบันทึกเมนูใหม่ดูสิ!</p>
            </div>
          )}

          {!isLoading && filteredLogsWithMenus.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLogsWithMenus.map((log) => {
                const m = log.menu;
                const isFocus = historyFocus ? (
                  historyFocus.dim === 'category' ? m?.category === historyFocus.key :
                  historyFocus.dim === 'taste' ? (m?.tastes?.includes(historyFocus.key as Taste) ?? false) :
                  historyFocus.dim === 'canteen' ? m?.location === historyFocus.key : false
                ) : false;
                return (
                  <div key={log.id} className={isFocus ? 'ring-2 ring-primary-500 rounded-lg' : ''}>
                    <LogCard log={log} menu={m!} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
