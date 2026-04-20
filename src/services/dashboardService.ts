// src/services/dashboardService.ts
// Supabase data layer for the SuperAdmin Dashboard.
// All queries are isolated here — the component only calls these functions.

import { supabase } from '../lib/supabase';

// ── Exported Types ─────────────────────────────────────────────

export interface KPIStats {
  total_tenants: number;
  pending_approvals: number;
  live_courses: number;
  total_subscriptions: number;
}

export interface TenantHealthRow {
  id: number;
  name: string;
  slug: string;
  abbr: string;
  contact_email: string | null;
  subscription_plan: string;
  subscribed_at: string | null;
  user_count: number;
  last_login_at: string | null;
  completed_lessons: number;
  total_lessons: number;
  assignment_count: number;
}

export interface CourseStatusCount {
  name: string;
  value: number;
}

export interface ActivityTrendPoint {
  day: string;
  logins: number;
}

export interface TenantLeaderboardRow {
  name: string;
  completion: number;
  users: number;
}

export interface RecentSubscription {
  id: number;
  name: string;
  abbr: string;
  subscription_plan: string;
  subscribed_at: string | null;
  contact_email: string | null;
}

// ── KPI Stats ──────────────────────────────────────────────────

export const fetchKPIStats = async (): Promise<KPIStats> => {
  const [companiesRes, coursesRes, approvalsRes] = await Promise.all([
    supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_archived', false),
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_archived', false),
    supabase
      .from('user_approvals')
      .select('*', { count: 'exact', head: true })
      .is('decision', null),
  ]);

  return {
    total_tenants: companiesRes.count ?? 0,
    pending_approvals: approvalsRes.count ?? 0,
    live_courses: coursesRes.count ?? 0,
    total_subscriptions: companiesRes.count ?? 0,
  };
};

// ── Tenant Health Data ─────────────────────────────────────────

export const fetchTenantHealthData = async (): Promise<TenantHealthRow[]> => {
  const [companiesRes, usersRes, assignmentsRes, progressRes] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, slug, contact_email, subscription_plan, subscribed_at')
      .eq('is_archived', false),
    supabase
      .from('users')
      .select('id, company_id, last_login_at')
      .eq('is_archived', false),
    supabase
      .from('course_assignments')
      .select('id, user_id')
      .eq('is_archived', false),
    supabase
      .from('lessons_progress')
      .select('assignment_id, is_completed'),
  ]);

  const companies = companiesRes.data ?? [];
  const users = usersRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const progress = progressRes.data ?? [];

  // Build lookup: userId → companyId
  const userCompanyMap = new Map<string, number>();
  users.forEach((u) => userCompanyMap.set(u.id, u.company_id));

  return companies.map((company) => {
    const companyUsers = users.filter((u) => u.company_id === company.id);
    const userIds = new Set(companyUsers.map((u) => u.id));

    // Most recent login across all company users
    const lastLoginAt =
      companyUsers
        .filter((u) => u.last_login_at)
        .sort(
          (a, b) =>
            new Date(b.last_login_at!).getTime() -
            new Date(a.last_login_at!).getTime()
        )[0]?.last_login_at ?? null;

    // Assignments belonging to this company's users
    const companyAssignments = assignments.filter((a) => userIds.has(a.user_id));
    const assignmentIds = new Set(companyAssignments.map((a) => a.id));

    let completedLessons = 0;
    let totalLessons = 0;
    progress.forEach((p) => {
      if (assignmentIds.has(p.assignment_id)) {
        totalLessons++;
        if (p.is_completed) completedLessons++;
      }
    });

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      abbr: company.slug.toUpperCase().slice(0, 6),
      contact_email: company.contact_email,
      subscription_plan: company.subscription_plan ?? 'starter',
      subscribed_at: company.subscribed_at,
      user_count: companyUsers.length,
      last_login_at: lastLoginAt,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      assignment_count: companyAssignments.length,
    };
  });
};

// ── Course Status Breakdown ────────────────────────────────────

export const fetchCourseStatusBreakdown = async (): Promise<CourseStatusCount[]> => {
  const { data } = await supabase
    .from('courses')
    .select('status')
    .eq('is_archived', false);

  const counts: Record<string, number> = { active: 0, pending: 0, draft: 0 };
  data?.forEach((c) => {
    const status = c.status as string | null | undefined;
    if (status && status in counts) counts[status]!++;
  });

  return [
    { name: 'Active / Live', value: counts['active'] ?? 0 },
    { name: 'Pending Review', value: counts['pending'] ?? 0 },
    { name: 'Draft', value: counts['draft'] ?? 0 },
  ];
};

// ── Global Activity Trend (logins per day, last 7 days) ────────

export const fetchGlobalActivityTrend = async (): Promise<ActivityTrendPoint[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('users')
    .select('last_login_at')
    .gte('last_login_at', sevenDaysAgo.toISOString())
    .not('last_login_at', 'is', null);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build ordered map for last 7 days
  const ordered: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayNames[d.getDay()] as string;
    const label = dayNames[d.getDay()] as string;
    ordered.push({ key, label });
  }

  const counts: Record<string, number> = {};
  ordered.forEach(({ key }) => { counts[key] = 0; });
  data?.forEach((u) => {
    if (!u.last_login_at) return;
    const dayIndex = new Date(u.last_login_at).getDay();
    const day = dayNames[dayIndex] as string;
    if (day && day in counts) counts[day]!++;
  });

  return ordered.map(({ label }) => ({ day: label, logins: counts[label] ?? 0 }));
};

// ── Tenant Leaderboard ─────────────────────────────────────────

export const fetchTenantLeaderboard = async (): Promise<TenantLeaderboardRow[]> => {
  const [companiesRes, usersRes, assignmentsRes, progressRes] = await Promise.all([
    supabase.from('companies').select('id, name, slug').eq('is_archived', false),
    supabase.from('users').select('id, company_id').eq('is_archived', false),
    supabase.from('course_assignments').select('id, user_id').eq('is_archived', false),
    supabase.from('lessons_progress').select('assignment_id, is_completed'),
  ]);

  const companies = companiesRes.data ?? [];
  const users = usersRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const progress = progressRes.data ?? [];

  return companies
    .map((company) => {
      const userIds = new Set(
        users.filter((u) => u.company_id === company.id).map((u) => u.id)
      );
      const assignmentIds = new Set(
        assignments.filter((a) => userIds.has(a.user_id)).map((a) => a.id)
      );

      let completed = 0;
      let total = 0;
      progress.forEach((p) => {
        if (assignmentIds.has(p.assignment_id)) {
          total++;
          if (p.is_completed) completed++;
        }
      });

      const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: company.slug.toUpperCase().slice(0, 8),
        completion,
        users: userIds.size,
      };
    })
    .sort((a, b) => b.completion - a.completion);
};

// ── Recent Subscriptions ───────────────────────────────────────

export const fetchRecentSubscriptions = async (): Promise<RecentSubscription[]> => {
  const { data } = await supabase
    .from('companies')
    .select('id, name, slug, subscription_plan, subscribed_at, contact_email')
    .eq('is_archived', false)
    .order('subscribed_at', { ascending: false })
    .limit(4);

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    abbr: c.slug.toUpperCase().slice(0, 6),
    subscription_plan: c.subscription_plan ?? 'starter',
    subscribed_at: c.subscribed_at,
    contact_email: c.contact_email,
  }));
};
