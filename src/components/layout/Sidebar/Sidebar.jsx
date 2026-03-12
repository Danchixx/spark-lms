import SparkLogo from "../../common/SparkLogo/sparklogo.png";
const NAV_ITEMS = [
  { section: "MAIN", items: ["Dashboard", "Profile", "Courses", "Certificates"] },
  { section: "SYSTEM", items: ["Settings", "Contact"] },
];

const Sidebar = ({ isOpen, activePage, onNavigate, user, onLogout }) => (
  <div
    style={{
      width: isOpen ? 210 : 0,
      background: "#1e1e1e",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    {/* Logo area */}
    <div style={{
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #333",
    }}>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, alignItems: "center"}}>
        <span style={{
          color: "white",
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 3,
          fontFamily: "'Sora', sans-serif",
        }}>
          SPARK
        </span>
        <span style={{
          color: "#9e9e9e",
          fontFamily: "'Open Sans Regular', sans-serif",
          fontSize: 6.4,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          marginTop: 1,
        }}>
          YES TO LEARNING AND DEVELOPMENT
        </span>
      </div>
          {/* SparkLogo image - flame only, no bg */}
      <img src={SparkLogo} alt="Spark Logo" style={{ height: 48, width: "auto" }} />
    </div>

    {/* Nav Items */}
    <div style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
      {NAV_ITEMS.map((group) => (
        <div key={group.section} style={{ marginBottom: 24 }}>
          <div style={{
            padding: "0 20px",
            fontSize: 10,
            color: "#666",
            letterSpacing: 1.5,
            marginBottom: 8,
            fontWeight: 700,
          }}>
            {group.section}
          </div>
          {group.items.map((item) => (
            <div
              key={item}
              onClick={() => onNavigate(item)}
              style={{
                padding: "11px 20px",
                color: activePage === item ? "white" : "#aaa",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activePage === item ? 700 : 400,
                borderLeft: activePage === item ? "3px solid #FF6B00" : "3px solid transparent",
                background: activePage === item ? "#2a2a2a" : "transparent",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>

    {/* Bottom: Company badge + Logout */}
    <div style={{
      padding: "16px 20px",
      borderTop: "1px solid #333",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: user.company.color + "22",
        border: `2px solid ${user.company.color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 900,
        color: user.company.color,
        flexShrink: 0,
        overlow: "hidden",
      }}>
        {typeof user.company.logo === "string" && user.company.logo.startsWith("/")
          ? <img src={user.company.logo} alt={user.company.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
          : user.company.logo
        }
      </div>
      <button
        onClick={onLogout}
        style={{
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: 1,
          fontFamily: "inherit",
        }}
      >
        LOGOUT
      </button>
    </div>
  </div>
);

export default Sidebar;
