import React, { useState } from 'react';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import { calcHealthScore } from '../utils/healthScore';
import HealthBadge from './HealthBadge';
import type { Log, Menu } from '../types/menu';

interface LogCardProps {
  log: Log;
  menu: Menu;
}

export default function LogCard({ log, menu }: LogCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const healthScore = calcHealthScore(menu);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'วันนี้';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'เมื่อวาน';
    } else {
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-1">
            {menu.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {menu.vendor} • {LOCATIONS[menu.location]}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(log.at)}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {formatTime(log.at)}
          </div>
        </div>
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

      {/* Quantity and Health Score */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">จำนวน:</span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {log.quantity} จาน
          </span>
        </div>
        <HealthBadge score={healthScore} />
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        {showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            {/* Ingredients */}
            {menu.ingredients.veggies && menu.ingredients.veggies.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">ผัก:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {menu.ingredients.veggies.join(', ')}
                </span>
              </div>
            )}
            {menu.ingredients.proteins && menu.ingredients.proteins.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">โปรตีน:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {menu.ingredients.proteins.join(', ')}
                </span>
              </div>
            )}
            
            {/* Nutrition (if available) */}
            {menu.nutrition && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">แคลอรี่:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.cal || 'N/A'} cal
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">ไขมัน:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.fat || 'N/A'}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">น้ำตาล:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.sugar || 'N/A'}g
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">โซเดียม:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {menu.nutrition.sodium || 'N/A'}mg
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
