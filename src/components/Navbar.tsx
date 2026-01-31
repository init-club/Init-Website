import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';
import { OctopusThemeToggle } from './OctopusThemeToggle';


const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Join Us', path: '/contact' },
];



export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'py-2'
        : 'py-3 sm:py-4'
        }`}
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div
          className={`glass rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="group flex items-center gap-2"
            >
              <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: 'var(--primary)' }}>
                <span className="font-mono text-xs sm:text-sm font-bold whitespace-nowrap text-white">{'<Init Club/>'}</span>
              </div>
              {/* <span className="hidden sm:block font-semibold text-[var(--text)]">
                Init Club
              </span> */}
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 rounded-full glass px-2 py-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 overflow-hidden',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
                      isActive ? 'text-white' : 'text-[var(--text)] hover:bg-[var(--glass-bg)]',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <>
                          {/* Laser Fill Animation */}
                          <motion.div
                            className="absolute inset-0 z-0 origin-left"
                            style={{ backgroundColor: 'var(--primary)' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, ease: "linear" }}
                          />

                          {/* Scanning Line */}
                          <motion.div
                            className="absolute inset-y-0 z-10 w-0.5 bg-white"
                            style={{ boxShadow: '0 0 6px rgba(255,255,255,0.6), 0 0 12px var(--primary)' }}
                            initial={{ left: '0%', opacity: 1 }}
                            animate={{ left: '100%', opacity: 0 }}
                            transition={{ duration: 0.3, ease: "linear" }}
                          />
                        </>
                      )}

                      {/* Text Content */}
                      <span className="relative z-20">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle - Octopus */}
              <OctopusThemeToggle />

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-[var(--card-hover)] transition-all duration-300"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-[var(--text)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-500 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <nav className="glass rounded-2xl p-4 flex flex-col gap-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-[var(--text)] hover:bg-[var(--glass-bg)]',
                  ].join(' ')
                }
                style={({ isActive }) => ({
                  animationDelay: `${index * 50}ms`,
                  ...(isActive ? {
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  } : {})
                })}
              >
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Socials */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-[var(--border)]">
              {[{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/the-init-club/', icon: Linkedin }, { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram }].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-[var(--white-5)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                  aria-label={social.label}
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
