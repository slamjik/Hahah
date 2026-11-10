import React, { useState } from 'react';
import { X, Sparkles, Check, RefreshCw } from 'lucide-react';
import { BarItem } from '../types.ts';
import { computeTextFrequencies } from '../utils/formatters.ts';

interface TextAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: BarItem[], title: string, language: string) => void;
}

const SAMPLE_TEXTS = [
  {
    title: 'English: Quick Brown Fox (Pangram)',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
    lang: 'english' as const,
  },
  {
    title: 'English: Mike Bostock D3 Quote',
    text: 'D3 allows you to bind arbitrary data to a Document Object Model, and then apply data-driven transformations to the document. For example, you can use D3 to generate an HTML table from an array of numbers. Or, use the same data to create an interactive SVG bar chart with smooth transitions and interaction.',
    lang: 'english' as const,
  },
  {
    title: 'Русский: А. С. Пушкин — Лукоморье',
    text: 'У лукоморья дуб зелёный; Златая цепь на дубе том: И днём и ночью кот учёный Всё ходит по цепи кругом; Идёт направо — песнь заводит, Налево — сказку говорит. Там чудеса: там леший бродит, Русалка на ветвях сидит.',
    lang: 'russian' as const,
  },
  {
    title: 'Русский: Панграмма',
    text: 'Съешь же ещё этих мягких французских булок, да выпей чаю. В чащах юга жил-был цитрус? Да, но фальшивый экземпляр!',
    lang: 'russian' as const,
  },
];

export const TextAnalyzerModal: React.FC<TextAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [selectedLang, setSelectedLang] = useState<'all' | 'english' | 'russian'>('english');
  const [previewData, setPreviewData] = useState<BarItem[]>(() =>
    computeTextFrequencies(SAMPLE_TEXTS[0].text, 'english')
  );

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setInputText(text);
    setPreviewData(computeTextFrequencies(text, selectedLang));
  };

  const handleLangChange = (lang: 'all' | 'english' | 'russian') => {
    setSelectedLang(lang);
    setPreviewData(computeTextFrequencies(inputText, lang));
  };

  const handleLoadSample = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setInputText(sample.text);
    setSelectedLang(sample.lang);
    setPreviewData(computeTextFrequencies(sample.text, sample.lang));
  };

  const handleApplyToChart = () => {
    if (previewData.length === 0) return;
    const title =
      selectedLang === 'russian'
        ? 'Частотность букв введенного текста'
        : 'Text Letter Frequency';
    onApply(previewData, title, selectedLang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Live Text Letter Frequency Analyzer</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Paste any custom text or literature to instantly compute letter frequency and visualize it on the bar chart.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Sample quick buttons */}
          <div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Quick Samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Text to Analyze:
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Filter alphabet:</span>
                <select
                  value={selectedLang}
                  onChange={(e) =>
                    handleLangChange(e.target.value as 'all' | 'english' | 'russian')
                  }
                  className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-0.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer"
                >
                  <option value="english">English (A–Z)</option>
                  <option value="russian">Русский (А–Я)</option>
                  <option value="all">All characters</option>
                </select>
              </div>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste or type any paragraph here..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Real-time Preview Pill Grid */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">
              <span>Detected Letters ({previewData.length} unique):</span>
              <span className="font-mono">
                Total letters: {previewData.reduce((acc, c) => acc + (c.frequency > 0 ? 1 : 0), 0)}
              </span>
            </div>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg max-h-36 overflow-y-auto flex flex-wrap gap-2 text-xs font-mono">
              {previewData.length > 0 ? (
                previewData.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                  >
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {d.letter}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {(d.frequency * 100).toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-neutral-400 italic">No matching letters detected in the text.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyToChart}
            disabled={previewData.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Bar Chart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
