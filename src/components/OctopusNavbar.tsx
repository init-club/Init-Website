import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const tentacles = [
  { angle: 260, label: "Home", path: "/" },
  { angle: 228, label: "About Us", path: "/about" },
  { angle: 200, label: "Projects", path: "/projects" },
  { angle: 160, label: "Contact Us", path: "/contact" },
  { angle: 132, label: "Blogs", path: "/blogs" },
  { angle: 100, label: "Events", path: "/events" },
];

const calculatePosition = (angle: number, distance: number) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  };
};

export default function OctopusNavbar() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === "/";

  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || !stored;
  });

  // Reactive tentacle distance based on viewport
  const [tentacleDistance, setTentacleDistance] = useState(() => {
    if (typeof window === 'undefined') return 260;
    return window.innerWidth < 640 ? 140 : window.innerWidth < 768 ? 180 : 260;
  });

  useEffect(() => {
    const updateDistance = () => {
      setTentacleDistance(window.innerWidth < 640 ? 140 : window.innerWidth < 768 ? 180 : 260);
    };

    window.addEventListener('resize', updateDistance);
    return () => window.removeEventListener('resize', updateDistance);
  }, []);

  // Theme detection and synchronization
  useEffect(() => {
    const checkTheme = () => {
      const stored = localStorage.getItem('theme');
      setIsDark(stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches));
    };

    checkTheme();
    window.addEventListener('storage', checkTheme);

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('storage', checkTheme);
      observer.disconnect();
    };
  }, []);

  // Eye Tracking Logic - THROTTLED for performance
  useEffect(() => {
    if (showSplash) return;

    let lastMoveTime = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < 16) return;
      lastMoveTime = now;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const eyes = containerRef.current.querySelectorAll('.octo-eye');

        eyes.forEach((eye) => {
          const rect = eye.getBoundingClientRect();
          const eyeCenterX = rect.left + rect.width / 2;
          const eyeCenterY = rect.top + rect.height / 2;
          const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
          const distance = Math.min(rect.width / 4, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 12);

          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          const pupil = eye.querySelector('.octo-pupil') as HTMLElement;
          if (pupil) {
            pupil.style.transform = `translate(${x}px, ${y}px)`;
          }
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [showSplash]);

  // Splash screen timer
  useEffect(() => {
    if (!isHome) {
      setShowSplash(false);
      return;
    }

    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, [isHome]);

  // Tentacle animation effect 
  useEffect(() => {
    if (showSplash || !isHome) return;

    const pathsGroup = document.getElementById("tentacle-paths");
    const heroSection = document.querySelector(".octopus-hero-section");
    const container = document.querySelector(".octopus-container");
    const tentacleEnds = document.querySelectorAll(".tentacle-end");

    if (!pathsGroup || !heroSection || !container) return;

    const SEGMENTS = 24;
    const tentacleStates: any[] = [];

    // Get positions relative to hero section (not viewport)
    const getRelativePosition = (element: Element) => {
      const heroRect = heroSection.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      return {
        x: elemRect.left - heroRect.left + elemRect.width / 2,
        y: elemRect.top - heroRect.top + elemRect.height / 2,
      };
    };

    const getOrigin = () => {
      const heroRect = heroSection.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        x: containerRect.left - heroRect.left + containerRect.width / 2,
        y: containerRect.top - heroRect.top + containerRect.height * 0.35,
      };
    };

    // Initialize tentacle paths
    tentacleEnds.forEach((end, i) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "tentacle-path");
      path.setAttribute("data-index", String(i));
      pathsGroup.appendChild(path);

      const origin = getOrigin();
      const target = getRelativePosition(end);

      tentacleStates.push({
        path,
        points: Array.from({ length: SEGMENTS }, (_, j) => {
          const progress = j / (SEGMENTS - 1);
          return {
            x: origin.x + (target.x - origin.x) * progress,
            y: origin.y + (target.y - origin.y) * progress,
          };
        }),
        phase: Math.random() * Math.PI * 2,
      });
    });

    let isAnimating = true;

    // Animation loop
    const animate = (timestamp: number) => {
      if (!isAnimating) return;

      const origin = getOrigin();

      tentacleStates.forEach((tentacle, index) => {
        const end = tentacleEnds[index];
        if (!end) return;

        const target = getRelativePosition(end);

        tentacle.points[0].x = origin.x;
        tentacle.points[0].y = origin.y;

        for (let j = 1; j < SEGMENTS; j++) {
          const progress = j / (SEGMENTS - 1);
          const curl = Math.sin(timestamp * 0.002 + tentacle.phase + j * 0.35) * 22 * progress;
          tentacle.points[j].x = origin.x + (target.x - origin.x) * progress + curl;
          tentacle.points[j].y = origin.y + (target.y - origin.y) * progress;
        }

        const pathData = tentacle.points.map((point: any, idx: number) =>
          `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');

        tentacle.path.setAttribute("d", pathData);
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      isAnimating = false;
      cancelAnimationFrame(animationId);
      pathsGroup.innerHTML = '';
    };
  }, [showSplash, isHome]);

  if (!isHome) return null;

  // Theme-based styling 
  const bgStyle = isDark
    ? {
      background: `linear-gradient(180deg, 
          #0a4a5c 0%,
          #073a4d 8%,
          #052c3d 18%,
          #041f2d 30%,
          #031620 45%,
          #020e15 60%,
          #01090d 80%,
          #000507 100%
        )`
    }
    : {
      background: `linear-gradient(180deg, 
          #87ceeb 0%,
          #5fb8d9 10%,
          #4aa8c9 20%,
          #3a98b9 35%,
          #2a7a9a 50%,
          #1a5c7a 70%,
          #0e3e5a 90%,
          #062033 100%
        )`
    };

  return (
    <div className="min-h-screen relative overflow-hidden" ref={containerRef} style={bgStyle}>
      {/* Caustic Light Patterns */}
      <div className="caustic-light"></div>

      {/* Gradient Shift / Ocean Current */}
      <div className="gradient-shift"></div>

      {/* Light Rays from Surface */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        <div className="light-ray" style={{ left: '10%' }}></div>
        <div className="light-ray" style={{ left: '30%', animationDelay: '2s' }}></div>
        <div className="light-ray" style={{ left: '55%', animationDelay: '4s' }}></div>
        <div className="light-ray" style={{ left: '80%', animationDelay: '6s' }}></div>
      </div>

      {/* Swimming Fish */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 6 }}>
        <div className="fish" style={{ top: '15%', animationDelay: '0s' }}></div>
        <div className="fish" style={{ top: '25%', animationDelay: '3s', transform: 'scale(0.6)' }}></div>
        <div className="fish" style={{ top: '35%', animationDelay: '7s', transform: 'scale(0.8)' }}></div>
        <div className="fish" style={{ top: '50%', animationDelay: '2s', transform: 'scale(1.1)' }}></div>
        <div className="fish" style={{ top: '60%', animationDelay: '9s', transform: 'scale(0.7)' }}></div>
        <div className="fish" style={{ top: '75%', animationDelay: '5s', transform: 'scale(1.3)' }}></div>
        <div className="fish" style={{ top: '85%', animationDelay: '12s', transform: 'scale(0.5)' }}></div>
      </div>

      {/* Main Content */}
      {!showSplash && (
        <>
          {/* Navigation Header*/}
          <header className="fixed top-0 left-0 right-0 z-40">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <div className="glass rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="group flex items-center gap-2"
                    aria-label="Navigate to home"
                  >
                    <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 p-2 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
                      <span className="font-mono text-sm font-bold text-white">{'<Init Club/>'}</span>
                    </div>

                  </button>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <div className="octopus-hero-section relative w-full min-h-screen flex flex-col items-center justify-center text-center gap-6 sm:gap-8 px-4 py-8 sm:py-12 pt-24 sm:pt-20" style={{ zIndex: 20 }}>

            {/* SVG Tentacle Paths */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: 'visible', zIndex: 10 }}
            >
              <defs>
                <linearGradient id="tentacleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? "#22d3ee" : "#0891b2"} />
                  <stop offset="50%" stopColor={isDark ? "#0891b2" : "#0e7490"} />
                  <stop offset="100%" stopColor={isDark ? "#083344" : "#164e63"} />
                </linearGradient>
              </defs>
              <g id="tentacle-paths"></g>
            </svg>

            {/* Octopus Entity - Head + Tentacles */}
            <div
              className="relative"
              style={{ zIndex: 25 }}
            >
              {/* Octopus Container */}
              <div className="octopus-container relative w-80 h-80 sm:w-96 sm:h-96 mx-auto -mt-12 overflow-visible" style={{ zIndex: 30 }}>
                {/* Head Layer*/}
                <div
                  className="octopus-head absolute left-1/2 -translate-x-1/2 -top-8 w-40 h-40 sm:w-48 sm:h-48 cursor-pointer"
                  style={{ zIndex: 50 }}
                >
                  <div className="octo-body">
                    <div className="octo-eye octo-eye-left"><div className="octo-pupil"></div></div>
                    <div className="octo-eye octo-eye-right"><div className="octo-pupil"></div></div>
                  </div>
                </div>

                {/* Tentacle End Points*/}
                {tentacles.map((tentacle, index) => {
                  const position = calculatePosition(tentacle.angle, tentacleDistance);
                  return (
                    <div
                      key={index}
                      className="tentacle-end absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                        zIndex: 40,
                      }}
                    >
                      <Link
                        to={tentacle.path}
                        className="tentacle-link"
                        aria-label={`Navigate to ${tentacle.label}`}
                      >
                        {tentacle.label}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
