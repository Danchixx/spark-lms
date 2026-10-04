// src/pages/SuperAdmin/DataExport/DataExport.tsx
import React, { useState } from "react";

const EXPORT_TYPES = [
  { key: "tenants", label: "Tenant Data", desc: "All registered companies and their details", icon: "🏢", color: "#FF6B00" },
  { key: "users", label: "User Accounts", desc: "All user records across all tenants", icon: "👥", color: "#2563EB" },
  { key: "courses", label: "Courses", desc: "Course catalog, modules, and lessons", icon: "📚", color: "#7C3AED" },
  { key: "progress", label: "Learning Progress", desc: "User progress and completion records", icon: "📈", color: "#16A34A" },
  { key: "subscriptions", label: "Subscriptions", desc: "Subscription history and renewals", icon: "💳", color: "#D97706" },
  { key: "logs", label: "Audit Logs", desc: "System audit trail and activity logs", icon: "🗂️", color: "#DC2626" },
];

const FORMATS = ["CSV", "Excel (.xlsx)", "JSON", "PDF Report"];

const DataExport = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [format, setFormat] = useState("CSV");
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (key: string) => setSelected(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

  const handleExport = () => {
    if (!selected.length) return;
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); setTimeout(() => setDone(false), 3000); }, 1800);
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 6px" }}>Data Export</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>Export system data in your preferred format.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Left */}
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Select Data to Export</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {EXPORT_TYPES.map(t => {
              const isSel = selected.includes(t.key);
              return (
                <div key={t.key} onClick={() => toggle(t.key)} style={{ background: "var(--color-surface)", border: `2px solid ${isSel ? t.color : "var(--color-border)"}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.2s", boxShadow: isSel ? `0 4px 16px ${t.color}22` : "var(--shadow)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 14, color: isSel ? t.color : "var(--color-text-header)" }}>{t.label}</span>
                    {isSel && <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Config */}
        <div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 24, boxShadow: "var(--shadow)", position: "sticky", top: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Export Settings</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8 }}>Format</label>
              {FORMATS.map(f => (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                  <input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} style={{ accentColor: "#FF6B00" }} />
                  <span style={{ fontSize: 13, color: "var(--color-text)", fontWeight: format === f ? 700 : 400 }}>{f}</span>
                </label>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{selected.length}</span> dataset{selected.length !== 1 ? "s" : ""} selected
              </div>
              {selected.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.map(k => {
                    const t = EXPORT_TYPES.find(x => x.key === k)!;
                    return <span key={k} style={{ background: t.color + "18", color: t.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{t.label}</span>;
                  })}
                </div>
              )}
            </div>

            {done && (
              <div style={{ background: "#d5f5e0", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#065F46", fontWeight: 700 }}>
                ✓ Export ready! Download started.
              </div>
            )}

            <button onClick={handleExport} disabled={!selected.length || exporting} style={{ width: "100%", padding: "12px 0", background: selected.length ? "linear-gradient(135deg, #FF8C00, #FF6B00)" : "var(--color-border)", color: selected.length ? "#fff" : "var(--color-text-muted)", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: selected.length && !exporting ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              {exporting ? "Preparing Export…" : `Export ${selected.length ? `(${selected.length})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;
