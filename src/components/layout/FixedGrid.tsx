

export const FixedGrid = () => {
    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
            {/* ================= STATIC GRAPH/GRID ================= */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ opacity: '0.05' }}
            >
                <defs>
                    <pattern
                        id="global-grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="var(--grid-color)"
                            strokeWidth="1"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#global-grid)" />
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
