import { GitGraph } from "../components/Graph/GitGraph";
import { Footer } from "../components/Footer";
import  AboutWhatWeDo  from "../components/AboutWhatWeDO";
export function HomePage() {
  return (
    <>
      <GitGraph />
      <AboutWhatWeDo/>
      <Footer />
    </>
  );
}

export default HomePage;