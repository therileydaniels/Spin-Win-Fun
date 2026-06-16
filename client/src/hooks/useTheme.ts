import { useCallback, useEffect, useState } from "react";

// Single source of truth for dark/light mode. Multiple components (the desktop
// ThemeToggle and the mobile menu in WheelHeader) read and flip the theme, so
// they all share this hook and stay in sync via a custom "themechange" event —
// otherwise each copy keeps its own stale isDark and shows the wrong icon.

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialDark);

  // Keep the <html> class in lockstep with state on every change.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Listen for changes made by any other instance of this hook.
  useEffect(() => {
    const handler = (e: Event) => setIsDark((e as CustomEvent<boolean>).detail);
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}
