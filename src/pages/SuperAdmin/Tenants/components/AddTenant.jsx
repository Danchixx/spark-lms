import { useState } from "react";
import AddTenantStep1 from "./AddTenantStep1";
import AddTenantStep2 from "./AddTenantStep2";
import AddTenantStep3 from "./AddTenantStep3";
import AddTenantStep4 from "./AddTenantStep4";

const STEPS = ["Company Profile", "Plan", "Add Roles"];

// stepIdx: 0 = profile, 1 = plan/payment, 2 = roles
const stepIndex = (step) => (step <= 2 ? step - 1 : 2);

const Stepper = ({ step }) => {
  const idx = stepIndex(step);
  return (
    <div style={{ padding: "12px 20px 0", borderBottom: "1px solid #eee",
      background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start",
        paddingBottom: 14, position: "relative" }}>
        {STEPS.map((label, i) => {
          const done   = idx > i;
          const active = idx === i;
          return (
            <div key={label} style={{ flex: 1, display: "flex",
              flexDirection: "column", alignItems: "center", position: "relative" }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: "absolute", top: 7, left: "50%",
                  width: "100%", height: 2, zIndex: 1,
                  background: done ? "#FF6B00" : "#ddd" }} />
              )}
              <div style={{ width: 14, height: 14, borderRadius: "50%",
                zIndex: 2, marginBottom: 6,
                background: done || active ? "#FF6B00" : "#fff",
                border: `2px solid ${done || active ? "#FF6B00" : "#ddd"}` }} />
              <div style={{ fontSize: 12, whiteSpace: "nowrap", fontWeight: 500,
                color: done || active ? "#555" : "#aaa" }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddTenant = ({ onBack, onFinish }) => {
  const [step, setStep]               = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    companyName: "", details: "",
    phone: "", email: "", facebook: "",
    profileImg: null, bgImg: null,
  });

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    setStep(3); // plan → payment
  };

  const handleFinish = (roles, roleData) => {
    onFinish({ form, selectedPlan, roles, roleData });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Breadcrumb nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={s.bcBtn}>‹ TENANT LIST</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>
          ADD NEW TENANT
        </span>
      </div>

      <Stepper step={step} />

      <div style={{ padding: "0 20px 20px", flex: 1, overflowY: "auto" }}>
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
  bcBtn: { display: "flex", alignItems: "center", gap: 6, background: "#FFF0E6",
    border: "1.5px solid #FF6B00", borderRadius: 20, padding: "6px 14px",
    cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#FF6B00",
    fontFamily: "'Barlow', sans-serif" },
};

export default AddTenant;
