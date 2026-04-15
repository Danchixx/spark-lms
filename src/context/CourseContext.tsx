import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { CourseItem, ModuleItem, LessonItem } from '../hooks/useCourses';

// --- Context Type ---
type CourseContextValue = {
  courses: CourseItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const CourseContext = createContext<CourseContextValue | null>(null);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Re-use logic from useCourses hook
      setLoading(courses.length === 0); // Only show loading if we have no data yet
      setError(null);

      // 1. Fetch assignments
      const { data: assignments, error: assignErr } = await supabase
        .from('course_assignments')
        .select(`
          id,
          status,
          assigned_by,
          courses (
            id, title, description, thumbnail_url, icon_emoji, status,
            course_modules (
              id, title, "order", description,
              course_lessons (
                id, title, type, content, video_url, position
              )
            )
          ),
          assigner:users!course_assignments_assigned_by_fkey ( firstname, lastname )
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) {
        setCourses([]);
        return;
      }

      // 2. Fetch progress rows
      const assignmentIds = assignments.map(a => a.id);
      const { data: progressRows, error: progErr } = await supabase
        .from('lessons_progress')
        .select('assignment_id, lesson_id, is_completed')
        .in('assignment_id', assignmentIds)
        .eq('is_completed', true);

      if (progErr) throw progErr;

      const completedMap = new Map<number, Set<number>>();
      (progressRows || []).forEach(row => {
        if (!completedMap.has(row.assignment_id)) {
          completedMap.set(row.assignment_id, new Set());
        }
        completedMap.get(row.assignment_id)!.add(row.lesson_id);
      });

      // 3. Fetch assessment details and user attempt counts
      const { data: assessmentRows } = await supabase
        .from('assessments')
        .select(`
          id, 
          lesson_id, 
          course_lessons!inner(module_id, course_modules!inner(course_id)),
          assessment_attempts(id)
        `)
        .eq('is_archived', false)
        .eq('assessment_attempts.user_id', user.id);

      const assessmentCountByCourse = new Map<number, number>();
      const lessonToAttempts = new Map<number, number>();

      (assessmentRows || []).forEach((row: any) => {
        const courseId = row.course_lessons?.course_modules?.course_id;
        if (courseId) {
          assessmentCountByCourse.set(courseId, (assessmentCountByCourse.get(courseId) || 0) + 1);
        }
        lessonToAttempts.set(row.lesson_id, (row.assessment_attempts || []).length);
      });

      // 4. Transform
      const result: CourseItem[] = assignments.map(assignment => {
        const course = assignment.courses as any;
        const completedLessonIds = completedMap.get(assignment.id) || new Set();
        const assigner = assignment.assigner as any;
        const assignerName = assigner
          ? `${assigner.firstname} ${assigner.lastname}`
          : 'Admin';

        const rawModules = (course.course_modules || []).sort((a: any, b: any) => a.order - b.order);

        let totalLessons = 0;
        let totalCompletedLessons = 0;
        let lastCompletedModuleLesson: string | null = null;

        const modules: ModuleItem[] = rawModules.map((mod: any, modIdx: number) => {
          const sortedLessons = (mod.course_lessons || []).sort((a: any, b: any) => a.position - b.position);
          const lessonsCount = sortedLessons.length;
          let completedCount = 0;
          sortedLessons.forEach((lesson: any) => {
            if (completedLessonIds.has(lesson.id)) completedCount++;
          });
          totalLessons += lessonsCount;
          totalCompletedLessons += completedCount;

          let moduleStatus: 'completed' | 'in-progress' | 'locked';
          if (completedCount === lessonsCount && lessonsCount > 0) {
            moduleStatus = 'completed';
          } else if (completedCount > 0) {
            moduleStatus = 'in-progress';
          } else {
            const prevModulesAllDone = modIdx === 0 || rawModules.slice(0, modIdx).every((prev: any) => {
              const prevLessons = (prev.course_lessons || []);
              return prevLessons.length > 0 && prevLessons.every((l: any) => completedLessonIds.has(l.id));
            });
            moduleStatus = prevModulesAllDone ? 'in-progress' : 'locked';
          }

          // Determine lesson statuses
          let foundFirstOpen = false;
          const lessons: LessonItem[] = sortedLessons.map((lesson: any) => {
            let status: 'completed' | 'open' | 'locked';
            if (completedLessonIds.has(lesson.id)) {
              status = 'completed';
            } else if (moduleStatus === 'locked') {
              status = 'locked';
            } else if (!foundFirstOpen) {
              status = 'open';
              foundFirstOpen = true;
            } else {
              status = 'locked';
            }
            return {
              id: lesson.id,
              title: lesson.title,
              type: lesson.type || 'reading',
              content: lesson.content,
              video_url: lesson.video_url,
              position: lesson.position,
              status,
              attemptsCount: lessonToAttempts.get(lesson.id) || 0,
            };
          });

          if (moduleStatus === 'in-progress') {
            const openLesson = lessons.find(l => l.status === 'open');
            if (openLesson) lastCompletedModuleLesson = `Module ${modIdx + 1} · ${openLesson.title}`;
          }

          const progressPct = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;
          let progressText: string;
          if (progressPct === 100) progressText = 'Done 100%';
          else if (completedCount > 0) progressText = `In Progress · ${completedCount}/${lessonsCount} Done`;
          else if (moduleStatus === 'locked') progressText = 'Locked';
          else progressText = 'Not Started';

          return {
            id: mod.id,
            title: mod.title,
            order: mod.order,
            description: mod.description,
            lessons,
            lessonsCount,
            completedCount,
            status: moduleStatus,
            progressText,
            progressPct,
          };
        });

        const courseProgress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;
        let courseStatus: string;
        if (courseProgress === 100) courseStatus = 'Completed';
        else if (courseProgress > 0) courseStatus = 'Ongoing';
        else courseStatus = 'Not Started';

        return {
          id: course.id,
          name: course.title,
          title: course.title,
          description: course.description,
          icon: course.icon_emoji || '📚',
          thumbnail: course.thumbnail_url,
          thumbnail_url: course.thumbnail_url,
          status: courseStatus,
          progress: courseProgress,
          modulesCount: modules.length,
          unitsCount: totalLessons,
          assessmentsCount: assessmentCountByCourse.get(course.id) || 0,
          assignedBy: assignerName,
          lastModule: lastCompletedModuleLesson,
          modules,
          assignmentId: assignment.id,
        };
      });

      setCourses(result);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [user?.id, courses.length]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <CourseContext.Provider value={{ courses, loading, error, refetch: fetchCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourseContext must be used within CourseProvider");
  return context;
};
