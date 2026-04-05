import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import LessonCard from "../../components/common/LessonCard/LessonCard";
import { ArrowLeft, Check } from "lucide-react";
import { useCourseById } from "../../hooks/useCourses";
import { supabase } from "../../lib/supabase";
import sparkLogoImg from "../../components/common/SparkLogo/sparklogo.png";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

const ModuleLessons = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, lessonId } = location.state || {};

  const { course: courseData, loading, refetch } = useCourseById(courseId);
  const moduleData = courseData?.modules?.find((m) => m.id === Number(moduleId));

  const [currentLessonId, setCurrentLessonId] = useState<number>(Number(lessonId));
  const [quickNotes, setQuickNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Update currentLessonId if the initial lessonId is not valid
  useEffect(() => {
    if (moduleData && !moduleData.lessons.find(l => l.id === currentLessonId)) {
      const firstOpen = moduleData.lessons.find(l => l.status === 'open');
      if (firstOpen) setCurrentLessonId(firstOpen.id);
      else if (moduleData.lessons.length > 0) setCurrentLessonId(moduleData.lessons[0]!.id);
    }
  }, [moduleData, currentLessonId]);

  if (!courseData && !loading) {
    return <Navigate to={`/${slug}/courses`} replace />;
  }

  if (!moduleData && !loading) {
    return <Navigate to={`/${slug}/courses`} replace />;
  }

  const lessons = moduleData?.lessons ?? [];
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = lessons[currentIndex];
  const moduleIndex = courseData?.modules?.findIndex(m => m.id === moduleData?.id) ?? 0;

  const markLessonComplete = async (lessonId: number) => {
    if (!courseData?.assignmentId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lessons_progress')
        .upsert(
          {
            assignment_id: courseData.assignmentId,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'assignment_id,lesson_id' }
        );
      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentLesson && currentLesson.status !== 'completed') {
      await markLessonComplete(currentLesson.id);
    }
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) setCurrentLessonId(nextLesson.id);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      if (prevLesson) setCurrentLessonId(prevLesson.id);
    }
  };

  const isReady = !loading && courseData && moduleData;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            {/* Breadcrumb Area */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 16 }}>
              <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId } })}>
                Modules
              </Button>
              <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
              {isReady ? (
                <>
                  <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Module {moduleIndex + 1}</span>
                  <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                  <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>
                    Lesson {currentIndex + 1}: {currentLesson?.title}
                  </span>
                </>
              ) : (
                <Skeleton width={200} height={20} />
              )}
            </div>

            {!isReady ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
                <Skeleton height={500} borderRadius={16} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Skeleton height={200} borderRadius={16} />
                  <Skeleton height={250} borderRadius={16} />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

              <LessonCard
                lesson={currentLesson}
                onBack={handleBack}
                onNext={handleNext}
                currentIndex={currentIndex + 1}
                totalLessons={lessons.length}
                onProceedAssessment={() => navigate(`/${slug}/courses/assessment`, {
                  state: { courseId, moduleId }
                })}
              />

              {/* Right Column: Sidebar Panels */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Progress Card */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", position: "relative", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                  <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15, width: 80 }}>
                    <img src={sparkLogoImg} alt="Spark" style={{ width: "100%", height: "auto" }} />
                  </div>

                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 }}>COURSE PROGRESS</div>
                  <ProgressBar value={courseData!.progress} size="md" />
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: courseData!.progress === 100 ? "#27ae60" : "#FF6B00" }}>{courseData!.progress}%</span>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>completed</span>
                  </div>
                </div>

                {/* Module Lessons List */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: "700", marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>MODULE {moduleIndex + 1} LESSONS</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lessons.map((lsn, idx) => {
                      const isActive = lsn.id === currentLessonId;
                      const isCompleted = lsn.status === "completed";

                      return (
                        <div
                          key={lsn.id}
                          onClick={() => (isCompleted || lsn.status === 'open') && setCurrentLessonId(lsn.id)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: isActive ? "var(--sidebar-active-bg)" : "var(--color-bg-muted)",
                            border: `1px solid ${isActive ? "var(--sidebar-active-border)" : "transparent"}`,
                            cursor: lsn.status === 'locked' ? "default" : "pointer",
                            opacity: lsn.status === 'locked' ? 0.5 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isCompleted || isActive ? "#FF6B00" : "var(--color-bg-muted)" }} />
                            <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#FF6B00" : "var(--color-text)" }}>
                              Lesson {idx + 1}: {lsn.title}
                            </span>
                          </div>
                          {isCompleted && <Check size={16} color="#FF6B00" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Notes */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: "700", marginBottom: 16, letterSpacing: 0.5 }}>QUICK NOTES</div>
                  <textarea
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="Type your notes here..."
                    style={{
                      width: "100%", height: 120, resize: "none",
                      background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: 8,
                      padding: "12px", fontSize: 13, color: "var(--color-text)", fontFamily: "inherit",
                      outline: "none"
                    }}
                  />
                </div>

              </div>
            </div>
            )}

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default ModuleLessons;
