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

              {/* Intro Message */}
              <div className="text-center space-y-3 py-4 px-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-semibold text-xs sm:text-sm">
                  Already a Member?
                </p>
                <p className="text-red-300 text-xs leading-relaxed max-w-md mx-auto">
                  Login is only for Init Club members. Complete the <a href="https://github.com/init-club/onboarding-2026" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-medium transition-colors">Onboarding Repository</a> to become a member
                </p>
              </div>

              {/* --- PRIMARY ACTION: GITHUB LOGIN --- */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="group relative block w-full overflow-hidden rounded-xl font-bold text-center py-4 border border-white/20 bg-black/50 hover:bg-white/5 transition-all"
                  whileHover="hover"
                  initial="initial"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button Background Animation */}
                  <motion.div
                    className="absolute inset-0 z-0 origin-left bg-gradient-brand-horizontal opacity-20"
                    variants={{
                      initial: { scaleX: 0 },
                      hover: { scaleX: 1 }
                    }}
                    transition={{ duration: 0.3, ease: "linear" }}
                  />

                  {/* Button Content */}
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

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
                  <span className="text-xs text-gray-500 uppercase font-mono">Also</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
                </div>

                {/* Secondary Action: Discord Join */}
                <a
                  href="https://discord.com/invite/Gx8sdGJkU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-700 hover:border-purple-500/50 hover:bg-purple-900/20 text-gray-400 hover:text-white transition-all text-sm font-medium"
                >
                  <span>New here? Join our Discord</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Community Values Grid */}
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
