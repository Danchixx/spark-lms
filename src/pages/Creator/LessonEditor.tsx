import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Play, FileText, PenTool,
  Plus, Trash2, Check, X, CheckCircle, Video, BookOpen, Timer, Target,
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import RichTextEditor from "../../components/ui/RichTextEditor/RichTextEditor";
import "./LessonEditor.css";

// ─── Types ──────────────────────────────────────────────────
type EditorChoice = {
  id: number;
  choice_text: string;
  is_correct: boolean;
};

type EditorQuestion = {
  id: number;
  question_text: string;
  position: number;
  choices: EditorChoice[];
};

type EditorLesson = {
  id: number;
  title: string;
  type: "video" | "reading" | "assessment";
  content: string | null;
  video_url: string | null;
  position: number;
};

type EditorModule = {
  id: number;
  title: string;
  lessons: EditorLesson[];
};

// ─── Mock Assessment Data ───────────────────────────────────
const MOCK_QUESTIONS: EditorQuestion[] = [
  {
    id: 1, question_text: "What is the first step in the sales funnel?", position: 1,
    choices: [
      { id: 1, choice_text: "Awareness", is_correct: true },
      { id: 2, choice_text: "Decision", is_correct: false },
      { id: 3, choice_text: "Retention", is_correct: false },
      { id: 4, choice_text: "Purchase", is_correct: false },
    ],
  },
  {
    id: 2, question_text: "Which technique is most effective for building rapport?", position: 2,
    choices: [
      { id: 5, choice_text: "Active listening", is_correct: true },
      { id: 6, choice_text: "Hard selling", is_correct: false },
      { id: 7, choice_text: "Price matching", is_correct: false },
    ],
  },
];

let nextQuestionId = 100;
let nextChoiceId = 1000;

// ─── Utility ────────────────────────────────────────────────
const LessonTypeIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
  switch (type) {
    case "video": return <Play size={size} />;
    case "reading": return <FileText size={size} />;
    case "assessment": return <PenTool size={size} />;
    default: return <FileText size={size} />;
  }
};

const convertYoutubeUrl = (url: string): string | null => {
  if (!url) return null;
  // Already an embed URL
  if (url.includes("/embed/")) return url;
  // Standard YouTube URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
};

// ─── Main Component ─────────────────────────────────────────
const LessonEditor = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  // ─── Data from navigation state ────────────────────────────
  const {
    courseId,
    moduleId,
    lessonId,
    courseData,
    moduleData,
    lessonData,
    allModules,
  } = location.state || {};

  // ─── State ─────────────────────────────────────────────────
  const [lessonTitle, setLessonTitle] = useState(lessonData?.title || "Untitled Lesson");
  const [lessonType, setLessonType] = useState<"video" | "reading" | "assessment">(lessonData?.type || "video");
  const [videoUrl, setVideoUrl] = useState(lessonData?.video_url || "");
  const [readingContent, setReadingContent] = useState(lessonData?.content || "");
  const [questions, setQuestions] = useState<EditorQuestion[]>(
    lessonData?.type === "assessment" ? MOCK_QUESTIONS : []
  );
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(15);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentModule: EditorModule = moduleData || { id: 0, title: "Module", lessons: [] };
  const allModulesList: EditorModule[] = allModules || [];

  // ─── Assessment Actions ────────────────────────────────────
  const addQuestion = () => {
    const newQ: EditorQuestion = {
      id: ++nextQuestionId,
      question_text: "",
      position: questions.length + 1,
      choices: [
        { id: ++nextChoiceId, choice_text: "", is_correct: true },
        { id: ++nextChoiceId, choice_text: "", is_correct: false },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  const deleteQuestion = (qId: number) => {
    setQuestions(questions.filter((q) => q.id !== qId).map((q, i) => ({ ...q, position: i + 1 })));
  };

  const updateQuestionText = (qId: number, text: string) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, question_text: text } : q)));
  };

  const addChoice = (qId: number) => {
    setQuestions(questions.map((q) =>
      q.id === qId
        ? { ...q, choices: [...q.choices, { id: ++nextChoiceId, choice_text: "", is_correct: false }] }
        : q
    ));
  };

  const deleteChoice = (qId: number, cId: number) => {
    setQuestions(questions.map((q) =>
      q.id === qId ? { ...q, choices: q.choices.filter((c) => c.id !== cId) } : q
    ));
  };

  const updateChoiceText = (qId: number, cId: number, text: string) => {
    setQuestions(questions.map((q) =>
      q.id === qId
        ? { ...q, choices: q.choices.map((c) => (c.id === cId ? { ...c, choice_text: text } : c)) }
        : q
    ));
  };

  const toggleCorrectChoice = (qId: number, cId: number) => {
    setQuestions(questions.map((q) =>
      q.id === qId
        ? { ...q, choices: q.choices.map((c) => ({ ...c, is_correct: c.id === cId })) }
        : q
    ));
  };

  // ─── Save Handler ──────────────────────────────────────────
  const handleSave = () => {
    const payload = {
      lesson: {
        id: lessonId,
        title: lessonTitle,
        type: lessonType,
        content: lessonType === "reading" ? readingContent : null,
        video_url: lessonType === "video" ? videoUrl : null,
      },
      assessment: lessonType === "assessment" ? {
        passing_score: passingScore,
        time_limit: timeLimit * 60,
        questions: questions.map((q) => ({
          ...q,
          choices: q.choices.map((c) => ({ ...c })),
        })),
      } : null,
    };
    console.log("Save lesson payload:", payload);
    showToast("Lesson saved successfully!");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigateToLesson = (lesson: EditorLesson) => {
    navigate(`/${slug}/courses/lesson-editor`, {
      state: {
        courseId,
        moduleId: currentModule.id,
        lessonId: lesson.id,
        courseData,
        moduleData: currentModule,
        lessonData: lesson,
        allModules: allModulesList,
      },
      replace: true,
    });
    // Force re-render with new lesson data
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setVideoUrl(lesson.video_url || "");
    setReadingContent(lesson.content || "");
    setQuestions(lesson.type === "assessment" ? MOCK_QUESTIONS : []);
  };

  const embedUrl = convertYoutubeUrl(videoUrl);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate(`/${slug}/courses/builder`, {
                  state: { courseId, courseData, allModules: allModulesList },
                })}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  border: "1px solid var(--color-border)", background: "var(--color-surface)",
                  color: "#FF6B00", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                }}
              >
                <ArrowLeft size={14} /> Course Builder
              </button>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-muted)" }}>{currentModule.title}</span>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-header)" }}>{lessonTitle}</span>
            </div>

            {/* Main Layout */}
            <div className="editor-layout">
              {/* Left Column — Editor */}
              <div className="editor-main-card">
                {/* Header */}
                <div className="editor-main-header">
                  <input
                    className="editor-title-input"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Lesson title..."
                  />

                  {/* Type Tabs */}
                  <div className="editor-type-tabs">
                    {(["video", "reading", "assessment"] as const).map((type) => (
                      <button
                        key={type}
                        className={`editor-type-tab ${lessonType === type ? "active" : ""}`}
                        onClick={() => setLessonType(type)}
                      >
                        <LessonTypeIcon type={type} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Body */}
                <div className="editor-body">
                  {/* ─── Video Editor ──────────────────────────── */}
                  {lessonType === "video" && (
                    <div className="editor-video-field">
                      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)" }}>Video URL</label>
                      <div className="editor-video-input-row">
                        <input
                          className="editor-video-input"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                        <Button variant="outline" rounded="pill" size="sm" onClick={() => setVideoUrl("")}>
                          Clear
                        </Button>
                      </div>

                      <div className="editor-video-preview">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title="Video preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="editor-video-placeholder">
                            <Video size={48} strokeWidth={1.5} />
                            <span>Paste a YouTube or video URL above to preview</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Reading Editor ────────────────────────── */}
                  {lessonType === "reading" && (
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 12, display: "block" }}>
                        Lesson Content
                      </label>

                      <RichTextEditor 
                        content={readingContent} 
                        onChange={setReadingContent} 
                        placeholder="Write your lesson content here..." 
                      />
                    </div>
                  )}

                  {/* ─── Assessment Builder ────────────────────── */}
                  {lessonType === "assessment" && (
                    <div>
                      {/* Assessment Config */}
                      <div className="editor-assessment-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <PenTool size={18} color="#FF6B00" />
                          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-header)" }}>Assessment Builder</span>
                        </div>

                        <div className="editor-assessment-config">
                          <div className="editor-assessment-config-field">
                            <label className="editor-assessment-config-label">
                              <Target size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                              Passing Score (%)
                            </label>
                            <input
                              className="editor-assessment-config-input"
                              type="number"
                              min={0}
                              max={100}
                              value={passingScore}
                              onChange={(e) => setPassingScore(Number(e.target.value))}
                            />
                          </div>
                          <div className="editor-assessment-config-field">
                            <label className="editor-assessment-config-label">
                              <Timer size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                              Time Limit (minutes)
                            </label>
                            <input
                              className="editor-assessment-config-input"
                              type="number"
                              min={1}
                              value={timeLimit}
                              onChange={(e) => setTimeLimit(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Questions */}
                      {questions.map((q) => (
                        <div key={q.id} className="editor-question-card">
                          <div className="editor-question-header">
                            <div className="editor-question-number">{q.position}</div>
                            <input
                              className="editor-question-input"
                              value={q.question_text}
                              onChange={(e) => updateQuestionText(q.id, e.target.value)}
                              placeholder="Type your question here..."
                            />
                            <button className="editor-question-delete" onClick={() => deleteQuestion(q.id)} title="Delete question">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="editor-choices">
                            {q.choices.map((c) => (
                              <div key={c.id} className="editor-choice-row">
                                <button
                                  className={`editor-choice-correct-btn ${c.is_correct ? "correct" : ""}`}
                                  onClick={() => toggleCorrectChoice(q.id, c.id)}
                                  title={c.is_correct ? "Correct answer" : "Mark as correct"}
                                >
                                  {c.is_correct && <Check size={14} />}
                                </button>
                                <input
                                  className="editor-choice-input"
                                  value={c.choice_text}
                                  onChange={(e) => updateChoiceText(q.id, c.id, e.target.value)}
                                  placeholder="Choice text..."
                                />
                                <button className="editor-choice-delete" onClick={() => deleteChoice(q.id, c.id)} title="Remove choice">
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button className="editor-add-choice-btn" onClick={() => addChoice(q.id)}>
                            <Plus size={14} /> Add Choice
                          </button>
                        </div>
                      ))}

                      <button className="editor-add-question-btn" onClick={addQuestion}>
                        <Plus size={18} /> Add Question
                      </button>

                      {questions.length === 0 && (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-muted)" }}>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>No questions yet</div>
                          <div style={{ fontSize: 13, marginTop: 4 }}>Click "Add Question" to start building your assessment.</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column — Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Lesson Info */}
                <div className="editor-sidebar-card">
                  <div className="editor-sidebar-title">Lesson Info</div>
                  <div className="editor-info-rows">
                    <div className="editor-info-row">
                      <span className="editor-info-label">Type</span>
                      <span style={{
                        padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase",
                        background: lessonType === "video" ? "rgba(59,130,246,0.08)" : lessonType === "reading" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                        color: lessonType === "video" ? "#3b82f6" : lessonType === "reading" ? "#10b981" : "#f59e0b",
                      }}>
                        {lessonType}
                      </span>
                    </div>
                    <div className="editor-info-row">
                      <span className="editor-info-label">Module</span>
                      <span className="editor-info-value">{currentModule.title}</span>
                    </div>
                    <div className="editor-info-row">
                      <span className="editor-info-label">Position</span>
                      <span className="editor-info-value">Lesson {lessonData?.position || 1}</span>
                    </div>
                    {lessonType === "assessment" && (
                      <>
                        <div className="editor-info-row">
                          <span className="editor-info-label">Questions</span>
                          <span className="editor-info-value">{questions.length}</span>
                        </div>
                        <div className="editor-info-row">
                          <span className="editor-info-label">Pass Score</span>
                          <span className="editor-info-value">{passingScore}%</span>
                        </div>
                        <div className="editor-info-row">
                          <span className="editor-info-label">Time Limit</span>
                          <span className="editor-info-value">{timeLimit} min</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Module Lessons List */}
                <div className="editor-sidebar-card">
                  <div className="editor-sidebar-title">{currentModule.title} — Lessons</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {currentModule.lessons?.map((lsn: EditorLesson, idx: number) => {
                      const isActive = lsn.id === lessonId;
                      return (
                        <div
                          key={lsn.id}
                          className={`editor-sidebar-lesson-item ${isActive ? "active" : ""}`}
                          onClick={() => navigateToLesson(lsn)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="editor-sidebar-lesson-dot" style={{ background: isActive ? "#FF6B00" : "var(--color-border)" }} />
                            <span className={`editor-sidebar-lesson-name ${isActive ? "active" : ""}`}>
                              Lesson {idx + 1}: {lsn.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {(!currentModule.lessons || currentModule.lessons.length === 0) && (
                      <div style={{ fontSize: 13, color: "var(--color-text-muted)", padding: "8px 0" }}>No lessons in this module.</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="editor-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Button variant="primary" rounded="pill" onClick={handleSave} style={{ width: "100%" }}>
                    Save Lesson
                  </Button>
                  <Button
                    variant="outline"
                    rounded="pill"
                    onClick={() => navigate(`/${slug}/courses/builder`, {
                      state: { courseId, courseData, allModules: allModulesList },
                    })}
                    style={{ width: "100%" }}
                  >
                    Back to Builder
                  </Button>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{
              position: "fixed", bottom: 40, left: "50%", zIndex: 1000,
              background: "#333", color: "#fff",
              padding: "16px 24px", borderRadius: 8,
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              fontSize: 14, fontWeight: 500,
            }}
          >
            <CheckCircle size={18} color="#4CAF50" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonEditor;
