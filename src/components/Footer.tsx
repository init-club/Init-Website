import { NavLink } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact Us', path: '/contact' },
];

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/70 bg-white/60 py-8 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-[1.1fr,1fr,1fr]">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Init Club</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Empowering innovation through open-source collaboration.
              Init Club where ideas turn into impact.
            </p>

            <div className="mt-4">
              <div className="mt-3 flex flex-wrap gap-3">
                {socials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/10 text-slate-800 transition hover:bg-sky-600 hover:text-white dark:bg-white/10 dark:text-slate-100 dark:hover:bg-sky-500"
                      aria-label={item.label}
                    >
                      <Icon  className="h-5 w-5 stroke-[1.75]"  />
                    </a>
                  );
                })}
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-300">
                <div>Amrita Vishwa Vidhapeetham, Coimbatore</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Navigate</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="rounded-xl px-2 py-2 transition hover:-translate-y-0.5 hover:bg-slate-100/80 hover:text-sky-600 dark:hover:bg-slate-800/80 dark:hover:text-sky-300"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between text-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Join Our Community</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Stay updated with our events, workshops, and project showcases.
              </p>
            </div>
            <a href="https://discord.gg/Gx8sdGJkU" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900">
              Become a Member
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-slate-500 dark:text-slate-300 sm:flex-row">
        </div>
      </div>
    </footer>
  );
}

export default Footer;
