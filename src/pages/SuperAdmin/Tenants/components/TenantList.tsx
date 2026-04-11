import { useState, useMemo } from "react";
import type { Tenant } from "../SparkTenants";
import SAStatCard from "../../../../components/common/SAStatCard/SAStatCard";

interface TenantListProps {
  tenants: Tenant[];
  onAdd: () => void;
  onView: (tenant: Tenant) => void;
  onEdit: (id: number, updates: Partial<Tenant>) => void;
  onArchive: (id: number) => void;
}

const s: Record<string, React.CSSProperties> = {
  statCard: { background: "#fff", borderRadius: 12, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)", padding: "20px 22px", cursor: "default", transition: "transform .2s ease, box-shadow .2s ease" },
  btnPrimary: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  btnOutline: { background: "#fff", color: "#555", border: "1.5px solid #ccc", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  tableWrap: { background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #eee", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f9f9f9", fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px 16px", textAlign: "left", borderBottom: "1px solid #eee" },
  td: { padding: "14px 16px", borderBottom: "1px solid #f2f2f2", verticalAlign: "middle" },
  badgeActive: { background: "#d5f5e0", color: "#1e8449", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  badgeInactive: { background: "#f5d5d5", color: "#c0392b", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  badgeArchived: { background: "#e0e0e0", color: "#666", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  actionBtn: { width: 30, height: 30, border: "1px solid #ddd", background: "#fff", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" },
  pageBtn: { minWidth: 30, height: 28, padding: "0 8px", border: "1px solid #ddd", background: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#555" },
  input: { padding: "8px 12px", border: "1.5px solid #eaeaea", borderRadius: 6, outline: "none", fontSize: 13, color: "#333", background: "#fdfdfd" },
  select: { padding: "8px 12px", border: "1.5px solid #eaeaea", borderRadius: 6, outline: "none", fontSize: 13, color: "#333", background: "#fdfdfd", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" },
  modalContent: { background: "#fff", borderRadius: 12, padding: 24, width: 400, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: 12 }
};

// ── Modals ───────────────────────────────────────────────────
const EditModal = ({ tenant, onSave, onClose }: { tenant: Tenant; onSave: (u: Partial<Tenant>) => void; onClose: () => void }) => {
  const [form, setForm] = useState({
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    email: tenant.email,
    phone: tenant.phone
  });

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modalContent} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: "#222", fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>Edit Tenant</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} placeholder="Company Name" />
          <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={s.select}>
            <option value="Personal">Personal</option>
            <option value="Institute">Institute</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={s.select}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={s.input} placeholder="Email" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={s.input} placeholder="Phone" />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button style={s.btnOutline} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={() => { onSave(form); onClose(); }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const ArchiveModal = ({ tenant, onConfirm, onClose }: { tenant: Tenant; onConfirm: () => void; onClose: () => void }) => {
  const autoDeleteDate = new Date();
  autoDeleteDate.setFullYear(autoDeleteDate.getFullYear() + 1);

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={{ ...s.modalContent, borderTop: "4px solid #c0392b" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: "#c0392b", fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>Archive Tenant?</h3>
        <p style={{ color: "#555", fontSize: 13, lineHeight: 1.5 }}>
          Are you sure you want to archive <strong>{tenant.name}</strong>? 
          They will be moved to the archives and <strong>automatically deleted on {autoDeleteDate.toLocaleDateString()}</strong> (1 year from now).
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button style={s.btnOutline} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btnPrimary, background: "#c0392b" }} onClick={() => { onConfirm(); onClose(); }}>Yes, Archive</button>
        </div>
      </div>
    </div>
  );
};



// ── Main Component ────────────────────────────────────────────
const TenantList = ({ tenants, onAdd, onView, onEdit, onArchive }: TenantListProps) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [clickTimers, setClickTimers] = useState<Record<number, ReturnType<typeof setTimeout>>>({});
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [editTenantId, setEditTenantId] = useState<number | null>(null);
  const [archiveTenantId, setArchiveTenantId] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("ActiveOnly"); // Default mapping
  const [dateSearch, setDateSearch] = useState("");

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      // Exclude archived unless explicitly asked for
      if (statusFilter === "ActiveOnly" && t.status === "Archived") return false;
      if (statusFilter !== "All" && statusFilter !== "ActiveOnly" && t.status !== statusFilter) return false;

      // Plan filter
      if (planFilter !== "All" && t.plan !== planFilter) return false;

      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;

      if (dateSearch) {
        const [yyyy, mm] = dateSearch.split("-");
        const tenantDate = new Date(t.joined);
        if (tenantDate.getMonth() + 1 !== parseInt(mm || "0", 10) || tenantDate.getFullYear() !== parseInt(yyyy || "0", 10)) {
          return false;
        }
      }
      
      return true;
    });
  }, [tenants, search, planFilter, statusFilter, dateSearch]);

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

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

  // derived stats
  const expiringCount = tenants.filter(t => t.status !== "Archived" && new Date(t.end) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
  const newCount = tenants.filter(t => new Date(t.joined) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const inactiveCount = tenants.filter(t => t.status === "Inactive").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "20px" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 32, margin: 0, color: "#222" }}>
            Tenant Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            Manage partner companies, view subscriptions, and edit tenant details.
          </p>
        </div>
        <button style={s.btnPrimary} onClick={onAdd}>+ Add Tenant</button>
      </div>

      {/* Important Updates Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <SAStatCard label="Total Tenants" value={tenants.filter(t => t.status !== "Archived").length}
          sub="Active Subscriptions" subColor="#27ae60"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          } />
        <SAStatCard label="New Registrations" value={newCount}
          sub="This Week" subColor="#FF6B00"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          } />
        <SAStatCard label="Expiring Soon" value={expiringCount}
          sub="Next 30 Days" subColor="#f39c12"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          } />
        <SAStatCard label="Needs Attention" value={inactiveCount}
          sub="Inactive Status" subColor="#c0392b"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          } />
      </div>

      {/* Table Container */}
      <div style={s.tableWrap}>
        
        {/* Advanced Filter Bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", background: "#fcfcfc", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 10, top: 8, display: "flex", alignItems: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input 
              style={{ ...s.input, width: "100%", paddingLeft: 32 }} 
              placeholder="Search company..." 
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select style={{ ...s.select, width: 140 }} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
            <option value="All">All Plans</option>
            <option value="Personal">Personal</option>
            <option value="Institute">Institute</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select style={{ ...s.select, width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ActiveOnly">Hide Archived</option>
            <option value="All">Show All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>

          <input 
            type="month"
            style={{ ...s.input, width: 140 }} 
            value={dateSearch} onChange={e => setDateSearch(e.target.value)}
          />

        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 50 }}><input type="checkbox" style={{ accentColor: "#FF6B00" }} /></th>
                <th style={s.th}>COMPANY</th>
                <th style={s.th}>PLAN</th>
                <th style={s.th}>STATUS</th>
                <th style={s.th}>JOINED</th>
                <th style={s.th}>END</th>
                <th style={s.th}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#888" }}>No tenants matched your filters.</td></tr>
              )}
              {filteredTenants.map((t) => (
                <tr key={t.id} style={{ background: selected.includes(t.id) ? "#FFF0E6" : t.status === "Archived" ? "#fafafa" : "#fff", opacity: t.status === "Archived" ? 0.7 : 1 }}>
                  <td style={s.td}>
                    <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} style={{ accentColor: "#FF6B00", width: 16, height: 16 }} />
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: t.color, flexShrink: 0 }}>
                        {t.abbr.slice(0, 5)}
                      </div>
                      <span onClick={() => handleNameClick(t)} onMouseEnter={() => setHoveredId(t.id)} onMouseLeave={() => setHoveredId(null)} title="Double-click to view" style={{ color: hoveredId === t.id || selected.includes(t.id) ? "#FF6B00" : "#222", fontWeight: 600, fontSize: 13, cursor: "pointer", userSelect: "none", transition: "color .15s", textDecoration: t.status === "Archived" ? "line-through" : "none" }}>
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#FF6B00", fontWeight: 600, fontSize: 13 }}>{t.plan}</td>
                  <td style={s.td}>
                    <span style={t.status === "Active" ? s.badgeActive : t.status === "Archived" ? s.badgeArchived : s.badgeInactive}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: 13, color: "#555" }}>{t.joined}</td>
                  <td style={{ ...s.td, fontSize: 13, color: "#555" }}>{t.end}</td>
                  <td style={s.td}>
                    <button style={s.actionBtn} title="Edit" onClick={() => setEditTenantId(t.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {t.status !== "Archived" && (
                      <button style={{ ...s.actionBtn, marginLeft: 4 }} title="Archive" onClick={() => setArchiveTenantId(t.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
          {["‹ Previous", "1", "2", "...", "Previous ›"].map((label, i) => (
            <button key={i} style={{ ...s.pageBtn, background: label === "1" ? "#FF6B00" : "#fff", color: label === "1" ? "#fff" : "#555", borderColor: label === "1" ? "#FF6B00" : "#ddd" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {editTenantId !== null && (
        <EditModal 
          tenant={tenants.find(x => x.id === editTenantId)!} 
          onSave={(u) => onEdit(editTenantId, u)} 
          onClose={() => setEditTenantId(null)} 
        />
      )}
      {archiveTenantId !== null && (
        <ArchiveModal 
          tenant={tenants.find(x => x.id === archiveTenantId)!} 
          onConfirm={() => onArchive(archiveTenantId)} 
          onClose={() => setArchiveTenantId(null)} 
        />
      )}
    </div>
  );
};

export default TenantList;
