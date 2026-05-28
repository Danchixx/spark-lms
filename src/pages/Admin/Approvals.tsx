import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import PageTransition from "../../components/common/PageTransition";
import ApprovalModal from "../../components/common/ApprovalModal/ApprovalModal";
import { Search, Plus, Eye, Trash2, Clock, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../components/ui/Button/Button";

const StatCard = ({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: string }) => (
  <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: "24px", display: "flex", alignItems: "center", gap: 20, flex: 1, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-text-header)", lineHeight: 1 }}>{count}</div>
    </div>
  </div>
);

const AdminApprovals = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase().replace(/\s+/g, "-")}`);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<any>("pending");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users with role 'user'
      // We use the explicit constraint names for ambiguous relations.
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          roles!inner(name),
          user_approvals (
            decision,
            reason,
            decided_at,
            approved_by_user:users!user_approvals_approved_by_fkey (firstname, lastname)
          ),
          creator:users!users_created_by_fkey (firstname, lastname)
        `)
        .eq('roles.name', 'user')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error("Users Fetch Error:", usersError);
        throw usersError;
      }

      // 2. Fetch Course Counts
      const { data: assignments } = await supabase.from('course_assignments').select('user_id');
      const countsMap = (assignments || []).reduce((acc: any, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {});

      const mapped = (users || []).map(u => {
        const approval = u.user_approvals?.[0];
        
        return {
          ...u,
          status: u.status, 
          created_by_name: u.creator ? `${u.creator.firstname} ${u.creator.lastname}` : "Danchi D",
          reviewed_at: approval?.decided_at,
          rejection_reason: approval?.reason,
          reviewer_name: approval?.approved_by_user ? `${approval.approved_by_user.firstname} ${approval.approved_by_user.lastname}` : null,
          courses_count: countsMap[u.id] || 0
        };
      });

      setRequests(mapped);
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedRequest) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_archived: true, archived_at: new Date().toISOString(), archived_by: user.id })
        .eq('id', selectedRequest.id);

      if (error) throw error;
      
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error("Error withdrawing request:", err);
      alert("Failed to withdraw request.");
    }
  };

  const openReview = (r: any) => {
    setSelectedRequest(r);
    setModalStatus(r.status === "active" ? "approved" : r.status);
    setIsModalOpen(true);
  };

  const openWithdrawConfirm = (r: any) => {
    setSelectedRequest(r);
    setModalStatus("withdraw_confirm");
    setIsModalOpen(true);
  };

  const filtered = requests.filter(r => {
    const matchesFilter = activeTab === "All" || (activeTab.toLowerCase() === (r.status === "active" ? "approved" : r.status));
    const name = `${r.firstname} ${r.lastname}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "active").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    total: requests.length
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Approvals" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} role="Admin" />
        
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
               <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "var(--color-text-header)", flex: 1, textAlign: "center" }}>Approvals</h1>
               <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/users/add`)} style={{ gap: 8, padding: "10px 20px" }}>
                 <Plus size={18} strokeWidth={3} /> Add User
               </Button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "flex", gap: 20, marginBottom: 32 }}>
              <StatCard icon={Clock} label="Awaiting Approval" count={stats.pending} color="#FF9800" />
              <StatCard icon={CheckCircle} label="Approved" count={stats.approved} color="#2E7D32" />
              <StatCard icon={XCircle} label="Rejected" count={stats.rejected} color="#D32F2F" />
              <StatCard icon={Users} label="Total Submitted" count={stats.total} color="#111" />
            </div>

            {/* Content Card */}
            <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
              
              {/* Filter Tabs & Search */}
              <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                 <div style={{ display: "flex", gap: 8, background: "var(--color-bg-subtle)", padding: 4, borderRadius: 12, border: "1px solid var(--color-border)" }}>
                    {["All", "Approved", "Pending", "Rejected"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                          background: activeTab === tab ? "#FF6B00" : "transparent",
                          color: activeTab === tab ? "#fff" : "var(--color-text-muted)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {tab} ({tab === "All" ? stats.total : stats[tab.toLowerCase() as keyof typeof stats]})
                      </button>
                    ))}
                 </div>
                 
                 <div style={{ position: "relative", width: 280 }}>
                   <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                   <input 
                     type="text" 
                     placeholder="Search requests..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 20, border: "1px solid var(--color-border)", background: "var(--color-bg-subtle)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                   />
                 </div>
              </div>

              {/* Table Header Section Title */}
              <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                 <Users size={20} color="var(--color-text-header)" />
                 <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-header)", margin: 0 }}>Submission History</h2>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr style={{ textAlign: "left", background: "var(--color-bg-subtle)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Name</th>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Department</th>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Submitted</th>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Reviewed</th>
                      <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading records...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>No records found.</td></tr>
                    ) : (
                      filtered.map(r => (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.2s ease" }}>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                               <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1.5px solid var(--color-border)" }}>
                                 {r.avatar_url ? <img src={r.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={18} color="#ccc" />}
                               </div>
                               <div>
                                 <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>{r.firstname} {r.lastname}</div>
                                 <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{r.email}</div>
                               </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                             <div style={{ 
                               display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                               background: r.status === "active" ? "#E8F5E9" : r.status === "rejected" ? "#FFEBEE" : "#FFF4E5",
                               color: r.status === "active" ? "#2E7D32" : r.status === "rejected" ? "#D32F2F" : "#FF9800",
                             }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                                {r.status === "active" ? "Approved" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                             </div>
                             {r.status === "rejected" && r.rejection_reason && (
                               <div style={{ fontSize: 10, color: "#D32F2F", marginTop: 4, fontStyle: "italic", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: "rgba(211,47,47,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                                 {r.rejection_reason}
                               </div>
                             )}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--color-text-header)", fontWeight: 600 }}>{r.department || "—"}</td>
                          <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--color-text-muted)" }}>{formatDate(r.created_at)}</td>
                          <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--color-text-muted)" }}>{formatDate(r.reviewed_at)}</td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                               <button 
                                 onClick={() => openReview(r)}
                                 style={{ background: "#fff", border: "1.5px solid var(--color-border)", padding: 6, borderRadius: 8, cursor: "pointer", color: "var(--color-text-muted)" }}
                               >
                                 <Eye size={18} />
                               </button>
                               {(r.status === "pending" || r.status === "rejected") && (
                                 <button 
                                   onClick={() => openWithdrawConfirm(r)}
                                   style={{ background: "#fff", border: "1.5px solid var(--color-border)", padding: 6, borderRadius: 8, cursor: "pointer", color: "#D32F2F" }}
                                 >
                                   <Trash2 size={18} />
                                 </button>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: "20px 24px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Showing {filtered.length > 0 ? 1 : 0}-{filtered.length} of {filtered.length} records</div>
                 <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: 6, borderRadius: 6, border: "1px solid var(--color-border)", background: "#fff", cursor: "pointer", opacity: 0.5 }} disabled><ChevronLeft size={16} /></button>
                    <button style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 700 }}>1</button>
                    <button style={{ padding: 6, borderRadius: 6, border: "1px solid var(--color-border)", background: "#fff", cursor: "pointer", opacity: 0.5 }} disabled><ChevronRight size={16} /></button>
                 </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>

      {/* Common Approval Modal */}
      <ApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        request={selectedRequest}
        status={modalStatus}
        onWithdraw={(id) => setModalStatus("withdraw_confirm")}
        onConfirmWithdraw={handleWithdraw}
        onResubmit={(id) => navigate(`/${slug}/users/add`)}
      />
    </div>
  );
};

export default AdminApprovals;

