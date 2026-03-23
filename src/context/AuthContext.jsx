import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUserProfile(session.user.email);
        } else {
          setUser(null);
          setCompany(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (email) => {
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
      const { companies, roles, ...restUser } = userData;
      
      setUser({
        ...restUser,
        role: roles?.name || 'user',
        name: `${restUser.firstname} ${restUser.lastname}`
      });
      setCompany(companies);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If fetching the public user profile fails (e.g. no match), force sign out
      supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  // Safe shim for the selectCompany that existed previously (not heavily used in new schema)
  const selectCompany = (c) => setCompany(c);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Explicitly block and fetch the user profile here before returning control to the caller
    // to ensure the AuthContext user object is populated before the router evaluates protected routes.
    await fetchUserProfile(data.user.email);
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return;
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
      const { companies, roles, ...restUser } = data;
      setUser({
        ...restUser,
        role: roles?.name || 'user',
        name: `${restUser.firstname} ${restUser.lastname}`
      });
      if (companies) setCompany(companies);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
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
    <AuthContext.Provider value={{ session, user, company, selectCompany, login, logout, updateProfile, uploadAvatar, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);