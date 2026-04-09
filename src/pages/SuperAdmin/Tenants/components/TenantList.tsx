import { useState } from "react";
import type { Tenant } from "../SparkTenants";

interface TenantListProps {
  tenants: Tenant[];
  onAdd: () => void;
  onView: (tenant: Tenant) => void;
}

const TenantList = ({ tenants, onAdd, onView }: TenantListProps) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [clickTimers, setClickTimers] = useState<Record<number, ReturnType<typeof setTimeout>>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const toggleSelect = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Manual double-click detection (works on mobile too)
  const handleNameClick = (tenant: Tenant) => {
    if (clickTimers[tenant.id]) {
      clearTimeout(clickTimers[tenant.id]);
      setClickTimers((prev) => { const n = { ...prev }; delete n[tenant.id]; return n; });
      onView(tenant);
    } else {
      const timer = setTimeout(() => {
        setClickTimers((prev) => { const n = { ...prev }; delete n[tenant.id]; return n; });
      }, 350);
      setClickTimers((prev) => ({ ...prev, [tenant.id]: timer }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Top bar */}
      <div style={s.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={s.homeBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={s.pageTitle}>Tenant Management</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={s.btnOutline}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
          </button>
          <button style={s.btnPrimary} onClick={onAdd}>+ Add Tenant</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 50 }}>
                  <input type="checkbox" style={{ accentColor: "#FF6B00" }} />
                </th>
                <th style={s.th}>COMPANY</th>
                <th style={s.th}>PLAN</th>
                <th style={s.th}>STATUS</th>
                <th style={s.th}>JOINED</th>
                <th style={s.th}>END</th>
                <th style={s.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}
                  style={{ background: selected.includes(t.id) ? "#FFF0E6" : "#fff" }}>
                  <td style={s.td}>
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      style={{ accentColor: "#FF6B00", width: 16, height: 16 }}
                    />
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 6,
                        background: t.color + "22",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 900, color: t.color, flexShrink: 0,
                      }}>
                        {t.abbr.slice(0, 5)}
                      </div>
                      <span
                        onClick={() => handleNameClick(t)}
                        onMouseEnter={() => setHoveredId(t.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        title="Double-click to view"
                        style={{
                          color: hoveredId === t.id || selected.includes(t.id)
                            ? "#FF6B00" : "#222",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "color .15s",
                        }}
                      >
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#FF6B00", fontWeight: 600, fontSize: 13 }}>
                    {t.plan}
                  </td>
                  <td style={s.td}>
                    <span style={t.status === "Active" ? s.badgeActive : s.badgeInactive}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: 13, color: "#555" }}>{t.joined}</td>
                  <td style={{ ...s.td, fontSize: 13, color: "#555" }}>{t.end}</td>
                  <td style={s.td}>
                    <button style={s.actionBtn} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button style={{ ...s.actionBtn, marginLeft: 4 }} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "flex-end",
            alignItems: "center", gap: 4, padding: "12px 16px",
            borderTop: "1px solid #f0f0f0" }}>
            {["‹ Previous", "1", "2", "...", "12", "Previous ›"].map((label, i) => (
              <button key={i} style={{
                ...s.pageBtn,
                background: label === "1" ? "#FF6B00" : "#fff",
                color: label === "1" ? "#fff" : "#555",
                borderColor: label === "1" ? "#FF6B00" : "#ddd",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  topBar: { background: "#f5f5f5", borderBottom: "1px solid #e8e8e8",
    padding: "10px 20px", display: "flex", alignItems: "center",
    justifyContent: "space-between" },
  homeBtn: { width: 36, height: 36, background: "#FF6B00", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center" },
  pageTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 22, color: "#222" },
  btnPrimary: { background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "'Barlow', sans-serif" },
  btnOutline: { background: "#fff", color: "#555", border: "1.5px solid #ccc",
    borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6 },
  tableWrap: { background: "#fff", borderRadius: 10,
    border: "1px solid #eee", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f7f7f7", fontSize: 11, fontWeight: 700, color: "#888",
    letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 14px",
    textAlign: "left", borderBottom: "1px solid #eee" },
  td: { padding: "13px 14px", borderBottom: "1px solid #f2f2f2",
    verticalAlign: "middle" },
  badgeActive: { background: "#d5f5e0", color: "#1e8449", fontSize: 11,
    fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  badgeInactive: { background: "#f5d5d5", color: "#c0392b", fontSize: 11,
    fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  actionBtn: { width: 30, height: 30, border: "1px solid #ddd", background: "#fff",
    borderRadius: 6, cursor: "pointer", display: "inline-flex",
    alignItems: "center", justifyContent: "center" },
  pageBtn: { minWidth: 30, height: 28, padding: "0 8px", border: "1px solid #ddd",
    background: "#fff", borderRadius: 6, cursor: "pointer",
    fontSize: 12, fontWeight: 500, color: "#555" },
};

export default TenantList;
