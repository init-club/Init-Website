import { useState, useEffect, useRef } from 'react';
import Abhijith from '../../assets/slideshow/abhijith.jpg';
import Group from '../../assets/slideshow/group.jpg';
import Selfie from '../../assets/slideshow/Selfie.jpg';
import Pic1 from '../../assets/slideshow/pic1.png';
import Rema from '../../assets/slideshow/Rema.jpg';

// Mission sections data
const missionSections = [
  {
    id: 'mission',
    title: 'Our Mission',
    description: 'Initiative that drives innovation forward.',
    fullText: 'Init Club is a student-led open-source community built around the idea of initialization, the first step of turning ideas into working systems. The club serves as a starting point for students to learn, experiment, and collaborate by building projects from the ground up.',
    image: Group,
  },
  {
    id: 'learning',
    title: 'Hands-On Learning',
    description: 'Real workflows, practical experience.',
    fullText: 'We focus on hands-on learning through real development workflows, including version control, code reviews, documentation, testing, and deployment. Members work in collaborative teams to ideate, design, and implement projects, contributing to public repositories and maintaining them over time.',
    image: Selfie,
  },
  {
    id: 'levels',
    title: 'All Skill Levels',
    description: 'From beginners to experts, everyone grows.',
    fullText: 'Init Club welcomes members of all skill levels. Beginners are supported through onboarding tasks, peer-led sessions, and guided contributions, while experienced members mentor others and lead project initiatives. The club follows a structured approach to development through time-bound project seasons.',
    image: Pic1,
  },
  {
    id: 'ecosystem',
    title: 'Open-Source Ecosystem',
    description: 'Contributing to the global community.',
    fullText: 'Beyond building projects, Init Club promotes participation in the global open-source ecosystem by encouraging contributions to external projects and programs such as Hacktoberfest and GSoC. Contributions are tracked and recognized to foster sustained engagement and growth.',
    image: Abhijith,
  },
  {
    id: 'impact',
    title: 'Long-term Impact',
    description: 'Building systems that matter.',
    fullText: 'All projects under Init Club are developed openly, with an emphasis on collaboration, learning, and long-term impact. The goal is not just to write code, but to build reliable systems, share knowledge, and create a supportive environment where ideas evolve into meaningful open-source works.',
    image: Rema,
  },
];

export const MissionSection = () => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const center = (index: number) => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const cards = track.children;
    const card = cards[index] as HTMLElement;
    if (!card) return;

    const size = isMobile() ? 'clientHeight' : 'clientWidth';
    const start = isMobile() ? card.offsetTop : card.offsetLeft;

    wrap.scrollTo({
      [isMobile() ? 'top' : 'left']: start - (wrap[size] / 2 - card[size] / 2),
      behavior: 'smooth'
    });
  };

  const activate = (index: number, shouldScroll = false) => {
    if (index === current) return;
    setCurrent(index);
    if (shouldScroll) {
      setTimeout(() => center(index), 0);
    }
  };

  const go = (step: number) => {
    const newIndex = Math.min(Math.max(current + step, 0), missionSections.length - 1);
    activate(newIndex, true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (isMobile() ? Math.abs(dy) > 60 : Math.abs(dx) > 60) {
      go((isMobile() ? dy : dx) > 0 ? -1 : 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) go(1);
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) go(-1);
    };

    const handleResize = () => center(current);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Initialize position
    setTimeout(() => center(0), 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [current]);

  return (
    <section className="py-16 lg:py-20 bg-[var(--bg)]">
      <style>{`
        .slider-track {
          --gap: 1.25rem;
          --speed: 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          --closed: 7rem;
          --open: 40rem;
          --accent: var(--color-gold, #D4AF37);
        }

        @media (max-width: 767px) {
          .slider-track {
            --closed: 100%;
            --open: 100%;
            --gap: 0.8rem;
          }
        }

        .mission-card {
          position: relative;
          flex: 0 0 var(--closed);
          height: 32rem;
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          transition: flex-basis var(--speed), transform var(--speed);
        }

        .mission-card.active {
          flex-basis: var(--open);
          transform: translateY(-6px);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
        }

        .mission-card-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.3) saturate(30%) blur(3px);
          transition: filter 0.3s, transform var(--speed);
        }

        .mission-card:hover .mission-card-bg {
          filter: brightness(0.3) saturate(30%) blur(3px);
          transform: scale(1.06);
        }

        .mission-card-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.7rem;
          padding: 0;
          background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.85) 100%);
          z-index: 2;
        }

        .mission-card-title {
          color: #fff;
          font-weight: 700;
          font-size: 1.35rem;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          text-align: center;
        }

        .mission-card-thumb,
        .mission-card-desc,
        .mission-card-btn {
          display: none;
        }

        .mission-card.active .mission-card-content {
          flex-direction: row;
          align-items: center;
          padding: 1.2rem 2rem;
          gap: 1.5rem;
        }

        .mission-card.active .mission-card-title {
          writing-mode: horizontal-tb;
          transform: none;
          font-size: 2.4rem;
          margin-bottom: 0.5rem;
        }

        .mission-card.active .mission-card-thumb,
        .mission-card.active .mission-card-desc,
        .mission-card.active .mission-card-btn {
          display: block;
        }

        .mission-card-thumb {
          width: 250px;
          height: 340px;
          border-radius: 0.45rem;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }

        .mission-card-desc {
          color: #ddd;
          font-size: 1rem;
          line-height: 1.4;
          max-width: 20rem;
        }

        .mission-card-btn {
          padding: 0.55rem 1.3rem;
          border: none;
          border-radius: 9999px;
          background: var(--accent);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .mission-card-btn:hover {
          background: #C5A028;
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .mission-card {
            height: auto;
            min-height: 80px;
            flex: 0 0 auto;
            width: 100%;
          }

          .mission-card.active {
            min-height: 600px;
            height: auto;
            transform: none;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .mission-card-content {
            flex-direction: row;
            justify-content: flex-start;
            padding: 1rem;
            align-items: center;
            gap: 1rem;
          }

          .mission-card-title {
            writing-mode: horizontal-tb;
            transform: none;
            font-size: 1.2rem;
            margin: 0 auto;
            text-align: center;
          }

          .mission-card.active .mission-card-content {
            flex-direction: column;
            align-items: flex-start;
            padding: 1.5rem;
          }

          .mission-card.active .mission-card-title {
            font-size: 1.8rem;
            margin-bottom: 1rem;
            align-self: center;
            text-align: center;
          }

          .mission-card.active .mission-card-thumb {
            width: 200px;
            height: 180px;
            align-self: center;
            margin-bottom: 1rem;
          }

          .mission-card.active .mission-card-desc {
            font-size: 0.95rem;
            max-width: 100%;
            margin-bottom: 1rem;
            text-align: center;
          }

          .mission-card.active .mission-card-btn {
            align-self: center;
            width: 100%;
            text-align: center;
            padding: 0.7rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 lg:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-8">
          <div className="flex gap-2 ml-auto order-first md:order-last">
            <button
              onClick={() => go(-1)}
              disabled={current === 0}
              className="w-10 h-10 rounded-full bg-white/12 text-white text-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[var(--color-about)] disabled:opacity-30 disabled:cursor-default disabled:hover:bg-white/12"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              disabled={current === missionSections.length - 1}
              className="w-10 h-10 rounded-full bg-white/12 text-white text-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[var(--color-about)] disabled:opacity-30 disabled:cursor-default disabled:hover:bg-white/12"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="max-w-7xl mx-auto overflow-hidden">
        <div
          ref={wrapRef}
          className="overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={trackRef}
            className="slider-track flex md:flex-row flex-col gap-5 items-start justify-center pb-12 md:pb-12"
            style={{ gap: 'var(--gap)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {missionSections.map((section, index) => (
              <article
                key={section.id}
                className={`mission-card ${index === current ? 'active' : ''}`}
                onClick={() => activate(index, true)}
                onMouseEnter={() => {
                  // Only activate on hover for desktop with hover capability
                  if (window.matchMedia('(hover: hover)').matches) {
                    activate(index, true);
                  }
                }}
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="mission-card-bg"
                />

                <div className="mission-card-content">
                  <div className="flex flex-col items-center md:items-start">
                    <h3 className="mission-card-title font-[Orbitron] text-center">
                      {section.title}
                    </h3>
                    <p className="mission-card-desc font-['Space_Grotesk'] font-bold text-center">
                      {section.description}
                    </p>
                    <p className="mission-card-desc font-['Space_Grotesk'] mt-2 text-sm text-gray-300">
                      {section.fullText}
                    </p>
                  </div>

                  <img
                    src={section.image}
                    alt={section.title}
                    className="mission-card-thumb"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>


    </section>
  );
};
