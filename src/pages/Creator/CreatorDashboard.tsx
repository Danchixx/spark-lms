import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, PenTool, Plus, ArrowRight } from "lucide-react";
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

const CreatorDashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  // Mock stats — replace with real Supabase queries
  const stats: StatItem[] = [
    { label: "My Courses", value: 3, icon: BookOpen, sub: "1 draft", subColor: "#f59e0b" },
    { label: "Total Lessons", value: 28, icon: FileText, sub: "↑ 4 this week", subColor: "#27ae60" },
    { label: "Assessments", value: 6, icon: PenTool, sub: "All published", subColor: "#27ae60" },
  ];

  const recentCourses = [
    { title: "Sales Fundamentals", status: "Published", modules: 3, lessons: 9, updated: "2 days ago" },
    { title: "Customer Service Pro", status: "Draft", modules: 2, lessons: 4, updated: "5 hrs ago" },
    { title: "Technical Onboarding", status: "Published", modules: 5, lessons: 15, updated: "1 week ago" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="Creator" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <div className="dash-top">
              <div className="dash-top-greeting">
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Welcome Back!</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Here's your course creation overview</div>
              </div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Creator Dashboard</h1>
              <div className="dash-top-btn-wrap">
                <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/courses/create`)}>
                  <Plus size={16} style={{ marginRight: 6 }} /> Create Course
                </Button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            {/* Main Content */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, paddingBottom: 40 }}>

              {/* Recent Courses */}
              <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)" }}>My Courses</div>
                  <Button variant="outline" size="sm" rounded="pill" rightIcon={<ArrowRight size={14} />} onClick={() => navigate(`/${slug}/courses`)}>
                    View All
                  </Button>
                </div>

                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", paddingBottom: 12, borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 13, fontWeight: 600 }}>
                  <div>Course</div>
                  <div>Status</div>
                  <div>Content</div>
                  <div style={{ textAlign: "right" }}>Updated</div>
                </div>

                {/* Rows */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {recentCourses.map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", padding: "16px 0", borderBottom: i < recentCourses.length - 1 ? "1px solid var(--color-border)" : "none", fontSize: 14 }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{c.title}</div>
                      <div>
                        <span style={{
                          background: c.status === "Published" ? "#E8F5E9" : "#FFF3E0",
                          color: c.status === "Published" ? "#2E7D32" : "#E65100",
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        }}>
                          {c.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        {c.modules} modules · {c.lessons} lessons
                      </div>
                      <div style={{ textAlign: "right", color: "var(--color-text-muted)", fontSize: 13 }}>
                        {c.updated}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Quick Actions */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)", marginBottom: 16 }}>Quick Actions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/courses/create`)} style={{ width: "100%", justifyContent: "center" }}>
                      <Plus size={16} style={{ marginRight: 6 }} /> New Course
                    </Button>
                    <Button variant="outline" rounded="pill" onClick={() => navigate(`/${slug}/courses`)} style={{ width: "100%", justifyContent: "center" }}>
                      <BookOpen size={16} style={{ marginRight: 6 }} /> Manage Courses
                    </Button>
                  </div>
                </div>

                {/* Tips */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)", marginBottom: 16 }}>Creator Tips</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { tip: "Break content into small, focused modules for better retention", icon: "💡" },
                      { tip: "Add assessments to each module to measure understanding", icon: "📝" },
                      { tip: "Use video lessons for complex topics, reading for reference material", icon: "🎬" },
                    ].map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--color-border)" : "none" }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{t.tip}</span>
                      </div>
                    ))}
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

export default CreatorDashboard;
