import { useNavigate } from "react-router-dom";

// Fixed sidebar for all SuperAdmin pages.
// ... (NAV and icons constants)

const NAV = {
  overview: [
    { key: "dashboard", label: "Dashboard" },
  ],
  management: [
    { key: "tenants",   label: "Tenants"   },
    { key: "approvals", label: "Approvals" },
    { key: "users",     label: "Users"     },
    { key: "courses",   label: "Courses"   },
  ],
  system: [
    { key: "settings",  label: "Settings"  },
  ],
};

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  tenants: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  approvals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
};

// Width of the sidebar — exported so the main layout can offset its content
export const SIDEBAR_WIDTH = 220;
export const TOPBAR_HEIGHT = 52;

const SASidebar = ({ open, activePage, user }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Fixed sidebar */}
      <aside style={{
        position: "fixed",
        top: TOPBAR_HEIGHT,
        left: 0,
        bottom: 0,
        width: open ? SIDEBAR_WIDTH : 0,
        background: "#fff",
        borderRight: open ? "1px solid #eee" : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width .25s ease",
        zIndex: 100,
      }}>
        {/* Nav items */}
        <nav style={{ flex: 1, padding: "16px 0", minWidth: SIDEBAR_WIDTH, overflowY: "auto" }}>
          {Object.entries(NAV).map(([section, items]) => (
            <div key={section} style={{ padding: "0 14px", marginBottom: 8 }}>
              {/* Section label — small, muted */}
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#bbb",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                padding: "8px 10px 4px",
                whiteSpace: "nowrap",
              }}>
                {section}
              </div>

              {/* Nav items — larger text */}
              {items.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => navigate(`/superadmin/${item.key}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 15,
                      color: isActive ? "#FF6B00" : "#868686",
                      background: isActive ? "#FFF0E6" : "transparent",
                      transition: "background .15s, color .15s",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    <span style={{ color: isActive ? "#FF6B00" : "#888", flexShrink: 0 }}>
                      {icons[item.key]}
                    </span>
                    {item.label}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User chip at the bottom */}
        <div style={{
          padding: "12px 14px",
          borderTop: "1px solid #eee",
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#FFF0E6",
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF8C00, #c0392b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}>
              🔥
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333", whiteSpace: "nowrap" }}>
                {user?.name || "Ian Palabrica"}
              </div>
              <div style={{
                fontSize: 10,
                color: "#FF6B00",
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}>
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Invisible spacer */}
      <div style={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        transition: "width .25s ease",
      }} />
    </>
  );
};

export default SASidebar;
