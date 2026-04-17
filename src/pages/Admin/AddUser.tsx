import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Briefcase, Mail, CheckCircle2, ChevronRight, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";

type InputBoxProps = {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
};

const InputBox = ({ label, value, onChange, type = "text", readOnly, required }: InputBoxProps) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>
      {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
    </label>
    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--color-border)", borderRadius: 8, padding: "10px 12px", background: readOnly ? "var(--color-bg-subtle)" : "var(--color-surface)" }}>
      <input 
        type={type} 
        value={value} 
        readOnly={readOnly} 
        onChange={(e) => onChange && onChange(e.target.value)} 
        style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", background: "transparent", color: "var(--color-text)", minWidth: 0, width: "100%" }} 
      />
    </div>
  </div>
);

const MOCK_COURSES = [
  { id: 1, title: "Sales Fundamentals", stats: "5 Modules • 18 Units", icon: Briefcase },
  { id: 2, title: "Customer Service Pro", stats: "5 Modules • 18 Units", icon: User },
  { id: 3, title: "Digital Marketing", stats: "5 Modules • 18 Units", icon: Mail },
  { id: 4, title: "Technical Onboard", stats: "5 Modules • 18 Units", icon: CheckCircle2 },
  { id: 5, title: "Data Privacy and Security", stats: "5 Modules • 18 Units", icon: Briefcase },
];

const AdminAddUser = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    contact: "",
    dob: "",
    gender: "Select",
    address: "",
    employeeId: "",
    jobTitle: "",
    department: "Select Department",
    dateHired: "",
    sendEmail: true,
    selectedCourses: [] as number[],
  });

  const handleUpdate = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const toggleCourse = (id: number) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(id) 
        ? prev.selectedCourses.filter(cid => cid !== id)
        : [...prev.selectedCourses, id]
    }));
  };

  const currentFullName = `${formData.firstName} ${formData.lastName}`.trim() || "Full Name";
  const currentEmail = formData.email || "email@company.com";
  
  const handleCreateUser = async () => {
    if (!company?.id || !company?.name) {
      setErrorMsg("No company context found.");
      return;
    }
    
    // 1. Validations
    const textRegex = /^[A-Za-z\s]+$/;
    if (!formData.firstName || !textRegex.test(formData.firstName)) return setErrorMsg("First name is required and must only contain letters.");
    if (!formData.lastName || !textRegex.test(formData.lastName)) return setErrorMsg("Last name is required and must only contain letters.");
    if (formData.middleName && !textRegex.test(formData.middleName)) return setErrorMsg("Middle name must only contain letters.");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) return setErrorMsg("Please enter a valid email address.");
    if (formData.contact && !/^[0-9]{11}$/.test(formData.contact)) return setErrorMsg("Contact number must be exactly 11 digits.");
    
    if (!formData.address) return setErrorMsg("Address is required.");
    if (!formData.employeeId) return setErrorMsg("Employee ID is required.");
    if (!formData.jobTitle) return setErrorMsg("Job Title is required.");
    if (formData.department === "Select Department") return setErrorMsg("Please select a department.");
    
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 2. Avatar Upload
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${company.id}/avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = publicUrlData.publicUrl;
      }

      // 3. Auto-Generate Password
      const sanitizedCompany = company.name.replace(/\s+/g, '');
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const generatedPassword = `Spark-${sanitizedCompany}-${random4}`;

      // 4. Create Auth User via Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke('create-admin-user', {
        body: { email: formData.email, password: generatedPassword }
      });
      
      if (fnError) throw new Error(`Failed to create Auth User: ${fnError.message}`);
      if (fnData?.error) throw new Error(`Auth Error: ${fnData.error}`);
      
      const newAuthUser = fnData.user;

      // 5. Get role ID for 'user'
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single();
        
      if (roleError) throw new Error("Could not find role for user");
      const roleId = roleData.id;

      // 6. Insert into public.users
      const payload = {
        id: newAuthUser.id,
        company_id: company.id,
        role_id: roleId,
        firstname: formData.firstName,
        lastname: formData.lastName,
        middlename: formData.middleName || null,
        email: formData.email,
        password: generatedPassword, 
        gender: formData.gender !== "Select" ? formData.gender : null,
        contact_no: formData.contact || null,
        address: formData.address || null,
        employee_id: formData.employeeId || null,
        department: formData.department !== "Select Department" ? formData.department : null,
        job_title: formData.jobTitle || null,
        date_hired: formData.dateHired || null,
        avatar_url: avatarUrl
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert(payload);

      if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error creating user:", err);
      setErrorMsg(err.message || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Users" onNavigate={(p) => navigate(`/${slug}/${p.toLowerCase()}`)} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search users, courses, ..." role="Admin" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            
            {/* Top Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button onClick={() => navigate(`/${slug}/users`)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--color-border)", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
                    <ArrowLeft size={14} /> Users
                </button>
                <ChevronRight size={14} color="var(--color-text-muted)" />
                <h1 style={{ fontSize: 18, color: "var(--color-text-header)", margin: 0, fontWeight: 700 }}>Add User Form</h1>
            </div>

            <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24, marginTop: -12 }}>
                Fill in the details below to create a new user account.
            </p>

            {/* Stepper Header */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%", maxWidth: 800 }}>
                    {/* Connecting Line background */}
                    <div style={{ position: "absolute", top: "50%", left: 40, right: 40, height: 2, background: "var(--color-border)", zIndex: 0, transform: "translateY(-50%)", overflow: "hidden" }}>
                        <div style={{ 
                            height: "100%", 
                            background: "#FF6B00", 
                            width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                            transition: "width 0.3s ease" 
                        }} />
                    </div>
                    
                    {[1, 2, 3].map(step => (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1, background: "var(--color-bg)", padding: "0 12px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, 
                                          background: currentStep >= step ? "#FF6B00" : "var(--color-surface)", 
                                          color: currentStep >= step ? "#fff" : "var(--color-text-muted)",
                                          border: `2px solid ${currentStep >= step ? "#FF6B00" : "var(--color-border)"}`
                            }}>
                                {currentStep > step ? <Check size={16} strokeWidth={3} /> : step}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: currentStep === step ? "#FF6B00" : "var(--color-text-header)", fontSize: 14 }}>
                                    {step === 1 ? "User Info" : step === 2 ? "Assign Courses" : "Confirmation"}
                                </div>
                                {step === 2 && <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2, textAlign: "center" }}>(optional)</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                
                {/* Left Panel: Profile Preview */}
                <div style={{ width: 280, background: "var(--color-surface)", borderRadius: 12, border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", background: "var(--color-bg-muted)", borderBottom: "1px solid var(--color-border)" }}>
                        
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#fff", border: "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <User size={40} color="#ccc" />
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ position: "absolute", top: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#FF6B00", color: "#fff", border: "2px solid var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
                            >
                                +
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: "none" }} />
                        </div>

                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-header)", textAlign: "center" }}>{currentFullName}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{currentEmail}</div>
                        <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: "#FF6B00", letterSpacing: "0.05em", textTransform: "uppercase" }}>USER</div>
                    </div>

                    <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center", marginTop: 2 }}>
                                <User size={14} color="var(--color-text-muted)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginTop: 2 }}>{formData.department === "Select Department" ? "Not set" : formData.department}</div>
                            </div>
                        </div>
                        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "0 0 16px 0" }} />
                        
                        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center", marginTop: 2 }}>
                                <Briefcase size={14} color="var(--color-text-muted)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Job Title</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginTop: 2 }}>{formData.jobTitle || "Not set"}</div>
                            </div>
                        </div>
                        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "0 0 16px 0" }} />

                        <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center", marginTop: 2 }}>
                                <Briefcase size={14} color="var(--color-text-muted)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Courses</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginTop: 2, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {formData.selectedCourses.length === 0 ? "None assigned" : (
                                        formData.selectedCourses.map(id => {
                                            const course = MOCK_COURSES.find(c => c.id === id);
                                            return course ? (
                                                <div key={id} style={{ background: "#FFE1CC", color: "#B34A00", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, display: "inline-block" }}>
                                                    {course.title}
                                                </div>
                                            ) : null;
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div style={{ flex: 1 }}>
                    
                    {currentStep === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {/* Personal Information */}
                            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <User size={18} color="var(--color-text-header)" />
                                    <h2 style={{ fontSize: 15, margin: 0, color: "var(--color-text-header)", fontWeight: 700 }}>Personal Information</h2>
                                </div>
                                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                        <InputBox label="Last Name" required value={formData.lastName} onChange={(val) => handleUpdate("lastName", val)} />
                                        <InputBox label="First Name" required value={formData.firstName} onChange={(val) => handleUpdate("firstName", val)} />
                                        <InputBox label="Middle Name" value={formData.middleName} onChange={(val) => handleUpdate("middleName", val)} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <InputBox label="Email Address" required type="email" value={formData.email} onChange={(val) => handleUpdate("email", val)} />
                                        <InputBox label="Contact Number" value={formData.contact} onChange={(val) => handleUpdate("contact", val)} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <InputBox label="Date of Birth" type="date" value={formData.dob} onChange={(val) => handleUpdate("dob", val)} />
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>Gender</label>
                                            <select 
                                                value={formData.gender} 
                                                onChange={(e) => handleUpdate("gender", e.target.value)}
                                                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface)", fontSize: 13, color: "var(--color-text)" }}
                                            >
                                                <option>Select</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <InputBox label="Address" required value={formData.address} onChange={(val) => handleUpdate("address", val)} />
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <Briefcase size={18} color="var(--color-text-header)" />
                                    <h2 style={{ fontSize: 15, margin: 0, color: "var(--color-text-header)", fontWeight: 700 }}>Employment Details</h2>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                                        <InputBox label="Employee ID" required value={formData.employeeId} onChange={(val) => handleUpdate("employeeId", val)} />
                                        <InputBox label="Job Title" required value={formData.jobTitle} onChange={(val) => handleUpdate("jobTitle", val)} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>Department <span style={{ color: "#e74c3c" }}>*</span></label>
                                            <select 
                                                value={formData.department} 
                                                onChange={(e) => handleUpdate("department", e.target.value)}
                                                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface)", fontSize: 13, color: "var(--color-text)" }}
                                            >
                                                <option>Select Department</option>
                                                <option>IT Dept.</option>
                                                <option>HR Dept.</option>
                                                <option>Sales</option>
                                                <option>Marketing</option>
                                                <option>Operations</option>
                                            </select>
                                        </div>
                                        <InputBox label="Date Hired" type="date" value={formData.dateHired} onChange={(val) => handleUpdate("dateHired", val)} />
                                    </div>
                                </div>
                            </div>

                            {/* Account Setup */}
                            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <Mail size={18} color="var(--color-text-header)" />
                                    <h2 style={{ fontSize: 15, margin: 0, color: "var(--color-text-header)", fontWeight: 700 }}>Account Setup</h2>
                                </div>
                                <div style={{ padding: 24 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                                        <InputBox label="Username" readOnly value="Auto-generated from email" />
                                        <div>
                                            <InputBox label="Temporary Password" readOnly value="Auto-generated" />
                                            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6, paddingLeft: 4 }}>User will change on first login</div>
                                        </div>
                                    </div>
                                    <div 
                                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "var(--color-success-bg, #E8F5E9)", borderRadius: 8, border: "1px solid var(--color-success-border, #A5D6A7)" }}
                                        onClick={() => handleUpdate("sendEmail", !formData.sendEmail)}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <Mail size={20} color="#27ae60" />
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#1B5E20" }}>Send welcome email with login instructions</div>
                                                <div style={{ fontSize: 12, color: "#2E7D32", marginTop: 2 }}>User receives credentials and a link to set their password.</div>
                                            </div>
                                        </div>
                                        
                                        {/* Simple Toggle */}
                                        <div style={{ width: 44, height: 24, borderRadius: 12, background: formData.sendEmail ? "#2ecc71" : "#ccc", position: "relative", cursor: "pointer", transition: "0.2s" }}>
                                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: formData.sendEmail ? 22 : 2, transition: "0.2s" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", background: "var(--color-surface)", padding: "16px 24px", borderRadius: 12, border: "1px solid var(--color-border)" }}>
                                <Button variant="outline" onClick={() => navigate(`/${slug}/users`)}>Cancel</Button>
                                <Button onClick={() => setCurrentStep(2)}>Next: Assign Course &gt;</Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <Briefcase size={18} color="var(--color-text-header)" />
                                    <h2 style={{ fontSize: 15, margin: 0, color: "var(--color-text-header)", fontWeight: 700 }}>Assign Courses</h2>
                                </div>
                                <div style={{ padding: 24 }}>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1px solid var(--color-border)", borderRadius: 8, marginBottom: 24 }}>
                                        <span style={{ color: "var(--color-text-muted)" }}>🔍</span>
                                        <input type="text" placeholder="Search available courses..." style={{ border: "none", outline: "none", background: "transparent", color: "var(--color-text)", flex: 1, fontSize: 13 }} />
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        {MOCK_COURSES.map(course => {
                                            const isSelected = formData.selectedCourses.includes(course.id);
                                            return (
                                                <div 
                                                    key={course.id} 
                                                    onClick={() => toggleCourse(course.id)}
                                                    style={{ 
                                                        border: `2px solid ${isSelected ? "#FF6B00" : "var(--color-border)"}`,
                                                        background: isSelected ? "#FFF3E0" : "var(--color-surface)",
                                                        borderRadius: 12, padding: 16, cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-header)", marginBottom: 4 }}>{course.title}</div>
                                                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{course.stats}</div>
                                                    </div>
                                                    <div style={{ position: "relative" }}>
                                                        <course.icon size={32} color={isSelected ? "#FF6B00" : "var(--color-text-header)"} />
                                                        {isSelected && (
                                                            <div style={{ position: "absolute", top: -8, right: -8, background: "#FF6B00", borderRadius: "50%", padding: 2 }}>
                                                                <Check size={12} color="#fff" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-subtle)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>SELECTED COURSES</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, minHeight: 32 }}>
                                        {formData.selectedCourses.length === 0 ? (
                                            <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic", display: "flex", alignItems: "center" }}>No courses selected.</div>
                                        ) : (
                                            formData.selectedCourses.map(id => {
                                                const title = MOCK_COURSES.find(c => c.id === id)?.title;
                                                return (
                                                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>
                                                        {title}
                                                        <span onClick={(e) => { e.stopPropagation(); toggleCourse(id); }} style={{ cursor: "pointer", color: "var(--color-text-muted)" }}>×</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ display: "inline-flex", width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--color-text-muted)", alignItems: "center", justifyContent: "center", fontSize: 10 }}>!</span>
                                        You can always assign courses later
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", background: "var(--color-surface)", padding: "16px 24px", borderRadius: 12, border: "1px solid var(--color-border)" }}>
                                <Button variant="outline" onClick={() => setCurrentStep(1)}>&lt; Back</Button>
                                <Button onClick={() => setCurrentStep(3)}>Next: Confirmation &gt;</Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <CheckCircle2 size={18} color="var(--color-text-header)" />
                                    <h2 style={{ fontSize: 15, margin: 0, color: "var(--color-text-header)", fontWeight: 700 }}>Review &amp; Confirm</h2>
                                </div>
                                <div style={{ padding: 24 }}>
                                    
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                                        
                                        {/* Summary Box 1 */}
                                        <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--color-text-header)", fontWeight: 700, fontSize: 14 }}>
                                                <User size={16} /> PERSONAL INFO
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Full Name</span><span style={{ fontWeight: 600, fontSize: 13 }}>{currentFullName}</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Email</span><span style={{ fontWeight: 600, fontSize: 13 }}>{currentEmail}</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Department</span><span style={{ fontWeight: 600, fontSize: 13 }}>{formData.department}</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Job Title</span><span style={{ fontWeight: 600, fontSize: 13 }}>{formData.jobTitle || "Not set"}</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Date Joined</span><span style={{ fontWeight: 600, fontSize: 13 }}>Auto</span></div>
                                            </div>
                                        </div>

                                        {/* Summary Box 2 */}
                                        <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--color-text-header)", fontWeight: 700, fontSize: 14 }}>
                                                <Mail size={16} /> ACCOUNT
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Role</span><span style={{ fontWeight: 600, fontSize: 13, color: "#FF6B00" }}>User</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Status</span><span style={{ fontWeight: 600, fontSize: 13, color: "#e86e1e" }}>Pending<span style={{ color: "gray", fontWeight: 400 }}>(default)</span></span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Username</span><span style={{ fontWeight: 600, fontSize: 13 }}>{currentEmail}</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Password</span><span style={{ fontWeight: 600, fontSize: 13 }}>Auto</span></div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Setup mail</span><span style={{ fontWeight: 600, fontSize: 13 }}>{formData.sendEmail ? "Yes - will be sent" : "No"}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Box 3 */}
                                    <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16, marginBottom: 24 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "var(--color-text-header)", fontWeight: 700, fontSize: 14 }}>
                                            <Briefcase size={16} /> ASSIGNED COURSES
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                                            {formData.selectedCourses.length === 0 ? <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic" }}>No courses assigned.</div> : (
                                                formData.selectedCourses.map(id => {
                                                    const title = MOCK_COURSES.find(c => c.id === id)?.title;
                                                    return (
                                                        <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--color-border)", borderRadius: 16, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>
                                                            <div style={{ width: 8, height: 8, background: "#FF6B00", borderRadius: "50%" }} />
                                                            {title}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Alert */}
                                    {errorMsg && (
                                        <div style={{ border: "1px solid #e74c3c", background: "#fdf0ed", padding: "12px 16px", borderRadius: 8, color: "#e74c3c", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                                            {errorMsg}
                                        </div>
                                    )}
                                    <div style={{ border: "1px solid #FFCC80", background: "#FFF3E0", padding: "12px 16px", borderRadius: 8, color: "#E65100", fontSize: 13, display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                                        <span style={{ border: "1.5px solid #E65100", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>!</span>
                                        Please review all details carefully. Once created, user will be sent for approval.
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", background: "var(--color-surface)", padding: "16px 24px", borderRadius: 12, border: "1px solid var(--color-border)" }}>
                                <Button variant="outline" disabled={isSubmitting} onClick={() => setCurrentStep(2)}>&lt; Back</Button>
                                <Button disabled={isSubmitting} onClick={handleCreateUser}>{isSubmitting ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Loader2 size={16} className="spin" /> Creating...</span> : "Create User"}</Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Success Modal Overlay */}
            {showSuccessModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "var(--color-surface)", borderRadius: 12, width: 500, maxWidth: "90%", padding: "32px 0", position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
                  <button onClick={() => setShowSuccessModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--color-text-muted)", lineHeight: 1 }}>×</button>
                  
                  <h2 style={{ color: "#27ae60", fontSize: 24, margin: "0 32px 20px 32px" }}>User Created Successfully!</h2>
                  
                  <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "0 0 24px 0" }} />
                  
                  <div style={{ padding: "0 32px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>WAITING FOR APPROVAL</div>
                    <p style={{ color: "var(--color-text)", fontSize: 16, lineHeight: 1.5, margin: "0 auto 32px auto", maxWidth: 400 }}>
                      User account created, pending for approval. A welcome email will be sent once approved by Spark Admin.
                    </p>
                    
                    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                      <Button variant="outline" onClick={() => { 
                        setShowSuccessModal(false); 
                        setCurrentStep(1); 
                        setFormData({
                          firstName: "", lastName: "", middleName: "", email: "", contact: "", dob: "", gender: "Select",
                          address: "", employeeId: "", jobTitle: "", department: "Select Department", dateHired: "",
                          sendEmail: true, selectedCourses: []
                        });
                        setAvatarPreview(null);
                      }}>Add Another</Button>
                      <Button onClick={() => navigate(`/${slug}/users`)}>Back to Users</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </PageTransition>
        </div>
      </div>
    </div>
  );
};

export default AdminAddUser;
