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
import { RECENT_COURSES, PENDING_ASSESSMENTS, RECENT_ACTIVITY } from "../../utils/mockData";

const STATS = [
  { label: "Enrolled Courses", value: 10, icon: BookOpen, sub: "↑ 2 this month", subColor: "#27ae60" },
  { label: "Ongoing Courses", value: 7, icon: BookMarked, sub: "2 not started", subColor: "#888" },
  { label: "Completed Courses", value: 3, icon: CheckCircle, sub: "↑ 1 this week", subColor: "#27ae60" },
  { label: "Certificate Earned", value: 9, icon: Award, sub: "↑ 5 new", subColor: "#27ae60" },
];

const StatCard = ({ label, value, icon: Icon, sub, subColor }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "white", borderRadius: 12, padding: "18px 20px", borderTop: "3px solid #FF6B00", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)", transform: hovered ? "translateY(-4px)" : "translateY(0)", transition: "all 0.2s ease", cursor: "default" }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 36, fontWeight: 900 }}>{value}</div>
        <Icon size={28} color={hovered ? "#FF6B00" : "#1a1a1a"} style={{ transition: "color 0.2s" }} />
      </div>
      <div style={{ fontSize: 11, color: subColor, marginTop: 6 }}>{sub}</div>
    </div>
  );
};

const Dashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .dash-bottom { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .dash-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .dash-top-greeting { flex: 1; }
        .dash-top-title { flex: 1; font-size: 28px; font-weight: 800; margin: 0; text-align: center; white-space: nowrap; }
        .dash-top-btn-wrap { flex: 1; display: flex; justify-content: flex-end; }
        .col-progress, .col-remark { }
        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 620px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .dash-top { flex-wrap: wrap; }
          .dash-top-greeting { display: none; }
          .dash-top-title { order: 1; flex: 0 0 100%; text-align: center; margin-bottom: 10px; }
          .dash-top-btn-wrap { order: 2; flex: 0 0 100%; justify-content: center; }
          .col-progress, .col-remark { display: none; }
          .dash-padding { padding: 16px 14px !important; }
        }
      `}</style>

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
              <Button rightIcon={<ChevronRight size={16} />}>Continue Learning</Button>
            </div>
          </div>

          <div className="dash-stats">
            {STATS.map((s) => <StatCard key={s.label} {...s} />)}
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
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <ClipboardList size={20} color="#FF6B00" />
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