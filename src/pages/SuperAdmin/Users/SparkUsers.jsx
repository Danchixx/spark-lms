// src/pages/SuperAdmin/Users/SparkUsers.jsx
// Multi-tenant user directory and staff provisioning for SuperAdmin

import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { logAuditEvent } from "../../../services/auditService";
import { useAuth } from "../../../context/AuthContext";
import { useSATheme } from "../SAThemeContext";
import { StatusAndDateCell } from "../components/SALayout";
import { getTenantColorStyles, getStableTenantColor } from "../components/tenantColors";
import PageTransition from "../../../components/common/PageTransition";
import { Loader2, Plus, Eye, Key, Shield, UserCheck, AlertCircle, Check, X, Building2, User, Mail, Briefcase, Pencil, Phone, Hash, UserCog } from "lucide-react";

const ITEMS_PER_PAGE = 8;

// ─────────────────────────────────────────────────────────────
// Dropdown select with dark mode support
// ─────────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder, isDark }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", width: "100%" }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        background: "var(--bg)",
        border: "1.5px solid var(--line)",
        borderRadius: 10,
        padding: "9px 32px 9px 12px",
        fontSize: 13,
        color: value ? "var(--text)" : "var(--faint)",
        cursor: "pointer",
        fontFamily: "'Barlow', sans-serif",
        outline: "none",
        width: "100%",
        colorScheme: isDark ? "dark" : "light",
        transition: "border-color .2s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
    >
      {placeholder && (
        <option value="" style={{ background: "var(--card)", color: "var(--muted)" }}>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "var(--card)", color: "var(--text)" }}>
          {o.label}
        </option>
      ))}
    </select>
    <svg
      style={{ position: "absolute", right: 10, pointerEvents: "none" }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Stat summary cards
// ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, topBorderColor, icon, sub, subColor }) => (
  <div
    style={{
      background: "var(--card)",
      borderRadius: 14,
      border: "1px solid var(--line)",
      borderTop: `3px solid ${topBorderColor || accent}`,
      boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: subColor || "var(--green)", fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 12,
        background: `color-mix(in srgb, ${accent} 14%, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: accent,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  </div>
);

const ModalField = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
      {label}
    </div>
    <div
      style={{
        background: "var(--bg)",
        borderRadius: 6,
        padding: "8px 10px",
        fontSize: 13,
        color: value ? "var(--text)" : "var(--faint)",
        border: "1px solid var(--line)",
        minHeight: 34,
        display: "flex",
        alignItems: "center",
      }}
    >
      {value || "—"}
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 800,
      color: "var(--accent-text, #FF6B00)",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      marginBottom: 10,
    }}
  >
    {title}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Add Staff Modal (Tenant Admin or Course Creator provisioning)
// ─────────────────────────────────────────────────────────────
const AddStaffModal = ({ companies, roles, onClose, onSuccess, theme }) => {
  const { user: currentAdmin } = useAuth();
  const [companyId, setCompanyId] = useState(companies[0]?.id || "");
  const [roleName, setRoleName] = useState("admin"); // 'admin' or 'course creator'
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGeneratePassword = () => {
    const selectedComp = companies.find((c) => String(c.id) === String(companyId));
    const compSlug = selectedComp ? selectedComp.slug.toUpperCase() : "SPARK";
    const rand = Math.floor(1000 + Math.random() * 9000);
    setPassword(`Spark-${compSlug}-${rand}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create in Supabase Auth via Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke("create-admin-user", {
        body: {
          email: email.trim(),
          password: password.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          sendEmail: false,
        },
      });

      if (fnError) throw new Error(fnError.message || "Failed to create Auth account");
      if (fnData?.error) throw new Error(fnData.error);

      const authUserId = fnData.user.id;

      // 2. Find target role ID
      const targetRole = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
      if (!targetRole) throw new Error(`Role '${roleName}' not found in database.`);

      // 3. Insert into public.users
      const { error: dbError } = await supabase.from("users").insert({
        id: authUserId,
        company_id: Number(companyId),
        role_id: targetRole.id,
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        department: department.trim() || null,
        job_title: jobTitle.trim() || (roleName === "admin" ? "Tenant Administrator" : "Course Creator"),
        status: "active",
        created_by: currentAdmin?.id || null,
      });

      if (dbError) throw dbError;

      // 4. Log audit trail
      await logAuditEvent({
        action: "PROVISION_TENANT_STAFF",
        tableName: "users",
        userId: currentAdmin?.id || null,
        newValue: {
          email: email.trim(),
          company_id: companyId,
          role: roleName,
          staff_name: `${firstName} ${lastName}`,
        },
      });

      onSuccess();
    } catch (err) {
      console.error("Staff creation failed:", err);
      setErrorMsg(err.message || "Failed to create staff account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      data-sa-theme={theme}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 14,
          border: "1px solid var(--line)",
          width: "min(560px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow, 0 24px 80px rgba(0,0,0,.4))",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text)" }}>Provision Tenant Staff</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
              Create an Administrator or Course Creator account for a tenant organization.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 8,
              color: "#ef4444",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Company Selection */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
              Tenant Company *
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Role Choice */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
              Assigned Role *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                onClick={() => setRoleName("admin")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `2px solid ${roleName === "admin" ? "#FF6B00" : "var(--line)"}`,
                  background: roleName === "admin" ? "rgba(255, 107, 0, 0.08)" : "var(--bg)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Tenant Admin</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Manages users</div>
              </div>

              <div
                onClick={() => setRoleName("course creator")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `2px solid ${roleName === "course creator" ? "#FF6B00" : "var(--line)"}`,
                  background: roleName === "course creator" ? "rgba(255, 107, 0, 0.08)" : "var(--bg)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Course Creator</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Creates courses and assessments</div>
              </div>
            </div>
          </div>

          {/* First & Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                First Name *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Juan"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Last Name *
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dela Cruz"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@company.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Password *</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-text, #FF6B00)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter or generate temporary password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "monospace",
              }}
            />
          </div>

          {/* Department & Job Title */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Department
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Operations / L&D"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Job Title
              </label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Admin Lead / Content Designer"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#FF6B00",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Creating Staff...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// User Inspection & Management Modal (Unified Manage & Edit Card)
// ─────────────────────────────────────────────────────────────
const UserModal = ({
  user,
  companies = [],
  roles = [],
  onClose,
  onSuccess,
  theme,
}) => {
  const { user: currentAdmin } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const isLearner = (currentUser?.roleName || user?.roleName) === "user";

  // Mode: Viewing vs Editing (Learners can NEVER edit)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Edit Form Fields
  const [editForm, setEditForm] = useState({
    firstName: user?.firstname || "",
    lastName: user?.lastname || "",
    email: user?.email || "",
    companyId: user?.company_id ? String(user.company_id) : "",
    roleName: user?.roleName === "course creator" || user?.roleName === "creator" ? "course creator" : "admin",
    department: user?.department || "",
    jobTitle: user?.job_title || "",
    status: user?.status || "active",
    employeeId: user?.employee_id || "",
    contactNo: user?.contact_no || "",
  });

  // Password Reset State
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  // Keep state synced when user prop changes
  useEffect(() => {
    setCurrentUser(user);
    setIsEditing(false);
    setSaveSuccess(false);
    setSaveError("");
    setResetSuccess(false);
    setResetError("");
    setNewPassword("");
    setEditForm({
      firstName: user?.firstname || "",
      lastName: user?.lastname || "",
      email: user?.email || "",
      companyId: user?.company_id ? String(user.company_id) : "",
      roleName: user?.roleName === "course creator" || user?.roleName === "creator" ? "course creator" : "admin",
      department: user?.department || "",
      jobTitle: user?.job_title || "",
      status: user?.status || "active",
      employeeId: user?.employee_id || "",
      contactNo: user?.contact_no || "",
    });
  }, [user]);

  const handleStartEdit = () => {
    if (isLearner) return;
    setSaveSuccess(false);
    setSaveError("");
    setEditForm({
      firstName: currentUser?.firstname || "",
      lastName: currentUser?.lastname || "",
      email: currentUser?.email || "",
      companyId: currentUser?.company_id ? String(currentUser.company_id) : "",
      roleName: currentUser?.roleName === "course creator" || currentUser?.roleName === "creator" ? "course creator" : "admin",
      department: currentUser?.department || "",
      jobTitle: currentUser?.job_title || "",
      status: currentUser?.status || "active",
      employeeId: currentUser?.employee_id || "",
      contactNo: currentUser?.contact_no || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim() || !editForm.companyId) {
      setSaveError("Please complete all required fields (First Name, Last Name, Email, Organization).");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const targetRole = roles.find((r) => r.name.toLowerCase() === editForm.roleName.toLowerCase());
      if (!targetRole) {
        throw new Error(`Role '${editForm.roleName}' not found in the database.`);
      }

      const updates = {
        firstname: editForm.firstName.trim(),
        lastname: editForm.lastName.trim(),
        email: editForm.email.trim(),
        company_id: Number(editForm.companyId),
        role_id: targetRole.id,
        department: editForm.department.trim() || null,
        job_title: editForm.jobTitle.trim() || (editForm.roleName === "admin" ? "Tenant Administrator" : "Course Creator"),
        status: editForm.status,
        employee_id: editForm.employeeId.trim() || null,
        contact_no: editForm.contactNo.trim() || null,
      };

      const { error: dbError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", currentUser.id);

      if (dbError) throw dbError;

      // Log Audit Event
      await logAuditEvent({
        action: "UPDATE_TENANT_STAFF",
        tableName: "users",
        userId: currentAdmin?.id || null,
        oldValue: {
          firstname: currentUser.firstname,
          lastname: currentUser.lastname,
          email: currentUser.email,
          company_id: currentUser.company_id,
          role_id: currentUser.role_id,
          status: currentUser.status,
          department: currentUser.department,
          job_title: currentUser.job_title,
          employee_id: currentUser.employee_id,
          contact_no: currentUser.contact_no,
        },
        newValue: {
          ...updates,
          target_user_id: currentUser.id,
        },
      });

      // Update local currentUser representation
      const targetComp = companies.find((c) => String(c.id) === String(updates.company_id));
      const updatedUserObj = {
        ...currentUser,
        ...updates,
        name: `${updates.firstname} ${updates.lastname}`.trim(),
        roleName: editForm.roleName,
        companyName: targetComp?.name || currentUser.companyName,
        companyColor: getStableTenantColor(updates.company_id),
      };

      setCurrentUser(updatedUserObj);
      setSaveSuccess(true);
      setIsEditing(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to update staff:", err);
      setSaveError(err.message || "Failed to update staff details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      setResetError("Enter a new password first.");
      return;
    }
    setIsResetting(true);
    setResetError("");
    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: {
          action: "reset_password",
          userId: currentUser.id,
          newPassword: newPassword.trim(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResetSuccess(true);
      await logAuditEvent({
        action: "RESET_STAFF_PASSWORD",
        tableName: "users",
        userId: currentAdmin?.id || null,
        newValue: { target_user_id: currentUser.id, email: currentUser.email },
      });
    } catch (err) {
      setResetError(err.message || "Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    const isAct = s === "active";
    const isPend = s === "pending";
    const bg = isAct ? "rgba(34, 197, 94, 0.12)" : isPend ? "rgba(234, 179, 8, 0.12)" : "rgba(239, 68, 68, 0.12)";
    const color = isAct ? "#22c55e" : isPend ? "#eab308" : "#ef4444";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          background: bg,
          color: color,
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        {status || "ACTIVE"}
      </span>
    );
  };

  return (
    <div
      onClick={onClose}
      data-sa-theme={theme}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 16,
          border: "1px solid var(--line)",
          width: "min(780px, 95vw)",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow, 0 24px 80px rgba(0,0,0,.4))",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--card-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: currentUser?.companyColor || "#FF6B00",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              {currentUser?.firstname?.[0]?.toUpperCase() || currentUser?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
                  {currentUser?.firstname} {currentUser?.lastname}
                </span>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: !isLearner ? "rgba(255, 107, 0, 0.12)" : "rgba(59, 130, 246, 0.12)",
                    color: !isLearner ? "#FF6B00" : "#3b82f6",
                  }}
                >
                  {currentUser?.roleName}
                </span>
                {isEditing && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background: "rgba(255, 107, 0, 0.15)",
                      color: "#FF6B00",
                      border: "1px solid rgba(255, 107, 0, 0.3)",
                    }}
                  >
                    Editing Mode
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                {currentUser?.email} • <strong style={{ color: "var(--text)" }}>{currentUser?.companyName}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s",
            }}
            title="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informative Banner for Learners (Strict Read-Only) */}
        {isLearner && (
          <div
            style={{
              padding: "12px 24px",
              background: "rgba(59, 130, 246, 0.08)",
              borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            <Shield size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
            <span>
              <strong>Tenant Learner Account</strong> — Managed exclusively by <strong>{currentUser?.companyName}</strong>'s Administrator. SuperAdmin has read-only audit visibility.
            </span>
          </div>
        )}

        {/* Content body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Success Notification */}
          {saveSuccess && !isEditing && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
                borderRadius: 8,
                fontSize: 13,
                border: "1px solid rgba(34, 197, 94, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Check size={16} />
              <span>Staff details updated successfully and logged in audit trails.</span>
            </div>
          )}

          {/* EDIT FORM (When Editing Staff) */}
          {isEditing && !isLearner ? (
            <form id="staff-edit-form" onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Informative Banner */}
              <div
                style={{
                  padding: "12px 18px",
                  background: "rgba(255, 107, 0, 0.08)",
                  border: "1px solid rgba(255, 107, 0, 0.25)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                <Pencil size={18} color="#FF6B00" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Staff Account Editor</strong> — Modify role assignments, tenant organization, profile information, and account status.
                </span>
              </div>

              {/* Error Alert */}
              {saveError && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    borderRadius: 8,
                    fontSize: 13,
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 8 }}>
                  Staff Role *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div
                    onClick={() => setEditForm((prev) => ({ ...prev, roleName: "admin" }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `2px solid ${editForm.roleName === "admin" ? "#FF6B00" : "var(--line)"}`,
                      background: editForm.roleName === "admin" ? "rgba(255, 107, 0, 0.08)" : "var(--bg)",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Tenant Admin</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Manages users</div>
                  </div>

                  <div
                    onClick={() => setEditForm((prev) => ({ ...prev, roleName: "course creator" }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `2px solid ${editForm.roleName === "course creator" ? "#FF6B00" : "var(--line)"}`,
                      background: editForm.roleName === "course creator" ? "rgba(255, 107, 0, 0.08)" : "var(--bg)",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Course Creator</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Creates courses and assessments</div>
                  </div>
                </div>
              </div>

              {/* Organization / Tenant */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                  Organization / Tenant Assignment *
                </label>
                <select
                  value={editForm.companyId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, companyId: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "var(--card)", color: "var(--text)" }}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* First & Last Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    First Name *
                  </label>
                  <input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Last Name *
                  </label>
                  <input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Email & Contact Number */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@company.com"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.contactNo}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, contactNo: e.target.value }))}
                    placeholder="e.g. 0917-123-4567"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Department & Job Title */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Department
                  </label>
                  <input
                    value={editForm.department}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g. Training & Academic"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Job Title / Position
                  </label>
                  <input
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="e.g. Lead Instructor"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Employee ID & Account Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Employee ID
                  </label>
                  <input
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="e.g. EMP-001"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    <option value="active" style={{ background: "var(--card)", color: "var(--text)" }}>Active</option>
                    <option value="pending" style={{ background: "var(--card)", color: "var(--text)" }}>Pending</option>
                    <option value="suspended" style={{ background: "var(--card)", color: "var(--text)" }}>Suspended</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <>
              {/* VIEW PROFILE DISPLAY */}
              <div>
                <SectionTitle title="Account Profile" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <ModalField label="First Name" value={currentUser?.firstname} />
                  <ModalField label="Last Name" value={currentUser?.lastname} />
                  <ModalField label="Role" value={currentUser?.roleName?.toUpperCase()} />
                  <ModalField label="Organization" value={currentUser?.companyName} />
                  <ModalField label="Email Address" value={currentUser?.email} />
                  <ModalField label="Contact Number" value={currentUser?.contact_no} />
                  <ModalField label="Employee ID" value={currentUser?.employee_id} />
                  <ModalField label="Department" value={currentUser?.department} />
                  <ModalField label="Job Position" value={currentUser?.job_title} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
                      Account Status
                    </div>
                    <div
                      style={{
                        background: "var(--bg)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        border: "1px solid var(--line)",
                        minHeight: 34,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getStatusBadge(currentUser?.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Password Reset (For Staff Only) */}
              {!isLearner && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 18, background: "var(--bg)" }}>
                  <SectionTitle title="Staff Credentials & Access" />
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
                    As SuperAdmin, you can issue password overrides for Tenant Administrators and Course Creators.
                  </p>

                  {resetSuccess && (
                    <div style={{ padding: "8px 12px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                      ✓ Password has been updated successfully.
                    </div>
                  )}
                  {resetError && (
                    <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                      {resetError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, maxWidth: 440 }}>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New temporary password"
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--line)",
                        background: "var(--card)",
                        color: "var(--text)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handlePasswordReset}
                      disabled={isResetting}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: "#FF6B00",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: isResetting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isResetting ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Unified Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--card-2)",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {isEditing
              ? "Review changes before saving."
              : isLearner
              ? "Read-only learner audit view"
              : "Staff account management"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isEditing ? (
              <>
                <button
                  key="cancel-btn"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    color: "var(--text)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  key="save-btn"
                  type="submit"
                  form="staff-edit-form"
                  disabled={isSaving}
                  style={{
                    padding: "8px 22px",
                    borderRadius: 8,
                    border: "none",
                    background: "#FF6B00",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(255, 107, 0, 0.25)",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={15} /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  key="close-btn"
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    color: "var(--text)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                {!isLearner && (
                  <button
                    key="edit-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartEdit();
                    }}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "#FF6B00",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 2px 8px rgba(255, 107, 0, 0.25)",
                    }}
                  >
                    <Pencil size={14} />
                    <span>Edit Details</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main SparkUsers Page Component
// ─────────────────────────────────────────────────────────────
const SparkUsers = () => {
  const { theme } = useSATheme();
  const isDark = theme === "dark";

  // State
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab: 'staff' | 'learners' | 'all'
  const [activeTab, setActiveTab] = useState("staff");

  // Modals
  const [inspectUser, setInspectUser] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // 1. Fetch live data from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch users with company and role joins
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          firstname,
          lastname,
          middlename,
          email,
          status,
          created_at,
          employee_id,
          contact_no,
          department,
          job_title,
          role_id,
          company_id,
          roles(id, name),
          company:companies!users_company_id_fkey(id, name, slug, logo_url)
        `)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch active companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url")
        .eq("is_archived", false)
        .order("name", { ascending: true });

      if (companiesError) throw companiesError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name");

      if (rolesError) throw rolesError;

      // Format user rows
      const formatted = (usersData || []).map((u) => {
        const foundRole = (rolesData || []).find((r) => r.id === u.role_id);
        const rName = (foundRole?.name || (Array.isArray(u.roles) ? u.roles[0]?.name : u.roles?.name) || "user").toLowerCase();
        const foundCompany = (companiesData || []).find((c) => c.id === u.company_id);
        const cName = foundCompany?.name || u.company?.name || "Unassigned";
        const cColor = getStableTenantColor(u.company_id);
        return {
          ...u,
          name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || u.email,
          roleName: rName,
          companyName: cName,
          companyColor: cColor,
        };
      });

      setUsers(formatted);
      setCompanies(companiesData || []);
      setRoles(rolesData || []);
    } catch (err) {
      console.error("Failed to load user directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered dataset
  const filtered = useMemo(() => {
    return users.filter((u) => {
      // Exclude platform superadmin from client-side listing
      if (u.roleName === "superadmin" || u.roleName === "spark_admin") return false;

      // Tab filtering
      if (activeTab === "staff") {
        if (u.roleName !== "admin" && u.roleName !== "course creator" && u.roleName !== "creator") {
          return false;
        }
      } else if (activeTab === "learners") {
        if (u.roleName !== "user") {
          return false;
        }
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesEmpId = u.employee_id ? u.employee_id.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesEmail && !matchesEmpId) return false;
      }

      // Company filter
      if (companyFilter && String(u.company_id) !== String(companyFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter && u.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [users, activeTab, search, companyFilter, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Statistics
  const totalStaffCount = users.filter((u) => u.roleName === "admin" || u.roleName === "course creator" || u.roleName === "creator").length;
  const totalLearnerCount = users.filter((u) => u.roleName === "user").length;
  const totalTenantsCount = companies.length;

  return (
    <PageTransition>
      <div
        style={{
          padding: 24,
          minHeight: "100%",
          background: "var(--bg)",
          fontFamily: "'Barlow', sans-serif",
          color: "var(--text)",
        }}
      >
        {/* Page Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 26,
                color: "var(--text)",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              USER & STAFF DIRECTORY
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Platform-wide tenant administration and learner oversight
            </div>
          </div>

          <button
            onClick={() => setShowAddStaffModal(true)}
            style={{
              background: "#FF6B00",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(255, 107, 0, 0.25)",
            }}
          >
            <Plus size={16} />
            <span>New Staff Account</span>
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <StatCard
            label="Tenant Staff"
            value={totalStaffCount}
            accent="#FF6B00"
            topBorderColor="#FF6B00"
            sub="Tenant Admins & Creators"
            icon={<Briefcase size={22} />}
          />
          <StatCard
            label="Tenant Learners"
            value={totalLearnerCount}
            accent="#3b82f6"
            topBorderColor="#3b82f6"
            sub="Managed by Tenant Admins"
            icon={<User size={22} />}
          />
          <StatCard
            label="Active Organizations"
            value={totalTenantsCount}
            accent="#22c55e"
            topBorderColor="#22c55e"
            sub="Multi-tenant workspaces"
            icon={<Building2 size={22} />}
          />
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: "flex",
            gap: 6,
            borderBottom: "1px solid var(--line)",
            marginBottom: 18,
          }}
        >
          {[
            { key: "staff", label: "Tenant Staff (Admins & Creators)", count: totalStaffCount },
            { key: "learners", label: "Tenant Learners", count: totalLearnerCount },
            { key: "all", label: "All Accounts", count: totalStaffCount + totalLearnerCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              style={{
                padding: "10px 18px",
                border: "none",
                background: "transparent",
                color: activeTab === tab.key ? "#FF6B00" : "var(--muted)",
                fontWeight: activeTab === tab.key ? 700 : 600,
                fontSize: 14,
                cursor: "pointer",
                borderBottom: `2px solid ${activeTab === tab.key ? "#FF6B00" : "transparent"}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: activeTab === tab.key ? "rgba(255, 107, 0, 0.15)" : "var(--bg)",
                  color: activeTab === tab.key ? "#FF6B00" : "var(--muted)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Read-Only Notice when viewing Learners */}
        {activeTab === "learners" && (
          <div
            style={{
              padding: "12px 18px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: 10,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            <Shield size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
            <div>
              <strong>Tenant Admin Ownership Rule:</strong> End-user learners are provisioned and managed directly by each organization's Tenant Administrator. SuperAdmin has read-only access for cross-tenant monitoring.
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 14,
            border: "1px solid var(--line)",
            padding: "16px 20px",
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "minmax(240px, 1.5fr) minmax(180px, 1fr) minmax(150px, 1fr) auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, employee ID..."
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "1.5px solid var(--line)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
            }}
          />

          {/* Company Filter */}
          <Select
            value={companyFilter}
            onChange={(val) => {
              setCompanyFilter(val);
              setPage(1);
            }}
            placeholder="All Organizations"
            isDark={isDark}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            placeholder="All Statuses"
            isDark={isDark}
            options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ]}
          />

          {/* Clear button */}
          {(search || companyFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setCompanyFilter("");
                setStatusFilter("");
                setPage(1);
              }}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                background: "var(--bg)",
                color: "var(--muted)",
                border: "1px solid var(--line)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Directory Table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: 14,
            border: "1px solid var(--line)",
            overflow: "hidden",
            boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--muted)" }}>
              <Loader2 className="animate-spin" size={32} color="#FF6B00" style={{ margin: "0 auto 12px" }} />
              <div>Loading directory from Supabase...</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "var(--card-2)" }}>
                    {["User & Email", "Organization", "Role", "Status & Registered", "Action"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "13px 18px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--line)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                        No records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paged.map((u) => {
                      const isStaff = u.roleName === "admin" || u.roleName === "course creator" || u.roleName === "creator";
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          {/* User info */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: u.companyColor || "#FF6B00",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {u.firstname?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Organization */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: u.companyColor || "#FF6B00" }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{u.companyName}</span>
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: "13px 18px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                background: isStaff ? "rgba(255, 107, 0, 0.12)" : "rgba(59, 130, 246, 0.12)",
                                color: isStaff ? "#FF6B00" : "#3b82f6",
                              }}
                            >
                              {u.roleName}
                            </span>
                          </td>

                          {/* Status & Date */}
                          <td style={{ padding: "13px 18px" }}>
                            <StatusAndDateCell
                              status={u.status === "active" ? "Active" : u.status}
                              date={u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                            />
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: "13px 18px" }}>
                            <button
                              onClick={() => setInspectUser(u)}
                              style={{
                                background: isStaff ? "rgba(255, 107, 0, 0.08)" : "var(--card-2)",
                                color: isStaff ? "#FF6B00" : "var(--text)",
                                border: `1.5px solid ${isStaff ? "rgba(255, 107, 0, 0.35)" : "var(--line)"}`,
                                borderRadius: 8,
                                padding: "6px 14px",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all .15s ease",
                              }}
                              title={isStaff ? "Manage staff account" : "View learner profile"}
                            >
                              {isStaff ? <UserCog size={14} /> : <Eye size={14} />}
                              <span>{isStaff ? "Manage" : "View"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 18px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Showing <strong>{paged.length}</strong> of <strong>{filtered.length}</strong> accounts
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 12,
                  cursor: safePage === 1 ? "not-allowed" : "pointer",
                  opacity: safePage === 1 ? 0.4 : 1,
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 12,
                  cursor: safePage === totalPages ? "not-allowed" : "pointer",
                  opacity: safePage === totalPages ? 0.4 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <AddStaffModal
            companies={companies}
            roles={roles}
            onClose={() => setShowAddStaffModal(false)}
            onSuccess={() => {
              setShowAddStaffModal(false);
              loadData();
            }}
            theme={theme}
          />
        )}

        {/* Inspect / Manage User Modal */}
        {inspectUser && (
          <UserModal
            user={inspectUser}
            companies={companies}
            roles={roles}
            onClose={() => setInspectUser(null)}
            onSuccess={() => {
              loadData();
            }}
            theme={theme}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SparkUsers;
