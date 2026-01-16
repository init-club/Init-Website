import { GitGraph } from "../components/Graph/GitGraph";
import { ThemeToggle } from "../components/ThemeToggle";

export function HomePage() {
  return (
    <>
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>
      <GitGraph />
    </>
  );
}

export default HomePage;
