import React, { useState } from "react";
import AddTenantStep1 from "./AddTenantStep1";
import AddTenantStep2 from "./AddTenantStep2";
import AddTenantStep3 from "./AddTenantStep3";
import AddTenantStep4 from "./AddTenantStep4";
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "../../../../components/layout/Sidebar/SASidebar";

const STEPS = ["Company Profile", "Plan", "Add Roles"];

const stepIndex = (step: number) => (step <= 2 ? step - 1 : 2);

interface StepperProps {
  step: number;
}

const Stepper: React.FC<StepperProps> = ({ step }) => {
  const idx = stepIndex(step);
  return (
    <div className="pt-3 px-5 pb-0 border-b border-gray-100 bg-white">
      <div className="flex items-start pb-3.5 relative">
        {STEPS.map((label, i) => {
          const done = idx > i;
          const active = idx === i;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div 
                  className={`absolute top-[7px] left-1/2 w-full h-0.5 z-[1] transition-colors duration-400 ease-in-out ${done ? 'bg-[#FF6B00]' : 'bg-gray-200'}`} 
                />
              )}
              <div 
                className={`w-3.5 h-3.5 rounded-full z-[2] mb-1.5 transition-all duration-300 ease-in-out border-2 ${done || active ? 'bg-[#FF6B00] border-[#FF6B00]' : 'bg-white border-gray-200'}`} 
              />
              <div 
                className={`text-xs whitespace-nowrap font-medium transition-colors duration-300 ease-in-out ${done || active ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface TenantForm {
  companyName: string;
  details: string;
  phone: string;
  email: string;
  facebook: string;
  profileImg: string | null;
  bgImg: string | null;
}

interface AddTenantProps {
  onBack: () => void;
  onFinish: (data: any) => void;
  sidebarOpen?: boolean;
}

const AddTenant: React.FC<AddTenantProps> = ({ onBack, onFinish, sidebarOpen = true }) => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [form, setForm] = useState<TenantForm>({
    companyName: "", details: "",
    phone: "", email: "", facebook: "",
    profileImg: null, bgImg: null,
  });

  const handlePlanSelect = (planKey: string) => {
    setSelectedPlan(planKey);
    setStep(3);
  };

  const handleFinish = (roles: any, roleData: any) => {
    onFinish({ form, selectedPlan, roles, roleData });
  };

  const FIXED_HEADER_H = 100;

  return (
    <div className="flex flex-col flex-1 h-full">

      {/* Fixed header: breadcrumb + stepper */}
      <div 
        className="fixed z-[90] bg-white shadow-sm transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: TOPBAR_HEIGHT,
          left: sidebarOpen ? SIDEBAR_WIDTH : 0,
          right: 0,
        }}
      >
        <div className="border-b border-gray-100 py-2.5 px-5 flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="flex items-center gap-1.5 bg-[#FFF0E6] border-[1.5px] border-[#FF6B00] rounded-full py-1.5 px-3.5 cursor-pointer text-xs font-bold text-[#FF6B00] font-['Barlow'] outline-none hover:bg-[#FFE0CC] transition-colors"
          >
            &larr; TENANT LIST
          </button>
          <span className="text-sm font-semibold text-gray-600">
            ADD NEW TENANT
          </span>
        </div>
        <Stepper step={step} />
      </div>

      {/* Scrollable content */}
      <div 
        className="flex-1 overflow-y-auto px-5 pb-8"
        style={{ marginTop: FIXED_HEADER_H + 20 }}
      >
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

export default AddTenant;
