import React, { useState, useMemo } from 'react';
import { useTodayLogs, useLogsByPeriod } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES, FACULTIES } from '../constants/enums';
import BoardCard from '../components/BoardCard';
import { useAuth } from '../contexts/AuthContext';
import type { Location, Category } from '../types/menu';

export default function Board() {
  const { userProfile } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState(userProfile?.faculty || '');
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  const { isLoading: logsLoading } = useTodayLogs();
  const { data: periodLogs, isLoading: periodLogsLoading } = useLogsByPeriod(timeFilter);
  const { menus: allMenus, isLoading: menusLoading } = useMenus();

  // Calculate popular menus with detailed stats
  const popularMenus = useMemo(() => {
    if (!periodLogs || !allMenus) return [];

    // Filter logs by faculty if selected
    let filteredLogs = periodLogs;
    if (selectedFaculty) {
      filteredLogs = periodLogs.filter(log => log.faculty === selectedFaculty);
    }

                  // Calculate menu statistics
      const menuStats = filteredLogs.reduce((acc, log) => {
        if (!acc[log.menuId]) {
          acc[log.menuId] = {
            orderCount: 0,
            totalQuantity: 0,
            logs: []
          };
        }
        acc[log.menuId].orderCount += 1;
        acc[log.menuId].totalQuantity += (log.quantity || 1); // Default to 1 if quantity is missing
        acc[log.menuId].logs.push(log);
        return acc;
      }, {} as Record<string, { orderCount: number; totalQuantity: number; logs: unknown[] }>);

         // Get menu details and sort by total quantity (จำนวนจานรวม)
     const popularMenuIds = Object.entries(menuStats)
       .sort(([, a], [, b]) => b.totalQuantity - a.totalQuantity)
       .slice(0, 10)
       .map(([menuId]) => menuId);

     return allMenus
       .filter(menu => popularMenuIds.includes(menu.id))
       .map(menu => ({
         menu,
         stats: menuStats[menu.id]
       }))
       .sort((a, b) => b.stats.totalQuantity - a.stats.totalQuantity);
  }, [periodLogs, allMenus, selectedFaculty]);

  // Calculate healthy menus with order data
  const healthyMenus = useMemo(() => {
    if (!periodLogs || !allMenus) return [];

    // Filter logs by location and category if selected
    let filteredLogs = periodLogs;
    if (selectedLocation) {
      filteredLogs = filteredLogs.filter(log => {
        const menu = allMenus.find(m => m.id === log.menuId);
        return menu && menu.location === selectedLocation;
      });
    }
    if (selectedCategory) {
      filteredLogs = filteredLogs.filter(log => {
        const menu = allMenus.find(m => m.id === log.menuId);
        return menu && menu.category === selectedCategory;
      });
    }

         // Calculate menu statistics for healthy menus
     const menuStats = filteredLogs.reduce((acc, log) => {
       if (!acc[log.menuId]) {
         acc[log.menuId] = {
           orderCount: 0,
           totalQuantity: 0,
           logs: []
         };
       }
       acc[log.menuId].orderCount += 1;
       acc[log.menuId].totalQuantity += (log.quantity || 1); // Default to 1 if quantity is missing
       acc[log.menuId].logs.push(log);
       return acc;
     }, {} as Record<string, { orderCount: number; totalQuantity: number; logs: unknown[] }>);

    // Get menus that have been ordered and sort by health score first, then by order count
    return allMenus
      .filter(menu => {
        if (selectedLocation && menu.location !== selectedLocation) return false;
        if (selectedCategory && menu.category !== selectedCategory) return false;
        return menuStats[menu.id]; // Only show menus that have been ordered
      })
      .map(menu => ({
        menu,
        stats: menuStats[menu.id]
      }))
      .sort((a, b) => {
        // Sort by health score first, then by order count
        const aScore = a.menu.healthScore || 0;
        const bScore = b.menu.healthScore || 0;
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        return b.stats.orderCount - a.stats.orderCount;
      })
      .slice(0, 5);
  }, [periodLogs, allMenus, selectedLocation, selectedCategory]);

  const isLoading = logsLoading || periodLogsLoading || menusLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              เมนูยอดฮิต{timeFilter === 'today' ? 'วันนี้' : timeFilter === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
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
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select 
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกคณะ"
            >
              <option value="">ทุกคณะ</option>
              {FACULTIES.map((faculty) => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
            
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as Location | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกโรงอาหาร"
            >
              <option value="">ทุกโรงอาหาร</option>
              {Object.entries(LOCATIONS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกประเภทอาหาร"
            >
              <option value="">ทุกประเภท</option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}
          
          {!isLoading && popularMenus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ยังไม่มีข้อมูลการกินวันนี้</p>
            </div>
          )}
          
          {!isLoading && popularMenus.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularMenus.map((item, index) => (
                <BoardCard 
                  key={item.menu.id} 
                  menu={item.menu}
                  orderCount={item.stats.orderCount}
                  totalQuantity={item.stats.totalQuantity}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            เมนูเฮลธ์สุด{timeFilter === 'today' ? 'วันนี้' : timeFilter === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
          </h2>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}
          
          {!isLoading && healthyMenus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบเมนูที่ตรงกับเงื่อนไข</p>
            </div>
          )}
          
          {!isLoading && healthyMenus.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthyMenus.map((item, index) => (
                <BoardCard 
                  key={item.menu.id} 
                  menu={item.menu}
                  orderCount={item.stats.orderCount}
                  totalQuantity={item.stats.totalQuantity}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
