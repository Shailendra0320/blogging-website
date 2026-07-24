import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../api/blogApi";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (authResponse) => {
    const { token, userId, username, email, role } = authResponse;
    const userData = { userId, username, email, role };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (usernameOrEmail, password) => {
    const response = await loginUser({ usernameOrEmail, password });
    return persistSession(response.data);
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    return persistSession(response.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
