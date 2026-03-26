import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import ProfileCard from "../../components/common/ProfileCard/ProfileCard";
import { Lock, IdCard, ShieldCheck, Check, X, type LucideIcon } from "lucide-react";
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
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid var(--color-border)", borderRadius: 8, padding: "9px 12px", background: readOnly ? "var(--color-bg-subtle)" : "var(--color-surface)" }}>
      {Icon && <Icon size={16} color="var(--color-text-muted)" style={{ opacity: 0.6, flexShrink: 0 }} />}
      <input type={type} value={value} readOnly={readOnly} onChange={() => { }} style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "var(--color-text)", minWidth: 0 }} />
      {rightEl}
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 12px", borderBottom: "1px solid var(--color-border)" }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={13} color="#FF6B00" />
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "modal-fade-in 0.2s ease", backdropFilter: "blur(4px)" }}>
    <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: "36px 40px", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", border: "1px solid var(--color-border)" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34, 197, 94, 0.1)", border: "2px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Check size={28} color="#22c55e" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 8px" }}>Success!</h3>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>{message}</p>
      <button onClick={onClose} style={{ background: "#FF6B00", color: "white", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
    </div>
  </div>
);

const ReqRow = ({ met, label }: { met: boolean; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
    <div style={{ width: 16, height: 16, borderRadius: "50%", background: met ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1.5px solid ${met ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {met ? <Check size={9} color="#22c55e" /> : <X size={9} color="#f87171" />}
    </div>
    <span style={{ fontSize: 11, color: met ? "#22c55e" : "var(--color-text-muted)" }}>{label}</span>
  </div>
);

/* ── Page ── */
const Profile = () => {
  const { user, company, logout, updateProfile, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [newPassword] = useState("");

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

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

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
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
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 20px", color: "var(--color-text-header)" }}>Profile</h1>

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
            <div style={{ background: "var(--color-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", marginBottom: 28 }}>
              <div style={{ height: 5, background: "var(--color-bg-muted)" }} />
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
                  style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, textDecoration: "underline", padding: "0 0 0 12px" }}
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