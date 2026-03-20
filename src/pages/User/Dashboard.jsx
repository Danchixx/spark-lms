import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, BookMarked, CheckCircle, Award, ClipboardList, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import { RECENT_COURSES, PENDING_ASSESSMENTS, RECENT_ACTIVITY } from "../../utils/mockData";
import "./Dashboard.css";

const STATS = [
  { label: "Enrolled Courses", value: 10, icon: BookOpen, sub: "↑ 2 this month", subColor: "#27ae60" },
  { label: "Ongoing Courses", value: 7, icon: BookMarked, sub: "2 not started", subColor: "#888" },
  { label: "Completed Courses", value: 3, icon: CheckCircle, sub: "↑ 1 this week", subColor: "#27ae60" },
  { label: "Certificate Earned", value: 9, icon: Award, sub: "↑ 5 new", subColor: "#27ae60" },
];

const Dashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>

      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, units ..." role="User" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div className="dash-top">
            <div className="dash-top-greeting">
              <div style={{ fontSize: 13, color: "#888" }}>Hello {user.name.split(" ")[0]},</div>
              <div style={{ fontSize: 13, color: "#888" }}>Welcome back!</div>
            </div>
            <h1 className="dash-top-title">Dashboard</h1>
            <div className="dash-top-btn-wrap">
              <Button rightIcon={<ChevronRight size={16} />} onClick={() => navigate(`/${slug}/courses`)}>Continue Learning</Button>
            </div>
          </div>

          <div className="dash-stats">
            {STATS.map((s) => <DashboardCard key={s.label} {...s} />)}
          </div>

          <div className="dash-bottom">
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>My Recent Courses</div>
                <span style={{ fontSize: 12, color: "#FF6B00", cursor: "pointer" }}>View All →</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 280 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#999", fontWeight: 600 }}>Course</th>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#999", fontWeight: 600 }}>Status</th>
                      <th className="col-progress" style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#999", fontWeight: 600 }}>Progress</th>
                      <th className="col-remark" style={{ textAlign: "left", padding: "8px 10px", fontSize: 12, color: "#999", fontWeight: 600 }}>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_COURSES.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8f8f8" }}>
                        <td style={{ padding: "12px 10px", fontSize: 13, fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: "12px 10px" }}><StatusBadge status={c.status} /></td>
                        <td className="col-progress" style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {c.progress > 0 && <ProgressBar value={c.progress} />}
                            {c.progress > 0 && <span style={{ fontSize: 11, color: "#888" }}>{c.progress}%</span>}
                          </div>
                        </td>
                        <td className="col-remark" style={{ padding: "12px 10px", fontSize: 12, color: c.remark === "Passed" ? "#27ae60" : "#aaa", fontWeight: c.remark === "Passed" ? 700 : 400 }}>{c.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Pending Assessments</div>
                  <span style={{ background: "#FF6B00", color: "white", fontSize: 11, fontWeight: 800, borderRadius: 20, padding: "2px 8px" }}>{PENDING_ASSESSMENTS.length}</span>
                </div>
                {PENDING_ASSESSMENTS.map((a, i) => (
                  <div key={i} className="pending-assessment-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <ClipboardList size={20} className="pending-icon" />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={13} />}>Start</Button>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Activity</div>
                {RECENT_ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: a.text.replace(/"([^"]+)"/g, '<strong>"$1"</strong>') }} />
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;