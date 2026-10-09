import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  font: string;
  setFont: (font: string) => void;
  isSidebarHovered: boolean;
  setIsSidebarHovered: (hovered: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  
  const getStorageKey = (key: string) => `${key}_${userId}`;

  const [theme, setThemeState] = useState<Theme>(() => {
    // Initial read will likely be 'guest' if auth is still loading, but that's fine, it will sync later.
    const saved = localStorage.getItem('theme_guest') as Theme; 
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>('light');
  const [showSidebarIcons, setShowSidebarIconsState] = useState<boolean>(true);
  const [font, setFontState] = useState<string>('Barlow');

  const [isSidebarHovered, setIsSidebarHoveredState] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings when the user logs in/switches
  useEffect(() => {
    const savedTheme = localStorage.getItem(getStorageKey('theme')) as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    const savedSidebar = localStorage.getItem(getStorageKey('sidebarTheme')) as SidebarTheme;
    setSidebarThemeState(savedSidebar || 'light');

    const savedIcons = localStorage.getItem(getStorageKey('showSidebarIcons'));
    setShowSidebarIconsState(savedIcons === null ? true : savedIcons === 'true');

    const savedFont = localStorage.getItem(getStorageKey('font'));
    setFontState(savedFont || 'Barlow');
  }, [userId]);

  const setIsSidebarHovered = (hovered: boolean) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hovered) {
      setIsSidebarHoveredState(true);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsSidebarHoveredState(false);
      }, 150);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(getStorageKey('theme'), newTheme);
  };

  const setSidebarTheme = (newTheme: SidebarTheme) => {
    setSidebarThemeState(newTheme);
    localStorage.setItem(getStorageKey('sidebarTheme'), newTheme);
  };

  const setShowSidebarIcons = (show: boolean) => {
    setShowSidebarIconsState(show);
    localStorage.setItem(getStorageKey('showSidebarIcons'), String(show));
  };

  const setFont = (newFont: string) => {
    setFontState(newFont);
    localStorage.setItem(getStorageKey('font'), newFont);
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
    
    // Sync font
    root.style.setProperty('--font-primary', `'${font}', sans-serif`);
    
    // Also sync sidebar theme attribute for global targeting if needed
    root.setAttribute('data-sidebar-theme', theme === 'dark' ? 'dark' : sidebarTheme);
  }, [theme, sidebarTheme, font]);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, toggleTheme, 
      sidebarTheme, setSidebarTheme,
      showSidebarIcons, setShowSidebarIcons,
      font, setFont,
      isSidebarHovered, setIsSidebarHovered
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
