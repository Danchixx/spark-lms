import { useState } from "react";
import { MOCK_TENANTS } from "../../../data/mockTenants";
import TenantList from "./components/TenantList";
import ViewTenant from "./components/ViewTenant";
import AddTenant from "./components/AddTenant";
import PageTransition from "../../../components/common/PageTransition/PageTransition";

// ── Types ─────────────────────────────────────────────────────
interface TenantStats {
  revenue?: string;
  subscriptions?: number;
  management: number;
  learners: number;
  courses: number;
}

export interface Tenant {
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
  stats: TenantStats;
  lastActive?: string;
  courseActivity?: Array<{ name: string; progress: number; totalUsers: number }>;
  archived_at?: string;
}

interface FinishPayload {
  form: AddTenantForm;
  selectedPlan: string | null;
  roles?: Record<string, boolean>;
  roleData?: Record<string, { username: string; password: string }>;
}

export interface AddTenantForm {
  companyName: string;
  details: string;
  phone: string;
  email: string;
  facebook: string;
  profileImg: string | null;
  bgImg: string | null;
}

// ── Success toast overlay ─────────────────────────────────────
const SuccessToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.35)",
      zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
  >
    <div style={{
      background: "#fff", borderRadius: 14,
      padding: "36px 40px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 14,
      textAlign: "center", maxWidth: 300,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: "#FF6B00",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>{message}</div>
      <div style={{ fontSize: 12, color: "#aaa" }}>Click anywhere to dismiss</div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────
const SparkTenants = ({ sidebarOpen = true }: { sidebarOpen?: boolean }) => {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS as Tenant[]);
  const [view, setView] = useState<"list" | "view" | "add">("list");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleView = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setView("view");
  };

  const handleAdd = () => setView("add");

  const handleBackToList = () => {
    setView("list");
    setSelectedTenant(null);
  };

  const handleEdit = (id: number, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setToast("Tenant updated successfully");
    setTimeout(() => setToast(null), 2800);
  };

  const handleArchive = (id: number) => {
    const archiveDate = new Date().toISOString();
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: "Archived", archived_at: archiveDate } : t));
    setToast("Tenant archived successfully");
    setTimeout(() => setToast(null), 2800);
  };

  const handleFinish = ({ form, selectedPlan }: FinishPayload) => {
    const now = new Date();
    const next = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newTenant: Tenant = {
      id: tenants.length + 1,
      name: form.companyName || "New Company",
      plan: selectedPlan
        ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
        : "Personal",
      status: "Active",
      joined: fmt(now),
      end: fmt(next),
      abbr: (form.companyName || "NEW").slice(0, 5).toUpperCase(),
      color: "#607d8b",
      email: form.email || "",
      phone: form.phone || "",
      facebook: form.facebook || "",
      stats: { revenue: "0", management: 0, learners: 0, courses: 0 },
    };

    setTenants((prev) => [...prev, newTenant]);
    setView("list");
    setToast("New tenant has been added");
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <PageTransition style={{ height: "100%", display: "flex" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%" }}>
      {view === "list" && (
        <TenantList
          tenants={tenants}
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          onArchive={handleArchive}
        />
      )}

      {view === "view" && selectedTenant && (
        <ViewTenant
          tenant={selectedTenant}
          onBack={handleBackToList}
        />
      )}

      {view === "add" && (
        <AddTenant
          onBack={handleBackToList}
          onFinish={handleFinish}
          sidebarOpen={sidebarOpen}
        />
      )}

      {toast && (
        <SuccessToast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
    </PageTransition>
  );
};

export default SparkTenants;
