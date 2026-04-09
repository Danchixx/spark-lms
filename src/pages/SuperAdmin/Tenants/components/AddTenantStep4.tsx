import { useState } from "react";

type RoleKey = "admin" | "creator" | "approver";

interface Role {
  key: RoleKey;
  title: string;
  desc: string;
}

interface RoleCredentials {
  username: string;
  password: string;
}

type RoleData = Record<RoleKey, RoleCredentials>;
type SelectedRoles = Partial<Record<RoleKey, boolean>>;

interface AddTenantStep4Props {
  onBack: () => void;
  onFinish: (selectedRoles: SelectedRoles, roleData: RoleData) => void;
}

const ROLES: Role[] = [
  { key: "admin",    title: "Admin",          desc: "Manages users, facilitates learning lorem ipsum" },
  { key: "creator",  title: "Course Creator", desc: "Creates courses for the company lorem ipsum" },
  { key: "approver", title: "Approver",       desc: "Approves Courses and gets notified for company updates" },
];

const AddTenantStep4 = ({ onBack, onFinish }: AddTenantStep4Props) => {
  const [selectedRoles, setSelectedRoles] = useState<SelectedRoles>({});
  const [roleData, setRoleData] = useState<RoleData>({
    admin:    { username: "", password: "" },
    creator:  { username: "", password: "" },
    approver: { username: "", password: "" },
  });

  const toggleRole = (key: RoleKey) =>
    setSelectedRoles((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: true };
    });

  const updateField = (role: RoleKey, field: keyof RoleCredentials, value: string) =>
    setRoleData((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));

  const anySelected = Object.keys(selectedRoles).length > 0;

  return (
    <div style={s.card}>
      <div style={s.title}>ADD ROLES</div>
      <div style={s.grid}>
        {ROLES.map((role) => {
          const sel = !!selectedRoles[role.key];
          return (
            <div
              key={role.key}
              onClick={() => toggleRole(role.key)}
              style={{
                ...s.roleCard,
                borderColor: sel ? "#FF6B00" : "#e0e0e0",
                boxShadow: sel ? "0 4px 14px rgba(255,107,0,.15)" : "none",
              }}
            >
              <div style={s.roleHeader}>
                <div style={s.roleTitle}>{role.title}</div>
                <div style={{
                  ...s.roleCheck,
                  background: sel ? "#FF6B00" : "transparent",
                  borderColor: sel ? "#FF6B00" : "#ccc",
                }}>
                  {sel && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="3" strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {sel ? (
                <div style={s.roleFields}
                  onClick={(e) => e.stopPropagation()}>
                  <input
                    style={s.roleInput}
                    type="text"
                    placeholder="username"
                    value={roleData[role.key].username}
                    onChange={(e) => updateField(role.key, "username", e.target.value)}
                  />
                  <input
                    style={s.roleInput}
                    type="password"
                    placeholder="password"
                    value={roleData[role.key].password}
                    onChange={(e) => updateField(role.key, "password", e.target.value)}
                  />
                </div>
              ) : (
                <div style={s.roleDesc}>{role.desc}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={s.formNav}>
        <button style={s.backBtn} onClick={onBack}>‹</button>
        {anySelected && (
          <button
            style={s.finishBtn}
            onClick={() => onFinish(selectedRoles, roleData)}
          >
            ✔ ADD TENANT AND GENERATE ROLES
          </button>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 10, border: "1px solid #eee",
    padding: 24, margin: "16px 0" },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 22, color: "#333", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  roleCard: { border: "1.5px solid #e0e0e0", borderRadius: 12, padding: 16,
    cursor: "pointer", transition: "border-color .2s, box-shadow .2s" },
  roleHeader: { display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 10 },
  roleTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: 20, color: "#FF6B00" },
  roleCheck: { width: 22, height: 22, borderRadius: "50%", border: "2px solid #ccc",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  roleDesc: { fontSize: 12, color: "#888", lineHeight: 1.7 },
  roleFields: { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 },
  roleInput: { width: "100%", border: "none", background: "#e8e8e8", borderRadius: 6,
    padding: "8px 10px", fontSize: 12, fontFamily: "'Barlow',sans-serif",
    color: "#555", outline: "none", boxSizing: "border-box" },
  formNav: { display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 20 },
  backBtn: { background: "none", border: "none", color: "#FF6B00",
    fontSize: 26, cursor: "pointer", padding: "4px 8px" },
  finishBtn: { background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "'Barlow',sans-serif",
    display: "flex", alignItems: "center", gap: 6 },
};

export default AddTenantStep4;
