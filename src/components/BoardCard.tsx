import React from 'react';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import { calcHealthScore } from '../utils/healthScore';
import HealthBadge from './HealthBadge';
import type { Menu } from '../types/menu';

interface BoardCardProps {
  menu: Menu;
  orderCount: number; // จำนวนครั้งที่สั่ง
  totalQuantity: number; // จำนวนจานรวม
  rank: number; // อันดับ
}

export default function BoardCard({ menu, orderCount, totalQuantity, rank }: BoardCardProps) {
  const healthScore = calcHealthScore(menu);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 relative">
      {/* Rank Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
        {rank}
      </div>

      {/* Header */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
          {menu.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {menu.vendor} • {LOCATIONS[menu.location]}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
          {CATEGORIES[menu.category]}
        </span>
        {menu.tastes.slice(0, 2).map((taste) => (
          <span
            key={taste}
            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
          >
            {TASTES[taste]}
          </span>
        ))}
        {menu.tastes.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
            +{menu.tastes.length - 2}
          </span>
        )}
      </div>

      {/* Stats and Health Score */}
      <div className="flex justify-between items-center mb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">จำนวนจานรวม:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
              {totalQuantity} จาน
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">สั่งแล้ว:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {orderCount} ครั้ง
            </span>
          </div>
        </div>
        <HealthBadge score={healthScore} />
      </div>

      {/* Popularity Indicator */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((totalQuantity / 20) * 100, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        ความนิยม {Math.min((totalQuantity / 20) * 100, 100).toFixed(0)}%
      </p>
    </div>
  );
}
