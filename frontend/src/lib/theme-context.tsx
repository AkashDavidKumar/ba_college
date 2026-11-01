"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "default" | "modern";

interface ThemeContextType {
  theme: ThemeMode;
  isModern: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const THEME_STORAGE_KEY = "bac_color_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "modern" || saved === "default") {
        return saved;
      }
    }
    return "default";
  });

  // Apply theme to document element with smooth transition
  const applyTheme = useCallback((newTheme: ThemeMode, withTransition: boolean = true) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (withTransition) {
      root.classList.add("theme-transitioning");
    }

    if (newTheme === "modern") {
      root.setAttribute("data-theme", "modern");
    } else {
      root.removeAttribute("data-theme");
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not save theme preference to localStorage", e);
    }

    if (withTransition) {
      setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 400);
    }
  }, []);

  // Update theme
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyTheme(newTheme, true);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme: ThemeMode = prev === "modern" ? "default" : "modern";
      applyTheme(nextTheme, true);
      return nextTheme;
    });
  }, [applyTheme]);

  // Initial sync on mount without transition to prevent jarring
  useEffect(() => {
    applyTheme(theme, false);
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const externalTheme: ThemeMode = e.newValue === "modern" ? "modern" : "default";
        setThemeState(externalTheme);
        applyTheme(externalTheme, true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isModern: theme === "modern",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
