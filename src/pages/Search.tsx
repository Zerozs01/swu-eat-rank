import React, { useState } from 'react';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import MenuCard from '../components/MenuCard';
import type { Location, Category, Taste } from '../types/menu';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTaste, setSelectedTaste] = useState<Taste | ''>('');

  const { data: menus, isLoading, error } = useMenus({
    location: selectedLocation || undefined,
    category: selectedCategory || undefined,
    tastes: selectedTaste ? [selectedTaste] : undefined,
    searchTerm: searchTerm || undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔍 ค้นหาเมนู
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="ค้นหาชื่อเมนูหรือร้าน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            
            <select 
              value={selectedTaste}
              onChange={(e) => setSelectedTaste(e.target.value as Taste | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกรสชาติ"
            >
              <option value="">ทุกรสชาติ</option>
              {Object.entries(TASTES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
                setSelectedCategory('');
                setSelectedTaste('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดเมนู...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          </div>
        )}
        
        {menus && menus.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">ไม่พบเมนูที่ตรงกับเงื่อนไข</p>
          </div>
        )}
        
        {menus && menus.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
