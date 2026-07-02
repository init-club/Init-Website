import { GitGraph } from "../components/homepage/Graph/GitGraph";
import SystemAlert from "../components/layout/SystemAlert";
import { Footer } from "../components/layout/Footer";
import AboutWhatWeDo from "../components/homepage/AboutWhatWeDO";
import { FixedGrid } from "../components/layout/FixedGrid";

export function HomePage() {
  return (
    <>
      {/* <SystemAlert /> */}
      <FixedGrid />
      <GitGraph />
      <AboutWhatWeDo />
      <Footer />
    </>
  );
}

export default HomePage;