import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, PenTool, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import DashboardCard from "../../components/ui/DashboardCard/DashboardCard";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button/Button";
import { Lock, Unlock } from "lucide-react";
import LiftLockoutModal, { LockedOutLearnerData } from "../../components/common/Modal/LiftLockoutModal";
import "../User/Dashboard.css";

import type { LucideIcon } from "lucide-react";

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  sub: string;
  subColor: string;
};

const CreatorDashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [lockedOutUsers, setLockedOutUsers] = useState<LockedOutLearnerData[]>([]);
  const [selectedLearnerForLift, setSelectedLearnerForLift] = useState<LockedOutLearnerData | null>(null);
  const [isLifting, setIsLifting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!company?.id) return;

      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            id, title, status, created_at,
            course_modules (
              id, created_at,
              course_lessons ( id, created_at )
            )
          `)
          .eq('company_id', company.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let totalCourses = 0;
        let draftCourses = 0;
        let totalModules = 0;
        let modulesThisWeek = 0;
        let totalContents = 0;
        let contentsThisWeek = 0;

        data?.forEach((course: any) => {
          totalCourses++;
          if (course.status === 'draft') draftCourses++;
          
          course.course_modules?.forEach((mod: any) => {
            totalModules++;
            if (new Date(mod.created_at) > oneWeekAgo) modulesThisWeek++;
            
            mod.course_lessons?.forEach((lesson: any) => {
              totalContents++;
              if (new Date(lesson.created_at) > oneWeekAgo) contentsThisWeek++;
            });
          });
        });

        setStats([
          { label: "Courses", value: totalCourses, icon: BookOpen, sub: `${draftCourses} draft${draftCourses !== 1 ? 's' : ''}`, subColor: "#f59e0b" },
          { label: "Modules", value: totalModules, icon: FileText, sub: `↑ ${modulesThisWeek} this week`, subColor: "#27ae60" },
          { label: "Contents", value: totalContents, icon: PenTool, sub: `↑ ${contentsThisWeek} this week`, subColor: "#27ae60" },
        ]);

        const mappedRecent = (data || []).slice(0, 5).map((c: any) => {
          const mCount = c.course_modules?.length || 0;
          const lCount = c.course_modules?.reduce((acc: number, m: any) => acc + (m.course_lessons?.length || 0), 0) || 0;
          
          const date = new Date(c.created_at);
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          let updated = "";
          if (diffDays === 0) updated = "Today";
          else if (diffDays === 1) updated = "1 day ago";
          else if (diffDays < 7) updated = `${diffDays} days ago`;
          else if (diffDays < 14) updated = "1 week ago";
          else updated = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return {
            title: c.title,
            status: c.status === 'published' ? 'Published' : 'Draft',
            modules: mCount,
            lessons: lCount,
            updated: updated
          };
        });

        setRecentCourses(mappedRecent);

        // Fetch Lockouts
        const { data: attemptsData } = await supabase
          .from('assessment_attempts')
          .select(`
            id, user_id, assessment_id, score, passed,
            assessments(title, passing_score, course_lessons(course_modules(title, courses(title)))),
            users(firstname, lastname, email)
          `);

        if (attemptsData) {
          const activeAttempts = (attemptsData || []).filter((a: any) => !a.is_reset);
          const grouped: Record<string, any[]> = {};
          activeAttempts.forEach((a: any) => {
            const key = `${a.user_id}_${a.assessment_id}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(a);
          });
          
          const lockedOut: any[] = [];
          Object.values(grouped).forEach(group => {
            const hasPassed = group.some(a => a.passed || (a.assessments?.passing_score && a.score >= a.assessments.passing_score));
            if (!hasPassed && group.length >= 3) {
              const bestScore = Math.max(...group.map(a => a.score || 0));
              const latest = group[group.length - 1];
              const courseTitle = latest.assessments?.course_lessons?.course_modules?.courses?.title || 'Unknown Course';
              const moduleTitle = latest.assessments?.course_lessons?.course_modules?.title || 'Unknown Module';
              lockedOut.push({
                user_id: latest.user_id,
                assessment_id: latest.assessment_id,
                name: `${latest.users?.firstname} ${latest.users?.lastname}`,
                email: latest.users?.email,
                course: courseTitle,
                module: moduleTitle,
                assessmentTitle: latest.assessments?.title,
                bestScore,
                attempts: group.length
              });
            }
          });
          setLockedOutUsers(lockedOut);
        }

      } catch (err) {
        console.error("Error fetching creator dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [company?.id]);

  const handleLiftLockout = async () => {
    if (!selectedLearnerForLift) return;
    const { user_id, assessment_id } = selectedLearnerForLift;
    setIsLifting(true);
    try {
      const { error: updateErr } = await supabase
        .from('assessment_attempts')
        .update({ is_reset: true })
        .eq('user_id', user_id)
        .eq('assessment_id', assessment_id);
      
      if (updateErr) {
        // Fallback when is_reset column is not yet present in DB:
        const { data: attemptsToDelete } = await supabase
          .from('assessment_attempts')
          .select('id')
          .eq('user_id', user_id)
          .eq('assessment_id', assessment_id);

        if (attemptsToDelete && attemptsToDelete.length > 0) {
          const attemptIds = attemptsToDelete.map((a: any) => a.id);
          await supabase.from('attempt_answers').delete().in('attempt_id', attemptIds);
          await supabase.from('assessment_attempts').delete().in('id', attemptIds);
        }
      }
      
      setLockedOutUsers(prev => prev.filter(u => !(u.user_id === user_id && u.assessment_id === assessment_id)));
      setSelectedLearnerForLift(null);
    } catch (err) {
      console.error("Error lifting lockout:", err);
    } finally {
      setIsLifting(false);
    }
  };



  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Dashboard" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search ..." role="Creator" />

        <div className="dash-padding" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <PageTransition>
            <div className="dash-top">
              <div className="dash-top-greeting">
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Welcome Back!</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Here's your course creation overview</div>
              </div>
              <h1 className="dash-top-title" style={{ color: "var(--color-text-header)" }}>Creator Dashboard</h1>
              <div className="dash-top-btn-wrap"></div>
            </div>

            {/* Stat Cards */}
            <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
              {stats.map((s) => <DashboardCard key={s.label} {...s} />)}
            </div>

            {/* Main Content */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, paddingBottom: 40 }}>

              {/* Recent Courses */}
              <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)" }}>Courses</div>
                  <Button variant="outline" size="sm" rounded="pill" rightIcon={<ArrowRight size={14} />} onClick={() => navigate(`/${slug}/courses`)}>
                    View All
                  </Button>
                </div>

                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", paddingBottom: 12, borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: 13, fontWeight: 600 }}>
                  <div>Course</div>
                  <div>Status</div>
                  <div>Content</div>
                  <div style={{ textAlign: "right" }}>Updated</div>
                </div>

                {/* Rows */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {recentCourses.map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", alignItems: "center", padding: "16px 0", borderBottom: i < recentCourses.length - 1 ? "1px solid var(--color-border)" : "none", fontSize: 14 }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text-header)" }}>{c.title}</div>
                      <div>
                        <span style={{
                          background: c.status === "Published" ? "#E8F5E9" : "#FFF3E0",
                          color: c.status === "Published" ? "#2E7D32" : "#E65100",
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        }}>
                          {c.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        {c.modules} modules · {c.lessons} lessons
                      </div>
                      <div style={{ textAlign: "right", color: "var(--color-text-muted)", fontSize: 13 }}>
                        {c.updated}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Quick Actions */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)", marginBottom: 16 }}>Quick Actions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Button variant="primary" rounded="pill" onClick={() => navigate(`/${slug}/courses/create`)} style={{ width: "100%", justifyContent: "center" }}>
                      <Plus size={16} style={{ marginRight: 6 }} /> New Course
                    </Button>
                    <Button variant="outline" rounded="pill" onClick={() => navigate(`/${slug}/courses`)} style={{ width: "100%", justifyContent: "center" }}>
                      <BookOpen size={16} style={{ marginRight: 6 }} /> Manage Courses
                    </Button>
                  </div>
                </div>

                {/* Lockout Widget */}
                {lockedOutUsers.length > 0 && (
                  <div style={{ background: "#fef2f2", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid #fca5a5" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#991b1b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Lock size={18} /> Locked Out Learners
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {lockedOutUsers.map((u, i) => (
                        <div key={i} style={{ padding: "12px", background: "white", borderRadius: 8, border: "1px solid #fca5a5" }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-header)" }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>{u.email}</div>
                          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                            <strong>{u.course}</strong> — {u.module}
                          </div>
                          <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                            Attempts: {u.attempts} · Best: {u.bestScore}%
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            rounded="pill" 
                            onClick={() => setSelectedLearnerForLift(u)} 
                            style={{ width: "100%", marginTop: 12, justifyContent: "center", background: "#dc2626", border: "none" }}
                          >
                            <Unlock size={14} style={{ marginRight: 6 }} /> Lift Lockout
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div style={{ background: "var(--color-surface)", borderRadius: 12, padding: "20px 24px", boxShadow: "var(--shadow)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-header)", marginBottom: 16 }}>Creator Tips</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { tip: "Break content into small, focused modules for better retention", icon: "💡" },
                      { tip: "Add assessments to each module to measure understanding", icon: "📝" },
                      { tip: "Use video lessons for complex topics, reading for reference material", icon: "🎬" },
                    ].map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--color-border)" : "none" }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{t.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </div>

      <LiftLockoutModal
        isOpen={!!selectedLearnerForLift}
        learner={selectedLearnerForLift}
        isLoading={isLifting}
        onClose={() => !isLifting && setSelectedLearnerForLift(null)}
        onConfirm={handleLiftLockout}
      />
    </div>
  );
};

export default CreatorDashboard;
