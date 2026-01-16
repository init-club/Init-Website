import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark'; // Default to dark theme
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
  localStorage.setItem('theme', theme);
};

const SunIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-none stroke-current"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95-6.95-1.4 1.4M6.45 17.55l-1.4 1.4m0-14.9 1.4 1.4m12.1 12.1 1.4 1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-5 w-5 fill-none stroke-current"
    strokeWidth="1.6"
  >
    <path d="M21 14.5a8.5 8.5 0 1 1-11-11 8.5 8.5 0 0 0 11 11Z" />
  </svg>
);

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      className="group flex items-center justify-center h-10 w-10 rounded-xl glass text-[var(--text)] hover:text-[var(--accent)] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

export default ThemeToggle;
