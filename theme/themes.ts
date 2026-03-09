import { Theme, ThemeType } from "./types";

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
  action: string;
  actionSecondary: string;
  success: string;
  warningLight: string;
  dangerLight: string;

  // Action text colors (dark text)
  actionDark: string;
  actionSecondaryDark: string;
  successDark: string;
  warning: string;
  danger: string;
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    // Text colors
    textPrimary: "#333",
    textSecondary: "#666",
    textTertiary: "#999",

    // Background colors
    bgPrimary: "#F9F9F9",
    bgSecondary: "#F2F2F2",
    bgTertiary: "#E5E5E5",

    // Action colors (light backgrounds)
    actionLight: "#FFFFFF",
    successLight: "#d4edda",
    warningLight: "#cead90",
    dangerLight: "#f8d7da",
    purpleLight: "#c0aedd",

    // Action text colors (dark text)
    action: "#007bff",
    success: "#13e644",
    warning: "#e26f0a",
    danger: "#e4071a",
    purple: "#671fda",
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    // Text colors
    textPrimary: "#FFFFFF",
    textSecondary: "#757575",
    textTertiary: "#666666",

    // Background colors
    bgPrimary: "#1A1A1A",
    bgSecondary: "#242424",
    bgTertiary: "#2C2C2C",

    // Action colors (light backgrounds)
    actionLight: "#bbcfe4",
    successLight: "#d4edda",
    warningLight: "#cead90",
    dangerLight: "#f8d7da",
    purpleLight: "#c0aedd",
    // Action text colors (dark text)
    action: "#007bff",
    success: "#13e644",
    warning: "#e26f0a",
    danger: "#e4071a",
    purple: "#671fda",
  },
};
