import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import PageTransition from "../../components/common/PageTransition";
import { ComingSoon } from "../SuperAdmin/SADashboard";

const AdminAuditLogs = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase().replace(/\s+/g, "-")}`);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Audit Logs" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} role="Admin" />
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <div className="dash-top">
                <div className="dash-top-greeting"></div>
                <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Audit Logs</h1>
                <div className="dash-top-btn-wrap"></div>
            </div>
            <ComingSoon label="audit logs" />
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
