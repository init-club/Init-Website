import { GitGraph } from "../components/Graph/GitGraph";
import SystemAlert from "../components/SystemAlert";
import { Footer } from "../components/Footer";
import AboutWhatWeDo from "../components/AboutWhatWeDO";
import { FixedGrid } from "../components/FixedGrid";
import AuthButtons from "../components/AuthButtons";

export function HomePage() {
  return (
    <>
      <SystemAlert />
      <div className="fixed top-6 right-6 z-50 hidden md:block">
        <AuthButtons />
      </div>

      <FixedGrid />
      <GitGraph />
      <AboutWhatWeDo />
      <Footer />
    </>
  );
}

export default HomePage;