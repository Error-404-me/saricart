import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { UploadQueueProvider } from "./context/UploadQueueContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <UploadQueueProvider>
                <AppRoutes />
              </UploadQueueProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
