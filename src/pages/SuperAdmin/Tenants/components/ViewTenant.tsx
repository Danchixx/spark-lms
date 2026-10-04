// src/pages/SuperAdmin/Tenants/components/ViewTenant.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TenantCompany, CompanySubscription, ManagementUser } from "../../../../services/tenantService";
import { fetchSubscriptionHistory, fetchManagementUsers, fetchUserCount, updateTenant } from "../../../../services/tenantService";

interface ViewTenantProps {
  tenant: TenantCompany;
  onBack: () => void;
  onUpdated?: (updated: TenantCompany) => void;
}

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const FieldRow = ({ label, value, editing, onChange }: { label: string; value: string; editing?: boolean; onChange?: (v: string) => void }) => (
  <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 160, minWidth: 160, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ flex: 1, padding: editing ? "6px 12px" : "10px 16px", display: "flex", alignItems: "center" }}>
      {editing && onChange ? (
        <input value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, border: "1.5px solid var(--color-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)" }} onFocus={e => e.currentTarget.style.borderColor = "#FF6B00"} onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"} />
      ) : (
        <span style={{ fontSize: 13, color: value ? "var(--color-text)" : "var(--color-text-muted)", fontStyle: value ? "normal" : "italic" }}>{value || "—"}</span>
      )}
    </div>
  </div>
);

const SubHistoryModal = ({ companyId, onClose }: { companyId: number; onClose: () => void }) => {
  const [rows, setRows] = useState<CompanySubscription[]>([]);
  useEffect(() => { fetchSubscriptionHistory(companyId).then(setRows).catch(console.error); }, [companyId]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: 16, padding: 28, width: 560, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,.25)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text-header)" }}>Subscription History</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--color-text-muted)" }}>×</button>
        </div>
        {rows.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px 0" }}>No subscription records found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Plan", "Started", "Ends", "Status"].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: ".1em", textTransform: "uppercase", padding: "8px 12px", textAlign: "left", background: "var(--color-bg-subtle)", borderBottom: "1px solid var(--color-border)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--color-border)", fontSize: 13, fontWeight: 700, color: "#FF6B00" }}>{r.plan === "3_year" ? "3 Year" : "1 Year"}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text)" }}>{new Date(r.started_at).toLocaleDateString()}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text)" }}>{new Date(r.ends_at).toLocaleDateString()}</td>
                  <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ background: r.status === "active" ? "#d5f5e0" : "#f5f5f5", color: r.status === "active" ? "#1e8449" : "#888", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button onClick={onClose} style={{ background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const MgmtModal = ({ companyId, onClose }: { companyId: number; onClose: () => void }) => {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  useEffect(() => { fetchManagementUsers(companyId).then(setUsers).catch(console.error); }, [companyId]);
  const roleColors: Record<string, { bg: string; color: string }> = { admin: { bg: "#FFF0E6", color: "#FF6B00" }, creator: { bg: "#EFF6FF", color: "#2563EB" }, approver: { bg: "#F0FDF4", color: "#16A34A" } };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: 16, padding: 28, width: 560, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,.25)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text-header)" }}>Management Accounts</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--color-text-muted)" }}>×</button>
        </div>
        {users.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px 0" }}>No management accounts found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map(u => {
              const meta = roleColors[u.role] ?? { bg: "var(--color-bg-subtle)", color: "var(--color-text-muted)" };
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--color-bg-subtle)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: meta.color, flexShrink: 0 }}>
                    {(u.firstname?.[0] ?? "") + (u.lastname?.[0] ?? "")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text-header)" }}>{u.firstname} {u.lastname}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{u.email}</p>
                  </div>
                  <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize" }}>{u.role}</span>
                  <span style={{ background: u.status === "active" ? "#d5f5e0" : "#f5f5f5", color: u.status === "active" ? "#1e8449" : "#888", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{u.status}</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button onClick={onClose} style={{ background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
        </div>
      </div>
    </div>
  );
};

const ViewTenant = ({ tenant, onBack, onUpdated }: ViewTenantProps) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSubHistory, setShowSubHistory] = useState(false);
  const [showMgmt, setShowMgmt] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [mgmtCount, setMgmtCount] = useState(0);
  const [subCount, setSubCount] = useState(0);

  const [draft, setDraft] = useState<Partial<TenantCompany>>({
    name: tenant.name, description: tenant.description, industry: tenant.industry,
    country: tenant.country, office_address: tenant.office_address,
    contact_person: tenant.contact_person, contact_email: tenant.contact_email,
    phone_number: tenant.phone_number, website_url: tenant.website_url,
    facebook_url: tenant.facebook_url, linkedin_url: tenant.linkedin_url, twitter_url: tenant.twitter_url,
  });

  useEffect(() => {
    fetchUserCount(tenant.id).then(setUserCount).catch(() => {});
    fetchManagementUsers(tenant.id).then(u => setMgmtCount(u.length)).catch(() => {});
    fetchSubscriptionHistory(tenant.id).then(s => setSubCount(s.length)).catch(() => {});
  }, [tenant.id]);

  const upd = (key: keyof TenantCompany) => (v: string) => setDraft(d => ({ ...d, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenant(tenant.id, draft);
      onUpdated?.({ ...tenant, ...draft });
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setDraft({ name: tenant.name, description: tenant.description, industry: tenant.industry, country: tenant.country, office_address: tenant.office_address, contact_person: tenant.contact_person, contact_email: tenant.contact_email, phone_number: tenant.phone_number, website_url: tenant.website_url, facebook_url: tenant.facebook_url, linkedin_url: tenant.linkedin_url, twitter_url: tenant.twitter_url });
    setEditing(false);
  };

  const planLabel = tenant.subscription_plan === "3_year" ? "3 Year" : tenant.subscription_plan === "1_year" ? "1 Year" : tenant.subscription_plan ?? "—";
  const endsAt = tenant.subscription_ends_at ? new Date(tenant.subscription_ends_at) : null;
  const daysLeft = endsAt ? Math.ceil((endsAt.getTime() - Date.now()) / 86400000) : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 60 && daysLeft > 0;
  const expired = daysLeft !== null && daysLeft <= 0;

  const statItems = [
    { label: "Subscriptions", val: subCount, clickable: true, onClick: () => setShowSubHistory(true), color: "#FF6B00" },
    { label: "Management", val: mgmtCount, clickable: true, onClick: () => setShowMgmt(true), color: "#2563EB" },
    { label: "Total Users", val: userCount, clickable: true, onClick: () => navigate("/superadmin/users"), color: "#16A34A" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <style>{`
        .vt-body { display: flex; gap: 24px; padding: 20px; flex: 1; min-height: 0; overflow-y: auto; }
        .vt-left { width: 260px; flex-shrink: 0; }
        .vt-right { flex: 1; min-width: 0; }
        @media (max-width: 900px) { .vt-body { flex-direction: column; } .vt-left { width: 100%; } }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF0E6", border: "1.5px solid #FF6B00", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#FF6B00", fontFamily: "inherit" }}>
          ← Tenant List
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-muted)" }}>Tenant Profile</span>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "none", border: "1.5px solid var(--color-border)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", fontFamily: "inherit" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        )}
      </div>

      <div className="vt-body">
        {/* Left — Preview Card */}
        <div className="vt-left">
          <div style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            {/* Cover */}
            <div style={{ width: "100%", height: 100, background: tenant.cover_photo_url ? "transparent" : "linear-gradient(135deg, #c8d4e8, #8fa8c8)", overflow: "hidden" }}>
              {tenant.cover_photo_url && <img src={tenant.cover_photo_url} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            {/* Logo + Name */}
            <div style={{ padding: "0 16px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: -24, marginBottom: 10 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--color-surface)", border: "3px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, zIndex: 2 }}>
                  {tenant.logo_url ? <img src={tenant.logo_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14, fontWeight: 900, color: "var(--color-text-muted)" }}>{(tenant.name ?? "?").slice(0, 3).toUpperCase()}</span>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "var(--color-text-header)", lineHeight: 1.3 }}>{draft.name || tenant.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#FF6B00", fontWeight: 700 }}>{planLabel} Plan</p>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ background: tenant.is_archived ? "#e0e0e0" : expired ? "#fee2e2" : expiringSoon ? "#fff7ed" : "#d5f5e0", color: tenant.is_archived ? "#666" : expired ? "#991B1B" : expiringSoon ? "#92400E" : "#1e8449", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {tenant.is_archived ? "Archived" : expired ? "Expired" : expiringSoon ? `Expiring in ${daysLeft}d` : "Active"}
                </span>
              </div>

              {/* Subscription dates */}
              {endsAt && (
                <div style={{ background: "var(--color-bg-subtle)", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Subscription Ends</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: expired ? "#DC2626" : expiringSoon ? "#D97706" : "var(--color-text-header)" }}>
                    {endsAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {statItems.map(st => (
                  <div key={st.label} onClick={st.onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--color-bg-subtle)", borderRadius: 8, cursor: "pointer", border: `1px solid ${st.color}22`, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = st.color + "12")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--color-bg-subtle)")}>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{st.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: st.color }}>{st.val}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Editable Sections */}
        <div className="vt-right">
          {/* Company Info */}
          <div style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow)", marginBottom: 20 }}>
            <SectionTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} title="Company Information" />
            <div style={{ border: "1px solid var(--color-border)", margin: 16, borderRadius: 10, overflow: "hidden" }}>
              <FieldRow label="Company Name" value={draft.name ?? ""} editing={editing} onChange={upd("name")} />
              <FieldRow label="Industry" value={draft.industry ?? ""} editing={editing} onChange={upd("industry")} />
              <FieldRow label="Description" value={draft.description ?? ""} editing={editing} onChange={upd("description")} />
              <FieldRow label="Country" value={draft.country ?? ""} editing={editing} onChange={upd("country")} />
              <FieldRow label="Office Address" value={draft.office_address ?? ""} editing={editing} onChange={upd("office_address")} />
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow)", marginBottom: 20 }}>
            <SectionTitle icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.35 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} title="Contact & Socials" />
            <div style={{ border: "1px solid var(--color-border)", margin: 16, borderRadius: 10, overflow: "hidden" }}>
              <FieldRow label="Contact Person" value={draft.contact_person ?? ""} editing={editing} onChange={upd("contact_person")} />
              <FieldRow label="Contact Email" value={draft.contact_email ?? ""} editing={editing} onChange={upd("contact_email")} />
              <FieldRow label="Phone Number" value={draft.phone_number ?? ""} editing={editing} onChange={upd("phone_number")} />
              <FieldRow label="Website" value={draft.website_url ?? ""} editing={editing} onChange={upd("website_url")} />
              <FieldRow label="Facebook" value={draft.facebook_url ?? ""} editing={editing} onChange={upd("facebook_url")} />
              <FieldRow label="LinkedIn" value={draft.linkedin_url ?? ""} editing={editing} onChange={upd("linkedin_url")} />
              <FieldRow label="Twitter / X" value={draft.twitter_url ?? ""} editing={editing} onChange={upd("twitter_url")} />
            </div>
          </div>

          {/* Save / Cancel */}
          {editing && (
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingBottom: 12 }}>
              <button onClick={handleCancel} style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, color: "var(--color-text-muted)", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: saving ? "var(--color-border)" : "linear-gradient(135deg, #FF8C00, #FF6B00)", color: saving ? "var(--color-text-muted)" : "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showSubHistory && <SubHistoryModal companyId={tenant.id} onClose={() => setShowSubHistory(false)} />}
      {showMgmt && <MgmtModal companyId={tenant.id} onClose={() => setShowMgmt(false)} />}
    </div>
  );
};

export default ViewTenant;
