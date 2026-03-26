import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import CertificateModal from "../../components/ui/CertificateModal/CertificateModal";
import { Calendar, Award, Check, CircleDashed } from "lucide-react";
import { COURSES } from "../../data/mockCourses";
import sparkLogoImg from "../../components/common/SparkLogo/sparklogo.png";
import PageTransition from "../../components/common/PageTransition";
import "./Certificates.css";

// Mock certificate issue dates
const CERT_DATES: Record<number, string> = {
  3: "Feb 14, 2026",
  1: "Feb 27, 2026",
};

// Mock scores
const CERT_SCORES: Record<number, number> = {
  3: 95,
  1: 91,
};

const Certificates = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Split courses into earned (completed) and not yet earned
  const earnedCourses = COURSES.filter((c) => c.progress === 100);
  const inProgressCourses = COURSES.filter((c) => c.progress > 0 && c.progress < 100);

  return (
    <>
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Certificates" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <h1 className="certificates-page-title">Certificates</h1>

            <div className="certificates-grid">
              {/* ── Earned Certificates ── */}
              {earnedCourses.map((course) => (
                <div key={course.id} className="certificate-card certificate-card--earned">
                  <div className="certificate-card-banner certificate-card-banner--earned">
                    <img src={sparkLogoImg} alt="" className="certificate-card-flame" />
                    <div className="certificate-card-icon">{course.icon}</div>
                    <h3 className="certificate-card-name">{course.name}</h3>
                    <p className="certificate-card-issuer">Issued by SPARK LMS · {company?.name?.toUpperCase() || "Company"} Corp.</p>
                  </div>
                  <div className="certificate-card-details">
                    <div className="certificate-card-meta">
                      <div className="certificate-card-meta-item">
                        <Calendar size={14} color="var(--color-text-muted)" />
                        {CERT_DATES[course.id] || "Mar 2026"}
                      </div>
                      <div className="certificate-card-meta-item">
                        <Award size={14} color="var(--color-text-muted)" />
                        {CERT_SCORES[course.id] || 90}%
                      </div>
                    </div>
                    <div className="certificate-card-actions">
                      <StatusBadge status="Verified" style={{ gap: 5 }}>
                        <Check size={12} /> Verified
                      </StatusBadge>
                      <Button variant="primary" size="sm" rounded="pill" onClick={() => setSelectedCourse(course)}>
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── In-Progress (Not Earned) ── */}
              {inProgressCourses.map((course) => (
                <div key={course.id} className="certificate-card certificate-card--not-earned">
                  <div className="certificate-card-banner certificate-card-banner--not-earned">
                    <img src={sparkLogoImg} alt="" className="certificate-card-flame" />
                    <div className="certificate-card-icon--not-earned">{course.icon}</div>
                    <h3 className="certificate-card-name" style={{ color: "var(--color-text-header)" }}>{course.name}</h3>
                    <p className="certificate-card-issuer">Complete the course to earn this certificate</p>
                  </div>
                  <div className="certificate-card-details">
                    <div className="certificate-progress">
                      <CircleDashed size={20} className="certificate-progress-icon" />
                      Progress: {course.progress}%
                    </div>
                    <div className="certificate-card-actions">
                      <StatusBadge status="Not Earned Yet">
                        Not Earned Yet
                      </StatusBadge>
                      <Button
                        variant="outline"
                        size="sm"
                        rounded="pill"
                        onClick={() => navigate(`/${slug}/courses/modules`, { state: { courseId: course.id } })}
                      >
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </PageTransition>
        </div>
      </div>
    </div>

      {selectedCourse && (
        <CertificateModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          userName={user?.name || ""}
          courseName={selectedCourse.name}
          date={CERT_DATES[selectedCourse.id] || "March 2026"}
          companyLogo={company?.logo_url}
        />
      )}
    </>
  );
};

export default Certificates;
