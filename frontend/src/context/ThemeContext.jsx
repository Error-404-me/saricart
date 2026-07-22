import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";

export const ThemeContext = createContext(null);

const STORAGE_PREFIX = "saricart_theme";

function keyFor(userId) {
  // Logged-out visitors (Onboarding, Login, Register) get their own bucket
  // too, kept separate from any account's preference.
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

function readStoredTheme(userId) {
  const stored = localStorage.getItem(keyFor(userId));
  if (stored === "light" || stored === "dark") return stored;

  // One-time fallback to the old device-wide key from before theme was
  // scoped per account, so nobody's existing preference just vanishes.
  const legacy = localStorage.getItem(STORAGE_PREFIX);
  if (legacy === "light" || legacy === "dark") return legacy;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => readStoredTheme(user?.id));

  // Re-resolve whenever the signed-in account changes (login, logout, or
  // switching accounts in the same browser) — each account keeps its own
  // preference instead of inheriting whatever the last session left set.
  useEffect(() => {
    setTheme(readStoredTheme(user?.id));
  }, [user?.id]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(keyFor(user?.id), theme);
  }, [theme, user?.id]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}
