// src/components/common/SAStatCard/SAStatCard.tsx
// Reusable stat card for SuperAdmin pages.
// Hover: gradient orange overlay wipes in left-to-right, all text transitions to white.

import "./SAStatCard.css";

export interface SAStatCardProps {
  /** Card label / title (uppercased internally) */
  label: string;
  /** Primary numeric value */
  value: number | string;
  /** Icon node rendered in the icon bubble */
  icon: React.ReactNode;
  /** Small subtitle below the value */
  sub?: React.ReactNode;
  /** Override subtitle color in resting state (default #FF6B00) */
  subColor?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const SAStatCard = ({ label, value, icon, sub, subColor = "#FF6B00", onClick }: SAStatCardProps) => (
  <div
    className="sa-stat-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    {/* Left: text — sits above the sliding overlay */}
    <div className="sa-stat-card__body">
      <div className="sa-stat-card__label">{label}</div>
      <div className="sa-stat-card__value">{value}</div>
      {sub && (
        <div
          className="sa-stat-card__sub"
          style={{ "--sub-color": subColor } as React.CSSProperties}
        >
          {sub}
        </div>
      )}
    </div>

    {/* Right: icon bubble */}
    <div className="sa-stat-card__icon-wrap">
      {icon}
    </div>
  </div>
);

export default SAStatCard;
