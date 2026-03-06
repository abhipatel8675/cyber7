import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeType, lightTheme, darkTheme } from './themes';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setTheme: (themeType: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@cyberapp_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  useEffect(() => {
    const newTheme = themeType === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);
    saveThemeToStorage(themeType);
  }, [themeType]);

  const loadThemeFromStorage = async () => {
    try {
      // For now, use localStorage simulation. In production, install AsyncStorage
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setThemeType(storedTheme);
      }
    } catch (error) {
      console.log('Error loading theme from storage:', error);
    }
  };

  const saveThemeToStorage = async (themeToSave: ThemeType) => {
    try {
      // For now, use localStorage simulation. In production, install AsyncStorage
      localStorage.setItem(THEME_STORAGE_KEY, themeToSave);
    } catch (error) {
      console.log('Error saving theme to storage:', error);
    }
  };

  const toggleTheme = () => {
    setThemeType((prev: ThemeType) => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeTypeExplicitly = (newThemeType: ThemeType) => {
    setThemeType(newThemeType);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeType, 
      toggleTheme, 
      setTheme: setThemeTypeExplicitly 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
