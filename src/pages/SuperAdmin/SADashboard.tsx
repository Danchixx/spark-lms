// src/pages/SuperAdmin/SADashboard.tsx
// Layout wrapper and entry point for the global SuperAdmin dashboard.
// Manages sidebar state, WelcomeScreen splash, and provides Outlet for nested routes.

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MOCK_TENANTS } from "../../data/mockTenants";
import PageTransition from "../../components/common/PageTransition/PageTransition";
import SASidebar, { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../components/layout/Sidebar/SASidebar";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";
import SAStatCard from "../../components/common/SAStatCard/SAStatCard";
import type { AppUser } from "../../types";

// ── Types ─────────────────────────────────────────────────────
interface CourseActivity {
  name: string;
  progress: number;
  totalUsers: number;
}

interface MockTenant {
  id: number;
  name: string;
  abbr: string;
  color: string;
  email: string;
  lastActive?: string;
  courseActivity?: CourseActivity[];
}

interface StatItem {
  key: string;
  label: string;
  count: number;
  sub: string;
  iconKey: keyof typeof StatIcons;
}

interface RecentSub {
  name: string;
  since: string;
  type: string;
  bg: string;
  abbr: string;
}

interface SystemUpdate {
  icon: string;
  text: string;
  time: string;
  color: string;
}

interface TopBarProps {
  onBurger: () => void;
  sidebarOpen: boolean;
  user: AppUser | null;
}

interface WelcomeScreenProps {
  name: string;
  onDone: () => void;
}

interface NotifyModalProps {
  tenant: MockTenant;
  onClose: () => void;
}

interface TenantActivityCardProps {
  tenant: MockTenant;
  onNotify: (tenant: MockTenant) => void;
}

// ── Helpers ───────────────────────────────────────────────────
const daysSince = (isoDate: string): number =>
  Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));

const avgProgress = (courseActivity?: CourseActivity[]): number => {
  if (!courseActivity?.length) return 0;
  return Math.round(courseActivity.reduce((s, c) => s + c.progress, 0) / courseActivity.length);
};

// ── Style tokens (object — not inline each time) ──────────────
const t = {
  burgerBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", flexDirection: "column" as const, gap: 4
  },
  burgerLine: {
    display: "block", width: 20, height: 2,
    background: "#444", borderRadius: 2
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 600, fontSize: 26, color: "#222", letterSpacing: 3
  },
};

// ── Top Bar ───────────────────────────────────────────────────
const TopBar = ({ onBurger, sidebarOpen, user }: TopBarProps) => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;
  return (
  <div style={{
    position: "fixed",
    top: 0, left: isDesktop && sidebarOpen ? SIDEBAR_WIDTH : 0, right: 0,
    height: TOPBAR_HEIGHT,
    background: "#fff",
    borderBottom: "2px solid #FF6B00",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 12,
    zIndex: 110,
    transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
  }}>
    <button className="sa-burger-btn" onClick={onBurger} style={t.burgerBtn}>
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

    {/* Logo removed and being pushed to SASidebar instead */}
    <div style={{ display: "flex", alignItems: "center" }}></div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>

      {/* Notification Bell */}
      <button style={{
        background: "none", border: "none", cursor: "pointer",
        position: "relative", width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <div style={{
          position: "absolute", top: 2, right: 4,
          width: 8, height: 8, background: "#c0392b",
          borderRadius: "50%", border: "2px solid #fff"
        }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#FF6B00" }}>
          {user?.name?.split(" ")[0] || "Admin"}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#e8e0d8", border: "2px solid #ddd", overflow: "hidden"
        }}>
          <svg viewBox="0 0 100 100" width="36" height="36">
            <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
            <circle cx="50" cy="36" r="18" fill="#b0a090" />
            <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
          </svg>
        </div>
      </div>
    </div>
  </div>
  );
};

// ── Welcome Screen ────────────────────────────────────────────
const WelcomeScreen = ({ name, onDone }: WelcomeScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#fff",
      zIndex: 300, display: "flex", flexDirection: "column"
    }}>
      <div style={{
        height: TOPBAR_HEIGHT, borderBottom: "2px solid #FF6B00",
        display: "flex", alignItems: "center", padding: "0 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
            <span style={t.logoText}>SPARK</span>
            <span style={{
              color: "#9e9e9e",
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
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800, fontSize: 52,
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

// ── Notify Modal ──────────────────────────────────────────────
const NotifyModal = ({ tenant, onClose }: NotifyModalProps) => {
  const [msg, setMsg] = useState(
    `Hi ${tenant.name} team,\n\nWe noticed your team hasn't been active on the SPARK LMS platform for over a week. We'd love to check in and see how we can help support your learning journey.\n\nPlease feel free to reach out or log in to continue your courses.\n\nBest regards,\nSPARK Admin Team`
  );
  const [sent, setSent] = useState(false);

  const send = () => { setSent(true); setTimeout(onClose, 1800); };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.45)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff",
        borderRadius: 14, padding: 28, width: 500, maxWidth: "90vw"
      }}>
        {sent ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, padding: "20px 0"
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "#FF6B00", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
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
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16
            }}>
              <div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800, fontSize: 20, color: "#222"
                }}>
                  Notify Tenant Admin
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {tenant.name} — inactive for {daysSince(tenant.lastActive ?? new Date().toISOString())} days
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "none", border: "none",
                fontSize: 22, cursor: "pointer", color: "#aaa"
              }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 600 }}>
              To: {tenant.email}
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{
                width: "100%", height: 160, padding: "10px 14px",
                border: "1.5px solid #FF6B00", borderRadius: 8,
                fontSize: 13, fontFamily: "'Inter', sans-serif",
                outline: "none", resize: "vertical",
                boxSizing: "border-box", color: "#333", marginBottom: 16
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{
                background: "#f0f0f0", color: "#555",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'Inter', sans-serif"
              }}>
                Cancel
              </button>
              <button onClick={send} style={{
                background: "#FF6B00", color: "#fff",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Inter', sans-serif"
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

// ── Tenant Activity Card ──────────────────────────────────────
const TenantActivityCard = ({ tenant, onNotify }: TenantActivityCardProps) => {
  const days = daysSince(tenant.lastActive ?? new Date().toISOString());
  const inactive = days >= 7;
  const avg = avgProgress(tenant.courseActivity);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "none",
      borderLeft: `4px solid ${inactive ? "#c0392b" : "#27ae60"}`,
      boxShadow: inactive
        ? "0 2px 12px rgba(192,57,43,.08), 0 1px 3px rgba(0,0,0,.04)"
        : "0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.03)",
      padding: "14px 16px", marginBottom: 10,
    }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6,
          background: tenant.color + "22", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: tenant.color, flexShrink: 0
        }}>
          {tenant.abbr.slice(0, 5)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{tenant.name}</div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: inactive ? "#c0392b" : "#27ae60"
          }}>
            {inactive
              ? `Inactive — ${days} days ago`
              : `Active — ${days === 0 ? "today" : `${days}d ago`}`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {inactive && (
            <button onClick={() => onNotify(tenant)}
              style={{
                background: "#c0392b", color: "#fff", border: "none",
                borderRadius: 6, padding: "5px 10px", fontSize: 11,
                fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap"
              }}>
              🔔 Notify
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none", border: "1px solid #ddd", borderRadius: 6,
              padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#888",
              fontFamily: "'Inter', sans-serif"
            }}>
            {expanded ? "▲ Less" : "▼ More"}
          </button>
        </div>
      </div>

      {/* Overall bar */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#aaa", marginBottom: 4
        }}>
          <span>Overall Course Activity</span>
          <span style={{
            fontWeight: 700,
            color: avg >= 60 ? "#27ae60" : avg >= 30 ? "#FF6B00" : "#c0392b"
          }}>
            {avg}%
          </span>
        </div>
        <div style={{
          height: 8, background: "#f0f0f0",
          borderRadius: 4, overflow: "hidden"
        }}>
          <div style={{
            height: "100%", borderRadius: 4, width: `${avg}%`,
            background: avg >= 60
              ? "linear-gradient(90deg,#27ae60,#2ecc71)"
              : avg >= 30
                ? "linear-gradient(90deg,#FF6B00,#f39c12)"
                : "linear-gradient(90deg,#c0392b,#e74c3c)",
            transition: "width .6s ease"
          }} />
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
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 11, color: "#666", marginBottom: 3
                }}>
                  <span>{c.name}</span>
                  <span style={{ color: "#aaa" }}>{c.progress}% · {c.totalUsers} users</span>
                </div>
                <div style={{
                  height: 6, background: "#f0f0f0",
                  borderRadius: 3, overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${c.progress}%`,
                    background: c.progress >= 70 ? "#27ae60"
                      : c.progress >= 40 ? "#FF6B00" : "#c0392b",
                    transition: "width .5s ease"
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Static data ───────────────────────────────────────────────
const RECENT_SUBS: RecentSub[] = [
  { name: "Department of Education", since: "Feb. 25 2026", type: "Institute", bg: "#2980b9", abbr: "DepEd" },
  { name: "Eleksis Marketing Corp", since: "Jan. 10 2026", type: "Enterprise", bg: "#c0392b", abbr: "ELEKSIS" },
  { name: "De La Salle University", since: "Jan. 01 2026", type: "Institute", bg: "#27ae60", abbr: "DLSU" },
  { name: "Zoup Sales & Marketing", since: "Feb. 01 2026", type: "Personal", bg: "#8e44ad", abbr: "ZOUP" },
];

const StatIcons = {
  tenants: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  approvals: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  courses: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  subscriptions: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
};

// ── Dashboard Home ────────────────────────────────────────────
export const DashboardHome = () => {
  const navigate = useNavigate();
  const [notifyTenant, setNotifyTenant] = useState<MockTenant | null>(null);
  const inactiveCount = (MOCK_TENANTS as MockTenant[]).filter((t) => daysSince(t.lastActive ?? new Date().toISOString()) >= 7).length;

  const STATS: StatItem[] = [
    { key: "tenants", label: "Tenants", count: 24, sub: "+5 this week", iconKey: "tenants" },
    { key: "approvals", label: "Approvals", count: 8, sub: "+3 this week", iconKey: "approvals" },
    { key: "courses", label: "Courses", count: 61, sub: "4 new", iconKey: "courses" },
    { key: "tenants", label: "Subscriptions", count: 18, sub: "+3 this quarter", iconKey: "subscriptions" },
  ];

  return (
    <PageTransition style={{ height: "100%" }}>
      <div style={{ padding: 20, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Dashboard title */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700, fontSize: 32, color: "#222", marginBottom: 20
      }}>
        Dashboard
      </div>

      {/* Stat cards */}
      <div className="sa-stat-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 24
      }}>
        {STATS.map((s, i) => (
          <SAStatCard
            key={i}
            label={s.label}
            value={s.count}
            sub={`↑ ${s.sub}`}
            subColor="#FF6B00"
            icon={StatIcons[s.iconKey]}
            onClick={() => navigate("/superadmin/" + s.key)}
          />
        ))}
      </div>

      {/* Inactive alert */}
      {inactiveCount > 0 && (
        <div style={{
          background: "#fde8e8", border: "1px solid #f5c6c6",
          borderRadius: 10, padding: "12px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#c0392b" }}>
              {inactiveCount} tenant{inactiveCount > 1 ? "s" : ""} inactive for 7+ days
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              Check the Tenant Activeness panel below and send notifications.
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="sa-main-grid" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 340px)",
        gap: 20, alignItems: "start"
      }}>

        {/* LEFT — Tenant Activeness */}
        <div style={{ ...d.panel, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={d.panelTitle}>Tenant Activeness</div>
          <style>{`
            .tenant-scroll::-webkit-scrollbar { width: 4px; }
            .tenant-scroll::-webkit-scrollbar-track { background: transparent; }
            .tenant-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
            .tenant-scroll::-webkit-scrollbar-thumb:hover { background: #ccc; }

            @media (max-width: 1024px) {
              .sa-main-grid { grid-template-columns: 1fr !important; }
              .sa-right-col { display: grid !important; grid-template-columns: 1fr 1fr !important; }
            }
            @media (max-width: 640px) {
              .sa-stat-grid { grid-template-columns: 1fr 1fr !important; }
              .sa-main-grid { grid-template-columns: 1fr !important; }
              .sa-right-col { display: grid !important; grid-template-columns: 1fr !important; }
            }
            @media (max-width: 400px) {
              .sa-stat-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          <div className="tenant-scroll"
            style={{ maxHeight: 520, overflowY: "auto", paddingRight: 6 }}>
            {(MOCK_TENANTS as MockTenant[]).map((ten) => (
              <TenantActivityCard key={ten.id} tenant={ten} onNotify={setNotifyTenant} />
            ))}
          </div>
        </div>

        {/* RIGHT — Recent Subscriptions + System Updates */}
        <div className="sa-right-col" style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0 }}>

          {/* Recent Subscriptions */}
          <div style={{ ...d.panel }}>
            <div style={d.panelTitle}>Recent Subscriptions</div>
            {RECENT_SUBS.slice(0, 3).map((sub, i, arr) => (
              <div key={sub.name} style={{
                ...d.subItem,
                borderBottom: i < arr.length - 1
                  ? "1px solid #f2f2f2" : "none",
              }}>
                <div style={{ ...d.subLogo, background: sub.bg }}>
                  <span style={{
                    color: "#fff", fontSize: 8, fontWeight: 900,
                    textAlign: "center", lineHeight: 1.2
                  }}>
                    {sub.abbr.slice(0, 6)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: "#222",
                    marginBottom: 3, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis"
                  }}>
                    {sub.name}
                  </div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "auto 1fr",
                    gap: "2px 8px", fontSize: 11, color: "#888"
                  }}>
                    <span style={{ color: "#aaa" }}>Subscribed Since</span>
                    <span>{sub.since}</span>
                    <span style={{ color: "#aaa" }}>Type</span>
                    <span style={{ color: "#FF6B00", fontWeight: 700 }}>{sub.type}</span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 8, paddingTop: 12, borderTop: "1px solid #ddd" }}>
              <span onClick={() => navigate("/superadmin/tenants")} style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                View all
              </span>
            </div>
          </div>

          {/* System Updates */}
          <div style={{ ...d.panel, display: "flex", flexDirection: "column" }}>
            <div style={d.panelTitle}>System Updates</div>
            <div className="tenant-scroll" style={{ maxHeight: 115, overflowY: "auto", paddingRight: 6 }}>
              {([
                { text: "New tenant registered: Build Hub PH", time: "2h ago" },
                { text: "Course approved: Sales Fundamentals", time: "5h ago" },
                { text: "Eleksis inactive for 10 days", time: "1d ago" },
                { text: "DLSU renewed Institute subscription", time: "2d ago" },
                { text: "New admin role assigned at DepEd", time: "3d ago" },
              ]).map((u, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start",
                  gap: 12, padding: "9px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none"
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#FF6B00", flexShrink: 0, marginTop: 4
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{u.text}</div>
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{u.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {notifyTenant && (
        <NotifyModal tenant={notifyTenant} onClose={() => setNotifyTenant(null)} />
      )}
    </div>
    </PageTransition>
  );
};

// ── Panel/card styles ─────────────────────────────────────────
const d: Record<string, React.CSSProperties> = {
  panel: {
    background: "#fff",
    borderRadius: 12,
    border: "none",
    boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
    padding: "18px 20px",
  },
  panelTitle: {
    fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 14,
  },
  subItem: {
    display: "flex", alignItems: "flex-start",
    gap: 12, paddingTop: 10, paddingBottom: 10,
  },
  subLogo: {
    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};

// ── Coming Soon placeholder ───────────────────────────────────
export const ComingSoon = ({ label }: { label: string }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#aaa", gap: 12,
    minHeight: 400
  }}>
    <div style={{ fontSize: 48, opacity: .4 }}>
      {{ approvals: "🕐", users: "👥", courses: "📚", settings: "⚙️" }[label] || "📄"}
    </div>
    <div style={{ fontSize: 16, fontWeight: 600 }}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </div>
    <div style={{ fontSize: 13 }}>Design coming soon — frontend in progress</div>
  </div>
);

// ── Main SADashboard ──────────────────────────────────────────
const SADashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: "#f4f4f4",
      minHeight: "100vh",
    }}>
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
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SADashboard;
