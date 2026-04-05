import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ─── Types ──────────────────────────────────────────────────
export type LessonItem = {
  id: number;
  title: string;
  type: string;
  content: string | null;
  video_url: string | null;
  position: number;
  status: 'completed' | 'open' | 'locked';
  attemptsCount?: number;
};

export type ModuleItem = {
  id: number;
  title: string;
  order: number;
  description: string | null;
  lessons: LessonItem[];
  lessonsCount: number;
  completedCount: number;
  status: 'completed' | 'in-progress' | 'locked';
  progressText: string;
  progressPct: number;
};

export type CourseItem = {
  id: number;
  name: string;
  title: string;
  description: string | null;
  icon: string;
  thumbnail: string | null;
  thumbnail_url: string | null;
  status: string;           // 'Ongoing' | 'Completed' | 'Not Started'
  progress: number;          // 0..100
  modulesCount: number;
  unitsCount: number;
  assessmentsCount: number;
  assignedBy: string;
  lastModule: string | null;
  modules: ModuleItem[];
  assignmentId: number;
};

import { useCourseContext } from '../context/CourseContext';

// ─── Hook ───────────────────────────────────────────────────
export function useCourses() {
  const { courses, loading, error, refetch } = useCourseContext();
  return { courses, loading, error, refetch };
}

// ─── Single course by ID ────────────────────────────────────
export function useCourseById(courseId: number | string | undefined) {
  const { courses, loading, error, refetch } = useCourseContext();
  const course = courses.find(c => c.id === Number(courseId)) || null;
  return { course, loading, error, refetch };
}
