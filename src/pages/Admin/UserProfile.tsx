import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import ProfileCard from "../../components/common/ProfileCard/ProfileCard";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, ChevronRight, BookOpen, Clock, CheckCircle2, UserCircle, Briefcase, Info, Loader2, Check, Key } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "modal-fade-in 0.2s ease", backdropFilter: "blur(4px)" }}>
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

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch User Info
        const { data: u, error: uError } = await supabase
          .from("users")
          .select(`
            *,
            roles(name)
          `)
          .eq("id", userId)
          .single();

        if (uError) throw uError;

        // Fetch Assigned Courses with real lessons and progress
        const { data: assignments, error: caError } = await supabase
          .from("course_assignments")
          .select(`
            id,
            assigned_at,
            status,
            course_progress ( progress_pct ),
            courses (
              id,
              title,
              thumbnail_url,
              course_modules (
                id,
                course_lessons ( id )
              )
            )
          `)
          .eq("user_id", userId);

        if (caError) throw caError;

        const roleName = Array.isArray(u.roles) ? u.roles[0]?.name : (u.roles?.name || 'user');
        
        setTargetUser({
          ...u,
          role: roleName,
          memberSince: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown",
        });

        const mappedCourses = (assignments || []).map((a: any) => {
          const modules = a.courses?.course_modules || [];
          const lessonsCount = modules.reduce((total: number, m: any) => total + (m.course_lessons?.length || 0), 0);
          
          let derivedStatus = a.status; // Default to assignment status
          const progressPct = a.course_progress?.[0]?.progress_pct || 0;
          if (progressPct === 100) derivedStatus = "COMPLETED";
          else if (progressPct > 0) derivedStatus = "IN PROGRESS";

          return {
            id: a.courses.id,
            title: a.courses.title,
            thumbnail: a.courses.thumbnail_url,
            status: derivedStatus,
            assignedAt: new Date(a.assigned_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            modulesCount: modules.length,
            lessonsCount: lessonsCount
          };
        });

        setAssignedCourses(mappedCourses);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "var(--color-bg)", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={currentUser} onLogout={logout} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Header user={currentUser} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search..." role="Admin" />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={32} className="spin" color="var(--color-text-muted)" />
            </div>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return <div style={{ padding: 40, textAlign: "center" }}>User not found.</div>;
  }

  const profileData = {
    firstName: targetUser.firstname || "",
    middleName: targetUser.middlename || "",
    lastName: targetUser.lastname || "",
    contactNumber: targetUser.contact_no || "",
    address: targetUser.address || "",
    dateOfBirth: targetUser.date_of_birth || "",
    gender: targetUser.gender || "",
    email: targetUser.email || "",
    employeeId: targetUser.employee_id || "",
    jobTitle: targetUser.job_title || "",
    department: targetUser.department || "",
    dateHired: targetUser.date_hired || "",
    memberSince: targetUser.memberSince,
    role: targetUser.role,
    coursesAssigned: assignedCourses.length,
    avatarUrl: targetUser.avatar_url,
    prcId: targetUser.cpd_prc_id || "",
    position: targetUser.cpd_position || "",
    schoolName: targetUser.cpd_school_name || "",
    isCpd: company?.name?.toUpperCase() === "SPARK CPD",
  };

  const handleSaveDetails = async (updated: any) => {
    try {
      const updates: Record<string, any> = {};
      
      if (updated.firstName !== undefined) updates.firstname = updated.firstName;
      if (updated.middleName !== undefined) updates.middlename = updated.middleName;
      if (updated.lastName !== undefined) updates.lastname = updated.lastName;
      if (updated.contactNumber !== undefined) updates.contact_no = updated.contactNumber;
      if (updated.address !== undefined) updates.address = updated.address;
      if (updated.employeeId !== undefined) updates.employee_id = updated.employeeId;
      if (updated.jobTitle !== undefined) updates.job_title = updated.jobTitle;
      if (updated.department !== undefined) updates.department = updated.department;
      if (updated.dateHired !== undefined) updates.date_hired = updated.dateHired || null;
      if (updated.prcId !== undefined) updates.cpd_prc_id = updated.prcId;
      if (updated.position !== undefined) updates.cpd_position = updated.position;
      if (updated.schoolName !== undefined) updates.cpd_school_name = updated.schoolName;

      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;
      
      setTargetUser((prev: any) => ({ ...prev, ...updates }));
      setSuccessMessage("User details updated successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user details.");
    }
  };

  const handleResetPassword = async () => {
    if (!targetUser?.password) {
      alert("Default password not found for this user.");
      return;
    }
    
    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { 
          action: 'reset_password', 
          userId: targetUser.id,
          newPassword: targetUser.password 
        }
      });

      if (error) throw new Error(error.message || 'Failed to reset password');
      if (data?.error) throw new Error(data.error);

      setSuccessMessage("Password has been reset to the user's default password.");
      setShowSuccessModal(true);
      setShowResetConfirm(false);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}
      
      {showResetConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "var(--color-surface)", padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(231, 76, 60, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Key size={20} color="#e74c3c" />
              </div>
              <h3 style={{ margin: 0, color: "var(--color-text-header)", fontSize: 18, fontWeight: 700 }}>Reset Password?</h3>
            </div>
            <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
              This will reset the user's login password back to their original default password. Are you sure you want to proceed?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)} disabled={isResetting}>Cancel</Button>
              <Button variant="danger" onClick={handleResetPassword} loading={isResetting}>{isResetting ? "Resetting..." : "Yes, Reset Password"}</Button>
            </div>
          </div>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={currentUser} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={currentUser} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <div className="dash-top">
              <div className="dash-top-greeting" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                <button 
                  onClick={() => navigate(`/${slug}/users`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 20,
                    border: "1px solid var(--color-border)", background: "var(--color-surface)",
                    color: "#FF6B00", cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  <ArrowLeft size={14} /> Users
                </button>
                <ChevronRight size={14} color="var(--color-text-muted)" />
                <span style={{ color: "var(--color-text-header)" }}>User Profile</span>
              </div>

              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>User Profile</h1>
              
              <div className="dash-top-btn-wrap">
                <Button variant="outline" leftIcon={<Key size={14} />} onClick={() => setShowResetConfirm(true)}>
                  Reset Password
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <ProfileCard profileData={profileData} editable={true} onSave={handleSaveDetails} />
            </div>

            {/* Assigned Courses Section */}
            <div style={{ background: "var(--color-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", marginBottom: 28 }}>
              <SectionTitle icon={BookOpen} title="Assigned Courses" />
              <div style={{ padding: 20 }}>
                {assignedCourses.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "var(--color-text-muted)" }}>
                    <Info size={32} opacity={0.3} />
                    <p style={{ margin: 0, fontSize: 14 }}>No courses assigned to this user yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {assignedCourses.map(course => (
                      <div key={course.id} style={{ display: "flex", gap: 16, padding: 16, borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg-subtle)" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 8, background: course.thumbnail ? `url(${course.thumbnail}) center/cover` : "var(--color-bg-muted)", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>{course.title}</h4>
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>{course.modulesCount} Modules • {course.lessonsCount} Lessons</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: course.status === "completed" ? "#27ae60" : "#FF9800", textTransform: "uppercase" }}>
                                {course.status === "completed" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                {course.status.replace("_", " ")}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Assigned {course.assignedAt}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default UserProfile;
