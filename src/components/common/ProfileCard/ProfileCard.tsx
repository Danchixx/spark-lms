import { useState, useRef, type ReactNode } from "react";
import {
  UserCircle, Pencil, Building2, Briefcase, BookOpen, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LABEL_W = 150;

/* ── Types ── */
interface ProfileData {
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  dateHired: string;
  memberSince: string;
  role: string;
  coursesAssigned: number;
  avatarUrl: string | null;
}

interface ProfileCardProps {
  profileData: ProfileData;
  editable?: boolean;
  onSave?: (data: { contactNumber: string; address: string }) => void;
  onAvatarChange?: (file: File) => void;
  isUploading?: boolean;
}

/* ── Field components ── */

const FieldRow = ({ label, value }: { label: string; value: string | ReactNode }) => (
  <div className="field-row-inner" style={{ display: "flex", borderBottom: "1px solid var(--color-border)" }}>
    <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{label}</span>
    </div>
    <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-header)", fontWeight: 500 }}>{value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
    </div>
  </div>
);

const FieldPair = ({ left, right }: { left: { label: string; value: string }; right?: { label: string; value: string } }) => (
  <div className="field-pair">
    <div className="field-pair-left">
      <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{left.label}</span>
      </div>
      <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: 13, color: "var(--color-text-header)", fontWeight: 500 }}>{left.value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
      </div>
    </div>
    {right ? (
      <div className="field-pair-right">
        <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{right.label}</span>
        </div>
        <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-header)", fontWeight: 500 }}>{right.value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
        </div>
      </div>
    ) : <div style={{ flex: 1 }} />}
  </div>
);

const EditableFieldRow = ({ label, value, onChange, locked }: { label: string; value: string; onChange?: (v: string) => void; locked?: boolean }) => (
  <div className="field-row-inner" style={{ display: "flex", borderBottom: "1px solid var(--color-border)" }}>
    <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{label}</span>
    </div>
    <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center" }}>
      {locked ? (
        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, padding: "4px" }}>{value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
      ) : (
        <input value={value} onChange={(e) => onChange?.(e.target.value)} style={{ flex: 1, border: "1.5px solid var(--color-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "var(--color-text)", background: "var(--color-input-bg)" }} />
      )}
    </div>
  </div>
);

const EditableFieldPair = ({ left, right }: { left: { label: string; value: string; locked: boolean; onChange?: (v: string) => void }; right?: { label: string; value: string; locked: boolean; onChange?: (v: string) => void } }) => (
  <div className="field-pair">
    <div className="field-pair-left">
      <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{left.label}</span>
      </div>
      <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center", minWidth: 0 }}>
        {left.locked ? (
          <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, padding: "4px" }}>{left.value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
        ) : (
          <input value={left.value} onChange={(e) => left.onChange?.(e.target.value)} style={{ flex: 1, border: "1.5px solid var(--color-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "var(--color-text)", background: "var(--color-input-bg)", minWidth: 0 }} />
        )}
      </div>
    </div>
    {right ? (
      <div className="field-pair-right">
        <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "var(--color-bg-subtle)", borderRight: "1px solid var(--color-border)", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>{right.label}</span>
        </div>
        <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center", minWidth: 0 }}>
          {right.locked ? (
            <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, padding: "4px" }}>{right.value || <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>—</span>}</span>
          ) : (
            <input value={right.value} onChange={(e) => right.onChange?.(e.target.value)} style={{ flex: 1, border: "1.5px solid var(--color-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "var(--color-text)", background: "var(--color-input-bg)", minWidth: 0 }} />
          )}
        </div>
      </div>
    ) : <div style={{ flex: 1 }} />}
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const SideInfoRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
    <Icon size={13} color="#FF6B00" style={{ marginTop: 2, flexShrink: 0 }} />
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-header)", margin: "2px 0 0" }}>{value || "—"}</p>
    </div>
  </div>
);

/* ── ProfileCard ── */
const ProfileCard = ({ profileData, editable = true, onSave, onAvatarChange, isUploading = false }: ProfileCardProps) => {
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(profileData.contactNumber);
  const [address, setAddress] = useState(profileData.address);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = `${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`;

  const handleSave = () => {
    setEditing(false);
    onSave?.({ contactNumber: contact, address });
  };

  const handleCancel = () => {
    setEditing(false);
    setContact(profileData.contactNumber);
    setAddress(profileData.address);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange?.(file);
    }
  };

  return (
    <>
      <style>{`
        .profile-card-inner { display: flex; align-items: stretch; }
        .avatar-panel { width: 220px; min-width: 220px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 24px 16px; border-right: 1px solid var(--color-border); background: var(--color-bg-subtle); }
        .info-panel { flex: 1; min-width: 0; }
        .field-pair { display: flex; border-bottom: 1px solid var(--color-border); }
        .field-pair-left { flex: 1; display: flex; border-right: 1px solid var(--color-border); min-width: 0; }
        .field-pair-right { flex: 1; display: flex; min-width: 0; }
        .field-row-inner { display: flex; }

        @media (max-width: 1024px) {
          .profile-card-inner { flex-direction: column; }
          .avatar-panel { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid var(--color-border); }
          .field-pair { flex-direction: column; }
          .field-pair-left { border-right: none; border-bottom: 1px solid var(--color-border); }
          .field-pair-right { border-bottom: 1px solid var(--color-border); }
        }

        @media (max-width: 480px) {
          .field-row-inner,
          .field-pair-left,
          .field-pair-right { flex-direction: column !important; }
          .field-label-col {
            width: 100% !important;
            min-width: unset !important;
            border-right: none !important;
            border-bottom: 1px solid var(--color-border);
            padding: 8px 14px 4px !important;
          }
          .field-value-col { padding: 4px 14px 10px !important; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>

      <div style={{ background: "var(--color-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
        <div style={{ height: 8, background: "#FF6B00" }} />

        <div className="profile-card-inner">

          {/* Avatar Panel */}
          <div className="avatar-panel">
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div style={{ width: 150, height: 150, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 4px var(--color-surface), 0 2px 10px rgba(0,0,0,0.1)", position: "relative", border: "1px solid var(--color-border)" }}>
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isUploading ? 0.3 : 1, transition: "opacity 0.2s ease" }} />
                ) : (
                  <UserCircle size={100} color="var(--color-text-muted)" strokeWidth={1} style={{ opacity: isUploading ? 0.3 : 1 }} />
                )}

                {/* Loading Overlay */}
                {isUploading && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                    <Loader2 size={36} color="#FF6B00" className="spin-icon" />
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />

              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ position: "absolute", bottom: 4, right: 4, width: 30, height: 30, borderRadius: "50%", background: isUploading ? "#ccc" : "#FF6B00", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isUploading ? "not-allowed" : "pointer", zIndex: 5, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
              >
                <Pencil size={14} color="white" />
              </button>
            </div>

            <p style={{ fontWeight: 800, fontSize: 14, textAlign: "center", lineHeight: 1.4, color: "var(--color-text-header)", marginBottom: 2 }}>{fullName}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", letterSpacing: 2, marginBottom: 16 }}>{profileData.role?.toUpperCase() || "USER"}</p>

            <div style={{ width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
              <SideInfoRow icon={Building2} label="Department" value={profileData.department} />
              <SideInfoRow icon={Briefcase} label="Job Title" value={profileData.jobTitle} />
              <SideInfoRow icon={BookOpen} label="Courses" value={`${profileData.coursesAssigned ?? 0} assigned`} />
            </div>

            {editable && (
              !editing ? (
                <button onClick={() => setEditing(true)} style={{ marginTop: 16, background: "none", border: "none", color: "#FF6B00", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontWeight: 700 }}>
                  <Pencil size={13} /> Edit details
                </button>
              ) : (
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button onClick={handleSave} style={{ background: "#FF6B00", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                  <button onClick={handleCancel} style={{ background: "var(--color-surface)", color: "var(--color-text-muted)", border: "1.5px solid var(--color-border)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              )
            )}
          </div>

          {/* Info Panel */}
          <div className="info-panel">
            <SectionTitle icon={UserCircle} title="Personal Information" />
            <div style={{ border: "1px solid var(--color-border)", margin: "16px", borderRadius: 10, overflow: "hidden" }}>
              {editing ? (
                <>
                  <EditableFieldRow label="Full Name" value={fullName} locked />
                  <EditableFieldPair
                    left={{ label: "Date of Birth", value: profileData.dateOfBirth, locked: true }}
                    right={{ label: "Gender", value: profileData.gender, locked: true }}
                  />
                  <EditableFieldPair
                    left={{ label: "Email Address", value: profileData.email, locked: true }}
                    right={{ label: "Contact No.", value: contact, locked: false, onChange: setContact }}
                  />
                  <EditableFieldRow label="Address" value={address} locked={false} onChange={setAddress} />
                </>
              ) : (
                <>
                  <FieldRow label="Full Name" value={fullName} />
                  <FieldPair left={{ label: "Date of Birth", value: profileData.dateOfBirth }} right={{ label: "Gender", value: profileData.gender }} />
                  <FieldPair left={{ label: "Email Address", value: profileData.email }} right={{ label: "Contact No.", value: contact }} />
                  <FieldRow label="Address" value={address} />
                </>
              )}
            </div>

            <SectionTitle icon={Briefcase} title="Employment Details" />
            <div style={{ border: "1px solid var(--color-border)", margin: "16px", borderRadius: 10, overflow: "hidden" }}>
              <FieldPair left={{ label: "Employee ID", value: profileData.employeeId }} right={{ label: "Job Title", value: profileData.jobTitle }} />
              <FieldPair left={{ label: "Department", value: profileData.department }} right={{ label: "Date Hired", value: profileData.dateHired }} />
              <FieldRow label="Member Since" value={profileData.memberSince} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;