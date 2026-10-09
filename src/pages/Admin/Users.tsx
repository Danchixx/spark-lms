import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, User, UserCheck, UserMinus, Clock, Edit2, Trash2, ChevronRight, Plus, Eye, Loader2, Check, Archive, RefreshCw, Upload, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import { supabase } from "../../lib/supabase";
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
    bg: (isHovered && !disabled) ? (variant === "danger" ? "#e74c3c" : "var(--color-bg-muted)") : "var(--color-surface)",
    border: (isHovered && !disabled) ? (variant === "danger" ? "#e74c3c" : "var(--color-border)") : "var(--color-border)",
    icon: (isHovered && !disabled) ? (variant === "danger" ? "#fff" : "var(--color-text-header)") : "var(--color-text-header)"
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

const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "modal-fade-in 0.2s ease", backdropFilter: "blur(4px)" }}>
    <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: "36px 40px", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", border: "1px solid var(--color-border)" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34, 197, 94, 0.1)", border: "2px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Check size={28} color="#22c55e" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 8px" }}>Success!</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>{message}</p>
      <button onClick={onClose} style={{ background: "#FF6B00", color: "white", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
    </div>
  </div>
);

const AdminUsers = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);

  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [showArchived, setShowArchived] = useState(false);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Batch Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batchUsers, setBatchUsers] = useState<any[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResultMsg, setBatchResultMsg] = useStlyte("");

  const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').filter(r => r.trim() !== '');
    
    const parseRow = (line: string) => {
      const vals = [];
      let cur = '';
      let inQuote = false;
      for(let i=0; i<line.length; i++) {
        if(line[i] === '"') inQuote = !inQuote;
        else if(line[i] === ',' && !inQuote) { vals.push(cur.trim()); cur = ''; }
        else cur += line[i];
      }
      vals.push(cur.trim());
      return vals;
    };
    
    const parsedUsers = [];
    for (let i = 1; i < rows.length; i++) {
       const vals = parseRow(rows[i]).map(v => v.replace(/^"|"$/g, ''));
       parsedUsers.push({
         firstName: vals[0] || "",
         lastName: vals[1] || "",
         email: vals[2] || "",
         contact: vals[3] || "N/A",
         position: vals[4] || "N/A",
         school: vals[5] || "N/A",
         region: vals[6] || "N/A",
         division: vals[7] || "N/A",
         prcId: vals[8] || "N/A"
       });
    }
    
    setBatchUsers(parsedUsers.filter(u => u.email && u.firstName));
    setShowBatchModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmBatchUpload = async () => {
    if (!company) return;
    setIsUploadingBatch(true);
    setBatchProgress(0);
    setBatchResultMsg("");
    let successCount = 0;

    const isSparkCpd = company?.name?.toUpperCase() === "SPARK CPD";

    const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'user').single();
    const roleId = roleData?.id;

    for (let i = 0; i < batchUsers.length; i++) {
      const u = batchUsers[i];
      try {
        const sanitizedCompany = company.name.replace(/\s+/g, '');
        const random4 = Math.floor(1000 + Math.random() * 9000);
        const generatedPassword = `Spark-${sanitizedCompany}-${random4}`;

        const { data: fnData, error: fnError } = await supabase.functions.invoke('create-admin-user', {
          body: { 
            email: u.email, 
            password: generatedPassword,
            name: `${u.firstName} ${u.lastName}`.trim(),
            sendEmail: isSparkCpd
          }
        });

        if (fnError || fnData?.error) {
           console.error("Error creating auth user:", u.email, fnError || fnData?.error);
           continue; 
        }

        const newAuthUser = fnData.user;
        const addressParts = [];
        if (u.region !== "N/A") addressParts.push(u.region);
        if (u.division !== "N/A") addressParts.push(u.division);
        const address = addressParts.length > 0 ? addressParts.join(", ") : null;
        
        const payload = {
          id: newAuthUser.id,
          company_id: company.id,
          role_id: roleId,
          firstname: u.firstName,
          lastname: u.lastName,
          email: u.email,
          password: generatedPassword, 
          contact_no: u.contact !== "N/A" ? u.contact : null,
          address: address,
          employee_id: !isSparkCpd && u.prcId !== "N/A" ? u.prcId : null,
          department: !isSparkCpd && u.school !== "N/A" ? u.school : null,
          job_title: !isSparkCpd && u.position !== "N/A" ? u.position : null,
          cpd_prc_id: isSparkCpd && u.prcId !== "N/A" ? u.prcId : null,
          cpd_position: isSparkCpd && u.position !== "N/A" ? u.position : null,
          cpd_school_name: isSparkCpd && u.school !== "N/A" ? u.school : null,
          created_by: user?.id
        };

        const { error: insertError } = await supabase.from('users').insert(payload);
        if (!insertError) successCount++;
      } catch (err) {
        console.error(err);
      }
      setBatchProgress(Math.round(((i + 1) / batchUsers.length) * 100));
    }

    setIsUploadingBatch(false);
    setShowBatchModal(false);
    setBatchResultMsg(`Successfully added ${successCount} out of ${batchUsers.length} users.`);
    setShowSuccessModal(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (showArchived) {
        // Permanent delete — calls Edge Function which uses service_role
        // to delete from auth.users (cascades to public.users and all related tables)
        const { data, error } = await supabase.functions.invoke('create-admin-user', {
          body: { action: 'delete', userId: deleteTarget }
        });

        if (error) throw new Error(error.message || 'Edge Function invocation failed');
        
        // The Edge Function returns { error: "..." } with status 400/500 on failure
        if (data?.error) throw new Error(data.error);
        setDbUsers(prev => prev.filter(u => u.id !== deleteTarget));
      } else {
        // Archive (soft delete) — no auth changes needed
        const { error } = await supabase.from('users').update({ 
          is_archived: true, 
          archived_at: new Date().toISOString()
        }).eq('id', deleteTarget);
        if (error) throw error;
        setDbUsers(prev => prev.map(u => u.id === deleteTarget ? { ...u, isArchived: true } : u));
      }
      setDeleteTarget(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Failed to process user:", err);
      alert(err?.message || "Failed to process user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreUser = async (id: string) => {
    try {
      const { error } = await supabase.from('users').update({ 
        is_archived: false, 
        archived_at: null
      }).eq('id', id);
      if (error) throw error;
      setDbUsers(prev => prev.map(u => u.id === id ? { ...u, isArchived: false } : u));
    } catch (err) {
      console.error("Failed to restore user:", err);
      alert("Failed to restore user.");
    }
  };

  useEffect(() => {
    if (!company?.id) return;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select(`
            *,
            roles(name)
          `)
          .eq("company_id", company.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mappedUsers = data
          .filter(u => {
            const rName = Array.isArray(u.roles) ? u.roles[0]?.name : (u.roles?.name || 'user');
            return rName !== 'spark_admin' && rName !== 'superadmin';
          })
          .map(u => {
            const roleName = Array.isArray(u.roles) ? u.roles[0]?.name : (u.roles?.name || 'user');
            let roleColor = "#FF6B00";
            if (roleName === "admin") roleColor = "#673ab7";
            if (roleName === "approver") roleColor = "#e81e63";
            if (roleName === "creator" || roleName === "course creator") roleColor = "#27ae60";

            const joinedDateExp = u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Unknown";
            const capStatus = u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : "Pending";

            return {
              id: u.id,
              name: `${u.firstname || ''} ${u.lastname || ''}`.trim() || 'Unknown User',
              status: capStatus,
              dept: (company?.name?.toUpperCase() === "SPARK CPD" ? u.cpd_school_name : u.department) || "N/A",
              joined: joinedDateExp,
              role: roleName.replace('_', ' ').toUpperCase(),
              roleColor: roleColor,
              originalRole: roleName,
              avatar: u.avatar_url,
              isArchived: u.is_archived || false
            };
          });

        setDbUsers(mappedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [company?.id, refreshTrigger]);

  const stats = useMemo(() => [
    { label: "Total Users", value: dbUsers.length, icon: Users, sub: "All registered", subColor: "#888" },
    { label: "Active", value: dbUsers.filter(u => u.status === "Active" || u.status === "active").length, icon: UserCheck, sub: "Currently active", subColor: "#27ae60" },
    { label: "Inactive", value: dbUsers.filter(u => u.status === "Inactive" || u.status === "inactive" || u.status === "archived").length, icon: UserMinus, sub: "Requires attention", subColor: "#c0392b" },
    { label: "Pending", value: dbUsers.filter(u => u.status === "Pending" || u.status === "pending").length, icon: Clock, sub: "Awaiting approval", subColor: PENDING_COLOR },
  ], [dbUsers]);

  const filteredUsers = useMemo(() => {
    return dbUsers.filter(u => {
      if (u.isArchived !== showArchived) return false;
      const matchRole = roleFilter === "All Roles" || u.role.toLowerCase() === roleFilter.toLowerCase();
      const matchStatus = statusFilter === "All Status" || u.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDept = deptFilter === "All Departments" || deptFilter === "All Schools" || u.dept.toLowerCase().includes(deptFilter.toLowerCase());
      return matchRole && matchStatus && matchDept;
    });
  }, [dbUsers, roleFilter, statusFilter, deptFilter, showArchived]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const departments = useMemo(() => {
    const sets = new Set(dbUsers.map(u => u.dept).filter(Boolean));
    const isCpd = company?.name?.toUpperCase() === "SPARK CPD";
    return [isCpd ? "All Schools" : "All Departments", ...Array.from(sets)];
  }, [dbUsers]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      {showSuccessModal && <SuccessModal message={batchResultMsg || "User successfully deleted."} onClose={() => { setShowSuccessModal(false); setBatchResultMsg(""); }} />}
      {showBatchModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--color-surface)", padding: 32, borderRadius: 16, width: "100%", maxWidth: 450, border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--color-text-header)", fontSize: 18, fontWeight: 700 }}>Confirm Batch Upload</h3>
            <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
              You are about to upload and create accounts for <strong>{batchUsers.length}</strong> users. 
              {company?.name?.toUpperCase() === "SPARK CPD" && " Since you are a SPARK CPD admin, users will automatically receive an email with their auto-generated passwords."}
            </p>
            {isUploadingBatch ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
                  <span>Uploading...</span>
                  <span>{batchProgress}%</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#FF6B00", width: `${batchProgress}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setShowBatchModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={confirmBatchUpload}>Start Upload</Button>
              </div>
            )}
          </div>
        </div>
      )}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--color-surface)", padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--color-text-header)", fontSize: 18, fontWeight: 700 }}>Confirm {showArchived ? "Deletion" : "Archive"}</h3>
            <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: 14 }}>
              {showArchived 
                ? "Are you sure you want to permanently delete this user? This action cannot be undone and will permanently remove all associated course progress." 
                : "Are you sure you want to archive this user? They will no longer be able to access the platform."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>{isDeleting ? "Processing..." : (showArchived ? "Delete Permanently" : "Archive User")}</Button>
            </div>
          </div>
        </div>
      )}
      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search users, courses, ..." role="Admin" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>

            <div className="dash-top">
              <div className="dash-top-greeting"></div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Users</h1>
                <div className="dash-top-btn-wrap" style={{ display: 'flex', gap: '12px' }}>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleBatchFileChange} style={{ display: 'none' }} />
                  <Button size="sm" rounded="pill" variant="outline" leftIcon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>Batch Upload</Button>
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
                  value={deptFilter === "All Departments" && company?.name?.toUpperCase() === "SPARK CPD" ? "All Schools" : deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                  className="users-filter-select"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                  <button
                    onClick={() => { setShowArchived(!showArchived); setCurrentPage(1); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8,
                      background: showArchived ? "rgba(231, 76, 60, 0.1)" : "var(--color-surface)",
                      border: `1px solid ${showArchived ? "rgba(231, 76, 60, 0.3)" : "var(--color-border)"}`,
                      color: showArchived ? "#e74c3c" : "var(--color-text-muted)",
                      fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <Archive size={16} />
                    {showArchived ? "Hide Archived Users" : "View Archived Users"}
                  </button>
                </div>
              </div>

              {/* Users Table Box */}
              <div className="users-table-card">

                <div className="users-table-header">
                  <div>Name</div>
                  <div>Status</div>
                  <div>{company?.name?.toUpperCase() === "SPARK CPD" ? "School" : "Department"}</div>
                  <div>Role</div>
                  <div>Joined</div>
                  <div>Actions</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {isLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                      <Loader2 size={24} className="spin" color="var(--color-text-muted)" />
                    </div>
                  ) : paginatedUsers.map((u, i) => (
                    <div key={u.id} className="users-table-row">

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <User size={16} color="var(--color-text-muted)" />
                          )}
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
                        {!showArchived ? (
                          <>
                            <ActionButton icon={Eye} onClick={() => navigate(`/${slug}/users/${u.id}`)} />
                            <ActionButton icon={Edit2} onClick={() => navigate(`/${slug}/users/${u.id}`)} disabled={u.role.toLowerCase() !== "user"} />
                            <ActionButton icon={Archive} variant="danger" onClick={() => setDeleteTarget(u.id)} disabled={u.role.toLowerCase() !== "user"} />
                          </>
                        ) : (
                          <>
                            <ActionButton icon={RefreshCw} onClick={() => restoreUser(u.id)} />
                            <ActionButton icon={Trash2} variant="danger" onClick={() => setDeleteTarget(u.id)} />
                          </>
                        )}
                      </div>

                    </div>
                  ))}
                  {!isLoading && paginatedUsers.length === 0 && (
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
