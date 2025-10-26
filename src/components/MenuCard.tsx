import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Menu } from '../types/menu';
import { LOCATIONS, CATEGORIES, TASTES } from '../constants/enums';
import { calcHealthScore } from '../utils/healthScore';
import HealthBadge from './HealthBadge';

interface MenuCardProps {
  menu: Menu;
  onClick?: () => void;
}

export default function MenuCard({ menu, onClick }: MenuCardProps) {
  const navigate = useNavigate();
  const healthScore = calcHealthScore(menu);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/menu/${menu.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col min-h-[420px]"
      onClick={handleClick}
    >
      {menu.imageUrl && (
        <div className="w-full aspect-[4/3] bg-gray-100">
          <img
            src={menu.imageUrl}
            alt={menu.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 pb-2">
          {/* Header zone: fixed height + clamp */}
          <div className="grid grid-cols-[1fr_auto] items-start gap-2 mb-2">
            <h3
              className="text-base md:text-lg font-semibold leading-snug text-gray-800 line-clamp-2 md:line-clamp-3 h-[3rem] md:h-[3.5rem]"
              title={menu.name}
            >
              {menu.name}
            </h3>
            <div className="pt-0.5">
              <HealthBadge score={healthScore} showLabel={false} />
            </div>
          </div>

          {/* Meta row: vendor / price with fixed height */}
          <div className="flex items-center justify-between h-[1.75rem] mb-2">
            <p className="text-sm text-gray-600 truncate" title={menu.vendor}>{menu.vendor}</p>
            {typeof menu.price === 'number' && (
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                ฿{menu.price}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              📍 {LOCATIONS[menu.location]}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🍽️ {CATEGORIES[menu.category]}
            </span>
          </div>

          {/* Tastes */}
          <div className="pb-2 flex flex-wrap gap-1">
            {menu.tastes.map((taste) => (
              <span
                key={taste}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {TASTES[taste]}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom zone: nutrition anchored to bottom */}
        {menu.nutrition && (
          <div className="mt-auto pt-3 border-t border-gray-200 px-4 pb-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>🔥 {menu.nutrition.cal} cal</div>
              <div>🧈 {menu.nutrition.fat}g ไขมัน</div>
              <div>🍯 {menu.nutrition.sugar}g น้ำตาล</div>
              <div>🧂 {menu.nutrition.sodium}mg โซเดียม</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
