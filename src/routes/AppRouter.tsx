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
import SparkAdminDashboard from "../pages/SuperAdmin/SADashboard";
// import AdminDashboard      from "../pages/Admin/Dashboard";
// import ApproverDashboard   from "../pages/Approver/Dashboard";

import type { ReactNode } from "react";
import type { RoleName } from "../types";

// ── Role → Dashboard map ─────────────────────────────────────
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case "admin": return <div>Admin Dashboard — coming soon</div>;
    case "approver": return <div>Approver Dashboard — coming soon</div>;
    case "creator": return <div>Creator Dashboard — coming soon</div>;
    case "spark_admin": return <div>Spark Admin Dashboard — coming soon</div>;
    default: return <UserDashboard />;
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

        {/* Super Admin */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute role="spark_admin">
              <SparkAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected — same URL, different component per role */}
        <Route path="/:company/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/:company/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/:company/courses" element={<ProtectedRoute><UserCourses /></ProtectedRoute>} />
        <Route path="/:company/courses/modules" element={<ProtectedRoute><UserCourseModules /></ProtectedRoute>} />
        <Route path="/:company/courses/lessons" element={<ProtectedRoute><UserModuleLessons /></ProtectedRoute>} />
        <Route path="/:company/courses/assessment" element={<ProtectedRoute><UserModuleAssessment /></ProtectedRoute>} />
        <Route path="/:company/courses/attempts" element={<ProtectedRoute><UserModuleAttempts /></ProtectedRoute>} />
        <Route path="/:company/certificates" element={<ProtectedRoute><UserCertificates /></ProtectedRoute>} />
        <Route path="/:company/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
        <Route path="/:company/contact" element={<ProtectedRoute><UserContact /></ProtectedRoute>} />


        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user && slug ? `/${slug}/dashboard` : "/"} replace />} />
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