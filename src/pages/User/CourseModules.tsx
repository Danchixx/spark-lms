import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, Check, Lock, Play, FileText, PenTool } from "lucide-react";
import { COURSES } from "../../data/mockCourses";
import CertificateModal from "../../components/ui/CertificateModal/CertificateModal";
import sparkLogoImg from "../../components/common/SparkLogo/sparklogo.png";
import PageTransition from "../../components/common/PageTransition";

const CourseModules = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const courseId = location.state?.courseId;
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const courseData = COURSES.find(c => c.id === parseInt(courseId));
  const isCompleted = courseData?.progress === 100;

  const [expandedModule, setExpandedModule] = useState(isCompleted ? null : 2); // default to null if completed
  const [showCertificate, setShowCertificate] = useState(false);

  if (!courseData) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "'Barlow', sans-serif" }}>
        <h2>Course not found</h2>
        <Button onClick={() => navigate(`/${slug}/courses`)}>Go Back</Button>
      </div>
    );
  }

  const getUnitIcon = (type: string) => {
    switch (type) {
      case "video": return <Play size={16} />;
      case "reading": return <FileText size={16} />;
      case "assessment": return <PenTool size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const statusColors = {
    completed: { bg: "#FF6B00", color: "white", border: "#FF6B00" }, // Orange circle for check
    "in-progress": { bg: "white", color: "#FF6B00", border: "#FF6B00" }, // Number with orange border
    locked: { bg: "#f0f0f0", color: "#888", border: "#ddd" }, // Grey locked
  };

  return (
    <>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
        <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, lessons ..." role="User" />

          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <PageTransition>

            {/* Breadcrumb Area */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/${slug}/courses`)}>
                My Courses
              </Button>
              <span style={{ color: "var(--color-text-muted)", fontWeight: "600" }}>&gt;</span>
              <span style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{courseData.name}</span>
            </div>

            {/* Main Hero Banner */}
            <div style={{
              background: "linear-gradient(90deg, #FF6B00, #ffb152)",
              borderRadius: 12,
              padding: "24px 32px",
              color: "white",
              display: "flex",
              position: "relative",
              overflow: "hidden",
              marginBottom: 16
            }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", zIndex: 1 }}>
                <div style={{ fontSize: 64, filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.25))" }}>{courseData.icon || "🧳"}</div>
                <div>
                  <h1 style={{ margin: "0 0 12px 0", fontSize: 32, fontWeight: 800 }}>{courseData.name}</h1>
                  <div style={{ display: "flex", gap: 24, fontSize: 15, fontWeight: 600 }}>
                    <span>{courseData.modulesCount} Modules</span>
                    <span>{courseData.unitsCount} Lessons</span>
                    <span>{courseData.assessmentsCount} Assessments</span>
                  </div>
                </div>
              </div>
              {/* Background decorative element */}
              <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", height: "130%", opacity: 0.4 }}>
                <img src={sparkLogoImg} alt="Spark" style={{ height: "100%", objectFit: "contain" }} />
              </div>
            </div>

            {/* Progress Bar Container */}
            <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", gap: 24, marginBottom: 32, boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>Your Progress</span>
              <div style={{ flex: 1, height: 14, background: "var(--color-bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${courseData.progress}%`, background: "linear-gradient(90deg, #FF6B00, #ff9e40)", borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 13, color: "#FF6B00", fontWeight: 700, whiteSpace: "nowrap" }}>{courseData.progress}% Complete</span>
              {isCompleted ? (
                <Button size="sm" rounded="pill" variant="ghost" onClick={() => setShowCertificate(true)}>View Certificate</Button>
              ) : (
                <Button size="sm" rounded="pill">Continue</Button>
              )}
            </div>

            {/* Modules List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {courseData.modules.map((module, index) => {
                const sc = (statusColors as any)[module.status];
                const isExpanded = expandedModule === module.id;

                return (
                  <div key={module.id} style={{
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: isExpanded ? "0 4px 16px rgba(255, 107, 0, 0.15)" : "var(--shadow)",
                    border: `1px solid ${isExpanded ? "#FF6B00" : "var(--color-border)"}`,
                    transition: "all 0.3s ease" // Smooth transition for the container
                  }}>
                    {/* Module Header */}
                    <div
                      onClick={() => module.units.length > 0 && setExpandedModule(isExpanded ? null : module.id)}
                      style={{
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        cursor: module.units.length > 0 ? "pointer" : "default"
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: sc.bg, color: sc.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 800,
                        border: module.status === "completed" ? "none" : `2px solid ${sc.color}`
                      }}>
                        {module.status === "completed" ? <Check size={24} color="white" strokeWidth={3} /> : module.id}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "var(--color-text-header)" }}>Module {module.id}: {module.name}</h3>
                        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                          {module.unitsCount} Lessons · {module.progressText}
                        </div>
                      </div>

                      <div>
                        {module.status === "completed" && <span style={{ background: "#e0ffec", color: "#27ae60", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Completed</span>}
                        {module.status === "locked" && <span style={{ background: "#f0f0f0", color: "#888", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Locked</span>}
                      </div>
                    </div>

                    {/* Lessons List (Accordion) */}
                    <div style={{
                      maxHeight: isExpanded ? "500px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.4s ease, opacity 0.4s ease",
                      padding: isExpanded ? "0 24px 24px 84px" : "0 24px 0 84px",
                      display: "flex", flexDirection: "column", gap: 12
                    }}>
                      {module.units.map((unit) => (
                        <div key={unit.id} style={{
                          display: "flex", alignItems: "center", gap: 16,
                          padding: "16px", borderRadius: 8,
                          border: "1px solid var(--color-border)", background: "var(--color-surface)"
                        }}>
                          <div style={{ background: "var(--color-bg-muted)", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
                            {getUnitIcon(unit.type)}
                          </div>

                          <div style={{ flex: 1, fontWeight: 600, color: "var(--color-text-header)", fontSize: 14 }}>
                            {unit.title}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {unit.status === "completed" && <Check size={20} color="#FF6B00" strokeWidth={3} />}
                            {unit.status === "open" && (
                              <Button 
                                size="sm" 
                                rounded="pill"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/${slug}/courses/lessons`, { 
                                    state: { courseId, moduleId: module.id, lessonId: unit.id } 
                                  });
                                }}
                              >
                                Open
                              </Button>
                            )}
                            {unit.type === "assessment" && (unit.status === "completed" || unit.status === "open") && (
                              <Button
                                size="sm"
                                variant="outline"
                                rounded="pill"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/${slug}/courses/attempts`, {
                                    state: { courseId, moduleId: module.id }
                                  });
                                }}
                              >
                                View Attempts
                              </Button>
                            )}
                            {unit.status === "locked" && <Lock size={16} color="#666" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            </PageTransition>
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        userName={user?.name || ""}
        courseName={courseData.name || ""}
        date="27th of February, 2026"
        companyLogo={company?.logo_url}
      />
    </>
  );
};

export default CourseModules;
