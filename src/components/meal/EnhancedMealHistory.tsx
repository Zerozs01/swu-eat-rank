import React, { useState, useMemo } from 'react';
import type { Log, Menu, LogWithMenu } from '../../types/menu';
import LogCard from '../LogCard';
import type { Taste } from '../../types/menu';

interface EnhancedMealHistoryProps {
  logs: (Log & { menu: Menu })[];
  onHistoryFocus?: (dim: string, key: string) => void;
}

export function EnhancedMealHistory({ logs, onHistoryFocus }: EnhancedMealHistoryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'health' | 'price'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Process logs for better organization
  const processedLogs = useMemo(() => {
    let filteredLogs = [...logs];

    // Apply category filter
    if (filterCategory !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.menu.category === filterCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log =>
        log.menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.menu.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort logs
    return filteredLogs.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.at - a.at; // Most recent first
        case 'health':
          return (b.menu.healthScore || 0) - (a.menu.healthScore || 0);
        case 'price':
          return (b.menu.price || 0) - (a.menu.price || 0);
        default:
          return b.at - a.at;
      }
    });
  }, [logs, filterCategory, searchTerm, sortBy]);

  // Group logs by date for better organization
  const logsByDate = useMemo(() => {
    const groups = new Map<string, (Log & { menu: Menu })[]>();

    processedLogs.forEach(log => {
      const date = new Date(log.at);
      const dateKey = date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(log);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      // Sort dates by most recent first
      const dateA = new Date(a[0]).getTime();
      const dateB = new Date(b[0]).getTime();
      return dateB - dateA;
    });
  }, [processedLogs]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(logs.map(log => log.menu.category));
    return Array.from(cats);
  }, [logs]);

  // Get category name in Thai
  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'RICE': return 'ข้าวทานเคียว';
      case 'NOODLE': return 'ก๋วยเตี๋ยว';
      case 'FRIED': return 'ทอด';
      case 'DESSERT': return 'ของหวาน';
      case 'DRINK': return 'เครื่องดื่ม';
      default: return 'อื่นๆ';
    }
  };

  // Get health score color
  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Calculate daily statistics
  const getDailyStats = (dayLogs: (Log & { menu: Menu })[]) => {
    const totalHealth = dayLogs.reduce((sum, log) => sum + (log.menu.healthScore || 0), 0);
    const avgHealth = dayLogs.length > 0 ? totalHealth / dayLogs.length : 0;
    const totalBudget = dayLogs.reduce((sum, log) => sum + ((log.menu.price || 0) * log.quantity), 0);
    const healthyMeals = dayLogs.filter(log => (log.menu.healthScore || 0) >= 70).length;

    return {
      avgHealth: Math.round(avgHealth),
      totalBudget: Math.round(totalBudget),
      totalMeals: dayLogs.length,
      healthyMeals,
      healthScoreColor: getHealthScoreColor(avgHealth)
    };
  };

  // Get taste icons
  const getTasteIcon = (taste: Taste): string => {
    switch (taste) {
      case 'SWEET': return '🍯';
      case 'OILY': return '🍳';
      case 'SPICY': return '🌶️';
      case 'SOUR': return '🍋';
      case 'BLAND': return '🥣';
      case 'SALTY': return '🧂';
      default: return '🍽️';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header with controls */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ประวัติการกิน</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {logs.length} มื้อที่บันทึก • {logsByDate.length} วัน
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* View mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { mode: 'grid' as const, label: 'กริด', icon: '⚏' },
                { mode: 'list' as const, label: 'รายการ', icon: '☰' }
              ].map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${viewMode === mode
                      ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">เรียงตามวันที่</option>
              <option value="health">เรียงตามคะแนนสุขภาพ</option>
              <option value="price">เรียงตามราคา</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อเมนูหรือร้านอาหาร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ทุกหมวด
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {processedLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ไม่พบประวัติการกิน
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all'
                ? 'ลองปรับตัวกรองหรือคำค้นหา'
                : 'เริ่มต้นบันทึกมื้ออาหารแรกของคุณ'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {logsByDate.map(([date, dayLogs]) => {
              const stats = getDailyStats(dayLogs);

              return (
                <div key={date} className="space-y-4">
                  {/* Date header with stats */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{date}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {dayLogs.length} มื้อ • {stats.healthyMeals} มื้อสุขภาพดี
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${stats.healthScoreColor}`}>
                          คะแนนเฉลี่ย: {stats.avgHealth}/100
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300">
                          งบประมาณ: ฿{stats.totalBudget}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meals for this day */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayLogs.map((log) => (
                        <div key={log.id} className="group relative">
                          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
                              <div className="text-xs space-y-1">
                                {log.menu.tastes?.slice(0, 3).map((taste, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <span>{getTasteIcon(taste)}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{taste}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <LogCard log={log} menu={log.menu} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayLogs.map((log) => (
                        <div key={log.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {log.menu.imageUrl ? (
                                    <img src={log.menu.imageUrl} alt={log.menu.name} className="w-12 h-12 rounded-lg object-cover" />
                                  ) : (
                                    '🍽️'
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{log.menu.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{log.menu.vendor} • {getCategoryName(log.menu.category)}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${getHealthScoreColor(log.menu.healthScore || 0)}`}>
                                      คะแนน: {log.menu.healthScore || 0}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {log.menu.price ? `฿${log.menu.price * log.quantity}` : 'ราคาไม่ระบุ'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(log.at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {log.menu.tastes?.slice(0, 3).map((taste, idx) => (
                                <span key={idx} className="text-lg" title={taste}>
                                  {getTasteIcon(taste)}
                                </span>
                              ))}
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                x{log.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}