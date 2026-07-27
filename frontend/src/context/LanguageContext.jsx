import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { translations } from "../i18n/translations";

export const LanguageContext = createContext(null);

const STORAGE_PREFIX = "saricart_lang";
const DEFAULT_LANG = "en";

// Logged-out visitors (Onboarding, Login, Register) get their own bucket
// too, kept separate from any account's preference — same reasoning as
// ThemeContext, so a shared device doesn't leak one account's language
// choice into another's session.
function keyFor(userId) {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

function readStoredLang(userId) {
  const stored = localStorage.getItem(keyFor(userId));
  return stored === "en" || stored === "fil" ? stored : DEFAULT_LANG;
}

function getNested(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] !== undefined ? String(vars[key]) : match,
  );
}

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState(() => readStoredLang(user?.id));

  // Re-resolve whenever the signed-in account changes (login, logout, or
  // switching accounts in the same browser) — each account keeps its own
  // preference, same as theme.
  useEffect(() => {
    setLangState(readStoredLang(user?.id));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(keyFor(user?.id), lang);
  }, [lang, user?.id]);

  const setLang = useCallback((next) => {
    if (next === "en" || next === "fil") setLangState(next);
  }, []);

  // t("dashboard.welcome", { name: "Nena" }) — looks up a dotted key path,
  // falls back to English if the current language is missing that key,
  // then falls back to the key itself (visible in dev, so a missing
  // translation is obvious rather than silently blank).
  const t = useCallback(
    (path, vars) => {
      const value =
        getNested(translations[lang], path) ?? getNested(translations.en, path) ?? path;
      return interpolate(value, vars);
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}