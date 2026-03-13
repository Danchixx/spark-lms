import { useState } from "react";
import { UserCircle, IdCard, Lock, Eye, EyeOff, Pencil } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";

const PROFILE_DATA = {
  lastName: "Andres",
  givenName: "Maverick Danielle",
  middleName: "Cruz",
  email: "danilogatch@gmail.com",
  employeeId: "EMP-00142",
  department: "Sales",
  role: "User",
  memberSince: "January 2024",
  status: "Active",
  contact: "+63 912 345 6789",
  address: "Pasig City, Metro Manila",
};

const FieldCell = ({ label, value }) => (
  <td style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0", verticalAlign: "top" }}>
    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{value || <span style={{ color: "#ccc" }}>—</span>}</div>
  </td>
);

const Profile = ({ user, onLogout, activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fullName = `${PROFILE_DATA.givenName} ${PROFILE_DATA.lastName}`;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage={activePage} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search courses, units ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>Profile</h1>

          {/* Profile Card */}
          <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            <div style={{ height: 6, background: "linear-gradient(90deg, #FF6B00, #ffb347)" }} />
            <div style={{ display: "flex", gap: 0, padding: 20 }}>

              {/* Left: Avatar */}
              <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px solid #f0f0f0", paddingRight: 20, marginRight: 20 }}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <UserCircle size={110} color="#ccc" strokeWidth={1} />
                  </div>
                  <button style={{ position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: "50%", background: "white", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Pencil size={13} color="#555" />
                  </button>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, textAlign: "center", lineHeight: 1.3, marginBottom: 4 }}>{fullName}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", letterSpacing: 1 }}>USER</div>
                <div style={{ marginTop: 12 }}>
                  <button style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                    <Pencil size={13} /> Edit your details
                  </button>
                </div>
              </div>

              {/* Right: Info Table */}
              <div style={{ flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                  <tbody>
                    <tr>
                      <FieldCell label="Last Name"   value={PROFILE_DATA.lastName} />
                      <FieldCell label="Given Name"  value={PROFILE_DATA.givenName} />
                      <FieldCell label="Middle Name" value={PROFILE_DATA.middleName} />
                    </tr>
                    <tr>
                      <FieldCell label="Email"       value={PROFILE_DATA.email} />
                      <FieldCell label="Employee ID" value={PROFILE_DATA.employeeId} />
                      <td style={{ borderBottom: "1px solid #f0f0f0" }} />
                    </tr>
                    <tr>
                      <FieldCell label="Department"  value={PROFILE_DATA.department} />
                      <FieldCell label="Role"        value={PROFILE_DATA.role} />
                      <td style={{ borderBottom: "1px solid #f0f0f0" }} />
                    </tr>
                    <tr>
                      <FieldCell label="Member Since" value={PROFILE_DATA.memberSince} />
                      <FieldCell label="Status"       value={PROFILE_DATA.status} />
                      <td style={{ borderBottom: "1px solid #f0f0f0" }} />
                    </tr>
                    <tr>
                      <FieldCell label="Contact" value={PROFILE_DATA.contact} />
                      <FieldCell label="Address" value={PROFILE_DATA.address} />
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>Account Settings</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Username */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Username</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "10px 14px" }}>
                  <IdCard size={18} color="#888" />
                  <span style={{ fontSize: 13, color: "#333" }}>{PROFILE_DATA.email}</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Password</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "10px 14px" }}>
                  <Lock size={18} color="#888" />
                  <span style={{ flex: 1, fontSize: 13, color: "#333", letterSpacing: 3 }}>
                    {showPassword ? "password123" : "••••••••••••••••••"}
                  </span>
                  <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {showPassword ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => setChangingPassword(!changingPassword)}
                    style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", padding: 0 }}
                  >
                    {changingPassword ? "Cancel" : "Change Password?"}
                  </button>
                </div>
              </div>

              {/* Change Password Fields */}
              {changingPassword && (
                <>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>New Password</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "10px 14px" }}>
                      <Lock size={18} color="#888" />
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", minWidth: 0 }}
                      />
                      <span onClick={() => setShowNew(!showNew)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {showNew ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Confirm Password</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "10px 14px" }}>
                      <Lock size={18} color="#888" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", minWidth: 0 }}
                      />
                      <span onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                        {showConfirm ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
                      </span>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <div style={{ fontSize: 11, color: "#e74c3c", marginTop: 4 }}>Passwords do not match</div>
                    )}
                  </div>

                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      disabled={!newPassword || newPassword !== confirmPassword}
                      style={{
                        background: newPassword && newPassword === confirmPassword ? "#FF6B00" : "#ffb87a",
                        color: "white", border: "none", borderRadius: 8,
                        padding: "10px 24px", fontWeight: 700, fontSize: 13,
                        cursor: newPassword && newPassword === confirmPassword ? "pointer" : "default",
                        fontFamily: "inherit", transition: "background 0.2s",
                      }}
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
    </div>
  );
};

export default Profile;