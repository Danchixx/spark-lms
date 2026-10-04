// src/pages/SuperAdmin/Support/Support.tsx
import React, { useState } from "react";

const FAQS = [
  { q: "How do I add a new tenant?", a: "Go to the sidebar and click 'Register Tenant', or navigate to Tenants and click '+ Add Tenant'. Follow the 3-step registration process." },
  { q: "What happens when a subscription expires?", a: "The tenant admin is notified 2 months before expiry. After expiry, the tenant's access is suspended until they renew their plan." },
  { q: "How do I reset a management account password?", a: "Navigate to the tenant's profile via the View button, click 'Management Accounts', and use the reset option for the specific account." },
  { q: "Can I export tenant data?", a: "Yes. Use the 'Data Export' section in the sidebar to export tenant data, user records, and more in CSV, Excel, JSON, or PDF format." },
  { q: "How do I archive a tenant?", a: "In the Tenant List, click the archive (trash) icon on the tenant row. Archived tenants are retained for 1 year before automatic deletion." },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticket, setTicket] = useState({ subject: "", priority: "Medium", message: "" });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!ticket.subject || !ticket.message) return;
    setSent(true);
    setTicket({ subject: "", priority: "Medium", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 6px" }}>Support</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>Get help, browse FAQs, or submit a support ticket.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* FAQs */}
        <div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-header)" }}>Frequently Asked Questions</span>
            </div>
            <div>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "14px 20px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-header)" }}>{faq.q}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: "0 20px 16px", fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.7 }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit ticket */}
        <div>
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text-header)" }}>Submit a Ticket</span>
            </div>
            <div style={{ padding: 20 }}>
              {sent && (
                <div style={{ background: "#d5f5e0", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#065F46", fontWeight: 700 }}>
                  ✓ Ticket submitted! We'll respond within 24 hours.
                </div>
              )}
              {[{ label: "Subject", key: "subject" as const, type: "text" }].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</label>
                  <input value={ticket[f.key]} onChange={e => setTicket(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "#FF6B00"} onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Priority</label>
                <select value={ticket.priority} onChange={e => setTicket(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)", cursor: "pointer" }}>
                  {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Message</label>
                <textarea value={ticket.message} onChange={e => setTicket(p => ({ ...p, message: e.target.value }))} rows={5} placeholder="Describe your issue in detail..." style={{ width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)", resize: "vertical", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "#FF6B00"} onBlur={e => e.currentTarget.style.borderColor = "var(--color-border)"} />
              </div>
              <button onClick={handleSend} disabled={!ticket.subject || !ticket.message} style={{ width: "100%", padding: "12px 0", background: ticket.subject && ticket.message ? "linear-gradient(135deg, #FF8C00, #FF6B00)" : "var(--color-border)", color: ticket.subject && ticket.message ? "#fff" : "var(--color-text-muted)", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: ticket.subject && ticket.message ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                Send Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
