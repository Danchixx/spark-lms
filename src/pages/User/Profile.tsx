import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import ProfileCard from "../../components/common/ProfileCard/ProfileCard";
import { Lock, Eye, EyeOff, IdCard, ShieldCheck, Check, X, type LucideIcon } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";


/* ── Password strength ── */
const getStrength = (pw: string) => {
  const checks = {
    length: pw.length >= 8, number: /[0-9]/.test(pw),
    letter: /[a-zA-Z]/.test(pw), uppercase: /[A-Z]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = pw.length === 0 ? null : passed <= 2 ? "weak" : passed <= 4 ? "medium" : "strong";
  return { checks, strength };
};
const SC = { weak: "#e74c3c", medium: "#f39c12", strong: "#27ae60" };
const SL = { weak: "Weak", medium: "Medium", strong: "Strong" };

/* ── Small components ── */
type InputBoxProps = {
  label: string;
  icon?: LucideIcon;
  value: string;
  type?: string;
  readOnly?: boolean;
  rightEl?: React.ReactNode;
};

const InputBox = ({ label, icon: Icon, value, type = "text", readOnly, rightEl }: InputBoxProps) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 12px", background: readOnly ? "#fafafa" : "white" }}>
      {Icon && <Icon size={16} color="#aaa" style={{ flexShrink: 0 }} />}
      <input type={type} value={value} readOnly={readOnly} onChange={() => { }} style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "#1a1a1a", minWidth: 0 }} />
      {rightEl}
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "modal-fade-in 0.2s ease" }}>
    <div style={{ background: "white", borderRadius: 16, padding: "36px 40px", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Check size={28} color="#22c55e" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>Success!</h3>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px", lineHeight: 1.6 }}>{message}</p>
      <button onClick={onClose} style={{ background: "#FF6B00", color: "white", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
    </div>
  </div>
);

const ReqRow = ({ met, label }: { met: boolean; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
    <div style={{ width: 16, height: 16, borderRadius: "50%", background: met ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${met ? "#22c55e" : "#fca5a5"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {met ? <Check size={9} color="#22c55e" /> : <X size={9} color="#f87171" />}
    </div>
    <span style={{ fontSize: 11, color: met ? "#16a34a" : "#888" }}>{label}</span>
  </div>
);

/* ── Page ── */
const Profile = () => {
  const { user, company, logout, updateProfile, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { checks, strength } = getStrength(newPassword);
  const passwordValid = Object.values(checks).every(Boolean) && newPassword === confirmPassword && newPassword.length > 0;

  const profileData = {
    lastName: user?.lastname || "",
    firstName: user?.firstname || "",
    middleName: user?.middlename || "", 
    email: user?.email || "",
    contactNumber: user?.contact_no || "",
    dateOfBirth: user?.date_of_birth || "",
    gender: user?.gender || "",
    address: user?.address || "",
    employeeId: user?.employee_id || "",
    jobTitle: user?.job_title || "",
    department: user?.department || "",
    dateHired: user?.date_hired || "",
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Just recently",
    status: user?.status || "Active",
    role: user?.role || "User",
    coursesAssigned: 0,
    avatarUrl: user?.avatar_url || null,
  };

  const handleSaveDetails = async (updated: { contactNumber: string; address: string }) => {
    try {
      await updateProfile({
        contact_no: updated.contactNumber,
        address: updated.address
      });
      setSuccessMessage("Your contact details have been updated successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to update profile:", err);
      // Fallback for user feedback if needed
    }
  };

  const handleAvatarChange = async (file: File) => {
    setIsAvatarLoading(true);
    try {
      await uploadAvatar(file);
      setSuccessMessage("Your profile photo has been updated successfully.");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleSavePassword = () => {
    setChangingPassword(false);
    setNewPassword(""); setConfirmPassword("");
    setSuccessMessage("Your password has been changed successfully.");
    setShowSuccessModal(true);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <style>{`
        .acct-row { display: flex; gap: 20px; padding: 16px; }
        .pw-fields { display: flex; gap: 20px; padding: 0 16px 16px; }
        @media (max-width: 1024px) {
          .acct-row { flex-direction: column; gap: 12px; }
          .pw-fields { flex-direction: column; }
        }
      `}</style>

      {showSuccessModal && <SuccessModal message={successMessage} onClose={() => setShowSuccessModal(false)} />}

      <Sidebar isOpen={sidebarOpen} activePage="Profile" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 20px" }}>Profile</h1>

            {/* ── Profile Card (reusable component) ── */}
            <div style={{ marginBottom: 16 }}>
              <ProfileCard
                profileData={profileData}
                editable={true}
                onSave={handleSaveDetails}
                onAvatarChange={handleAvatarChange}
                isUploading={isAvatarLoading}
              />
            </div>

            {/* ── Account Settings ── */}
            <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0", marginBottom: 28 }}>
              <div style={{ height: 5, background: "linear-gradient(90deg,#e0e0e0,#f0f0f0)" }} />
              <SectionTitle icon={ShieldCheck} title="Account Settings" />

              <div className="acct-row">
                <InputBox label="Username" icon={IdCard} value={profileData.email} readOnly />
                <InputBox
                  label="Password" icon={Lock}
                  value="••••••••••••••••••"
                  type="password"
                  readOnly
                />
              </div>

              <div style={{ paddingLeft: "calc(50% + 10px)", paddingBottom: 16, marginTop: -8 }}>
                <button
                  onClick={() => navigate(`/${slug}/settings`, { state: { activeTab: "security" } })}
                  style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, textDecoration: "underline", padding: "0 0 0 12px" }}
                >
                  Change Password?
                </button>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default Profile;