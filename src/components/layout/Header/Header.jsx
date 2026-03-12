import { Menu, Search, Bell, User } from "lucide-react";

const Header = ({ 
  user, 
  onToggleSidebar, 
  searchPlaceholder = "Search ...",
  role = "User",
}) => {
  return (
    <div style={{
      background: "white",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", alignItems: "center" }}
      >
        <Menu size={22} />
      </button>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: 380, display: "flex", alignItems: "center", background: "#f4f4f4", borderRadius: 8, padding: "8px 14px", gap: 8 }}>
        <Search size={16} color="#999" />
        <input
          placeholder={searchPlaceholder}
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 16, width: "100%", fontFamily: "inherit" }}
        />
      </div>

      {/* Right Side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>

        {/* Bell */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Bell size={22} color="#555" />
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#FF6B00", color: "white",
            fontSize: 9, fontWeight: 900,
            borderRadius: "50%", width: 14, height: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>1</span>
        </div>

        {/* User Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={18} color="#888" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</span>
        </div>

        {/* Role Badge */}
        <span style={{ background: "#FF6B00", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
          {role}
        </span>
      </div>
    </div>
  );
};

export default Header;