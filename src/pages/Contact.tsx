import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import JoinUsModal from '../components/JoinUsModal.tsx';
import { motion } from 'framer-motion';
import { Zap, Github, Brain, Users, Flame, Code2, Target, Lightbulb } from 'lucide-react';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const spiritItems = [
    {
      icon: Zap,
      title: 'Curiosity Driven',
      description: 'We\'re obsessed with the "why" before the "how". Questions spark innovation.'
    },
    {
      icon: Github,
      title: 'Open Source Philosophy',
      description: 'Code transparency, knowledge sharing, community-first mentality.'
    },
    {
      icon: Brain,
      title: 'Problem Solvers',
      description: 'We don\'t memorize solutions. We think, debug, and innovate.'
    },
    {
      icon: Users,
      title: 'Collectively Stronger',
      description: 'Your success lifts everyone. Mentorship is bidirectional.'
    },
  ];

  const journeySteps = [
    {
      phase: 'Entry',
      title: 'The Foundation',
      description: 'Prove you\'re hungry. Complete initial challenges that test your problem-solving mindset, not just your code.',
      icon: Lightbulb
    },
    {
      phase: 'Growth',
      title: 'The Grind',
      description: 'Build real projects. Learn deployment. Debug real issues. Mentors guide, but you drive.',
      icon: Flame
    },
    {
      phase: 'Leadership',
      title: 'The Mentor',
      description: 'Help others navigate the path you\'ve walked. Teaching solidifies mastery.'
    },
    {
      phase: 'Legacy',
      title: 'The Architect',
      description: 'Shape Init Club\'s future. Influence decisions. Define what comes next.'
    },
  ];

  const truthBombs = [
    {
      bold: 'You MUST be an Amrita CBE student',
      normal: ' - No remote members, no exceptions. This is our community.'
    },
    {
      bold: 'You MUST commit time',
      normal: ' - We\'re not a resume line. We\'re a lifestyle change.'
    },
    {
      bold: 'You MUST own your growth',
      normal: ' - We guide, but you lead. Self-learning is non-negotiable.'
    },
    {
      bold: 'You MUST play by our rules',
      normal: ' - Plagiarism = disqualification. Integrity is everything.'
    },
  ];

  const youWillGain = [
    { icon: Code2, text: 'Build and ship that delivers value' },
    { icon: Target, text: 'Build a portfolio that lands interviews' },
    { icon: Brain, text: 'Master concepts that matter in practice' },
    { icon: Users, text: 'Join a network of builders, not just students' },
    { icon: Zap, text: 'Solve complex problems efficiently and correctly' },
    { icon: Github, text: 'Contribute to real open-source projects' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

        {/* Hero Section - Radical Reframing */}
        <section className="relative px-4 py-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>
              <span style={{ color: 'var(--text)' }}>The &lt; </span>
              <span
                style={{
                  color: 'var(--primary)',
                }}
              >
                INIT
              </span>
              <span style={{ color: 'var(--text)' }}> Club /&gt;</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--primary-light)] mb-4 font-semibold">Not just a club. A transformation.</p>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              We don't recruit. We onboard builders. Not everyone will fit. Not everyone should.
              <br className="hidden sm:block" />
              If you're here, you're ready to level up or curious. Both are good enough.
            </p>

            {/* CTA Button with Laser Animation */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-3 rounded-xl font-semibold mb-20 border border-[var(--primary)]/30 overflow-hidden"
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 origin-left"
                style={{ backgroundColor: 'var(--primary)' }}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 }
                }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_var(--primary)]"
                variants={{
                  initial: { left: '0%', opacity: 0 },
                  hover: { left: '100%', opacity: 1 }
                }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white" style={{ color: 'var(--text)' }}>
                Check if you fit
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </motion.button>
          </motion.div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 blur-3xl rounded-full" />
        </section>

        {/* The Spirit Section */}
        <section className="max-w-6xl mx-auto px-4 mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                The Init Club Spirit
              </h2>
              <p className="text-gray-400 text-lg">What we stand for. Not rules. Not requirements. Just... us.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {spiritItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative p-6 rounded-xl border border-[var(--primary)]/20 hover:border-[var(--primary)] transition-all bg-[var(--bg-secondary)]"
                >
                  <item.icon size={32} className="text-[var(--primary)] mb-4 group-hover:text-[var(--accent)] transition-colors" />
                  <h3 className="text-lg font-bold text-[var(--primary-light)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* The Real Talk Section */}
        <section className="max-w-6xl mx-auto px-4 mb-24 relative">
          <div
            className="absolute inset-0 rounded-3xl border border-[var(--primary)]/10 -z-10 bg-[var(--bg-secondary)]"
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              The Real Talk
            </h2>
            <p className="text-center text-gray-400 mb-12 text-lg">What you actually need to succeed here.</p>

            <div className="space-y-6">
              {truthBombs.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-4 items-start p-4 rounded-lg border border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all"
                >
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base">
                    <span className="text-[var(--primary-light)] font-bold">{item.bold}</span>
                    <span className="text-[var(--text-secondary)]">{item.normal}</span>
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Your Transformation Journey */}
        <section className="max-w-6xl mx-auto px-4 mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Your Transformation Journey
              </h2>
              <p className="text-gray-400 text-lg">What the path actually looks like.</p>
            </div>

            <div className="space-y-8">
              {journeySteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative flex gap-6 group"
                >
                  {/* Timeline Line */}
                  {idx !== journeySteps.length - 1 && (
                    <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-[var(--primary)]/20" />
                  )}

                  {/* Icon Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center border-2 border-[var(--bg-primary)] relative z-10">
                      {step.icon ? <step.icon size={24} className="text-white" /> : <span className="text-white font-bold">{idx + 1}</span>}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">{step.phase}</p>
                    <h3 className="text-xl font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* What You'll Gain */}
        <section className="max-w-6xl mx-auto px-4 mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                What You'll Actually Gain
              </h2>
              <p className="text-gray-400 text-lg">Tangible skills. Not just certificates.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youWillGain.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-4 rounded-lg border border-[var(--primary)]/10 hover:border-[var(--primary)]/40 hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <item.icon size={24} className="text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                  <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Sound like you?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              If you see yourself in this-if you're hungry, curious, and ready to be uncomfortable-then let's see if we're a match.
            </p>

            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-10 py-4 rounded-xl font-bold text-lg border border-[var(--primary)]/30 overflow-hidden"
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 origin-left"
                style={{ backgroundColor: 'var(--primary)' }}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 }
                }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_var(--primary)]"
                variants={{
                  initial: { left: '0%', opacity: 0 },
                  hover: { left: '100%', opacity: 1 }
                }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white" style={{ color: 'var(--text)' }}>
                Let's Talk
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </motion.button>
          </motion.div>
        </section>

      </main>

      <JoinUsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </>
  );
}
