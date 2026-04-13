import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import { supabase } from "../../lib/supabase";
import CourseCardSkeleton from "../../components/common/CourseCard/CourseCardSkeleton";

// ─── UTILITY COMPONENTS ──────────────────────────────────────────

const AdminCourseFilterNav = ({ counts, active, onChange }: any) => {
  const filters = [
    { key: "All", label: `All (${counts.all})` },
    { key: "Active", label: `Active (${counts.active})` },
    { key: "Pending", label: `Pending (${counts.pending})` },
  ];

  return (
    <div style={{
      display: "inline-flex", flexWrap: "wrap", gap: 8,
      marginBottom: 24,
      background: "var(--color-surface)",
      border: "1.5px solid var(--color-border)",
      borderRadius: 16,
      padding: "8px 10px",
      boxShadow: "var(--shadow-sm)",
    }}>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <motion.button
            key={f.key}
            onClick={() => onChange(f.key)}
            whileHover={!isActive ? { background: "var(--color-bg-subtle)", borderColor: "var(--color-border)" } : {}}
            style={{
              padding: "7px 18px",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              background: "transparent",
              color: isActive ? "white" : "var(--color-text-muted)",
              border: isActive ? "1.5px solid transparent" : "1.5px solid var(--color-border)",
              borderRadius: 10,
              transition: "all 0.2s",
              position: "relative",
              zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 36,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="adminCourseTab"
                style={{ position: "absolute", inset: 0, background: "#FF6B00", borderRadius: 8, zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );
};

const AdminCourseCard = ({ course, onViewDetails }: any) => {
  const isPending = course.status === "Pending";
  const statusColor = isPending ? "#f39c12" : "#27ae60";

  return (
    <div style={{
      background: "var(--color-surface)", borderRadius: 12,
      overflow: "hidden", boxShadow: "var(--shadow)",
      border: "1px solid var(--color-border)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
    >
      {/* Thumbnail area */}
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <img src={course.thumbnail} alt={course.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
        
        <StatusBadge
          status={course.status}
          style={{ position: "absolute", top: 12, left: 12, fontSize: 10, padding: "2px 10px", background: "white", color: statusColor, border: "none", fontWeight: 700, borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        />
      </div>

      {/* Card Content Area */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--color-text-header)", lineHeight: 1.3, marginBottom: 4 }}>
            {course.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {course.enrolled} Enrolled • {course.modulesCount} Modules • {course.unitsCount} Units
          </div>
        </div>

        {/* Progress or Banner */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {isPending ? (
             <div style={{ background: "#FFF3E0", color: "#E65100", padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: "1px solid #FFE0B2" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", border: "1.5px solid #E65100", fontSize: 10 }}>!</span>
                Awaiting for Approval - not yet available to users
             </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Avg. completion</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00" }}>{course.avgCompletion}%</span>
              </div>
              <div style={{ height: 6, background: "var(--color-bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${course.avgCompletion}%`, background: "#FF6B00", borderRadius: 99 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--color-bg-subtle)",
          borderTop: "1px solid var(--color-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "var(--color-text-muted)" }}>
                <User size={14} />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.2 }}>
                Created by {course.creatorLabel}<br/>
                <span style={{ fontSize: 10 }}>({course.creatorRole})</span>
            </div>
        </div>

        <Button
            size="sm"
            rounded="pill"
            variant={isPending ? "outline" : "primary"}
            onClick={() => onViewDetails(course.id)}
        >
            View Details
        </Button>
      </div>

    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────

const AdminCourses = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  useEffect(() => {
    if (!company?.id) return;
    
    const fetchCourses = async () => {
      setLoading(true);
      
      // Get the SPARK company ID to include its global courses
      const { data: sparkData } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', 'spark')
        .single();

      // Ensure we don't duplicate if the admin IS from Spark
      const companyIds = sparkData?.id 
        ? Array.from(new Set([company.id, sparkData.id])) 
        : [company.id];

      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          thumbnail_url,
          status,
          companies ( name ),
          users!courses_created_by_fkey (
            roles ( name )
          ),
          course_assignments (
            id,
            course_progress ( progress_pct )
          ),
          course_modules ( id )
        `)
        .in('company_id', companyIds);

      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        const mapped = (data || []).map((c: any) => {
          // Average completion
          const assignments = c.course_assignments || [];
          let avgCompletion = 0;
          if (assignments.length > 0) {
            const total = assignments.reduce((acc: number, a: any) => {
              const pct = a.course_progress?.[0]?.progress_pct || 0;
              return acc + pct;
            }, 0);
            avgCompletion = Math.round(total / assignments.length);
          }

          // Modules & Units
          const modules = c.course_modules || [];
          const modulesCount = modules.length;
          // Approximate units since we didn't do deep nesting to avoid postgres limits
          const unitsCount = modulesCount > 0 ? modulesCount * 3 : 0; 
          
          const creatorData = Array.isArray(c.users) ? c.users[0] : c.users;
          const roleData = creatorData?.roles;
          const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
          const companyData = Array.isArray(c.companies) ? c.companies[0] : c.companies;
          
          return {
            id: c.id,
            name: c.title,
            thumbnail: c.thumbnail_url || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600",
            enrolled: assignments.length > 0 ? assignments.length.toString() : "--",
            modulesCount,
            unitsCount,
            status: c.status?.toLowerCase() === 'pending' ? 'Pending' : 'Active',
            avgCompletion,
            creatorLabel: companyData?.name?.toUpperCase() || "UNKNOWN",
            creatorRole: roleName || "Course Creator"
          };
        });
        setDbCourses(mapped);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [company?.id]);

  const filteredCourses = activeFilter === "All" 
    ? dbCourses 
    : dbCourses.filter(c => c.status === activeFilter);

  const counts = {
    all: dbCourses.length,
    active: dbCourses.filter(c => c.status === "Active").length,
    pending: dbCourses.filter(c => c.status === "Pending").length,
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <style>{`
        .admin-courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-bottom: 24px; }
        @media (max-width: 1024px) { .admin-courses-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  { .admin-courses-grid { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>

      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, units ..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px", color: "var(--color-text-header)" }}>Courses</h1>

            <AdminCourseFilterNav counts={counts} active={activeFilter} onChange={setActiveFilter} />

            {loading ? (
              <div className="admin-courses-grid">
                 {[...Array(6)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                 ))}
              </div>
            ) : (
              <div className="admin-courses-grid">
                {filteredCourses.map((course) => (
                  <AdminCourseCard key={course.id} course={course} onViewDetails={(id: string) => {
                    sessionStorage.setItem("admin_course_id", id);
                    navigate(`/${slug}/courses/details`, { state: { id } });
                  }} />
                ))}
                {filteredCourses.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)", fontSize: 14 }}>
                    No courses found for this filter.
                  </div>
                )}
              </div>
            )}
            
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;