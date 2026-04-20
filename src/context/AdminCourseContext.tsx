import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// --- Context Type ---
type AdminCourseContextValue = {
  adminCourses: any[];
  courseDetailsCache: Record<string, any>;
  loadingList: boolean;
  loadingDetails: boolean;
  error: string | null;
  fetchAdminCourses: (forceRefresh?: boolean) => Promise<void>;
  fetchCourseDetails: (id: string, forceRefresh?: boolean) => Promise<any>;
  assignUsersToCourse: (courseId: string, userIds: string[]) => Promise<{success: boolean; error?: any}>;
};

const AdminCourseContext = createContext<AdminCourseContextValue | null>(null);

export const AdminCourseProvider = ({ children }: { children: ReactNode }) => {
  const { company } = useAuth();
  
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [courseDetailsCache, setCourseDetailsCache] = useState<Record<string, any>>({});
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch the list of Admin Courses (Grid View)
  const fetchAdminCourses = useCallback(async (forceRefresh = false) => {
    if (!company?.id) return;
    
    // Check if we already have it cached
    if (adminCourses.length > 0 && !forceRefresh) return;
    
    setLoadingList(true);
    setError(null);

    try {
      // Get the SPARK company ID to include its global courses
      const { data: sparkData } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', 'spark')
        .single();

      // Ensure we don't duplicate if the admin IS from Spark
      const companyIds = sparkData?.id 
        ? Array.from(new Set([company.id, sparkData.id])) 
        : [company.id];

      const { data, error: fetchErr } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          thumbnail_url,
          status,
          companies ( name, logo_url ),
          users!courses_created_by_fkey (
            roles ( name )
          ),
          course_assignments (
            id,
            course_progress ( progress_pct )
          ),
          course_modules ( id )
        `)
        .in('company_id', companyIds);

      if (fetchErr) throw fetchErr;

      const mapped = (data || []).map((c: any) => {
        const assignments = c.course_assignments || [];
        let avgCompletion = 0;
        if (assignments.length > 0) {
          const total = assignments.reduce((acc: number, a: any) => acc + (a.course_progress?.[0]?.progress_pct || 0), 0);
          avgCompletion = Math.round(total / assignments.length);
        }

        const modules = c.course_modules || [];
        const modulesCount = modules.length;
        const lessonsCount = modulesCount > 0 ? modulesCount * 3 : 0; 
        
        const creatorData = Array.isArray(c.users) ? c.users[0] : c.users;
        const roleData = creatorData?.roles;
        const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
        const companyData = Array.isArray(c.companies) ? c.companies[0] : c.companies;
        
        return {
          id: c.id,
          name: c.title,
          thumbnail: c.thumbnail_url || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600",
          enrolled: assignments.length > 0 ? assignments.length.toString() : "--",
          modulesCount,
          lessonsCount,
          status: c.status?.toLowerCase() === 'pending' ? 'Pending' : 'Active',
          avgCompletion,
          creatorLabel: companyData?.name?.toUpperCase() || "UNKNOWN",
          creatorRole: roleName || "Course Creator",
          creatorLogo: companyData?.logo_url || null
        };
      });

      setAdminCourses(mapped);
    } catch (err: any) {
      console.error('Error fetching admin courses:', err);
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoadingList(false);
    }
  }, [company?.id, adminCourses.length]);

  // 2. Fetch specific Course Details (Targeting the single course page)
  const fetchCourseDetails = useCallback(async (id: string, forceRefresh = false) => {
    if (!company?.id || !id) return null;

    // Check cache
    if (courseDetailsCache[id] && !forceRefresh) {
      return courseDetailsCache[id];
    }

    setLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description, thumbnail_url, status, created_at, icon_emoji,
          companies ( name, logo_url ),
          users!courses_created_by_fkey ( firstname, lastname, company_id, roles(name) ),
          course_modules ( id ),
          course_assignments (
            id,
            status,
            assigned_at,
            course_progress ( progress_pct ),
            users!course_assignments_user_id_fkey (
              id, firstname, lastname, email, avatar_url, department
            )
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;

      // Update Dictionary Cache
      setCourseDetailsCache(prev => ({ ...prev, [id]: data }));
      return data;
      
    } catch (err: any) {
      console.error("Error fetching admin course details:", err);
      setError(err.message || 'Failed to fetch course details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  }, [company?.id, courseDetailsCache]);

  // 3. Centralized assignment mutation
  const assignUsersToCourse = useCallback(async (courseId: string, userIds: string[]) => {
    try {
      const inserts = userIds.map(uid => ({
        course_id: courseId,
        user_id: uid,
        status: 'not_started'
      }));
      
      const { error } = await supabase.from('course_assignments').insert(inserts);
      if (error) throw error;

      // Force refresh the specific course details cache
      await fetchCourseDetails(courseId, true);
      // Force refresh the master admin course list (to reflect new enrolled counts)
      await fetchAdminCourses(true);
      
      return { success: true };
    } catch (err: any) {
      console.error("Error assigning users:", err);
      return { success: false, error: err };
    }
  }, [fetchCourseDetails, fetchAdminCourses]);

  return (
    <AdminCourseContext.Provider value={{
      adminCourses,
      courseDetailsCache,
      loadingList,
      loadingDetails,
      error,
      fetchAdminCourses,
      fetchCourseDetails,
      assignUsersToCourse
    }}>
      {children}
    </AdminCourseContext.Provider>
  );
};

export const useAdminCourseContext = () => {
  const context = useContext(AdminCourseContext);
  if (!context) throw new Error("useAdminCourseContext must be used within AdminCourseProvider");
  return context;
};
