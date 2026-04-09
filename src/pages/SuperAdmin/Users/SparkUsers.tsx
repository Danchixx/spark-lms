// src/pages/SuperAdmin/Users/SparkUsers.tsx
// All users across all tenants — search, filter, suspend, ban, reactivate

import { useState, useMemo, useEffect } from "react";
import { MOCK_ALL_USERS, COMPANIES_LIST, DEPARTMENTS_LIST } from "../../../data/mockUsers";

const ITEMS_PER_PAGE = 8;

// ── Types ─────────────────────────────────────────────────────
interface SparkUser {
  id: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  status: string;
  companyId: number;
  company: string;
  companyColor: string;
  companyAbbr: string;
  department?: string;
  approvedOn?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  employeeId?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  gender?: string;
  phone?: string;
  suspendReason?: string | null;
  banReason?: string | null;
  suspendDuration?: string;
}

type ActionType = "suspended" | "banned" | "reactivated";
type ModalType  = "suspend" | "ban";

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ size = 40, color = "#ccc", abbr = "?" }: { size?: number; color?: string; abbr?: string }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: color + "22", border: `2px solid ${color}55`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.3, fontWeight: 800, color, flexShrink: 0,
  }}>
    {abbr.slice(0, 2).toUpperCase()}
  </div>
);

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    Active:      { bg: "#d5f5e0", color: "#1e8449" },
    Pending:     { bg: "#FFF0E6", color: "#FF6B00" },
    Suspended:   { bg: "#fef9e7", color: "#d4ac0d" },
    Banned:      { bg: "#fde8e8", color: "#922b21" },
    Rejected:    { bg: "#f0f0f0", color: "#888"    },
    Reactivated: { bg: "#d5f5e0", color: "#1e8449" },
  };
  const DEFAULT_BADGE = { bg: "#FFF0E6", color: "#FF6B00" };
  const resolved = map[status] ?? DEFAULT_BADGE;
  return (
    <span style={{
      background: resolved.bg, color: resolved.color,
      fontSize: 11, fontWeight: 700,
      padding: "3px 12px", borderRadius: 20,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
  sub?: string;
  subColor?: string;
}

const StatCard = ({ label, value, accent, icon, sub, subColor }: StatCardProps) => (
  <div style={{
    background: "#fff", borderRadius: 12,
    borderTop: `3px solid ${accent}`,
    boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
    padding: "20px 22px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa",
        letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#222", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: subColor || "#27ae60", fontWeight: 500 }}>{sub}</div>
      )}
    </div>
    <div style={{
      width: 52, height: 52, borderRadius: 12,
      background: "#FFF0E6",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#FF6B00", flexShrink: 0,
    }}>
      {icon}
    </div>
  </div>
);

// ── Dropdown ──────────────────────────────────────────────────
interface SelectOption { value: string; label: string; }
const Select = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%" }}>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      appearance: "none", background: "#fff",
      border: "1.5px solid #e0e0e0", borderRadius: 8,
      padding: "9px 32px 9px 12px",
      fontSize: 13, color: value ? "#333" : "#aaa",
      cursor: "pointer", fontFamily: "'Barlow', sans-serif",
      outline: "none", width: "100%", transition: "border-color .2s",
    }}
      onFocus={e => e.target.style.borderColor = "#FF6B00"}
      onBlur={e => e.target.style.borderColor = "#e0e0e0"}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <svg style={{ position: "absolute", right: 10, pointerEvents: "none" }}
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </div>
);

// ── Reason Modal ──────────────────────────────────────────────
interface ReasonModalProps {
  actionLabel: string;
  actionColor: string;
  onConfirm: (payload: { reason: string; duration: string }) => void;
  onCancel: () => void;
}

const ReasonModal = ({ actionLabel, actionColor, onConfirm, onCancel }: ReasonModalProps) => {
  const [reason, setReason]     = useState("");
  const [duration, setDuration] = useState("1 week");
  const isSuspend = actionLabel === "Suspend";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.6)", zIndex: 1100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 14,
        width: 440, maxWidth: "90vw", padding: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 20, color: "#222", marginBottom: 6 }}>
          {isSuspend ? "Suspend User" : "Ban User"}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          {isSuspend
            ? "The user will temporarily lose access. You can reactivate them later."
            : "The user will be permanently blocked from the system."}
        </div>

        {isSuspend && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#555",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Duration
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["1 week", "2 weeks", "1 month", "3 months"].map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12,
                  fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${duration === d ? "#FF6B00" : "#ddd"}`,
                  background: duration === d ? "#FFF0E6" : "#fff",
                  color: duration === d ? "#FF6B00" : "#555",
                  fontFamily: "'Barlow', sans-serif", transition: "all .15s",
                }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#555",
            marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Reason <span style={{ color: "#e74c3c" }}>*</span>
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder={`Why is this user being ${isSuspend ? "suspended" : "banned"}?`}
            style={{
              width: "100%", height: 88, padding: "10px 14px",
              border: "1.5px solid #e0e0e0", borderRadius: 8,
              fontSize: 13, fontFamily: "'Barlow', sans-serif",
              outline: "none", resize: "none", boxSizing: "border-box", color: "#333",
              transition: "border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = "#FF6B00"}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 0", background: "#fff", color: "#555",
            border: "1.5px solid #ddd", borderRadius: 8,
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            fontFamily: "'Barlow', sans-serif",
          }}>
            Cancel
          </button>
          <button onClick={() => reason.trim() && onConfirm({ reason, duration })}
            style={{
              flex: 1, padding: "10px 0",
              background: reason.trim() ? actionColor : "#ccc",
              color: "#fff", border: "none", borderRadius: 8,
              fontWeight: 700, fontSize: 14,
              cursor: reason.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Barlow', sans-serif", transition: "background .2s",
            }}>
            Confirm {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Result Screen ─────────────────────────────────────────────
const ResultScreen = ({ action }: { action: ActionType }) => {
  const map: Record<ActionType, { bg: string; label: string }> = {
    suspended:   { bg: "#d4ac0d", label: "User suspended."  },
    banned:      { bg: "#922b21", label: "User banned."      },
    reactivated: { bg: "#27ae60", label: "User reactivated!" },
  };
  const { bg, label } = map[action];
  return (
    <div style={{ display: "flex", flexDirection: "column",
      alignItems: "center", gap: 14, padding: "28px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {action === "banned"
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : action === "suspended"
            ? <><line x1="12" y1="5" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#fff"/></>
            : <polyline points="20 6 9 17 4 12"/>
          }
        </svg>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{label}</div>
    </div>
  );
};

// ── User Manage Modal ─────────────────────────────────────────
interface UserManageModalProps {
  user: SparkUser;
  onClose: () => void;
  onSuspend: (user: SparkUser, reason: string, duration: string) => void;
  onBan: (user: SparkUser, reason: string) => void;
  onReactivate: (user: SparkUser) => void;
}

const UserManageModal = ({ user, onClose, onSuspend, onBan, onReactivate }: UserManageModalProps) => {
  const [action, setAction]         = useState<ActionType | null>(null);
  const [showReason, setShowReason] = useState<ModalType | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const canSuspend    = ["Active", "Reactivated"].includes(user.status);
  const canBan        = user.status !== "Banned";
  const canReactivate = user.status === "Suspended";

  const handleSuspend = ({ reason, duration }: { reason: string; duration: string }) => {
    setShowReason(null); setAction("suspended");
    setTimeout(() => { onSuspend(user, reason, duration); onClose(); }, 1200);
  };
  const handleBan = ({ reason }: { reason: string; duration: string }) => {
    setShowReason(null); setAction("banned");
    setTimeout(() => { onBan(user, reason); onClose(); }, 1200);
  };
  const handleReactivate = () => {
    setAction("reactivated");
    setTimeout(() => { onReactivate(user); onClose(); }, 1200);
  };

  const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ background: "#f5f5f5", borderRadius: 6,
        padding: "9px 12px", fontSize: 13, color: "#333",
        border: "1px solid #e8e8e8", minHeight: 36 }}>
        {value || "—"}
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".06em",
      color: "#222", marginBottom: 12, textTransform: "uppercase" }}>
      {title}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.55)", zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#f4f4f4", borderRadius: 12,
          width: "min(820px, 96vw)", maxHeight: "92vh",
          overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.3)",
          display: "flex", flexDirection: "column",
        }}>
          {action ? (
            <div style={{ padding: 48 }}><ResultScreen action={action} /></div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr",
                flex: 1, overflow: "hidden", minHeight: 0 }}>
                {/* LEFT */}
                <div style={{
                  background: "linear-gradient(160deg, #FF8C00 0%, #FF6B00 50%, #e85d00 100%)",
                  padding: "24px 18px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 150, height: 150, borderRadius: "50%",
                    background: "rgba(0,0,0,.15)", overflow: "hidden", flexShrink: 0,
                    border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,.2)" }}>
                    <svg viewBox="0 0 150 150" width="150" height="150">
                      <rect width="150" height="150" fill="rgba(0,0,0,0.15)"/>
                      <circle cx="75" cy="55" r="28" fill="rgba(255,255,255,0.35)"/>
                      <ellipse cx="75" cy="135" rx="48" ry="32" fill="rgba(255,255,255,0.35)"/>
                    </svg>
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>username</div>
                    <div style={{ background: "#fff", borderRadius: 6, padding: "8px 10px",
                      fontSize: 13, color: "#333", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}>
                      {user.username || "—"}
                    </div>
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 4 }}>password</div>
                    <div style={{ background: "#fff", borderRadius: 6, padding: "8px 10px",
                      fontSize: 13, color: "#333", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}>
                      {user.password || "—"}
                    </div>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <StatusBadge status={user.status} />
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ background: "#fff", padding: "20px 22px",
                  display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px" }}>
                    <SectionTitle title="Personal Information" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <Field label="Last Name"    value={user.lastName} />
                      <Field label="First Name"   value={user.firstName} />
                      <Field label="Middle Name"  value={user.middleName} />
                      <Field label="Employee ID"  value={user.employeeId} />
                      <Field label="Date of Birth" value={user.dateOfBirth} />
                      <Field label="Job Title"    value={user.jobTitle} />
                      <Field label="Gender"       value={user.gender} />
                      <Field label="Department"   value={user.department} />
                    </div>
                  </div>

                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px" }}>
                    <SectionTitle title="Contact" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <Field label="Email"  value={user.email} />
                      <Field label="Number" value={user.phone} />
                    </div>
                  </div>

                  <div style={{ border: "1px solid #ffe0c0", background: "#fff8f0",
                    borderRadius: 8, padding: "14px 16px", flex: 1, minHeight: 0 }}>
                    <div style={{ display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00",
                        letterSpacing: ".1em", textTransform: "uppercase" }}>
                        Access Control
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {canReactivate && (
                          <button onClick={handleReactivate} style={{
                            padding: "7px 14px", borderRadius: 8, fontSize: 12,
                            fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Barlow', sans-serif",
                            background: "#27ae60", color: "#fff", border: "none",
                            transition: "opacity .15s",
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".85"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
                            ✓ Reactivate
                          </button>
                        )}
                        {canSuspend && (
                          <button onClick={() => setShowReason("suspend")} style={{
                            padding: "7px 14px", borderRadius: 8, fontSize: 12,
                            fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Barlow', sans-serif",
                            background: "#fff", color: "#d4ac0d", border: "1.5px solid #d4ac0d",
                            transition: "background .15s",
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#fef9e7"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}>
                            ⏸ Suspend
                          </button>
                        )}
                        {canBan && (
                          <button onClick={() => setShowReason("ban")} style={{
                            padding: "7px 14px", borderRadius: 8, fontSize: 12,
                            fontWeight: 700, cursor: "pointer",
                            fontFamily: "'Barlow', sans-serif",
                            background: "#fff", color: "#922b21", border: "1.5px solid #922b21",
                            transition: "background .15s",
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#fde8e8"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}>
                            🚫 Ban
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
                      {canSuspend && "Suspend temporarily removes access. Ban permanently blocks the user."}
                      {canReactivate && "Reactivating will restore this user's access to the system."}
                      {user.status === "Banned" && "This user has been permanently banned from the system."}
                    </div>

                    {(user.suspendReason || user.banReason) && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "#fff",
                        borderRadius: 6, border: "1px solid #e8e8e8", fontSize: 12, color: "#555" }}>
                        <span style={{ color: "#aaa", marginRight: 6 }}>
                          {user.suspendReason ? "Suspend reason:" : "Ban reason:"}
                        </span>
                        {user.suspendReason || user.banReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end",
                padding: "12px 22px", background: "#fff",
                borderTop: "1px solid #eee", flexShrink: 0 }}>
                <button onClick={onClose} style={{
                  padding: "9px 28px", background: "#f5f5f5", color: "#555",
                  border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                }}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showReason === "suspend" && (
        <ReasonModal actionLabel="Suspend" actionColor="#d4ac0d"
          onConfirm={handleSuspend} onCancel={() => setShowReason(null)} />
      )}
      {showReason === "ban" && (
        <ReasonModal actionLabel="Ban" actionColor="#922b21"
          onConfirm={handleBan} onCancel={() => setShowReason(null)} />
      )}
    </>
  );
};

// ── Main SparkUsers ───────────────────────────────────────────
const SparkUsers = () => {
  const [users, setUsers]         = useState<SparkUser[]>(MOCK_ALL_USERS as SparkUser[]);
  const [manageUser, setManageUser] = useState<SparkUser | null>(null);
  const [page, setPage]           = useState(1);

  const [search, setSearch]           = useState("");
  const [companyFilter, setCompany]   = useState("");
  const [deptFilter, setDept]         = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [dateFilter, setDate]         = useState("");

  const filtered = useMemo(() => {
    let r: SparkUser[] = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q)
      );
    }
    if (companyFilter) r = r.filter(u => u.companyId === Number(companyFilter));
    if (deptFilter)    r = r.filter(u => u.department === deptFilter);
    if (statusFilter)  r = r.filter(u => u.status === statusFilter);
    if (dateFilter) {
      const now  = new Date();
      const days = Number(dateFilter);
      r = r.filter(u => {
        if (!u.approvedOn) return false;
        const approved = new Date(u.approvedOn);
        return (now.getTime() - approved.getTime()) / 86400000 <= days;
      });
    }
    return r;
  }, [users, search, companyFilter, deptFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const total     = users.length;
  const active    = users.filter(u => u.status === "Active" || u.status === "Reactivated").length;
  const pending   = users.filter(u => u.status === "Pending").length;
  const suspended = users.filter(u => u.status === "Suspended").length;
  const banned    = users.filter(u => u.status === "Banned").length;

  const updateUser = (id: number, patch: Partial<SparkUser>) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));

  const handleSuspend    = (u: SparkUser, reason: string, duration: string) =>
    updateUser(u.id, { status: "Suspended", suspendReason: reason, suspendDuration: duration });
  const handleBan        = (u: SparkUser, reason: string) =>
    updateUser(u.id, { status: "Banned", banReason: reason });
  const handleReactivate = (u: SparkUser) =>
    updateUser(u.id, { status: "Reactivated", suspendReason: null });

  const getPages = (): (number | string)[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, "...", totalPages];
    if (safePage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  const pgBtn = (disabled: boolean): React.CSSProperties => ({
    minWidth: 32, height: 32, padding: "0 10px",
    border: "1px solid #ddd", background: "#fff",
    borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12, fontWeight: 500,
    color: disabled ? "#ccc" : "#555",
    opacity: disabled ? 0.5 : 1,
    fontFamily: "'Barlow', sans-serif",
  });

  const hasFilters = companyFilter || deptFilter || statusFilter || dateFilter || search;

  return (
    <div style={{ padding: 24, minHeight: "100%", background: "#f4f4f4",
      fontFamily: "'Barlow', sans-serif" }}>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 26, color: "#222",
          textTransform: "uppercase", letterSpacing: ".05em" }}>
          User Management
        </div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>
          All users across all tenant companies
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Users" value={total} accent="#FF6B00"
          sub={`↑ ${Math.floor(total * 0.12)} this month`} subColor="#27ae60"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          } />
        <StatCard label="Active" value={active} accent="#27ae60"
          sub={`↑ ${Math.floor(active * 0.15)} this week`} subColor="#27ae60"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          } />
        <StatCard label="Pending" value={pending} accent="#FF6B00"
          sub={`${pending} awaiting review`} subColor="#FF6B00"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          } />
        <StatCard label="Suspended" value={suspended} accent="#d4ac0d"
          sub={suspended > 0 ? `${suspended} temporarily blocked` : "None suspended"} subColor="#d4ac0d"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="10" y1="15" x2="10" y2="9"/>
              <line x1="14" y1="15" x2="14" y2="9"/>
            </svg>
          } />
        <StatCard label="Banned" value={banned} accent="#922b21"
          sub={banned > 0 ? `${banned} permanently blocked` : "None banned"} subColor="#922b21"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          } />
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
        padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>
            Search Users
          </div>
          <div style={{ display: "flex", alignItems: "center",
            border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 14px", gap: 10,
            transition: "border-color .2s" }}
            onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#FF6B00"}
            onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#e0e0e0"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text"
              placeholder="Search by name, email, username, or employee ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ border: "none", outline: "none", flex: 1,
                fontSize: 13, fontFamily: "'Barlow', sans-serif",
                color: "#333", background: "transparent" }} />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#bbb", fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
          gap: 12, alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Company</div>
            <Select value={companyFilter} onChange={v => { setCompany(v); setPage(1); }}
              placeholder="All Companies"
              options={(COMPANIES_LIST as Array<{ id: number; name: string }>).map(c => ({ value: String(c.id), label: c.name }))} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Department / Faculty</div>
            <Select value={deptFilter} onChange={v => { setDept(v); setPage(1); }}
              placeholder="All Departments"
              options={(DEPARTMENTS_LIST as string[]).map(d => ({ value: d, label: d }))} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Approval Date</div>
            <Select value={dateFilter} onChange={v => { setDate(v); setPage(1); }}
              placeholder="Any Time"
              options={[
                { value: "7",  label: "Last 7 days"   },
                { value: "14", label: "Last 14 days"  },
                { value: "30", label: "Last 30 days"  },
                { value: "90", label: "Last 3 months" },
              ]} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
              letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Status</div>
            <Select value={statusFilter} onChange={v => { setStatus(v); setPage(1); }}
              placeholder="All Statuses"
              options={[
                { value: "Active",      label: "Active"      },
                { value: "Pending",     label: "Pending"     },
                { value: "Suspended",   label: "Suspended"   },
                { value: "Banned",      label: "Banned"      },
                { value: "Rejected",    label: "Rejected"    },
                { value: "Reactivated", label: "Reactivated" },
              ]} />
          </div>
          {hasFilters && (
            <button onClick={() => {
              setSearch(""); setCompany(""); setDept("");
              setStatus(""); setDate(""); setPage(1);
            }} style={{
              padding: "9px 16px", borderRadius: 8,
              background: "#fff", color: "#888",
              border: "1.5px solid #ddd", fontSize: 12,
              fontWeight: 600, cursor: "pointer",
              fontFamily: "'Barlow', sans-serif",
              whiteSpace: "nowrap", transition: "all .15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B00";
                (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ddd";
                (e.currentTarget as HTMLButtonElement).style.color = "#888";
              }}>
              ✕ Clear
            </button>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#aaa" }}>
          Showing <strong style={{ color: "#333" }}>{filtered.length}</strong> of{" "}
          <strong style={{ color: "#333" }}>{total}</strong> users
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
        overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fff" }}>
              {["User", "Company", "Department", "Status", "Approved On", "Action"].map(h => (
                <th key={h} style={{ padding: "13px 18px", textAlign: "left",
                  fontSize: 11, fontWeight: 700, color: "#888",
                  letterSpacing: ".12em", textTransform: "uppercase",
                  borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center",
                  color: "#bbb", fontSize: 14 }}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : paged.map((user, i) => (
              <tr key={user.id}
                style={{ borderBottom: i < paged.length - 1 ? "1px solid #f5f5f5" : "none",
                  transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar size={38} color={user.companyColor} abbr={user.companyAbbr} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%",
                      background: user.companyColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>
                      {user.company}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "13px 18px", fontSize: 13, color: "#555" }}>
                  {user.department}
                </td>
                <td style={{ padding: "13px 18px" }}>
                  <StatusBadge status={user.status} />
                </td>
                <td style={{ padding: "13px 18px", fontSize: 13, color: "#555" }}>
                  {user.approvedOn || <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td style={{ padding: "13px 18px" }}>
                  {["Active", "Suspended", "Reactivated", "Banned"].includes(user.status) ? (
                    <button onClick={() => setManageUser(user)} style={{
                      background: user.status === "Suspended" ? "#d4ac0d"
                               : user.status === "Banned"    ? "#922b21"
                               : "#FF6B00",
                      color: "#fff", border: "none", borderRadius: 8,
                      padding: "7px 16px", fontWeight: 700, fontSize: 12,
                      cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "opacity .15s",
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".85"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                      </svg>
                      MANAGE
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: "#ccc", fontStyle: "italic" }}>
                      {user.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 4, padding: "12px 18px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1} style={pgBtn(safePage === 1)}>
            ‹ Previous
          </button>
          {getPages().map((p, i) =>
            p === "..." ? (
              <span key={`d${i}`} style={{ color: "#aaa", fontSize: 13, padding: "0 4px" }}>...</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)} style={{
                ...pgBtn(false), minWidth: 34,
                background: safePage === p ? "#FF6B00" : "#fff",
                color: safePage === p ? "#fff" : "#555",
                borderColor: safePage === p ? "#FF6B00" : "#ddd",
                fontWeight: safePage === p ? 700 : 500,
              }}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages} style={pgBtn(safePage === totalPages)}>
            Next ›
          </button>
        </div>
      </div>

      {manageUser && (
        <UserManageModal
          user={manageUser}
          onClose={() => setManageUser(null)}
          onSuspend={handleSuspend}
          onBan={handleBan}
          onReactivate={handleReactivate}
        />
      )}
    </div>
  );
};

export default SparkUsers;
