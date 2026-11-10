import { BarItem } from '../types.ts';

export function formatValue(value: number, format: 'percent' | 'decimal' | 'integer' | 'currency'): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  
  switch (format) {
    case 'percent':
      // If values are e.g. 0.08167, display 8.17%
      if (value < 1 && value > 0) {
        return `${(value * 100).toFixed(value * 100 < 0.1 ? 2 : 1)}%`;
      }
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`;
    case 'integer':
      return value.toLocaleString('en-US');
    case 'decimal':
    default:
      return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
}

export function computeTextFrequencies(text: string, language: 'all' | 'english' | 'russian' = 'all'): BarItem[] {
  const counts: Record<string, number> = {};
  let totalChars = 0;

  const enRegex = /^[A-Za-z]$/;
  const ruRegex = /^[А-Яа-яЁё]$/;

  for (const char of text) {
    const upper = char.toUpperCase();
    let matches = false;

    if (language === 'english') {
      matches = enRegex.test(upper);
    } else if (language === 'russian') {
      matches = ruRegex.test(upper);
    } else {
      matches = enRegex.test(upper) || ruRegex.test(upper);
    }

    if (matches) {
      counts[upper] = (counts[upper] || 0) + 1;
      totalChars++;
    }
  }

  if (totalChars === 0) return [];

  const items: BarItem[] = Object.keys(counts).map((char) => ({
    id: `custom-${char}`,
    letter: char,
    frequency: counts[char] / totalChars,
  }));

  // Sort alphabetical by default
  return items.sort((a, b) => a.letter.localeCompare(b.letter));
}
