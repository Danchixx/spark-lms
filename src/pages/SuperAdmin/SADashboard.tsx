// src/pages/SuperAdmin/SADashboard.tsx
// Layout wrapper and entry point for the global SuperAdmin dashboard.
// Manages sidebar state, WelcomeScreen splash, and provides Outlet for nested routes.

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
import {
  fetchKPIStats,
  fetchTenantHealthData,
  fetchCourseStatusBreakdown,
  fetchGlobalActivityTrend,
  fetchTenantLeaderboard,
  fetchRecentSubscriptions,
  type KPIStats,
  type TenantHealthRow,
  type CourseStatusCount,
  type ActivityTrendPoint,
  type TenantLeaderboardRow,
  type RecentSubscription,
} from "../../services/dashboardService";

// ── Types ──────────────────────────────────────────────────────

interface TenantHealthTenant extends TenantHealthRow {
  score: number;
  tier: "HEALTHY" | "AT RISK" | "CHURNING";
  daysSinceLogin: number;
  completionPct: number;
}

interface NotifyTarget {
  name: string;
  email: string;
  daysSinceLogin: number;
}

interface StatItem {
  key: string;
  label: string;
  count: number;
  sub: string;
  iconKey: keyof typeof StatIcons;
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
  target: NotifyTarget;
  onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
const daysSince = (isoDate: string): number =>
  Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));

const computeHealthScore = (t: TenantHealthRow): number => {
  // Signal 1: Last login (40 pts)
  let loginScore = 0;
  if (t.last_login_at) {
    const d = daysSince(t.last_login_at);
    if (d <= 1) loginScore = 40;
    else if (d <= 3) loginScore = 35;
    else if (d <= 7) loginScore = 25;
    else if (d <= 14) loginScore = 15;
    else loginScore = 0;
  }
  // Signal 2: Lesson completion rate (35 pts)
  const completionRate = t.total_lessons > 0 ? t.completed_lessons / t.total_lessons : 0;
  const completionScore = Math.round(completionRate * 35);
  // Signal 3: Assignment activity (25 pts)
  const assignmentScore = Math.min(25, t.assignment_count * 8);
  return Math.min(100, loginScore + completionScore + assignmentScore);
};

const getHealthTier = (score: number): "HEALTHY" | "AT RISK" | "CHURNING" => {
  if (score >= 70) return "HEALTHY";
  if (score >= 40) return "AT RISK";
  return "CHURNING";
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
const SYSTEM_UPDATES = [
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
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

              <div style={{ padding: "12px 18px", borderTop: "1px solid #f5f5f5", textAlign: "center" }}>
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
const NotifyModal = ({ target, onClose }: NotifyModalProps) => {
  const [msg, setMsg] = useState(
    `Hi ${target.name} team,\n\nWe noticed your team hasn't been active on the SPARK LMS platform for over ${target.daysSinceLogin} day${target.daysSinceLogin !== 1 ? "s" : ""}. We'd love to check in and see how we can help support your learning journey.\n\nPlease feel free to reach out or log in to continue your courses.\n\nBest regards,\nSPARK Admin Team`
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
                  {target.name} — {target.daysSinceLogin === 0 ? "last active today" : `inactive for ${target.daysSinceLogin} day${target.daysSinceLogin !== 1 ? "s" : ""}`}
                </div>
              </div>
              <button onClick={onClose} style={{
                background: "#f5f5f5", border: "none", borderRadius: 8,
                width: 32, height: 32, fontSize: 18, cursor: "pointer", color: "#888",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 600 }}>To: {target.email || "—"}</div>
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

// ── Tenant Health Monitor ──────────────────────────────────────

const TIER_CONFIG = {
  "HEALTHY": { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#22c55e", label: "HEALTHY" },
  "AT RISK": { bg: "#FFF3E8", border: "#fed7aa", text: "#c2410c", dot: "#FF6B00", label: "AT RISK" },
  "CHURNING": { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444", label: "CHURNING" },
};

const COMPANY_PALETTE = ["#FF6B00", "#2563eb", "#7c3aed", "#0891b2"];

const TenantHealthRow = ({
  tenant, index, onNotify,
}: { tenant: TenantHealthTenant; index: number; onNotify: (t: TenantHealthTenant) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = TIER_CONFIG[tenant.tier];
  const companyColor = COMPANY_PALETTE[index % COMPANY_PALETTE.length];
  const loginLabel =
    tenant.daysSinceLogin === 0 ? "Today"
      : tenant.daysSinceLogin === 1 ? "Yesterday"
        : tenant.last_login_at ? `${tenant.daysSinceLogin}d ago`
          : "Never";

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${tenant.tier === "CHURNING" ? "#fecaca" : "#f0f0f0"}`,
        padding: "14px 16px",
        marginBottom: 10,
        background: "#fff",
        boxShadow: tenant.tier === "CHURNING"
          ? "0 2px 12px rgba(239,68,68,.08)"
          : "0 2px 8px rgba(0,0,0,.04)",
        transition: "box-shadow .2s",
      }}
    >
      {/* Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Company chip */}
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: companyColor + "18",
          border: `1.5px solid ${companyColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 900, color: companyColor,
          letterSpacing: ".04em", fontFamily: "'Inter', sans-serif",
        }}>
          {tenant.abbr.slice(0, 5)}
        </div>

        {/* Name + login */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>
            {tenant.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: cfg.dot,
              ...(tenant.tier === "CHURNING" ? { animation: "pulse 1.8s infinite" } : {}),
            }} />
            <span style={{ fontSize: 11, color: "#888" }}>
              Last login: <span style={{ fontWeight: 600, color: "#555" }}>{loginLabel}</span>
            </span>
            <span style={{ fontSize: 10, color: "#ccc" }}>·</span>
            <span style={{ fontSize: 11, color: "#888" }}>
              {tenant.user_count} user{tenant.user_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Health tier badge */}
        <div style={{
          fontSize: 10, fontWeight: 800,
          color: cfg.text,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          padding: "3px 10px", borderRadius: 99, flexShrink: 0,
          letterSpacing: ".06em", fontFamily: "'Inter', sans-serif",
        }}>
          {cfg.label}
        </div>

        {/* Score */}
        <div style={{
          fontSize: 13, fontWeight: 800, color: "#1a1a1a",
          flexShrink: 0, minWidth: 36, textAlign: "right",
        }}>
          {tenant.score}
          <span style={{ fontSize: 9, fontWeight: 500, color: "#bbb" }}>/100</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {tenant.tier !== "HEALTHY" && (
            <button
              onClick={() => onNotify(tenant)}
              style={{
                background: tenant.tier === "CHURNING"
                  ? "linear-gradient(135deg, #b91c1c, #ef4444)"
                  : "linear-gradient(135deg, #c2410c, #FF6B00)",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "5px 12px", fontSize: 10, fontWeight: 700,
                cursor: "pointer", letterSpacing: ".04em",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              NOTIFY
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "#f8f8f8", border: "1px solid #eee", borderRadius: 8,
              padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#888",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginBottom: 4 }}>
          <span>Health Score</span>
          <span style={{ color: cfg.text }}>{tenant.completionPct}% lesson completion</span>
        </div>
        <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, width: `${tenant.score}%`,
            background: tenant.tier === "HEALTHY"
              ? "linear-gradient(90deg,#22c55e,#86efac)"
              : tenant.tier === "AT RISK"
                ? "linear-gradient(90deg,#FF6B00,#FFCF96)"
                : "linear-gradient(90deg,#b91c1c,#ef4444)",
            transition: "width .6s ease",
          }} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              {
                label: "Last Login",
                value: loginLabel,
                color: tenant.daysSinceLogin > 7 ? "#b91c1c" : "#22c55e",
              },
              {
                label: "Lessons Completed",
                value: `${tenant.completed_lessons} / ${tenant.total_lessons}`,
                color: "#1a1a1a",
              },
              {
                label: "Assignments",
                value: String(tenant.assignment_count),
                color: tenant.assignment_count === 0 ? "#b91c1c" : "#1a1a1a",
              },
            ].map((item) => (
              <div key={item.label} style={{
                background: "#fafafa", borderRadius: 8, padding: "10px 12px",
                border: "1px solid #f0f0f0",
              }}>
                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: item.color,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>Subscription Plan</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: ".06em" }}>
              {tenant.subscription_plan}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TenantHealthMonitor = ({
  tenants, loading, onNotify,
}: {
  tenants: TenantHealthTenant[];
  loading: boolean;
  onNotify: (t: TenantHealthTenant) => void;
}) => {
  const healthyCnt = tenants.filter((t) => t.tier === "HEALTHY").length;
  const atRiskCnt = tenants.filter((t) => t.tier === "AT RISK").length;
  const churningCnt = tenants.filter((t) => t.tier === "CHURNING").length;

  return (
    <>
      {/* Summary strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
        padding: "10px 14px", background: "#fafafa",
        borderRadius: 10, border: "1px solid #f0f0f0",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
          {tenants.length} Tenants
        </span>
        <span style={{ color: "#e0e0e0" }}>·</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#15803d",
          background: "#f0fdf4", padding: "2px 8px", borderRadius: 99,
          border: "1px solid #86efac",
        }}>
          {healthyCnt} Healthy
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#c2410c",
          background: "#FFF3E8", padding: "2px 8px", borderRadius: 99,
          border: "1px solid #fed7aa",
        }}>
          {atRiskCnt} At Risk
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#b91c1c",
          background: "#fef2f2", padding: "2px 8px", borderRadius: 99,
          border: "1px solid #fecaca",
        }}>
          {churningCnt} Churning
        </span>
      </div>

      {/* Tenant rows */}
      <div className="sa-thin-scroll" style={{ maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
        {loading ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "#bbb", fontSize: 13 }}>
            Loading tenant data...
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "#bbb", fontSize: 13 }}>
            No tenant data available
          </div>
        ) : (
          tenants.map((ten, i) => (
            <TenantHealthRow key={ten.id} tenant={ten} index={i} onNotify={onNotify} />
          ))
        )}
      </div>
    </>
  );
};

// ── Static chart data helpers ─────────────────────────────────
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

// ── Section Header ─────────────────────────────────────────────
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

// ── Custom Tooltips ────────────────────────────────────────────
const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length || !payload[0]) return null;
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
  if (!active || !payload?.length || !payload[0]) return null;
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
  if (!active || !payload?.length || !payload[0]) return null;
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

  // ── State ────────────────────────────────────────────────────
  const [kpiStats, setKpiStats] = useState<KPIStats>({
    total_tenants: 0, pending_approvals: 0, live_courses: 0, total_subscriptions: 0,
  });
  const [tenantHealth, setTenantHealth] = useState<TenantHealthTenant[]>([]);
  const [courseStatus, setCourseStatus] = useState<CourseStatusCount[]>([]);
  const [activityTrend, setActivityTrend] = useState<ActivityTrendPoint[]>([]);
  const [leaderboard, setLeaderboard] = useState<TenantLeaderboardRow[]>([]);
  const [recentSubs, setRecentSubs] = useState<RecentSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null);

  // ── Fetch all dashboard data on mount ────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [kpi, health, courseStatusData, trend, lboard, subs] = await Promise.all([
          fetchKPIStats(),
          fetchTenantHealthData(),
          fetchCourseStatusBreakdown(),
          fetchGlobalActivityTrend(),
          fetchTenantLeaderboard(),
          fetchRecentSubscriptions(),
        ]);

        setKpiStats(kpi);

        // Compute health score + tier per tenant, sort worst first
        const scored: TenantHealthTenant[] = health.map((t) => {
          const days = t.last_login_at ? daysSince(t.last_login_at) : 999;
          const completionPct = t.total_lessons > 0
            ? Math.round((t.completed_lessons / t.total_lessons) * 100)
            : 0;
          const score = computeHealthScore(t);
          return { ...t, score, tier: getHealthTier(score), daysSinceLogin: days, completionPct };
        }).sort((a, b) => a.score - b.score);

        setTenantHealth(scored);
        setCourseStatus(courseStatusData);
        setActivityTrend(trend);
        setLeaderboard(lboard);
        setRecentSubs(subs);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Derived values ───────────────────────────────────────────
  const churningCount = tenantHealth.filter((t) => t.tier === "CHURNING").length;
  const atRiskCount = tenantHealth.filter((t) => t.tier === "AT RISK").length;
  const urgentCount = churningCount + atRiskCount;

  // Tenant status pie: derived from health scores
  const tenantStatusPie = [
    { name: "Healthy", value: tenantHealth.filter((t) => t.daysSinceLogin <= 7).length },
    { name: "Inactive", value: tenantHealth.filter((t) => t.daysSinceLogin > 7 && t.daysSinceLogin <= 30).length },
    { name: "Churning", value: tenantHealth.filter((t) => t.daysSinceLogin > 30 || (!t.last_login_at)).length },
  ];

  const STATS: StatItem[] = [
    {
      key: "tenants", label: "Tenants",
      count: loading ? 0 : kpiStats.total_tenants,
      sub: loading ? "Loading..." : `${urgentCount} need attention`,
      iconKey: "tenants",
    },
    {
      key: "approvals", label: "Approvals",
      count: loading ? 0 : kpiStats.pending_approvals,
      sub: loading ? "Loading..." : "pending",
      iconKey: "approvals",
    },
    {
      key: "courses", label: "Live Courses",
      count: loading ? 0 : kpiStats.live_courses,
      sub: loading ? "Loading..." : "active on platform",
      iconKey: "courses",
    },
    {
      key: "tenants", label: "Subscriptions",
      count: loading ? 0 : kpiStats.total_subscriptions,
      sub: loading ? "Loading..." : "active tenants",
      iconKey: "subscriptions",
    },
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

        .sa-sub-row:hover { background: #fffaf6 !important; }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
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

        {/* ── Churn Alert Banner ── */}
        {!loading && urgentCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
            border: "1px solid #f5c6c6",
            borderLeft: "4px solid #b91c1c",
            borderRadius: 12, padding: "14px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#b91c1c", flexShrink: 0, animation: "pulse 1.8s infinite",
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#b91c1c" }}>
                {urgentCount} tenant{urgentCount > 1 ? "s" : ""} require{urgentCount === 1 ? "s" : ""} attention
                {churningCount > 0 && ` — ${churningCount} churning`}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                Check the Tenant Health Monitor below and send a re-engagement notification.
              </div>
            </div>
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

        {/* ── Analytics: 3 Charts ── */}
        <SectionHeader label="Analytics Overview" accent="Live Data" />
        <div className="sa-charts-3col" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          marginBottom: 32,
          alignItems: "stretch",
        }}>

          {/* Pie 1 — Tenant Health */}
          <Card title="Tenant Health" subtitle="Healthy vs. Inactive vs. Churning">
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
                <Pie data={tenantStatusPie} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {tenantStatusPie.map((_, idx) => <Cell key={idx} fill={`url(#ogPie${idx})`} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {tenantStatusPie.map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: OG_COLORS[i] }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>
                    {loading ? "—" : item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Line — Global Activity Trend */}
          <Card title="Global Activity Trend" subtitle="Daily logins across all tenants (this week)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {loading
                ? [{ label: "Peak day", value: "—" }, { label: "Avg. daily", value: "—" }, { label: "Total this week", value: "—" }].map((s) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: "#FF6B00" }} />
                      <span style={{ fontSize: 12, color: "#555" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{s.value}</span>
                  </div>
                ))
                : (() => {
                  const peak = activityTrend.reduce((m, d) => d.logins > m.logins ? d : m, { day: "—", logins: 0 });
                  const avg = activityTrend.length > 0
                    ? Math.round(activityTrend.reduce((s, d) => s + d.logins, 0) / activityTrend.length)
                    : 0;
                  const total = activityTrend.reduce((s, d) => s + d.logins, 0);
                  return [
                    { label: `Peak: ${peak.day}`, value: String(peak.logins) },
                    { label: "Avg. daily logins", value: String(avg) },
                    { label: "Total this week", value: String(total) },
                  ];
                })().map((stat) => (
                  <div key={stat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: "#FF6B00" }} />
                      <span style={{ fontSize: 12, color: "#555" }}>{stat.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{stat.value}</span>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Pie 2 — Course Status */}
          <Card title="Course Status" subtitle="Active, Pending Review, and Draft">
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
                <Pie data={courseStatus} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                  {courseStatus.map((_, idx) => <Cell key={idx} fill={`url(#ogCourse${idx})`} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {(courseStatus.length > 0 ? courseStatus : [
                { name: "Active / Live", value: 0 },
                { name: "Pending Review", value: 0 },
                { name: "Draft", value: 0 },
              ]).map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: OG_COLORS[i] }} />
                    <span style={{ fontSize: 12, color: "#555" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>
                    {loading ? "—" : item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Tenant Leaderboard Bar Chart ── */}
        <SectionHeader label="Tenant Leaderboard" accent="Completion Rate" />
        <Card
          title="Tenant Course Completion Rate"
          subtitle="Ranked by % of lessons completed across all assigned courses"
          style={{ marginBottom: 32 }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leaderboard} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
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

          {/* LEFT — Tenant Health Monitor */}
          <Card title="Tenant Health Monitor" subtitle="Churn risk analysis — sorted by urgency">
            <TenantHealthMonitor
              tenants={tenantHealth}
              loading={loading}
              onNotify={(ten) => setNotifyTarget({
                name: ten.name,
                email: ten.contact_email ?? "",
                daysSinceLogin: ten.daysSinceLogin,
              })}
            />
          </Card>

          {/* RIGHT — Recent Subscriptions */}
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
              {(recentSubs.length > 0 ? recentSubs : Array(4).fill(null)).map((sub, i) => (
                <div
                  key={sub ? sub.id : i}
                  className="sa-sub-row"
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 0",
                    borderBottom: i < 3 ? "1px solid #f5f5f5" : "none",
                    borderRadius: 10,
                    transition: "background .15s",
                  }}
                >
                  {/* Logo chip */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: sub
                      ? COMPANY_PALETTE[i % COMPANY_PALETTE.length]
                      : "#f0f0f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: sub ? `0 4px 12px ${COMPANY_PALETTE[i % COMPANY_PALETTE.length]}44` : "none",
                  }}>
                    <span style={{
                      color: "#fff", fontSize: 8, fontWeight: 900,
                      textAlign: "center", lineHeight: 1.2, letterSpacing: ".04em",
                    }}>
                      {sub ? sub.abbr.slice(0, 6) : "—"}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: sub ? "#1a1a1a" : "#ccc",
                      marginBottom: 1, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {sub ? sub.name : "Loading..."}
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>
                      {sub && sub.subscribed_at
                        ? `Since ${new Date(sub.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                        : "—"}
                    </div>
                  </div>

                  {/* Plan badge */}
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: "#FF6B00",
                    background: "#FFF3E8", padding: "4px 10px",
                    borderRadius: 99, flexShrink: 0, letterSpacing: ".04em",
                  }}>
                    {sub ? sub.subscription_plan.toUpperCase() : "—"}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* Notify Modal */}
      {notifyTarget && (
        <NotifyModal target={notifyTarget} onClose={() => setNotifyTarget(null)} />
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
void d; // suppress unused warning

// ── Coming Soon placeholder ────────────────────────────────────
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
  const { user, logout } = useAuth();
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

      <SASidebar open={sidebarOpen} activePage={activePage} user={user} onLogout={logout} />

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
