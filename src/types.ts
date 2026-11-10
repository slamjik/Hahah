export interface BarItem {
  id: string;
  letter: string;
  frequency: number; // typically percentage or numeric value
  formattedValue?: string;
  color?: string;
}

export type SortMode = 
  | 'original'
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'value-desc'
  | 'value-asc';

export type ColorTheme = 
  | 'steelblue'
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'gradient'
  | 'custom';

export interface ChartSettings {
  height: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  barPadding: number;
  borderRadius: number;
  showGrid: boolean;
  showLabels: boolean;
  colorTheme: ColorTheme;
  customColor: string;
  valueFormat: 'percent' | 'decimal' | 'integer' | 'currency';
  yAxisLabel: string;
  xAxisLabel: string;
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  yAxisLabel: string;
  xAxisLabel: string;
  valueFormat: 'percent' | 'decimal' | 'integer' | 'currency';
  data: BarItem[];
}
