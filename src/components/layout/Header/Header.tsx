import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Squash as Hamburger } from "hamburger-react";
import { Bell, User, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

const BREAKPOINT = 1024;

const SAMPLE_NOTIFICATIONS = [
  { id: 1, title: "New course available", message: "React Advanced Patterns has been added to your courses.", time: "2 min ago", read: false },
  { id: 2, title: "Assessment due", message: "Your Module 3 assessment is due tomorrow.", time: "1 hr ago", read: false },
  { id: 3, title: "Certificate earned", message: "You've completed Introduction to JavaScript!", time: "3 hrs ago", read: true },
  { id: 4, title: "New message", message: "Your admin has sent you a message.", time: "Yesterday", read: true },
];

type HeaderProps = {
  user: { name?: string; avatar_url?: string | null } | null;
  onToggleSidebar: () => void;
  isOpen: boolean;
  searchPlaceholder?: string;
  role?: string;
};

const Header = ({
  user,
  onToggleSidebar,
  isOpen,
  searchPlaceholder = "Search ...",
  role = "User",
}: HeaderProps) => {
  const { company } = useAuth();
  const { theme, sidebarTheme } = useTheme();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= BREAKPOINT;
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";
  const goToProfile = () => navigate(`/${slug}/profile`);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismiss = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <style>{`
        .desk-burger {
          background: none; border: none; cursor: pointer; color: var(--color-text-muted);
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px;
          transition: background 0.2s ease, color 0.2s ease; flex-shrink: 0;
        }
        .desk-burger:hover { background: var(--color-bg-hover); color: #FF6B00; }
        .desk-burger-icon { display: flex; flex-direction: column; gap: 5px; width: 20px; }
        .desk-burger-line {
          display: block; height: 2px; width: 100%; background: currentColor; border-radius: 2px;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1), margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .desk-burger:hover .desk-burger-line:nth-child(1) { width: 100%; }
        .desk-burger:hover .desk-burger-line:nth-child(2) { width: 60%; margin-left: auto; }
        .desk-burger:hover .desk-burger-line:nth-child(3) { width: 100%; }
        .desk-burger--open:hover .desk-burger-line:nth-child(1) { width: 100%; }
        .desk-burger--open:hover .desk-burger-line:nth-child(2) { width: 60%; margin-left: 0; }
        .desk-burger--open:hover .desk-burger-line:nth-child(3) { width: 100%; }

        .notif-btn {
          background: none; border: none; cursor: pointer;
          position: relative; display: flex; align-items: center;
          padding: 6px; border-radius: 8px;
          transition: background 0.2s ease;
        }
        .notif-btn:hover { background: var(--color-bg-hover); }

        .notif-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 320px;
          background: var(--color-surface);
          border-radius: 12px;
          box-shadow: var(--shadow);
          border: 1px solid var(--color-border);
          z-index: 200;
          overflow: hidden;
          animation: notifFadeIn 0.2s ease;
        }
        @media (max-width: 400px) {
          .notif-dropdown { width: calc(100vw - 32px); right: -8px; }
        }
        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .notif-item {
          display: flex; gap: 10px; padding: 12px 16px;
          border-bottom: 1px solid var(--color-border); cursor: pointer;
          transition: background 0.15s ease; position: relative;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--color-bg-hover); }
        .notif-item--unread { background: color-mix(in srgb, #FF6B00 8%, transparent); }
        .notif-item--unread:hover { background: color-mix(in srgb, #FF6B00 12%, transparent); }

        .notif-dismiss {
          position: absolute; top: 8px; right: 8px;
          background: none; border: none; cursor: pointer;
          color: #bbb; padding: 2px; border-radius: 4px;
          display: flex; align-items: center;
          transition: color 0.15s ease;
          opacity: 0;
        }
        .notif-item:hover .notif-dismiss { opacity: 1; }
        .notif-dismiss:hover { color: #e74c3c; }
      `}</style>

      <div style={{
        background: (isMobile && isOpen && sidebarTheme === 'black' && theme === 'light') ? '#1a1a1a' : "var(--color-surface)", 
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 16,
        boxShadow: "var(--shadow)", zIndex: 10,
        flexShrink: 0, position: "relative",
        transition: "background 0.3s ease",
        color: (isMobile && isOpen && sidebarTheme === 'black' && theme === 'light') ? '#ffffff' : 'inherit'
      }}>

        {/* Burger */}
        {isMobile ? (
          <Hamburger toggled={isOpen} toggle={onToggleSidebar} size={20} color={(isMobile && isOpen && sidebarTheme === 'black' && theme === 'light') ? '#fff' : "#555"} duration={0.4} label="Toggle menu" />
        ) : (
          <button className={`desk-burger${isOpen ? " desk-burger--open" : ""}`} onClick={onToggleSidebar} aria-label="Toggle menu">
            <div className="desk-burger-icon">
              <span className="desk-burger-line" />
              <span className="desk-burger-line" />
              <span className="desk-burger-line" />
            </div>
          </button>
        )}

        {/* Company name — mobile only, centered */}
        {isMobile && (
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontWeight: 700, fontSize: 16, color: (isMobile && isOpen && sidebarTheme === 'black' && theme === 'light') ? '#fff' : "var(--color-text-header)", whiteSpace: "nowrap", pointerEvents: "none" }}>
            {company?.name ?? "Spark LMS"}
          </span>
        )}

        {/* Search — desktop only */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: 380, display: "flex", alignItems: "center", background: "var(--color-bg-muted)", borderRadius: 8, padding: "8px 14px", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder={searchPlaceholder} style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", color: "var(--color-text)" }} />
          </div>
        )}

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: isMobile ? 12 : 16 }}>

          {/* Bell with dropdown */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button className="notif-btn" onClick={() => setNotifOpen(prev => !prev)} aria-label="Notifications">
              <Bell size={22} color={notifOpen ? "#FF6B00" : (isMobile && isOpen && sidebarTheme === 'black' && theme === 'light') ? "#fff" : "#555"} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 2,
                  background: "#FF6B00", color: "white",
                  fontSize: 9, fontWeight: 900, borderRadius: "50%",
                  width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div className="notif-dropdown">
                {/* Header */}
                <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-header)" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#FF6B00", fontWeight: 600, fontFamily: "inherit" }}>
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* List */}
                {notifications.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item${!n.read ? " notif-item--unread" : ""}`} onClick={() => markRead(n.id)}>
                      {/* Unread dot */}
                      <div style={{ paddingTop: 4, flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "#FF6B00" }} />
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, color: "var(--color-text-header)", marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)", opacity: 0.6, marginTop: 4 }}>{n.time}</div>
                      </div>
                      {/* Dismiss */}
                      <button className="notif-dismiss" onClick={e => { e.stopPropagation(); dismiss(n.id); }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}

                {/* Footer */}
                {notifications.length > 0 && (
                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                    <button onClick={() => setNotifications([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "inherit" }}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar + name — desktop */}
          {!isMobile && (
            <div
              onClick={goToProfile}
              title="View Profile"
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", borderRadius: 8, padding: "4px 8px", transition: "background 0.2s ease" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ffffff", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={18} color="#888" />
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-header)" }}>{user?.name}</span>
            </div>
          )}

          {/* Avatar only — mobile */}
          {isMobile && (
            <div
              onClick={goToProfile}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={16} color="#888" />
              )}
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
    </>
  );
};

export default Header;