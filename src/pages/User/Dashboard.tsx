import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, BookMarked, CheckCircle, Award, ClipboardList, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import { useCourses } from "../../hooks/useCourses";
import "./Dashboard.css";

import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  defaultVal?: number;
  value?: number;
  icon: LucideIcon;
  sub: string;
  subColor: string;
};

type PendingAssessment = {
  id: number | string;
  title?: string;
  name?: string;
};

type ActivityItem = {
  text: string;
  time: string;
};

const Dashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courses, loading: loadingDb } = useCourses();
  const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([]);
  const [recentActivity] = useState<ActivityItem[]>([]);

  // Derive stats from live course data
  const enrolled = courses.length;
  const ongoing = courses.filter(c => c.status === 'Ongoing').length;
  const completed = courses.filter(c => c.status === 'Completed').length;
  const notStarted = courses.filter(c => c.status === 'Not Started').length;
  const certificates = completed;

  const stats: StatItem[] = [
    { label: "Enrolled Courses", value: enrolled, icon: BookOpen, sub: `${notStarted} not started`, subColor: "#888" },
    { label: "Ongoing Courses", value: ongoing, icon: BookMarked, sub: "In progress", subColor: "#FF6B00" },
    { label: "Completed Courses", value: completed, icon: CheckCircle, sub: "All lessons done", subColor: "#27ae60" },
    { label: "Certificate Earned", value: certificates, icon: Award, sub: completed > 0 ? "View certificates" : "Complete a course", subColor: completed > 0 ? "#27ae60" : "#888" },
  ];

  // Derive recent courses from the hook data
  const recentCourses = courses.slice(0, 5).map(c => ({
    name: c.name,
    status: c.status,
    progress: c.progress,
    remark: c.status === 'Completed' ? 'Passed' : '-',
  }));

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>

      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <div className="dash-top">
              <div className="dash-top-greeting">
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Hello {user?.name?.split(" ")[0] || "Student"},</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Welcome back!</div>
              </div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Dashboard</h1>
              <div className="dash-top-btn-wrap">
                <Button rightIcon={<ChevronRight size={16} />} onClick={() => navigate(`/${slug}/courses`)}>Continue Learning</Button>
              </div>
            </div>

            <div className="dash-stats">
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            <div className="dash-bottom">
              <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-header)" }}>My Recent Courses</div>
                  <span style={{ fontSize: 12, color: "#FF6B00", cursor: "pointer" }} onClick={() => navigate(`/${slug}/courses`)}>View All →</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 280 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Course</th>
                        <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Status</th>
                        <th className="col-progress" style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Progress</th>
                        <th className="col-remark" style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCourses.length === 0 && !loadingDb ? (
                        <tr>
                          <td colSpan={4} style={{ padding: "20px 10px", textAlign: "center", color: "#aaa", fontSize: 13 }}>No recent courses found.</td>
                        </tr>
                      ) : (
                        recentCourses.map((c, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "12px 10px", fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{c.name}</td>
                            <td style={{ padding: "12px 10px" }}><StatusBadge status={c.status} /></td>
                            <td className="col-progress" style={{ padding: "12px 10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {c.progress > 0 && <ProgressBar value={c.progress} />}
                                {c.progress > 0 && <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{c.progress}%</span>}
                              </div>
                            </td>
                            <td className="col-remark" style={{ padding: "12px 10px", fontSize: 12, color: c.remark === "Passed" ? "#27ae60" : "#aaa", fontWeight: c.remark === "Passed" ? 700 : 400 }}>{c.remark}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-header)" }}>Pending Assessments</div>
                    <span style={{ background: "#FF6B00", color: "white", fontSize: 11, fontWeight: 800, borderRadius: 20, padding: "2px 8px" }}>{pendingAssessments.length}</span>
                  </div>
                  {pendingAssessments.length === 0 && !loadingDb ? (
                    <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "10px 0" }}>No pending assessments.</div>
                  ) : (
                    pendingAssessments.map((a, i) => (
                      <div key={i} className="pending-assessment-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ClipboardList size={20} className="pending-icon" style={{ color: "var(--color-text-muted)" }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{a.title || a.name || `Assessment #${a.id}`}</span>
                        </div>
                        <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={13} />}>Start</Button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: 20, boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--color-text-header)" }}>Recent Activity</div>
                  {recentActivity.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "10px 0" }}>No recent activity.</div>
                  ) : (
                    recentActivity.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />
                        <div>
                          <div style={{ fontSize: 12, color: "var(--color-text)", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: a.text?.replace(/"([^"]+)"/g, '<strong>"$1"</strong>') || '' }} />
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>{a.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;