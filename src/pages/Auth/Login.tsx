import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import SparkHeader from "../../components/layout/SparkHeader/SparkHeader";
import LeftPanel from "../../components/layout/LeftPanel/LeftPanel";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const { company: authCompany, login, selectCompany } = useAuth();
  const { company: companySlug } = useParams<{ company: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [company, setCompany] = useState(location.state?.company || authCompany);
  const [isFetchingCompany, setIsFetchingCompany] = useState(!company);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  // Sync company if accessed via URL directly
  useEffect(() => {
    const fetchCompany = async () => {
      if (!companySlug) return;
      
      // If we already have the right company, don't fetch
      if (company && company.slug === companySlug) {
        setIsFetchingCompany(false);
        return;
      }

      setIsFetchingCompany(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('slug', companySlug)
          .eq('is_archived', false)
          .single();

        if (data) {
          setCompany(data);
          selectCompany(data);
        } else {
          // Company not found
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching company by slug:", err);
        navigate("/", { replace: true });
      } finally {
        setIsFetchingCompany(false);
      }
    };

    fetchCompany();
  }, [companySlug, company, selectCompany, navigate]);

  // Auto-redirect if already logged in to THIS company
  const { user } = useAuth();
  useEffect(() => {
    if (user && company && company.slug === companySlug) {
      navigate(`/${company.slug}/dashboard`, { replace: true });
    }
  }, [user, company, companySlug, navigate]);

  if (isFetchingCompany) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#e8e8e8" }}>
        <Loader2 className="spin" size={48} color="#FF6B00" />
      </div>
    );
  }

  if (!company) return <Navigate to="/" replace />;

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!username || !password) return;
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      navigate(`/${company.slug}/dashboard`);
    } catch (err) {
      setError("wrong_credentials");
    } finally {
      setLoading(false);
    }
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
            <PageTransition style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div style={{ background: "white", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 340, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
                <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: 26, letterSpacing: 2, margin: "0 0 20px", fontFamily: "'Barlow Condensed', sans-serif" }}>LOGIN</h2>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", border: "1.5px solid #e0e0e0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {typeof company.logo_url === "string" && company.logo_url.startsWith("http")
                      ? <img src={company.logo_url} alt={company.name} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                      : <span style={{ fontWeight: 900, fontSize: 22, color: (company.color || "#FF6B00"), fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>{company.logo_url || company.name?.substring(0, 2).toUpperCase()}</span>
                    }
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  {/* Username */}
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

                  {/* Password */}
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

                  {/* Errors */}
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

                  <Button type="submit" loading={loading} fullWidth size="lg" style={{ justifyContent: "center", marginBottom: 16 }}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>

                <div style={{ textAlign: "center" }}>
                  <span onClick={handleBack} style={{ fontSize: 12, color: "#FF6B00", cursor: "pointer", textDecoration: "underline" }}>← Change company</span>
                </div>
              </div>
            </PageTransition>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;