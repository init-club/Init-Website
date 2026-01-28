interface GraphBackgroundProps {
    isMobile?: boolean;
}

export const GraphBackground = ({ isMobile = false }: GraphBackgroundProps) => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">

            {/* ================= ORBS (ROAMING + COLOR SHIFT + CLAMPED) ================= */}

            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 30% 20%, rgba(0,255,255,0.06), transparent 60%)',
                    animation: isMobile
                        ? 'orb1 26s ease-in-out infinite alternate, orbFade 11s ease-in-out infinite'
                        : 'orb1 26s ease-in-out infinite alternate, hueShift1 18s linear infinite, orbFade 11s ease-in-out infinite'
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.06), transparent 60%)',
                    animation: isMobile
                        ? 'orb2 34s ease-in-out infinite alternate, orbFade 13s ease-in-out infinite'
                        : 'orb2 34s ease-in-out infinite alternate, hueShift2 26s linear infinite, orbFade 13s ease-in-out infinite'
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 55%, rgba(34,255,242,0.06), transparent 60%)',
                    animation: isMobile
                        ? 'orb3 28s ease-in-out infinite alternate, orbFade 10s ease-in-out infinite'
                        : 'orb3 28s ease-in-out infinite alternate, hueShift3 20s linear infinite, orbFade 10s ease-in-out infinite'
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 80% 75%, rgba(59,130,246,0.06), transparent 60%)',
                    animation: isMobile
                        ? 'orb4 40s ease-in-out infinite alternate, orbFade 15s ease-in-out infinite'
                        : 'orb4 40s ease-in-out infinite alternate, hueShift4 32s linear infinite, orbFade 15s ease-in-out infinite'
                }}
            />

            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 20% 80%, rgba(255,51,85,0.06), transparent 60%)',
                    animation: isMobile
                        ? 'orb5 30s ease-in-out infinite alternate, orbFade 12s ease-in-out infinite'
                        : 'orb5 30s ease-in-out infinite alternate, hueShift5 24s linear infinite, orbFade 12s ease-in-out infinite'
                }}
            />

        </div>
    );
};
