export interface ThemeColors {
  // Primary colors
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  
  // UI elements
  border: string;
  shadow: string;
  overlay: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemeType = 'light' | 'dark';
