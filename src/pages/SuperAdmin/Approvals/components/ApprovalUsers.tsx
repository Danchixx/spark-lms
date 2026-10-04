// src/pages/SuperAdmin/Approvals/components/ApprovalUsers.tsx
import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import type { ApprovalCompany, ApprovalUser } from "../SparkApprovals";

const ITEMS_PER_PAGE = 5;

type ActionType = "approved" | "rejected" | "deactivated" | "activated";

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ size = 40 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "#f0f0f0", flexShrink: 0, overflow: "hidden",
    border: "2px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, color: "#888", fontSize: size * 0.4
  }}>
    U
  </div>
);

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    pending:     { bg: "#FFF0E6", color: "#FF6B00" },
    active:      { bg: "#e6f2ed", color: "#27ae60" },
    rejected:    { bg: "#fceaea", color: "#e74c3c" },
    deactivated: { bg: "#f0f0f0", color: "#555555" },
  };
  const DEFAULT_BADGE = { bg: "#FFF0E6", color: "#FF6B00" };
  const normalized = status?.toLowerCase() || "pending";
  const resolved = map[normalized] ?? DEFAULT_BADGE;
  return (
    <span style={{
      background: resolved.bg, color: resolved.color,
      fontSize: 12, fontWeight: 700,
      padding: "4px 14px", borderRadius: 20,
      display: "inline-block", whiteSpace: "nowrap", textTransform: "capitalize"
    }}>
      {normalized}
    </span>
  );
};

// ── Result screen ─────────────────────────────────────────────
const ResultScreen = ({ action }: { action: ActionType }) => {
  const map: Record<ActionType, { bg: string; label: string }> = {
    approved:    { bg: "#FF6B00", label: "User Approved" },
    rejected:    { bg: "#222222", label: "User Rejected" },
    deactivated: { bg: "#222222", label: "User Deactivated" },
    activated:   { bg: "#FF6B00", label: "User Activated" },
  };
  const { bg, label } = map[action];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>
        ✓
      </div>
      <div style={{ fontWeight: 800, fontSize: 18, color: "#222", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
    </div>
  );
};

// ── Field + SectionTitle shared components ────────────────────
const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
    <div style={{ background: "#f9f9f9", borderRadius: 6,
      padding: "9px 12px", fontSize: 13, color: "#222",
      border: "1px solid #eee", minHeight: 36, fontWeight: 500 }}>
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
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const ReasonModal = ({ onConfirm, onCancel }: ReasonModalProps) => {
  const [reason, setReason] = useState("");

  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.6)", zIndex: 1100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12,
        width: 440, maxWidth: "90vw", padding: 32,
        boxShadow: "0 20px 60px rgba(0,0,0,.25)", border: "1px solid #eee"
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif",
          fontWeight: 800, fontSize: 20, color: "#222", marginBottom: 8, textTransform: "uppercase" }}>
          Deactivate User
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 24, lineHeight: 1.5 }}>
          The user will lose access to the system. A message containing the reason below will be sent to the tenant's admin.
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#222",
            marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Reason for Deactivation <span style={{ color: "#FF6B00" }}>*</span>
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Please provide a detailed reason..."
            style={{
              width: "100%", height: 100, padding: "12px 14px",
              border: "1.5px solid #e0e0e0", borderRadius: 8,
              fontSize: 13, fontFamily: "'Inter', sans-serif",
              outline: "none", resize: "none",
              boxSizing: "border-box", color: "#222", transition: "border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = "#222"}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px 0", background: "#f5f5f5", color: "#555",
            border: "none", borderRadius: 8,
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", textTransform: "uppercase"
          }}>
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            style={{
              flex: 1, padding: "12px 0",
              background: reason.trim() ? "#111" : "#eee",
              color: reason.trim() ? "#fff" : "#aaa", border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 13, textTransform: "uppercase",
              cursor: reason.trim() ? "pointer" : "not-allowed",
              fontFamily: "'Inter', sans-serif", transition: "all .2s",
            }}
          >
            Deactivate
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
  onReject: (user: ApprovalUser) => void;
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
    setTimeout(() => { onReject(user); onClose(); }, 1200);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.6)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12,
        width: "min(820px, 96vw)", maxHeight: "92vh",
        overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.3)",
        display: "flex", flexDirection: "column",
      }}>
        {action ? (
          <div style={{ padding: 48, background: "#f9f9f9" }}><ResultScreen action={action} /></div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", flex: 1, overflow: "hidden", minHeight: 0 }}>
              {/* LEFT */}
              <div style={{
                background: "#111", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
              }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#222", flexShrink: 0,
                  border: "4px solid #333", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 40, fontWeight: 900 }}>
                  U
                </div>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Email Address</div>
                  <div style={{ background: "#222", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#fff", fontWeight: 500 }}>
                    {user.email || "—"}
                  </div>
                </div>
                <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
                  <StatusBadge status={user.status} />
                </div>
              </div>

              {/* RIGHT */}
              <div style={{ background: "#fff", padding: "32px", display: "flex", flexDirection: "column", gap: 24, overflow: "hidden", overflowY: "auto" }}>
                <div>
                  <SectionTitle title="Personal Information" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field label="Full Name"    value={user.name} />
                    <Field label="Employee ID"  value={user.employeeId} />
                    <Field label="Date of Birth" value={user.dateOfBirth} />
                    <Field label="Job Title"    value={user.jobTitle} />
                    <Field label="Gender"       value={user.gender} />
                    <Field label="Department"   value={user.department} />
                  </div>
                </div>
                <div>
                  <SectionTitle title="Contact" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field label="Phone" value={user.phone} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12,
              padding: "16px 24px", background: "#f9f9f9", borderTop: "1px solid #eee", flexShrink: 0 }}>
              <button onClick={onClose} style={{ padding: "10px 24px", background: "#fff",
                color: "#555", border: "1px solid #ddd", borderRadius: 8,
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>
                Cancel
              </button>
              <button onClick={handleReject}
                style={{ padding: "10px 28px", background: "#111", color: "#fff",
                  border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background .2s", textTransform: "uppercase" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#333"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#111"}>
                Reject
              </button>
              <button onClick={handleApprove}
                style={{ padding: "10px 28px", background: "#FF6B00", color: "#fff",
                  border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13,
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background .2s", textTransform: "uppercase" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#e65c00"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#FF6B00"}>
                Approve
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
  onDeactivate: (user: ApprovalUser, reason: string) => void;
  onActivate: (user: ApprovalUser) => void;
}

const ManageModal = ({ user, company, onClose, onDeactivate, onActivate }: ManageModalProps) => {
  const [action, setAction] = useState<ActionType | null>(null);
  const [showReason, setShowReason] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isDeactivated = user.status === "deactivated";
  const canDeactivate = user.status === "active";

  const handleDeactivate = (reason: string) => {
    setShowReason(false);
    setAction("deactivated");
    setTimeout(() => { onDeactivate(user, reason); onClose(); }, 1200);
  };

  const handleActivate = () => {
    if (!isDeactivated) return;
    setAction("activated");
    setTimeout(() => { onActivate(user); onClose(); }, 1200);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.6)", zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#fff", borderRadius: 12,
          width: "min(820px, 96vw)", maxHeight: "92vh",
          overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.3)",
          display: "flex", flexDirection: "column",
        }}>
          {action ? (
            <div style={{ padding: 48, background: "#f9f9f9" }}><ResultScreen action={action} /></div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", flex: 1, overflow: "hidden", minHeight: 0 }}>
                {/* LEFT */}
                <div style={{
                  background: "#111", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                }}>
                  <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#222", flexShrink: 0,
                    border: "4px solid #333", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 40, fontWeight: 900 }}>
                    U
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700 }}>Email Address</div>
                    <div style={{ background: "#222", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#fff", fontWeight: 500 }}>
                      {user.email || "—"}
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
                    <StatusBadge status={user.status} />
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ background: "#fff", padding: "32px", display: "flex", flexDirection: "column", gap: 24, overflow: "hidden", overflowY: "auto" }}>
                  <div>
                    <SectionTitle title="Personal Information" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <Field label="Full Name" value={user.name} />
                      <Field label="Employee ID" value={user.employeeId} />
                      <Field label="Date of Birth" value={user.dateOfBirth} />
                      <Field label="Job Title" value={user.jobTitle} />
                      <Field label="Gender" value={user.gender} />
                      <Field label="Department" value={user.department} />
                    </div>
                  </div>
                  
                  <div style={{ border: "1px solid #eee", background: "#fafafa", borderRadius: 8, padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#111", letterSpacing: ".05em", textTransform: "uppercase" }}>
                        Access Control
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button 
                          onClick={handleActivate}
                          disabled={!isDeactivated}
                          style={{
                            padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 800, textTransform: "uppercase", fontFamily: "'Inter', sans-serif", transition: "all .2s",
                            ...(isDeactivated 
                                ? { background: "#FF6B00", color: "#fff", border: "1px solid #FF6B00", cursor: "pointer" }
                                : { background: "#fff", color: "#FF6B00", border: "1px solid #FF6B00", cursor: "not-allowed", opacity: 0.6 })
                          }}>
                          Activate
                        </button>
                        <button 
                          onClick={() => { if (canDeactivate) setShowReason(true); }}
                          disabled={!canDeactivate}
                          style={{
                            padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 800, textTransform: "uppercase", fontFamily: "'Inter', sans-serif", transition: "all .2s",
                            background: canDeactivate ? "#111" : "#555", color: "#fff", border: "none", cursor: canDeactivate ? "pointer" : "not-allowed", opacity: canDeactivate ? 1 : 0.6
                          }}>
                          Deactivate
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                      Deactivating a user will temporarily remove their access to the system and notify the tenant admin. Activating restores access.
                    </div>
                    {user.deactivationReason && (
                      <div style={{ marginTop: 16, padding: "12px", background: "#fff",
                        borderRadius: 6, border: "1px solid #eee", fontSize: 13, color: "#222", fontWeight: 500 }}>
                        <span style={{ color: "#888", marginRight: 8, fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>
                          Reason:
                        </span>
                        {user.deactivationReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end",
                padding: "16px 24px", background: "#f9f9f9", borderTop: "1px solid #eee", flexShrink: 0 }}>
                <button onClick={onClose} style={{ padding: "10px 32px", background: "#e0e0e0",
                  color: "#222", border: "none", borderRadius: 8,
                  fontWeight: 800, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showReason && (
        <ReasonModal onConfirm={handleDeactivate} onCancel={() => setShowReason(false)} />
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
      border: "1px solid #ddd", borderRadius: 8,
      padding: "10px 36px 10px 14px", fontSize: 13, color: "#222", fontWeight: 600,
      cursor: "pointer", fontFamily: "'Inter', sans-serif", outline: "none",
    }}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <div style={{ position: "absolute", right: 14, pointerEvents: "none", fontSize: 10, color: "#888" }}>▼</div>
  </div>
);

// ── Action button ─────────────────────────────────────────────
interface ActionButtonProps {
  user: ApprovalUser;
  onView: (user: ApprovalUser) => void;
  onManage: (user: ApprovalUser) => void;
}

const ActionButton = ({ user, onView, onManage }: ActionButtonProps) => {
  if (user.status === "pending") {
    return (
      <button onClick={() => onView(user)} style={st.viewBtn}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#e65c00"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#FF6B00"}>
        VIEW
      </button>
    );
  }
  if (user.status === "rejected") {
    return <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", fontWeight: 500 }}>Rejected</span>;
  }
  return (
    <button onClick={() => onManage(user)} style={{ ...st.manageActionBtn }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#333"}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#111"}>
      MANAGE
    </button>
  );
};

// ── Main ApprovalUsers ────────────────────────────────────────
interface ApprovalUsersProps {
  company: ApprovalCompany;
  onBack: () => void;
}

const ApprovalUsers = ({ company, onBack }: ApprovalUsersProps) => {
  const [users, setUsers]               = useState<ApprovalUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [viewUser, setViewUser]         = useState<ApprovalUser | null>(null);
  const [manageUser, setManageUser]     = useState<ApprovalUser | null>(null);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchUsers();
  }, [company.id]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped = data.map((u: any): ApprovalUser => ({
        id: u.id,
        name: `${u.firstname || ""} ${u.lastname || ""}`.trim(),
        email: u.email,
        status: u.status || "pending",
        createdOn: new Date(u.created_at).toLocaleDateString(),
        firstName: u.firstname,
        lastName: u.lastname,
        employeeId: u.employee_id,
        dateOfBirth: u.date_of_birth,
        jobTitle: u.job_title,
        gender: u.gender,
        department: u.department,
        phone: u.contact_no,
        deactivationReason: u.deactivation_reason
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = users;
    if (statusFilter !== "all") {
      result = result.filter(u => (u.status || "pending").toLowerCase() === statusFilter);
    }
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
  const pendingCount = users.filter(u => (u.status || "pending").toLowerCase() === "pending").length;

  const performUpdate = async (userId: string, updates: any) => {
    const { error } = await supabase.from("users").update(updates).eq("id", userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    }
  };

  const handleApprove    = (u: ApprovalUser) => performUpdate(u.id, { status: "active" });
  const handleReject     = (u: ApprovalUser) => performUpdate(u.id, { status: "rejected" });
  
  const handleDeactivate = (u: ApprovalUser, reason: string) => {
    performUpdate(u.id, { status: "deactivated", deactivation_reason: reason });
    // TODO: Trigger email or in-app notification to tenant admin here.
  };
  
  const handleActivate = (u: ApprovalUser) => {
    performUpdate(u.id, { status: "active", deactivation_reason: null });
  };

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
    fontSize: 12, fontWeight: 700,
    color: disabled ? "#ccc" : "#222",
    opacity: disabled ? 0.5 : 1,
    fontFamily: "'Inter', sans-serif",
  });

  return (
    <div style={{ padding: 24, minHeight: "100%", background: "#f4f4f4" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={onBack} style={st.backBtn}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#333"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#111"}>
          ← BACK
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif",
            fontWeight: 800, fontSize: 28, color: "#111",
            textTransform: "uppercase", letterSpacing: ".05em" }}>
            {company.name}
          </div>
          <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>
            User Management
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>
          Showing{" "}
          <span style={{ fontWeight: 800, color: "#111" }}>
            {Math.min(ITEMS_PER_PAGE, filtered.length)}
          </span>
          {" "}of{" "}
          <span style={{ fontWeight: 800, color: "#111" }}>{pendingCount}</span>
          {" "}pending
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #eee",
        padding: "20px", marginBottom: 20,
        display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px", minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#555",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
            Search Users
          </div>
          <div style={{ display: "flex", alignItems: "center",
            border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", gap: 10 }}>
            <span style={{ color: "#aaa", fontSize: 14 }}>🔍</span>
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ border: "none", outline: "none", flex: 1,
                fontSize: 13, fontFamily: "'Inter', sans-serif",
                color: "#222", background: "transparent", fontWeight: 500 }} />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#888", fontSize: 16, lineHeight: 1, fontWeight: 700
              }}>×</button>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#555",
            letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Status</div>
          <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: "pending",     label: "Pending"     },
              { value: "all",         label: "All Users"   },
              { value: "active",      label: "Active"      },
              { value: "rejected",    label: "Rejected"    },
              { value: "deactivated", label: "Deactivated" },
            ]} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,.04)", border: "1px solid #eee",
        overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              {["User", "Status", "Created On", "Action"].map(h => (
                <th key={h} style={{ padding: "16px 24px", textAlign: "left",
                  fontSize: 11, fontWeight: 800, color: "#555",
                  letterSpacing: ".1em", textTransform: "uppercase",
                  borderBottom: "1px solid #eee" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#888", fontSize: 14, fontWeight: 500 }}>
                  Loading users...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#888", fontSize: 14, fontWeight: 500 }}>
                  No users found matching your filters.
                </td>
              </tr>
            ) : paged.map((user, i) => (
              <tr key={user.id}
                style={{ borderBottom: i < paged.length - 1 ? "1px solid #eee" : "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar size={42} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{user.name}</div>
                      {user.email && (
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontWeight: 500 }}>{user.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <StatusBadge status={user.status} />
                </td>
                <td style={{ padding: "16px 24px", fontSize: 13, color: "#555", fontWeight: 500 }}>
                  {user.createdOn}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <ActionButton user={user} onView={setViewUser} onManage={setManageUser} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 6, padding: "16px 24px", borderTop: "1px solid #eee", background: "#fafafa" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1} style={pgBtn(safePage === 1)}>
            PREV
          </button>
          {getPages().map((p, i) =>
            p === "..." ? (
              <span key={`dot-${i}`} style={{ color: "#aaa", fontSize: 13, padding: "0 4px", fontWeight: 800 }}>...</span>
            ) : (
              <button key={p} onClick={() => setPage(p as number)} style={{
                ...pgBtn(false), minWidth: 34,
                background: safePage === p ? "#111" : "#fff",
                color: safePage === p ? "#fff" : "#222",
                borderColor: safePage === p ? "#111" : "#ddd",
              }}>{p}</button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages} style={pgBtn(safePage === totalPages)}>
            NEXT
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
          onDeactivate={handleDeactivate} onActivate={handleActivate} />
      )}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  backBtn: {
    background: "#111", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 24px", fontWeight: 800,
    fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif",
    display: "flex", alignItems: "center", gap: 8,
    transition: "background .2s", whiteSpace: "nowrap", letterSpacing: ".05em"
  },
  viewBtn: {
    background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 6, padding: "8px 20px", fontWeight: 800,
    fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif",
    display: "flex", alignItems: "center", gap: 6, transition: "background .2s",
    letterSpacing: ".05em"
  },
  manageActionBtn: {
    background: "#111", color: "#fff", border: "none", borderRadius: 6,
    padding: "8px 20px", fontWeight: 800, fontSize: 11,
    cursor: "pointer", fontFamily: "'Inter', sans-serif",
    display: "flex", alignItems: "center", gap: 6, transition: "background .2s",
    letterSpacing: ".05em"
  },
};

export default ApprovalUsers;
