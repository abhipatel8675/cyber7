import { Theme, ThemeType } from './types';

export { Theme, ThemeType };

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#ffffff', // White header/footer background
    secondary: '#f8f9fa', // Light grey for sidebar, cards
    background: '#f5f5f5', // Main background
    surface: '#ffffff', // White for cards, content areas
    text: '#2c3e50', // Dark text
    textSecondary: '#6c757d', // Secondary text
    border: '#dee2e6', // Light borders
    shadow: 'rgba(0,0,0,0.08)', // Light shadow
    overlay: 'rgba(0,0,0,0.3)', // Overlay for sidebar
    success: '#28a745', // Green for success
    warning: '#ffc107', // Yellow for warning
    error: '#dc3545', // Red for error/critical alerts
  }
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#1e1e1e', // Dark grey for header/footer
    secondary: '#2d2d2d', // Dark grey for sidebar, cards
    background: '#1a1a1a', // Dark grey background
    surface: '#252525', // Dark grey surface for cards, content areas
    text: '#ffffff', // White text
    textSecondary: '#b0b0b0', // Light grey secondary text
    border: '#404040', // Dark grey borders
    shadow: 'rgba(0, 0, 0, 0.4)', // Dark shadow
    overlay: 'rgba(0, 0, 0, 0.7)', // Dark overlay for sidebar
    success: '#28a745', // Green for success
    warning: '#ffc107', // Yellow for warning
    error: '#dc3545', // Red for error/critical alerts
  }
};
