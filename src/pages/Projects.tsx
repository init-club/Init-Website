import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ComingSoon } from '../components/ComingSoon';

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ComingSoon pageName="Projects" />
      </main>
      <Footer />
    </>
  );
}
