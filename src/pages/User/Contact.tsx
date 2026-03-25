import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebarAutoClose from "../../hooks/useSidebarAutoClose";
import Button from "../../components/ui/Button/Button";
import { User, Mail, Phone, MapPin, Send } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";
import "./Contact.css";

const Contact = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useSidebarAutoClose(setSidebarOpen);

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: "", email: "", contactNumber: "", message: "" });
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "#f4f4f4", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Contact" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} searchPlaceholder="Search ..." role="User" />

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
                  <Button
                    type="submit"
                    rightIcon={<Send size={14} />}
                    disabled={submitted}
                  >
                    {submitted ? "Message Sent!" : "Send Message"}
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
    </div>
  );
};

export default Contact;
