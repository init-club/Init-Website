import { useState, useEffect } from 'react';

import OctopusNavbar from "../components/OctopusNavbar";
import Footer from "../components/Footer";
import SplashScreen from '../components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

export function HomePage() {
  const [loading, setLoading] = useState(true);

  // Mobile detection - hide footer on mobile
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {loading && <SplashScreen key="splash" onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <OctopusNavbar />
      {/* Footer only on desktop */}
      {!isMobile && <Footer />}
    </>
  );
}

export default HomePage;
