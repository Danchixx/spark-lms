import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import AssessmentCard from "../../components/common/AssessmentCard/AssessmentCard";
import SubmitAssessmentModal from "../../components/common/Modal/SubmitAssessmentModal";
import TimeUpModal from "../../components/common/Modal/TimeUpModal";
import AssessmentSuccessModal from "../../components/common/Modal/AssessmentSuccessModal";
import { ArrowLeft, Timer } from "lucide-react";
import { useCourseById } from "../../hooks/useCourses";
import { supabase } from "../../lib/supabase";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

// ── Timer Config ──────────────────────────────────────────────
const DEFAULT_TIME_SECONDS = 15 * 60; // 15 minutes fallback

const ModuleAssessment = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId } = location.state || {};
  const { course: courseData, loading: courseLoading } = useCourseById(courseId);
  const moduleData = courseData?.modules?.find((m) => m.id === Number(moduleId));
  const moduleIndex = courseData?.modules?.findIndex(m => m.id === Number(moduleId)) ?? -1;

  // Assessment data from DB
  const [questions, setQuestions] = useState<any[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [assessmentTimeLimit, setAssessmentTimeLimit] = useState(DEFAULT_TIME_SECONDS);
  const [loadingAssessment, setLoadingAssessment] = useState(true);

  // Assessment state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Shuffle Utility ---
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i] as T;
      shuffled[i] = shuffled[j] as T;
      shuffled[j] = temp;
    }
    return shuffled;
  };

  // Fetch assessment questions from Supabase
  useEffect(() => {
    if (!moduleData) return;

    const fetchAssessment = async () => {
      setLoadingAssessment(true);
      try {
        // Find the assessment lesson in this module
        const assessmentLesson = moduleData.lessons.find(l => l.type === 'assessment');
        if (!assessmentLesson) {
          setLoadingAssessment(false);
          return;
        }

        // Get the assessment linked to this lesson
        const { data: assessmentData, error: assessErr } = await supabase
          .from('assessments')
          .select('id, passing_score, time_limit')
          .eq('lesson_id', assessmentLesson.id)
          .single();

        if (assessErr) throw assessErr;
        if (!assessmentData) return;

        setAssessmentId(assessmentData.id);
        const timeLimitMinutes = assessmentData.time_limit || 15;
        setAssessmentTimeLimit(timeLimitMinutes * 60);
        setTimeLeft(timeLimitMinutes * 60);

        // Get questions with choices
        const { data: questionData, error: qErr } = await supabase
          .from('assessment_questions')
          .select(`
            id, question_text, position,
            assessment_choices ( id, choice_text, is_correct )
          `)
          .eq('assessment_id', assessmentData.id);

        if (qErr) throw qErr;

        // 1. Shuffle Questions
        const shuffledQuestions = shuffleArray(questionData || []);

        // 2. Format and Shuffle Choices for each question
        const formattedQuestions = shuffledQuestions.map(q => {
          const shuffledChoices = shuffleArray(q.assessment_choices || []);
          return {
            id: q.id,
            question: q.question_text,
            choices: shuffledChoices.map((c: any) => c.choice_text),
            choiceIds: shuffledChoices.map((c: any) => c.id),
            correctIndex: shuffledChoices.findIndex((c: any) => c.is_correct),
          };
        });

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching assessment:', err);
      } finally {
        setLoadingAssessment(false);
      }
    };

    fetchAssessment();
  }, [moduleData]);

  // Start countdown
  useEffect(() => {
    if (loadingAssessment || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loadingAssessment, questions.length]);

  // When time hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      setShowTimeUpModal(true);
    }
  }, [timeLeft]);

  const isReady = !courseLoading && !loadingAssessment && courseData && moduleData;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const hasUnanswered = answeredCount < totalQuestions;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (choiceIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentQIndex]: choiceIdx }));
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) setCurrentQIndex(currentQIndex + 1);
  };

  const handleBack = () => {
    if (currentQIndex > 0) setCurrentQIndex(currentQIndex - 1);
  };

  const handleSubmitClick = () => setShowSubmitModal(true);

  const calcScore = () => {
    let correct = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if (answers[i] === questions[i]?.correctIndex) correct++;
    }
    return Math.round((correct / totalQuestions) * 100);
  };

  const saveAttempt = async (score: number) => {
    if (!assessmentId || !user?.id) return;
    try {
      await supabase.from('assessment_attempts').insert({
        assessment_id: assessmentId,
        user_id: user.id,
        score,
        passed: score >= 70,
      });
    } catch (err) {
      console.error('Error saving attempt:', err);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const score = calcScore();
    setLastScore(score);
    await saveAttempt(score);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(`/${slug}/courses/attempts`, {
      state: { courseId, moduleId, newScore: lastScore }
    });
  };

  const handleTimeUpClose = async () => {
    setShowTimeUpModal(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const score = calcScore();
    await saveAttempt(score);
    navigate(`/${slug}/courses/attempts`, {
      state: { courseId, moduleId, newScore: score }
    });
  };

  if (totalQuestions === 0) {
    return (
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <h2 style={{ color: "var(--color-text-header)" }}>No Questions Available</h2>
            <p style={{ color: "var(--color-text-muted)" }}>This assessment has no questions yet.</p>
            <Button rounded="pill" onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId } })}>Back to Modules</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <PageTransition>

            {/* Breadcrumb + Timer Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16 }}>
                <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId } })}>
                  Modules
                </Button>
                <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                {isReady ? (
                  <>
                    <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Module {moduleIndex + 1}</span>
                    <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                    <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Assessment</span>
                  </>
                ) : (
                  <Skeleton width={200} height={20} />
                )}
              </div>

              {/* Timer Badge */}
              {isReady && totalQuestions > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: timeLeft <= 60 ? "#FF6B00" : "#FF6B00",
                  color: "white", padding: "8px 20px", borderRadius: 99,
                  fontSize: 16, fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)"
                }}>
                  <Timer size={18} />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {!isReady ? (
              // SKELETON LOADING STATE
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
                <Skeleton height={400} borderRadius={16} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Skeleton height={200} borderRadius={16} />
                  <Skeleton height={200} borderRadius={16} />
                </div>
              </div>
            ) : totalQuestions === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, height: "60vh" }}>
                <div style={{ fontSize: 48 }}>📝</div>
                <h2 style={{ color: "var(--color-text-header)" }}>No Questions Available</h2>
                <p style={{ color: "var(--color-text-muted)" }}>This assessment has no questions yet.</p>
                <Button rounded="pill" onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId } })}>Back to Modules</Button>
              </div>
            ) : (
              <>
                {/* Main Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

                  {/* Left: Assessment Card */}
                  <AssessmentCard
                    moduleName={`Module ${moduleIndex + 1} Assessment – ${moduleData.title}`}
                currentQuestion={currentQuestion}
                currentIndex={currentQIndex}
                totalQuestions={totalQuestions}
                selectedAnswer={answers[currentQIndex]}
                onSelectAnswer={handleSelectAnswer}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmitClick}
                onDotClick={setCurrentQIndex}
                answers={answers}
                isLastQuestion={currentQIndex === totalQuestions - 1}
              />

              {/* Right: Assessment Info + Question Map */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Assessment Info */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 16, borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
                    Assessment Info
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Total Questions:</span>
                      <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>{totalQuestions}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Answered:</span>
                      <span style={{ fontWeight: 700, color: "#FF6B00" }}>{answeredCount}/{totalQuestions}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Passing Score:</span>
                      <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>70%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Time Left:</span>
                      <span style={{ fontWeight: 700, color: "#FF6B00" }}>{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>

                {/* Question Map */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 16 }}>
                    Question Map
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                    {questions.map((_, idx) => {
                      const isAnswered = answers[idx] !== undefined;
                      const isCurrent = idx === currentQIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => setCurrentQIndex(idx)}
                          style={{
                            width: 36, height: 36, borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            border: isCurrent ? "2px solid #FF6B00" : "1px solid var(--color-border)",
                            background: isAnswered ? "#FF6B00" : "var(--color-bg-muted)",
                            color: isAnswered ? "white" : isCurrent ? "#FF6B00" : "var(--color-text-muted)",
                            transition: "all 0.2s"
                          }}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    background: "var(--color-bg-subtle)", borderRadius: 8, padding: "12px 14px",
                    fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: 16,
                    border: "1px solid var(--color-border)"
                  }}>
                    <strong>NOTE:</strong> You can revisit any questions before final submission.
                  </div>

                  <Button
                    variant="outline"
                    rounded="pill"
                    onClick={handleSubmitClick}
                    style={{ width: "100%", justifyContent: "center", fontWeight: 700 }}
                  >
                    Submit Assessment
                  </Button>
                </div>
              </div>
            </div>
            </>
            )}

            </PageTransition>
          </div>
        </div>
      </div>

      <SubmitAssessmentModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        hasUnanswered={hasUnanswered}
      />
      <TimeUpModal isOpen={showTimeUpModal} onClose={handleTimeUpClose} />
      <AssessmentSuccessModal isOpen={showSuccessModal} onClose={handleSuccessClose} />
    </>
  );
};

export default ModuleAssessment;
