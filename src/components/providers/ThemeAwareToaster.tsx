"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Toaster } from "sonner";

type SonnerTheme = "dark" | "light";

const STORAGE_KEY = "studiospace-theme";

function subscribeToTheme(onChange: () => void) {
  if (typeof document === "undefined") {
    return () => {};
  }

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}

function getThemeSnapshot(): SonnerTheme {
  return document.documentElement.dataset.theme === "studiolight"
    ? "light"
    : "dark";
}

function getServerThemeSnapshot(): SonnerTheme {
  return "dark";
}

function applySavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (savedTheme === "studiodark" || savedTheme === "studiolight") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {
    // Keep the default dark theme when browser storage is unavailable.
  }
}

export function ThemeAwareToaster() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useLayoutEffect(() => {
    applySavedTheme();
  }, []);

  return <Toaster richColors position="top-right" theme={theme} />;
}
