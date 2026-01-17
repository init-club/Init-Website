import { motion } from 'framer-motion';

interface GraphBackgroundProps {
    isMobile?: boolean;
    filtersEnabled?: boolean;
}

export const GraphBackground = ({ isMobile = false, filtersEnabled = true }: GraphBackgroundProps) => {
    // On mobile, fade in the color-shift effects when filters enable
    const orbOpacity = (isMobile && !filtersEnabled) ? 0.3 : 1;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">

            {/* ================= ORBS (ROAMING + COLOR SHIFT + CLAMPED) ================= */}

            <motion.div
                className="absolute inset-0"
                animate={{ opacity: orbOpacity }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 30% 20%, rgba(0,255,255,0.06), transparent 60%)',
                        animation: (isMobile && !filtersEnabled)
                            ? 'orb1 26s ease-in-out infinite alternate, orbFade 11s ease-in-out infinite'
                            : 'orb1 26s ease-in-out infinite alternate, hueShift1 18s linear infinite, orbFade 11s ease-in-out infinite'
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.06), transparent 60%)',
                        animation: (isMobile && !filtersEnabled)
                            ? 'orb2 34s ease-in-out infinite alternate, orbFade 13s ease-in-out infinite'
                            : 'orb2 34s ease-in-out infinite alternate, hueShift2 26s linear infinite, orbFade 13s ease-in-out infinite'
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 50% 55%, rgba(34,255,242,0.06), transparent 60%)',
                        animation: (isMobile && !filtersEnabled)
                            ? 'orb3 28s ease-in-out infinite alternate, orbFade 10s ease-in-out infinite'
                            : 'orb3 28s ease-in-out infinite alternate, hueShift3 20s linear infinite, orbFade 10s ease-in-out infinite'
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 80% 75%, rgba(59,130,246,0.06), transparent 60%)',
                        animation: (isMobile && !filtersEnabled)
                            ? 'orb4 40s ease-in-out infinite alternate, orbFade 15s ease-in-out infinite'
                            : 'orb4 40s ease-in-out infinite alternate, hueShift4 32s linear infinite, orbFade 15s ease-in-out infinite'
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at 20% 80%, rgba(255,51,85,0.06), transparent 60%)',
                        animation: (isMobile && !filtersEnabled)
                            ? 'orb5 30s ease-in-out infinite alternate, orbFade 12s ease-in-out infinite'
                            : 'orb5 30s ease-in-out infinite alternate, hueShift5 24s linear infinite, orbFade 12s ease-in-out infinite'
                    }}
                />
            </motion.div>

            {/* ================= INFINITE GRID ================= */}

            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 800"
                preserveAspectRatio="none"
                style={{ opacity: 'var(--grid-opacity)' }}
            >
                <defs>
                    <pattern
                        id="grid"
                        width="32"
                        height="32"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 32 0 L 0 0 0 32"
                            fill="none"
                            stroke="var(--grid-color)"
                            strokeWidth="1"
                        />

                        {/* Pattern animation = infinite illusion */}
                        <animateTransform
                            attributeName="patternTransform"
                            type="translate"
                            from="0 0"
                            to="-32 -32"
                            dur="80s"
                            repeatCount="indefinite"
                        />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* ================= SCANNER LINES ================= */}

            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(120deg, transparent 48%, rgba(0,255,255,0.02) 50%, transparent 52%)',
                    animation: 'scannerMove 14s linear infinite'
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(120deg, transparent 48%, rgba(168,85,247,0.018) 50%, transparent 52%)',
                    animation: 'scannerMove 14s linear infinite',
                    animationDelay: '2s'
                }}
            />
        </div>
    );
};
