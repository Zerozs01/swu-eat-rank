import React, { useState } from 'react';
import type { Badge } from '../../types/menu';

interface EnhancedBadgeProps {
  badge: Badge;
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EnhancedBadge({
  badge,
  showProgress = true,
  onClick,
  className = ''
}: EnhancedBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-yellow-500 to-orange-500';
      case 'epic':
        return 'from-purple-400 via-purple-500 to-pink-500';
      case 'rare':
        return 'from-blue-400 via-blue-500 to-cyan-500';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'border-gray-300 bg-gray-50';
      case 'gold':
        return 'border-yellow-400 bg-yellow-50';
      case 'silver':
        return 'border-gray-400 bg-gray-50';
      default:
        return 'border-orange-600 bg-orange-50';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-gray-300 text-gray-800';
      case 'gold':
        return 'bg-yellow-400 text-yellow-900';
      case 'silver':
        return 'bg-gray-400 text-gray-800';
      default:
        return 'bg-orange-600 text-orange-100';
    }
  };

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 transform
        ${isHovered ? 'scale-105' : 'scale-100'}
        ${badge.isEarned ? 'opacity-100' : 'opacity-60'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Badge container */}
      <div
        className={`
          relative p-3 rounded-xl border-2 shadow-lg
          ${getLevelColor(badge.level)}
          ${badge.isEarned ? 'shadow-xl' : 'shadow-md'}
          transition-all duration-300
        `}
      >
        {/* Rarity glow effect for earned badges */}
        {badge.isEarned && (
          <div
            className={`
              absolute inset-0 rounded-xl opacity-20 blur-sm
              bg-gradient-to-r ${getRarityGradient(badge.rarity)}
              animate-pulse
            `}
          />
        )}

        {/* Badge content */}
        <div className="relative flex flex-col items-center space-y-2">
          {/* Icon */}
          <div
            className={`
              text-2xl transition-all duration-300
              ${badge.isEarned ? '' : 'grayscale'}
              ${isHovered ? 'animate-bounce' : ''}
            `}
          >
            {badge.icon}
          </div>

          {/* Badge name */}
          <div className="text-xs font-semibold text-center text-gray-800">
            {badge.name}
          </div>

          {/* Level badge */}
          <div
            className={`
              px-2 py-1 rounded-full text-xs font-bold
              ${getLevelBadgeColor(badge.level)}
            `}
          >
            {badge.level === 'bronze' && 'บรอนซ์'}
            {badge.level === 'silver' && 'เงิน'}
            {badge.level === 'gold' && 'ทอง'}
            {badge.level === 'platinum' && 'พลาตินัม'}
          </div>

          {/* Progress bar */}
          {showProgress && !badge.isEarned && badge.progress !== undefined && (
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>ความคืบหน้า</span>
                <span>{Math.round(badge.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned date */}
          {badge.isEarned && badge.earnedAt && (
            <div className="text-xs text-gray-500 mt-1">
              ได้รับเมื่อ {new Date(badge.earnedAt).toLocaleDateString('th-TH')}
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 w-48">
            <div className="font-semibold mb-1">{badge.name}</div>
            <div className="text-gray-300">{badge.description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </div>

      {/* Rarity indicator */}
      {badge.isEarned && badge.rarity !== 'common' && (
        <div
          className={`
            absolute -top-1 -right-1 w-6 h-6 rounded-full
            bg-gradient-to-r ${getRarityGradient(badge.rarity)}
            flex items-center justify-center text-white text-xs font-bold
            shadow-lg
          `}
        >
          {badge.rarity === 'legendary' && '★'}
          {badge.rarity === 'epic' && '◆'}
          {badge.rarity === 'rare' && '▲'}
        </div>
      )}
    </div>
  );
}

interface BadgeCollectionProps {
  badges: Badge[];
  title?: string;
  showProgress?: boolean;
  maxBadgesPerRow?: number;
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeCollection({
  badges,
  title,
  showProgress = true,
  maxBadgesPerRow = 4,
  onBadgeClick
}: BadgeCollectionProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏆</div>
        <div>ยังไม่มีเหรียญตรา</div>
        <div className="text-sm">เริ่มบันทึกอาหารเพื่อเก็บเหรียญตราแรกของคุณ!</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      )}

      <div
        className={`
          grid gap-4
          ${maxBadgesPerRow === 4 ? 'grid-cols-2 md:grid-cols-4' : ''}
          ${maxBadgesPerRow === 3 ? 'grid-cols-3' : ''}
          ${maxBadgesPerRow === 2 ? 'grid-cols-2' : ''}
        `}
      >
        {badges.map((badge) => (
          <EnhancedBadge
            key={badge.id}
            badge={badge}
            showProgress={showProgress}
            onClick={() => onBadgeClick?.(badge)}
          />
        ))}
      </div>
    </div>
  );
}