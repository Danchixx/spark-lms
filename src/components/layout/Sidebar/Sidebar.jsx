import { useEffect, useRef, useState } from "react";
import SparkLogo from "../../common/SparkLogo/sparklogo.png";

const NAV_ITEMS = [
  { section: "MAIN",   items: ["Dashboard", "Profile", "Courses", "Certificates"] },
  { section: "SYSTEM", items: ["Settings", "Contact"] },
];

const BREAKPOINT = 1024;

const Sidebar = ({ isOpen, activePage, onNavigate, user, onLogout, onClose }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;
  const overlayRef = useRef(null);
  // visible controls whether the overlay DOM is mounted
  // animate controls the translateX/opacity transition
  const [visible, setVisible] = useState(isOpen);
  const [animate, setAnimate] = useState(isOpen);

  // When isOpen changes, handle mount/unmount with transition
  useEffect(() => {
    if (isOpen) {
      setVisible(true);           // mount DOM first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true)); // then animate in
      });
    } else {
      setAnimate(false);          // animate out
      const t = setTimeout(() => setVisible(false), 300); // then unmount
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll when overlay open
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

  /* ── Shared inner content ── */
  const navContent = (
    <>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid #333" }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center" }}>
          <span style={{ color: "white", fontWeight: 600, fontSize: 30, letterSpacing: 3, fontFamily: "'Sora', sans-serif" }}>SPARK</span>
          <span style={{ color: "#9e9e9e", fontFamily: "'Open Sans Regular', sans-serif", fontSize: 6.4, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 1 }}>YES TO LEARNING AND DEVELOPMENT</span>
        </div>
        <img src={SparkLogo} alt="Spark Logo" style={{ height: 48, width: "auto" }} />
      </div>

      <div style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((group) => (
          <div key={group.section} style={{ marginBottom: 24 }}>
            <div style={{ padding: "0 20px", fontSize: 10, color: "#666", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>{group.section}</div>
            {group.items.map((item) => (
              <div key={item} onClick={() => handleNavigate(item)} style={{
                padding: "11px 20px", color: activePage === item ? "white" : "#aaa",
                cursor: "pointer", fontSize: 14, fontWeight: activePage === item ? 700 : 400,
                borderLeft: activePage === item ? "3px solid #FF6B00" : "3px solid transparent",
                background: activePage === item ? "#2a2a2a" : "transparent",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}>{item}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid #333", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: user.company.color + "22",
          border: `2px solid ${user.company.color}`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 10, fontWeight: 900, color: user.company.color,
          flexShrink: 0, overflow: "hidden",
        }}>
          {typeof user.company.logo === "string" && user.company.logo.startsWith("/")
            ? <img src={user.company.logo} alt={user.company.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
            : user.company.logo}
        </div>
        <button onClick={onLogout} style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 1, fontFamily: "inherit" }}>LOGOUT</button>
      </div>
    </>
  );

  /* ── Desktop: smooth width push ── */
  if (typeof window !== "undefined" && window.innerWidth > BREAKPOINT) {
    return (
      <div style={{ width: isOpen ? 210 : 0, flexShrink: 0, overflow: "hidden", transition: "width 0.3s ease" }}>
        <div style={{ width: 210, height: "100%", background: "#1e1e1e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {navContent}
        </div>
      </div>
    );
  }

  /* ── Mobile/Tablet: slide-in overlay drawer ── */
  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 100, display: "flex",
        background: animate ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{
        width: 210, height: "100%",
        background: "#1e1e1e",
        display: "flex", flexDirection: "column", flexShrink: 0,
        boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
        transform: animate ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        {navContent}
      </div>
    </div>
  );
};

export default Sidebar;