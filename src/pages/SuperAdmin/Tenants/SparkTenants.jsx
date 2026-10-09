import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { logAuditEvent } from "../../../services/auditService";
import { useAuth } from "../../../context/AuthContext";
import { getStableTenantColor } from "../components/tenantColors";
import { MOCK_TENANTS } from "../../../data/mockTenants";
import TenantList from "./components/TenantList";
import ViewTenant from "./components/ViewTenant";
import AddTenant from "./components/AddTenant";
import PageTransition from "../../../components/common/PageTransition";

// ── Success toast overlay ─────────────────────────────────────
const SuccessToast = ({ message, onClose }) => (
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
      background: "var(--card, #fff)", borderRadius: 14,
      padding: "36px 40px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 14,
      textAlign: "center", maxWidth: 300,
      border: "1px solid var(--line, rgba(0,0,0,0.1))",
      boxShadow: "var(--shadow, 0 4px 20px rgba(0,0,0,0.15))"
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
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text, #333)" }}>{message}</div>
      <div style={{ fontSize: 12, color: "var(--muted, #aaa)" }}>Click anywhere to dismiss</div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────
const SparkTenants = ({ sidebarOpen = true }) => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState(MOCK_TENANTS);
  const [view, setView] = useState("list");       // "list" | "view" | "add"
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [toast, setToast] = useState(null);

  const loadTenants = useCallback(async () => {
    try {
      const { data: companies, error: compErr } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url, created_at, is_archived")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (compErr) throw compErr;

      if (companies && companies.length > 0) {
        // Fetch learner & staff counts per company
        const { data: usersData } = await supabase
          .from("users")
          .select("company_id, roles(name)")
          .eq("is_archived", false);

        // Fetch courses per company
        const { data: coursesData } = await supabase
          .from("courses")
          .select("company_id");

        const fmt = (d) =>
          new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

        const mapped = companies.map((c) => {
          const cUsers = usersData?.filter((u) => u.company_id === c.id) || [];
          const management = cUsers.filter((u) => {
            const r = Array.isArray(u.roles) ? u.roles[0]?.name : u.roles?.name;
            return r === "admin" || r === "course creator" || r === "approver";
          }).length;
          const learners = cUsers.filter((u) => {
            const r = Array.isArray(u.roles) ? u.roles[0]?.name : u.roles?.name;
            return r === "user";
          }).length;
          const cCourses = coursesData?.filter((co) => co.company_id === c.id) || [];

          const createdDate = c.created_at ? new Date(c.created_at) : new Date();
          const nextYear = new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000);

          return {
            id: c.id,
            name: c.name,
            plan: "Institute",
            status: c.is_archived ? "Inactive" : "Active",
            joined: fmt(createdDate),
            end: fmt(nextYear),
            abbr: (c.slug || c.name || "TEN").slice(0, 5).toUpperCase(),
            color: getStableTenantColor(c.id),
            email: `${c.slug || "admin"}@company.com`,
            stats: {
              revenue: "₱0",
              management,
              learners,
              courses: cCourses.length,
            },
            courseActivity: [
              { course: "Sales Fundamentals", progress: 85 },
              { course: "Digital Marketing", progress: 60 }
            ],
            lastActive: new Date().toISOString(),
          };
        });

        setTenants(mapped);
      }
    } catch (err) {
      console.warn("Failed to load live tenants, keeping mock data:", err);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleView = (tenant) => {
    setSelectedTenant(tenant);
    setView("view");
  };

  const handleAdd = () => setView("add");

  const handleBackToList = () => {
    setView("list");
    setSelectedTenant(null);
  };

  const handleFinish = async ({ form, selectedPlan }) => {
    try {
      const slug = (form.companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "-");
      const { data: inserted, error: insErr } = await supabase
        .from("companies")
        .insert({
          name: form.companyName || "New Company",
          slug,
        })
        .select()
        .single();

      if (!insErr && inserted) {
        await logAuditEvent({
          action: "REGISTER_TENANT",
          tableName: "companies",
          recordId: inserted.id,
          userId: user?.id || null,
          newValue: {
            name: form.companyName,
            slug,
            plan: selectedPlan,
            email: form.email,
          },
        });
      }

      await loadTenants();
    } catch (err) {
      console.error("Error creating company:", err);
    }

    setView("list");
    setToast("New tenant has been added");
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <PageTransition key={view} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {view === "list" && (
          <TenantList
            tenants={tenants}
            onAdd={handleAdd}
            onView={handleView}
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
      </PageTransition>

      {toast && (
        <SuccessToast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SparkTenants;
