export interface ThemeColors {
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Action colors (light backgrounds)
  actionLight: string;
  successLight: string;
  warningLight: string;
  dangerLight: string;
  purpleLight: string;

  // Action text colors (dark text)
  action: string;
  success: string;
  warning: string;
  danger: string;
  purple: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemeType = 'light' | 'dark';
