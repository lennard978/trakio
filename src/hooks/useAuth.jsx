// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

const USER_KEY = "user";
const TOKEN_KEY = "token";
const PREMIUM_SNAPSHOT_KEY = "premium_snapshot_v1";

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Load auth from storage ---------- */
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const savedUser = localStorage.getItem(USER_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch {
      // corrupted storage → ignore
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- Persist auth ---------- */
  const saveAuth = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, tokenValue);
    } catch {
      // ignore storage failures
    }
  }, []);

  /* ---------- Clear auth ---------- */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);

    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PREMIUM_SNAPSHOT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Shared auth API caller                                             */
  /* ------------------------------------------------------------------ */

  const callAuth = useCallback(async (payload) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.error || "Authentication failed");
    }

    return data;
  }, []);

  /* ------------------------------------------------------------------ */
  /* Signup                                                            */
  /* ------------------------------------------------------------------ */

  const signup = useCallback(
    async (email, password) => {
      await callAuth({
        action: "signup",
        email,
        password,
      });

      // Auto-login after signup
      return login(email, password);
    },
    [callAuth]
  );

  /* ------------------------------------------------------------------ */
  /* Login                                                             */
  /* ------------------------------------------------------------------ */

  const login = useCallback(
    async (email, password) => {
      const data = await callAuth({
        action: "login",
        email,
        password,
      });

      saveAuth(data.user, data.token);
      return true;
    },
    [callAuth, saveAuth]
  );

  /* ------------------------------------------------------------------ */
  /* Logout                                                            */
  /* ------------------------------------------------------------------ */

  const logout = useCallback(async () => {
    clearAuth();

    // Clear IndexedDB (subscriptions, queue, etc.)
    try {
      indexedDB.deleteDatabase("trakio-db");
    } catch {
      /* ignore */
    }

    // Hard reload ensures clean app state
    window.location.href = "/";
  }, [clearAuth]);

  /* ------------------------------------------------------------------ */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/* ------------------------------------------------------------------ */
/* Consumer hook                                                       */
/* ------------------------------------------------------------------ */

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    // SAFE fallback – prevents white screens
    return {
      user: null,
      token: null,
      loading: false,
      signup: async () => false,
      login: async () => false,
      logout: async () => { },
    };
  }

  return ctx;
}
