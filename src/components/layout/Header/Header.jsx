import { Squash as Hamburger } from "hamburger-react";
import { Bell, User } from "lucide-react";

const BREAKPOINT = 1024;

const Header = ({
  user,
  onToggleSidebar,
  isOpen,
  searchPlaceholder = "Search ...",
  role = "User",
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;

  return (
    <div style={{
      background: "white",
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      zIndex: 10,
      flexShrink: 0,
      position: "relative",
    }}>

      {/* Burger — Squash animation on mobile, plain button on desktop */}
      {isMobile ? (
        <Hamburger
          toggled={isOpen}
          toggle={onToggleSidebar}
          size={20}
          color="#555"
          duration={0.4}
          label="Toggle menu"
        />
      ) : (
        <button
          onClick={onToggleSidebar}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#555", display: "flex", alignItems: "center",
            justifyContent: "center", width: 36, height: 36,
            borderRadius: 8, transition: "background 0.2s ease, color 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.color = "#FF6B00"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#555"; }}
          aria-label="Toggle menu"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 20 }}>
            <div style={{ height: 2, background: "currentColor", borderRadius: 2 }} />
            <div style={{ height: 2, background: "currentColor", borderRadius: 2 }} />
            <div style={{ height: 2, background: "currentColor", borderRadius: 2 }} />
          </div>
        </button>
      )}

      {/* Company name — mobile only, centered */}
      {isMobile && (
        <span style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: 700,
          fontSize: 16,
          color: "#1a1a1a",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          {user?.company?.name ?? "Spark LMS"}
        </span>
      )}

      {/* Search — desktop only */}
      {!isMobile && (
        <div style={{
          flex: 1, maxWidth: 380,
          display: "flex", alignItems: "center",
          background: "#f4f4f4", borderRadius: 8,
          padding: "8px 14px", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder={searchPlaceholder}
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", color: "#333" }}
          />
        </div>
      )}

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>

        {/* Bell */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", cursor: "pointer" }}>
          <Bell size={22} color="#555" />
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#FF6B00", color: "white",
            fontSize: 9, fontWeight: 900,
            borderRadius: "50%", width: 14, height: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>1</span>
        </div>

        {/* Avatar + name — desktop */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} color="#888" />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</span>
          </div>
        )}

        {/* Avatar only — mobile */}
        {isMobile && (
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} color="#888" />
          </div>
        )}

        {/* Role badge — desktop */}
        {!isMobile && (
          <span style={{ background: "#FF6B00", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
            {role}
          </span>
        )}
      </div>
    </div>
  );
};

export default Header;