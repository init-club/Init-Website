import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import Bubbles from "./Bubbles";

export default function OctopusNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(true);

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
    const head = document.querySelector(".octopus-head");
    const links = document.querySelectorAll(".octopus-tentacle");

    if (!pathsGroup || !head) return;

    const SEGMENTS = 24;
    const tentacles: any[] = [];
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const getOrigin = () => {
      const rect = head.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.66,
      };
    };

    // Initialize tentacle paths
    links.forEach(() => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "tentacle-path");
      pathsGroup.appendChild(path);

      tentacles.push({
        path,
        points: Array.from({ length: SEGMENTS }, () => ({ x: 0, y: 0 })),
        phase: Math.random() * Math.PI * 2,
      });
    });

    // Handle scroll events
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Reset after scroll ends
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);

    // Animation loop
    const animate = (timestamp: number) => {
      const base = getOrigin();

      tentacles.forEach((tentacle, index) => {
        const linkRect = (links[index] as HTMLElement).getBoundingClientRect();
        const targetX = linkRect.left + linkRect.width / 2;
        const targetY = linkRect.top + linkRect.height / 2;

        tentacle.points[0].x = base.x;
        tentacle.points[0].y = base.y;

        for (let j = 1; j < SEGMENTS; j++) {
          const progress = j / (SEGMENTS - 1);
          const curl = Math.sin(timestamp * 0.002 + tentacle.phase + j * 0.35) * 22 * progress;
          const interpolatedX = base.x + (targetX - base.x) * progress + curl;
          const interpolatedY = base.y + (targetY - base.y) * progress;

          tentacle.points[j].x += (interpolatedX - tentacle.points[j].x) * 0.14;
          tentacle.points[j].y += (interpolatedY - tentacle.points[j].y) * 0.14;
        }

        const pathData = tentacle.points.map((point: any, idx: number) => 
          `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        
        tentacle.path.setAttribute("d", pathData);
      });

      return requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      pathsGroup.innerHTML = '';
    };
  }, [showSplash, isHome]);

  if (!isHome) return null;

  // Theme-based styling
  const bgStyle = isDark 
    ? { background: 'radial-gradient(circle at top, #0f1722 0%, #0b0f14 60%)' }
    : { background: 'radial-gradient(circle at top, #f8fafc 0%, #e2e8f0 60%)' };
  
  const navBgClass = isDark 
    ? 'bg-slate-900/70 border-white/10' 
    : 'bg-white/70 border-slate-200/70';

  const tentacleBgClass = isDark
    ? 'bg-slate-900 bg-opacity-95 text-gray-200'
    : 'bg-slate-100 bg-opacity-95 text-gray-950';

  // Tentacle navigation items (6 evenly distributed in a circle)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const tentacleDistance = isMobile ? 95 : 140;
  
  const tentacles = [
    { label: 'Home', path: '/', angle: 270 },
    { label: 'About Us', path: '/about', angle: 235 },
    { label: 'Projects', path: '/projects', angle: 200 },
    { label: 'Contact Us', path: '/contact', angle: 160 },
    { label: 'Blogs', path: '/blogs', angle: 125 },
    { label: 'Events', path: '/events', angle: 90 },
  ];

  const calculatePosition = (angle: number, distance: number) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radians) * distance,
      y: Math.sin(radians) * distance,
    };
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* Splash Screen */}
      {showSplash && (
        <div className="splash-before fixed inset-0 bg-black flex items-center justify-center z-30">
          <img 
            src="/logo-dark.png" 
            alt="INIT Logo" 
            className="splash-img w-32 h-32 sm:w-44 sm:h-44 object-cover rounded-full bg-black p-3 z-10"
          />
        </div>
      )}

      {/* Main Content */}
      {!showSplash && (
        <>
          {/* Navigation Header */}
          <header className={`fixed top-0 z-40 w-full border-b ${navBgClass} backdrop-blur`}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
              <button
                onClick={() => navigate('/')}
                className="rounded-2xl bg-slate-900/95 px-3 sm:px-4 py-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-0"
                aria-label="Navigate to home"
              >
                <span className="font-mono text-sm sm:text-lg tracking-wide text-cyan-300">
                  {'<Init Club />'}
                </span>
              </button>
              <ThemeToggle />
            </div>
          </header>

          <Bubbles/>
          
          {/* SVG Tentacle Paths */}
          <svg className="fixed inset-0 w-screen h-screen pointer-events-none z-10">
            <defs>
              <linearGradient id="tentacleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? "#4da3ff" : "#0ea5e9"} />
                <stop offset="50%" stopColor={isDark ? "#2b6cb0" : "#0284c7"} />
                <stop offset="100%" stopColor={isDark ? "#1e3a5f" : "#0369a1"} />
              </linearGradient>
            </defs>
            <g id="tentacle-paths"></g>
          </svg>

          {/* Hero Section */}
          <div className="relative min-h-screen flex flex-col items-center justify-center text-center z-20 gap-6 sm:gap-8 px-4 py-8 sm:py-12 pt-24 sm:pt-20">
            <h1 className={`font-poppins font-bold text-3xl sm:text-4xl md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              The INIT Club
            </h1>

            {/* Octopus Container */}
            <div className="octopus-before relative w-56 h-64 sm:w-72 md:w-80 md:h-96 mx-auto z-20">
              <div className="octopus-head absolute w-32 h-28 sm:w-40 md:w-52 md:h-48 mx-auto inset-x-0 z-50 pointer-events-none" />

              {/* Tentacle Navigation Buttons */}
              {tentacles.map((tentacle) => {
                const position = calculatePosition(tentacle.angle, tentacleDistance);
                return (
                  <button
                    key={tentacle.path}
                    onClick={handleNavigation(tentacle.path)}
                    onTouchStart={handleNavigation(tentacle.path)}
                    className={`octopus-tentacle absolute px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 text-xs sm:text-sm md:text-xs ${tentacleBgClass} rounded-xl sm:rounded-2xl cursor-pointer z-40 whitespace-nowrap border-0`}
                    style={{ 
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                      left: '50%',
                      top: '50%',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    aria-label={`Navigate to ${tentacle.label}`}
                  >
                    {tentacle.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
