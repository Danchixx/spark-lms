import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, BookMarked, CheckCircle, Award, ClipboardList, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import "./Dashboard.css";

const STATS_TEMPLATE = [
  { label: "Enrolled Courses", defaultVal: 0, icon: BookOpen, sub: "0 this month", subColor: "#888" },
  { label: "Ongoing Courses", defaultVal: 0, icon: BookMarked, sub: "0 not started", subColor: "#888" },
  { label: "Completed Courses", defaultVal: 0, icon: CheckCircle, sub: "0 this week", subColor: "#888" },
  { label: "Certificate Earned", defaultVal: 0, icon: Award, sub: "0 new", subColor: "#888" },
];

const Dashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [stats, setStats] = useState(STATS_TEMPLATE);
  const [recentCourses, setRecentCourses] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoadingDb(true);

        // Fetch user's assigned courses
        const { data: assignments, error: assignErr } = await supabase
          .from('course_assignments')
          .select(`
            status,
            progress,
            courses ( id, title )
          `)
          .eq('user_id', user.id);

        if (assignErr) {
            console.warn("Could not fetch course assignments - tables might be empty.", assignErr);
            setRecentCourses([]);
        } else if (assignments) {
            const enrolled = assignments.length;
            const ongoing = assignments.filter(a => a.status === 'in_progress').length;
            const completed = assignments.filter(a => a.status === 'completed').length;
            
            setStats([
                { label: "Enrolled Courses", value: enrolled, icon: BookOpen, sub: "Live data", subColor: "#27ae60" },
                { label: "Ongoing Courses", value: ongoing, icon: BookMarked, sub: "Live data", subColor: "#888" },
                { label: "Completed Courses", value: completed, icon: CheckCircle, sub: "Live data", subColor: "#27ae60" },
                { label: "Certificate Earned", value: 0, icon: Award, sub: "Live data", subColor: "#888" },
            ]);

            // Map recent courses
            setRecentCourses(assignments.slice(0, 5).map(a => ({
                name: a.courses?.title || 'Unknown Course',
                status: a.status === 'in_progress' ? 'Ongoing' : a.status === 'completed' ? 'Completed' : 'Not Started',
                progress: a.progress || 0,
                remark: a.status === 'completed' ? 'Passed' : '-'
            })));
        }

        // Fetch assessments 
        const { data: assessments, error: asdErr } = await supabase
          .from('assessments')
          .select('*')
          .limit(3);
          
        if (!asdErr && assessments) {
            setPendingAssessments(assessments);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>

      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search ..." role="User" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
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
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            <div className="dash-bottom">
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>My Recent Courses</div>
                  <span style={{ fontSize: 12, color: "#FF6B00", cursor: "pointer" }} onClick={() => navigate(`/${slug}/courses`)}>View All →</span>
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
                      {recentCourses.length === 0 && !loadingDb ? (
                        <tr>
                          <td colSpan={4} style={{ padding: "20px 10px", textAlign: "center", color: "#aaa", fontSize: 13 }}>No recent courses found.</td>
                        </tr>
                      ) : (
                        recentCourses.map((c, i) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Pending Assessments</div>
                    <span style={{ background: "#FF6B00", color: "white", fontSize: 11, fontWeight: 800, borderRadius: 20, padding: "2px 8px" }}>{pendingAssessments.length}</span>
                  </div>
                  {pendingAssessments.length === 0 && !loadingDb ? (
                    <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "10px 0" }}>No pending assessments.</div>
                  ) : (
                    pendingAssessments.map((a, i) => (
                      <div key={i} className="pending-assessment-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ClipboardList size={20} className="pending-icon" />
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{a.title || a.name || `Assessment #${a.id}`}</span>
                        </div>
                        <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={13} />}>Start</Button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent Activity</div>
                  {recentActivity.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "10px 0" }}>No recent activity.</div>
                  ) : (
                    recentActivity.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 4 }} />
                        <div>
                          <div style={{ fontSize: 12, color: "#333", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: a.text?.replace(/"([^"]+)"/g, '<strong>"$1"</strong>') || '' }} />
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{a.time}</div>
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