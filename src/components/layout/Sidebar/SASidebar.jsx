// src/components/layout/Sidebar/SASidebar.jsx
// - Desktop: fixed sidebar toggled by the topbar burger
// - Mobile (≤768px): topbar burger opens an animated slide-down dropdown

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import SparkLogo from "../../common/SparkLogo/sparklogo.png";
import LogoutModal from "../../common/Modal/LogoutModal";

const NAV = {
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
    { key: "contact", label: "Contact" },
  ],
};

const icons = {
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
  contact: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
};

export const SIDEBAR_WIDTH = 220;
export const TOPBAR_HEIGHT = 70;

// ── Nav item — smooth active transition ───────────────────────
const NavItem = ({ item, isActive, onClick, showSidebarIcons }) => {
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
        gap: showSidebarIcons ? 12 : 0,
        padding: isActive ? "11px 20px 11px 17px" : "11px 20px",
        cursor: "pointer",
        fontSize: 14.5,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--accent-text, #d84e04)" : hovered ? "var(--text, #0f172a)" : "var(--muted, #475569)",
        background: isActive ? "var(--accent-soft, rgba(240,90,10,0.10))" : hovered ? "var(--card-2, #f6f8fc)" : "transparent",
        borderLeft: isActive ? "3px solid var(--accent, #f05a0a)" : "3px solid transparent",
        transition: "background 0.2s cubic-bezier(.4,0,.2,1), color 0.2s cubic-bezier(.4,0,.2,1), border-color 0.2s ease",
        whiteSpace: "nowrap",
        userSelect: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {showSidebarIcons && (
        <span style={{
          color: isActive ? "var(--accent-text, #d84e04)" : hovered ? "var(--text, #0f172a)" : "var(--muted, #475569)",
          flexShrink: 0,
          transition: "color 0.2s ease",
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
const SectionLabel = ({ label }) => (
  <div style={{
    fontSize: 10,
    fontWeight: 700,
    color: "var(--faint, #64748b)",
    letterSpacing: ".18em",
    textTransform: "uppercase",
    padding: "12px 20px 6px",
    whiteSpace: "nowrap",
  }}>
    {label}
  </div>
);


// ── Nav content (shared between desktop + mobile) ─────────────
const NavContent = ({ activePage, showSidebarIcons, onItemClick }) => (
  <>
    {Object.entries(NAV).map(([section, items]) => (
      <div key={section} style={{ marginBottom: 6 }}>
        <SectionLabel label={section} />
        {items.map((item) => (
          <NavItem
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
const MobileDropdown = ({ open, activePage, onClose, user }) => {
  const { showSidebarIcons } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setAnimating(true);
    } else if (visible) {
      setAnimating(false);
      closeTimer.current = setTimeout(() => setVisible(false), 320);
    }
    return () => clearTimeout(closeTimer.current);
  }, [open]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.55)",
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
        background: "var(--bg-side, #ffffff)",
        zIndex: 150,
        boxShadow: "var(--shadow, 0 8px 32px rgba(0,0,0,.15))",
        overflowY: "auto",
        maxHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        transform: animating ? "translateY(0)" : "translateY(-12px)",
        opacity: animating ? 1 : 0,
        transition: "transform 0.32s cubic-bezier(.4,0,.2,1), opacity 0.32s cubic-bezier(.4,0,.2,1)",
        borderBottom: "1px solid var(--line, #e2e8f0)",
      }}>

        {/* Header row with × close button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--line, #e2e8f0)",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "var(--faint, #64748b)",
            letterSpacing: ".15em", textTransform: "uppercase",
          }}>
            Navigation
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: "none",
              border: "1.5px solid var(--line, #e2e8f0)",
              borderRadius: "50%",
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted, #475569)",
              fontSize: 16,
              lineHeight: 1,
              transition: "background 0.2s, border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--accent-soft, rgba(240,90,10,0.10))";
              e.currentTarget.style.borderColor = "var(--accent, #f05a0a)";
              e.currentTarget.style.color = "var(--accent, #f05a0a)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "var(--line, #e2e8f0)";
              e.currentTarget.style.color = "var(--muted, #475569)";
            }}
          >
            ×
          </button>
        </div>

        {/* Nav items */}
        <NavContent
          activePage={activePage}
          onItemClick={onClose}
          showSidebarIcons={showSidebarIcons}
        />

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--line, #e2e8f0)" }}>
          <div style={{
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "#ffffff",
              border: "1.5px solid var(--line, #e2e8f0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, overflow: "hidden"
            }}>
              <img src={SparkLogo} alt="Spark Logo" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
            </div>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("sa-open-logout"))}
              style={{
                background: "#ff0000", color: "white", padding: "8px 16px",
                fontSize: 11, borderRadius: 20, flex: 1, border: "none", cursor: "pointer",
                fontWeight: 700, letterSpacing: 1
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main SASidebar ────────────────────────────────────────────
const SASidebar = ({ open, activePage, onNavigate, user }) => {
  const { showSidebarIcons } = useTheme();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleOpenLogout = () => setShowLogoutModal(true);
    window.addEventListener("sa-open-logout", handleOpenLogout);
    return () => window.removeEventListener("sa-open-logout", handleOpenLogout);
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

      {/* ── DESKTOP: fixed sidebar with smooth width transition ── */}
      <aside
        className="sa-sidebar-desktop-aside"
        style={{
          position: "fixed",
          top: TOPBAR_HEIGHT,
          left: 0,
          bottom: 0,
          width: open ? SIDEBAR_WIDTH : 0,
          background: "var(--bg-side, #ffffff)",
          borderRight: "1px solid var(--line, #e2e8f0)",
          overflow: "hidden",
          transition: `width 0.3s cubic-bezier(.4,0,.2,1), border-color 0.3s ease, background 0.2s ease`,
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
          borderTop: "1px solid var(--line, #e2e8f0)",
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
          opacity: open ? 1 : 0,
          transition: "opacity 0.2s ease",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          {/* Spark Logo Circle */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "#ffffff",
            border: "1.5px solid var(--line, #e2e8f0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden"
          }}>
            <img src={SparkLogo} alt="Spark Logo" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              background: "#ff0000", color: "white", padding: "8px 16px",
              fontSize: 11, borderRadius: 20, flex: 1, border: "none", cursor: "pointer",
              fontWeight: 700, letterSpacing: 1
            }}
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Spacer — smoothly shifts content area */}
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
          onNavigate={onNavigate}
          onClose={() => window.dispatchEvent(new CustomEvent("sa-mobile-nav-close"))}
          user={user}
        />
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />
    </>
  );
};

export default SASidebar;