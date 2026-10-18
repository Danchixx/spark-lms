import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { 
  BookOpen, Users, ChevronRight, ChevronDown, ArrowLeft, Search, 
  CheckCircle, CheckCircle2, Clock, Play, FileText, PenTool, 
  Download, Eye, User as UserIcon, AlertCircle, X, Award, ExternalLink, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getCompanySlug } from "../../utils/slug";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import useSidebar from "../../hooks/useSidebar";
import Button from "../../components/ui/Button/Button";
import PageTransition from "../../components/common/PageTransition";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import { supabase } from "../../lib/supabase";
import * as courseService from "../../services/courseCreatorService";
import { FileBlockViewer } from "../../components/common/LessonCard/FileBlock";
import { EvaluationFormView } from "../../components/common/Evaluation";
import { parseEvaluationConfig } from "../../types/evaluation";
import "./CourseOverview.css";

interface CourseOverviewProps {
  embedded?: boolean;
  initialCourseId?: string | number;
}

const PAGE_SIZE = 10;

export default function CourseOverview({ embedded = false, initialCourseId }: CourseOverviewProps) {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen, toggle: toggleSidebar } = useSidebar();
  const slug = getCompanySlug(company);
  const onNavigate = (page: string) => navigate(`/${slug}/${page.toLowerCase()}`);

  const isSparkCpd = company?.name?.toUpperCase() === "SPARK CPD" || slug === "spark-cpd" || slug === "cpd" || company?.name?.toLowerCase().includes("cpd") || slug?.toLowerCase().includes("cpd");

  // Resolve courseId from prop, search param, or location state
  const [searchParams] = useSearchParams();
  const courseIdParam = initialCourseId || (location.state as any)?.courseId || searchParams.get("courseId");

  // Data States
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Level 2 Data (Enrolled Users)
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  // Level 3 Data (Modules, Lessons, Responses)
  const [courseStructure, setCourseStructure] = useState<{ course: any; modules: any[] } | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<number, any>>({});
  const [hybridResponsesMap, setHybridResponsesMap] = useState<Record<string, any>>({});
  const [assessmentAttemptsMap, setAssessmentAttemptsMap] = useState<Record<number, any>>({});
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Fetch single selected course
  useEffect(() => {
    if (!company?.id) return;

    if (!courseIdParam) {
      navigate(`/${slug}/courses`, { replace: true });
      return;
    }

    const loadSingleCourse = async () => {
      setLoadingCourse(true);
      try {
        const { data: c, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            status,
            created_at,
            course_modules (
              id,
              course_lessons ( id, type )
            ),
            course_assignments ( id, user_id )
          `)
          .eq('id', courseIdParam)
          .eq('company_id', company.id)
          .eq('is_archived', false)
          .maybeSingle();

        if (error) throw error;

        if (!c) {
          navigate(`/${slug}/courses`, { replace: true });
          return;
        }

        const mods = c.course_modules || [];
        const allLessons = mods.flatMap((m: any) => m.course_lessons || []);
        const lessonTypeMap: Record<number, string> = {};
        allLessons.forEach((l: any) => { lessonTypeMap[l.id] = l.type; });

        const lessonsCount = allLessons.filter((l: any) => l.type !== 'assessment').length;
        const assessmentsCount = allLessons.filter((l: any) => l.type === 'assessment').length;
        const totalItemsCount = allLessons.length;
        const enrolledCount = (c.course_assignments || []).length;
        setSelectedCourse({
          id: c.id,
          title: c.title,
          description: c.description,
          thumbnail: c.thumbnail_url || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600",
          status: c.status,
          modulesCount: mods.length,
          lessonsCount,
          assessmentsCount,
          totalItemsCount,
          lessonTypeMap,
          enrolledCount,
          createdAt: c.created_at
        });
      } catch (err) {
        console.error("Error loading course for overview:", err);
        navigate(`/${slug}/courses`, { replace: true });
      } finally {
        setLoadingCourse(false);
      }
    };

    loadSingleCourse();
  }, [company?.id, courseIdParam, slug, navigate]);

  // When selectedCourse changes, load its enrolled users and assignments
  useEffect(() => {
    if (!selectedCourse) {
      setEnrolledUsers([]);
      return;
    }

    const loadEnrolledUsers = async () => {
      setLoadingUsers(true);
      setUserCurrentPage(1);
      try {
        let assignmentsData: any[] = [];

        // 1. Try joined query with explicit relationship disambiguation
        const { data: assignments, error: aErr } = await supabase
          .from('course_assignments')
          .select(`
            id,
            user_id,
            status,
            assigned_at,
            course_progress ( progress_pct ),
            users:users!course_assignments_user_id_fkey (
              id,
              firstname,
              lastname,
              email,
              avatar_url,
              department,
              cpd_school_name
            )
          `)
          .eq('course_id', selectedCourse.id);

        if (!aErr && assignments && assignments.length > 0) {
          assignmentsData = assignments;
        } else {
          // Fallback: fetch assignments directly, then fetch users
          const { data: rawAssignments, error: rawErr } = await supabase
            .from('course_assignments')
            .select('id, user_id, status, assigned_at, course_progress(progress_pct)')
            .eq('course_id', selectedCourse.id);

          if (rawErr) throw rawErr;

          const rawList = rawAssignments || [];
          const userIds = Array.from(new Set(rawList.map((a: any) => a.user_id).filter(Boolean)));
          const usersMap: Record<string, any> = {};

          if (userIds.length > 0) {
            const { data: usersData, error: uErr } = await supabase
              .from('users')
              .select('id, firstname, lastname, email, avatar_url, department, cpd_school_name')
              .in('id', userIds);

            if (!uErr && usersData) {
              usersData.forEach((u: any) => { usersMap[u.id] = u; });
            }
          }

          assignmentsData = rawList.map((a: any) => ({
            ...a,
            users: usersMap[a.user_id] || null
          }));
        }

        // 2. Fetch lessons_progress for these assignments to accurately calculate lesson progress
        const assignmentIds = assignmentsData.map((a: any) => a.id);
        const progByAssignment = new Map<number, any[]>();

        if (assignmentIds.length > 0) {
          const { data: progRows } = await supabase
            .from('lessons_progress')
            .select('assignment_id, lesson_id, is_completed')
            .in('assignment_id', assignmentIds)
            .eq('is_completed', true);

          if (progRows && progRows.length > 0) {
            progRows.forEach((row: any) => {
              if (!progByAssignment.has(row.assignment_id)) {
                progByAssignment.set(row.assignment_id, []);
              }
              progByAssignment.get(row.assignment_id)!.push(row);
            });
          }
        }

        const totalCourseLessons = selectedCourse.totalItemsCount || selectedCourse.lessonsCount || 1;

        const typeMap = selectedCourse?.lessonTypeMap || {};
        const mapped = assignmentsData.map((a: any) => {
          const u = Array.isArray(a.users) ? a.users[0] : (a.users || {});
          const completedForAssign = progByAssignment.get(a.id) || [];
          const completedLessonIds = Array.from(new Set(completedForAssign.map((lp: any) => lp.lesson_id)));
          const completedCount = completedLessonIds.length;
          const completedLessonsOnly = completedLessonIds.filter((id: any) => typeMap[id] !== 'assessment').length;
          const completedAssessmentsOnly = completedLessonIds.filter((id: any) => typeMap[id] === 'assessment').length;

          let progress = 0;
          const dbProgress = a.course_progress?.[0]?.progress_pct ?? a.course_progress?.progress_pct;
          if (typeof dbProgress === 'number' && dbProgress > 0) {
            progress = dbProgress;
          } else if (a.status === 'completed') {
            progress = 100;
          } else if (totalCourseLessons > 0) {
            progress = Math.min(100, Math.round((completedCount / totalCourseLessons) * 100));
          }

          let status = "Not Started";
          let statusColor = "var(--color-text-muted)";
          if (progress === 100 || a.status === 'completed') {
            status = "Completed";
            statusColor = "var(--color-success, #27ae60)";
          } else if (progress > 0 || a.status === 'in_progress' || a.status === 'in-progress') {
            status = "In Progress";
            statusColor = "#FF9800";
          }

          const dept = u.department;
          const school = u.cpd_school_name;
          const displayDept = (isSparkCpd ? (school || dept) : (dept || school)) || "N/A";

          return {
            assignmentId: a.id,
            user: {
              id: u.id || a.user_id,
              name: `${u.firstname || ""} ${u.lastname || ""}`.trim() || u.email || "Unknown User",
              email: u.email || "N/A",
              avatar: u.avatar_url,
              department: displayDept,
              school: u.cpd_school_name || "N/A"
            },
            progress,
            status,
            statusColor,
            completedLessonsCount: completedCount,
            completedLessonsOnlyCount: completedLessonsOnly,
            completedAssessmentsCount: completedAssessmentsOnly,
            assignedAt: a.assigned_at ? new Date(a.assigned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}) : "N/A"
          };
        });

        setEnrolledUsers(mapped);
      } catch (err) {
        console.error("Error loading enrolled users for course:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadEnrolledUsers();
  }, [selectedCourse, isSparkCpd]);

  // When selectedUser & selectedCourse are active, fetch course structure and user's responses
  useEffect(() => {
    if (!selectedCourse || !selectedUser) {
      setCourseStructure(null);
      setSelectedLesson(null);
      return;
    }

    const loadUserProgressAndResponses = async () => {
      setLoadingStructure(true);
      setLoadingResponses(true);
      try {
        // 1. Fetch complete course modules and lessons
        const { course, modules } = await courseService.fetchCourseWithModules(Number(selectedCourse.id));
        setCourseStructure({ course, modules });

        // Auto-expand only the first module initially
        const expanded: Record<number, boolean> = {};
        if (modules.length > 0) {
          expanded[modules[0].id] = true;
        }
        setExpandedModules(expanded);

        // Auto-select first lesson if available
        if (modules.length > 0 && modules[0].lessons?.length > 0) {
          setSelectedLesson(modules[0].lessons[0]);
        }

        const allLessonIds = modules.flatMap(m => (m.lessons || []).map((l: any) => l.id));

        if (allLessonIds.length > 0) {
          // 2. Fetch user's lessons_progress for these lessons using assignment_id
          let lpQuery = supabase
            .from('lessons_progress')
            .select('*')
            .in('lesson_id', allLessonIds);

          if (selectedUser.assignmentId) {
            lpQuery = lpQuery.eq('assignment_id', selectedUser.assignmentId);
          } else {
            lpQuery = lpQuery.eq('user_id', selectedUser.user.id);
          }
          const { data: lpData } = await lpQuery;

          const lpMap: Record<number, any> = {};
          (lpData || []).forEach(lp => {
            lpMap[lp.lesson_id] = lp;
          });
          setLessonProgressMap(lpMap);

          // 3. Fetch user's hybrid_lesson_responses for these lessons
          const { data: hrData } = await supabase
            .from('hybrid_lesson_responses')
            .select('*')
            .eq('user_id', selectedUser.user.id)
            .in('lesson_id', allLessonIds);

          const hrMap: Record<string, any> = {};
          (hrData || []).forEach(hr => {
            const key = `${hr.lesson_id}_${hr.question_id}`;
            hrMap[key] = hr.answer_data;
          });
          setHybridResponsesMap(hrMap);

          // 4. Fetch assessments and assessment attempts for this user
          const assessmentLessons = modules.flatMap(m => (m.lessons || []).filter((l: any) => l.type === 'assessment'));
          const assessmentLessonIds = assessmentLessons.map(l => l.id);

          if (assessmentLessonIds.length > 0) {
            const { data: assessData } = await supabase
              .from('assessments')
              .select(`
                id,
                lesson_id,
                title,
                passing_score,
                assessment_questions (
                  id,
                  question_text,
                  position,
                  question_type,
                  correct_answers,
                  assessment_choices (
                    id,
                    choice_text,
                    is_correct
                  )
                ),
                assessment_attempts (
                  id,
                  score,
                  passed,
                  attempted_at,
                  user_id,
                  attempt_answers (
                    id,
                    question_id,
                    choice_id,
                    text_answer
                  )
                )
              `)
              .in('lesson_id', assessmentLessonIds);

            const aaMap: Record<number, any> = {};
            (assessData || []).forEach(a => {
              const userAttempts = (a.assessment_attempts || []).filter((att: any) => att.user_id === selectedUser.user.id);
              const questions = (a.assessment_questions || []).sort((x: any, y: any) => (x.position || 0) - (y.position || 0));
              questions.forEach((q: any) => {
                if (q.assessment_choices) {
                  q.assessment_choices.sort((x: any, y: any) => x.id - y.id);
                }
              });

              let latestAttempt: any = null;
              const answerMap: Record<number, any> = {};

              if (userAttempts.length > 0) {
                userAttempts.sort((x: any, y: any) => new Date(y.attempted_at).getTime() - new Date(x.attempted_at).getTime());
                latestAttempt = userAttempts[0];

                (latestAttempt?.attempt_answers || []).forEach((ans: any) => {
                  answerMap[ans.question_id] = ans;
                });
              }

              aaMap[a.lesson_id] = {
                assessment: a,
                attempt: latestAttempt,
                questions,
                answerMap
              };
            });
            setAssessmentAttemptsMap(aaMap);
          }
        }
      } catch (err) {
        console.error("Error loading user course review structure:", err);
      } finally {
        setLoadingStructure(false);
        setLoadingResponses(false);
      }
    };

    loadUserProgressAndResponses();
  }, [selectedCourse, selectedUser]);



  // Filtered enrolled users for Level 2
  const filteredEnrolled = enrolledUsers.filter(u => {
    if (statusFilter !== "All" && u.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.user.name.toLowerCase().includes(q) || (u.user.email || "").toLowerCase().includes(q) || (u.user.department || "").toLowerCase().includes(q);
  });

  // Pagination for Level 2 Enrolled Users Table
  const totalUserPages = Math.ceil(filteredEnrolled.length / PAGE_SIZE) || 1;
  const pagedEnrolledUsers = filteredEnrolled.slice((userCurrentPage - 1) * PAGE_SIZE, userCurrentPage * PAGE_SIZE);

  const getUserPageNumbers = () => {
    if (totalUserPages <= 7) {
      return Array.from({ length: totalUserPages }, (_, i) => i + 1);
    }
    if (userCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalUserPages];
    }
    if (userCurrentPage >= totalUserPages - 3) {
      return [1, '...', totalUserPages - 4, totalUserPages - 3, totalUserPages - 2, totalUserPages - 1, totalUserPages];
    }
    return [1, '...', userCurrentPage - 1, userCurrentPage, userCurrentPage + 1, '...', totalUserPages];
  };

  // Helper: Lesson Icon
  const renderLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Play size={16} />;
      case "assessment": return <PenTool size={16} />;
      case "hybrid": return <FileText size={16} />;
      case "reading": return <FileText size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER CONTENT
  // ─────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (loadingCourse) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 0" }}>
          <Skeleton height={140} borderRadius="16px" />
          <Skeleton height={350} borderRadius="16px" />
        </div>
      );
    }

    if (!selectedCourse) {
      return null;
    }

    // ═══════════════════════════════════════════════════════════
    // LEVEL 3: INSPECT SELECTED USER'S COURSE WORK
    // ═══════════════════════════════════════════════════════════
    if (selectedUser) {
      const userObj = selectedUser.user;
      const allCourseLessons = (courseStructure?.modules || []).flatMap((m: any) => m.lessons || []);
      const regularLessons = allCourseLessons.filter((l: any) => l.type !== 'assessment');
      const assessmentLessons = allCourseLessons.filter((l: any) => l.type === 'assessment');

      const totalRegular = regularLessons.length || selectedCourse.lessonsCount || 0;
      const totalAssessments = assessmentLessons.length || selectedCourse.assessmentsCount || 0;

      const completedRegular = courseStructure 
        ? regularLessons.filter((l: any) => lessonProgressMap[l.id]?.is_completed).length
        : (selectedUser.completedLessonsOnlyCount ?? Math.min(totalRegular, selectedUser.completedLessonsCount || 0));

      const completedAssessments = courseStructure
        ? assessmentLessons.filter((l: any) => lessonProgressMap[l.id]?.is_completed).length
        : (selectedUser.completedAssessmentsCount ?? 0);

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
          {/* Breadcrumb & Navigation */}
          <div className="overview-breadcrumb-wrap">
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
              <button 
                onClick={() => { setSelectedUser(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20,
                  border: "1px solid var(--color-border)", background: "var(--color-surface)",
                  color: "#FF6B00", cursor: "pointer", fontFamily: "inherit", fontWeight: 700
                }}
              >
                <ArrowLeft size={14} /> Back to Enrolled Learners
              </button>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-muted)" }}>Course Overview</span>
              <ChevronRight size={14} color="var(--color-text-muted)" />
              <span style={{ color: "var(--color-text-header)" }}>User View</span>
            </div>

            {/* Quick Learner Switcher */}
            {enrolledUsers.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Switch Learner:</span>
                  <select
                    value={userObj.id}
                    onChange={(e) => {
                      const match = enrolledUsers.find(u => u.user.id === e.target.value);
                      if (match) setSelectedUser(match);
                    }}
                    style={{
                      padding: "6px 12px", borderRadius: 8,
                      border: "1px solid var(--color-border)", background: "var(--color-surface)",
                      fontSize: 13, color: "var(--color-text-header)", outline: "none", cursor: "pointer"
                    }}
                  >
                    {enrolledUsers.map((u) => (
                      <option key={u.user.id} value={u.user.id}>
                        {u.user.name} ({u.progress}% - {u.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          {/* Learner Progress Banner */}
          <div className="overview-user-banner">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {userObj.avatar ? (
                <img src={userObj.avatar} alt={userObj.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
                  {userObj.name.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-text-header)" }}>{userObj.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {userObj.email} • <span style={{ color: "var(--color-text-header)", fontWeight: 600 }}>{isSparkCpd ? `School: ${userObj.department}` : `Dept: ${userObj.department}`}</span>
                </div>
              </div>
            </div>

            <div className="overview-completion-block" style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Overall Completion</div>
              <div className="overview-completion-row" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, margin: "2px 0" }}>
                <div style={{ width: 90, height: 8, background: "var(--color-bg-muted, #eee)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${selectedUser.progress}%`, background: selectedUser.progress === 100 ? "#27ae60" : "#FF6B00", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: selectedUser.progress === 100 ? "#27ae60" : "#FF6B00" }}>
                  {selectedUser.progress}%
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {totalAssessments > 0 ? (
                  <span>
                    {completedRegular} of {totalRegular} lessons • {completedAssessments} of {totalAssessments} assessments completed
                  </span>
                ) : (
                  <span>
                    {completedRegular} of {totalRegular} lessons completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Course Builder UI (Read-Only Review Mode) */}
          {loadingStructure ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton height={140} borderRadius={16} />
              <Skeleton height={80} borderRadius={12} />
              <Skeleton height={80} borderRadius={12} />
            </div>
          ) : !courseStructure ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Could not load course modules.</div>
          ) : (
            <div className="overview-builder-grid">
              {/* Left Column: Modules & Lessons Accordion (Matches Builder UI) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-header)" }}>
                    Course Modules ({courseStructure.modules.length})
                  </div>
                </div>

                {courseStructure.modules.map((module, mIdx) => {
                  const isExpanded = !!expandedModules[module.id];
                  const moduleLessons = module.lessons || [];
                  const moduleCompletedCount = moduleLessons.filter((l: any) => lessonProgressMap[l.id]?.is_completed).length;

                  return (
                    <div key={module.id} className={`overview-module-card ${isExpanded ? "expanded" : ""}`}>
                      {/* Module Header */}
                      <div 
                        className="overview-module-header"
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-header)" }}>{module.title}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                              {(() => {
                                const lCount = moduleLessons.filter((l: any) => l.type !== "assessment").length;
                                const aCount = moduleLessons.filter((l: any) => l.type === "assessment").length;
                                return (
                                  <>
                                    {lCount} {lCount === 1 ? "Lesson" : "Lessons"}
                                    {aCount > 0 ? ` · ${aCount} ${aCount === 1 ? "Assessment" : "Assessments"}` : ""}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ 
                            padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                            background: moduleCompletedCount === moduleLessons.length && moduleLessons.length > 0 ? "#E8F5E9" : "var(--color-bg-subtle)",
                            color: moduleCompletedCount === moduleLessons.length && moduleLessons.length > 0 ? "#2E7D32" : "var(--color-text-muted)"
                          }}>
                            {moduleCompletedCount}/{moduleLessons.length}
                          </span>
                          <ChevronDown size={18} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "var(--color-text-muted)" }} />
                        </div>
                      </div>

                      {/* Lessons List under Module */}
                      {isExpanded && (
                        <div>
                          {moduleLessons.map((lesson: any) => {
                            const isCompleted = !!lessonProgressMap[lesson.id]?.is_completed;
                            const isSelected = selectedLesson?.id === lesson.id;

                            return (
                              <div 
                                key={lesson.id}
                                className={`overview-lesson-item ${isSelected ? "active" : ""}`}
                                onClick={() => setSelectedLesson(lesson)}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    width: 30, height: 30, borderRadius: 6, 
                                    background: "var(--color-bg-subtle)",
                                    color: "var(--color-text-muted)",
                                    display: "flex", alignItems: "center", justifyContent: "center" 
                                  }}>
                                    {renderLessonTypeIcon(lesson.type)}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: "var(--color-text-header)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {lesson.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                                      {lesson.type} Lesson
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  {isCompleted ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 12, background: "#E8F5E9", color: "#2E7D32", fontSize: 11, fontWeight: 700 }}>
                                      <CheckCircle2 size={12} /> Completed
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 12, background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontSize: 11, fontWeight: 600 }}>
                                      <Clock size={12} /> Not Completed
                                    </div>
                                  )}
                                  <ChevronRight size={16} color="var(--color-text-muted)" />
                                </div>
                              </div>
                            );
                          })}

                          {moduleLessons.length === 0 && (
                            <div style={{ padding: "16px 20px", fontSize: 12, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                              No lessons in this module.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Inspect Selected Lesson Contents & User Responses */}
              <div style={{ position: "sticky", top: 20 }}>
                {selectedLesson ? (
                  <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1.5px solid var(--color-border)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
                    {/* Lesson Header */}
                    <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 16, marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {selectedLesson.type} LESSON CONTENT & RESPONSES
                        </span>
                        {lessonProgressMap[selectedLesson.id]?.is_completed ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#E8F5E9", color: "#2E7D32", padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> Finished
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--color-text-header)" }}>
                        {selectedLesson.title}
                      </h3>
                    </div>

                    {/* Lesson Details according to Type */}
                    {selectedLesson.type === "video" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {selectedLesson.video_url ? (
                          <div style={{ position: "relative", width: "100%", height: 240, borderRadius: 12, overflow: "hidden", background: "#000" }}>
                            <iframe 
                              src={selectedLesson.video_url} 
                              title={selectedLesson.title}
                              style={{ width: "100%", height: "100%", border: "none" }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div style={{ padding: 24, background: "var(--color-bg-subtle)", borderRadius: 10, textAlign: "center", color: "var(--color-text-muted)", fontSize: 13 }}>
                            No video URL configured for this lesson.
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                          Learner Status: {lessonProgressMap[selectedLesson.id]?.is_completed ? <strong style={{ color: "#27ae60" }}>Watched / Completed</strong> : <span>Not yet completed</span>}
                        </div>
                      </div>
                    )}

                    {selectedLesson.type === "reading" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div 
                          className="tiptap-content sun-editor-editable"
                          style={{ maxHeight: 400, overflowY: "auto", padding: 16, background: "var(--color-bg-subtle)", borderRadius: 10 }}
                          dangerouslySetInnerHTML={{ __html: selectedLesson.content || "<i>No reading text content provided.</i>" }}
                        />
                        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                          Learner Status: {lessonProgressMap[selectedLesson.id]?.is_completed ? <strong style={{ color: "#27ae60" }}>Read / Completed</strong> : <span>Not yet completed</span>}
                        </div>
                      </div>
                    )}

                    {/* Assessment Type Lesson */}
                    {selectedLesson.type === "assessment" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {(() => {
                          const attemptInfo = assessmentAttemptsMap[selectedLesson.id];
                          const attempt = attemptInfo?.attempt;
                          const assessment = attemptInfo?.assessment;
                          const questions = attemptInfo?.questions || [];
                          const answerMap = attemptInfo?.answerMap || {};

                          // Determine if this assessment is an evaluation form
                          const isEvaluationAssessment =
                            selectedLesson.title?.toLowerCase().includes("evaluation") ||
                            selectedLesson.title?.toLowerCase().includes("feedback") ||
                            assessment?.title?.toLowerCase().includes("evaluation") ||
                            assessment?.title?.toLowerCase().includes("feedback") ||
                            questions.some((q: any) =>
                              q.question_type === "evaluation" ||
                              q.question_text?.toLowerCase().includes("evaluation") ||
                              q.question_text?.toLowerCase().includes("feedback") ||
                              (answerMap[q.id]?.text_answer && (
                                typeof answerMap[q.id].text_answer === "object" ||
                                String(answerMap[q.id].text_answer).includes("ratings") ||
                                String(answerMap[q.id].text_answer).includes("feedback")
                              ))
                            );

                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                              {attempt ? (
                                isEvaluationAssessment ? (
                                  <div style={{
                                    background: "rgba(255, 107, 0, 0.08)",
                                    border: "1.5px solid #FF6B00",
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 4
                                  }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                      <span style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", display: "flex", alignItems: "center", gap: 6, letterSpacing: 0.5 }}>
                                        <CheckCircle2 size={16} color="#FF6B00" />
                                        EVALUATION COMPLETED
                                      </span>
                                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                        Submitted: {new Date(attempt.attempted_at).toLocaleDateString()} {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-header)" }}>
                                      Course Evaluation & Participant Feedback
                                    </div>
                                    <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 4 }}>
                                      Learner has submitted ratings for each evaluation statement and provided written feedback comments.
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ background: attempt.passed ? "rgba(46, 125, 50, 0.08)" : "rgba(211, 47, 47, 0.08)", border: `1.5px solid ${attempt.passed ? "#2E7D32" : "#D32F2F"}`, borderRadius: 12, padding: 16, marginBottom: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: attempt.passed ? "#2E7D32" : "#D32F2F" }}>
                                        {attempt.passed ? "PASSED" : "FAILED"}
                                      </span>
                                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                        Attempted: {new Date(attempt.attempted_at).toLocaleDateString()} {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text-header)" }}>
                                      Score: {attempt.score}% {(assessment?.passing_score != null && assessment.passing_score > 0) ? (
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>(Passing score: {assessment.passing_score}%)</span>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              ) : (
                                <div style={{ padding: 16, background: "var(--color-bg-subtle)", borderRadius: 12, marginBottom: 4, color: "var(--color-text-muted)", fontSize: 13, textAlign: "center" }}>
                                  {isEvaluationAssessment ? "Learner has not submitted this evaluation yet." : "Learner has not attempted this assessment yet."}
                                </div>
                              )}

                              {/* Questions and User Answers */}
                              {questions.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px" }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-header)" }}>
                                      {isEvaluationAssessment ? "Submitted Evaluation & Feedback" : `Assessment Questions (${questions.length})`}
                                    </div>
                                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                      {isEvaluationAssessment ? "Completed" : `${Object.keys(answerMap).length} of ${questions.length} answered`}
                                    </span>
                                  </div>

                                  {questions.map((q: any, qIdx: number) => {
                                    const ans = answerMap[q.id];
                                    const userChoiceId = ans?.choice_id;
                                    const userTextAns = ans?.text_answer;
                                    const hasSubmitted = ans !== undefined && (userChoiceId != null || (userTextAns != null && userTextAns !== ""));

                                    const isEvalQ =
                                      q.question_type === 'evaluation' ||
                                      isEvaluationAssessment ||
                                      q.question_text?.toLowerCase().includes('evaluation') ||
                                      q.question_text?.toLowerCase().includes('feedback') ||
                                      (userTextAns && (
                                        typeof userTextAns === 'object' ||
                                        String(userTextAns).includes('ratings') ||
                                        String(userTextAns).includes('feedback')
                                      ));

                                    return (
                                      <div key={q.id} style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 16, background: "var(--color-surface)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>
                                            <span style={{ color: "#FF6B00", marginRight: 6 }}>Q{qIdx + 1}.</span> {q.question_text}
                                          </div>
                                          {hasSubmitted ? (
                                            <span style={{
                                              padding: "2px 8px",
                                              borderRadius: 10,
                                              background: isEvalQ ? "rgba(255, 107, 0, 0.12)" : "#E8F5E9",
                                              color: isEvalQ ? "#FF6B00" : "#2E7D32",
                                              fontSize: 10,
                                              fontWeight: 700,
                                              whiteSpace: "nowrap"
                                            }}>
                                              {isEvalQ ? "Evaluation Submitted" : "Answered"}
                                            </span>
                                          ) : (
                                            <span style={{ padding: "2px 8px", borderRadius: 10, background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                              Not Answered
                                            </span>
                                          )}
                                        </div>

                                        {/* Multiple Choice & True/False */}
                                        {!isEvalQ && (q.question_type === 'multiple_choice' || q.question_type === 'true_false' || !q.question_type) && (
                                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {(q.assessment_choices || []).map((choice: any) => {
                                              const isUserChoice = userChoiceId != null && String(userChoiceId) === String(choice.id);
                                              const isCorrectChoice = !!choice.is_correct;

                                              let border = "1px solid var(--color-border)";
                                              let bg = "var(--color-bg)";
                                              let badge = null;

                                              if (isUserChoice && isCorrectChoice) {
                                                border = "2px solid #4CAF50";
                                                bg = "rgba(76, 175, 80, 0.1)";
                                                badge = <span style={{ color: "#4CAF50", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> Learner's Answer (Correct)</span>;
                                              } else if (isUserChoice && !isCorrectChoice) {
                                                border = "2px solid #F44336";
                                                bg = "rgba(244, 67, 54, 0.1)";
                                                badge = <span style={{ color: "#F44336", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><X size={14} /> Learner's Answer (Incorrect)</span>;
                                              } else if (isCorrectChoice) {
                                                border = "1.5px dashed #4CAF50";
                                                badge = <span style={{ color: "#4CAF50", fontWeight: 600, fontSize: 11 }}>Correct Answer</span>;
                                              }

                                              return (
                                                <div key={choice.id} style={{ padding: "10px 14px", borderRadius: 8, border, background: bg, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                                  <span style={{ fontWeight: isUserChoice ? 700 : 500, color: "var(--color-text-header)" }}>{choice.choice_text}</span>
                                                  {badge}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {/* Identification or Enumeration */}
                                        {!isEvalQ && (q.question_type === 'identification' || q.question_type === 'enumeration') && (
                                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Learner's Submitted Response:</div>
                                            <div style={{ padding: "10px 14px", borderRadius: 8, background: hasSubmitted ? "var(--color-bg)" : "var(--color-bg-subtle)", border: "1.5px solid var(--color-border)", fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>
                                              {userTextAns ? String(userTextAns) : <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No answer submitted</span>}
                                            </div>
                                            {q.correct_answers && q.correct_answers.length > 0 && (
                                              <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(76, 175, 80, 0.08)", borderLeft: "3px solid #4CAF50", fontSize: 12, color: "#2E7D32" }}>
                                                <strong>Correct Answer:</strong> {Array.isArray(q.correct_answers) ? q.correct_answers.join(", ") : String(q.correct_answers)}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Essay */}
                                        {!isEvalQ && q.question_type === 'essay' && (
                                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Learner's Essay Response:</div>
                                            <div style={{ 
                                              padding: 14, borderRadius: 8, background: "var(--color-bg)", border: "1px solid var(--color-border)", 
                                              fontSize: 13, lineHeight: 1.6, color: "var(--color-text-header)", minHeight: 80, whiteSpace: "pre-wrap" 
                                            }}>
                                              {userTextAns ? String(userTextAns) : <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No essay submitted by learner.</span>}
                                            </div>
                                          </div>
                                        )}

                                        {/* Evaluation Form */}
                                        {isEvalQ && (() => {
                                          let evalAns: any = { ratings: {}, feedback: {} };
                                          try {
                                            if (userTextAns) {
                                              evalAns = typeof userTextAns === 'object' ? userTextAns : JSON.parse(userTextAns);
                                            }
                                          } catch (e) {
                                            console.error("Failed to parse evaluation answer", e);
                                          }

                                          const safeRatings = (evalAns && typeof evalAns.ratings === 'object') ? evalAns.ratings : {};
                                          const safeFeedback = (evalAns && typeof evalAns.feedback === 'object') ? evalAns.feedback : {};

                                          const evalConfig = parseEvaluationConfig(
                                            q.evaluation_config ||
                                            (Array.isArray(q.correct_answers) ? q.correct_answers[0] : q.correct_answers)
                                          );

                                          const ratedCount = Object.keys(safeRatings).length;
                                          const feedbackCount = Object.values(safeFeedback).filter((v: any) => v && String(v).trim().length > 0).length;

                                          return (
                                            <div style={{ marginTop: 10 }}>
                                              {/* Evaluation Stats Pill */}
                                              <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 16,
                                                flexWrap: "wrap",
                                                marginBottom: 14,
                                                padding: "10px 14px",
                                                background: "rgba(255, 107, 0, 0.08)",
                                                borderRadius: 8,
                                                border: "1px solid rgba(255, 107, 0, 0.25)"
                                              }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", display: "flex", alignItems: "center", gap: 6 }}>
                                                  <CheckCircle2 size={16} color="#FF6B00" />
                                                  <span>Ratings Submitted: <strong>{ratedCount}</strong> statement{ratedCount === 1 ? '' : 's'}</span>
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", display: "flex", alignItems: "center", gap: 6 }}>
                                                  <Edit3 size={16} color="#FF6B00" />
                                                  <span>Written Feedback: <strong>{feedbackCount}</strong> comment{feedbackCount === 1 ? '' : 's'}</span>
                                                </div>
                                              </div>

                                              <EvaluationFormView
                                                config={evalConfig}
                                                answers={{ ratings: safeRatings, feedback: safeFeedback }}
                                                readOnly={true}
                                              />
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Hybrid Type Lesson (Questions & Blocks) */}
                    {selectedLesson.type === "hybrid" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {(() => {
                          let blocks: any[] = [];
                          try {
                            blocks = JSON.parse(selectedLesson.content || "[]");
                          } catch {
                            blocks = [];
                          }

                          if (!Array.isArray(blocks) || blocks.length === 0) {
                            return <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No blocks in this hybrid lesson.</div>;
                          }

                          let questionCounter = 0;
                          return blocks.map((block: any, bIdx: number) => {
                            if (block.type === "reading") {
                              return (
                                <div key={bIdx} style={{ background: "var(--color-bg-subtle)", padding: 14, borderRadius: 10 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase" }}>Reading Section</div>
                                  <div className="tiptap-content sun-editor-editable" dangerouslySetInnerHTML={{ __html: block.content || "" }} />
                                </div>
                              );
                            }

                            if (block.type === "file") {
                              return (
                                <div key={bIdx}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6, textTransform: "uppercase" }}>Attached File / Resource</div>
                                  <FileBlockViewer block={block} />
                                </div>
                              );
                            }

                            if (block.type === "question" && block.question) {
                              questionCounter++;
                              const qNum = questionCounter;
                              const q = block.question;
                              const responseKey = `${selectedLesson.id}_${block.id}`;
                              const userAns = hybridResponsesMap[responseKey];
                              const hasSubmitted = userAns !== undefined && userAns !== null;

                              return (
                                <div key={bIdx} style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: 16, background: "var(--color-surface)" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>
                                      <span style={{ color: "#FF6B00", marginRight: 6 }}>Q{qNum}.</span> {q.question_text}
                                    </div>
                                    {hasSubmitted ? (
                                      <span style={{ padding: "2px 8px", borderRadius: 10, background: "#E8F5E9", color: "#2E7D32", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                        Answered
                                      </span>
                                    ) : (
                                      <span style={{ padding: "2px 8px", borderRadius: 10, background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                                        Not Answered
                                      </span>
                                    )}
                                  </div>

                                  {/* Multiple Choice & True/False */}
                                  {(q.question_type === 'multiple_choice' || q.question_type === 'true_false') && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      {(q.choices || []).map((choice: any) => {
                                        const isUserChoice = String(userAns) === String(choice.id);
                                        const isCorrectChoice = !!choice.is_correct;

                                        let border = "1px solid var(--color-border)";
                                        let bg = "var(--color-bg)";
                                        let badge = null;

                                        if (isUserChoice && isCorrectChoice) {
                                          border = "2px solid #4CAF50";
                                          bg = "rgba(76, 175, 80, 0.1)";
                                          badge = <span style={{ color: "#4CAF50", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> Learner's Answer (Correct)</span>;
                                        } else if (isUserChoice && !isCorrectChoice) {
                                          border = "2px solid #F44336";
                                          bg = "rgba(244, 67, 54, 0.1)";
                                          badge = <span style={{ color: "#F44336", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><X size={14} /> Learner's Answer (Incorrect)</span>;
                                        } else if (isCorrectChoice) {
                                          border = "1.5px dashed #4CAF50";
                                          badge = <span style={{ color: "#4CAF50", fontWeight: 600, fontSize: 11 }}>Correct Answer</span>;
                                        }

                                        return (
                                          <div key={choice.id} style={{ padding: "10px 14px", borderRadius: 8, border, background: bg, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                            <span style={{ fontWeight: isUserChoice ? 700 : 500, color: "var(--color-text-header)" }}>{choice.choice_text}</span>
                                            {badge}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Identification or Enumeration */}
                                  {(q.question_type === 'identification' || q.question_type === 'enumeration') && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Learner's Submitted Response:</div>
                                      <div style={{ padding: "10px 14px", borderRadius: 8, background: hasSubmitted ? "var(--color-bg)" : "var(--color-bg-subtle)", border: "1.5px solid var(--color-border)", fontSize: 14, fontWeight: 700, color: "var(--color-text-header)" }}>
                                        {Array.isArray(userAns) ? userAns.join(", ") : (userAns ? String(userAns) : <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No answer submitted</span>)}
                                      </div>
                                      {q.correct_answers && q.correct_answers.length > 0 && (
                                        <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(76, 175, 80, 0.08)", borderLeft: "3px solid #4CAF50", fontSize: 12, color: "#2E7D32" }}>
                                          <strong>Correct Answer:</strong> {q.correct_answers.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Essay */}
                                  {q.question_type === 'essay' && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Learner's Essay Response:</div>
                                      <div style={{ 
                                        padding: 14, borderRadius: 8, background: "var(--color-bg)", border: "1px solid var(--color-border)", 
                                        fontSize: 13, lineHeight: 1.6, color: "var(--color-text-header)", minHeight: 80, whiteSpace: "pre-wrap" 
                                      }}>
                                        {userAns ? String(userAns) : <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No essay submitted by learner.</span>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Evaluation Form */}
                                  {q.question_type === 'evaluation' && (() => {
                                    let evalAns: any = { ratings: {}, feedback: {} };
                                    try {
                                      if (userAns) {
                                        evalAns = typeof userAns === 'object' ? userAns : JSON.parse(userAns);
                                      }
                                    } catch (e) {
                                      console.error("Failed to parse evaluation answer", e);
                                    }
                                    const evalConfig = parseEvaluationConfig(q.correct_answers?.[0]);
                                    return (
                                      <div style={{ marginTop: 8 }}>
                                        <EvaluationFormView
                                          config={evalConfig}
                                          answers={evalAns}
                                          readOnly={true}
                                        />
                                      </div>
                                    );
                                  })()}

                                </div>
                              );
                            }

                            return null;
                          });
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: 40, background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", textAlign: "center", color: "var(--color-text-muted)" }}>
                    <BookOpen size={32} opacity={0.3} style={{ marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>Select a lesson on the left to inspect content and user responses.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════
    // LEVEL 2: ENROLLED USERS UNDER SELECTED COURSE
    // ═══════════════════════════════════════════════════════════
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
          <button 
            onClick={() => navigate(`/${slug}/courses`)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 20,
              border: "1px solid var(--color-border)", background: "var(--color-surface)",
              color: "#FF6B00", cursor: "pointer", fontFamily: "inherit", fontWeight: 700
            }}
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          <ChevronRight size={14} color="var(--color-text-muted)" />
          <span style={{ color: "var(--color-text-header)" }}>Course Overview</span>
        </div>

          {/* Course Banner */}
          <div className="overview-banner">
            <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="overview-banner-thumb" />
            <div className="overview-banner-info">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--color-text-header)" }}>
                  {selectedCourse.title}
                </h2>
                <span style={{
                  padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                  background: selectedCourse.status === "published" ? "#E8F5E9" : "#FFF3E0",
                  color: selectedCourse.status === "published" ? "#2E7D32" : "#E65100"
                }}>
                  {selectedCourse.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                {selectedCourse.description || "No description provided."}
              </p>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600, flexWrap: "wrap" }}>
                <span><strong>{selectedCourse.enrolledCount}</strong> Learners Enrolled</span>
                <span>•</span>
                <span><strong>{selectedCourse.modulesCount}</strong> Modules</span>
                <span>•</span>
                <span><strong>{selectedCourse.lessonsCount}</strong> {selectedCourse.lessonsCount === 1 ? "Lesson" : "Lessons"}</span>
                <span>•</span>
                <span><strong>{selectedCourse.assessmentsCount || 0}</strong> {selectedCourse.assessmentsCount === 1 ? "Assessment" : "Assessments"}</span>
              </div>
            </div>
          </div>

          {/* Enrolled Users Table */}
          <div className="overview-table-card">
            <div className="overview-table-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={20} color="#FF6B00" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-header)" }}>Enrolled Learners</h3>
                <span style={{ padding: "2px 10px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-text-muted)" }}>
                  {filteredEnrolled.length} learners
                </span>
              </div>

              <div className="overview-table-controls">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setUserCurrentPage(1);
                  }}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    borderRadius: 20,
                    border: "1px solid var(--color-border)",
                    outline: "none",
                    background: "var(--color-bg-subtle)",
                    color: "var(--color-text-header)",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Started">Not Started</option>
                </select>

                <div className="overview-search-wrap" style={{ position: "relative", width: 240 }}>
                  <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input 
                    type="text" 
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserCurrentPage(1);
                    }}
                    placeholder={isSparkCpd ? "Search learners, schools ..." : "Search learners, dept ..."}
                    style={{ padding: "8px 12px 8px 36px", fontSize: 13, borderRadius: 20, border: "1px solid var(--color-border)", outline: "none", width: "100%", background: "var(--color-bg-subtle)", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 650 }}>
                <thead>
                  <tr style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-header)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                    <th style={{ padding: "12px 24px", fontWeight: 800 }}>LEARNER</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>{isSparkCpd ? "SCHOOL" : "DEPARTMENT"}</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>PROGRESS</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>STATUS</th>
                    <th style={{ padding: "12px 16px", fontWeight: 800 }}>ASSIGNED</th>
                    <th style={{ padding: "12px 24px", fontWeight: 800, textAlign: "center", width: 120 }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading enrolled learners...</td>
                    </tr>
                  ) : pagedEnrolledUsers.map((u, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}>
                      <td style={{ padding: "12px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {u.user.avatar ? (
                            <img src={u.user.avatar} alt={u.user.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)" }} />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                              {u.user.name.charAt(0)}
                            </div>
                          )}
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 13 }}>{u.user.name}</span>
                            <span style={{ color: "var(--color-text-muted)" }}>{u.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                        {u.user.department}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--color-bg-muted, #eee)", borderRadius: 3, overflow: "hidden", minWidth: 60 }}>
                            <div style={{ width: `${u.progress}%`, height: "100%", background: u.progress === 100 ? "#27ae60" : u.progress > 0 ? "#FF9800" : "transparent" }} />
                          </div>
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700 }}>{u.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: u.statusColor }}>
                        {u.status}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>
                        {u.assignedAt}
                      </td>
                      <td style={{ padding: "12px 24px", textAlign: "center" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          rounded="pill"
                          onClick={() => setSelectedUser(u)}
                          style={{ fontSize: 12, padding: "5px 18px", whiteSpace: "nowrap" }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loadingUsers && filteredEnrolled.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
                        {enrolledUsers.length === 0 ? "No learners enrolled in this course yet." : "No learners match your search and filter criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px 0 24px", flexWrap: "wrap", gap: 12 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Showing {filteredEnrolled.length === 0 ? 0 : (userCurrentPage - 1) * PAGE_SIZE + 1} to {Math.min(userCurrentPage * PAGE_SIZE, filteredEnrolled.length)} of {filteredEnrolled.length} learners
              </span>

              {totalUserPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    disabled={userCurrentPage === 1}
                    onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: "4px 8px", background: "var(--color-surface)",
                      border: "1px solid var(--color-border)", borderRadius: 6,
                      cursor: userCurrentPage === 1 ? "default" : "pointer",
                      fontSize: 12, opacity: userCurrentPage === 1 ? 0.4 : 1
                    }}
                  >
                    &lt;
                  </button>

                  {getUserPageNumbers().map((item, i) => (
                    typeof item === 'number' ? (
                      <button
                        key={i}
                        onClick={() => setUserCurrentPage(item)}
                        style={{
                          minWidth: 28, height: 28, padding: "0 6px",
                          background: userCurrentPage === item ? "#FF6B00" : "var(--color-surface)",
                          border: `1px solid ${userCurrentPage === item ? "#FF6B00" : "var(--color-border)"}`,
                          borderRadius: 6, cursor: "pointer", fontSize: 12,
                          color: userCurrentPage === item ? "white" : "var(--color-text)",
                          fontWeight: userCurrentPage === item ? 700 : 500
                        }}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={i} style={{ padding: "0 4px", fontSize: 12, color: "var(--color-text-muted)" }}>...</span>
                    )
                  ))}

                  <button
                    disabled={userCurrentPage === totalUserPages}
                    onClick={() => setUserCurrentPage(p => Math.min(totalUserPages, p + 1))}
                    style={{
                      padding: "4px 8px", background: "var(--color-surface)",
                      border: "1px solid var(--color-border)", borderRadius: 6,
                      cursor: userCurrentPage === totalUserPages ? "default" : "pointer",
                      fontSize: 12, opacity: userCurrentPage === totalUserPages ? 0.4 : 1
                    }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
    );
  };

  // If embedded as tab inside CreatorCourses:
  if (embedded) {
    return <div className="overview-page-container">{renderContent()}</div>;
  }

  // Full page view
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Barlow', sans-serif", background: "var(--color-bg)", overflow: "hidden" }}>
      <Sidebar isOpen={sidebarOpen} activePage="Courses" onNavigate={onNavigate} user={user} onLogout={logout} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header user={user} isOpen={sidebarOpen} onToggleSidebar={toggleSidebar} searchPlaceholder="Search courses, submissions ..." role="Creator" />

        <div className="overview-content-scroll">
          <PageTransition>
            <div className="overview-page-container">
              {renderContent()}
            </div>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
