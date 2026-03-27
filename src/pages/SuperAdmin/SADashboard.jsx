import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MOCK_TENANTS } from "../../data/mockTenants";
import SASidebar, { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../components/layout/Sidebar/SASidebar";
import SparkTenants from "./Tenants/SparkTenants";

// ... (helpers)
const daysSince = (isoDate) =>
  Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));

const avgProgress = (courseActivity) => {
  if (!courseActivity?.length) return 0;
  return Math.round(courseActivity.reduce((s, c) => s + c.progress, 0) / courseActivity.length);
};

// ... (TopBar component)
const TopBar = ({ onBurger, user }) => (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: TOPBAR_HEIGHT,
    background: "#fff",
    borderBottom: "2px solid #FF6B00",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: 12,
    zIndex: 110,
  }}>
    <button onClick={onBurger} style={t.burgerBtn}>
      <span style={t.burgerLine} />
      <span style={t.burgerLine} />
      <span style={t.burgerLine} />
    </button>

    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={t.logoText}>SPARK</span>
      <span>🔥</span>
    </div>
    <div style={{ fontSize: 9, color: "#aaa", letterSpacing: ".12em",
      textTransform: "uppercase" }}>
      Yes to Learning and Development
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      {/* ... (user info) */}
      <span style={{ fontWeight: 700, fontSize: 15, color: "#FF6B00" }}>
        {user?.name?.split(" ")[0] || "Ian"}
      </span>
      <div style={{ width: 36, height: 36, borderRadius: "50%",
        background: "#e8e0d8", border: "2px solid #ddd", overflow: "hidden" }}>
        <svg viewBox="0 0 100 100" width="36" height="36">
          <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
          <circle cx="50" cy="36" r="18" fill="#b0a090" />
          <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
        </svg>
      </div>
    </div>
  </div>
);

const t = {
  burgerBtn: { background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", flexDirection: "column", gap: 4 },
  burgerLine: { display: "block", width: 20, height: 2,
    background: "#444", borderRadius: 2 },
  logoText: { fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 900, fontSize: 20, color: "#222" },
};

// ... (WelcomeScreen component)
const WelcomeScreen = ({ name, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff",
      zIndex: 300, display: "flex", flexDirection: "column" }}>
      <div style={{ height: TOPBAR_HEIGHT, borderBottom: "2px solid #FF6B00",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 6 }}>
        <span style={t.logoText}>SPARK</span>
        <span>🔥</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 52,
          animation: "slideUp .7s .3s cubic-bezier(.22,1,.36,1) both",
        }}>
          <span style={{ color: "#222" }}>WELCOME </span>
          <span style={{ color: "#FF6B00" }}>
            {(name || "ADMIN").toUpperCase()}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ... (NotifyModal component)
const NotifyModal = ({ tenant, onClose }) => {
  const [msg, setMsg] = useState(
    `Hi ${tenant.name} team,\n\nWe noticed your team hasn't been active on the SPARK LMS platform for over a week. We'd love to check in and see how we can help support your learning journey.\n\nPlease feel free to reach out or log in to continue your courses.\n\nBest regards,\nSPARK Admin Team`
  );
  const [sent, setSent] = useState(false);

  const send = () => { setSent(true); setTimeout(onClose, 1800); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0,
      background: "rgba(0,0,0,.45)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff",
        borderRadius: 14, padding: 28, width: 500, maxWidth: "90vw" }}>
        {sent ? (
          <div style={{ display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, padding: "20px 0" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%",
              background: "#FF6B00", display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>
              Notification sent!
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 20, color: "#222" }}>
                  Notify Tenant Admin
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {tenant.name} — inactive for {daysSince(tenant.lastActive)} days
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none",
                fontSize: 22, cursor: "pointer", color: "#aaa" }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 600 }}>
              To: {tenant.email}
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{ width: "100%", height: 160, padding: "10px 14px",
                border: "1.5px solid #FF6B00", borderRadius: 8,
                fontSize: 13, fontFamily: "'Barlow', sans-serif",
                outline: "none", resize: "vertical",
                boxSizing: "border-box", color: "#333", marginBottom: 16 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{ background: "#f0f0f0", color: "#555",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif" }}>
                Cancel
              </button>
              <button onClick={send} style={{ background: "#FF6B00", color: "#fff",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif" }}>
                Send Notification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ... (TenantActivityCard component)
const TenantActivityCard = ({ tenant, onNotify }) => {
  const days     = daysSince(tenant.lastActive);
  const inactive = days >= 7;
  const avg      = avgProgress(tenant.courseActivity);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "#fff", borderRadius: 10,
      border: `1px solid ${inactive ? "#f5c6c6" : "#eee"}`,
      borderLeft: `4px solid ${inactive ? "#c0392b" : "#27ae60"}`,
      padding: "14px 16px", marginBottom: 10 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 6,
          background: tenant.color + "22", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: tenant.color, flexShrink: 0 }}>
          {tenant.abbr.slice(0, 5)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{tenant.name}</div>
          <div style={{ fontSize: 11, fontWeight: 600,
            color: inactive ? "#c0392b" : "#27ae60" }}>
            {inactive
              ? `Inactive — ${days} days ago`
              : `Active — ${days === 0 ? "today" : `${days}d ago`}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {inactive && (
            <button onClick={() => onNotify(tenant)}
              style={{ background: "#c0392b", color: "#fff", border: "none",
                borderRadius: 6, padding: "5px 10px", fontSize: 11,
                fontWeight: 700, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap" }}>
              🔔 Notify
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: 6,
              padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#888",
              fontFamily: "'Barlow', sans-serif" }}>
            {expanded ? "▲ Less" : "▼ More"}
          </button>
        </div>
      </div>

      {/* Overall bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#aaa", marginBottom: 4 }}>
          <span>Overall Course Activity</span>
          <span style={{ fontWeight: 700,
            color: avg >= 60 ? "#27ae60" : avg >= 30 ? "#FF6B00" : "#c0392b" }}>
            {avg}%
          </span>
        </div>
        <div style={{ height: 8, background: "#f0f0f0",
          borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${avg}%`,
            background: avg >= 60
              ? "linear-gradient(90deg,#27ae60,#2ecc71)"
              : avg >= 30
              ? "linear-gradient(90deg,#FF6B00,#f39c12)"
              : "linear-gradient(90deg,#c0392b,#e74c3c)",
            transition: "width .6s ease" }} />
        </div>
      </div>

      {/* Expanded per-course */}
      {expanded && (
        <div style={{ marginTop: 12, borderTop: "1px solid #f5f5f5", paddingTop: 10 }}>
          {!tenant.courseActivity?.length ? (
            <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "8px 0" }}>
              No course activity yet
            </div>
          ) : (
            tenant.courseActivity.map((c) => (
              <div key={c.name} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: 11, color: "#666", marginBottom: 3 }}>
                  <span>{c.name}</span>
                  <span style={{ color: "#aaa" }}>{c.progress}% · {c.totalUsers} users</span>
                </div>
                <div style={{ height: 6, background: "#f0f0f0",
                  borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3,
                    width: `${c.progress}%`,
                    background: c.progress >= 70 ? "#27ae60"
                      : c.progress >= 40 ? "#FF6B00" : "#c0392b",
                    transition: "width .5s ease" }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const RECENT_SUBS = [
  { name: "Department of Education", since: "Feb. 25 2026", type: "Institute",  bg: "#2980b9", abbr: "DepEd"   },
  { name: "Eleksis Marketing Corp",  since: "Jan. 10 2026", type: "Enterprise", bg: "#c0392b", abbr: "ELEKSIS" },
  { name: "De La Salle University",  since: "Jan. 01 2026", type: "Institute",  bg: "#27ae60", abbr: "DLSU"    },
  { name: "Zoup Sales & Marketing",  since: "Feb. 01 2026", type: "Personal",   bg: "#8e44ad", abbr: "ZOUP"    },
];

// ─────────────────────────────────────────────────────────────
// Dashboard Home
// ─────────────────────────────────────────────────────────────
export const DashboardHome = () => {
  const navigate = useNavigate();
  const [notifyTenant, setNotifyTenant] = useState(null);
  const inactiveCount = MOCK_TENANTS.filter((t) => daysSince(t.lastActive) >= 7).length;

  const STATS = [
    { key: "tenants",   label: "Tenants",       value: "+5 this week",    icon: "🏢" },
    { key: "approvals", label: "Approvals",     value: "+3 this week",    icon: "🕐" },
    { key: "courses",   label: "Courses",       value: "4 new",           icon: "📚" },
    { key: "tenants",   label: "Subscriptions", value: "+3 this quarter", icon: "💳" },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        gap: 14, marginBottom: 24 }}>
        {STATS.map((s, i) => (
          <div key={i} onClick={() => navigate(`/superadmin/${s.key}`)} style={d.statCard}>
            <div>
              <div style={d.statLabel}>{s.label}</div>
              <div style={d.statValue}>{s.value}</div>
            </div>
            <div style={d.statIcon}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Inactive alert */}
      {inactiveCount > 0 && (
        <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6",
          borderRadius: 10, padding: "12px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#c0392b" }}>
              {inactiveCount} tenant{inactiveCount > 1 ? "s" : ""} inactive for 7+ days
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              Scroll down to view and send notifications to inactive tenants.
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* LEFT — Tenant Activeness */}
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 18, color: "#222", marginBottom: 14 }}>
            Tenant Activeness
          </div>
          {MOCK_TENANTS.map((ten) => (
            <TenantActivityCard key={ten.id} tenant={ten} onNotify={setNotifyTenant} />
          ))}
        </div>

        {/* RIGHT — Recent Subs + System Updates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={d.panel}>
            <div style={d.panelTitle}>Recent Subscriptions</div>
            {RECENT_SUBS.map((sub) => (
              <div key={sub.name} style={d.subItem}>
                <div style={{ ...d.subLogo, background: sub.bg }}>
                  <span style={{ color: "#fff", fontSize: 8, fontWeight: 900,
                    textAlign: "center", lineHeight: 1.2 }}>
                    {sub.abbr.slice(0, 6)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#222",
                    marginBottom: 3, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis" }}>
                    {sub.name}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr",
                    gap: "1px 6px", fontSize: 10, color: "#888" }}>
                    <span style={{ color: "#aaa" }}>Subscribed Since</span>
                    <span>{sub.since}</span>
                    <span style={{ color: "#aaa" }}>Type</span>
                    <span style={{ color: "#FF6B00", fontWeight: 700 }}>{sub.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={d.panel}>
            <div style={d.panelTitle}>System Updates</div>
            {[
              { icon: "🆕", text: "New tenant registered: Build Hub PH",   time: "2h ago", color: "#2980b9" },
              { icon: "✅", text: "Course approved: Sales Fundamentals",     time: "5h ago", color: "#27ae60" },
              { icon: "⚠️", text: "Eleksis inactive for 10 days",            time: "1d ago", color: "#c0392b" },
              { icon: "💳", text: "DLSU renewed Institute subscription",      time: "2d ago", color: "#FF6B00" },
              { icon: "👤", text: "New admin role assigned at DepEd",         time: "3d ago", color: "#8e44ad" },
            ].map((u, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start",
                gap: 10, padding: "9px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8,
                  background: u.color + "18",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {u.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }}>{u.text}</div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{u.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {notifyTenant && (
        <NotifyModal tenant={notifyTenant} onClose={() => setNotifyTenant(null)} />
      )}
    </div>
  );
};

const d = {
  statCard: { background: "#fff", borderRadius: 10, border: "1px solid #ece8e8",
    borderTop: "3px solid #FF6B00", padding: "18px 20px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    transition: "transform .15s, box-shadow .15s" },
  statLabel: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase",
    color: "#888", marginBottom: 6 },
  statValue: { fontSize: 13, color: "#FF6B00", fontWeight: 700 },
  statIcon: { width: 48, height: 48, background: "#FFF0E6", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  panel: { background: "#fff", borderRadius: 10, border: "1px solid #eee", padding: 16 },
  panelTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 16, color: "#222", marginBottom: 12 },
  subItem: { display: "flex", alignItems: "flex-start", gap: 10,
    padding: "9px 0", borderBottom: "1px solid #f2f2f2" },
  subLogo: { width: 36, height: 36, borderRadius: 6, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center" },
};

// ... (ComingSoon component)
const ComingSoon = ({ label }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#aaa", gap: 12,
    minHeight: 400 }}>
    <div style={{ fontSize: 48, opacity: .4 }}>
      {{ approvals:"🕐", users:"👥", courses:"📚", settings:"⚙️" }[label] || "📄"}
    </div>
    <div style={{ fontSize: 16, fontWeight: 600 }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </div>
    <div style={{ fontSize: 13 }}>Design coming soon — frontend in progress</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main SADashboard
// ─────────────────────────────────────────────────────────────
const SADashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Extract active page from URL (e.g., /superadmin/tenants -> tenants)
  const activePage = location.pathname.split("/").pop() || "dashboard";

  if (showWelcome) {
    return (
      <WelcomeScreen
        name={user?.name?.split(" ")[0] || "Admin"}
        onDone={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif",
      background: "#f0f0f0",
      minHeight: "100vh",
    }}>
      {/* Fixed top bar */}
      <TopBar onBurger={() => setSidebarOpen((v) => !v)} user={user} />

      {/* Fixed sidebar */}
      <SASidebar
        open={sidebarOpen}
        activePage={activePage}
        user={user}
      />

      {/* Page content area */}
      <div style={{
        marginTop: TOPBAR_HEIGHT,
        marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        transition: "margin-left .25s ease",
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
        <Outlet />
      </div>
    </div>
  );
};

// Attach sub-components to SADashboard for easier access in router
SADashboard.DashboardHome = DashboardHome;
SADashboard.SparkTenants = SparkTenants;
SADashboard.Approvals = () => <ComingSoon label="approvals" />;
SADashboard.Users = () => <ComingSoon label="users" />;
SADashboard.Courses = () => <ComingSoon label="courses" />;
SADashboard.Settings = () => <ComingSoon label="settings" />;

export default SADashboard;
