import { useState } from 'react';

import OctopusNavbar from "../components/OctopusNavbar";
import Footer from "../components/Footer";
import SplashScreen from '../components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

export function HomePage() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {loading && <SplashScreen key="splash" onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <OctopusNavbar />
      <Footer />
    </>
  );
}

export default HomePage;
