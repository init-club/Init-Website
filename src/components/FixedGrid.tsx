import React from 'react';

export const FixedGrid = () => {
    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
            {/* ================= INFINITE GRID ================= */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 'var(--grid-opacity)' }}
            >
                <defs>
                    <pattern
                        id="global-grid"
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
                <rect width="100%" height="100%" fill="url(#global-grid)" />
            </svg>

            {/* ================= SCANNER LINES (Optional - keeping them global makes sense too) ================= */}
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
