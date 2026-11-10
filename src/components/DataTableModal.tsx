import React, { useState } from 'react';
import { X, Plus, Trash2, Download, Upload, Check } from 'lucide-react';
import { BarItem } from '../types.ts';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BarItem[];
  onSaveData: (newData: BarItem[]) => void;
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveData,
}) => {
  const [items, setItems] = useState<BarItem[]>(() =>
    data.map((d) => ({ ...d }))
  );
  const [csvText, setCsvText] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'csv'>('table');
  const [newLetter, setNewLetter] = useState('');
  const [newValue, setNewValue] = useState('');

  if (!isOpen) return null;

  const handleUpdateItem = (id: string, field: 'letter' | 'frequency', val: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === 'frequency') {
            const num = parseFloat(val);
            return { ...item, frequency: isNaN(num) ? 0 : num };
          }
          return { ...item, letter: val };
        }
        return item;
      })
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetter.trim()) return;
    const num = parseFloat(newValue) || 0;
    const newItem: BarItem = {
      id: `custom-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      letter: newLetter.trim(),
      frequency: num,
    };
    setItems((prev) => [...prev, newItem]);
    setNewLetter('');
    setNewValue('');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleImportCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const parsed: BarItem[] = [];

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      // Skip header if line starts with letter, name, category, etc.
      if (
        index === 0 &&
        (cleanLine.toLowerCase().includes('letter') ||
          cleanLine.toLowerCase().includes('name') ||
          cleanLine.toLowerCase().includes('label'))
      ) {
        return;
      }
      const parts = cleanLine.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const letter = parts[0].replace(/^["']|["']$/g, '');
        const freq = parseFloat(parts[1].replace(/[%$,]/g, ''));
        if (letter && !isNaN(freq)) {
          parsed.push({
            id: `csv-${index}-${Date.now()}`,
            letter,
            frequency: freq,
          });
        }
      }
    });

    if (parsed.length > 0) {
      setItems(parsed);
      setActiveTab('table');
      setCsvText('');
    }
  };

  const handleDownloadCsv = () => {
    const header = 'letter,frequency\n';
    const rows = items.map((i) => `"${i.letter}",${i.frequency}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'observable_bar_chart_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAndApply = () => {
    onSaveData(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Dataset Editor & CSV
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Edit bars directly, add categories, or paste raw CSV data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('table')}
            className={`py-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'table'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Table Editor ({items.length} items)
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'csv'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Paste CSV / TSV
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'table' ? (
            <div className="space-y-4">
              {/* Add item row */}
              <form
                onSubmit={handleAddItem}
                className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs"
              >
                <input
                  type="text"
                  placeholder="Label / Letter"
                  value={newLetter}
                  onChange={(e) => setNewLetter(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Value / Frequency"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-32 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Items Table */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Label / Letter</th>
                      <th className="py-2 px-3">Value / Frequency</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      >
                        <td className="py-1.5 px-3 font-mono text-neutral-400">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={item.letter}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'letter', e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-sky-500 bg-transparent text-neutral-900 dark:text-neutral-100"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="number"
                            step="any"
                            value={item.frequency}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'frequency', e.target.value)
                            }
                            className="w-32 px-2 py-1 rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-sky-500 bg-transparent font-mono text-neutral-900 dark:text-neutral-100"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete bar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Paste comma-separated, tab-separated, or semicolon-separated rows (format: <code>letter, frequency</code>):
              </p>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="A, 0.08167&#10;B, 0.01492&#10;C, 0.02782&#10;..."
                className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleImportCsv}
                disabled={!csvText.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Parse and Replace Current Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
