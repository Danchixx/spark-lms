import React from "react";
import { useSATheme } from "../SAThemeContext";
import { getStableTenantColor, getTenantColorStyles } from "./tenantColors";

/* ── 1. PageContainer ── */
export const PageContainer = ({ children, style = {} }) => (
  <div
    className="sa-page-container"
    style={{
      maxWidth: 1500,
      margin: "0 auto",
      padding: "var(--space-6, 24px)",
      boxSizing: "border-box",
      color: "var(--text)",
      width: "100%",
      ...style,
    }}
  >
    <style>{`
      @media (max-width: 640px) {
        .sa-page-container {
          padding: var(--space-4, 16px) !important;
        }
      }
    `}</style>
    {children}
  </div>
);

/* ── 2. PageHeading ── */
export const PageHeading = ({ greeting, title, subtitle, actions, backButton, style = {} }) => (
  <div
    className="sa-page-heading"
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-4, 16px)",
      flexWrap: "wrap",
      marginBottom: "var(--space-5, 20px)",
      ...style,
    }}
  >
    <style>{`
      @media (max-width: 700px) {
        .sa-page-heading {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .sa-page-heading-actions {
          width: 100% !important;
          display: flex !important;
          justifyContent: flex-start !important;
          margin-top: 8px !important;
        }
      }
    `}</style>
    <div>
      {backButton && <div style={{ marginBottom: 8 }}>{backButton}</div>}
      {greeting && (
        <small style={{ color: "var(--muted)", display: "block", fontSize: 13, marginBottom: 2 }}>
          {greeting}
        </small>
      )}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-.01em",
          lineHeight: 1.2,
          margin: 0,
          color: "var(--text)",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4, margin: "4px 0 0 0" }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="sa-page-heading-actions">{actions}</div>}
  </div>
);

/* ── 3. StatGrid & StatCard ── */
export const StatGrid = ({ children, columns = 4, style = {} }) => (
  <section
    className="sa-stat-grid"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "var(--space-4, 16px)",
      marginBottom: "var(--space-5, 20px)",
      ...style,
    }}
  >
    <style>{`
      @media (max-width: 1000px) {
        .sa-stat-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      @media (max-width: 640px) {
        .sa-stat-grid {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }
      }
    `}</style>
    {children}
  </section>
);

export const StatCard = ({
  label,
  value,
  sub,
  subColor,
  icon,
  onClick,
  style = {},
}) => (
  <div
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
    style={{
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      cursor: onClick ? "pointer" : "default",
      transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
      ...style,
    }}
    onMouseEnter={onClick ? (e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "var(--shadow, 0 8px 20px rgba(0,0,0,0.1))";
    } : undefined}
    onMouseLeave={onClick ? (e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    } : undefined}
  >
    <div>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      <strong
        style={{
          display: "block",
          fontSize: 34,
          fontWeight: 800,
          margin: "6px 0 2px",
          lineHeight: 1.1,
          color: "var(--text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </strong>
      {sub && (
        <em
          style={{
            fontStyle: "normal",
            fontSize: 11,
            fontWeight: 600,
            color: subColor || "var(--accent-text)",
          }}
        >
          {sub}
        </em>
      )}
    </div>
    {icon && (
      <div style={{ color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, opacity: 0.9 }}>
        {icon}
      </div>
    )}
  </div>
);

/* ── 4. MainGrid (Left Column 1fr + Right Column 320px) ── */
export const MainGrid = ({ children, style = {} }) => (
  <div
    className="sa-main-grid-layout"
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 320px",
      gap: "var(--space-4, 16px)",
      alignItems: "start",
      ...style,
    }}
  >
    <style>{`
      @media (max-width: 1200px) {
        .sa-main-grid-layout {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
    {children}
  </div>
);

/* ── 5. Card, CardHeader, CardFooter ── */
export const Card = ({ children, style = {}, className = "" }) => (
  <section
    className={`sa-card-surface ${className}`}
    style={{
      background: "var(--card)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </section>
);

export const CardHeader = ({ title, count, actions, action, style = {} }) => {
  const headerActions = actions || action;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "18px 20px 12px",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text)" }}>{title}</h2>
        {count !== undefined && (
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
            {count}
          </span>
        )}
      </div>
      {headerActions && <div>{headerActions}</div>}
    </div>
  );
};

export const CardFooter = ({ children, style = {} }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      borderTop: "1px solid var(--line)",
      color: "var(--muted)",
      fontSize: 12,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── 6. Table Primitives ── */
export const TableHeader = ({ columns = [], style = {}, className = "" }) => (
  <div
    className={`sa-table-header ${className}`}
    style={{
      display: "grid",
      gap: 14,
      alignItems: "center",
      padding: "0 20px",
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--muted)",
      height: 44,
      background: "var(--card-2)",
      borderTop: "1px solid var(--line)",
      borderBottom: "1px solid var(--line)",
      letterSpacing: ".03em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {columns.map((col, idx) => (
      <span key={idx} style={col.style || {}}>
        {col.label}
      </span>
    ))}
  </div>
);

export const TableRow = ({
  children,
  onClick,
  isLast = false,
  selected = false,
  className = "",
  style = {},
}) => (
  <div
    className={`sa-table-row ${className}`}
    onClick={onClick}
    role={onClick ? "row" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
    style={{
      display: "grid",
      gap: 14,
      alignItems: "center",
      padding: "14px 20px",
      borderBottom: isLast ? "none" : "1px solid var(--line)",
      cursor: onClick ? "pointer" : "default",
      transition: "background .12s ease",
      minHeight: 68,
      background: selected ? "var(--accent-soft)" : "transparent",
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!selected) e.currentTarget.style.background = "var(--card-2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = selected ? "var(--accent-soft)" : "transparent";
    }}
  >
    {children}
  </div>
);

/* ── 7. Pill ── */
export const Pill = ({ variant = "default", children, style = {} }) => {
  const norm = String(variant).toLowerCase();
  let bg = "var(--card-2)";
  let color = "var(--muted)";
  let border = "1px solid var(--line)";

  if (norm === "active" || norm === "reactivated") {
    bg = "var(--green-soft)";
    color = "var(--green)";
    border = "none";
  } else if (norm === "pending") {
    bg = "var(--amber-soft)";
    color = "var(--amber)";
    border = "none";
  } else if (norm === "suspended") {
    bg = "var(--gold-soft)";
    color = "var(--gold)";
    border = "none";
  } else if (norm === "banned" || norm === "inactive" || norm === "rejected") {
    bg = "var(--red-soft)";
    color = "var(--red)";
    border = "none";
  } else if (norm === "institute") {
    bg = "var(--accent-soft)";
    color = "var(--accent-text)";
    border = "none";
  } else if (norm === "enterprise") {
    bg = "var(--red-soft)";
    color = "var(--red)";
    border = "none";
  } else if (norm === "personal") {
    bg = "var(--card-2)";
    color = "var(--muted)";
    border = "1px solid var(--line)";
  }

  return (
    <span
      style={{
        background: bg,
        color: color,
        border: border,
        fontSize: 11.5,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: 999,
        display: "inline-block",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/* ── 8. TenantLogo & TenantTag ── */
export const TenantLogo = ({ name, abbr, color, id, size = 36, imgUrl }) => {
  const { theme } = useSATheme();
  const isDark = theme === "dark";
  const safeColor = color || getStableTenantColor(id);
  const styles = getTenantColorStyles(safeColor, isDark);
  const text = (abbr || name || "?").slice(0, 5).toUpperCase();

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={name || "Tenant"}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: styles.bg,
        border: styles.border,
        color: styles.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(9, Math.floor(size * 0.28)),
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {text}
    </div>
  );
};

export const TenantTag = ({ name, color, id, style = {} }) => {
  const { theme } = useSATheme();
  const isDark = theme === "dark";
  const safeColor = color || getStableTenantColor(id);
  const colorStyles = getTenantColorStyles(safeColor, isDark);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 12,
        fontWeight: 600,
        padding: "5px 10px",
        borderRadius: 8,
        background: colorStyles.bg,
        color: colorStyles.text,
        border: colorStyles.border,
        maxWidth: "100%",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        ...style,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: safeColor,
          flex: "none",
        }}
      />
      {name}
    </span>
  );
};

/* ── 9. StatusAndDateCell ── */
export const StatusAndDateCell = ({ status, date, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
    <div>
      <Pill variant={status}>{status}</Pill>
    </div>
    {date && (
      <div style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
        {date}
      </div>
    )}
  </div>
);

/* ── 10. Chip (Filter Chips) ── */
export const Chip = ({ label, count, active, onClick, color }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: "1px solid",
      borderColor: active ? "var(--accent)" : "var(--line)",
      background: active ? "var(--accent-soft)" : "var(--bg)",
      color: active ? "var(--accent-text)" : "var(--muted)",
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 12.5,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all .15s ease",
    }}
  >
    {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
    {label}
    {count !== undefined && (
      <i
        style={{
          fontStyle: "normal",
          background: "var(--card-2)",
          color: "var(--text)",
          borderRadius: 999,
          padding: "1px 7px",
          fontSize: 11,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </i>
    )}
  </button>
);

/* ── 11. Field (Input & Select) ── */
export const Field = ({ children, style = {} }) => (
  <div style={{ position: "relative", ...style }}>{children}</div>
);

export const Select = ({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  "aria-label": ariaLabel,
  style = {},
}) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%", ...style }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        appearance: "none",
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "0 32px 0 12px",
        height: 38,
        fontSize: 13,
        color: "var(--text)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        outline: "none",
        width: "100%",
        opacity: disabled ? 0.5 : 1,
        boxSizing: "border-box",
        transition: "border-color .15s ease",
      }}
    >
      {placeholder && <option value="" style={{ background: "var(--card)", color: "var(--muted)" }}>{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "var(--card)", color: "var(--text)" }}>
          {o.label}
        </option>
      ))}
    </select>
    <svg
      style={{ position: "absolute", right: 10, pointerEvents: "none", stroke: "var(--muted)" }}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);

/* ── 12. Buttons ── */
export const PrimaryButton = ({ children, onClick, icon, style = {}, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 16px",
      height: 38,
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 13,
      background: "var(--accent)",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      transition: "filter .15s ease",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {icon}
    {children}
  </button>
);

export const GhostButton = ({ children, onClick, icon, style = {}, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      height: 38,
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 13,
      background: "var(--card)",
      color: "var(--text)",
      border: "1px solid var(--line)",
      cursor: "pointer",
      transition: "background .15s ease",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {icon}
    {children}
  </button>
);

export const IconButton = ({
  children,
  onClick,
  title,
  "aria-label": ariaLabel,
  size = 34,
  variant = "default",
  style = {},
}) => {
  const isDanger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || title}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 9,
        border: "1px solid var(--line)",
        background: "var(--card)",
        color: isDanger ? "var(--red)" : "var(--text)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background .15s ease, border-color .15s ease, color .15s ease",
        padding: 0,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isDanger) {
          e.currentTarget.style.background = "var(--red-soft)";
          e.currentTarget.style.borderColor = "var(--red)";
        } else {
          e.currentTarget.style.background = "var(--card-2)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--card)";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      {children}
    </button>
  );
};

/* ── 13. SideListRow & ProgressBar ── */
export const SideListRow = ({
  icon,
  title,
  meta,
  badge,
  barProgress,
  barColor,
  onClick,
  style = {},
}) => (
  <div
    onClick={onClick}
    style={{
      padding: "10px 0",
      borderBottom: "1px solid var(--line)",
      cursor: onClick ? "pointer" : "default",
      transition: "background .12s ease",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
          {meta && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{meta}</div>}
        </div>
      </div>
      {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
    </div>
    {barProgress !== undefined && (
      <div style={{ marginTop: 8 }}>
        <ProgressBar progress={barProgress} color={barColor} />
      </div>
    )}
  </div>
);

export const ProgressBar = ({ progress = 0, color = "var(--accent)", height = 6 }) => {
  const safeP = Math.max(0, Math.min(100, progress));
  return (
    <div
      style={{
        width: "100%",
        height: height,
        borderRadius: 99,
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${safeP}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
};

/* ── 14. EmptyState ── */
export const EmptyState = ({ icon, title, description, action }) => (
  <div style={{ padding: "56px 20px", textAlign: "center", color: "var(--muted)" }}>
    {icon && (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--green)" }}>
        {icon}
      </div>
    )}
    <b style={{ display: "block", color: "var(--text)", fontSize: 16, margin: "0 0 6px" }}>
      {title}
    </b>
    {description && (
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)" }}>
        {description}
      </p>
    )}
    {action && <div>{action}</div>}
  </div>
);
