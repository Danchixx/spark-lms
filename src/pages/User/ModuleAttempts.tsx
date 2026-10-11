import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, Check, X, RotateCcw, Send, Lock, Eye, CheckCircle2, XCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useCourseById } from "../../hooks/useCourses";
import { supabase } from "../../lib/supabase";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";

const MAX_ATTEMPTS = 3;

const ModuleAttempts = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, newScore } = location.state || {};
  const { course: courseData, loading: courseLoading, refetch } = useCourseById(courseId);
  const moduleData = courseData?.modules?.find((m) => m.id === Number(moduleId));
  const moduleIndex = courseData?.modules?.findIndex(m => m.id === Number(moduleId)) ?? -1;

  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState("");

  // Review Attempt State
  const [reviewAttempt, setReviewAttempt] = useState<any | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);
  const [reviewAnswersMap, setReviewAnswersMap] = useState<Record<number, any>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [loadingReview, setLoadingReview] = useState(false);

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

        const isCompleted = assessmentLesson.status === 'completed';
        if (isCompleted) {
          setAssessmentCompleted(true);
        }

        // Get assessment ID
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('id, passing_score, title')
          .eq('lesson_id', assessmentLesson.id)
          .single();

        if (!assessmentData) {
          setLoadingAttempts(false);
          return;
        }

        setAssessmentId(assessmentData.id);
        setAssessmentTitle(assessmentData.title || "");
        setPassingScore(assessmentData.passing_score || 70);

        // Get attempts
        const { data: attemptData, error } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('assessment_id', assessmentData.id)
          .eq('user_id', user.id)
          .order('attempted_at', { ascending: false });

        if (error) throw error;
        
        const activeAttempts = (attemptData || []).filter((a: any) => !a.is_reset);

        const formatted = activeAttempts.map((a, idx) => {
          const isPassed = a.passed || (a.score != null && a.score >= (assessmentData.passing_score || 70));
          return {
            id: activeAttempts.length - idx,
            date: new Date(a.attempted_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            time: new Date(a.attempted_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            score: a.score || 0,
            status: isPassed ? "Passed" : "Failed",
            submitted: isCompleted && isPassed,
            dbId: a.id,
          };
        });

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

  const hasPassingAttempt = attempts.some((a) => a.score >= passingScore);
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
        (a.score >= passingScore || a.status === "Passed") && !a.submitted
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

  // Helper: check correctness of learner's answer
  const checkIsCorrect = (q: any, ans: any) => {
    if (!ans) return false;
    if (q.question_type === 'multiple_choice' || q.question_type === 'true_false' || !q.question_type) {
      const chosenChoice = (q.assessment_choices || []).find((c: any) => String(c.id) === String(ans.choice_id));
      return !!chosenChoice?.is_correct;
    }
    if (q.question_type === 'identification') {
      const userText = String(ans.text_answer || "").trim().toLowerCase();
      const correctArr = Array.isArray(q.correct_answers) ? q.correct_answers : [];
      return correctArr.some((ca: string) => ca.trim().toLowerCase() === userText);
    }
    if (q.question_type === 'enumeration') {
      try {
        const userArr = Array.isArray(ans.text_answer) 
          ? ans.text_answer 
          : (typeof ans.text_answer === 'string' && ans.text_answer.startsWith('[') ? JSON.parse(ans.text_answer) : [ans.text_answer]);
        const normalizedUser = userArr.map((a: string) => String(a || "").trim().toLowerCase());
        const correctArr = Array.isArray(q.correct_answers) ? q.correct_answers : [];
        return correctArr.length > 0 && correctArr.every((ca: string) => normalizedUser.includes(ca.trim().toLowerCase()));
      } catch {
        return false;
      }
    }
    return false;
  };

  // Handler to open attempt review
  const handleViewAttempt = async (attempt: any) => {
    setLoadingReview(true);
    setReviewAttempt(attempt);
    setCurrentQIndex(0);
    try {
      // 1. Fetch questions with choices
      const { data: qData, error: qErr } = await supabase
        .from('assessment_questions')
        .select(`
          id, question_text, position, question_type, correct_answers,
          assessment_choices ( id, choice_text, is_correct )
        `)
        .eq('assessment_id', assessmentId)
        .order('position', { ascending: true });

      if (qErr) throw qErr;

      // 2. Fetch answers for this attempt
      const { data: ansData, error: ansErr } = await supabase
        .from('attempt_answers')
        .select('id, question_id, choice_id, text_answer')
        .eq('attempt_id', attempt.dbId);

      if (ansErr) throw ansErr;

      const ansMap: Record<number, any> = {};
      (ansData || []).forEach((a: any) => {
        ansMap[a.question_id] = a;
      });

      const sortedQ = (qData || []).map((q: any) => ({
        ...q,
        assessment_choices: (q.assessment_choices || []).sort((x: any, y: any) => x.id - y.id)
      }));

      setReviewQuestions(sortedQ);
      setReviewAnswersMap(ansMap);
    } catch (err) {
      console.error('Error loading attempt review:', err);
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>

          {/* ═══════════════════════════════════════════════════════════
              VIEW MODE: REVIEW ATTEMPT QUESTIONS & ANSWERS
              ═══════════════════════════════════════════════════════════ */}
          {reviewAttempt ? (
            <>
              {/* Review Breadcrumbs */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 16 }}>
                <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => setReviewAttempt(null)}>
                  Back to Attempts
                </Button>
                <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Module {moduleIndex + 1}</span>
                <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>Review Attempt {reviewAttempt.id}</span>
              </div>

              {/* Review Header Banner */}
              <div style={{
                background: "var(--color-surface)", borderRadius: 12, padding: "24px 32px", marginBottom: 24,
                boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "1px solid var(--color-border)", flexWrap: "wrap", gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Submitted Assessment Review
                  </div>
                  <h2 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "var(--color-text-header)" }}>
                    Module {moduleIndex + 1} Assessment — {assessmentTitle || moduleData?.title}
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
                    Attempt {reviewAttempt.id} taken on {reviewAttempt.date} at {reviewAttempt.time} · Passing score: <strong style={{ color: "#FF6B00" }}>{passingScore}%</strong>
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#e0ffec", color: "#27ae60",
                    padding: "8px 20px", borderRadius: 99,
                    fontWeight: 700, fontSize: 14, border: "1px solid #a3dfb8"
                  }}>
                    <CheckCircle2 size={16} color="#27ae60" />
                    Score: {reviewAttempt.score}% (Passed)
                  </div>
                  <Button variant="outline" size="sm" rounded="pill" onClick={() => setReviewAttempt(null)}>
                    Back to Attempts
                  </Button>
                </div>
              </div>

              {loadingReview ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <Skeleton height={140} borderRadius={12} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
                    <Skeleton height={420} borderRadius={12} />
                    <Skeleton height={320} borderRadius={12} />
                  </div>
                </div>
              ) : reviewQuestions.length === 0 ? (
                <div style={{
                  background: "var(--color-surface)", borderRadius: 12, padding: "60px 32px",
                  textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)"
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "var(--color-text-header)" }}>No Questions Recorded</h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>Unable to load questions for this assessment.</p>
                  <Button variant="primary" rounded="pill" onClick={() => setReviewAttempt(null)}>Back to Attempts</Button>
                </div>
              ) : (() => {
                const currentQuestion = reviewQuestions[currentQIndex];
                const currentAnswer = currentQuestion ? reviewAnswersMap[currentQuestion.id] : null;
                const isCurrentCorrect = currentQuestion ? checkIsCorrect(currentQuestion, currentAnswer) : false;
                const correctCount = reviewQuestions.filter((q) => checkIsCorrect(q, reviewAnswersMap[q.id])).length;
                const incorrectCount = reviewQuestions.length - correctCount;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
                    
                    {/* Left: Question Review Card (Mimics AssessmentCard UI) */}
                    <div style={{
                      background: "var(--color-surface)", borderRadius: 12, padding: "32px 36px",
                      boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column"
                    }}>
                      {/* Question Top Meta */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          QUESTION {currentQIndex + 1} OF {reviewQuestions.length}
                        </div>
                        <div>
                          {isCurrentCorrect ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e0ffec", color: "#27ae60", padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                              <CheckCircle2 size={14} /> Correct (+1)
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#dc2626", padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                              <XCircle size={14} /> Incorrect (0)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-header)", lineHeight: 1.5, marginBottom: 28 }}>
                        {currentQuestion.question_text}
                      </div>

                      {/* Choices / Answers */}
                      {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false' || !currentQuestion.question_type) && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                          {(currentQuestion.assessment_choices || []).map((choice: any, cIdx: number) => {
                            const isUserChoice = String(currentAnswer?.choice_id) === String(choice.id);
                            const isCorrectChoice = !!choice.is_correct;

                            let border = "1px solid var(--color-border)";
                            let bg = "var(--color-bg-muted)";
                            let textColor = "var(--color-text)";
                            let badge = null;

                            if (isUserChoice && isCorrectChoice) {
                              border = "2px solid #22c55e";
                              bg = "rgba(34, 197, 94, 0.08)";
                              textColor = "#15803d";
                              badge = (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#22c55e", color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                  <Check size={13} strokeWidth={3} /> Your Answer (Correct)
                                </span>
                              );
                            } else if (isUserChoice && !isCorrectChoice) {
                              border = "2px solid #ef4444";
                              bg = "rgba(239, 68, 68, 0.08)";
                              textColor = "#b91c1c";
                              badge = (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#ef4444", color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                  <X size={13} strokeWidth={3} /> Your Answer (Incorrect)
                                </span>
                              );
                            } else if (isCorrectChoice) {
                              border = "2px dashed #22c55e";
                              bg = "rgba(34, 197, 94, 0.04)";
                              textColor = "#166534";
                              badge = (
                                <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 700 }}>
                                  ✓ Correct Answer
                                </span>
                              );
                            }

                            return (
                              <div
                                key={choice.id || cIdx}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "14px 18px", borderRadius: 10, border, background: bg,
                                  transition: "all 0.15s ease", gap: 12
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    border: `2px solid ${isUserChoice ? (isCorrectChoice ? '#22c55e' : '#ef4444') : (isCorrectChoice ? '#22c55e' : 'var(--color-border)')}`,
                                    background: isUserChoice ? (isCorrectChoice ? '#22c55e' : '#ef4444') : 'transparent',
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                  }}>
                                    {isUserChoice && <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: 14, fontWeight: isUserChoice ? 700 : 500, color: textColor }}>
                                    {choice.choice_text}
                                  </span>
                                </div>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Identification / Enumeration / Essay */}
                      {(currentQuestion.question_type === 'identification' || currentQuestion.question_type === 'enumeration' || currentQuestion.question_type === 'essay') && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)" }}>
                            Your Submitted Response:
                          </div>
                          <div style={{
                            padding: "14px 18px", borderRadius: 10,
                            border: `2px solid ${isCurrentCorrect ? '#22c55e' : '#ef4444'}`,
                            background: isCurrentCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            fontSize: 14, fontWeight: 700, color: isCurrentCorrect ? '#15803d' : '#b91c1c'
                          }}>
                            {currentAnswer?.text_answer || <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No answer submitted</span>}
                          </div>
                          {currentQuestion.correct_answers && currentQuestion.correct_answers.length > 0 && (
                            <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(34, 197, 94, 0.06)", borderLeft: "4px solid #22c55e" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", marginBottom: 2 }}>Correct Answer:</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>
                                {Array.isArray(currentQuestion.correct_answers) ? currentQuestion.correct_answers.join(", ") : String(currentQuestion.correct_answers)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback (if they have) — Never display empty box if absent */}
                      {(() => {
                        const feedbackText = currentQuestion.feedback || currentQuestion.explanation;
                        if (!feedbackText || !feedbackText.trim()) return null;
                        return (
                          <div style={{
                            marginBottom: 24, padding: "14px 18px", borderRadius: 10,
                            background: "rgba(255, 107, 0, 0.06)", borderLeft: "4px solid #FF6B00",
                            display: "flex", gap: 12, alignItems: "flex-start"
                          }}>
                            <Info size={18} color="#FF6B00" style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                                Feedback
                              </div>
                              <div style={{ fontSize: 13, color: "var(--color-text-header)", lineHeight: 1.5 }}>
                                {feedbackText}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Card Footer Navigation */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
                        {/* Dots */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {reviewQuestions.map((q: any, idx: number) => {
                            const ans = reviewAnswersMap[q.id];
                            const isCorrect = checkIsCorrect(q, ans);
                            const isCurrent = idx === currentQIndex;

                            return (
                              <div
                                key={q.id || idx}
                                onClick={() => setCurrentQIndex(idx)}
                                title={`Question ${idx + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`}
                                style={{
                                  width: 14, height: 14, borderRadius: "50%",
                                  background: isCorrect ? "#22c55e" : "#ef4444",
                                  cursor: "pointer",
                                  outline: isCurrent ? "3px solid #FF6B00" : "none",
                                  outlineOffset: 2,
                                  transition: "all 0.15s ease"
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Prev / Next Buttons */}
                        <div style={{ display: "flex", gap: 10 }}>
                          <Button
                            variant="outline"
                            rounded="pill"
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            style={{ minWidth: 84, justifyContent: "center" }}
                          >
                            Back
                          </Button>
                          <Button
                            variant="primary"
                            rounded="pill"
                            onClick={() => setCurrentQIndex(prev => Math.min(reviewQuestions.length - 1, prev + 1))}
                            disabled={currentQIndex === reviewQuestions.length - 1}
                            style={{ minWidth: 84, justifyContent: "center" }}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Side Info & Question Map */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* Question Navigator Map */}
                      <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 14, borderBottom: "1px solid var(--color-border)", paddingBottom: 10 }}>
                          Questions Map
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
                          {reviewQuestions.map((q: any, idx: number) => {
                            const ans = reviewAnswersMap[q.id];
                            const isCorrect = checkIsCorrect(q, ans);
                            const isCurrent = idx === currentQIndex;

                            return (
                              <button
                                key={q.id || idx}
                                onClick={() => setCurrentQIndex(idx)}
                                style={{
                                  padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                  border: isCurrent ? "2px solid #FF6B00" : `1px solid ${isCorrect ? '#a3dfb8' : '#fca5a5'}`,
                                  background: isCorrect ? "#e0ffec" : "#fee2e2",
                                  color: isCorrect ? "#166534" : "#991b1b",
                                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                  fontFamily: "inherit"
                                }}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#166534", fontWeight: 600 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                            Correct ({correctCount})
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontWeight: 600 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                            Incorrect ({incorrectCount})
                          </span>
                        </div>
                      </div>

                      {/* Attempt Summary */}
                      <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 14, borderBottom: "1px solid var(--color-border)", paddingBottom: 10 }}>
                          Attempt Summary
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Score:</span>
                            <span style={{ fontWeight: 800, color: "#27ae60" }}>{reviewAttempt.score}% (Passed)</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Passing Score:</span>
                            <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>{passingScore}%</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Total Questions:</span>
                            <span style={{ fontWeight: 700, color: "var(--color-text-header)" }}>{reviewQuestions.length}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Correct Answers:</span>
                            <span style={{ fontWeight: 700, color: "#27ae60" }}>{correctCount} / {reviewQuestions.length}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Date Taken:</span>
                            <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{reviewAttempt.date}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--color-text-muted)" }}>Time Taken:</span>
                            <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{reviewAttempt.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
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
                        Passing score: <strong style={{ color: "#FF6B00" }}>{passingScore}%</strong> · 
                        {" "}Attempts: <strong style={{ color: (attempts.length >= MAX_ATTEMPTS && !hasPassingAttempt) ? "#dc2626" : "var(--color-text-header)" }}>{attempts.length} / {MAX_ATTEMPTS}</strong> · 
                        {" "}Best score: <strong style={{ color: bestScore >= passingScore ? "#27ae60" : "#e74c3c" }}>{bestScore}%</strong>
                      </p>
                    </div>

                {assessmentCompleted ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#e0ffec", padding: "10px 24px", borderRadius: 99 }}>
                    <Check size={18} color="#27ae60" strokeWidth={3} />
                    <span style={{ fontWeight: 700, color: "#27ae60", fontSize: 14 }}>Assessment Completed</span>
                  </div>
                ) : attempts.length >= MAX_ATTEMPTS ? (
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {hasPassingAttempt ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
                          <Lock size={15} /> Max attempts reached
                        </div>
                        <Button variant="primary" rounded="pill" leftIcon={<Send size={16} />} onClick={handleSubmitAttempt}>
                          Submit Attempt
                        </Button>
                      </>
                    ) : (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#fee2e2", color: "#dc2626",
                        padding: "8px 20px", borderRadius: 99,
                        fontWeight: 700, fontSize: 13, border: "1px solid #fca5a5"
                      }}>
                        <Lock size={16} /> Locked Out (3/3 Attempts)
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 12 }}>
                    <Button variant="outline" rounded="pill" leftIcon={<RotateCcw size={16} />} onClick={handleReAssess}>
                      Re-Assess ({MAX_ATTEMPTS - attempts.length} attempt{MAX_ATTEMPTS - attempts.length === 1 ? '' : 's'} left)
                    </Button>
                    {hasPassingAttempt && (
                      <Button variant="primary" rounded="pill" leftIcon={<Send size={16} />} onClick={handleSubmitAttempt}>
                        Submit Attempt
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Lockout Warning Banner when 3 attempts exhausted without passing */}
              {attempts.length >= MAX_ATTEMPTS && !hasPassingAttempt && !assessmentCompleted && (
                <div style={{
                  background: "#fef2f2", borderRadius: 10, padding: "16px 20px",
                  marginBottom: 24, display: "flex", alignItems: "center", gap: 14,
                  border: "1px solid #fca5a5"
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", background: "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Lock size={20} color="#dc2626" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b" }}>
                      Maximum Attempts Exceeded (3/3 Attempts Used)
                    </div>
                    <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                      You have been locked out of this assessment retake. Please contact SPARK immediately to allow another retake.
                    </div>
                  </div>
                  <Button variant="outline" size="sm" rounded="pill" onClick={handleBackToModules} style={{ marginLeft: "auto", borderColor: "#dc2626", color: "#dc2626" }}>
                    Back to Modules
                  </Button>
                </div>
              )}

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
                    <span style={{ textAlign: "right" }}>Action</span>
                  </div>

                  {/* Table Rows */}
                  {attempts.map((attempt, idx) => {
                    const isPassed = attempt.score >= passingScore || attempt.status === "Passed";
                    // Only for the submitted passed attempt, no view button for attempts that are not yet submitted whether passed or failed
                    const isPassedAndSubmitted = isPassed && (attempt.submitted || assessmentCompleted);

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
                        <span style={{ textAlign: "right" }}>
                          {isPassedAndSubmitted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              rounded="pill"
                              leftIcon={<Eye size={14} />}
                              onClick={() => handleViewAttempt(attempt)}
                              style={{
                                borderColor: "#FF6B00",
                                color: "#FF6B00",
                                fontWeight: 700,
                                padding: "6px 16px"
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            attempt.submitted && (
                              <div style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                                background: "#FF6B00", color: "white"
                              }}>
                                <Check size={12} /> Submitted
                              </div>
                            )
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              </>
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

