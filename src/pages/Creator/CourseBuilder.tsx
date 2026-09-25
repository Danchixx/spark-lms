import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, ChevronDown, Plus, Play, FileText, PenTool, Trash2, GripVertical, Edit3, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import * as courseService from "../../services/courseCreatorService";
import "./CourseBuilder.css";

// ─── Types (mirrors DB schema) ──────────────────────────────
type BuilderLesson = {
  id: number;
  title: string;
  type: "video" | "reading" | "assessment";
  content: string | null;
  video_url: string | null;
  position: number;
};

type BuilderModule = {
  id: number;
  title: string;
  description: string | null;
  order: number;
  lessons: BuilderLesson[];
};

type BuilderCourse = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  icon_emoji: string | null;
  status: "draft" | "published";
};

// ─── Mock Data ──────────────────────────────────────────────
const MOCK_MODULES: BuilderModule[] = [
  {
    id: 1,
    title: "Introduction to Sales",
    description: "Core concepts and fundamentals",
    order: 1,
    lessons: [
      { id: 101, title: "Welcome & Overview", type: "video", content: null, video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", position: 1 },
      { id: 102, title: "Understanding the Sales Funnel", type: "reading", content: "The sales funnel represents the journey...", video_url: null, position: 2 },
      { id: 103, title: "Module 1 Assessment", type: "assessment", content: null, video_url: null, position: 3 },
    ],
  },
  {
    id: 2,
    title: "Building Customer Relationships",
    description: "Learn effective communication strategies",
    order: 2,
    lessons: [
      { id: 201, title: "Active Listening Skills", type: "video", content: null, video_url: null, position: 1 },
      { id: 202, title: "Empathy in Sales", type: "reading", content: "Empathy is the foundation...", video_url: null, position: 2 },
    ],
  },
  {
    id: 3,
    title: "Closing Techniques",
    description: "Advanced techniques to close deals",
    order: 3,
    lessons: [],
  },
];

let nextModuleId = 100;
let nextLessonId = 1000;

// ─── Utility Components ─────────────────────────────────────
const LessonTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "video": return <Play size={16} />;
    case "reading": return <FileText size={16} />;
    case "assessment": return <PenTool size={16} />;
    default: return <FileText size={16} />;
  }
};

// ─── Main Component ─────────────────────────────────────────
const CourseBuilder = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  // ─── State ─────────────────────────────────────────────────
  const courseState = location.state?.courseData;
  const courseId = location.state?.courseId;
  const [course, setCourse] = useState<BuilderCourse>({
    id: courseId || "new",
    title: courseState?.title || "Untitled Course",
    description: courseState?.description || null,
    thumbnail_url: courseState?.thumbnail_url || null,
    icon_emoji: courseState?.icon_emoji || "📘",
    status: courseState?.status || "draft",
  });

  const [modules, setModules] = useState<BuilderModule[]>(
    location.state?.allModules || []
  );
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"video" | "reading" | "assessment">("video");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: "module" | "lesson"; moduleId: number; lessonId?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch real data from Supabase on mount ────────────────
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || courseId === "new") {
        setLoading(false);
        return;
      }
      try {
        const { course: fetchedCourse, modules: fetchedModules } = await courseService.fetchCourseWithModules(Number(courseId));
        setCourse({
          id: fetchedCourse.id,
          title: fetchedCourse.title,
          description: fetchedCourse.description,
          thumbnail_url: fetchedCourse.thumbnail_url,
          icon_emoji: fetchedCourse.icon_emoji,
          status: fetchedCourse.status,
        });
        setModules(fetchedModules.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          lessons: (m.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            content: l.content,
            video_url: l.video_url,
            position: l.position,
          })),
        })));
      } catch (err) {
        console.error("Failed to load course:", err);
        showToast("Failed to load course data.");
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId]);

  // Auto-expand first module if there's only one
  useEffect(() => {
    if (modules.length === 1 && expandedModule === null) {
      setExpandedModule(modules[0]!.id);
    }
  }, [modules, expandedModule]);

  // ─── Module Actions ────────────────────────────────────────
  const addModule = async () => {
    try {
      const newOrder = modules.length + 1;
      const mod = await courseService.createModule(Number(course.id), {
        title: `Module ${newOrder}`,
        description: null,
        order: newOrder,
      });
      const newModule: BuilderModule = {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        lessons: [],
      };
      setModules([...modules, newModule]);
      setExpandedModule(newModule.id);
      showToast("Module added!");
    } catch (err: any) {
      console.error("Failed to add module:", err);
      showToast(`Error: ${err.message}`);
    }
  };

  const deleteModule = async (moduleId: number) => {
    try {
      await courseService.deleteModule(moduleId, user?.id as string);
      setModules(modules.filter((m) => m.id !== moduleId).map((m, i) => ({ ...m, order: i + 1 })));
      if (expandedModule === moduleId) setExpandedModule(null);
      setShowDeleteConfirm(null);
      showToast("Module deleted.");
    } catch (err: any) {
      console.error("Failed to delete module:", err);
      showToast(`Error: ${err.message}`);
    }
  };

  const updateModuleTitle = (moduleId: number, newTitle: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, title: newTitle } : m)));
  };

  const updateModuleDesc = (moduleId: number, newDesc: string) => {
    setModules(modules.map((m) => (m.id === moduleId ? { ...m, description: newDesc } : m)));
  };

  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);

  const handleModuleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedModuleIndex(index);
    // Setting data is required in some browsers (like Firefox) for drag to work
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleModuleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === index) return;
    const newModules = [...modules];
    const draggedItem = newModules[draggedModuleIndex];
    if (!draggedItem) return;
    newModules.splice(draggedModuleIndex, 1);
    newModules.splice(index, 0, draggedItem);
    setModules(newModules);
    setDraggedModuleIndex(index);
  };

  const handleModuleDragEnd = () => {
    setDraggedModuleIndex(null);
  };

  // ─── Lesson Actions ────────────────────────────────────────
  const addLesson = async (moduleId: number) => {
    if (!newLessonTitle.trim()) return;

    try {
      const position = (modules.find((m) => m.id === moduleId)?.lessons.length || 0) + 1;
      const lesson = await courseService.createLesson(moduleId, {
        title: newLessonTitle.trim(),
        type: newLessonType,
        content: null,
        video_url: null,
        position,
      });

      const newLesson: BuilderLesson = {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        video_url: lesson.video_url,
        position: lesson.position,
      };

      setModules(modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ));

      setShowAddLessonModal(null);
      setNewLessonTitle("");
      setNewLessonType("video");
      showToast(`"${newLesson.title}" added!`);
    } catch (err: any) {
      console.error("Failed to add lesson:", err);
      showToast(`Error: ${err.message}`);
    }
  };

  const deleteLesson = async (moduleId: number, lessonId: number) => {
    try {
      await courseService.deleteLesson(lessonId, user?.id as string);
      setModules(modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId).map((l, i) => ({ ...l, position: i + 1 })) }
          : m
      ));
      setShowDeleteConfirm(null);
      showToast("Lesson deleted.");
    } catch (err: any) {
      console.error("Failed to delete lesson:", err);
      showToast(`Error: ${err.message}`);
    }
  };

  const openLessonEditor = (lesson: BuilderLesson, module: BuilderModule) => {
    navigate(`/${slug}/courses/lesson-editor`, {
      state: {
        courseId: course.id,
        moduleId: module.id,
        lessonId: lesson.id,
        courseData: course,
        moduleData: module,
        lessonData: lesson,
        allModules: modules,
      },
    });
  };

  // ─── Helpers ───────────────────────────────────────────────
  const showToast = (msg: string) => {
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalContent = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.type !== "assessment").length, 0);
  const totalAssessments = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.type === "assessment").length, 0);

  const handleSave = async () => {
    try {
      // 1. Update course metadata
      await courseService.updateCourse(Number(course.id), {
        title: course.title,
        description: course.description,
        status: course.status,
        thumbnail_url: course.thumbnail_url,
        icon_emoji: course.icon_emoji,
      });

      // 2. Reorder modules
      await courseService.reorderModules(
        modules.map((m, i) => ({ id: m.id, order: i + 1 }))
      );

      // 3. Update module titles/descriptions
      for (const m of modules) {
        await courseService.updateModule(m.id, { title: m.title, description: m.description });
      }

      showToast("Course saved successfully!");
    } catch (err: any) {
      console.error("Failed to save course:", err);
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search modules, lessons ..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
              <button
                onClick={() => navigate(`/${slug}/courses`)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  border: "1px solid var(--color-border)", background: "var(--color-surface)",
                  color: "#FF6B00", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                }}
              >
                <ArrowLeft size={14} /> Courses
              </button>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-header)" }}>Course Builder</span>
            </div>

            {/* Course Banner */}
            <div className="builder-banner">
              <div
                className="builder-banner-image editable-thumbnail"
                onClick={() => {
                  const url = window.prompt("Enter new thumbnail URL:", course.thumbnail_url || "");
                  if (url !== null) setCourse({ ...course, thumbnail_url: url });
                }}
                style={{
                  background: course.thumbnail_url
                    ? `url(${course.thumbnail_url}) center/cover no-repeat`
                    : "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
                  position: "relative",
                  cursor: "pointer"
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }} 
                     onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                     onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}>
                  <Edit3 size={32} color="#fff" />
                </div>
              </div>
              <div className="builder-banner-info">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <h1 className="builder-banner-title">{course.title}</h1>
                    <p className="builder-banner-desc">{course.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="builder-banner-meta">
                  <span>{modules.length} Modules</span>
                  <span className="builder-banner-meta-sep">|</span>
                  <span>{totalLessons} Lessons</span>
                  <span className="builder-banner-meta-sep">|</span>
                  <span>{totalAssessments} Assessments</span>
                  <span className="builder-banner-meta-sep">|</span>
                  <span style={{
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    background: course.status === "published" ? "#E8F5E9" : "#FFF3E0",
                    color: course.status === "published" ? "#2E7D32" : "#E65100",
                  }}>
                    {course.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Layout */}
            <div className="builder-layout">
              {/* Left Column — Modules */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {modules.map((module, index) => {
                  const isExpanded = expandedModule === module.id;

                  return (
                    <div 
                      key={module.id} 
                      className={`builder-module ${isExpanded ? "expanded" : ""}`}
                      draggable
                      onDragStart={(e) => handleModuleDragStart(e, index)}
                      onDragOver={(e) => handleModuleDragOver(e, index)}
                      onDragEnd={handleModuleDragEnd}
                      style={{ opacity: draggedModuleIndex === index ? 0.5 : 1 }}
                    >
                      {/* Module Header */}
                      <div className="builder-module-header" onClick={() => setExpandedModule(isExpanded ? null : module.id)}>
                        <div className={`builder-module-number ${isExpanded ? "expanded" : ""}`}>
                          {index + 1}
                        </div>

                        <div className="builder-module-info">
                          <div className="builder-module-title-row">
                            <input
                              className="builder-module-title-input"
                              value={module.title}
                              onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Module title..."
                            />
                          </div>
                          <div className="builder-module-subtitle" style={{ display: "flex", alignItems: "center" }}>
                            <span style={{ marginRight: 8, whiteSpace: "nowrap" }}>
                              {module.lessons.filter(l => l.type !== "assessment").length} {module.lessons.filter(l => l.type !== "assessment").length === 1 ? "lesson" : "lessons"} ·
                            </span>
                            <input
                              className="builder-module-desc-input"
                              value={module.description || ""}
                              onChange={(e) => updateModuleDesc(module.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Add a short subtitle..."
                              style={{ border: "none", background: "transparent", color: "inherit", outline: "none", flex: 1, minWidth: 0, fontFamily: "inherit" }}
                            />
                          </div>
                        </div>

                        <div className="builder-module-actions">
                          <button className="builder-module-action-btn" title="Drag to reorder" onClick={(e) => e.stopPropagation()}>
                            <GripVertical size={16} />
                          </button>
                          <button
                            className="builder-module-action-btn danger"
                            title="Delete module"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm({ type: "module", moduleId: module.id });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronDown
                            size={18}
                            color="var(--color-text-muted)"
                            style={{
                              transition: "transform 0.3s",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Module Content (Accordion) */}
                      <div className={`builder-module-content ${isExpanded ? "expanded" : "collapsed"}`}>
                        <div className="builder-lesson-list">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="builder-lesson-item"
                              onClick={() => openLessonEditor(lesson, module)}
                            >
                              <div style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <LessonTypeIcon type={lesson.type} />
                              </div>

                              <div className="builder-lesson-info">
                                <div className="builder-lesson-title">{lesson.title}</div>
                              </div>

                              <div className="builder-lesson-actions">
                                <button
                                  className="builder-module-action-btn"
                                  title="Edit lesson"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLessonEditor(lesson, module);
                                  }}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  className="builder-module-action-btn danger"
                                  title="Delete lesson"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm({ type: "lesson", moduleId: module.id, lessonId: lesson.id });
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {module.lessons.length === 0 && (
                          <div style={{ marginLeft: 56, padding: "16px", color: "var(--color-text-muted)", fontSize: 13, fontStyle: "italic" }}>
                            No lessons yet. Add your first lesson below.
                          </div>
                        )}

                        <button className="builder-add-lesson-btn" onClick={() => setShowAddLessonModal(module.id)}>
                          <Plus size={16} /> Add Lesson
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add Module Button */}
                <button className="builder-add-module-btn" onClick={addModule}>
                  <Plus size={20} /> Add Module
                </button>

                {modules.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--color-text-header)" }}>No modules yet</div>
                    <div style={{ fontSize: 14 }}>Click "Add Module" to start building your course content.</div>
                  </div>
                )}
              </div>

              {/* Right Column — Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Course Overview */}
                <div className="builder-sidebar-card">
                  <div className="builder-sidebar-card-title">Course Overview</div>
                  <div className="builder-stat-grid">
                    <div className="builder-stat-item">
                      <div className="builder-stat-value">{modules.length}</div>
                      <div className="builder-stat-label">Modules</div>
                    </div>
                    <div className="builder-stat-item">
                      <div className="builder-stat-value">{totalContent}</div>
                      <div className="builder-stat-label">Content</div>
                    </div>
                    <div className="builder-stat-item">
                      <div className="builder-stat-value">{totalLessons}</div>
                      <div className="builder-stat-label">Lessons</div>
                    </div>
                    <div className="builder-stat-item">
                      <div className="builder-stat-value">{totalAssessments}</div>
                      <div className="builder-stat-label">Assessments</div>
                    </div>
                  </div>
                </div>

                {/* Course Settings */}
                <div className="builder-sidebar-card">
                  <div className="builder-sidebar-card-title">Course Settings</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>Status</span>
                      <button
                        onClick={() => setCourse({ ...course, status: course.status === "draft" ? "published" : "draft" })}
                        style={{
                          padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                          background: course.status === "published" ? "#E8F5E9" : "#FFF3E0",
                          color: course.status === "published" ? "#2E7D32" : "#E65100",
                          border: "none", cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {course.status === "published" ? "Published" : "Draft"}
                      </button>
                    </div>

                    {course.thumbnail_url && (
                      <div>
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Thumbnail</span>
                        <img
                          src={course.thumbnail_url}
                          alt="Course thumbnail"
                          style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 120 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="builder-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Button variant="primary" rounded="pill" onClick={handleSave} style={{ width: "100%" }}>
                    Save Changes
                  </Button>
                  <Button variant="outline" rounded="pill" onClick={() => navigate(`/${slug}/courses`)} style={{ width: "100%" }}>
                    Back to Courses
                  </Button>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>

      {/* ─── Add Lesson Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showAddLessonModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
            }}
            onClick={() => setShowAddLessonModal(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-surface)", borderRadius: 16, width: "100%", maxWidth: 520,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                padding: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--color-text-header)" }}>Add Lesson</h3>
                <button onClick={() => setShowAddLessonModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 6, display: "block" }}>Lesson Title</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g., Introduction to Sales Techniques"
                  style={{
                    width: "100%", padding: "12px 16px", fontSize: 14, fontFamily: "inherit",
                    border: "1.5px solid var(--color-border)", borderRadius: 10,
                    background: "var(--color-input-bg)", color: "var(--color-text)",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 10, display: "block" }}>Lesson Type</label>
                <div className="builder-lesson-type-grid">
                  {(["video", "reading", "assessment"] as const).map((type) => (
                    <div
                      key={type}
                      className={`builder-lesson-type-card ${newLessonType === type ? "selected" : ""}`}
                      onClick={() => setNewLessonType(type)}
                    >
                      <div className={`builder-lesson-icon ${type}`} style={{ width: 40, height: 40 }}>
                        <LessonTypeIcon type={type} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", textTransform: "capitalize" }}>
                        {type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <Button variant="outline" rounded="pill" onClick={() => setShowAddLessonModal(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  rounded="pill"
                  onClick={() => addLesson(showAddLessonModal)}
                  style={{ opacity: !newLessonTitle.trim() ? 0.5 : 1, pointerEvents: !newLessonTitle.trim() ? "none" : "auto" }}
                >
                  Add Lesson
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
            }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-surface)", borderRadius: 16, padding: 28,
                maxWidth: 400, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "var(--color-text-header)" }}>
                Delete {showDeleteConfirm.type === "module" ? "Module" : "Lesson"}?
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--color-text-muted)" }}>
                {showDeleteConfirm.type === "module"
                  ? "This will delete the module and all its lessons. This action cannot be undone."
                  : "This lesson will be permanently removed. This action cannot be undone."}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button variant="outline" rounded="pill" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
                <Button
                  rounded="pill"
                  style={{ background: "#d32f2f", color: "#fff", border: "none" }}
                  onClick={() => {
                    if (showDeleteConfirm.type === "module") {
                      deleteModule(showDeleteConfirm.moduleId);
                    } else if (showDeleteConfirm.lessonId) {
                      deleteLesson(showDeleteConfirm.moduleId, showDeleteConfirm.lessonId);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toast ─────────────────────────────────────────────── */}
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

export default CourseBuilder;
