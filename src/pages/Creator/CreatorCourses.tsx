import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, FileText, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import * as courseService from "../../services/courseCreatorService";

// ─── Filter Nav ─────────────────────────────────────────────
const CreatorFilterNav = ({ counts, active, onChange }: { counts: { all: number; published: number; draft: number }; active: string; onChange: (f: string) => void }) => {
  const filters = [
    { key: "All", label: `All (${counts.all})` },
    { key: "published", label: `Published (${counts.published})` },
    { key: "draft", label: `Drafts (${counts.draft})` },
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
                layoutId="creatorCourseTab"
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

// ─── Course Card ────────────────────────────────────────────
const CreatorCourseCard = ({ course, onEdit }: { course: any; onEdit: (id: string) => void }) => {
  const isDraft = course.status === "draft";

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
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 150, overflow: "hidden" }}>
        <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />

        <div style={{
          position: "absolute", top: 12, left: 12,
          fontSize: 10, padding: "3px 10px",
          background: isDraft ? "#FFF3E0" : "#E8F5E9",
          color: isDraft ? "#E65100" : "#2E7D32",
          fontWeight: 700, borderRadius: 6,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
          {isDraft ? "Draft" : "Published"}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--color-text-header)", lineHeight: 1.3, marginBottom: 4 }}>
            {course.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
            {course.description}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--color-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <BookOpen size={12} /> {course.modulesCount} Modules
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <FileText size={12} /> {course.lessonsCount} Lessons
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--color-bg-subtle)",
        borderTop: "1px solid var(--color-border)",
      }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={12} />
          Created {new Date(course.createdAt).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
        </div>

        <Button
          size="sm"
          rounded="pill"
          variant={isDraft ? "primary" : "outline"}
          onClick={() => onEdit(course.id)}
        >
          {isDraft ? "Continue Editing" : "Edit Course"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
const CreatorCourses = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const [activeFilter, setActiveFilter] = useState("All");

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses created by this user
  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.id) return;
      try {
        const data = await courseService.fetchCreatorCourses(user.id as string);
        setCourses(data);
      } catch (err) {
        console.error("Failed to load creator courses:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [user]);

  const filtered = activeFilter === "All"
    ? courses
    : courses.filter((c) => c.status === activeFilter);

  const counts = {
    all: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    draft: courses.filter((c) => c.status === "draft").length,
  };

  const handleEditCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    navigate(`/${slug}/courses/builder`, {
      state: {
        courseId,
        courseData: course ? {
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail,
          status: course.status,
        } : undefined,
      },
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <style>{`
        .creator-courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-bottom: 24px; }
        @media (max-width: 1024px) { .creator-courses-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  { .creator-courses-grid { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>

      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search your courses ..." role="Creator" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            {/* Header with Create button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--color-text-header)" }}>My Courses</h1>
              <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/courses/create`)}>
                <Plus size={16} style={{ marginRight: 6 }} /> Create Course
              </Button>
            </div>

            <CreatorFilterNav counts={counts} active={activeFilter} onChange={setActiveFilter} />

            <div className="creator-courses-grid">
              {filtered.map((course) => (
                <CreatorCourseCard key={course.id} course={course} onEdit={handleEditCourse} />
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 8 }}>No courses yet</div>
                  <div style={{ fontSize: 14, marginBottom: 20 }}>Start creating your first course to get started.</div>
                  <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/courses/create`)}>
                    <Plus size={16} style={{ marginRight: 6 }} /> Create Your First Course
                  </Button>
                </div>
              )}
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default CreatorCourses;
