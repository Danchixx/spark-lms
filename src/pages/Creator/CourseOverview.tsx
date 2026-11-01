import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { 
  BookOpen, Users, ChevronRight, ChevronDown, ArrowLeft, Search, 
  CheckCircle, CheckCircle2, Clock, Play, FileText, PenTool, 
  Download, Eye, User as UserIcon, AlertCircle, X, Award, ExternalLink, Edit3,
  ArrowUpDown, ArrowUp, ArrowDown
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

interface CourseAssessmentItem {
  id: number;
  lessonId: number;
  moduleId: number;
  moduleTitle: string;
  moduleOrder: number;
  lessonPosition: number;
  title: string;
  displayTitle: string;
  passingScore: number;
  timeLimit: number | null;
  itemsCount: number;
  questions: any[];
}

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

  // Assessments Feature Data & Filter States
  const [courseAssessments, setCourseAssessments] = useState<CourseAssessmentItem[]>([]);
  const [assessmentAttemptsList, setAssessmentAttemptsList] = useState<any[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [selectedModuleAssessment, setSelectedModuleAssessment] = useState<string>("all");
  const [assessmentSortOrder, setAssessmentSortOrder] = useState<"desc" | "asc">("desc");
  const [targetLessonIdToSelect, setTargetLessonIdToSelect] = useState<number | null>(null);

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
            statusColor = "#FF6B00";
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

  // Fetch course assessments & attempts for all enrolled learners
  useEffect(() => {
    if (!selectedCourse?.id) {
      setCourseAssessments([]);
      setAssessmentAttemptsList([]);
      return;
    }

    const loadAssessmentsData = async () => {
      setLoadingAssessments(true);
      try {
        const { data: mods, error: modErr } = await supabase
          .from('course_modules')
          .select('id, title, order')
          .eq('course_id', selectedCourse.id)
          .eq('is_archived', false)
          .order('order', { ascending: true });

        if (modErr) throw modErr;
        const modulesList = mods || [];
        const moduleIds = modulesList.map((m: any) => m.id);

        if (moduleIds.length === 0) {
          setCourseAssessments([]);
          setAssessmentAttemptsList([]);
          return;
        }

        const { data: lessons, error: lesErr } = await supabase
          .from('course_lessons')
          .select('id, module_id, title, type, position')
          .in('module_id', moduleIds)
          .eq('type', 'assessment')
          .eq('is_archived', false)
          .order('position', { ascending: true });

        if (lesErr) throw lesErr;
        const lessonsList = lessons || [];
        const lessonIds = lessonsList.map((l: any) => l.id);

        if (lessonIds.length === 0) {
          setCourseAssessments([]);
          setAssessmentAttemptsList([]);
          return;
        }

        const { data: assessList, error: aErr } = await supabase
          .from('assessments')
          .select(`
            id,
            lesson_id,
            title,
            passing_score,
            time_limit,
            assessment_questions (
              id,
              position,
              question_type,
              question_text
            )
          `)
          .in('lesson_id', lessonIds)
          .eq('is_archived', false);

        if (aErr) throw aErr;

        const mapped: CourseAssessmentItem[] = (assessList || []).map((a: any) => {
          const les = lessonsList.find((l: any) => l.id === a.lesson_id);
          const mod = modulesList.find((m: any) => m.id === les?.module_id);
          const rawModTitle = mod?.title || 'Unknown Module';
          const rawTitle = a.title || les?.title || 'Assessment';

          const isEvaluation = 
            rawModTitle.toLowerCase().includes('evaluation') || 
            rawModTitle.toLowerCase().includes('feedback') ||
            rawTitle.toLowerCase().includes('evaluation') || 
            rawTitle.toLowerCase().includes('feedback');

          const displayTitle = isEvaluation 
            ? 'Course Evaluation & Feedback' 
            : `${rawModTitle} – ${rawTitle}`;

          return {
            id: a.id,
            lessonId: a.lesson_id,
            moduleId: mod?.id || 0,
            moduleTitle: rawModTitle,
            moduleOrder: mod?.order ?? 999,
            lessonPosition: les?.position ?? 999,
            title: rawTitle,
            displayTitle,
            passingScore: a.passing_score ?? 70,
            timeLimit: a.time_limit,
            itemsCount: a.assessment_questions?.length || 0,
            questions: a.assessment_questions || []
          };
        });

        mapped.sort((x, y) => {
          if (x.moduleOrder !== y.moduleOrder) return x.moduleOrder - y.moduleOrder;
          return x.lessonPosition - y.lessonPosition;
        });

        setCourseAssessments(mapped);

        const assessIds = mapped.map(a => a.id);
        if (assessIds.length > 0) {
          const { data: atts, error: attErr } = await supabase
            .from('assessment_attempts')
            .select('id, assessment_id, user_id, score, passed, attempted_at')
            .in('assessment_id', assessIds)
            .order('attempted_at', { ascending: false });

          if (attErr) throw attErr;
          setAssessmentAttemptsList(atts || []);
        } else {
          setAssessmentAttemptsList([]);
        }
      } catch (err) {
        console.error("Error loading course assessments data:", err);
      } finally {
        setLoadingAssessments(false);
      }
    };

    loadAssessmentsData();
  }, [selectedCourse?.id]);

  const handleViewLearner = (learner: any, targetLessonId?: number) => {
    setSelectedUser(learner);
    if (targetLessonId) {
      setTargetLessonIdToSelect(targetLessonId);
    }
  };

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

        // Auto-expand module & auto-select lesson
        const expanded: Record<number, boolean> = {};
        const allLessons = (modules || []).flatMap((m: any) => m.lessons || []);
        let lessonToSelect: any = null;

        if (targetLessonIdToSelect) {
          const match = allLessons.find((l: any) => l.id === targetLessonIdToSelect);
          if (match) {
            lessonToSelect = match;
            expanded[match.module_id] = true;
          }
          setTargetLessonIdToSelect(null);
        }

        if (!lessonToSelect && modules.length > 0 && modules[0].lessons?.length > 0) {
          lessonToSelect = modules[0].lessons[0];
          expanded[modules[0].id] = true;
        }

        if (modules.length > 0 && Object.keys(expanded).length === 0) {
          expanded[modules[0].id] = true;
        }

        setExpandedModules(expanded);
        setSelectedLesson(lessonToSelect);

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



  // Filtered enrolled users for Level 2 (Standard View)
  const filteredEnrolled = enrolledUsers.filter(u => {
    if (statusFilter !== "All" && statusFilter !== "Assessments" && u.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.user.name.toLowerCase().includes(q) || (u.user.email || "").toLowerCase().includes(q) || (u.user.department || "").toLowerCase().includes(q);
  });

  // Pagination for Level 2 Enrolled Users Table
  const totalUserPages = Math.ceil(filteredEnrolled.length / PAGE_SIZE) || 1;
  const pagedEnrolledUsers = filteredEnrolled.slice((userCurrentPage - 1) * PAGE_SIZE, userCurrentPage * PAGE_SIZE);

  // ─────────────────────────────────────────────────────────────
  // ASSESSMENTS FILTER COMPUTATIONS
  // ─────────────────────────────────────────────────────────────

  // Total items in all assessments for this course
  const grandTotalCourseItems = useMemo(() => {
    return courseAssessments.reduce((sum, a) => sum + a.itemsCount, 0);
  }, [courseAssessments]);

  // Aggregate each learner's assessments scores
  const assessmentLearners = useMemo(() => {
    const userAttemptsMap: Record<string, Record<number, any[]>> = {};
    (assessmentAttemptsList || []).forEach(att => {
      const uid = String(att.user_id);
      const userMap = userAttemptsMap[uid] || (userAttemptsMap[uid] = {});
      const assessAttempts = userMap[att.assessment_id] || (userMap[att.assessment_id] = []);
      assessAttempts.push(att);
    });

    return enrolledUsers.map(learner => {
      const uid = String(learner.user.id);
      const userAssessMap = userAttemptsMap[uid] || {};

      let grandTotalScore = 0;
      let assessmentsAttempted = 0;
      let assessmentsPassed = 0;

      const breakdown: Record<number, {
        assessment: CourseAssessmentItem;
        attemptsCount: number;
        bestScore: number | null;
        correctItems: number;
        totalItems: number;
        passed: boolean;
        latestAttemptedAt: string | null;
      }> = {};

      courseAssessments.forEach(a => {
        const atts = userAssessMap[a.id] || [];
        if (atts.length > 0) {
          assessmentsAttempted++;
          const bestAtt = atts.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), atts[0]);
          const bestScore = bestAtt.score ?? 0;
          const correctItems = Math.round((bestScore / 100) * a.itemsCount);
          const isPassed = bestAtt.passed ?? (bestScore >= a.passingScore);
          if (isPassed) assessmentsPassed++;

          grandTotalScore += correctItems;

          breakdown[a.id] = {
            assessment: a,
            attemptsCount: atts.length,
            bestScore,
            correctItems,
            totalItems: a.itemsCount,
            passed: isPassed,
            latestAttemptedAt: atts[0].attempted_at
          };
        } else {
          breakdown[a.id] = {
            assessment: a,
            attemptsCount: 0,
            bestScore: null,
            correctItems: 0,
            totalItems: a.itemsCount,
            passed: false,
            latestAttemptedAt: null
          };
        }
      });

      const overallPercentage = grandTotalCourseItems > 0 
        ? Math.round((grandTotalScore / grandTotalCourseItems) * 100) 
        : 0;

      return {
        rawUser: learner,
        grandTotalScore,
        grandTotalCourseItems,
        overallPercentage,
        assessmentsAttempted,
        assessmentsPassed,
        breakdown
      };
    });
  }, [enrolledUsers, courseAssessments, assessmentAttemptsList, grandTotalCourseItems]);

  // Filter & Sort assessment learners
  const filteredAndSortedAssessmentLearners = useMemo(() => {
    let list = assessmentLearners.filter(item => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      const u = item.rawUser.user;
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.department || "").toLowerCase().includes(q) ||
        (u.school || "").toLowerCase().includes(q)
      );
    });

    const isAll = selectedModuleAssessment === "all";
    const targetAid = Number(selectedModuleAssessment);

    list.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (isAll) {
        scoreA = a.grandTotalScore;
        scoreB = b.grandTotalScore;
      } else {
        const dataA = a.breakdown[targetAid];
        const dataB = b.breakdown[targetAid];
        scoreA = dataA?.bestScore != null ? dataA.bestScore : -1;
        scoreB = dataB?.bestScore != null ? dataB.bestScore : -1;
      }

      if (assessmentSortOrder === "desc") {
        if (scoreB !== scoreA) return scoreB - scoreA;
      } else {
        if (scoreA !== scoreB) return scoreA - scoreB;
      }

      return (a.rawUser.user.name || "").localeCompare(b.rawUser.user.name || "");
    });

    return list;
  }, [assessmentLearners, userSearch, selectedModuleAssessment, assessmentSortOrder]);

  const totalAssessmentPages = Math.ceil(filteredAndSortedAssessmentLearners.length / PAGE_SIZE) || 1;
  const pagedAssessmentLearners = filteredAndSortedAssessmentLearners.slice(
    (userCurrentPage - 1) * PAGE_SIZE,
    userCurrentPage * PAGE_SIZE
  );

  const selectedAssessmentObj = useMemo(() => {
    if (selectedModuleAssessment === "all") return null;
    return courseAssessments.find(a => a.id === Number(selectedModuleAssessment)) || null;
  }, [selectedModuleAssessment, courseAssessments]);

  const assessmentStats = useMemo(() => {
    const list = assessmentLearners;
    const totalEnrolled = list.length;
    const isAll = selectedModuleAssessment === "all";
    const targetAid = Number(selectedModuleAssessment);

    if (totalEnrolled === 0) {
      return { 
        avgScore: 0, 
        attemptedCount: 0, 
        passedCount: 0, 
        failedCount: 0, 
        passRatePct: 0, 
        participationRatePct: 0, 
        totalItems: 0 
      };
    }

    if (isAll) {
      const attemptedList = list.filter(l => l.assessmentsAttempted > 0);
      const avgScore = attemptedList.length > 0 
        ? Math.round(attemptedList.reduce((sum, l) => sum + l.overallPercentage, 0) / attemptedList.length) 
        : 0;
      const passedCount = list.filter(l => l.assessmentsPassed === courseAssessments.length && courseAssessments.length > 0).length;
      const attemptedCount = attemptedList.length;
      const passRatePct = attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;
      const failedCount = Math.max(0, attemptedCount - passedCount);
      const participationRatePct = totalEnrolled > 0 ? Math.round((attemptedCount / totalEnrolled) * 100) : 0;

      return {
        avgScore,
        attemptedCount,
        passedCount,
        failedCount,
        passRatePct,
        participationRatePct,
        totalItems: grandTotalCourseItems
      };
    } else {
      const targetAssess = courseAssessments.find(a => a.id === targetAid);
      const totalItems = targetAssess?.itemsCount || 0;
      const attemptedList = list.filter(l => (l.breakdown[targetAid]?.attemptsCount || 0) > 0);
      const avgScore = attemptedList.length > 0
        ? Math.round(attemptedList.reduce((sum, l) => sum + (l.breakdown[targetAid]?.bestScore || 0), 0) / attemptedList.length)
        : 0;
      const passedCount = list.filter(l => l.breakdown[targetAid]?.passed).length;
      const attemptedCount = attemptedList.length;
      const passRatePct = attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;
      const failedCount = Math.max(0, attemptedCount - passedCount);
      const participationRatePct = totalEnrolled > 0 ? Math.round((attemptedCount / totalEnrolled) * 100) : 0;

      return {
        avgScore,
        attemptedCount,
        passedCount,
        failedCount,
        passRatePct,
        participationRatePct,
        totalItems
      };
    }
  }, [assessmentLearners, selectedModuleAssessment, courseAssessments, grandTotalCourseItems]);

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
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
                <ArrowLeft size={14} /> Back to {statusFilter === "Assessments" ? "Assessments" : "Enrolled Learners"}
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
                  <div style={{ height: "100%", width: `${selectedUser.progress}%`, background: "#FF6B00", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6B00" }}>
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
                            background: moduleCompletedCount === moduleLessons.length && moduleLessons.length > 0 ? "rgba(255, 107, 0, 0.12)" : "var(--color-bg-subtle)",
                            color: moduleCompletedCount === moduleLessons.length && moduleLessons.length > 0 ? "#FF6B00" : "var(--color-text-muted)"
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
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 12, background: "rgba(255, 107, 0, 0.12)", color: "#FF6B00", fontSize: 11, fontWeight: 700 }}>
                                      <CheckCircle2 size={12} color="#FF6B00" /> Completed
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255, 107, 0, 0.12)", color: "#FF6B00", padding: "3px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                            <CheckCircle2 size={12} color="#FF6B00" /> Finished
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
                          Learner Status: {lessonProgressMap[selectedLesson.id]?.is_completed ? <strong style={{ color: "#FF6B00" }}>Watched / Completed</strong> : <span>Not yet completed</span>}
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
                          Learner Status: {lessonProgressMap[selectedLesson.id]?.is_completed ? <strong style={{ color: "#FF6B00" }}>Read / Completed</strong> : <span>Not yet completed</span>}
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
                                  <div style={{ background: attempt.passed ? "rgba(255, 107, 0, 0.08)" : "rgba(211, 47, 47, 0.08)", border: `1.5px solid ${attempt.passed ? "#FF6B00" : "#D32F2F"}`, borderRadius: 12, padding: 16, marginBottom: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: attempt.passed ? "#FF6B00" : "#D32F2F" }}>
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
                                              background: "rgba(255, 107, 0, 0.12)",
                                              color: "#FF6B00",
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
                  background: selectedCourse.status === "published" ? "rgba(255, 107, 0, 0.12)" : "#FFF3E0",
                  color: selectedCourse.status === "published" ? "#FF6B00" : "#E65100"
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
                <span 
                  className="overview-badge-link"
                  onClick={() => {
                    setStatusFilter("Assessments");
                    setUserCurrentPage(1);
                  }}
                  title="Click to view assessments filter"
                  style={{
                    cursor: "pointer",
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: statusFilter === "Assessments" ? "rgba(255, 107, 0, 0.12)" : "transparent",
                    color: statusFilter === "Assessments" ? "#FF6B00" : "inherit"
                  }}
                >
                  <strong>{selectedCourse.assessmentsCount || 0}</strong> {selectedCourse.assessmentsCount === 1 ? "Assessment" : "Assessments"}
                </span>
              </div>
            </div>
          </div>

          {/* Enrolled Users / Assessments Table Card */}
          <div className="overview-table-card">
            <div className="overview-table-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {statusFilter === "Assessments" ? (
                  <PenTool size={20} color="#FF6B00" />
                ) : (
                  <Users size={20} color="#FF6B00" />
                )}
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-header)" }}>
                  {statusFilter === "Assessments"
                    ? (selectedModuleAssessment === "all" 
                        ? "Assessments Overview" 
                        : (selectedAssessmentObj ? selectedAssessmentObj.displayTitle : "Module Assessment Scores"))
                    : "Enrolled Learners"}
                </h3>
                <span style={{ padding: "2px 10px", borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-text-muted)" }}>
                  {statusFilter === "Assessments" 
                    ? `${filteredAndSortedAssessmentLearners.length} learners` 
                    : `${filteredEnrolled.length} learners`}
                </span>
              </div>

              <div className="overview-table-controls">
                {/* Primary Filter dropdown with Assessments option */}
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
                    border: statusFilter === "Assessments" ? "1.5px solid #FF6B00" : "1px solid var(--color-border)",
                    outline: "none",
                    background: statusFilter === "Assessments" ? "rgba(255, 107, 0, 0.08)" : "var(--color-bg-subtle)",
                    color: statusFilter === "Assessments" ? "#FF6B00" : "var(--color-text-header)",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  <option value="All" style={{ color: "#111827", backgroundColor: "#ffffff" }}>All Status</option>
                  <option value="Completed" style={{ color: "#111827", backgroundColor: "#ffffff" }}>Completed</option>
                  <option value="In Progress" style={{ color: "#111827", backgroundColor: "#ffffff" }}>In Progress</option>
                  <option value="Not Started" style={{ color: "#111827", backgroundColor: "#ffffff" }}>Not Started</option>
                  <option value="Assessments" style={{ color: "#111827", backgroundColor: "#ffffff" }}>Assessments</option>
                </select>

                {/* Inside Filter: Per Module Assessment */}
                {statusFilter === "Assessments" && (
                  <>
                    <select
                      value={selectedModuleAssessment}
                      onChange={(e) => {
                        setSelectedModuleAssessment(e.target.value);
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
                        fontWeight: 600,
                        maxWidth: 270
                      }}
                      title="Filter by module's assessment"
                    >
                      <option value="all" style={{ color: "#111827", backgroundColor: "#ffffff" }}>All Assessments (Total: {grandTotalCourseItems} items)</option>
                      {courseAssessments.map((ca) => (
                        <option key={ca.id} value={String(ca.id)} style={{ color: "#111827", backgroundColor: "#ffffff" }}>
                          {ca.displayTitle} ({ca.itemsCount} {ca.itemsCount === 1 ? 'item' : 'items'})
                        </option>
                      ))}
                    </select>

                    {/* Arrange list from highest to lowest or vise versa */}
                    <select
                      value={assessmentSortOrder}
                      onChange={(e) => {
                        setAssessmentSortOrder(e.target.value as 'desc' | 'asc');
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
                      title="Arrange list by score"
                    >
                      <option value="desc" style={{ color: "#111827", backgroundColor: "#ffffff" }}>Highest to Lowest</option>
                      <option value="asc" style={{ color: "#111827", backgroundColor: "#ffffff" }}>Lowest to Highest</option>
                    </select>
                  </>
                )}

                <div className="overview-search-wrap" style={{ position: "relative", width: 220 }}>
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

            {/* Assessment Mode: Summary Statistics Banner */}
            {statusFilter === "Assessments" && (
              <div className="overview-stats-grid">
                <div className="overview-stat-card">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    {selectedModuleAssessment === "all" ? "Total Items (All Assessments)" : "Assessment Items"}
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6B00", marginTop: 4 }}>
                    {assessmentStats.totalItems} Items
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {selectedModuleAssessment === "all" ? `${courseAssessments.length} assessments total` : `Passing requirement: ${selectedAssessmentObj?.passingScore}%`}
                  </span>
                </div>

                <div className="overview-stat-card">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Class Average Score
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-header)", marginTop: 4 }}>
                    {assessmentStats.avgScore}%
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    Across {assessmentStats.attemptedCount} active {assessmentStats.attemptedCount === 1 ? 'learner' : 'learners'}
                  </span>
                </div>

                <div className="overview-stat-card">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Passing Rate
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6B00", marginTop: 4 }}>
                    {assessmentStats.attemptedCount === 0 ? "0%" : `${assessmentStats.passRatePct}%`}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {assessmentStats.attemptedCount === 0 
                      ? "No attempts yet" 
                      : (selectedModuleAssessment === "all" 
                          ? `${assessmentStats.passedCount} of ${assessmentStats.attemptedCount} passed all assessments` 
                          : `${assessmentStats.passedCount} of ${assessmentStats.attemptedCount} passed · ${assessmentStats.failedCount} failed`)}
                  </span>
                </div>

                <div className="overview-stat-card">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Participation Rate
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-header)", marginTop: 4 }}>
                    {assessmentStats.attemptedCount} / {filteredAndSortedAssessmentLearners.length}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {filteredAndSortedAssessmentLearners.length > 0 ? `${assessmentStats.participationRatePct}% of enrolled learners` : '0%'}
                  </span>
                </div>
              </div>
            )}

            {/* Table */}
            {statusFilter === "Assessments" ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "27%" }} />
                    <col style={{ width: "23%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "9%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-header)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                      <th style={{ padding: "12px 20px", fontWeight: 800, textAlign: "left" }}>LEARNER</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>{isSparkCpd ? "SCHOOL" : "DEPARTMENT"}</th>
                      {selectedModuleAssessment === "all" ? (
                        <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>ASSESSMENTS TAKEN</th>
                      ) : (
                        <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>ATTEMPTS</th>
                      )}
                      <th 
                        className="overview-sortable-th"
                        onClick={() => setAssessmentSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                        title="Click to toggle sort order (Highest to Lowest / Lowest to Highest)"
                        style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{selectedModuleAssessment === "all" ? "TOTAL SCORE / ITEMS" : "SCORE / ITEMS"}</span>
                          {assessmentSortOrder === "desc" ? (
                            <ArrowDown size={14} color="#FF6B00" />
                          ) : (
                            <ArrowUp size={14} color="#FF6B00" />
                          )}
                        </div>
                      </th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>STATUS</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "center" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers || loadingAssessments ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
                          Loading assessment scores and learners...
                        </td>
                      </tr>
                    ) : pagedAssessmentLearners.map((item, idx) => {
                      const u = item.rawUser.user;
                      const isAll = selectedModuleAssessment === "all";
                      const targetAid = Number(selectedModuleAssessment);
                      const breakdown = item.breakdown[targetAid];

                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}>
                          {/* Col 1: Learner Info (27%) */}
                          <td style={{ padding: "12px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)", flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                  {u.name.charAt(0)}
                                </div>
                              )}
                              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                                <span style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.name}>{u.name}</span>
                                <span style={{ color: "var(--color-text-muted)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.email}>{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: School / Department (23%) */}
                          <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.department}>
                              {u.department}
                            </div>
                          </td>

                          {/* Col 3: Assessments Taken or Attempts (14%) */}
                          {isAll ? (
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 13 }}>
                                  {item.assessmentsAttempted} of {courseAssessments.length}
                                </span>
                                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                                  {item.assessmentsPassed} passed
                                </span>
                              </div>
                            </td>
                          ) : (
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 13 }}>
                                  {breakdown?.attemptsCount || 0} {(breakdown?.attemptsCount === 1) ? 'attempt' : 'attempts'}
                                </span>
                                {breakdown?.latestAttemptedAt && (
                                  <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                                    {new Date(breakdown.latestAttemptedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Col 4: Score / Items (16%) */}
                          <td style={{ padding: "12px 16px" }}>
                            {isAll ? (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-header)" }}>
                                    {item.grandTotalScore} / {item.grandTotalCourseItems} items
                                  </span>
                                  <span style={{
                                    padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                                    background: item.assessmentsAttempted === 0 
                                      ? "var(--color-bg-subtle)" 
                                      : item.overallPercentage >= 60 
                                        ? "rgba(255, 107, 0, 0.12)" 
                                        : "#FFEBEE",
                                    color: item.assessmentsAttempted === 0 
                                      ? "var(--color-text-muted)" 
                                      : item.overallPercentage >= 60 
                                        ? "#FF6B00" 
                                        : "#C62828"
                                  }}>
                                    {item.assessmentsAttempted === 0 ? "No attempts" : `${item.overallPercentage}%`}
                                  </span>
                                </div>
                                {item.assessmentsAttempted > 0 && (
                                  <div style={{ height: 5, width: "100%", maxWidth: 120, background: "var(--color-bg-subtle)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                                    <div style={{
                                      width: `${item.overallPercentage}%`,
                                      height: "100%",
                                      background: item.overallPercentage >= 60 ? "#FF6B00" : "#D32F2F"
                                    }} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                {breakdown && breakdown.attemptsCount > 0 && breakdown.bestScore != null ? (
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-header)" }}>
                                        {breakdown.correctItems} / {breakdown.totalItems} items
                                      </span>
                                      <span style={{
                                        padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                                        background: breakdown.passed ? "rgba(255, 107, 0, 0.12)" : "#FFEBEE",
                                        color: breakdown.passed ? "#FF6B00" : "#C62828"
                                      }}>
                                        {breakdown.bestScore}%
                                      </span>
                                    </div>
                                    <div style={{ height: 5, width: "100%", maxWidth: 120, background: "var(--color-bg-subtle)", borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                                      <div style={{
                                        width: `${breakdown.bestScore}%`,
                                        height: "100%",
                                        background: breakdown.passed ? "#FF6B00" : "#D32F2F"
                                      }} />
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: 13 }}>
                                    -- / {selectedAssessmentObj?.itemsCount || 0} items
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Col 5: Status (11%) */}
                          <td style={{ padding: "12px 16px" }}>
                            {isAll ? (
                              <div>
                                {item.assessmentsAttempted === 0 ? (
                                  <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Not Started</span>
                                ) : item.assessmentsPassed === courseAssessments.length && courseAssessments.length > 0 ? (
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    padding: "3px 8px", borderRadius: 12, background: "rgba(255, 107, 0, 0.12)",
                                    color: "#FF6B00", fontSize: 11, fontWeight: 700
                                  }}>
                                    <CheckCircle2 size={12} color="#FF6B00" /> All Passed
                                  </span>
                                ) : (
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    padding: "3px 8px", borderRadius: 12, background: "#FFF3E0",
                                    color: "#E65100", fontSize: 11, fontWeight: 700
                                  }}>
                                    <Clock size={12} /> {item.assessmentsPassed}/{courseAssessments.length} Passed
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div>
                                {!breakdown || breakdown.attemptsCount === 0 ? (
                                  <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Not Attempted</span>
                                ) : breakdown.passed ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 4,
                                      padding: "3px 8px", borderRadius: 12, background: "rgba(255, 107, 0, 0.12)",
                                      color: "#FF6B00", fontSize: 11, fontWeight: 700, width: "fit-content"
                                    }}>
                                      <CheckCircle2 size={12} color="#FF6B00" /> Passed
                                    </span>
                                    <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Min: {selectedAssessmentObj?.passingScore}%</span>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 4,
                                      padding: "3px 8px", borderRadius: 12, background: "#FFEBEE",
                                      color: "#C62828", fontSize: 11, fontWeight: 700, width: "fit-content"
                                    }}>
                                      <X size={12} /> Failed
                                    </span>
                                    <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Min: {selectedAssessmentObj?.passingScore}%</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Col 6: Action (9%) */}
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <Button
                              variant="outline"
                              size="sm"
                              rounded="pill"
                              onClick={() => handleViewLearner(item.rawUser, selectedAssessmentObj?.lessonId)}
                              style={{ fontSize: 12, padding: "5px 18px", whiteSpace: "nowrap" }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {!loadingUsers && !loadingAssessments && filteredAndSortedAssessmentLearners.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
                          {assessmentLearners.length === 0 ? "No enrolled learners in this course." : "No learners match your assessment search and filter criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "27%" }} />
                    <col style={{ width: "23%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "9%" }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-header)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                      <th style={{ padding: "12px 20px", fontWeight: 800, textAlign: "left" }}>LEARNER</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>{isSparkCpd ? "SCHOOL" : "DEPARTMENT"}</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>PROGRESS</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>STATUS</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "left" }}>ASSIGNED</th>
                      <th style={{ padding: "12px 16px", fontWeight: 800, textAlign: "center" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading enrolled learners...</td>
                      </tr>
                    ) : pagedEnrolledUsers.map((u, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 0.15s" }}>
                        {/* Col 1: Learner Info (27%) */}
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            {u.user.avatar ? (
                              <img src={u.user.avatar} alt={u.user.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-border)", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                {u.user.name.charAt(0)}
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                              <span style={{ fontWeight: 700, color: "var(--color-text-header)", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.user.name}>{u.user.name}</span>
                              <span style={{ color: "var(--color-text-muted)", fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.user.email}>{u.user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Col 2: School / Department (23%) */}
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={u.user.department}>
                            {u.user.department}
                          </div>
                        </td>

                        {/* Col 3: Progress (14%) */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "var(--color-bg-muted, #eee)", borderRadius: 3, overflow: "hidden", minWidth: 50 }}>
                              <div style={{ width: `${u.progress}%`, height: "100%", background: u.progress > 0 ? "#FF6B00" : "transparent" }} />
                            </div>
                            <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700 }}>{u.progress}%</span>
                          </div>
                        </td>

                        {/* Col 4: Status (16%) */}
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: u.statusColor }}>
                          {u.status}
                        </td>

                        {/* Col 5: Assigned (11%) */}
                        <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>
                          {u.assignedAt}
                        </td>

                        {/* Col 6: Action (9%) */}
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            rounded="pill"
                            onClick={() => handleViewLearner(u)}
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
            )}

            {/* Pagination Footer */}
            {(() => {
              const isAssess = statusFilter === "Assessments";
              const currentTotalCount = isAssess ? filteredAndSortedAssessmentLearners.length : filteredEnrolled.length;
              const currentTotalPages = isAssess ? totalAssessmentPages : totalUserPages;
              const currentPages = getPageNumbers(currentTotalPages, userCurrentPage);

              return (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px 0 24px", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    Showing {currentTotalCount === 0 ? 0 : (userCurrentPage - 1) * PAGE_SIZE + 1} to {Math.min(userCurrentPage * PAGE_SIZE, currentTotalCount)} of {currentTotalCount} learners
                  </span>

                  {currentTotalPages > 1 && (
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

                      {currentPages.map((item, i) => (
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
                        disabled={userCurrentPage === currentTotalPages}
                        onClick={() => setUserCurrentPage(p => Math.min(currentTotalPages, p + 1))}
                        style={{
                          padding: "4px 8px", background: "var(--color-surface)",
                          border: "1px solid var(--color-border)", borderRadius: 6,
                          cursor: userCurrentPage === currentTotalPages ? "default" : "pointer",
                          fontSize: 12, opacity: userCurrentPage === currentTotalPages ? 0.4 : 1
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
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
