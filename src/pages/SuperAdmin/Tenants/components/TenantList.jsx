import { useState, useMemo } from "react";
import {
  PageContainer,
  PageHeading,
  StatGrid,
  StatCard,
  MainGrid,
  Card,
  CardHeader,
  CardFooter,
  TableHeader,
  TableRow,
  Pill,
  TenantLogo,
  Chip,
  Select,
  PrimaryButton,
  GhostButton,
  IconButton,
  ProgressBar,
  EmptyState,
} from "../../components/SALayout";

const TenantList = ({ tenants = [], onAdd, onView }) => {
  const [selected, setSelected] = useState([]);
  const [clickTimers, setClickTimers] = useState({});
  const [hoveredId, setHoveredId] = useState(null);

  // Client-side toolbar filter state
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Manual double-click detection (works on mobile too)
  const handleNameClick = (tenant) => {
    if (clickTimers[tenant.id]) {
      clearTimeout(clickTimers[tenant.id]);
      setClickTimers((prev) => {
        const n = { ...prev };
        delete n[tenant.id];
        return n;
      });
      onView(tenant);
    } else {
      const timer = setTimeout(() => {
        setClickTimers((prev) => {
          const n = { ...prev };
          delete n[tenant.id];
          return n;
        });
      }, 350);
      setClickTimers((prev) => ({ ...prev, [tenant.id]: timer }));
    }
  };

  // Filtered rows
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q)) return false;
      }
      if (selectedPlan !== "All" && t.plan !== selectedPlan) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      return true;
    });
  }, [tenants, search, selectedPlan, statusFilter]);

  const hasActiveFilters = search.trim() !== "" || selectedPlan !== "All" || statusFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setSelectedPlan("All");
    setStatusFilter("All");
  };

  const handleSelectAll = () => {
    const allFilteredSelected =
      filteredTenants.length > 0 &&
      filteredTenants.every((t) => selected.includes(t.id));
    if (allFilteredSelected) {
      const filteredIds = new Set(filteredTenants.map((t) => t.id));
      setSelected((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = filteredTenants.map((t) => t.id);
      setSelected((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  // 4 StatCards calculation
  const totalCount = tenants.length;
  const activeCount = tenants.filter((t) => t.status === "Active").length;
  const inactiveCount = tenants.filter((t) => t.status === "Inactive").length;

  const hasLearners = tenants.some((t) => t.stats?.learners !== undefined);
  const totalLearners = tenants.reduce((acc, t) => acc + (t.stats?.learners || 0), 0);
  const enterpriseCount = tenants.filter((t) => t.plan === "Enterprise").length;

  // Plan distribution for right-hand card
  const plans = ["Institute", "Enterprise", "Personal"];
  const planStats = plans.map((p) => ({
    name: p,
    count: tenants.filter((t) => t.plan === p).length,
    color: p === "Institute" ? "var(--accent)" : p === "Enterprise" ? "var(--red)" : "var(--muted)",
  }));
  const maxPlanCount = Math.max(1, ...planStats.map((p) => p.count));

  return (
    <PageContainer>
      {/* ── Page Heading ── */}
      <PageHeading
        title="Tenant Management"
        subtitle="Manage tenant companies, plans and subscriptions."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GhostButton aria-label="Filter options" title="Filter options">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
            </GhostButton>
            <PrimaryButton onClick={onAdd}>+ Add Tenant</PrimaryButton>
          </div>
        }
      />

      {/* ── 4 Stat Cards ── */}
      <StatGrid columns={4}>
        <StatCard
          label="Total Tenants"
          value={totalCount}
          sub="Registered tenants"
          subColor="var(--muted)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <StatCard
          label="Active"
          value={activeCount}
          sub="Currently active"
          subColor="var(--green)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="Inactive"
          value={inactiveCount}
          sub="Not active"
          subColor="var(--red)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        {hasLearners ? (
          <StatCard
            label="Total Learners"
            value={totalLearners}
            sub="Across all tenants"
            subColor="var(--accent-text)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        ) : (
          <StatCard
            label="Enterprise Plans"
            value={enterpriseCount}
            sub="Enterprise tier"
            subColor="var(--red)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            }
          />
        )}
      </StatGrid>

      {/* ── Main Grid ── */}
      <MainGrid>
        {/* LEFT COLUMN: Table + Toolbar Card */}
        <Card>
          <CardHeader
            title="Tenants List"
            count={`${filteredTenants.length} of ${tenants.length}`}
          />

          {/* Toolbar inside Card */}
          <div style={{ padding: "0 20px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tenants by name..."
                  aria-label="Search tenants by name"
                  style={{
                    width: "100%",
                    height: 38,
                    borderRadius: 10,
                    background: "var(--bg)",
                    border: "1px solid var(--line)",
                    padding: "0 12px 0 34px",
                    fontSize: 13,
                    color: "var(--text)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
                />
                <svg
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", stroke: "var(--muted)" }}
                  width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Status Select */}
              <div style={{ width: 140 }}>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  aria-label="Filter by status"
                  options={[
                    { value: "All", label: "All Statuses" },
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-text)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Plan Chips */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Chip
                label="All Plans"
                count={tenants.length}
                active={selectedPlan === "All"}
                onClick={() => setSelectedPlan("All")}
              />
              <Chip
                label="Institute"
                count={tenants.filter((t) => t.plan === "Institute").length}
                active={selectedPlan === "Institute"}
                onClick={() => setSelectedPlan(selectedPlan === "Institute" ? "All" : "Institute")}
                color="var(--accent)"
              />
              <Chip
                label="Enterprise"
                count={tenants.filter((t) => t.plan === "Enterprise").length}
                active={selectedPlan === "Enterprise"}
                onClick={() => setSelectedPlan(selectedPlan === "Enterprise" ? "All" : "Enterprise")}
                color="var(--red)"
              />
              <Chip
                label="Personal"
                count={tenants.filter((t) => t.plan === "Personal").length}
                active={selectedPlan === "Personal"}
                onClick={() => setSelectedPlan(selectedPlan === "Personal" ? "All" : "Personal")}
                color="var(--muted)"
              />
            </div>
          </div>

          {/* Table Header */}
          <TableHeader
            columns={[
              {
                label: (
                  <input
                    type="checkbox"
                    checked={filteredTenants.length > 0 && filteredTenants.every((t) => selected.includes(t.id))}
                    onChange={handleSelectAll}
                    style={{ accentColor: "var(--accent)", width: 16, height: 16, cursor: "pointer", margin: 0 }}
                    aria-label="Select all tenants"
                  />
                ),
                style: { display: "flex", alignItems: "center" },
              },
              { label: "Company" },
              { label: "Plan" },
              { label: "Status" },
              { label: "Joined" },
              { label: "End" },
              { label: "Actions", style: { textAlign: "right" } },
            ]}
            style={{
              gridTemplateColumns: "36px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) 88px",
            }}
          />

          {/* Table Body / Rows */}
          {filteredTenants.length === 0 ? (
            <EmptyState
              title="No tenants match your filters."
              description="Try clearing your search query or selecting a different plan/status."
              action={
                <GhostButton onClick={clearFilters}>
                  Clear filters
                </GhostButton>
              }
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 680 }}>
                {filteredTenants.map((t, idx) => (
                  <TableRow
                    key={t.id}
                    selected={selected.includes(t.id)}
                    isLast={idx === filteredTenants.length - 1}
                    style={{
                      gridTemplateColumns: "36px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1.1fr) 88px",
                    }}
                  >
                    {/* Column 1: Checkbox */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        aria-label={`Select ${t.name}`}
                        style={{ accentColor: "var(--accent)", width: 16, height: 16, cursor: "pointer", margin: 0 }}
                      />
                    </div>

                    {/* Column 2: Company */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <TenantLogo
                        id={t.id}
                        name={t.name}
                        abbr={t.abbr}
                        color={t.color}
                        imgUrl={t.logo || t.imgUrl}
                        size={36}
                      />
                      <div style={{ minWidth: 0 }}>
                        <span
                          onClick={() => handleNameClick(t)}
                          onMouseEnter={() => setHoveredId(t.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          title="Double-click to view"
                          style={{
                            color: hoveredId === t.id || selected.includes(t.id) ? "var(--accent-text)" : "var(--text)",
                            fontWeight: 600,
                            fontSize: 13.5,
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "color .15s",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                          }}
                        >
                          {t.name}
                        </span>
                        <span style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.email || `${t.abbr} Organization`}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Plan */}
                    <div>
                      <Pill variant={t.plan}>{t.plan}</Pill>
                    </div>

                    {/* Column 4: Status */}
                    <div>
                      <Pill variant={t.status}>{t.status}</Pill>
                    </div>

                    {/* Column 5: Joined */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                        {t.joined}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Start date
                      </div>
                    </div>

                    {/* Column 6: End */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                        {t.end}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        Renewal
                      </div>
                    </div>

                    {/* Column 7: Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <IconButton title="Edit" aria-label="Edit tenant" size={32}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </IconButton>
                      <IconButton title="Delete" aria-label="Delete tenant" size={32} variant="danger">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </IconButton>
                    </div>
                  </TableRow>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <CardFooter>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>
                Showing <strong style={{ color: "var(--text)" }}>{filteredTenants.length}</strong> of <strong style={{ color: "var(--text)" }}>{tenants.length}</strong> tenants
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                • Double click a tenant name to open its profile
              </span>
            </div>

            {/* Static pagination restyled like Approvals */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {["‹ Previous", "1", "2", "...", "12", "Next ›"].map((label, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    minWidth: 32,
                    height: 32,
                    padding: "0 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: label === "1" ? 700 : 500,
                    background: label === "1" ? "var(--accent)" : "transparent",
                    color: label === "1" ? "#fff" : "var(--muted)",
                    border: label === "1" ? "none" : "1px solid var(--line)",
                    cursor: "default",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* RIGHT COLUMN: Plans Overview Card */}
        <Card>
          <CardHeader title="Plans Overview" count={`${tenants.length} total`} />
          <div style={{ padding: "4px 20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
            {planStats.map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
                    {p.count}
                  </span>
                </div>
                <ProgressBar
                  progress={(p.count / maxPlanCount) * 100}
                  color={p.color}
                  height={8}
                />
              </div>
            ))}
          </div>
        </Card>
      </MainGrid>
    </PageContainer>
  );
};

export default TenantList;
