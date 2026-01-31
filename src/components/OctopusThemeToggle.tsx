import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export function OctopusThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 pointer-events-auto"
            style={{
                backgroundColor: 'var(--surface)',
                boxShadow: `0 0 15px var(--shadow-glow)`,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Background glow effect */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Octopus images with smooth transition */}
            <AnimatePresence mode="wait">
                {isDark ? (
                    <motion.img
                        key="dark-octopus"
                        src="/octopus-dark.png"
                        alt="Dark mode octopus"
                        className="absolute inset-0 w-full h-full object-contain p-1 sm:p-1.5"
                        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                ) : (
                    <motion.img
                        key="light-octopus"
                        src="/octopus-light.png"
                        alt="Light mode octopus"
                        className="absolute inset-0 w-full h-full object-contain p-1 sm:p-1.5"
                        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                )}
            </AnimatePresence>

            {/* Tentacle wiggle animation overlay */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    rotate: [0, 2, -2, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </motion.button>
    );
}

export default OctopusThemeToggle;
