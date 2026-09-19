import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist token and user to localStorage whenever they change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || "Login failed");
        return { ok: false, user: null, token: null };
      }
      
      // Check if 2FA is required
      if (res.data?.token === "2FA_REQUIRED") {
        return { ok: true, user: res.data.user, token: "2FA_REQUIRED" };
      }
      
      const accessToken = res.data?.accessToken || res.data?.token;
      const userData = res.data?.user || null;
      setToken(accessToken);
      setUser(userData);
      return { ok: true, user: userData, token: accessToken };
    } catch (err) {
      setLoading(false);
      setError(err.message || "Login failed");
      return { ok: false, user: null, token: null };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return { token, user, login, logout, loading, error };
}
