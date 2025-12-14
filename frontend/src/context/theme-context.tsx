"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  setTheme?: (next: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    if (switchable) {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      // fallback to system preference if no stored value
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return prefersDark ? "dark" : "light";
    }
    return defaultTheme;
  });

  useEffect(() => {
    console.log(
      "[Theme] useEffect triggered, theme:",
      theme,
      "switchable:",
      switchable
    );
    const root = document.documentElement;
    if (theme === "dark") {
      console.log("[Theme] Adding dark class to document element");
      root.classList.add("dark");
    } else {
      console.log("[Theme] Removing dark class from document element");
      root.classList.remove("dark");
    }
    console.log("[Theme] Current classList:", root.className);
    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        console.log("[Theme] toggleTheme called");
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const handleSetTheme = switchable
    ? (next: Theme) => {
        console.log("[Theme] setTheme called with:", next);
        setThemeState(next);
      }
    : undefined;

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme: handleSetTheme, switchable }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
