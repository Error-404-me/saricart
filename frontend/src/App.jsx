import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          {/* ThemeProvider needs useAuth() to scope dark mode per account,
              so it has to sit inside AuthProvider. */}
          <ThemeProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;
