import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserMinus, Clock, Edit2, Trash2, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";
import "../User/Dashboard.css";

import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  sub: string;
  subColor: string;
};

const AdminUsers = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const stats: StatItem[] = [
    { label: "Total Users", value: 32, icon: Users, sub: "All registered", subColor: "#888" },
    { label: "Active", value: 26, icon: UserCheck, sub: "Currently active", subColor: "#27ae60" },
    { label: "Inactive", value: 3, icon: UserMinus, sub: "Requires attention", subColor: "#c0392b" },
    { label: "Pending", value: 3, icon: Clock, sub: "Awaiting approval", subColor: "#FF6B00" },
  ];

  const mockUsers = [
    { name: "Obungus", status: "Active", dept: "IT Dept.", joined: "Jan 02 2026", role: "APPROVER", roleColor: "#e81e63" },
    { name: "Ian Emmanuel Palabrica", status: "Active", dept: "IT Dept.", joined: "Jan 02 2026", role: "ADMIN", roleColor: "#673ab7" },
    { name: "Maverick Andres", status: "Active", dept: "HR Dept.", joined: "Jan 02 2026", role: "COURSE CREATOR", roleColor: "#27ae60" },
    { name: "Fname Mname Lname", status: "Active", dept: "IT Dept.", joined: "Jan 02 2026", role: "USER", roleColor: "#FF6B00" },
    { name: "Fname Mname Lname", status: "Pending", dept: "IT Dept.", joined: "Jan 02 2026", role: "USER", roleColor: "#FF6B00" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search users, courses, ..." role="Admin" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            
            {/* Top Toolbar */}
            <div className="dash-top">
                <div className="dash-top-greeting"></div>
                <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Users</h1>
                <div className="dash-top-btn-wrap">
                  <Button size="sm" rounded="pill" leftIcon={<Plus size={16} />}>Add User</Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            {/* Main Content Area */}
            <div style={{ paddingBottom: 40 }}>
              
              {/* Filters */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <select style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-text-header)", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      <option>All Roles</option>
                      <option>Admin</option>
                      <option>Approver</option>
                      <option>Creator</option>
                      <option>User</option>
                  </select>

                  <select style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, color: "var(--color-text-header)", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Pending</option>
                  </select>
              </div>

              {/* Users Table Box */}
              <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "0", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
                
                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.5fr 1fr 1.5fr 1.5fr", padding: "16px 24px", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", background: "var(--color-bg-subtle)", letterSpacing: "0.05em" }}>
                  <div>Name</div>
                  <div>Status</div>
                  <div>Department</div>
                  <div>Joined</div>
                  <div>Role</div>
                  <div style={{ textAlign: "right" }}>Actions</div>
                </div>

                {/* Table Rows */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {mockUsers.map((u, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.5fr 1fr 1.5fr 1.5fr", alignItems: "center", padding: "16px 24px", borderBottom: i < mockUsers.length - 1 ? "1px solid var(--color-border)" : "none", fontSize: 13 }}>
                      
                      {/* Name Col */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={16} color="var(--color-text-muted)" />
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 14 }}>{u.name}</div>
                      </div>

                      {/* Status Col */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.status === "Active" ? "#27ae60" : u.status === "Pending" ? "#FF6B00" : "#c0392b" }} />
                        <span style={{ fontWeight: 600, color: "var(--color-text)", fontSize: 13 }}>{u.status}</span>
                      </div>

                      {/* Department Col */}
                      <div style={{ color: "var(--color-text)", fontWeight: 500 }}>{u.dept}</div>

                      {/* Joined */}
                      <div style={{ color: "var(--color-text)", fontSize: 12 }}>
                          <div>{u.joined.substring(0, 6)}</div>
                          <div style={{ color: "var(--color-text-muted)" }}>{u.joined.substring(7)}</div>
                      </div>

                      {/* Role */}
                      <div style={{ fontWeight: 800, color: u.roleColor, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{u.role}</div>

                      {/* Actions */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Edit2 size={14} color="var(--color-text-muted)" />
                          </button>
                          <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Trash2 size={14} color="var(--color-text-muted)" />
                          </button>
                          <Button variant="outline" size="sm" rounded="pill" rightIcon={<ChevronRight size={14} />}>View</Button>
                      </div>

                    </div>
                  ))}
                </div>
                
                {/* Footer (Pagination) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-subtle)" }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Showing 1-5 of 32 Users</div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "var(--color-text)" }}>&lt;</button>
                        <button style={{ padding: "4px 8px", background: "#FF6B00", border: "1px solid #FF6B00", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "white", fontWeight: 700 }}>1</button>
                        <button style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "var(--color-text)" }}>2</button>
                        <button style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "var(--color-text)" }}>3</button>
                        <button style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "var(--color-text)" }}>...</button>
                        <button style={{ padding: "4px 8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer", fontSize: 12, color: "var(--color-text)" }}>&gt;</button>
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
