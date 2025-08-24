import React, { useState, useMemo } from 'react';
import { useTodayLogs } from '../hooks/useLogs';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES, FACULTIES } from '../constants/enums';
import MenuCard from '../components/MenuCard';
import { useAuth } from '../contexts/AuthContext';
import type { Location, Category } from '../types/menu';

export default function Board() {
  const { userProfile } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState(userProfile?.faculty || '');
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');

  const { data: todayLogs, isLoading: logsLoading } = useTodayLogs();
  const { data: allMenus, isLoading: menusLoading } = useMenus();

  // Calculate popular menus
  const popularMenus = useMemo(() => {
    if (!todayLogs || !allMenus) return [];

    // Count logs by menuId
    const menuCounts = todayLogs.reduce((acc, log) => {
      acc[log.menuId] = (acc[log.menuId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Filter by faculty if selected
    let filteredLogs = todayLogs;
    if (selectedFaculty) {
      filteredLogs = todayLogs.filter(log => log.faculty === selectedFaculty);
    }

    // Get menu details and sort by count
    const popularMenuIds = Object.entries(menuCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([menuId]) => menuId);

    return allMenus
      .filter(menu => popularMenuIds.includes(menu.id))
      .sort((a, b) => {
        const aCount = menuCounts[a.id] || 0;
        const bCount = menuCounts[b.id] || 0;
        return bCount - aCount;
      });
  }, [todayLogs, allMenus, selectedFaculty]);

  // Calculate healthy menus
  const healthyMenus = useMemo(() => {
    if (!allMenus) return [];

    return allMenus
      .filter(menu => {
        if (selectedLocation && menu.location !== selectedLocation) return false;
        if (selectedCategory && menu.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => {
        const aScore = a.healthScore || 0;
        const bScore = b.healthScore || 0;
        return bScore - aScore;
      })
      .slice(0, 5);
  }, [allMenus, selectedLocation, selectedCategory]);

  const isLoading = logsLoading || menusLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          📊 กระดานรวม
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            เมนูยอดฮิตวันนี้
          </h2>
          
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
              {popularMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            เมนูเฮลธ์สุดวันนี้
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
              {healthyMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
