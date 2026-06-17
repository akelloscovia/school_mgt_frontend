import { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const handler = (e) => {
      // centralized handling of unauthorized events from axios
      logout();
      // navigate to login page
      window.location.href = '/#/login';
    };

    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      // verify token with /auth/me to ensure it's valid
      axiosClient
        .get("/auth/me")
        .then((res) => {
          const serverUser = res.data?.data;
          if (serverUser) {
            setUser(serverUser);
            localStorage.setItem('user', JSON.stringify(serverUser));
          } else {
            logout();
          }
        })
        .catch(() => {
          // invalid token
          logout();
        })
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}