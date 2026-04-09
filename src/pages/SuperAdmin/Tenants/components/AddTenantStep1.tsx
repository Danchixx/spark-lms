import { useState, useRef } from "react";
import type { AddTenantForm } from "../SparkTenants";

interface AddTenantStep1Props {
  form: AddTenantForm;
  setForm: React.Dispatch<React.SetStateAction<AddTenantForm>>;
  onNext: () => void;
}

const AddTenantStep1 = ({ form, setForm, onNext }: AddTenantStep1Props) => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const bgRef      = useRef<HTMLInputElement>(null);

  const handleImg = (key: "profileImg" | "bgImg", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, [key]: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const generateId = () =>
    setCompanyId(String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0"));

  const imgRefs: Record<"profileImg" | "bgImg", React.RefObject<HTMLInputElement | null>> = {
    profileImg: profileRef,
    bgImg: bgRef,
  };

  return (
    <div style={s.card}>
      <div style={s.grid}>
        {/* Left — Company Details */}
        <div>
          <div style={s.sectionTitle}>Company Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              style={s.input}
              type="text"
              placeholder="Company Name"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            />
            <div>
              <textarea
                style={{ ...s.input, height: 90, resize: "vertical" }}
                placeholder="Company Details"
                maxLength={120}
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              />
              <div style={s.charCount}>{form.details.length}/120</div>
            </div>
            <div>
              <button style={s.genBtn} onClick={generateId}>
                GENERATE COMPANY ID
              </button>
              {companyId && <div style={s.genIdBox}>{companyId}</div>}
            </div>
          </div>

          {/* Profile and Background images */}
          <div style={{ marginTop: 20 }}>
            <div style={s.sectionTitle}>Profile and Background</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {(["profileImg", "bgImg"] as const).map((key) => (
                <div key={key}>
                  <div style={s.imgUpload} onClick={() => imgRefs[key].current?.click()}>
                    {form[key] ? (
                      <img src={form[key] as string} alt="upload"
                        style={{ maxWidth: "100%", maxHeight: 70, borderRadius: 4 }} />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                        stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"
                        strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                    <input type="file" ref={imgRefs[key]} accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleImg(key, e)} />
                  </div>
                  <div style={s.imgLabel}>choose image</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Contact and Socials */}
        <div>
          <div style={{ ...s.sectionTitle, textAlign: "center" }}>
            Contact and Socials
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {([
              { key: "phone"    as const, icon: "📱", bg: "#25D366", placeholder: "+63",               type: "tel"   },
              { key: "email"    as const, icon: "✉️", bg: "#EA4335", placeholder: "company@gmail.com", type: "email" },
              { key: "facebook" as const, icon: "📘", bg: "#1877F2", placeholder: "facebook",           type: "text"  },
            ]).map(({ key, icon, bg, placeholder, type }) => (
              <div key={key} style={s.socialRow}>
                <div style={{ ...s.socialIcon, background: bg }}>{icon}</div>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={s.socialInput}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.formNav}>
        <div />
        <button style={s.btnNext} onClick={onNext}>NEXT</button>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 10, border: "1px solid #eee",
    padding: 24, margin: "16px 0" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  sectionTitle: { fontWeight: 700, fontSize: 15, color: "#333", marginBottom: 14 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #FF6B00",
    borderRadius: 8, fontSize: 13, fontFamily: "'Barlow', sans-serif",
    outline: "none", background: "#fff", color: "#333", boxSizing: "border-box" },
  charCount: { fontSize: 11, color: "#aaa", textAlign: "right", marginTop: 4 },
  genBtn: { width: "100%", background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 12,
    cursor: "pointer", fontFamily: "'Barlow', sans-serif", letterSpacing: ".05em" },
  genIdBox: { background: "#fff", border: "2px solid #FF6B00", borderRadius: 8,
    padding: 10, textAlign: "center", fontWeight: 900, fontSize: 20,
    color: "#333", letterSpacing: 2, marginTop: 4 },
  imgUpload: { border: "2px dashed #ddd", borderRadius: 8, padding: 16,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", cursor: "pointer", minHeight: 90,
    background: "#fafafa", overflow: "hidden" },
  imgLabel: { fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 6 },
  socialRow: { display: "flex", alignItems: "center",
    border: "1.5px solid #FF6B00", borderRadius: 8, overflow: "hidden" },
  socialIcon: { width: 42, height: 42, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 18, flexShrink: 0 },
  socialInput: { border: "none", padding: "10px 10px", flex: 1, minWidth: 0,
    fontFamily: "'Barlow', sans-serif", fontSize: 13, outline: "none",
    background: "#fff", color: "#333" },
  formNav: { display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 20 },
  btnNext: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8,
    padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer",
    fontFamily: "'Barlow', sans-serif" },
};

export default AddTenantStep1;
