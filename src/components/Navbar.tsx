import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
];

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    'px-4 py-2 text-sm font-medium rounded-full transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
    isActive
      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25'
      : 'text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--glass-bg)]',
  ].join(' ');

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
          : 'py-4'
        }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={`glass rounded-2xl px-4 py-3 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="group flex items-center gap-2"
            >
              <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 p-2 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
                <span className="font-mono text-sm font-bold text-white">{'<Init Club/>'}</span>
              </div>
              {/* <span className="hidden sm:block font-semibold text-[var(--text)]">
                Init Club
              </span> */}
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 rounded-full glass px-2 py-1">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={navLinkClasses}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

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
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : 'text-[var(--text)] hover:bg-[var(--glass-bg)]',
                  ].join(' ')
                }
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
