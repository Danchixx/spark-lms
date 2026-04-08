import Skeleton from "../../ui/Skeleton/Skeleton";

/**
 * CourseCardSkeleton
 * Mimics the layout of the CourseCard component for loading states.
 */
const CourseCardSkeleton = () => {
  return (
    <div style={{
      background: "var(--color-surface)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "var(--shadow)",
      border: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      height: 320, // Match the height used in the original Skeleton call
    }}>
      {/* Image Area placeholder */}
      <Skeleton height={160} borderRadius="0" />

      {/* Body Area */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Title */}
        <Skeleton height={18} width="85%" borderRadius={4} />
        
        {/* Stats (Modules/Lessons) */}
        <Skeleton height={14} width="60%" borderRadius={4} />

        {/* Progress Section */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <Skeleton height={10} width="40px" borderRadius={2} />
            <Skeleton height={10} width="30px" borderRadius={2} />
          </div>
          <Skeleton height={6} width="100%" borderRadius={99} />
        </div>

        {/* Footer strip placeholder */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          marginLeft: -16,
          marginRight: -16,
          marginBottom: -14,
          padding: "10px 16px",
          background: "var(--color-bg-subtle)",
          borderTop: "1px solid var(--color-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Skeleton variant="circular" width={14} height={14} />
            <Skeleton height={12} width="100px" borderRadius={2} />
          </div>
          <Skeleton height={28} width={70} borderRadius={99} />
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
