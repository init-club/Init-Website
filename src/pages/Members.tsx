import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ComingSoon } from '../components/shared/ui/ComingSoon';

export function MembersPage() {
    return (
        <>
            <Navbar />
            <main className="pt-20">
                <ComingSoon pageName="Events" />
            </main>
            <Footer />
        </>
    );
}

export default MembersPage;
