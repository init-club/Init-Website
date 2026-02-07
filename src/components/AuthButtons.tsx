import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export default function AuthButtons() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };


  if (user) {
    return (
      <div className="relative font-sans">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:bg-white/5 transition-all border border-white/10"
        >
          <img
            src={user.user_metadata.avatar_url || "https://github.com/identicons/user.png"}
            alt="Profile"
            className="w-8 h-8 rounded-full border border-cyan-500/50"
          />
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden border border-white/10 shadow-xl z-50"
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-bold text-white truncate">{user.user_metadata.full_name}</p>
              </div>
              <NavLink
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-cyan-400 transition-colors"
              >
                <User size={16} /> My Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }


  return (
    <button
      onClick={handleLogin}
      className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
    >
      Login
    </button>
  );
}