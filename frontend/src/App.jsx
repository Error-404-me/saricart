import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { UploadQueueProvider } from "./context/UploadQueueContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
                <UploadQueueProvider>
                  <AppRoutes />
                </UploadQueueProvider>
              </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
