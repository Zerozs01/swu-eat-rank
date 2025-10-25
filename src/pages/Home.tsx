import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenus } from '../hooks/useMenus';
import { useLogsByPeriod } from '../hooks/useLogs';
import { LOCATIONS, CATEGORIES } from '../constants/enums';
import { SearchIcon } from '../components/icons';
import type { Location, Category, Menu } from '../types/menu';
import MenuCard from '../components/MenuCard';
import { MOODS, type MoodId } from '../constants/moods';
import { suggestMenusForMood } from '../utils/moodSuggest';

export default function Home() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  
  const { menus } = useMenus();
  const { data: todayLogs } = useLogsByPeriod('today');

  const moodSuggestions = useMemo(() => {
    if (!menus || menus.length === 0 || !selectedMood) return [] as Menu[];
    const randomize = selectedMood === 'lazy';
    return suggestMenusForMood(selectedMood, menus, { logs: todayLogs || [], randomizeCategories: randomize }).slice(0, 6);
  }, [menus, selectedMood, todayLogs]);

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
         

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Find Menu You Want
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                ค้นหาและกรองเมนูตามโรงอาหาร ประเภท และรสชาติ
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อเมนูหรือร้าน..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as Location | '')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                aria-label="เลือกประเภทอาหาร"
              >
                <option value="">ทุกประเภท</option>
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/search', { 
                  state: { 
                    searchTerm, 
                    location: selectedLocation, 
                    category: selectedCategory 
                  } 
                })}
                className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg transition-colors"
              >
                <SearchIcon className="w-5 h-5" />
                <span>ค้นหาตาม Filter</span>
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

          {/* Quick Mood Selector */}
          <div className="mt-10">
            {/* <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Menu for your mood</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['very_hungry','clean','lazy'] as MoodId[]).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`rounded-2xl p-6 text-left shadow-lg transition transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedMood===mood ? 'ring-2 ring-primary-500' : ''} bg-white dark:bg-gray-800`}
                >
                  <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{MOODS[mood].label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{MOODS[mood].subtext}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Suggestions */}
          {selectedMood && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  แนะนำสำหรับ: {MOODS[selectedMood].label}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedMood(null)}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  ล้างตัวเลือก
                </button>
              </div>
              {moodSuggestions.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">ยังไม่มีเมนูที่เหมาะ ลองเปลี่ยนเงื่อนไขหรือสุ่มใหม่</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moodSuggestions.map((menu) => (
                    <div key={menu.id} className="flex flex-col">
                      <MenuCard menu={menu} />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                          onClick={() => navigate(`/menu/${menu.id}`)}
                        >
                          เลือกเมนูนี้
                        </button>
                        <button
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
                          onClick={() => navigate('/search', { state: { searchTerm: '', location: '', category: menu.category } })}
                        >
                          ทางเลือกคล้ายกัน
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
