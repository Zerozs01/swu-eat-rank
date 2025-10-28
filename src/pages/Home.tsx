import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
// import { SearchIcon } from '../components/icons';
import type { Location, Category, Menu, Taste } from '../types/menu';
import MenuCard from '../components/MenuCard';
import BoardCard from '../components/BoardCard';
import { suggestByContext, type EnergyLevel } from '../utils/contextSuggest';
import { useAuth } from '../contexts/AuthContext';
import { useUserLogs, useLogsByPeriod } from '../hooks/useLogs';
import { getPersonalizedRecommendations, getPopularMenus } from '../utils/recommend';

export default function Home() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedTaste, setSelectedTaste] = useState<Taste | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [popPeriod, setPopPeriod] = useState<'today' | 'week' | 'month'>('week');
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
  const { data: userLogs = [] } = useUserLogs();
  const { data: popularLogsToday = [] } = useLogsByPeriod('today');
  const { data: popularLogsWeek = [] } = useLogsByPeriod('week');
  const { data: popularLogsMonth = [] } = useLogsByPeriod('month');
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

  // Menus constrained by current context (energy/clean/budget) for recommendation sections
  const contextFilteredMenus = useMemo(() => {
    // Start from location/category/taste-filtered base (typedMenus)
    const base = (typedMenus && typedMenus.length > 0) ? typedMenus : (menus || []);
    if (base.length === 0) return [] as Menu[];
    const pmin = priceMin === '' ? null : priceMin;
    const pmax = priceMax === '' ? null : priceMax;
    // Apply Energy/Clean/Budget to the base already filtered by location/category/taste
    return suggestByContext(base, { energy, cleanLevel, priceMin: pmin, priceMax: pmax });
  }, [typedMenus, menus, energy, cleanLevel, priceMin, priceMax]);

  // Personalized recommendations (7-day profile)
  const personalized = useMemo(() => {
    if (!menus || menus.length === 0) return [] as Menu[];
    if (!userProfile?.email) return [] as Menu[]; // treat anon as guest
    // Always honor current filters; if no menu passes filters, return empty
    if (!contextFilteredMenus.length) return [] as Menu[];
    const recs = getPersonalizedRecommendations(contextFilteredMenus, userLogs, 7, 9);
    return recs;
  }, [menus, contextFilteredMenus, userLogs, userProfile?.email]);

  // Popular menus by selected period (IDs only)
  const popularByPeriod = useMemo(() => {
    if (!menus || menus.length === 0) return [] as Menu[];
    const logs = popPeriod === 'today' ? popularLogsToday : popPeriod === 'week' ? popularLogsWeek : popularLogsMonth;
    // Always honor current filters; if no menu passes filters, return empty
    if (!contextFilteredMenus.length) return [] as Menu[];
    return getPopularMenus(contextFilteredMenus, logs, 12);
  }, [menus, contextFilteredMenus, popPeriod, popularLogsToday, popularLogsWeek, popularLogsMonth]);

  // Popular stats (จำนวนจานรวม และสั่งแล้วกี่ครั้ง) for Home "เมนูยอดนิยม"
  const popularStats = useMemo(() => {
    if (!menus || menus.length === 0) return [] as Array<{ menu: Menu; orderCount: number; totalQuantity: number }>;
    // choose logs by period
    const logs = popPeriod === 'today' ? popularLogsToday : popPeriod === 'week' ? popularLogsWeek : popularLogsMonth;
    if (!contextFilteredMenus.length || !logs.length) return [] as Array<{ menu: Menu; orderCount: number; totalQuantity: number }>;

    // Restrict stats to menus that pass current filters
    const allowed = new Set(contextFilteredMenus.map(m => m.id));
    const stats = logs.reduce((acc, log) => {
      if (!allowed.has(log.menuId)) return acc;
      if (!acc[log.menuId]) {
        acc[log.menuId] = { orderCount: 0, totalQuantity: 0 };
      }
      acc[log.menuId].orderCount += 1;
      acc[log.menuId].totalQuantity += (log.quantity || 1);
      return acc;
    }, {} as Record<string, { orderCount: number; totalQuantity: number }>);

    // Sort by totalQuantity (same as popular), then limit
    const sortedIds = Object.entries(stats)
      .sort(([, a], [, b]) => b.totalQuantity - a.totalQuantity)
      .slice(0, 12)
      .map(([id]) => id);

    // Map to full objects, preserving order
    const menuMap = new Map(contextFilteredMenus.map(m => [m.id, m] as const));
    const result: Array<{ menu: Menu; orderCount: number; totalQuantity: number }> = [];
    for (const id of sortedIds) {
      const m = menuMap.get(id);
      if (m) result.push({ menu: m, orderCount: stats[id].orderCount, totalQuantity: stats[id].totalQuantity });
    }
    return result;
  }, [menus, contextFilteredMenus, popPeriod, popularLogsToday, popularLogsWeek, popularLogsMonth]);

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
    if (selectedTaste) {
      filteredMenus = filteredMenus.filter(menu => menu.tastes.includes(selectedTaste));
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

  // Enable horizontal scroll with mouse wheel on desktop (map vertical wheel to horizontal)
  const onWheelHorizontal: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    // Only handle when horizontal overflow exists
    if (el.scrollWidth <= el.clientWidth) return;
    // Determine intended horizontal movement
    const useDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (!useDelta) return;
    // Prevent page vertical scroll while interacting with carousel
    e.preventDefault();
    el.scrollLeft += useDelta;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-3">
         

          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 mb-4">
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
            {/* Row 2: Filters + Random (desktop: 1 row, mobile: 2 rows) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-0">
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
              <button
                onClick={handleRandomMenu}
                disabled={isRandomizing}
                className="w-full flex items-center justify-center space-x-2 bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{isRandomizing ? 'กำลังสุ่ม...' : 'สุ่มเมนู'}</span>
              </button>
            </div>
          </div>

          {/* Special Filters: Energy, Clean, Budget in one row */}
          <div className="mt-4 grid grid-cols-3 gap-3 mb-2">
            {/* Energy */}
            <div>
              <button
                type="button"
                onClick={() => setShowEnergy(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">พลังงาน</div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                    {energy === 'snack' && 'ของว่าง / เมนูเบา ๆ'}
                    {energy === 'medium' && 'มื้อเบา / อิ่มพอดี'}
                    {energy === 'full' && 'อาหารมื้อหลัก'}
                    {!energy && 'ยังไม่เลือก'}
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showEnergy ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
              </button>
              {showEnergy && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {([
                    { id: 'snack', label: 'ของว่าง / เมนูเบา ๆ', desc: 'แคล < 250', icon: '🍪' },
                    { id: 'medium', label: 'มื้อเบา / อิ่มพอดี', desc: '250–500 kcal', icon: '🍛' },
                    { id: 'full', label: 'อาหารมื้อหลัก', desc: '>500 kcal', icon: '🍽️' },
                  ] as Array<{ id: EnergyLevel; label: string; desc: string; icon: string }>).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEnergy(energy === opt.id ? null : opt.id)}
                      className={`rounded-lg p-3 text-left border shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${energy===opt.id ? 'ring-2 ring-primary-500' : ''} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</span>
                      </div>
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clean */}
            <div>
              <button
                type="button"
                onClick={() => setShowClean(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">อาหารคลีน</div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                    {cleanLevel === 1 && '🥦 คลีนเบา'}
                    {cleanLevel === 2 && '🥗 คลีนปานกลาง'}
                    {cleanLevel === 3 && '🌿 คลีนล้วน'}
                    {!cleanLevel && 'ไม่จำกัดความคลีน'}
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showClean ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
              </button>
              {showClean && (
                <div className="mt-2 flex flex-col gap-2">
                  {([
                    { id: 1 as const, label: '🥦 คลีนเบา' },
                    { id: 2 as const, label: '🥗 คลีนปานกลาง' },
                    { id: 3 as const, label: '🌿 คลีนล้วน' },
                  ]).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCleanLevel(cleanLevel===opt.id ? null : opt.id)}
                      className={`px-3 py-2 rounded-lg border shadow-sm text-sm transition ${cleanLevel===opt.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <button
                type="button"
                onClick={() => setShowBudget(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">Budget</div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                    {(priceMin !== '' || priceMax !== '')
                      ? `ช่วง: ${priceMin === '' ? '-' : priceMin} – ${priceMax === '' ? '-' : priceMax} บ.`
                      : 'ไม่จำกัดงบประมาณ'}
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showBudget ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
              </button>
              {showBudget && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">ต่ำสุด (บาท)</label>
                    <input type="number" min={priceBounds.min} max={priceBounds.max}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      aria-label="งบประมาณต่ำสุด"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-300 mb-1">สูงสุด (บาท)</label>
                    <input type="number" min={priceBounds.min} max={priceBounds.max}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      aria-label="งบประมาณสูงสุด"
                    />
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">
                    <div>ช่วงราคาโดยรวม: {priceBounds.min} – {priceBounds.max} บาท</div>
                    {menus && (
                      <div className="mt-1">มี {suggestByContext(menus, { energy, cleanLevel, priceMin: priceMin === '' ? null : priceMin, priceMax: priceMax === '' ? null : priceMax }).length} เมนูในงบนี้</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personalized & Popular (Horizontal) */}
          {!searchTerm.trim() && (
            <div className="space-y-2">
              {personalized.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">เมนูแนะนำเฉพาะคุณ</h3>
                  </div>
                  <div
                    className="overflow-x-auto scrollbar-hide md:scrollbar-thin touch-pan-x overscroll-y-none overscroll-x-contain"
                    onWheelCapture={onWheelHorizontal}
                  >
                    <div className="flex gap-4 snap-x snap-mandatory pb-2">
                      {personalized.map(menu => (
                        <div key={menu.id} className="snap-start min-w-[260px] max-w-[280px]">
                          <MenuCard menu={menu} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">เมนูยอดนิยม</h3>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['today','week','month'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPopPeriod(p)}
                        className={`px-2 py-1 rounded-md text-sm ${popPeriod===p ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        {p==='today'?'วันนี้':p==='week'?'สัปดาห์':'เดือน'}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className="overflow-x-auto scrollbar-hide md:scrollbar-thin touch-pan-x overscroll-y-none overscroll-x-contain"
                  onWheelCapture={onWheelHorizontal}
                >
                  <div className="flex gap-4 snap-x snap-mandatory pb-2">
                    {popularStats.map((item, idx) => (
                      <div
                        key={item.menu.id}
                        className="snap-start min-w-[300px] max-w-[320px] cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/menu/${item.menu.id}`)}
                        role="button"
                        tabIndex={0}
                        aria-label={`เปิดรายละเอียดเมนู ${item.menu.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/menu/${item.menu.id}`);
                          }
                        }}
                      >
                        <BoardCard menu={item.menu} orderCount={item.orderCount} totalQuantity={item.totalQuantity} rank={idx + 1} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions / Search Results */}
          {(searchTerm.trim() || (personalized.length === 0 && popularByPeriod.length === 0)) && (
            <div className="mt-5">
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
          )}
      </div>
    </div>
  );
}
