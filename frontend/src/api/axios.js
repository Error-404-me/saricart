import axios from "axios";
import { getToken, clearToken } from "../utils/localStorage";

// In dev, Vite proxies "/api" to the FastAPI backend (see vite.config.js).
// In production, point this at your deployed API's base URL.
const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it so the app falls back to
// "logged out" state instead of silently failing forever.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    } else if (!error.response && !navigator.onLine) {
      // A request that never reached the server while the browser confirms
      // we're offline — synthesize a response shape so every existing
      // `err.response?.data?.detail` call site across the app picks up a
      // friendly message for free, instead of axios's generic "Network Error".
      error.response = {
        data: { detail: "You're offline. Check your connection and try again." },
      };
    }
    return Promise.reject(error);
  }
);

export default api;
