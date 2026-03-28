// src/pages/SuperAdmin/Courses/components/CourseCard.jsx

import { useState } from "react";

const ProgressBar = ({ value, color = "#FF6B00" }) => (
  <div style={{ height: 6, background: "#e8e8e8", borderRadius: 99, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 99,
      width: `${Math.min(value, 100)}%`,
      background: color,
      transition: "width .4s ease",
    }} />
  </div>
);

const CourseCard = ({ course, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const isPending = course.status === "pending";

  return (
    <div
      onClick={() => onClick(course)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,.13), 0 2px 8px rgba(0,0,0,.06)"
          : "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
        cursor: "pointer",
        transition: "box-shadow .2s ease, transform .2s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        // Gray overlay filter for pending courses
        filter: isPending ? "grayscale(0.3)" : "none",
        opacity: isPending ? 0.85 : 1,
      }}
    >
      {/* Thumbnail with orange gradient overlay */}
      <div style={{
        position: "relative",
        height: 140,
        background: course.thumbColor || "#e8c9a0",
        overflow: "hidden",
      }}>
        {/* Orange gradient overlay on top of image */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(255,107,0,0.18) 0%, rgba(255,107,0,0.42) 100%)",
          zIndex: 1,
        }} />

        {/* Gray overlay for pending */}
        {isPending && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(180,180,180,0.38)",
            zIndex: 2,
          }} />
        )}

        {/* Placeholder person SVG */}
        <svg viewBox="0 0 300 140" width="100%" height="140" style={{ display: "block" }}>
          <rect width="300" height="140" fill={course.thumbColor || "#e8c9a0"} />
          {/* Stylized silhouette */}
          <circle cx="150" cy="48" r="22" fill="rgba(255,255,255,0.25)" />
          <ellipse cx="150" cy="108" rx="40" ry="28" fill="rgba(255,255,255,0.18)" />
        </svg>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px" }}>
        {/* Title */}
        <div style={{
          fontSize: 15, fontWeight: 700, color: "#222",
          marginBottom: 4, lineHeight: 1.3,
        }}>
          {course.title}
        </div>

        {/* Meta */}
        <div style={{
          fontSize: 12, color: "#888", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
        }}>
          <span>{course.modules} Modules</span>
          <span>·</span>
          <span>{course.units} Units</span>
          <span>·</span>
          <span style={{ color: "#FF6B00", fontWeight: 600 }}>
            {course.enrolled} Enrolled
          </span>
        </div>

        {/* Pending badge OR progress bar */}
        {isPending ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f5f5f0", borderRadius: 8,
            padding: "7px 10px", marginBottom: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>
              Waiting for approval — not yet available for users
            </span>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 5,
            }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>Avg. completion</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>
                {course.avgCompletion}%
              </span>
            </div>
            <ProgressBar value={course.avgCompletion} />
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px solid #f5f5f5",
        }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>
            Created by <span style={{ color: "#555", fontWeight: 600 }}>{course.createdBy}</span>
          </span>
          <button
            onClick={e => { e.stopPropagation(); onClick(course); }}
            style={{
              background: "#FF6B00", color: "#fff",
              border: "none", borderRadius: 20,
              padding: "6px 14px", fontSize: 12,
              fontWeight: 700, cursor: "pointer",
              fontFamily: "'Barlow', sans-serif",
              transition: "opacity .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            view details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
