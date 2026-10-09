import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import { User, Mail, Phone, MapPin, Send, CheckCircle, X } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import "./Contact.css";

const Contact = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.functions.invoke('send-contact-email', {
      body: form
    });

    setIsLoading(false);

    if (error) {
      console.error(error);
      setErrorMsg("Failed to send your message. Please try again later.");
    } else {
      setShowModal(true);
      setForm({ name: "", email: "", contactNumber: "", message: "" });
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Contact" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
          <h1 className="contact-page-title">Contact Us</h1>

          <div className="contact-layout">
            {/* Left: Contact Form */}
            <div className="contact-form-card">
              <h2 className="contact-form-heading">Let's Spark Growth Together</h2>
              <p className="contact-form-desc">
                Have questions or feedback? We'd love to hear from you. Fill out the form below and our team will get back to you shortly.
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-field">
                  <label>Full Name</label>
                  <div className="contact-input-icon">
                    <User size={15} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field-row">
                  <div className="contact-field">
                    <label>Email Address</label>
                    <div className="contact-input-icon">
                      <Mail size={15} />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label>Contact Number</label>
                    <div className="contact-input-icon">
                      <Phone size={15} />
                      <input
                        type="tel"
                        name="contactNumber"
                        placeholder="0917 123 4567"
                        value={form.contactNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="contact-field">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>

                <div className="contact-form-actions">
                  {errorMsg && (
                    <div style={{ color: "#e74c3c", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                      {errorMsg}
                    </div>
                  )}
                  <Button
                    type="submit"
                    rightIcon={isLoading ? undefined : <Send size={14} />}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right: Contact Info */}
            <div className="contact-info-card">
              <h2 className="contact-info-heading">Get in Touch</h2>
              <p className="contact-info-desc">
                Let's talk about what's holding your team back—and what's possible with the right learning experience.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="contact-info-label">Contact Person</div>
                    <div className="contact-info-value">Yhna Palabrica</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <div className="contact-info-value">operations@sparkyesph.com</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="contact-info-label">Phone</div>
                    <div className="contact-info-value">0916 666 1696</div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="contact-info-label">Office Address</div>
                    <div className="contact-info-value">5th Floor, Phinma Plaza, 39 Plaza Drive, Rockwell Center, Makati City</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </PageTransition>
        </div>
      </div>

      {/* ─── Success Modal ──────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: "var(--color-surface)", padding: 32, borderRadius: 16,
                width: 400, maxWidth: "90%", boxShadow: "var(--shadow-xl)",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e8f5e9", color: "#27ae60", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-header)", marginBottom: 12 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                Thank you for reaching out to us. We have received your message and our team will get back to you shortly.
              </p>
              <Button variant="primary" rounded="pill" onClick={() => setShowModal(false)} style={{ width: "100%" }}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
