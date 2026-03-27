import { useState } from "react";
import AddTenantStep1 from "./AddTenantStep1";
import AddTenantStep2 from "./AddTenantStep2";
import AddTenantStep3 from "./AddTenantStep3";
import AddTenantStep4 from "./AddTenantStep4";
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../../../components/layout/Sidebar/SASidebar";

const STEPS = ["Company Profile", "Plan", "Add Roles"];

// stepIdx: 0 = profile, 1 = plan/payment, 2 = roles
const stepIndex = (step) => (step <= 2 ? step - 1 : 2);

// ── Stepper ───────────────────────────────────────────────────
const Stepper = ({ step }) => {
  const idx = stepIndex(step);
  return (
    <div style={{
      padding: "12px 20px 0",
      borderBottom: "1px solid #eee",
      background: "#fff",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        paddingBottom: 14,
        position: "relative",
      }}>
        {STEPS.map((label, i) => {
          const done   = idx > i;
          const active = idx === i;
          return (
            <div key={label} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}>
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: 7, left: "50%",
                  width: "100%", height: 2,
                  zIndex: 1,
                  background: done ? "#FF6B00" : "#ddd",
                  transition: "background 0.4s ease",
                }} />
              )}
              <div style={{
                width: 14, height: 14,
                borderRadius: "50%",
                zIndex: 2,
                marginBottom: 6,
                background: done || active ? "#FF6B00" : "#fff",
                border: `2px solid ${done || active ? "#FF6B00" : "#ddd"}`,
                transition: "background 0.3s ease, border-color 0.3s ease",
              }} />
              <div style={{
                fontSize: 12,
                whiteSpace: "nowrap",
                fontWeight: 500,
                color: done || active ? "#555" : "#aaa",
                transition: "color 0.3s ease",
              }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── AddTenant ─────────────────────────────────────────────────
const AddTenant = ({ onBack, onFinish, sidebarOpen = true }) => {
  const [step, setStep]                 = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    companyName: "", details: "",
    phone: "", email: "", facebook: "",
    profileImg: null, bgImg: null,
  });

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    setStep(3);
  };

  const handleFinish = (roles, roleData) => {
    onFinish({ form, selectedPlan, roles, roleData });
  };

  // Height of breadcrumb (~48px) + stepper (~52px)
  const FIXED_HEADER_H = 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

      {/* ── Fixed header: breadcrumb + stepper ── */}
      <div style={{
        position: "fixed",
        top: TOPBAR_HEIGHT,
        left: sidebarOpen ? SIDEBAR_WIDTH : 0,
        right: 0,
        zIndex: 90,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,.06)",
        transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Breadcrumb row */}
        <div style={{
          borderBottom: "1px solid #eee",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <button onClick={onBack} style={s.bcBtn}>‹ TENANT LIST</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>
            ADD NEW TENANT
          </span>
        </div>

        {/* Stepper */}
        <Stepper step={step} />
      </div>

      {/* ── Scrollable content — offset only by fixed header height ── */}
      <div style={{
        marginTop: FIXED_HEADER_H,
        padding: "20px 20px 32px",
        flex: 1,
        overflowY: "auto",
      }}>
        {step === 1 && (
          <AddTenantStep1
            form={form}
            setForm={setForm}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <AddTenantStep2
            selectedPlan={selectedPlan}
            onSelect={handlePlanSelect}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <AddTenantStep3
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            onCancel={onBack}
          />
        )}
        {step === 4 && (
          <AddTenantStep4
            onBack={() => setStep(3)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};

const s = {
  bcBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#FFF0E6", border: "1.5px solid #FF6B00",
    borderRadius: 20, padding: "6px 14px",
    cursor: "pointer", fontSize: 12, fontWeight: 700,
    color: "#FF6B00", fontFamily: "'Barlow', sans-serif",
  },
};

export default AddTenant;
