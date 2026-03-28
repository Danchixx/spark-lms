import React from "react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "rgba(39, 174, 96, 0.12)", color: "#27ae60" },
  Verified: { bg: "rgba(39, 174, 96, 0.12)", color: "#27ae60" },
  Ongoing: { bg: "rgba(255, 107, 0, 0.12)", color: "#FF6B00" },
  "Not Started": { bg: "rgba(107, 114, 128, 0.12)", color: "#6b7280" },
  "Not Earned Yet": { bg: "rgba(107, 114, 128, 0.12)", color: "#6b7280" },
};

type StatusBadgeProps = {
  status: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const StatusBadge = ({ status, children, style = {} }: StatusBadgeProps) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["Not Started"]!;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: s.bg,
        color: s.color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        ...style
      }}
    >
      {children || status}
    </span>
  );
};

export default StatusBadge;
