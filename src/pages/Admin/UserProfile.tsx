import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import ProfileCard from "../../components/common/ProfileCard/ProfileCard";
import { ArrowLeft, ChevronRight, BookOpen, Clock, CheckCircle2, UserCircle, Briefcase, Info, Loader2 } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
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

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
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

        // Fetch Assigned Courses
        const { data: assignments, error: caError } = await supabase
          .from("course_assignments")
          .select(`
            id,
            assigned_at,
            status,
            courses (
              id,
              title,
              thumbnail_url,
              course_modules (id)
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

        const mappedCourses = (assignments || []).map((a: any) => ({
          id: a.courses.id,
          title: a.courses.title,
          thumbnail: a.courses.thumbnail_url,
          status: a.status,
          assignedAt: new Date(a.assigned_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          modulesCount: a.courses.course_modules?.length || 0,
          lessonsCount: (a.courses.course_modules?.length || 0) * 3
        }));

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
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={onNavigate} user={currentUser} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={currentUser} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
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

            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 24, textAlign: "center" }}>User Profile</h1>

            <div style={{ marginBottom: 24 }}>
              <ProfileCard profileData={profileData} editable={false} />
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
