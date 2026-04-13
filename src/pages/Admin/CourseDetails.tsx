import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Search, UserPlus, CheckCircle, X, ChevronRight, Briefcase, UserMinus, Flame } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import "./CourseDetails.css";

const AdminCourseDetails = () => {
  const location = useLocation();
  const stateId = location.state?.id;
  const idFromStorage = sessionStorage.getItem("admin_course_id");
  const id = stateId || idFromStorage;

  useEffect(() => {
    if (stateId) {
      sessionStorage.setItem("admin_course_id", stateId);
    }
  }, [stateId]);
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  
  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const fetchCourseDetails = async () => {
    if (!company?.id || !id) return;
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, description, thumbnail_url, status, created_at, icon_emoji,
        companies ( name, logo_url ),
        users!courses_created_by_fkey ( firstname, lastname, company_id, roles(name) ),
        course_modules ( id ),
        course_assignments (
          id,
          status,
          assigned_at,
          course_progress ( progress_pct ),
          users!course_assignments_user_id_fkey (
            id, firstname, lastname, email, avatar_url, department
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching course details:", error);
    } else {
      setCourse(data);


    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, company?.id]);

  // Fetch all users for assigning when modal opens
  useEffect(() => {
    if (isAssignModalOpen && company?.id) {
      const fetchUsers = async () => {
        const { data } = await supabase
          .from('users')
          .select('id, firstname, lastname, email, avatar_url, department, roles(name)')
          .eq('company_id', company.id);
        if (data) setCompanyUsers(data);
      };
      fetchUsers();
    }
  }, [isAssignModalOpen, company?.id]);

  const handleAssignSelected = async () => {
    if (selectedUserIds.length === 0) return;
    setIsAssigning(true);
    
    const inserts = selectedUserIds.map(uid => ({
      course_id: id,
      user_id: uid,
      status: 'not_started'
    }));
    
    const { error } = await supabase.from('course_assignments').insert(inserts);
    if (!error) {
      await fetchCourseDetails();
      setToastMessage(`${selectedUserIds.length} User(s) successfully assigned to "${course.title}"`);
      setTimeout(() => setToastMessage(null), 3000);
      setIsAssignModalOpen(false);
      setSelectedUserIds([]);
    } else {
      console.error("Error assigning users:", error);
      alert("Failed to assign users.");
    }
    setIsAssigning(false);
  };

  if (!course && loading) {
    return (
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, units ..." role="Admin" />
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Skeleton width={100} height={32} borderRadius={20} />
              <Skeleton width={120} height={20} />
            </div>
            <Skeleton height={240} borderRadius={16} style={{ marginBottom: 24 }} />
            <div className="course-grid-container">
               <Skeleton height={400} borderRadius={16} />
               <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 <Skeleton height={200} borderRadius={16} />
                 <Skeleton height={250} borderRadius={16} />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!course && !loading) {
     return <div style={{ display: "flex", height: "100vh", padding: 40, textAlign: "center" }}>Course not found.</div>;
  }

  // Analytics Computation
  const assignments = course.course_assignments || [];
  const enrolledCount = assignments.length;
  let completedCount = 0;
  let inProgressCount = 0;
  let totalProgress = 0;
  
  const mappedEnrolled = assignments.map((a: any) => {
     let progress = 0;
     if (a.course_progress && a.course_progress.length > 0) {
       progress = a.course_progress[0].progress_pct || 0;
     }
     
     let status = "Not Started";
     let statusColor = "var(--color-text-muted)";
     if (progress === 100) {
       status = "Completed";
       statusColor = "var(--color-success)";
       completedCount++;
     } else if (progress > 0) {
       status = "In Progress";
       statusColor = "#FF9800";
       inProgressCount++;
     }
     totalProgress += progress;
     
     return {
       id: a.users?.id,
       name: `${a.users?.firstname} ${a.users?.lastname}`,
       email: a.users?.email,
       avatar: a.users?.avatar_url,
       department: a.users?.department || "N/A",
       progress,
       status,
       statusColor,
       assignedAt: new Date(a.assigned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})
     };
  });

  const avgCompletion = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;
  const modulesCount = course.course_modules?.length || 0;
  const lessonsCount = modulesCount * 3; // Approx
  
  const creator = Array.isArray(course.users) ? course.users[0] : course.users;
  const companyData = Array.isArray(course.companies) ? course.companies[0] : course.companies;
  const creatorRole = Array.isArray(creator?.roles) ? creator?.roles[0]?.name : creator?.roles?.name;

  const actualLogoUrl = companyData?.logo_url || null;

  // Modal Computed State
  const enrolledIds = new Set(assignments.map((a: any) => a.users?.id));
  const filteredCompanyUsers = companyUsers.filter(u => {
    const q = modalSearch.toLowerCase();
    const name = `${u.firstname} ${u.lastname}`.toLowerCase();
    const dept = (u.department || "").toLowerCase();
    return name.includes(q) || u.email.toLowerCase().includes(q) || dept.includes(q);
  });
  
  const availableToAssign = filteredCompanyUsers.filter(u => !enrolledIds.has(u.id));
  const alreadyEnrolledUsers = filteredCompanyUsers.filter(u => enrolledIds.has(u.id));

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, units ..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", position: "relative" }}>
          <PageTransition>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
              <button 
                onClick={() => navigate(`/${slug}/courses`)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  border: `1px solid var(--color-border)`, background: "var(--color-surface)",
                  color: "#FF6B00", cursor: "pointer"
                }}
              >
                <ArrowLeft size={14} /> Courses
              </button>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-header)" }}>Course Details</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Top Banner — Split Layout */}
              <div className="course-banner-container">
                {/* Left: Thumbnail */}
                <div className="course-banner-image-wrapper">
                  <div 
                    className="course-banner-image"
                    style={{ background: course.thumbnail_url ? `url(${course.thumbnail_url}) center/cover no-repeat` : "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)" }} 
                  />
                  
                  {/* Logo - Mobile overlapping version */}
                  <div className="course-banner-logo-mobile" style={{ background: actualLogoUrl ? "#fff" : "#000", border: actualLogoUrl ? "2px solid var(--color-border)" : "none" }}>
                    {actualLogoUrl ? (
                      <img src={actualLogoUrl} alt="Company Logo" />
                    ) : (
                      <Briefcase size={36} />
                    )}
                  </div>
                </div>

                {/* Right: Course Info */}
                <div className="course-banner-info">
                  {/* Logo + Badge row */}
                  <div className="course-banner-header-row">
                    <div className="course-banner-logo-desktop" style={{ background: actualLogoUrl ? "#fff" : "#000", border: actualLogoUrl ? "2px solid var(--color-border)" : "none" }}>
                      {actualLogoUrl ? (
                        <img src={actualLogoUrl} alt="Company Logo" />
                      ) : (
                        <Briefcase size={24} />
                      )}
                    </div>
                    <div className="course-badge">
                      Active
                    </div>
                  </div>

                  {/* Title + Description */}
                  <div>
                    <h1 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 800, color: "var(--color-text-header)" }}>{course.title}</h1>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {course.description || "No description provided."}
                    </p>
                  </div>

                  {/* Stats + Creator */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: 16, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--color-text-header)", fontWeight: 700 }}>
                       <span>{enrolledCount} Enrolled</span>
                       <span style={{ color: "var(--color-border)" }}>|</span>
                       <span>{modulesCount} Modules</span>
                       <span style={{ color: "var(--color-border)" }}>|</span>
                       <span>{lessonsCount} Lessons</span>
                       <span style={{ color: "var(--color-border)" }}>|</span>
                       <span style={{ fontWeight: 500, color: "var(--color-text-muted)" }}>Published {new Date(course.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", border: "1px solid var(--color-border)", borderRadius: 20 }}>
                       <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={12} color="var(--color-text-muted)" />
                       </div>
                       <div style={{ display: "flex", flexDirection: "column" }}>
                         <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1 }}>{creator?.firstname} {creator?.lastname}</span>
                         <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{creatorRole || "Course Creator"}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="course-grid-container">
                
                {/* LEFT COL: ENROLLED USERS */}
                <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", padding: "20px 0", boxShadow: "var(--shadow-sm)" }}>
                   <div className="course-enrolled-header">
                     <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <User size={20} color="var(--color-text-muted)" />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-header)" }}>Enrolled Users</h2>
                        <span style={{ padding: "2px 10px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-text-muted)" }}>{enrolledCount} users</span>
                     </div>
                     <div style={{ position: "relative" }}>
                       <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                       <input 
                         type="text" 
                         placeholder="Search enrolled users ..." 
                         style={{ padding: "8px 12px 8px 36px", fontSize: 13, borderRadius: 20, border: "1px solid var(--color-border)", outline: "none", width: 220, background: "var(--color-bg-subtle)" }}
                       />
                     </div>
                   </div>

                   <div className="course-table-wrapper">
                     <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
                     <thead>
                       <tr style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-header)", borderBottom: "1px solid var(--color-border)", borderTop: "1px solid var(--color-border)", textAlign: "left" }}>
                         <th style={{ padding: "12px 24px", fontWeight: 800 }}>USER</th>
                         <th style={{ padding: "12px 16px", fontWeight: 800 }}>DEPARTMENT</th>
                         <th style={{ padding: "12px 16px", fontWeight: 800 }}>PROGRESS</th>
                         <th style={{ padding: "12px 16px", fontWeight: 800 }}>STATUS</th>
                         <th style={{ padding: "12px 16px", fontWeight: 800 }}>ASSIGNED</th>
                         <th style={{ padding: "12px 24px", fontWeight: 800, textAlign: "right" }}>ACTION</th>
                       </tr>
                     </thead>
                     <tbody>
                       {mappedEnrolled.map((u: any, idx: number) => (
                         <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                           <td style={{ padding: "12px 24px" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {u.avatar ? 
                                 <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }} /> : 
                                 <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "2px solid var(--color-border)" }}>
                                    {u.name.charAt(0)}
                                 </div>
                                }
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                   <span style={{ fontWeight: 600, color: "var(--color-text-header)", fontSize: 13 }}>{u.name}</span>
                                   <span style={{ color: "var(--color-text-muted)" }}>{u.email}</span>
                                </div>
                             </div>
                           </td>
                           <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>{u.department}</td>
                           <td style={{ padding: "12px 16px" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                               <div style={{ flex: 1, height: 6, background: "var(--color-bg-muted)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                                  <div style={{ width: `${u.progress}%`, height: "100%", background: u.progress === 100 ? "#27ae60" : u.progress > 0 ? "#FF9800" : "transparent" }} />
                               </div>
                               <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{u.progress}%</span>
                             </div>
                           </td>
                           <td style={{ padding: "12px 16px", fontWeight: 600, color: u.statusColor }}>{u.status}</td>
                           <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>{u.assignedAt}</td>
                           <td style={{ padding: "12px 24px", textAlign: "right" }}>
                             <button style={{ background: "transparent", border: "1px solid var(--color-border)", borderRadius: 8, padding: 6, cursor: "pointer", color: "var(--color-error, #d32f2f)" }} title="Remove User">
                               <UserMinus size={16} />
                             </button>
                           </td>
                         </tr>
                       ))}
                       {mappedEnrolled.length === 0 && (
                         <tr>
                           <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)" }}>No users enrolled yet.</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                   </div>
                   
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px 0 24px" }}>
                     <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Showing {enrolledCount} of {enrolledCount} enrolled</span>
                     <Button variant="primary" rounded="pill" onClick={() => setIsAssignModalOpen(true)}>
                       <UserPlus size={14} style={{ marginRight: 6 }} /> Assign Users
                     </Button>
                   </div>
                </div>

                {/* RIGHT COL: ANALYTICS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* Course Stats */}
                  <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-header)" }}>
                        <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
                      </svg>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-header)" }}>Course Stats</h2>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 0", textAlign: "center", background: "var(--color-bg-subtle)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 4 }}>{enrolledCount}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Enrolled</div>
                      </div>
                      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 0", textAlign: "center", background: "var(--color-bg-subtle)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 4 }}>{completedCount}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Completed</div>
                      </div>
                      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 0", textAlign: "center", background: "var(--color-bg-subtle)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 4 }}>{modulesCount}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Modules</div>
                      </div>
                      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: "16px 0", textAlign: "center", background: "var(--color-bg-subtle)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 4 }}>{lessonsCount}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Lessons</div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Average completion</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#FF6B00" }}>{avgCompletion}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--color-bg)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                       <div style={{ height: "100%", width: `${avgCompletion}%`, background: "#FF6B00", borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                      {completedCount} of {enrolledCount} users completed
                    </div>
                  </div>

                  {/* Course Info Table */}
                  <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-header)" }}>
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-header)" }}>Course Info</h2>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", fontSize: 13 }}>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Status</span>
                         <span style={{ color: "#2E7D32", fontWeight: 700 }}>Active</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Created By</span>
                         <span style={{ color: "var(--color-text-header)", fontWeight: 500 }}>{creator?.firstname} {creator?.lastname}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Role</span>
                         <span style={{ color: "var(--color-text-header)", fontWeight: 500 }}>{creatorRole || "Course Creator"}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Published</span>
                         <span style={{ color: "var(--color-text-header)", fontWeight: 500 }}>{new Date(course.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Modules</span>
                         <span style={{ color: "var(--color-text-header)", fontWeight: 500 }}>{modulesCount}</span>
                       </div>
                       <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                         <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Lessons</span>
                         <span style={{ color: "var(--color-text-header)", fontWeight: 500 }}>{lessonsCount}</span>
                       </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </PageTransition>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
         {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              style={{
                position: "fixed", bottom: 40, left: "50%", zIndex: 1000,
                background: "#333", color: "#fff",
                padding: "16px 24px", borderRadius: 8,
                display: "flex", alignItems: "center", gap: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                fontSize: 14, fontWeight: 500
              }}
            >
              <CheckCircle size={20} color="#4CAF50" />
              {toastMessage}
            </motion.div>
         )}
      </AnimatePresence>

      {/* ASSIGN USERS MODAL */}
      <AnimatePresence>
        {isAssignModalOpen && (
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
              }}
              onClick={() => setIsAssignModalOpen(false)}
           >
              <motion.div
                 initial={{ y: 20, scale: 0.98 }}
                 animate={{ y: 0, scale: 1 }}
                 exit={{ y: 20, scale: 0.98 }}
                 onClick={e => e.stopPropagation()}
                 style={{
                   background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640,
                   boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                   display: "flex", flexDirection: "column",
                   maxHeight: "85vh", overflow: "hidden"
                 }}
              >
                {/* Modal Header */}
                <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                   <div>
                     <h3 style={{ margin: "0 0 6px 0", fontSize: 20, fontWeight: 800 }}>Assign Users to Course</h3>
                     <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{course.title}</span>
                   </div>
                   <button onClick={() => setIsAssignModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                     <X size={20} />
                   </button>
                </div>
                
                {/* Modal Search */}
                <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end" }}>
                   <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
                     <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                     <input 
                       type="text" 
                       value={modalSearch}
                       onChange={e => setModalSearch(e.target.value)}
                       placeholder="Search users by name, email, or dept." 
                       style={{ padding: "10px 12px 10px 36px", fontSize: 13, borderRadius: 20, border: "1px solid var(--color-border)", outline: "none", width: "100%", boxSizing: "border-box" }}
                     />
                   </div>
                </div>

                {/* Modal List */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
                   
                   {/* Available to Assign */}
                   <div>
                     <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 12, textTransform: "uppercase" }}>
                        Available to assign ({availableToAssign.length})
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       {availableToAssign.map((u) => (
                         <div 
                           key={u.id} 
                           onClick={() => {
                             setSelectedUserIds(prev => 
                               prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                             );
                           }}
                           style={{ 
                             display: "flex", alignItems: "center", gap: 16, padding: "12px", 
                             border: selectedUserIds.includes(u.id) ? "1.5px solid #FF6B00" : "1.5px solid transparent",
                             borderRadius: 12, cursor: "pointer", background: selectedUserIds.includes(u.id) ? "#fff4eb" : "transparent"
                           }}
                         >
                           <div style={{ width: 20, height: 20, borderRadius: 6, border: selectedUserIds.includes(u.id) ? "none" : "1px solid var(--color-border)", background: selectedUserIds.includes(u.id) ? "#FF6B00" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {selectedUserIds.includes(u.id) && <CheckCircle size={14} color="#fff" />}
                           </div>
                           <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                              {u.avatar_url ? 
                               <img src={u.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} /> :
                               <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 13, fontWeight: 700 }}>{u.firstname.charAt(0)}</div>
                              }
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-header)" }}>{u.firstname} {u.lastname}</span>
                                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{u.email} • {u.department || "No Dept"}</span>
                              </div>
                           </div>
                         </div>
                       ))}
                       {availableToAssign.length === 0 && <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No available users.</div>}
                     </div>
                   </div>

                   {/* Already Enrolled */}
                   <div>
                     <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 12, textTransform: "uppercase" }}>
                        Already enrolled ({alreadyEnrolledUsers.length})
                     </div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       {alreadyEnrolledUsers.map((u) => (
                         <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px", opacity: 0.6 }}>
                           <div style={{ width: 20, height: 20, borderRadius: 6, background: "#E8F5E9", border: "1px solid #A5D6A7" }}></div>
                           <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                              {u.avatar_url ? 
                               <img src={u.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} /> :
                               <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ccc", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 13, fontWeight: 700 }}>{u.firstname.charAt(0)}</div>
                              }
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-header)" }}>{u.firstname} {u.lastname}</span>
                                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{u.email} • {u.department || "No Dept"}</span>
                              </div>
                           </div>
                           <div style={{ padding: "4px 10px", background: "#E8F5E9", color: "#2E7D32", fontSize: 10, fontWeight: 700, borderRadius: 12 }}>
                             Enrolled
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                </div>
                
                {/* Modal Footer */}
                <div style={{ padding: "16px 24px", background: "var(--color-bg-subtle)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                     <span style={{ color: "#FF6B00", fontWeight: 700 }}>{selectedUserIds.length}</span> user(s) selected
                   </div>
                   <div style={{ display: "flex", gap: 12 }}>
                     <Button variant="outline" rounded="pill" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                     <Button 
                        variant="primary" 
                        rounded="pill" 
                        onClick={handleAssignSelected} 
                        style={{ opacity: selectedUserIds.length === 0 ? 0.5 : 1, pointerEvents: selectedUserIds.length === 0 ? 'none' : 'auto' }}
                     >
                       {isAssigning ? "Assigning..." : "Assign Selected"}
                     </Button>
                   </div>
                </div>

              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminCourseDetails;
