import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import JoinUsModal from '../components/JoinUsModal.tsx';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Users, Code, Terminal, MessageSquare, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const eligibilityItems = [
    { text: 'Must be a student at Amrita Vishwa Vidyapeetham, Coimbatore Branch', icon: Users },
    { text: 'Ready to devote your time and effort to the club', icon: AlertCircle },
    { text: 'Willing to mentor your juniors and perform assigned responsibilities', icon: Users },
    { text: 'Must strictly adhere to the Code of Conduct of the club', icon: CheckCircle2 },
  ];

  const notRequiredItems = [
    'Need not be in a CS-related branch',
    'Need not have any prior experience in computer science',
  ];

  const guidelineItems = [
    {
      title: 'Google is your best friend',
      description: 'Students are encouraged to learn how to use Google efficiently and try their best to be self-sufficient in solving the problems they face while doing the tasks. While mentors will be assigned to you during Init Club to clear your doubts, self-reliance is an important skill that we look for in members.'
    },
    {
      title: 'Plagiarism and copy-pasting from AI are strictly prohibited',
      description: 'While referring to online sources like websites, blogs, and even taking help from AI like ChatGPT are allowed, directly copying code from them is prohibited. Plagiarism checkers will be employed to make sure that all work done is genuine. Sharing code between participants is strictly forbidden; if discovered, both parties will immediately be disqualified.'
    },
    {
      title: 'Avoid using Windows/GUI tools',
      description: 'Considering that Init Club is at its heart an open-source club, you must use a Linux/macOS system to complete the tasks. You should also try to minimize the use of the mouse and try to use the terminal to do whatever work that you need to do.'
    },
    {
      title: 'Communicate effectively',
      description: 'Clearly communicate your thought process, challenges faced, and progress to the mentors assigned to you during Init Club. The ability to communicate effectively is essential for fostering collaboration and understanding.'
    },
  ];

  const faqItems = [
    {
      question: 'How are participants evaluated during Init Club?',
      answer: 'Evaluation is based on a variety of factors including but not limited to: Number of tasks completed, frequency of updates, code quality, interview performance, etc.'
    },
    {
      question: 'What kind of tasks can we expect during Init Club?',
      answer: 'The tasks are designed to promote active learning and problem-solving. We have taken care to make sure that all of them can be completed with proper research. Various domains will be touched upon like web dev, mobile dev, scraping, git, etc.'
    },
    {
      question: 'Is there a specific timeline for completing Init Club tasks?',
      answer: 'The timelines are specific to each pipeline and hence will be updated on their respective pages.'
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        {/* Hero Section */}
        <section className="relative px-4 py-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              <span style={{ color: 'var(--text)' }}>Join </span>
              <span
                style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Init Club
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">Eligibility Requirements & Guidelines</p>

            {/* Join Button CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 213, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="glass px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 mb-20 border border-cyan-500/50 hover:border-cyan-400 transition-all"
            >
              <span>Ready to Join?</span>
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full" />
        </section>

        {/* Requirements Section */}
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-12" style={{ fontFamily: 'var(--font-heading)' }}>
              Requirements
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {eligibilityItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass rounded-xl p-4 flex gap-4 group hover:border-cyan-400 border border-cyan-500/30 transition-all"
                >
                  <div className="flex-shrink-0">
                    <item.icon size={24} className="text-cyan-400 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <p className="text-sm md:text-base text-gray-300">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Not Required Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6">Not Required</h3>
            <div className="space-y-3">
              {notRequiredItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex gap-3 text-gray-400"
                >
                  <CheckCircle2 size={20} className="text-purple-400 flex-shrink-0 mt-1" />
                  <span className="text-sm md:text-base">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Guidelines Section */}
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black mb-12"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Guidelines
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {guidelineItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400 transition-all group"
              >
                <h3 className="text-lg font-bold text-cyan-300 mb-3 group-hover:text-yellow-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black mb-12"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FAQs
          </motion.h2>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400 transition-all group"
              >
                <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2 group-hover:text-yellow-300 transition-colors">
                  <span className="text-purple-400">Q:</span> {item.question}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed ml-6">
                  <span className="text-purple-400 mr-2">A:</span>
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </section>


      </main>

      <JoinUsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </>
  );
}
