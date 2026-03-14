import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SparkHeader from "../../components/layout/SparkHeader/SparkHeader";
import LeftPanel from "../../components/layout/LeftPanel/LeftPanel";
import { MOCK_USERS } from "../../utils/mockData";
import { User, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { company: authCompany, login, selectCompany } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Use company from navigation state (preferred) or fallback to context
  const company = location.state?.company || authCompany;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  // If no company, redirect back to landing
  if (!company) return <Navigate to="/" replace />;

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!username || !password) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1800));
    const user = MOCK_USERS[username.toLowerCase()];
    if (!user) { setError("wrong_credentials"); setLoading(false); return; }
    if (user.company !== company.id) { setError("not_in_company"); setLoading(false); return; }
    if (user.password !== password) { setError("wrong_credentials"); setLoading(false); return; }
    setLoading(false);
    login({ ...user, company });
    const slug = company.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/${slug}/dashboard`);
  };

  const handleBack = () => {
    selectCompany(null);
    navigate("/");
  };

  return (
    <>
      <style>{`
        .login-page { min-height: 100vh; background: #e8e8e8; display: flex; flex-direction: column; }
        .login-body { flex: 1; display: flex; flex-direction: row; align-items: stretch; }
        .login-left-wrapper { width: 50%; flex-shrink: 0; display: flex; order: 1; }
        .login-form-area { flex: 1; display: flex; justify-content: center; align-items: center; padding: 40px; order: 2; }
        @media (max-width: 1024px) { .login-left-wrapper { width: 45%; } }
        @media (max-width: 767px) {
          .login-body { flex-direction: column; }
          .login-left-wrapper { width: 100%; order: 2; }
          .login-form-area { order: 1; padding: 24px 16px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="login-page">
        <SparkHeader />

        <div className="login-body">
          <div className="login-left-wrapper">
            <LeftPanel subtitle={`Welcome to ${company.name} Learning Portal, powered by SPARK. Please sign in to access the LMS.`} />
          </div>

          <div className="login-form-area">
            <div style={{ background: "white", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 340, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
              <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: 26, letterSpacing: 2, margin: "0 0 20px", fontFamily: "'Barlow Condensed', sans-serif" }}>LOGIN</h2>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", border: `2px solid ${company.color}44`, background: company.color + "11", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {typeof company.logo === "string" && company.logo.startsWith("/")
                    ? <img src={company.logo} alt={company.name} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                    : <span style={{ fontWeight: 900, fontSize: 22, color: company.color, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>{company.logo}</span>
                  }
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                {touched.username && !username && (
                  <div style={{ fontSize: 11, color: "#e74c3c", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ background: "#e74c3c", color: "white", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>!</span>
                    Please fill out this field.
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${touched.username && !username ? "#e74c3c" : "#ddd"}`, borderRadius: 8, overflow: "hidden" }}>
                  <span style={{ padding: "0 12px", background: "#f8f8f8", alignSelf: "stretch", display: "flex", alignItems: "center", flexShrink: 0 }}><User size={18} color="#555" /></span>
                  <input value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} onBlur={() => setTouched((t) => ({ ...t, username: true }))} placeholder="Username" style={{ flex: 1, padding: "11px 12px", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                {touched.password && !password && (
                  <div style={{ fontSize: 11, color: "#e74c3c", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ background: "#e74c3c", color: "white", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>!</span>
                    Please fill out this field.
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${touched.password && !password ? "#e74c3c" : "#ddd"}`, borderRadius: 8, overflow: "hidden" }}>
                  <span style={{ padding: "0 12px", background: "#f8f8f8", alignSelf: "stretch", display: "flex", alignItems: "center", flexShrink: 0 }}><Lock size={18} color="#555" /></span>
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onBlur={() => setTouched((t) => ({ ...t, password: true }))} placeholder="Password" style={{ flex: 1, minWidth: 0, padding: "11px 12px", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }} />
                  <span onClick={() => setShowPass(!showPass)} style={{ padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    {showPass ? <EyeOff size={18} color="#777" /> : <Eye size={18} color="#777" />}
                  </span>
                </div>
              </div>

              {error === "wrong_credentials" && (
                <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#e74c3c" }}>⚠</span><span style={{ fontSize: 13, color: "#c0392b" }}>User credentials are not valid</span></div>
                  <span onClick={() => setError("")} style={{ cursor: "pointer", color: "#e74c3c", fontWeight: 700, fontSize: 14 }}>×</span>
                </div>
              )}

              {error === "not_in_company" && (
                <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#e74c3c" }}>⚠</span><span style={{ fontSize: 13, color: "#c0392b" }}>You do not belong to {company.name}</span></div>
                  <span onClick={() => setError("")} style={{ cursor: "pointer", color: "#e74c3c", fontWeight: 700, fontSize: 14 }}>×</span>
                </div>
              )}

              {loading && (
                <div style={{ background: "#e8f8f0", border: "1px solid #a8dfc0", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="spin" style={{ width: 14, height: 14, border: "2px solid #27ae60", borderTop: "2px solid transparent", borderRadius: "50%", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#1e8449" }}>Logging you in, please wait...</span>
                </div>
              )}

              <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px 0", background: loading ? "#ffb87a" : "#FF6B00", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span onClick={handleBack} style={{ fontSize: 12, color: "#FF6B00", cursor: "pointer", textDecoration: "underline" }}>← Change company</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;