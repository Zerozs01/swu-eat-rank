import React, { useMemo, useState } from 'react';
import type { Menu, Log } from '../../types/menu';

export type TimeRange = 'day' | 'week' | 'month';
export type Dimension = 'category' | 'taste' | 'canteen';

export interface LogWithMenu extends Log {
  menu?: Menu;
}

interface HealthOverviewProps {
  logs: LogWithMenu[];
  timeRange: TimeRange;
  onChangeTimeRange: (v: TimeRange) => void;
  dimension: Dimension;
  onChangeDimension: (v: Dimension) => void;
  onSliceClick?: (dim: Dimension, key: string) => void;
}

// A tiny, dependency-free SVG pie chart with hover labels
export default function HealthOverview({
  logs,
  timeRange,
  onChangeTimeRange,
  dimension,
  onChangeDimension,
  onSliceClick,
}: HealthOverviewProps) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const { data, total } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      const m = log.menu;
      if (!m) continue;
      if (dimension === 'category') {
        const key = m.category || 'อื่นๆ';
        counts.set(key, (counts.get(key) || 0) + 1);
      } else if (dimension === 'canteen') {
        const key = m.location || 'อื่นๆ';
        counts.set(key, (counts.get(key) || 0) + 1);
      } else if (dimension === 'taste') {
        // Assumption: use first taste as primary slice to avoid >100% total
        const key = (m.tastes && m.tastes.length > 0) ? m.tastes[0] : 'อื่นๆ';
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    const entries = Array.from(counts.entries())
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    return { data: entries, total };
  }, [logs, dimension]);

  const slices = useMemo(() => {
    let acc = 0;
    return data.map((item) => {
      const start = (acc / total) * 2 * Math.PI;
      acc += item.value;
      const end = (acc / total) * 2 * Math.PI;
      return { ...item, start, end };
    });
  }, [data, total]);

  const colorFillClasses = ['fill-emerald-500', 'fill-blue-500', 'fill-amber-500', 'fill-red-500', 'fill-violet-500', 'fill-cyan-500', 'fill-lime-500'];
  const colorBgClasses = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500', 'bg-cyan-500', 'bg-lime-500'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">สรุปสุขภาพ</h2>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => onChangeTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            aria-label="ช่วงเวลา"
          >
            <option value="day">วัน</option>
            <option value="week">สัปดาห์</option>
            <option value="month">เดือน</option>
          </select>
          <select
            value={dimension}
            onChange={(e) => onChangeDimension(e.target.value as Dimension)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            aria-label="มิติข้อมูล"
          >
            <option value="category">ประเภทอาหาร</option>
            <option value="taste">รสชาติ</option>
            <option value="canteen">โรงอาหาร</option>
          </select>
        </div>
      </div>

      {total === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">ไม่มีข้อมูลในช่วงเวลานี้</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
          {/* Pie Chart */}
          <div className="relative flex items-center justify-center">
            <svg width="240" height="240" viewBox="0 0 240 240">
              <g transform="translate(120,120)">
                {slices.map((s, idx) => {
                  const r = 100;
                  const largeArc = s.end - s.start > Math.PI ? 1 : 0;
                  const x1 = r * Math.cos(s.start);
                  const y1 = r * Math.sin(s.start);
                  const x2 = r * Math.cos(s.end);
                  const y2 = r * Math.sin(s.end);
                  const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const isHover = hoverKey === s.key;
                  return (
                    <path
                      key={s.key}
                      d={d}
                      className={`${colorFillClasses[idx % colorFillClasses.length]} cursor-pointer`}
                      opacity={isHover ? 0.85 : 1}
                      onMouseEnter={() => setHoverKey(s.key)}
                      onMouseLeave={() => setHoverKey(null)}
                      onClick={() => onSliceClick?.(dimension, s.key)}
                    >
                    </path>
                  );
                })}
              </g>
            </svg>
            {/* Center label */}
            <div className="absolute text-center">
              <div className="text-xl font-bold text-gray-800 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">รายการ</div>
            </div>
          </div>

          {/* Legend */}
          <div>
            <ul className="space-y-2">
              {slices.map((s, idx) => {
                const pct = total ? Math.round((s.value / total) * 100) : 0;
                return (
                  <li key={s.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3 h-3 rounded-sm ${colorBgClasses[idx % colorBgClasses.length]}`} />
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate" title={s.key}>
                        {s.key}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {s.value} • {pct}%
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
