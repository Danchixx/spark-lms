// src/components/layout/Sidebar/SASidebar.tsx
// - Desktop: fixed sidebar toggled by the topbar burger
// - Mobile (≤768px): topbar burger opens an animated slide-down dropdown

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import type { AppUser } from "../../../types";

// ── Types ─────────────────────────────────────────────────────
type NavKey = "dashboard" | "tenants" | "approvals" | "users" | "courses" | "settings";

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
  system: [
    { key: "settings", label: "Settings" },
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
};

export const SIDEBAR_WIDTH = 220;
export const TOPBAR_HEIGHT = 70;

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
        fontSize: 15,
        fontWeight: 500,
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
  }}>
    {label}
  </div>
);

// ── User chip ─────────────────────────────────────────────────
const UserChip = ({ user }: UserChipProps) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    background: "#FFF0E6",
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: "linear-gradient(135deg, #FF8C00, #c0392b)",
      display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 16, flexShrink: 0,
    }}>
      🔥
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#333", whiteSpace: "nowrap" }}>
        {user?.name || "Spark Admin"}
      </div>
      <div style={{
        fontSize: 10, color: "#FF6B00", fontWeight: 700,
        letterSpacing: ".1em", textTransform: "uppercase"
      }}>
        Super Admin
      </div>
    </div>
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
const MobileDropdown = ({ open, activePage, onClose, user }: MobileDropdownProps) => {
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
          <UserChip user={user} />
        </div>
      </div>
    </>
  );
};

// ── Main SASidebar ────────────────────────────────────────────
const SASidebar = ({ open, activePage, onNavigate, user }: SASidebarProps) => {
  const { showSidebarIcons } = useTheme();
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
          top: TOPBAR_HEIGHT,
          left: 0,
          bottom: 0,
          width: open ? SIDEBAR_WIDTH : 0,
          background: "#fff",
          borderRight: "1px solid #eee",
          overflow: "hidden",
          transition: `width 0.3s cubic-bezier(.4,0,.2,1), border-color 0.3s ease`,
          zIndex: 100,
        }}
      >
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
          <UserChip user={user} />
        </div>
      </aside>

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
        />
      </div>
    </>
  );
};

export default SASidebar;
