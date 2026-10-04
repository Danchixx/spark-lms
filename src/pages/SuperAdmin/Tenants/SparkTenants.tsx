import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TenantList from "./components/TenantList";
import ViewTenant from "./components/ViewTenant";
import PageTransition from "../../../components/common/PageTransition/PageTransition";
import { fetchTenants, archiveTenant } from "../../../services/tenantService";
import type { TenantCompany } from "../../../services/tenantService";

// Re-export Tenant as a type alias for backward compat with TenantList
export type Tenant = {
  id: number;
  name: string;
  plan: string;
  status: string;
  joined: string;
  end: string;
  abbr: string;
  color: string;
  email: string;
  phone: string;
  facebook?: string;
  stats: { revenue?: string; subscriptions?: number; management: number; learners: number; courses: number; };
  lastActive?: string;
  courseActivity?: Array<{ name: string; progress: number; totalUsers: number }>;
  archived_at?: string;
};

export interface AddTenantForm {
  companyName: string; details: string; phone: string; email: string;
  facebook: string; profileImg: string | null; bgImg: string | null;
}

const toTenant = (c: TenantCompany): Tenant => ({
  id: c.id,
  name: c.name,
  plan: c.subscription_plan ?? "1 Year",
  status: c.is_archived ? "Archived" : "Active",
  joined: c.subscribed_at ? new Date(c.subscribed_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
  end: c.subscription_ends_at ? new Date(c.subscription_ends_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
  abbr: c.name.slice(0, 5).toUpperCase(),
  color: "#FF6B00",
  email: c.contact_email ?? "",
  phone: c.phone_number ?? "",
  facebook: c.facebook_url ?? "",
  stats: { management: 0, learners: 0, courses: 0 },
  archived_at: c.archived_at,
});

const SuccessToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "var(--color-surface)", borderRadius: 14, padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", maxWidth: 300, boxShadow: "0 20px 60px rgba(0,0,0,.2)", border: "1px solid var(--color-border)" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-header)" }}>{message}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Click anywhere to dismiss</div>
    </div>
  </div>
);

const SparkTenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rawCompanies, setRawCompanies] = useState<TenantCompany[]>([]);
  const [view, setView] = useState<"list" | "view">("list");
  const [selectedTenant, setSelectedTenant] = useState<TenantCompany | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTenants = () => {
    setLoading(true);
    fetchTenants()
      .then((companies) => {
        setRawCompanies(companies);
        setTenants(companies.map(toTenant));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTenants(); }, []);

  const handleView = (tenant: Tenant) => {
    const raw = rawCompanies.find(c => c.id === tenant.id) ?? null;
    setSelectedTenant(raw);
    setView("view");
  };

  const handleBackToList = () => { setView("list"); setSelectedTenant(null); };

  const handleEdit = (_id: number, _updates: Partial<Tenant>) => {
    loadTenants();
    setToast("Tenant updated successfully");
    setTimeout(() => setToast(null), 2800);
  };

  const handleArchive = (id: number) => {
    archiveTenant(id)
      .then(() => { loadTenants(); setToast("Tenant archived successfully"); setTimeout(() => setToast(null), 2800); })
      .catch(console.error);
  };

  return (
    <PageTransition style={{ height: "100%", display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%" }}>
        {loading && view === "list" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: "4px solid var(--color-border)", borderTopColor: "#FF6B00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading tenants…</p>
            </div>
          </div>
        )}

        {!loading && view === "list" && (
          <TenantList
            tenants={tenants}
            onAdd={() => navigate("/superadmin/addtenant")}
            onView={handleView}
            onEdit={handleEdit}
            onArchive={handleArchive}
          />
        )}

        {view === "view" && selectedTenant && (
          <ViewTenant
            tenant={selectedTenant}
            onBack={handleBackToList}
            onUpdated={(updated) => {
              setRawCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
              setTenants(prev => prev.map(t => t.id === updated.id ? toTenant(updated) : t));
            }}
          />
        )}

        {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </PageTransition>
  );
};

export default SparkTenants;
