import { useState, useMemo, useEffect } from "react";
import { APPROVAL_COMPANIES, MOCK_PENDING_USERS } from "../../../data/mockApprovals";
import { useAuth } from "../../../context/AuthContext";
import { useSATheme } from "../SAThemeContext";
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
  TenantTag,
  StatusAndDateCell,
  Chip,
  Select,
  PrimaryButton,
  GhostButton,
  IconButton,
  SideListRow,
  ProgressBar,
  EmptyState,
} from "../components/SALayout";
import { getTenantColorStyles } from "../components/tenantColors";
import PageTransition from "../../../components/common/PageTransition";

const ITEMS_PER_PAGE = 5;

// Shared utility components
const Avatar = ({ name, size = 32 }) => {
  const initials = name ? name.split(" ").map(p => p[0]).slice(0, 2).join("") : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--card-2)", border: "1px solid var(--line)",
      display: "grid", placeItems: "center",
      fontSize: 11, fontWeight: 700, flexShrink: 0, color: "var(--text)"
    }}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => <Pill variant={status}>{status}</Pill>;
const getTenantTagStyle = (color, isDark = false) => {
  const s = getTenantColorStyles(color, isDark);
  return { background: s.bg, color: s.text, border: s.border };
};

// Detail Drawer (restyle matching reference drawer)
const DetailDrawer = ({ user, company, onClose, onApprove, onReject, onSuspend, onBan, onReactivate, isDark }) => {
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const canSuspend = ["Approved", "Reactivated"].includes(user.status);
  const canBan = user.status !== "Banned" && user.status !== "Pending" && user.status !== "Rejected";
  const canReactivate = user.status === "Suspended";

  const handleReject = () => {
    if (!note.trim()) { setErr("Please add a note before rejecting."); return; }
    onReject(user, note);
  };

  const handleApprove = () => {
    onApprove(user);
  };

  const tagStyle = getTenantTagStyle(company?.color, isDark);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(2,6,23,.55)",
        zIndex: 140, opacity: 1, pointerEvents: "auto", transition: "opacity .2s"
      }} />
      <aside
        role="dialog"
        aria-label="User approval details"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 100%)",
          background: "var(--bg-side)", borderLeft: "1px solid var(--line)",
          boxShadow: "var(--shadow)", zIndex: 150, display: "flex", flexDirection: "column",
          paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)",
          color: "var(--text)"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "20px 22px 14px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600,
              padding: "5px 10px", borderRadius: 8, ...tagStyle
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: company?.color || "var(--accent)", flex: "none" }} />
              {company?.name}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 2px", color: "var(--text)" }}>{user.name}</h3>
            <p style={{ color: "var(--muted)", fontSize: 12.5, margin: 0 }}>{user.email}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 6,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
          <dl style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "10px 12px", fontSize: 13, marginBottom: 18 }}>
            <dt style={{ color: "var(--muted)" }}>Status</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}><StatusBadge status={user.status} /></dd>
            <dt style={{ color: "var(--muted)" }}>Username</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}>{user.username}</dd>
            <dt style={{ color: "var(--muted)" }}>Job Title</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}>{user.jobTitle || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Department</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}>{user.department || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Gender</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}>{user.gender || "—"}</dd>
            <dt style={{ color: "var(--muted)" }}>Created On</dt>
            <dd style={{ fontWeight: 500, margin: 0 }}>{user.createdOn}</dd>
            {user.assignedCourses && (
              <>
                <dt style={{ color: "var(--muted)" }}>Courses</dt>
                <dd style={{ fontWeight: 500, margin: 0, fontSize: 12, lineHeight: 1.4 }}>
                  {user.assignedCourses.join(", ")}
                </dd>
              </>
            )}
          </dl>

          {user.status === "Pending" && (
            <>
              <label htmlFor="drawer-note" style={{ display: "block", fontWeight: 600, fontSize: 12.5, marginBottom: 6, color: "var(--text)" }}>
                Note to requester <span style={{ color: "var(--muted)", fontWeight: 400 }}>(required when rejecting)</span>
              </label>
              <textarea
                id="drawer-note"
                value={note}
                onChange={e => { setNote(e.target.value); setErr(""); }}
                placeholder="Add a reason or instructions..."
                style={{
                  width: "100%", minHeight: 90, resize: "vertical", background: "var(--bg)",
                  border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px",
                  color: "var(--text)", font: "inherit", outline: "none", boxSizing: "border-box"
                }}
              />
              {err && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>{err}</div>}
            </>
          )}

          {(canSuspend || canBan || canReactivate) && (
            <>
              <label htmlFor="drawer-admin-note" style={{ display: "block", fontWeight: 600, fontSize: 12.5, marginBottom: 6, marginTop: 16, color: "var(--text)" }}>
                Administrative Action Note <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="drawer-admin-note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Reason for suspension or ban..."
                style={{
                  width: "100%", minHeight: 90, resize: "vertical", background: "var(--bg)",
                  border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px",
                  color: "var(--text)", font: "inherit", outline: "none", boxSizing: "border-box"
                }}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--line)" }}>
          {user.status === "Pending" && (
            <>
              <button
                onClick={handleReject}
                style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--red-soft)", color: "var(--red)", border: "none", cursor: "pointer" }}
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--green)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                Approve
              </button>
            </>
          )}
          {canSuspend && <button onClick={() => onSuspend(user, note, "1 week")} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--amber-soft)", color: "var(--amber)", border: "none", cursor: "pointer" }}>Suspend</button>}
          {canBan && <button onClick={() => onBan(user, note)} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--red-soft)", color: "var(--red)", border: "none", cursor: "pointer" }}>Ban</button>}
          {canReactivate && <button onClick={() => onReactivate(user)} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--green-soft)", color: "var(--green)", border: "none", cursor: "pointer" }}>Reactivate</button>}
          {user.status === "Rejected" && <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13, background: "var(--card-2)", color: "var(--text)", border: "1px solid var(--line)", cursor: "pointer" }}>Close</button>}
        </div>
      </aside>
    </>
  );
};

const SparkApprovals = () => {
  const { user: authUser } = useAuth();
  const { theme } = useSATheme();
  const isDark = theme === "dark";

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [allUsers, setAllUsers] = useState(() => {
    const combined = [];
    for (const [compId, usersList] of Object.entries(MOCK_PENDING_USERS)) {
      const comp = APPROVAL_COMPANIES.find(c => c.id === Number(compId));
      if (comp) {
        usersList.forEach(u => {
          combined.push({ ...u, _company: comp });
        });
      }
    }
    return combined;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Pending");
  const [dateFilter, setDateFilter] = useState("Jan 01-Jan 31");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("old");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const showToast = (msg, isError) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  };

  const updateStatus = (user, status, extra = {}) => {
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, status, ...extra } : u));
    showToast(`Request ${status.toLowerCase()}`, false);
    setViewUser(null);
  };

  const handleApprove = (user) => updateStatus(user, "Approved");
  const handleReject = (user, reason) => updateStatus(user, "Rejected", { rejectReason: reason });
  const handleSuspend = (user, reason, duration) => updateStatus(user, "Suspended", { suspendReason: reason, suspendDuration: duration });
  const handleBan = (user, reason) => updateStatus(user, "Banned", { banReason: reason });
  const handleReactivate = (user) => updateStatus(user, "Reactivated", { suspendReason: null });

  // Filtering
  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (selectedCompany) {
      result = result.filter(u => u._company.id === selectedCompany.id);
    }
    if (statusFilter === "All Pending") result = result.filter(u => u.status === "Pending");
    else if (statusFilter !== "All") result = result.filter(u => u.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
    }

    if (deptFilter !== "All") {
      result = result.filter(u => u.department === deptFilter);
    }

    result.sort((a, b) => {
      const aDate = new Date(a.createdOn).getTime();
      const bDate = new Date(b.createdOn).getTime();
      if (sortOrder === "old") return aDate - bDate;
      if (sortOrder === "new") return bDate - aDate;
      if (sortOrder === "group") return a._company.name.localeCompare(b._company.name) || aDate - bDate;
      return 0;
    });

    return result;
  }, [allUsers, selectedCompany, statusFilter, search, deptFilter, sortOrder]);

  const totalPending = useMemo(() => {
    return allUsers.filter(u => u.status === "Pending" && (!selectedCompany || u._company.id === selectedCompany.id)).length;
  }, [allUsers, selectedCompany]);

  const tenantsWaiting = useMemo(() => {
    const tenants = new Set();
    allUsers.forEach(u => {
      if (u.status === "Pending" && (!selectedCompany || u._company.id === selectedCompany.id)) {
        tenants.add(u._company.id);
      }
    });
    return tenants.size;
  }, [allUsers, selectedCompany]);

  const overdueCount = useMemo(() => {
    return allUsers.filter(u => {
      if (u.status !== "Pending" || (selectedCompany && u._company.id !== selectedCompany.id)) return false;
      const days = Math.floor((Date.now() - new Date(u.createdOn).getTime()) / (1000 * 60 * 60 * 24));
      return days > 2;
    }).length;
  }, [allUsers, selectedCompany]);

  // Derived options for department
  const deptOptions = useMemo(() => {
    const opts = new Set(["All"]);
    let pool = allUsers;
    if (selectedCompany) pool = allUsers.filter(u => u._company.id === selectedCompany.id);
    pool.forEach(u => {
      if (u.department) opts.add(u.department);
    });
    return Array.from(opts).map(d => ({ value: d, label: d }));
  }, [allUsers, selectedCompany]);

  // Oldest 3 waiting users
  const oldestWaiting = useMemo(() => {
    return allUsers
      .filter(u => u.status === "Pending")
      .sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime())
      .slice(0, 3);
  }, [allUsers]);

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setPage(1);
  };
  const handleBack = () => {
    setSelectedCompany(null);
    setPage(1);
  };
  const clearFilters = () => {
    setSelectedCompany(null);
    setSearch("");
    setStatusFilter("All Pending");
    setDeptFilter("All");
    setSortOrder("old");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filteredUsers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <PageTransition>
      <PageContainer>
      {/* Heading */}
      <PageHeading
        backButton={
          selectedCompany ? (
            <button
              onClick={handleBack}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none",
                color: "var(--muted)", fontWeight: 600, fontSize: 13, padding: 0, cursor: "pointer"
              }}
            >
              ← Back to all tenants
            </button>
          ) : null
        }
        greeting={`Hello ${authUser?.name?.split(" ")[0] || "Admin"}, welcome back!`}
        title="Pending Approvals"
        subtitle="Review pending user approvals from each tenant."
        actions={
          <PrimaryButton
            onClick={() => {
              setSortOrder("old");
              const oldest = [...filteredUsers].sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
              if (oldest.length) setViewUser(oldest[0]);
            }}
            icon={
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
            }
          >
            Review Oldest First
          </PrimaryButton>
        }
      />

      {/* 4 Stat Cards */}
      <StatGrid columns={4}>
        <StatCard
          label="Total Pending"
          value={totalPending}
          sub="Needs your decision"
          subColor="var(--accent-text)"
          icon={
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ stroke: "var(--accent)", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>
            </svg>
          }
        />
        <StatCard
          label="Tenants Waiting"
          value={tenantsWaiting}
          sub="With open requests"
          subColor="var(--muted)"
          icon={
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ stroke: "var(--muted)", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>
            </svg>
          }
        />
        <StatCard
          label="Overdue (over 2 days)"
          value={overdueCount}
          sub="Review first"
          subColor="var(--red)"
          icon={
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ stroke: "var(--red)", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
            </svg>
          }
        />
        <StatCard
          label="Total Users"
          value={selectedCompany ? selectedCompany.totalUsers : APPROVAL_COMPANIES.reduce((sum, c) => sum + c.totalUsers, 0)}
          sub="Registered"
          subColor="var(--green)"
          icon={
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ stroke: "var(--green)", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>
            </svg>
          }
        />
      </StatGrid>

      {/* Main Grid: Queue on left, Side Col on right */}
      <MainGrid>
        {/* Left Column - Queue */}
        <Card>
          <CardHeader
            title="Approval Queue"
            actions={
              <button onClick={clearFilters} style={{ color: "var(--accent-text)", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                Clear filters
              </button>
            }
          />

          {/* Tenant Filter Chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 20px 14px" }}>
            <Chip
              label="All Tenants"
              count={allUsers.filter(u => u.status === "Pending").length}
              active={!selectedCompany}
              onClick={handleBack}
            />
            {APPROVAL_COMPANIES.map(comp => {
              const pendingForComp = allUsers.filter(u => u.status === "Pending" && u._company.id === comp.id).length;
              return (
                <Chip
                  key={comp.id}
                  label={comp.name}
                  color={comp.color}
                  count={pendingForComp}
                  active={selectedCompany?.id === comp.id}
                  onClick={() => handleSelectCompany(comp)}
                />
              );
            })}
          </div>

          {/* Filter Toolbar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "0 20px 14px" }}>
            <div style={{ flex: "1 1 180px", display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 10, padding: "0 12px", height: 38, color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "currentColor", fill: "none", strokeWidth: 1.8 }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users by name or email..."
                aria-label="Search users"
                style={{ background: "none", border: 0, color: "var(--text)", font: "inherit", outline: 0, minWidth: 0, width: "100%" }}
              />
            </div>
            <div style={{ flexShrink: 0, width: 140 }}>
              <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} aria-label="Status filter" options={[
                { value: "All Pending", label: "All Pending" }, { value: "All", label: "All" }, { value: "Approved", label: "Approved" }, { value: "Rejected", label: "Rejected" }, { value: "Suspended", label: "Suspended" }, { value: "Banned", label: "Banned" }, { value: "Reactivated", label: "Reactivated" }
              ]} />
            </div>
            <div style={{ flexShrink: 0, width: 140 }}>
              <Select value={dateFilter} onChange={setDateFilter} aria-label="Date range filter" options={[
                { value: "Jan 01-Jan 31", label: "Jan 01-Jan 31" }, { value: "Feb 01-Feb 28", label: "Feb 01-Feb 28" }, { value: "Mar 01-Mar 31", label: "Mar 01-Mar 31" }
              ]} />
            </div>
            <div style={{ flexShrink: 0, width: 140 }}>
              <Select value={deptFilter} onChange={v => { setDeptFilter(v); setPage(1); }} aria-label="Department filter" options={deptOptions} />
            </div>
            <PrimaryButton onClick={() => setPage(1)} icon={<svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 1.8 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>}>
              Filter
            </PrimaryButton>
            <div style={{ flexShrink: 0, width: 140 }}>
              <Select value={sortOrder} onChange={v => { setSortOrder(v); setPage(1); }} aria-label="Sort order" options={[
                { value: "old", label: "Oldest first" }, { value: "new", label: "Newest first" }, { value: "group", label: "By tenant" }
              ]} />
            </div>
          </div>

          {/* Table Header */}
          <TableHeader
            columns={[
              { label: "User", style: {} },
              { label: "Tenant", style: {} },
              { label: "Status & Date", style: {} },
              { label: "Waiting", style: {} },
              { label: "Action", style: { textAlign: "right" } },
            ]}
            style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.3fr) 96px 190px" }}
          />

          {/* Table Body */}
          <div>
            {paged.length === 0 ? (
              <EmptyState
                icon={<svg viewBox="0 0 24 24" style={{ width: 40, height: 40, color: "var(--green)", stroke: "currentColor", fill: "none", strokeWidth: 1.8 }}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>}
                title={filteredUsers.length === 0 && allUsers.length > 0 ? "No pending approvals match your filters." : "All caught up. There are no pending approvals right now."}
                action={
                  <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--accent-text)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                    Clear filters
                  </button>
                }
              />
            ) : paged.map((u, i) => {
              const comp = u._company;
              const daysWaiting = Math.floor((Date.now() - new Date(u.createdOn).getTime()) / (1000 * 60 * 60 * 24));
              let waitColor = "var(--muted)";
              if (daysWaiting === 1) waitColor = "var(--amber)";
              else if (daysWaiting >= 2) waitColor = "var(--red)";

              return (
                <TableRow
                  key={u.id}
                  onClick={() => setViewUser(u)}
                  isLast={i === paged.length - 1}
                  style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1.3fr) 96px 190px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={u.name} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                    </div>
                  </div>
                  <div>
                    <TenantTag name={comp?.name} color={comp?.color} id={comp?.id} />
                  </div>
                  <div>
                    <StatusAndDateCell status={u.status} date={u.createdOn} />
                  </div>
                  <div>
                    {u.status === "Pending" ? (
                      <span style={{ fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, color: waitColor }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: "currentColor", fill: "none", strokeWidth: 1.8 }}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                        {daysWaiting}d
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>—</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                    {u.status === "Pending" && (
                      <>
                        <IconButton
                          onClick={e => { e.stopPropagation(); handleApprove(u); }}
                          aria-label={`Approve ${u.name}`}
                          title="Quick Approve"
                          style={{ background: "var(--green-soft)", color: "var(--green)", border: "none" }}
                        >
                          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "currentColor", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </IconButton>
                        <IconButton
                          onClick={e => { e.stopPropagation(); setViewUser(u); }}
                          aria-label={`Reject ${u.name}`}
                          title="Quick Reject (opens note)"
                          style={{ background: "var(--red-soft)", color: "var(--red)", border: "none" }}
                        >
                          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "currentColor", fill: "none", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" }}>
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </IconButton>
                      </>
                    )}
                    <GhostButton
                      onClick={e => { e.stopPropagation(); setViewUser(u); }}
                      style={{ height: 34, padding: "0 12px", fontSize: 12 }}
                      icon={<svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: "currentColor", fill: "none", strokeWidth: 1.8 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    >
                      VIEW
                    </GhostButton>
                  </div>
                </TableRow>
              );
            })}
          </div>

          {/* Table Footer */}
          <CardFooter>
            <span>Showing {paged.length} of {filteredUsers.length} pending approvals</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  minWidth: 32, height: 32, padding: "0 10px", border: "1px solid var(--line)",
                  background: "var(--card)", borderRadius: 6, cursor: safePage === 1 ? "not-allowed" : "pointer",
                  fontSize: 12, fontWeight: 500, color: safePage === 1 ? "var(--muted)" : "var(--text)",
                  opacity: safePage === 1 ? 0.45 : 1
                }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    minWidth: 32, height: 32, padding: "0 10px", border: "1px solid",
                    borderColor: safePage === p ? "var(--accent)" : "var(--line)",
                    background: safePage === p ? "var(--accent)" : "var(--card)",
                    borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: safePage === p ? 700 : 500,
                    color: safePage === p ? "#fff" : "var(--text)"
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  minWidth: 32, height: 32, padding: "0 10px", border: "1px solid var(--line)",
                  background: "var(--card)", borderRadius: 6, cursor: safePage === totalPages ? "not-allowed" : "pointer",
                  fontSize: 12, fontWeight: 500, color: safePage === totalPages ? "var(--muted)" : "var(--text)",
                  opacity: safePage === totalPages ? 0.45 : 1
                }}
              >
                Next
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Right Column */}
        <aside style={{ display: "grid", gap: 16 }}>
          {/* Card 1: Requests by Tenant */}
          <Card>
            <CardHeader title="Requests by Tenant" />
            <div style={{ padding: "0 20px 14px" }}>
              {APPROVAL_COMPANIES.map(comp => {
                const pendingCount = allUsers.filter(u => u.status === "Pending" && u._company.id === comp.id).length;
                const maxCount = Math.max(...APPROVAL_COMPANIES.map(c => allUsers.filter(u => u.status === "Pending" && u._company.id === c.id).length), 1);
                return (
                  <SideListRow
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp)}
                    icon={<i style={{ width: 8, height: 8, borderRadius: "50%", background: comp.color, display: "inline-block", flexShrink: 0 }} />}
                    title={comp.name}
                    meta={`${comp.totalUsers} users`}
                    badge={<b style={{ fontSize: 13, color: "var(--text)" }}>{pendingCount}</b>}
                    barProgress={(pendingCount / maxCount) * 100}
                    barColor={comp.color}
                  />
                );
              })}
            </div>
          </Card>

          {/* Card 2: Oldest Waiting */}
          <Card>
            <CardHeader title="Oldest Waiting" />
            <div style={{ padding: "0 20px 14px" }}>
              {oldestWaiting.length === 0 ? (
                <div style={{ color: "var(--muted)", textAlign: "center", padding: "12px 0", fontSize: 13 }}>
                  No pending requests waiting.
                </div>
              ) : oldestWaiting.map(u => {
                const daysWaiting = Math.floor((Date.now() - new Date(u.createdOn).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <SideListRow
                    key={u.id}
                    onClick={() => setViewUser(u)}
                    icon={<Avatar name={u.name} size={32} />}
                    title={u.name}
                    meta={
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: u._company?.color }} />
                        {u._company?.name} · <b style={{ color: daysWaiting >= 2 ? "var(--red)" : "var(--amber)", fontWeight: 600 }}>{daysWaiting}d waiting</b>
                      </span>
                    }
                    badge={
                      <PrimaryButton
                        onClick={(e) => { e.stopPropagation(); setViewUser(u); }}
                        style={{ height: 28, padding: "0 10px", fontSize: 11, borderRadius: 6 }}
                      >
                        Review
                      </PrimaryButton>
                    }
                  />
                );
              })}
            </div>
          </Card>
        </aside>
      </MainGrid>

      {/* Detail Drawer */}
      {viewUser && (
        <DetailDrawer
          user={viewUser}
          company={viewUser._company}
          onClose={() => setViewUser(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onReactivate={handleReactivate}
          isDark={isDark}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", left: "50%", bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", transform: "translate(-50%, 0)",
          background: "var(--card-2)", border: "1px solid var(--line)", boxShadow: "var(--shadow)", padding: "12px 18px", borderRadius: 12,
          fontWeight: 600, fontSize: 13, zIndex: 160, display: "flex", gap: 10, alignItems: "center", maxWidth: "calc(100% - 32px)", color: "var(--text)"
        }}>
          <span style={{ color: toast.isError ? "var(--red)" : "var(--green)" }}>
            {toast.isError ? "❌" : "✓"}
          </span>
          {toast.msg}
        </div>
      )}
    </PageContainer>
    </PageTransition>
  );
};

export default SparkApprovals;
