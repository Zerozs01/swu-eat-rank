import React from 'react';
import { getHealthScoreColor, getHealthScoreLabel } from '../utils/healthScore';

interface HealthBadgeProps {
  score: number;
  showLabel?: boolean;
}

export default function HealthBadge({ score, showLabel = true }: HealthBadgeProps) {
  const colorClasses = getHealthScoreColor(score);
  const label = getHealthScoreLabel(score);

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
      <span className="mr-1">🏥</span>
      <span>{score}</span>
      {showLabel && <span className="ml-1">({label})</span>}
    </div>
  );
}
