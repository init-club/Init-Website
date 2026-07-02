import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ComingSoon } from '../components/shared/ui/ComingSoon';

export default function ActivityPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                <ComingSoon pageName="Activity" />
            </main>
            <Footer />
        </>
    );
}
