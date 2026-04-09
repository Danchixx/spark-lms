// src/pages/SuperAdmin/Approvals/components/ApprovalUsers.tsx
import { useState, useMemo, useEffect } from "react";
import type { ApprovalCompany, ApprovalUser } from "../SparkApprovals";

const ITEMS_PER_PAGE = 5;

type ActionType = "approved" | "rejected" | "suspended" | "banned" | "reactivated";
type ModalType = "suspend" | "ban";

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ size = 40 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "#e8e0d8", flexShrink: 0, overflow: "hidden",
    border: "2px solid #ddd",
  }}>
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="50" fill="#e8e0d8" />
      <circle cx="50" cy="36" r="18" fill="#b0a090" />
      <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090" />
    </svg>
  </div>
);

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:     { bg: "#FFF0E6", color: "#FF6B00" },
    Approved:    { bg: "#d5f5e0", color: "#1e8449" },
    Rejected:    { bg: "#fde8e8", color: "#c0392b" },
    Suspended:   { bg: "#fef9e7", color: "#d4ac0d" },
    Banned:      { bg: "#f5d5d5", color: "#922b21" },
    Reactivated: { bg: "#d5f5e0", color: "#1e8449" },
  };
  const DEFAULT_BADGE = { bg: "#FFF0E6", color: "#FF6B00" };
  const resolved = map[status] ?? DEFAULT_BADGE;
  return (
    <span style={{
      background: resolved.bg, color: resolved.color,
      fontSize: 12, fontWeight: 700,
      padding: "4px 14px", borderRadius: 20,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
};

// ── Result screen ─────────────────────────────────────────────
const ResultScreen = ({ action }: { action: ActionType }) => {
  const map: Record<ActionType, { bg: string; label: string }> = {
    approved:    { bg: "#27ae60", label: "User approved!" },
    rejected:    { bg: "#e74c3c", label: "User rejected." },
    suspended:   { bg: "#d4ac0d", label: "User suspended." },
    banned:      { bg: "#922b21", label: "User banned." },
    reactivated: { bg: "#27ae60", label: "User reactivated!" },
  };
  const { bg, label } = map[action];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {action === "rejected" || action === "banned"
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : action === "suspended"
            ? <><line x1="12" y1="5" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#fff"/></>
            : <polyline points="20 6 9 17 4 12" />
          }
        </svg>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{label}</div>
    </div>
  );
};

// ── Field + SectionTitle shared components ────────────────────
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

// ── Reason Modal ──────────────────────────────────────────────
interface ReasonModalProps {
  actionLabel: string;
  actionColor: string;
  onConfirm: (payload: { reason: string; duration: string }) => void;
  onCancel: () => void;
}

const ReasonModal = ({ actionLabel, actionColor, onConfirm, onCancel }: ReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("1 week");
  const isSuspend = actionLabel === "Suspend";

  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.55)", zIndex: 1100,
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
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Suspension Duration
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["1 week", "2 weeks", "1 month", "3 months", "Custom"].map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12,
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
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555",
            marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Reason <span style={{ color: "#e74c3c" }}>*</span>
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={`Why is this user being ${isSuspend ? "suspended" : "banned"}?`}
            style={{
              width: "100%", height: 90, padding: "10px 14px",
              border: "1.5px solid #e0e0e0", borderRadius: 8,
              fontSize: 13, fontFamily: "'Barlow', sans-serif",
              outline: "none", resize: "none",
              boxSizing: "border-box", color: "#333", transition: "border-color .2s",
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
          <button
            onClick={() => reason.trim() && onConfirm({ reason, duration })}
            style={{
              flex: 1, padding: "10px 0",
              background: reason.trim() ? actionColor : "#ccc",
              color: "#fff", border: "none", borderRadius: 8,
              fontWeight: 700, fontSize: 14,
              cursor: reason.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Barlow', sans-serif", transition: "background .2s",
            }}
          >
            Confirm {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Approval Modal ────────────────────────────────────────────
interface ApprovalModalProps {
  user: ApprovalUser;
  company: ApprovalCompany;
  onClose: () => void;
  onApprove: (user: ApprovalUser) => void;
  onReject: (user: ApprovalUser, reason: string) => void;
}

const ApprovalModal = ({ user, company, onClose, onApprove, onReject }: ApprovalModalProps) => {
  const [action, setAction] = useState<ActionType | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleApprove = () => {
    setAction("approved");
    setTimeout(() => { onApprove(user); onClose(); }, 1200);
  };
  const handleReject = () => {
    setAction("rejected");
    setTimeout(() => { onReject(user, "rejected"); onClose(); }, 1200);
  };

  return (
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
                <div style={{ width: 170, height: 170, borderRadius: "50%",
                  background: "rgba(0,0,0,.15)", overflow: "hidden", flexShrink: 0,
                  border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,.2)" }}>
                  <svg viewBox="0 0 170 170" width="170" height="170">
                    <rect width="170" height="170" fill="rgba(0,0,0,0.15)"/>
                    <circle cx="85" cy="62" r="32" fill="rgba(255,255,255,0.35)"/>
                    <ellipse cx="85" cy="152" rx="54" ry="36" fill="rgba(255,255,255,0.35)"/>
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
                <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px",
                  background: "#fafafa", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <SectionTitle title="Assigned Courses" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, overflowY: "auto", flex: 1 }}>
                    {!(user.assignedCourses?.length) ? (
                      <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>No courses assigned</span>
                    ) : user.assignedCourses.map(course => (
                      <span key={course} style={{ background: "#fff", border: "1px solid #ddd",
                        borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#333",
                        fontWeight: 500, whiteSpace: "nowrap" }}>
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "12px 22px", background: "#fff", borderTop: "1px solid #eee", flexShrink: 0 }}>
              <button onClick={onClose} style={{ padding: "9px 22px", background: "#fff",
                color: "#888", border: "1px solid #ddd", borderRadius: 6,
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "'Barlow', sans-serif" }}>
                Cancel
              </button>
              <button onClick={handleReject}
                style={{ padding: "9px 26px", background: "#333", color: "#fff",
                  border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Barlow', sans-serif", transition: "opacity .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".8"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
                REJECT
              </button>
              <button onClick={handleApprove}
                style={{ padding: "9px 26px", background: "#FF6B00", color: "#fff",
                  border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Barlow', sans-serif", transition: "opacity .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".88"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
                APPROVE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Manage Modal ──────────────────────────────────────────────
interface ManageModalProps {
  user: ApprovalUser;
  company: ApprovalCompany;
  onClose: () => void;
  onSuspend: (user: ApprovalUser, reason: string, duration: string) => void;
  onBan: (user: ApprovalUser, reason: string) => void;
  onReactivate: (user: ApprovalUser) => void;
}

const ManageModal = ({ user, company, onClose, onSuspend, onBan, onReactivate }: ManageModalProps) => {
  const [action, setAction] = useState<ActionType | null>(null);
  const [showReason, setShowReason] = useState<ModalType | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const canSuspend    = ["Approved", "Reactivated"].includes(user.status);
  const canBan        = user.status !== "Banned";
  const canReactivate = user.status === "Suspended";

  const handleSuspend = ({ reason, duration }: { reason: string; duration: string }) => {
    setShowReason(null);
    setAction("suspended");
    setTimeout(() => { onSuspend(user, reason, duration); onClose(); }, 1200);
  };
  const handleBan = ({ reason }: { reason: string; duration: string }) => {
    setShowReason(null);
    setAction("banned");
    setTimeout(() => { onBan(user, reason); onClose(); }, 1200);
  };
  const handleReactivate = () => {
    setAction("reactivated");
    setTimeout(() => { onReactivate(user); onClose(); }, 1200);
  };

  const manageBtn: React.CSSProperties = {
    padding: "8px 16px", borderRadius: 8, fontSize: 13,
    fontWeight: 700, cursor: "pointer",
    fontFamily: "'Barlow', sans-serif", transition: "all .15s",
  };

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
                  <div style={{ marginTop: "auto" }}><StatusBadge status={user.status} /></div>
                </div>

                {/* RIGHT */}
                <div style={{ background: "#fff", padding: "20px 22px",
                  display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px" }}>
                    <SectionTitle title="Personal Information" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <Field label="Last Name" value={user.lastName} />
                      <Field label="First Name" value={user.firstName} />
                      <Field label="Middle Name" value={user.middleName} />
                      <Field label="Employee ID" value={user.employeeId} />
                      <Field label="Date of Birth" value={user.dateOfBirth} />
                      <Field label="Job Title" value={user.jobTitle} />
                      <Field label="Gender" value={user.gender} />
                      <Field label="Department" value={user.department} />
                    </div>
                  </div>
                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px" }}>
                    <SectionTitle title="Contact" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      <Field label="Email" value={user.email} />
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
                          <button onClick={handleReactivate}
                            style={{ ...manageBtn, background: "#27ae60", color: "#fff", border: "none" }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".85"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
                            ✓ Reactivate
                          </button>
                        )}
                        {canSuspend && (
                          <button onClick={() => setShowReason("suspend")}
                            style={{ ...manageBtn, background: "#fff", color: "#d4ac0d", border: "1.5px solid #d4ac0d" }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#fef9e7"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}>
                            ⏸ Suspend
                          </button>
                        )}
                        {canBan && (
                          <button onClick={() => setShowReason("ban")}
                            style={{ ...manageBtn, background: "#fff", color: "#922b21", border: "1.5px solid #922b21" }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#fde8e8"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#fff"}>
                            🚫 Ban
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5 }}>
                      {canSuspend && "Suspend temporarily removes access. Ban permanently blocks the user."}
                      {canReactivate && "Reactivating will restore this user's access to the system."}
                      {user.status === "Banned" && "This user has been permanently banned."}
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
                padding: "12px 22px", background: "#fff", borderTop: "1px solid #eee", flexShrink: 0 }}>
                <button onClick={onClose} style={{ padding: "9px 28px", background: "#f5f5f5",
                  color: "#555", border: "none", borderRadius: 6,
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Barlow', sans-serif" }}>
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

// ── Dropdown ──────────────────────────────────────────────────
interface SelectOption { value: string; label: string; }
const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: SelectOption[] }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      appearance: "none", background: "#fff",
      border: "1.5px solid #e0e0e0", borderRadius: 8,
      padding: "8px 32px 8px 12px", fontSize: 13, color: "#333",
      cursor: "pointer", fontFamily: "'Barlow', sans-serif", outline: "none",
    }}>
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

// ── Action button ─────────────────────────────────────────────
interface ActionButtonProps {
  user: ApprovalUser;
  onView: (user: ApprovalUser) => void;
  onManage: (user: ApprovalUser) => void;
}

const ActionButton = ({ user, onView, onManage }: ActionButtonProps) => {
  if (user.status === "Pending") {
    return (
      <button onClick={() => onView(user)} style={st.viewBtn}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".85"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        VIEW
      </button>
    );
  }
  if (user.status === "Rejected") {
    return <span style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Rejected</span>;
  }
  const color = user.status === "Suspended" ? "#d4ac0d"
              : user.status === "Banned"     ? "#922b21"
              : "#FF6B00";
  return (
    <button onClick={() => onManage(user)} style={{ ...st.manageActionBtn, background: color }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = ".85"}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
      MANAGE
    </button>
  );
};

// ── Main ApprovalUsers ────────────────────────────────────────
interface ApprovalUsersProps {
  company: ApprovalCompany;
  users: ApprovalUser[];
  onBack: () => void;
}

const ApprovalUsers = ({ company, users: initialUsers, onBack }: ApprovalUsersProps) => {
  const [users, setUsers]               = useState<ApprovalUser[]>(initialUsers);
  const [viewUser, setViewUser]         = useState<ApprovalUser | null>(null);
  const [manageUser, setManageUser]     = useState<ApprovalUser | null>(null);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All Pending");
  const [dateFilter, setDateFilter]     = useState("Jan 01-Jan 31");
  const [deptFilter, setDeptFilter]     = useState("All");

  const filtered = useMemo(() => {
    let result = users;
    if (statusFilter === "All Pending") result = result.filter(u => u.status === "Pending");
    else if (statusFilter !== "All")    result = result.filter(u => u.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, statusFilter, search]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage     = Math.min(page, totalPages);
  const paged        = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const pendingCount = users.filter(u => u.status === "Pending").length;

  const updateStatus = (user: ApprovalUser, status: string, extra: Partial<ApprovalUser> = {}) =>
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status, ...extra } : u));

  const handleApprove    = (u: ApprovalUser) => updateStatus(u, "Approved");
  const handleReject     = (u: ApprovalUser) => updateStatus(u, "Rejected");
  const handleSuspend    = (u: ApprovalUser, reason: string, duration: string) =>
    updateStatus(u, "Suspended", { suspendReason: reason, suspendDuration: duration });
  const handleBan        = (u: ApprovalUser, reason: string) =>
    updateStatus(u, "Banned", { banReason: reason });
  const handleReactivate = (u: ApprovalUser) =>
    updateStatus(u, "Reactivated", { suspendReason: null });

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

  return (
    <div style={{ padding: 24, minHeight: "100%", background: "#f4f4f4" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <button onClick={onBack} style={st.backBtn}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#333"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#555"}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: 24, color: "#222",
            textTransform: "uppercase", letterSpacing: ".05em" }}>
            {company.name}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: ".1em" }}>
            Pending Approvals
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap" }}>
          Showing{" "}
          <span style={{ fontWeight: 700, color: "#333" }}>
            {Math.min(ITEMS_PER_PAGE, filtered.length)}
          </span>
          {" "}of{" "}
          <span style={{ fontWeight: 700, color: "#333" }}>{pendingCount}</span>
          {" "}pending approvals
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)",
        padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px", minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>
            Search Users
          </div>
          <div style={{ display: "flex", alignItems: "center",
            border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "8px 12px", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search users by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ border: "none", outline: "none", flex: 1,
                fontSize: 13, fontFamily: "'Barlow', sans-serif",
                color: "#333", background: "transparent" }} />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#bbb", fontSize: 16, lineHeight: 1,
              }}>×</button>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Status</div>
          <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: "All Pending", label: "All Pending" },
              { value: "All",         label: "All"         },
              { value: "Approved",    label: "Approved"    },
              { value: "Rejected",    label: "Rejected"    },
              { value: "Suspended",   label: "Suspended"   },
              { value: "Banned",      label: "Banned"      },
              { value: "Reactivated", label: "Reactivated" },
            ]} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Date Range</div>
          <Select value={dateFilter} onChange={setDateFilter}
            options={[
              { value: "Jan 01-Jan 31", label: "Jan 01-Jan 31" },
              { value: "Feb 01-Feb 28", label: "Feb 01-Feb 28" },
              { value: "Mar 01-Mar 31", label: "Mar 01-Mar 31" },
            ]} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)",
        overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              {["User", "Status", "Created On", "Action"].map(h => (
                <th key={h} style={{ padding: "13px 20px", textAlign: "left",
                  fontSize: 11, fontWeight: 700, color: "#888",
                  letterSpacing: ".12em", textTransform: "uppercase",
                  borderBottom: "1px solid #eee" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center",
                  color: "#bbb", fontSize: 14 }}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : paged.map((user, i) => (
              <tr key={user.id}
                style={{ borderBottom: i < paged.length - 1 ? "1px solid #f5f5f5" : "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
              >
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar size={40} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{user.name}</div>
                      {user.email && (
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{user.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <StatusBadge status={user.status} />
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#555" }}>
                  {user.createdOn}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <ActionButton user={user} onView={setViewUser} onManage={setManageUser} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 4, padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1} style={pgBtn(safePage === 1)}>
            ‹ Previous
          </button>
          {getPages().map((p, i) =>
            p === "..." ? (
              <span key={`dot-${i}`} style={{ color: "#aaa", fontSize: 13, padding: "0 4px" }}>...</span>
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

      {/* Modals */}
      {viewUser && (
        <ApprovalModal user={viewUser} company={company}
          onClose={() => setViewUser(null)}
          onApprove={handleApprove} onReject={handleReject} />
      )}
      {manageUser && (
        <ManageModal user={manageUser} company={company}
          onClose={() => setManageUser(null)}
          onSuspend={handleSuspend} onBan={handleBan} onReactivate={handleReactivate} />
      )}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  backBtn: {
    background: "#555", color: "#fff", border: "none",
    borderRadius: 20, padding: "8px 20px", fontWeight: 700,
    fontSize: 13, cursor: "pointer", fontFamily: "'Barlow', sans-serif",
    display: "flex", alignItems: "center", gap: 6,
    transition: "background .15s", whiteSpace: "nowrap",
  },
  viewBtn: {
    background: "#2980b9", color: "#fff", border: "none",
    borderRadius: 8, padding: "7px 16px", fontWeight: 700,
    fontSize: 12, cursor: "pointer", fontFamily: "'Barlow', sans-serif",
    display: "flex", alignItems: "center", gap: 6, transition: "opacity .15s",
  },
  manageActionBtn: {
    color: "#fff", border: "none", borderRadius: 8,
    padding: "7px 16px", fontWeight: 700, fontSize: 12,
    cursor: "pointer", fontFamily: "'Barlow', sans-serif",
    display: "flex", alignItems: "center", gap: 6, transition: "opacity .15s",
  },
};

export default ApprovalUsers;
