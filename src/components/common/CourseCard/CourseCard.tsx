import { Pin, Trophy } from "lucide-react";
import Button from "../../ui/Button/Button";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";



/* ── Progress bar ── */
const Bar = ({ value, color }) => (
  <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.max(0, value)}%`, background: color, borderRadius: 99, transition: "width 0.3s" }} />
  </div>
);

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

/**
 * CourseCard
 * Props: course { id, name, modules, units, status, progress, assignedBy, icon }
 */
const CourseCard = ({ course }) => {
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
      background: "white", borderRadius: 12,
      overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      border: "1px solid #ebebeb",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"; }}
    >
      {/* Orange image area */}
      <div style={{ position: "relative", height: 120, background: "linear-gradient(180deg, #ffb152, #FF8C00, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <StatusBadge 
          status={course.status} 
          style={{ position: "absolute", top: 10, left: 10, fontSize: 10, padding: "2px 8px" }} 
        />
        <div style={{ fontSize: 52, opacity: 0.85 }}>{course.icon}</div>
      </div>

      {/* White body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", lineHeight: 1.3 }}>{course.name}</div>
        <div style={{ fontSize: 12, color: "#888" }}>{course.modulesCount} Modules · {course.unitsCount} Lessons</div>

        {/* Progress */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#888" }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isCompleted ? "#27ae60" : "#FF6B00" }}>{progressDisplay}</span>
          </div>
          <Bar value={isNotStarted ? 0 : course.progress} color={barColor} />
        </div>

        {/* Gray footer strip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 10, marginLeft: -16, marginRight: -16, marginBottom: -14,
          padding: "10px 16px",
          background: "#f6f6f6",
          borderTop: "1px solid #ebebeb",
        }}>
          {isCompleted ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888" }}>
              <Trophy size={13} color="#f39c12" /> Certificate Earned
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888" }}>
              <Pin size={12} color="#aaa" /> Assigned by {course.assignedBy}
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

/* ── Filter Nav ── */
export const CourseFilterNav = ({ counts, active, onChange }) => {
  const filters = [
    { key: "All", label: `All (${counts.all})` },
    { key: "Ongoing", label: `Ongoing (${counts.ongoing})` },
    { key: "Completed", label: `Completed (${counts.completed})` },
    { key: "Not Started", label: `Not Started (${counts.notStarted})` },
  ];

  return (
    <div style={{
      display: "inline-flex", flexWrap: "wrap", gap: 8,
      marginBottom: 24,
      background: "white",
      border: "1.5px solid #e0e0e0",
      borderRadius: 16,
      padding: "8px 10px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            style={{
              padding: "7px 18px",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              background: isActive ? "#FF6B00" : "white",
              color: isActive ? "white" : "#666",
              border: isActive ? "none" : "1.5px solid #e0e0e0",
              borderRadius: 10,
              transition: "all 0.15s",
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
};

export default CourseCard;