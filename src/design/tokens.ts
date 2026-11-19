export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const font = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36 } as const;

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  positive: string;
  danger: string;
  // macronutrients
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
};

export const light: Palette = {
  bg: '#F6F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0EC',
  border: '#E0E3DD',
  text: '#14181A',
  textMuted: '#6A726F',
  accent: '#1F7A4D',
  onAccent: '#FFFFFF',
  positive: '#1F9D63',
  danger: '#C8372D',
  kcal: '#14181A',
  protein: '#3B6FD6',
  carbs: '#D9902B',
  fat: '#C2538A',
};

export const dark: Palette = {
  bg: '#0E1112',
  surface: '#171B1C',
  surfaceAlt: '#1F2425',
  border: '#2A3032',
  text: '#F1F3F2',
  textMuted: '#8F9A96',
  accent: '#3FBF86',
  onAccent: '#0E1112',
  positive: '#3FBF86',
  danger: '#EF6A60',
  kcal: '#F1F3F2',
  protein: '#6C97F0',
  carbs: '#EBB052',
  fat: '#E27FB0',
};
