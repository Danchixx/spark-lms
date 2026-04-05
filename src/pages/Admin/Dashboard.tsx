import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, CheckCircle, Award } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import "../User/Dashboard.css";

import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  sub: string;
  subColor: string;
};

const AdminDashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);


  const stats: StatItem[] = [
    { label: "Total Users", value: 32, icon: Users, sub: "↑ 8 this month", subColor: "#27ae60" },
    { label: "Active Courses", value: 7, icon: BookOpen, sub: "2 pending", subColor: "#888" },
    { label: "Completions", value: 45, icon: CheckCircle, sub: "↑ 12 this week", subColor: "#27ae60" },
    { label: "Certificate Issued", value: 26, icon: Award, sub: "↑ 5 new", subColor: "#27ae60" },
  ];

  const overviewCourses = [
    { title: "Sales Fundamentals", status: "Active", progress: 78, enrolled: 24 },
    { title: "Customer Service Pro", status: "Pending", progress: null, enrolled: null },
    { title: "Technical Onboarding", status: "Active", progress: 92, enrolled: 34 },
    { title: "Digital Marketing", status: "Active", progress: 67, enrolled: 23 },
  ];

  const pendingApprovals = [
    { name: "Althea Reyes", sub: "New Employee User" },
    { name: "Karl Torres", sub: "New Employee User" },
  ];

  const recentActivity = [
    { name: "Ana Cruz", action: "completed \"Sales Fundamentals\"", time: "2 mins ago", color: "#FF6B00" },
    { name: "Bob Lee", action: "completed an assessment", time: "14 mins ago", color: "#FF6B00" },
    { name: "Certificate", action: "issued to Pia Gomez", time: "1 hr ago", color: "#FF6B00" },
    { name: "New User", action: "Althea Reyes pending for approval", time: "2 hrs ago", color: "#FF6B00" },
    { name: "Ian Palabrica", action: "has been banned", time: "1 day ago", color: "#c0392b" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search users, courses, ..." role="Admin" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          <PageTransition>
            <div className="dash-top">
              <div className="dash-top-greeting">
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Welcome Back!</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Here's what happening to {company?.name || "your company"} today</div>
              </div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Dashboard</h1>
              <div className="dash-top-btn-wrap"></div>
            </div>

            {/* Metric Cards */}
            <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            {/* Main Content Area */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, paddingBottom: 40 }}>

              {/* Course Overview */}
              <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)" }}>Course Overview</div>
                  <Button variant="outline" size="sm" rounded="pill" rightIcon={<span style={{ fontWeight: "700" }}>→</span>}>View All</Button>
                </div>

                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", paddingBottom: 12, borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 13, fontWeight: 600 }}>
                  <div>Course</div>
                  <div>Status</div>
                  <div>Progress</div>
                  <div style={{ textAlign: "right" }}>Enrolled</div>
                </div>

                {/* Table Rows */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {overviewCourses.map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", padding: "16px 0", borderBottom: i < overviewCourses.length - 1 ? "1px solid var(--color-border)" : "none", fontSize: 14 }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{c.title}</div>
                      <div>
                        {c.status === "Active" ? (
                          <span style={{ background: "#cfffdc", color: "#27ae60", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block" }}>Active</span>
                        ) : (
                          <span style={{ background: "#ffe6d5", color: "#FF6B00", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block" }}>Pending</span>
                        )}
                      </div>
                      <div style={{ minWidth: 80, display: "flex", alignItems: "center", gap: 8 }}>
                        {c.progress !== null ? (
                          <>
                            <span style={{ fontSize: 11, fontWeight: 700, width: 28 }}>{c.progress}%</span>
                            <ProgressBar value={c.progress} size="sm" color={c.progress >= 90 ? "#27ae60" : "#FF6B00"} />
                          </>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)" }}>—</span>
                        )}
                      </div>
                      <div style={{ textAlign: "right", color: "var(--color-text-muted)", fontSize: 13 }}>
                        {c.enrolled !== null ? c.enrolled : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Pending Approvals & Recent Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Pending Approvals */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)" }}>Pending Approvals</div>
                    <div style={{ background: "#FFEDD5", color: "#FF6B00", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>2</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {pendingApprovals.map((u, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: i < pendingApprovals.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={18} color="var(--color-text-muted)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-header)" }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{u.sub}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" rounded="pill" rightIcon={<span style={{ fontWeight: "700" }}>→</span>}>Review</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)", marginBottom: 16 }}>Recent Activity</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {recentActivity.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 12, borderBottom: i < recentActivity.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                        <div style={{ marginTop: 4, width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }}></div>
                        <div>
                          <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--color-text-muted)" }}>
                            <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>{a.name}</span> {a.action}
                          </div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{a.time}</div>
                        </div>
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

export default AdminDashboard;
