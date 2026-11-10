import React from 'react';
import { Download, Moon, Sun, BarChart2 } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExportSvg: () => void;
  activeDatasetId: string;
  onSelectPreset: (id: string) => void;
  onOpenEditor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onExportSvg,
  activeDatasetId,
  onSelectPreset,
  onOpenEditor,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-950 font-bold shadow-sm">
          <BarChart2 className="w-4 h-4 text-sky-400 dark:text-sky-600" />
        </div>
        <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          Observable D3 Bar Chart
        </span>
      </div>

      {/* Zone 2: Navigation / Quick Preset links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        <button
          onClick={() => onSelectPreset('english-letters')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDatasetId === 'english-letters'
              ? 'text-neutral-900 dark:text-white font-semibold underline underline-offset-4 decoration-2 decoration-sky-500'
              : ''
          }`}
        >
          English Alphabet
        </button>
        <button
          onClick={() => onSelectPreset('russian-letters')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDatasetId === 'russian-letters'
              ? 'text-neutral-900 dark:text-white font-semibold underline underline-offset-4 decoration-2 decoration-sky-500'
              : ''
          }`}
        >
          Русский алфавит
        </button>
        <button
          onClick={() => onSelectPreset('prog-languages')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDatasetId === 'prog-languages'
              ? 'text-neutral-900 dark:text-white font-semibold underline underline-offset-4 decoration-2 decoration-sky-500'
              : ''
          }`}
        >
          Languages
        </button>
        <button
          onClick={() => onSelectPreset('world-population')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeDatasetId === 'world-population'
              ? 'text-neutral-900 dark:text-white font-semibold underline underline-offset-4 decoration-2 decoration-sky-500'
              : ''
          }`}
        >
          Population
        </button>
        <button
          onClick={onOpenEditor}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Custom Data
        </button>
      </nav>

      {/* Zone 3: Primary action & theme switch */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onExportSvg}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export SVG</span>
        </button>
      </div>
    </header>
  );
};
