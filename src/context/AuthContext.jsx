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
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh local user state from database
      await fetchUserProfile(user.email);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, company, selectCompany, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);