import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarItem,
  SortMode,
  ChartSettings,
  DatasetPreset,
} from './types.ts';
import { PRESET_DATASETS } from './data/presets.ts';
import { D3BarChart } from './components/D3BarChart.tsx';
import { Header } from './components/Header.tsx';
import { ControlsBar } from './components/ControlsBar.tsx';
import { SummaryStats } from './components/SummaryStats.tsx';
import { CodeInspector } from './components/CodeInspector.tsx';
import { DataTableModal } from './components/DataTableModal.tsx';
import { TextAnalyzerModal } from './components/TextAnalyzerModal.tsx';
import { formatValue } from './utils/formatters.ts';
import {
  Download,
  Share2,
  Table,
  Code,
  LineChart,
  ExternalLink,
  Info,
  Check,
} from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Current dataset & presets
  const [activePresetId, setActivePresetId] = useState<string>('english-letters');
  const [datasetTitle, setDatasetTitle] = useState<string>(
    PRESET_DATASETS[0].name
  );
  const [datasetDescription, setDatasetDescription] = useState<string>(
    PRESET_DATASETS[0].description
  );
  const [currentRawData, setCurrentRawData] = useState<BarItem[]>(
    PRESET_DATASETS[0].data
  );

  // Sorting mode
  const [sortMode, setSortMode] = useState<SortMode>('original');

  // Chart settings
  const [settings, setSettings] = useState<ChartSettings>({
    height: 480,
    marginTop: 30,
    marginRight: 20,
    marginBottom: 40,
    marginLeft: 55,
    barPadding: 0.12,
    borderRadius: 2,
    showGrid: true,
    showLabels: false,
    colorTheme: 'steelblue',
    customColor: '#4682b4',
    valueFormat: 'percent',
    yAxisLabel: '↑ Frequency (%)',
    xAxisLabel: 'Letter',
  });

  // Highlight state from summary stats or table hover
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Modals state
  const [isDataEditorOpen, setIsDataEditorOpen] = useState<boolean>(false);
  const [isTextAnalyzerOpen, setIsTextAnalyzerOpen] = useState<boolean>(false);

  // Active view tab (Chart, Table, Code)
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'code'>('chart');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Reference to the rendered SVG element for high-res exports
  const svgNodeRef = useRef<SVGSVGElement | null>(null);

  // Preset switching
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_DATASETS.find((p) => p.id === presetId);
    if (found) {
      setActivePresetId(found.id);
      setDatasetTitle(found.name);
      setDatasetDescription(found.description);
      setCurrentRawData(found.data);
      setSettings((prev) => ({
        ...prev,
        valueFormat: found.valueFormat,
        yAxisLabel: found.yAxisLabel,
        xAxisLabel: found.xAxisLabel,
      }));
      setSortMode('original');
      showToast(`Loaded ${found.name}`);
    }
  };

  // Applied text analyzer data
  const handleApplyAnalyzedText = (
    analyzedData: BarItem[],
    title: string,
    lang: string
  ) => {
    setActivePresetId('analyzed-text');
    setDatasetTitle(title);
    setDatasetDescription(
      lang === 'russian'
        ? 'Относительное распределение букв введенного текста (рассчитано в реальном времени).'
        : 'Relative letter frequency distribution calculated in real-time from custom text.'
    );
    setCurrentRawData(analyzedData);
    setSettings((prev) => ({
      ...prev,
      valueFormat: 'percent',
      yAxisLabel: lang === 'russian' ? '↑ Частотность (%)' : '↑ Frequency (%)',
      xAxisLabel: lang === 'russian' ? 'Буква' : 'Letter',
    }));
    setSortMode('value-desc');
    showToast('Analyzed text frequency applied to chart!');
  };

  // Saved data from modal table editor
  const handleSaveCustomData = (newData: BarItem[]) => {
    setActivePresetId('custom');
    setDatasetTitle('Custom User Dataset');
    setDatasetDescription('User-edited dataset with custom labels and values.');
    setCurrentRawData(newData);
    showToast('Custom dataset updated!');
  };

  // Sorted data computation
  const sortedData = useMemo(() => {
    const copy = [...currentRawData];
    switch (sortMode) {
      case 'alphabetical-asc':
        return copy.sort((a, b) => a.letter.localeCompare(b.letter));
      case 'alphabetical-desc':
        return copy.sort((a, b) => b.letter.localeCompare(a.letter));
      case 'value-desc':
        return copy.sort((a, b) => b.frequency - a.frequency);
      case 'value-asc':
        return copy.sort((a, b) => a.frequency - b.frequency);
      case 'original':
      default:
        return copy;
    }
  }, [currentRawData, sortMode]);

  // Export as SVG
  const handleExportSvg = () => {
    if (!svgNodeRef.current) return;
    try {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgNodeRef.current);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `d3-bar-chart-${activePresetId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported SVG successfully!');
    } catch {
      showToast('Could not export SVG.');
    }
  };

  // Export as PNG
  const handleExportPng = () => {
    if (!svgNodeRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgNodeRef.current);
      const img = new Image();
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // High-res 2x retina
        canvas.width = svgNodeRef.current!.clientWidth * scale;
        canvas.height = settings.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = darkMode ? '#0a0a0a' : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `d3-bar-chart-${activePresetId}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URLObj.revokeObjectURL(blobURL);
          showToast('Exported PNG successfully!');
        }
      };
      img.src = blobURL;
    } catch {
      showToast('Could not export PNG.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar following Top Bar Contract */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onExportSvg={handleExportSvg}
        activeDatasetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenEditor={() => setIsDataEditorOpen(true)}
      />

      {/* Main Container styled with Observable Notebook Elegance */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Observable Notebook Hero Header */}
        <section className="space-y-2 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          {/* Breadcrumbs matching Observable screenshot */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <span className="hover:text-neutral-900 dark:hover:text-neutral-200">
              D3
            </span>
            <span aria-hidden="true" className="text-neutral-400">
              ›
            </span>
            <span className="hover:text-neutral-900 dark:hover:text-neutral-200">
              Gallery
            </span>
            <span aria-hidden="true" className="text-neutral-400">
              ›
            </span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              Bar chart
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
                Bar chart
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                {datasetDescription}
              </p>
            </div>

            {/* Observable original reference link & actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://observablehq.com/@d3/bar-chart"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs"
              >
                <span>observablehq.com/@d3/bar-chart</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
            </div>
          </div>
        </section>

        {/* Observable-style Controls Bar */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <ControlsBar
            sortMode={sortMode}
            onSortChange={setSortMode}
            selectedPresetId={activePresetId}
            presets={PRESET_DATASETS}
            onSelectPreset={handleSelectPreset}
            settings={settings}
            onUpdateSettings={(partial) =>
              setSettings((prev) => ({ ...prev, ...partial }))
            }
            onOpenDataEditor={() => setIsDataEditorOpen(true)}
            onOpenTextAnalyzer={() => setIsTextAnalyzerOpen(true)}
          />

          {/* View Tab Selector: Chart / Data Table / D3 Code */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 px-6 py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chart')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'chart'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5 text-sky-500" />
                <span>Interactive Chart</span>
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Data Table ({sortedData.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-emerald-500" />
                <span>D3.js Code</span>
              </button>
            </div>

            {/* Quick Export formats */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleExportPng}
                className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                title="Download as PNG raster image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <button
                onClick={handleExportSvg}
                className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                title="Download as scalable vector SVG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Chart View */}
          {activeTab === 'chart' && (
            <div className="p-6 bg-white dark:bg-neutral-900/50">
              <D3BarChart
                data={sortedData}
                settings={settings}
                highlightedId={highlightedId}
                svgRefCallback={(el) => {
                  svgNodeRef.current = el;
                }}
              />
            </div>
          )}

          {/* Tab 2: Tabular View */}
          {activeTab === 'table' && (
            <div className="p-6 bg-white dark:bg-neutral-900/50 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4 w-12">Rank</th>
                    <th className="py-2.5 px-4">Letter / Category</th>
                    <th className="py-2.5 px-4 text-right">Value / Frequency</th>
                    <th className="py-2.5 px-4 text-right">Formatted</th>
                    <th className="py-2.5 px-4 w-48">Distribution Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {sortedData.map((d, index) => {
                    const maxVal = Math.max(...sortedData.map((i) => i.frequency), 1);
                    const pct = (d.frequency / maxVal) * 100;
                    return (
                      <tr
                        key={d.id}
                        onMouseEnter={() => setHighlightedId(d.id)}
                        onMouseLeave={() => setHighlightedId(null)}
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                          highlightedId === d.id
                            ? 'bg-sky-50 dark:bg-sky-950/40'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-4 font-mono text-neutral-400">
                          #{index + 1}
                        </td>
                        <td className="py-2 px-4 font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                          {d.letter}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                          {d.frequency.toFixed(5)}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                          {formatValue(d.frequency, settings.valueFormat)}
                        </td>
                        <td className="py-2 px-4">
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Code Spec View */}
          {activeTab === 'code' && (
            <div className="p-6 bg-neutral-950">
              <CodeInspector
                settings={settings}
                sortMode={sortMode}
                datasetName={datasetTitle}
              />
            </div>
          )}
        </div>

        {/* Statistical Summary Strip */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>Observable Dataset Summary & Metrics</span>
            <span className="text-[11px] text-neutral-500 font-normal">
              Hover peak or lowest metrics to locate bars
            </span>
          </div>
          <SummaryStats
            data={sortedData}
            settings={settings}
            onHighlightItem={setHighlightedId}
          />
        </section>

        {/* D3 Code Inspector Component (Always accessible below the chart) */}
        {activeTab !== 'code' && (
          <section className="pt-2">
            <CodeInspector
              settings={settings}
              sortMode={sortMode}
              datasetName={datasetTitle}
            />
          </section>
        )}

        {/* Information & Methodology Explainer */}
        <section className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-200 text-sm">
            <Info className="w-4 h-4 text-sky-500" />
            <span>About Observable & D3.js Bar Charts</span>
          </div>
          <p>
            In data visualization, the vertical bar chart is one of the most effective and widely understood graphical representations for comparing categorical quantities. First popularized in computer-aided visualization by Mike Bostock (creator of D3.js and Observable), this chart uses a band scale (<code>d3.scaleBand</code>) along the horizontal X axis to map discrete categories with configurable inner padding, and a linear scale (<code>d3.scaleLinear</code>) along the vertical Y axis to map numeric frequencies.
          </p>
          <p>
            You can dynamically re-sort the bars alphabetically or by descending frequency, switch datasets to explore English vs. Russian letter distributions, test custom text passages using the <strong>Analyze Text</strong> tool, or import your own tabular CSV data.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 px-6 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 mt-auto">
        <p>
          Observable D3.js Bar Chart Interactive Laboratory · Built with React & D3.js
        </p>
      </footer>

      {/* Modals */}
      <DataTableModal
        isOpen={isDataEditorOpen}
        onClose={() => setIsDataEditorOpen(false)}
        data={currentRawData}
        onSaveData={handleSaveCustomData}
      />

      <TextAnalyzerModal
        isOpen={isTextAnalyzerOpen}
        onClose={() => setIsTextAnalyzerOpen(false)}
        onApply={handleApplyAnalyzedText}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-xl animate-fade-in border border-neutral-700 dark:border-neutral-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
