import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import AssessmentCard from "../../components/common/AssessmentCard/AssessmentCard";
import SubmitAssessmentModal from "../../components/common/Modal/SubmitAssessmentModal";
import TimeUpModal from "../../components/common/Modal/TimeUpModal";
import AssessmentSuccessModal from "../../components/common/Modal/AssessmentSuccessModal";
import { ArrowLeft, Timer } from "lucide-react";
import { COURSES } from "../../data/mockCourses";

// ── Mock Questions ────────────────────────────────────────────
const MOCK_QUESTIONS = [
  { id: 1, question: "Which component of the AIDA framework is primarily responsible for creating emotional desire for product or service in the prospect's mind?",
    choices: ["Attention — grabbing initial awareness", "Interest — explaining product relevance", "Desire — creating emotional pull toward the offer", "Action — motivating the purchase decision"] },
  { id: 2, question: "What is the first step in the consultative selling process?",
    choices: ["Present the solution immediately", "Build rapport and trust with the client", "Close the deal as quickly as possible", "Offer discounts to incentivize purchase"] },
  { id: 3, question: "Which technique is most effective for handling price objections?",
    choices: ["Lower the price immediately", "Ignore the objection and move on", "Reframe the value proposition", "Add more products to justify cost"] },
  { id: 4, question: "In the SPIN selling methodology, what does the 'S' stand for?",
    choices: ["Solution", "Situation", "Strategy", "Selling"] },
  { id: 5, question: "What is the primary benefit of active listening in sales conversations?",
    choices: ["It makes the sales call longer", "It helps identify customer pain points", "It shows the salesperson is smart", "It allows time to prepare rebuttals"] },
  { id: 6, question: "Which closing technique involves offering two positive choices?",
    choices: ["Hard close", "Alternative close", "Assumptive close", "Urgency close"] },
  { id: 7, question: "What is the purpose of a follow-up email after a sales meeting?",
    choices: ["To send the invoice", "To reinforce key discussion points", "To apologize for any mistakes", "To share competitor information"] },
  { id: 8, question: "Which metric best measures the effectiveness of a sales pipeline?",
    choices: ["Number of contacts", "Conversion rate by stage", "Total emails sent", "Social media followers"] },
  { id: 9, question: "What does a value proposition primarily communicate?",
    choices: ["Company history and background", "Product technical specifications", "Why a customer should choose this solution", "Price comparisons with competitors"] },
  { id: 10, question: "Which approach helps build long-term client relationships?",
    choices: ["Aggressive upselling on every call", "Consistent value delivery and check-ins", "Avoiding all post-sale contact", "Sending automated bulk messages"] },
];

// ── Correct answers (0-indexed choice) ── for mock scoring ──
const CORRECT_ANSWERS = { 0: 2, 1: 1, 2: 2, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 2, 9: 1 };

// ── Timer Config ──────────────────────────────────────────────
// Change ASSESSMENT_TIME_SECONDS to adjust the assessment duration.
const ASSESSMENT_TIME_SECONDS = 15 * 60; // 15 minutes

const ModuleAssessment = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId } = location.state || {};
  const course = COURSES.find((c) => c.id === parseInt(courseId));
  const module = course?.modules?.find((m) => m.id === parseInt(moduleId));

  // Assessment state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(ASSESSMENT_TIME_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const timerRef = useRef(null);

  // Start countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // When time hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      setShowTimeUpModal(true);
    }
  }, [timeLeft]);

  if (!course || !module) {
    return <Navigate to={`/${slug}/courses`} replace />;
  }

  const questions = MOCK_QUESTIONS;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const hasUnanswered = answeredCount < totalQuestions;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (choiceIdx) => {
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
      if (answers[i] === CORRECT_ANSWERS[i]) correct++;
    }
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    const score = calcScore();
    setLastScore(score);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate(`/${slug}/courses/attempts`, {
      state: { courseId, moduleId, newScore: lastScore }
    });
  };

  const handleTimeUpClose = () => {
    setShowTimeUpModal(false);
    clearInterval(timerRef.current);
    const score = calcScore();
    navigate(`/${slug}/courses/attempts`, {
      state: { courseId, moduleId, newScore: score }
    });
  };

  return (
    <>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, lessons ..." role="User" />

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

            {/* Breadcrumb + Timer Row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16 }}>
                <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
                  Modules
                </Button>
                <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Module {module.id}</span>
                <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Assessment</span>
              </div>

              {/* Timer Badge */}
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
            </div>

            {/* Main Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>

              {/* Left: Assessment Card */}
              <AssessmentCard
                moduleName={`Module ${module.id} Assessment - ${module.name}`}
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
                <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                    Assessment Info
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Total Questions:</span>
                      <span style={{ fontWeight: 700 }}>{totalQuestions}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Answered:</span>
                      <span style={{ fontWeight: 700, color: "#FF6B00" }}>{answeredCount}/{totalQuestions}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Passing Score:</span>
                      <span style={{ fontWeight: 700 }}>70%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Time Left:</span>
                      <span style={{ fontWeight: 700, color: "#FF6B00" }}>{formatTime(timeLeft)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888" }}>Attempts:</span>
                      <span style={{ fontWeight: 700 }}>1st Attempt</span>
                    </div>
                  </div>
                </div>

                {/* Question Map */}
                <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>
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
                            border: isCurrent ? "2px solid #FF6B00" : "1px solid #ddd",
                            background: isAnswered ? "#FF6B00" : "white",
                            color: isAnswered ? "white" : isCurrent ? "#FF6B00" : "#888",
                            transition: "all 0.2s"
                          }}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    background: "#fef5ec", borderRadius: 8, padding: "12px 14px",
                    fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 16
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
