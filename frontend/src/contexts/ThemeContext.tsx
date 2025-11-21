import React, { useEffect, useState } from 'react';
import { ThemeContext } from '@/hooks/useTheme';

type Theme = 'light' | 'dark' | 'system';
type ActualTheme = 'light' | 'dark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<ActualTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme
  const getSystemTheme = (): ActualTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Update actual theme based on preference
  const updateActualTheme = React.useCallback((newTheme: Theme) => {
    const actual = newTheme === 'system' ? getSystemTheme() : newTheme;
    setActualTheme(actual);

    // Update document class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actual);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = actual === 'dark' ? '#0f172a' : 'ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'system';

    setTheme(initialTheme);
    updateActualTheme(initialTheme);
    setMounted(true);
  }, [updateActualTheme]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
    const handleChange = () => updateActualTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateActualTheme]);

  // This will handle in setting the theme
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    updateActualTheme(newTheme);
    localStorage.setItem('item', newTheme);
  };

  // Toggles the change of theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    handleSetTheme(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      actualTheme,
      setTheme: handleSetTheme,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
