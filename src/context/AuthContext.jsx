import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  const selectCompany = (selectedCompany) => setCompany(selectedCompany);
  const login = (userData) => setUser(userData);
  const logout = () => { setUser(null); setCompany(null); };

  return (
    <AuthContext.Provider value={{ user, company, selectCompany, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
