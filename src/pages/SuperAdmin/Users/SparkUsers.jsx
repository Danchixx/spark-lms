// src/pages/SuperAdmin/Users/SparkUsers.jsx
// All users across all tenant companies — search, filter, suspend, ban, reactivate

import { useState, useMemo, useEffect } from "react";
import { MOCK_ALL_USERS, COMPANIES_LIST, DEPARTMENTS_LIST } from "../../../data/mockUsers";
import { useSATheme } from "../SAThemeContext";
import { StatusAndDateCell } from "../components/SALayout";
import { getTenantColorStyles } from "../components/tenantColors";
import PageTransition from "../../../components/common/PageTransition";

const ITEMS_PER_PAGE = 8;

// ─────────────────────────────────────────────────────────────
// Dropdown select with dark mode support
// ─────────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder, isDark }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        background: "var(--bg)",
        border: "1.5px solid var(--line)",
        borderRadius: 10,
        padding: "9px 32px 9px 12px",
        fontSize: 13,
        color: value ? "var(--text)" : "var(--faint)",
        cursor: "pointer",
        fontFamily: "'Barlow', sans-serif",
        outline: "none",
        width: "100%",
        colorScheme: isDark ? "dark" : "light",
        transition: "border-color .2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
    >
      {placeholder && (
        <option value="" style={{ background: "var(--card)", color: "var(--muted)" }}>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "var(--card)", color: "var(--text)" }}>
          {o.label}
        </option>
      ))}
    </select>
    <svg
      style={{ position: "absolute", right: 10, pointerEvents: "none" }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Stat summary cards (top of page)
// ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, topBorderColor, icon, sub, subColor }) => (
  <div
    style={{
      background: "var(--card)",
      borderRadius: 14,
      border: "1px solid var(--line)",
      borderTop: `3px solid ${topBorderColor || accent}`,
      boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: subColor || "var(--green)", fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: `color-mix(in srgb, ${accent} 14%, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Reason modal (suspend / ban)
// ─────────────────────────────────────────────────────────────
const ReasonModal = ({ actionLabel, actionColor, onConfirm, onCancel, theme }) => {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("1 week");
  const isSuspend = actionLabel === "Suspend";
  const isDark = theme === "dark";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      onClick={onCancel}
      data-sa-theme={theme}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          width: 440,
          maxWidth: "90vw",
          padding: 28,
          boxShadow: "var(--shadow, 0 20px 60px rgba(0,0,0,.45))",
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 20,
            color: "var(--text)",
            marginBottom: 6,
          }}
        >
          {isSuspend ? "Suspend User" : "Ban User"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
          {isSuspend
            ? "The user will temporarily lose access. You can reactivate them later."
            : "The user will be permanently blocked from the system."}
        </div>

        {isSuspend && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Duration
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["1 week", "2 weeks", "1 month", "3 months"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1.5px solid ${duration === d ? "var(--accent)" : "var(--line)"}`,
                    background: duration === d ? "var(--accent-soft)" : "var(--card-2)",
                    color: duration === d ? "var(--accent-text)" : "var(--text)",
                    fontFamily: "'Barlow', sans-serif",
                    transition: "all .15s",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: ".08em",
            }}
          >
            Reason <span style={{ color: "var(--red)" }}>*</span>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Why is this user being ${isSuspend ? "suspended" : "banned"}?`}
            style={{
              width: "100%",
              height: 88,
              padding: "10px 14px",
              border: "1.5px solid var(--line)",
              background: "var(--bg)",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "'Barlow', sans-serif",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              color: "var(--text)",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "var(--card-2)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm({ reason, duration })}
            style={{
              flex: 1,
              padding: "10px 0",
              background: reason.trim() ? actionColor : "var(--card-2)",
              color: reason.trim()
                ? actionColor === "var(--gold)" && isDark
                  ? "#1e1e1e"
                  : "#fff"
                : "var(--muted)",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: reason.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Barlow', sans-serif",
              transition: "background .2s",
            }}
          >
            Confirm {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// User profile modal sub-components (declared outside render)
// ─────────────────────────────────────────────────────────────
const ResultScreen = ({ action }) => {
  const map = {
    suspended: { bg: "var(--gold)", label: "User suspended." },
    banned: { bg: "var(--red-strong)", label: "User banned." },
    reactivated: { bg: "var(--green)", label: "User reactivated!" },
  };
  const { bg, label } = map[action] || {};
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "28px 0",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {action === "banned" ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : action === "suspended" ? (
            <>
              <line x1="12" y1="5" x2="12" y2="12" />
              <circle cx="12" cy="16" r="1" fill="#fff" />
            </>
          ) : (
            <polyline points="20 6 9 17 4 12" />
          )}
        </svg>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{label}</div>
    </div>
  );
};

const ModalField = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
    <div
      style={{
        background: "var(--card-2)",
        borderRadius: 6,
        padding: "9px 12px",
        fontSize: 13,
        color: "var(--text)",
        border: "1px solid var(--line)",
        minHeight: 36,
      }}
    >
      {value || "—"}
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div
    style={{
      fontWeight: 800,
      fontSize: 13,
      letterSpacing: ".06em",
      color: "var(--text)",
      marginBottom: 12,
      textTransform: "uppercase",
    }}
  >
    {title}
  </div>
);

const UserManageModal = ({ user, onClose, onSuspend, onBan, onReactivate, theme }) => {
  const [action, setAction] = useState(null);
  const [showReason, setShowReason] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const canSuspend = ["Active", "Reactivated"].includes(user.status);
  const canBan = user.status !== "Banned";
  const canReactivate = user.status === "Suspended";

  const handleSuspend = ({ reason, duration }) => {
    setShowReason(null);
    setAction("suspended");
    setTimeout(() => {
      onSuspend(user, reason, duration);
      onClose();
    }, 1200);
  };
  const handleBan = ({ reason }) => {
    setShowReason(null);
    setAction("banned");
    setTimeout(() => {
      onBan(user, reason);
      onClose();
    }, 1200);
  };
  const handleReactivate = () => {
    setAction("reactivated");
    setTimeout(() => {
      onReactivate(user);
      onClose();
    }, 1200);
  };

  return (
    <>
      <div
        onClick={onClose}
        data-sa-theme={theme}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.6)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--card)",
            borderRadius: 14,
            border: "1px solid var(--line)",
            width: "min(820px, 96vw)",
            maxHeight: "92vh",
            overflow: "hidden",
            boxShadow: "var(--shadow, 0 24px 80px rgba(0,0,0,.4))",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {action ? (
            <div style={{ padding: 48 }}>
              <ResultScreen action={action} />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  flex: 1,
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                {/* LEFT — Brand orange gradient panel */}
                <div
                  style={{
                    background: "linear-gradient(160deg, #FF8C00 0%, #FF6B00 50%, #e85d00 100%)",
                    padding: "24px 18px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,.15)",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "4px solid #fff",
                      boxShadow: "0 4px 16px rgba(0,0,0,.2)",
                    }}
                  >
                    <svg viewBox="0 0 150 150" width="150" height="150">
                      <rect width="150" height="150" fill="rgba(0,0,0,0.15)" />
                      <circle cx="75" cy="55" r="28" fill="rgba(255,255,255,0.35)" />
                      <ellipse cx="75" cy="135" rx="48" ry="32" fill="rgba(255,255,255,0.35)" />
                    </svg>
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>
                      username
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,.95)",
                        borderRadius: 6,
                        padding: "8px 10px",
                        fontSize: 13,
                        color: "#1e293b",
                        boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                      }}
                    >
                      {user.username || "—"}
                    </div>
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>
                      password
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,.95)",
                        borderRadius: 6,
                        padding: "8px 10px",
                        fontSize: 13,
                        color: "#1e293b",
                        boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                      }}
                    >
                      {user.password || "—"}
                    </div>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <span
                      style={{
                        background: "rgba(255,255,255,.25)",
                        color: "#fff",
                        padding: "4px 14px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* RIGHT — Personal info + Contact + Access control */}
                <div
                  style={{
                    background: "var(--card)",
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    overflowY: "auto",
                  }}
                >
                  {/* Personal info */}
                  <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "14px 16px", background: "var(--card)" }}>
                    <SectionTitle title="Personal Information" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <ModalField label="Last Name" value={user.lastName} />
                      <ModalField label="First Name" value={user.firstName} />
                      <ModalField label="Middle Name" value={user.middleName} />
                      <ModalField label="Employee ID" value={user.employeeId} />
                      <ModalField label="Date of Birth" value={user.dateOfBirth} />
                      <ModalField label="Job Title" value={user.jobTitle} />
                      <ModalField label="Gender" value={user.gender} />
                      <ModalField label="Department" value={user.department} />
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "14px 16px", background: "var(--card)" }}>
                    <SectionTitle title="Contact" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <ModalField label="Email" value={user.email} />
                      <ModalField label="Number" value={user.phone} />
                    </div>
                  </div>

                  {/* Access Control */}
                  <div
                    style={{
                      border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                      background: "var(--accent-soft)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--accent-text)",
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Access Control
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {canReactivate && (
                          <button
                            onClick={handleReactivate}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "'Barlow', sans-serif",
                              background: "var(--green)",
                              color: "#fff",
                              border: "none",
                              transition: "opacity .15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            ✓ Reactivate
                          </button>
                        )}
                        {canSuspend && (
                          <button
                            onClick={() => setShowReason("suspend")}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "'Barlow', sans-serif",
                              background: "var(--gold-soft)",
                              color: "var(--gold)",
                              border: "1.5px solid var(--gold)",
                              transition: "background .15s",
                            }}
                          >
                            ⏸ Suspend
                          </button>
                        )}
                        {canBan && (
                          <button
                            onClick={() => setShowReason("ban")}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "'Barlow', sans-serif",
                              background: "var(--red-soft)",
                              color: "var(--red)",
                              border: "1.5px solid var(--red)",
                              transition: "background .15s",
                            }}
                          >
                            🚫 Ban
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                      {canSuspend && "Suspend temporarily removes access. Ban permanently blocks the user."}
                      {canReactivate && "Reactivating will restore this user's access to the system."}
                      {user.status === "Banned" && "This user has been permanently banned from the system."}
                    </div>

                    {(user.suspendReason || user.banReason) && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "8px 12px",
                          background: "var(--card)",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          fontSize: 12,
                          color: "var(--text)",
                        }}
                      >
                        <span style={{ color: "var(--muted)", marginRight: 6 }}>
                          {user.suspendReason ? "Suspend reason:" : "Ban reason:"}
                        </span>
                        {user.suspendReason || user.banReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "12px 22px",
                  background: "var(--card)",
                  borderTop: "1px solid var(--line)",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    padding: "9px 28px",
                    background: "var(--card-2)",
                    color: "var(--text)",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showReason === "suspend" && (
        <ReasonModal
          actionLabel="Suspend"
          actionColor="var(--gold)"
          onConfirm={handleSuspend}
          onCancel={() => setShowReason(null)}
          theme={theme}
        />
      )}
      {showReason === "ban" && (
        <ReasonModal
          actionLabel="Ban"
          actionColor="var(--red-strong)"
          onConfirm={handleBan}
          onCancel={() => setShowReason(null)}
          theme={theme}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Main SparkUsers page
// ─────────────────────────────────────────────────────────────
const SparkUsers = () => {
  const { theme } = useSATheme();
  const isDark = theme === "dark";

  const [users, setUsers] = useState(MOCK_ALL_USERS);
  const [manageUser, setManageUser] = useState(null);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [companyFilter, setCompany] = useState("");
  const [deptFilter, setDept] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [dateFilter, setDate] = useState("");

  const filtered = useMemo(() => {
    let r = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.employeeId?.toLowerCase().includes(q)
      );
    }
    if (companyFilter) r = r.filter((u) => u.companyId === Number(companyFilter));
    if (deptFilter) r = r.filter((u) => u.department === deptFilter);
    if (statusFilter) r = r.filter((u) => u.status === statusFilter);
    if (dateFilter) {
      const now = new Date();
      const days = Number(dateFilter);
      r = r.filter((u) => {
        if (!u.approvedOn) return false;
        const approved = new Date(u.approvedOn);
        return (now - approved) / 86400000 <= days;
      });
    }
    return r;
  }, [users, search, companyFilter, deptFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Stats
  const total = users.length;
  const active = users.filter((u) => u.status === "Active" || u.status === "Reactivated").length;
  const pending = users.filter((u) => u.status === "Pending").length;
  const suspended = users.filter((u) => u.status === "Suspended").length;
  const banned = users.filter((u) => u.status === "Banned").length;

  const updateUser = (id, patch) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const handleSuspend = (u, reason, duration) =>
    updateUser(u.id, { status: "Suspended", suspendReason: reason, suspendDuration: duration });
  const handleBan = (u, reason) =>
    updateUser(u.id, { status: "Banned", banReason: reason });
  const handleReactivate = (u) =>
    updateUser(u.id, { status: "Reactivated", suspendReason: null });

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, "...", totalPages];
    if (safePage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  const pgBtn = (disabled) => ({
    minWidth: 32,
    height: 32,
    padding: "0 10px",
    border: "1px solid var(--line)",
    background: "var(--card)",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12,
    fontWeight: 500,
    color: disabled ? "var(--faint)" : "var(--muted)",
    opacity: disabled ? 0.4 : 1,
    fontFamily: "'Barlow', sans-serif",
  });

  const hasFilters = companyFilter || deptFilter || statusFilter || dateFilter || search;

  // Helper for Section 4 item 8: date the CURRENT status began
  const getUserStatusDate = (user) => {
    // (a) Specific status date if present in data
    if (user.status === "Suspended" && user.suspendedDate) return user.suspendedDate;
    if (user.status === "Banned" && user.bannedDate) return user.bannedDate;
    if (user.statusChangedDate) return user.statusChangedDate;

    // (b) Otherwise approved date, with "Approved " prefix for Suspended and Banned rows
    if (user.status === "Suspended" || user.status === "Banned") {
      if (user.approvedOn) return `Approved ${user.approvedOn}`;
    } else if (user.status === "Active" || user.status === "Reactivated") {
      if (user.approvedOn) return user.approvedOn;
    }

    // (c) For Pending rows, createdOn if exists, else dash in --faint
    if (user.status === "Pending") {
      if (user.createdOn) return user.createdOn;
      return <span style={{ color: "var(--faint)" }}>—</span>;
    }

    if (user.approvedOn) return user.approvedOn;
    if (user.createdOn) return user.createdOn;
    return <span style={{ color: "var(--faint)" }}>—</span>;
  };

  return (
    <PageTransition>
      <div
      style={{
        padding: 24,
        minHeight: "100%",
        background: "var(--bg)",
        fontFamily: "'Barlow', sans-serif",
        color: "var(--text)",
      }}
    >
      {/* ── Page title ── */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 26,
            color: "var(--text)",
            textTransform: "uppercase",
            letterSpacing: ".05em",
          }}
        >
          USER MANAGEMENT
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
          All users across all tenant companies
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          label="Total Users"
          value={total}
          accent="var(--accent)"
          topBorderColor="var(--accent)"
          sub={`↑ ${Math.floor(total * 0.12)} this month`}
          subColor="var(--green)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Active"
          value={active}
          accent="var(--green)"
          topBorderColor="var(--green)"
          sub={`↑ ${Math.floor(active * 0.15)} this week`}
          subColor="var(--accent-text)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="Pending"
          value={pending}
          accent="var(--amber)"
          topBorderColor="var(--amber)"
          sub={`${pending} awaiting review`}
          subColor="var(--amber)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Suspended"
          value={suspended}
          accent="var(--gold)"
          topBorderColor="var(--gold)"
          sub={suspended > 0 ? `${suspended} temporarily blocked` : "None suspended"}
          subColor="var(--gold)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
          }
        />
        <StatCard
          label="Banned"
          value={banned}
          accent="var(--red-strong)"
          topBorderColor="var(--red-strong)"
          sub={banned > 0 ? `${banned} permanently blocked` : "None banned"}
          subColor="var(--red)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          }
        />
      </div>

      {/* ── Search + Filters ── */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: 14,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
          padding: "16px 20px",
          marginBottom: 16,
        }}
      >
        {/* Row 1 — Search */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Search Users
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg)",
              border: "1.5px solid var(--line)",
              borderRadius: 10,
              padding: "9px 14px",
              gap: 10,
              transition: "border-color .2s",
            }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, username, or employee ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 13,
                fontFamily: "'Barlow', sans-serif",
                color: "var(--text)",
                background: "transparent",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Row 2 — Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          {/* Company filter */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Company
            </div>
            <Select
              value={companyFilter}
              onChange={(v) => {
                setCompany(v);
                setPage(1);
              }}
              placeholder="All Companies"
              isDark={isDark}
              options={COMPANIES_LIST.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          </div>

          {/* Department / Faculty filter */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Department / Faculty
            </div>
            <Select
              value={deptFilter}
              onChange={(v) => {
                setDept(v);
                setPage(1);
              }}
              placeholder="All Departments"
              isDark={isDark}
              options={DEPARTMENTS_LIST.map((d) => ({ value: d, label: d }))}
            />
          </div>

          {/* Approval date filter */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Approval Date
            </div>
            <Select
              value={dateFilter}
              onChange={(v) => {
                setDate(v);
                setPage(1);
              }}
              placeholder="Any Time"
              isDark={isDark}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "14", label: "Last 14 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 3 months" },
              ]}
            />
          </div>

          {/* Status filter */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Status
            </div>
            <Select
              value={statusFilter}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              placeholder="All Statuses"
              isDark={isDark}
              options={[
                { value: "Active", label: "Active" },
                { value: "Pending", label: "Pending" },
                { value: "Suspended", label: "Suspended" },
                { value: "Banned", label: "Banned" },
                { value: "Rejected", label: "Rejected" },
                { value: "Reactivated", label: "Reactivated" },
              ]}
            />
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setCompany("");
                setDept("");
                setStatus("");
                setDate("");
                setPage(1);
              }}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                background: "var(--card)",
                color: "var(--muted)",
                border: "1.5px solid var(--line)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Barlow', sans-serif",
                whiteSpace: "nowrap",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          Showing <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> of{" "}
          <strong style={{ color: "var(--text)" }}>{total}</strong> users
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: 14,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--card-2)" }}>
                {["User", "Company", "Department", "Status & Date", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid var(--line)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                paged.map((user, i) => {
                  const avatarStyles = getTenantColorStyles(user.companyColor, isDark);
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: i < paged.length - 1 ? "1px solid var(--line)" : "none",
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--card-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* 1. User */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: avatarStyles.bg,
                              border: avatarStyles.border,
                              color: avatarStyles.text,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {(user.companyAbbr || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Company */}
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: user.companyColor,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                            {user.company}
                          </span>
                        </div>
                      </td>

                      {/* 3. Department */}
                      <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--text)" }}>
                        {user.department}
                      </td>

                      {/* 4. Status & Date */}
                      <td style={{ padding: "13px 18px" }}>
                        <StatusAndDateCell
                          status={user.status}
                          date={getUserStatusDate(user)}
                        />
                      </td>

                      {/* 5. Action */}
                      <td style={{ padding: "13px 18px" }}>
                        {["Active", "Suspended", "Reactivated", "Banned"].includes(user.status) ? (
                          <button
                            onClick={() => setManageUser(user)}
                            style={{
                              background:
                                user.status === "Suspended"
                                  ? "var(--gold)"
                                  : user.status === "Banned"
                                  ? "var(--red-strong)"
                                  : "var(--accent)",
                              color:
                                user.status === "Suspended" && isDark
                                  ? "#1e1e1e"
                                  : "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "7px 16px",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: "pointer",
                              fontFamily: "'Barlow', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              transition: "opacity .15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                            </svg>
                            MANAGE
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--faint)", fontStyle: "italic" }}>
                            {user.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            padding: "12px 18px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={pgBtn(safePage === 1)}
          >
            ‹ Previous
          </button>
          {getPages().map((p, i) =>
            p === "..." ? (
              <span key={`d${i}`} style={{ color: "var(--muted)", fontSize: 13, padding: "0 4px" }}>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  ...pgBtn(false),
                  minWidth: 34,
                  background: safePage === p ? "var(--accent)" : "var(--card)",
                  color: safePage === p ? "#fff" : "var(--muted)",
                  borderColor: safePage === p ? "var(--accent)" : "var(--line)",
                  fontWeight: safePage === p ? 700 : 500,
                }}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={pgBtn(safePage === totalPages)}
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Manage modal */}
      {manageUser && (
        <UserManageModal
          user={manageUser}
          onClose={() => setManageUser(null)}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onReactivate={handleReactivate}
          theme={theme}
        />
      )}
      </div>
    </PageTransition>
  );
};

export default SparkUsers;
