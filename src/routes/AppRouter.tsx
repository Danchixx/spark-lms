import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useInactivityTimeout from "../hooks/useInactivityTimeout";
import SessionExpiredModal from "../components/common/Modal/SessionExpiredModal";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import SparkAdminLogin from "../pages/Auth/SparkAdminLogin";

import UserDashboard from "../pages/User/Dashboard";
import UserProfile from "../pages/User/Profile";
import UserCourses from "../pages/User/Courses";
import UserCourseModules from "../pages/User/CourseModules";
import UserModuleLessons from "../pages/User/ModuleLessons";
import UserModuleAssessment from "../pages/User/ModuleAssessment";
import UserModuleAttempts from "../pages/User/ModuleAttempts";
import UserCertificates from "../pages/User/Certificates";
import UserSettings from "../pages/User/Settings";
import UserContact from "../pages/User/Contact";
import SADashboard, { DashboardHome, ComingSoon } from "../pages/SuperAdmin/SADashboard";
import SparkTenants from "../pages/SuperAdmin/Tenants/SparkTenants";
import SparkApprovals from "../pages/SuperAdmin/Approvals/SparkApprovals";
import SparkUsers from "../pages/SuperAdmin/Users/SparkUsers";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminProfile from "../pages/Admin/Profile";
import AdminUsers from "../pages/Admin/Users";
import AdminApprovals from "../pages/Admin/Approvals";
import AdminReports from "../pages/Admin/Reports";
import AdminAuditLogs from "../pages/Admin/AuditLogs";

// import ApproverDashboard   from "../pages/Approver/Dashboard";

import type { ReactNode } from "react";
import type { RoleName } from "../types";

// ── Role → Dashboard map ─────────────────────────────────────
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case "admin": return <AdminDashboard />;
    case "approver": return <div>Approver Dashboard — coming soon</div>;
    case "creator": return <div>Creator Dashboard — coming soon</div>;
    case "spark_admin": return <Navigate to="/superadmin/dashboard" replace />;
    default: return <UserDashboard />;
  }
};

const ProfileRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  switch (user.role) {
    case "admin": return <AdminProfile />;
    default: return <UserProfile />;
  }
};

const UsersRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  switch (user.role) {
    case "admin": return <AdminUsers />;
    default: return <Navigate to="dashboard" replace />;
  }
};

// ── Protect routes ────────────────────────────────────────────
type ProtectedRouteProps = {
  children: ReactNode;
  role?: RoleName;
};

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Inner router (needs useNavigate, so must be inside BrowserRouter) ──
const AppRoutes = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  // Inactivity timeout — only active when user is logged in
  const sessionExpired = useInactivityTimeout(!!user);

  const handleSessionExpired = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Routes location={location}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<SparkAdminLogin />} />
        <Route path="/:company" element={<Login />} />

        {/* Super Admin — SADashboard layout with nested routes */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="spark_admin">
              <SADashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="tenants" element={<SparkTenants />} />
          <Route path="approvals" element={<SparkApprovals />} />
          <Route path="users" element={<SparkUsers />} />
          <Route path="courses" element={<ComingSoon label="courses" />} />
          <Route path="settings" element={<ComingSoon label="settings" />} />
        </Route>

        {/* Protected — same URL, different component per role */}
        <Route path="/:company/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/:company/profile" element={<ProtectedRoute><ProfileRouter /></ProtectedRoute>} />
        <Route path="/:company/users" element={<ProtectedRoute><UsersRouter /></ProtectedRoute>} />
        <Route path="/:company/approvals" element={<ProtectedRoute><AdminApprovals /></ProtectedRoute>} />
        <Route path="/:company/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
        <Route path="/:company/audit-logs" element={<ProtectedRoute><AdminAuditLogs /></ProtectedRoute>} />
        <Route path="/:company/courses" element={<ProtectedRoute><UserCourses /></ProtectedRoute>} />
        <Route path="/:company/courses/modules" element={<ProtectedRoute><UserCourseModules /></ProtectedRoute>} />
        <Route path="/:company/courses/lessons" element={<ProtectedRoute><UserModuleLessons /></ProtectedRoute>} />
        <Route path="/:company/courses/assessment" element={<ProtectedRoute><UserModuleAssessment /></ProtectedRoute>} />
        <Route path="/:company/courses/attempts" element={<ProtectedRoute><UserModuleAttempts /></ProtectedRoute>} />
        <Route path="/:company/certificates" element={<ProtectedRoute><UserCertificates /></ProtectedRoute>} />
        <Route path="/:company/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
        <Route path="/:company/contact" element={<ProtectedRoute><UserContact /></ProtectedRoute>} />


        {/* Catch-all */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user?.role === "spark_admin"
                  ? "/superadmin/dashboard"
                  : user && slug
                    ? `/${slug}/dashboard`
                    : "/"
              }
              replace
            />
          }
        />
      </Routes>

      {/* Session expired overlay */}
      <SessionExpiredModal isOpen={sessionExpired} onLoginAgain={handleSessionExpired} />
    </>
  );
};

// ── App Router ────────────────────────────────────────────────
const AppRouter = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default AppRouter;