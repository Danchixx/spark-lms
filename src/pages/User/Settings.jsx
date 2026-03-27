import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Button from "../../components/ui/Button/Button";
import SettingsCard from "../../components/ui/SettingsCard/SettingsCard";
import {
  Toggle, getStrength, STRENGTH_COLORS, STRENGTH_LABELS, ReqRow
} from "../../components/ui/SettingsCard/SettingsHelpers";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import PageTransition from "../../components/common/PageTransition";
import {
  Building2, Bell, ShieldCheck, Palette,
  Lock, Eye, EyeOff, Globe, Mail, Phone, MapPin, User, Calendar
} from "lucide-react";

/* ── Nav items (User-only: no Organization, no Billing) ── */
const USER_TABS = [
  { key: "company", label: "Company Profile", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "appearance", label: "Appearance", icon: Palette },
];

/* ── Panels ── */

const CompanyPanel = () => {
  const { company } = useAuth();

  if (!company) return null;

  return (
    <div className="section-card">
      <div className="section-header-wrap">
        <h2 className="settings-panel-title">Company Profile</h2>
        <p className="settings-panel-subtitle">Your company's identity - logo, cover, contacts.</p>
      </div>

      <div className="settings-divider" />

      <div className="company-visuals">
        <div className="label-small">Logo and Cover Photo</div>
        <div
          className="company-cover-edit"
          style={company?.cover_photo_url ? {
            backgroundImage: `url(${company.cover_photo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="company-logo-overlay">
            <div className="logo-circle" style={{ background: "white", border: "1.5px solid #e0e0e0" }}>
              {typeof company.logo_url === "string" && company.logo_url.startsWith("http")
                ? <img src={company.logo_url} alt={company.name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                : <span style={{ fontSize: 24, fontWeight: 900, color: company.color || "#FF6B00" }}>{company.name?.substring(0, 2).toUpperCase()}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Company Details</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Company Name</label>
            <input value={company.name || ""} readOnly />
          </div>
          <div className="form-field">
            <label>Industry</label>
            <input value={company.industry || ""} readOnly />
          </div>
          <div className="form-field">
            <label>Year Founded</label>
            <div className="input-with-icon">
              <Calendar size={14} />
              <input value={company.year_founded || ""} readOnly />
            </div>
          </div>
          <div className="form-field">
            <label>Company Website</label>
            <div className="input-with-icon">
              <Globe size={14} />
              <input value={company.website_url || ""} readOnly />
            </div>
          </div>
          <div className="form-field full-width">
            <label>Company Description</label>
            <textarea rows={3} value={company.description || ""} readOnly />
          </div>
          <div className="form-field full-width">
            <label>Workspace URL</label>
            <div className="workspace-url-input">
              <span className="prefix">spark-ph-lms.com/</span>
              <input value={company.slug || ""} readOnly />
            </div>
            <span className="field-hint">Your learning portal URL: <strong>spark-ph-lms.com/{company.slug}</strong></span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">Contact Information</div>
        <div className="form-grid">
          <div className="form-field">
            <label>Contact Person</label>
            <div className="input-with-icon">
              <User size={14} />
              <input value={company.contact_person || ""} readOnly />
            </div>
          </div>
          <div className="form-field">
            <label>Contact Email</label>
            <div className="input-with-icon">
              <Mail size={14} />
              <input value={company.contact_email || ""} readOnly />
            </div>
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={14} />
              <input value={company.phone_number || ""} readOnly />
            </div>
          </div>
          <div className="form-field">
            <label>Country</label>
            <input value={company.country || ""} readOnly />
          </div>
          <div className="form-field full-width">
            <label>Office Address</label>
            <div className="input-with-icon">
              <MapPin size={14} />
              <input value={company.office_address || ""} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="section-card">
      <h2 className="settings-panel-title">Notifications</h2>
      <p className="settings-panel-subtitle">Control when and how you receive alerts.</p>
      <div className="settings-divider" />

      <div className="card-inner">
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

      <div className="settings-save-bar" style={{ background: "transparent", padding: "16px 0 0" }}>
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Save Notifications</Button>
      </div>
    </div>
  );
};

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

  return (
    <div className="section-card">
      <h2 className="settings-panel-title">Security</h2>
      <p className="settings-panel-subtitle">Manage your password and session settings.</p>
      <div className="settings-divider" />

      {/* Session */}
      <div className="card-inner" style={{ marginBottom: 20 }}>
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
      <div className="card-inner">
        <div className="settings-card-header">Change Password</div>

        <PwField label="Current Password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
        <PwField label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Enter new password" />

        {/* Strength bar */}
        {newPw.length > 0 && (
          <div style={{ padding: "0 20px 8px" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {["weak", "medium", "strong"].map((level, i) => (
                <div key={level} style={{ flex: 1, height: 4, borderRadius: 4, background: strength && (i === 0 || (i === 1 && strength !== "weak") || (i === 2 && strength === "strong")) ? STRENGTH_COLORS[strength] : "#e0e0e0", transition: "background 0.3s" }} />
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</span>
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
    <div className="section-card">
      <h2 className="settings-panel-title">Appearance</h2>
      <p className="settings-panel-subtitle">Customize the look and feel of your workspace.</p>
      <div className="settings-divider" />

      <div className="card-inner" style={{ marginBottom: 20 }}>
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

      <div className="card-inner" style={{ marginBottom: 20 }}>
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

      <div className="card-inner" style={{ marginBottom: 20 }}>
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

      <div className="settings-save-bar" style={{ background: "transparent", padding: "16px 0 0" }}>
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

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const defaultTab = location.state?.activeTab || "company";

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Settings" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <SettingsCard tabs={USER_TABS} defaultTab={defaultTab} title="Settings">
              <SettingsCard.Section sectionKey="company">
                <CompanyPanel />
              </SettingsCard.Section>
              <SettingsCard.Section sectionKey="notifications">
                <NotificationsPanel />
              </SettingsCard.Section>
              <SettingsCard.Section sectionKey="security">
                <SecurityPanel />
              </SettingsCard.Section>
              <SettingsCard.Section sectionKey="appearance">
                <AppearancePanel />
              </SettingsCard.Section>
            </SettingsCard>
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default Settings;
