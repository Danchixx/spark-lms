import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type SidebarTheme = 'light' | 'black';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
  showSidebarIcons: boolean;
  setShowSidebarIcons: (show: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>(() => {
    const saved = localStorage.getItem('sidebarTheme') as SidebarTheme;
    return saved || 'light';
  });

  const [showSidebarIcons, setShowSidebarIconsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('showSidebarIcons');
    return saved === null ? true : saved === 'true';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setSidebarTheme = (newTheme: SidebarTheme) => {
    setSidebarThemeState(newTheme);
    localStorage.setItem('sidebarTheme', newTheme);
  };

  const setShowSidebarIcons = (show: boolean) => {
    setShowSidebarIconsState(show);
    localStorage.setItem('showSidebarIcons', String(show));
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    
    // Also sync sidebar theme attribute for global targeting if needed
    root.setAttribute('data-sidebar-theme', theme === 'dark' ? 'dark' : sidebarTheme);
  }, [theme, sidebarTheme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, toggleTheme, 
      sidebarTheme, setSidebarTheme,
      showSidebarIcons, setShowSidebarIcons
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
