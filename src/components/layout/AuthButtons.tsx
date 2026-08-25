import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import { useAuth } from '../../context/AuthContext';

type AuthButtonsProps = {
  variant?: 'default' | 'outline';
};

// Dropdown geometry. The menu is centered under the avatar, then nudged back
// inside the viewport so the desktop (top-right corner) and mobile (centered)
// placements both stay fully on screen.
const MENU_WIDTH = 224; // matches w-56
const VIEWPORT_GUTTER = 8;

export default function AuthButtons({ variant = 'default' }: AuthButtonsProps) {
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuShift, setMenuShift] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const user = session?.user || null;

  // Center the menu on the trigger, then clamp it into the viewport.
  const positionMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const centeredLeft = rect.left + rect.width / 2 - MENU_WIDTH / 2;
    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_GUTTER;
    const clampedLeft = Math.min(Math.max(centeredLeft, VIEWPORT_GUTTER), Math.max(maxLeft, VIEWPORT_GUTTER));

    setMenuShift(clampedLeft - centeredLeft);
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown) return;
    positionMenu();
  }, [showDropdown, positionMenu]);

  // Keep the menu anchored while the page moves under it, and close it on any
  // outside interaction or Escape.
  useEffect(() => {
    if (!showDropdown) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [showDropdown, positionMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  if (user) {
    return (
      <div ref={containerRef} className="relative font-sans">
        <button
          ref={triggerRef}
          onClick={() => setShowDropdown((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={showDropdown}
          aria-label="Account menu"
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
              role="menu"
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              // Offset via margin, not transform, so it never fights the
              // enter/exit transform animation above.
              style={{ marginLeft: menuShift - MENU_WIDTH / 2 }}
              className="absolute top-full left-1/2 mt-2 z-50 w-56 bg-[#09090b] rounded-xl overflow-hidden border border-white/10 shadow-2xl p-1 flex flex-col gap-1 text-left"
            >
                <div className="px-4 py-2 mb-1 border-b border-white/10">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.user_metadata.full_name}</p>
                </div>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    role="menuitem"
                    onClick={() => setShowDropdown(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <User size={16} /> Admin Panel
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  role="menuitem"
                  onClick={() => setShowDropdown(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <User size={16} /> My Profile
                </NavLink>
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
      onClick={() => navigate('/login')}
      className={variant === 'outline'
        ? 'px-5 py-2 rounded-xl border-2 border-white bg-transparent text-[var(--text)] text-sm font-bold hover:bg-white hover:text-black transition-colors'
        : 'px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]'
      }
    >
      Login
    </button>
  );
}
