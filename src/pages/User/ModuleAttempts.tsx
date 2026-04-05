import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, Check, X, RotateCcw, Send } from "lucide-react";
import { useCourseById } from "../../hooks/useCourses";
import { supabase } from "../../lib/supabase";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

const PASSING_SCORE = 70;

const ModuleAttempts = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, newScore } = location.state || {};
  const { course: courseData, loading: courseLoading, refetch } = useCourseById(courseId);
  const moduleData = courseData?.modules?.find((m) => m.id === Number(moduleId));
  const moduleIndex = courseData?.modules?.findIndex(m => m.id === Number(moduleId)) ?? -1;

  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  // Fetch attempts from DB
  useEffect(() => {
    if (!moduleData || !user?.id) return;

    const fetchAttempts = async () => {
      setLoadingAttempts(true);
      try {
        // Find the assessment lesson in this module
        const assessmentLesson = moduleData.lessons.find(l => l.type === 'assessment');
        if (!assessmentLesson) {
          setLoadingAttempts(false);
          return;
        }

        // Get assessment ID
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('id')
          .eq('lesson_id', assessmentLesson.id)
          .single();

        if (!assessmentData) {
          setLoadingAttempts(false);
          return;
        }

        // Get attempts
        const { data: attemptData, error } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('assessment_id', assessmentData.id)
          .eq('user_id', user.id)
          .order('attempted_at', { ascending: false });

        if (error) throw error;

        const formatted = (attemptData || []).map((a, idx) => ({
          id: attemptData.length - idx,
          date: new Date(a.attempted_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          time: new Date(a.attempted_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          score: a.score || 0,
          status: a.passed ? "Passed" : "Failed",
          submitted: false,
          dbId: a.id,
        }));

        setAttempts(formatted);
      } catch (err) {
        console.error('Error fetching attempts:', err);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchAttempts();
  }, [moduleData, user?.id]);

  const isReady = !courseLoading && !loadingAttempts && courseData && moduleData;

  const hasPassingAttempt = attempts.some((a) => a.score >= PASSING_SCORE);
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  const handleReAssess = () => {
    navigate(`/${slug}/courses/assessment`, {
      state: { courseId, moduleId: moduleData?.id || moduleId }
    });
  };

  const handleSubmitAttempt = async () => {
    setAssessmentCompleted(true);
    // Mark the assessment lesson as completed
    if (courseData?.assignmentId) {
      const assessmentLesson = moduleData?.lessons?.find(l => l.type === 'assessment');
      if (assessmentLesson) {
        try {
          await supabase.from('lessons_progress').upsert(
            {
              assignment_id: courseData.assignmentId,
              lesson_id: assessmentLesson.id,
              is_completed: true,
              completed_at: new Date().toISOString(),
            },
            { onConflict: 'assignment_id,lesson_id' }
          );
          await refetch();
        } catch (err) {
          console.error('Error marking assessment complete:', err);
        }
      }
    }
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>

          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 16 }}>
            <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={handleBackToModules}>
              Modules
            </Button>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Module {moduleIndex + 1}</span>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Attempts</span>
          </div>

          {!isReady ? (
            // SKELETON LOADING STATE
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Skeleton height={140} borderRadius={12} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton height={60} borderRadius={12} />
                <Skeleton height={60} borderRadius={12} />
                <Skeleton height={60} borderRadius={12} />
              </div>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div style={{
                background: "var(--color-surface)", borderRadius: 12, padding: "28px 32px", marginBottom: 24,
                boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "1px solid var(--color-border)"
              }}>
                <div>
                  <h2 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "var(--color-text-header)" }}>
                    Module {moduleIndex + 1} Assessment — {moduleData.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)" }}>
                    Passing score: <strong style={{ color: "#FF6B00" }}>{PASSING_SCORE}%</strong> · 
                    {" "}Total attempts: <strong style={{color: "var(--color-text-header)"}}>{attempts.length}</strong> · 
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
              background: "var(--color-surface)", borderRadius: 12, padding: "60px 32px",
              textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "var(--color-text-header)" }}>No Attempts Yet</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>Take the assessment to see your results here.</p>
              <Button variant="primary" rounded="pill" onClick={handleReAssess}>Start Assessment</Button>
            </div>
          ) : (
            <div style={{ background: "var(--color-surface)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
              {/* Table Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 120px 120px",
                padding: "14px 24px", borderBottom: "2px solid var(--color-border)",
                fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: 0.5
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
                    key={attempt.dbId || attempt.id}
                    style={{
                      display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px 120px 120px",
                      padding: "18px 24px", borderBottom: "1px solid var(--color-border)",
                      fontSize: 14, alignItems: "center",
                      background: idx % 2 === 0 ? "var(--color-surface)" : "var(--color-bg-muted)"
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>Attempt {attempt.id}</span>
                    <span style={{ color: "var(--color-text-header)" }}>{attempt.date}</span>
                    <span style={{ color: "var(--color-text-header)" }}>{attempt.time}</span>
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
          </>
          )}

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default ModuleAttempts;
