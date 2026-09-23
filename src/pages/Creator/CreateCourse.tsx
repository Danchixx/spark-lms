import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, ImagePlus, X, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import "./CreateCourse.css";

const CreateCourse = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  // ─── Form State ────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconEmoji, setIconEmoji] = useState("📘");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Thumbnail Handlers ────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemoveThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Submit Handlers ──────────────────────────────────────
  const handleSubmit = (submitStatus: "draft" | "published") => {
    if (!title.trim()) {
      setToastMessage("Please enter a course title.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Mock course data — ready for backend integration
    const courseData = {
      title: title.trim(),
      description: description.trim() || null,
      icon_emoji: iconEmoji || null,
      thumbnail_url: thumbnailPreview,
      status: submitStatus,
      company_id: company?.id,
      created_by: user?.id,
    };

    setToastMessage(
      submitStatus === "draft"
        ? `"${title}" saved as draft!`
        : `"${title}" published successfully!`
    );
    setTimeout(() => setToastMessage(null), 3000);

    // Navigate to Course Builder with mock course data
    setTimeout(() => {
      navigate(`/${slug}/courses/builder`, {
        state: {
          courseId: "new",
          courseData,
        },
      });
    }, 800);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses ..." role="Admin" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <PageTransition>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, fontWeight: 600 }}>
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
              <span style={{ color: "var(--color-text-header)" }}>Create Course</span>
            </div>

            <div className="create-course-container">
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 8px", textAlign: "center" }}>
                Create New Course
              </h1>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", textAlign: "center", margin: "0 0 32px" }}>
                Set up your course details. You'll add modules and lessons in the next step.
              </p>

              <div className="create-course-form">
                {/* Course Details Card */}
                <div className="create-course-card">
                  <h2 className="create-course-card-title">
                    <FileText size={18} /> Course Details
                  </h2>

                  <div className="create-course-field">
                    <label className="create-course-label">Course Title *</label>
                    <input
                      className="create-course-input"
                      type="text"
                      placeholder="e.g., Sales Fundamentals, Customer Service Pro"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="create-course-field">
                    <label className="create-course-label">Description</label>
                    <div className="create-course-label-hint">Brief overview of what learners will gain from this course</div>
                    <textarea
                      className="create-course-input create-course-textarea"
                      placeholder="Describe what this course covers, its objectives, and who it's for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="create-course-field">
                    <label className="create-course-label">Icon Emoji</label>
                    <div className="create-course-label-hint">Used as a visual identifier when no thumbnail is available</div>
                    <input
                      className="create-course-input"
                      type="text"
                      placeholder="📘"
                      value={iconEmoji}
                      onChange={(e) => setIconEmoji(e.target.value)}
                      style={{ width: 80, textAlign: "center", fontSize: 20 }}
                    />
                  </div>
                </div>

                {/* Thumbnail Card */}
                <div className="create-course-card">
                  <h2 className="create-course-card-title">
                    <ImagePlus size={18} /> Course Thumbnail
                  </h2>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />

                  <div
                    className={`create-course-thumbnail-area ${dragging ? "dragging" : ""} ${thumbnailPreview ? "has-image" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {thumbnailPreview ? (
                      <>
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="create-course-thumbnail-preview" />
                        <button className="create-course-thumbnail-remove" onClick={handleRemoveThumbnail}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="create-course-thumbnail-icon">
                          <ImagePlus size={24} />
                        </div>
                        <div className="create-course-thumbnail-text">
                          Drop an image here, or click to browse
                        </div>
                        <div className="create-course-thumbnail-hint">
                          Recommended: 1200 × 630px, PNG or JPG
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Card */}
                <div className="create-course-card">
                  <h2 className="create-course-card-title">
                    <Sparkles size={18} /> Course Status
                  </h2>

                  <div className="create-course-status-row">
                    <div
                      className={`create-course-status-option ${status === "draft" ? "active" : ""}`}
                      onClick={() => setStatus("draft")}
                    >
                      <div className="create-course-status-dot" style={{ background: "#f59e0b" }} />
                      <div>
                        <div className="create-course-status-label">Draft</div>
                        <div className="create-course-status-desc">Not visible to users. Continue editing before publishing.</div>
                      </div>
                    </div>

                    <div
                      className={`create-course-status-option ${status === "published" ? "active" : ""}`}
                      onClick={() => setStatus("published")}
                    >
                      <div className="create-course-status-dot" style={{ background: "#27ae60" }} />
                      <div>
                        <div className="create-course-status-label">Published</div>
                        <div className="create-course-status-desc">Available for assignment to users immediately.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="create-course-actions">
                  <Button variant="outline" rounded="pill" onClick={() => navigate(`/${slug}/courses`)}>
                    Cancel
                  </Button>
                  <Button variant="outline" rounded="pill" onClick={() => handleSubmit("draft")}>
                    Save as Draft
                  </Button>
                  <Button variant="primary" rounded="pill" onClick={() => handleSubmit(status)}>
                    {status === "published" ? "Publish & Continue" : "Save & Continue"}
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
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCourse;
