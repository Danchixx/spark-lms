// src/components/layout/Sidebar/SASidebar.tsx
// - Desktop: fixed sidebar toggled by the topbar burger
// - Mobile (≤768px): topbar burger opens an animated slide-down dropdown

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import type { AppUser } from "../../../types";
import LogoutModal from "../../common/Modal/LogoutModal";

// ── Types ─────────────────────────────────────────────────────
type NavKey = "dashboard" | "tenants" | "approvals" | "users" | "courses" | "settings" | "register" | "announcement" | "export" | "support" | "logs";

interface NavItem {
  key: NavKey;
  label: string;
}

interface NavSection {
  [section: string]: NavItem[];
}

interface SASidebarProps {
  open: boolean;
  activePage: string;
  onNavigate?: (key: string) => void;
  user?: AppUser | null;
  onLogout: () => void;
}

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  showSidebarIcons: boolean;
}

interface MobileDropdownProps {
  open: boolean;
  activePage: string;
  onClose: () => void;
  user?: AppUser | null;
  onLogout: () => void;
}

interface NavContentProps {
  activePage: string;
  showSidebarIcons: boolean;
  onItemClick?: (key: string) => void;
}

interface UserChipProps {
  user?: AppUser | null;
}

// ── Constants ─────────────────────────────────────────────────
const NAV: NavSection = {
  overview: [
    { key: "dashboard", label: "Dashboard" },
  ],
  management: [
    { key: "tenants", label: "Tenants" },
    { key: "approvals", label: "Approvals" },
    { key: "users", label: "Users" },
    { key: "courses", label: "Courses" },
  ],
  actions: [
    { key: "register" as any, label: "Register Tenant" },
    { key: "announcement" as any, label: "Announcement" },
    { key: "export" as any, label: "Data Export" },
    { key: "support" as any, label: "Support" },
  ],
  system: [
    { key: "settings", label: "Settings" },
    { key: "logs", label: "System Logs" },
  ],
};

const icons: Record<NavKey, React.ReactElement> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  tenants: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  approvals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  register: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  announcement: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  export: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  support: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  logs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  ),
};

export const SIDEBAR_WIDTH = 220;
export const TOPBAR_HEIGHT = 70;

import SparkLogo from "../../../components/common/SparkLogo/sparklogo.png";

// ── Nav item — smooth active transition ───────────────────────
const NavItemComponent = ({ item, isActive, onClick, showSidebarIcons }: NavItemProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => {
        if (onClick) onClick();
        navigate("/superadmin/" + item.key);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: showSidebarIcons ? 10 : 0,
        padding: "11px 20px",
        cursor: "pointer",
        fontSize: 17,
        fontWeight: isActive ? 600 : 100,
        fontFamily: "'Inter', sans-serif",
        color: isActive ? "#FF6B00" : hovered ? "#FF6B00" : "#444",
        background: isActive ? "#FFF0E6" : hovered ? "#FFF8F3" : "transparent",
        transition: "background 0.25s cubic-bezier(.4,0,.2,1), color 0.25s cubic-bezier(.4,0,.2,1)",
        whiteSpace: "nowrap",
        userSelect: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {showSidebarIcons && (
        <span style={{
          color: isActive ? "#FF6B00" : hovered ? "#FF6B00" : "#888",
          flexShrink: 0,
          transition: "color 0.25s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20
        }}>
          {icons[item.key]}
        </span>
      )}
      {item.label}
    </div>
  );
};

// ── Section label ─────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
  <div style={{
    fontSize: 10,
    fontWeight: 700,
    color: "#bbb",
    letterSpacing: ".18em",
    textTransform: "uppercase",
    padding: "10px 20px 4px",
    whiteSpace: "nowrap",
    fontFamily: "'Inter', sans-serif",
  }}>
    {label}
  </div>
);

// ── Logout Footer ─────────────────────────────────────────────
const LogoutFooter = ({ onLogoutClick }: { onLogoutClick: () => void }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    background: "#fff",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "#FFF0E6",
      display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      border: "1.5px solid #FFE0CC",
    }}>
      <img src={SparkLogo} alt="Spark" style={{ width: 22, height: "auto" }} />
    </div>
    <button
      onClick={onLogoutClick}
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #FF3D00, #FF6B00)",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "10px 0",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        letterSpacing: ".08em",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 12px rgba(255,61,0,0.2)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 16px rgba(255,61,0,0.3)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(255,61,0,0.2)";
      }}
    >
      LOGOUT
    </button>
  </div>
);

// ── Nav content (shared between desktop + mobile) ─────────────
const NavContent = ({ activePage, showSidebarIcons, onItemClick }: NavContentProps) => (
  <>
    {Object.entries(NAV).map(([section, items]) => (
      <div key={section} style={{ marginBottom: 4 }}>
        <SectionLabel label={section} />
        {items.map((item) => (
          <NavItemComponent
            key={item.key}
            item={item}
            isActive={activePage === item.key}
            onClick={() => onItemClick && onItemClick(item.key)}
            showSidebarIcons={showSidebarIcons}
          />
        ))}
      </div>
    ))}
  </>
);

// ── Animated mobile dropdown ──────────────────────────────────
const MobileDropdown = ({ open, activePage, onClose, user, onLogout }: MobileDropdownProps) => {
  const { showSidebarIcons } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setAnimating(true);
    } else if (visible) {
      setAnimating(false);
      closeTimer.current = setTimeout(() => setVisible(false), 320);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.35)",
          zIndex: 149,
          opacity: animating ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Dropdown panel */}
      <div style={{
        position: "fixed",
        top: TOPBAR_HEIGHT,
        left: 0,
        right: 0,
        background: "#fff",
        zIndex: 150,
        boxShadow: "0 8px 32px rgba(0,0,0,.15)",
        overflowY: "auto",
        maxHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        transform: animating ? "translateY(0)" : "translateY(-12px)",
        opacity: animating ? 1 : 0,
        transition: "transform 0.32s cubic-bezier(.4,0,.2,1), opacity 0.32s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#aaa",
            letterSpacing: ".15em", textTransform: "uppercase",
          }}>
            Navigation
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1.5px solid #ddd",
              borderRadius: "50%",
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "#888",
              fontSize: 16,
              lineHeight: 1,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FFF0E6";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B00";
              (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#ddd";
              (e.currentTarget as HTMLButtonElement).style.color = "#888";
            }}
          >
            ×
          </button>
        </div>

        <NavContent
          activePage={activePage}
          onItemClick={onClose}
          showSidebarIcons={showSidebarIcons}
        />

        <div style={{ borderTop: "1px solid #eee" }}>
          <LogoutFooter onLogoutClick={() => window.dispatchEvent(new CustomEvent("sa-logout-open"))} />
        </div>
      </div>
    </>
  );
};

// ── Main SASidebar ────────────────────────────────────────────
const SASidebar = ({ open, activePage, onNavigate, user, onLogout }: SASidebarProps) => {
  const { showSidebarIcons } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handler = () => setShowLogoutModal(true);
    window.addEventListener("sa-logout-open", handler);
    return () => window.removeEventListener("sa-logout-open", handler);
  }, []);
  return (
    <>
      <style>{`
        .sa-sidebar-desktop-aside {
          display: flex;
          flex-direction: column;
        }
        .sa-sidebar-spacer {
          display: block;
        }
        .sa-sidebar-mobile-wrap {
          display: none;
        }

        @media (max-width: 768px) {
          .sa-sidebar-desktop-aside {
            display: none !important;
          }
          .sa-sidebar-spacer {
            display: none !important;
          }
          .sa-sidebar-mobile-wrap {
            display: block;
          }
        }
      `}</style>

      {/* ── DESKTOP: fixed sidebar ── */}
      <aside
        className="sa-sidebar-desktop-aside"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: open ? SIDEBAR_WIDTH : 0,
          background: "#fff",
          borderRight: "1px solid #e0e0e0",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.06)" : "none",
          overflow: "hidden",
          transition: `width 0.3s cubic-bezier(.4,0,.2,1), border-color 0.3s ease`,
          zIndex: 120,
        }}
      >
        <div style={{ height: TOPBAR_HEIGHT, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "5px 18px 0 18px", borderBottom: "1px solid #d4d4d4ff", minWidth: SIDEBAR_WIDTH, opacity: open ? 1 : 0, transition: "opacity 0.2s ease" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center", marginRight: 0 }}>
            <span style={{ color: "#222", fontWeight: 750, fontSize: 34, letterSpacing: 2, fontFamily: "'Sora', sans-serif" }}>SPARK</span>
            <span style={{ color: "#888", fontFamily: "'Open Sans', sans-serif", fontSize: 7, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 1 }}>YES TO LEARNING & DEVELOPMENT</span>
          </div>
          <img src={SparkLogo} alt="Spark Logo" style={{ height: 70, width: "auto", paddingBottom: 12 }} />
        </div>
        <nav style={{
          flex: 1,
          paddingTop: 8,
          minWidth: SIDEBAR_WIDTH,
          overflowY: "auto",
          opacity: open ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}>
          <NavContent activePage={activePage} showSidebarIcons={showSidebarIcons} />
        </nav>
        <div style={{
          borderTop: "1px solid #eee",
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
          opacity: open ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}>
          <LogoutFooter onLogoutClick={() => setShowLogoutModal(true)} />
        </div>
      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout();
        }}
      />

      {/* Spacer */}
      <div
        className="sa-sidebar-spacer"
        style={{
          width: open ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      />

      {/* ── MOBILE: animated dropdown ── */}
      <div className="sa-sidebar-mobile-wrap">
        <MobileDropdown
          open={open}
          activePage={activePage}
          onClose={() => window.dispatchEvent(new CustomEvent("sa-mobile-nav-close"))}
          user={user}
          onLogout={onLogout}
        />
      </div>
    </>
  );
};

export default SASidebar;
