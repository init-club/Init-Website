import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Join Us', path: '/contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
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

  const getNavLinkClass = (isActive: boolean) => [
    'relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
    isActive ? 'text-white' : 'text-[var(--text)] hover:bg-[var(--glass-bg)]', 
  ].join(' ');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background ${scrolled ? 'py-2' : 'py-3 sm:py-4'}`}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-4"> 
        <div
          className={`glass rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''}`}
        >
          <div className="flex items-center justify-between">
            
            {/* --- LOGO --- */}
            <NavLink to="/" className="group flex items-center gap-2">
              <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-105 bg-gradient-brand">
                <span className="font-mono text-xs sm:text-sm font-bold whitespace-nowrap text-white">{'<Init Club/>'}</span>
              </div>
            </NavLink>

            {/* --- DESKTOP NAV --- */}
            <div className="hidden md:flex items-center gap-4">
              <nav className="flex items-center gap-1 rounded-full glass px-2 py-1">
                {navItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={({ isActive }) => getNavLinkClass(isActive)}>
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <>
                            <motion.div
                              className="absolute inset-0 z-0 origin-left bg-gradient-brand-horizontal"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.3, ease: "linear" }}
                            />
                            <motion.div
                              className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                              initial={{ left: '0%', opacity: 1 }}
                              animate={{ left: '100%', opacity: 0 }}
                              transition={{ duration: 0.3, ease: "linear" }}
                            />
                          </>
                        )}
                        <span className="relative z-20">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}

                {/* 'Members' Link - Only visible if logged in */}
                {user && (
                  <NavLink to="/members" className={({ isActive }) => getNavLinkClass(isActive)}>
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div className="absolute inset-0 z-0 bg-cyan-500/20" layoutId="activeNav" />
                        )}
                        <span className="relative z-20 text-cyan-400">Members</span>
                      </>
                    )}
                  </NavLink>
                )}
              </nav>

              {/* --- DESKTOP AUTH DROPDOWN --- */}
              {user ? (
                <div className="relative">
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
              ) : (
                
                <button
                  onClick={handleLogin}
                  className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Login
                </button>
              )}
            </div>

            {/* --- MOBILE TOGGLE --- */}
            <div className="md:hidden flex items-center gap-3">
               {/* Show tiny avatar on mobile bar if logged in */}
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

        {/* --- MOBILE MENU --- */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-500 ${open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="glass rounded-2xl p-4 flex flex-col gap-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    isActive ? 'text-white shadow-md bg-gradient-brand-horizontal' : 'text-gray-300 hover:bg-white/5',
                  ].join(' ')
                }
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </NavLink>
            ))}

            {/* Mobile: Members Link */}
            {user && (
              <NavLink
                to="/members"
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    isActive ? 'text-white shadow-md bg-cyan-600' : 'text-cyan-400 hover:bg-cyan-900/20',
                  ].join(' ')
                }
              >
                Members Zone
              </NavLink>
            )}

            {/* Mobile: Auth Section */}
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
                /* --- MOBILE LOGIN BUTTON (FIXED) --- */
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

export default Navbar;
