import { Pin, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../ui/Button/Button";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface BarProps {
  value: number;
  color: string;
}

/* ── Progress bar ── */
const Bar = ({ value, color }: BarProps) => (
  <div style={{ height: 6, background: "var(--color-bg-muted)", borderRadius: 99, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.max(0, value)}%`, background: color, borderRadius: 99, transition: "width 0.3s" }} />
  </div>
);

interface CourseCardProps {
  course: {
    id: string | number;
    name: string;
    modulesCount: number;
    unitsCount: number;
    status: string;
    progress: number;
    assignedBy: string;
    icon: string;
    thumbnail?: string | null;
  };
}

/**
 * CourseCard
 */
const CourseCard = ({ course }: CourseCardProps) => {
  const isCompleted = course.status === "Completed";
  const isNotStarted = course.status === "Not Started";
  const barColor = isCompleted ? "#27ae60" : "#FF6B00";
  const progressDisplay = isNotStarted ? "—%" : `${course.progress}%`;

  const navigate = useNavigate();
  const { company } = useAuth();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-") || "";

  const handleActionClick = () => {
    navigate(`/${slug}/courses/modules`, { state: { courseId: course.id } });
  };

  return (
    <div style={{
      background: "var(--color-surface)", borderRadius: 12,
      overflow: "hidden", boxShadow: "var(--shadow)",
      border: "1px solid var(--color-border)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
    >
      {/* Image area */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.name} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(180deg, #ffb152, #FF8C00, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 52, opacity: 0.85 }}>{course.icon}</div>
          </div>
        )}
        
        {/* Gradient Overlay for better contrast */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />

        <StatusBadge
          status={course.status}
          style={{ position: "absolute", top: 12, left: 12, fontSize: 10, padding: "2px 10px", background: "white", color: course.status === "Completed" ? "#27ae60" : course.status === "Ongoing" ? "#FF6B00" : "#888", border: "none", fontWeight: 700, borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
        />
      </div>

      {/* White body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-header)", lineHeight: 1.3 }}>{course.name}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{course.modulesCount} Modules · {course.unitsCount} Lessons</div>

        {/* Progress */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isCompleted ? "#27ae60" : "#FF6B00" }}>{progressDisplay}</span>
          </div>
          <Bar value={isNotStarted ? 0 : course.progress} color={barColor} />
        </div>

        {/* Gray footer strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 10, marginLeft: -16, marginRight: -16, marginBottom: -14,
          padding: "10px 16px",
          background: "var(--color-bg-subtle)",
          borderTop: "1px solid var(--color-border)",
        }}>
          {isCompleted ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-muted)" }}>
              <Trophy size={13} color="#f39c12" /> Certificate Earned
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-muted)" }}>
              <Pin size={12} color="var(--color-text-muted)" style={{ opacity: 0.7 }} /> Assigned by {course.assignedBy}
            </div>
          )}

          <Button
            size="sm"
            rounded="pill"
            variant={isCompleted || isNotStarted ? "ghost" : "primary"}
            onClick={handleActionClick}
          >
            {isCompleted ? "View" : isNotStarted ? "Start" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CourseFilterNavProps {
  counts: {
    all: number;
    ongoing: number;
    completed: number;
    notStarted: number;
  };
  active: string;
  onChange: (filter: string) => void;
}

/* ── Filter Nav ── */
export const CourseFilterNav = ({ counts, active, onChange }: CourseFilterNavProps) => {
  const filters = [
    { key: "All", label: `All (${counts.all})` },
    { key: "Ongoing", label: `Ongoing (${counts.ongoing})` },
    { key: "Completed", label: `Completed (${counts.completed})` },
    { key: "Not Started", label: `Not Started (${counts.notStarted})` },
  ];

  return (
    <div className="course-filter-nav" style={{
      display: "inline-flex", flexWrap: "wrap", gap: 8,
      marginBottom: 24,
      background: "var(--color-surface)",
      border: "1.5px solid var(--color-border)",
      borderRadius: 16,
      padding: "8px 10px",
      boxShadow: "var(--shadow-sm)",
      position: "relative",
      maxWidth: "100%",
    }}>
      <style>{`
        @media (max-width: 536px) {
          .course-filter-nav {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding: 8px 12px !important;
            padding-bottom: 12px !important; /* Space for scrollbar */
          }
          .course-filter-nav::-webkit-scrollbar {
            height: 4px;
          }
          .course-filter-nav::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .course-filter-nav::-webkit-scrollbar-thumb {
            background: #FF6B00;
            border-radius: 10px;
          }
          .course-filter-nav button {
            flex-shrink: 0;
          }
        }
      `}</style>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <motion.button
            key={f.key}
            onClick={() => onChange(f.key)}
            whileHover={!isActive ? { background: "var(--color-bg-subtle)", borderColor: "var(--color-border)" } : {}}
            style={{
              padding: "7px 18px",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              background: "transparent",
              color: isActive ? "white" : "var(--color-text-muted)",
              border: isActive ? "1.5px solid transparent" : "1.5px solid var(--color-border)",
              borderRadius: 10,
              transition: "color 0.2s, background 0.2s, border-color 0.2s",
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 36,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#FF6B00",
                  borderRadius: 8,
                  zIndex: -1,
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            {f.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default CourseCard;