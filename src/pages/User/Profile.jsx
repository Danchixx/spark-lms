import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import {
  UserCircle, Pencil, Lock, Eye, EyeOff, IdCard,
  Building2, Briefcase, BookOpen, ShieldCheck,
} from "lucide-react";

const PROFILE_DATA = {
  lastName:        "Gonzales",
  firstName:       "Danilo",
  middleName:      "Pogi",
  email:           "danilogatch@gmail.com",
  contactNumber:   "+63 912 345 6789",
  dateOfBirth:     "1998-06-15",
  gender:          "Male",
  address:         "Bagong Ilog, Pasig City, Metro Manila",
  employeeId:      "EMP-00142",
  jobTitle:        "Software Dev",
  department:      "IT",
  dateHired:       "2024-01-10",
  memberSince:     "January 2025",
  status:          "Active",
  role:            "User",
  coursesAssigned: 4,
};

const LABEL_W = 160;

/* ── Single full-width row ── */
const FieldRow = ({ label, value, required }) => (
  <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
    <div style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "#6b9ec8", fontWeight: 600 }}>{label}{required && <span style={{ color: "#FF6B00" }}> *</span>}</span>
    </div>
    <div style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{value || <span style={{ color: "#ccc" }}>—</span>}</span>
    </div>
  </div>
);

/* ── Two fields in one row, same label width ── */
const FieldPair = ({ left, right }) => (
  <div className="field-pair">
    <div className="field-pair-left">
      <div style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6b9ec8", fontWeight: 600 }}>{left.label}{left.required && <span style={{ color: "#FF6B00" }}> *</span>}</span>
      </div>
      <div style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
        <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{left.value || <span style={{ color: "#ccc" }}>—</span>}</span>
      </div>
    </div>
    {right ? (
      <div className="field-pair-right">
        <div style={{ width: LABEL_W, minWidth: LABEL_W, flexShrink: 0, padding: "10px 16px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b9ec8", fontWeight: 600 }}>{right.label}{right.required && <span style={{ color: "#FF6B00" }}> *</span>}</span>
        </div>
        <div style={{ flex: 1, padding: "10px 16px", display: "flex", alignItems: "center", minWidth: 0 }}>
          <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{right.value || <span style={{ color: "#ccc" }}>—</span>}</span>
        </div>
      </div>
    ) : <div style={{ flex: 1 }} />}
  </div>
);

/* ── Input box (Account Settings style) ── */
const InputBox = ({ label, icon: Icon, value, type = "text", readOnly, rightEl }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 12px", background: readOnly ? "#fafafa" : "white" }}>
      {Icon && <Icon size={16} color="#aaa" style={{ flexShrink: 0 }} />}
      <input
        type={type}
        defaultValue={value}
        readOnly={readOnly}
        style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "#1a1a1a", minWidth: 0 }}
      />
      {rightEl}
    </div>
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

const Profile = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page) => navigate(`/${slug}/${page.toLowerCase()}`);
  const fullName = `${PROFILE_DATA.firstName} ${PROFILE_DATA.middleName} ${PROFILE_DATA.lastName}`;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <style>{`
        .profile-card-inner { display: flex; align-items: stretch; }
        .avatar-panel {
          width: 200px; min-width: 200px; flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 16px;
          border-right: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .info-panel { flex: 1; min-width: 0; }
        .acct-row { display: flex; gap: 20px; padding: 16px; }
        .pw-fields { display: flex; gap: 20px; padding: 0 16px 16px; }
        .field-pair { display: flex; border-bottom: 1px solid #f0f0f0; }
        .field-pair-left { flex: 1; display: flex; border-right: 1px solid #f0f0f0; min-width: 0; }
        .field-pair-right { flex: 1; display: flex; min-width: 0; }

        @media (max-width: 1024px) {
          .profile-card-inner { flex-direction: column; }
          .avatar-panel { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid #f0f0f0; }
          .acct-row { flex-direction: column; gap: 12px; }
          .pw-fields { flex-direction: column; }
          .field-pair { flex-direction: column; }
          .field-pair-left { border-right: none; border-bottom: 1px solid #f0f0f0; }
          .field-pair-right { border-bottom: 1px solid #f0f0f0; }
        }
      `}</style>

      <Sidebar isOpen={sidebarOpen} activePage="Profile" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, units ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>Profile</h1>

          {/* ── Profile Card ── */}
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", marginBottom: 16, border: "1px solid #f0f0f0" }}>
            <div style={{ height: 5, background: "linear-gradient(90deg,#FF6B00,#ffb347)" }} />

            <div className="profile-card-inner">
              {/* Avatar Panel */}
              <div className="avatar-panel">
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 0 0 4px white, 0 2px 10px rgba(0,0,0,0.1)" }}>
                    <UserCircle size={90} color="#ccc" strokeWidth={1} />
                  </div>
                  <button style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "#FF6B00", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Pencil size={11} color="white" />
                  </button>
                </div>
                <p style={{ fontWeight: 800, fontSize: 13, textAlign: "center", lineHeight: 1.4, color: "#1a1a1a", marginBottom: 2 }}>{fullName}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", letterSpacing: 2, marginBottom: 10 }}>USER</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 10px", marginBottom: 14 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Active</span>
                </div>
                <div style={{ width: "100%", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                  <SideInfoRow icon={Building2} label="Department" value={PROFILE_DATA.department} />
                  <SideInfoRow icon={Briefcase} label="Job Title"  value={PROFILE_DATA.jobTitle} />
                  <SideInfoRow icon={BookOpen}  label="Courses"    value={`${PROFILE_DATA.coursesAssigned} assigned`} />
                </div>
                <button style={{ marginTop: 14, background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontWeight: 600 }}>
                  <Pencil size={12} /> Edit your details
                </button>
              </div>

              {/* Info Panel */}
              <div className="info-panel">

                {/* Personal Information */}
                <SectionTitle icon={UserCircle} title="Personal Information" />
                <div style={{ border: "1px solid #f0f0f0", margin: "12px 16px 16px", borderRadius: 8, overflow: "hidden" }}>
                  {/* Full name — single row */}
                  <FieldRow label="Full Name" value={fullName} />
                  {/* Date of Birth — Gender */}
                  <FieldPair
                    left={{ label: "Date of Birth", value: PROFILE_DATA.dateOfBirth }}
                    right={{ label: "Gender",        value: PROFILE_DATA.gender }}
                  />
                  {/* Email — Contact No. */}
                  <FieldPair
                    left={{ label: "Email Address",  value: PROFILE_DATA.email,         required: true }}
                    right={{ label: "Contact No.",    value: PROFILE_DATA.contactNumber }}
                  />
                  {/* Address — full row */}
                  <FieldRow label="Address" value={PROFILE_DATA.address} required />
                </div>

                {/* Employment Details */}
                <SectionTitle icon={Briefcase} title="Employment Details" />
                <div style={{ border: "1px solid #f0f0f0", margin: "12px 16px 16px", borderRadius: 8, overflow: "hidden" }}>
                  <FieldPair
                    left={{ label: "Employee ID", value: PROFILE_DATA.employeeId, required: true }}
                    right={{ label: "Job Title",   value: PROFILE_DATA.jobTitle,   required: true }}
                  />
                  <FieldPair
                    left={{ label: "Department",  value: PROFILE_DATA.department, required: true }}
                    right={{ label: "Date Hired",  value: PROFILE_DATA.dateHired }}
                  />
                  <FieldRow label="Member Since" value={PROFILE_DATA.memberSince} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Account Settings ── */}
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", marginBottom: 28 }}>
            <div style={{ height: 5, background: "linear-gradient(90deg,#e0e0e0,#f0f0f0)" }} />
            <SectionTitle icon={ShieldCheck} title="Account Settings" />

            {/* Username + Password */}
            <div className="acct-row">
              <InputBox label="Username" icon={IdCard} value={PROFILE_DATA.email} readOnly />
              <InputBox
                label="Password"
                icon={Lock}
                value={showPassword ? "password123" : "••••••••••••••••••"}
                readOnly
                rightEl={
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center" }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                }
              />
            </div>

            {/* Change Password link — under password, no divider */}
            <div style={{ paddingLeft: "calc(50% + 10px)", paddingBottom: changingPassword ? 0 : 16, marginTop: -8 }}>
              <button onClick={() => setChangingPassword(!changingPassword)} style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, textDecoration: "underline", padding: "0 0 0 12px" }}>
                {changingPassword ? "Cancel" : "Change Password?"}
              </button>
            </div>

            {/* New + Confirm fields */}
            {changingPassword && (
              <>
                <div className="pw-fields" style={{ paddingTop: 12 }}>
                  <InputBox
                    label="New Password"
                    icon={Lock}
                    type={showNew ? "text" : "password"}
                    rightEl={
                      <button onClick={() => setShowNew(!showNew)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center" }}>
                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <InputBox
                      label="Confirm Password"
                      icon={Lock}
                      type={showConfirm ? "text" : "password"}
                      rightEl={
                        <button onClick={() => setShowConfirm(!showConfirm)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center" }}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#e74c3c" }}>Passwords do not match</p>
                    )}
                  </div>
                </div>
                <div style={{ padding: "12px 16px 16px", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    disabled={!newPassword || newPassword !== confirmPassword}
                    style={{ padding: "8px 24px", borderRadius: 8, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: newPassword && newPassword === confirmPassword ? "pointer" : "not-allowed", background: newPassword && newPassword === confirmPassword ? "#FF6B00" : "#ffb87a", color: "white", transition: "background 0.2s" }}
                  >
                    Save Password
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;