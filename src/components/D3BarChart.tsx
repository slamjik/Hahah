import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { BarItem, ChartSettings } from '../types.ts';
import { COLOR_PALETTES } from '../data/presets.ts';
import { formatValue } from '../utils/formatters.ts';

interface D3BarChartProps {
  data: BarItem[];
  settings: ChartSettings;
  highlightedId?: string | null;
  onHoverItem?: (item: BarItem | null) => void;
  svgRefCallback?: (node: SVGSVGElement | null) => void;
}

export const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  settings,
  highlightedId,
  onHoverItem,
  svgRefCallback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localSvgRef = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900);
  const [hoveredBar, setHoveredBar] = useState<{
    item: BarItem;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Responsive width observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const width = Math.max(containerWidth, 360);
  const {
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    barPadding,
    borderRadius,
    showGrid,
    showLabels,
    colorTheme,
    customColor,
    valueFormat,
    yAxisLabel,
  } = settings;

  // D3 Scales calculation
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.letter))
      .range([marginLeft, width - marginRight])
      .padding(barPadding);
  }, [data, marginLeft, width, marginRight, barPadding]);

  const maxVal = useMemo(() => {
    const m = d3.max(data, (d) => d.frequency);
    return m && m > 0 ? m : 1;
  }, [data]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxVal])
      .nice()
      .range([height - marginBottom, marginTop]);
  }, [maxVal, height, marginBottom, marginTop]);

  const yTicks = useMemo(() => {
    return yScale.ticks(6);
  }, [yScale]);

  // Overall statistics for tooltips
  const totalVal = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.frequency, 0);
  }, [data]);

  const sortedRanks = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.frequency - a.frequency);
    const ranks = new Map<string, number>();
    sorted.forEach((item, idx) => {
      ranks.set(item.id, idx + 1);
    });
    return ranks;
  }, [data]);

  // Color selection
  const palette = COLOR_PALETTES[colorTheme] || COLOR_PALETTES.steelblue;
  const baseColor = colorTheme === 'custom' ? customColor : palette.primary;
  const hoverColor = colorTheme === 'custom' ? '#1e40af' : palette.hover;

  // Check if labels need rotation on X axis
  const bandwidth = xScale.bandwidth();
  const shouldRotateXLabels = bandwidth < 26 || data.some((d) => d.letter.length > 3);

  const handleMouseEnter = (item: BarItem, x: number, y: number, w: number, h: number) => {
    setHoveredBar({ item, x, y, width: w, height: h });
    if (onHoverItem) onHoverItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    if (onHoverItem) onHoverItem(null);
  };

  return (
    <div ref={containerRef} className="w-full relative select-none">
      <svg
        ref={(el) => {
          localSvgRef.current = el;
          if (svgRefCallback) svgRefCallback(el);
        }}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="overflow-visible block font-sans"
        aria-label="D3 Bar Chart"
      >
        <defs>
          {/* Linear gradient option for spectrum bar theme */}
          <linearGradient id="spectrumGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Bar shadow filter for active hover state */}
          <filter id="barShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Background Canvas */}
        <rect width={width} height={height} fill="transparent" />

        {/* Horizontal Grid lines */}
        {showGrid && (
          <g className="grid-lines opacity-70">
            {yTicks.map((tick) => {
              const yPos = yScale(tick);
              if (yPos < marginTop || yPos > height - marginBottom) return null;
              return (
                <line
                  key={`grid-${tick}`}
                  x1={marginLeft}
                  y1={yPos}
                  x2={width - marginRight}
                  y2={yPos}
                  className="stroke-neutral-200 dark:stroke-neutral-800"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            })}
          </g>
        )}

        {/* Baseline (0 on Y axis) */}
        <line
          x1={marginLeft}
          y1={yScale(0)}
          x2={width - marginRight}
          y2={yScale(0)}
          className="stroke-neutral-400 dark:stroke-neutral-600"
          strokeWidth="1.2"
        />

        {/* Y Axis Line */}
        <line
          x1={marginLeft}
          y1={marginTop}
          x2={marginLeft}
          y2={height - marginBottom}
          className="stroke-neutral-400 dark:stroke-neutral-600"
          strokeWidth="1.2"
        />

        {/* Y Axis Label (Observable classic positioning at top of Y axis) */}
        <text
          x={marginLeft - 4}
          y={marginTop - 12}
          fill="currentColor"
          textAnchor="start"
          className="text-xs font-semibold fill-neutral-700 dark:fill-neutral-300 tracking-tight"
        >
          {yAxisLabel}
        </text>

        {/* Y Axis Ticks and Labels */}
        <g className="y-axis-ticks text-xs">
          {yTicks.map((tick) => {
            const yPos = yScale(tick);
            return (
              <g key={`ytick-${tick}`} transform={`translate(${marginLeft}, ${yPos})`}>
                <line
                  x1="-6"
                  x2="0"
                  y1="0"
                  y2="0"
                  className="stroke-neutral-400 dark:stroke-neutral-500"
                  strokeWidth="1"
                />
                <text
                  x="-9"
                  y="0"
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-neutral-500 dark:fill-neutral-400 text-[11px] font-mono tabular-nums"
                >
                  {formatValue(tick, valueFormat)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Hover reference guideline to Y axis */}
        {hoveredBar && (
          <line
            x1={marginLeft}
            y1={hoveredBar.y}
            x2={hoveredBar.x + hoveredBar.width / 2}
            y2={hoveredBar.y}
            stroke={baseColor}
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        )}

        {/* The Bars */}
        <g className="bars">
          {data.map((d) => {
            const x = xScale(d.letter);
            if (x === undefined) return null;
            const y = yScale(d.frequency);
            const barWidth = Math.max(xScale.bandwidth(), 1);
            const barHeight = Math.max(yScale(0) - y, 0);
            const isHovered = hoveredBar?.item.id === d.id;
            const isHighlighted = highlightedId === d.id;

            const fillColor =
              colorTheme === 'gradient'
                ? 'url(#spectrumGradient)'
                : isHovered || isHighlighted
                ? hoverColor
                : baseColor;

            return (
              <g
                key={d.id}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => handleMouseEnter(d, x, y, barWidth, barHeight)}
                onMouseLeave={handleMouseLeave}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={borderRadius}
                  ry={borderRadius}
                  fill={fillColor}
                  className={`transition-all duration-200 ${
                    isHovered ? 'brightness-110 filter drop-shadow-md' : 'opacity-95 hover:opacity-100'
                  }`}
                  style={{
                    filter: isHovered ? 'url(#barShadow)' : undefined,
                  }}
                />

                {/* Optional Value Label on Top of Bar */}
                {showLabels && barWidth > 14 && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(y - 5, marginTop + 4)}
                    textAnchor="middle"
                    className="text-[10px] font-mono tabular-nums fill-neutral-700 dark:fill-neutral-300 font-medium"
                  >
                    {formatValue(d.frequency, valueFormat)}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* X Axis Line & Ticks */}
        <g
          className="x-axis text-xs"
          transform={`translate(0, ${height - marginBottom})`}
        >
          {data.map((d) => {
            const x = xScale(d.letter);
            if (x === undefined) return null;
            const center = x + xScale.bandwidth() / 2;
            const isHovered = hoveredBar?.item.id === d.id;
            const isHighlighted = highlightedId === d.id;

            return (
              <g key={`xtick-${d.id}`} transform={`translate(${center}, 0)`}>
                <line
                  y1="0"
                  y2="6"
                  className="stroke-neutral-400 dark:stroke-neutral-500"
                  strokeWidth="1"
                />
                <text
                  y={shouldRotateXLabels ? 14 : 18}
                  x={shouldRotateXLabels ? 0 : 0}
                  transform={shouldRotateXLabels ? 'rotate(-45) translate(-4, 0)' : undefined}
                  textAnchor={shouldRotateXLabels ? 'end' : 'middle'}
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered || isHighlighted
                      ? 'fill-blue-600 dark:fill-blue-400 font-bold text-xs'
                      : 'fill-neutral-600 dark:fill-neutral-400'
                  }`}
                >
                  {d.letter}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Observable-Style Tooltip */}
      {hoveredBar && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75 ease-out shadow-xl rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3.5 py-2.5 text-xs transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${hoveredBar.x + hoveredBar.width / 2}px`,
            top: `${hoveredBar.y - 12}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1 border-b border-neutral-100 dark:border-neutral-800 pb-1">
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {hoveredBar.item.letter}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              Rank #{sortedRanks.get(hoveredBar.item.id) || 1}
            </span>
          </div>
          
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500 dark:text-neutral-400">Value:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatValue(hoveredBar.item.frequency, valueFormat)}
              </span>
            </div>
            
            {valueFormat === 'percent' && (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Exact Ratio:</span>
                <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">
                  {hoveredBar.item.frequency.toFixed(5)}
                </span>
              </div>
            )}

            {totalVal > 0 && valueFormat !== 'percent' && (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 dark:text-neutral-400">Share of Total:</span>
                <span className="text-neutral-700 dark:text-neutral-300 tabular-nums">
                  {((hoveredBar.item.frequency / totalVal) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          {/* Arrow notch */}
          <div className="absolute left-1/2 bottom-0 w-2 h-2 -mb-1 bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-700 transform -translate-x-1/2 rotate-45" />
        </div>
      )}
    </div>
  );
};
