import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Sliders,
  Sparkles,
  FileSpreadsheet,
  Palette,
  Eye,
  Type,
} from 'lucide-react';
import { SortMode, ColorTheme, ChartSettings, DatasetPreset } from '../types.ts';
import { COLOR_PALETTES } from '../data/presets.ts';

interface ControlsBarProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  selectedPresetId: string;
  presets: DatasetPreset[];
  onSelectPreset: (id: string) => void;
  settings: ChartSettings;
  onUpdateSettings: (partial: Partial<ChartSettings>) => void;
  onOpenDataEditor: () => void;
  onOpenTextAnalyzer: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  sortMode,
  onSortChange,
  selectedPresetId,
  presets,
  onSelectPreset,
  settings,
  onUpdateSettings,
  onOpenDataEditor,
  onOpenTextAnalyzer,
}) => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3.5 space-y-3">
      {/* Primary Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Dataset Preset Selection & Quick Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
            Dataset:
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
            {selectedPresetId === 'custom' && (
              <option value="custom">Custom Dataset (Edited)</option>
            )}
            {selectedPresetId === 'analyzed-text' && (
              <option value="analyzed-text">Analyzed Text Frequency</option>
            )}
          </select>

          <button
            onClick={onOpenTextAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
            title="Paste any Russian or English text to compute letter frequency live"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Analyze Text</span>
          </button>

          <button
            onClick={onOpenDataEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
            title="Edit bars, values, or import CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Edit Data / CSV</span>
          </button>
        </div>

        {/* Center/Right: Sorting Segmented Buttons (Iconic Observable feature) */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
            Sort:
          </label>
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => onSortChange('value-desc')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                sortMode === 'value-desc'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Sort by Frequency (Descending - High to Low)"
            >
              <ArrowDownNarrowWide className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Frequency ↓</span>
            </button>

            <button
              onClick={() => onSortChange('value-asc')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                sortMode === 'value-asc'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Sort by Frequency (Ascending - Low to High)"
            >
              <ArrowUpNarrowWide className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Frequency ↑</span>
            </button>

            <button
              onClick={() => onSortChange('alphabetical-asc')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                sortMode === 'alphabetical-asc'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Sort Alphabetically A to Z"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>A → Z</span>
            </button>

            <button
              onClick={() => onSortChange('alphabetical-desc')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                sortMode === 'alphabetical-desc'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Sort Alphabetically Z to A"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Z → A</span>
            </button>

            <button
              onClick={() => onSortChange('original')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                sortMode === 'original'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Preserve Original Order"
            >
              <span>Default</span>
            </button>
          </div>

          {/* Toggle Display Customization Drawer */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showSettingsDrawer
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
            title="Customize bar colors, height, labels, grid"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Expanded Customization Controls Panel */}
      {showSettingsDrawer && (
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Color Palette Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
              <Palette className="w-3.5 h-3.5" />
              <span>Bar Color Theme</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  'steelblue',
                  'indigo',
                  'emerald',
                  'amber',
                  'rose',
                  'slate',
                  'gradient',
                ] as ColorTheme[]
              ).map((colorKey) => {
                const colorInfo = COLOR_PALETTES[colorKey];
                const isSelected = settings.colorTheme === colorKey;
                return (
                  <button
                    key={colorKey}
                    onClick={() => onUpdateSettings({ colorTheme: colorKey })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 dark:border-white scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        colorKey === 'gradient' ? '#38bdf8' : colorInfo.primary,
                    }}
                    title={colorInfo.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Sliders: Bar Padding & Border Radius */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 mb-0.5">
                <span>Bar Spacing (Padding):</span>
                <span className="font-mono">{settings.barPadding.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.barPadding}
                onChange={(e) =>
                  onUpdateSettings({ barPadding: parseFloat(e.target.value) })
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 mb-0.5">
                <span>Corner Rounding:</span>
                <span className="font-mono">{settings.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={settings.borderRadius}
                onChange={(e) =>
                  onUpdateSettings({ borderRadius: parseInt(e.target.value, 10) })
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Chart Height Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400 mb-0.5">
              <span>Chart Height:</span>
              <span className="font-mono">{settings.height}px</span>
            </div>
            <input
              type="range"
              min="300"
              max="650"
              step="25"
              value={settings.height}
              onChange={(e) =>
                onUpdateSettings({ height: parseInt(e.target.value, 10) })
              }
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500">
              <span>Observable standard: 450px – 500px</span>
            </div>
          </div>

          {/* Toggles: Gridlines & Value Labels */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => onUpdateSettings({ showGrid: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Horizontal Gridlines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={settings.showLabels}
                onChange={(e) => onUpdateSettings({ showLabels: e.target.checked })}
                className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span>Show Value Labels on Bars</span>
            </label>

            <button
              onClick={() =>
                onUpdateSettings({
                  colorTheme: 'steelblue',
                  barPadding: 0.1,
                  borderRadius: 0,
                  height: 480,
                  showGrid: true,
                  showLabels: false,
                })
              }
              className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline cursor-pointer"
            >
              Reset to Classic D3 Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
