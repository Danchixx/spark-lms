// src/pages/SuperAdmin/Tenants/components/PlanSelectionStep.tsx
// Step 1: Choose 1-year or 3-year subscription plan

import React, { useState } from "react";

interface PlanSelectionStepProps {
  selectedPlan: "1_year" | "3_year" | null;
  onSelect: (plan: "1_year" | "3_year") => void;
}

const PLANS = [
  {
    key: "1_year" as const,
    label: "1 Year",
    duration: "12 months",
    tagline: "Great for getting started",
    features: [
      "Full platform access",
      "Unlimited course creation",
      "Admin, Creator & Approver accounts",
      "Email support",
      "Renewal reminder at 2 months",
    ],
    gradient: "linear-gradient(135deg, #FF8C00, #FF6B00)",
    badge: null,
  },
  {
    key: "3_year" as const,
    label: "3 Years",
    duration: "36 months",
    tagline: "Best value for committed organizations",
    features: [
      "Full platform access",
      "Unlimited course creation",
      "Admin, Creator & Approver accounts",
      "Priority support",
      "Renewal reminder at 2 months",
      "Extended commitment discount",
    ],
    gradient: "linear-gradient(135deg, #7B3F00, #c0392b)",
    badge: "RECOMMENDED",
  },
];

const PlanSelectionStep = ({ selectedPlan, onSelect }: PlanSelectionStepProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 8px", fontFamily: "'Barlow', sans-serif" }}>
          Choose a Subscription Plan
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
          The subscription duration determines how long the tenant can access the platform.
          They will be notified to renew 2 months before expiry.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.key;
          const isHovered = hovered === plan.key;

          return (
            <div
              key={plan.key}
              onClick={() => onSelect(plan.key)}
              onMouseEnter={() => setHovered(plan.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: isSelected ? "2.5px solid #FF6B00" : "2.5px solid var(--color-border)",
                background: "var(--color-surface)",
                cursor: "pointer",
                transition: "transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s cubic-bezier(.4,0,.2,1), border-color 0.2s",
                transform: isSelected || isHovered ? "translateY(-4px)" : "none",
                boxShadow: isSelected
                  ? "0 12px 40px rgba(255,107,0,0.22)"
                  : isHovered
                  ? "0 8px 28px rgba(0,0,0,0.12)"
                  : "0 2px 10px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {/* Recommended badge */}
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  background: "#FF6B00", color: "#fff",
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                  padding: "4px 10px", borderRadius: 20,
                  textTransform: "uppercase",
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div style={{
                background: plan.gradient,
                padding: "28px 24px 20px",
              }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Barlow', sans-serif", letterSpacing: "-1px" }}>
                  {plan.label}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                  {plan.duration} of access
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 6, fontStyle: "italic" }}>
                  {plan.tagline}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                  What's included
                </div>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: isSelected ? "rgba(255,107,0,0.12)" : "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#FF6B00" : "#888"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}

                {/* Select button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(plan.key); }}
                  style={{
                    marginTop: 20, width: "100%",
                    background: isSelected ? "#FF6B00" : "transparent",
                    color: isSelected ? "#fff" : "#FF6B00",
                    border: "2px solid #FF6B00",
                    borderRadius: 10, padding: "11px 0",
                    fontWeight: 800, fontSize: 13, cursor: "pointer",
                    fontFamily: "inherit", letterSpacing: "0.06em",
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {isSelected ? "✓ Selected" : "Select Plan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelectionStep;
