import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowRight, AlertCircle, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMembershipHelpOpen, setIsMembershipHelpOpen] = useState(false);

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

                <motion.a
                  href="https://discord.com/invite/Gx8sdGJkU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#5865F2]/50 text-white font-semibold overflow-hidden inline-flex transition-all"
                  whileHover="hover"
                  initial="initial"
                >
                  <motion.div
                    className="absolute inset-0 z-0 origin-left"
                    style={{ background: '#5865F2' }}
                    variants={{
                      initial: { scaleX: 0 },
                      hover: { scaleX: 1 }
                    }}
                    transition={{ duration: 0.2, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(88,101,242,0.5)]"
                    variants={{
                      initial: { left: '0%', opacity: 0 },
                      hover: { left: '100%', opacity: 1 }
                    }}
                    transition={{ duration: 0.2, ease: "linear" }}
                  />
                  <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-white">
                    New here? Join our Discord
                    <ArrowRight size={14} />
                  </span>
                </motion.a>
              </div>

              <div className="pt-4 border-t border-zinc-900/60 mt-2">
                <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-zinc-950/80 p-4 sm:p-5">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-500" />
                  <div className="absolute -right-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-[0.22em]">
                          GitHub Access Check
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white sm:text-[15px]">
                        Make sure your Init Club GitHub organisation membership is set to public before logging in.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400 sm:text-sm">
                        Private membership visibility can block access even if you are already in the organisation.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMembershipHelpOpen(true)}
                      className="inline-flex min-w-[170px] items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition-all hover:border-cyan-300/60 hover:bg-cyan-400/20 hover:text-white"
                    >
                      View steps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isMembershipHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
            <button
              type="button"
              aria-label="Close membership help"
              className="absolute inset-0 cursor-default"
              onClick={() => setIsMembershipHelpOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-cyan-500/20 bg-zinc-950 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="membership-help-title"
            >
              <div className="flex items-start justify-between gap-4 border-b border-zinc-900 px-5 py-4 sm:px-6">
                <div>
                  <h2 id="membership-help-title" className="text-lg font-bold text-white">
                    Make your GitHub organisation membership public
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    If login fails, check that you are in the Init Club GitHub organisation and your membership visibility is set to public.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMembershipHelpOpen(false)}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <img
                  src="/how-to-make-membership-public-for-dummies.gif"
                  alt="Guide showing how to make GitHub organisation membership public"
                  className="w-full rounded-xl border border-zinc-800"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default LoginPage;
