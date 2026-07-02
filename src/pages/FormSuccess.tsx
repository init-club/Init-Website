import { useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface LocationState {
  successMessage?: string;
  redirectUrl?: string | null;
  allowMultiple?: boolean;
}

export default function FormSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const state = (location.state as LocationState) || {};
  const successMessage = state.successMessage || 'Thank you! Your response has been recorded.';
  const redirectUrl = state.redirectUrl || null;
  const allowMultiple = state.allowMultiple !== false;

  useEffect(() => {
    if (!redirectUrl) return;

    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 4000);

    return () => clearTimeout(timer);
  }, [redirectUrl]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-24 pb-16 px-4 flex items-center justify-center">
        {/* Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-md w-full bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
        >
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={40} className="animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold font-heading text-white">Response Recorded</h1>
            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{successMessage}</p>
          </div>

          {redirectUrl && (
            <div className="bg-zinc-900/40 border border-zinc-900/60 p-3.5 rounded-2xl flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <p className="text-zinc-500 text-xs">
                Redirecting you to external site shortly...
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-900">
            {allowMultiple && slug && (
              <button
                onClick={() => navigate(`/forms/${slug}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-zinc-800"
              >
                Submit Another Response
              </button>
            )}

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Go to Homepage
              <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
