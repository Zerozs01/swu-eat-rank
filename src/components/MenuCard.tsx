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
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
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
      <div className="p-4 flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{menu.name}</h3>
        <HealthBadge score={healthScore} showLabel={false} />
      </div>
      
      <p className="px-4 text-sm text-gray-600 mb-2">{menu.vendor}</p>
      
      <div className="px-4 flex flex-wrap gap-1 mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          📍 {LOCATIONS[menu.location]}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          🍽️ {CATEGORIES[menu.category]}
        </span>
      </div>
      
      <div className="px-4 pb-4 flex flex-wrap gap-1">
        {menu.tastes.map((taste) => (
          <span 
            key={taste}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {TASTES[taste]}
          </span>
        ))}
      </div>
      
      {menu.nutrition && (
        <div className="mt-1 pt-3 border-t border-gray-200 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>🔥 {menu.nutrition.cal} cal</div>
            <div>🧈 {menu.nutrition.fat}g ไขมัน</div>
            <div>🍯 {menu.nutrition.sugar}g น้ำตาล</div>
            <div>🧂 {menu.nutrition.sodium}mg โซเดียม</div>
          </div>
        </div>
      )}
    </div>
  );
}
