import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function OctopusNavbar() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setShowSplash(false);
      return;
    }

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(splashTimer);
  }, [isHome]);

  useEffect(() => {
    if (showSplash || !isHome) return;

    const pathsGroup = document.getElementById("tentacle-paths");
    const head = document.querySelector(".octopus-head");
    const links = document.querySelectorAll(".octopus-tentacle");

    if (!pathsGroup || !head) return;

    const SEGMENTS = 24;
    const tentacles: any[] = [];
    let animationFrameId: number;

    function getOrigin() {
      const r = head!.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height * 0.66,
      };
    }

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

    function animate(t: number) {
      const base = getOrigin();

      tentacles.forEach((tn, i) => {
        const r = (links[i] as HTMLElement).getBoundingClientRect();
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;

        tn.points[0].x = base.x;
        tn.points[0].y = base.y;

        for (let j = 1; j < SEGMENTS; j++) {
          const k = j / (SEGMENTS - 1);
          const curl = Math.sin(t * 0.002 + tn.phase + j * 0.35) * 22 * k;
          const ix = base.x + (tx - base.x) * k + curl;
          const iy = base.y + (ty - base.y) * k;

          tn.points[j].x += (ix - tn.points[j].x) * 0.14;
          tn.points[j].y += (iy - tn.points[j].y) * 0.14;
        }

        let d = `M ${tn.points[0].x} ${tn.points[0].y}`;
        for (let j = 1; j < SEGMENTS; j++) {
          d += ` L ${tn.points[j].x} ${tn.points[j].y}`;
        }
        tn.path.setAttribute("d", d);
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      pathsGroup.innerHTML = '';
    };
  }, [showSplash, isHome]);

  if (isHome) {
    return (
      <>
        {showSplash && (
          <div className="splash-before fixed inset-0 bg-black flex items-center justify-center z-30">
            <img 
              src="/logo-dark.png" 
              alt="INIT Logo" 
              className="splash-img w-44 h-44 object-cover rounded-full bg-black p-3 z-10"
            />
          </div>
        )}

        {!showSplash && (
          <>
            <svg className="fixed inset-0 w-screen h-screen pointer-events-none z-10">
              <defs>
                <linearGradient id="tentacleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4da3ff" />
                  <stop offset="50%" stopColor="#2b6cb0" />
                  <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
              </defs>
              <g id="tentacle-paths"></g>
            </svg>

            <div className="relative min-h-screen flex flex-col items-center justify-center text-center z-20 gap-8 px-2 py-8 md:px-0 md:py-0 md:gap-8">
              <h1 className="font-poppins font-bold text-4xl md:text-5xl text-white">
                The INIT Club
              </h1>

              <div 
                className="octopus-before relative w-80 h-96 md:w-80 md:h-96 mx-auto z-20"
                style={{ transform: 'scale(1.45)', transformOrigin: 'center' }}
              >
                <div 
                  className="octopus-head absolute w-52 h-48 md:w-52 md:h-48 mx-auto inset-x-0 z-50 pointer-events-none"
                />

                <a
                  href="#github"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '150px', left: '-20px' }}
                >
                  GitHub
                </a>

                <a
                  href="#docs"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '200px', left: '-55px' }}
                >
                  Docs
                </a>

                <a
                  href="#blog"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '250px', left: '-20px' }}
                >
                  Blog
                </a>

                <a
                  href="#community"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '295px', left: '55px' }}
                >
                  Community
                </a>

                <a
                  href="#discord"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '150px', right: '-20px' }}
                >
                  Discord
                </a>

                <a
                  href="#events"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '200px', right: '-55px' }}
                >
                  Events
                </a>

                <a
                  href="#tools"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '250px', right: '-20px' }}
                >
                  Tools
                </a>

                <a
                  href="#tutorials"
                  className="octopus-tentacle absolute px-3 py-1 md:px-3 md:py-1 text-xs md:text-xs bg-slate-900 bg-opacity-95 rounded-2xl text-gray-200 cursor-pointer z-40 no-underline whitespace-nowrap"
                  style={{ top: '295px', right: '55px' }}
                >
                  Tutorials
                </a>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return null;
}
