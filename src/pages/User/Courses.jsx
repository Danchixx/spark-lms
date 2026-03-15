import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import CourseCard, { CourseFilterNav } from "../../components/common/CourseCard/CourseCard";

const COURSES = [
  { id: 1, name: "Sales Fundamentals",   modules: 5, units: 18, status: "Ongoing",     progress: 94, assignedBy: "Admin", icon: "💼", lastModule: "Module 5 · Unit 3: The AIDA Framework" },
  { id: 2, name: "Customer Service Pro", modules: 4, units: 12, status: "Ongoing",     progress: 54, assignedBy: "Admin", icon: "👤", lastModule: "Module 3 · Unit 2: Handling Complaints" },
  { id: 3, name: "Digital Marketing",    modules: 4, units: 11, status: "Completed",   progress: 100, assignedBy: "Admin", icon: "📢", lastModule: "Module 4 · Unit 11: Campaign Analytics" },
  { id: 4, name: "Technical Onboarding", modules: 6, units: 22, status: "Not Started", progress: 0,  assignedBy: "Admin", icon: "⚙️", lastModule: null },
];

const Courses = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const [activeFilter, setActiveFilter] = useState("All");

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const filtered = activeFilter === "All"
    ? COURSES
    : COURSES.filter((c) => c.status === activeFilter);

  const counts = {
    all:        COURSES.length,
    ongoing:    COURSES.filter((c) => c.status === "Ongoing").length,
    completed:  COURSES.filter((c) => c.status === "Completed").length,
    notStarted: COURSES.filter((c) => c.status === "Not Started").length,
  };

  // Last ongoing course for "Continue" banner
  const lastOngoing = COURSES.find((c) => c.status === "Ongoing");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <style>{`
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        @media (max-width: 1024px) {
          .courses-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .courses-grid { grid-template-columns: 1fr; gap: 14px; }
        }
      `}</style>

      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, units ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>My Courses</h1>

          {/* Filter Nav */}
          <CourseFilterNav counts={counts} active={activeFilter} onChange={setActiveFilter} />

          {/* Course Cards Grid */}
          <div className="courses-grid">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "#aaa", fontSize: 14 }}>
                No courses found.
              </div>
            )}
          </div>

          {/* Continue Banner — last ongoing course */}
          {lastOngoing && (
            <div style={{
              background: "white", borderRadius: 12, padding: "16px 20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              {/* Icon */}
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#FF8C00,#FF6B00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {lastOngoing.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a" }}>Continue: {lastOngoing.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{lastOngoing.lastModule}</div>
                {/* Progress bar */}
                <div style={{ marginTop: 8, height: 5, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${lastOngoing.progress}%`, background: "#FF6B00", borderRadius: 99 }} />
                </div>
              </div>

              {/* Button */}
              <button style={{
                background: "#FF6B00", color: "white", border: "none",
                borderRadius: 20, padding: "10px 24px",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "inherit", flexShrink: 0,
              }}>
                Resume Course
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
