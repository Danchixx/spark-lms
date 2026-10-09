import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./superadmin-theme.css";
import { SAThemeProvider, useSATheme } from "./SAThemeContext";

import { useAuth } from "../../context/AuthContext";
import { MOCK_TENANTS } from "../../data/mockTenants";
import SASidebar, { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../components/layout/Sidebar/SASidebar";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";
import PageTransition from "../../components/common/PageTransition";

import {
  PageContainer,
  PageHeading,
  StatGrid,
  StatCard,
  MainGrid,
  Card,
  CardHeader,
  TableHeader,
  TableRow,
  Pill,
  TenantLogo,
  StatusAndDateCell,
  GhostButton,
  PrimaryButton,
  SideListRow,
  ProgressBar,
} from "./components/SALayout";

// ... (helpers)
const daysSince = (isoDate) => {
  if (!isoDate) return NaN;
  const d = new Date(isoDate).getTime();
  if (isNaN(d)) return NaN;
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
};

const avgProgress = (courseActivity) => {
  if (!courseActivity?.length) return 0;
  return Math.round(courseActivity.reduce((s, c) => s + c.progress, 0) / courseActivity.length);
};

// ─────────────────────────────────────────────────────────────
// Top Bar  (fixed, full width)
// ─────────────────────────────────────────────────────────────
const TopBar = ({ onBurger, sidebarOpen, user }) => {
  const { theme, toggleTheme } = useSATheme();

  return (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: TOPBAR_HEIGHT,
    background: "var(--bg-side, #ffffff)",
    borderBottom: "1px solid var(--accent, #f05a0a)",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 12,
    zIndex: 110,
    boxSizing: "border-box",
  }}>
    <button className="sa-burger-btn" onClick={onBurger} style={t.burgerBtn} aria-label="Toggle sidebar">
      <span style={{
        ...t.burgerLine,
        transform: sidebarOpen ? "translateY(6px) rotate(45deg)" : "none",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
      }} />
      <span style={{
        ...t.burgerLine,
        opacity: sidebarOpen ? 0 : 1,
        transform: sidebarOpen ? "scaleX(0)" : "scaleX(1)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }} />
      <span style={{
        ...t.burgerLine,
        transform: sidebarOpen ? "translateY(-6px) rotate(-45deg)" : "none",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
      }} />
    </button>

    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
        <span style={t.logoText}>SPARK</span>
        <span style={{
          color: "var(--muted, #64748b)",
          fontFamily: "'Open Sans', sans-serif",
          fontSize: 6.4,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          marginTop: 2,
          letterSpacing: ".12em",
        }}>
          Yes to Learning and Development
        </span>
      </div>
      <img src={SparkLogo} alt="Spark Logo" style={{ height: 44, width: "auto" }} />
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      {/* Theme toggle */}
      <button 
        onClick={toggleTheme} 
        aria-label={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        style={{
          background: "none", border: "none", cursor: "pointer",
          width: 38, height: 38, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--muted, #475569)", transition: "background 0.2s, color 0.2s"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--card-2, #f6f8fc)";
          e.currentTarget.style.color = "var(--text, #0f172a)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.color = "var(--muted, #475569)";
        }}
        onFocus={e => {
          e.currentTarget.style.outline = "2px solid var(--accent, #f05a0a)";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={e => {
          e.currentTarget.style.outline = "none";
        }}
      >
        {theme === 'dark' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      {/* User name & avatar */}
      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--accent-text, #d84e04)" }}>
        {user?.name?.split(" ")[0] || "Ian"}
      </span>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "var(--card-2, #e8e0d8)", border: "2px solid var(--line, #ddd)", overflow: "hidden"
      }}>
        <svg viewBox="0 0 100 100" width="36" height="36">
          <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
          <circle cx="50" cy="36" r="18" fill="#b0a090" />
          <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
        </svg>
      </div>
    </div>
  </div>
  );
};

const t = {
  burgerBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", flexDirection: "column", gap: 4
  },
  burgerLine: {
    display: "block", width: 20, height: 2,
    background: "var(--text, #0f172a)", borderRadius: 2
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 600, fontSize: 26, color: "var(--text, #0f172a)", letterSpacing: 3
  },
};

// ... (WelcomeScreen component)
const WelcomeScreen = ({ name, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg, #fff)",
      zIndex: 300, display: "flex", flexDirection: "column"
    }}>
      <div style={{
        height: TOPBAR_HEIGHT, borderBottom: "2px solid var(--accent, #FF6B00)",
        background: "var(--bg-side, #ffffff)",
        display: "flex", alignItems: "center", padding: "0 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
            <span style={t.logoText}>SPARK</span>
            <span style={{
              color: "var(--muted, #9e9e9e)",
              fontFamily: "'Open Sans', sans-serif",
              fontSize: 6.4,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              marginTop: 2,
              letterSpacing: ".12em",
            }}>
              Yes to Learning and Development
            </span>
          </div>
          <img src={SparkLogo} alt="Spark Logo" style={{ height: 44, width: "auto" }} />
        </div>
      </div>
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 52,
          animation: "slideUp .7s .3s cubic-bezier(.22,1,.36,1) both",
        }}>
          <span style={{ color: "var(--text, #222)" }}>WELCOME </span>
          <span style={{ color: "var(--accent, #FF6B00)" }}>
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
  const days = daysSince(tenant.lastActive);
  const daysText = !isNaN(days) ? `${days} days` : "an extended period";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.6)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--card, #fff)",
        border: "1px solid var(--line, #e2e8f0)",
        boxShadow: "var(--shadow, 0 10px 30px rgba(0,0,0,0.3))",
        borderRadius: 14, padding: 28, width: 500, maxWidth: "90vw"
      }}>
        {sent ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, padding: "20px 0"
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "var(--accent, #FF6B00)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #333)" }}>
              Notification sent!
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16
            }}>
              <div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 20, color: "var(--text, #222)"
                }}>
                  Notify Tenant Admin
                </div>
                <div style={{ fontSize: 12, color: "var(--muted, #aaa)", marginTop: 2 }}>
                  {tenant.name} — inactive for {daysText}
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "none", border: "none",
                fontSize: 22, cursor: "pointer", color: "var(--muted, #aaa)"
              }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted, #888)", marginBottom: 6, fontWeight: 600 }}>
              To: {tenant.email}
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{
                width: "100%", height: 160, padding: "10px 14px",
                border: "1.5px solid var(--accent, #FF6B00)", borderRadius: 8,
                background: "var(--bg, #f8fafc)",
                fontSize: 13, fontFamily: "'Barlow', sans-serif",
                outline: "none", resize: "vertical",
                boxSizing: "border-box", color: "var(--text, #333)", marginBottom: 16
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{
                background: "var(--card-2, #f0f0f0)", color: "var(--text, #555)",
                border: "1px solid var(--line, transparent)", borderRadius: 8, padding: "9px 18px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif"
              }}>
                Cancel
              </button>
              <button onClick={send} style={{
                background: "var(--accent, #FF6B00)", color: "#fff",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif"
              }}>
                Send Notification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RECENT_SUBS = [
  { id: 1, name: "Department of Education", since: "Feb. 25 2026", renewal: "Feb. 25 2027", type: "Institute", bg: "#2980b9", abbr: "DepEd", learners: 200, courses: 13, status: "Active" },
  { id: 2, name: "Eleksis Marketing Corp", since: "Jan. 10 2026", renewal: "Jan. 10 2027", type: "Enterprise", bg: "#c0392b", abbr: "ELEKSIS", learners: 320, courses: 20, status: "Active" },
  { id: 3, name: "De La Salle University", since: "Jan. 01 2026", renewal: "Jan. 01 2027", type: "Institute", bg: "#27ae60", abbr: "DLSU", learners: 500, courses: 35, status: "Active" },
  { id: 4, name: "Zoup Sales & Marketing", since: "Feb. 01 2026", renewal: "Feb. 01 2027", type: "Personal", bg: "#8e44ad", abbr: "ZOUP", learners: 32, courses: 8, status: "Active" },
  { id: 5, name: "Build Hub PH", since: "Mar. 01 2026", renewal: "Mar. 01 2027", type: "Enterprise", bg: "#e67e22", abbr: "BHUB", learners: 0, courses: 0, status: "Inactive" },
];

const SYSTEM_UPDATES = [
  { icon: "🆕", text: "New tenant registered: Build Hub PH", time: "2h ago", color: "#2980b9" },
  { icon: "✅", text: "Course approved: Sales Fundamentals", time: "5h ago", color: "#27ae60" },
  { icon: "⚠️", text: "Eleksis inactive for 10 days", time: "1d ago", color: "#c0392b" },
  { icon: "💳", text: "DLSU renewed Institute subscription", time: "2d ago", color: "#FF6B00" },
  { icon: "👤", text: "New admin role assigned at DepEd", time: "3d ago", color: "#8e44ad" },
];

// ── Subscription Detail Modal ──────────────────────────────
const SubscriptionDetailModal = ({ sub, onClose, onManage }) => {
  if (!sub) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow, 0 10px 30px rgba(0,0,0,0.3))",
          borderRadius: 14,
          padding: 24,
          width: 440,
          maxWidth: "92vw",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TenantLogo name={sub.name} abbr={sub.abbr} color={sub.bg} size={42} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                {sub.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Subscription Overview
              </div>
            </div>
          </div>
          <Pill variant={sub.type}>{sub.type}</Pill>
        </div>

        {/* Details Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          padding: "16px 14px",
          background: "var(--bg)",
          borderRadius: 10,
          border: "1px solid var(--line)",
          marginBottom: 20,
        }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".04em" }}>
              Status
            </span>
            <div style={{ marginTop: 4 }}>
              <Pill variant={sub.status || "Active"}>{sub.status || "Active"}</Pill>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".04em" }}>
              Subscribed On
            </span>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {sub.since}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".04em" }}>
              Renewal Date
            </span>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {sub.renewal || "Jan 10 2027"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".04em" }}>
              Learners
            </span>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {sub.learners !== undefined ? `${sub.learners} users` : "320 users"}
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <GhostButton onClick={onClose}>
            Close
          </GhostButton>
          <PrimaryButton onClick={() => { onClose(); onManage(); }}>
            Manage in Tenants →
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Dashboard Home
// ─────────────────────────────────────────────────────────────
const StatIcons = {
  tenants: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  approvals: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  courses: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  subscriptions: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
};

export const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifyTenant, setNotifyTenant] = useState(null);
  const [expandedTenants, setExpandedTenants] = useState({});
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const toggleExpand = (id) => {
    setExpandedTenants((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const inactiveCount = MOCK_TENANTS.filter((t) => {
    const d = daysSince(t.lastActive);
    return !isNaN(d) && d >= 7;
  }).length;

  const STATS = [
    { key: "tenants", label: "Tenants", count: 24, sub: "↑ +5 this week", iconKey: "tenants", path: "/superadmin/tenants" },
    { key: "approvals", label: "Approvals", count: 8, sub: "↑ +3 this week", iconKey: "approvals", path: "/superadmin/approvals" },
    { key: "courses", label: "Courses", count: 61, sub: "↑ 4 new", iconKey: "courses", path: "/superadmin/courses" },
    { key: "subscriptions", label: "Subscriptions", count: 18, sub: "↑ +3 this quarter", iconKey: "subscriptions", path: "/superadmin/tenants" },
  ];

  return (
    <PageTransition>
      <PageContainer>
      {/* ── Page Heading ── */}
      <PageHeading
        greeting={firstName ? `Hello ${firstName}, welcome back!` : undefined}
        title="Dashboard"
        subtitle="Overview of tenants, approvals, courses and subscriptions."
        actions={
          <PrimaryButton
            onClick={() => navigate("/superadmin/approvals")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          >
            Review Approvals
          </PrimaryButton>
        }
      />

      {/* ── Stat cards ── */}
      <StatGrid columns={4}>
        {STATS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.count}
            sub={s.sub}
            subColor="var(--accent-text)"
            icon={StatIcons[s.iconKey]}
            onClick={() => navigate(s.path)}
          />
        ))}
      </StatGrid>

      {/* ── Inactive alert (if any) ── */}
      {inactiveCount > 0 && (
        <div style={{
          background: "var(--red-soft)",
          border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)",
          borderRadius: 10,
          padding: "12px 18px",
          marginBottom: "var(--space-5, 20px)",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--red)" }}>
              {inactiveCount} tenant{inactiveCount > 1 ? "s" : ""} inactive for 7+ days
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Check the Tenant Activeness panel below and send notifications.
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <MainGrid style={{ gridTemplateColumns: "minmax(0, 1fr) 370px" }}>
        {/* LEFT COLUMN: Tenant Activeness */}
        <Card>
          <CardHeader
            title="Tenant Activeness"
            count={`${MOCK_TENANTS.length} tenants`}
          />

          {/* Table Header */}
          <TableHeader
            columns={[
              { label: "Tenant" },
              { label: "Status & Activity" },
              { label: "Course Activity" },
              { label: "Action", style: { textAlign: "left" } },
            ]}
            style={{
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr) minmax(0, 1.4fr) 115px",
            }}
          />

          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 620 }}>
              {MOCK_TENANTS.map((tenant, idx) => {
                const days = daysSince(tenant.lastActive);
                const hasValidDays = tenant.lastActive && !isNaN(days);
                const isInactive = hasValidDays && days >= 7;
                const avg = avgProgress(tenant.courseActivity);
                const isExpanded = !!expandedTenants[tenant.id];

                // Presentational guard for NaNd ago
                const activityText = hasValidDays
                  ? (days === 0 ? "Active today" : `${days}d ago`)
                  : "No activity recorded";

                return (
                  <div key={tenant.id}>
                    <TableRow
                      isLast={idx === MOCK_TENANTS.length - 1 && !isExpanded}
                      style={{
                        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr) minmax(0, 1.4fr) 115px",
                      }}
                    >
                      {/* Column 1: TENANT */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <TenantLogo
                          id={tenant.id}
                          name={tenant.name}
                          abbr={tenant.abbr}
                          color={tenant.color}
                          size={36}
                        />
                        <div style={{ minWidth: 0 }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13.5,
                              color: "var(--text)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                            }}
                          >
                            {tenant.name}
                          </span>
                          <span style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginTop: 2 }}>
                            {tenant.plan || "Institute"} Plan
                          </span>
                        </div>
                      </div>

                      {/* Column 2: STATUS & ACTIVITY */}
                      <div>
                        <StatusAndDateCell
                          status={isInactive ? "Inactive" : "Active"}
                          date={
                            <span style={hasValidDays ? {} : { color: "var(--faint)" }}>
                              {activityText}
                            </span>
                          }
                        />
                      </div>

                      {/* Column 3: COURSE ACTIVITY */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 280 }}>
                          <div style={{ flex: 1 }}>
                            <ProgressBar
                              progress={avg}
                              color={avg >= 60 ? "var(--green)" : avg >= 30 ? "var(--accent)" : "var(--red)"}
                              height={7}
                            />
                          </div>
                          <span style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            color: avg >= 60 ? "var(--green)" : avg >= 30 ? "var(--accent-text)" : "var(--red)",
                            width: 36,
                            textAlign: "right",
                            flexShrink: 0,
                          }}>
                            {avg}%
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                          Overall Course Activity
                        </div>
                      </div>

                      {/* Column 4: ACTION */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-start" }}>
                        {isInactive && (
                          <GhostButton
                            onClick={() => setNotifyTenant(tenant)}
                            style={{ height: 30, padding: "0 8px", fontSize: 11.5, color: "var(--red)" }}
                          >
                            🔔 Notify
                          </GhostButton>
                        )}
                        <GhostButton
                          onClick={() => toggleExpand(tenant.id)}
                          style={{ height: 30, padding: "0 10px", fontSize: 11.5 }}
                        >
                          {isExpanded ? "▲ Less" : "▼ More"}
                        </GhostButton>
                      </div>
                    </TableRow>

                    {/* Expanded course drawer */}
                    {isExpanded && (
                      <div style={{
                        background: "var(--card-2)",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--line)"
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>
                          Course Breakdown
                        </div>
                        {!tenant.courseActivity?.length ? (
                          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "8px 0" }}>
                            No course activity yet
                          </div>
                        ) : (
                          tenant.courseActivity.map((c) => (
                            <div key={c.name} style={{ marginBottom: 10 }}>
                              <div style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: 12, color: "var(--text)", marginBottom: 4
                              }}>
                                <span style={{ fontWeight: 500 }}>{c.name}</span>
                                <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                                  {c.progress}% · {c.totalUsers} users
                                </span>
                              </div>
                              <ProgressBar
                                progress={c.progress}
                                color={c.progress >= 70 ? "var(--green)" : c.progress >= 40 ? "var(--accent)" : "var(--red)"}
                                height={6}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* RIGHT COLUMN: Recent Subscriptions + System Updates */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4, 16px)" }}>
          {/* Recent Subscriptions */}
          <Card>
            <CardHeader
              title="Recent Subscriptions"
              count={showAllSubs ? `${RECENT_SUBS.length} total` : "3 of 5"}
              action={
                <GhostButton
                  onClick={() => setShowAllSubs((prev) => !prev)}
                  style={{ height: 28, padding: "0 10px", fontSize: 11.5 }}
                >
                  {showAllSubs ? "Show Top 3 ▴" : `View All (${RECENT_SUBS.length}) ▾`}
                </GhostButton>
              }
            />
            <div
              style={{
                padding: "0 16px 8px",
                maxHeight: showAllSubs ? 280 : "none",
                overflowY: showAllSubs ? "auto" : "visible",
                transition: "max-height 0.2s ease",
              }}
            >
              {(showAllSubs ? RECENT_SUBS : RECENT_SUBS.slice(0, 3)).map((sub, i, arr) => (
                <div
                  key={sub.id || sub.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSub(sub)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedSub(sub); }}
                  title="Click to view subscription details"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 8px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "background 0.15s ease, transform 0.15s ease",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--line)";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1, paddingRight: 8 }}>
                    <TenantLogo
                      name={sub.name}
                      abbr={sub.abbr}
                      color={sub.bg}
                      size={36}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "var(--text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                        Subscribed since {sub.since}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Pill variant={sub.type}>{sub.type}</Pill>
                    <span style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1 }}>›</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: "10px 16px 12px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
            }}>
              <span style={{ color: "var(--muted)" }}>
                Click any row for details
              </span>
              <button
                onClick={() => navigate("/superadmin/tenants")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--accent-text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Manage in Tenants →
              </button>
            </div>
          </Card>

          {/* System Updates */}
          <Card>
            <CardHeader
              title="System Updates"
              count={`${SYSTEM_UPDATES.length} updates`}
            />
            <div style={{ padding: "0 16px 12px" }}>
              {SYSTEM_UPDATES.map((u, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 8px",
                    borderRadius: 8,
                    borderBottom: i < SYSTEM_UPDATES.length - 1 ? "1px solid var(--line)" : "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--line)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `color-mix(in srgb, ${u.color} 15%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0
                  }}>
                    {u.icon}
                  </div>
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                    lineHeight: 1.4,
                  }}>
                    {u.text}
                  </div>
                  <div style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}>
                    {u.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </MainGrid>

      {notifyTenant && (
        <NotifyModal tenant={notifyTenant} onClose={() => setNotifyTenant(null)} />
      )}
      {selectedSub && (
        <SubscriptionDetailModal
          sub={selectedSub}
          onClose={() => setSelectedSub(null)}
          onManage={() => navigate("/superadmin/tenants")}
        />
      )}
    </PageContainer>
    </PageTransition>
  );
};

export const ComingSoon = ({ label }) => (
  <PageTransition style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: "var(--muted)", gap: 12,
      minHeight: 400
    }}>
      <div style={{ fontSize: 48, opacity: .6 }}>
        {{ approvals: "🕐", users: "👥", courses: "📚", settings: "⚙️" }[label] || "📄"}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Design coming soon — frontend in progress</div>
    </div>
  </PageTransition>
);

// ─────────────────────────────────────────────────────────────
// Main SADashboard
// ─────────────────────────────────────────────────────────────
const SADashboardInner = () => {
  const { theme } = useSATheme();
  const { user } = useAuth();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Derive activePage from path (e.g., /superadmin/tenants -> tenants)
  const pathParts = location.pathname.split("/");
  const activePage = pathParts[pathParts.length - 1] || "dashboard";

  const handleWelcomeDone = useCallback(() => {
    setShowWelcome(false);
  }, []);
  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener("sa-mobile-nav-close", handler);
    return () => window.removeEventListener("sa-mobile-nav-close", handler);
  }, []);

  if (showWelcome) {
    return (
      <WelcomeScreen
        name={user?.name?.split(" ")[0] || "Admin"}
        onDone={handleWelcomeDone}
      />
    );
  }

  return (
    <div
      data-sa-theme={theme}
      className="sa-root"
      style={{
        fontFamily: "'Barlow', sans-serif",
        background: "var(--bg, #f3f5f9)",
        color: "var(--text, #0f172a)",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .sa-content-area {
            margin-left: 0 !important;
          }
        }
      `}</style>
      {/* Fixed top bar */}
      <TopBar onBurger={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} user={user} />

      {/* Fixed sidebar */}
      <SASidebar
        open={sidebarOpen}
        activePage={activePage}
        user={user}
      />

      {/* Page content area */}
      <div className="sa-content-area" style={{
        marginTop: TOPBAR_HEIGHT,
        marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
        transition: "margin-left .25s ease",
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg, #f3f5f9)",
      }}>
        <Outlet />
      </div>
    </div>
  );
};

const SADashboard = () => (
  <SAThemeProvider>
    <SADashboardInner />
  </SAThemeProvider>
);

export default SADashboard;
