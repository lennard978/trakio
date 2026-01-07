import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ NEW

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false); // ⬅️ Mark loading complete

  }, []);

  const saveAuth = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // 🔒 Shared safe fetch
  const callAuth = async (payload) => {
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
  };

  // ✅ Signup
  const signup = async (email, password) => {
    await callAuth({
      action: "signup",
      email,
      password,
    });

    // auto-login after successful signup
    return login(email, password);
  };

  // ✅ Login
  const login = async (email, password) => {
    const data = await callAuth({
      action: "login",
      email,
      password,
    });

    saveAuth(data.user, data.token);
    return true;
  };

  async function logout() {
    // 1️⃣ Clear auth
    localStorage.removeItem("token");

    // 2️⃣ Clear premium snapshot
    localStorage.removeItem("premium_snapshot_v1");

    // 3️⃣ Clear IndexedDB (subscriptions + queue)
    indexedDB.deleteDatabase("trakio-db");

    // 4️⃣ Reload app cleanly
    window.location.href = "/";
  }


  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
