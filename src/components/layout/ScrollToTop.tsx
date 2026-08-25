import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "./SmoothScroll";

const ScrollToTop: React.FC = () => {
  const location = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      // Instant, not smooth: a route change should land at the top of the
      // new page immediately, not animate through it.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, lenis]);

  return null;
};

export default ScrollToTop;
