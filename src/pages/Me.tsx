import React, { useMemo, useState } from 'react';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { calcHealthScore } from '../utils/healthScore';
import LogCard from '../components/LogCard';
import { useAuth } from '../contexts/AuthContext';
import type { Log } from '../types/menu';

interface LogWithMenu extends Log {
  menu?: any; // Menu data
}

export default function Me() {
  const { user, userProfile } = useAuth();
  const { data: userLogs, isLoading, error: logsError } = useUserLogs();
  const { data: allMenus, error: menusError } = useMenus();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Filter logs by time period
  const filteredLogsWithMenus = useMemo(() => {
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
    }).filter(log => log.menu) as LogWithMenu[];
    
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
    
    console.log('Me: Filtered logs with menus:', filtered.length, 'filter:', timeFilter);
    return filtered;
  }, [userLogs, allMenus, timeFilter]);

  // Calculate health statistics
  const healthStats = useMemo(() => {
    if (!filteredLogsWithMenus.length) return { avgScore: 0, totalMeals: 0, totalQuantity: 0, streakDays: 0 };

    const scores = filteredLogsWithMenus.map(log => calcHealthScore(log.menu));
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    const totalMeals = filteredLogsWithMenus.length;
    const totalQuantity = filteredLogsWithMenus.reduce((sum, log) => sum + log.quantity, 0);
    
    // Calculate streak (simplified - just count consecutive days with logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const recentLogs = filteredLogsWithMenus.filter(log => log.at >= todayStart - (7 * 24 * 60 * 60 * 1000)); // Last 7 days
    const streakDays = recentLogs.length > 0 ? Math.min(recentLogs.length, 7) : 0;

    return { avgScore, totalMeals, totalQuantity, streakDays };
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
            กรุณาเข้าสู่ระบบด้วยอีเมลเพื่อดูประวัติการกินและบันทึกข้อมูลส่วนตัว
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
          {/* Health Summary */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                สรุปสุขภาพ
              </h2>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">กำลังโหลด...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">คะแนนสุขภาพเฉลี่ย:</span>
                  <span className={`text-2xl font-bold ${
                    healthStats.avgScore >= 80 ? 'text-green-600' :
                    healthStats.avgScore >= 60 ? 'text-yellow-600' :
                    healthStats.avgScore >= 40 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {healthStats.avgScore}
                  </span>
                </div>
                
                                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">มื้อที่กินแล้ว:</span>
                   <span className="text-lg font-semibold text-blue-600">{healthStats.totalMeals}</span>
                 </div>
                 
                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">จำนวนจานรวม:</span>
                   <span className="text-lg font-semibold text-indigo-600">{healthStats.totalQuantity}</span>
                 </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">วันติดต่อกัน:</span>
                  <span className="text-lg font-semibold text-purple-600">{healthStats.streakDays}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Badges */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                🏆 แบดจ์
              </h2>
            
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
        
                 <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
               ประวัติการกิน
             </h2>
             
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
               {filteredLogsWithMenus.map((log) => (
                 <LogCard key={log.id} log={log} menu={log.menu} />
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
