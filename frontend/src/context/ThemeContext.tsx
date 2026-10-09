"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
  choice: ThemeChoice; // what the user picked
  resolved: "light" | "dark"; // what is actually shown
  setChoice: (choice: ThemeChoice) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredChoice(): ThemeChoice {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

// Subscribes to the operating system's light/dark setting
function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // null until the saved choice has been read in the browser. Until then the class set
  // by THEME_INIT_SCRIPT is left alone, so there's no flash of the wrong theme.
  const [storedChoice, setStoredChoice] = useState<ThemeChoice | null>(null);
  const choice = storedChoice ?? "system";
  const systemIsDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false, // on the server there is no OS setting
  );

  // Read the saved choice once we're in the browser (localStorage doesn't exist on the server)
  useEffect(() => {
    setStoredChoice(readStoredChoice()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const resolved = choice === "system" ? (systemIsDark ? "dark" : "light") : choice;

  // Apply the theme: a "dark" class on <html> switches every colour token (globals.css)
  useEffect(() => {
    if (storedChoice === null) return;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [storedChoice, resolved]);

  const setChoice = useCallback((next: ThemeChoice) => {
    setStoredChoice(next);
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice still applies until the page is reloaded
    }
  }, []);

  return <ThemeContext.Provider value={{ choice, resolved, setChoice }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

/** Runs before React loads (inlined in <head>), so a dark-mode user never sees a white flash. */
export const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem("${STORAGE_KEY}");
  var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
} catch (e) {}
`;
