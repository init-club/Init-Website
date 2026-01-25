import { NavLink } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';
import { Discord } from 'react-bootstrap-icons';
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
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/the-init-club/', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram },
  { label: 'Discord', href: 'https://discord.gg/Gx8sdGJkU', icon: Discord },
];

export function Footer() {
  return (
    <footer className="relative mt-0 hidden md:block">


      {/* Footer Content - Solid background*/}
      <div className="relative z-20 pt-12 sm:pt-16 pb-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.2fr,1fr,1fr]">

            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors">
                  <span className="font-mono text-xs sm:text-sm font-bold whitespace-nowrap text-[#E5E5E5] group-hover:text-[#D4AF37] transition-colors">{'<Init Club/>'}</span>
                </div>
              </div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed max-w-xs">
                <span className="text-[var(--text)] font-medium ">Where Curiosity Turns into Contribution</span>
              </p>
              <p className="mt-2 text-[10px] sm:text-xs text-[var(--muted)]">
                Amrita CBE's Open Source Community
              </p>

              {/* Social Links */}
              <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
                {socials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl glass transition-all duration-300 hover:scale-105"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#D4AF37';
                        e.currentTarget.style.color = 'black';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </a>
                  );
                })}
              </div>

              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-[var(--muted)]">
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
              <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Navigate
              </h3>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-1 sm:gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="text-xs sm:text-sm font-medium transition-colors duration-300 py-1"
                    style={({ isActive }) => ({
                      color: isActive ? '#D4AF37' : 'var(--text)'
                    })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#D4AF37';
                    }}
                    onMouseLeave={(e) => {
                      if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.webkitBackgroundClip = '';
                        e.currentTarget.style.webkitTextFillColor = '';
                        e.currentTarget.style.backgroundClip = '';
                      }
                    }}
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
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">
                Join Our Community
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
                Stay updated with events, workshops, and showcases.
              </p>
              <motion.a
                href="https://discord.gg/Gx8sdGJkU"
                target="_blank"
                rel="noreferrer"
                className="group relative mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl glass overflow-hidden font-medium text-xs sm:text-sm whitespace-nowrap"
                style={{ color: 'var(--text)' }}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  initial: { scale: 1 },
                  hover: { scale: 1.05 },
                  tap: { scale: 0.95 }
                }}
              >
                {/* Laser Fill Animation */}
                {/* Text Content */}
                <span className="relative z-10 flex items-center gap-2">
                  Become a Member
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </motion.a>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          {/* <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <p>© {new Date().getFullYear()} Init Club. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Made with <span className="text-red-400">♥</span> by Init Club
            </p>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
