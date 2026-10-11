import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import LessonCard from "../../components/common/LessonCard/LessonCard";
import { ArrowLeft, Check, Lock } from "lucide-react";
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

  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, lessonId } = location.state || {};

  const { course: courseData, loading, refetch } = useCourseById(courseId);
  const moduleData = courseData?.modules?.find((m) => m.id === Number(moduleId));

  const [currentLessonId, setCurrentLessonId] = useState<number>(Number(lessonId));
  const [quickNotes, setQuickNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savedNoteStatus, setSavedNoteStatus] = useState<"idle"|"saved"|"error">("idle");
  const [saving, setSaving] = useState(false);
  const [showSideDetails, setShowSideDetails] = useState(true);

  // Fetch quick notes for current lesson
  useEffect(() => {
    if (!user?.id || !currentLessonId) return;
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from('quick_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('lesson_id', currentLessonId)
        .maybeSingle();
      
      if (data) {
        setQuickNotes(data.content || "");
      } else {
        setQuickNotes("");
      }
      setSavedNoteStatus("idle");
    };
    fetchNote();
  }, [user?.id, currentLessonId]);

  const handleSaveNote = async () => {
    if (!user?.id || !currentLessonId) return;
    setSavingNote(true);
    setSavedNoteStatus("idle");
    try {
      const { error } = await supabase
        .from('quick_notes')
        .upsert(
          {
            user_id: user.id,
            lesson_id: currentLessonId,
            content: quickNotes,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,lesson_id' }
        );
      if (error) throw error;
      setSavedNoteStatus("saved");
      setTimeout(() => setSavedNoteStatus("idle"), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
      setSavedNoteStatus("error");
    } finally {
      setSavingNote(false);
    }
  };

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
    if (currentLesson && currentLesson.status !== 'completed' && currentLesson.type !== 'assessment') {
      await markLessonComplete(currentLesson.id);
    }
    if (currentLesson?.type === 'assessment' && !currentLesson?.hasPassed) {
      return;
    }
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson && nextLesson.status !== 'locked') {
        setCurrentLessonId(nextLesson.id);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      if (prevLesson) setCurrentLessonId(prevLesson.id);
    }
  };

  const hasNextModule = (courseData?.modules?.length ?? 0) > moduleIndex + 1;

  const handleNextModule = async () => {
    if (currentLesson && currentLesson.status !== 'completed' && currentLesson.type !== 'assessment') {
      await markLessonComplete(currentLesson.id);
    }
    if (currentLesson?.type === 'assessment' && !currentLesson?.hasPassed) {
      return;
    }
    const nextMod = courseData?.modules?.[moduleIndex + 1];
    if (nextMod && nextMod.status !== 'locked') {
      navigate(`/${slug}/courses/lessons`, { state: { courseId, moduleId: nextMod.id, lessonId: nextMod.lessons[0]?.id } });
    }
  };

  const handleDone = async () => {
    if (currentLesson && currentLesson.status !== 'completed' && currentLesson.type !== 'assessment') {
      await markLessonComplete(currentLesson.id);
    }
    if (currentLesson?.type === 'assessment' && !currentLesson?.hasPassed) {
      return;
    }
    navigate(`/${slug}/courses`);
  };

  const isReady = !loading && courseData && moduleData;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <style>{`
              .spark-flame-toggle-btn:hover .spark-flame-img {
                opacity: 0.95 !important;
                transform: scale(1.12);
                filter: drop-shadow(0 2px 10px rgba(255, 107, 0, 0.45));
              }
              .spark-flame-toggle-btn:active .spark-flame-img {
                transform: scale(0.95);
              }
            `}</style>

            {/* Breadcrumb Area */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, flexWrap: "wrap" }}>
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

              {/* Show Details button when side details are collapsed */}
              {!showSideDetails && isReady && (
                <Button
                  variant="outline"
                  size="sm"
                  rounded="pill"
                  onClick={() => setShowSideDetails(true)}
                  leftIcon={<img src={sparkLogoImg} alt="Spark" style={{ width: 18, height: 18, objectFit: "contain" }} />}
                  style={{
                    borderColor: "#FF6B00",
                    color: "#FF6B00",
                    fontWeight: 700,
                    boxShadow: "var(--shadow-sm)"
                  }}
                  title="Expand side details"
                >
                  Show Details
                </Button>
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
              <div style={{
                display: "grid",
                gridTemplateColumns: showSideDetails ? "1fr 320px" : "1fr",
                gap: 24,
                alignItems: "start",
                transition: "all 0.3s ease"
              }}>

              <LessonCard
                lesson={currentLesson}
                onBack={handleBack}
                onNext={handleNext}
                onNextModule={handleNextModule}
                onDone={handleDone}
                hasNextModule={hasNextModule}
                currentIndex={currentIndex + 1}
                totalLessons={lessons.length}
                onProceedAssessment={() => {
                  const isLocked = currentLesson?.isLockedOut || ((currentLesson?.attemptsCount ?? 0) >= 3 && !currentLesson?.hasPassed);
                  if (isLocked) {
                    navigate(`/${slug}/courses/attempts`, {
                      state: { courseId, moduleId }
                    });
                  } else {
                    navigate(`/${slug}/courses/assessment`, {
                      state: { courseId, moduleId }
                    });
                  }
                }}
                onViewAttempts={() => navigate(`/${slug}/courses/attempts`, {
                  state: { courseId, moduleId }
                })}
              />

              {/* Right Column: Sidebar Panels */}
              {showSideDetails && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Progress Card */}
                  <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", position: "relative", overflow: "hidden", border: "1px solid var(--color-border)" }}>
                    <button
                      type="button"
                      onClick={() => setShowSideDetails(false)}
                      title="Collapse side details for broader view"
                      aria-label="Collapse side details"
                      className="spark-flame-toggle-btn"
                      style={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        width: 80,
                        height: 80,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        outline: "none"
                      }}
                    >
                      <img
                        src={sparkLogoImg}
                        alt="Spark - Collapse sidebar"
                        className="spark-flame-img"
                        style={{
                          width: "100%",
                          height: "auto",
                          opacity: 0.3,
                          transition: "all 0.25s ease"
                        }}
                      />
                    </button>

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
                        const isLockedOut = lsn.isLockedOut || (lsn.type === "assessment" && (lsn.attemptsCount ?? 0) >= 3 && !lsn.hasPassed);

                        return (
                          <div
                            key={lsn.id}
                            onClick={() => {
                              if (isLockedOut) {
                                navigate(`/${slug}/courses/attempts`, { state: { courseId, moduleId } });
                              } else if (lsn.status !== 'locked') {
                                setCurrentLessonId(lsn.id);
                              }
                            }}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "10px 14px",
                              borderRadius: 8,
                              background: isActive ? "var(--sidebar-active-bg)" : "var(--color-bg-muted)",
                              border: `1px solid ${isActive ? "var(--sidebar-active-border)" : "transparent"}`,
                              cursor: lsn.status === 'locked' ? "not-allowed" : "pointer",
                              opacity: lsn.status === 'locked' ? 0.45 : 1,
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
                            {isLockedOut && <Lock size={15} color="#dc2626" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: "700", letterSpacing: 0.5 }}>QUICK NOTES</div>
                      {savedNoteStatus === "saved" && <span style={{ fontSize: 11, color: "#27ae60", fontWeight: 700 }}>Saved!</span>}
                      {savedNoteStatus === "error" && <span style={{ fontSize: 11, color: "#e74c3c", fontWeight: 700 }}>Error saving</span>}
                    </div>
                    <textarea
                      value={quickNotes}
                      onChange={(e) => {
                        setQuickNotes(e.target.value);
                        if (savedNoteStatus !== "idle") setSavedNoteStatus("idle");
                      }}
                      placeholder="Type your notes here..."
                      style={{
                        width: "100%", height: 120, resize: "none",
                        background: "var(--color-bg-muted)", border: "1px solid var(--color-border)", borderRadius: 8,
                        padding: "12px", fontSize: 13, color: "var(--color-text)", fontFamily: "inherit",
                        outline: "none", marginBottom: 12
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        rounded="pill" 
                        onClick={handleSaveNote}
                        disabled={savingNote}
                      >
                        {savingNote ? "Saving..." : "Save Note"}
                      </Button>
                    </div>
                  </div>

                </div>
              )}
            </div>
            )}

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default ModuleLessons;
