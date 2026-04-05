import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import CourseCard, { CourseFilterNav } from "../../components/common/CourseCard/CourseCard";
import { useCourses } from "../../hooks/useCourses";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

const Courses = () => {
  const { courses: allCourses, loading } = useCourses();
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const [activeFilter, setActiveFilter] = useState("All");

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const filtered = activeFilter === "All" ? allCourses : allCourses.filter((c) => c.status === activeFilter);
  const counts = {
    all: allCourses.length,
    ongoing: allCourses.filter((c) => c.status === "Ongoing").length,
    completed: allCourses.filter((c) => c.status === "Completed").length,
    notStarted: allCourses.filter((c) => c.status === "Not Started").length,
  };
  const lastOngoing = allCourses.find((c) => c.status === "Ongoing");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <style>{`
        .courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px; }
        @media (max-width: 1024px) { .courses-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .courses-grid { grid-template-columns: 1fr; gap: 14px; } }
      `}</style>

      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px", color: "var(--color-text-header)" }}>My Courses</h1>

            <CourseFilterNav counts={counts} active={activeFilter} onChange={setActiveFilter} />

            {loading ? (
              <div className="courses-grid">
                <Skeleton height={320} borderRadius={16} />
                <Skeleton height={320} borderRadius={16} />
                <Skeleton height={320} borderRadius={16} />
              </div>
            ) : (
              <div className="courses-grid">
                {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)", fontSize: 14 }}>No courses found.</div>
                )}
              </div>
            )}

            {/* Continue Banner */}
            {lastOngoing && (
              <div className="continue-banner" style={{ background: "var(--color-surface)", borderRadius: 12, padding: "16px 20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 16 }}>
                <style>{`
                  @media (max-width: 600px) {
                    .continue-banner {
                      flex-direction: column !important;
                      align-items: flex-start !important;
                      gap: 12px !important;
                      padding: 20px !important;
                    }
                    .banner-content {
                      width: 100% !important;
                    }
                    .banner-btn {
                      width: 100% !important;
                      margin-top: 4px !important;
                    }
                    .banner-info-row {
                      display: flex !important;
                      gap: 12px !important;
                      align-items: center !important;
                      margin-bottom: 8px !important;
                    }
                  }
                `}</style>

                {/* Mobile Info Row (grouped for stacking) */}
                <div className="banner-info-row" style={{ display: "contents" }}>
                  <div style={{ width: 62, height: 62, borderRadius: 10, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden", border: "1.5px solid var(--color-border)" }}>
                    {lastOngoing.thumbnail ? (
                      <img src={lastOngoing.thumbnail} alt={lastOngoing.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      lastOngoing.icon
                    )}
                  </div>
                  <div className="banner-content" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-header)" }}>Continue: {lastOngoing.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{lastOngoing.lastModule}</div>
                    <div style={{ marginTop: 8, height: 5, background: "var(--color-bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${lastOngoing.progress}%`, background: "#FF6B00", borderRadius: 99 }} />
                    </div>
                  </div>
                </div>

                <div className="banner-btn" style={{ flexShrink: 0 }}>
                  <Button rounded="pill" style={{ width: "100%" }} onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId: lastOngoing.id } })}>Resume Course</Button>
                </div>
              </div>
            )}
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default Courses;