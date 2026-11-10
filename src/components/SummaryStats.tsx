import React, { useMemo } from 'react';
import { BarItem, ChartSettings } from '../types.ts';
import { formatValue } from '../utils/formatters.ts';
import { TrendingUp, Award, Layers, Hash } from 'lucide-react';

interface SummaryStatsProps {
  data: BarItem[];
  settings: ChartSettings;
  onHighlightItem: (id: string | null) => void;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  data,
  settings,
  onHighlightItem,
}) => {
  const stats = useMemo(() => {
    if (!data.length) return null;

    const sortedByVal = [...data].sort((a, b) => b.frequency - a.frequency);
    const maxItem = sortedByVal[0];
    const minItem = sortedByVal[sortedByVal.length - 1];

    const total = data.reduce((acc, curr) => acc + curr.frequency, 0);
    const mean = total / data.length;

    // Median
    const mid = Math.floor(sortedByVal.length / 2);
    const median =
      sortedByVal.length % 2 !== 0
        ? sortedByVal[mid].frequency
        : (sortedByVal[mid - 1].frequency + sortedByVal[mid].frequency) / 2;

    return {
      count: data.length,
      maxItem,
      minItem,
      total,
      mean,
      median,
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      {/* Total Bars */}
      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Categories</span>
        </div>
        <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
          {stats.count}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          Total items on X axis
        </div>
      </div>

      {/* Highest / Peak */}
      <div
        onMouseEnter={() => onHighlightItem(stats.maxItem.id)}
        onMouseLeave={() => onHighlightItem(null)}
        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-sky-400 dark:hover:border-sky-600 transition-colors cursor-pointer"
        title="Hover to highlight bar on chart"
      >
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Peak / Max</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.maxItem.letter}
          </span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
            {formatValue(stats.maxItem.frequency, settings.valueFormat)}
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          Highest frequency value
        </div>
      </div>

      {/* Mean / Average */}
      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Mean Average</span>
        </div>
        <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
          {formatValue(stats.mean, settings.valueFormat)}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          Arithmetic mean per bar
        </div>
      </div>

      {/* Lowest / Min */}
      <div
        onMouseEnter={() => onHighlightItem(stats.minItem.id)}
        onMouseLeave={() => onHighlightItem(null)}
        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-sky-400 dark:hover:border-sky-600 transition-colors cursor-pointer"
        title="Hover to highlight bar on chart"
      >
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-1">
          <Hash className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Lowest / Min</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.minItem.letter}
          </span>
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 font-mono tabular-nums">
            {formatValue(stats.minItem.frequency, settings.valueFormat)}
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          Lowest recorded value
        </div>
      </div>
    </div>
  );
};
