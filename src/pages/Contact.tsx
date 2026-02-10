import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import JoinUsModal from '../components/JoinUsModal.tsx';
import { motion } from 'framer-motion';
import { Zap, Github, Brain, Users, Flame, Code2, Target, Lightbulb, Terminal, GitBranch, CheckCircle, Download, BookOpen, Eye } from 'lucide-react';
import PdfModal from '../components/PdfModal';

// --- Local Component: SpiritCard (Static version of ParallaxCard) ---
const SpiritCard = ({ title, description, icon: Icon, delay = 0 }: { title: string, description: string, icon: any, delay?: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
      className="relative w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= VOLUMETRIC BACKLIGHT ================= */}
      <div
        className="absolute inset-4 rounded-xl bg-gradient-to-br from-white/20 via-cyan-500/20 to-purple-500/20 blur-[40px] transition-all duration-300 opacity-30 group-hover:opacity-100"
      />

      {/* ================= GLASS CARD SURFACE ================= */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_-5px_25px_rgba(255,255,255,0.05)] overflow-hidden group-hover:border-cyan-500/30 transition-colors duration-300">
        {/* Surface Glare Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* ================= FLOATING CONTENT LAYER ================= */}
      <div className="relative p-8 h-full flex flex-col transition-all duration-200 ease-out">
        {/* Glow Effects - Stronger resting glow */}
        <div
          className="absolute -inset-px opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
          style={{
            background: `radial-gradient(600px circle at 50% 50%, rgba(0, 255, 213, 0.2), transparent 40%)`
          }}
        />

        {/* Top Gradient accent - Clearer by default */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Icon Box - Plain floating icon */}
        <div className="relative mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon
            className={`w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 ${isHovered ? 'drop-shadow-[0_0_8px_rgba(0,255,213,0.8)]' : ''}`}
            strokeWidth={1.5}
          />
        </div>

        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300 tracking-wide">
          {title}
        </h3>

        <p className="text-muted text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
          {description}
        </p>

        {/* Bottom Active Indicator */}
        <div className="mt-auto pt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="h-[2px] w-8 bg-cyan-400 rounded-full" />
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Active</span>
        </div>

        {/* Bottom Corner decoration - Highly visible */}
        <div className="absolute bottom-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19 19L14 19M19 19L19 14" stroke="currentColor" className="text-cyan-400/50 group-hover:text-[#00ffd5]" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const spiritItems = [
    {
      icon: Zap,
      title: 'Curiosity Driven',
      description: 'We believe in asking questions and learning together. Every curiosity leads us toward growth.'
    },
    {
      icon: Github,
      title: 'Open Source Philosophy',
      description: 'We value sharing knowledge, collaborating freely, and building as a community.'
    },
    {
      icon: Brain,
      title: 'Growth Mindset',
      description: 'We learn from challenges, support each other through problems, and grow together.'
    },
    {
      icon: Users,
      title: 'Collective Strength',
      description: 'When one of us succeeds, we all benefit. We mentor and learn from each other.'
    },
  ];

  const journeySteps = [
    {
      phase: 'Entry',
      title: 'Getting Started',
      description: 'Join our community and explore what we\'re building. Work on fun challenges that help you discover your strengths.',
      icon: Lightbulb
    },
    {
      phase: 'Growth',
      title: 'Learning Together',
      description: 'Build real projects, learn new skills, and solve meaningful problems. Mentors are here to guide and support your journey.',
      icon: Flame
    },
    {
      phase: 'Leadership',
      title: 'Lifting Others',
      description: 'Share your knowledge and help newer members find their way. Mentoring deepens your own understanding.'
    },
    {
      phase: 'Legacy',
      title: 'Shaping the Future',
      description: 'Help shape Init Club\'s direction. Your ideas and contributions make a real difference.'
    },
  ];

  const truthBombs = [
    {
      bold: 'You should be an Amrita CBE student',
      normal: ' - This helps us build a tight-knit local community together.'
    },
    {
      bold: 'Be ready to invest time',
      normal: ' - We\'re more than a club. We\'re a supportive community where you can truly grow.'
    },
    {
      bold: 'Take ownership of your learning',
      normal: ' - We\'re here to guide and support you, but your growth comes from your efforts.'
    },
    {
      bold: 'Let\'s build with integrity',
      normal: ' - We value honest work and original thinking. That\'s how we all grow stronger together.'
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              <span style={{ color: 'var(--text)' }}>The &lt; </span>
              <span
                style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                INIT
              </span>
              <span style={{ color: 'var(--text)' }}> Club /&gt;</span>
            </h1>

            <p className="text-lg md:text-xl text-cyan-300 mb-4 font-semibold">A space to grow together.</p>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              We're building a really inclusive environment where curious minds can learn and grow together. Whether you're just starting out or looking to level up, you belong here.
              <br className="hidden sm:block" />
            </p>

            {/* CTA Button with Laser Animation */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-3 rounded-xl font-semibold text-white mb-20 border border-cyan-500/50 overflow-hidden"
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 origin-left"
                style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)' }}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 }
                }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                variants={{
                  initial: { left: '0%', opacity: 0 },
                  hover: { left: '100%', opacity: 1 }
                }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
                Join Our Community
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </motion.button>
          </motion.div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full" />
        </section>

        {/* ================= INDUCTION PROGRAM SECTION ================= */}
        <section className="max-w-7xl mx-auto px-4 mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                The Induction Program
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
                Real-world engineering challenges designed to build your skills. No busy work, just practical implementation.
              </p>
              <a
                href="https://github.com/init-club/onboarding-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 group"
              >
                <Github size={18} />
                View Onboarding Tasks
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>

            {/* 1. Overview Cards (Skills, Workflow, Blogs) */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {/* Technical Skills */}
              <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Terminal size={100} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Terminal className="text-cyan-400" /> Technical Skills
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">01.</span>
                    <span><strong className="text-white">Linux:</strong> Environment setup & CLI mastery.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">02.</span>
                    <span><strong className="text-white">Docker:</strong> Containerization & DevOps basics.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">03.</span>
                    <span><strong className="text-white">Debugging:</strong> Full-stack troubleshooting.</span>
                  </li>
                </ul>
              </div>

              {/* Open Source Workflow */}
              <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Github size={100} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Github className="text-purple-400" /> Open Source
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">01.</span>
                    <span><strong className="text-white">Git Flow:</strong> Fork, Branch, Commit, PR.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">02.</span>
                    <span><strong className="text-white">Review:</strong> Constructive code feedback.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">03.</span>
                    <span><strong className="text-white">Docs:</strong> Clear READMEs & issues.</span>
                  </li>
                </ul>
              </div>

              {/* Written Blogs */}
              <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={100} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="text-yellow-400" /> Written Blogs
                </h3>
                <p className="text-xs text-gray-400 mb-3">Reflect on your journey via storytelling.</p>
                <ul className="space-y-3 text-sm text-gray-300 mb-4">
                  <li className="flex gap-2">
                    <span className="text-yellow-400 font-bold">01.</span>
                    <span><strong className="text-white">Experience:</strong> Challenges & solutions.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400 font-bold">02.</span>
                    <span><strong className="text-white">Tech:</strong> Tools & moves used.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-400 font-bold">03.</span>
                    <span><strong className="text-white">Reflection:</strong> Personal growth.</span>
                  </li>
                </ul>
                <a href="/blogs" className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                  Read Community Blogs <span className="text-lg leading-none">&rarr;</span>
                </a>
              </div>
            </div>

            {/* 2. Process & Evaluation */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Contribution Flow */}
              <div className="lg:col-span-2 glass p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <GitBranch className="text-cyan-400" /> Contribution Workflow
                </h3>
                <div className="flex flex-col md:flex-row gap-4 justify-between relative">
                  {/* Connecting Line (Desktop) */}
                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10 -translate-y-1/2"></div>

                  {[
                    { step: '1', title: 'Fork', desc: 'Fork repository' },
                    { step: '2', title: 'Branch', desc: 'Create feature branch' },
                    { step: '3', title: 'Code', desc: 'Implement & Test' },
                    { step: '4', title: 'Push', desc: 'Commit & Push' },
                    { step: '5', title: 'PR', desc: 'Submit Pull Request' },
                  ].map((item) => (
                    <div key={item.step} className="bg-[#09090b] p-4 rounded-xl border border-white/10 flex flex-col items-center text-center z-10 w-full">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm mb-2 border border-cyan-500/20">
                        {item.step}
                      </div>
                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation */}
              <div className="glass p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle className="text-green-400" /> Evaluation
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    <p className="text-sm text-gray-300"><strong className="text-white block">Functionality</strong> Does it work as expected?</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    <p className="text-sm text-gray-300"><strong className="text-white block">Best Practices</strong> Clean code & Git usage.</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    <p className="text-sm text-gray-300"><strong className="text-white block">Documentation</strong> Clear README & screenshots.</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Task Download Action */}
            <div className="text-center p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-purple-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to start?</h3>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                View the detailed induction task sheet. Choose your track, complete the challenges, and submit your PRs.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setIsPdfOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105"
                >
                  <Eye size={20} />
                  View Task Sheet
                </button>

                <a
                  href="/tasks.pdf"
                  download="Init_Club_Induction_Tasks.pdf"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-semibold transition-all"
                >
                  <Download size={20} />
                  Download PDF
                </a>
              </div>

              <p className="mt-6 text-sm text-gray-400">
                *Along with the PDF instructions, please visit the <a href="https://github.com/init-club/onboarding-2026" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Onboarding Repository</a> to submit your tasks.
              </p>
            </div>

          </motion.div>
        </section>

        <PdfModal
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          pdfUrl="/tasks.pdf"
        />

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
              <p className="text-gray-400 text-lg">The values we share as we learn and build together.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {spiritItems.map((item, idx) => (
                <SpiritCard
                  key={idx}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  delay={idx * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* The Real Talk Section */}
        <section className="max-w-6xl mx-auto px-4 mb-24 relative">
          <div
            className="absolute inset-0 rounded-3xl border border-cyan-500/20 -z-10"
            style={{ background: 'linear-gradient(135deg, rgba(0,255,213,0.03) 0%, rgba(168,85,247,0.03) 100%)' }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              What to Know
            </h2>
            <p className="text-center text-gray-400 mb-12 text-lg">A few things that help us all succeed together.</p>

            <div className="space-y-6">
              {truthBombs.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-4 items-start p-4 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm md:text-base">
                    <span className="text-cyan-300 font-bold">{item.bold}</span>
                    <span className="text-gray-400">{item.normal}</span>
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
                    <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-transparent" />
                  )}

                  {/* Icon Circle */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center border-2 border-black relative z-10">
                      {step.icon ? <step.icon size={24} className="text-white" /> : <span className="text-white font-bold">{idx + 1}</span>}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">{step.phase}</p>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
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
                What You'll Gain
              </h2>
              <p className="text-gray-400 text-lg">Real skills and friendships that last beyond Init Club.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youWillGain.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-4 rounded-lg border border-cyan-500/20 hover:border-cyan-400 hover:bg-black/40 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <item.icon size={24} className="text-cyan-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
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
              If this resonates with you-if you're curious and want to grow alongside amazing people-we'd love to have you join us.
            </p>

            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-10 py-4 rounded-xl font-bold text-white text-lg border border-cyan-500/50 overflow-hidden"
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 origin-left"
                style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)' }}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 }
                }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                variants={{
                  initial: { left: '0%', opacity: 0 },
                  hover: { left: '100%', opacity: 1 }
                }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white">
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
