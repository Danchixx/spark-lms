// src/pages/Auth/SuperAdminLogin.tsx
// Strictly isolated SuperAdmin login portal — accessible at /admin only.
// Uses AuthContext.loginMock for local authentication (Supabase integration pending).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ── Inline SVG icons ──────────────────────────────────────────
const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
      a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4
      c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
      m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Superadmin credentials (replace with Supabase auth when migrating) ─
const SUPERADMIN_CREDENTIALS = {
  username: "admin",
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

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!username || !password) return;

    setLoading(true);
    setError("");

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));

    if (
      username === SUPERADMIN_CREDENTIALS.username &&
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
      {/* ── Header ── */}
      <header style={s.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={s.logoText}>SPARK</span>
            <span style={{ fontSize: 18 }}>🔥</span>
          </div>
          <div style={s.logoSub}>Yes to Learning and Development</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={s.body}>
        {/* Left flame panel */}
        <div style={s.leftPanel}>
          <div style={s.circle1} />
          <div style={s.circle2} />
          <div style={s.circle3} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={s.sparkBig}>SPARK</div>
            <div style={s.tagline}>Yes to Learning and Development</div>
          </div>
        </div>

        {/* Right login form */}
        <div style={s.rightPanel}>
          <div style={s.formBox}>
            {/* Avatar */}
            <div style={s.avatarWrap}>
              <div style={s.avatar}>
                <svg viewBox="0 0 100 100" width="90" height="90"
                  xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
                  <circle cx="50" cy="36" r="18" fill="#b0a090" />
                  <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
                </svg>
              </div>
              <div style={s.adminLabel}>ADMIN</div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: 12 }}>
              {uErr && (
                <div style={s.fieldErr}>
                  <span style={s.errBadge}>!</span>
                  Please fill out this field.
                </div>
              )}
              <div style={{ ...s.inputRow, borderColor: uErr ? "#e74c3c" : "#e0e0e0" }}>
                <span style={s.inputIcon}><IconUser /></span>
                <input
                  type="text"
                  value={username}
                  placeholder="Username"
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  onKeyDown={handleKeyDown}
                  style={s.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              {pErr && (
                <div style={s.fieldErr}>
                  <span style={s.errBadge}>!</span>
                  Please fill out this field.
                </div>
              )}
              <div style={{ ...s.inputRow, borderColor: pErr ? "#e74c3c" : "#e0e0e0" }}>
                <span style={s.inputIcon}><IconLock /></span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  placeholder="Password"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  onKeyDown={handleKeyDown}
                  style={s.input}
                />
                <button
                  onClick={() => setShowPass((v) => !v)}
                  style={s.eyeBtn}
                  tabIndex={-1}
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div style={s.errorBox}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#e74c3c" }}>⚠</span>
                  <span style={{ fontSize: 13, color: "#c0392b" }}>{error}</span>
                </div>
                <button
                  onClick={() => setError("")}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#e74c3c", fontWeight: 700, fontSize: 14 }}
                >×</button>
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
              style={{ ...s.loginBtn, opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", display: "flex", flexDirection: "column",
    background: "#f0f0f0", fontFamily: "'Barlow', sans-serif" },
  header: { height: 52, background: "#fff", borderBottom: "2px solid #FF6B00",
    display: "flex", alignItems: "center", padding: "0 24px", flexShrink: 0 },
  logoText: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 22, color: "#222" },
  logoSub: { fontSize: 9, color: "#aaa", letterSpacing: ".15em",
    textTransform: "uppercase", marginTop: -2 },

  body: { flex: 1, display: "flex", alignItems: "stretch" },

  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #FF8C00 0%, #FF4500 50%, #c0392b 100%)",
    display: "flex", alignItems: "center", padding: "40px 60px",
    position: "relative", overflow: "hidden",
  },
  circle1: { position: "absolute", bottom: -120, left: -80, width: 500,
    height: 500, borderRadius: "50%", background: "rgba(255,200,0,.25)" },
  circle2: { position: "absolute", bottom: -60, left: 60, width: 380,
    height: 380, borderRadius: "50%", background: "rgba(255,100,0,.3)" },
  circle3: { position: "absolute", top: -80, right: -60, width: 300,
    height: 300, borderRadius: "50%", background: "rgba(200,30,0,.25)" },
  sparkBig: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: "clamp(48px, 8vw, 96px)", color: "#fff", lineHeight: 1,
    letterSpacing: 2, textShadow: "0 4px 20px rgba(0,0,0,.2)" },
  tagline: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
    color: "rgba(255,255,255,.8)", letterSpacing: ".3em",
    textTransform: "uppercase", marginTop: 4 },

  rightPanel: { width: 420, flexShrink: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: "40px 32px", background: "#f0f0f0" },
  formBox: { width: "100%" },

  avatarWrap: { display: "flex", flexDirection: "column",
    alignItems: "center", marginBottom: 28 },
  avatar: { width: 90, height: 90, borderRadius: "50%", background: "#e8e0d8",
    border: "3px solid #ddd", overflow: "hidden", marginBottom: 10 },
  adminLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 15, color: "#FF6B00", letterSpacing: 2 },

  fieldErr: { fontSize: 11, color: "#e74c3c", marginBottom: 4,
    display: "flex", alignItems: "center", gap: 4 },
  errBadge: { background: "#e74c3c", color: "#fff", borderRadius: 3,
    padding: "1px 5px", fontSize: 10, fontWeight: 700 },

  inputRow: { display: "flex", alignItems: "center", background: "#fff",
    border: "1.5px solid #e0e0e0", borderRadius: 8, overflow: "hidden" },
  inputIcon: { padding: "0 14px", background: "#fff", alignSelf: "stretch",
    display: "flex", alignItems: "center", flexShrink: 0 },
  input: { flex: 1, padding: "12px 12px 12px 0", border: "none",
    outline: "none", fontSize: 14, fontFamily: "'Barlow', sans-serif",
    background: "#fff", minWidth: 0 },
  eyeBtn: { padding: "0 14px", background: "none", border: "none",
    cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 },

  errorBox: { background: "#fde8e8", border: "1px solid #f5c6c6",
    borderRadius: 7, padding: "9px 12px", marginBottom: 14,
    display: "flex", alignItems: "center", justifyContent: "space-between" },
  loadingBox: { background: "#e8f8f0", border: "1px solid #a8dfc0",
    borderRadius: 7, padding: "9px 12px", marginBottom: 14,
    display: "flex", alignItems: "center", gap: 8 },
  spinner: { width: 14, height: 14, border: "2px solid #27ae60",
    borderTopColor: "transparent", borderRadius: "50%", flexShrink: 0,
    animation: "spin .8s linear infinite" },

  loginBtn: { width: "100%", padding: "13px 0",
    background: "linear-gradient(90deg, #c0392b, #e74c3c)",
    color: "#fff", border: "none", borderRadius: 8,
    fontWeight: 700, fontSize: 15, fontFamily: "'Barlow', sans-serif",
    letterSpacing: ".5px", transition: "opacity .2s" },
};

export default SuperAdminLogin;
