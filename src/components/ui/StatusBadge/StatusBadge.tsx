import React from "react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "#E0EFE5", color: "#0E5E4A" },
  Verified: { bg: "#E0EFE5", color: "#0E5E4A" },
  Ongoing: { bg: "#FDF1CC", color: "#8A5E00" },
  "Not Started": { bg: "#F0F0F0", color: "#324B6E" },
  "Not Earned Yet": { bg: "#F0F0F0", color: "#324B6E" },
};

type StatusBadgeProps = {
  status: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const StatusBadge = ({ status, children, style = {} }: StatusBadgeProps) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
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
