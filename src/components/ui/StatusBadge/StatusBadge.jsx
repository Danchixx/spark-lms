const STATUS_STYLES = {
  Completed: { bg: "#d4edda", color: "#155724" },
  Ongoing: { bg: "#fff3cd", color: "#856404" },
  "Not Started": { bg: "#f0f0f0", color: "#555" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
