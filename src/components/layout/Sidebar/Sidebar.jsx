import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SparkLogo from "../../common/SparkLogo/sparklogo.png";
import LogoutModal from "../../common/Modal/LogoutModal";
import { useAuth } from "../../../context/AuthContext";

const NAV_ITEMS = [
  { section: "MAIN", items: ["Dashboard", "Profile", "Courses", "Certificates"] },
  { section: "SYSTEM", items: ["Settings", "Contact"] },
];

const BREAKPOINT = 1024;

const Sidebar = ({ isOpen, activePage, onNavigate, user, onLogout, onClose }) => {
  const { company } = useAuth();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;
  const overlayRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const navigate = useNavigate();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  const [visible, setVisible] = useState(isOpen);
  const [animate, setAnimate] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    } else {
      setAnimate(false);
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, isMobile]);

  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const handleNavigate = (item) => {
    onNavigate(item);
    if (window.innerWidth <= BREAKPOINT) onClose?.();
  };

  const filteredNav = search.trim()
    ? NAV_ITEMS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(group => group.items.length > 0)
    : NAV_ITEMS;

  const navContent = (isMobileMode = false) => (
    <>
      <style>{`
        @keyframes activeSweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0);     }
        }
        .nav-item {
          padding: 11px 20px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 3px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease, padding-left 0.2s ease;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          isolation: isolate;
        }
        /* Sweep bg — always behind text via z-index: -1 */
        .nav-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.07);
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
          pointer-events: none;
        }
        .nav-item:hover::before { transform: translateX(0); }
        .nav-item:hover { padding-left: 24px; }
        /* Active state */
        .nav-item--active {
          color: white !important;
          font-weight: 700;
          border-left: 3px solid #FF6B00 !important;
          padding-left: 24px;
        }
        .nav-item--active,
        .nav-item--active * { color: white !important; }
        /* Active sweep: orange bg, still behind text */
        .nav-item--active::before {
          background: rgba(255,107,0,0.15);
          animation: activeSweep 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .logout-btn {
          border: none;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 1px;
          font-family: inherit;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231,76,60,0.4);
        }
        .logout-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
        .company-avatar {
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          cursor: pointer;
        }
        .company-avatar:hover {
          transform: scale(1.08);
          opacity: 0.85;
        }
        .search-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.15);
          border-radius: 30px;
          padding: 10px 16px;
          gap: 8px;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .search-input-wrap:focus-within {
          background: rgba(255,255,255,0.22);
          box-shadow: 0 0 0 2px rgba(255,107,0,0.35);
        }
      `}</style>

      {/* Logo Header — desktop only */}
      {!isMobileMode && (
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid #333" }}>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
            <span style={{ color: "white", fontWeight: 600, fontSize: 30, letterSpacing: 3, fontFamily: "'Sora', sans-serif" }}>SPARK</span>
            <span style={{ color: "#9e9e9e", fontFamily: "'Open Sans Regular', sans-serif", fontSize: 6.4, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 1 }}>YES TO LEARNING AND DEVELOPMENT</span>
          </div>
          <img src={SparkLogo} alt="Spark Logo" style={{ height: 48, width: "auto" }} />
        </div>
      )}

      {/* Search — mobile only */}
      {isMobileMode && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, width: "100%", fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}

      {/* Nav Items */}
      <div style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {filteredNav.map((group) => (
          <div key={group.section} style={{ marginBottom: 24 }}>
            <div style={{
              padding: "0 20px", fontSize: 10,
              color: isMobileMode ? "rgba(255,255,255,0.4)" : "#555",
              letterSpacing: 1.5, marginBottom: 8, fontWeight: 700,
              textTransform: "uppercase",
            }}>
              {group.section}
            </div>
            {group.items.map((item) => (
              <div
                key={item}
                className={`nav-item${activePage === item ? " nav-item--active" : ""}`}
                onClick={() => handleNavigate(item)}
                style={{
                  color: activePage === item ? "white" : isMobileMode ? "rgba(255,255,255,0.75)" : "#aaa",
                  fontWeight: activePage === item ? 700 : 400,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      {isMobileMode ? (
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Company logo — left */}
          {/*}
          <div style={{...}}>...</div> */}

          {/* Logout */}
          <button
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
            style={{ background: "#e74c3c", color: "white", padding: "8px 24px", fontSize: 13 }}
          >
            Logout
          </button>

          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 7, textTransform: "uppercase", whiteSpace: "nowrap", letterSpacing: 2 }}>POWERED BY</span>

          {/* Spark logo — right */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: 2, fontFamily: "'Sora', sans-serif" }}>SPARK</span>
              <img src={SparkLogo} alt="Spark Logo" style={{ height: 32, width: "auto" }} />
            </div>
          </div>
        </div>
      ) : (
        /* Desktop footer */
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Company avatar — clicks to Settings */}
          <div
            className="company-avatar"
            onClick={() => navigate(`/${slug}/settings`)}
            title="View Company Profile"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "transparent",
              border: "1.5px solid #e0e0e0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 900, color: company?.color || "#FF6B00",
              flexShrink: 0, overflow: "hidden",
            }}
          >
            {typeof company?.logo_url === "string" && company.logo_url.startsWith("http")
              ? <img src={company.logo_url} alt={company?.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
              : company?.logo_url || company?.name?.substring(0, 2).toUpperCase()}
          </div>

          <button
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
            style={{ background: "#e74c3c", color: "white", padding: "6px 14px", fontSize: 12 }}
          >
            LOGOUT
          </button>
        </div>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
      />
    </>
  );

  /* ── Desktop: smooth width push sidebar ── */
  if (typeof window !== "undefined" && window.innerWidth > BREAKPOINT) {
    return (
      <div style={{ width: isOpen ? 210 : 0, flexShrink: 0, overflow: "hidden", transition: "width 0.3s ease" }}>
        <div style={{ width: 210, height: "100%", background: "#1e1e1e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {navContent(false)}
        </div>
      </div>
    );
  }

  /* ── Mobile/Tablet: slide-down dropdown from top ── */
  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        top: 60,
        background: animate ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
        transition: "background 0.35s ease",
        overflow: "hidden",
      }}
    >
      <div style={{
        width: "100%",
        background: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        maxHeight: animate ? "80vh" : "0px",
        overflow: "hidden",
        transition: "max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
        }}>
          {navContent(true)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;