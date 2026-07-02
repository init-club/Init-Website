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
        setIsAdmin(profile.role === 'admin');
      } else {
        // Fallback check in case RPC fails
        const { data: userRow } = await supabase
          .from('users')
          .select('id, role, name, username, avatar_url, custom_title')
          .eq('auth_user_id', userId)
          .single();
        
        if (userRow) {
          setUserProfile(userRow);
          setIsAdmin(userRow.role === 'admin');
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error('Error fetching profile context:', err);
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

    // 2. Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, activeSession) => {
      setSession(activeSession);
      if (activeSession?.user) {
        await fetchProfile(activeSession.user.id);
      } else {
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

