import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";

import SparkAdminLogin from "../pages/Auth/SparkAdminLogin";

// Access admin login directly via: yourapp.com/#/admin
const isAdminRoute = window.location.hash === "#/admin";

const AppRouter = () => {
  const { user, company, selectCompany, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("Dashboard");

  // ── Admin route ──────────────────────────────────────────
  if (isAdminRoute) {
    return <SparkAdminLogin />;
  }

  // ── User route (default) ─────────────────────────────────
  if (!company) return <Landing onSelectCompany={selectCompany} />;
  if (!user)    return <Login company={company} onLogin={login} onBack={() => selectCompany(null)} />;

  const pageProps = { user, onLogout: logout, activePage: currentPage, onNavigate: setCurrentPage };

  switch (currentPage) {
    case "Profile": return <Profile  {...pageProps} />;
    default:        return <Dashboard {...pageProps} />;
  }
};

export default AppRouter;