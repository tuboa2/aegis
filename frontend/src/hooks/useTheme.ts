import React from "react";

type Theme = 'light' | 'dark' | 'system';
type ActualTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  actualTheme: ActualTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}