import { createContext, useContext, useState, useEffect } from "react";

const SAThemeContext = createContext(null);

export const SAThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("sa_theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("sa_theme", newTheme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  // Follow OS theme changes live when user has no explicit choice saved
  useEffect(() => {
    let hasSaved = false;
    try {
      hasSaved = !!localStorage.getItem("sa_theme");
    } catch (e) {}

    if (!hasSaved && typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => {
        try {
          if (!localStorage.getItem("sa_theme")) {
            setThemeState(e.matches ? "dark" : "light");
          }
        } catch (err) {}
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  return (
    <SAThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </SAThemeContext.Provider>
  );
};

export const useSATheme = () => useContext(SAThemeContext);
