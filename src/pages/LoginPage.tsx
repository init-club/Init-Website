import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Terminal, MessageSquare, Github, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error.message);
      alert('Failed to login with GitHub. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Card Container */}
          <div className="relative bg-black/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 space-y-5 sm:space-y-6">
              {/* Header Section */}
              <div className="text-center pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black whitespace-nowrap font-heading">
                    <span className="text-white">The &lt; </span>
                    <span className="bg-gradient-brand-horizontal bg-clip-text text-transparent">
                      INIT
                    </span>
                    <span className="text-white"> Club /&gt;</span>
                  </h1>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-cyan-400 uppercase tracking-widest">
                  Member Access Portal
                </p>
              </div>

              <div className="text-center space-y-3 py-4 px-4 bg-gradient-to-b from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl">
                <p className="text-red-400 font-semibold text-xs sm:text-sm">
                  Login is only for Init Club members
                </p>
                <p className="mt-6 text-sm text-gray-400">
                  Complete the <a href="/contact#ready-to-start" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Onboarding Tasks</a> to become a member
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="group relative block w-full overflow-hidden rounded-xl font-bold text-center py-4 px-6 border border-cyan-500/50 text-white"
                  whileHover="hover"
                  initial="initial"
                  whileTap={{ scale: 0.98 }}
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

                  <div className="relative z-10 flex items-center justify-center gap-3 text-white">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <Github size={20} />
                        <span>Login with GitHub</span>
                      </>
                    )}
                  </div>
                </motion.button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
                  <span className="text-xs text-gray-500 uppercase font-mono">Also</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
                </div>

                <a
                  href="https://discord.com/invite/Gx8sdGJkU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-cyan-500/50 text-white font-semibold overflow-hidden inline-flex transition-all"
                >
                  <motion.div
                    className="absolute inset-0 z-0 origin-left"
                    style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)' }}
                    variants={{
                      initial: { scaleX: 0 },
                      hover: { scaleX: 1 }
                    }}
                    initial="initial"
                    whileHover="hover"
                    transition={{ duration: 0.2, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                    variants={{
                      initial: { left: '0%', opacity: 0 },
                      hover: { left: '100%', opacity: 1 }
                    }}
                    initial="initial"
                    whileHover="hover"
                    transition={{ duration: 0.2, ease: "linear" }}
                  />
                  <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
                    New here? Join our Discord
                    <ArrowRight size={14} />
                  </span>
                </a>
              </div>

              <div className="pt-4">
                <p className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-3 text-center">
                  Community Values
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Users, text: "Student First", color: "yellow" },
                    { icon: Terminal, text: "Self-Reliant", color: "purple" },
                    { icon: Code, text: "No Copy-Paste", color: "cyan" },
                    { icon: MessageSquare, text: "Open Comms", color: "red" }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-black/50 rounded-lg p-2 border border-gray-800 hover:border-gray-600 transition-all"
                    >
                      <item.icon size={12} className="text-gray-500 flex-shrink-0" />
                      <span className="text-gray-400 text-[10px]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
