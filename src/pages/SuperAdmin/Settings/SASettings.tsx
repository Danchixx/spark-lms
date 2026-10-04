// src/pages/SuperAdmin/Settings/SASettings.tsx
import React, { useState } from "react";

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
    <div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-header)" }}>{label}</p>
      {desc && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>{desc}</p>}
    </div>
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#FF6B00" : "var(--color-border)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  </div>
);

const SASettings = () => {
  const [notifs, setNotifs] = useState({ subscriptionExpiry: true, newTenant: true, systemAlerts: true });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: true, loginAlerts: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Barlow', sans-serif", maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 6px" }}>Settings</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>Configure system-wide preferences and security settings.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Notifications */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <SectionTitle icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>} title="Notifications" />
          <Toggle label="Subscription Expiry Alerts" desc="Notify when a tenant subscription is expiring within 2 months" value={notifs.subscriptionExpiry} onChange={v => setNotifs(p => ({ ...p, subscriptionExpiry: v }))} />
          <Toggle label="New Tenant Registration" desc="Alert when a new tenant is registered" value={notifs.newTenant} onChange={v => setNotifs(p => ({ ...p, newTenant: v }))} />
          <Toggle label="System Alerts" desc="Critical system notifications and errors" value={notifs.systemAlerts} onChange={v => setNotifs(p => ({ ...p, systemAlerts: v }))} />
        </div>

        {/* Security */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <SectionTitle icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} title="Security" />
          <Toggle label="Two-Factor Authentication" desc="Require 2FA for SuperAdmin login" value={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} />
          <Toggle label="Auto Session Timeout" desc="Automatically log out after 30 minutes of inactivity" value={security.sessionTimeout} onChange={v => setSecurity(p => ({ ...p, sessionTimeout: v }))} />
          <Toggle label="Login Alerts" desc="Email alert when a new login is detected" value={security.loginAlerts} onChange={v => setSecurity(p => ({ ...p, loginAlerts: v }))} />
        </div>

        {/* System Info */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <SectionTitle icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>} title="System Information" />
          {[
            { label: "Platform Version", value: "SPARK LMS v1.0.0" },
            { label: "Database", value: "Supabase PostgreSQL" },
            { label: "Environment", value: "Production" },
            { label: "Last Updated", value: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ width: 200, fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>{r.label}</span>
              <span style={{ fontSize: 13, color: "var(--color-text)" }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Save */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          {saved && <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 700 }}>✓ Settings saved</span>}
          <button onClick={handleSave} style={{ background: "linear-gradient(135deg, #FF8C00, #FF6B00)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SASettings;
