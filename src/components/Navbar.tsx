import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact Us', path: '/contact' },
];

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200',
    'border border-transparent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
    'text-slate-800 dark:text-slate-100',
    'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700/70 dark:hover:text-sky-300',
    isActive
      ? 'bg-sky-600 text-white shadow-md dark:bg-sky-500 dark:text-white'
      : 'bg-white/60 dark:bg-slate-800/80',
  ].join(' ');

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/95 px-4 py-2 text-cyan-400 shadow-lg">
              <span className="font-mono text-lg tracking-wide text-cyan-300">{'<Init Club />'}</span>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-2 py-1 shadow-sm backdrop-blur md:flex dark:border-white/10 dark:bg-slate-800/70">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClasses}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600 dark:border-white/10 dark:text-white md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/85 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-xl px-3 py-2 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300',
                    'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700/70 dark:hover:text-sky-300',
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-slate-700/60 dark:text-sky-300'
                      : 'text-slate-800 dark:text-slate-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
