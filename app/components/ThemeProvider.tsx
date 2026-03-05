 "use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function setModeOnDocument(mode: "light" | "dark") {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.dataset.theme = mode;
}

function applyDocumentTheme(theme: Theme) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  if (theme === "system") {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setModeOnDocument(mql.matches ? "dark" : "light");
  } else {
    setModeOnDocument(theme);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  // Initial load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const initial: Theme = stored ?? "system";
    setThemeState(initial);
    applyDocumentTheme(initial);
  }, []);

  // React to theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (event: MediaQueryListEvent) => {
        applyDocumentTheme(event.matches ? "dark" : "light");
      };
      applyDocumentTheme("system");
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    window.localStorage.setItem("theme", theme);
    applyDocumentTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next);
    }
    applyDocumentTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

