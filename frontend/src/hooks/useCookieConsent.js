import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "saricart_cookie_consent"; // "accepted" | "rejected"

export function useCookieConsent() {
  const [consent, setConsentState] = useState(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === STORAGE_KEY) setConsentState(e.newValue);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setConsent = useCallback((value) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsentState(value);
  }, []);

  return {
    consent,
    setConsent,
    hasDecided: consent === "accepted" || consent === "rejected",
  };
}
