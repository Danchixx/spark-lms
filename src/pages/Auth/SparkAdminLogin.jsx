import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import SparkAdminHeader from "../../components/layout/SparkAdminHeader/SparkAdminHeader";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";

const SparkAdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const handleLogin = async () => {
    setTouched({ username: true, password: true });
    if (!username || !password) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1500));
    // Placeholder admin credential check
    if (username === "admin" && password === "admin123") {
      onLogin && onLogin({ name: "Admin", role: "admin" });
    } else {
      setError("Invalid admin credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f0f0f0" }}>
      <SparkAdminHeader />

      <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>

        {/* Left: Flame background */}
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #FF8C00 0%, #FF4500 50%, #c0392b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "40px 60px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Big decorative flame circles */}
          <div style={{
            position: "absolute", bottom: -120, left: -80,
            width: 500, height: 500, borderRadius: "50%",
            background: "rgba(255,200,0,0.25)",
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: 60,
            width: 380, height: 380, borderRadius: "50%",
            background: "rgba(255,100,0,0.3)",
          }} />
          <div style={{
            position: "absolute", top: -80, right: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "rgba(200,30,0,0.25)",
          }} />

          {/* SPARK text */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(48px, 8vw, 96px)",
              color: "white",
              lineHeight: 1,
              letterSpacing: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}>SPARK</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.8)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginTop: 4,
            }}>YES TO LEARNING AND DEVELOPMENT</div>
          </div>

          {/* Flame logo large watermark */}
          <img
            src={SparkLogo}
            alt="Spark Flame"
            style={{
              position: "absolute",
              bottom: -20,
              right: -20,
              width: "55%",
              opacity: 0.18,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Right: Login Form */}
        <div style={{
          width: 420,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          background: "#f0f0f0",
        }}>
          <div style={{ width: "100%" }}>

            {/* Admin Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "#e8e0d8",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10,
                overflow: "hidden",
                border: "3px solid #ddd",
              }}>
                {/* Generic admin avatar placeholder */}
                <svg viewBox="0 0 100 100" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
                  <circle cx="50" cy="36" r="18" fill="#b0a090" />
                  <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
                </svg>
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 15,
                color: "#FF6B00", letterSpacing: 2,
              }}>ADMIN</div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: 12 }}>
              {touched.username && !username && (
                <div style={{ fontSize: 11, color: "#e74c3c", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ background: "#e74c3c", color: "white", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>!</span>
                  Please fill out this field.
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", background: "white", border: `1.5px solid ${touched.username && !username ? "#e74c3c" : "#e0e0e0"}`, borderRadius: 8, overflow: "hidden" }}>
                <span style={{ padding: "0 14px", background: "white", alignSelf: "stretch", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <User size={17} color="#aaa" />
                </span>
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  placeholder="Username"
                  style={{ flex: 1, padding: "12px 12px 12px 0", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", background: "white", minWidth: 0 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              {touched.password && !password && (
                <div style={{ fontSize: 11, color: "#e74c3c", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ background: "#e74c3c", color: "white", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>!</span>
                  Please fill out this field.
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", background: "white", border: `1.5px solid ${touched.password && !password ? "#e74c3c" : "#e0e0e0"}`, borderRadius: 8, overflow: "hidden" }}>
                <span style={{ padding: "0 14px", background: "white", alignSelf: "stretch", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <Lock size={17} color="#aaa" />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="Password"
                  style={{ flex: 1, padding: "12px 12px 12px 0", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", background: "white", minWidth: 0 }}
                />
                <span onClick={() => setShowPass(!showPass)} style={{ padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {showPass ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#e74c3c" }}>⚠</span>
                  <span style={{ fontSize: 13, color: "#c0392b" }}>{error}</span>
                </div>
                <span onClick={() => setError("")} style={{ cursor: "pointer", color: "#e74c3c", fontWeight: 700, fontSize: 14 }}>×</span>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ background: "#e8f8f0", border: "1px solid #a8dfc0", borderRadius: 7, padding: "9px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 14, height: 14, border: "2px solid #27ae60", borderTop: "2px solid transparent", borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 13, color: "#1e8449" }}>Logging you in, please wait...</span>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", padding: "13px 0",
                background: loading ? "#c0392b99" : "linear-gradient(90deg, #c0392b, #e74c3c)",
                color: "white", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "opacity 0.2s",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparkAdminLogin;