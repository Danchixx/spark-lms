import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { AppUser, Company, RoleName } from "../types";
import type { Session } from "@supabase/supabase-js";

// ─── Context value type ──────────────────────────────────────
type AuthContextValue = {
  session: Session | null;
  user: AppUser | null;
  company: Company | null;
  loading: boolean;
  selectCompany: (c: Company | null) => void;
  login: (email: string, password: string) => Promise<unknown>;
  loginMock: (data: Partial<AppUser>) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Record<string, unknown>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | undefined>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for persisted mock user or active session on mount
    const savedMock = localStorage.getItem("spark_mock_user");
    if (savedMock) {
      try {
        setUser(JSON.parse(savedMock));
        setLoading(false);
      } catch (e) {
        localStorage.removeItem("spark_mock_user");
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !savedMock) {
        fetchUserProfile(session.user.email!);
      } else if (!savedMock) {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.email!);
        } else {
          setUser(null);
          setCompany(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles(name),
          companies!users_company_id_fkey(*)
        `)
        .eq('email', email)
        .single();

      if (userError) throw userError;

      // Unpack nested joins
      const { companies, roles, ...restUser } = userData as Record<string, unknown>;
      const rolesData = roles as { name: string } | null;
      const companiesData = companies as Company | null;

      setUser({
        ...(restUser as Omit<AppUser, 'role' | 'name'>),
        role: (rolesData?.name as RoleName) || 'user',
        name: `${(restUser as { firstname: string }).firstname} ${(restUser as { lastname: string }).lastname}`
      });
      setCompany(companiesData ?? null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If fetching the public user profile fails (e.g. no match), force sign out
      supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  // Safe shim for the selectCompany that existed previously (not heavily used in new schema)
  const selectCompany = (c: Company | null) => setCompany(c);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Explicitly block and fetch the user profile here before returning control to the caller
    // to ensure the AuthContext user object is populated before the router evaluates protected routes.
    await fetchUserProfile(data.user.email!);
    return data;
  };

  const loginMock = (data: Partial<AppUser>) => {
    const fullMock: AppUser = {
      id: -1,
      company_id: -1,
      email: "spark-admin@local.test",
      firstname: "Spark",
      lastname: "Admin",
      name: "Spark Admin",
      role: 'spark_admin',
      status: 'active',
      created_at: new Date().toISOString(),
      is_archived: false,
      archived_at: null,
      archived_by: null,
      middlename: null,
      avatar_url: null,
      date_of_birth: null,
      gender: null,
      contact_no: null,
      address: null,
      employee_id: "SM001",
      department: "SuperAdmin",
      job_title: "Global Administrator",
      date_hired: new Date().toISOString(),
      ...data
    } as AppUser;
    
    setUser(fullMock);
    localStorage.setItem("spark_mock_user", JSON.stringify(fullMock));
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem("spark_mock_user");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
  };

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!user?.id) return;
    
    // Handle mock user updates (local only)
    if (user.id < 0) {
      const updatedUser = { ...user, ...updates };
      // Map names if firstname/lastname changed
      if (updates.firstname || updates.lastname) {
        updatedUser.name = `${updatedUser.firstname} ${updatedUser.lastname}`;
      }
      setUser(updatedUser as AppUser);
      localStorage.setItem("spark_mock_user", JSON.stringify(updatedUser));
      console.log("Mock profile updated locally:", updatedUser);
      return;
    }

    try {
      console.log("Updating profile for user ID:", user.id, "with:", updates);
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select(`
          *,
          roles(name),
          companies!users_company_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      console.log("Update successful, returned data:", data);
      
      // Update local state directly
      const { companies, roles, ...restUser } = data as Record<string, unknown>;
      const rolesData = roles as { name: string } | null;
      const companiesData = companies as Company | null;

      setUser({
        ...(restUser as Omit<AppUser, 'role' | 'name'>),
        role: (rolesData?.name as RoleName) || 'user',
        name: `${(restUser as { firstname: string }).firstname} ${(restUser as { lastname: string }).lastname}`
      });
      if (companiesData) setCompany(companiesData);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | undefined> => {
    if (!user?.id) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.floor(Date.now() / 1000)}.${fileExt}`;
      const filePath = fileName;

      console.log("Starting upload to avatars bucket. Path:", filePath);

      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      console.log("Upload successful:", uploadData);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Generated Public URL:", publicUrl);

      // 3. Update User Table
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, company, selectCompany, login, loginMock, logout, updateProfile, uploadAvatar, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};