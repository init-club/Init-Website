import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const navGraph = [
  { label: 'Home', path: '/' },
  {
    label: 'People',
    path: '/about',
    children: [
      { label: 'About Us', path: '/about' },
      { label: 'Members', path: '/members' },
    ]
  },
  {
    label: 'Projects',
    path: '/projects',
    children: [
      { label: 'Idea Wall', path: '/idea-wall' },
      { label: 'Graveyard', path: '/graveyard' },
    ]
  },
  {
    label: 'Updates',
    path: '/updates',
    children: [
      { label: 'Activity', path: '/activity' },
      { label: 'Events', path: '/events' },
    ]
  },
  { label: 'Join Us', path: '/contact' },
  { label: 'Blogs', path: '/blogs' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  // --- Auth Check Logic (Unchanged) ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data, error } = await supabase.rpc('get_my_status');
        if (!error && data && data.length > 0) {
          const role = data[0].role;
          setIsAdmin(role === 'admin' || role === 'semi_admin');
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data, error } = await supabase.rpc('get_my_status');
        if (!error && data && data.length > 0) {
          const role = data[0].role;
          setIsAdmin(role === 'admin' || role === 'semi_admin');
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuthDropdown(false);
    setOpen(false);
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

  const isParentActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  const navContainerClass = "flex items-center gap-8";
  const linkBaseClass = "relative px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 flex items-center gap-1 group whitespace-nowrap";
  const linkActiveEffect = "bg-[linear-gradient(90deg,#00ffd5,#a855f7)] text-white shadow-lg";
  const linkHoverEffect = "text-gray-300 hover:text-white hover:bg-white/10";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 shadow-2xl backdrop-blur-xl py-2' : 'bg-black/40 backdrop-blur-lg py-4'}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between relative px-2 py-1">

          <div className="flex-shrink-0 z-20">
            <NavLink to="/" className="group flex items-center gap-2">
              <div className="rounded-full p-2.5 transition-transform duration-300 group-hover:scale-105 bg-gradient-brand shadow-lg box-glow">
                <span className="font-mono text-sm font-bold whitespace-nowrap text-white">{'<Init Club/>'}</span>
              </div>
            </NavLink>
          </div>

          <nav className={`hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${navContainerClass}`}>
            {navGraph.map((item, index) => {
              const isActive = item.children ? isParentActive(item.children) : location.pathname === item.path;

              return (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`${linkBaseClass} cursor-pointer ${isActive ? linkActiveEffect : linkHoverEffect}`}
                    onClick={() => item.children ? null : navigate(item.path)}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown size={14} className={`transition-transform duration-300 ${hoveredIndex === index ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.children && hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 mt-2 min-w-[180px] bg-[#09090b] rounded-xl overflow-hidden border border-white/10 shadow-2xl p-1 z-50 flex flex-col gap-1"
                      >
                        {/* Triangle - Adjusted or removed if not needed for solid look, but let's keep it left aligned or remove. Removing for cleaner solid look as per standard. */}

                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}


          </nav>

          <div className="flex items-center gap-3 z-20">

            {/* Desktop Auth */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass hover:bg-white/10 transition-all border border-white/10 group"
                  >
                    <img
                      src={user.user_metadata.avatar_url || "https://github.com/identicons/user.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-white/20 group-hover:border-white/50 transition-colors"
                    />
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showAuthDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showAuthDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-56 bg-[#09090b] rounded-xl overflow-hidden border border-white/10 shadow-2xl z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate">{user.user_metadata.full_name}</p>
                        </div>
                        {isAdmin && (
                          <NavLink
                            to="/admin"
                            onClick={() => setShowAuthDropdown(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                          >
                            <User size={16} /> Admin Panel
                          </NavLink>
                        )}
                        <NavLink
                          to="/profile"
                          onClick={() => setShowAuthDropdown(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
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
                  className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Login
                </button>
              )}
            </div>

            <div className="md:hidden">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-white/5 transition-all duration-300 border border-white/10"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col items-end gap-1">
                  <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'w-5 translate-y-1.5 rotate-45' : 'w-5'}`} />
                  <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'opacity-0' : 'w-3'}`} />
                  <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'w-5 -translate-y-1.5 -rotate-45' : 'w-4'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-500 ${open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="glass rounded-2xl p-4 flex flex-col gap-2 border border-white/10 bg-black/80 backdrop-blur-xl">
            {navGraph.map((item, index) => (
              <div key={index} className="overflow-hidden">
                {item.children ? (
                  /* Accordion Logic */
                  <div className="flex flex-col">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === index ? null : index)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${mobileExpanded === index ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                        }`}
                    >
                      {item.label}
                      <ChevronRight size={16} className={`transition-transform duration-300 ${mobileExpanded === index ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {mobileExpanded === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex flex-col gap-1 pl-4 border-l border-white/10 ml-4 mt-1"
                        >
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                `block px-4 py-2 text-sm rounded-lg transition-all ${isActive ? 'text-white font-bold bg-white/5' : 'text-gray-400 hover:text-white'
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Direct Link */
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-gradient-brand text-white shadow-lg' : 'text-gray-300 hover:bg-white/5'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 mb-2">
                    <img src={user.user_metadata.avatar_url} className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                      <p className="text-white font-bold text-sm">{user.user_metadata.full_name}</p>
                      <p className="text-gray-400 text-xs">Logged In</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <NavLink to="/admin" className="rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2 border border-white/10 bg-white/5">
                      <User size={16} /> Admin Panel
                    </NavLink>
                  )}
                  <NavLink to="/profile" className="rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 flex items-center gap-2">
                    <User size={16} /> My Profile
                  </NavLink>
                  <button onClick={handleLogout} className="rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-left w-full">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-center shadow-lg hover:bg-gray-200 transition-colors"
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
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
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

export default Navbar;


