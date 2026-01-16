/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
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
      backgroundImage: {
        octohead: 'url("/octohead.png")',
      },
    },
  },
  plugins: [],
}

