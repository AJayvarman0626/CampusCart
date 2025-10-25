import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("campusUser")) || null
  );

  const login = (data) => {
    setUser(data);
    localStorage.setItem("campusUser", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("campusUser");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("campusUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
