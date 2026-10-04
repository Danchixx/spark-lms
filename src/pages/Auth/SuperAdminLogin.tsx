// src/pages/Auth/SuperAdminLogin.tsx
// Strictly isolated SuperAdmin login portal — accessible at /superadmin.
// Uses AuthContext.loginMock for local authentication (Supabase integration pending).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";

// ── Inline SVG icons ──────────────────────────────────────────
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
      a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
      c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
      m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Superadmin credentials (replace with Supabase auth when migrating) ─
const SUPERADMIN_CREDENTIALS = {
  username: "admin", // Accept anything as username locally, or exactly admin@spark.com
  password: "admin123",
};

// ── Touched state type ────────────────────────────────────────
type TouchedFields = {
  username: boolean;
  password: boolean;
};

// ── Component ─────────────────────────────────────────────────
const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { loginMock } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({ username: false, password: false });

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!username || !password) return;

    setLoading(true);
    setError("");

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));

    // For local mock, accept "admin" or "admin@spark.com"
    if (
      (username === SUPERADMIN_CREDENTIALS.username || username === "admin@spark.com") &&
      password === SUPERADMIN_CREDENTIALS.password
    ) {
      loginMock({ name: "Ian Palabrica", role: "spark_admin" });
      navigate("/superadmin/dashboard");
    } else {
      setError("Invalid admin credentials.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const uErr = touched.username && !username;
  const pErr = touched.password && !password;

  return (
    <div style={s.root}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        {/* Glowing dots background pattern */}
        <div style={s.dotsBg} />
        
        <div style={s.leftContent}>
          <img src={SparkLogo} alt="Flame Logo" style={{ height: 140, marginBottom: 24, filter: "drop-shadow(0 8px 16px rgba(255,107,0,0.5))" }} />
          <h1 style={s.brandTitle}>SPARK</h1>
          <p style={s.brandSub}>Access the Admin Portal to view and manage registrations.</p>
        </div>
        
        <div style={s.tagline}>YES TO LEARNING &amp; DEVELOPMENT</div>
      </div>

      {/* Right Panel */}
      <div style={s.rightPanel}>
        <div style={s.formCard}>
          <h2 style={s.formTitle}>Welcome Back</h2>
          <p style={s.formSub}>Sign in to manage registrations.</p>

          {/* Email Address */}
          <div style={s.inputGroup}>
            <label style={{ ...s.inputLabel, color: emailFocus || username ? "#ff6b00" : "#9ca3af" }}>
              Email Address
            </label>
            <input
              type="text"
              value={username}
              placeholder="admin@spark.com"
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => { setEmailFocus(false); setTouched((t) => ({ ...t, username: true })); }}
              onKeyDown={handleKeyDown}
              style={{ ...s.inputBox, borderColor: emailFocus ? "#ff6b00" : (uErr ? "#ef4444" : "#e5e7eb") }}
            />
            {uErr && <div style={s.fieldErr}>Please enter your email address.</div>}
          </div>

          {/* Password */}
          <div style={s.inputGroup}>
            <div style={s.passwordWrap}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                placeholder="Password"
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setPassFocus(true)}
                onBlur={() => { setPassFocus(false); setTouched((t) => ({ ...t, password: true })); }}
                onKeyDown={handleKeyDown}
                style={{ ...s.inputBox, paddingRight: 40, borderColor: passFocus ? "#ff6b00" : (pErr ? "#ef4444" : "#e5e7eb") }}
              />
              <button
                onClick={() => setShowPass((v) => !v)}
                style={s.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {pErr && <div style={s.fieldErr}>Please enter your password.</div>}
          </div>

          {/* Options Row */}
          <div style={s.optionsRow}>
            <label style={s.rememberLabel}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
                style={s.checkbox} 
              />
              Remember me
            </label>
            <span style={s.forgotLink}>Forgot password?</span>
          </div>

          {/* Error alert */}
          {error && (
            <div style={s.errorBox}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#e74c3c" }}>⚠</span>
                <span style={{ fontSize: 13, color: "#c0392b" }}>{error}</span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={s.loadingBox}>
              <div style={s.spinner} />
              <span style={{ fontSize: 13, color: "#1e8449" }}>
                Logging you in, please wait...
              </span>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              ...s.loginBtn, 
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer" 
            }}
          >
            <IconLock />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatUp { from { background-position: center 40px; } to { background-position: center 0px; } }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { 
    minHeight: "100vh", 
    display: "flex", 
    fontFamily: "'Inter', 'Segoe UI', sans-serif" 
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#161822",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  dotsBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundImage: "radial-gradient(rgba(255,107,0,0.6) 2px, transparent 2px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "center 0px",
    maskImage: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
    WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
    opacity: 0.7,
    animation: "floatUp 3s linear infinite",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 40px",
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: "44px",
    fontWeight: 900,
    margin: "0 0 16px 0",
    letterSpacing: "1px",
    fontFamily: "'Inter', sans-serif",
  },
  brandSub: {
    color: "#d1d5db",
    fontSize: "16px",
    maxWidth: "340px",
    margin: 0,
    lineHeight: 1.5,
  },
  tagline: {
    position: "absolute",
    bottom: "40px",
    color: "#ff6b00",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "3px",
    textTransform: "uppercase",
    zIndex: 2,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    padding: "48px 40px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 8px 0",
  },
  formSub: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 32px 0",
  },
  inputGroup: {
    marginBottom: "24px",
    position: "relative",
  },
  inputLabel: {
    position: "absolute",
    top: "-8px",
    left: "12px",
    backgroundColor: "#ffffff",
    padding: "0 6px",
    fontSize: "12px",
    fontWeight: 600,
    zIndex: 1,
    transition: "color 0.2s",
  },
  inputBox: {
    width: "100%",
    padding: "16px 16px",
    fontSize: "15px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderRadius: "8px",
    outline: "none",
    color: "#111827",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  passwordWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  fieldErr: { 
    fontSize: "12px", 
    color: "#ef4444", 
    marginTop: "6px" 
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#4b5563",
    cursor: "pointer",
  },
  checkbox: {
    accentColor: "#3b82f6",
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  forgotLink: {
    fontSize: "14px",
    color: "#ff6b00",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
  loginBtn: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#ff6b00",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    transition: "background-color 0.2s",
  },
  errorBox: { 
    background: "#fde8e8", 
    border: "1px solid #f5c6c6",
    borderRadius: "8px", 
    padding: "12px 16px", 
    marginBottom: "20px",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between" 
  },
  loadingBox: { 
    background: "#e8f8f0", 
    border: "1px solid #a8dfc0",
    borderRadius: "8px", 
    padding: "12px 16px", 
    marginBottom: "20px",
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  },
  spinner: { 
    width: "16px", 
    height: "16px", 
    border: "2px solid #27ae60",
    borderTopColor: "transparent", 
    borderRadius: "50%", 
    flexShrink: 0,
    animation: "spin .8s linear infinite" 
  },
};

export default SuperAdminLogin;

