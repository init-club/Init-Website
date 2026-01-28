import { GitGraph } from "../components/Graph/GitGraph";
import { Footer } from "../components/Footer";
import AboutWhatWeDo from "../components/AboutWhatWeDO";
import { FixedGrid } from "../components/FixedGrid";

export function HomePage() {
  return (
    <>
      <FixedGrid />
      <GitGraph />
      <AboutWhatWeDo />
      <Footer />
    </>
  );
}

export default HomePage;