import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import { ArrowLeft, Check, Lock, Play, FileText, PenTool } from "lucide-react";

// Mock data based on the screenshot
const COURSE_DATA = {
  id: 1,
  title: "Sales Fundamentals",
  modulesCount: 5,
  unitsCount: 18,
  assessmentsCount: 5,
  progress: 94,
  modules: [
    {
      id: 1,
      name: "Understanding the Modern Buyer",
      unitsCount: 4,
      status: "completed",
      progressText: "Done 100%",
      units: [
        { id: 1, type: "video", title: "Video: Buyer Psychology", status: "completed" },
        { id: 2, type: "reading", title: "Reading: Market Analysis", status: "completed" },
        { id: 3, type: "reading", title: "Reading: Identifying Pain Points", status: "completed" },
        { id: 4, type: "assessment", title: "Assessment: Module 1 Quiz", status: "completed" }
      ]
    },
    {
      id: 2,
      name: "Building Your Sales",
      unitsCount: 4,
      status: "in-progress",
      progressText: "In Progress · 2/4 Done",
      units: [
        { id: 1, type: "video", title: "Intro: Perfect Pitch", status: "completed" },
        { id: 2, type: "reading", title: "Reading: Spin Selling Framework", status: "completed" },
        { id: 3, type: "video", title: "Video: The AIDA Framework", status: "open" },
        { id: 4, type: "assessment", title: "Assessment: Module 2 Quiz", status: "locked" }
      ]
    },
    {
      id: 3,
      name: "Handling Objections",
      unitsCount: 4,
      status: "locked",
      progressText: "Locked",
      units: []
    },
    {
      id: 4,
      name: "Post-Sale & Client Retention",
      unitsCount: 4,
      status: "locked",
      progressText: "Locked",
      units: []
    }
  ]
};

const CourseModules = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const [expandedModule, setExpandedModule] = useState(2); // Auto-expand Module 2

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);

  const getUnitIcon = (type) => {
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
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, lessons ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          
          {/* Breadcrumb Area */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Button variant="outline" size="sm" rounded="pill" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
              My Courses
            </Button>
            <span style={{ color: "#666", fontWeight: "600" }}>&gt;</span>
            <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{COURSE_DATA.title}</span>
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
              <div style={{ fontSize: 64, filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.25))" }}>🧳</div>
              <div>
                <h1 style={{ margin: "0 0 12px 0", fontSize: 32, fontWeight: 800 }}>{COURSE_DATA.title}</h1>
                <div style={{ display: "flex", gap: 24, fontSize: 15, fontWeight: 600 }}>
                  <span>{COURSE_DATA.modulesCount} Modules</span>
                  <span>{COURSE_DATA.unitsCount} Lessons</span>
                  <span>{COURSE_DATA.assessmentsCount} Assessments</span>
                </div>
              </div>
            </div>
            {/* Background decorative element */}
            <div style={{ position: "absolute", right: 20, top: "10%", fontSize: 120, opacity: 0.15 }}>🔥</div>
          </div>

          {/* Progress Bar Container */}
          <div style={{ background: "white", borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", gap: 24, marginBottom: 32, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 13, color: "#666", fontWeight: 600, whiteSpace: "nowrap" }}>Your Progress</span>
            <div style={{ flex: 1, height: 14, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${COURSE_DATA.progress}%`, background: "linear-gradient(90deg, #FF6B00, #ff9e40)", borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 13, color: "#FF6B00", fontWeight: 700, whiteSpace: "nowrap" }}>{COURSE_DATA.progress}% Complete</span>
            <Button size="sm" rounded="pill">Continue</Button>
          </div>

          {/* Modules List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {COURSE_DATA.modules.map((module, index) => {
              const sc = statusColors[module.status];
              const isExpanded = expandedModule === module.id;

              return (
                <div key={module.id} style={{
                  background: "white",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 4px 16px rgba(255, 107, 0, 0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
                  border: `1px solid ${isExpanded ? "#FF6B00" : "#eee"}`,
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
                      <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Module {module.id}: {module.name}</h3>
                      <div style={{ fontSize: 13, color: "#888" }}>
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
                        border: "1px solid #ddd", background: "white"
                      }}>
                        <div style={{ background: "#f5f5f5", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                          {getUnitIcon(unit.type)}
                        </div>
                        
                        <div style={{ flex: 1, fontWeight: 600, color: "#1a1a1a", fontSize: 14 }}>
                          {unit.title}
                        </div>

                        <div>
                          {unit.status === "completed" && <Check size={20} color="#FF6B00" strokeWidth={3} />}
                          {unit.status === "open" && <Button size="sm" rounded="pill">Open</Button>}
                          {unit.status === "locked" && <Lock size={16} color="#666" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseModules;
