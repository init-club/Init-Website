import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram, Linkedin, User, LogOut, ChevronDown, ChevronRight,
  Info, Users, Lightbulb, Skull, Zap, Calendar, Sparkles
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

// --- Navigation Config ---
interface NavItem {
  label: string;
  path?: string;
  children?: { label: string; path: string; icon: any }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Members',
    children: [
      { label: 'About', path: '/about', icon: Info },
      { label: 'Members', path: '/members', icon: Users },
    ]
  },
  {
    label: 'Projects',
    children: [
      { label: 'Idea Wall', path: '/idea-wall', icon: Lightbulb },
      { label: 'Graveyard', path: '/graveyard', icon: Skull },
    ]
  },
  {
    label: 'Events',
    children: [
      { label: 'Activity', path: '/activity', icon: Zap },
      { label: 'Events', path: '/events', icon: Calendar },
    ]
  },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Join Us', path: '/contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Desktop Hover State
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Dynamic Island State
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setShowProfileDropdown(false);
    setHoveredNav(null);
  }, [location.pathname]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user || null);

      if (event === 'SIGNED_IN' && session?.user) {
        const name = session.user.user_metadata.full_name?.split(' ')[0] || 'Member';
        setStatusMessage(`Welcome back, ${name}!`);
        setTimeout(() => setStatusMessage(null), 3500);
      }
      if (event === 'SIGNED_OUT') {
        setStatusMessage("See you soon!");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowProfileDropdown(false);
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



  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background ${scrolled ? 'py-2' : 'py-3 sm:py-4'}`}
      onMouseLeave={() => setHoveredNav(null)} // Close dropdowns when leaving header area
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <div
          className={`glass rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''}`}
        >
          <div className="relative flex items-center justify-between">

            {/* --- LEFT: LOGO --- */}
            <NavLink to="/" className="group flex items-center gap-2 z-20">
              <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-105 bg-gradient-brand">
                <span className="font-mono text-xs sm:text-sm font-bold whitespace-nowrap text-white">{'<Init Club/>'}</span>
              </div>
            </NavLink>

            {/* --- CENTER: DESKTOP NAV (DYNAMIC ISLAND) --- */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-10 items-center justify-center">
              <AnimatePresence mode="wait">
                {statusMessage ? (
                  <motion.div
                    key="status"
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full border border-white/20 shadow-xl"
                  >
                    <Sparkles className="text-yellow-400 w-4 h-4 animate-pulse" />
                    <span className="text-sm font-bold text-white whitespace-nowrap">{statusMessage}</span>
                  </motion.div>
                ) : (
                  <motion.nav
                    key="nav"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 rounded-full glass px-2 py-1"
                  >
                    {NAV_ITEMS.map((item) => {
                      const isActive = item.path ? location.pathname === item.path : item.children?.some(c => location.pathname === c.path);
                      const isHovered = hoveredNav === item.label;

                      return (
                        <div
                          key={item.label}
                          className="relative"
                          onMouseEnter={() => setHoveredNav(item.label)}
                          onMouseLeave={() => setHoveredNav(null)}
                        >
                          {item.children ? (
                            // Dropdown Trigger
                            <button
                              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1 outline-none ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                                }`}
                            >
                              {/* Active/Hover Background Pill */}
                              {(isActive || isHovered) && (
                                <motion.div
                                  layoutId="navPill"
                                  className={`absolute inset-0 rounded-full ${isActive ? 'bg-gradient-brand-horizontal' : 'bg-white/10'}`}
                                  initial={false}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}

                              <span className="relative z-10 flex items-center gap-1">
                                {item.label}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
                              </span>
                            </button>
                          ) : (
                            // Direct Link
                            <NavLink
                              to={item.path!}
                              className={({ isActive: linkActive }) =>
                                `relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 block outline-none ${linkActive ? 'text-white' : 'text-gray-300 hover:text-white'}`
                              }
                            >
                              {({ isActive: linkActive }) => (
                                <>
                                  {(linkActive || isHovered) && (
                                    <motion.div
                                      layoutId={`navPill-${item.label}`}
                                      className={`absolute inset-0 rounded-full ${linkActive ? 'bg-gradient-brand-horizontal' : 'bg-white/10'}`}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    />
                                  )}
                                  <span className="relative z-10">{item.label}</span>
                                </>
                              )}
                            </NavLink>
                          )}

                          {/* Desktop Dropdown Menu */}
                          <AnimatePresence>
                            {item.children && isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-full left-0 mt-2 w-56 p-2 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-50 origin-top-left ring-1 ring-white/5"
                              >
                                <div className="flex flex-col gap-1">
                                  {item.children.map((child) => (
                                    <NavLink
                                      key={child.path}
                                      to={child.path}
                                      className={({ isActive }) =>
                                        `group flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive
                                          ? 'bg-white/10 text-white font-medium shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                          : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-4 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                        }`
                                      }
                                    >
                                      {/* Icon */}
                                      <child.icon
                                        size={18}
                                        className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-gray-500 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'}`}
                                      />
                                      <span className={`relative z-10 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'}`}>
                                        {child.label}
                                      </span>
                                    </NavLink>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>

            {/* --- RIGHT: AUTH & MOBILE TOGGLE --- */}
            <div className="flex items-center gap-3 z-20">

              {/* DESKTOP AUTH */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:bg-white/5 transition-all border border-white/10"
                    >
                      <img
                        src={user.user_metadata.avatar_url || "https://github.com/identicons/user.png"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-cyan-500/50"
                      />
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showProfileDropdown && (
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
                            onClick={() => setShowProfileDropdown(false)}
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
                ) : (
                  <button
                    onClick={handleLogin}
                    className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* MOBILE TOGGLE */}
              <div className="md:hidden flex items-center gap-3">
                {user && (
                  <NavLink to="/profile" className="block md:hidden">
                    <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-cyan-500/30" alt="Me" />
                  </NavLink>
                )}
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-white/5 transition-all duration-300"
                  onClick={() => setOpen((prev) => !prev)}
                  aria-label="Toggle menu"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-200" fill="none" stroke="currentColor" strokeWidth="2">
                    {open ? (
                      <path d="M6 6l12 12M6 18L18 6" className="transition-all duration-300" />
                    ) : (
                      <path d="M4 7h16M4 12h16M4 17h16" className="transition-all duration-300" />
                    )}
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-500 ${open ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="glass rounded-2xl p-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <MobileNavItem key={item.label} item={item} />
            ))}

            {/* Mobile Auth */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 mb-2">
                    <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-white font-bold text-sm">{user.user_metadata.full_name}</p>
                      <p className="text-gray-400 text-xs">Logged In</p>
                    </div>
                  </div>
                  <NavLink to="/profile" className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2">
                    <User size={16} /> My Profile
                  </NavLink>
                  <button onClick={handleLogout} className="rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 flex items-center gap-2 text-left w-full">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-center"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Socials */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-white/10">
              {[{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/the-init-club/', icon: Linkedin }, { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram }].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-[#00ffd5] transition-colors"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// --- Mobile Nav Item Component (Accordion) ---
function MobileNavItem({ item }: { item: NavItem }) {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const isActive = item.path ? location.pathname === item.path : item.children?.some(c => location.pathname === c.path);

  if (item.children) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive || expanded ? 'bg-white/5 text-white' : 'text-gray-300 hover:bg-white/5'
            }`}
        >
          <span className="text-sm font-medium">{item.label}</span>
          <ChevronRight size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pl-4 border-l border-white/10 ml-4 mt-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 text-sm rounded-lg transition-colors ${isActive ? 'text-cyan-400 bg-white/5' : 'text-gray-400 hover:text-white'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-white bg-gradient-brand-horizontal shadow-md' : 'text-gray-300 hover:bg-white/5'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}