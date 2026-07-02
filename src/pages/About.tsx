import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  HeroSection,
  MissionSection,
  CoreValuesSection,
  TeamSection,
} from '../components/about';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-24 min-h-screen overflow-x-hidden"
      >
        <HeroSection />
        <MissionSection />
        <CoreValuesSection />
        <TeamSection />
      </motion.main>
      <Footer />
    </>
  );
}

