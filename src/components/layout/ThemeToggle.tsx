"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "studiodark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-circle btn-sm sm:btn-md"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onClick={toggleTheme}
    >
      {theme === "studiodark" ? (
        <FiSun aria-hidden="true" className="size-5 text-primary" />
      ) : (
        <FiMoon aria-hidden="true" className="size-5 text-primary" />
      )}
    </button>
  );
}
