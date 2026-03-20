import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import SparkAdminLogin from "../pages/Auth/SparkAdminLogin";

import UserDashboard from "../pages/User/Dashboard";
import UserProfile from "../pages/User/Profile";
import UserCourses from "../pages/User/Courses";
import UserCourseModules from "../pages/User/CourseModules";

import SparkAdminDashboard from "../pages/SuperAdmin/SADashboard";
// import AdminDashboard      from "../pages/Admin/Dashboard";
// import ApproverDashboard   from "../pages/Approver/Dashboard";
// import SparkAdminDashboard from "../pages/SparkAdmin/Dashboard";

// ── Role → Dashboard map ─────────────────────────────────────
const DashboardRouter = () => {
  const { user, company } = useAuth();
  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case "admin": return <div>Admin Dashboard — coming soon</div>;
    case "approver": return <div>Approver Dashboard — coming soon</div>;
    case "creator": return <div>Creator Dashboard — coming soon</div>;
    case "spark_admin": return <div>Spark Admin Dashboard — coming soon</div>;
    default: return <UserDashboard user={user} />;
  }
};

// ── Protect routes ────────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ── App Router ────────────────────────────────────────────────
const AppRouter = () => {
  const { user, company, selectCompany, login, logout } = useAuth();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<SparkAdminLogin />} />
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
        {/* Add more shared routes here e.g. /:company/courses, /:company/certificates */}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user && slug ? `/${slug}/dashboard` : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;