// src/pages/SuperAdmin/Tenants/components/CompanyProfileStep.tsx
// Step 2: Build the company profile — logo, cover, details, contact, socials

import React, { useRef } from "react";
import type { CompanyFormData } from "../AddTenantPage";

interface CompanyProfileStepProps {
  form: CompanyFormData;
  setForm: React.Dispatch<React.SetStateAction<CompanyFormData>>;
}

const Field = ({
  label, value, onChange, placeholder, type = "text", textarea = false, maxLength, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean; maxLength?: number; hint?: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </label>
    {textarea ? (
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          style={{
            width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)",
            borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none",
            color: "var(--color-text)", background: "var(--color-surface)",
            resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#FF6B00"}
          onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
        />
        {maxLength && <div style={{ fontSize: 11, color: "var(--color-text-muted)", textAlign: "right", marginTop: 2 }}>{value.length}/{maxLength}</div>}
      </div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)",
          borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none",
          color: "var(--color-text)", background: "var(--color-surface)",
          boxSizing: "border-box", transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = "#FF6B00"}
        onBlur={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
      />
    )}
    {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-muted)" }}>{hint}</p>}
  </div>
);

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {children}
  </div>
);

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0 12px", borderBottom: "1px solid var(--color-border)", marginBottom: 16 }}>
    <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
  </div>
);

const CompanyProfileStep = ({ form, setForm }: CompanyProfileStepProps) => {
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleImg = (key: "logoFile" | "coverFile", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({
      ...f,
      [key]: file,
      [key === "logoFile" ? "logoPreview" : "coverPreview"]: url,
    }));
  };

  const update = (key: keyof CompanyFormData) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  return (
    <div>
      {/* ── Photos ── */}
      <SectionTitle
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
        title="Photos"
      />

      {/* Cover photo */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cover Photo</label>
        <div
          onClick={() => coverRef.current?.click()}
          style={{
            width: "100%", height: 140, borderRadius: 12, border: "2px dashed var(--color-border)",
            background: form.coverPreview ? "transparent" : "var(--color-bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", overflow: "hidden", position: "relative",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF6B00")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
        >
          {form.coverPreview ? (
            <>
              <img src={form.coverPreview} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,0.4)", padding: "6px 14px", borderRadius: 20 }}>Click to change</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>Upload cover photo</p>
            </div>
          )}
          <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImg("coverFile", e)} />
        </div>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Company Logo / Profile Photo</label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            onClick={() => logoRef.current?.click()}
            style={{
              width: 90, height: 90, borderRadius: "50%", border: "2px dashed var(--color-border)",
              background: form.logoPreview ? "transparent" : "var(--color-bg-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", flexShrink: 0,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FF6B00")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          >
            {form.logoPreview ? (
              <img src={form.logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )}
            <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImg("logoFile", e)} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>Company Logo</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>Click the circle to upload. Recommended: square image, min 200×200px.</p>
            <button onClick={() => logoRef.current?.click()} style={{ marginTop: 8, background: "none", border: "1.5px solid var(--color-border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
              Choose Photo
            </button>
          </div>
        </div>
      </div>

      {/* ── Company Details ── */}
      <SectionTitle
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        title="Company Details"
      />

      <Field label="Company Name *" value={form.name} onChange={update("name")} placeholder="e.g. Acme Corporation" />
      <Field label="Description" value={form.description} onChange={update("description")} placeholder="Brief description of the company..." textarea maxLength={300} />
      <FieldRow>
        <Field label="Industry" value={form.industry} onChange={update("industry")} placeholder="e.g. Education, Healthcare" />
        <Field label="Year Founded" value={form.year_founded} onChange={update("year_founded")} placeholder="e.g. 2010" type="number" />
      </FieldRow>
      <FieldRow>
        <Field label="Country" value={form.country} onChange={update("country")} placeholder="e.g. Philippines" />
        <Field label="Office Address" value={form.office_address} onChange={update("office_address")} placeholder="Full address" />
      </FieldRow>

      {/* ── Contact Information ── */}
      <SectionTitle
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.71 3.35 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
        title="Contact Information"
      />

      <FieldRow>
        <Field label="Contact Person" value={form.contact_person} onChange={update("contact_person")} placeholder="Full name" />
        <Field label="Contact Email" value={form.contact_email} onChange={update("contact_email")} placeholder="contact@company.com" type="email" />
      </FieldRow>
      <Field label="Phone Number" value={form.phone_number} onChange={update("phone_number")} placeholder="+63 900 000 0000" />

      {/* ── Socials ── */}
      <SectionTitle
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
        title="Socials & Website"
      />

      {[
        { key: "website_url" as const, label: "Website", placeholder: "https://company.com", color: "#4A90E2", icon: "🌐" },
        { key: "facebook_url" as const, label: "Facebook", placeholder: "https://facebook.com/company", color: "#1877F2", icon: "📘" },
        { key: "linkedin_url" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company", color: "#0A66C2", icon: "💼" },
        { key: "twitter_url" as const, label: "Twitter / X", placeholder: "https://x.com/company", color: "#1DA1F2", icon: "🐦" },
      ].map(({ key, label, placeholder, color, icon }) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--color-border)", borderRadius: 8, overflow: "hidden", transition: "border-color 0.2s" }}
            onFocusCapture={(e) => ((e.currentTarget as HTMLElement).style.borderColor = color)}
            onBlurCapture={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
          >
            <div style={{ width: 40, height: 40, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, borderRight: "1.5px solid var(--color-border)" }}>
              {icon}
            </div>
            <input
              type="url"
              value={form[key]}
              onChange={(e) => update(key)(e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1, border: "none", padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "var(--color-text)", background: "var(--color-surface)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyProfileStep;
