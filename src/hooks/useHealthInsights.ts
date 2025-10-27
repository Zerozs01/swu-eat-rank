import { useMemo } from 'react';
import type { LogWithMenu, UserStats } from '../types/menu';
import { calculateUserStats } from '../utils/badgeSystem';
import { generateHealthInsightExplanation } from '../utils/healthInsightSystem';
import type { HealthInsightExplanation } from '../utils/healthInsightSystem';

export function useHealthInsights(logs: LogWithMenu[], profile?: any): {
  stats: UserStats;
  explanation: HealthInsightExplanation;
} {
  const stats = useMemo(() => calculateUserStats(logs), [logs]);
  const explanation = useMemo(() => generateHealthInsightExplanation(stats, logs, profile), [stats, logs, profile]);

  return {
    stats,
    explanation
  };
}

export function useHealthStatus(logs: LogWithMenu[]) {
  const { explanation } = useHealthInsights(logs);

  return {
    status: explanation.overallStatus,
    primaryFactors: explanation.primaryFactors,
    trendingAnalysis: explanation.trendingAnalysis,
    actionableAdvice: explanation.actionableAdvice
  };
}