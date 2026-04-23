import { X, ChevronRight, User, Briefcase, Mail, BookOpen, Clock, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../ui/Button/Button";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "withdraw_confirm";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  status: ApprovalStatus;
  onWithdraw?: (id: string) => void;
  onConfirmWithdraw?: () => void;
  onResubmit?: (id: string) => void;
}

const InfoBox = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div style={{ background: "var(--color-bg-subtle)", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
       <Icon size={12} /> {label}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-header)" }}>{value || "—"}</div>
  </div>
);

const TimelineItem = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  status = "done", 
  isLast = false 
}: { 
  icon: any; 
  title: string; 
  subtitle: string; 
  status?: "done" | "next" | "pending"; 
  isLast?: boolean 
}) => {
  const color = status === "done" ? "#FF6B00" : status === "next" ? "var(--color-text-muted)" : "var(--color-border)";
  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      {!isLast && <div style={{ position: "absolute", left: 16, top: 32, bottom: -16, width: 1, background: "var(--color-border)" }} />}
      <div style={{ 
        width: 32, height: 32, borderRadius: "50%", background: "#fff", border: `1.5px solid ${color}`, 
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: status === "pending" ? "var(--color-text-muted)" : "var(--color-text-header)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{subtitle}</div>
      </div>
    </div>
  );
};

const ApprovalModal = ({ isOpen, onClose, request, status, onWithdraw, onConfirmWithdraw, onResubmit }: ApprovalModalProps) => {
  if (!request && status !== "withdraw_confirm") return null;

  const fullName = request ? `${request.firstname} ${request.lastname}` : "";
  
  const statusConfig = {
    pending: { bg: "#FFF4E5", text: "#FF9800", icon: Clock, title: "In Queue" },
    approved: { bg: "#E8F5E9", text: "#2E7D32", icon: CheckCircle2, title: "Success" },
    rejected: { bg: "#FFEBEE", text: "#D32F2F", icon: AlertCircle, title: "Reason for rejection:" },
    withdraw_confirm: { bg: "#FFEBEE", text: "#D32F2F", icon: AlertCircle, title: "Withdraw Request?" }
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
           onClick={onClose}
        >
          {status === "withdraw_confirm" ? (
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 400, padding: 32, textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
             >
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <AlertCircle size={32} color="#D32F2F" />
                </div>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800, color: "var(--color-text-header)" }}>Withdraw Request?</h3>
                <p style={{ margin: "0 0 32px 0", fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  Are you sure you want to withdraw the registration request for <strong style={{ color: "var(--color-text-header)" }}>{fullName}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <Button variant="outline" rounded="pill" style={{ flex: 1 }} onClick={onClose}>No, Cancel</Button>
                  <Button variant="primary" rounded="pill" style={{ flex: 1, background: "#D32F2F" }} onClick={onConfirmWithdraw}>
                    Yes, Withdraw
                  </Button>
                </div>
             </motion.div>
          ) : (
            <motion.div
               initial={{ y: 20, scale: 0.98 }}
               animate={{ y: 0, scale: 1 }}
               exit={{ y: 20, scale: 0.98 }}
               onClick={e => e.stopPropagation()}
               style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
            >
              <div style={{ padding: "24px 28px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <div>
                   <h3 style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 800, color: "var(--color-text-header)" }}>{fullName}</h3>
                   <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Submitted {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                 </div>
                 <button onClick={onClose} style={{ background: "var(--color-bg-subtle)", border: "none", padding: 8, borderRadius: 10, cursor: "pointer", color: "var(--color-text-muted)" }}>
                   <X size={20} />
                 </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
                 <div style={{ background: "var(--color-bg-muted)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 24, border: "1px solid var(--color-border)" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      {request.avatar_url ? <img src={request.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} color="#ccc" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "var(--color-text-header)" }}>{fullName}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 6 }}>{request.email}</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: config.bg, color: config.text, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                         <StatusIcon size={12} /> {status === "approved" ? "Active" : status}
                      </div>
                    </div>
                 </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                    <InfoBox label="Department" value={request.department} icon={Briefcase} />
                    <InfoBox label="Job Title" value={request.job_title} icon={User} />
                    <InfoBox label="Email Address" value={request.email} icon={Mail} />
                    <InfoBox label="Assigned Courses" value={request.courses_count ? `${request.courses_count} Assigned` : "None Assigned"} icon={BookOpen} />
                    <InfoBox label="Submitted On" value={new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} icon={Clock} />
                    <InfoBox label="Submitted By" value={request.created_by_name || "Danchi D"} icon={User} />
                 </div>

                 <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Approval Timeline</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                       <TimelineItem 
                          icon={User} 
                          title="Submitted by Admin" 
                          subtitle={`${request.created_by_name || "Danchi D"} | ${new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`} 
                       />
                       
                       {status === "pending" && (
                          <TimelineItem 
                             icon={Clock} 
                             title="Waiting for Approval" 
                             subtitle="No action taken yet" 
                             status="next"
                             isLast={true}
                          />
                       )}

                       {status === "approved" && (
                          <>
                             <TimelineItem 
                                icon={CheckCircle2} 
                                title="Approved by Spark Admin" 
                                subtitle={`Spark Admin | ${request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : 'Mar 01, 2026'}`} 
                             />
                             <TimelineItem 
                                icon={User} 
                                title="Account Activated" 
                                subtitle="Setup email sent. User can now log in." 
                                isLast={true}
                             />
                          </>
                       )}

                       {status === "rejected" && (
                          <TimelineItem 
                             icon={X} 
                             title="Rejected by Spark Admin" 
                             subtitle={`Spark Admin | ${request.reviewed_at ? new Date(request.reviewed_at).toLocaleDateString() : 'Feb 18, 2026'}`} 
                             isLast={true}
                          />
                       )}
                    </div>
                 </div>

                 <div style={{ 
                    borderRadius: 16, padding: "20px", display: "flex", gap: 16, alignItems: "center",
                    background: status === "approved" ? "#E8F5E9" : status === "rejected" ? "#FFEBEE" : "#FFF4E5",
                    border: `1px solid ${status === "approved" ? "#A5D6A7" : status === "rejected" ? "#EF9A9A" : "#FFE0B2"}`
                 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <StatusIcon size={20} color={config.text} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: config.text, marginBottom: 4 }}>{config.title}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-header)", opacity: 0.8, lineHeight: 1.5 }}>
                        {status === "approved" && "This user account is now active. They can now log in and access their assigned courses."}
                        {status === "rejected" && (request.rejection_reason || "Incomplete details provided. Please resubmit with proper information needed.")}
                        {status === "pending" && "This submission is currently in the Spark Admin's review queue. You'll be notified once a decision is made."}
                      </div>
                    </div>
                 </div>
              </div>

              <div style={{ padding: "20px 28px", background: "var(--color-bg-subtle)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                 {status === "pending" && (
                    <Button variant="outline" rounded="pill" style={{ color: "#D32F2F", borderColor: "rgba(211,47,47,0.2)" }} onClick={() => onWithdraw?.(request.id)}>
                      Withdraw
                    </Button>
                 )}
                 {status === "rejected" && (
                    <Button variant="primary" rounded="pill" onClick={() => onResubmit?.(request.id)}>
                      Resubmit
                    </Button>
                 )}
                 <Button variant="outline" rounded="pill" onClick={onClose}>Close</Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApprovalModal;
