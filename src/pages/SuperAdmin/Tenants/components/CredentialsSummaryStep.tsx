// src/pages/SuperAdmin/Tenants/components/CredentialsSummaryStep.tsx
// Step 3: Auto-generated management account credentials summary

import React, { useState } from "react";
import type { CreatedCredential } from "../../../../services/tenantService";

interface CredentialsSummaryStepProps {
  companyName: string;
  credentials: CreatedCredential[];
  onFinish: () => void;
  isLoading?: boolean;
}

const roleColors: Record<string, { bg: string; color: string; label: string }> = {
  admin:   { bg: "#FFF0E6", color: "#FF6B00", label: "Admin" },
  creator: { bg: "#EFF6FF", color: "#2563EB", label: "Course Creator" },
  approver:{ bg: "#F0FDF4", color: "#16A34A", label: "Approver" },
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  creator: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  approver: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

const CredentialsSummaryStep = ({ companyName, credentials, onFinish, isLoading }: CredentialsSummaryStepProps) => {
  const [copied, setCopied] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (role: string) =>
    setShowPasswords((prev) => ({ ...prev, [role]: !prev[role] }));

  const handleCopyAll = () => {
    const text = credentials
      .map((c) => `${c.role.toUpperCase()}\nEmail: ${c.email}\nPassword: ${c.password}`)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 8px", fontFamily: "'Barlow', sans-serif" }}>
          Tenant Registered!
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
          <strong style={{ color: "var(--color-text)" }}>{companyName}</strong> has been added to the system.
          Below are the auto-generated management accounts. Please share these credentials securely.
        </p>
      </div>

      {/* Warning */}
      <div style={{ background: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p style={{ margin: 0, fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
          These passwords are temporary. Remind the tenant admin to change them upon first login. Copy and store them safely before closing this page.
        </p>
      </div>

      {/* Credential cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
        {credentials.map((cred) => {
          const meta = roleColors[cred.role] ?? { bg: "#F5F5F5", color: "#555", label: cred.role };
          const icon = roleIcons[cred.role];
          const showPw = showPasswords[cred.role];

          return (
            <div key={cred.role} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Role header */}
              <div style={{ padding: "12px 16px", background: meta.bg, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ color: meta.color }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 800, color: meta.color }}>{meta.label}</span>
              </div>
              {/* Credentials */}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, width: 70, flexShrink: 0 }}>Email</span>
                  <span style={{ fontSize: 13, color: "var(--color-text)", fontFamily: "monospace", flex: 1 }}>{cred.email}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(cred.email)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "2px 6px", borderRadius: 4 }}
                    title="Copy email"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, width: 70, flexShrink: 0 }}>Password</span>
                  <span style={{ fontSize: 13, color: "var(--color-text)", fontFamily: "monospace", flex: 1, letterSpacing: showPw ? "normal" : "0.2em" }}>
                    {showPw ? cred.password : "••••••••••••"}
                  </span>
                  <button
                    onClick={() => togglePassword(cred.role)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "2px 6px", borderRadius: 4 }}
                    title={showPw ? "Hide" : "Show"}
                  >
                    {showPw ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(cred.password)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "2px 6px", borderRadius: 4 }}
                    title="Copy password"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handleCopyAll}
          style={{
            flex: 1, padding: "12px 0", border: "2px solid #FF6B00",
            background: copied ? "#FF6B00" : "transparent", color: copied ? "#fff" : "#FF6B00",
            borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy All Credentials"}
        </button>
        <button
          onClick={onFinish}
          disabled={isLoading}
          style={{
            flex: 1, padding: "12px 0", border: "none",
            background: "linear-gradient(135deg, #FF6B00, #c0392b)", color: "#fff",
            borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Saving..." : "Go to Tenant List →"}
        </button>
      </div>
    </div>
  );
};

export default CredentialsSummaryStep;
