"use client";

import { useCallback, useSyncExternalStore } from "react";

export type StudioTheme = "studiodark" | "studiolight";

const THEME_CHANGE_EVENT = "studiospace-theme-change";
const STORAGE_KEY = "studiospace-theme";

function subscribeToTheme(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

function getThemeSnapshot(): StudioTheme {
  return document.documentElement.dataset.theme === "studiolight"
    ? "studiolight"
    : "studiodark";
}

function getServerThemeSnapshot(): StudioTheme {
  return "studiodark";
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const setTheme = useCallback((nextTheme: StudioTheme) => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = nextTheme;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The current page still uses the selected theme if storage is unavailable.
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "studiodark" ? "studiolight" : "studiodark");
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
}
