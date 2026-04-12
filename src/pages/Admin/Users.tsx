import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserMinus, Clock, Edit2, Trash2, ChevronRight, Plus, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";
import "../User/Dashboard.css";
import "./Users.css";

import type { LucideIcon } from "lucide-react";

/* ── Components ── */

type ActionButtonProps = {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "danger" | "default";
  disabled?: boolean;
};

const ActionButton = ({ icon: Icon, onClick, variant = "default", disabled = false }: ActionButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const colors = {
    bg: (isHovered && !disabled) ? (variant === "danger" ? "#e74c3c" : "#888") : "var(--color-surface)",
    border: (isHovered && !disabled) ? (variant === "danger" ? "#e74c3c" : "#888") : "#ccc",
    icon: (isHovered && !disabled) ? "#fff" : "var(--color-text-header)"
  };

  return (
    <button
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      style={{
        width: 32, height: 32, borderRadius: 6,
        border: `1.5px solid ${colors.border}`,
        background: colors.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.50 : 1
      }}
    >
      <Icon size={14} color={colors.icon} />
    </button>
  );
};

const StatusTag = ({ color, label }: { color: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
    <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: 13 }}>{label}</span>
  </div>
);

const PAGE_SIZE = 5;
const PENDING_COLOR = "#CF591D";

const AdminUsers = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const mockUsers = useMemo(() => [
    { id: 1, name: "Obungus", status: "Active", dept: "IT Dept.", joined: "Jan 02 2026", role: "APPROVER", roleColor: "#e81e63" },
    { id: 2, name: "Ian Emmanuel Palabrica", status: "Active", dept: "IT Dept.", joined: "Jan 02 2026", role: "ADMIN", roleColor: "#673ab7" },
    { id: 3, name: "Maverick Andres", status: "Active", dept: "HR Dept.", joined: "Jan 02 2026", role: "COURSE CREATOR", roleColor: "#27ae60" },
    { id: 4, name: "John Smith", status: "Active", dept: "Sales", joined: "Feb 12 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 5, name: "Maria Garcia", status: "Pending", dept: "Marketing", joined: "Mar 05 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 6, name: "Sarah Wilson", status: "Inactive", dept: "Operations", joined: "Dec 15 2025", role: "USER", roleColor: "#FF6B00" },
    { id: 7, name: "David Johnson", status: "Active", dept: "Finance", joined: "Jan 20 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 8, name: "Emma Brown", status: "Active", dept: "IT Dept.", joined: "Feb 01 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 9, name: "Liu Wei", status: "Pending", dept: "HR Dept.", joined: "Mar 10 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 10, name: "James Miller", status: "Active", dept: "Sales", joined: "Feb 22 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 11, name: "Elena Popova", status: "Active", dept: "Marketing", joined: "Jan 30 2026", role: "USER", roleColor: "#FF6B00" },
    { id: 12, name: "Jane Foster", status: "Active", dept: "Operation", joined: "Jan 30 2026", role: "USER", roleColor: "#FF6B00" },
  ], []);

  const stats = useMemo(() => [
    { label: "Total Users", value: mockUsers.length, icon: Users, sub: "All registered", subColor: "#888" },
    { label: "Active", value: mockUsers.filter(u => u.status === "Active").length, icon: UserCheck, sub: "Currently active", subColor: "#27ae60" },
    { label: "Inactive", value: mockUsers.filter(u => u.status === "Inactive").length, icon: UserMinus, sub: "Requires attention", subColor: "#c0392b" },
    { label: "Pending", value: mockUsers.filter(u => u.status === "Pending").length, icon: Clock, sub: "Awaiting approval", subColor: PENDING_COLOR },
  ], [mockUsers]);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(u => {
      const matchRole = roleFilter === "All Roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === "All Status" || u.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDept = deptFilter === "All Departments" || u.dept.toLowerCase().includes(deptFilter.toLowerCase());
      return matchRole && matchStatus && matchDept;
    });
  }, [mockUsers, roleFilter, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const departments = useMemo(() => {
    const sets = new Set(mockUsers.map(u => u.dept));
    return ["All Departments", ...Array.from(sets)];
  }, [mockUsers]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search users, courses, ..." role="Admin" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>

            <div className="dash-top">
              <div className="dash-top-greeting"></div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Users</h1>
                <div className="dash-top-btn-wrap">
                  <Button size="sm" rounded="pill" leftIcon={<Plus size={16} />} onClick={() => navigate(`/${slug}/users/add`)}>Add User</Button>
                </div>
            </div>

            <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            <div className="users-page-container">

              {/* Filters */}
              <div className="users-filters">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  className="users-filter-select"
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Approver</option>
                  <option>Course Creator</option>
                  <option>User</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="users-filter-select"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>

                <select
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                  className="users-filter-select"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Users Table Box */}
              <div className="users-table-card">

                <div className="users-table-header">
                  <div>Name</div>
                  <div>Status</div>
                  <div>Department</div>
                  <div>Role</div>
                  <div>Joined</div>
                  <div>Actions</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {paginatedUsers.map((u, i) => (
                    <div key={u.id} className="users-table-row">

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={16} color="var(--color-text-muted)" />
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 14 }}>{u.name}</div>
                      </div>

                      <StatusTag
                        label={u.status}
                        color={u.status === "Active" ? "#27ae60" : u.status === "Pending" ? PENDING_COLOR : "#c0392b"}
                      />

                      <div style={{ color: "var(--color-text)", fontWeight: 500 }}>{u.dept}</div>

                      <StatusTag
                        label={u.role}
                        color={u.roleColor}
                      />

                      <div style={{ color: "var(--color-text)", fontSize: 13 }}>{u.joined}</div>


                      <div style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
                        <ActionButton icon={Eye} />
                        <ActionButton icon={Edit2} disabled={u.role.toLowerCase() !== "user"} />
                        <ActionButton icon={Trash2} variant="danger" disabled={u.role.toLowerCase() !== "user"} />
                      </div>

                    </div>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <div className="users-empty-state">No users found matching your filters.</div>
                  )}
                </div>

                {/* Footer (Pagination) */}
                <div className="users-table-footer">
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} Users
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: currentPage === 1 ? "default" : "pointer", fontSize: 12, opacity: currentPage === 1 ? 0.5 : 1 }}
                    >&lt;</button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          padding: "4px 10px",
                          background: currentPage === i + 1 ? "#FF6B00" : "var(--color-surface)",
                          border: `1px solid ${currentPage === i + 1 ? "#FF6B00" : "var(--color-border)"}`,
                          borderRadius: 4, cursor: "pointer", fontSize: 12,
                          color: currentPage === i + 1 ? "white" : "var(--color-text)", fontWeight: 700
                        }}
                      >{i + 1}</button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: currentPage === totalPages ? "default" : "pointer", fontSize: 12, opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >&gt;</button>
                  </div>
                </div>

              </div>

            </div>

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
