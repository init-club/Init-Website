import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  session: Session | null;
  userProfile: any | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userProfile: null,
  isAdmin: false,
  isLoading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_my_status');
      if (!error && data && data.length > 0) {
        const profile = data[0];
        setUserProfile(profile);
        setIsAdmin(String(profile.role).toLowerCase() === 'admin');
      } else {
        // Fallback check: Query by auth_user_id
        let { data: userRow } = await supabase
          .from('users')
          .select('id, role, name, username, avatar_url, custom_title')
          .eq('auth_user_id', userId)
          .maybeSingle();

        // If auth_user_id is not yet linked in users table, fallback to GitHub username matching
        if (!userRow) {
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          const ghUsername = activeSession?.user?.user_metadata?.preferred_username || activeSession?.user?.user_metadata?.user_name;
          if (ghUsername) {
            const { data: matchedRow } = await supabase
              .from('users')
              .select('id, role, name, username, avatar_url, custom_title')
              .ilike('username', ghUsername)
              .maybeSingle();
            userRow = matchedRow;
          }
        }
        
        if (userRow) {
          setUserProfile(userRow);
          setIsAdmin(String(userRow.role).toLowerCase() === 'admin');
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error('Error fetching profile context:', err);
      setIsAdmin(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session: activeSession } } = await supabase.auth.getSession();
    if (activeSession?.user) {
      await fetchProfile(activeSession.user.id);
    }
  }, [fetchProfile]);

  useEffect(() => {
    // 1. Initial Session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      }
      setIsLoading(false);
    });

    // 2. Listen to Auth State changes (skip redundant INITIAL_SESSION fetch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, activeSession) => {
      setSession(activeSession);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (activeSession?.user) {
          await fetchProfile(activeSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const value = useMemo(() => ({
    session,
    userProfile,
    isAdmin,
    isLoading,
    refreshProfile
  }), [session, userProfile, isAdmin, isLoading, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

