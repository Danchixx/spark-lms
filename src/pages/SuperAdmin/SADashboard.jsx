import { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";
import { MOCK_TENANTS } from "../../data/mockTenants";
import SASidebar, { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../components/layout/Sidebar/SASidebar";
import SparkTenants from "./Tenants/SparkTenants";
import SparkApprovals from "./Approvals/SparkApprovals";
import SparkUsers from "./Users/SparkUsers";
import SparkLogo from "../../components/common/SparkLogo/sparklogo.png";

// ... (helpers)
const daysSince = (isoDate) =>
  Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));

const avgProgress = (courseActivity) => {
  if (!courseActivity?.length) return 0;
  return Math.round(courseActivity.reduce((s, c) => s + c.progress, 0) / courseActivity.length);
};

// ─────────────────────────────────────────────────────────────
// Top Bar  (fixed, full width)
// ─────────────────────────────────────────────────────────────
const TopBar = ({ onBurger, sidebarOpen, user }) => (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: TOPBAR_HEIGHT,
    background: "#fff",
    borderBottom: "2px solid #FF6B00",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 12,
    zIndex: 110,
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

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      {/* ... (user info) */}
      <span style={{ fontWeight: 700, fontSize: 15, color: "#FF6B00" }}>
        {user?.name?.split(" ")[0] || "Ian"}
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
);

const t = {
  burgerBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", flexDirection: "column", gap: 4
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

// ... (WelcomeScreen component)
const WelcomeScreen = ({ name, onDone }) => {
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
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 20, color: "#222"
                }}>
                  Notify Tenant Admin
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {tenant.name} — inactive for {daysSince(tenant.lastActive)} days
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
                fontSize: 13, fontFamily: "'Barlow', sans-serif",
                outline: "none", resize: "vertical",
                boxSizing: "border-box", color: "#333", marginBottom: 16
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={onClose} style={{
                background: "#f0f0f0", color: "#555",
                border: "none", borderRadius: 8, padding: "9px 18px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif"
              }}>
                Cancel
              </button>
              <button onClick={send} style={{
                background: "#FF6B00", color: "#fff",
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

// ... (TenantActivityCard component)
const TenantActivityCard = ({ tenant, onNotify }) => {
  const days = daysSince(tenant.lastActive);
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
                fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap"
              }}>
              🔔 Notify
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none", border: "1px solid #ddd", borderRadius: 6,
              padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "#888",
              fontFamily: "'Barlow', sans-serif"
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

const RECENT_SUBS = [
  { name: "Department of Education", since: "Feb. 25 2026", type: "Institute", bg: "#2980b9", abbr: "DepEd" },
  { name: "Eleksis Marketing Corp", since: "Jan. 10 2026", type: "Enterprise", bg: "#c0392b", abbr: "ELEKSIS" },
  { name: "De La Salle University", since: "Jan. 01 2026", type: "Institute", bg: "#27ae60", abbr: "DLSU" },
  { name: "Zoup Sales & Marketing", since: "Feb. 01 2026", type: "Personal", bg: "#8e44ad", abbr: "ZOUP" },
];

// ─────────────────────────────────────────────────────────────
// Dashboard Home
// ─────────────────────────────────────────────────────────────
// ── SVG icons matching the user dashboard style ───────────────
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

const DashboardHome = ({ onNavigate }) => {
  const [notifyTenant, setNotifyTenant] = useState(null);
  const inactiveCount = MOCK_TENANTS.filter((t) => daysSince(t.lastActive) >= 7).length;

  const STATS = [
    { key: "tenants", label: "Tenants", count: 24, sub: "+5 this week", iconKey: "tenants" },
    { key: "approvals", label: "Approvals", count: 8, sub: "+3 this week", iconKey: "approvals" },
    { key: "courses", label: "Courses", count: 61, sub: "4 new", iconKey: "courses" },
    { key: "tenants", label: "Subscriptions", count: 18, sub: "+3 this quarter", iconKey: "subscriptions" },
  ];

  return (
    <div style={{ padding: 20 }}>

      {/* ── Dashboard title ── */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 28, color: "#222", marginBottom: 20
      }}>
        Dashboard
      </div>

      {/* ── Stat cards — orange border on top ── */}
      <div className="sa-stat-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 24
      }}>
        {STATS.map((s, i) => (
          <div
            key={i}
            onClick={() => onNavigate(s.key)}
            style={d.statCard}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12), 0 3px 8px rgba(0,0,0,.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)";
            }}
          >
            <div style={{
              fontSize: 11, color: "#888", fontWeight: 500,
              textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8
            }}>
              {s.label}
            </div>
            <div style={{
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{
                  fontSize: 36, fontWeight: 700, color: "#222",
                  lineHeight: 1
                }}>
                  {s.count}
                </div>
                <div style={{
                  fontSize: 12, color: "#FF6B00", marginTop: 6,
                  fontWeight: 500
                }}>
                  ↑ {s.sub}
                </div>
              </div>
              <div style={d.statIconWrap}>
                {StatIcons[s.iconKey]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Inactive alert ── */}
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

      {/* ── Two-column layout: Activeness box | Right panels ── */}
      <div className="sa-main-grid" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 340px)",
        gap: 20, alignItems: "start"
      }}>

        {/* LEFT — Tenant Activeness contained in a white box */}
        <div style={d.panel}>
          <div style={d.panelTitle}>Tenant Activeness</div>
          <style>{`
            .tenant-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .tenant-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .tenant-scroll::-webkit-scrollbar-thumb {
              background: #e0e0e0;
              border-radius: 99px;
            }
            .tenant-scroll::-webkit-scrollbar-thumb:hover {
              background: #ccc;
            }

            /* ── Responsive breakpoints ── */
            @media (max-width: 1024px) {
              .sa-main-grid {
                grid-template-columns: 1fr !important;
              }
              .sa-right-col {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
              }
            }
            @media (max-width: 640px) {
              .sa-stat-grid {
                grid-template-columns: 1fr 1fr !important;
              }
              .sa-main-grid {
                grid-template-columns: 1fr !important;
              }
              .sa-right-col {
                display: grid !important;
                grid-template-columns: 1fr !important;
              }
            }
            @media (max-width: 400px) {
              .sa-stat-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          <div className="tenant-scroll"
            style={{ maxHeight: 520, overflowY: "auto", paddingRight: 6 }}>
            {MOCK_TENANTS.map((ten) => (
              <TenantActivityCard key={ten.id} tenant={ten} onNotify={setNotifyTenant} />
            ))}
          </div>
        </div>

        {/* RIGHT — Recent Subscriptions + System Updates */}
        <div className="sa-right-col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recent Subscriptions */}
          <div style={d.panel}>
            <div style={d.panelTitle}>Recent Subscriptions</div>
            {RECENT_SUBS.map((sub, i) => (
              <div key={sub.name} style={{
                ...d.subItem,
                borderBottom: i < RECENT_SUBS.length - 1
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
          </div>

          {/* System Updates */}
          <div style={d.panel}>
            <div style={d.panelTitle}>System Updates</div>
            {[
              { icon: "🆕", text: "New tenant registered: Build Hub PH", time: "2h ago", color: "#2980b9" },
              { icon: "✅", text: "Course approved: Sales Fundamentals", time: "5h ago", color: "#27ae60" },
              { icon: "⚠️", text: "Eleksis inactive for 10 days", time: "1d ago", color: "#c0392b" },
              { icon: "💳", text: "DLSU renewed Institute subscription", time: "2d ago", color: "#FF6B00" },
              { icon: "👤", text: "New admin role assigned at DepEd", time: "3d ago", color: "#8e44ad" },
            ].map((u, i, arr) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start",
                gap: 10, padding: "9px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none"
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: u.color + "18", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 15, flexShrink: 0
                }}>
                  {u.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{u.text}</div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{u.time}</div>
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
  // Stat card — shadow lifts it off the #f4f4f4 background
  statCard: {
    background: "#fff",
    borderRadius: 12,
    border: "none",
    borderTop: "3px solid #FF6B00",
    boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
    padding: "20px 22px",
    cursor: "pointer",
    transition: "transform .2s ease, box-shadow .2s ease",
  },
  statIconWrap: {
    width: 52, height: 52,
    background: "#FFF0E6",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
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

// ... (ComingSoon component)
const ComingSoon = ({ label }) => (
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

// ─────────────────────────────────────────────────────────────
// Main SADashboard
// ─────────────────────────────────────────────────────────────
const SADashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // Close mobile dropdown when a nav item is selected
  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener("sa-mobile-nav-close", handler);
    return () => window.removeEventListener("sa-mobile-nav-close", handler);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardHome onNavigate={setActivePage} />;
      case "tenants": return <SparkTenants sidebarOpen={sidebarOpen} />;
      case "approvals": return <SparkApprovals />;
      case "users": return <SparkUsers />;
      case "courses": return <ComingSoon label="courses" />;
      case "settings": return <ComingSoon label="settings" />;
      default: return <DashboardHome onNavigate={setActivePage} />;
    }
  };

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

      {/*
        Page content area:
        - marginTop pushes it below the fixed top bar
        - marginLeft shifts it right of the fixed sidebar (with smooth transition)
        - overflowY: auto makes only THIS area scroll — sidebar stays fixed
      */}
      <div className="sa-content-area" style={{
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


export default SADashboard;
