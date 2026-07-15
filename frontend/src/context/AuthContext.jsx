import { createContext, useEffect, useState, useCallback } from "react";
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from "../services/authService";
import { getToken, setToken, clearToken } from "../utils/localStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" = we're still checking for an existing session on first load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const { access_token } = await loginUser({ email, password });
      setToken(access_token);
      const current = await fetchCurrentUser();
      setUser(current);
      return current;
    } catch (err) {
      const message =
        err.response?.data?.detail || "Couldn't log you in. Please try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async ({ username, email, password, role }) => {
    setError(null);
    try {
      await registerUser({ username, email, password, role });
      // Register endpoint doesn't log the user in automatically —
      // do that as a follow-up so the flow feels seamless.
      return await login({ email, password });
    } catch (err) {
      const message =
        err.response?.data?.detail || "Couldn't create your account. Please try again.";
      setError(message);
      throw new Error(message);
    }
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
