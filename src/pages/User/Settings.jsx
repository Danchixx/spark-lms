import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Button from "../../components/ui/Button/Button";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import {
  Building2, Bell, ShieldCheck, Palette,
  Lock, Eye, EyeOff, Check, X,
} from "lucide-react";
import "./Settings.css";

/* ── Mock company data ── */
const COMPANY = {
  name: "ZOUP",
  industry: "Sales and Marketing",
  website: "https://zoup.com",
  address: "Suite B, 3rd Floor, Rose Industries Building, Pasig City",
  logo: "ZP",
  color: "#2980b9",
  memberSince: "January 2024",
  plan: "Pro Plan",
};

/* ── Toggle component ── */
const Toggle = ({ checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="toggle-track" />
  </label>
);

/* ── Password strength ── */
const getStrength = (pw) => {
  const checks = {
    length: pw.length >= 8, number: /[0-9]/.test(pw),
    letter: /[a-zA-Z]/.test(pw), uppercase: /[A-Z]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = pw.length === 0 ? null : passed <= 2 ? "weak" : passed <= 4 ? "medium" : "strong";
  return { checks, strength };
};
const SC = { weak: "#e74c3c", medium: "#f39c12", strong: "#27ae60" };
const SL = { weak: "Weak", medium: "Medium", strong: "Strong" };

const ReqRow = ({ met, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
    <div style={{ width: 16, height: 16, borderRadius: "50%", background: met ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${met ? "#22c55e" : "#fca5a5"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {met ? <Check size={9} color="#22c55e" /> : <X size={9} color="#f87171" />}
    </div>
    <span style={{ fontSize: 11, color: met ? "#16a34a" : "#888" }}>{label}</span>
  </div>
);

/* ── Nav items ── */
const NAV = [
  { key: "company", label: "Company Profile", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "appearance", label: "Appearance", icon: Palette },
];

/* ── Panels ── */

const CompanyPanel = () => (
  <div>
    <h2 className="settings-panel-title">Company Profile</h2>
    <p className="settings-panel-subtitle">Your company's information — managed by your admin.</p>
    <div className="settings-divider" />

    <div className="settings-card">
      {/* Cover + Logo */}
      <div className="company-cover">
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#FF8C00,#c0392b)", opacity: 0.9 }} />
      </div>
      <div className="company-info-body">
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8f0f8", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: COMPANY.color, marginBottom: 12 }}>
          {COMPANY.logo}
        </div>
        <div className="company-name-row">
          <span className="company-name-text">{COMPANY.name}</span>
          <span className="company-badge">{COMPANY.plan}</span>
        </div>

        <div className="settings-field-row" style={{ marginBottom: 12 }}>
          <div>
            <div className="settings-field-label">Company Name</div>
            <input className="settings-field-input readonly" value={COMPANY.name} readOnly />
          </div>
          <div>
            <div className="settings-field-label">Industry</div>
            <input className="settings-field-input readonly" value={COMPANY.industry} readOnly />
          </div>
        </div>

        <div className="settings-field-row" style={{ marginBottom: 12 }}>
          <div>
            <div className="settings-field-label">Company Website</div>
            <input className="settings-field-input readonly" value={COMPANY.website} readOnly />
          </div>
          <div>
            <div className="settings-field-label">Member Since</div>
            <input className="settings-field-input readonly" value={COMPANY.memberSince} readOnly />
          </div>
        </div>

        <div>
          <div className="settings-field-label">Office Address</div>
          <input className="settings-field-input readonly" value={COMPANY.address} readOnly />
        </div>

        <p style={{ fontSize: 11, color: "#aaa", marginTop: 14 }}>
          To update company information, contact your workspace admin.
        </p>
      </div>
    </div>
  </div>
);

const NotificationsPanel = () => {
  const [notifs, setNotifs] = useState({
    courseAssigned: true,
    courseReminder: true,
    assessmentDue: true,
    certificateEarned: true,
    announcements: false,
    weeklyDigest: false,
  });

  const toggle = (key) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

  const rows = [
    { key: "courseAssigned", label: "Course Assigned", desc: "Notify when admin assigns you a new course" },
    { key: "courseReminder", label: "Course Reminder", desc: "Remind you of courses with upcoming deadlines" },
    { key: "assessmentDue", label: "Assessment Due", desc: "Remind you when an assessment is due" },
    { key: "certificateEarned", label: "Certificate Earned", desc: "Notify when you earn a new certificate" },
    { key: "announcements", label: "Announcements", desc: "Receive workspace-wide announcements" },
    { key: "weeklyDigest", label: "Weekly Digest", desc: "Receive a summary of your activity every Monday" },
  ];

  return (
    <div>
      <h2 className="settings-panel-title">Notifications</h2>
      <p className="settings-panel-subtitle">Control when and how you receive alerts.</p>
      <div className="settings-divider" />

      <div className="settings-card">
        <div className="settings-card-header">Email & In-App Notifications</div>
        <div className="settings-card-body">
          {rows.map((r) => (
            <div className="toggle-row" key={r.key}>
              <div className="toggle-info">
                <div className="toggle-label">{r.label}</div>
                <div className="toggle-desc">{r.desc}</div>
              </div>
              <Toggle checked={notifs[r.key]} onChange={() => toggle(r.key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="settings-save-bar" style={{ background: "transparent", padding: "0" }}>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Save Notifications</Button>
      </div>
    </div>
  );
};

const SecurityPanel = () => {
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { checks, strength } = getStrength(newPw);
  const canSave = currentPw && Object.values(checks).every(Boolean) && newPw === confirmPw;

  const PwField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div className="settings-field">
      <div className="settings-field-label">{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 12px", background: "white", transition: "border-color 0.15s" }}
        onFocus={(e) => e.currentTarget.style.borderColor = "#FF6B00"}
        onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}>
        <Lock size={15} color="#aaa" style={{ flexShrink: 0 }} />
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "#1a1a1a", minWidth: 0 }} />
        <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center" }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="settings-panel-title">Security</h2>
      <p className="settings-panel-subtitle">Manage your password and session settings.</p>
      <div className="settings-divider" />

      {/* Session */}
      <div className="settings-card" style={{ marginBottom: 20 }}>
        <div className="settings-card-header">Session</div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">Session Timeout</div>
            <div className="toggle-desc">Auto-logout after 1 hour of inactivity</div>
          </div>
          <Toggle checked={sessionTimeout} onChange={setSessionTimeout} />
        </div>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <div className="settings-card-header">Change Password</div>

        <PwField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
        <PwField label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Enter new password" />

        {/* Strength bar */}
        {newPw.length > 0 && (
          <div style={{ padding: "0 20px 8px" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {["weak", "medium", "strong"].map((level, i) => (
                <div key={level} style={{ flex: 1, height: 4, borderRadius: 4, background: strength && (i === 0 || (i === 1 && strength !== "weak") || (i === 2 && strength === "strong")) ? SC[strength] : "#e0e0e0", transition: "background 0.3s" }} />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: SC[strength] }}>{SL[strength]}</span>
            <div style={{ marginTop: 8, padding: "10px 12px", background: "#f9f9f9", borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <ReqRow met={checks.length} label="At least 8 characters" />
              <ReqRow met={checks.letter} label="Contains a letter" />
              <ReqRow met={checks.number} label="Contains a number" />
              <ReqRow met={checks.uppercase} label="One uppercase letter" />
              <ReqRow met={checks.symbol} label="One special symbol (e.g. !@#$)" />
            </div>
          </div>
        )}

        <PwField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} placeholder="Re-enter new password" />
        {confirmPw && newPw !== confirmPw && <p style={{ margin: "-8px 20px 8px", fontSize: 11, color: "#e74c3c" }}>Passwords do not match</p>}
        {confirmPw && newPw === confirmPw && <p style={{ margin: "-8px 20px 8px", fontSize: 11, color: "#22c55e" }}>Passwords match ✓</p>}

        <div className="settings-save-bar">
          <Button disabled={!canSave}>Update Password</Button>
        </div>
      </div>
    </div>
  );
};

const AppearancePanel = () => {
  const [theme, setTheme] = useState("light");
  const [font, setFont] = useState("DM Sans");
  const [collapseSidebar, setCollapseSidebar] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  const fonts = ["DM Sans", "Inter", "Georgia", "DM Mono"];

  return (
    <div>
      <h2 className="settings-panel-title">Appearance</h2>
      <p className="settings-panel-subtitle">Customize the look and feel of your workspace.</p>
      <div className="settings-divider" />

      <div className="settings-card" style={{ marginBottom: 20 }}>
        <div className="settings-card-header">Interface Theme</div>
        <div className="theme-options">
          {[
            { key: "light", label: "Light (Default)" },
            { key: "dark", label: "Dark" },
          ].map((t) => (
            <div key={t.key} className={`theme-card ${theme === t.key ? "selected" : ""}`} onClick={() => setTheme(t.key)}>
              <div className={`theme-card-preview ${t.key}`}>
                <div className="theme-preview-bar" style={{ width: "70%", background: t.key === "light" ? "#ddd" : "#444" }} />
                <div className="theme-preview-bar" style={{ width: "50%", background: t.key === "light" ? "#ddd" : "#444" }} />
                <div className="theme-preview-bar" style={{ width: "60%", background: t.key === "light" ? "#ddd" : "#444" }} />
              </div>
              <div className="theme-card-label">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card" style={{ marginBottom: 20 }}>
        <div className="settings-card-header">Interface Font</div>
        <div className="font-options">
          {fonts.map((f) => (
            <div key={f} className={`font-card ${font === f ? "selected" : ""}`} onClick={() => setFont(f)} style={{ fontFamily: f }}>
              <div className="font-card-name">{f}</div>
              <div className="font-card-sample">Aa Bb Cc</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card" style={{ marginBottom: 20 }}>
        <div className="settings-card-header">Sidebar Behavior</div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">Collapse Sidebar</div>
            <div className="toggle-desc">Show only icons until hovered — saves horizontal space</div>
          </div>
          <Toggle checked={collapseSidebar} onChange={setCollapseSidebar} />
        </div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">Show Labels</div>
            <div className="toggle-desc">Display text labels alongside sidebar icons</div>
          </div>
          <Toggle checked={showLabels} onChange={setShowLabels} />
        </div>
      </div>

      <div className="settings-save-bar" style={{ background: "transparent", padding: "0" }}>
        <Button variant="ghost" size="sm">Reset to Defaults</Button>
        <Button size="sm">Save Appearance</Button>
      </div>
    </div>
  );
};

/* ── Main Settings Page ── */
const Settings = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "company");

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const panels = {
    company: <CompanyPanel />,
    notifications: <NotificationsPanel />,
    security: <SecurityPanel />,
    appearance: <AppearancePanel />,
  };

  return (
    <div className="settings-page">
      <Sidebar isOpen={sidebarOpen} activePage="Settings" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div className="settings-body">
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search settings ..." role="User" />

        <div className="settings-content">
          {/* Left nav */}
          <nav className="settings-nav">
            <div className="settings-nav-title">Settings</div>
            {NAV.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className={`settings-nav-item ${activeTab === key ? "active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={16} />
                {label}
              </div>
            ))}
          </nav>

          {/* Panel */}
          <div className="settings-panel">
            {panels[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
