import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { FixedGrid } from "../components/FixedGrid";

export function MembersPage() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <FixedGrid />
            <Navbar />

            <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                    Members
                </h1>
                <p className="text-xl text-neutral-400 max-w-2xl mb-12">
                    Meet the brilliant minds and contributors who make INIT Club possible.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder content */}
                    <div className="p-6 border border-white/10 rounded-lg bg-black/50 backdrop-blur-sm">
                        <h3 className="text-xl font-bold mb-2 text-yellow-500">Core Team</h3>
                        <p className="text-neutral-400">Loading members...</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default MembersPage;
