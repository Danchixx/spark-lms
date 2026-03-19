import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ── Helpers to read / write sessionStorage safely ──
const readSession = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSession = (key, value) => {
  if (value === null) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, JSON.stringify(value));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession("spark_user"));
  const [company, setCompany] = useState(() => readSession("spark_company"));

  const selectCompany = (c) => {
    setCompany(c);
    writeSession("spark_company", c);
  };

  const login = (userData) => {
    setUser(userData);
    writeSession("spark_user", userData);
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    writeSession("spark_user", null);
    writeSession("spark_company", null);
  };

  return (
    <AuthContext.Provider value={{ user, company, selectCompany, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);