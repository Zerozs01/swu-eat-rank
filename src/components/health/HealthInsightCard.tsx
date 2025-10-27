import React from 'react';
import type { HealthInsightExplanation, HealthCondition } from '../../utils/healthInsightSystem';

interface HealthInsightCardProps {
  explanation: HealthInsightExplanation;
  className?: string;
}

export function HealthInsightCard({ explanation, className = '' }: HealthInsightCardProps) {
  const { overallStatus, primaryFactors, trendingAnalysis, actionableAdvice } = explanation;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-6 ${className}`}>
      {/* Overall Health Status */}
      <div className={`rounded-xl p-6 border-2 ${overallStatus.color}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{overallStatus.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  สถานะสุขภาพ: {overallStatus.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {overallStatus.description}
                </p>
              </div>
            </div>

            {/* Primary Factors */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">ปัจจัยหลัก:</h4>
              {primaryFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    factor.impact === 'positive' ? 'bg-green-500' :
                    factor.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>{factor.factor}:</strong> {factor.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Analysis */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {trendingAnalysis.direction === 'improving' ? '📈' :
               trendingAnalysis.direction === 'declining' ? '📉' : '➡️'}
            </span>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                แนวโน้ม: {trendingAnalysis.direction === 'improving' ? 'ดีขึ้น' :
                          trendingAnalysis.direction === 'declining' ? 'ลดลง' : 'คงที่'}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ในช่วง{trendingAnalysis.timeframe} (ความมั่นใจ: {Math.round(trendingAnalysis.confidence * 100)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Conditions */}
      {overallStatus.relatedConditions.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚠️ ความเสี่ยงที่อาจเกี่ยวข้อง
          </h4>
          <div className="space-y-3">
            {overallStatus.relatedConditions.map((condition, index) => (
              <HealthConditionCard key={index} condition={condition} />
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {overallStatus.concerns.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🚨 ข้อกังวล
          </h4>
          <ul className="space-y-1">
            {overallStatus.concerns.map((concern, index) => (
              <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                • {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 คำแนะนำ
        </h4>
        <div className="space-y-2">
          {overallStatus.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {recommendation}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Advice */}
      {actionableAdvice.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🎯 แผนการดำเนินการ
          </h4>
          <div className="space-y-3">
            {actionableAdvice.map((advice, index) => (
              <ActionableAdviceCard key={index} advice={advice} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HealthConditionCard({ condition }: { condition: HealthCondition }) {
  const likelihoodColor = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  };

  const severityIcon = {
    mild: '🟡',
    moderate: '🟠',
    severe: '🔴'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{severityIcon[condition.severity]}</span>
            <h5 className="font-semibold text-gray-900 dark:text-white">
              {condition.nameTH} ({condition.name})
            </h5>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${likelihoodColor[condition.likelihood]}`}>
              ความเสี่ยง: {condition.likelihood === 'low' ? 'ต่ำ' :
                         condition.likelihood === 'medium' ? 'ปานกลาง' : 'สูง'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {condition.description}
          </p>
          <div>
            <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              การป้องกัน:
            </h6>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {condition.prevention.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionableAdviceCard({ advice }: { advice: any }) {
  const categoryIcon = {
    diet: '🥗',
    exercise: '🏃',
    lifestyle: '🌟',
    medical: '🏥'
  };

  const priorityColor = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  return (
    <div className={`rounded-lg p-4 border ${priorityColor[advice.priority]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{categoryIcon[advice.category]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
              {advice.category === 'diet' ? 'อาหาร' :
               advice.category === 'exercise' ? 'การออกกำลังกาย' :
               advice.category === 'lifestyle' ? 'พฤติกรรม' : 'การแพทย์'}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              advice.priority === 'high' ? 'bg-red-100 text-red-700' :
              advice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {advice.priority === 'high' ? 'สูง' :
               advice.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {advice.advice}
          </p>
        </div>
      </div>
    </div>
  );
}