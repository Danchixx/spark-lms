import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import CertificateModal from "../../components/ui/CertificateModal/CertificateModal";
import ProgressBar from "../../components/ui/ProgressBar/ProgressBar";
import { Calendar, Award, Check, CircleDashed } from "lucide-react";
import { useCourses } from "../../hooks/useCourses";
import sparkLogoImg from "../../components/common/SparkLogo/sparklogo.png";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import "./Certificates.css";

const Certificates = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();

  const slug = company?.name?.toLowerCase().replace(/\s+/g, "-");
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const { courses, loading } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Split courses into earned (completed) and in-progress
  const earnedCourses = courses.filter((c) => c.progress === 100);
  const inProgressCourses = courses.filter((c) => c.progress > 0 && c.progress < 100);

  return (
    <>
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Certificates" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="User" />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <h1 className="certificates-page-title">Certificates</h1>

            {loading ? (
              <div className="certificates-grid">
                <Skeleton height={280} borderRadius={16} />
                <Skeleton height={280} borderRadius={16} />
                <Skeleton height={280} borderRadius={16} />
              </div>
            ) : (
              <div className="certificates-grid">
                {/* ── Earned Certificates ── */}
                {earnedCourses.map((course) => (
                  <div key={course.id} className="certificate-card certificate-card--earned">
                    <div 
                      className="certificate-card-banner certificate-card-banner--earned"
                      style={{ backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined }}
                    >
                      <img src={sparkLogoImg} alt="" className="certificate-card-flame" style={{ zIndex: 2 }} />
                      <h3 className="certificate-card-name">{course.name}</h3>
                      <p className="certificate-card-issuer">Issued by SPARK LMS · {company?.name?.toUpperCase() || "Company"} Corp.</p>
                    </div>
                    <div className="certificate-card-details">
                      <div className="certificate-card-meta">
                        <div className="certificate-card-meta-item">
                          <Calendar size={14} color="var(--color-text-muted)" />
                          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                        <div className="certificate-card-meta-item">
                          <Award size={14} color="var(--color-text-muted)" />
                          100%
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
                    <div 
                      className="certificate-card-banner certificate-card-banner--not-earned"
                      style={{ backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined }}
                    >
                      <img src={sparkLogoImg} alt="" className="certificate-card-flame" style={{ zIndex: 2 }} />
                      <h3 className="certificate-card-name" style={{ color: "white" }}>{course.name}</h3>
                      <p className="certificate-card-issuer" style={{ color: "rgba(255,255,255,0.8)" }}>Complete the course to earn this certificate</p>
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

                {earnedCourses.length === 0 && inProgressCourses.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--color-text-muted)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                    <h3>No Certificates Yet</h3>
                    <p>Complete a course to earn your first certificate!</p>
                  </div>
                )}
              </div>
            )}

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
          date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          companyLogo={company?.logo_url}
        />
      )}
    </>
  );
};

export default Certificates;
