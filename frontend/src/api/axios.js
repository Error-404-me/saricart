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
    }
    return Promise.reject(error);
  }
);

export default api;
