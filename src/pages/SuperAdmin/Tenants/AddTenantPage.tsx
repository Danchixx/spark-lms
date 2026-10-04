// src/pages/SuperAdmin/Tenants/AddTenantPage.tsx
// Standalone page at /superadmin/addtenant — 3-step tenant registration
// with progress bar + live company preview panel.

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PlanSelectionStep from "./components/PlanSelectionStep";
import CompanyProfileStep from "./components/CompanyProfileStep";
import CredentialsSummaryStep from "./components/CredentialsSummaryStep";
import { createTenantWithAccounts, uploadTenantImage } from "../../../services/tenantService";
import type { CreatedCredential } from "../../../services/tenantService";

// ── Form data shape ────────────────────────────────────────────
export interface CompanyFormData {
  name: string;
  description: string;
  industry: string;
  year_founded: string;
  country: string;
  office_address: string;
  contact_person: string;
  contact_email: string;
  phone_number: string;
  website_url: string;
  facebook_url: string;
  linkedin_url: string;
  twitter_url: string;
  logoFile: File | null;
  logoPreview: string;
  coverFile: File | null;
  coverPreview: string;
}

const EMPTY_FORM: CompanyFormData = {
  name: "", description: "", industry: "", year_founded: "",
  country: "", office_address: "", contact_person: "", contact_email: "",
  phone_number: "", website_url: "", facebook_url: "", linkedin_url: "",
  twitter_url: "", logoFile: null, logoPreview: "", coverFile: null, coverPreview: "",
};

const STEPS = ["Select Plan", "Company Profile", "Summary"];

// ── Progress bar ───────────────────────────────────────────────
const ProgressBar = ({ step }: { step: number }) => (
  <div style={{ padding: "20px 32px 0" }}>
    <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
      {STEPS.map((label, i) => {
        const done = step > i + 1;
        const active = step === i + 1;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                position: "absolute", top: 14, left: "50%", width: "100%", height: 3,
                background: done ? "#FF6B00" : "var(--color-border)",
                transition: "background 0.4s ease", zIndex: 0,
              }} />
            )}
            {/* circle */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%", zIndex: 1,
              background: done || active ? "#FF6B00" : "var(--color-surface)",
              border: `3px solid ${done || active ? "#FF6B00" : "var(--color-border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s ease", boxShadow: active ? "0 0 0 4px rgba(255,107,0,0.18)" : "none",
            }}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 800, color: active ? "#fff" : "var(--color-text-muted)" }}>{i + 1}</span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: active || done ? 700 : 500, color: active ? "#FF6B00" : done ? "var(--color-text)" : "var(--color-text-muted)", marginTop: 6, textAlign: "center", whiteSpace: "nowrap" }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// ── Live Preview Panel ─────────────────────────────────────────
const LivePreview = ({ form, plan }: { form: CompanyFormData; plan: "1_year" | "3_year" | null }) => {
  const planLabel = plan === "3_year" ? "3 Year" : plan === "1_year" ? "1 Year" : null;
  const planColor = plan === "3_year" ? "#7B3F00" : "#FF6B00";
  const initials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase()
    : "?";

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
      {/* Cover */}
      <div style={{ width: "100%", height: 110, background: form.coverPreview ? "transparent" : "linear-gradient(135deg, #c8d4e8, #8fa8c8)", overflow: "hidden", position: "relative" }}>
        {form.coverPreview ? (
          <img src={form.coverPreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 32, opacity: 0.2 }}>🏢</span>
          </div>
        )}
        {planLabel && (
          <div style={{ position: "absolute", top: 10, right: 10, background: planColor, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.1em" }}>
            {planLabel.toUpperCase()}
          </div>
        )}
      </div>

      {/* Logo + Name */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: -28, marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-surface)", border: "3px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, zIndex: 2 }}>
            {form.logoPreview ? (
              <img src={form.logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 16, fontWeight: 900, color: "var(--color-text-muted)" }}>{initials}</span>
            )}
          </div>
          <div style={{ minWidth: 0, paddingBottom: 4 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "var(--color-text-header)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {form.name || <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontWeight: 500 }}>Company name…</span>}
            </p>
            {form.industry && <p style={{ margin: 0, fontSize: 11, color: "#FF6B00", fontWeight: 600 }}>{form.industry}</p>}
          </div>
        </div>

        {form.description && (
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {form.description}
          </p>
        )}

        {/* Info rows */}
        {[
          { icon: "📧", val: form.contact_email },
          { icon: "📞", val: form.phone_number },
          { icon: "📍", val: form.country },
        ].filter((r) => r.val).map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11 }}>{r.icon}</span>
            <span style={{ fontSize: 11, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.val}</span>
          </div>
        ))}

        {/* Social links */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {form.facebook_url && <span style={{ fontSize: 10, background: "#1877F218", color: "#1877F2", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>Facebook</span>}
          {form.linkedin_url && <span style={{ fontSize: 10, background: "#0A66C218", color: "#0A66C2", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>LinkedIn</span>}
          {form.twitter_url && <span style={{ fontSize: 10, background: "#1DA1F218", color: "#1DA1F2", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>Twitter</span>}
          {form.website_url && <span style={{ fontSize: 10, background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>Website</span>}
        </div>
      </div>

      {/* Tip */}
      <div style={{ borderTop: "1px solid var(--color-border)", padding: "10px 16px", background: "var(--color-bg-subtle)" }}>
        <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-muted)", textAlign: "center" }}>Live preview — updates as you type</p>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
const AddTenantPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<"1_year" | "3_year" | null>(null);
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<CreatedCredential[]>([]);
  const [createdCompanyName, setCreatedCompanyName] = useState("");

  const canProceedStep1 = plan !== null;
  const canProceedStep2 = form.name.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!plan || !form.name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      // Upload images if provided
      let logoUrl = "";
      let coverUrl = "";
      const bucket = "company-assets";

      if (form.logoFile) {
        try {
          logoUrl = await uploadTenantImage(form.logoFile, bucket, `${slug}/logo-${Date.now()}`);
        } catch { /* Storage bucket may not exist; skip */ }
      }
      if (form.coverFile) {
        try {
          coverUrl = await uploadTenantImage(form.coverFile, bucket, `${slug}/cover-${Date.now()}`);
        } catch { /* skip */ }
      }

      const { credentials: creds } = await createTenantWithAccounts({
        name: form.name.trim(),
        slug,
        description: form.description || undefined,
        industry: form.industry || undefined,
        year_founded: form.year_founded ? parseInt(form.year_founded) : undefined,
        country: form.country || undefined,
        office_address: form.office_address || undefined,
        contact_person: form.contact_person || undefined,
        contact_email: form.contact_email || undefined,
        phone_number: form.phone_number || undefined,
        website_url: form.website_url || undefined,
        facebook_url: form.facebook_url || undefined,
        linkedin_url: form.linkedin_url || undefined,
        twitter_url: form.twitter_url || undefined,
        logo_url: logoUrl || undefined,
        cover_photo_url: coverUrl || undefined,
        plan,
      });

      setCredentials(creds);
      setCreatedCompanyName(form.name.trim());
      setStep(3);
    } catch (err: any) {
      setError(err?.message ?? "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [plan, form]);

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) handleSubmit();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "var(--color-bg)", minHeight: 0, height: "100%" }}>
      <style>{`
        .add-tenant-body { display: flex; flex-direction: row; gap: 28px; padding: 24px 32px 40px; flex: 1; min-height: 0; }
        .add-tenant-preview { width: 260px; flex-shrink: 0; }
        .add-tenant-form { flex: 1; min-width: 0; overflow-y: auto; }
        @media (max-width: 900px) {
          .add-tenant-body { flex-direction: column; padding: 16px; }
          .add-tenant-preview { width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 32px 0" }}>
          <button
            onClick={() => navigate("/superadmin/tenants")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", padding: "6px 8px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", fontFamily: "inherit", borderRadius: 6, transition: "all 0.2s", marginLeft: -8 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-subtle)"; e.currentTarget.style.color = "var(--color-text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            <ArrowLeft size={16} /> Back to Tenants
          </button>
          <span style={{ width: 1, height: 16, background: "var(--color-border)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>Register New Tenant</span>
        </div>
        <ProgressBar step={step} />
      </div>

      {/* Body */}
      <div className="add-tenant-body" style={{ overflowY: "auto" }}>
        {/* Left preview — shown only on step 2 */}
        {step === 2 && (
          <div className="add-tenant-preview" style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
            <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Preview</div>
            <LivePreview form={form} plan={plan} />
          </div>
        )}

        {/* Right form */}
        <div className="add-tenant-form">
          {/* Error banner */}
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 13, color: "#991B1B" }}>{error}</span>
            </div>
          )}

          {step === 1 && (
            <PlanSelectionStep selectedPlan={plan} onSelect={(p) => setPlan(p)} />
          )}

          {step === 2 && (
            <div style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", padding: "24px 28px", boxShadow: "var(--shadow)" }}>
              <CompanyProfileStep form={form} setForm={setForm} />
            </div>
          )}

          {step === 3 && (
            <CredentialsSummaryStep
              companyName={createdCompanyName}
              credentials={credentials}
              onFinish={() => navigate("/superadmin/tenants")}
            />
          )}

          {/* Navigation */}
          {step < 3 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  style={{ background: "none", border: "1.5px solid var(--color-border)", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, color: "var(--color-text-muted)", cursor: "pointer", fontFamily: "inherit" }}
                >
                  ← Back
                </button>
              ) : <div />}
              <button
                onClick={handleNext}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2 || isSubmitting}
                style={{
                  background: (step === 1 ? canProceedStep1 : canProceedStep2) && !isSubmitting
                    ? "linear-gradient(135deg, #FF8C00, #FF6B00)"
                    : "var(--color-border)",
                  color: (step === 1 ? canProceedStep1 : canProceedStep2) ? "#fff" : "var(--color-text-muted)",
                  border: "none", borderRadius: 10, padding: "11px 32px",
                  fontSize: 14, fontWeight: 800, cursor: (step === 1 ? canProceedStep1 : canProceedStep2) && !isSubmitting ? "pointer" : "not-allowed",
                  fontFamily: "inherit", letterSpacing: "0.04em", transition: "all 0.2s",
                }}
              >
                {step === 2 ? (isSubmitting ? "Registering…" : "Register Tenant →") : "Continue →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTenantPage;
