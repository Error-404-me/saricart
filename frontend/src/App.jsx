import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { UploadQueueProvider } from "./context/UploadQueueContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import AppRoutes from "./routes/AppRoutes";
import CookieConsent from "./components/common/CookieConsent";
import SkipToContent from "./components/common/SkipToContent";
import { useCookieConsent } from "./hooks/useCookieConsent";

function App() {
  const { consent } = useCookieConsent();

  return (
    <ErrorBoundary>
      <SkipToContent />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
                <UploadQueueProvider>
                  <NotificationsProvider>
                    <AppRoutes />
                    <CookieConsent />
                  </NotificationsProvider>
                </UploadQueueProvider>
              </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      {consent === "accepted" && (
        <>
          <SpeedInsights />
          <Analytics />
        </>
      )}
    </ErrorBoundary>
  );
}

export default App;
