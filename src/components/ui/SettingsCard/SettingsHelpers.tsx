import { useState } from "react";
import { Check, X } from "lucide-react";

/* ── Toggle Switch ── */
export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <label className="toggle-switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="toggle-track" />
  </label>
);

/* ── Password Strength ── */
export const getStrength = (pw: string) => {
  const checks = {
    length: pw.length >= 8,
    number: /[0-9]/.test(pw),
    letter: /[a-zA-Z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = pw.length === 0 ? null : passed <= 2 ? "weak" : passed <= 4 ? "medium" : "strong";
  return { checks, strength };
};

export const STRENGTH_COLORS: Record<string, string> = { weak: "#e74c3c", medium: "#f39c12", strong: "#27ae60" };
export const STRENGTH_LABELS: Record<string, string> = { weak: "Weak", medium: "Medium", strong: "Strong" };

export const ReqRow = ({ met, label }: { met: boolean; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
    <div style={{
      width: 16, height: 16, borderRadius: "50%",
      background: met ? "#f0fdf4" : "#fef2f2",
      border: `1.5px solid ${met ? "#22c55e" : "#fca5a5"}`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      {met ? <Check size={9} color="#22c55e" /> : <X size={9} color="#f87171" />}
    </div>
    <span style={{ fontSize: 11, color: met ? "#16a34a" : "#888" }}>{label}</span>
  </div>
);
