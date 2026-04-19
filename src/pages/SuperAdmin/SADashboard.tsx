// src/pages/SuperAdmin/SADashboard.tsx
// Layout wrapper and entry point for the global SuperAdmin dashboard.
// Manages sidebar state, WelcomeScreen splash, and provides Outlet for nested routes.

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MOCK_TENANTS } from "../../data/mockTenants";
import PageTransition from "../../components/common/PageTransition/PageTransition";
import SASidebar, { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../components/layout/Sidebar/SASidebar";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";
import SAStatCard from "../../components/common/SAStatCard/SAStatCard";
import type { AppUser } from "../../types";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

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
  text: string;
  time: string;
  category: string;
}

interface TopBarProps {
  onBurger: () => void;
  sidebarOpen: boolean;
  user: AppUser | null;
  activePage: string;
}

interface WelcomeScreenProps {
  name: string;
  onDone: () => void;
}

interface NotifyModalProps {
  tenant: MockTenant;
  onClose: () => void;
}

interface TenantActivityRowProps {
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

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  tenants: "Tenants",
  users: "Users",
  courses: "Courses",
  approvals: "Approvals",
  settings: "Settings",
  logs: "System Logs",
};

// ── Style tokens ──────────────────────────────────────────────
const t = {
  burgerBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", flexDirection: "column" as const, gap: 4,
  },
  burgerLine: {
    display: "block", width: 20, height: 2,
    background: "#555", borderRadius: 2,
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 600, fontSize: 26, color: "#222", letterSpacing: 3,
  },
};

// ── System Updates data (used in bell dropdown) ───────────────
const SYSTEM_UPDATES: SystemUpdate[] = [
  { text: "New tenant registered: Build Hub PH", time: "2h ago", category: "Tenant" },
  { text: "Course approved: Sales Fundamentals", time: "5h ago", category: "Course" },
  { text: "Eleksis inactive for 10 days", time: "1d ago", category: "Alert" },
  { text: "DLSU renewed Institute subscription", time: "2d ago", category: "Subscription" },
  { text: "New admin role assigned at DepEd", time: "3d ago", category: "User" },
];

// ── Top Bar ───────────────────────────────────────────────────
const TopBar = ({ onBurger, sidebarOpen, user, activePage }: TopBarProps) => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    setNotifSeen(true);
  };

  const pageLabel = PAGE_LABELS[activePage] || activePage;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: isDesktop && sidebarOpen ? SIDEBAR_WIDTH : 0,
      right: 0,
      height: TOPBAR_HEIGHT,
      background: "#fff",
      borderBottom: "1.5px solid #f0f0f0",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 14,
      zIndex: 110,
      transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
      boxShadow: "0 1px 8px rgba(0,0,0,.06)",
    }}>

      {/* Burger */}
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

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "#e8e8e8" }} />

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#bbb", fontFamily: "'Inter', sans-serif" }}>SuperAdmin</span>
        <span style={{ fontSize: 12, color: "#ddd" }}>/</span>
        <span style={{
          fontSize: 13, fontWeight: 600, color: "#1a1a1a",
          fontFamily: "'Inter', sans-serif",
        }}>
          {pageLabel}
        </span>
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>

        {/* Notification Bell */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            onClick={toggleNotif}
            aria-label="Notifications"
            style={{
              background: notifOpen ? "#FFF3E8" : "#f8f8f8",
              border: notifOpen ? "1.5px solid #FF6B00" : "1.5px solid #eee",
              borderRadius: 10,
              cursor: "pointer",
              width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0,
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={notifOpen ? "#FF6B00" : "#666"} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {!notifSeen && (
              <div style={{
                position: "absolute", top: 7, right: 7,
                width: 8, height: 8, background: "#c0392b",
                borderRadius: "50%", border: "2px solid #fff",
              }} />
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 340, background: "#fff",
              borderRadius: 14,
              boxShadow: "0 8px 40px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06)",
              border: "1px solid #f0f0f0",
              zIndex: 300,
              overflow: "hidden",
              animation: "notifSlide .18s cubic-bezier(.22,1,.36,1)",
            }}>
              <style>{`@keyframes notifSlide { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>

              {/* Dropdown header */}
              <div style={{
                padding: "16px 18px 12px",
                borderBottom: "1px solid #f5f5f5",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
                    System Updates
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
                    Recent platform events
                  </div>
                </div>
                <div style={{
                  fontSize: 11, color: "#FF6B00", fontWeight: 600,
                  background: "#FFF3E8", padding: "3px 8px", borderRadius: 99,
                }}>
                  {SYSTEM_UPDATES.length} new
                </div>
              </div>

              {/* Update items */}
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {SYSTEM_UPDATES.map((u, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 18px",
                    borderBottom: i < SYSTEM_UPDATES.length - 1 ? "1px solid #f8f8f8" : "none",
                    background: i === 0 ? "#fffaf6" : "#fff",
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF6B00, #FFB680)",
                      flexShrink: 0, marginTop: 5,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 12, color: "#2a2a2a", lineHeight: 1.5,
                        fontFamily: "'Inter', sans-serif", fontWeight: i === 0 ? 600 : 400,
                      }}>
                        {u.text}
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginTop: 3,
                      }}>
                        <span style={{
                          fontSize: 10, color: "#FF6B00", fontWeight: 600,
                          background: "#FFF3E8", padding: "1px 6px", borderRadius: 99,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {u.category}
                        </span>
                        <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'Inter', sans-serif" }}>
                          {u.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 18px", borderTop: "1px solid #f5f5f5",
                textAlign: "center",
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#FF6B00",
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                }}>
                  View all activity
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "#e8e8e8" }} />

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "#1a1a1a",
              fontFamily: "'Inter', sans-serif", lineHeight: 1.2,
            }}>
              {user?.name?.split(" ")[0] || "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#FF6B00", fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: ".04em" }}>
              SUPER ADMIN
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B00, #FFB680)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 100 100" width="24" height="24">
              <circle cx="50" cy="38" r="20" fill="rgba(255,255,255,0.9)" />
              <ellipse cx="50" cy="85" rx="30" ry="22" fill="rgba(255,255,255,0.9)" />
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
              color: "#9e9e9e", fontFamily: "'Open Sans', sans-serif",
              fontSize: 6.4, textTransform: "uppercase",
              whiteSpace: "nowrap", marginTop: 2, letterSpacing: ".12em",
            }}>
              Yes to Learning and Development
            </span>
          </div>
          <img src={SparkLogo} alt="Spark Logo" style={{ height: 44, width: "auto" }} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 52,
          animation: "slideUp .7s .3s cubic-bezier(.22,1,.36,1) both",
        }}>
          <span style={{ color: "#222" }}>WELCOME </span>
          <span style={{ color: "#FF6B00" }}>{(name || "ADMIN").toUpperCase()}</span>
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 500, maxWidth: "90vw",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        {sent ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0" }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%",
              background: "linear-gradient(135deg, #FF6B00, #FFB680)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>Notification sent!</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 20, color: "#222" }}>
                  Notify Tenant Admin
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {tenant.name} — inactive for {daysSince(tenant.lastActive ?? new Date().toISOString())} days
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "#f5f5f5", border: "none", borderRadius: 8,
                width: 32, height: 32, fontSize: 18, cursor: "pointer", color: "#888",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 600 }}>To: {tenant.email}</div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{
                width: "100%", height: 160, padding: "10px 14px",
                border: "1.5px solid #FF6B00", borderRadius: 10,
                fontSize: 13, fontFamily: "'Inter', sans-serif",
                outline: "none", resize: "vertical",
                boxSizing: "border-box", color: "#333", marginBottom: 16,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{
                background: "#f5f5f5", color: "#555", border: "none", borderRadius: 10,
                padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={send} style={{
                background: "linear-gradient(135deg, #FF6B00, #FF8C3A)", color: "#fff",
                border: "none", borderRadius: 10, padding: "10px 20px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Send Notification</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Tenant Activity Row ───────────────────────────────────────
const TenantActivityRow = ({ tenant, onNotify }: TenantActivityRowProps) => {
  const days = daysSince(tenant.lastActive ?? new Date().toISOString());
  const inactive = days >= 7;
  const avg = avgProgress(tenant.courseActivity);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid #f0f0f0",
      padding: "14px 16px",
      marginBottom: 10,
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      transition: "box-shadow .2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: tenant.color + "18",
          border: `1.5px solid ${tenant.color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: tenant.color,
          letterSpacing: ".04em",
        }}>
          {tenant.abbr.slice(0, 5)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>
            {tenant.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: inactive ? "#c0392b" : "#27ae60", flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: inactive ? "#c0392b" : "#27ae60", fontWeight: 600 }}>
              {inactive ? `Inactive · ${days}d ago` : `Active · ${days === 0 ? "today" : `${days}d ago`}`}
            </span>
          </div>
        </div>

        {/* Progress pill */}
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: avg >= 60 ? "#27ae60" : avg >= 30 ? "#FF6B00" : "#c0392b",
          background: avg >= 60 ? "#f0fdf4" : avg >= 30 ? "#FFF3E8" : "#fff5f5",
          padding: "3px 10px", borderRadius: 99, flexShrink: 0,
        }}>
          {avg}%
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {inactive && (
            <button
              onClick={() => onNotify(tenant)}
              style={{
                background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>
              Notify
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "#f8f8f8", border: "1px solid #eee", borderRadius: 8,
              padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#888",
            }}>
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginBottom: 4 }}>
          <span>Course Activity</span>
        </div>
        <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, width: `${avg}%`,
            background: avg >= 60
              ? "linear-gradient(90deg,#27ae60,#2ecc71)"
              : avg >= 30
                ? "linear-gradient(90deg,#FF6B00,#FFCF96)"
                : "linear-gradient(90deg,#c0392b,#e74c3c)",
            transition: "width .6s ease",
          }} />
        </div>
      </div>

      {/* Expanded courses */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
          {!tenant.courseActivity?.length ? (
            <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "8px 0" }}>
              No course activity yet
            </div>
          ) : (
            tenant.courseActivity.map((c) => (
              <div key={c.name} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#666", marginBottom: 3 }}>
                  <span>{c.name}</span>
                  <span style={{ color: "#aaa" }}>{c.progress}% · {c.totalUsers} users</span>
                </div>
                <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, width: `${c.progress}%`,
                    background: c.progress >= 70 ? "#27ae60" : c.progress >= 40 ? "#FF6B00" : "#c0392b",
                    transition: "width .5s ease",
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

// ── Chart Data ────────────────────────────────────────────────
const TENANT_STATUS_PIE = [
  { name: "Active", value: 18 },
  { name: "Inactive", value: 4 },
  { name: "Archived", value: 2 },
];

const COURSE_STATUS_PIE = [
  { name: "Approved / Live", value: 61 },
  { name: "Pending Review", value: 12 },
  { name: "Rejected", value: 5 },
];

const GLOBAL_LOGINS_LINE = [
  { day: "Mon", logins: 142 },
  { day: "Tue", logins: 198 },
  { day: "Wed", logins: 174 },
  { day: "Thu", logins: 221 },
  { day: "Fri", logins: 189 },
  { day: "Sat", logins: 87 },
  { day: "Sun", logins: 64 },
];

const TENANT_ENGAGEMENT_BAR = [
  { name: "DepEd", completion: 82, users: 340 },
  { name: "DLSU", completion: 74, users: 215 },
  { name: "Eleksis", completion: 45, users: 88 },
  { name: "Zoup", completion: 61, users: 52 },
  { name: "Build Hub", completion: 38, users: 29 },
  { name: "ADB PH", completion: 91, users: 185 },
];

// ── Brand palette ─────────────────────────────────────────────
const OG_COLORS = ["#FF6B00", "#FF8C3A", "#FFB680"];
const OG_GRAD_START = "#FF6B00";
const OG_GRAD_END = "#FFCF96";

// ── Card wrapper ──────────────────────────────────────────────
const Card = ({
  title, subtitle, children, style, action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  action?: React.ReactNode;
}) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)",
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column",
    ...style,
  }}>
    {title && (
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: ".01em" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ label, accent }: { label: string; accent?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <div style={{
      width: 4, height: 20, borderRadius: 2,
      background: "linear-gradient(180deg, #FF6B00, #FFCF96)",
    }} />
    <span style={{
      fontSize: 13, fontWeight: 700, color: "#1a1a1a",
      textTransform: "uppercase", letterSpacing: ".08em",
    }}>
      {label}
    </span>
    {accent && (
      <span style={{
        fontSize: 11, color: "#FF6B00", fontWeight: 600,
        background: "#FFF3E8", padding: "2px 8px", borderRadius: 99,
      }}>
        {accent}
      </span>
    )}
  </div>
);

// ── Custom Tooltips ───────────────────────────────────────────
const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: 8, padding: "8px 14px",
      fontSize: 12, color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.2)",
    }}>
      <span style={{ color: OG_GRAD_START, fontWeight: 700 }}>{payload[0].name}:</span>{" "}
      <span>{payload[0].value}</span>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: 8, padding: "8px 14px",
      fontSize: 12, color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.2)",
    }}>
      <div style={{ color: "#aaa", marginBottom: 2 }}>{label}</div>
      <div style={{ color: OG_GRAD_START, fontWeight: 700 }}>{payload[0].value} logins</div>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a1a", borderRadius: 8, padding: "8px 14px",
      fontSize: 12, color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.2)",
    }}>
      <div style={{ color: "#aaa", marginBottom: 2 }}>{label}</div>
      <div style={{ color: OG_GRAD_START, fontWeight: 700 }}>{payload[0].value}% completion</div>
    </div>
  );
};

// ── Dashboard Home ────────────────────────────────────────────
export const DashboardHome = () => {
  const navigate = useNavigate();
  const [notifyTenant, setNotifyTenant] = useState<MockTenant | null>(null);
  const inactiveCount = (MOCK_TENANTS as MockTenant[]).filter(
    (ten) => daysSince(ten.lastActive ?? new Date().toISOString()) >= 7
  ).length;

  const STATS: StatItem[] = [
    { key: "tenants", label: "Tenants", count: 24, sub: "+5 this week", iconKey: "tenants" },
    { key: "approvals", label: "Approvals", count: 8, sub: "+3 pending", iconKey: "approvals" },
    { key: "courses", label: "Live Courses", count: 61, sub: "4 new", iconKey: "courses" },
    { key: "tenants", label: "Subscriptions", count: 18, sub: "+3 this quarter", iconKey: "subscriptions" },
  ];

  return (
    <PageTransition style={{ height: "100%" }}>
      <style>{`
        @media (max-width: 1200px) { .sa-charts-3col { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 900px)  { .sa-charts-3col { grid-template-columns: 1fr !important; } .sa-bottom-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px)  { .sa-stat-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 400px)  { .sa-stat-grid { grid-template-columns: 1fr !important; } }

        .sa-thin-scroll::-webkit-scrollbar { width: 4px; }
        .sa-thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .sa-thin-scroll::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
        .sa-thin-scroll::-webkit-scrollbar-thumb:hover { background: #ccc; }

        .sa-tenant-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,.09) !important; }
        .sa-sub-row:hover { background: #fffaf6 !important; }
      `}</style>

      <div
        className="sa-thin-scroll"
        style={{
          padding: "24px 28px",
          overflowY: "auto",
          height: "100%",
          boxSizing: "border-box",
          fontFamily: "'Inter', sans-serif",
        }}
      >

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-.01em" }}>
            Dashboard
          </div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
            Global overview of the SPARK LMS platform
          </div>
        </div>

        {/* ── Inactive Alert ── */}
        {inactiveCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
            border: "1px solid #f5c6c6",
            borderLeft: "4px solid #c0392b",
            borderRadius: 12, padding: "14px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#c0392b", flexShrink: 0, animation: "pulse 1.8s infinite",
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#c0392b" }}>
                {inactiveCount} tenant{inactiveCount > 1 ? "s" : ""} inactive for 7+ days
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                Check the Tenant Activity panel below and send a re-engagement notification.
              </div>
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
          </div>
        )}

        {/* ── KPI Stat Cards ── */}
        <SectionHeader label="Key Performance Indicators" />
        <div className="sa-stat-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16, marginBottom: 32,
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

        {/* ── Analytics: 3 Charts equal height ── */}
        <SectionHeader label="Analytics Overview" accent="Live Data" />
        <div className="sa-charts-3col" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          marginBottom: 32,
          alignItems: "stretch",   /* ← all three cards stretch to same height */
        }}>

          {/* Pie 1 — Tenant Health */}
          <Card title="Tenant Health" subtitle="Active vs. Inactive vs. Archived">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  <linearGradient id="ogPie0" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" /><stop offset="100%" stopColor="#FF8C3A" />
                  </linearGradient>
                  <linearGradient id="ogPie1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF8C3A" /><stop offset="100%" stopColor="#FFB680" />
                  </linearGradient>
                  <linearGradient id="ogPie2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFB680" /><stop offset="100%" stopColor="#FFCF96" />
                  </linearGradient>
                </defs>
                <Pie data={TENANT_STATUS_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {TENANT_STATUS_PIE.map((_, idx) => <Cell key={idx} fill={`url(#ogPie${idx})`} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {TENANT_STATUS_PIE.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: OG_COLORS[i] }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Line — Global Activity Trend (same height as pie cards) */}
          <Card title="Global Activity Trend" subtitle="Daily logins across all tenants (this week)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={GLOBAL_LOGINS_LINE} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ogLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={OG_GRAD_START} />
                    <stop offset="100%" stopColor={OG_GRAD_END} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip content={<LineTooltip />} />
                <Line
                  type="monotone" dataKey="logins"
                  stroke="url(#ogLine)" strokeWidth={3}
                  dot={{ fill: "#FF6B00", r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: "#FF6B00", r: 6, stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* Spacer row to match legends in pie cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {[
                { label: "Peak: Thursday", value: "221" },
                { label: "Avg. daily logins", value: "153" },
                { label: "Weekend drop", value: "−63%" },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "#FF6B00" }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{stat.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pie 2 — Course Status */}
          <Card title="Course Status" subtitle="Live, Pending Review, and Rejected">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  <linearGradient id="ogCourse0" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" /><stop offset="100%" stopColor="#FF8C3A" />
                  </linearGradient>
                  <linearGradient id="ogCourse1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF8C3A" /><stop offset="100%" stopColor="#FFB680" />
                  </linearGradient>
                  <linearGradient id="ogCourse2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFB680" /><stop offset="100%" stopColor="#FFCF96" />
                  </linearGradient>
                </defs>
                <Pie data={COURSE_STATUS_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {COURSE_STATUS_PIE.map((_, idx) => <Cell key={idx} fill={`url(#ogCourse${idx})`} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {COURSE_STATUS_PIE.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: OG_COLORS[i] }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Tenant Leaderboard Bar Chart ── */}
        <SectionHeader label="Tenant Leaderboard" accent="Completion Rate" />
        <Card
          title="Tenant Course Completion Rate"
          subtitle="Ranked by % of users who completed at least one course"
          style={{ marginBottom: 32 }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TENANT_ENGAGEMENT_BAR} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ogBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={OG_GRAD_START} />
                  <stop offset="100%" stopColor={OG_GRAD_END} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="completion" fill="url(#ogBar)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Operational Panels ── */}
        <SectionHeader label="Operational Panels" />
        <div className="sa-bottom-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          alignItems: "start",
          marginBottom: 32,
        }}>

          {/* LEFT — Tenant Activity */}
          <Card title="Tenant Activity" subtitle="Monitoring engagement and churn prevention">
            <div className="sa-thin-scroll" style={{ maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
              {(MOCK_TENANTS as MockTenant[]).map((ten) => (
                <TenantActivityRow key={ten.id} tenant={ten} onNotify={setNotifyTenant} />
              ))}
            </div>
          </Card>

          {/* RIGHT — Recent Subscriptions (only, System Updates moved to bell) */}
          <Card
            title="Recent Subscriptions"
            subtitle="Newest tenant enrollments"
            action={
              <span
                onClick={() => navigate("/superadmin/tenants")}
                style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", cursor: "pointer" }}
              >
                View all →
              </span>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {RECENT_SUBS.map((sub, i) => (
                <div
                  key={sub.name}
                  className="sa-sub-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 0",
                    borderBottom: i < RECENT_SUBS.length - 1 ? "1px solid #f5f5f5" : "none",
                    borderRadius: 10,
                    transition: "background .15s",
                  }}
                >
                  {/* Logo chip */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: sub.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 12px ${sub.bg}44`,
                  }}>
                    <span style={{
                      color: "#fff", fontSize: 8, fontWeight: 900,
                      textAlign: "center", lineHeight: 1.2, letterSpacing: ".04em",
                    }}>
                      {sub.abbr.slice(0, 6)}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "#1a1a1a",
                      marginBottom: 1, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {sub.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>Since {sub.since}</div>
                  </div>

                  {/* Type badge */}
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#FF6B00",
                    background: "#FFF3E8", padding: "4px 10px",
                    borderRadius: 99, flexShrink: 0, letterSpacing: ".04em",
                  }}>
                    {sub.type.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {notifyTenant && (
        <NotifyModal tenant={notifyTenant} onClose={() => setNotifyTenant(null)} />
      )}
    </PageTransition>
  );
};

// ── Panel/card styles (kept for legacy usage) ─────────────────
const d: Record<string, React.CSSProperties> = {
  panel: {
    background: "#fff", borderRadius: 12, border: "none",
    boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
    padding: "18px 20px",
  },
  panelTitle: { fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 14 },
  subItem: { display: "flex", alignItems: "flex-start", gap: 12, paddingTop: 10, paddingBottom: 10 },
  subLogo: { width: 38, height: 38, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
};

// ── Coming Soon placeholder ───────────────────────────────────
export const ComingSoon = ({ label }: { label: string }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#aaa", gap: 12, minHeight: 400,
  }}>
    <div style={{ fontSize: 48, opacity: .4 }}>
      {{ approvals: "🕐", users: "👥", courses: "📚", settings: "⚙️" }[label] || "📄"}
    </div>
    <div style={{ fontSize: 16, fontWeight: 600 }}>{label.charAt(0).toUpperCase() + label.slice(1)}</div>
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

  const handleWelcomeDone = useCallback(() => setShowWelcome(false), []);

  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener("sa-mobile-nav-close", handler);
    return () => window.removeEventListener("sa-mobile-nav-close", handler);
  }, []);

  if (showWelcome) {
    return <WelcomeScreen name={user?.name?.split(" ")[0] || "Admin"} onDone={handleWelcomeDone} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f4f4f4", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) { .sa-content-area { margin-left: 0 !important; } }
      `}</style>

      <TopBar
        onBurger={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        user={user}
        activePage={activePage}
      />

      <SASidebar open={sidebarOpen} activePage={activePage} user={user} />

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
