import { useEffect, useRef, useState } from "react";
import SparkLogo from "../../common/SparkLogo/sparklogo.png";
import LogoutModal from "../../common/Modal/LogoutModal";

const NAV_ITEMS = [
  { section: "MAIN", items: ["Dashboard", "Profile", "Courses", "Certificates"] },
  { section: "SYSTEM", items: ["Settings", "Contact"] },
];

const BREAKPOINT = 1024;

const Sidebar = ({ isOpen, activePage, onNavigate, user, onLogout, onClose }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;
  const overlayRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");

  // For desktop: visible controls width push
  // For mobile: controls dropdown slide-down
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

  // Lock body scroll when mobile dropdown open
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

  // Filter nav items by search
  const filteredNav = search.trim()
    ? NAV_ITEMS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(group => group.items.length > 0)
    : NAV_ITEMS;

  /* ── Shared inner nav content ── */
  const navContent = (isMobileMode = false) => (
    <>
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
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.15)", borderRadius: 30, padding: "10px 16px", gap: 8 }}>
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
            {!isMobileMode && (
              <div style={{ padding: "0 20px", fontSize: 10, color: "#666", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>
                {group.section}
              </div>
            )}
            {isMobileMode && (
              <div style={{ padding: "0 20px", fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>
                {group.section}
              </div>
            )}
            {group.items.map((item) => (
              <div
                key={item}
                onClick={() => handleNavigate(item)}
                style={{
                  padding: "12px 20px",
                  color: activePage === item ? "white" : isMobileMode ? "rgba(255,255,255,0.85)" : "#aaa",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: activePage === item ? 700 : 400,
                  borderLeft: activePage === item
                    ? "3px solid #FF6B00"
                    : "3px solid transparent",
                  background: activePage === item ? "rgba(255,255,255,0.1)" : "transparent",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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
        /* Mobile footer: logout left, powered by center, spark logo right */
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Company logo — left */}
          {/*}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: user.company.color + "22",
            border: `2px solid ${user.company.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, color: user.company.color,
            flexShrink: 0, overflow: "hidden",
          }}>
            {typeof user.company.logo === "string" && user.company.logo.startsWith("/")
              ? <img src={user.company.logo} alt={user.company.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
              : user.company.logo}
          </div> */}

          {/* Logout — center */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: 6, padding: "8px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1, fontFamily: "inherit" }}
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
            {/*<span style={{ color: "rgba(255,255,255,0.4)", fontSize: 5.5, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 2 }}>YES TO LEARNING AND DEVELOPMENT</span>*/}
          </div>
        </div>
      ) : (
        /* Desktop footer: company logo + logout */
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: user.company.color + "22",
            border: `2px solid ${user.company.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, color: user.company.color,
            flexShrink: 0, overflow: "hidden",
          }}>
            {typeof user.company.logo === "string" && user.company.logo.startsWith("/")
              ? <img src={user.company.logo} alt={user.company.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
              : user.company.logo}
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 1, fontFamily: "inherit" }}
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
        // maxHeight instead of translateY — always grows downward, never slides up
        maxHeight: animate ? "80vh" : "0px",
        overflow: "hidden",
        transition: "max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Inner wrapper: fade + subtle downward reveal of content */}
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