import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, Check, X, RotateCcw, Send } from "lucide-react";
import { COURSES } from "../../data/mockCourses";
import PageTransition from "../../components/common/PageTransition";

const PASSING_SCORE = 70; // Change this to adjust the passing score

const ModuleAttempts = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, newScore } = location.state || {};
  const course = COURSES.find((c) => c.id === parseInt(courseId));
  const module = course?.modules?.find((m) => m.id === parseInt(moduleId));

  // Build mock attempts list (seed with previous + new one if score passed from assessment)
  const [attempts, setAttempts] = useState(() => {
    const initial = [];
    if (newScore !== null && newScore !== undefined) {
      initial.push({
        id: 1,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        score: newScore,
        status: newScore >= PASSING_SCORE ? "Passed" : "Failed",
        submitted: false
      });
    }
    return initial;
  });

  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  if (!course || !module) {
    return <Navigate to={`/${slug}/courses`} replace />;
  }

  const hasPassingAttempt = attempts.some((a) => a.score >= PASSING_SCORE);
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  const handleReAssess = () => {
    navigate(`/${slug}/courses/assessment`, {
      state: { courseId, moduleId }
    });
  };

  const handleSubmitAttempt = () => {
    setAssessmentCompleted(true);
    // Mark the best passing attempt as submitted
    setAttempts((prev) =>
      prev.map((a) =>
        a.score >= PASSING_SCORE && !a.submitted
          ? { ...a, submitted: true }
          : a
      )
    );
  };

  const handleBackToModules = () => {
    navigate(`/${slug}/courses/modules`, {
      state: { courseId }
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>

          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 16 }}>
            <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={handleBackToModules}>
              Modules
            </Button>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Module {module.id}</span>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Attempts</span>
          </div>

          {/* Header Card */}
          <div style={{
            background: "white", borderRadius: 12, padding: "28px 32px", marginBottom: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <h2 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700 }}>
                Module {module.id} Assessment — {module.name}
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: "#888" }}>
                Passing score: <strong style={{ color: "#FF6B00" }}>{PASSING_SCORE}%</strong> · 
                {" "}Total attempts: <strong>{attempts.length}</strong> · 
                {" "}Best score: <strong style={{ color: bestScore >= PASSING_SCORE ? "#27ae60" : "#e74c3c" }}>{bestScore}%</strong>
              </p>
            </div>

            {assessmentCompleted ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#e0ffec", padding: "10px 24px", borderRadius: 99 }}>
                <Check size={18} color="#27ae60" strokeWidth={3} />
                <span style={{ fontWeight: 700, color: "#27ae60", fontSize: 14 }}>Assessment Completed</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="outline" rounded="pill" leftIcon={<RotateCcw size={16} />} onClick={handleReAssess}>
                  Re-Assess
                </Button>
                {hasPassingAttempt && (
                  <Button variant="primary" rounded="pill" leftIcon={<Send size={16} />} onClick={handleSubmitAttempt}>
                    Submit Attempt
                  </Button>
                )}
              </div>
            )}
          </div>

          {assessmentCompleted && (
            <div style={{
              background: "#e0ffec", borderRadius: 8, padding: "14px 20px",
              marginBottom: 24, display: "flex", alignItems: "center", gap: 12,
              border: "1px solid #a3dfb8"
            }}>
              <Check size={20} color="#27ae60" />
              <span style={{ fontSize: 14, color: "#27ae60", fontWeight: 600 }}>
                 Your passing attempt has been submitted! The assessment is now complete and you can proceed to the next module.
              </span>
              <Button variant="primary" size="sm" rounded="pill" onClick={handleBackToModules} style={{ marginLeft: "auto" }}>
                Back to Modules
              </Button>
            </div>
          )}

          {/* Attempts Table */}
          {attempts.length === 0 ? (
            <div style={{
              background: "white", borderRadius: 12, padding: "60px 32px",
              textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1a1a1a" }}>No Attempts Yet</h3>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Take the assessment to see your results here.</p>
              <Button variant="primary" rounded="pill" onClick={handleReAssess}>Start Assessment</Button>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Table Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 120px 120px",
                padding: "14px 24px", borderBottom: "2px solid #f0f0f0",
                fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5
              }}>
                <span>#</span>
                <span>Date</span>
                <span>Time</span>
                <span>Score</span>
                <span>Status</span>
                <span></span>
              </div>

              {/* Table Rows */}
              {attempts.map((attempt, idx) => {
                const isPassed = attempt.score >= PASSING_SCORE;
                return (
                  <div
                    key={attempt.id}
                    style={{
                      display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 120px 120px",
                      padding: "18px 24px", borderBottom: "1px solid #f0f0f0",
                      fontSize: 14, alignItems: "center",
                      background: idx % 2 === 0 ? "white" : "#fafafa"
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#1a1a1a" }}>Attempt {attempt.id}</span>
                    <span style={{ color: "#666" }}>{attempt.date}</span>
                    <span style={{ color: "#666" }}>{attempt.time}</span>
                    <span style={{ fontWeight: 700, color: isPassed ? "#27ae60" : "#e74c3c", fontSize: 16 }}>
                      {attempt.score}%
                    </span>
                    <span>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                        background: isPassed ? "#e0ffec" : "#ffecec",
                        color: isPassed ? "#27ae60" : "#e74c3c"
                      }}>
                        {isPassed ? <Check size={14} /> : <X size={14} />}
                        {attempt.status}
                      </div>
                    </span>
                    <span>
                      {attempt.submitted && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                          background: "#FF6B00", color: "white"
                        }}>
                          <Check size={12} /> Submitted
                        </div>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default ModuleAttempts;
