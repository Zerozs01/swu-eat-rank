import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import { SearchIcon } from '../components/icons';
import type { Location, Category, Menu, Taste } from '../types/menu';
import MenuCard from '../components/MenuCard';
import { suggestByContext, type EnergyLevel } from '../utils/contextSuggest';

export default function Home() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTaste, setSelectedTaste] = useState<Taste | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRandomizing, setIsRandomizing] = useState(false);
  // Context-based selectors
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [cleanLevel, setCleanLevel] = useState<1 | 2 | 3 | null>(null);
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  // Collapsible toggles
  const [showEnergy, setShowEnergy] = useState(false);
  const [showClean, setShowClean] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  
  const { menus } = useMenus();
  // Real-time filtered menus based on search + location/category/taste (like Search page)
  const { menus: typedMenus } = useMenus({
    location: selectedLocation || undefined,
    category: selectedCategory || undefined,
    tastes: selectedTaste ? [selectedTaste] : undefined,
    searchTerm: searchTerm || undefined,
  });
  const priceBounds = useMemo(() => {
    const prices = (menus || []).map(m => m.price).filter((v): v is number => typeof v === 'number');
    if (prices.length === 0) return { min: 0, max: 100 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [menus]);

  const contextSuggestions = useMemo(() => {
    if (!menus || menus.length === 0) return [] as Menu[];
    const pmin = priceMin === '' ? null : priceMin;
    const pmax = priceMax === '' ? null : priceMax;
    return suggestByContext(menus, { energy, cleanLevel, priceMin: pmin, priceMax: pmax }).slice(0, 6);
  }, [menus, energy, cleanLevel, priceMin, priceMax]);

  // When user types, restrict results strictly to matches + context filters
  const searchResults = useMemo(() => {
    const base = typedMenus || [];
    const pmin = priceMin === '' ? null : priceMin;
    const pmax = priceMax === '' ? null : priceMax;
    return suggestByContext(base, { energy, cleanLevel, priceMin: pmin, priceMax: pmax });
  }, [typedMenus, energy, cleanLevel, priceMin, priceMax]);

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
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
         

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-10">
            {/* <div className="text-center mb-8"> */}
              {/* <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2"> */}
                {/* Find Menu You Want */}
              {/* </h2> */}
              <p className="text-gray-600 dark:text-gray-300">
                {/* ค้นหาและกรองเมนูตามโรงอาหาร ประเภท และรสชาติ */}
              </p>
            {/* </div> */}
            
            {/* Row 1: Full-width search on desktop */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อเมนูหรือร้าน..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            {/* Row 2: Filters (location, category, taste) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as Location | '')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                aria-label="เลือกรสชาติ"
              >
                <option value="">ทุกรสชาติ</option>
                {Object.entries(TASTES).map(([key, value]) => (
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
                    category: selectedCategory,
                    taste: selectedTaste
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

          {/* Energy Level (Collapsible) */}
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setShowEnergy(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-800 dark:text-white">ระดับความหิว</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {energy === 'snack' && 'ของว่าง / เมนูเบา ๆ'}
                  {energy === 'medium' && 'มื้อเบา / อิ่มพอดี'}
                  {energy === 'full' && 'อาหารมื้อหลัก'}
                  {!energy && 'ยังไม่เลือก'}
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-500 transition-transform ${showEnergy ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </button>
            {showEnergy && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { id: 'snack', label: 'ของว่าง / เมนูเบา ๆ', desc: 'ช่วงบ่าย / ก่อนเรียน (แคลอรี่ < 250)', icon: '🍪' },
                  { id: 'medium', label: 'มื้อเบา / อิ่มพอดี', desc: 'พักเที่ยงทั่วไป (250–500 kcal)', icon: '🍛' },
                  { id: 'full', label: 'อาหารมื้อหลัก', desc: 'โปรตีน+คาร์บอิ่มยาว (>500 kcal)', icon: '🍽️' },
                ] as Array<{ id: EnergyLevel; label: string; desc: string; icon: string }>).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnergy(energy === opt.id ? null : opt.id)}
                    className={`rounded-2xl p-6 text-left shadow-lg transition transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${energy===opt.id ? 'ring-2 ring-primary-500' : ''} bg-white dark:bg-gray-800`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{opt.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{opt.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clean Intensity (Collapsible) */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowClean(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-800 dark:text-white">อาหารคลีน</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {cleanLevel === 1 && '🥦 คลีนเบา'}
                  {cleanLevel === 2 && '🥗 คลีนปานกลาง'}
                  {cleanLevel === 3 && '🌿 คลีนล้วน'}
                  {!cleanLevel && 'ไม่จำกัดความคลีน'}
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-500 transition-transform ${showClean ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </button>
            {showClean && (
              <div className="mt-4 flex gap-3">
                {([
                  { id: 1 as const, label: '🥦 คลีนเบา' },
                  { id: 2 as const, label: '🥗 คลีนปานกลาง' },
                  { id: 3 as const, label: '🌿 คลีนล้วน' },
                ]).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCleanLevel(cleanLevel===opt.id ? null : opt.id)}
                    className={`px-4 py-2 rounded-lg border shadow-sm transition ${cleanLevel===opt.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Budget (Collapsible) */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowBudget(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-800 dark:text-white">Budget Menu</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {(priceMin !== '' || priceMax !== '')
                    ? `ช่วงราคา: ${priceMin === '' ? '-' : priceMin} – ${priceMax === '' ? '-' : priceMax} บาท`
                    : 'ไม่จำกัดงบประมาณ'}
                </div>
              </div>
              <svg className={`w-5 h-5 text-gray-500 transition-transform ${showBudget ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </button>
            {showBudget && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">ต่ำสุด (บาท)</label>
                  <input type="number" min={priceBounds.min} max={priceBounds.max}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    aria-label="งบประมาณต่ำสุด"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">สูงสุด (บาท)</label>
                  <input type="number" min={priceBounds.min} max={priceBounds.max}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    aria-label="งบประมาณสูงสุด"
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  <div className="text-sm">ช่วงราคาโดยรวม: {priceBounds.min} – {priceBounds.max} บาท</div>
                  {menus && (
                    <div className="text-sm mt-1">มี {suggestByContext(menus, { energy, cleanLevel, priceMin: priceMin === '' ? null : priceMin, priceMax: priceMax === '' ? null : priceMax }).length} เมนูในงบนี้</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions / Search Results */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{searchTerm.trim() ? 'ผลการค้นหา' : 'ผลลัพธ์แนะนำ'}</h3>
              <button type="button" className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                onClick={() => { setEnergy(null); setCleanLevel(null); setPriceMin(''); setPriceMax(''); }}
              >ล้างตัวเลือก</button>
            </div>
            {(searchTerm.trim() ? searchResults : contextSuggestions).length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchTerm.trim() ? searchResults : contextSuggestions).map((menu) => (
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
        </div>
      </div>
    </div>
  );
}
