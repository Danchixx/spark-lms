import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import LessonCard from "../../components/common/LessonCard/LessonCard";
import { ArrowLeft, Check, Circle } from "lucide-react";
import { COURSES } from "../../data/mockCourses";
import sparkLogoImg from "../../components/common/SparkLogo/sparklogo.png";

const ModuleLessons = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courseId, moduleId, lessonId } = location.state || {};

  const course = COURSES.find((c) => c.id === parseInt(courseId));
  const module = course?.modules?.find((m) => m.id === parseInt(moduleId));

  const [currentLessonId, setCurrentLessonId] = useState(parseInt(lessonId));
  const [quickNotes, setQuickNotes] = useState("");
  
  const [localLessons, setLocalLessons] = useState(module?.units || []);
  const [localProgress, setLocalProgress] = useState(course?.progress || 0);

  if (!course || !module) {
    return <Navigate to={`/${slug}/courses`} replace />;
  }

  const currentIndex = localLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = localLessons[currentIndex];

  const handleNext = () => {
    const updatedLessons = [...localLessons];
    let justCompleted = false;

    if (updatedLessons[currentIndex] && updatedLessons[currentIndex].status !== "completed") {
      updatedLessons[currentIndex] = { ...updatedLessons[currentIndex], status: "completed" };
      justCompleted = true;
    }

    setLocalLessons(updatedLessons);

    if (justCompleted && course.unitsCount) {
      setLocalProgress((prev) => Math.min(100, Math.round(prev + (100 / course.unitsCount))));
    }

    if (currentIndex < localLessons.length - 1) {
      setCurrentLessonId(localLessons[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(localLessons[currentIndex - 1].id);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          
          {/* Breadcrumb Area */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 16 }}>
            <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
              Modules
            </Button>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>Module {module.id}</span>
            <span style={{ color: "#FF6B00", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
              Lesson {currentLessonId}: {currentLesson?.title?.replace(/^(Video:|Reading:|Assessment:)\s*/, '')}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
            
            {/* Left Column: Lesson Card */}
            <LessonCard 
              lesson={currentLesson}
              onBack={handleBack}
              onNext={handleNext}
              currentIndex={currentIndex + 1}
              totalLessons={localLessons.length}
              onProceedAssessment={() => navigate(`/${slug}/courses/assessment`, {
                state: { courseId, moduleId }
              })}
            />

            {/* Right Column: Sidebar Panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Progress Card */}
              <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15, width: 80 }}>
                  <img src={sparkLogoImg} alt="Spark" style={{ width: "100%", height: "auto" }} />
                </div>
                
                <div style={{ fontSize: 11, color: "#666", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 }}>COURSE PROGRESS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${localProgress}%`, background: "#FF6B00", borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#FF6B00" }}>{localProgress}%</span>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>completed</span>
                </div>
              </div>

              {/* Module Lessons List */}
              <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, color: "#666", fontWeight: "700", marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>MODULE {module.id} LESSONS</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {localLessons.map((lsn, idx) => {
                    const isActive = lsn.id === currentLessonId;
                    const isCompleted = lsn.status === "completed";
                    
                    return (
                      <div 
                        key={lsn.id}
                        onClick={() => setCurrentLessonId(lsn.id)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: 8,
                          background: isActive ? "#ffece0" : "#f8f8f8",
                          border: `1px solid ${isActive ? "#ffcda8" : "transparent"}`,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isCompleted || isActive ? "#FF6B00" : "#ccc" }} />
                          <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#FF6B00" : "#444" }}>
                            Lesson {idx + 1}: {lsn.title.split(":")[0].replace(/^(Video|Reading|Assessment)$/, '').trim() || lsn.title.split(":")[0]}
                          </span>
                        </div>
                        {isCompleted && <Check size={16} color="#FF6B00" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Notes */}
              <div style={{ background: "white", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, color: "#666", fontWeight: "700", marginBottom: 16, letterSpacing: 0.5 }}>QUICK NOTES</div>
                <textarea 
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Type your notes here..."
                  style={{
                    width: "100%", height: 120, resize: "none",
                    background: "#f8f8f8", border: "1px solid #e0e0e0", borderRadius: 8,
                    padding: "12px", fontSize: 13, color: "#333", fontFamily: "inherit",
                    outline: "none"
                  }}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModuleLessons;
