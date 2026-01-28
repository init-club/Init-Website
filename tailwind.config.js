/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        text: 'var(--text)',
        accent: 'var(--accent)',
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'card-hover': 'var(--card-hover)',
        muted: 'var(--muted)',
        'grid-color': 'var(--grid-color)',
        neutral: 'var(--color-neutral)',
        about: 'var(--color-about)',
        projects: 'var(--color-projects)',
        events: 'var(--color-events)',
        blogs: 'var(--color-blogs)',
        contact: 'var(--color-contact)',
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      backgroundImage: {
        octohead: 'url("/octohead.png")',
        'gradient-brand': 'linear-gradient(135deg, #00ffd5, #a855f7)',
        'gradient-brand-horizontal': 'linear-gradient(90deg, #00ffd5, #a855f7)',
      },
      animation: {
        powerOn: 'powerOn 1.8s ease forwards',
        glowPulse: 'glowPulse 1.8s ease-out forwards',
      },
      keyframes: {
        powerOn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '40%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.98)' },
          '100%': { opacity: '0', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '60%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

