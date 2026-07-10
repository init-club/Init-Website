import { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import useSWR from 'swr';
import { fetchSiteSettings } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import { useLenis } from './SmoothScroll';

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
  { label: 'Forms', path: '/forms' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const lenis = useLenis();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { session, isAdmin, isLoading } = useAuth();
  const user = session?.user || null;
  const { data: settings } = useSWR('site_settings', fetchSiteSettings, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000 // 1 hour cache duration
  });
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  const handleScroll = useCallback(({ scroll }: { scroll: number }) => {
    setScrolled(scroll > 20);
  }, []);

  useEffect(() => {
    if (lenis) {
      lenis.on('scroll', handleScroll);
      return () => lenis.off('scroll', handleScroll);
    }
    const handleNativeScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleNativeScroll);
    return () => window.removeEventListener('scroll', handleNativeScroll);
  }, [lenis, handleScroll]);

  useEffect(() => {
    setOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuthDropdown(false);
    setOpen(false);
    navigate('/');
  };

  const isParentActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-zinc-950/90 border-b border-zinc-900 shadow-lg shadow-black/20 backdrop-blur-xl py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between relative py-1">

          {/* Logo */}
          <div className="flex-shrink-0 z-20">
            <NavLink to="/" className="group flex items-center gap-2.5">
              <motion.div
                className="relative overflow-hidden rounded-xl p-[2px] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_18px_rgba(0,255,213,0.22)]"
                initial="initial"
                whileHover="hover"
                style={{ background: 'linear-gradient(135deg, #00ffd5, #a855f7)' }}
              >
                <motion.div
                  className="absolute inset-[2px] z-0 rounded-[10px] origin-left"
                  variants={{
                    initial: { scaleX: 0 },
                    hover: { scaleX: 1 }
                  }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                  style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)' }}
                />
                <motion.div
                  className="absolute inset-y-[2px] z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                  variants={{
                    initial: { left: '2px', opacity: 0 },
                    hover: { left: 'calc(100% - 2px)', opacity: 1 }
                  }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-[2px] z-20 rounded-[10px] bg-black"
                  style={{ transformOrigin: 'right center' }}
                  variants={{
                    initial: { scaleX: 1 },
                    hover: { scaleX: 0 }
                  }}
                  transition={{ duration: 0.2, ease: 'linear' }}
                />
                <div className="relative z-30 px-3 py-1.5">
                  <span className="font-mono text-[13px] font-bold whitespace-nowrap text-white tracking-tight">
                    {'<Init Club/>'}
                  </span>
                </div>
              </motion.div>
            </NavLink>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
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
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1 whitespace-nowrap select-none ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => item.children ? null : navigate(item.path)}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)', opacity: 0.15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                    {item.children && (
                      <ChevronDown
                        size={13}
                        className={`relative z-10 text-zinc-500 transition-transform duration-200 ${hoveredIndex === index ? 'rotate-180 text-white' : ''}`}
                      />
                    )}
                  </div>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && hoveredIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 mt-1.5 min-w-[160px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/50 p-1 z-50 flex flex-col gap-0.5"
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `block px-3 py-2 text-sm rounded-lg transition-all duration-150 ${isActive
                                ? 'bg-white/8 text-white font-semibold'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
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

          {/* Right Side */}
          <div className="flex items-center gap-3 z-20">

            {/* Desktop Auth */}
            <div className="hidden md:block">
              {isLoading ? (
                <div className="w-[72px] h-9" /> // stable placeholder space to prevent layout shifting
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900 transition-all duration-200 group"
                  >
                    <img
                      src={user.user_metadata.avatar_url || "https://github.com/identicons/user.png"}
                      alt="Profile"
                      className="w-7 h-7 rounded-full border border-zinc-700 group-hover:border-zinc-500 transition-colors"
                    />
                    <ChevronDown size={13} className={`text-zinc-500 transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showAuthDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-52 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/50 z-50"
                      >
                        <div className="px-4 py-3 border-b border-zinc-900">
                          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">Signed in as</p>
                          <p className="text-sm font-semibold text-white truncate mt-0.5">{user.user_metadata.full_name}</p>
                        </div>
                        {isAdmin && (
                          <NavLink
                            to="/admin"
                            onClick={() => setShowAuthDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <User size={14} /> Admin Panel
                          </NavLink>
                        )}
                        <NavLink
                          to="/profile"
                          onClick={() => setShowAuthDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <User size={14} /> My Profile
                        </NavLink>
                        <div className="border-t border-zinc-900">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 hover:bg-white/5 transition-all duration-200"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                <div className="w-4 flex flex-col items-end gap-[5px]">
                  <span className={`h-[1.5px] bg-white transition-all duration-300 ${open ? 'w-4 translate-y-[6.5px] rotate-45' : 'w-4'}`} />
                  <span className={`h-[1.5px] bg-white transition-all duration-300 ${open ? 'opacity-0 w-4' : 'w-2.5'}`} />
                  <span className={`h-[1.5px] bg-white transition-all duration-300 ${open ? 'w-4 -translate-y-[6.5px] -rotate-45' : 'w-3'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <nav className="bg-zinc-950/95 backdrop-blur-xl rounded-2xl p-3 flex flex-col gap-1 border border-zinc-800">
            {navGraph.map((item, index) => (
              <div key={index} className="overflow-hidden">
                {item.children ? (
                  <div className="flex flex-col">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === index ? null : index)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        mobileExpanded === index ? 'bg-white/6 text-white' : 'text-zinc-400 hover:bg-white/4 hover:text-white'
                      }`}
                    >
                      {item.label}
                      <ChevronRight size={14} className={`text-zinc-600 transition-transform duration-200 ${mobileExpanded === index ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {mobileExpanded === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="flex flex-col gap-0.5 pl-3 border-l border-zinc-800/70 ml-3 mt-0.5"
                        >
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 text-sm rounded-lg transition-all duration-150 ${isActive ? 'text-white font-semibold bg-white/5' : 'text-zinc-500 hover:text-white'}`
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
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-zinc-400 hover:bg-white/4 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}

            {/* Mobile Auth */}
            <div className="mt-2 pt-2 border-t border-zinc-900 flex flex-col gap-1">
              {isLoading ? (
                <div className="w-full h-10" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-zinc-800" />
                    <div>
                      <p className="text-white font-semibold text-sm">{user.user_metadata.full_name}</p>
                      <p className="text-zinc-500 text-xs font-mono">Logged In</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <NavLink to="/admin" className="rounded-xl px-3 py-2.5 text-sm font-medium text-white hover:bg-white/5 flex items-center gap-2 border border-zinc-800 bg-white/4">
                      <User size={14} /> Admin Panel
                    </NavLink>
                  )}
                  <NavLink to="/profile" className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors">
                    <User size={14} /> My Profile
                  </NavLink>
                  <button onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-left w-full transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-sm text-center hover:bg-zinc-100 transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Socials */}
            <div className="flex items-center justify-center gap-3 mt-1 pt-2 border-t border-zinc-900">
              {[
                { label: 'LinkedIn', href: settings?.linkedin_link || 'https://www.linkedin.com/company/the-init-club/', icon: Linkedin },
                { label: 'Instagram', href: settings?.instagram_link || 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <social.icon size={18} />
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
