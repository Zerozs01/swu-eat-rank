import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES } from '../constants/enums';
import { SearchIcon, DiceIcon } from '../components/icons';
import type { Location, Category } from '../types/menu';

export default function Home() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [isRandomizing, setIsRandomizing] = useState(false);
  
  const { data: menus } = useMenus();

  const handleRandomMenu = () => {
    if (!menus || menus.length === 0) return;
    
    setIsRandomizing(true);
    
    // Filter menus based on selection
    let filteredMenus = menus;
    if (selectedLocation) {
      filteredMenus = filteredMenus.filter(menu => menu.location === selectedLocation);
    }
    if (selectedCategory) {
      filteredMenus = filteredMenus.filter(menu => menu.category === selectedCategory);
    }
    
    if (filteredMenus.length === 0) {
      alert('ไม่พบเมนูที่ตรงกับเงื่อนไขที่เลือก');
      setIsRandomizing(false);
      return;
    }
    
    // Random selection
    const randomIndex = Math.floor(Math.random() * filteredMenus.length);
    const randomMenu = filteredMenus[randomIndex];
    
    // Navigate to menu detail
    setTimeout(() => {
      navigate(`/menu/${randomMenu.id}`);
      setIsRandomizing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
              SWU EatRank
            </h1>
            
          </div>

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                ค้นหาเมนูที่ชอบ
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                ค้นหาและกรองเมนูตามโรงอาหาร ประเภท และรสชาติ
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as Location | '')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">ทุกโรงอาหาร</option>
                {Object.entries(LOCATIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | '')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">ทุกประเภท</option>
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/search')}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                <SearchIcon className="w-5 h-5" />
                <span>ค้นหาเมนู</span>
              </button>
              
              <button
                onClick={handleRandomMenu}
                disabled={isRandomizing}
                className="flex-1 flex items-center justify-center space-x-2 bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors"
              >
               
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>

                <span>{isRandomizing ? 'กำลังสุ่ม...' : 'สุ่มเมนู'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                50+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                เมนูให้เลือก
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">
                3
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                โรงอาหาร
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                100%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Health Score
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
