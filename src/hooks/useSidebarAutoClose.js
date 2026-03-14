import { useEffect } from "react";

const BREAKPOINT = 1024;

/**
 * - On mount: closes sidebar if screen is ≤ breakpoint
 * - On resize: closes when going below, opens when going above
 */
const useSidebarAutoClose = (setSidebarOpen, breakpoint = BREAKPOINT) => {
  useEffect(() => {
    const check = () => {
      setSidebarOpen(window.innerWidth > breakpoint);
    };
    window.addEventListener("resize", check);
    check(); // run immediately on mount
    return () => window.removeEventListener("resize", check);
  }, [setSidebarOpen, breakpoint]);
};

export default useSidebarAutoClose;