import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { THEME_CONFIG_KEY, applyThemeColors } from "@/lib/themeColors";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("app-theme") || "dark";
  });
  // Admin-configured custom colors ({ light: {...}, dark: {...} }), loaded once.
  const [customColors, setCustomColors] = useState(null);

  // Load saved theme colors from AppConfig on mount, and refresh when the
  // admin saves new colors (via the "theme-colors-updated" event).
  useEffect(() => {
    base44.entities.AppConfig.filter({ key: THEME_CONFIG_KEY })
      .then((r) => { if (r[0]?.themeColors) setCustomColors(r[0].themeColors); })
      .catch(() => {});
    const onUpdate = (e) => { if (e.detail) setCustomColors(e.detail); };
    window.addEventListener("theme-colors-updated", onUpdate);
    return () => window.removeEventListener("theme-colors-updated", onUpdate);
  }, []);

  // Apply the dark class + any custom colors whenever the mode or colors change.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("app-theme", theme);
    if (customColors) applyThemeColors(customColors, theme);
  }, [theme, customColors]);

  const setTheme = (t) => setThemeState(t);
  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);