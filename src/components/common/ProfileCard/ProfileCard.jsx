import { useState } from "react";
import {
  UserCircle, Pencil, Building2, Briefcase, BookOpen,
} from "lucide-react";

const LABEL_W = 150;

/* ── Field components ── */

const FieldRow = ({ label, value }) => (
  <div className="field-row-inner" style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
    <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{label}</span>
    </div>
    <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{value || <span style={{ color: "#ccc" }}>—</span>}</span>
    </div>
  </div>
);

const FieldPair = ({ left, right }) => (
  <div className="field-pair">
    <div className="field-pair-left">
      <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{left.label}</span>
      </div>
      <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{left.value || <span style={{ color: "#ccc" }}>—</span>}</span>
      </div>
    </div>
    {right ? (
      <div className="field-pair-right">
        <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{right.label}</span>
        </div>
        <div className="field-value-col" style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
          <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{right.value || <span style={{ color: "#ccc" }}>—</span>}</span>
        </div>
      </div>
    ) : <div style={{ flex: 1 }} />}
  </div>
);

const EditableFieldRow = ({ label, value, onChange, locked }) => (
  <div className="field-row-inner" style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
    <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{label}</span>
    </div>
    <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center" }}>
      {locked ? (
        <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500, padding: "4px" }}>{value || <span style={{ color: "#ccc" }}>—</span>}</span>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a1a", background: "#fffdf9" }} />
      )}
    </div>
  </div>
);

const EditableFieldPair = ({ left, right }) => (
  <div className="field-pair">
    <div className="field-pair-left">
      <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{left.label}</span>
      </div>
      <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center", minWidth: 0 }}>
        {left.locked ? (
          <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500, padding: "4px" }}>{left.value || <span style={{ color: "#ccc" }}>—</span>}</span>
        ) : (
          <input value={left.value} onChange={(e) => left.onChange(e.target.value)} style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a1a", background: "#fffdf9", minWidth: 0 }} />
        )}
      </div>
    </div>
    {right ? (
      <div className="field-pair-right">
        <div className="field-label-col" style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#747474", fontWeight: 600 }}>{right.label}</span>
        </div>
        <div className="field-value-col" style={{ flex: 1, padding: "6px 12px", display: "flex", alignItems: "center", minWidth: 0 }}>
          {right.locked ? (
            <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500, padding: "4px" }}>{right.value || <span style={{ color: "#ccc" }}>—</span>}</span>
          ) : (
            <input value={right.value} onChange={(e) => right.onChange(e.target.value)} style={{ flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 6, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a1a", background: "#fffdf9", minWidth: 0 }} />
          )}
        </div>
      </div>
    ) : <div style={{ flex: 1 }} />}
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const SideInfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
    <Icon size={13} color="#FF6B00" style={{ marginTop: 2, flexShrink: 0 }} />
    <div>
      <p style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#333", margin: "2px 0 0" }}>{value || "—"}</p>
    </div>
  </div>
);

/* ── ProfileCard ── */
const ProfileCard = ({ profileData, editable = true, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(profileData.contactNumber);
  const [address, setAddress] = useState(profileData.address);

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

  return (
    <>
      <style>{`
        .profile-card-inner { display: flex; align-items: stretch; }
        .avatar-panel { width: 200px; min-width: 200px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 24px 16px; border-right: 1px solid #f0f0f0; background: #fafafa; }
        .info-panel { flex: 1; min-width: 0; }
        .field-pair { display: flex; border-bottom: 1px solid #f0f0f0; }
        .field-pair-left { flex: 1; display: flex; border-right: 1px solid #f0f0f0; min-width: 0; }
        .field-pair-right { flex: 1; display: flex; min-width: 0; }
        .field-row-inner { display: flex; }

        @media (max-width: 1024px) {
          .profile-card-inner { flex-direction: column; }
          .avatar-panel { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid #f0f0f0; }
          .field-pair { flex-direction: column; }
          .field-pair-left { border-right: none; border-bottom: 1px solid #f0f0f0; }
          .field-pair-right { border-bottom: 1px solid #f0f0f0; }
        }

        @media (max-width: 480px) {
          .field-row-inner,
          .field-pair-left,
          .field-pair-right { flex-direction: column !important; }
          .field-label-col {
            width: 100% !important;
            min-width: unset !important;
            border-right: none !important;
            border-bottom: 1px solid #f0f0f0;
            padding: 8px 14px 4px !important;
          }
          .field-value-col { padding: 4px 14px 10px !important; }
        }
      `}</style>

      <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
        <div style={{ height: 8, background: "#FF6B00" }} />

        <div className="profile-card-inner">

          {/* Avatar Panel */}
          <div className="avatar-panel">
            <div style={{ position: "relative", marginBottom: 12 }}>
              <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 4px white, 0 2px 10px rgba(0,0,0,0.1)" }}>
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UserCircle size={90} color="#ccc" strokeWidth={1} />
                )}
              </div>
              <button style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "#FF6B00", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Pencil size={11} color="white" />
              </button>
            </div>

            <p style={{ fontWeight: 800, fontSize: 13, textAlign: "center", lineHeight: 1.4, color: "#1a1a1a", marginBottom: 2 }}>{fullName}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", letterSpacing: 2, marginBottom: 10 }}>{profileData.role?.toUpperCase() || "USER"}</p>

            <div style={{ width: "100%", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
              <SideInfoRow icon={Building2} label="Department" value={profileData.department} />
              <SideInfoRow icon={Briefcase} label="Job Title" value={profileData.jobTitle} />
              <SideInfoRow icon={BookOpen} label="Courses" value={`${profileData.coursesAssigned ?? 0} assigned`} />
            </div>

            {editable && (
              !editing ? (
                <button onClick={() => setEditing(true)} style={{ marginTop: 14, background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontWeight: 600 }}>
                  <Pencil size={12} /> Edit your details
                </button>
              ) : (
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button onClick={handleSave} style={{ background: "#FF6B00", color: "white", border: "none", borderRadius: 7, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                  <button onClick={handleCancel} style={{ background: "white", color: "#888", border: "1.5px solid #ddd", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              )
            )}
          </div>

          {/* Info Panel */}
          <div className="info-panel">
            <SectionTitle icon={UserCircle} title="Personal Information" />
            <div style={{ border: "1px solid #f0f0f0", margin: "12px 16px 16px", borderRadius: 8, overflow: "hidden" }}>
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
            <div style={{ border: "1px solid #f0f0f0", margin: "12px 16px 16px", borderRadius: 8, overflow: "hidden" }}>
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