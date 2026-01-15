import { NavLink } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
];

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram },
];

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Wave Separator */}
      <div className="absolute -top-12 left-0 right-0 h-12 overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--glass-bg)"
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* Footer Content - Solid background*/}
      <div className="relative z-20 pt-16 pb-8" style={{ background: 'var(--ocean-deep, #041525)' }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-[1.2fr,1fr,1fr]">

            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 p-2 shadow-lg shadow-cyan-500/20">
                  <span className="font-mono text-sm font-bold text-white">{'<I/>'}</span>
                </div>
                <span className="text-xl font-bold text-[var(--text)]">Init Club</span>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed max-w-xs">
                Empowering innovation through open-source collaboration.
                Where ideas turn into impact.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex gap-3">
                {socials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-[var(--accent)] hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20"
                      aria-label={item.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-[var(--muted)]">
                Amrita Vishwa Vidyapeetham, Coimbatore
              </p>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Navigate
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-300 py-1"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <h3 className="text-lg font-bold text-[var(--text)]">
                Join Our Community
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Stay updated with events, workshops, and showcases.
              </p>
              <a
                href="https://discord.gg/Gx8sdGJkU"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 glass-button"
              >
                Become a Member
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <p>© {new Date().getFullYear()} Init Club. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Made with <span className="text-red-400">♥</span> by Init Club
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
