import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import Leaderboard from '../components/activity/Leaderboard';

export default function ActivityPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20 min-h-screen bg-background overflow-x-hidden">
                {/* Hero Section */}
                <section className="relative py-16 px-4">
                    {/* Subtle ambient orbs */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-5xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1
                                className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    textShadow: '0 0 20px rgba(0, 255, 213, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)'
                                }}
                            >
                                <span style={{ color: 'var(--text)' }}>Contribution </span>
                                <span style={{
                                    background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Leaderboard
                                </span>
                            </h1>
                            <p className="text-zinc-500 text-base max-w-xl mx-auto mb-2 leading-relaxed">
                                See how members rank based on commits, pull requests, and community contributions.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Leaderboard */}
                <section className="px-4 pb-24">
                    <Leaderboard />
                </section>
            </main>
            <Footer />
        </>
    );
}