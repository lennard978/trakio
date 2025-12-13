import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const saveAuth = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // ✅ SAFER signup
  const signup = async (email, password) => {
    let data;
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email,
          password,
        }),
      });


      data = await res.json(); // still might throw, so in try
      if (!res.ok) throw new Error(data.error || "Signup failed");

      return login(email, password); // auto-login
    } catch (err) {
      console.error("Signup failed:", err);
      throw new Error(data?.error || err.message || "Signup failed");
    }
  };

  // ✅ SAFER login
  const login = async (email, password) => {
    let data;
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });


      data = await res.json(); // catch invalid JSON too
      if (!res.ok) throw new Error(data.error || "Login failed");

      saveAuth(data.user, data.token);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      throw new Error(data?.error || err.message || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
