import React, { useMemo } from 'react';
import { useUserLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { calcHealthScore } from '../utils/healthScore';
import MenuCard from '../components/MenuCard';
import type { Log } from '../types/menu';

interface LogWithMenu extends Log {
  menu?: any; // Menu data
}

export default function Me() {
  const { data: userLogs, isLoading } = useUserLogs();
  const { data: allMenus } = useMenus();

  // Combine logs with menu data
  const logsWithMenus = useMemo(() => {
    if (!userLogs || !allMenus) return [];

    return userLogs.map(log => {
      const menu = allMenus.find(m => m.id === log.menuId);
      return { ...log, menu };
    }).filter(log => log.menu) as LogWithMenu[];
  }, [userLogs, allMenus]);

  // Calculate health statistics
  const healthStats = useMemo(() => {
    if (!logsWithMenus.length) return { avgScore: 0, totalMeals: 0, streakDays: 0 };

    const scores = logsWithMenus.map(log => calcHealthScore(log.menu));
    const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    const totalMeals = logsWithMenus.length;
    
    // Calculate streak (simplified - just count consecutive days with logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const recentLogs = logsWithMenus.filter(log => log.at >= todayStart - (7 * 24 * 60 * 60 * 1000)); // Last 7 days
    const streakDays = recentLogs.length > 0 ? Math.min(recentLogs.length, 7) : 0;

    return { avgScore, totalMeals, streakDays };
  }, [logsWithMenus]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          👤 ฉัน
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                  <span className="text-gray-600">วันติดต่อกัน:</span>
                  <span className="text-lg font-semibold text-purple-600">{healthStats.streakDays}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
        
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ประวัติการกิน
          </h2>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดประวัติ...</p>
            </div>
          )}
          
          {!isLoading && logsWithMenus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่มีประวัติการกิน</p>
              <p className="text-sm text-gray-400 mt-2">ลองไปค้นหาและบันทึกเมนูที่กินดูสิ!</p>
            </div>
          )}
          
          {!isLoading && logsWithMenus.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logsWithMenus.slice(0, 6).map((log) => (
                <div key={log.id} className="relative">
                  <MenuCard menu={log.menu} />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {new Date(log.at).toLocaleDateString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
