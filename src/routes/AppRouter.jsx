import { useAuth } from "../context/AuthContext";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";

const AppRouter = () => {
  const { user, company, selectCompany, login, logout } = useAuth();

  if (!company) return <Landing onSelectCompany={selectCompany} />;
  if (!user) return <Login company={company} onLogin={login} onBack={() => selectCompany(null)} />;
  return <Dashboard user={user} onLogout={logout} />;
};

export default AppRouter;
